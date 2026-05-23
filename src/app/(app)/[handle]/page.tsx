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
    />
  );
}
