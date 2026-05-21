export type City = "bangalore" | "bombay" | "delhi" | "goa" | "chennai";

export interface Place {
  id: string;
  google_place_id: string | null;
  name: string;
  area: string;
  city: City;
  cuisines: string[];
  price_tier: 1 | 2 | 3 | 4;
  cover_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  is_closed: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  city: City;
  avatar_url: string | null;
  avatar_tint: number;
  is_public: boolean;
  vouch_count: number;
  circle_count: number;
  list_count: number;
  created_at: string;
}

export interface Vouch {
  id: string;
  user_id: string;
  place_id: string;
  take: string;
  context_tags: string[];
  created_at: string;
  place?: Place;
  profile?: Profile;
}

export interface VouchList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  cover_place_ids: string[];
  place_count: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface CircleRelation {
  id: string;
  follower_id: string;
  following_id: string;
  status: "active" | "pending";
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "vouch" | "follow" | "follow_request" | "list_save" | "mention";
  actor_id: string;
  entity_id: string | null;
  entity_type: "vouch" | "place" | "list" | "profile" | null;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
}

export const CITIES: Record<City, { label: string; active: boolean }> = {
  bangalore: { label: "Bangalore", active: true },
  bombay: { label: "Bombay", active: false },
  delhi: { label: "Delhi", active: false },
  goa: { label: "Goa", active: false },
  chennai: { label: "Chennai", active: false },
};

export const CONTEXT_TAGS = [
  "date night",
  "group dinner",
  "solo meal",
  "family friendly",
  "late night",
  "quick bite",
  "special occasion",
  "work lunch",
  "brunch",
  "drinks",
  "cafe vibes",
  "outdoor seating",
  "delivery worthy",
  "worth the wait",
] as const;

export type ContextTag = (typeof CONTEXT_TAGS)[number];
