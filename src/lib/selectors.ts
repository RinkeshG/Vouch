import { PLAN_CONTEXTS } from "../data/taste";
import type { Friend, Place, UserPlace } from "../types";

export function mergePlaces(catalog: Place[], custom: Place[]): Record<string, Place> {
  return Object.fromEntries([...catalog, ...custom].map((place) => [place.id, place]));
}

export function topFour(userPlaces: UserPlace[]): UserPlace[] {
  const tops = userPlaces.filter((p) => p.state === "vouched" && p.top);
  const ordered = tops.sort((a, b) => (b.vouchedAt ?? b.updatedAt) - (a.vouchedAt ?? a.updatedAt));
  if (ordered.length >= 4) return ordered.slice(0, 4);

  const rest = userPlaces
    .filter((p) => p.state === "vouched" && !p.top)
    .sort((a, b) => (b.vouchedAt ?? b.updatedAt) - (a.vouchedAt ?? a.updatedAt));

  return [...ordered, ...rest].slice(0, 4);
}

export function matchesPlanContext(tags: string[], contextId: string | null): boolean {
  if (!contextId) return true;
  const ctx = PLAN_CONTEXTS.find((c) => c.id === contextId);
  if (!ctx) return true;
  const haystack = tags.join(" ").toLowerCase();
  return ctx.match.some((needle) => haystack.includes(needle.toLowerCase()));
}

export function filterVouchedForContext(vouched: UserPlace[], contextId: string | null): UserPlace[] {
  if (!contextId) return vouched;
  return vouched.filter((item) => matchesPlanContext(item.tags, contextId));
}

export function savesFromFriendsCount(userPlaces: UserPlace[]): number {
  return userPlaces.filter((p) => p.state === "saved" && p.addedFrom).length;
}

export function placesFromFriend(userPlaces: UserPlace[], friendId: string): UserPlace[] {
  return userPlaces.filter((p) => p.addedFrom === friendId);
}

export function friendById(friends: Friend[], id: string): Friend | undefined {
  return friends.find((f) => f.id === id);
}

export function nextTopSlot(userPlaces: UserPlace[]): boolean {
  return userPlaces.filter((p) => p.top && p.state === "vouched").length < 4;
}
