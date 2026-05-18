import type { VouchPersistedState } from "../types";

const STORAGE_KEY = "vouch-app-v1";

export const defaultPersistedState = (): VouchPersistedState => ({
  version: 1,
  profile: {
    name: "",
    city: "Bangalore",
    tasteTags: [],
    onboarded: false,
    onboardingStep: 0
  },
  userPlaces: [],
  customPlaces: [],
  collections: [],
  friends: [],
  events: [],
  planContext: null
});

export function loadState(): VouchPersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPersistedState();
    const parsed = JSON.parse(raw) as VouchPersistedState;
    if (parsed.version !== 1) return defaultPersistedState();
    return {
      ...defaultPersistedState(),
      ...parsed,
      profile: { ...defaultPersistedState().profile, ...parsed.profile }
    };
  } catch {
    return defaultPersistedState();
  }
}

export function saveState(state: VouchPersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
