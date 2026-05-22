import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/new";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Profile may not exist yet if the trigger is still running.
          // Retry up to 3 times with a short delay.
          let profile: { onboarding_step: number; handle: string } | null = null;

          for (let attempt = 0; attempt < 3; attempt++) {
            const { data } = await supabase
              .from("profiles")
              .select("onboarding_step, handle")
              .eq("id", user.id)
              .maybeSingle();

            if (data) {
              profile = data;
              break;
            }

            // Wait 500ms before retrying
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 500));
            }
          }

          // No profile or auto-generated handle → set up profile first
          if (!profile || profile.handle.startsWith("user_")) {
            return NextResponse.redirect(`${origin}/claim-handle`);
          }

          // Returning user with proper handle → profile page
          if (profile.handle) {
            return NextResponse.redirect(`${origin}/@${profile.handle}`);
          }

          // Fallback → create first list
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    } catch {
      // Supabase rate-limited or unreachable — redirect to sign-in with error
      return NextResponse.redirect(`${origin}/sign-in?error=rate_limited`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
}
