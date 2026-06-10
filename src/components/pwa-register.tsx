"use client";
import { useEffect } from "react";

/* Registers the service worker so Vouch is installable + shell-resilient offline
   (PRD §12). Quiet: no UI, no install nag — the "add to home screen" prompt is
   designed separately, post-value (PRD §10).

   PRODUCTION ONLY: a SW that caches bundles in dev fights HMR (you'd see stale
   code). In dev we actively unregister any SW + clear its caches so a stale shell
   can never strand you on old code. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
      if (typeof caches !== "undefined") caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      return;
    }
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else { window.addEventListener("load", register, { once: true }); return () => window.removeEventListener("load", register); }
  }, []);
  return null;
}
