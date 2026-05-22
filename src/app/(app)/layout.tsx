import { redirect } from "next/navigation";
import { isDemoMode, DEMO_USER } from "@/lib/demo";
import { AppShellClient } from "./shell-client";
import styles from "./app.module.css";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Demo mode: skip auth, use mock profile
  if (isDemoMode()) {
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

  // Production: real auth flow
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get profile for the nav
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name, avatar_url, avatar_tint, onboarding_step")
    .eq("id", user.id)
    .single();

  // If onboarding not complete, redirect
  if (profile && profile.onboarding_step < 4) {
    redirect("/onboarding");
  }

  return (
    <div className={styles.shell}>
      <AppShellClient
        handle={profile?.handle}
        displayName={profile?.display_name}
        avatarUrl={profile?.avatar_url}
      />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
