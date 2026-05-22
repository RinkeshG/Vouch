import { notFound } from "next/navigation";
import {
  isDemoMode,
  DEMO_USER,
  DEMO_SAVED_PLACE_IDS,
  getDemoProfile,
  getDemoProfileVouches,
} from "@/lib/demo";
import { ProfileClient } from "./profile-client";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { handle } = await params;

  // Demo mode
  if (isDemoMode()) {
    const profile = getDemoProfile(handle);
    if (!profile) notFound();

    const isOwnProfile = profile.id === DEMO_USER.id;
    const vouches = getDemoProfileVouches(profile.id).map((v) => ({
      id: v.id,
      take: v.take,
      contextTags: v.contextTags,
      createdAt: v.createdAt,
      placeId: v.placeId,
      placeName: v.placeName,
      placeArea: v.placeArea,
    }));

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

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
      id,
      take,
      context_tags,
      created_at,
      user_id,
      place_id,
      places!vouches_place_id_fkey ( id, name, area )
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
      }}
      vouches={vouches}
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}
      savedPlaceIds={(savedData || []).map((s) => s.place_id)}
      currentUserId={user.id}
    />
  );
}
