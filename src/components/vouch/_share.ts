/* Cross-device guide sharing (prototype, no auth). A shared guide is a public
   artifact addressable by slug, stored in Supabase `shared_guides` so a link opens
   on ANY device — fixing the localStorage-only share. Real ownership/auth later. */
import type { GuideItem } from "./_guides";

export type SharedGuide = { slug: string; title: string; by: string; note?: string; anchor?: string; items: GuideItem[] };

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const headers = () => ({ apikey: KEY ?? "", Authorization: `Bearer ${KEY ?? ""}`, "Content-Type": "application/json" });

export async function publishGuide(g: SharedGuide): Promise<boolean> {
  if (!URL || !KEY) return false;
  try {
    const res = await fetch(`${URL}/rest/v1/shared_guides?on_conflict=slug`, {
      method: "POST",
      headers: { ...headers(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ slug: g.slug, title: g.title, by: g.by, note: g.note ?? null, anchor: g.anchor ?? null, items: g.items, updated_at: new Date().toISOString() }),
    });
    return res.ok;
  } catch { return false; }
}

export async function getSharedGuide(slug: string): Promise<SharedGuide | null> {
  if (!URL || !KEY) return null;
  try {
    const res = await fetch(`${URL}/rest/v1/shared_guides?slug=eq.${encodeURIComponent(slug)}&select=slug,title,by,note,anchor,items&limit=1`, { headers: headers() });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] ?? null;
  } catch { return null; }
}
