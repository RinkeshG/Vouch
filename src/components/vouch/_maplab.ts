/* Shared sample for the "your map" comparison lab. Real-ish Bengaluru coords so
   all three treatments render the same geography. */
export type LabSpot = {
  name: string; area: string; cuisine: string; price: string;
  lat: number; lng: number; line: string; occasions: string[];
};

export const LAB_SPOTS: LabSpot[] = [
  { name: "Naru Noodle Bar", area: "Indiranagar", cuisine: "Ramen", price: "₹₹₹", lat: 12.9748, lng: 77.6402, line: "Best bowl in the city. Go at 6 sharp.", occasions: ["date", "rainy day"] },
  { name: "Empire", area: "Indiranagar", cuisine: "Kebabs", price: "₹₹", lat: 12.9707, lng: 77.6400, line: "Midnight hunger, fully solved.", occasions: ["late night"] },
  { name: "Karavalli", area: "Residency Rd", cuisine: "Coastal", price: "₹₹₹₹", lat: 12.9618, lng: 77.6006, line: "Take your parents. They’ll talk about it for months.", occasions: ["parents", "group dinner"] },
  { name: "Brahmin’s Coffee Bar", area: "Shankarpuram", cuisine: "Filter coffee", price: "₹", lat: 12.9544, lng: 77.5650, line: "Idli, kara bath, one-by-two filter.", occasions: ["coffee", "solo lunch"] },
  { name: "Vidyarthi Bhavan", area: "Basavanagudi", cuisine: "Dosa", price: "₹", lat: 12.9419, lng: 77.5732, line: "The crisp-dosa benchmark. Before 9am.", occasions: ["parents", "coffee"] },
  { name: "CTR · Shri Sagar", area: "Malleshwaram", cuisine: "Benne dosa", price: "₹", lat: 13.0028, lng: 77.5687, line: "Benne masala dosa. Don’t debate it.", occasions: ["coffee", "parents"] },
  { name: "Toit", area: "Indiranagar", cuisine: "Brewpub", price: "₹₹₹", lat: 12.9785, lng: 77.6403, line: "Wood-fired pizzas and the Tintin Toit.", occasions: ["group dinner", "date"] },
  { name: "Corner House", area: "Koramangala", cuisine: "Ice cream", price: "₹", lat: 12.9346, lng: 77.6270, line: "Death by Chocolate. A nightcap.", occasions: ["late night", "date"] },
  { name: "Shivaji Military Hotel", area: "Jayanagar", cuisine: "Donne biryani", price: "₹₹", lat: 12.9266, lng: 77.5836, line: "Mutton donne by noon or miss it.", occasions: ["worth the drive"] },
];

/* central-Bengaluru bounding box for the crafted-map projection */
export const BBOX = { minLng: 77.555, maxLng: 77.650, minLat: 12.930, maxLat: 13.006 };
export function project(lat: number, lng: number) {
  const x = ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * 100;
  const y = (1 - (lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * 100;
  return { x: Math.max(4, Math.min(96, x)), y: Math.max(6, Math.min(94, y)) };
}
