"use client";
import { useEffect } from "react";

/* Registers the service worker so Vouch is installable + shell-resilient offline
   (PRD §12). Quiet: no UI, no install nag — the "add to home screen" prompt is
   designed separately, post-value (PRD §10). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else { window.addEventListener("load", register, { once: true }); return () => window.removeEventListener("load", register); }
  }, []);
  return null;
}
