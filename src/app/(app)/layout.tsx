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
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return <DemoShell>{children}</DemoShell>;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("handle, display_name, avatar_url, avatar_tint, onboarding_step")
      .eq("id", user.id)
      .single();

    if (!profile || profile.onboarding_step < 4) {
      return <DemoShell>{children}</DemoShell>;
    }

    const { data: suggestedPeople } = await supabase
      .from("profiles")
      .select("id, handle, display_name, avatar_url, vouch_count")
      .eq("is_public", true)
      .neq("id", user.id)
      .order("vouch_count", { ascending: false })
      .limit(3);

    const { data: trendingPlaces } = await supabase
      .from("places")
      .select("id, name, area, vouch_count")
      .order("vouch_count", { ascending: false })
      .gt("vouch_count", 0)
      .limit(3);

    return (
      <AppShellClient
        handle={profile.handle}
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        suggestedPeople={suggestedPeople || []}
        trendingPlaces={trendingPlaces || []}
      >
        {children}
      </AppShellClient>
    );
  } catch {
    return <DemoShell>{children}</DemoShell>;
  }
}
