type CityCenter = { lat: number; lng: number };

const CITY_CENTER: Record<string, CityCenter> = {
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  "Delhi NCR": { lat: 28.6139, lng: 77.209 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Goa: { lat: 15.2993, lng: 74.124 }
};

export default async function handler(
  req: { query: Record<string, string | string[] | undefined> },
  res: { status: (n: number) => { json: (b: unknown) => void }; json: (b: unknown) => void }
) {
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;
  if (!key) {
    res.status(503).json({ error: "Google Places API key not configured" });
    return;
  }

  const input = String(req.query.input || "").trim();
  const city = String(req.query.city || "Bangalore");
  if (input.length < 2) {
    res.json([]);
    return;
  }

  const center = CITY_CENTER[city] ?? CITY_CENTER.Bangalore;

  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key
    },
    body: JSON.stringify({
      input,
      includedPrimaryTypes: ["restaurant", "cafe", "bar", "bakery", "meal_takeaway"],
      includedRegionCodes: ["in"],
      locationBias: {
        circle: { center: { latitude: center.lat, longitude: center.lng }, radius: 25000 }
      }
    })
  });

  if (!response.ok) {
    res.json([]);
    return;
  }

  const data = (await response.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } };
      };
    }>;
  };

  const out = (data.suggestions ?? [])
    .map((s) => {
      const pred = s.placePrediction;
      if (!pred?.placeId) return null;
      const main = pred.structuredFormat?.mainText?.text ?? pred.text?.text ?? "Place";
      const secondary = pred.structuredFormat?.secondaryText?.text ?? "";
      return {
        placeId: pred.placeId,
        name: main,
        area: secondary.split(",")[0]?.trim() || city,
        city,
        address: secondary || main
      };
    })
    .filter(Boolean)
    .slice(0, 8);

  res.json(out);
}
