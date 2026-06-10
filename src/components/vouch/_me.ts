/* The signed-in user's REAL state, persisted to localStorage (prototype; Supabase
   later). Want / Been / Vouch are NOT a ladder or a rating (PRD §1) — they're three
   different sentences a person says: Want = "remind me" (ghost), Been = "I went,
   here's the truth" (ink), Vouch = "I stake my name on this" (stamp). Most places
   you'll have been and never vouch; that's the mechanism, not a failure. */
import type { Spot, Vouch } from "./_taste";

export type Stamp = "want" | "been" | "vouched";
/* The gut question, asked the moment you mark a place "been": "Go back?" Return
   intent is the most honest compression of a food opinion — not a star (PRD §10). */
export type Gut = "absolutely" | "maybe" | "no";
export type Entry = { spot: Spot; stamp: Stamp; gut?: Gut; line?: string; occ?: string[]; at: number };
export type Me = { entries: Entry[]; follows: string[] };

/* ONE source of truth for how a place's relationship-to-you reads, everywhere it
   shows (search, cards, map, place page). Status copy is calm and human — the
   emotional "your name's on it" language belongs to the MOMENT of vouching, never
   the steady-state label. Change a word here and it changes everywhere. */
export type RelTone = "want" | "absolutely" | "maybe" | "no" | "vouched";
export function relationship(e?: { stamp: Stamp; gut?: Gut } | null): { label: string; tone: RelTone } | null {
  if (!e) return null;
  if (e.stamp === "vouched") return { label: "Vouched", tone: "vouched" };
  if (e.stamp === "been") {
    // the chip shows your answer to "Go back?" — the been context supplies the question
    return e.gut === "absolutely" ? { label: "Absolutely", tone: "absolutely" }
      : e.gut === "no" ? { label: "No", tone: "no" }
      : { label: "Maybe", tone: "maybe" };
  }
  return { label: "Want to go", tone: "want" };
}

const KEY = "vouch:me";
const EMPTY: Me = { entries: [], follows: [] };

function now(): number { return Date.now(); }

function read(): Me {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m: any = JSON.parse(raw);
    if (Array.isArray(m?.entries)) {
      // migrate the old gut vocabulary (loved/fine → absolutely/maybe) in place
      let changed = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries: Entry[] = m.entries.map((e: any) => {
        if (e?.gut === "loved") { changed = true; return { ...e, gut: "absolutely" }; }
        if (e?.gut === "fine") { changed = true; return { ...e, gut: "maybe" }; }
        return e;
      });
      const next: Me = { entries, follows: m.follows ?? [] };
      if (changed) write(next);
      return next;
    }
    // migrate the old shape { vouches: Vouch[], follows } → entries (all vouched)
    if (Array.isArray(m?.vouches)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries: Entry[] = m.vouches.map((v: any) => ({ spot: v.spot, stamp: "vouched", line: v.line, occ: v.occ, at: 0 }));
      const migrated = { entries, follows: m.follows ?? [] };
      write(migrated);
      return migrated;
    }
    return EMPTY;
  } catch { return EMPTY; }
}
function write(m: Me) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignore */ }
}

export function loadMe(): Me { return read(); }
export function saveMe(m: Me): void { write(m); }

/* Set / move a place's stamp. Vouched carries line + occasions; want/been don't. */
export function setStamp(spot: Spot, stamp: Stamp, opts?: { gut?: Gut; line?: string; occ?: string[] }): Me {
  const m = read();
  const prev = m.entries.find((e) => e.spot.name === spot.name);
  const rest = m.entries.filter((e) => e.spot.name !== spot.name);
  const entry: Entry = {
    spot, stamp, at: now(),
    // Keep the gut reaction AND the vouch reason as latent drafts through demotions —
    // never destroy the user's signal. vouches() gates on stamp === "vouched", so a
    // demoted line never leaks into the currency; it simply returns if they re-vouch.
    gut: opts?.gut ?? prev?.gut,
    line: opts?.line ?? prev?.line,
    occ: opts?.occ ?? prev?.occ,
  };
  const next = { ...m, entries: [...rest, entry] };
  write(next);
  return next;
}
export function addVouch(v: Vouch): Me {
  return setStamp(v.spot, "vouched", { line: v.line, occ: v.occ });
}
export function removeEntry(name: string): Me {
  const m = read();
  const next = { ...m, entries: m.entries.filter((e) => e.spot.name !== name) };
  write(next);
  return next;
}
export function getEntry(name: string): Entry | undefined {
  return read().entries.find((e) => e.spot.name === name);
}
export function byStamp(stamp: Stamp): Entry[] {
  return read().entries.filter((e) => e.stamp === stamp);
}

/* The vouched list (the currency) — used by guides, the territory, the palate. */
export function vouches(): Vouch[] {
  return read().entries
    .filter((e) => e.stamp === "vouched" && e.line)
    .map((e) => ({ spot: e.spot, line: e.line as string, occ: e.occ ?? [] }));
}

export function isFollowing(name: string): boolean { return read().follows.includes(name); }
export function toggleFollow(name: string): Me {
  const m = read();
  const follows = m.follows.includes(name) ? m.follows.filter((x) => x !== name) : [...m.follows, name];
  const next = { ...m, follows };
  write(next);
  return next;
}
