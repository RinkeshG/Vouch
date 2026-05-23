import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ----------------------------------------------------------------
   GET  /api/lists/[id]/save → { saved: boolean, count: number }
   POST /api/lists/[id]/save → save list   → { saved: true, count }
   DELETE /api/lists/[id]/save → unsave list → { saved: false, count }
   ---------------------------------------------------------------- */

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id: listId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get save count from lists table (denormalized)
  const { data: list } = await supabase
    .from("lists")
    .select("save_count")
    .eq("id", listId)
    .single();

  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  // Check if current user has saved this list
  let saved = false;
  if (user) {
    const { data: saveRow } = await supabase
      .from("list_saves")
      .select("id")
      .eq("user_id", user.id)
      .eq("list_id", listId)
      .maybeSingle();

    saved = !!saveRow;
  }

  return NextResponse.json({ saved, count: list.save_count });
}

export async function POST(_req: Request, { params }: Params) {
  const { id: listId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Insert save (unique constraint prevents duplicates)
  const { error } = await supabase
    .from("list_saves")
    .insert({ user_id: user.id, list_id: listId });

  if (error && error.code !== "23505") {
    // 23505 = unique violation (already saved) — not an error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch updated count
  const { data: list } = await supabase
    .from("lists")
    .select("save_count")
    .eq("id", listId)
    .single();

  return NextResponse.json({ saved: true, count: list?.save_count ?? 0 });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id: listId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await supabase
    .from("list_saves")
    .delete()
    .eq("user_id", user.id)
    .eq("list_id", listId);

  // Fetch updated count
  const { data: list } = await supabase
    .from("lists")
    .select("save_count")
    .eq("id", listId)
    .single();

  return NextResponse.json({ saved: false, count: list?.save_count ?? 0 });
}
