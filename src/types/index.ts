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
  photo_reference: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  is_closed: boolean;
  created_at: string;
}

export function placePhotoUrl(
  photoRef: string | null | undefined,
  width: number = 800
): string | null {
  if (!photoRef) return null;
  return `/api/places/photo?ref=${encodeURIComponent(photoRef)}&w=${width}`;
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

export type CoverStyle = 0 | 1 | 2 | 3 | 4;

export interface VouchList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  slug: string | null;
  emoji: string | null;
  cover_style: CoverStyle;
  is_public: boolean;
  is_published: boolean;
  place_count: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface ListPlace {
  id: string;
  list_id: string;
  place_id: string;
  position: number;
  note: string | null;
  added_at: string;
  place?: Place;
}

export const CITIES: Record<City, { label: string; active: boolean }> = {
  bangalore: { label: "Bangalore", active: true },
  bombay: { label: "Bombay", active: false },
  delhi: { label: "Delhi", active: false },
  goa: { label: "Goa", active: false },
  chennai: { label: "Chennai", active: false },
};
