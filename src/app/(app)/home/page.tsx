import {
  isDemoMode,
  DEMO_USER,
  DEMO_SAVED_PLACE_IDS,
  getDemoCircleFeed,
  getDemoDiscoverFeed,
  getDemoTrendingPlaces,
} from "@/lib/demo";
import { HomeFeedClient } from "./feed-client";

export default async function HomePage() {
  // Demo mode
  if (isDemoMode()) {
    const trending = getDemoTrendingPlaces().map((p) => ({
      id: p.id,
      name: p.name,
      area: p.area,
      vouch_count: p.vouchCount,
    }));

    return (
      <HomeFeedClient
        circleFeed={getDemoCircleFeed()}
        discoverFeed={getDemoDiscoverFeed()}
        trending={trending}
        savedPlaceIds={DEMO_SAVED_PLACE_IDS}
        currentUserId={DEMO_USER.id}
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

  // Get people in the user's circle
  const { data: circleFollows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .eq("status", "active");

  const circleIds = (circleFollows || []).map((f) => f.following_id);

  // Circle feed: vouches from people you follow
  let circleFeed: FeedVouch[] = [];
  if (circleIds.length > 0) {
    const { data } = await supabase
      .from("vouches")
      .select(
        `
        id,
        take,
        context_tags,
        created_at,
        user_id,
        place_id,
        profiles!vouches_user_id_fkey ( handle, display_name, avatar_url ),
        places!vouches_place_id_fkey ( id, name, area )
      `
      )
      .in("user_id", circleIds)
      .order("created_at", { ascending: false })
      .limit(20);

    circleFeed = (data || []).map(mapVouch);
  }

  // Discover feed
  const excludeIds = [user.id, ...circleIds];
  const { data: discoverData } = await supabase
    .from("vouches")
    .select(
      `
      id,
      take,
      context_tags,
      created_at,
      user_id,
      place_id,
      profiles!vouches_user_id_fkey ( handle, display_name, avatar_url ),
      places!vouches_place_id_fkey ( id, name, area )
    `
    )
    .not("user_id", "in", `(${excludeIds.join(",")})`)
    .order("created_at", { ascending: false })
    .limit(20);

  const discoverFeed = (discoverData || []).map(mapVouch);

  // Trending places
  const { data: trendingData } = await supabase
    .from("places")
    .select("id, name, area, vouch_count")
    .order("vouch_count", { ascending: false })
    .gt("vouch_count", 0)
    .limit(8);

  // Saved places
  const { data: savedData } = await supabase
    .from("saved_places")
    .select("place_id")
    .eq("user_id", user.id);

  const savedPlaceIds = (savedData || []).map((s) => s.place_id);

  return (
    <HomeFeedClient
      circleFeed={circleFeed}
      discoverFeed={discoverFeed}
      trending={trendingData || []}
      savedPlaceIds={savedPlaceIds}
      currentUserId={user.id}
    />
  );
}

// Types
interface FeedVouch {
  id: string;
  take: string;
  contextTags: string[];
  createdAt: string;
  authorHandle: string;
  authorName: string;
  authorAvatarUrl: string | null;
  authorId: string;
  placeId: string;
  placeName: string;
  placeArea: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVouch(row: any): FeedVouch {
  const profile = row.profiles;
  const place = row.places;
  return {
    id: row.id,
    take: row.take,
    contextTags: row.context_tags || [],
    createdAt: row.created_at,
    authorHandle: profile?.handle || "unknown",
    authorName: profile?.display_name || "Unknown",
    authorAvatarUrl: profile?.avatar_url || null,
    authorId: row.user_id,
    placeId: place?.id || row.place_id,
    placeName: place?.name || "Unknown Place",
    placeArea: place?.area || "",
  };
}
