export type Tab = "home" | "places" | "friends" | "you";

export type PlaceState = "vouched" | "want" | "saved";

export type PriceTier = "easy" | "treat" | "splurge";

export type Place = {
  id: string;
  name: string;
  area: string;
  city: string;
  price: PriceTier;
  color: string;
  image: string;
  tags: string[];
  bestFor: string[];
  tip: string;
  caveat: string;
};

export type UserPlace = {
  placeId: string;
  state: PlaceState;
  why: string;
  tags: string[];
  addedFrom?: string;
  top?: boolean;
  vouchedAt?: number;
  updatedAt: number;
};

export type Collection = {
  id: string;
  title: string;
  note: string;
  placeIds: string[];
  accent: string;
  createdAt: number;
};

export type Friend = {
  id: string;
  name: string;
  city: string;
  trustedFor: string[];
  createdAt: number;
  /** When they joined via Vouch and have a public handle */
  profileHandle?: string;
};

export type ActivityEvent = {
  id: string;
  type: "vouched" | "saved_from_friend" | "want" | "collection";
  placeId?: string;
  friendId?: string;
  collectionId?: string;
  at: number;
};

export type UserProfile = {
  name: string;
  city: string;
  tasteTags: string[];
  onboarded: boolean;
  onboardingStep: 0 | 1 | 2 | 3;
  /** Unique public handle for share + invite links (cloud) */
  handle?: string;
};

export type VouchPersistedState = {
  version: 1;
  profile: UserProfile;
  userPlaces: UserPlace[];
  customPlaces: Place[];
  collections: Collection[];
  friends: Friend[];
  events: ActivityEvent[];
  planContext: string | null;
};

export type Sheet =
  | "add"
  | "share"
  | "collection"
  | "friend"
  | "friend-rec"
  | "top-four"
  | null;

export type ToastKind = "default" | "stamp";

export type ToastState = {
  message: string;
  kind: ToastKind;
} | null;
