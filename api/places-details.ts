const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80";

export default async function handler(
  req: { query: Record<string, string | string[] | undefined> },
  res: { status: (n: number) => { json: (b: unknown) => void }; json: (b: unknown) => void }
) {
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;
  if (!key) {
    res.status(503).json({ error: "Google Places API key not configured" });
    return;
  }

  const rawId = String(req.query.placeId || "").trim();
  if (!rawId) {
    res.status(400).json({ error: "placeId required" });
    return;
  }
  const placeId = rawId.replace(/^places\//, "");

  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,photos,addressComponents,priceLevel"
    }
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[places-details] Google error", response.status, detail);
    res.status(response.status === 404 ? 404 : 502).json({
      error: "Google Places details failed",
      detail: detail.slice(0, 400)
    });
    return;
  }

  const data = (await response.json()) as {
    displayName?: { text?: string };
    formattedAddress?: string;
    photos?: Array<{ name?: string }>;
    priceLevel?: string;
    addressComponents?: Array<{ longText?: string; types?: string[] }>;
  };

  let image = DEFAULT_IMAGE;
  const photoName = data.photos?.[0]?.name;
  if (photoName) {
    image = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&key=${key}`;
  }

  const locality =
    data.addressComponents?.find((c) => c.types?.includes("sublocality"))?.longText ??
    data.addressComponents?.find((c) => c.types?.includes("locality"))?.longText ??
    "";

  const priceMap: Record<string, string> = {
    PRICE_LEVEL_INEXPENSIVE: "easy",
    PRICE_LEVEL_MODERATE: "treat",
    PRICE_LEVEL_EXPENSIVE: "splurge",
    PRICE_LEVEL_VERY_EXPENSIVE: "splurge"
  };

  res.json({
    name: data.displayName?.text ?? "Restaurant",
    area: locality || "Nearby",
    image,
    price: priceMap[data.priceLevel ?? ""] ?? "treat",
    tags: ["from Google"],
    bestFor: [],
    tip: "",
    caveat: data.formattedAddress ?? ""
  });
}
