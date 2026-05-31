/* The taste graph (prototype data + the small set of rules that turn vouches into
   identity). One source of truth shared by the onboarding (J1) and Home — so a
   spot's coordinates, a palate's spots, and the archetype/taste-match logic never
   drift between surfaces. Real curation moves to Supabase later (Constitution §6). */

export type Spot = { name: string; area: string; cuisine: string; price: string; occasions: string[]; lat: number; lng: number };
export type Vouch = { spot: Spot; line: string; occ: string[] };
export type PSpot = { name: string; lat: number; lng: number; line: string };
export type FoundingPalate = { name: string; ini: string; occasions: string[]; blurb: string; spots: PSpot[] };

export const SEED: Spot[] = [
  { name: "Naru Noodle Bar", area: "Indiranagar", cuisine: "Ramen", price: "₹₹₹", occasions: ["date", "rainy day"], lat: 12.9748, lng: 77.6402 },
  { name: "Empire", area: "Indiranagar", cuisine: "Kebabs", price: "₹₹", occasions: ["late night"], lat: 12.9707, lng: 77.6400 },
  { name: "Brahmin’s Coffee Bar", area: "Shankarpuram", cuisine: "Filter coffee", price: "₹", occasions: ["coffee", "solo lunch"], lat: 12.9544, lng: 77.5650 },
  { name: "Vidyarthi Bhavan", area: "Basavanagudi", cuisine: "Dosa", price: "₹", occasions: ["parents", "coffee"], lat: 12.9419, lng: 77.5732 },
  { name: "Karavalli", area: "Residency Rd", cuisine: "Coastal", price: "₹₹₹₹", occasions: ["parents", "group dinner"], lat: 12.9618, lng: 77.6006 },
  { name: "Toit", area: "Indiranagar", cuisine: "Brewpub", price: "₹₹₹", occasions: ["group dinner", "date"], lat: 12.9785, lng: 77.6403 },
  { name: "CTR · Shri Sagar", area: "Malleshwaram", cuisine: "Benne dosa", price: "₹", occasions: ["coffee", "parents"], lat: 13.0028, lng: 77.5687 },
  { name: "Shivaji Military Hotel", area: "Jayanagar", cuisine: "Donne biryani", price: "₹₹", occasions: ["worth the drive"], lat: 12.9266, lng: 77.5836 },
  { name: "Corner House", area: "Koramangala", cuisine: "Ice cream", price: "₹", occasions: ["late night", "date"], lat: 12.9346, lng: 77.6270 },
  { name: "Soka", area: "Indiranagar", cuisine: "Small plates", price: "₹₹₹", occasions: ["date", "group dinner"], lat: 12.9761, lng: 77.6406 },
];

export const OCCASIONS = ["parents", "late night", "date", "solo lunch", "coffee", "group dinner", "worth the drive", "rainy day"];

export const findSpot = (n: string): Spot | undefined => SEED.find((x) => x.name === n);
export const coord = (n: string) => { const s = findSpot(n); return { lat: s ? s.lat : 12.9716, lng: s ? s.lng : 77.5946 }; };
export const occasionsOf = (n: string): string[] => findSpot(n)?.occasions ?? [];

export const FOUNDING: FoundingPalate[] = [
  { name: "Aditi", ini: "AS", occasions: ["parents", "coffee", "solo lunch"], blurb: "Old-school South Indian and the filter-coffee canon.", spots: [
    { name: "Karavalli", ...coord("Karavalli"), line: "Take your parents. They’ll talk for months." },
    { name: "Brahmin’s Coffee Bar", ...coord("Brahmin’s Coffee Bar"), line: "Idli + that chutney. Peak." },
    { name: "Vidyarthi Bhavan", ...coord("Vidyarthi Bhavan"), line: "Go before 9am, beat the queue." },
  ] },
  { name: "Rinkesh", ini: "RG", occasions: ["late night", "date", "group dinner"], blurb: "Late-night, brewpubs, and where to take a date.", spots: [
    { name: "Empire", ...coord("Empire"), line: "Chicken ghee roast at 1am." },
    { name: "Toit", ...coord("Toit"), line: "Go early, it fills up." },
    { name: "Corner House", ...coord("Corner House"), line: "Death by Chocolate, always." },
  ] },
  { name: "Meera", ini: "MK", occasions: ["coffee", "date", "worth the drive"], blurb: "Coffee obsessive who’ll drive 40km for a dosa.", spots: [
    { name: "Soka", ...coord("Soka"), line: "Negroni, then stay for the plates." },
    { name: "CTR · Shri Sagar", ...coord("CTR · Shri Sagar"), line: "Benne dosa. Settled." },
    { name: "Naru Noodle Bar", ...coord("Naru Noodle Bar"), line: "Wine + ramen. Yes." },
  ] },
];

/* The earned identity: an archetype derived from what you actually vouched for —
   never a quiz answer. Whichever occasion you back most decides who you are. */
export const ARCH: Record<string, { name: string; glyph: string; line: string }> = {
  "late night": { name: "The Midnight Forager", glyph: "🌙", line: "Your best meals start after 11 and never had a menu." },
  coffee: { name: "The Filter-Coffee Fundamentalist", glyph: "☕", line: "A degree filter by 8am. You’d argue dosa crispness in court." },
  date: { name: "The Small-Plates Romantic", glyph: "🍷", line: "It’s the room, the bottle, the person across the table." },
  parents: { name: "The Safe-Hands Host", glyph: "🍛", line: "You never gamble when it actually matters." },
  "group dinner": { name: "The Table-for-Eight", glyph: "🍕", line: "The more chairs you pull up, the better the night." },
  "worth the drive": { name: "The Pilgrim", glyph: "🛵", line: "Distance is a rounding error for the right meal." },
  "solo lunch": { name: "The Quiet Regular", glyph: "📖", line: "A good solo lunch is a sacred, selfish pleasure." },
  "rainy day": { name: "The Comfort Seeker", glyph: "🌧️", line: "You eat by the weather, and the weather says broth." },
};
export const DEFAULT_ARCH = { name: "The All-Rounder", glyph: "✦", line: "A palate with a spot for every occasion." };

export function archetypeFor(vouches: { occ: string[] }[]) {
  const tally: Record<string, number> = {};
  vouches.forEach((v) => v.occ.forEach((o) => { tally[o] = (tally[o] || 0) + 1; }));
  const top = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
  return (top && ARCH[top]) || DEFAULT_ARCH;
}

/* taste-match % — the one allowed number, and it's about PEOPLE not places: how
   much your occasions overlap a palate's. Always shown with the human why. */
export function matchPct(palate: FoundingPalate, mine: Vouch[]) {
  const a = new Set(mine.flatMap((v) => v.spot.occasions.concat(v.occ)));
  const inter = palate.occasions.filter((o) => a.has(o)).length;
  const union = new Set([...a, ...palate.occasions]).size || 1;
  return Math.max(58, Math.min(96, Math.round((inter / union) * 100) + 48));
}

/* Carry what you built in onboarding into Home. Prototype-only (sessionStorage);
   the real handoff is the authed account + Supabase. */
export type Session = { mine: Vouch[]; followed: string[] };
const KEY = "vouch:session";
export function saveSession(s: Session) {
  try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
export function loadSession(): Session | null {
  try { const raw = sessionStorage.getItem(KEY); return raw ? (JSON.parse(raw) as Session) : null; } catch { return null; }
}

/* A believable Home for anyone who lands on /home directly (no onboarding state):
   a small, opinionated late-night/date map + two palates followed. */
const S = (n: string): Spot => findSpot(n)!;
export const DEMO_SESSION: Session = {
  mine: [
    { spot: S("Empire"), line: "Chicken ghee roast at 1am. Undefeated.", occ: ["late night"] },
    { spot: S("Toit"), line: "Tintin Toit + the patio. Get there early.", occ: ["group dinner", "date"] },
    { spot: S("Corner House"), line: "Death by Chocolate. Non-negotiable.", occ: ["late night", "date"] },
  ],
  followed: ["Aditi", "Meera"],
};
