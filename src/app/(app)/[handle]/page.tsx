import { type Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DEMO_USER,
  DEMO_SAVED_PLACE_IDS,
  DEMO_PLACES,
  getDemoProfile,
  getDemoProfileVouches,
} from "@/lib/demo";
import { tryGetUser } from "@/lib/demo-server";
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
  const user = await tryGetUser();

  // Demo mode
  if (!user) {
    const profile = getDemoProfile(handle);
    if (!profile) notFound();

    const isOwnProfile = profile.id === DEMO_USER.id;
    const placeMap = new Map(DEMO_PLACES.map((p) => [p.id, p]));
    const vouches = getDemoProfileVouches(profile.id).map((v) => {
      const place = placeMap.get(v.placeId);
      return {
        id: v.id,
        take: v.take,
        contextTags: v.contextTags,
        createdAt: v.createdAt,
        placeId: v.placeId,
        placeName: v.placeName,
        placeArea: v.placeArea,
        placeCuisine: place?.cuisines?.[0] || "",
        placeImageUrl: place?.coverImageUrl || null,
      };
    });

    return (
      <ProfileClient
        profile={{
          id: profile.id,
          handle: profile.handle,
          displayName: profile.displayName,
          bio: profile.bio,
          tasteLine: profile.tasteLine || null,
          avatarUrl: profile.avatarUrl,
          avatarTint: profile.avatarTint,
          isPublic: profile.isPublic,
          vouchCount: profile.vouchCount,
          followerCount: profile.followerCount,
          followingCount: profile.followingCount,
          listCount: profile.listCount,
          city: "city" in profile ? String(profile.city) : "Bangalore",
        }}
        vouches={vouches}
        isOwnProfile={isOwnProfile}
        isFollowing={!isOwnProfile}
        savedPlaceIds={DEMO_SAVED_PLACE_IDS}
        currentUserId={DEMO_USER.id}
        isDemo
      />
    );
  }

  // Production
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .single();

  if (!profile) notFound();

  const isOwnProfile = profile.id === user.id;

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
        listCount: 0,
        city: profile.city ? String(profile.city).charAt(0).toUpperCase() + String(profile.city).slice(1) : "Bangalore",
      }}
      vouches={vouches}
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}
      savedPlaceIds={(savedData || []).map((s) => s.place_id)}
      currentUserId={user.id}
    />
  );
}
