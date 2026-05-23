"use server";

import { createClient } from "@/lib/supabase/server";

/* ---- Types ---- */

interface UpdateItem {
  placeId: string;
  name: string;
  area: string;
  note: string;
  lat: number | null;
  lng: number | null;
  photoRef: string | null;
}

interface UpdateInput {
  listId: string;
  title: string;
  description: string;
  slug: string;
  emoji: string;
  coverStyle: number;
  city: string;
  isPublished: boolean;
  items: UpdateItem[];
}

/* ---- 1. updateList ---- */

export async function updateList(input: UpdateInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  // Verify auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      success: false,
      error: "You need to be signed in. Please refresh and sign in again.",
    };
  }

  // Verify ownership
  const { data: list } = await supabase
    .from("lists")
    .select("id, user_id")
    .eq("id", input.listId)
    .maybeSingle();

  if (!list || list.user_id !== user.id) {
    return { success: false, error: "List not found or you don't own it." };
  }

  // Validate inputs
  const title = input.title.trim();
  if (!title || title.length > 60) {
    return {
      success: false,
      error: "Title must be between 1 and 60 characters.",
    };
  }
  if (input.isPublished && input.items.length < 3) {
    return {
      success: false,
      error: "You need at least 3 places to publish.",
    };
  }
  if (input.isPublished && !input.slug) {
    return {
      success: false,
      error: "List URL could not be generated. Try a different title.",
    };
  }

  // Update list metadata
  const { error: updateError } = await supabase
    .from("lists")
    .update({
      title,
      description: input.description.trim() || null,
      slug: input.slug || null,
      emoji: input.emoji || null,
      cover_style: input.coverStyle,
      is_published: input.isPublished,
      is_public: input.isPublished,
    })
    .eq("id", input.listId);

  if (updateError) {
    if (
      updateError.message?.includes("slug") ||
      updateError.message?.includes("lists_user_slug_idx")
    ) {
      return {
        success: false,
        error: "A list with this URL already exists. Try a different title.",
      };
    }
    console.error("List update failed:", updateError.message);
    return {
      success: false,
      error: `Couldn't update list: ${updateError.message || "unknown error"}`,
    };
  }

  // Delete all existing list_places, then re-insert
  const { error: deleteError } = await supabase
    .from("list_places")
    .delete()
    .eq("list_id", input.listId);

  if (deleteError) {
    console.error("List places delete failed:", deleteError.message);
    return {
      success: false,
      error: "Couldn't update places. Please try again.",
    };
  }

  // Re-insert places (same pattern as publishList)
  for (let i = 0; i < input.items.length; i++) {
    const item = input.items[i];
    const isLocal = item.placeId.startsWith("local-");
    let placeUuid: string | null = null;

    if (!isLocal) {
      // Google place -- look up by google_place_id first
      const { data: existing } = await supabase
        .from("places")
        .select("id")
        .eq("google_place_id", item.placeId)
        .maybeSingle();

      if (existing) {
        placeUuid = existing.id;
        if (item.photoRef) {
          await supabase
            .from("places")
            .update({ photo_reference: item.photoRef })
            .eq("id", existing.id)
            .is("photo_reference", null);
        }
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("places")
          .insert({
            google_place_id: item.placeId,
            name: item.name,
            area: item.area,
            city: input.city,
            latitude: item.lat,
            longitude: item.lng,
            photo_reference: item.photoRef,
          })
          .select("id")
          .single();

        if (insErr) {
          console.error(
            `Place insert failed for ${item.name}:`,
            insErr.message
          );
          // Try lookup again -- might have been inserted by another request
          const { data: retry } = await supabase
            .from("places")
            .select("id")
            .eq("google_place_id", item.placeId)
            .maybeSingle();
          placeUuid = retry?.id ?? null;
        } else {
          placeUuid = inserted?.id ?? null;
        }
      }
    } else {
      // Local place -- look up by name + city
      const { data: existing } = await supabase
        .from("places")
        .select("id")
        .eq("name", item.name)
        .eq("city", input.city)
        .limit(1)
        .maybeSingle();

      if (existing) {
        placeUuid = existing.id;
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("places")
          .insert({
            name: item.name,
            area: item.area,
            city: input.city,
            latitude: item.lat,
            longitude: item.lng,
            photo_reference: item.photoRef,
          })
          .select("id")
          .single();

        if (insErr) {
          console.error(
            `Place insert failed for ${item.name}:`,
            insErr.message
          );
        }
        placeUuid = inserted?.id ?? null;
      }
    }

    if (placeUuid) {
      const { error: lpError } = await supabase.from("list_places").insert({
        list_id: input.listId,
        place_id: placeUuid,
        position: i,
        note: item.note || null,
      });
      if (lpError) {
        console.error(
          `List place insert failed for ${item.name}:`,
          lpError.message
        );
      }
    }
  }

  return { success: true };
}

/* ---- 2. deleteList ---- */

export async function deleteList(
  listId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Verify auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      success: false,
      error: "You need to be signed in. Please refresh and sign in again.",
    };
  }

  // Verify ownership
  const { data: list } = await supabase
    .from("lists")
    .select("id, user_id")
    .eq("id", listId)
    .maybeSingle();

  if (!list || list.user_id !== user.id) {
    return { success: false, error: "List not found or you don't own it." };
  }

  // Delete list_places first (FK constraint)
  const { error: lpDeleteError } = await supabase
    .from("list_places")
    .delete()
    .eq("list_id", listId);

  if (lpDeleteError) {
    console.error("List places delete failed:", lpDeleteError.message);
    return {
      success: false,
      error: "Couldn't delete list places. Please try again.",
    };
  }

  // Delete the list
  const { error: listDeleteError } = await supabase
    .from("lists")
    .delete()
    .eq("id", listId);

  if (listDeleteError) {
    console.error("List delete failed:", listDeleteError.message);
    return {
      success: false,
      error: "Couldn't delete list. Please try again.",
    };
  }

  return { success: true };
}

/* ---- 3. togglePublish ---- */

export async function togglePublish(
  listId: string,
  publish: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Verify auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      success: false,
      error: "You need to be signed in. Please refresh and sign in again.",
    };
  }

  // Verify ownership + check place count for publishing
  const { data: list } = await supabase
    .from("lists")
    .select("id, user_id, place_count")
    .eq("id", listId)
    .maybeSingle();

  if (!list || list.user_id !== user.id) {
    return { success: false, error: "List not found or you don't own it." };
  }

  if (publish && list.place_count < 3) {
    return {
      success: false,
      error: "You need at least 3 places to publish.",
    };
  }

  const { error: updateError } = await supabase
    .from("lists")
    .update({
      is_published: publish,
      is_public: publish,
    })
    .eq("id", listId);

  if (updateError) {
    console.error("Toggle publish failed:", updateError.message);
    return {
      success: false,
      error: "Couldn't update publish status. Please try again.",
    };
  }

  return { success: true };
}
