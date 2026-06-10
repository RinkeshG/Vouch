/* Vouch service worker — installability + a resilient shell (PRD §12). The product
   runs on localStorage, so capture already works offline; this keeps the shell and
   visited pages available with no network.

   Strategy matters: NETWORK-FIRST by default so you never get stranded on stale code
   after a deploy; CACHE-FIRST only for Next's content-hashed immutable assets
   (/_next/static) which are safe to keep forever. Cross-origin (tiles, fonts, APIs)
   is left alone. */
const CACHE = "vouch-shell-v4";
const SHELL = ["/home", "/manifest.webmanifest", "/icon.svg", "/icon-192.svg", "/icon-512.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // tiles, fonts, APIs → untouched

  // immutable hashed build assets → cache-first (safe; the URL changes when content does)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(caches.match(req).then((c) => c || fetch(req).then((res) => { const cl = res.clone(); caches.open(CACHE).then((ca) => ca.put(req, cl)); return res; })));
    return;
  }

  // navigations + everything else → network-first, fall back to cache (then /home) offline
  event.respondWith(
    fetch(req).then((res) => { const cl = res.clone(); caches.open(CACHE).then((c) => c.put(req, cl)); return res; })
      .catch(() => caches.match(req).then((c) => c || (req.mode === "navigate" ? caches.match("/home") : undefined))),
  );
});
