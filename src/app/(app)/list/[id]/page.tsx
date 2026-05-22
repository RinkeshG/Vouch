import { notFound } from "next/navigation";
import { tryGetUser } from "@/lib/demo-server";
import { ListDetailClient } from "./list-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListPage({ params }: PageProps) {
  const { id } = await params;
  const user = await tryGetUser();

  // Demo mode — lists require real data
  if (!user) {
    notFound();
  }

  // Production
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("id", id)
    .single();

  if (!list) notFound();

  // Fetch places in this list with joined place data
  const { data: listPlacesData } = await supabase
    .from("list_places")
    .select(
      `
      id, place_id, position,
      places!list_places_place_id_fkey ( id, name, area, cuisines, cover_image_url, vouch_count )
    `
    )
    .eq("list_id", id)
    .order("position", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const places = (listPlacesData || []).map((lp: any) => ({
    id: lp.places?.id || lp.place_id,
    listPlaceId: lp.id,
    name: lp.places?.name || "Unknown",
    area: lp.places?.area || "",
    cuisines: lp.places?.cuisines || [],
    coverImageUrl: lp.places?.cover_image_url || null,
    vouchCount: lp.places?.vouch_count || 0,
    position: lp.position,
  }));

  // Fetch owner profile
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("handle, display_name, avatar_url")
    .eq("id", list.user_id)
    .single();

  const owner = {
    handle: ownerProfile?.handle || "unknown",
    displayName: ownerProfile?.display_name || "Unknown",
    avatarUrl: ownerProfile?.avatar_url || null,
  };

  // Check if current user has saved this list
  const { data: savedData } = await supabase
    .from("list_saves")
    .select("id")
    .eq("user_id", user.id)
    .eq("list_id", id)
    .maybeSingle();

  const isOwnList = list.user_id === user.id;

  return (
    <ListDetailClient
      list={{
        id: list.id,
        title: list.title,
        description: list.description,
        isPublic: list.is_public,
        userId: list.user_id,
        createdAt: list.created_at,
      }}
      places={places}
      owner={owner}
      isSaved={!!savedData}
      isOwnList={isOwnList}
      currentUserId={user.id}
    />
  );
}
