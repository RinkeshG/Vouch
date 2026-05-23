"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleSave(
  listId: string
): Promise<{ saved: boolean; count: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { saved: false, count: 0 };

  // Check if already saved
  const { data: existing } = await supabase
    .from("saves")
    .select("id")
    .eq("user_id", user.id)
    .eq("list_id", listId)
    .maybeSingle();

  if (existing) {
    await supabase.from("saves").delete().eq("id", existing.id);
  } else {
    await supabase.from("saves").insert({ user_id: user.id, list_id: listId });
  }

  // Get updated count
  const { count } = await supabase
    .from("saves")
    .select("*", { count: "exact", head: true })
    .eq("list_id", listId);

  return { saved: !existing, count: count || 0 };
}
