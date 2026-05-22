import { createClient } from "@/lib/supabase/server";
import { SearchClient } from "./search-client";

export default async function SearchPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware ensures auth, but just in case
  if (!user) {
    return (
      <SearchClient
        suggestedPeople={[]}
        popularPlaces={[]}
        currentUserId=""
      />
    );
  }

  const { data: suggestedPeople } = await supabase
    .from("profiles")
    .select("id, handle, display_name, avatar_url, taste_line, bio")
    .eq("is_public", true)
    .neq("id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: popularPlaces } = await supabase
    .from("places")
    .select("id, name, area, vouch_count")
    .order("vouch_count", { ascending: false })
    .gt("vouch_count", 0)
    .limit(10);

  return (
    <SearchClient
      suggestedPeople={(suggestedPeople || []).map((p) => ({ ...p, vouch_count: 0 }))}
      popularPlaces={popularPlaces || []}
      currentUserId={user.id}
    />
  );
}
