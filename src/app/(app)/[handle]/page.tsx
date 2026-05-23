import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";
import { DEV_PROFILE, DEV_PROFILE_LISTS, DEV_TASTE_SIGNALS } from "@/lib/dev-seed";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;

  return {
    title: `@${handle} — Vouch`,
    description: `See ${handle}'s curated lists on Vouch.`,
    openGraph: {
      title: `@${handle} on Vouch`,
      description: `Curated lists by ${handle} — built on Vouch.`,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `@${handle} on Vouch`,
      description: `Curated lists by ${handle}.`,
    },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, handle, display_name, bio, avatar_url, avatar_tint, city")
    .eq("handle", handle)
    .maybeSingle();

  if (!profile) {
    if (process.env.NODE_ENV === "development") {
      return (
        <ProfileClient
          profile={{ ...DEV_PROFILE, handle }}
          lists={DEV_PROFILE_LISTS}
          isOwnProfile={true}
          tasteSignals={DEV_TASTE_SIGNALS}
        />
      );
    }
    console.error("Profile not found:", handle, profileError?.message);
    notFound();
  }

  // Fetch lists with the V1 columns
  const { data: listsData } = await supabase
    .from("lists")
    .select("id, title, description, slug, emoji, cover_style, place_count, is_published")
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false });

  const isOwnProfile = user?.id === profile.id;

  // Fetch hero photo for each list
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

  // Fetch all places across all lists for taste signals
  const { data: placesData } = listIds.length > 0
    ? await supabase
        .from("list_places")
        .select("places!list_places_place_id_fkey ( area, cuisines, photo_reference )")
        .in("list_id", listIds)
    : { data: [] };

  // Derive taste signals
  const neighborhoods: Record<string, number> = {};
  const cuisineMap: Record<string, number> = {};
  const placePhotos: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (placesData || []).forEach((lp: any) => {
    const place = lp.places;
    if (!place) return;
    const area = place.area?.split(",")[0]?.trim();
    if (area) neighborhoods[area] = (neighborhoods[area] || 0) + 1;
    if (place.cuisines) {
      (Array.isArray(place.cuisines) ? place.cuisines : []).forEach((c: string) => {
        const name = c.replace(/_/g, " ");
        cuisineMap[name] = (cuisineMap[name] || 0) + 1;
      });
    }
    if (place.photo_reference) placePhotos.push(place.photo_reference);
  });

  const topNeighborhoods = Object.entries(neighborhoods)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const topCuisines = Object.entries(cuisineMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const totalPlaceCount = (placesData || []).length;

  // mosaic photos for cover (up to 6)
  const mosaicPhotos = placePhotos.slice(0, 6);

  const lists = (listsData || []).map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    emoji: l.emoji,
    description: l.description,
    placeCount: l.place_count,
    coverStyle: l.cover_style,
    isPublished: l.is_published,
    heroPhotoRef: heroPhotoMap.get(l.id) || null,
  }));

  return (
    <ProfileClient
      profile={{
        id: profile.id,
        handle: profile.handle,
        displayName: profile.display_name,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        avatarTint: profile.avatar_tint,
        listCount: lists.length,
        city: profile.city
          ? String(profile.city).charAt(0).toUpperCase() + String(profile.city).slice(1)
          : "Bangalore",
      }}
      lists={lists}
      isOwnProfile={isOwnProfile}
      tasteSignals={{
        topNeighborhoods,
        topCuisines,
        totalPlaceCount,
        mosaicPhotos,
      }}
    />
  );
}
