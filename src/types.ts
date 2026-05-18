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
  /** Google Places resource id when added via search */
  googlePlaceId?: string;
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
  /** Stable path segment for `vouch.app/{handle}/{slug}` */
  slug?: string;
};

export type Friend = {
  id: string;
  name: string;
  city: string;
  trustedFor: string[];
  createdAt: number;
  /** Live on Vouch — their public card is fetched from cloud */
  profileHandle?: string;
};

/** A friend's published Vouch card from the cloud */
export type FriendVouchCard = {
  handle: string;
  name: string;
  city: string;
  tasteTags: string[];
  userPlaces: UserPlace[];
  updatedAt: number;
};

/** One place a friend vouched — shown on the home circle feed */
export type CircleFeedItem = {
  id: string;
  friendId: string;
  friendHandle: string;
  friendName: string;
  placeId: string;
  placeName: string;
  area: string;
  image: string;
  why: string;
  updatedAt: number;
};

/** Influence event: someone in your circle saved a place from your Vouch list */
export type PlaceSaveEvent = {
  id: string;
  sourceHandle: string;
  actorHandle: string;
  actorName: string;
  placeId: string;
  placeName: string;
  placeImage: string;
  savedAt: number;
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
  lastCircleSyncAt?: number;
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
