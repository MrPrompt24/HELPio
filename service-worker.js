const CACHE_NAME = 'helpio-app-v1.0.0';

/**
 * Core aplikacji – tylko to, co MUSI działać offline
 * Ścieżki ABSOLUTNE, ale w obrębie /app
 */
const CORE_ASSETS = [
  '/app/',
  '/app/index.html',

  '/app/css/style.css',

  '/app/js/script.js',
  '/app/js/init-check.js',

  '/app/security/security.js',

  '/app/partners/banners.js',
  '/app/partners/rotator.js',

  '/app/availability/dostepnosc.js',

  '/app/manifest.json',

  '/app/images/icon-192x192.png',
  '/app/images/icon-512x512.png',
  '/app/images/icon-192x192-maskable.png',
  '/app/images/icon-512x512-maskable.png',

  '/app/images/logo.png',
  '/app/images/powered.png',
  '/app/images/sos.png'
];

/* =========================
   INSTALL
========================= */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

/* =========================
   ACTIVATE
========================= */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* =========================
   FETCH
========================= */
self.addEventListener('fetch', event => {
  // tylko GET
  if (event.request.method !== 'GET') return;

  // tylko zasoby z /app
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith('/app/')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // fallback offline tylko dla HTML
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/app/index.html');
          }
        });
    })
  );
});
