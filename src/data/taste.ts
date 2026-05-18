export const CITY_OPTIONS = ["Bangalore", "Mumbai", "Delhi NCR", "Pune", "Hyderabad", "Goa"] as const;

export const TASTE_TAGS = [
  "date spots",
  "group dinners",
  "veg-safe",
  "budget eats",
  "quiet places",
  "cafes",
  "cocktails",
  "breakfast",
  "hidden gems",
  "brunch",
  "late-night",
  "rooftops",
  "street food",
  "fine dining",
  "desserts",
  "new openings",
  "outdoor seating",
  "live music",
  "family dinners",
  "delivery picks"
] as const;

export const PLAN_CONTEXTS = [
  { id: "date", label: "Date night", match: ["date", "date-safe", "date spots", "cocktails", "occasion"] },
  { id: "group", label: "Group dinner", match: ["group", "group dinner", "veg-safe", "reliable"] },
  { id: "veg", label: "Veg-safe", match: ["veg-safe", "veg"] },
  { id: "drinks", label: "Drinks", match: ["cocktails", "beer", "drinks", "bar"] },
  { id: "cafe", label: "Work cafe", match: ["work cafe", "coffee", "cafe", "workable"] },
  { id: "breakfast", label: "Breakfast", match: ["breakfast", "brunch", "dosa"] }
] as const;

export const QUICK_VOUCH_TAGS = [
  "date-safe",
  "veg-safe",
  "quiet",
  "group",
  "work cafe",
  "worth it",
  "book ahead",
  "cocktails"
] as const;

export const ONBOARDING_EXAMPLE_IDS = ["paper-pie", "burma", "conservatory", "ctr"] as const;
