import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicPaths = new Set([
  "/",
  "/how-it-works",
  "/manifesto",
  "/faq",
  "/about",
  "/terms",
  "/privacy",
  "/cookies",
  "/sign-in",
  "/sign-up",
]);

function isPublicPath(pathname: string): boolean {
  if (publicPaths.has(pathname)) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
