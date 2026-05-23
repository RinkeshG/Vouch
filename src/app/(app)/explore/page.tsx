import { createClient } from "@/lib/supabase/server";
import { ExploreClient } from "./explore-client";

export const metadata = {
  title: "Explore — Vouch",
  description: "Browse curated lists of favorite places in Bangalore.",
};

export default async function ExplorePage() {
  const supabase = await createClient();

  // Fetch auth status and public lists in parallel (independent queries)
  const [{ data: { user } }, { data: listsData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("lists")
      .select(
        `
      id, title, description, slug, emoji, cover_style, place_count, save_count, created_at,
      profiles!lists_user_id_fkey ( handle, display_name, avatar_url )
    `
      )
      .eq("is_published", true)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);
  const isAuthed = !!user;

  // Fetch first 3 places for each list for card preview
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listIds = (listsData || []).map((l: any) => l.id as string);

  let placesMap: Record<string, { name: string; area: string }[]> = {};

  if (listIds.length > 0) {
    const { data: placesData } = await supabase
      .from("list_places")
      .select("list_id, position, places(name, area)")
      .in("list_id", listIds)
      .order("position", { ascending: true })
      .limit(3 * listIds.length);

    // Group by list_id, keep first 3 per list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of (placesData || []) as any[]) {
      const lid = row.list_id as string;
      if (!placesMap[lid]) placesMap[lid] = [];
      if (placesMap[lid].length < 3) {
        const p = row.places;
        if (p) {
          placesMap[lid].push({
            name: p.name || "Untitled",
            area: p.area || "",
          });
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lists = (listsData || []).map((l: any) => ({
    id: l.id,
    title: l.title,
    description: l.description,
    slug: l.slug,
    emoji: l.emoji,
    coverStyle: l.cover_style,
    placeCount: l.place_count,
    saveCount: l.save_count ?? 0,
    createdAt: l.created_at,
    authorHandle: l.profiles?.handle || "user",
    authorName: l.profiles?.display_name || "User",
    authorAvatarUrl: l.profiles?.avatar_url || null,
    previewPlaces: placesMap[l.id] || [],
  }));

  // Identify featured list: most places OR highest save_count, at least 5 places
  const eligibleForFeatured = lists.filter((l) => l.placeCount >= 5);
  let featured: (typeof lists)[number] | null = null;
  if (eligibleForFeatured.length > 0) {
    featured = eligibleForFeatured.reduce((best, curr) => {
      const bestScore = best.placeCount + best.saveCount * 2;
      const currScore = curr.placeCount + curr.saveCount * 2;
      return currScore > bestScore ? curr : best;
    });
  }

  // Remove featured from regular list to avoid duplication
  const regularLists = featured
    ? lists.filter((l) => l.id !== featured!.id)
    : lists;

  return (
    <ExploreClient
      initialLists={regularLists}
      featured={featured}
      isAuthed={isAuthed}
    />
  );
}
