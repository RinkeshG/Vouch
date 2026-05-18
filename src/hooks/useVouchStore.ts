import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PLACE_CATALOG } from "../data/places";
import {
  ensureAuthSession,
  friendFromInviter,
  isCloudEnabled,
  loadCloudProfile,
  publishPublicVouch,
  redeemInvite,
  reserveHandle,
  saveCloudProfile
} from "../lib/cloud";
import { clearPendingInvite, readPendingInvite } from "../lib/invite";
import { defaultPersistedState, loadState, saveState } from "../lib/storage";
import {
  filterVouchedForContext,
  mergePlaces,
  nextTopSlot,
  savesFromFriendsCount,
  topFour
} from "../lib/selectors";
import { getSupabase } from "../lib/supabase";
import type {
  ActivityEvent,
  Collection,
  Friend,
  Place,
  PlaceState,
  Sheet,
  ToastState,
  UserPlace,
  UserProfile,
  VouchPersistedState
} from "../types";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useVouchStore() {
  const [state, setState] = useState<VouchPersistedState>(() => loadState());
  const [hydrated, setHydrated] = useState(false);
  const [cloudReady, setCloudReady] = useState(!isCloudEnabled);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const syncTimerRef = useRef<number | null>(null);
  const skipNextSyncRef = useRef(false);

  const [tab, setTab] = useState<"home" | "places" | "friends" | "you">("home");
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [stampPlaceId, setStampPlaceId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const syncToCloud = useCallback(async (next: VouchPersistedState, handle?: string) => {
    const userId = userIdRef.current;
    if (!isCloudEnabled || !userId) return;

    const resolvedHandle = handle ?? next.profile.handle;
    if (!resolvedHandle && next.profile.onboarded) return;

    setCloudSyncing(true);
    try {
      let h = resolvedHandle;
      if (!h && next.profile.name.trim().length >= 2) {
        h = await reserveHandle(next.profile.name, userId);
      }
      if (!h) return;

      const result = await saveCloudProfile(userId, { ...next, profile: { ...next.profile, handle: h } }, h);
      if (result.ok) {
        setState((current) => ({
          ...current,
          profile: { ...current.profile, handle: result.handle }
        }));
      }
    } finally {
      setCloudSyncing(false);
    }
  }, []);

  const scheduleCloudSync = useCallback(
    (next: VouchPersistedState) => {
      if (!isCloudEnabled || !userIdRef.current) return;
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = window.setTimeout(() => {
        void syncToCloud(next);
      }, 800);
    },
    [syncToCloud]
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const local = loadState();

      if (!isCloudEnabled) {
        setState(local);
        setHydrated(true);
        setCloudReady(true);
        return;
      }

      const userId = await ensureAuthSession();
      if (cancelled) return;

      if (!userId) {
        setState(local);
        setHydrated(true);
        setCloudReady(true);
        return;
      }

      userIdRef.current = userId;
      const cloud = await loadCloudProfile(userId);

      if (cancelled) return;

      if (cloud) {
        skipNextSyncRef.current = true;
        setState(cloud);
      } else if (local.profile.onboarded && local.profile.name.trim().length >= 2) {
        skipNextSyncRef.current = true;
        const handle = await reserveHandle(local.profile.name, userId);
        const merged = { ...local, profile: { ...local.profile, handle } };
        setState(merged);
        await saveCloudProfile(userId, merged, handle);
      } else {
        setState(local);
      }

      setHydrated(true);
      setCloudReady(true);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    scheduleCloudSync(state);
  }, [state, hydrated, scheduleCloudSync]);

  const placeById = useMemo(
    () => mergePlaces(PLACE_CATALOG, state.customPlaces),
    [state.customPlaces]
  );

  const vouched = useMemo(
    () => state.userPlaces.filter((p) => p.state === "vouched"),
    [state.userPlaces]
  );
  const want = useMemo(() => state.userPlaces.filter((p) => p.state === "want"), [state.userPlaces]);
  const saved = useMemo(() => state.userPlaces.filter((p) => p.state === "saved"), [state.userPlaces]);
  const topPlaces = useMemo(() => topFour(state.userPlaces), [state.userPlaces]);
  const savesFromFriends = useMemo(() => savesFromFriendsCount(state.userPlaces), [state.userPlaces]);

  const contextVouched = useMemo(
    () => filterVouchedForContext(vouched, state.planContext),
    [vouched, state.planContext]
  );

  const activePlace = activePlaceId ? placeById[activePlaceId] : null;
  const activeUserPlace = activePlaceId
    ? state.userPlaces.find((p) => p.placeId === activePlaceId)
    : null;
  const activeCollection = activeCollectionId
    ? state.collections.find((c) => c.id === activeCollectionId)
    : null;

  const searchedPlaces = useMemo(() => {
    const city = state.profile.city;
    const q = query.trim().toLowerCase();
    return Object.values(placeById).filter((place) => {
      if (place.city !== city) return false;
      if (!q) return true;
      const haystack = `${place.name} ${place.area} ${place.tags.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [placeById, query, state.profile.city]);

  const patch = useCallback((updater: (current: VouchPersistedState) => VouchPersistedState) => {
    setState((current) => updater(current));
  }, []);

  const showToast = useCallback((message: string, kind: "default" | "stamp" = "default") => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), kind === "stamp" ? 3200 : 2600);
  }, []);

  const pushEvent = useCallback(
    (event: Omit<ActivityEvent, "id" | "at">) => {
      patch((current) => ({
        ...current,
        events: [{ ...event, id: uid(), at: Date.now() }, ...current.events].slice(0, 40)
      }));
    },
    [patch]
  );

  const updateProfile = useCallback(
    (partial: Partial<UserProfile>) => {
      patch((current) => ({
        ...current,
        profile: { ...current.profile, ...partial }
      }));
    },
    [patch]
  );

  const setPlaceState = useCallback(
    (
      placeId: string,
      placeState: PlaceState,
      options?: { why?: string; tags?: string[]; addedFrom?: string; silent?: boolean }
    ) => {
      const place = placeById[placeId];
      if (!place) return;

      const now = Date.now();
      let stamped = false;

      patch((current) => {
        const existing = current.userPlaces.find((p) => p.placeId === placeId);
        const canTop = placeState === "vouched" && nextTopSlot(current.userPlaces);

        const nextPlace: UserPlace = existing
          ? {
              ...existing,
              state: placeState,
              why: options?.why ?? existing.why,
              tags: options?.tags ?? existing.tags,
              addedFrom: options?.addedFrom ?? existing.addedFrom,
              top: existing.top || canTop,
              vouchedAt: placeState === "vouched" ? now : existing.vouchedAt,
              updatedAt: now
            }
          : {
              placeId,
              state: placeState,
              why: options?.why ?? place.tip,
              tags: options?.tags ?? place.tags.slice(0, 3),
              addedFrom: options?.addedFrom,
              top: canTop,
              vouchedAt: placeState === "vouched" ? now : undefined,
              updatedAt: now
            };

        const userPlaces = existing
          ? current.userPlaces.map((p) => (p.placeId === placeId ? nextPlace : p))
          : [nextPlace, ...current.userPlaces];

        return { ...current, userPlaces };
      });

      if (placeState === "vouched") {
        stamped = true;
        pushEvent({ type: "vouched", placeId });
        if (!options?.silent) {
          setStampPlaceId(placeId);
          showToast("You vouched it.", "stamp");
        }
      } else if (placeState === "saved" && options?.addedFrom) {
        pushEvent({ type: "saved_from_friend", placeId, friendId: options.addedFrom });
        if (!options?.silent) showToast("Saved from your friend");
      } else if (placeState === "want") {
        pushEvent({ type: "want", placeId });
        if (!options?.silent) showToast("On your want-to-try list");
      }
      return stamped;
    },
    [placeById, patch, pushEvent, showToast]
  );

  const confirmVouch = useCallback(
    (placeId: string, why: string, tags: string[]) => {
      setPlaceState(placeId, "vouched", { why, tags });
      setSheet(null);
    },
    [setPlaceState]
  );

  const saveFromFriend = useCallback(
    (placeId: string, friendId: string, why: string) => {
      const place = placeById[placeId];
      if (!place) return;
      setPlaceState(placeId, "saved", {
        why,
        tags: place.tags.slice(0, 3),
        addedFrom: friendId
      });
      setSheet(null);
    },
    [placeById, setPlaceState]
  );

  const addCustomPlace = useCallback(
    (name: string, area: string) => {
      const id = `custom-${uid()}`;
      const placeholderImages = [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80"
      ];
      const placeholderColors = [
        "#5f6158", "#6a4a3d", "#3d5a6a", "#7a5a3d",
        "#4d6447", "#8f6f3d", "#57364e", "#2f574d"
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
      }
      const idx = Math.abs(hash) % placeholderImages.length;

      const place: Place = {
        id,
        name: name.trim(),
        area: area.trim() || state.profile.city,
        city: state.profile.city,
        price: "treat",
        color: placeholderColors[idx],
        image: placeholderImages[idx],
        tags: [],
        bestFor: [],
        tip: "",
        caveat: ""
      };
      patch((current) => ({
        ...current,
        customPlaces: [place, ...current.customPlaces]
      }));
      return id;
    },
    [patch, state.profile.city]
  );

  const addFriend = useCallback(
    (name: string, trustedFor: string[]) => {
      const friend: Friend = {
        id: uid(),
        name: name.trim(),
        city: state.profile.city,
        trustedFor,
        createdAt: Date.now()
      };
      patch((current) => ({ ...current, friends: [friend, ...current.friends] }));
      showToast(`${friend.name} added`);
      setSheet(null);
      return friend.id;
    },
    [patch, showToast, state.profile.city]
  );

  const addCollection = useCallback((collection: Collection) => {
    patch((current) => ({
      ...current,
      collections: [collection, ...current.collections]
    }));
    pushEvent({ type: "collection", collectionId: collection.id });
    showToast("List created");
    setActiveCollectionId(collection.id);
    setSheet(null);
  }, [patch, pushEvent, showToast]);

  const updatePlaceNote = useCallback(
    (placeId: string, why: string, tags: string[]) => {
      patch((current) => ({
        ...current,
        userPlaces: current.userPlaces.map((p) =>
          p.placeId === placeId ? { ...p, why, tags, updatedAt: Date.now() } : p
        )
      }));
      showToast("Note updated");
    },
    [patch, showToast]
  );

  const removePlace = useCallback(
    (placeId: string) => {
      patch((current) => ({
        ...current,
        userPlaces: current.userPlaces.filter((p) => p.placeId !== placeId)
      }));
      setActivePlaceId(null);
      showToast("Place removed");
    },
    [patch, showToast]
  );

  const toggleTopSlot = useCallback(
    (placeId: string) => {
      patch((current) => ({
        ...current,
        userPlaces: current.userPlaces.map((p) =>
          p.placeId === placeId ? { ...p, top: !p.top, updatedAt: Date.now() } : p
        )
      }));
    },
    [patch]
  );

  const reorderTop = useCallback(
    (placeId: string, direction: "up" | "down") => {
      const slots = topFour(state.userPlaces);
      const index = slots.findIndex((p) => p.placeId === placeId);
      if (index < 0) return;
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= slots.length) return;

      const order = slots.map((p) => p.placeId);
      [order[index], order[swapIndex]] = [order[swapIndex], order[index]];

      patch((current) => ({
        ...current,
        userPlaces: current.userPlaces.map((p) => {
          const rank = order.indexOf(p.placeId);
          if (rank === -1) return { ...p, top: false };
          return { ...p, top: true, vouchedAt: (4 - rank) * 1000 + (p.vouchedAt ?? p.updatedAt) };
        })
      }));
    },
    [patch, state.userPlaces]
  );

  const setPlanContext = useCallback(
    (contextId: string | null) => {
      patch((current) => ({ ...current, planContext: contextId }));
    },
    [patch]
  );

  const openPlace = useCallback((placeId: string) => {
    setActivePlaceId(placeId);
    setActiveCollectionId(null);
  }, []);

  const closeDetail = useCallback(() => {
    setActivePlaceId(null);
    setActiveCollectionId(null);
  }, []);

  const finishOnboarding = useCallback(async () => {
    const pendingInvite = readPendingInvite();

    let nextState!: VouchPersistedState;
    setState((current) => {
      nextState = {
        ...current,
        profile: {
          ...current.profile,
          onboarded: true,
          onboardingStep: 3
        }
      };
      return nextState;
    });

    const userId = userIdRef.current ?? (await ensureAuthSession());
    if (userId) userIdRef.current = userId;

    let handle = nextState.profile.handle;
    if (userId && isCloudEnabled && !handle) {
      handle = await reserveHandle(nextState.profile.name, userId);
    }

    if (pendingInvite && userId && handle) {
      const inviterFriend = await friendFromInviter(pendingInvite, nextState.friends);
      if (inviterFriend) {
        nextState = {
          ...nextState,
          profile: { ...nextState.profile, handle },
          friends: [inviterFriend, ...nextState.friends]
        };
        await redeemInvite(pendingInvite, userId);
        clearPendingInvite();
        showToast(`Connected with ${inviterFriend.name}`);
      }
    }

    if (userId && handle && isCloudEnabled) {
      skipNextSyncRef.current = true;
      const withHandle: VouchPersistedState = {
        ...nextState,
        profile: { ...nextState.profile, handle }
      };
      setState(withHandle);
      await saveCloudProfile(userId, withHandle, handle);
      await publishPublicVouch(userId, handle, withHandle);
    } else {
      setState(nextState);
    }

    setTab("home");
    showToast(handle ? "Your Vouch is live — share it with friends" : "Your Vouch is ready to share");
  }, [patch, showToast]);

  const resetApp = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
      userIdRef.current = null;
    }
    clearPendingInvite();
    setState(defaultPersistedState());
    setTab("home");
    setActivePlaceId(null);
    setActiveCollectionId(null);
    setSheet(null);
    if (isCloudEnabled) {
      const userId = await ensureAuthSession();
      if (userId) userIdRef.current = userId;
    }
    showToast("Reset complete");
  }, [showToast]);

  const flushCloudSync = useCallback(() => {
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    void syncToCloud(state, state.profile.handle);
  }, [state, syncToCloud]);

  return {
    hydrated: hydrated && cloudReady,
    cloudEnabled: isCloudEnabled,
    cloudSyncing,
    state,
    tab,
    setTab,
    profile: state.profile,
    userPlaces: state.userPlaces,
    customPlaces: state.customPlaces,
    collections: state.collections,
    friends: state.friends,
    events: state.events,
    planContext: state.planContext,
    placeById,
    vouched,
    want,
    saved,
    topPlaces,
    contextVouched,
    savesFromFriends,
    activePlace,
    activeUserPlace,
    activeCollection,
    activePlaceId,
    activeCollectionId,
    sheet,
    setSheet,
    toast,
    stampPlaceId,
    setStampPlaceId,
    query,
    setQuery,
    searchedPlaces,
    patch,
    updateProfile,
    showToast,
    setPlaceState,
    confirmVouch,
    saveFromFriend,
    updatePlaceNote,
    removePlace,
    toggleTopSlot,
    addCustomPlace,
    addFriend,
    addCollection,
    reorderTop,
    setPlanContext,
    openPlace,
    closeDetail,
    setActiveCollectionId,
    finishOnboarding,
    resetApp,
    flushCloudSync
  };
}
