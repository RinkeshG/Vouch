import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  const supabase = await createClient();

  // Exchange code for session if present (PKCE flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth code exchange failed:", error.message);
    }
  }

  // Check if user is authenticated — works for both:
  //   - PKCE flow (code exchange above)
  //   - Implicit flow (tokens set via cookies by middleware)
  //   - Already-authenticated user hitting callback
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth`);
  }

  // Wait for profile to be created by trigger (retries for timing)
  let profile: { handle: string } | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data } = await supabase
      .from("profiles")
      .select("handle")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      profile = data;
      break;
    }

    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // No profile at all → claim-handle will create one
  if (!profile) {
    return NextResponse.redirect(`${origin}/claim-handle`);
  }

  // Auto-generated handle (Google OAuth) → pick a real username
  if (profile.handle.startsWith("user_")) {
    return NextResponse.redirect(`${origin}/claim-handle`);
  }

  // Proper handle → go to /new (or wherever `next` points)
  return NextResponse.redirect(`${origin}${next}`);
}
