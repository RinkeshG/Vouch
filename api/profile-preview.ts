import { PLACE_CATALOG } from "../src/data/places";
import { slugifyListTitle } from "../src/lib/listSlug";

type SnapCollection = { title: string; placeIds: string[]; slug?: string };

type PublicSnapshot = {
  profile: { name: string; city: string; tasteTags: string[] };
  userPlaces: Array<{ placeId: string; state: string; why?: string; top?: boolean }>;
  collections?: SnapCollection[];
};

const BOT_UA =
  /bot|facebook|whatsapp|twitter|linkedin|slack|telegram|discord|preview|googlebot|bingbot|curl|wget|embed/i;

const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function upscaleOgImage(src: string): string {
  if (!src.includes("images.unsplash.com")) return src;
  try {
    const u = new URL(src);
    u.searchParams.set("w", "1200");
    u.searchParams.set("q", "85");
    u.searchParams.set("auto", "format");
    u.searchParams.set("fit", "crop");
    return u.toString();
  } catch {
    return src;
  }
}

function catalogImg(placeId: string): string | undefined {
  const p = PLACE_CATALOG.find((x) => x.id === placeId);
  return p?.image ? upscaleOgImage(p.image) : undefined;
}

async function fetchSnapshot(handle: string): Promise<PublicSnapshot | null> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const url = new URL(`${supabaseUrl}/rest/v1/public_vouches`);
  url.searchParams.set("handle", `eq.${handle}`);
  url.searchParams.set("select", "snapshot");

  const res = await fetch(url.toString(), {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    }
  });

  if (!res.ok) return null;
  const rows = (await res.json()) as { snapshot: PublicSnapshot }[];
  return rows[0]?.snapshot ?? null;
}

function matchCollection(
  collections: SnapCollection[] | undefined,
  listParam: string
): SnapCollection | undefined {
  if (!collections?.length) return undefined;
  const want = listParam.trim().toLowerCase();
  return collections.find((c) => (c.slug || slugifyListTitle(c.title)).toLowerCase() === want);
}

export default async function handler(
  req: { headers: Record<string, string | string[] | undefined>; query: Record<string, string | string[] | undefined> },
  res: {
    status: (code: number) => { send: (body: string) => void };
    writeHead: (code: number, headers: Record<string, string>) => void;
    end: () => void;
    setHeader: (key: string, value: string) => void;
  }
) {
  const handle = String(req.query.handle || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  if (!handle) {
    res.status(400).send("Missing handle");
    return;
  }

  const listRaw = req.query.list;
  const listParam = typeof listRaw === "string" ? listRaw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") : "";

  const host = String(req.headers.host || "vouch.app");
  const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const origin = `${protocol}://${host}`;
  const qs = new URLSearchParams({ u: handle });
  if (listParam) qs.set("list", listParam);
  const spaUrl = `${origin}/?${qs.toString()}`;

  const userAgent = String(req.headers["user-agent"] || "");
  const isBot = BOT_UA.test(userAgent);

  if (!isBot) {
    res.writeHead(302, { Location: spaUrl });
    res.end();
    return;
  }

  const snapshot = await fetchSnapshot(handle);
  const firstNameVal = snapshot?.profile.name?.trim().split(/\s+/)[0] || handle;
  const cityVal = snapshot?.profile.city || "your city";

  let title: string;
  let description: string;
  let ogImage = DEFAULT_OG_IMAGE;
  const canonicalPath =
    listParam && listParam.length > 0 ? `/${encodeURIComponent(handle)}/${encodeURIComponent(listParam)}` : `/${encodeURIComponent(handle)}`;
  const canonicalUrl = `${origin}${canonicalPath}`;

  if (snapshot && listParam) {
    const coll = matchCollection(snapshot.collections, listParam);
    if (coll) {
      title = `${firstNameVal}'s list · ${coll.title}`;
      description = `${coll.placeIds.length} place${coll.placeIds.length === 1 ? "" : "s"} ${firstNameVal} would send first — curated on Vouch.`;
      const firstPid = coll.placeIds[0];
      ogImage = (firstPid && catalogImg(firstPid)) || ogImage;
    } else {
      title = `${firstNameVal}'s Vouch`;
      description = `${firstNameVal} shares taste-led picks in ${cityVal}.`;
    }
  } else if (snapshot) {
    const vouched = snapshot.userPlaces.filter((p) => p.state === "vouched");
    const top = vouched.filter((p) => p.top);
    const picks = (top.length ? top : vouched).slice(0, 3);
    const count = vouched.length;
    title = `${firstNameVal}'s taste · ${cityVal}`;
    description =
      count > 0
        ? `${firstNameVal} vouched ${count} spot${count === 1 ? "" : "s"} they'd send a friend. Peek the shortlist — then make yours.`
        : `${firstNameVal} is building picks on Vouch in ${cityVal}.`;

    const firstPid = picks[0]?.placeId;
    ogImage = (firstPid && catalogImg(firstPid)) || ogImage;
  } else {
    title = `${firstNameVal} on Vouch`;
    description = "Trusted picks from people you know — not noisy reviews.";
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(spaUrl)}" />
</head>
<body>
  <p><a href="${escapeHtml(spaUrl)}">${escapeHtml(title)} — open in Vouch</a></p>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.status(200).send(html);
}
