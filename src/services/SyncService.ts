import { db, normalizeSongIndex } from '../db/Database';
import { SearchEngine } from '../utils/SearchEngine';

const EXPORTS_BASE_URL = '/exports';

export class SyncService {
  /**
   * Main sync entry point. Detects changes and updates the local index.
   */
  static async sync(force: boolean = false) {
    try {
      // 1. Fetch remote manifest
      const response = await fetch(`${EXPORTS_BASE_URL}/manifest.json`, { cache: 'no-cache' });
      if (!response.ok) throw new Error('Manifest not found');
      const remoteManifest = await response.json();

      // 2. Get local manifest and song count
      const localManifest = await db.syncMeta.get('manifest');
      const localSongsCount = await db.songs.count();

      // 3. Compare versions/dates or check if local database is missing songs
      const targetCount = remoteManifest.songCount || 700;
      const needsSync = force || !localManifest || localManifest.generatedAt !== remoteManifest.generatedAt || localSongsCount < targetCount;

      if (needsSync) {
        console.log('New version detected. Performing deep sync...');
        await this.performSync(remoteManifest);
      } else {
        console.log('Local index is up to date.');
        // Still need to warm up the search index in memory
        const songs = await db.songIndex.toArray();
        await SearchEngine.indexSongs(songs.map(normalizeSongIndex));
      }
    } catch (error) {
      console.error('Sync check failed:', error);
      // Fallback: warm up search with whatever we have
      const songs = await db.songIndex.toArray();
      if (songs.length > 0) {
        await SearchEngine.indexSongs(songs);
      }
    }
  }

  private static async performSync(manifest: any) {
    try {
      console.log('Downloading latest song index...');
      const indexResponse = await fetch(`${EXPORTS_BASE_URL}/index.json`, { cache: 'no-cache' });
      if (!indexResponse.ok) throw new Error('Index not found on server');
      
      const indexData = await indexResponse.json();

      // --- VALIDATION LAYER (Atomic Update) ---
      if (!indexData.songs || !Array.isArray(indexData.songs)) {
        throw new Error('CORRUPTION DETECTED: Remote index.json is malformed');
      }

      if (indexData.songs.length === 0) {
        throw new Error('CORRUPTION DETECTED: Remote index is empty');
      }

      // Basic structure check for a few items
      const sample = indexData.songs[0];
      if (!sample.id || !sample.title) {
        throw new Error('CORRUPTION DETECTED: Index items missing required fields');
      }

      const normalizedSongs = indexData.songs.map(normalizeSongIndex);

      console.log(`Validation PASSED. Swapping ${normalizedSongs.length} songs into local database...`);

      // Try to load full library bundle for instant offline availability
      let allSongs = [];
      try {
        const allSongsResponse = await fetch(`${EXPORTS_BASE_URL}/all-songs.json`);
        if (allSongsResponse.ok) {
          allSongs = await allSongsResponse.json();
          console.log(`Loaded full songs bundle: ${allSongs.length} songs`);
        }
      } catch (bundleErr) {
        console.warn('Could not load all-songs.json bundle:', bundleErr);
      }

      // --- SWAP LAYER ---
      await db.transaction('rw', [db.songIndex, db.syncMeta, db.songs], async () => {
        if (allSongs.length > 0) {
          await db.songs.clear();
          await db.songs.bulkPut(allSongs);
        }
        // Clear and refill metadata index
        await db.songIndex.clear();
        await db.songIndex.bulkAdd(normalizedSongs);

        // Update sync metadata
        await db.syncMeta.put({
          id: 'manifest',
          version: manifest.version,
          generatedAt: manifest.generatedAt,
          songCount: manifest.songCount,
          lastSyncedAt: Date.now()
        });
      });

      // Update in-memory engine
      await SearchEngine.indexSongs(normalizedSongs);
      if (allSongs.length > 0) {
        await SearchEngine.indexLyrics(allSongs);
      }
      console.log('Sync complete. System is stable.');

    } catch (err) {
      console.error('CRITICAL SYNC FAILURE:', err);
      // Fallback: Preserve last known good state by doing nothing to the DB
      // but still warming up the search engine with what we already have
      const existing = await db.songIndex.toArray();
      if (existing.length > 0) {
        console.warn('Falling back to last known good local dataset.');
        await SearchEngine.indexSongs(existing.map(normalizeSongIndex));
      }
      throw err;
    }
  }

  /**
   * Explicitly download and cache all song details for guaranteed offline access.
   */
  static async downloadAllSongs(onProgress: (current: number, total: number) => void) {
    try {
      const res = await fetch(`${EXPORTS_BASE_URL}/all-songs.json`);
      if (res.ok) {
        const allSongs = await res.json();
        await db.songs.bulkPut(allSongs);
        await SearchEngine.indexLyrics(allSongs);
        onProgress(allSongs.length, allSongs.length);
        return;
      }
    } catch (e) {
      console.warn('Bundle download failed, falling back to batch:', e);
    }

    const allSongs = await db.songIndex.toArray();
    const total = allSongs.length;
    let downloaded = 0;
    const batchSize = 10;

    // Filter out already cached songs to save bandwidth
    const cachedIds = new Set(await db.songs.toCollection().primaryKeys());
    const remaining = allSongs.filter(s => !cachedIds.has(s.id));
    
    downloaded = total - remaining.length;
    onProgress(downloaded, total);

    for (let i = 0; i < remaining.length; i += batchSize) {
      const batch = remaining.slice(i, i + batchSize);
      await Promise.all(batch.map(async (s) => {
        try {
          const res = await fetch(`${EXPORTS_BASE_URL}/songs/${s.id}.json`);
          if (res.ok) {
            const data = await res.json();
            await db.songs.put(data);
          }
        } catch (e) {
          console.error(`Failed to pre-cache song ${s.id}:`, e);
        }
      }));
      downloaded += batch.length;
      onProgress(downloaded, total);
    }
  }
}
