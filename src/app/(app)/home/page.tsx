import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "./home-client";
import { DEV_HOME_LISTS } from "@/lib/dev-seed";

export const metadata: Metadata = {
  title: "Home — Vouch",
};

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (process.env.NODE_ENV === "development") {
      const totalPlaces = DEV_HOME_LISTS.reduce((sum, l) => sum + l.placeCount, 0);
      return (
        <HomeClient
          handle="priya"
          displayName="Priya Sharma"
          lists={DEV_HOME_LISTS}
          totalPlaces={totalPlaces}
        />
      );
    }
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
    .select("id, title, description, slug, emoji, cover_style, place_count, is_published, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // Fetch hero photo for each list (first place's photo)
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

  const lists = (listsData || []).map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    emoji: l.emoji,
    description: l.description,
    placeCount: l.place_count,
    coverStyle: l.cover_style,
    isPublished: l.is_published,
    updatedAt: l.updated_at,
    heroPhotoRef: heroPhotoMap.get(l.id) || null,
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
