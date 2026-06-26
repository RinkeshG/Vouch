import { NextResponse } from "next/server";

/* Real place search, keyless — proxies Photon (OpenStreetMap geocoder) server-
   side so there's no CORS and no API key. Biased to Bengaluru. This route is the
   seam: swap the body for Google Places (or self-hosted Photon) later and the
   builder never changes. */

function category(osmValue: string | undefined): string {
  const v = (osmValue || "").toLowerCase();
  if (v.includes("cafe") || v.includes("coffee")) return "Cafe";
  if (v.includes("pub") || v.includes("bar") || v.includes("biergarten")) return "Drinks";
  if (v.includes("fast_food")) return "Casual";
  if (v.includes("bakery") || v.includes("pastry")) return "Bakery";
  if (v.includes("ice_cream") || v.includes("confectionery")) return "Dessert";
  if (v.includes("restaurant") || v.includes("food")) return "Dinner";
  return "Casual";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ results: [] });

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10&lat=12.9716&lon=77.5946&lang=en`;
    const r = await fetch(url, { headers: { "User-Agent": "Hotlist/0.1 (place search)" }, cache: "no-store" });
    if (!r.ok) return NextResponse.json({ results: [] });
    const data = await r.json();
    type Feature = { properties?: Record<string, string>; geometry?: { coordinates?: [number, number] } };
    const results = ((data.features as Feature[]) || [])
      .map((f) => {
        const p = f.properties || {};
        const [lng, lat] = f.geometry?.coordinates || [];
        const area = p.suburb || p.district || p.neighbourhood || p.locality || p.city || p.street || p.county || "";
        return { name: p.name, area, category: category(p.osm_value), lat, lng };
      })
      .filter((x) => x.name && typeof x.lat === "number")
      .slice(0, 6);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
