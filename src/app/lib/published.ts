/* Published Hotlists. Today this is a localStorage map (handle -> Guide) so the
   create → publish → open-the-link loop is real on this device. The getters are
   the seam: Phase-3b swaps the body for a real DB + auth + a global namespace,
   and neither the builder nor the public page changes. */

import { type Draft, draftToGuide } from "./draft";
import type { Guide } from "./guides";

const PKEY = "hotlist:published:v1";

function readAll(): Record<string, Guide> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(PKEY) || "{}"); } catch { return {}; }
}
function writeAll(m: Record<string, Guide>): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(PKEY, JSON.stringify(m)); } catch { /* ignore */ }
}

export function publishDraft(d: Draft): Guide {
  const g = draftToGuide(d);
  const all = readAll();
  all[g.handle] = g;
  writeAll(all);
  return g;
}

export function getPublished(handle: string): Guide | undefined {
  return readAll()[handle.toLowerCase()];
}
