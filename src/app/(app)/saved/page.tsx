import { createClient } from "@/lib/supabase/server";
import { SavedClient } from "./saved-client";

export default async function SavedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware ensures auth, but just in case
  if (!user) {
    return <SavedClient savedPlaces={[]} currentUserId="" />;
  }

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
