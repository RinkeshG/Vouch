import { Suspense } from "react";
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

  // No profile → send to claim-handle to set up handle + name first
  if (!profile || !profile.handle || profile.handle.startsWith("user_")) {
    redirect("/claim-handle");
  }

  return (
    <Suspense>
      <NewListClient
        userId={user.id}
        handle={profile.handle}
        city={profile.city || "bangalore"}
      />
    </Suspense>
  );
}
