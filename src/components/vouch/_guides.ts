/* Guides store — real CRUD, persisted to localStorage (prototype; Supabase later
   per Constitution §8). One source for the Guides workspace + public share pages.
   SSR-safe: every access guards `window`. */
import { SEED } from "./_taste";

export type GuideItem = { name: string; tags: string; note: string };
export type Guide = {
  id: string;
  slug: string;
  title: string;
  note?: string;
  anchor?: string;
  items: GuideItem[];
  borrows: number; // how many people have borrowed it — the life-signal (utility, not vanity)
  createdAt: number;
  updatedAt: number;
};

const KEY = "vouch:guides";
const SEEDED = "vouch:guides:seeded";

function read(): Guide[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]") as Guide[]; } catch { return []; }
}
function write(gs: Guide[]) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(gs)); } catch { /* ignore */ }
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
export function slugify(t: string): string {
  const base = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return base || "guide";
}

export function listGuides(): Guide[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}
export function getGuide(id: string): Guide | null {
  return read().find((g) => g.id === id) || null;
}
export function getGuideBySlug(slug: string): Guide | null {
  return read().find((g) => g.slug === slug) || null;
}
export function upsertGuide(g: Guide): void {
  const gs = read().filter((x) => x.id !== g.id);
  write([...gs, g]);
}
export function deleteGuide(id: string): void {
  write(read().filter((g) => g.id !== id));
}

/* The pool of places you can put in a guide = your vouches. Prototype uses the
   SEED set with sensible default one-liners (editable per guide). */
const DEFAULT_NOTES: Record<string, string> = {
  "Naru Noodle Bar": "Best bowl in the city. Get there at 6 sharp.",
  Empire: "Chicken ghee roast at 1am. Undefeated.",
  "Brahmin’s Coffee Bar": "Idli + that chutney. A morning religion.",
  "Vidyarthi Bhavan": "Go before 9am, beat the queue.",
  Karavalli: "Take your parents. They’ll talk about it for months.",
  Toit: "Tintin Toit + the patio. Go early.",
  "CTR · Shri Sagar": "Benne dosa. Don’t even debate it.",
  "Shivaji Military Hotel": "Donne biryani, worth the drive.",
  "Corner House": "Death by Chocolate. Non-negotiable.",
  Soka: "Negroni, then stay for the plates.",
};
export function myVouches(): GuideItem[] {
  return SEED.map((s) => ({ name: s.name, tags: `${s.cuisine} · ${s.area} · ${s.price}`, note: DEFAULT_NOTES[s.name] ?? "" }));
}

/* Seed one example guide the first time only — so the list demos non-empty, but
   the empty state is still reachable (deleting it won't re-seed). */
export function seedOnce(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEEDED)) return;
  window.localStorage.setItem(SEEDED, "1");
  if (read().length) return;
  const pick = (n: string) => myVouches().find((v) => v.name === n)!;
  const now = Date.now();
  upsertGuide({
    id: uid(),
    slug: "open-past-midnight",
    title: "Open past midnight — actually worth it",
    items: [pick("Empire"), pick("Corner House"), pick("Naru Noodle Bar")],
    borrows: 4,
    createdAt: now,
    updatedAt: now,
  });
}
