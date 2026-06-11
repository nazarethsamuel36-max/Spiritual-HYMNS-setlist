import { db } from '../db/Database';
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

      // 2. Get local manifest
      const localManifest = await db.syncMeta.get('manifest');

      // 3. Compare versions/dates
      const needsSync = force || !localManifest || localManifest.generatedAt !== remoteManifest.generatedAt;

      if (needsSync) {
        console.log('New version detected. Performing deep sync...');
        await this.performSync(remoteManifest);
      } else {
        console.log('Local index is up to date.');
        // Still need to warm up the search index in memory
        const songs = await db.songIndex.toArray();
        await SearchEngine.indexSongs(songs);
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

      console.log(`Validation PASSED. Swapping ${indexData.songs.length} songs into local database...`);

      // --- SWAP LAYER ---
      await db.transaction('rw', [db.songIndex, db.syncMeta], async () => {
        // Clear and refill metadata index
        await db.songIndex.clear();
        await db.songIndex.bulkAdd(indexData.songs);

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
      await SearchEngine.indexSongs(indexData.songs);
      console.log('Sync complete. System is stable.');

    } catch (err) {
      console.error('CRITICAL SYNC FAILURE:', err);
      // Fallback: Preserve last known good state by doing nothing to the DB
      // but still warming up the search engine with what we already have
      const existing = await db.songIndex.toArray();
      if (existing.length > 0) {
        console.warn('Falling back to last known good local dataset.');
        await SearchEngine.indexSongs(existing);
      }
      throw err;
    }
  }

  /**
   * Explicitly download and cache all song details for guaranteed offline access.
   */
  static async downloadAllSongs(onProgress: (current: number, total: number) => void) {
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
