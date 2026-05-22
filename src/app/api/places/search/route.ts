import { NextResponse } from "next/server";
import { searchLocalPlaces } from "@/lib/local-places";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

const CITY_BOUNDS: Record<string, { lat: number; lng: number; radius: number }> = {
  bangalore: { lat: 12.9716, lng: 77.5946, radius: 30000 },
  bombay: { lat: 19.076, lng: 72.8777, radius: 30000 },
  delhi: { lat: 28.6139, lng: 77.209, radius: 30000 },
  goa: { lat: 15.2993, lng: 74.124, radius: 30000 },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const city = searchParams.get("city") || "bangalore";

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // No Google API key — fall back to curated local Bangalore directory
  if (!GOOGLE_API_KEY) {
    const results = searchLocalPlaces(query);
    return NextResponse.json({ results });
  }

  const bounds = CITY_BOUNDS[city] || CITY_BOUNDS.bangalore;

  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/textsearch/json"
    );
    url.searchParams.set("query", `${query} restaurant cafe bar ${city}`);
    url.searchParams.set("location", `${bounds.lat},${bounds.lng}`);
    url.searchParams.set("radius", String(bounds.radius));
    url.searchParams.set("type", "restaurant|cafe|bar|food");
    url.searchParams.set("key", GOOGLE_API_KEY);

    const res = await fetch(url.toString());
    const data = await res.json();

    // Google returns status like REQUEST_DENIED, OVER_QUERY_LIMIT without throwing
    if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      const localResults = searchLocalPlaces(query);
      return NextResponse.json({ results: localResults });
    }

    const results = (data.results || []).slice(0, 8).map(
      (place: {
        place_id: string;
        name: string;
        formatted_address: string;
        geometry?: { location: { lat: number; lng: number } };
        types?: string[];
      }) => ({
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.formatted_address,
        geometry: place.geometry,
        types: place.types || [],
      })
    );

    // If Google returned nothing, try local directory before giving up
    if (results.length === 0) {
      const localResults = searchLocalPlaces(query);
      if (localResults.length > 0) {
        return NextResponse.json({ results: localResults });
      }
    }

    return NextResponse.json({ results });
  } catch {
    // If Google fails, fall back to local
    const results = searchLocalPlaces(query);
    return NextResponse.json({ results });
  }
}
