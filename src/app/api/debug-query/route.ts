import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Test 1: basic list_places query without join
  const { data: rawLp, error: rawErr } = await supabase
    .from("list_places")
    .select("id, list_id, place_id, position")
    .limit(3);

  // Test 2: list_places with implicit places join
  const { data: implicitJoin, error: implicitErr } = await supabase
    .from("list_places")
    .select("id, list_id, position, places ( id, name )")
    .limit(3);

  // Test 3: list_places with explicit FK join
  const { data: explicitJoin, error: explicitErr } = await supabase
    .from("list_places")
    .select("id, list_id, position, places!list_places_place_id_fkey ( id, name )")
    .limit(3);

  // Test 4: just query places directly
  const { data: directPlaces, error: directErr } = await supabase
    .from("places")
    .select("id, name, photo_reference")
    .limit(3);

  // Test 5: list_places with photo_reference in join
  const { data: photoJoin, error: photoErr } = await supabase
    .from("list_places")
    .select("id, list_id, position, places ( id, name, photo_reference )")
    .limit(3);

  return NextResponse.json({
    test1_raw_list_places: { data: rawLp, error: rawErr ? { message: rawErr.message, details: rawErr.details, hint: rawErr.hint, code: rawErr.code } : null },
    test2_implicit_join: { data: implicitJoin, error: implicitErr ? { message: implicitErr.message, details: implicitErr.details, hint: implicitErr.hint, code: implicitErr.code } : null },
    test3_explicit_fk_join: { data: explicitJoin, error: explicitErr ? { message: explicitErr.message, details: explicitErr.details, hint: explicitErr.hint, code: explicitErr.code } : null },
    test4_direct_places: { data: directPlaces, error: directErr ? { message: directErr.message, details: directErr.details, hint: directErr.hint, code: directErr.code } : null },
    test5_photo_join: { data: photoJoin, error: photoErr ? { message: photoErr.message, details: photoErr.details, hint: photoErr.hint, code: photoErr.code } : null },
  });
}
