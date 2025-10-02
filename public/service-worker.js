/*  public/service-worker.js
    -----------------------------------------------------------
    new versioned, self-cleaning SW that:
      • never caches index.html (network-first)
      • bumps cache-name every deploy         (Date.now())
      • immediately becomes active (skipWaiting / clients.claim)
      • notifies the page so we can reload   (see index.js)
*/
const CACHE_PREFIX = 'moviefrost-cache-';
const CACHE_NAME   = `${CACHE_PREFIX}${Date.now()}`;
const STATIC_ASSETS = [
  // ► NEVER put "/" or "/index.html" here ◄
  '/static/css/main.css',
  '/static/js/main.js',
  '/images/MOVIEFROST.png',
  '/images/placeholder.jpg',
];

/* INSTALL ---------------------------------------------------- */
self.addEventListener('install', event => {
  self.skipWaiting();                          // activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS))
  );
});

/* ACTIVATE – delete old caches ------------------------------- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* RUNTIME FETCH HANDLER -------------------------------------- */
self.addEventListener('fetch', event => {
  const { request } = event;

  // HTML ⇒ always network-first (so new build wins)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(r => r)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // every­thing else ⇒ cache-first, fallback network
  event.respondWith(
    caches.match(request).then(
      cached => cached ||
        fetch(request).then(resp => {
          // put copy in cache (ignore opaque 3rd-party)
          if (resp.ok && resp.type === 'basic') {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return resp;
        })
    )
  );
});

/* listen to SKIP_WAITING from app ---------------------------- */
self.addEventListener('message', evt => {
  if (evt.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
