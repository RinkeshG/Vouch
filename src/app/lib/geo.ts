/* Approximate coordinates derived from a place's area, so the map works for the
   seeded guides without per-place geocoding. (When places are added via a real
   place provider in Phase 3b, each place carries its own lat/lng and this
   area lookup is no longer needed.) */

import type { Guide, Place } from "./guides";

type LL = { lat: number; lng: number };

const AREA_COORDS: Record<string, LL> = {
  // Bangalore
  Koramangala: { lat: 12.9352, lng: 77.6245 },
  Indiranagar: { lat: 12.9719, lng: 77.6412 },
  "Lavelle Rd": { lat: 12.9716, lng: 77.597 },
  Basavanagudi: { lat: 12.9421, lng: 77.5731 },
  Malleshwaram: { lat: 13.0035, lng: 77.5709 },
  "Residency Rd": { lat: 12.9685, lng: 77.6035 },
  "St Marks Rd": { lat: 12.9726, lng: 77.6045 },
  Shankarpuram: { lat: 12.954, lng: 77.565 },
  "Frazer Town": { lat: 12.9985, lng: 77.6175 },
  Jayanagar: { lat: 12.925, lng: 77.5838 },
  Ulsoor: { lat: 12.981, lng: 77.621 },
  "Lalbagh Rd": { lat: 12.949, lng: 77.5848 },
  "Church St": { lat: 12.975, lng: 77.609 },
  "MG Rd": { lat: 12.975, lng: 77.619 },
  "Magrath Rd": { lat: 12.966, lng: 77.608 },
  Hennur: { lat: 13.04, lng: 77.642 },
  "Mosque Rd": { lat: 12.997, lng: 77.618 },
  Bellandur: { lat: 12.926, lng: 77.676 },
  // Goa
  Candolim: { lat: 15.518, lng: 73.762 },
  Assagao: { lat: 15.601, lng: 73.756 },
  Nerul: { lat: 15.523, lng: 73.78 },
  Altinho: { lat: 15.496, lng: 73.829 },
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export type PlacePoint = { place: Place; index: number; lat: number; lng: number };

export function pointsForGuide(g: Guide): PlacePoint[] {
  const pts: PlacePoint[] = [];
  g.places.forEach((place, index) => {
    // real coordinates (from the place search) always win
    if (typeof place.lat === "number" && typeof place.lng === "number") {
      pts.push({ place, index, lat: place.lat, lng: place.lng });
      return;
    }
    // fallback: approximate by area (seeded guides without coords)
    const base = AREA_COORDS[place.area];
    if (!base) return;
    const h = hash(place.name);
    pts.push({
      place,
      index,
      lat: base.lat + ((h % 100) / 100 - 0.5) * 0.0075,
      lng: base.lng + ((Math.floor(h / 100) % 100) / 100 - 0.5) * 0.0075,
    });
  });
  return pts;
}

export function hasMap(g: Guide): boolean {
  return pointsForGuide(g).length >= 2;
}
