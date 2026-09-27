const CACHE_NAME = 'fodmap-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './js/tailwind.js',
  './js/chart.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('generativelanguage.googleapis.com')) return;
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
