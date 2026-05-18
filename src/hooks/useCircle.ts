import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchCircleMembers,
  fetchFriendVouchCard,
  fetchFriendVouchCards,
  friendFromMember,
  isCloudEnabled
} from "../lib/cloud";
import { buildCircleFeed, mergeCircleFriends } from "../lib/circle";
import { fetchSavesFromMyVouches } from "../lib/influence";
import type { CircleFeedItem, FriendVouchCard, PlaceSaveEvent, VouchPersistedState } from "../types";

export function useCircle(
  state: VouchPersistedState,
  patch: (updater: (current: VouchPersistedState) => VouchPersistedState) => void,
  userIdRef: React.RefObject<string | null>,
  hydrated: boolean,
  onboarded: boolean
) {
  const [friendVouchCards, setFriendVouchCards] = useState<Record<string, FriendVouchCard>>({});
  const [circleFeed, setCircleFeed] = useState<CircleFeedItem[]>([]);
  const [influenceEvents, setInfluenceEvents] = useState<PlaceSaveEvent[]>([]);
  const [circleLoading, setCircleLoading] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const refreshCircle = useCallback(async () => {
    const userId = userIdRef.current;
    const handle = stateRef.current.profile.handle;
    if (!isCloudEnabled || !userId || !handle || !onboarded) {
      setCircleFeed([]);
      setInfluenceEvents([]);
      return;
    }

    setCircleLoading(true);
    try {
      const [members, influence] = await Promise.all([
        fetchCircleMembers(handle, userId),
        fetchSavesFromMyVouches(handle)
      ]);
      const mergedFriends = mergeCircleFriends(stateRef.current.friends, members);
      const handles = mergedFriends
        .map((f) => f.profileHandle)
        .filter((h): h is string => Boolean(h));

      const cards = await fetchFriendVouchCards(handles);
      setFriendVouchCards(cards);
      const feed = buildCircleFeed(mergedFriends, cards);
      setCircleFeed(feed);
      setInfluenceEvents(influence);

      patch((current) => ({
        ...current,
        friends: mergedFriends,
        lastCircleSyncAt: Date.now()
      }));
    } finally {
      setCircleLoading(false);
    }
  }, [patch, userIdRef, onboarded]);

  useEffect(() => {
    if (!hydrated || !onboarded || !stateRef.current.profile.handle) return;
    void refreshCircle();
  }, [hydrated, onboarded, refreshCircle]);

  const getFriendCard = useCallback(
    async (handle: string) => {
      const cached = friendVouchCards[handle.toLowerCase()];
      if (cached) return cached;
      const fresh = await fetchFriendVouchCard(handle);
      if (fresh) {
        setFriendVouchCards((prev) => ({ ...prev, [handle.toLowerCase()]: fresh }));
      }
      return fresh;
    },
    [friendVouchCards]
  );

  return {
    circleFeed,
    circleLoading,
    friendVouchCards,
    influenceEvents,
    refreshCircle,
    getFriendCard
  };
}
