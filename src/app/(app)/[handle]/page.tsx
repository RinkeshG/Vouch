import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get profile by handle
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .single();

  if (!profile) {
    notFound();
  }

  const isOwnProfile = profile.id === user.id;

  // Get vouches
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

  // Get lists count
  const { count: listCount } = await supabase
    .from("lists")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id);

  // Get follower/following counts
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

  // Check if current user follows this profile
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

  // Get saved places for bookmark state
  const { data: savedData } = await supabase
    .from("saved_places")
    .select("place_id")
    .eq("user_id", user.id);

  const savedPlaceIds = (savedData || []).map((s) => s.place_id);

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
        listCount: listCount || 0,
      }}
      vouches={vouches}
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}
      savedPlaceIds={savedPlaceIds}
      currentUserId={user.id}
    />
  );
}
