import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Internal data endpoint for the OG image generator.
 * Fetches a user's profile + four vouches for rendering the card.
 *
 * This is NOT a public API — protected by x-og-secret header.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  // Basic auth — only the OG generator should call this
  const secret = request.headers.get("x-og-secret");
  if (secret !== (process.env.OG_INTERNAL_SECRET || "og-internal")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if Supabase is configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    // Demo mode — return demo data
    return NextResponse.json({
      displayName: "Priya Sharma",
      tasteLine: "I eat like a local tourist — street food first, always.",
      vouches: [
        { placeName: "Vidyarthi Bhavan", area: "Basavanagudi", take: "The gold standard masala dosa. Crispy, buttery, no shortcuts." },
        { placeName: "Nagarjuna", area: "Residency Road", take: "Andhra meals on a banana leaf — the biryani is what legends are made of." },
        { placeName: "CTR", area: "Malleshwaram", take: "Benne masala dosa since 1920. Worth every minute in that queue." },
        { placeName: "Brahmin's Coffee Bar", area: "Basavanagudi", take: "Idli-vada-coffee for ₹50. No menu needed." },
      ],
    });
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, handle, display_name, taste_line")
      .eq("handle", handle)
      .eq("is_public", true)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get first 4 vouches with place info
    const { data: vouchesData } = await supabase
      .from("vouches")
      .select(`
        id, take,
        places!vouches_place_id_fkey ( name, area )
      `)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: true })
      .limit(4);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vouches = (vouchesData || []).map((v: any) => ({
      placeName: v.places?.name || "Unknown",
      area: v.places?.area || "",
      take: v.take,
    }));

    return NextResponse.json({
      displayName: profile.display_name,
      tasteLine: profile.taste_line || "",
      vouches,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
