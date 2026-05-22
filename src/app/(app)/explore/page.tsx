import { createClient } from "@/lib/supabase/server";
import { ExploreClient } from "./explore-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore — Vouch",
  description: "Browse curated lists of favorite places in Bangalore.",
};

export default async function ExplorePage() {
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
    .limit(12);

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
  }));

  return <ExploreClient initialLists={lists} />;
}
