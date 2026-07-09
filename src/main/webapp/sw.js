/**
 * sw.js — Worship Song Library PWA Service Worker v5
 * ====================================================
 * OFFLINE STRATEGY:
 *   - Static assets (CSS, JS, fonts) → Cache-First
 *   - Song list page (/songs)         → Network-First with cache fallback
 *   - Individual song pages (/song)   → Redirected to offline-song.html (reads from IDB)
 *   - API /api/songs/all              → Network-First with cache fallback
 *   - Navigation offline fallback     → /songs (cached) or offline-song.html
 */

const CACHE_NAME = 'worship-cache-v5';

/**
 * Core static assets that MUST work offline.
 * These are pre-cached at install time.
 * NOTE: No cache-buster query params here — SW cache uses URL as key.
 */
const ASSETS_TO_CACHE = [
    './',
    './offline-song.html',
    './css/tailwind-output.css',
    './css/style.css',
    './css/live-search.css',
    './js/app.js',
    './js/chord_splitting.js',
    './js/live-search.js',
    './js/offline-db.js',
    // Fonts (served locally after first cache)
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@200;300;400;500;600;700;800&family=Noto+Sans+Mono:wght@400;500&display=swap',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
];

/* ─────────────────────────────────────────────
   INSTALL: pre-cache all critical static assets
   ───────────────────────────────────────────── */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW v5] Pre-caching core assets');
            // addAll fails atomically — if any fail, fall back gracefully
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url =>
                    cache.add(url).catch(err =>
                        console.warn('[SW v5] Could not cache:', url, err.message)
                    )
                )
            );
        })
    );
    self.skipWaiting();
});

/* ─────────────────────────────────────────────
   ACTIVATE: clear old caches
   ───────────────────────────────────────────── */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW v5] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
    console.log('[SW v5] Activated');
});

/* ─────────────────────────────────────────────
   FETCH: smart strategy per request type
   ───────────────────────────────────────────── */
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // ── 1. CDN / External fonts/scripts → Cache-First ──────────────────
    if (url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com')    ||
        url.hostname.includes('tailwindcss.com') ||
        url.hostname.includes('cdn.jsdelivr.net')) {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    // ── 2. Individual song navigation → Offline Song Viewer ─────────────
    // When a user taps a song card offline, /song?id=X would 404 (server
    // is not reachable). Instead, intercept navigation to /song and redirect
    // to the standalone offline-song.html, which reads from IndexedDB.
    if (event.request.mode === 'navigate' && url.pathname.endsWith('/song')) {
        event.respondWith(songNavigationHandler(event.request, url));
        return;
    }

    // ── 3. All other navigation (song list, home, etc.) → Network-First ─
    if (event.request.mode === 'navigate') {
        event.respondWith(networkFirstNavigation(event.request));
        return;
    }

    // ── 4. /api/songs/all → Network-First with cache fallback ───────────
    if (url.pathname.includes('/api/songs/all')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // ── 5. Other API calls (search, transpose, etc.) → Network-First ────
    if (url.pathname.includes('/api/') ||
        url.pathname.includes('/live-search') ||
        url.pathname.includes('/transpose')   ||
        url.pathname.includes('/setlist')     ||
        url.pathname.includes('/leaflet')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // ── 6. Local static assets (JS, CSS, images) → Stale-While-Revalidate
    //    Strip query params (cache-busters) when matching cache entries.
    event.respondWith(staleWhileRevalidate(event.request));
});

/* ─────────────────────────────────────────────
   STRATEGY HELPERS
   ───────────────────────────────────────────── */

/**
 * Cache-First: Serve from cache, fall back to network.
 * Best for immutable assets (fonts, CDN scripts).
 */
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const networkResp = await fetch(request);
        if (networkResp && networkResp.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResp.clone());
        }
        return networkResp;
    } catch (err) {
        console.warn('[SW v5] Cache-first: network failed for', request.url);
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network-First: Try network, fall back to cache.
 * Best for dynamic content that should stay fresh.
 */
async function networkFirst(request) {
    try {
        const networkResp = await fetch(request);
        if (networkResp && networkResp.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResp.clone());
        }
        return networkResp;
    } catch {
        // Strip cache-buster query params when looking up cache
        const cacheKey = requestWithoutCacheBuster(request);
        const cached = await caches.match(cacheKey) || await caches.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ error: 'Offline' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
}

/**
 * Network-First for navigate requests: falls back to /songs (cached).
 */
async function networkFirstNavigation(request) {
    try {
        const networkResp = await fetch(request);
        if (networkResp && networkResp.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResp.clone());
        }
        return networkResp;
    } catch {
        // Try exact URL first, then fall back to the songs list page
        const cached = await caches.match(request)
                    || await caches.match('./songs')
                    || await caches.match('./');
        if (cached) return cached;
        // Last resort: offline-song.html (at least that'll load from IDB)
        return caches.match('./offline-song.html');
    }
}

/**
 * Song navigation handler:
 * - Online  → let the server render the JSP as normal
 * - Offline → redirect to offline-song.html?id=X (reads IndexedDB)
 */
async function songNavigationHandler(request, url) {
    // Try network first
    try {
        const networkResp = await fetch(request);
        if (networkResp && networkResp.status === 200) {
            // Cache the live response so it's available next time
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResp.clone());
            return networkResp;
        }
    } catch { /* offline */ }

    // Offline: check if we have it cached from a previous online visit
    const cached = await caches.match(request);
    if (cached) return cached;

    // Not cached — redirect to the standalone offline viewer
    const songId = url.searchParams.get('id') || '';
    const offlineUrl = new URL('./offline-song.html', url.origin + url.pathname.replace(/\/song$/, '/'));
    offlineUrl.searchParams.set('id', songId);

    // Return a redirect response
    return Response.redirect(offlineUrl.toString(), 302);
}

/**
 * Stale-While-Revalidate: return cache immediately, update in background.
 * Strips cache-buster query params (like ?v=1234567890) so cached
 * versions are found even when timestamps change.
 */
async function staleWhileRevalidate(request) {
    const cacheKey = requestWithoutCacheBuster(request);
    const cache    = await caches.open(CACHE_NAME);
    const cached   = await cache.match(cacheKey) || await cache.match(request);

    const fetchPromise = fetch(request).then((networkResp) => {
        if (networkResp && networkResp.status === 200) {
            cache.put(cacheKey, networkResp.clone());
        }
        return networkResp;
    }).catch(() => null);

    return cached || fetchPromise;
}

/**
 * Strip ?v=... cache-buster query params from a Request so SW cache
 * lookups succeed even when the timestamp changes between page loads.
 */
function requestWithoutCacheBuster(request) {
    const url = new URL(request.url);
    url.searchParams.delete('v');
    if (url.href === request.url) return request; // nothing changed
    return new Request(url.href, {
        method:  request.method,
        headers: request.headers,
        mode:    request.mode === 'navigate' ? 'same-origin' : request.mode,
        credentials: request.credentials,
        redirect: request.redirect,
    });
}
