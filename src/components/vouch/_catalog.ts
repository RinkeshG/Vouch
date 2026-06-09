/* The real Bengaluru catalog — read from Supabase (the vouchweb `places` table,
   150+ spots) via PostgREST directly (no SDK, to stay light under Turbopack).
   Read-only, anon, public-read RLS. This is the discoverable supply; the user's own
   vouches stay local (_me) until auth. */
import { slugify } from "./_guides";
import { SEED } from "./_taste";

export type CatalogSpot = {
  slug: string; name: string; area: string; cuisine: string; price: string;
  lat: number | null; lng: number | null; cuisines: string[];
};

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PRICE = ["", "₹", "₹₹", "₹₹₹", "₹₹₹₹"];

/* Resilience: if Supabase is unconfigured / unreachable / empty, fall back to the
   curated SEED set so search is never dead. The product must work with zero
   backend (Constitution: lovable with no network). */
function seedCatalog(): CatalogSpot[] {
  return SEED.map((s) => ({ slug: slugify(s.name), name: s.name, area: s.area, cuisine: s.cuisine, price: s.price, lat: s.lat, lng: s.lng, cuisines: [s.cuisine.toLowerCase()] }));
}

/* The catalog is partly dirty (bulk Google-Maps import): ~88% of rows have a Maps URL
   in `area` and no `cuisines`. The UI must never trust those columns raw — a URL is
   not a neighbourhood. Sanitise at the boundary so the rest of the app is clean. */
export function cleanArea(a: unknown): string {
  if (typeof a !== "string") return "Bengaluru";
  const s = a.trim();
  if (!s || /^https?:\/\//i.test(s) || s.includes("/") || s.length > 42) return "Bengaluru";
  return s;
}
function cuisineFor(cuisines: string[], name: string): string {
  if (cuisines[0]) return cuisines[0].replace(/\b\w/g, (c) => c.toUpperCase());
  const n = (name || "").toLowerCase();
  if (/coffee|roastery|espresso|caf[eé]|barista/.test(n)) return "Coffee";
  if (/cocktail|\bbar\b|brew|pub|taproom|distill/.test(n)) return "Bar & drinks";
  if (/bakery|patisserie|boulangerie|bake/.test(n)) return "Bakery";
  if (/pizza|pizzeria|trattoria|pasta/.test(n)) return "Italian";
  if (/biryani|darshini|military hotel|tiffin|mess|udupi|sagar/.test(n)) return "South Indian";
  if (/ramen|sushi|izakaya|noodle|asian|thai|wok/.test(n)) return "Asian";
  if (/dessert|ice cream|gelato|patiss/.test(n)) return "Dessert";
  return "Restaurant";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(r: any): CatalogSpot {
  const cuisines: string[] = Array.isArray(r.cuisines) ? r.cuisines : [];
  return {
    slug: slugify(r.name), name: r.name, area: cleanArea(r.area),
    cuisine: cuisineFor(cuisines, r.name), price: PRICE[r.price_tier] ?? "₹₹",
    lat: r.latitude ?? null, lng: r.longitude ?? null, cuisines,
  };
}

let cache: CatalogSpot[] | null = null;
export async function loadCatalog(): Promise<CatalogSpot[]> {
  if (cache) return cache;
  if (!URL || !KEY) return [];
  try {
    const res = await fetch(`${URL}/rest/v1/places?select=name,area,cuisines,price_tier,latitude,longitude&order=vouch_count.desc.nullslast&limit=600`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    if (!res.ok) return [];
    const rows = await res.json();
    cache = (rows as unknown[]).map(mapRow);
    return cache;
  } catch { return []; }
}

export async function searchCatalog(q: string): Promise<CatalogSpot[]> {
  const live = await loadCatalog();
  const all = live.length ? live : seedCatalog();
  if (!q.trim()) return all.slice(0, 40);
  const t = q.toLowerCase();
  return all.filter((s) => (s.name + " " + s.area + " " + s.cuisines.join(" ")).toLowerCase().includes(t)).slice(0, 40);
}

export async function getCatalogSpot(slug: string): Promise<CatalogSpot | null> {
  const live = await loadCatalog();
  const all = live.length ? live : seedCatalog();
  return all.find((s) => s.slug === slug) ?? null;
}
