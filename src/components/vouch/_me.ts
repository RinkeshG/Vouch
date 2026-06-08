/* The signed-in user's REAL state, persisted to localStorage (prototype; Supabase
   later). Your relationship to a place is a STAMP LADDER (Constitution §1):
   Want to go → Been → Vouched. Want/Been are lightweight (no words); Vouched is the
   currency (requires a one-line reason + occasion). Identity (archetype, palate,
   guides) is built from VOUCHED only; Want/Been are the radar + diary layer. */
import type { Spot, Vouch } from "./_taste";

export type Stamp = "want" | "been" | "vouched";
export type Entry = { spot: Spot; stamp: Stamp; line?: string; occ?: string[]; at: number };
export type Me = { entries: Entry[]; follows: string[] };

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
    if (Array.isArray(m?.entries)) return { entries: m.entries, follows: m.follows ?? [] };
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
export function setStamp(spot: Spot, stamp: Stamp, opts?: { line?: string; occ?: string[] }): Me {
  const m = read();
  const prev = m.entries.find((e) => e.spot.name === spot.name);
  const rest = m.entries.filter((e) => e.spot.name !== spot.name);
  const entry: Entry = {
    spot, stamp, at: now(),
    // Keep the vouch reason as a latent draft through demotions — never destroy the
    // user's words. vouches() gates on stamp === "vouched", so a demoted line never
    // leaks into the currency; it simply returns if they re-vouch (no retyping).
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
