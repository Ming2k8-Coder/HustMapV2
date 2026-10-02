// HustMap Service Worker - Offline Ready & 3G Optimization
const CACHE_NAME = 'hustmap-offline-v1';
const PRECACHE_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './hustmap_font.css',
  './hustmap_original.css',
  './api_style_vi.json',
  './api_style_en.json',
  './buildings.json',
  './campus_roads.json',
  './offline_assets.json',
  './vendor/maplibre-gl/maplibre-gl.css',
  './vendor/maplibre-gl/maplibre-gl.mjs',
  './vendor/maplibre-gl/maplibre-gl-shared.mjs'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching core app shell');
      return cache.addAll(PRECACHE_SHELL);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  // 1. Handle CDN libraries (jsDelivr, etc.): Cache-first with background revalidation
  const isCdnRequest = (
    url.hostname.includes('jsdelivr.net') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  );

  if (isCdnRequest) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        // If cached, return immediately, and fetch in background to check diff / update cache if online
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => null);

        if (cachedResponse) {
          // Stale-While-Revalidate: serve cached instantly, update in background
          event.waitUntil(fetchPromise);
          return cachedResponse;
        }

        // No cache yet: await network fetch
        const networkResponse = await fetchPromise;
        if (networkResponse) {
          return networkResponse;
        }

        // If network failed and CDN was MapLibre GL, fallback to local vendor copy
        if (url.pathname.includes('maplibre-gl.mjs')) {
          const fallback = await cache.match('./vendor/maplibre-gl/maplibre-gl.mjs');
          if (fallback) return fallback;
        }
        if (url.pathname.includes('maplibre-gl.css')) {
          const fallback = await cache.match('./vendor/maplibre-gl/maplibre-gl.css');
          if (fallback) return fallback;
        }

        return new Response('CDN offline and not cached', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  // Only handle same-origin requests beyond this point
  if (url.origin !== self.location.origin) {
    return;
  }

  const isMapAsset = (
    url.pathname.includes('/tiles/') ||
    url.pathname.includes('/fonts/') ||
    url.pathname.includes('/sprites/') ||
    url.pathname.includes('/style/') ||
    url.pathname.includes('/building_images/') ||
    url.pathname.endsWith('.pbf') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf')
  );

  if (isMapAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return new Response(new Uint8Array(0), { status: 404, statusText: 'Offline Asset Not Cached' });
        }
      })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse || new Response('Offline and not cached', { status: 503, statusText: 'Service Unavailable' });
      });

      return cachedResponse || fetchPromise;
    })
  );
});
