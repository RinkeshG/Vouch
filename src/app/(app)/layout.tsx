import { DEMO_USER, isSupabaseMissing } from "@/lib/demo";
import { AppShellClient } from "./shell-client";
import styles from "./app.module.css";

export const dynamic = "force-dynamic";

function DemoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <AppShellClient
        handle={DEMO_USER.handle}
        displayName={DEMO_USER.displayName}
        avatarUrl={DEMO_USER.avatarUrl}
        isDemo
      />
      <main className={styles.main}>{children}</main>
    </div>
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

    // Not logged in → serve demo mode (don't redirect to sign-in)
    if (!user) {
      return <DemoShell>{children}</DemoShell>;
    }

    // Get profile for the nav
    const { data: profile } = await supabase
      .from("profiles")
      .select("handle, display_name, avatar_url, avatar_tint, onboarding_step")
      .eq("id", user.id)
      .single();

    // If onboarding not complete, show demo mode too
    // (they can still reach /onboarding via the auth routes)
    if (!profile || profile.onboarding_step < 4) {
      return <DemoShell>{children}</DemoShell>;
    }

    // Fully authenticated + onboarded → real app
    return (
      <div className={styles.shell}>
        <AppShellClient
          handle={profile.handle}
          displayName={profile.display_name}
          avatarUrl={profile.avatar_url}
        />
        <main className={styles.main}>{children}</main>
      </div>
    );
  } catch {
    // If anything fails (bad env vars, network issue), fall back to demo
    return <DemoShell>{children}</DemoShell>;
  }
}
