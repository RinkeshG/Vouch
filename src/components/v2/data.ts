/* v0.1 data model + localStorage store. One shape, written by the builder and
   read by the published guide — so the whole create → publish → view flow is
   real in-browser without a backend. */

export type Cat = "coffee" | "food" | "drink" | "view" | "shop" | "stay";

export type Place = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  cat: Cat;
  note: string;        // the vouch — her voice, prose
  order?: string;      // the specific pick
  when?: string;       // the right time
  img?: string;        // the creator's own shot (optional) — fills the media zone
  by?: string;         // corroborating curator (kept simple in v0.1)
  ini?: string;
};

export type Guide = {
  slug: string;
  title: string;
  intro: string;
  sortLabel: string;   // the personal ordering descriptor — voice, not a sort menu
  curator: { name: string; ini: string; bio: string };
  places: Place[];
  published: boolean;
};

const KEY = "vouch.v2.guides";

/* The seed — a believable published guide so the viewer experience is never
   empty on a cold open. */
export const SEED: Guide = {
  slug: "priya",
  title: "where i actually take people in bengaluru",
  intro: "six places, the way i'd hand them to a friend — roughly in the order the day wants them.",
  sortLabel: "the order i'd actually do them in",
  curator: { name: "Priya R.", ini: "PR", bio: "Indiranagar, 6 years. I send this to everyone who visits." },
  published: true,
  places: [
    { id: "1", name: "Airlines Hotel", area: "Lavelle Rd", lat: 12.9698, lng: 77.5985, cat: "coffee", note: "where i take everyone who's new to the city. filter coffee under the rain trees, before it wakes up and gets loud.", order: "filter coffee, by the half", when: "7–9am" },
    { id: "2", name: "Third Wave", area: "Lavelle Rd", lat: 12.9692, lng: 77.5975, cat: "coffee", note: "for when i actually want to taste the coffee, not talk. black, single-origin, no laptop, no lingering.", order: "the single-origin pour-over", when: "mid-morning" },
    { id: "3", name: "Koshy's", area: "St. Marks Rd", lat: 12.9738, lng: 77.6010, cat: "food", note: "my unhurried lunch. nothing here has changed in seventy years and the waiters would like to keep it that way.", order: "mutton cutlet + a cold coffee", when: "a long afternoon" },
    { id: "4", name: "Toit", area: "Indiranagar", lat: 12.9783, lng: 77.6408, cat: "drink", note: "the one place i'll sit in traffic for. weekdays only though — go on a saturday and you'll never forgive me.", order: "toit weiss + a wood-fired pizza", when: "a weekday evening", by: "Ankit", ini: "AK" },
    { id: "5", name: "Byg Brewski", area: "Hennur", lat: 13.0358, lng: 77.6403, cat: "view", note: "go for the sunset off the deck, not the beer. get there before six or you'll be parking in the next pincode.", order: "anything, on the deck", when: "golden hour", by: "Meera", ini: "ME" },
    { id: "6", name: "VV Puram", area: "food street", lat: 12.9419, lng: 77.5731, cat: "food", note: "end the day here. eat with your hands, share everything, and finish on the holige. don't plan it, just walk.", order: "graze the whole street", when: "late evening" },
  ],
};

function read(): Guide[] {
  if (typeof window === "undefined") return [SEED];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [SEED];
    const list = JSON.parse(raw) as Guide[];
    return list.some((g) => g.slug === SEED.slug) ? list : [SEED, ...list];
  } catch {
    return [SEED];
  }
}

export function loadGuides(): Guide[] {
  return read();
}

export function getGuide(slug: string): Guide | null {
  return read().find((g) => g.slug === slug) ?? (slug === SEED.slug ? SEED : null);
}

export function saveGuide(guide: Guide) {
  if (typeof window === "undefined") return;
  const list = read().filter((g) => g.slug !== guide.slug);
  window.localStorage.setItem(KEY, JSON.stringify([guide, ...list]));
}

export const CAT_LABEL: Record<Cat, string> = {
  coffee: "coffee", food: "food", drink: "drinks", view: "the view", shop: "shop", stay: "stay",
};

export function myGuides(): Guide[] {
  return read().filter((g) => g.slug !== SEED.slug);
}

export function slugExists(slug: string): boolean {
  return read().some((g) => g.slug === slug);
}

/* ---- saved / borrow store: a place kept by a viewer, WITH whose vouch it was.
   This provenance is the one thing a Google Maps save can't carry. ---- */
export type Saved = Place & { via: string; viaIni: string; guideSlug: string; guideTitle: string };
const SKEY = "vouch.v2.saved";

export function loadSaved(): Saved[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(SKEY) || "[]") as Saved[]; } catch { return []; }
}
export function savedKey(guideSlug: string, name: string) { return `${guideSlug}::${name}`; }
export function isSaved(guideSlug: string, name: string): boolean {
  return loadSaved().some((s) => savedKey(s.guideSlug, s.name) === savedKey(guideSlug, name));
}
export function toggleSaved(s: Saved): Saved[] {
  if (typeof window === "undefined") return [];
  const list = loadSaved();
  const k = savedKey(s.guideSlug, s.name);
  const next = list.some((x) => savedKey(x.guideSlug, x.name) === k)
    ? list.filter((x) => savedKey(x.guideSlug, x.name) !== k)
    : [s, ...list];
  window.localStorage.setItem(SKEY, JSON.stringify(next));
  return next;
}
