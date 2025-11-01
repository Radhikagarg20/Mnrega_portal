const CACHE_NAME = 'mgnrega-static-v1';
const ASSETS = [
  '/', '/index.html', '/css/styles.css',
  '/js/app.js', '/js/api.js', '/js/i18n.js', '/js/idb.js'
];

self.addEventListener('install', evt => {
  self.skipWaiting();
  evt.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', evt => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);
  if (url.pathname.startsWith('/api/')) {
    evt.respondWith(
      fetch(evt.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(evt.request, copy));
        return r;
      }).catch(() => caches.match(evt.request).then(r => r || new Response(JSON.stringify({ offline:true }), { headers: {'Content-Type':'application/json'} })))
    );
    return;
  }

  evt.respondWith(caches.match(evt.request).then(r => r || fetch(evt.request)));
});
