import {
  DEMO_USER,
  isSupabaseMissing,
  getDemoSuggestedPeople,
  getDemoPopularPlaces,
} from "@/lib/demo";
import { AppShellClient } from "./shell-client";

export const dynamic = "force-dynamic";

function DemoShell({ children }: { children: React.ReactNode }) {
  const suggestedPeople = getDemoSuggestedPeople().map((p) => ({
    id: p.id,
    handle: p.handle,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    vouch_count: p.vouch_count,
  }));

  const trendingPlaces = getDemoPopularPlaces().slice(0, 3).map((p) => ({
    id: p.id,
    name: p.name,
    area: p.area,
    cuisines: p.cuisines,
    vouch_count: p.vouch_count,
  }));

  return (
    <AppShellClient
      handle={DEMO_USER.handle}
      displayName={DEMO_USER.displayName}
      avatarUrl={DEMO_USER.avatarUrl}
      isDemo
      suggestedPeople={suggestedPeople}
      trendingPlaces={trendingPlaces}
    >
      {children}
    </AppShellClient>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If Supabase isn't configured, serve demo mode
  if (isSupabaseMissing()) {
    return <DemoShell>{children}</DemoShell>;
  }

  // Supabase is configured — try to authenticate
  let user = null;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Auth check failed (rate limited, network) — fall through
  }

  // Not authenticated → demo mode
  if (!user) {
    return <DemoShell>{children}</DemoShell>;
  }

  // Authenticated — get profile (separate try/catch so auth errors don't cascade)
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("handle, display_name, avatar_url, avatar_tint, onboarding_step")
      .eq("id", user.id)
      .single();

    // If profile doesn't exist yet or onboarding incomplete,
    // still show real shell (not demo) with fallback values
    const handle = profile?.handle || "user";
    const displayName = profile?.display_name || "User";
    const avatarUrl = profile?.avatar_url || null;

    // Fetch sidebar data — these are non-critical, failures are fine
    const { data: suggestedPeople } = await supabase
      .from("profiles")
      .select("id, handle, display_name, avatar_url")
      .eq("is_public", true)
      .neq("id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    const { data: trendingPlaces } = await supabase
      .from("places")
      .select("id, name, area, cuisines, vouch_count")
      .order("vouch_count", { ascending: false })
      .gt("vouch_count", 0)
      .limit(3);

    return (
      <AppShellClient
        handle={handle}
        displayName={displayName}
        avatarUrl={avatarUrl}
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
    // Profile/sidebar queries failed but user IS authenticated
    // Show real shell with fallback values — never dump back to demo
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
}
