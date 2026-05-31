/* The signed-in user's REAL state — your vouches and who you follow — persisted to
   localStorage (prototype; Supabase later per §8). This replaces the DEMO_SESSION
   placeholder for every primary surface: the home, palate, and spot read what YOU
   actually did in onboarding and since. No invented data. Starts empty for a cold
   user (honest), and onboarding is what fills it. SSR-safe. */
import type { Vouch } from "./_taste";

export type Me = { vouches: Vouch[]; follows: string[] };
const KEY = "vouch:me";
const EMPTY: Me = { vouches: [], follows: [] };

function read(): Me {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const m = JSON.parse(raw) as Partial<Me>;
    return { vouches: m.vouches ?? [], follows: m.follows ?? [] };
  } catch { return EMPTY; }
}
function write(m: Me) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignore */ }
}

export function loadMe(): Me { return read(); }
export function saveMe(m: Me): void { write(m); }

export function addVouch(v: Vouch): Me {
  const m = read();
  const vouches = [...m.vouches.filter((x) => x.spot.name !== v.spot.name), v];
  const next = { ...m, vouches };
  write(next);
  return next;
}
export function removeVouch(name: string): Me {
  const m = read();
  const next = { ...m, vouches: m.vouches.filter((x) => x.spot.name !== name) };
  write(next);
  return next;
}
export function hasVouch(name: string): boolean {
  return read().vouches.some((x) => x.spot.name === name);
}
export function myVouch(name: string): Vouch | undefined {
  return read().vouches.find((x) => x.spot.name === name);
}
export function isFollowing(name: string): boolean {
  return read().follows.includes(name);
}
export function toggleFollow(name: string): Me {
  const m = read();
  const follows = m.follows.includes(name) ? m.follows.filter((x) => x !== name) : [...m.follows, name];
  const next = { ...m, follows };
  write(next);
  return next;
}
