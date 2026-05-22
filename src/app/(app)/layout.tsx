import { AppShellClient } from "./shell-client";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  let handle: string | null = null;
  let displayName: string | null = null;
  let avatarUrl: string | null = null;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("handle, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        handle = profile.handle;
        displayName = profile.display_name;
        avatarUrl = profile.avatar_url;
      }
    }
  } catch {
    // Auth or profile fetch failed — fall through as unauthenticated
  }

  return (
    <AppShellClient
      isAuthed={!!user}
      handle={handle}
      displayName={displayName}
      avatarUrl={avatarUrl}
    >
      {children}
    </AppShellClient>
  );
}
