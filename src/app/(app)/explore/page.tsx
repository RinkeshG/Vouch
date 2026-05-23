import { createClient } from "@/lib/supabase/server";
import { ExploreClient } from "./explore-client";
import { DEV_LISTS } from "@/lib/dev-seed";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore — Vouch",
  description: "Browse curated lists of favorite places in Bangalore.",
};

export default async function ExplorePage() {
  const supabase = await createClient();

  // Check if user is authenticated for CTA logic
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthed = !!user;

  const { data: listsData } = await supabase
    .from("lists")
    .select(
      `
      id, title, description, slug, emoji, cover_style, place_count, created_at,
      profiles ( handle, display_name, avatar_url )
    `
    )
    .eq("is_published", true)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(12);

  // Fetch hero photo for each list (first place's photo_reference)
  const listIds = (listsData || []).map((l: { id: string }) => l.id);
  const { data: heroPhotos } = listIds.length > 0
    ? await supabase
        .from("list_places")
        .select("list_id, places ( photo_reference )")
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
    createdAt: l.created_at,
    authorHandle: l.profiles?.handle || "user",
    authorName: l.profiles?.display_name || "User",
    authorAvatarUrl: l.profiles?.avatar_url || null,
    heroPhotoRef: heroPhotoMap.get(l.id) || null,
    isPublished: true,
    saveCount: 0,
    isHot: false,
  }));

  // Dev mode: use seed data when database is empty
  const finalLists = lists.length > 0 ? lists : (process.env.NODE_ENV === "development" ? DEV_LISTS : []);

  return <ExploreClient initialLists={finalLists} isAuthed={isAuthed} />;
}
