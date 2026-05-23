import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "./home-client";

export const metadata: Metadata = {
  title: "Home — Vouch",
};

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-up");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch ALL lists (published + drafts) for the owner
  const { data: listsData } = await supabase
    .from("lists")
    .select("id, title, description, slug, emoji, cover_style, place_count, save_count, is_published, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // Fetch preview places (first 3 per list)
  const listIds = (listsData || []).map((l) => l.id);
  let previewMap: Record<string, { name: string; area: string | null }[]> = {};

  if (listIds.length > 0) {
    const { data: placesData } = await supabase
      .from("list_places")
      .select("list_id, position, places(name, area)")
      .in("list_id", listIds)
      .order("position", { ascending: true });

    // Group by list_id and take first 3
    const grouped: Record<string, { name: string; area: string | null }[]> = {};
    for (const row of placesData || []) {
      const lid = row.list_id as string;
      if (!grouped[lid]) grouped[lid] = [];
      const place = row.places as unknown as { name: string; area: string | null } | null;
      if (place && grouped[lid].length < 3) {
        grouped[lid].push({ name: place.name, area: place.area });
      }
    }
    previewMap = grouped;
  }

  const lists = (listsData || []).map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    emoji: l.emoji,
    description: l.description,
    placeCount: l.place_count,
    saveCount: l.save_count ?? 0,
    coverStyle: l.cover_style ?? 0,
    isPublished: l.is_published,
    updatedAt: l.updated_at,
    previewPlaces: previewMap[l.id] || [],
  }));

  const totalPlaces = lists.reduce((sum, l) => sum + l.placeCount, 0);

  return (
    <HomeClient
      handle={profile?.handle ?? null}
      displayName={profile?.display_name ?? null}
      lists={lists}
      totalPlaces={totalPlaces}
    />
  );
}
