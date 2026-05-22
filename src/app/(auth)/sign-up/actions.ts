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

export async function checkEmailAvailable(email: string): Promise<boolean> {
  if (!email || !email.includes("@")) {
    return false;
  }

  const supabase = await createClient();

  // Uses security-definer RPC to check auth.users (bypasses RLS)
  const { data, error } = await supabase.rpc("is_email_registered", {
    email_input: email.trim().toLowerCase(),
  });

  if (error) {
    // If RPC doesn't exist yet (migration not run), allow sign-up
    // Supabase will handle duplicate emails at the auth layer
    console.error("Email check RPC error:", error.message);
    return true;
  }

  return !data; // data is true if registered, we return true if available
}
