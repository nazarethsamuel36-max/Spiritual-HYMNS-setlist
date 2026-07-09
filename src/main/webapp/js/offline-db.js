/**
 * offline-db.js  — IndexedDB manager for Worship Song Library PWA
 * ================================================================
 * Keeps a local copy of every song in IndexedDB so the app works
 * fully offline even on a cold homescreen launch.
 *
 * Usage (auto-runs on DOMContentLoaded if window.CONTEXT_PATH is set):
 *   - When online: fetches /api/songs/all and writes songs to IDB
 *   - Exposes window.OfflineDB for other scripts to query
 *
 * IndexedDB structure:
 *   DB:    worship_offline_v1
 *   Store: songs  (keyPath: id)
 *   Store: meta   (keyPath: key) — sync timestamps etc.
 */
(function () {
    'use strict';

    const DB_NAME    = 'worship_offline_v1';
    const DB_VERSION = 1;
    const SONGS_STORE = 'songs';
    const META_STORE  = 'meta';

    // How old the cache must be (ms) before we re-sync when online
    const SYNC_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

    /* ------------------------------------------------------------------ */
    /*  DB open / upgrade                                                   */
    /* ------------------------------------------------------------------ */
    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);

            req.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(SONGS_STORE)) {
                    const store = db.createObjectStore(SONGS_STORE, { keyPath: 'id' });
                    store.createIndex('songNumber', 'songNumber', { unique: false });
                    store.createIndex('language',   'language',   { unique: false });
                    store.createIndex('title',      'title',      { unique: false });
                }
                if (!db.objectStoreNames.contains(META_STORE)) {
                    db.createObjectStore(META_STORE, { keyPath: 'key' });
                }
            };

            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Read meta value                                                     */
    /* ------------------------------------------------------------------ */
    function getMeta(db, key) {
        return new Promise((resolve) => {
            const tx  = db.transaction(META_STORE, 'readonly');
            const req = tx.objectStore(META_STORE).get(key);
            req.onsuccess = (e) => resolve(e.target.result ? e.target.result.value : null);
            req.onerror   = () => resolve(null);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Write meta value                                                    */
    /* ------------------------------------------------------------------ */
    function setMeta(db, key, value) {
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(META_STORE, 'readwrite');
            const req = tx.objectStore(META_STORE).put({ key, value });
            req.onsuccess = () => resolve();
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Write a batch of songs into IDB                                     */
    /* ------------------------------------------------------------------ */
    function writeSongs(db, songs) {
        return new Promise((resolve, reject) => {
            const tx    = db.transaction(SONGS_STORE, 'readwrite');
            const store = tx.objectStore(SONGS_STORE);
            songs.forEach(song => store.put(song));
            tx.oncomplete = () => resolve(songs.length);
            tx.onerror    = (e) => reject(e.target.error);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Fetch all songs from server (paginated)                             */
    /* ------------------------------------------------------------------ */
    async function fetchAllSongsFromServer(contextPath) {
        const allSongs = [];
        let page = 1;
        const size = 500;

        while (true) {
            const url = `${contextPath}/api/songs/all?page=${page}&size=${size}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`Server returned ${resp.status}`);

            const data = await resp.json();
            const songs = data.songs || [];
            allSongs.push(...songs);

            if (allSongs.length >= data.total || songs.length < size) break;
            page++;
        }

        return allSongs;
    }

    /* ------------------------------------------------------------------ */
    /*  Public: get a single song by ID from IDB                           */
    /* ------------------------------------------------------------------ */
    function getSongById(db, id) {
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(SONGS_STORE, 'readonly');
            const req = tx.objectStore(SONGS_STORE).get(Number(id));
            req.onsuccess = (e) => resolve(e.target.result || null);
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Public: get all songs from IDB                                      */
    /* ------------------------------------------------------------------ */
    function getAllSongs(db) {
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(SONGS_STORE, 'readonly');
            const req = tx.objectStore(SONGS_STORE).getAll();
            req.onsuccess = (e) => resolve(e.target.result || []);
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Public: get songs by language index                                 */
    /* ------------------------------------------------------------------ */
    function getSongsByLanguage(db, language) {
        return new Promise((resolve, reject) => {
            const tx    = db.transaction(SONGS_STORE, 'readonly');
            const index = tx.objectStore(SONGS_STORE).index('language');
            const req   = index.getAll(language);
            req.onsuccess = (e) => resolve(e.target.result || []);
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Main sync — runs on page load when online                           */
    /* ------------------------------------------------------------------ */
    async function syncIfNeeded(contextPath) {
        if (!navigator.onLine) return;

        const db = await openDB();

        // Check last sync timestamp
        const lastSync = await getMeta(db, 'lastSyncAt');
        const now      = Date.now();

        if (lastSync && (now - lastSync) < SYNC_INTERVAL_MS) {
            console.log('[OfflineDB] Cache fresh, skip sync. Next sync in',
                Math.round((SYNC_INTERVAL_MS - (now - lastSync)) / 60000), 'min');
            db.close();
            return;
        }

        console.log('[OfflineDB] Starting song sync…');

        try {
            const songs = await fetchAllSongsFromServer(contextPath);
            const written = await writeSongs(db, songs);
            await setMeta(db, 'lastSyncAt', now);
            console.log(`[OfflineDB] Synced ${written} songs to IndexedDB ✓`);

            // Dispatch event so other code can react
            window.dispatchEvent(new CustomEvent('offlinedb:synced', { detail: { count: written } }));
        } catch (err) {
            console.warn('[OfflineDB] Sync failed (will retry next load):', err.message);
        } finally {
            db.close();
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Expose public API as window.OfflineDB                              */
    /* ------------------------------------------------------------------ */
    window.OfflineDB = {
        openDB,
        getSongById,
        getAllSongs,
        getSongsByLanguage,
        syncIfNeeded,
    };

    /* ------------------------------------------------------------------ */
    /*  Auto-sync on page load                                              */
    /* ------------------------------------------------------------------ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const ctx = window.CONTEXT_PATH || '';
            // Small delay so it doesn't compete with first-paint resources
            setTimeout(() => syncIfNeeded(ctx), 3000);
        });
    } else {
        const ctx = window.CONTEXT_PATH || '';
        setTimeout(() => syncIfNeeded(ctx), 3000);
    }

})();
