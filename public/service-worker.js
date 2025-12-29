const CACHE_PREFIX = 'moviefrost-cache-';
const CACHE_NAME = `${CACHE_PREFIX}${Date.now()}`;

const STATIC_ASSETS = [
  // App icons (NEW)
  '/images/desktop-icon-192.jpeg',
  '/images/desktop-icon-512.jpeg',

  // Existing assets
  '/images/MOVIEFROST.png',
  '/images/placeholder.jpg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')));
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((resp) => {
          if (resp.ok && resp.type === 'basic') {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return resp;
        })
    )
  );
});

/* Listen to SKIP_WAITING from app */
self.addEventListener('message', (evt) => {
  if (evt.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

/* ===========================
   WEB PUSH NOTIFICATIONS
   =========================== */
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'MovieFrost';
  const options = {
    body: data.body || '',
    icon: data.icon || '/images/MOVIEFROST.png',
    badge: '/images/MOVIEFROST.png',
    image: data.image,
    data: { url: data.url || '/' },
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(async () => {
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      clients.forEach((c) => c.postMessage({ type: 'PUSH_RECEIVED' }));
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(url);
      })
  );
});
