/**
 * Demo Mode
 *
 * Auto-activates when Supabase env vars aren't set, OR
 * when the user isn't authenticated. Provides realistic
 * mock data so every screen works without any backend.
 */

/** True when Supabase env vars are missing (server & client) */
export function isSupabaseMissing(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// NOTE: tryGetUser() is in demo-server.ts to avoid bundling
// server-only code into client components.

// ============================================================
// Mock Users
// ============================================================

export const DEMO_USER = {
  id: "demo-user-001",
  handle: "rinkesh",
  displayName: "Rinkesh Gorasia",
  bio: "Building products. Eating everywhere in Bangalore.",
  tasteLine: "If the biryani doesn't have soul, I'm not going back",
  avatarUrl: null,
  avatarTint: 3,
  isPublic: true,
  vouchCount: 6,
  followerCount: 24,
  followingCount: 18,
  listCount: 2,
  onboardingStep: 4,
  city: "bangalore" as const,
};

const DEMO_PROFILES = [
  {
    id: "demo-user-002",
    handle: "priya_eats",
    displayName: "Priya Sharma",
    bio: "South Indian food is my love language.",
    tasteLine: "Dosa is not breakfast, it's a lifestyle",
    avatarUrl: null,
    avatarTint: 1,
    isPublic: true,
    vouchCount: 8,
    followerCount: 42,
    followingCount: 15,
    listCount: 3,
  },
  {
    id: "demo-user-003",
    handle: "arjun.foodie",
    displayName: "Arjun Mehta",
    bio: "Café crawler. Craft beer enthusiast. Always hunting the next hidden gem.",
    tasteLine: "Life's too short for bad coffee",
    avatarUrl: null,
    avatarTint: 5,
    isPublic: true,
    vouchCount: 12,
    followerCount: 67,
    followingCount: 31,
    listCount: 4,
  },
  {
    id: "demo-user-004",
    handle: "naina.k",
    displayName: "Naina Kapoor",
    bio: "Weekend brunch is a religion.",
    tasteLine: null,
    avatarUrl: null,
    avatarTint: 7,
    isPublic: true,
    vouchCount: 5,
    followerCount: 19,
    followingCount: 22,
    listCount: 1,
  },
  {
    id: "demo-user-005",
    handle: "vikram_blr",
    displayName: "Vikram Rao",
    bio: "From street food to fine dining — I'll try anything once.",
    tasteLine: "The best food is the one your friend orders",
    avatarUrl: null,
    avatarTint: 0,
    isPublic: true,
    vouchCount: 9,
    followerCount: 35,
    followingCount: 28,
    listCount: 2,
  },
  {
    id: "demo-user-006",
    handle: "meera.taste",
    displayName: "Meera Iyer",
    bio: "Filter coffee purist. Thali loyalist.",
    tasteLine: "If it doesn't come with sambar, is it even a meal?",
    avatarUrl: null,
    avatarTint: 2,
    isPublic: true,
    vouchCount: 7,
    followerCount: 28,
    followingCount: 16,
    listCount: 1,
  },
];

// ============================================================
// Mock Places — real Bangalore restaurants
// ============================================================

export const DEMO_PLACES = [
  {
    id: "place-001",
    name: "Vidyarthi Bhavan",
    area: "Gandhi Bazaar, Basavanagudi",
    city: "bangalore" as const,
    cuisines: ["South Indian", "Vegetarian"],
    priceTier: 1,
    vouchCount: 14,
    phone: "+91 80 2667 7588",
    website: null,
    latitude: 12.9425,
    longitude: 77.5722,
    isClosed: false,
    coverImageUrl: null,
    googlePlaceId: "ChIJDemo001",
  },
  {
    id: "place-002",
    name: "Meghana Foods",
    area: "Residency Road",
    city: "bangalore" as const,
    cuisines: ["Andhra", "Biryani"],
    priceTier: 2,
    vouchCount: 11,
    phone: "+91 80 4123 4567",
    website: "https://meghanafoods.com",
    latitude: 12.9716,
    longitude: 77.6099,
    isClosed: false,
    coverImageUrl: null,
    googlePlaceId: "ChIJDemo002",
  },
  {
    id: "place-003",
    name: "Third Wave Coffee",
    area: "Indiranagar",
    city: "bangalore" as const,
    cuisines: ["Cafe", "Coffee"],
    priceTier: 2,
    vouchCount: 9,
    phone: null,
    website: "https://thirdwavecoffee.in",
    latitude: 12.9784,
    longitude: 77.6408,
    isClosed: false,
    coverImageUrl: null,
    googlePlaceId: "ChIJDemo003",
  },
  {
    id: "place-004",
    name: "Toit Brewpub",
    area: "100 Feet Road, Indiranagar",
    city: "bangalore" as const,
    cuisines: ["Brewery", "Continental", "Pizza"],
    priceTier: 3,
    vouchCount: 8,
    phone: "+91 80 4656 5656",
    website: "https://toit.in",
    latitude: 12.9783,
    longitude: 77.6409,
    isClosed: false,
    coverImageUrl: null,
    googlePlaceId: "ChIJDemo004",
  },
  {
    id: "place-005",
    name: "Truffles",
    area: "St. Marks Road",
    city: "bangalore" as const,
    cuisines: ["Burgers", "American", "Continental"],
    priceTier: 2,
    vouchCount: 7,
    phone: "+91 80 4112 3456",
    website: null,
    latitude: 12.9735,
    longitude: 77.6033,
    isClosed: false,
    coverImageUrl: null,
    googlePlaceId: "ChIJDemo005",
  },
  {
    id: "place-006",
    name: "CTR (Central Tiffin Room)",
    area: "Malleshwaram",
    city: "bangalore" as const,
    cuisines: ["South Indian", "Vegetarian"],
    priceTier: 1,
    vouchCount: 10,
    phone: null,
    website: null,
    latitude: 12.9967,
    longitude: 77.5713,
    isClosed: false,
    coverImageUrl: null,
    googlePlaceId: "ChIJDemo006",
  },
  {
    id: "place-007",
    name: "The Permit Room",
    area: "Lavelle Road",
    city: "bangalore" as const,
    cuisines: ["Bar", "South Indian", "Fusion"],
    priceTier: 3,
    vouchCount: 6,
    phone: "+91 80 4900 0000",
    website: null,
    latitude: 12.9700,
    longitude: 77.5990,
    isClosed: false,
    coverImageUrl: null,
    googlePlaceId: "ChIJDemo007",
  },
  {
    id: "place-008",
    name: "Brahmin's Coffee Bar",
    area: "Shankarapuram, Basavanagudi",
    city: "bangalore" as const,
    cuisines: ["South Indian", "Coffee"],
    priceTier: 1,
    vouchCount: 12,
    phone: null,
    website: null,
    latitude: 12.9450,
    longitude: 77.5700,
    isClosed: false,
    coverImageUrl: null,
    googlePlaceId: "ChIJDemo008",
  },
];

// ============================================================
// Mock Vouches
// ============================================================

export const DEMO_VOUCHES = [
  {
    id: "vouch-001",
    take: "The masala dosa here has been perfect for 80+ years. Crispy outside, soft inside, chutney is unreal.",
    contextTags: ["solo meal", "quick bite", "worth the wait"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    authorId: "demo-user-002",
    authorHandle: "priya_eats",
    authorName: "Priya Sharma",
    authorAvatarUrl: null,
    placeId: "place-001",
    placeName: "Vidyarthi Bhavan",
    placeArea: "Gandhi Bazaar, Basavanagudi",
  },
  {
    id: "vouch-002",
    take: "Best biryani in Bangalore, no debate. The spice level is chef's kiss. Go for the chicken dum.",
    contextTags: ["group dinner", "worth the wait"],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    authorId: "demo-user-003",
    authorHandle: "arjun.foodie",
    authorName: "Arjun Mehta",
    authorAvatarUrl: null,
    placeId: "place-002",
    placeName: "Meghana Foods",
    placeArea: "Residency Road",
  },
  {
    id: "vouch-003",
    take: "My go-to work spot. The cold brew is consistently good and they don't rush you out.",
    contextTags: ["cafe vibes", "work lunch", "solo meal"],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    authorId: "demo-user-003",
    authorHandle: "arjun.foodie",
    authorName: "Arjun Mehta",
    authorAvatarUrl: null,
    placeId: "place-003",
    placeName: "Third Wave Coffee",
    placeArea: "Indiranagar",
  },
  {
    id: "vouch-004",
    take: "Friday nights here are peak Bangalore. Great craft beers and the pizza holds its own.",
    contextTags: ["drinks", "group dinner", "late night"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: "demo-user-005",
    authorHandle: "vikram_blr",
    authorName: "Vikram Rao",
    authorAvatarUrl: null,
    placeId: "place-004",
    placeName: "Toit Brewpub",
    placeArea: "100 Feet Road, Indiranagar",
  },
  {
    id: "vouch-005",
    take: "The burgers are massive and never disappoint. Get the classic smash with extra cheese.",
    contextTags: ["quick bite", "group dinner"],
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: "demo-user-004",
    authorHandle: "naina.k",
    authorName: "Naina Kapoor",
    authorAvatarUrl: null,
    placeId: "place-005",
    placeName: "Truffles",
    placeArea: "St. Marks Road",
  },
  {
    id: "vouch-006",
    take: "Benne dosa at 7am with filter coffee. This is why I live in Malleshwaram.",
    contextTags: ["brunch", "solo meal", "quick bite"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: "demo-user-006",
    authorHandle: "meera.taste",
    authorName: "Meera Iyer",
    authorAvatarUrl: null,
    placeId: "place-006",
    placeName: "CTR (Central Tiffin Room)",
    placeArea: "Malleshwaram",
  },
  {
    id: "vouch-007",
    take: "Cocktails with a South Indian twist that actually work. The neer dosa tacos are genius.",
    contextTags: ["date night", "drinks", "special occasion"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: "demo-user-005",
    authorHandle: "vikram_blr",
    authorName: "Vikram Rao",
    authorAvatarUrl: null,
    placeId: "place-007",
    placeName: "The Permit Room",
    placeArea: "Lavelle Road",
  },
  {
    id: "vouch-008",
    take: "No menu. No chairs. Just idli-vada-coffee perfection. The OG Bangalore breakfast experience.",
    contextTags: ["solo meal", "quick bite", "worth the wait"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: "demo-user-002",
    authorHandle: "priya_eats",
    authorName: "Priya Sharma",
    authorAvatarUrl: null,
    placeId: "place-008",
    placeName: "Brahmin's Coffee Bar",
    placeArea: "Shankarapuram, Basavanagudi",
  },
  // Current user's vouches
  {
    id: "vouch-009",
    take: "The dum biryani here is the real deal. Fragrant rice, tender meat, perfect every single time.",
    contextTags: ["group dinner", "delivery worthy"],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: DEMO_USER.id,
    authorHandle: DEMO_USER.handle,
    authorName: DEMO_USER.displayName,
    authorAvatarUrl: null,
    placeId: "place-002",
    placeName: "Meghana Foods",
    placeArea: "Residency Road",
  },
  {
    id: "vouch-010",
    take: "Still the best dosa in Bangalore after all these years. The potato filling is unmatched.",
    contextTags: ["solo meal", "worth the wait"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: DEMO_USER.id,
    authorHandle: DEMO_USER.handle,
    authorName: DEMO_USER.displayName,
    authorAvatarUrl: null,
    placeId: "place-001",
    placeName: "Vidyarthi Bhavan",
    placeArea: "Gandhi Bazaar, Basavanagudi",
  },
  {
    id: "vouch-011",
    take: "Their craft IPAs are some of the best in the city. The vibe on weekends is unmatched.",
    contextTags: ["drinks", "group dinner", "late night"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: DEMO_USER.id,
    authorHandle: DEMO_USER.handle,
    authorName: DEMO_USER.displayName,
    authorAvatarUrl: null,
    placeId: "place-004",
    placeName: "Toit Brewpub",
    placeArea: "100 Feet Road, Indiranagar",
  },
  {
    id: "vouch-012",
    take: "Filter coffee that makes you question every other coffee you've had. Pure, strong, no nonsense.",
    contextTags: ["cafe vibes", "solo meal"],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: DEMO_USER.id,
    authorHandle: DEMO_USER.handle,
    authorName: DEMO_USER.displayName,
    authorAvatarUrl: null,
    placeId: "place-008",
    placeName: "Brahmin's Coffee Bar",
    placeArea: "Shankarapuram, Basavanagudi",
  },
];

// ============================================================
// Helper: get data subsets
// ============================================================

/** Vouches from people the demo user "follows" (circle) */
export function getDemoCircleFeed() {
  const circleIds = new Set(["demo-user-002", "demo-user-003", "demo-user-005"]);
  return DEMO_VOUCHES.filter((v) => circleIds.has(v.authorId));
}

/** Vouches from people outside the circle */
export function getDemoDiscoverFeed() {
  const circleIds = new Set(["demo-user-002", "demo-user-003", "demo-user-005", DEMO_USER.id]);
  return DEMO_VOUCHES.filter((v) => !circleIds.has(v.authorId));
}

/** Trending places sorted by vouch count */
export function getDemoTrendingPlaces() {
  return [...DEMO_PLACES]
    .sort((a, b) => b.vouchCount - a.vouchCount)
    .slice(0, 6);
}

/** Current user's vouches */
export function getDemoUserVouches() {
  return DEMO_VOUCHES.filter((v) => v.authorId === DEMO_USER.id);
}

/** Vouches for a specific place */
export function getDemoPlaceVouches(placeId: string) {
  return DEMO_VOUCHES.filter((v) => v.placeId === placeId);
}

/** Find a place by ID */
export function getDemoPlace(placeId: string) {
  return DEMO_PLACES.find((p) => p.id === placeId) || null;
}

/** Find a profile by handle */
export function getDemoProfile(handle: string) {
  if (handle === DEMO_USER.handle) return DEMO_USER;
  return DEMO_PROFILES.find((p) => p.handle === handle) || null;
}

/** Vouches for a given user */
export function getDemoProfileVouches(userId: string) {
  return DEMO_VOUCHES.filter((v) => v.authorId === userId);
}

/** Saved place IDs for the demo user */
export const DEMO_SAVED_PLACE_IDS = ["place-001", "place-004", "place-008"];

/** All profiles for suggestions */
export function getDemoSuggestedPeople() {
  return DEMO_PROFILES.map((p) => ({
    id: p.id,
    handle: p.handle,
    display_name: p.displayName,
    avatar_url: p.avatarUrl,
    vouch_count: p.vouchCount,
  }));
}

/** Popular places for search */
export function getDemoPopularPlaces() {
  return DEMO_PLACES
    .sort((a, b) => b.vouchCount - a.vouchCount)
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      area: p.area,
      vouch_count: p.vouchCount,
    }));
}

/** Search places by query */
export function searchDemoPlaces(query: string) {
  const q = query.toLowerCase();
  return DEMO_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.area.toLowerCase().includes(q) ||
      p.cuisines.some((c) => c.toLowerCase().includes(q))
  );
}

/** Search people by query */
export function searchDemoPeople(query: string) {
  const q = query.toLowerCase();
  return DEMO_PROFILES.filter(
    (p) =>
      p.handle.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q)
  );
}
