import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Root page: authenticated users go straight to /home
  if (pathname === "/" && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Auth pages: already-authenticated users skip sign-in/sign-up
  if ((pathname === "/sign-up" || pathname === "/sign-in") && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
