/* Hotlist — the guide data layer.
   One source of truth for guides; today seeded + read-only, deliberately shaped
   so it can be swapped for a real store (Supabase) behind the same getters
   (Phase 3) without the UI changing. A Hotlist is the product's atom:
   a curator + their spots + the take on each. The take is the value. */

export type Place = {
  name: string;
  area: string;
  category: string;
  take: string;        // the why — your read on it, in plain words
  order?: string;      // the what-to-get — the single most useful line on the card
  lat?: number;        // real coordinates (from the place search) — drives the map
  lng?: number;
};

export type Guide = {
  handle: string;
  title: string;
  intro: string;
  curator: { name: string; initial: string; tint: string; city: string };
  sent: number;
  saved: number;
  updated: string;
  minutes: number; // "made in N minutes" — the viral close
  places: Place[];
};

/* Google Maps deep link — we own the curation, we rent the infra (directions,
   hours, the pin all live in Google). One tap from a take to "take me there." */
export function mapsUrl(p: Place, city: string): string {
  const q = encodeURIComponent(`${p.name} ${p.area} ${city}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/* Ordered categories for the filter — "All" is implicit. Derived from the
   guide's own places so the chips only ever show what's actually in it. */
export function categoriesOf(g: Guide): string[] {
  const seen: string[] = [];
  for (const p of g.places) if (!seen.includes(p.category)) seen.push(p.category);
  return seen;
}

const GUIDES: Guide[] = [
  {
    handle: "maya",
    title: "Maya's Bangalore",
    intro: "28 places I'd actually send you to. Mostly coffee, some chaos. If you only do three, do the starred ones.",
    curator: { name: "Maya R.", initial: "M", tint: "#CB613A", city: "Bangalore" },
    sent: 142, saved: 318, updated: "2 days ago", minutes: 4,
    places: [
      { name: "Blue Tokai", area: "Koramangala", category: "Coffee", take: "the cold brew that ruined all others for me. sit upstairs, by the window.", order: "cold brew, black" },
      { name: "Third Wave Coffee", area: "Indiranagar", category: "Coffee", take: "where I go when I actually need to get work done — plugs, quiet, no one rushing you out.", order: "flat white + the corner table" },
      { name: "Airlines Hotel", area: "Lavelle Rd", category: "Coffee", take: "filter under the rain trees, open air, 24/7. unbeatable at 8am before the city wakes up.", order: "filter coffee + a masala dosa" },
      { name: "Toit", area: "Indiranagar", category: "Beer", take: "weekday only — weekends are a war zone. the rooftop earns the wait.", order: "the Toit Weiss + a basket of fries" },
      { name: "Dali & Gala", area: "Ulsoor", category: "Date night", take: "dark, tiny, a little dramatic — the kind of place a date remembers.", order: "whatever the chef is pushing that night" },
      { name: "Naru Noodle Bar", area: "Basavanagudi", category: "Date night", take: "book the second reservations open. it's a counter, but it's an event.", order: "the tasting menu — skip à la carte" },
      { name: "Empire", area: "Indiranagar", category: "Late night", take: "the answer to a 1am question you didn't know you had. don't read reviews, just go.", order: "chicken ghee roast + butter naan" },
      { name: "Karavalli", area: "Residency Rd", category: "Big occasion", take: "where I take visiting parents — coastal, lovely, they'll bring it up for months.", order: "the appams + Coorg pandi curry" },
      { name: "Vidyarthi Bhavan", area: "Basavanagudi", category: "Breakfast", take: "before 9am or don't bother. a proper Bangalore rite of passage.", order: "masala dosa, extra ghee" },
      { name: "Koshy's", area: "St Marks Rd", category: "Classic", take: "old-school, a little grumpy, never changes — thank god. a slice of old Bangalore.", order: "chicken stew + appam" },
      { name: "CTR (Shri Sagar)", area: "Malleshwaram", category: "Breakfast", take: "the standard every other dosa is quietly measured against.", order: "benne masala dosa" },
    ],
  },
  {
    handle: "dev",
    title: "Filter coffee, ranked",
    intro: "I have opinions about filter coffee and I will not be apologising for them. Strongest to gentlest.",
    curator: { name: "Dev P.", initial: "D", tint: "#3E7C74", city: "Bangalore" },
    sent: 117, saved: 204, updated: "5 days ago", minutes: 6,
    places: [
      { name: "Brahmin's Coffee Bar", area: "Shankarpuram", category: "Filter coffee", take: "idli + that chutney + the coffee. peak. there is no seating, that's the point." },
      { name: "Vidyarthi Bhavan", area: "Basavanagudi", category: "Filter coffee", take: "before 9am, beat the queue. strong enough to reset your whole nervous system." },
      { name: "Airlines Hotel", area: "Lavelle Rd", category: "Filter coffee", take: "under the trees. the most romantic ₹30 you'll ever spend." },
      { name: "Asha Tiffins", area: "Jayanagar", category: "Filter coffee", take: "the dark horse. gentler, but the rava idli earns its place." },
    ],
  },
  {
    handle: "ananya",
    title: "1am in Bangalore",
    intro: "For when the kitchen's closed but the night isn't. Tested extensively, regretted nothing.",
    curator: { name: "Ananya S.", initial: "A", tint: "#C98A3C", city: "Bangalore" },
    sent: 203, saved: 511, updated: "1 day ago", minutes: 5,
    places: [
      { name: "Empire", area: "Indiranagar", category: "Late night", take: "chicken ghee roast at 1am. the answer to a question you didn't know you had." },
      { name: "Shawarma Center", area: "Frazer Town", category: "Late night", take: "the original. accept no copies. extra garlic, no regrets." },
      { name: "CTR", area: "Malleshwaram", category: "Late night", take: "okay it shuts early but the post-party benne dosa fantasy keeps me going." },
      { name: "Hotel Savoury", area: "Mosque Rd", category: "Late night", take: "the rolls. you'll smell like them for two days. worth it." },
    ],
  },
  {
    handle: "kabir",
    title: "First dates that actually work",
    intro: "Places that do half the talking for you. Not too loud, not too try-hard, easy to leave if it's going badly.",
    curator: { name: "Kabir M.", initial: "K", tint: "#7C8C5A", city: "Bangalore" },
    sent: 88, saved: 167, updated: "3 days ago", minutes: 7,
    places: [
      { name: "Dali & Gala", area: "Ulsoor", category: "Date night", take: "order whatever sounds weird. low light does a lot of heavy lifting." },
      { name: "Naru Noodle Bar", area: "Basavanagudi", category: "Date night", take: "book ahead. small enough to feel intentional, good enough to cover a lull." },
      { name: "The Rameswaram Cafe", area: "Indiranagar", category: "Casual", take: "for a low-stakes first one. great filter coffee, easy exit." },
      { name: "Bar Spirit Forward", area: "Indiranagar", category: "Drinks", take: "if it's going well, this is round two. let them order for you." },
    ],
  },
  {
    handle: "rhea",
    title: "Goa, the non-touristy bits",
    intro: "Skip the shacks everyone tags. This is where I actually eat when I'm down south for a week.",
    curator: { name: "Rhea T.", initial: "R", tint: "#8E5A6B", city: "Goa" },
    sent: 264, saved: 690, updated: "1 week ago", minutes: 9,
    places: [
      { name: "Bomra's", area: "Candolim", category: "Dinner", take: "Burmese, not what you came to Goa for, exactly why you should. book it." },
      { name: "Vinayak Family Restaurant", area: "Assagao", category: "Lunch", take: "the fish thali. go hungry, go early, go in your worst clothes." },
      { name: "Bhatti Village", area: "Nerul", category: "Dinner", take: "no menu, no English, no problem. eat whatever the family is cooking." },
      { name: "Cafe Bodega", area: "Altinho", category: "Coffee", take: "the courtyard. slow morning, good light, better coffee." },
    ],
  },
  {
    handle: "arjun",
    title: "Where I take my parents",
    intro: "Safe, lovely, no surprises on the bill. The kind of place that makes them think I've got my life together.",
    curator: { name: "Arjun K.", initial: "J", tint: "#6E7F9A", city: "Bangalore" },
    sent: 96, saved: 142, updated: "4 days ago", minutes: 5,
    places: [
      { name: "Karavalli", area: "Residency Rd", category: "Big occasion", take: "they'll talk about it for months. coastal, classy, worth the splurge." },
      { name: "Koshy's", area: "St Marks Rd", category: "Classic", take: "chicken stew + appam, always. a little bit of old Bangalore on a plate." },
      { name: "MTR", area: "Lalbagh Rd", category: "Breakfast", take: "the rava idli, the way it was meant to be. get there before the rush." },
      { name: "Nagarjuna", area: "Residency Rd", category: "Lunch", take: "Andhra meals. the parents will pretend it's too spicy and finish everything." },
    ],
  },
  {
    handle: "sana",
    title: "Cafés you can actually work from",
    intro: "Plugs, wifi, no one rushing you off the table. Ranked by how long I've outstayed my welcome.",
    curator: { name: "Sana V.", initial: "S", tint: "#B0492F", city: "Bangalore" },
    sent: 151, saved: 380, updated: "2 days ago", minutes: 6,
    places: [
      { name: "Third Wave Coffee", area: "Indiranagar", category: "Work", take: "plugs, quiet, no judgement. the unofficial co-working space of the eastside." },
      { name: "Dyu Art Cafe", area: "Koramangala", category: "Work", take: "the garden seats. all day. nobody will ever ask you to leave." },
      { name: "Roastery Coffee House", area: "Koramangala", category: "Work", take: "for the long sessions. big tables, good light, better playlists." },
      { name: "Matteo", area: "Church St", category: "Casual", take: "central, busy, fine for a one-hour sprint. not for the deep work." },
    ],
  },
  {
    handle: "nikhil",
    title: "Craft beer crawl",
    intro: "One evening, one part of town, ascending order of how wrecked you'll be. Start early.",
    curator: { name: "Nikhil B.", initial: "N", tint: "#C17A2B", city: "Bangalore" },
    sent: 74, saved: 121, updated: "6 days ago", minutes: 4,
    places: [
      { name: "Toit", area: "Indiranagar", category: "Beer", take: "start here. the toit weiss, a basket of fries, set the tone." },
      { name: "The Permit Room", area: "Indiranagar", category: "Drinks", take: "middle of the crawl. order the chilli pork, thank me later." },
      { name: "Geist Brewing", area: "Hennur", category: "Beer", take: "worth the detour. the witbier genuinely slaps. the taproom is unglamorous and perfect." },
    ],
  },
];

export function getGuide(handle: string): Guide | undefined {
  return GUIDES.find((g) => g.handle === handle.toLowerCase());
}

export function listGuides(): Guide[] {
  return GUIDES;
}
