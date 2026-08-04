// Root-scoped service worker for Daily Flip. Bump CACHE_NAME whenever this
// file (or the precache list) changes — activate() clears any old-named
// cache, so a stale name is what actually forces a clean slate.
const CACHE_NAME = "hanten-v1";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/daily.html",
  "/manifest.json",
  "/data/featured.js",
  "/data/quiz.js",
  "/data/a11y.js",
  "/data/save-image.js",
  "/data/icons/icon-192.png",
  "/data/icons/icon-512.png",
  "/data/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Network-first, falling back to cache: online visitors always get the
// latest push (this is a content site with no build step to force a
// refresh), offline visitors get whatever was last successfully fetched.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // leave CDN requests (D3, html2canvas) alone

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
