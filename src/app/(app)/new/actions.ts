"use server";

import { createClient } from "@/lib/supabase/server";

interface PublishItem {
  placeId: string;
  name: string;
  area: string;
  note: string;
  lat: number | null;
  lng: number | null;
  photoRef: string | null;
}

interface PublishInput {
  title: string;
  description: string;
  slug: string;
  emoji: string;
  coverStyle: number;
  items: PublishItem[];
  city: string;
}

export async function publishList(input: PublishInput): Promise<{
  success: boolean;
  slug?: string;
  error?: string;
}> {
  const supabase = await createClient();

  // 1. Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "You need to be signed in to publish. Please refresh and sign in again." };
  }

  // 2. Verify profile exists (FK: lists.user_id → profiles.id)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: "Your profile isn't set up. Please go back and set up your username first." };
  }

  // 3. Validate inputs
  const title = input.title.trim();
  if (!title || title.length > 60) {
    return { success: false, error: "Title must be between 1 and 60 characters." };
  }
  if (input.items.length < 3) {
    return { success: false, error: "You need at least 3 places to publish." };
  }
  if (!input.slug) {
    return { success: false, error: "List URL could not be generated. Try a different title." };
  }

  // 4. Insert list
  const { data: list, error: listError } = await supabase
    .from("lists")
    .insert({
      user_id: user.id,
      title,
      description: input.description.trim() || null,
      slug: input.slug,
      emoji: input.emoji || null,
      cover_style: input.coverStyle,
      is_public: true,
      is_published: true,
    })
    .select("id")
    .single();

  if (listError || !list) {
    if (listError?.message?.includes("slug") || listError?.message?.includes("lists_user_slug_idx")) {
      return { success: false, error: "A list with this URL already exists. Try a different title." };
    }
    console.error("List insert failed:", listError?.message);
    return { success: false, error: `Couldn't create list: ${listError?.message || "unknown error"}` };
  }

  // 5. Resolve places + insert list_places
  for (let i = 0; i < input.items.length; i++) {
    const item = input.items[i];
    const isLocal = item.placeId.startsWith("local-");
    const isCsvImport = item.placeId.startsWith("csv_");
    let placeUuid: string | null = null;

    if (isCsvImport) {
      // CSV-imported place — no Google Place ID. Generate a unique manual ID.
      const manualId = `manual_${crypto.randomUUID()}`;
      const { data: inserted, error: insErr } = await supabase
        .from("places")
        .insert({
          google_place_id: manualId,
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
        console.error(`CSV place insert failed for ${item.name}:`, insErr.message);
      }
      placeUuid = inserted?.id ?? null;
    } else if (!isLocal) {
      // Google place — look up by google_place_id first
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
          console.error(`Place insert failed for ${item.name}:`, insErr.message);
          // Try lookup again — might have been inserted by another request
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
      // Local place — look up by name + city
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
          console.error(`Place insert failed for ${item.name}:`, insErr.message);
        }
        placeUuid = inserted?.id ?? null;
      }
    }

    if (placeUuid) {
      const { error: lpError } = await supabase.from("list_places").insert({
        list_id: list.id,
        place_id: placeUuid,
        position: i,
        note: item.note || null,
      });
      if (lpError) {
        console.error(`List place insert failed for ${item.name}:`, lpError.message);
      }
    }
  }

  return { success: true, slug: input.slug };
}
