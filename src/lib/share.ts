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

const TEASER_PLACES = 3;

/** Reserved first path segments — must not collide with `@handle` public routes */
export const RESERVED_HANDLE_PATHS = new Set(["api", "p", "assets", "static", "sw.js"]);

/** Canonical hostname for pasted links (`VITE_PUBLIC_SITE_URL` in production). */
export function canonicalSiteOrigin(): string {
  const env =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_PUBLIC_SITE_URL
      ? String(import.meta.env.VITE_PUBLIC_SITE_URL).trim()
      : "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin)
    return window.location.origin.replace(/\/$/, "");
  return "https://vouch.app";
}

/** `https://vouch.app/{handle}` — profile card */
export function buildPublicProfileUrl(handle: string): string {
  const h = handle.trim().toLowerCase();
  if (!h || RESERVED_HANDLE_PATHS.has(h)) return "";
  return `${canonicalSiteOrigin()}/${h}`;
}

/** `https://vouch.app/{handle}/{listSlug}` — a specific place list */
export function buildPublicListUrl(handle: string, collection: Pick<Collection, "slug">): string {
  const base = buildPublicProfileUrl(handle);
  if (!base || !collection.slug) return "";
  return `${base}/${collection.slug}`;
}

/** Share URL uses only canonical cloud links — never hash payloads */
export function buildShareableCardUrl(
  payload: PublicSharePayload,
  handle?: string,
  opts?: { collection?: Collection | null }
): string {
  const h = handle?.trim().toLowerCase();
  if (!h) return "";
  if (opts?.collection?.slug) return buildPublicListUrl(h, opts.collection);
  return buildPublicProfileUrl(h);
}

export function appBaseUrl(): string {
  return canonicalSiteOrigin();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "Someone";
}

export function buildInviteLink(profile: UserProfile): string {
  const base = canonicalSiteOrigin();
  if (profile.handle?.trim())
    return buildInviteUrl(base, profile.handle);
  return "";
}

/** Short WhatsApp-friendly message — link does the heavy lifting */
export function buildTopFourShareBlurb(
  profile: UserProfile,
  topPlaces: UserPlace[],
  placeById: Record<string, Place>
): string {
  const name = firstName(profile.name);
  const count = topPlaces.length;
  if (count === 0) {
    return `${name} is sharing their taste in ${profile.city} on Vouch.`;
  }

  const previewNames = topPlaces
    .slice(0, 2)
    .map((item) => placeById[item.placeId]?.name)
    .filter(Boolean);

  const taste = profile.tasteTags.slice(0, 2).join(" · ");
  const spots =
    previewNames.length >= 2
      ? `${previewNames[0]} & ${previewNames[1]}`
      : previewNames[0] || `${count} spots`;

  return taste
    ? `${name}'s ${count} vouched spots in ${profile.city} — ${spots}. ${taste}.`
    : `${name}'s ${count} vouched spots in ${profile.city} — ${spots}.`;
}

export function buildPlaceShareBlurb(place: Place, profile: UserProfile): string {
  return `${firstName(profile.name)} vouches for ${place.name} (${place.area})`;
}

export function buildCollectionShareBlurb(collection: Collection, profile: UserProfile): string {
  return `${firstName(profile.name)} shared "${collection.title}" on Vouch`;
}

export function buildShareMessage(blurb: string, url: string): string {
  if (!url) return blurb;
  return `${blurb.trim()}\n\n${url}`;
}

/** @deprecated Long-form — only for in-app reference */
export function buildTopFourShareText(
  profile: UserProfile,
  topPlaces: UserPlace[],
  placeById: Record<string, Place>
): string {
  return buildTopFourShareBlurb(profile, topPlaces, placeById);
}

export function buildPlaceShareText(place: Place, why: string, profile: UserProfile): string {
  return buildPlaceShareBlurb(place, profile);
}

export function buildCollectionShareText(
  collection: Collection,
  profile: UserProfile,
  _placeById: Record<string, Place>
): string {
  return buildCollectionShareBlurb(collection, profile);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  const value = text.trim();
  if (!value) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through */
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

/** Short invite line without URL — prefer buildInviteShareMessage for sending. */
export function inviteMessage(profile: UserProfile): string {
  const name = firstName(profile.name);
  return `${name} invited you to Vouch — see their picks in ${profile.city} and make yours.`;
}

/** Full WhatsApp / share payload: hook + optional spot names + link on its own line. */
export function buildInviteShareMessage(
  profile: UserProfile,
  inviteUrl: string,
  previewPlaces: Place[] = []
): string {
  const name = firstName(profile.name);
  let hook: string;
  if (previewPlaces.length > 0) {
    const names = previewPlaces.slice(0, 2).map((p) => p.name);
    const spots =
      names.length >= 2 ? `${names[0]} & ${names[1]}` : names[0] ?? `${previewPlaces.length} spots`;
    hook = `${name} invited you to Vouch — ${spots} in ${profile.city}.`;
  } else {
    hook = inviteMessage(profile);
  }
  if (!inviteUrl.trim()) return hook;
  return buildShareMessage(hook, inviteUrl);
}

export type PublicShareRoute = { handle: string; listSlug?: string };

/**
 * Parses public profile URLs: `/:handle`, `/:handle/:list`, legacy `/p/:handle[/:list]`, `?u=&list=`.
 */
export function readPublicShareRoute(): PublicShareRoute | null {
  if (typeof window === "undefined") return null;

  const qs = new URLSearchParams(window.location.search);
  const qh = qs.get("u")?.trim().toLowerCase();
  const ql = qs.get("list")?.trim().toLowerCase();
  if (qh?.length && /^[a-z0-9][a-z0-9-]{1,62}$/.test(qh)) {
    const handle = RESERVED_HANDLE_PATHS.has(qh) ? null : qh;
    if (handle && ql?.length && /^[a-z0-9][a-z0-9-]{0,80}$/.test(ql))
      return { handle, listSlug: ql };
    if (handle) return { handle };
  }

  const path = window.location.pathname.replace(/\/$/, "") || "/";

  const legacy = path.match(
    /^\/p\/([a-z0-9][a-z0-9-]{1,62})(?:\/([a-z0-9][a-z0-9-]{0,80}))?$/i
  );
  if (legacy?.[1]) {
    const handle = legacy[1].toLowerCase();
    if (!RESERVED_HANDLE_PATHS.has(handle))
      return legacy[2]?.length ? { handle, listSlug: legacy[2].toLowerCase() } : { handle };
  }

  const two = path.match(
    /^\/([a-z0-9][a-z0-9-]{1,62})\/([a-z0-9][a-z0-9-]{0,80})$/i
  );
  if (two?.[1] && two[2]) {
    const handle = two[1].toLowerCase();
    if (!RESERVED_HANDLE_PATHS.has(handle)) return { handle, listSlug: two[2].toLowerCase() };
  }

  const one = path.match(/^\/([a-z0-9][a-z0-9-]{1,62})$/i);
  if (one?.[1]) {
    const handle = one[1].toLowerCase();
    if (!RESERVED_HANDLE_PATHS.has(handle)) return { handle };
  }

  return null;
}

export function readHandleFromUrl(): string | null {
  return readPublicShareRoute()?.handle ?? null;
}

export function readPublicProfileFromUrl(): PublicSharePayload | null {
  try {
    if (readHandleFromUrl()) return null;

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

export function teaserPlaceCount(total: number): number {
  return Math.min(TEASER_PLACES, total);
}

export function lockedPlaceCount(total: number): number {
  return Math.max(0, total - TEASER_PLACES);
}

export function openWhatsApp(text: string): void {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function nativeShare(data: {
  title: string;
  text: string;
  /** Merged into text — not passed as a separate field (many apps drop url when text is set). */
  url?: string;
}): Promise<"shared" | "copied" | "failed"> {
  const message = data.url ? buildShareMessage(data.text, data.url) : `${data.text}`.trim();
  if (!message) return "failed";

  if (navigator.share) {
    try {
      await navigator.share({ title: data.title, text: message });
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "failed";
    }
  }

  const copied = await copyToClipboard(message);
  return copied ? "copied" : "failed";
}
