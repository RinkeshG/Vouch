import { getSupabase } from "./supabase";
import type { PlaceSaveEvent } from "../types";

type RecordPayload = {
  sourceHandle: string;
  actorHandle: string;
  actorName: string;
  placeId: string;
  placeName: string;
  placeImage: string;
};

/**
 * Record that the current user (actor) saved a place from someone else's Vouch (source).
 * RLS: insert is only allowed where actor_handle matches the auth user's profile handle.
 * Unique index on (source_handle, actor_handle, place_id) makes this idempotent via upsert.
 */
export async function recordPlaceSave(payload: RecordPayload): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  if (!payload.sourceHandle || !payload.actorHandle) return;

  const row = {
    source_handle: payload.sourceHandle.toLowerCase(),
    actor_handle: payload.actorHandle.toLowerCase(),
    actor_name: payload.actorName,
    place_id: payload.placeId,
    place_name: payload.placeName,
    place_image: payload.placeImage,
    saved_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("place_saves")
    .upsert(row, { onConflict: "source_handle,actor_handle,place_id" });

  if (error) console.warn("[vouch] record place save failed", error.message);
}

/**
 * Fetch recent saves made FROM my Vouch list — the "influence" feed.
 * Only returns rows where source_handle = my handle.
 */
export async function fetchSavesFromMyVouches(
  myHandle: string,
  limit = 20
): Promise<PlaceSaveEvent[]> {
  const supabase = getSupabase();
  if (!supabase || !myHandle) return [];

  const { data, error } = await supabase
    .from("place_saves")
    .select("id, source_handle, actor_handle, actor_name, place_id, place_name, place_image, saved_at")
    .eq("source_handle", myHandle.toLowerCase())
    .order("saved_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row): PlaceSaveEvent => ({
    id: row.id,
    sourceHandle: row.source_handle,
    actorHandle: row.actor_handle,
    actorName: row.actor_name ?? "",
    placeId: row.place_id,
    placeName: row.place_name ?? "",
    placeImage: row.place_image ?? "",
    savedAt: row.saved_at ? new Date(row.saved_at).getTime() : Date.now()
  }));
}
