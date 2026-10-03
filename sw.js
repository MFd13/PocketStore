const SHELL_CACHE = 'pocketstore-shell-v1';
const DATA_CACHE = 'pocketstore-data-v1';
const APP_SHELL = [
  './', './index.html', './styles.css', './app.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png'
];

// INSTALL: guarda el App Shell en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ACTIVATE: elimina cachés de versiones anteriores
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== SHELL_CACHE && k !== DATA_CACHE)
        .map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH: API -> red primero (con respaldo en caché); resto -> caché primero
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'jsonplaceholder.typicode.com') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(DATA_CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).catch(() => caches.match('./index.html'))
    )
  );
});
