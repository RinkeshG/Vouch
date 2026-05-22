/**
 * Cuisine Visual System
 *
 * Maps cuisine types to colors, gradients, and icons for
 * visually rich place cards. Each cuisine gets a unique
 * warm palette that works within the paper-and-ink aesthetic.
 */

interface CuisineVisual {
  /** Primary accent color */
  color: string;
  /** Light background tint */
  bg: string;
  /** CSS gradient for hero/banner areas */
  gradient: string;
  /** Emoji icon for visual flair */
  icon: string;
}

const CUISINE_MAP: Record<string, CuisineVisual> = {
  "south indian": {
    color: "#C27945",
    bg: "rgba(194, 121, 69, 0.08)",
    gradient: "linear-gradient(135deg, #D4855A 0%, #B86B3A 100%)",
    icon: "🫓",
  },
  vegetarian: {
    color: "#6B8E5E",
    bg: "rgba(107, 142, 94, 0.08)",
    gradient: "linear-gradient(135deg, #7DA06E 0%, #5A7A4E 100%)",
    icon: "🥬",
  },
  biryani: {
    color: "#C4893A",
    bg: "rgba(196, 137, 58, 0.08)",
    gradient: "linear-gradient(135deg, #D49A4A 0%, #B07830 100%)",
    icon: "🍚",
  },
  andhra: {
    color: "#C45A3A",
    bg: "rgba(196, 90, 58, 0.08)",
    gradient: "linear-gradient(135deg, #D46A4A 0%, #B04A30 100%)",
    icon: "🌶️",
  },
  cafe: {
    color: "#8B6E4E",
    bg: "rgba(139, 110, 78, 0.08)",
    gradient: "linear-gradient(135deg, #9B7E5E 0%, #7A5E3E 100%)",
    icon: "☕",
  },
  coffee: {
    color: "#7A5D40",
    bg: "rgba(122, 93, 64, 0.08)",
    gradient: "linear-gradient(135deg, #8A6D50 0%, #6A4D30 100%)",
    icon: "☕",
  },
  brewery: {
    color: "#B08A30",
    bg: "rgba(176, 138, 48, 0.08)",
    gradient: "linear-gradient(135deg, #C09A40 0%, #9A7A20 100%)",
    icon: "🍺",
  },
  continental: {
    color: "#6B8E7E",
    bg: "rgba(107, 142, 126, 0.08)",
    gradient: "linear-gradient(135deg, #7BA08E 0%, #5A7A6E 100%)",
    icon: "🍽️",
  },
  pizza: {
    color: "#C47040",
    bg: "rgba(196, 112, 64, 0.08)",
    gradient: "linear-gradient(135deg, #D48050 0%, #B06030 100%)",
    icon: "🍕",
  },
  burgers: {
    color: "#B06040",
    bg: "rgba(176, 96, 64, 0.08)",
    gradient: "linear-gradient(135deg, #C07050 0%, #A05030 100%)",
    icon: "🍔",
  },
  american: {
    color: "#B06040",
    bg: "rgba(176, 96, 64, 0.08)",
    gradient: "linear-gradient(135deg, #C07050 0%, #A05030 100%)",
    icon: "🍔",
  },
  bar: {
    color: "#7A5B6E",
    bg: "rgba(122, 91, 110, 0.08)",
    gradient: "linear-gradient(135deg, #8A6B7E 0%, #6A4B5E 100%)",
    icon: "🍷",
  },
  fusion: {
    color: "#8B6B8E",
    bg: "rgba(139, 107, 142, 0.08)",
    gradient: "linear-gradient(135deg, #9B7B9E 0%, #7A5B7E 100%)",
    icon: "✨",
  },
  drinks: {
    color: "#7A5B6E",
    bg: "rgba(122, 91, 110, 0.08)",
    gradient: "linear-gradient(135deg, #8A6B7E 0%, #6A4B5E 100%)",
    icon: "🍹",
  },
};

const DEFAULT_VISUAL: CuisineVisual = {
  color: "#8B8178",
  bg: "rgba(139, 129, 120, 0.06)",
  gradient: "linear-gradient(135deg, #9B9188 0%, #7A7168 100%)",
  icon: "🍴",
};

/**
 * Get visual properties for a cuisine type.
 * Tries each cuisine in the array until a match is found.
 */
export function getCuisineVisual(cuisines: string[]): CuisineVisual {
  for (const c of cuisines) {
    const key = c.toLowerCase();
    if (CUISINE_MAP[key]) return CUISINE_MAP[key];
  }
  return DEFAULT_VISUAL;
}

/**
 * Get just the primary color for a cuisine
 */
export function getCuisineColor(cuisines: string[]): string {
  return getCuisineVisual(cuisines).color;
}

/**
 * Get the emoji icon for a cuisine
 */
export function getCuisineIcon(cuisines: string[]): string {
  return getCuisineVisual(cuisines).icon;
}

/**
 * Price tier visual representation (filled/empty dots)
 */
export function priceDots(tier: number): string {
  return "●".repeat(tier) + "○".repeat(Math.max(0, 4 - tier));
}

/**
 * Context tag emoji mapping
 */
const TAG_ICONS: Record<string, string> = {
  "date night": "🌙",
  "group dinner": "👥",
  "solo meal": "🍽️",
  "family friendly": "👨‍👩‍👧",
  "late night": "🌃",
  "quick bite": "⚡",
  "special occasion": "🎉",
  "work lunch": "💼",
  brunch: "🥐",
  drinks: "🍷",
  "cafe vibes": "☕",
  "outdoor seating": "🌿",
  "delivery worthy": "🛵",
  "worth the wait": "⏰",
};

export function getTagIcon(tag: string): string {
  return TAG_ICONS[tag.toLowerCase()] || "";
}
