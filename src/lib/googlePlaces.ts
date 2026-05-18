import type { Place, PriceTier } from "../types";

export type PlacesSearchStatus = "idle" | "loading" | "ok" | "empty" | "unconfigured" | "error";

/** Google resource id — strip optional `places/` prefix for GET requests. */
export function normalizeGooglePlaceId(placeId: string): string {
  return placeId.trim().replace(/^places\//, "");
}

export type GooglePlaceSuggestion = {
  placeId: string;
  name: string;
  area: string;
  city: string;
  address: string;
};

const CITY_CENTER: Record<string, { lat: number; lng: number }> = {
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  "Delhi NCR": { lat: 28.6139, lng: 77.209 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Goa: { lat: 15.2993, lng: 74.124 }
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80";

const PLACEHOLDER_COLORS = ["#5f6158", "#6a4a3d", "#3d5a6a", "#7a5a3d", "#4d6447", "#57364e"];

export function isGooglePlacesEnabled(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_PLACES_API_KEY);
}

function apiKey(): string | undefined {
  return import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined;
}

function areaFromAddress(address: string, city: string): string {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const candidate = parts[parts.length - 2];
    if (candidate && candidate !== city && !candidate.match(/^\d/)) return candidate;
  }
  return city;
}

async function autocompleteDirect(input: string, city: string): Promise<GooglePlaceSuggestion[]> {
  const key = apiKey();
  const center = CITY_CENTER[city] ?? CITY_CENTER.Bangalore;
  if (!key || input.trim().length < 2) return [];

  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key
    },
    body: JSON.stringify({
      input: input.trim(),
      includedPrimaryTypes: ["restaurant", "cafe", "bar", "bakery", "meal_takeaway"],
      includedRegionCodes: ["in"],
      locationBias: {
        circle: { center: { latitude: center.lat, longitude: center.lng }, radius: 25000 }
      }
    })
  });

  if (!res.ok) return [];

  const data = (await res.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } };
      };
    }>;
  };

  return (data.suggestions ?? [])
    .map((s) => {
      const pred = s.placePrediction;
      if (!pred?.placeId) return null;
      const main = pred.structuredFormat?.mainText?.text ?? pred.text?.text ?? "Place";
      const secondary = pred.structuredFormat?.secondaryText?.text ?? "";
      return {
        placeId: pred.placeId,
        name: main,
        area: areaFromAddress(secondary, city),
        city,
        address: secondary || main
      };
    })
    .filter((x): x is GooglePlaceSuggestion => Boolean(x))
    .slice(0, 8);
}

type AutocompleteApiResult =
  | { ok: true; items: GooglePlaceSuggestion[] }
  | { ok: false; status: PlacesSearchStatus; message?: string };

async function autocompleteViaApi(input: string, city: string): Promise<AutocompleteApiResult> {
  if (typeof window === "undefined") return { ok: false, status: "error" };

  try {
    const params = new URLSearchParams({ input: input.trim(), city });
    const res = await fetch(`/api/places-autocomplete?${params.toString()}`);
    const body = (await res.json().catch(() => null)) as
      | GooglePlaceSuggestion[]
      | { error?: string; detail?: string }
      | null;

    if (res.status === 503) {
      return {
        ok: false,
        status: "unconfigured",
        message: (body && !Array.isArray(body) && body.error) || "Google Places API key not set on server"
      };
    }

    if (!res.ok) {
      const message =
        body && !Array.isArray(body)
          ? body.detail || body.error
          : `Places search failed (${res.status})`;
      return { ok: false, status: "error", message };
    }

    const items = Array.isArray(body) ? body : [];
    return { ok: true, items };
  } catch {
    return { ok: false, status: "error", message: "Could not reach Places API" };
  }
}

export async function autocompletePlaces(
  input: string,
  city: string
): Promise<{ items: GooglePlaceSuggestion[]; status: PlacesSearchStatus; message?: string }> {
  if (input.trim().length < 2) {
    return { items: [], status: "idle" };
  }

  const viaApi = await autocompleteViaApi(input, city);
  if (viaApi.ok) {
    if (viaApi.items.length > 0) return { items: viaApi.items, status: "ok" };
    if (isGooglePlacesEnabled()) {
      const direct = await autocompleteDirect(input, city);
      if (direct.length > 0) return { items: direct, status: "ok" };
    }
    return { items: [], status: "empty", message: "No restaurants matched — try another name or add manually." };
  }

  if (viaApi.status === "unconfigured" && isGooglePlacesEnabled()) {
    const direct = await autocompleteDirect(input, city);
    if (direct.length > 0) return { items: direct, status: "ok" };
    return {
      items: [],
      status: "empty",
      message: "No matches — check your Google API key has Places API (New) enabled."
    };
  }

  if (isGooglePlacesEnabled()) {
    const direct = await autocompleteDirect(input, city);
    if (direct.length > 0) return { items: direct, status: "ok" };
  }

  return {
    items: [],
    status: viaApi.status,
    message:
      viaApi.message ??
      (isGooglePlacesEnabled()
        ? "No matches found."
        : "Google search needs GOOGLE_PLACES_API_KEY on Vercel (or VITE_GOOGLE_PLACES_API_KEY locally).")
  };
}

async function fetchPlaceDetailsDirect(placeId: string): Promise<Partial<Place> | null> {
  const key = apiKey();
  if (!key) return null;

  const id = normalizeGooglePlaceId(placeId);
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,photos,addressComponents,priceLevel"
    }
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
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

  const priceMap: Record<string, PriceTier> = {
    PRICE_LEVEL_INEXPENSIVE: "easy",
    PRICE_LEVEL_MODERATE: "treat",
    PRICE_LEVEL_EXPENSIVE: "splurge",
    PRICE_LEVEL_VERY_EXPENSIVE: "splurge"
  };

  return {
    name: data.displayName?.text ?? "Restaurant",
    area: locality || "Nearby",
    image,
    price: priceMap[data.priceLevel ?? ""] ?? "treat",
    tags: ["from Google"],
    bestFor: [],
    tip: "",
    caveat: data.formattedAddress ?? ""
  };
}

async function fetchPlaceDetailsViaApi(placeId: string): Promise<Partial<Place> | null> {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams({ placeId });
    const res = await fetch(`/api/places-details?${params.toString()}`);
    if (!res.ok) return null;
    return (await res.json()) as Partial<Place>;
  } catch {
    return null;
  }
}

export async function googleSuggestionToPlace(
  suggestion: GooglePlaceSuggestion,
  profileCity: string
): Promise<Place> {
  const details =
    (await fetchPlaceDetailsViaApi(suggestion.placeId)) ??
    (await fetchPlaceDetailsDirect(suggestion.placeId));

  let hash = 0;
  const name = details?.name ?? suggestion.name;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }

  return {
    id: `gplace-${suggestion.placeId.replace(/^places\//, "")}`,
    name,
    area: details?.area ?? suggestion.area,
    city: profileCity,
    price: details?.price ?? "treat",
    color: PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length],
    image: details?.image ?? DEFAULT_IMAGE,
    tags: details?.tags ?? ["from Google"],
    bestFor: details?.bestFor ?? [],
    tip: details?.tip ?? "",
    caveat: details?.caveat ?? suggestion.address,
    googlePlaceId: suggestion.placeId
  };
}
