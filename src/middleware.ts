import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // /@handle URLs: rewrite to /[handle] internally (Next.js reserves @ for parallel routes)
  if (pathname.startsWith("/@")) {
    const rewritten = pathname.replace(/^\/@/, "/");
    const url = request.nextUrl.clone();
    url.pathname = rewritten;
    return NextResponse.rewrite(url);
  }

  // Root page: pass through — landing page renders for everyone
  if (pathname === "/") {
    return response;
  }

  // Claim-handle: always let through (needs auth but shouldn't redirect)
  if (pathname === "/claim-handle") {
    if (!user) {
      return NextResponse.redirect(new URL("/sign-up", request.url));
    }
    return response;
  }

  // Auth pages: already-authenticated users go to their profile
  if ((pathname === "/sign-up" || pathname === "/sign-in") && user) {
    // Fetch handle to redirect to profile
    try {
      const { createServerClient } = await import("@supabase/ssr");
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => request.cookies.getAll() } }
      );
      const { data: profile } = await supabase
        .from("profiles")
        .select("handle")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.handle && !profile.handle.startsWith("user_")) {
        return NextResponse.redirect(new URL(`/@${profile.handle}`, request.url));
      }
    } catch {
      // Fall through
    }
    // No profile or auto-handle → claim handle first, then /new
    return NextResponse.redirect(new URL("/claim-handle", request.url));
  }

  // Protected route: /new requires auth
  if (pathname === "/new" && !user) {
    return NextResponse.redirect(new URL("/sign-up?next=/new", request.url));
  }

  // Everything else (/@handle, /explore, public pages): pass through
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
