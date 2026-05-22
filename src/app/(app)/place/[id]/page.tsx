import { notFound } from "next/navigation";
import {
  isDemoMode,
  DEMO_USER,
  DEMO_SAVED_PLACE_IDS,
  getDemoPlace,
  getDemoPlaceVouches,
} from "@/lib/demo";
import { PlaceDetailClient } from "./place-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlacePage({ params }: PageProps) {
  const { id } = await params;

  // Demo mode
  if (isDemoMode()) {
    const place = getDemoPlace(id);
    if (!place) notFound();

    const vouches = getDemoPlaceVouches(id).map((v) => ({
      id: v.id,
      take: v.take,
      contextTags: v.contextTags,
      createdAt: v.createdAt,
      userId: v.authorId,
      authorHandle: v.authorHandle,
      authorName: v.authorName,
      authorAvatarUrl: v.authorAvatarUrl,
    }));

    return (
      <PlaceDetailClient
        place={{
          id: place.id,
          name: place.name,
          area: place.area,
          city: place.city,
          cuisines: place.cuisines,
          priceTier: place.priceTier,
          vouchCount: place.vouchCount,
          phone: place.phone,
          website: place.website,
          latitude: place.latitude,
          longitude: place.longitude,
          isClosed: place.isClosed,
        }}
        vouches={vouches}
        isSaved={DEMO_SAVED_PLACE_IDS.includes(id)}
        currentUserId={DEMO_USER.id}
        isDemo
      />
    );
  }

  // Production
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

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
      id,
      take,
      context_tags,
      created_at,
      user_id,
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

  const { data: savedData } = await supabase
    .from("saved_places")
    .select("id")
    .eq("user_id", user.id)
    .eq("place_id", id)
    .maybeSingle();

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
      }}
      vouches={vouches}
      isSaved={!!savedData}
      currentUserId={user.id}
    />
  );
}
