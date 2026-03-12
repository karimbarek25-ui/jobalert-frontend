// Service Worker JobAlert PWA
const CACHE_NAME = 'jobalert-v2';
const STATIC_ASSETS = [
  '/app/',
  '/app/index.html',
  '/app/manifest.json'
];

// Installation — mise en cache des assets statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation — nettoyage des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Laisser passer toutes les requêtes non-GET sans toucher au cache
  if (e.request.method !== 'GET') {
    e.respondWith(fetch(e.request));
    return;
  }

  // API externe → toujours réseau, jamais de cache
  if (url.hostname !== self.location.hostname) {
    e.respondWith(
      fetch(e.request).catch(() => new Response('{"error":"offline"}', {headers: {'Content-Type': 'application/json'}}))
    );
    return;
  }

  // Assets statiques → cache first
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
