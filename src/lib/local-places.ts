/**
 * Local Bangalore restaurant directory.
 * Used as a fallback when Google Places API key is not configured.
 * Real places, real coordinates — just not from Google.
 */

export interface LocalPlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  types: string[];
}

export const BANGALORE_PLACES: LocalPlace[] = [
  // South Indian classics
  { place_id: "local-001", name: "Vidyarthi Bhavan", formatted_address: "Gandhi Bazaar, Basavanagudi, Bangalore", geometry: { location: { lat: 12.9432, lng: 77.5674 } }, types: ["south_indian", "restaurant"] },
  { place_id: "local-002", name: "CTR (Central Tiffin Room)", formatted_address: "7th Cross, Malleshwaram, Bangalore", geometry: { location: { lat: 12.9967, lng: 77.5713 } }, types: ["south_indian", "restaurant"] },
  { place_id: "local-003", name: "Brahmin's Coffee Bar", formatted_address: "Shankarapuram, Basavanagudi, Bangalore", geometry: { location: { lat: 12.9493, lng: 77.5694 } }, types: ["south_indian", "cafe"] },
  { place_id: "local-004", name: "Mavalli Tiffin Room (MTR)", formatted_address: "Lalbagh Road, Bangalore", geometry: { location: { lat: 12.9529, lng: 77.5826 } }, types: ["south_indian", "restaurant"] },
  { place_id: "local-005", name: "Nagarjuna", formatted_address: "Residency Road, Bangalore", geometry: { location: { lat: 12.9714, lng: 77.6046 } }, types: ["andhra", "biryani", "restaurant"] },
  { place_id: "local-006", name: "Shivaji Military Hotel", formatted_address: "Jayanagar 4th Block, Bangalore", geometry: { location: { lat: 12.9279, lng: 77.5837 } }, types: ["non_veg", "south_indian", "restaurant"] },
  { place_id: "local-007", name: "Veena Stores", formatted_address: "Malleshwaram, Bangalore", geometry: { location: { lat: 12.9962, lng: 77.5706 } }, types: ["south_indian", "restaurant"] },
  { place_id: "local-008", name: "Taaza Thindi", formatted_address: "VV Puram Food Street, Bangalore", geometry: { location: { lat: 12.9478, lng: 77.5724 } }, types: ["street_food", "south_indian"] },

  // Biryani & North Indian
  { place_id: "local-009", name: "Meghana Foods", formatted_address: "Residency Road, Bangalore", geometry: { location: { lat: 12.9706, lng: 77.6060 } }, types: ["biryani", "andhra", "restaurant"] },
  { place_id: "local-010", name: "Empire Restaurant", formatted_address: "Church Street, Bangalore", geometry: { location: { lat: 12.9742, lng: 77.6072 } }, types: ["biryani", "north_indian", "restaurant"] },
  { place_id: "local-011", name: "Ammi's Biryani", formatted_address: "Frazer Town, Bangalore", geometry: { location: { lat: 12.9984, lng: 77.6131 } }, types: ["biryani", "mughlai", "restaurant"] },
  { place_id: "local-012", name: "Kebab Studio", formatted_address: "Koramangala, Bangalore", geometry: { location: { lat: 12.9352, lng: 77.6245 } }, types: ["kebab", "north_indian", "restaurant"] },
  { place_id: "local-013", name: "Punjab Grill", formatted_address: "Orion Mall, Rajajinagar, Bangalore", geometry: { location: { lat: 13.0107, lng: 77.5548 } }, types: ["north_indian", "fine_dining"] },

  // Cafes & Bakeries
  { place_id: "local-014", name: "Third Wave Coffee", formatted_address: "12th Main, Indiranagar, Bangalore", geometry: { location: { lat: 12.9784, lng: 77.6408 } }, types: ["cafe", "coffee"] },
  { place_id: "local-015", name: "Blue Tokai Coffee", formatted_address: "Koramangala 4th Block, Bangalore", geometry: { location: { lat: 12.9364, lng: 77.6156 } }, types: ["cafe", "coffee"] },
  { place_id: "local-016", name: "Hole in the Wall Cafe", formatted_address: "Koramangala, Bangalore", geometry: { location: { lat: 12.9345, lng: 77.6269 } }, types: ["cafe", "brunch"] },
  { place_id: "local-017", name: "Dyu Art Cafe", formatted_address: "BTM Layout, Bangalore", geometry: { location: { lat: 12.9163, lng: 77.6101 } }, types: ["cafe", "art_cafe"] },
  { place_id: "local-018", name: "Matteo Coffea", formatted_address: "Church Street, Bangalore", geometry: { location: { lat: 12.9752, lng: 77.6073 } }, types: ["cafe", "coffee"] },
  { place_id: "local-019", name: "Glen's Bakehouse", formatted_address: "Lavelle Road, Bangalore", geometry: { location: { lat: 12.9692, lng: 77.5987 } }, types: ["bakery", "cafe"] },

  // Bars & Brewpubs
  { place_id: "local-020", name: "Toit Brewpub", formatted_address: "100 Feet Road, Indiranagar, Bangalore", geometry: { location: { lat: 12.9785, lng: 77.6408 } }, types: ["brewpub", "bar", "restaurant"] },
  { place_id: "local-021", name: "The Permit Room", formatted_address: "Lavelle Road, Bangalore", geometry: { location: { lat: 12.9691, lng: 77.5988 } }, types: ["bar", "south_indian", "restaurant"] },
  { place_id: "local-022", name: "Arbor Brewing Company", formatted_address: "Magrath Road, Bangalore", geometry: { location: { lat: 12.9691, lng: 77.6003 } }, types: ["brewpub", "bar"] },
  { place_id: "local-023", name: "Windmills Craftworks", formatted_address: "Whitefield, Bangalore", geometry: { location: { lat: 12.9698, lng: 77.7500 } }, types: ["brewpub", "restaurant"] },
  { place_id: "local-024", name: "Bob's Bar", formatted_address: "Indiranagar, Bangalore", geometry: { location: { lat: 12.9781, lng: 77.6399 } }, types: ["bar", "pub"] },

  // Casual dining & Continental
  { place_id: "local-025", name: "Truffles", formatted_address: "St. Marks Road, Bangalore", geometry: { location: { lat: 12.9725, lng: 77.6012 } }, types: ["burger", "continental", "restaurant"] },
  { place_id: "local-026", name: "Fatty Bao", formatted_address: "12th Main, Indiranagar, Bangalore", geometry: { location: { lat: 12.9786, lng: 77.6409 } }, types: ["asian", "restaurant"] },
  { place_id: "local-027", name: "Burma Burma", formatted_address: "Church Street, Bangalore", geometry: { location: { lat: 12.9749, lng: 77.6069 } }, types: ["burmese", "restaurant"] },
  { place_id: "local-028", name: "Chinita", formatted_address: "Indiranagar, Bangalore", geometry: { location: { lat: 12.9779, lng: 77.6401 } }, types: ["mexican", "restaurant"] },
  { place_id: "local-029", name: "Smoke House Deli", formatted_address: "Lavelle Road, Bangalore", geometry: { location: { lat: 12.9688, lng: 77.5985 } }, types: ["continental", "restaurant"] },
  { place_id: "local-030", name: "Toast & Tonic", formatted_address: "12th Main, Indiranagar, Bangalore", geometry: { location: { lat: 12.9783, lng: 77.6407 } }, types: ["bar", "continental", "restaurant"] },

  // Fine dining
  { place_id: "local-031", name: "Karavalli", formatted_address: "The Gateway Hotel, Residency Road, Bangalore", geometry: { location: { lat: 12.9704, lng: 77.6057 } }, types: ["coastal", "fine_dining", "restaurant"] },
  { place_id: "local-032", name: "The Fatty Bao", formatted_address: "Indiranagar, Bangalore", geometry: { location: { lat: 12.9786, lng: 77.6410 } }, types: ["pan_asian", "fine_dining"] },
  { place_id: "local-033", name: "Grasshopper", formatted_address: "Off Bannerghatta Road, Bangalore", geometry: { location: { lat: 12.8735, lng: 77.5991 } }, types: ["european", "fine_dining"] },

  // Street food & quick bites
  { place_id: "local-034", name: "Rameshwaram Cafe", formatted_address: "Indiranagar, Bangalore", geometry: { location: { lat: 12.9780, lng: 77.6395 } }, types: ["south_indian", "cafe", "restaurant"] },
  { place_id: "local-035", name: "Eat Street (VV Puram)", formatted_address: "VV Puram, Bangalore", geometry: { location: { lat: 12.9475, lng: 77.5721 } }, types: ["street_food"] },
  { place_id: "local-036", name: "Corner House", formatted_address: "Residency Road, Bangalore", geometry: { location: { lat: 12.9710, lng: 77.6050 } }, types: ["ice_cream", "dessert"] },
  { place_id: "local-037", name: "Hatti Kaapi", formatted_address: "Multiple locations, Bangalore", geometry: { location: { lat: 12.9716, lng: 77.5946 } }, types: ["coffee", "cafe"] },

  // Pizza & Italian
  { place_id: "local-038", name: "Onesta", formatted_address: "Koramangala, Bangalore", geometry: { location: { lat: 12.9348, lng: 77.6263 } }, types: ["pizza", "italian", "restaurant"] },
  { place_id: "local-039", name: "Toscano", formatted_address: "UB City, Vittal Mallya Road, Bangalore", geometry: { location: { lat: 12.9714, lng: 77.5969 } }, types: ["italian", "fine_dining"] },

  // Japanese & Asian
  { place_id: "local-040", name: "Harima", formatted_address: "Residency Road, Bangalore", geometry: { location: { lat: 12.9708, lng: 77.6053 } }, types: ["japanese", "sushi", "restaurant"] },
  { place_id: "local-041", name: "Edo Japanese", formatted_address: "ITC Gardenia, Residency Road, Bangalore", geometry: { location: { lat: 12.9700, lng: 77.6045 } }, types: ["japanese", "fine_dining"] },
  { place_id: "local-042", name: "Nasi and Mee", formatted_address: "Church Street, Bangalore", geometry: { location: { lat: 12.9748, lng: 77.6068 } }, types: ["malaysian", "asian", "restaurant"] },
];

export interface PlaceCategory {
  label: string;
  emoji: string;
  places: LocalPlace[];
}

export function getOnboardingCategories(): PlaceCategory[] {
  return [
    {
      label: "South Indian Classics",
      emoji: "🫓",
      places: BANGALORE_PLACES.filter(p => p.types.includes("south_indian")).slice(0, 6),
    },
    {
      label: "Biryani & Andhra",
      emoji: "🍚",
      places: BANGALORE_PLACES.filter(p => p.types.some(t => ["biryani", "andhra", "mughlai"].includes(t))).slice(0, 4),
    },
    {
      label: "Cafes & Coffee",
      emoji: "☕",
      places: BANGALORE_PLACES.filter(p => p.types.some(t => ["cafe", "coffee"].includes(t))).slice(0, 6),
    },
    {
      label: "Bars & Brewpubs",
      emoji: "🍺",
      places: BANGALORE_PLACES.filter(p => p.types.some(t => ["bar", "brewpub", "pub"].includes(t))).slice(0, 4),
    },
    {
      label: "Casual & Global",
      emoji: "🍔",
      places: BANGALORE_PLACES.filter(p => p.types.some(t => ["burger", "continental", "asian", "mexican", "burmese", "italian", "pizza"].includes(t))).slice(0, 6),
    },
    {
      label: "Fine Dining",
      emoji: "✨",
      places: BANGALORE_PLACES.filter(p => p.types.includes("fine_dining")).slice(0, 4),
    },
    {
      label: "Street Food & Quick Bites",
      emoji: "🛒",
      places: BANGALORE_PLACES.filter(p => p.types.some(t => ["street_food", "ice_cream", "dessert"].includes(t))).slice(0, 4),
    },
  ];
}

/**
 * Search local places by name or area.
 * Same interface as Google Places text search results.
 */
export function searchLocalPlaces(query: string): LocalPlace[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const results = BANGALORE_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.formatted_address.toLowerCase().includes(q) ||
      p.types.some((t) => t.replace(/_/g, " ").includes(q))
  );

  return results.slice(0, 8);
}
