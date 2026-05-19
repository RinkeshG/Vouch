import { getSupabase, isCloudEnabled } from "./supabase";

export type AuthUserInfo = {
  id: string;
  email: string | null;
  isAnonymous: boolean;
};

export const AUTH_CALLBACK_PATH = "/auth/callback";

function normalizeOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Supabase treats host-only values as paths on *.supabase.co (invalid path error).
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

/** Absolute redirect URL for magic links — must match Supabase Redirect URLs allowlist. */
export function authRedirectUrl(): string {
  const fromWindow =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin.replace(/\/$/, "")
      : "";

  const fromEnv =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_PUBLIC_SITE_URL
      ? String(import.meta.env.VITE_PUBLIC_SITE_URL).trim().replace(/\/$/, "")
      : "";

  const origin = normalizeOrigin(fromWindow || fromEnv);
  if (!origin) return "";
  return `${origin}${AUTH_CALLBACK_PATH}`;
}

/**
 * Fixes emails where Supabase Site URL was set without `https://`
 * (link lands on `*.supabase.co/your-domain.vercel.app#access_token=...`).
 */
export function repairBrokenSupabaseAuthUrl(broken: string): string | null {
  try {
    const parsed = new URL(broken.trim());
    if (!parsed.hostname.endsWith("supabase.co")) return null;
    const siteHost = parsed.pathname.replace(/^\//, "");
    if (!siteHost || !siteHost.includes(".")) return null;
    const origin = normalizeOrigin(siteHost);
    return `${origin}${AUTH_CALLBACK_PATH}${parsed.hash}`;
  } catch {
    return null;
  }
}

/** After magic link, strip tokens from the address bar. */
export async function consumeAuthHashFromUrl(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || typeof window === "undefined") return false;

  const hash = window.location.hash;
  if (!hash.includes("access_token") && !hash.includes("refresh_token")) return false;

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    const path = window.location.pathname === AUTH_CALLBACK_PATH ? "/" : window.location.pathname;
    const search = window.location.search;
    window.history.replaceState(window.history.state, "", `${path}${search}`);
    return true;
  }
  return false;
}

export async function getAuthUser(): Promise<AuthUserInfo | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    isAnonymous: user.is_anonymous === true
  };
}

/** First visit: anonymous session so cloud sync works immediately */
export async function ensureAnonymousSession(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user.id) return sessionData.session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    console.warn("[vouch] anonymous auth failed", error?.message);
    return null;
  }
  return data.user.id;
}

type SessionReady =
  | { ok: true; userId: string; isAnonymous: boolean }
  | { ok: false; error: string };

/** Ensures a Supabase session exists before updateUser / cloud writes. */
export async function requireAuthSession(): Promise<SessionReady> {
  if (!isCloudEnabled) {
    return { ok: false, error: "Cloud sync isn't configured on this build." };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, error: "Cloud sync isn't configured on this build." };
  }

  let {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    const userId = await ensureAnonymousSession();
    if (!userId) {
      return {
        ok: false,
        error:
          "Couldn't start a secure session. In Supabase → Authentication, turn on Anonymous sign-ins, then reload."
      };
    }
    ({
      data: { session }
    } = await supabase.auth.getSession());
  }

  if (!session?.user?.id) {
    return { ok: false, error: "Auth session missing — reload the page and try again." };
  }

  return {
    ok: true,
    userId: session.user.id,
    isAnonymous: session.user.is_anonymous === true
  };
}

/**
 * Upgrade current anonymous user → email (same user_id, data kept).
 * Supabase sends a confirmation / magic link to the inbox.
 */
export async function linkEmailToAccount(email: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: "Cloud not configured" };

  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: "Enter a valid email" };
  }

  const session = await requireAuthSession();
  if (!session.ok) return { ok: false, error: session.error };

  if (!session.isAnonymous && session.userId) {
    const user = await getAuthUser();
    if (user?.email) {
      return { ok: false, error: "You're already signed in with email on this device." };
    }
  }

  const redirectTo = authRedirectUrl();
  const { error } = await supabase.auth.updateUser(
    { email: normalized },
    redirectTo ? { emailRedirectTo: redirectTo } : undefined
  );
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("session") || msg.includes("jwt")) {
      return {
        ok: false,
        error:
          "Session expired — reload the page, then try again. If it persists, enable Anonymous sign-ins in Supabase."
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Sign in on a new device — magic link loads cloud profile by user id */
export async function signInWithEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: "Cloud not configured" };

  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: "Enter a valid email" };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: { emailRedirectTo: authRedirectUrl() }
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOutAndResetAnonymous(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
  await supabase.auth.signInAnonymously();
}

export { isCloudEnabled };
