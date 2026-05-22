"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkHandleAvailable(handle: string): Promise<boolean> {
  if (!handle || !/^[a-z0-9_]{3,20}$/.test(handle)) {
    return false;
  }

  const supabase = await createClient();

  // Use the RPC function which bypasses RLS via security definer
  const { data, error } = await supabase.rpc("is_handle_taken", { h: handle });

  if (error) {
    // If RPC doesn't exist yet (migration not run), fall back to direct query
    // This query can only see public profiles, so it may give false positives
    const { data: profile } = await supabase
      .from("profiles")
      .select("handle")
      .eq("handle", handle)
      .maybeSingle();
    return !profile;
  }

  return !data; // data is true if taken, we return true if available
}
