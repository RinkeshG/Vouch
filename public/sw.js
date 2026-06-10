/* Vouch service worker — installability + a resilient shell (PRD §12). The product
   runs on localStorage, so capture already works offline; this keeps the shell and
   visited pages available with no network. App-shell precache + runtime cache;
   network-first for navigations so you always get fresh HTML when online. */
const CACHE = "vouch-shell-v3";
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
  if (url.origin !== self.location.origin) return; // never cache tiles, fonts, APIs cross-origin

  // navigations: network-first, fall back to cached page, then the home shell
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then((res) => { const clone = res.clone(); caches.open(CACHE).then((c) => c.put(req, clone)); return res; })
        .catch(() => caches.match(req).then((c) => c || caches.match("/home"))),
    );
    return;
  }
  // same-origin assets: cache-first, fill the cache as we go
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const clone = res.clone(); caches.open(CACHE).then((c) => c.put(req, clone)); return res;
    }).catch(() => cached)),
  );
});
