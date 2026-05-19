import App from "./App";
import { LandingPage } from "./landing/LandingPage";

const LANDING_PATHS = new Set(["/", "/waitlist", "/join"]);

export function isLandingRoute(pathname: string): boolean {
  return LANDING_PATHS.has(pathname) || pathname.startsWith("/waitlist/");
}

export function isAppRoute(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/");
}

export function Root() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";

  if (import.meta.env.DEV && path === "/") {
    return <App />;
  }

  if (isLandingRoute(path)) {
    return <LandingPage />;
  }

  return <App />;
}
