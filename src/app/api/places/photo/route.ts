import { NextResponse, type NextRequest } from "next/server";

const GOOGLE_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

const CACHE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  const maxWidth = request.nextUrl.searchParams.get("w") || "800";

  if (!ref) {
    return NextResponse.json({ error: "Missing photo reference" }, { status: 400 });
  }

  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: "Photo service unavailable" }, { status: 503 });
  }

  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${ref}&key=${GOOGLE_API_KEY}`;

  const res = await fetch(url, { next: { revalidate: CACHE_SECONDS } });

  if (!res.ok) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=${CACHE_SECONDS}, immutable`,
    },
  });
}
