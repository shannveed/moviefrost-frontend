// A brand new cache every Vercel build
// Vercel exposes the git commit SHA at build-time – we pipe it via
// REACT_APP_BUILD_STAMP (see package.json below)
const CACHE_NAME = 'moviefrost-' + '%REACT_APP_BUILD_STAMP%';

const CORE_ASSETS = [
  '/',                        // html (never cached by rule 1 & 2)
  '/favicon1.png',
  '/MOVIEFROST.png',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  // Activate the NEW sw immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Delete all older caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Offline-first for all GET requests
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).then(res => {
          // Put a clone into the runtime cache
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return res;
        })
      );
    })
  );
});
