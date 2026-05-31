// Leaflet is used via dynamic import with a thin `any` surface in
// src/components/vouch/map-real.tsx. Full @types/leaflet not needed for the
// prototype; declare the module so the bare import type-checks.
declare module "leaflet";
declare module "leaflet/dist/leaflet.css";
