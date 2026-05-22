import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlaceDetailClient } from "./place-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlacePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch place — places are readable by all (RLS policy)
  const { data: place } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .single();

  if (!place) notFound();

  const { data: vouchesData } = await supabase
    .from("vouches")
    .select(
      `
      id, take, context_tags, created_at, user_id,
      profiles!vouches_user_id_fkey ( handle, display_name, avatar_url )
    `
    )
    .eq("place_id", id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vouches = (vouchesData || []).map((v: any) => ({
    id: v.id,
    take: v.take,
    contextTags: v.context_tags || [],
    createdAt: v.created_at,
    userId: v.user_id,
    authorHandle: v.profiles?.handle || "unknown",
    authorName: v.profiles?.display_name || "Unknown",
    authorAvatarUrl: v.profiles?.avatar_url || null,
  }));

  // Check saved status only if authenticated
  let isSaved = false;
  if (user) {
    const { data: savedData } = await supabase
      .from("saved_places")
      .select("id")
      .eq("user_id", user.id)
      .eq("place_id", id)
      .maybeSingle();
    isSaved = !!savedData;
  }

  return (
    <PlaceDetailClient
      place={{
        id: place.id,
        name: place.name,
        area: place.area,
        city: place.city,
        cuisines: place.cuisines || [],
        priceTier: place.price_tier,
        vouchCount: place.vouch_count,
        phone: place.phone,
        website: place.website,
        latitude: place.latitude,
        longitude: place.longitude,
        isClosed: place.is_closed,
        coverImageUrl: place.cover_image_url,
      }}
      vouches={vouches}
      isSaved={isSaved}
      currentUserId={user?.id || ""}
    />
  );
}
