import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // /@handle URLs: rewrite to /[handle] internally (Next.js reserves @ for parallel routes)
  // IMPORTANT: copy session cookies from updateSession so token refresh isn't lost
  if (pathname.startsWith("/@")) {
    const rewritten = pathname.replace(/^\/@/, "/");
    const url = request.nextUrl.clone();
    url.pathname = rewritten;
    const rewriteResponse = NextResponse.rewrite(url);
    response.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie);
    });
    return rewriteResponse;
  }

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
    // Go straight to /home — it handles profile checks + claim-handle redirect
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

  // Everything else (/@handle, /explore, public pages): pass through
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
