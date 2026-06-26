/* The in-progress Hotlist you're building. Persisted to localStorage today so
   the create→see-it loop is real without a backend; the same shape + getters
   move to a real store in Phase 3 without the builder changing. */

import type { Guide, Place } from "./guides";

export type Draft = {
  title: string;
  intro: string;
  name: string;
  city: string;
  places: Place[];
};

const KEY = "hotlist:draft:v1";

export const EMPTY_DRAFT: Draft = { title: "", intro: "", name: "", city: "Bangalore", places: [] };

export function loadDraft(): Draft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...EMPTY_DRAFT, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return EMPTY_DRAFT;
}

export function saveDraft(d: Draft): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* ignore */ }
}

const TINTS = ["#CB613A", "#7C8C5A", "#C98A3C", "#3E7C74", "#8E5A6B", "#6E7F9A", "#B0492F", "#C17A2B"];

export function handleFromName(name: string): string {
  const h = name.trim().toLowerCase().split(/\s+/)[0]?.replace(/[^a-z0-9]/g, "");
  return h || "you";
}

/* draft → the same Guide shape the public page renders, so the preview IS the page. */
export function draftToGuide(d: Draft): Guide {
  const name = d.name.trim() || "You";
  const handle = handleFromName(name);
  const initial = (name.trim()[0] || "Y").toUpperCase();
  const tint = TINTS[(handle.charCodeAt(0) || 0) % TINTS.length];
  return {
    handle,
    title: d.title.trim() || "Untitled Hotlist",
    intro: d.intro.trim() || "A few places worth your time.",
    curator: { name, initial, tint, city: d.city.trim() || "Bangalore" },
    sent: 0,
    saved: 0,
    updated: "just now",
    minutes: Math.max(2, Math.round(d.places.length * 0.7)),
    places: d.places,
  };
}
