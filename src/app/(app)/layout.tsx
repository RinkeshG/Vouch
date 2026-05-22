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
    // Auth check failed — fall through as unauthenticated
  }

  if (!user) {
    return (
      <AppShellClient isAuthed={false}>
        {children}
      </AppShellClient>
    );
  }

  // Authenticated — fetch just the profile basics for the shell
  let handle: string | null = null;
  let displayName: string | null = null;
  let avatarUrl: string | null = null;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
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
  } catch {
    // Profile fetch failed — shell will show fallback avatar
  }

  return (
    <AppShellClient
      isAuthed={true}
      handle={handle}
      displayName={displayName}
      avatarUrl={avatarUrl}
    >
      {children}
    </AppShellClient>
  );
}
