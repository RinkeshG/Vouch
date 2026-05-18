import type { Collection, Place, UserPlace, UserProfile } from "../types";
import { tasteBio } from "./format";
import { buildInviteUrl } from "./invite";

export type PublicSharePayload = {
  profile: Pick<UserProfile, "name" | "city" | "tasteTags">;
  userPlaces: UserPlace[];
  collections: Collection[];
  sharedAt: number;
};

type CompactShareData = {
  n: string;
  c: string;
  t: string[];
  p: string[];
};

export function appBaseUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "";
}

export function buildTopFourShareText(
  profile: UserProfile,
  topPlaces: UserPlace[],
  placeById: Record<string, Place>
): string {
  const lines = topPlaces
    .map((item, index) => {
      const place = placeById[item.placeId];
      if (!place) return null;
      return `${index + 1}. ${place.name} (${place.area}) — ${item.why || place.tip}`;
    })
    .filter(Boolean);

  return [
    `${profile.name}'s Top 4 in ${profile.city}`,
    tasteBio(profile.tasteTags),
    "",
    ...lines,
    "",
    "Places I'd actually send a friend."
  ].join("\n");
}

export function buildPlaceShareText(place: Place, why: string, profile: UserProfile): string {
  return [
    `${profile.name} vouches for ${place.name}`,
    `${place.area} · ${place.city}`,
    "",
    why,
    "",
    place.caveat ? `Heads up: ${place.caveat}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCollectionShareText(
  collection: Collection,
  profile: UserProfile,
  placeById: Record<string, Place>
): string {
  const lines = collection.placeIds
    .map((id, index) => {
      const place = placeById[id];
      if (!place) return null;
      return `${index + 1}. ${place.name} — ${place.area}`;
    })
    .filter(Boolean);

  return [collection.title, collection.note, "", ...lines, "", `— ${profile.name}, via Vouch`].join("\n");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    } catch {
      return false;
    }
  }
}

export function inviteMessage(profile: UserProfile): string {
  const first = profile.name.trim().split(/\s+/)[0] || "I";
  return `${first} is on Vouch — real places they'd send you in ${profile.city}. Make yours and we'll be connected.`;
}

/** Public card URL — prefers stable handle link when cloud sync is active */
export function buildPublicProfileUrl(
  payload: PublicSharePayload,
  handle?: string
): string {
  const base = appBaseUrl() || "https://vouch.app";

  if (handle) {
    const url = new URL(base);
    url.search = "";
    url.hash = "";
    url.searchParams.set("u", handle.toLowerCase());
    return url.toString();
  }

  const topPlaces = payload.userPlaces
    .filter((p) => p.top && p.state === "vouched")
    .slice(0, 4)
    .map((p) => p.placeId);

  const compact: CompactShareData = {
    n: payload.profile.name,
    c: payload.profile.city,
    t: payload.profile.tasteTags.slice(0, 3),
    p: topPlaces
  };

  const url = new URL(base);
  url.search = "";
  url.hash = `v=${encodeURIComponent(JSON.stringify(compact))}`;
  return url.toString();
}

export function buildInviteLink(profile: UserProfile): string {
  const base = appBaseUrl();
  if (profile.handle) {
    return buildInviteUrl(base, profile.handle);
  }
  return buildPublicProfileUrl(
    {
      profile: {
        name: profile.name,
        city: profile.city,
        tasteTags: profile.tasteTags
      },
      userPlaces: [],
      collections: [],
      sharedAt: Date.now()
    },
    undefined
  );
}

export function readPublicProfileFromUrl(): PublicSharePayload | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const handle = params.get("u");
    if (handle) {
      return null;
    }

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const compactRaw = hashParams.get("v");
    if (compactRaw) {
      const compact = JSON.parse(decodeURIComponent(compactRaw)) as CompactShareData;
      return {
        profile: { name: compact.n, city: compact.c, tasteTags: compact.t },
        userPlaces: compact.p.map((placeId) => ({
          placeId,
          state: "vouched" as const,
          why: "",
          tags: [],
          top: true,
          updatedAt: Date.now()
        })),
        collections: [],
        sharedAt: Date.now()
      };
    }

    const raw = hashParams.get("profile");
    return raw ? (JSON.parse(decodeURIComponent(raw)) as PublicSharePayload) : null;
  } catch {
    return null;
  }
}

export function readHandleFromUrl(): string | null {
  const handle = new URLSearchParams(window.location.search).get("u")?.trim().toLowerCase();
  return handle || null;
}

export function openWhatsApp(text: string): void {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function nativeShare(data: {
  title: string;
  text: string;
  url: string;
}): Promise<"shared" | "copied" | "failed"> {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return "shared";
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
  }

  const copied = await copyToClipboard(`${data.text}\n\n${data.url}`);
  return copied ? "copied" : "failed";
}
