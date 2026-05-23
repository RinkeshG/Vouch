import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";

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

  // Fetch auth user and profile in parallel
  const [{ data: { user } }, { data: profile, error: profileError }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("profiles")
      .select("id, handle, display_name, bio, avatar_url, avatar_tint, city")
      .eq("handle", handle)
      .maybeSingle(),
  ]);

  if (!profile) {
    console.error("Profile not found:", handle, profileError?.message);
    notFound();
  }

  // Fetch lists with the V1 columns (depends on profile.id)
  const { data: listsData } = await supabase
    .from("lists")
    .select("id, title, description, slug, emoji, cover_style, place_count, save_count, is_published")
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false });

  const isOwnProfile = user?.id === profile.id;

  // Fetch preview places (first 3 per list)
  const listIds = (listsData || []).map((l) => l.id);
  let previewMap: Record<string, { name: string; area: string }[]> = {};

  if (listIds.length > 0) {
    const { data: placesData } = await supabase
      .from("list_places")
      .select("list_id, position, places(name, area)")
      .in("list_id", listIds)
      .order("position", { ascending: true });

    // Group by list_id, take first 3
    const grouped: Record<string, { name: string; area: string }[]> = {};
    for (const row of placesData || []) {
      const lid = row.list_id;
      if (!grouped[lid]) grouped[lid] = [];
      const place = row.places as unknown as { name: string; area: string } | null;
      if (place && grouped[lid].length < 3) {
        grouped[lid].push({ name: place.name || "", area: place.area || "" });
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
    coverStyle: l.cover_style,
    isPublished: l.is_published,
    previewPlaces: previewMap[l.id] || [],
  }));

  // Fetch saved lists for own profile
  let savedLists: {
    id: string;
    title: string;
    slug: string;
    emoji: string | null;
    coverStyle: number;
    placeCount: number;
    saveCount: number;
    authorHandle: string;
    authorName: string;
  }[] = [];

  if (isOwnProfile && user) {
    const { data: savedData } = await supabase
      .from("list_saves")
      .select(`
        list_id,
        lists!list_saves_list_id_fkey (
          id, title, slug, emoji, cover_style, place_count, save_count,
          profiles!lists_user_id_fkey ( handle, display_name, avatar_url )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    savedLists = (savedData || [])
      .map((row) => {
        const list = row.lists as unknown as {
          id: string;
          title: string;
          slug: string;
          emoji: string | null;
          cover_style: number;
          place_count: number;
          save_count: number;
          profiles: { handle: string; display_name: string; avatar_url: string | null };
        } | null;
        if (!list) return null;
        return {
          id: list.id,
          title: list.title,
          slug: list.slug,
          emoji: list.emoji,
          coverStyle: list.cover_style,
          placeCount: list.place_count,
          saveCount: list.save_count ?? 0,
          authorHandle: list.profiles.handle,
          authorName: list.profiles.display_name,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

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
      savedLists={savedLists}
    />
  );
}
