import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/home", "/search", "/saved", "/add", "/place", "/list"];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Root page: authenticated users go to /home, unauthenticated go to /sign-in
  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Auth pages: already-authenticated users skip sign-in/sign-up
  if ((pathname === "/sign-up" || pathname === "/sign-in") && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Protected routes: unauthenticated users go to /sign-in
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
