// A brand new cache every Vercel build
// The BUILD_STAMP will be replaced at build time with the actual commit SHA
const BUILD_STAMP = process.env.REACT_APP_BUILD_STAMP || Date.now();
const CACHE_NAME = 'moviefrost-' + BUILD_STAMP;

const CORE_ASSETS = [
  '/',
  '/logo192.png',
  '/manifest.json',
  '/favicon1.png',
  '/MOVIEFROST.png'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing new version', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  // Activate the NEW sw immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating new version', CACHE_NAME);
  // Delete all older caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('Service Worker: Deleting old cache', k);
          return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// Offline-first for all GET requests
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  // Don't cache API calls
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).then(res => {
          // Don't cache non-successful responses
          if (!res || res.status !== 200 || res.type !== 'basic') {
            return res;
          }
          
          // Put a clone into the runtime cache
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return res;
        }).catch(() => {
          // Return offline page if available
          return caches.match('/');
        })
      );
    })
  );
});
