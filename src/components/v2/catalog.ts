import type { Cat } from "./data";

/* A tiny local catalog so "add a place" feels real in v0.1 — type a name, it
   autofills area, category, coordinates. The creator's effort goes to the
   voice, not data entry. (Production: a real places search.) */
export type CatalogEntry = { name: string; area: string; lat: number; lng: number; cat: Cat };

export const CATALOG: CatalogEntry[] = [
  { name: "Airlines Hotel", area: "Lavelle Rd", lat: 12.9698, lng: 77.5985, cat: "coffee" },
  { name: "Third Wave", area: "Lavelle Rd", lat: 12.9692, lng: 77.5975, cat: "coffee" },
  { name: "Maverick & Farmer", area: "Koramangala", lat: 12.9352, lng: 77.6245, cat: "coffee" },
  { name: "Anama Coffee", area: "Indiranagar", lat: 12.9719, lng: 77.6412, cat: "coffee" },
  { name: "Kahale", area: "Jayanagar", lat: 12.9300, lng: 77.5833, cat: "coffee" },
  { name: "Blue Tokai", area: "Koramangala", lat: 12.9340, lng: 77.6270, cat: "coffee" },
  { name: "Koshy's", area: "St. Marks Rd", lat: 12.9738, lng: 77.6010, cat: "food" },
  { name: "VV Puram food street", area: "VV Puram", lat: 12.9419, lng: 77.5731, cat: "food" },
  { name: "Corner House", area: "Residency Rd", lat: 12.9716, lng: 77.6050, cat: "food" },
  { name: "Toit", area: "Indiranagar", lat: 12.9783, lng: 77.6408, cat: "drink" },
  { name: "Soka", area: "Sadashivnagar", lat: 13.0070, lng: 77.5810, cat: "drink" },
  { name: "Byg Brewski", area: "Hennur", lat: 13.0358, lng: 77.6403, cat: "view" },
];

export function searchCatalog(q: string, taken: string[]): CatalogEntry[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  return CATALOG.filter((e) => !taken.includes(e.name) && e.name.toLowerCase().includes(query)).slice(0, 5);
}
