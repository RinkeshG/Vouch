/* A small seed index of real Bangalore spots so "add a place" feels like search-
   and-tap, not a blank text box. Free-text add still works for anything missing.
   Phase 3 swaps this for a real place provider (Google Places) behind searchPlaces(). */

export type PlaceSuggestion = { name: string; area: string; category: string };

const INDEX: PlaceSuggestion[] = [
  { name: "Blue Tokai", area: "Koramangala", category: "Coffee" },
  { name: "Third Wave Coffee", area: "Indiranagar", category: "Coffee" },
  { name: "Airlines Hotel", area: "Lavelle Rd", category: "Coffee" },
  { name: "The Rameswaram Cafe", area: "Indiranagar", category: "Coffee" },
  { name: "Roastery Coffee House", area: "Koramangala", category: "Coffee" },
  { name: "Dyu Art Cafe", area: "Koramangala", category: "Cafe" },
  { name: "Matteo Coffea", area: "Church St", category: "Cafe" },
  { name: "Toit", area: "Indiranagar", category: "Beer" },
  { name: "Geist Brewing", area: "Hennur", category: "Beer" },
  { name: "Arbor Brewing Co.", area: "Magrath Rd", category: "Beer" },
  { name: "The Permit Room", area: "Indiranagar", category: "Drinks" },
  { name: "Bar Spirit Forward", area: "Indiranagar", category: "Drinks" },
  { name: "Dali & Gala", area: "Ulsoor", category: "Date night" },
  { name: "Naru Noodle Bar", area: "Basavanagudi", category: "Date night" },
  { name: "Pizza 4P's", area: "Indiranagar", category: "Date night" },
  { name: "Karavalli", area: "Residency Rd", category: "Big occasion" },
  { name: "Jamavar", area: "MG Rd", category: "Big occasion" },
  { name: "Empire", area: "Indiranagar", category: "Late night" },
  { name: "Shawarma Center", area: "Frazer Town", category: "Late night" },
  { name: "Hotel Savoury", area: "Mosque Rd", category: "Late night" },
  { name: "Vidyarthi Bhavan", area: "Basavanagudi", category: "Breakfast" },
  { name: "CTR (Shri Sagar)", area: "Malleshwaram", category: "Breakfast" },
  { name: "Brahmin's Coffee Bar", area: "Shankarpuram", category: "Breakfast" },
  { name: "MTR", area: "Lalbagh Rd", category: "Breakfast" },
  { name: "Koshy's", area: "St Marks Rd", category: "Classic" },
  { name: "Nagarjuna", area: "Residency Rd", category: "Lunch" },
  { name: "Meghana Foods", area: "Residency Rd", category: "Lunch" },
  { name: "Truffles", area: "St Marks Rd", category: "Casual" },
  { name: "Glen's Bakehouse", area: "Indiranagar", category: "Bakery" },
  { name: "Corner House", area: "Multiple", category: "Dessert" },
  { name: "Lazy Suzy", area: "Koramangala", category: "Dessert" },
  { name: "Burma Burma", area: "Indiranagar", category: "Dinner" },
  { name: "Khan Saheb", area: "Frazer Town", category: "Dinner" },
  { name: "Sri Krishna Sagar", area: "Jayanagar", category: "Breakfast" },
  { name: "Veena Stores", area: "Malleshwaram", category: "Breakfast" },
  { name: "Bangalore Oota Company", area: "Bellandur", category: "Lunch" },
];

export function searchPlaces(query: string, exclude: string[] = []): PlaceSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const ex = new Set(exclude.map((n) => n.toLowerCase()));
  return INDEX.filter(
    (p) => !ex.has(p.name.toLowerCase()) && (p.name.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)),
  ).slice(0, 6);
}

export const CATEGORIES = [
  "Coffee", "Cafe", "Breakfast", "Lunch", "Dinner", "Beer", "Drinks",
  "Date night", "Late night", "Big occasion", "Classic", "Casual", "Bakery", "Dessert",
];
