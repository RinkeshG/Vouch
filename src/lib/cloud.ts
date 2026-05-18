import { PLACE_CATALOG } from "../data/places";
import type { FriendVouchCard } from "../types";
import { cardFromPublicPayload, type CircleMember } from "./circle";
import type { PublicSharePayload } from "./share";
import type { Friend, Place, UserProfile, VouchPersistedState } from "../types";
import { slugifyHandle, withHandleSuffix } from "./handle";
import { migrateCollectionSlugs } from "./listSlug";
import { getSupabase, isCloudEnabled } from "./supabase";

export type { CircleMember };

export type CloudProfileRow = {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  city: string;
  taste_tags: string[];
  onboarded: boolean;
  onboarding_step: number;
  app_state: VouchAppStateBlob;
  updated_at: string;
};

/** Everything except profile fields — stored in app_state jsonb */
export type VouchAppStateBlob = Omit<VouchPersistedState, "profile" | "version">;

export type PublicVouchSnapshot = {
  profile: Pick<UserProfile, "name" | "city" | "tasteTags">;
  userPlaces: VouchPersistedState["userPlaces"];
  collections: VouchPersistedState["collections"];
  sharedAt: number;
};

function appStateFromPersisted(state: VouchPersistedState): VouchAppStateBlob {
  return {
    userPlaces: state.userPlaces,
    customPlaces: state.customPlaces,
    collections: state.collections,
    friends: state.friends,
    events: state.events,
    planContext: state.planContext
  };
}

function persistedFromRow(row: CloudProfileRow): VouchPersistedState {
  const blob = row.app_state ?? ({} as VouchAppStateBlob);
  return {
    version: 1,
    profile: {
      name: row.display_name,
      city: row.city,
      tasteTags: row.taste_tags ?? [],
      onboarded: row.onboarded,
      onboardingStep: Math.min(3, Math.max(0, row.onboarding_step)) as 0 | 1 | 2 | 3,
      handle: row.handle
    },
    userPlaces: blob.userPlaces ?? [],
    customPlaces: blob.customPlaces ?? [],
    collections: migrateCollectionSlugs(blob.collections ?? []),
    friends: blob.friends ?? [],
    events: blob.events ?? [],
    planContext: blob.planContext ?? null
  };
}

export function buildPublicSnapshot(state: VouchPersistedState): PublicVouchSnapshot {
  const topIds = new Set(
    state.userPlaces.filter((p) => p.top && p.state === "vouched").map((p) => p.placeId)
  );
  const allVouched = state.userPlaces.filter((p) => p.state === "vouched");
  const sorted = [...allVouched].sort((a, b) => {
    const aTop = topIds.has(a.placeId) ? 1 : 0;
    const bTop = topIds.has(b.placeId) ? 1 : 0;
    if (aTop !== bTop) return bTop - aTop;
    return (b.vouchedAt ?? b.updatedAt) - (a.vouchedAt ?? a.updatedAt);
  });
  const catalogById = Object.fromEntries(PLACE_CATALOG.map((p) => [p.id, p]));
  const userPlaces = sorted.slice(0, 24).map((p) => ({
    ...p,
    top: topIds.has(p.placeId),
    why: p.why?.trim() || catalogById[p.placeId]?.tip || ""
  }));

  return {
    profile: {
      name: state.profile.name,
      city: state.profile.city,
      tasteTags: state.profile.tasteTags
    },
    userPlaces,
    collections: state.collections.filter((c) => c.placeIds.length > 0).slice(0, 6),
    sharedAt: Date.now()
  };
}

export function snapshotToPublicPayload(snapshot: PublicVouchSnapshot): PublicSharePayload {
  return {
    profile: snapshot.profile,
    userPlaces: snapshot.userPlaces,
    collections: snapshot.collections,
    sharedAt: snapshot.sharedAt
  };
}

export { ensureAnonymousSession as ensureAuthSession } from "./auth";

export async function loadCloudProfile(userId: string): Promise<VouchPersistedState | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return persistedFromRow(data as CloudProfileRow);
}

export async function isHandleAvailable(handle: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true;

  const { data } = await supabase
    .from("profiles")
    .select("handle")
    .eq("handle", handle.toLowerCase())
    .maybeSingle();

  return !data;
}

export async function reserveHandle(name: string, userId: string): Promise<string> {
  let candidate = slugifyHandle(name);
  if (await isHandleAvailable(candidate)) return candidate;

  for (let i = 0; i < 8; i++) {
    candidate = withHandleSuffix(slugifyHandle(name), Math.random().toString(36).slice(2, 6));
    if (await isHandleAvailable(candidate)) return candidate;
  }
  return withHandleSuffix("user", Date.now().toString(36).slice(-6));
}

export async function saveCloudProfile(
  userId: string,
  state: VouchPersistedState,
  handle: string
): Promise<{ ok: boolean; handle: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, handle, error: "Cloud not configured" };

  const normalizedHandle = handle.toLowerCase();
  const row = {
    user_id: userId,
    handle: normalizedHandle,
    display_name: state.profile.name,
    city: state.profile.city,
    taste_tags: state.profile.tasteTags,
    onboarded: state.profile.onboarded,
    onboarding_step: state.profile.onboardingStep,
    app_state: appStateFromPersisted(state),
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("profiles").update(row).eq("user_id", userId);
    if (error) return { ok: false, handle: existing.handle, error: error.message };
  } else {
    const { error } = await supabase.from("profiles").insert(row);
    if (error) return { ok: false, handle: normalizedHandle, error: error.message };
  }

  if (state.profile.onboarded) {
    await publishPublicVouch(userId, normalizedHandle, state);
  }

  return { ok: true, handle: normalizedHandle };
}

export async function publishPublicVouch(
  userId: string,
  handle: string,
  state: VouchPersistedState
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) return;

  const snapshot = buildPublicSnapshot(state);
  const { error } = await supabase.from("public_vouches").upsert({
    handle: handle.toLowerCase(),
    profile_id: profile.id,
    snapshot,
    updated_at: new Date().toISOString()
  });

  if (error) console.warn("[vouch] publish public card failed", error.message);
}

export async function fetchPublicVouchByHandle(handle: string): Promise<PublicSharePayload | null> {
  const card = await fetchFriendVouchCard(handle);
  if (!card) return null;
  return {
    profile: { name: card.name, city: card.city, tasteTags: card.tasteTags },
    userPlaces: card.userPlaces,
    collections: [],
    sharedAt: card.updatedAt
  };
}

export async function fetchFriendVouchCard(handle: string): Promise<FriendVouchCard | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const normalized = handle.toLowerCase();
  const { data, error } = await supabase
    .from("public_vouches")
    .select("snapshot, updated_at")
    .eq("handle", normalized)
    .maybeSingle();

  if (error || !data?.snapshot) return null;
  const snapshot = data.snapshot as PublicVouchSnapshot;
  const payload = snapshotToPublicPayload(snapshot);
  const updatedAt = data.updated_at ? new Date(data.updated_at).getTime() : Date.now();
  return cardFromPublicPayload(normalized, payload, updatedAt);
}

export async function fetchFriendVouchCards(handles: string[]): Promise<Record<string, FriendVouchCard>> {
  const supabase = getSupabase();
  const out: Record<string, FriendVouchCard> = {};
  if (!supabase || handles.length === 0) return out;

  const normalized = [...new Set(handles.map((h) => h.toLowerCase()))];
  const { data, error } = await supabase
    .from("public_vouches")
    .select("handle, snapshot, updated_at")
    .in("handle", normalized);

  if (error || !data) return out;

  for (const row of data) {
    if (!row.snapshot) continue;
    const snapshot = row.snapshot as PublicVouchSnapshot;
    const payload = snapshotToPublicPayload(snapshot);
    const updatedAt = row.updated_at ? new Date(row.updated_at).getTime() : Date.now();
    out[row.handle] = cardFromPublicPayload(row.handle, payload, updatedAt);
  }
  return out;
}

/** Everyone in your circle: people you invited + person who invited you */
export async function fetchCircleMembers(
  myHandle: string,
  myUserId: string
): Promise<CircleMember[]> {
  const supabase = getSupabase();
  if (!supabase || !myHandle) return [];

  const members = new Map<string, CircleMember>();
  const handle = myHandle.toLowerCase();

  const { data: asInviter } = await supabase
    .from("invite_links")
    .select("invitee_user_id")
    .eq("inviter_handle", handle);

  if (asInviter) {
    for (const row of asInviter) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("handle, display_name, city, taste_tags, user_id")
        .eq("user_id", row.invitee_user_id)
        .eq("onboarded", true)
        .maybeSingle();
      if (profile?.handle) {
        members.set(profile.handle, {
          handle: profile.handle,
          name: profile.display_name,
          city: profile.city,
          tasteTags: profile.taste_tags ?? [],
          userId: profile.user_id
        });
      }
    }
  }

  const { data: asInvitee } = await supabase
    .from("invite_links")
    .select("inviter_handle")
    .eq("invitee_user_id", myUserId)
    .maybeSingle();

  if (asInvitee?.inviter_handle) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("handle, display_name, city, taste_tags, user_id")
      .eq("handle", asInvitee.inviter_handle)
      .eq("onboarded", true)
      .maybeSingle();
    if (profile?.handle) {
      members.set(profile.handle, {
        handle: profile.handle,
        name: profile.display_name,
        city: profile.city,
        tasteTags: profile.taste_tags ?? [],
        userId: profile.user_id
      });
    }
  }

  return [...members.values()];
}

export async function fetchInviterProfile(handle: string): Promise<{
  name: string;
  city: string;
  tasteTags: string[];
} | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("display_name, city, taste_tags")
    .eq("handle", handle.toLowerCase())
    .eq("onboarded", true)
    .maybeSingle();

  if (!data) return null;
  return {
    name: data.display_name,
    city: data.city,
    tasteTags: data.taste_tags ?? []
  };
}

export async function redeemInvite(
  inviterHandle: string,
  inviteeUserId: string,
  inviteeHandle?: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const handle = inviterHandle.toLowerCase();
  const { error } = await supabase.from("invite_links").insert({
    inviter_handle: handle,
    invitee_user_id: inviteeUserId,
    invitee_handle: inviteeHandle?.toLowerCase() ?? null
  });

  return !error;
}

/** After onboarding: add inviter as a linked friend */
export async function friendFromInviter(
  inviterHandle: string,
  existingFriends: Friend[]
): Promise<Friend | null> {
  const inviter = await fetchInviterProfile(inviterHandle);
  if (!inviter) return null;

  const key = inviterHandle.toLowerCase();
  const already = existingFriends.some((f) => f.profileHandle?.toLowerCase() === key);
  if (already) return null;

  return {
    id: `linked-${key}`,
    name: inviter.name.split(/\s+/)[0] || inviter.name,
    city: inviter.city,
    trustedFor: inviter.tasteTags.slice(0, 3),
    createdAt: Date.now(),
    profileHandle: key
  };
}

/** Build Friend entry for someone who joined via your invite */
export function friendFromMember(member: CircleMember): Friend {
  return {
    id: `linked-${member.handle}`,
    name: member.name.split(/\s+/)[0] || member.name,
    city: member.city,
    trustedFor: member.tasteTags.slice(0, 3),
    createdAt: Date.now(),
    profileHandle: member.handle.toLowerCase()
  };
}

/** Merge catalog + custom places for public profile rendering */
export function placesForPublicPayload(payload: PublicSharePayload): Record<string, Place> {
  const map: Record<string, Place> = {};
  for (const place of PLACE_CATALOG) {
    map[place.id] = place;
  }
  for (const item of payload.userPlaces) {
    if (!map[item.placeId] && item.placeId.startsWith("custom-")) {
      map[item.placeId] = {
        id: item.placeId,
        name: "Saved place",
        area: payload.profile.city,
        city: payload.profile.city,
        price: "treat",
        color: "#5f6158",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
        tags: item.tags,
        bestFor: [],
        tip: item.why || "",
        caveat: ""
      };
    }
  }
  return map;
}

export { isCloudEnabled };
