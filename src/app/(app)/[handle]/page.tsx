import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const ogImageUrl = `/api/og/four-card/${handle}`;

  return {
    title: `@${handle} — Vouch`,
    description: `See ${handle}'s Four Vouches — the places they'd stake their reputation on.`,
    openGraph: {
      title: `@${handle}'s Four Vouches`,
      description: `The places ${handle} stakes their reputation on. Built on Vouch — trust, not strangers.`,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `@${handle}'s Four Vouches`,
      description: `The places ${handle} stakes their reputation on.`,
      images: [ogImageUrl],
    },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile — public profiles are readable by all (RLS policy)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .single();

  if (!profile) notFound();

  // Fetch vouches (public data)
  const { data: vouchesData } = await supabase
    .from("vouches")
    .select(
      `
      id, take, context_tags, created_at, user_id, place_id,
      places!vouches_place_id_fkey ( id, name, area, cuisines, cover_image_url )
    `
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vouches = (vouchesData || []).map((v: any) => ({
    id: v.id,
    take: v.take,
    contextTags: v.context_tags || [],
    createdAt: v.created_at,
    placeId: v.places?.id || v.place_id,
    placeName: v.places?.name || "Unknown",
    placeArea: v.places?.area || "",
    placeCuisine: v.places?.cuisines?.[0] || "",
    placeImageUrl: v.places?.cover_image_url || null,
  }));

  // Follower/following counts (public data)
  const { count: followerCount } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("following_id", profile.id)
    .eq("status", "active");

  const { count: followingCount } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("follower_id", profile.id)
    .eq("status", "active");

  // Fetch user's lists (public data)
  const { data: listsData } = await supabase
    .from("lists")
    .select("id, title, description, is_public, created_at, updated_at")
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false });

  const listsWithCounts = await Promise.all(
    (listsData || []).map(async (list) => {
      const { count } = await supabase
        .from("list_places")
        .select("id", { count: "exact", head: true })
        .eq("list_id", list.id);
      return {
        id: list.id,
        title: list.title,
        description: list.description,
        placeCount: count || 0,
        updatedAt: list.updated_at,
      };
    })
  );

  // If no authenticated user, show public view without follow/saved data
  if (!user) {
    return (
      <ProfileClient
        profile={{
          id: profile.id,
          handle: profile.handle,
          displayName: profile.display_name,
          bio: profile.bio,
          tasteLine: profile.taste_line,
          avatarUrl: profile.avatar_url,
          avatarTint: profile.avatar_tint,
          isPublic: profile.is_public,
          vouchCount: vouches.length,
          followerCount: followerCount || 0,
          followingCount: followingCount || 0,
          listCount: listsWithCounts.length,
          city: profile.city ? String(profile.city).charAt(0).toUpperCase() + String(profile.city).slice(1) : "Bangalore",
        }}
        vouches={vouches}
        isOwnProfile={false}
        isFollowing={false}
        savedPlaceIds={[]}
        currentUserId=""
        lists={listsWithCounts}
      />
    );
  }

  // Authenticated — get follow/saved state
  const isOwnProfile = profile.id === user.id;

  let isFollowing = false;
  if (!isOwnProfile) {
    const { data: followData } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .eq("status", "active")
      .maybeSingle();
    isFollowing = !!followData;
  }

  const { data: savedData } = await supabase
    .from("saved_places")
    .select("place_id")
    .eq("user_id", user.id);

  return (
    <ProfileClient
      profile={{
        id: profile.id,
        handle: profile.handle,
        displayName: profile.display_name,
        bio: profile.bio,
        tasteLine: profile.taste_line,
        avatarUrl: profile.avatar_url,
        avatarTint: profile.avatar_tint,
        isPublic: profile.is_public,
        vouchCount: vouches.length,
        followerCount: followerCount || 0,
        followingCount: followingCount || 0,
        listCount: listsWithCounts.length,
        city: profile.city ? String(profile.city).charAt(0).toUpperCase() + String(profile.city).slice(1) : "Bangalore",
      }}
      vouches={vouches}
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}
      savedPlaceIds={(savedData || []).map((s) => s.place_id)}
      currentUserId={user.id}
      lists={listsWithCounts}
    />
  );
}
