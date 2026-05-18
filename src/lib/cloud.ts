import { PLACE_CATALOG } from "../data/places";
import type { PublicSharePayload } from "./share";
import type { Friend, Place, UserProfile, VouchPersistedState } from "../types";
import { slugifyHandle, withHandleSuffix } from "./handle";
import { getSupabase, isCloudEnabled } from "./supabase";

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
    collections: blob.collections ?? [],
    friends: blob.friends ?? [],
    events: blob.events ?? [],
    planContext: blob.planContext ?? null
  };
}

export function buildPublicSnapshot(state: VouchPersistedState): PublicVouchSnapshot {
  const topIds = new Set(
    state.userPlaces.filter((p) => p.top && p.state === "vouched").map((p) => p.placeId)
  );
  const topPlaces = state.userPlaces.filter((p) => topIds.has(p.placeId)).slice(0, 4);
  const fallback = state.userPlaces.filter((p) => p.state === "vouched").slice(0, 4);
  const catalogById = Object.fromEntries(PLACE_CATALOG.map((p) => [p.id, p]));
  const userPlaces = (topPlaces.length ? topPlaces : fallback).map((p) => ({
    ...p,
    top: true,
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

export async function ensureAuthSession(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user.id) return sessionData.session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    console.warn("[vouch] anonymous auth failed", error?.message);
    return null;
  }
  return data.user.id;
}

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
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("public_vouches")
    .select("snapshot")
    .eq("handle", handle.toLowerCase())
    .maybeSingle();

  if (error || !data?.snapshot) return null;
  const snapshot = data.snapshot as PublicVouchSnapshot;
  return snapshotToPublicPayload(snapshot);
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
  inviteeUserId: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const handle = inviterHandle.toLowerCase();
  const { error } = await supabase.from("invite_links").insert({
    inviter_handle: handle,
    invitee_user_id: inviteeUserId
  });

  return !error;
}

/** After onboarding: add inviter as a linked friend in local + cloud state */
export async function friendFromInviter(
  inviterHandle: string,
  existingFriends: Friend[]
): Promise<Friend | null> {
  const inviter = await fetchInviterProfile(inviterHandle);
  if (!inviter) return null;

  const already = existingFriends.some(
    (f) => f.profileHandle?.toLowerCase() === inviterHandle.toLowerCase()
  );
  if (already) return null;

  return {
    id: `linked-${inviterHandle}`,
    name: inviter.name.split(/\s+/)[0] || inviter.name,
    city: inviter.city,
    trustedFor: inviter.tasteTags.slice(0, 3),
    createdAt: Date.now(),
    profileHandle: inviterHandle.toLowerCase()
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
