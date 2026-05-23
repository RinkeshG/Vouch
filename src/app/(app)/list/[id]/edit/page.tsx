import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditListClient } from "./edit-client";

export const dynamic = "force-dynamic";

interface EditListPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListPage({ params }: EditListPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-up?next=/list/${id}/edit`);
  }

  // 2. Fetch the list and verify ownership
  const { data: list } = await supabase
    .from("lists")
    .select("id, title, description, slug, emoji, cover_style, is_published, is_public, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!list || list.user_id !== user.id) {
    notFound();
  }

  // 3. Fetch list_places with place data, ordered by position
  const { data: listPlaces } = await supabase
    .from("list_places")
    .select(`
      id, position, note,
      places!list_places_place_id_fkey ( id, google_place_id, name, area, cuisines, latitude, longitude, photo_reference )
    `)
    .eq("list_id", id)
    .order("position", { ascending: true });

  // 4. Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, city")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.handle || profile.handle.startsWith("user_")) {
    redirect("/claim-handle");
  }

  // Transform list_places into the shape the client expects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: { placeId: string; name: string; area: string; note: string; lat: number | null; lng: number | null; photoRef: string | null }[] = [];
  for (const lp of (listPlaces || []) as any[]) {
    const place = lp.places;
    if (!place) continue;
    items.push({
      placeId: place.google_place_id || place.id,
      name: place.name,
      area: place.area,
      note: lp.note || "",
      lat: place.latitude,
      lng: place.longitude,
      photoRef: place.photo_reference,
    });
  }

  return (
    <EditListClient
      listId={list.id}
      initialTitle={list.title}
      initialDescription={list.description || ""}
      initialSlug={list.slug || ""}
      initialEmoji={list.emoji || ""}
      initialCoverStyle={list.cover_style}
      initialIsPublished={list.is_published}
      initialItems={items}
      handle={profile.handle}
      city={profile.city || "bangalore"}
    />
  );
}
