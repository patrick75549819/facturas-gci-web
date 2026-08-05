const CACHE_NAME = 'facturas-gci-v1';
const APP_SHELL = ['./index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Solo cachea el "cascarón" de la app (HTML/manifest). Las facturas y datos
// de la API siempre se piden frescos a internet, nunca desde cache.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // deja pasar llamadas a la API tal cual
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
