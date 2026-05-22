import {
  DEMO_USER,
  getDemoSuggestedPeople,
  getDemoPopularPlaces,
} from "@/lib/demo";
import { tryGetUser } from "@/lib/demo-server";
import { SearchClient } from "./search-client";

export default async function SearchPage() {
  const user = await tryGetUser();

  // Demo mode
  if (!user) {
    return (
      <SearchClient
        suggestedPeople={getDemoSuggestedPeople()}
        popularPlaces={getDemoPopularPlaces()}
        currentUserId={DEMO_USER.id}
        isDemo
      />
    );
  }

  // Production
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: suggestedPeople } = await supabase
    .from("profiles")
    .select("id, handle, display_name, avatar_url, vouch_count, taste_line, bio")
    .eq("is_public", true)
    .neq("id", user.id)
    .order("vouch_count", { ascending: false })
    .limit(10);

  const { data: popularPlaces } = await supabase
    .from("places")
    .select("id, name, area, vouch_count")
    .order("vouch_count", { ascending: false })
    .gt("vouch_count", 0)
    .limit(10);

  return (
    <SearchClient
      suggestedPeople={suggestedPeople || []}
      popularPlaces={popularPlaces || []}
      currentUserId={user.id}
    />
  );
}
