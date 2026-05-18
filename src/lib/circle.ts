import { PLACE_CATALOG } from "../data/places";
import type { CircleFeedItem, Friend, FriendVouchCard, Place, UserPlace } from "../types";
import type { PublicSharePayload } from "./share";

export type CircleMember = {
  handle: string;
  name: string;
  city: string;
  tasteTags: string[];
  userId?: string;
};

export function friendIdForHandle(handle: string): string {
  return `linked-${handle.toLowerCase()}`;
}

export function mergeCircleFriends(existing: Friend[], members: CircleMember[]): Friend[] {
  const byHandle = new Map<string, Friend>();
  for (const f of existing) {
    if (f.profileHandle) byHandle.set(f.profileHandle.toLowerCase(), f);
  }
  for (const m of members) {
    const key = m.handle.toLowerCase();
    const prev = byHandle.get(key);
    byHandle.set(key, {
      id: prev?.id ?? friendIdForHandle(key),
      name: m.name.split(/\s+/)[0] || m.name,
      city: m.city,
      trustedFor: m.tasteTags.slice(0, 4).length ? m.tasteTags.slice(0, 4) : prev?.trustedFor ?? [],
      createdAt: prev?.createdAt ?? Date.now(),
      profileHandle: key
    });
  }
  const linked = [...byHandle.values()];
  const manual = existing.filter((f) => !f.profileHandle);
  return [...linked, ...manual];
}

export function cardFromPublicPayload(handle: string, payload: PublicSharePayload, updatedAt: number): FriendVouchCard {
  return {
    handle: handle.toLowerCase(),
    name: payload.profile.name,
    city: payload.profile.city,
    tasteTags: payload.profile.tasteTags,
    userPlaces: payload.userPlaces,
    updatedAt
  };
}

export function buildCircleFeed(
  friends: Friend[],
  cards: Record<string, FriendVouchCard>
): CircleFeedItem[] {
  const catalogById = Object.fromEntries(PLACE_CATALOG.map((p) => [p.id, p]));
  const items: CircleFeedItem[] = [];

  for (const friend of friends) {
    const handle = friend.profileHandle?.toLowerCase();
    if (!handle) continue;
    const card = cards[handle];
    if (!card) continue;

    const vouched = card.userPlaces.filter((p) => p.state === "vouched");
    const top = vouched.filter((p) => p.top);
    const places = (top.length ? top : vouched).slice(0, 4);

    for (const up of places) {
      const place = catalogById[up.placeId];
      if (!place) continue;
      items.push({
        id: `${friend.id}-${up.placeId}`,
        friendId: friend.id,
        friendHandle: handle,
        friendName: friend.name,
        placeId: up.placeId,
        placeName: place.name,
        area: place.area,
        image: place.image,
        why: up.why?.trim() || place.tip,
        updatedAt: card.updatedAt
      });
    }
  }

  return items.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function placesFromFriendCards(cards: Record<string, FriendVouchCard>): Record<string, Place> {
  const map: Record<string, Place> = {};
  for (const place of PLACE_CATALOG) {
    map[place.id] = place;
  }
  for (const card of Object.values(cards)) {
    for (const up of card.userPlaces) {
      if (map[up.placeId]) continue;
      map[up.placeId] = {
        id: up.placeId,
        name: "Saved place",
        area: card.city,
        city: card.city,
        price: "treat",
        color: "#5f6158",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
        tags: up.tags,
        bestFor: [],
        tip: up.why || "",
        caveat: ""
      };
    }
  }
  return map;
}

export function findFeedItem(
  feed: CircleFeedItem[],
  friendId: string,
  placeId: string
): CircleFeedItem | undefined {
  return feed.find((item) => item.friendId === friendId && item.placeId === placeId);
}

/**
 * For a given place, return every linked friend who has vouched for it.
 * Drives the "Vouched by Aditi and Rohan" consensus signal on Place Detail.
 */
export function friendsVouchingFor(
  placeId: string,
  friends: Friend[],
  cards: Record<string, FriendVouchCard>
): Array<{ friend: Friend; why: string }> {
  const out: Array<{ friend: Friend; why: string }> = [];
  for (const f of friends) {
    const handle = f.profileHandle?.toLowerCase();
    if (!handle) continue;
    const card = cards[handle];
    if (!card) continue;
    const match = card.userPlaces.find(
      (up) => up.placeId === placeId && up.state === "vouched"
    );
    if (match) out.push({ friend: f, why: match.why });
  }
  return out;
}

export function userPlaceFromFeedItem(item: CircleFeedItem, friendId: string): UserPlace {
  return {
    placeId: item.placeId,
    state: "saved",
    why: item.why,
    tags: [],
    addedFrom: friendId,
    updatedAt: Date.now()
  };
}
