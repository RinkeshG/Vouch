import { getSupabase, isCloudEnabled } from "./supabase";

export type AuthUserInfo = {
  id: string;
  email: string | null;
  isAnonymous: boolean;
};

export function authRedirectUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "";
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

  const { error } = await supabase.auth.updateUser({ email: normalized });
  if (error) return { ok: false, error: error.message };
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
