import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that need auth state to make redirect decisions
const AUTH_DEPENDENT_ROUTES = ["/", "/sign-up", "/sign-in", "/claim-handle", "/home", "/new", "/list"];

function needsAuthCheck(pathname: string): boolean {
  return AUTH_DEPENDENT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // /@handle URLs: rewrite to /[handle] internally (Next.js reserves @ for parallel routes)
  // These are public routes — only do the rewrite, skip auth check for viewers
  if (pathname.startsWith("/@")) {
    const rewritten = pathname.replace(/^\/@/, "/");
    const url = request.nextUrl.clone();
    url.pathname = rewritten;

    // Still need session refresh for cookie maintenance
    const { response } = await updateSession(request);
    const rewriteResponse = NextResponse.rewrite(url);
    response.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie);
    });
    return rewriteResponse;
  }

  // /explore is public — pass through with minimal session refresh
  if (pathname === "/explore") {
    const { response } = await updateSession(request);
    return response;
  }

  // Only hit Supabase for routes that actually need auth decisions
  if (!needsAuthCheck(pathname)) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  // Root page: authed users go inside the product, unauthed see landing page
  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return response;
  }

  // Claim-handle: needs auth, but don't redirect away
  if (pathname === "/claim-handle") {
    if (!user) {
      return NextResponse.redirect(new URL("/sign-up", request.url));
    }
    return response;
  }

  // Auth pages: already-authenticated users go inside the product
  if ((pathname === "/sign-up" || pathname === "/sign-in") && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Protected routes: /home, /new, /list/* require auth
  if (
    (pathname === "/home" || pathname === "/new" || pathname.startsWith("/list")) &&
    !user
  ) {
    return NextResponse.redirect(
      new URL(`/sign-up?next=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
