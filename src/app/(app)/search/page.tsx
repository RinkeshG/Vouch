import { createClient } from "@/lib/supabase/server";
import { SearchClient } from "./search-client";

export default async function SearchPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Suggested people: public profiles with most vouches
  const { data: suggestedPeople } = await supabase
    .from("profiles")
    .select("id, handle, display_name, avatar_url, vouch_count")
    .eq("is_public", true)
    .neq("id", user.id)
    .order("vouch_count", { ascending: false })
    .limit(10);

  // Popular places
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
