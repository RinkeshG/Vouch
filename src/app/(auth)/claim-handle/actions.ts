"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkHandle(handle: string): Promise<{
  available: boolean;
  error?: string;
}> {
  if (!handle || !/^[a-z0-9_]{3,20}$/.test(handle)) {
    return { available: false, error: "invalid" };
  }

  const supabase = await createClient();

  // Use the RPC function which bypasses RLS
  const { data, error } = await supabase.rpc("is_handle_taken", { h: handle });

  if (error) {
    // Fallback: try direct query (works if profile is public or own)
    const { data: profile } = await supabase
      .from("profiles")
      .select("handle")
      .eq("handle", handle)
      .maybeSingle();
    return { available: !profile };
  }

  return { available: !data };
}

export async function getProfile(): Promise<{
  exists: boolean;
  handle?: string;
  displayName?: string;
  userId?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { exists: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return {
      exists: false,
      userId: user.id,
      displayName: user.user_metadata?.display_name
        || user.user_metadata?.full_name
        || user.user_metadata?.name
        || user.email?.split("@")[0]
        || "",
    };
  }

  return {
    exists: true,
    handle: profile.handle,
    displayName: profile.display_name,
    userId: user.id,
  };
}

export async function saveProfile(handle: string, displayName: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!handle || !/^[a-z0-9_]{3,20}$/.test(handle)) {
    return { success: false, error: "Invalid username format." };
  }
  if (!displayName.trim()) {
    return { success: false, error: "Display name is required." };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  // Try UPDATE first (profile likely exists from signup trigger)
  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({
      handle,
      display_name: displayName.trim(),
      is_public: true,
    })
    .eq("id", user.id)
    .select("id");

  if (updateError) {
    if (updateError.message.includes("unique") || updateError.message.includes("handle")) {
      return { success: false, error: "This username was just taken. Try another." };
    }
    console.error("Profile update error:", updateError.message);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // If UPDATE matched 0 rows, try INSERT (profile doesn't exist)
  if (!updated || updated.length === 0) {
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        handle,
        display_name: displayName.trim(),
        avatar_tint: Math.floor(Math.random() * 9),
        is_public: true,
      });

    if (insertError) {
      if (insertError.message.includes("unique") || insertError.message.includes("handle")) {
        return { success: false, error: "This username was just taken. Try another." };
      }
      console.error("Profile insert error:", insertError.message);
      return { success: false, error: "Something went wrong. Please try again." };
    }
  }

  return { success: true };
}
