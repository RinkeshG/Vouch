/* Shared sample data for the surface stubs. Real curation lives in Supabase
   later (Constitution §6, §8); this is for feeling the product OS. */
import type { TrailLine } from "./receipt";
import type { GuideData } from "./guide";

export const TRAIL: TrailLine[] = [
  { kind: "vouched", who: "Aditi", ini: "AS", note: "Take your parents.", time: "2h" },
  { kind: "saved", faces: ["RG", "MK"], extra: 1, names: "Rinkesh, Meera +1", time: "now" },
];

export type TonightPick = {
  place: string; tags: string; line: string;
  palate: { name: string; ini: string };
  occasions: string[]; faces: string[]; via: string;
};

export const TONIGHT: TonightPick[] = [
  { place: "Naru Noodle Bar", tags: "Ramen · Indiranagar · ₹₹₹", line: "Best bowl in the city. Get there at 6 sharp.", palate: { name: "Aditi", ini: "AS" }, occasions: ["date", "rainy day"], faces: ["AS", "RG"], via: "Aditi vouched" },
  { place: "Karavalli", tags: "Coastal · Residency Rd · ₹₹₹₹", line: "Take your parents. They’ll talk about it for months.", palate: { name: "Meera", ini: "MK" }, occasions: ["parents", "worth the drive"], faces: ["MK", "AS"], via: "Meera vouched" },
  { place: "Brahmin’s Coffee Bar", tags: "Filter · Shankarpuram · ₹", line: "Idli, kara bath, one-by-two filter. A morning religion.", palate: { name: "Rinkesh", ini: "RG" }, occasions: ["coffee", "solo lunch"], faces: ["RG"], via: "Rinkesh vouched" },
];

export const GUIDE_PARENTS: GuideData = {
  title: "Where I take my parents", by: "Aditi", ini: "AS", count: 6, note: "no surprises, all delight",
  anchor: "Safe bets · no surprises",
  items: [
    { name: "Karavalli", tags: "Coastal · Residency Rd · ₹₹₹₹", note: "They’ll talk about it for months." },
    { name: "Vidyarthi Bhavan", tags: "Dosa · Basavanagudi · ₹", note: "Go before 9am, beat the queue." },
    { name: "Koshy’s", tags: "Old-school · St Marks Rd · ₹₹", note: "Chicken stew + appam, always." },
    { name: "MTR", tags: "Tiffin · Lalbagh · ₹", note: "The rava idli origin story." },
    { name: "Sodabottleopenerwala", tags: "Parsi · Lavelle Rd · ₹₹₹", note: "Berry pulao, no debate." },
    { name: "Nagarjuna", tags: "Andhra · Residency Rd · ₹₹", note: "For when they want a little spice." },
  ],
};

export const HOME_MODES = ["Tonight", "Near you", "Parents", "Late night", "Coffee", "Date", "Worth the drive", "From people you follow"];

import type { Pick } from "./home-screen";
export const PICKS: Pick[] = [
  { place: "Naru Noodle Bar", area: "Indiranagar", tags: "Ramen · Indiranagar · ₹₹₹", dist: "1.2 km", openTill: "11pm", line: "Best bowl in the city. Get there at 6 sharp.", by: { name: "Aditi", ini: "AS" }, savedFaces: ["RG", "MK"], savedCount: 2, occasions: ["date", "rainy day"] },
  { place: "Empire", area: "Indiranagar", tags: "Kebabs · Indiranagar · ₹₹", dist: "0.8 km", openTill: "1am", line: "Midnight hunger, fully solved. Get the chicken ghee roast.", by: { name: "Rinkesh", ini: "RG" }, savedFaces: ["AS"], savedCount: 1, occasions: ["late night"] },
  { place: "Karavalli", area: "Residency Rd", tags: "Coastal · Residency Rd · ₹₹₹₹", dist: "3.4 km", openTill: "11pm", line: "Take your parents. They’ll talk about it for months.", by: { name: "Meera", ini: "MK" }, savedFaces: ["AS", "RG"], savedCount: 2, occasions: ["parents", "group dinner"] },
  { place: "Toit", area: "Indiranagar", tags: "Brewpub · Indiranagar · ₹₹₹", dist: "1.1 km", openTill: "11:30pm", line: "Wood-fired pizzas and the Tintin Toit. Go early, it fills up.", by: { name: "Rinkesh", ini: "RG" }, savedFaces: ["MK"], savedCount: 1, occasions: ["group dinner", "date"] },
  { place: "Brahmin’s Coffee Bar", area: "Shankarpuram", tags: "Filter · Shankarpuram · ₹", dist: "5.0 km", openTill: "noon", line: "Idli, kara bath, one-by-two filter. A morning religion.", by: { name: "Aditi", ini: "AS" }, savedFaces: ["MK"], savedCount: 1, occasions: ["coffee"] },
];
