import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListViewClient } from "./list-view-client";
import { DEV_LIST_DETAIL } from "@/lib/dev-seed";

interface PageProps {
  params: Promise<{ handle: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle, slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("handle", handle)
    .maybeSingle();

  if (!profile) {
    return { title: "Not found — Vouch" };
  }

  const { data: list } = await supabase
    .from("lists")
    .select("title, description, emoji")
    .eq("user_id", profile.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!list) {
    return { title: "Not found — Vouch" };
  }

  const title = `${list.emoji ? list.emoji + " " : ""}${list.title} — by @${handle}`;
  const description = list.description || `A curated list by ${profile.display_name} on Vouch.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/@${handle}/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ListPage({ params }: PageProps) {
  const { handle, slug } = await params;
  const supabase = await createClient();

  // Resolve handle → profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, display_name, avatar_url, city")
    .eq("handle", handle)
    .maybeSingle();

  if (!profile) {
    if (process.env.NODE_ENV === "development") {
      return (
        <ListViewClient
          list={DEV_LIST_DETAIL.list}
          places={DEV_LIST_DETAIL.places}
          author={{ ...DEV_LIST_DETAIL.author, handle }}
          slug={slug}
          isOwner={false}
        />
      );
    }
    notFound();
  }

  // Resolve (user_id, slug) → list
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  // Owners can see their own unpublished lists
  let listQuery = supabase
    .from("lists")
    .select("id, title, description, slug, emoji, cover_style, place_count, is_published, created_at")
    .eq("user_id", profile.id)
    .eq("slug", slug);

  if (!isOwner) {
    listQuery = listQuery.eq("is_published", true);
  }

  const { data: list } = await listQuery.maybeSingle();

  if (!list) {
    notFound();
  }

  // Fetch places in order
  const { data: listPlaces } = await supabase
    .from("list_places")
    .select(
      `
      id, position, note,
      places!list_places_place_id_fkey ( id, name, area, cuisines, photo_reference )
    `
    )
    .eq("list_id", list.id)
    .order("position", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const places = (listPlaces || []).map((lp: any) => ({
    id: lp.id,
    name: lp.places?.name || "Unknown",
    area: lp.places?.area || "",
    cuisines: lp.places?.cuisines || [],
    photoRef: lp.places?.photo_reference || null,
    note: lp.note,
    position: lp.position,
  }));

  return (
    <ListViewClient
      list={{
        title: list.title,
        description: list.description,
        emoji: list.emoji,
        coverStyle: list.cover_style,
        placeCount: list.place_count,
        createdAt: list.created_at,
      }}
      places={places}
      author={{
        handle: profile.handle,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        city: profile.city || "bangalore",
      }}
      slug={slug}
      isOwner={isOwner}
    />
  );
}
