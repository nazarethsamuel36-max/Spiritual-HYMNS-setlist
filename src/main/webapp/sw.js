const CACHE_NAME = 'worship-cache-v3'; // Bumped version for new CSS/JS
const ASSETS_TO_CACHE = [
  './',
  './index.jsp',
  './css/style.css',
  './js/app.js',
  'https://cdn.tailwindcss.com?plugins=forms,container-queries',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@200;300;400;500;600;700;800&family=Noto+Sans+Mono:wght@400;500&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  console.log('SW: Activated v3');
});

/**
 * Bug #5 Fix: Implemented true Network-First strategy with Cache-Update.
 * Dynamic pages (/song, /search, etc.) will always try the network first, 
 * but will silently update the offline cache if successful.
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-First (with cache update) for dynamic content
  if (url.pathname.includes('/song') || url.pathname.includes('/search') ||
      url.pathname.includes('/setlist') || url.pathname.includes('/transpose')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Update cache for next offline visit
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-First for static external assets (CDNs, Fonts)
  if (url.hostname.includes('google') || url.hostname.includes('gstatic') || 
      url.hostname.includes('tailwind')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // Stale-While-Revalidate for local JS/CSS
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
