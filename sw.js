// Service Worker JobAlert PWA
const CACHE_NAME = 'jobalert-v3';
const STATIC_ASSETS = [
  '/app/',
  '/app/index.html',
  '/app/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Ne pas intercepter : POST/PUT/DELETE, requêtes API externes, extensions Chrome
  if (e.request.method !== 'GET') return;
  if (url.hostname !== self.location.hostname) return;
  if (!url.protocol.startsWith('http')) return;

  // Cache first pour les assets statiques locaux
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/app/index.html'));
    })
  );
});
