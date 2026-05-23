import { createClient } from "@/lib/supabase/server";
import { LandingClient } from "./landing-client";

export default async function LandingPage() {
  const supabase = await createClient();

  const { data: listsData } = await supabase
    .from("lists")
    .select(
      `
      id, title, description, slug, emoji, cover_style, place_count, created_at,
      profiles!lists_user_id_fkey ( handle, display_name, avatar_url )
    `
    )
    .eq("is_published", true)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(6);

  // Fetch hero photos for these lists
  const listIds = (listsData || []).map((l: { id: string }) => l.id);
  const { data: heroPhotos } = listIds.length > 0
    ? await supabase
        .from("list_places")
        .select("list_id, places!list_places_place_id_fkey ( photo_reference )")
        .in("list_id", listIds)
        .eq("position", 0)
    : { data: [] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heroPhotoMap = new Map<string, string | null>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (heroPhotos || []).forEach((hp: any) => {
    heroPhotoMap.set(hp.list_id, hp.places?.photo_reference || null);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lists = (listsData || []).map((l: any) => ({
    id: l.id,
    title: l.title,
    description: l.description,
    slug: l.slug,
    emoji: l.emoji,
    coverStyle: l.cover_style,
    placeCount: l.place_count,
    authorHandle: l.profiles?.handle || "user",
    authorName: l.profiles?.display_name || "User",
    authorAvatarUrl: l.profiles?.avatar_url || null,
    heroPhotoRef: heroPhotoMap.get(l.id) || null,
  }));

  return <LandingClient lists={lists} />;
}
