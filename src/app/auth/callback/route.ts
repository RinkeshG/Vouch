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
          let profile: { handle: string; place_count_total: number } | null = null;

          for (let attempt = 0; attempt < 3; attempt++) {
            const { data } = await supabase
              .from("profiles")
              .select("handle")
              .eq("id", user.id)
              .maybeSingle();

            if (data) {
              // Check if they have any published lists
              const { count } = await supabase
                .from("lists")
                .select("id", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("is_published", true);

              profile = { handle: data.handle, place_count_total: count || 0 };
              break;
            }

            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 500));
            }
          }

          // No profile or auto-generated handle → set up profile first
          if (!profile || profile.handle.startsWith("user_")) {
            return NextResponse.redirect(`${origin}/claim-handle`);
          }

          // Returning user with lists → profile page
          if (profile.place_count_total > 0) {
            return NextResponse.redirect(`${origin}/@${profile.handle}`);
          }

          // User with proper handle but no lists → create first list
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    } catch {
      return NextResponse.redirect(`${origin}/sign-in?error=rate_limited`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
}
