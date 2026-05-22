import {
  DEMO_USER,
  DEMO_SAVED_PLACE_IDS,
  getDemoHomeFeed,
} from "@/lib/demo";
import { tryGetUser } from "@/lib/demo-server";
import { HomeFeedClient } from "./feed-client";
import type { FeedItem } from "./feed-client";

function demoHomeFeed() {
  const feedItems = getDemoHomeFeed();

  return (
    <HomeFeedClient
      feedItems={feedItems as FeedItem[]}
      savedPlaceIds={DEMO_SAVED_PLACE_IDS}
      currentUserId={DEMO_USER.id}
      isDemo
    />
  );
}

export default async function HomePage() {
  const user = await tryGetUser();

  if (!user) return demoHomeFeed();

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  // Get circle IDs (people the user follows)
  const { data: circleFollows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .eq("status", "active");

  const circleIds = (circleFollows || []).map((f) => f.following_id);

  const feedItems: FeedItem[] = [];

  // Fetch circle vouches
  if (circleIds.length > 0) {
    const { data } = await supabase
      .from("vouches")
      .select(
        `
        id, take, context_tags, created_at, user_id, place_id,
        profiles!vouches_user_id_fkey ( handle, display_name, avatar_url ),
        places!vouches_place_id_fkey ( id, name, area, cuisines, price_tier, cover_image_url )
      `
      )
      .in("user_id", circleIds)
      .order("created_at", { ascending: false })
      .limit(20);

    for (const row of data || []) {
      feedItems.push(mapVouchToFeedItem(row));
    }
  }

  // Fetch discover vouches (beyond circle)
  const excludeIds = [user.id, ...circleIds];
  const { data: discoverData } = await supabase
    .from("vouches")
    .select(
      `
      id, take, context_tags, created_at, user_id, place_id,
      profiles!vouches_user_id_fkey ( handle, display_name, avatar_url ),
      places!vouches_place_id_fkey ( id, name, area, cuisines, price_tier, cover_image_url )
    `
    )
    .not("user_id", "in", `(${excludeIds.join(",")})`)
    .order("created_at", { ascending: false })
    .limit(10);

  for (const row of discoverData || []) {
    feedItems.push(mapVouchToFeedItem(row));
  }

  // If authenticated user has no feed data, show demo feed so the app
  // feels alive rather than an empty screen
  if (feedItems.length === 0) {
    return demoHomeFeed();
  }

  // Sort by recency
  feedItems.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Get saved place IDs
  const { data: savedData } = await supabase
    .from("saved_places")
    .select("place_id")
    .eq("user_id", user.id);

  return (
    <HomeFeedClient
      feedItems={feedItems}
      savedPlaceIds={(savedData || []).map((s) => s.place_id)}
      currentUserId={user.id}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVouchToFeedItem(row: any): FeedItem {
  const profile = row.profiles;
  const place = row.places;
  const authorName = profile?.display_name || "Unknown";
  return {
    kind: "vouch",
    id: row.id,
    take: row.take,
    contextTags: row.context_tags || [],
    createdAt: row.created_at,
    authorHandle: profile?.handle || "unknown",
    authorName,
    authorAvatarUrl: profile?.avatar_url || null,
    authorId: row.user_id,
    placeId: place?.id || row.place_id,
    placeName: place?.name || "Unknown Place",
    placeArea: place?.area || "",
    placeCuisine: place?.cuisines?.[0] || "",
    placePrice: place?.price_tier ? "₹".repeat(place.price_tier) : "",
    placeImageUrl: place?.cover_image_url || null,
    reason: `Because ${authorName.split(" ")[0]} vouched`,
  };
}
