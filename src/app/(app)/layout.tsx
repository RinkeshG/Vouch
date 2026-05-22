import { AppShellClient } from "./shell-client";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Auth check failed — fall through
  }

  // Not authenticated — minimal shell for public pages (e.g. /[handle])
  if (!user) {
    return (
      <AppShellClient
        handle="user"
        displayName="User"
        avatarUrl={null}
        suggestedPeople={[]}
        trendingPlaces={[]}
      >
        {children}
      </AppShellClient>
    );
  }

  // Authenticated — get profile and sidebar data
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("handle, display_name, avatar_url, avatar_tint, onboarding_step")
      .eq("id", user.id)
      .single();

    const handle = profile?.handle || "user";
    const displayName = profile?.display_name || "User";
    const avatarUrl = profile?.avatar_url || null;

    // Fetch suggested people (exclude self, exclude already-followed)
    const { data: followingIds } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .eq("status", "active");

    const excludeIds = [user.id, ...(followingIds || []).map((f) => f.following_id)];

    const { data: suggestedPeople } = await supabase
      .from("profiles")
      .select("id, handle, display_name, avatar_url")
      .eq("is_public", true)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: trendingPlaces } = await supabase
      .from("places")
      .select("id, name, area, cuisines, vouch_count")
      .order("vouch_count", { ascending: false })
      .gt("vouch_count", 0)
      .limit(3);

    // Get user's vouch count for progress widget
    const { count: vouchCount } = await supabase
      .from("vouches")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    return (
      <AppShellClient
        handle={handle}
        displayName={displayName}
        avatarUrl={avatarUrl}
        currentUserId={user.id}
        vouchCount={vouchCount || 0}
        suggestedPeople={(suggestedPeople || []).map((p) => ({
          ...p,
          vouch_count: 0,
        }))}
        trendingPlaces={trendingPlaces || []}
      >
        {children}
      </AppShellClient>
    );
  } catch {
    return (
      <AppShellClient
        handle="user"
        displayName="User"
        avatarUrl={null}
        currentUserId={user.id}
        suggestedPeople={[]}
        trendingPlaces={[]}
      >
        {children}
      </AppShellClient>
    );
  }
}
