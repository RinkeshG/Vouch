import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_step, handle")
          .eq("id", user.id)
          .single();

        // Fully onboarded — go to home
        if (profile && profile.onboarding_step >= 4) {
          return NextResponse.redirect(`${origin}/home`);
        }

        // Google OAuth users get auto-generated handles (user_XXXXXXXX)
        // If handle looks auto-generated, send them to claim a real handle first
        if (profile && profile.handle.startsWith("user_")) {
          return NextResponse.redirect(`${origin}/claim-handle`);
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
}
