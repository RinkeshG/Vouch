import "server-only";

/**
 * Try to get the current user. Returns null if the user isn't authenticated.
 * Server components only — do not import in client components.
 */
export async function tryGetUser(): Promise<{
  id: string;
} | null> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
