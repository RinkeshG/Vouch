import {
  DEMO_USER,
  DEMO_SAVED_PLACE_IDS,
  DEMO_PLACES,
} from "@/lib/demo";
import { tryGetUser } from "@/lib/demo-server";
import { SavedClient } from "./saved-client";

export default async function SavedPage() {
  const user = await tryGetUser();

  // Demo mode
  if (!user) {
    const savedPlaces = DEMO_SAVED_PLACE_IDS.map((placeId) => {
      const place = DEMO_PLACES.find((p) => p.id === placeId);
      return {
        savedId: `saved-${placeId}`,
        placeId,
        name: place?.name || "Unknown",
        area: place?.area || "",
        vouchCount: place?.vouchCount || 0,
        savedAt: new Date().toISOString(),
      };
    });

    return (
      <SavedClient
        savedPlaces={savedPlaces}
        currentUserId={DEMO_USER.id}
        isDemo
      />
    );
  }

  // Production
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: savedData } = await supabase
    .from("saved_places")
    .select(
      `
      id, place_id, saved_at,
      places!saved_places_place_id_fkey ( id, name, area, vouch_count )
    `
    )
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savedPlaces = (savedData || []).map((s: any) => ({
    savedId: s.id,
    placeId: s.places?.id || s.place_id,
    name: s.places?.name || "Unknown",
    area: s.places?.area || "",
    vouchCount: s.places?.vouch_count || 0,
    savedAt: s.saved_at,
  }));

  return <SavedClient savedPlaces={savedPlaces} currentUserId={user.id} />;
}
