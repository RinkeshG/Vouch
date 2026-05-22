import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewListClient } from "./new-list-client";

export const dynamic = "force-dynamic";

export default async function NewListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-up?next=/new");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, city")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <NewListClient
      userId={user.id}
      handle={profile?.handle || "user"}
      city={profile?.city || "bangalore"}
    />
  );
}
