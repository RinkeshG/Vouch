/* The taste graph (prototype data + the small set of rules that turn vouches into
   identity). One source of truth shared by the onboarding (J1) and Home — so a
   spot's coordinates, a palate's spots, and the archetype/taste-match logic never
   drift between surfaces. Real curation moves to Supabase later (Constitution §6). */

/* `vibe` = the one-line "what this is" (the context to decide from a card, never a
   Maps listing). `move` = what to actually get (insider knowledge — the friend's tip).
   Both surface on the place card and page; real catalog rows fill these from Supabase
   later, and a hero photo slots into `cover` when wired. */
export type Spot = { name: string; area: string; cuisine: string; price: string; occasions: string[]; lat: number; lng: number; vibe?: string; move?: string; cover?: string };
export type Vouch = { spot: Spot; line: string; occ: string[] };
export type PSpot = { name: string; lat: number; lng: number; line: string };
export type FoundingPalate = { name: string; ini: string; occasions: string[]; blurb: string; spots: PSpot[] };

export const SEED: Spot[] = [
  { name: "Naru Noodle Bar", area: "Indiranagar", cuisine: "Ramen", price: "₹₹₹", occasions: ["date", "rainy day"], lat: 12.9748, lng: 77.6402, vibe: "A tiny counter ramen-ya with a serious wine list — booked out weeks ahead.", move: "The shoyu ramen, a seat at the counter." },
  { name: "Empire", area: "Indiranagar", cuisine: "Kebabs", price: "₹₹", occasions: ["late night"], lat: 12.9707, lng: 77.6400, vibe: "The 1 a.m. institution — kebabs, rolls, fluorescent light, always open.", move: "Chicken ghee roast with a roomali roll." },
  { name: "Brahmin’s Coffee Bar", area: "Shankarpuram", cuisine: "Filter coffee", price: "₹", occasions: ["coffee", "solo lunch"], lat: 12.9544, lng: 77.5650, vibe: "Standing-room filter coffee and idli, unchanged since 1965.", move: "Idli with the coconut chutney, before 8." },
  { name: "Vidyarthi Bhavan", area: "Basavanagudi", cuisine: "Dosa", price: "₹", occasions: ["parents", "coffee"], lat: 12.9419, lng: 77.5732, vibe: "Eighty years of crisp, ghee-soaked benne masala dosa.", move: "Masala dosa. No detours." },
  { name: "Karavalli", area: "Residency Rd", cuisine: "Coastal", price: "₹₹₹₹", occasions: ["parents", "group dinner"], lat: 12.9618, lng: 77.6006, vibe: "White-tablecloth coastal cooking around a lantern-lit courtyard.", move: "Appam with the Coorg pandi curry." },
  { name: "Toit", area: "Indiranagar", cuisine: "Brewpub", price: "₹₹₹", occasions: ["group dinner", "date"], lat: 12.9785, lng: 77.6403, vibe: "Bangalore’s brewpub — loud, packed, reliably good.", move: "A Toit Weiss and a wood-fired pizza." },
  { name: "CTR · Shri Sagar", area: "Malleshwaram", cuisine: "Benne dosa", price: "₹", occasions: ["coffee", "parents"], lat: 13.0028, lng: 77.5687, vibe: "The Malleshwaram benchmark for benne dosa.", move: "Benne masala dosa, extra butter." },
  { name: "Shivaji Military Hotel", area: "Jayanagar", cuisine: "Donne biryani", price: "₹₹", occasions: ["worth the drive"], lat: 12.9266, lng: 77.5836, vibe: "Old-school military hotel — the biryani’s gone by afternoon.", move: "Mutton donne biryani. Get there early." },
  { name: "Corner House", area: "Koramangala", cuisine: "Ice cream", price: "₹", occasions: ["late night", "date"], lat: 12.9346, lng: 77.6270, vibe: "The after-dinner sundae ritual — crowded, sweet, late.", move: "Death by Chocolate. Always." },
  { name: "Soka", area: "Indiranagar", cuisine: "Small plates", price: "₹₹₹", occasions: ["date", "group dinner"], lat: 12.9761, lng: 77.6406, vibe: "Intimate small plates and natural wine, low light.", move: "A negroni, then whatever’s seasonal." },
  { name: "Koshy’s", area: "St Marks Rd", cuisine: "Old-school", price: "₹₹", occasions: ["parents", "group dinner"], lat: 12.9736, lng: 77.6010, vibe: "Faded-glamour all-day cafe; a city institution.", move: "Mutton cutlet and a cold coffee." },
  { name: "MTR", area: "Lalbagh", cuisine: "Tiffin", price: "₹", occasions: ["parents", "coffee"], lat: 12.9520, lng: 77.5848, vibe: "The original tiffin room — the thali arrives like a ceremony.", move: "Rava idli, then the full meals." },
  { name: "Sodabottleopenerwala", area: "Lavelle Rd", cuisine: "Parsi", price: "₹₹₹", occasions: ["group dinner", "date"], lat: 12.9719, lng: 77.5970, vibe: "A Bombay-Irani cafe revival — kitsch, fun, generous.", move: "Berry pulao and a bun maska." },
  { name: "Nagarjuna", area: "Residency Rd", cuisine: "Andhra", price: "₹₹", occasions: ["group dinner", "parents"], lat: 12.9707, lng: 77.6010, vibe: "Fiery Andhra meals on a banana leaf, no frills.", move: "The non-veg thali — gloves off." },
];

/* Hero treatment until real photos are wired: a warm, cuisine-keyed gradient + the
   place's monogram. Never a broken image, never a generic stock pin (PRD §6). */
export function placeTint(cuisine: string): string {
  const c = (cuisine || "").toLowerCase();
  if (/coffee|tiffin|dosa|idli|benne|breakfast/.test(c)) return "linear-gradient(135deg, #2a1d0a 0%, #7a5418 100%)";
  if (/ramen|noodle|small|asian|sushi|japanese/.test(c)) return "linear-gradient(135deg, #2a1010 0%, #7c2a20 100%)";
  if (/kebab|biryani|andhra|military|grill|mughlai|roll/.test(c)) return "linear-gradient(135deg, #2e1608 0%, #8f3c16 100%)";
  if (/coastal|seafood|fish|mangalore/.test(c)) return "linear-gradient(135deg, #0c2420 0%, #1d5e4c 100%)";
  if (/brew|bar|pub|beer/.test(c)) return "linear-gradient(135deg, #241b0a 0%, #7a5e1c 100%)";
  if (/ice cream|dessert|sweet/.test(c)) return "linear-gradient(135deg, #2a1020 0%, #7c2e52 100%)";
  return "linear-gradient(135deg, #261a0c 0%, #6e4a1c 100%)";
}
/* Tiny monoline glyphs (24-grid, stroke = currentColor) keyed by cuisine family —
   so a pin says WHAT a place is at a glance while its colour still says your
   relationship to it. Drawn in the product's stroke style, never emoji. Families
   without an obvious mark return null and stay a clean dot — restraint, not noise. */
const G = (inner: string) =>
  `<svg viewBox='0 0 24 24' width='12' height='12' fill='none' stroke='currentColor' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>${inner}</svg>`;
export function cuisineGlyph(cuisine?: string): string | null {
  const c = (cuisine || "").toLowerCase();
  if (/coffee|cafe|chai/.test(c)) return G("<path d='M5 8h10v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8z'/><path d='M15 9h1.5a2.5 2.5 0 0 1 0 5H15'/>");
  if (/dosa|tiffin|idli|udupi|south indian/.test(c)) return G("<path d='M4 15a8 8 0 0 1 16 0z'/><path d='M7 19h10'/>");
  if (/ramen|noodle|sushi|japanese|asian|thai|chinese|momo|small plates/.test(c)) return G("<path d='M4 12h16a8 8 0 0 1-16 0z'/><path d='M10 8l2.5-5'/><path d='M14 8l2.5-5'/>");
  if (/kebab|biryani|grill|andhra|mughlai|military|bbq|tandoor/.test(c)) return G("<path d='M12 3c2.5 3.5 5 5.5 5 9a5 5 0 1 1-10 0c0-3.5 2.5-5.5 5-9z'/>");
  if (/brew|beer|pub|taproom|\bbar\b/.test(c)) return G("<path d='M6 5h9v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5z'/><path d='M15 9h1.5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H15'/><path d='M6 8.5h9'/>");
  /* sundae cup, not scoop-over-point — at pin size a circle above a taper reads
     as a generic map marker and breaks the glyph family */
  if (/ice cream|dessert|sweet|bakery|cake|gelato/.test(c)) return G("<path d='M6.5 10.5h11L15.5 19h-7z'/><path d='M8 10.5a4 4 0 0 1 8 0'/><path d='M12 6.5V4'/>");
  if (/coastal|seafood|fish|mangalor/.test(c)) return G("<path d='M3 12c3-3.5 6.5-5 10.5-5 2.5 2.5 2.5 7.5 0 10C9.5 17 6.5 15.5 3 12z'/><path d='M14 8.5L19 12l-5 3.5'/>");
  if (/pizza|italian/.test(c)) return G("<path d='M12 3L4 19h16z'/><path d='M7.5 12.5h9'/>");
  return null;
}

export function monogram(name: string): string {
  // strip apostrophes first so "Brahmin's" → "Brahmins" (one token, not "B" + "s")
  const parts = name.replace(/['’]/g, "").replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || (name[0] ?? "·").toUpperCase();
}

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
  { name: "Rohan", ini: "RK", occasions: ["late night", "date", "group dinner"], blurb: "Late-night, brewpubs, and where to take a date.", spots: [
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

/* Shared occasions between you and a palate — the HONEST overlap (a reason, named,
   countable), surfaced as "you both back X". Prefer this to any synthetic %.
   (The old fabricated matchPct — a 58% floor + 48 offset — has been removed; a
   trust brand cannot ship invented social proof.) */
export function sharedOccasions(palate: FoundingPalate, mine: Vouch[]): string[] {
  const a = new Set(mine.flatMap((v) => v.spot.occasions.concat(v.occ)));
  return palate.occasions.filter((o) => a.has(o));
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
