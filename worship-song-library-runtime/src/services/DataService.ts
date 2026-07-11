import { supabase } from '../lib/supabaseClient';
import { db, normalizeSongIndex } from '../db/Database';
import type { SongDetail, SongIndex } from '../db/Database';
import { SearchEngine } from '../utils/SearchEngine';

const LAST_SYNC_TIME_KEY = 'last_sync_time';

type SyncState = 'IDLE' | 'CHECKING' | 'DOWNLOADING' | 'UPDATING_INDEXDB' | 'UPDATING_SEARCH' | 'SAVING_LAST_SYNC' | 'READY' | 'FAILED';

/**
 * Batched Download - Downloads all songs in batches with progress callback
 * This is triggered only when user explicitly clicks download button
 */
export async function batchDownloadSongs(
  onProgress?: (percent: number, message: string) => void
): Promise<'completed' | 'skipped' | 'error'> {
  try {
    console.log('� Batch Download: Starting...');

    // Get total count first
    const { count, error: countError } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (countError) {
      throw new Error(`Supabase count error: ${countError.message}`);
    }

    if (!count || count === 0) {
      onProgress?.(0, 'No songs found on server.');
      return 'error';
    }

    // 🛑 Check how many we already have in IndexedDB
    const localCount = await db.songIndex.count();

    // If we already have them all, SKIP downloading!
    if (localCount >= count) {
      console.log(`✅ Library already fully downloaded (${localCount}/${count} songs).`);
      onProgress?.(100, `Already downloaded! (${localCount} songs offline)`);
      return 'skipped';
    }

    console.log(`📊 Batch Download: Server has ${count} songs. Local has ${localCount}. Starting download...`);

    const BATCH_SIZE = 50;
    let downloadedCount = 0;
    const allSongDetails: SongDetail[] = [];
    const allSongIndices: SongIndex[] = [];

    // Download in batches
    while (downloadedCount < count) {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('is_active', true)
        .range(downloadedCount, downloadedCount + BATCH_SIZE - 1)
        .order('id', { ascending: true });

      if (error) {
        throw new Error(`Supabase fetch error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        break;
      }

      // Transform batch
      const batchDetails: SongDetail[] = data.map((song: any) => ({
        id: song.id,
        songNumber: song.song_number,
        title: song.title,
        artist: song.artist,
        composer: song.composer,
        language: song.language,
        originalKey: song.original_key,
        capo: song.capo,
        bpm: song.bpm,
        timeSignature: song.time_signature,
        hashtags: [],
        sections: parseLyricsToSections(song.lyrics || ''),
        chords: song.chords,
        lyrics: song.lyrics,
        isPublished: song.is_published !== false,
        is_active: song.is_active !== false,
        updated_at: song.updated_at
      }));

      const batchIndices: SongIndex[] = data.map((song: any) => ({
        id: song.id,
        songNumber: song.song_number,
        title: song.title,
        artist: song.artist,
        language: song.language,
        originalKey: song.original_key,
        hashtags: [],
        searchTokens: `${song.title} ${song.artist || ''} ${song.language || ''}`.toLowerCase(),
        romanTitle: song.title,
        isPublished: song.is_published !== false
      }));

      allSongDetails.push(...batchDetails);
      allSongIndices.push(...batchIndices);
      downloadedCount += data.length;

      // Update progress
      const percent = Math.round((downloadedCount / count) * 100);
      console.log(`📥 Batch Download: Progress ${percent}% (${downloadedCount}/${count})`);
      if (onProgress) {
        onProgress(percent, `Downloading ${downloadedCount}/${count} songs...`);
      }
    }

    console.log(`💾 Batch Download: Saving ${allSongDetails.length} songs to IndexedDB...`);

    // Bulk save to IndexedDB
    await db.transaction('rw', [db.songs, db.songIndex, db.meta], async () => {
      await db.songs.bulkPut(allSongDetails);
      await db.songIndex.bulkPut(allSongIndices.map(normalizeSongIndex));
      
      // Save sync timestamp
      await db.meta.put({
        id: LAST_SYNC_TIME_KEY,
        value: Date.now()
      });
    });

    // Update search engine
    await SearchEngine.indexSongs(allSongIndices.map(normalizeSongIndex));

    console.log('✅ Batch Download: Successfully downloaded and cached all songs');
    onProgress?.(100, 'Successfully downloaded all songs!');
    return 'completed';
  } catch (error) {
    console.error('❌ Batch Download failed:', error);
    onProgress?.(0, 'Download failed. Check connection.');
    return 'error';
  }
}

/**
 * Wake-Up Delta Sync - Fetches only changed songs since last sync
 * This runs on every app mount
 */
export async function wakeUpSync(): Promise<void> {
  // 🛑 Don't even try if offline
  if (!navigator.onLine) {
    console.log('⚠️ Wake-Up Sync: Offline, skipping.');
    return;
  }

  // Sync state machine
  let syncState: SyncState = 'IDLE';
  const setSyncState = (newState: SyncState) => {
    console.log(`🔄 Sync State: ${syncState} → ${newState}`);
    syncState = newState;
  };

  try {
    console.log('🔄 Wake-Up Sync: Checking for updates...');
    
    // Add metrics tracking at start of wakeUpSync()
    const syncStartTime = Date.now();
    let metrics = {
      lastSyncTime: 0,
      changedSongsFound: 0,
      songsDownloaded: 0,
      indexedDBWrites: 0,
      searchIndexUpdates: 0,
      duration: 0,
      status: 'pending'
    };
    
    setSyncState('CHECKING');

    // Get last sync time
    const syncMeta = await db.meta.get(LAST_SYNC_TIME_KEY);
    if (!syncMeta) {
      const localCount = await db.songIndex.count();
      if (localCount === 0) {
        console.log('⚠️ Wake-Up Sync: No lastSyncTime and empty DB - triggering initial download');
        await batchDownloadSongs();
        return;
      } else {
        console.log('⚠️ Wake-Up Sync: No lastSyncTime but has data - performing full reconciliation');
        // Derive timestamp from newest cached record
        const allSongs = await db.songs.toArray();
        let newestSong: SongDetail | null = null;
        for (const song of allSongs) {
          if (!newestSong || (song.updated_at && newestSong.updated_at && song.updated_at > newestSong.updated_at)) {
            newestSong = song;
          }
        }
        if (newestSong && newestSong.updated_at) {
          const newestTimestamp = new Date(newestSong.updated_at).getTime();
          await db.meta.put({
            id: LAST_SYNC_TIME_KEY,
            value: newestTimestamp
          });
          console.log(`✅ Wake-Up Sync: Derived lastSyncTime from newest song: ${newestSong.title}`);
          return; // Skip delta sync this time, will run on next app start
        } else {
          console.log('⚠️ Wake-Up Sync: Cannot derive timestamp - triggering full download');
          await batchDownloadSongs();
          return;
        }
      }
    }

    const lastSyncTime = syncMeta.value as number;
    const lastSyncDate = new Date(lastSyncTime).toISOString();
    metrics.lastSyncTime = lastSyncTime;

    console.log('🔄 Wake-Up Sync Stage: Read lastSyncTime');
    console.log(`📅 Wake-Up Sync: Last sync was at ${lastSyncDate}`);

    setSyncState('DOWNLOADING');
    console.log('🔄 Wake-Up Sync Stage: Query Supabase for changes');
    // Query for changed song IDs only
    const { data: changedIds, error } = await supabase
      .from('songs')
      .select('id')
      .gt('updated_at', lastSyncDate)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!changedIds || changedIds.length === 0) {
      console.log('✅ Wake-Up Sync: No changes detected');
      return;
    }

    console.log(`📝 Wake-Up Sync: Found ${changedIds.length} changed songs`);
    metrics.changedSongsFound = changedIds.length;
    console.log('🔄 Wake-Up Sync Stage: Fetch full song data');

    // Fetch full data for changed songs using .in()
    const ids = changedIds.map((item: any) => item.id);
    const { data: changedSongs, error: fetchError } = await supabase
      .from('songs')
      .select('*')
      .in('id', ids);

    if (fetchError) {
      throw new Error(`Supabase error: ${fetchError.message}`);
    }

    if (!changedSongs || changedSongs.length === 0) {
      console.warn('⚠️ Wake-Up Sync: No song data returned for changed IDs');
      return;
    }

    console.log('🔄 Wake-Up Sync Stage: Transform records');
    // Transform and update IndexedDB
    const songDetails: SongDetail[] = changedSongs.map((song: any) => ({
      id: song.id,
      songNumber: song.song_number,
      title: song.title,
      artist: song.artist,
      composer: song.composer,
      language: song.language,
      originalKey: song.original_key,
      capo: song.capo,
      bpm: song.bpm,
      timeSignature: song.time_signature,
      hashtags: [],
      sections: parseLyricsToSections(song.lyrics || ''),
      chords: song.chords,
      lyrics: song.lyrics,
      isPublished: song.is_published !== false,
      is_active: song.is_active !== false,
      updated_at: song.updated_at
    }));

    const songIndices: SongIndex[] = changedSongs.map((song: any) => ({
      id: song.id,
      songNumber: song.song_number,
      title: song.title,
      artist: song.artist,
      language: song.language,
      originalKey: song.original_key,
      hashtags: [],
      searchTokens: `${song.title} ${song.artist || ''} ${song.language || ''}`.toLowerCase(),
      romanTitle: song.title,
      isPublished: song.is_published !== false
    }));

    setSyncState('UPDATING_INDEXDB');
    console.log('🔄 Wake-Up Sync Stage: Update IndexedDB songs');
    // Update IndexedDB
    await db.transaction('rw', [db.songs, db.songIndex, db.meta], async () => {
      await db.songs.bulkPut(songDetails);
      await db.songIndex.bulkPut(songIndices.map(normalizeSongIndex));
      metrics.indexedDBWrites = songDetails.length;
      
      console.log('🔄 Wake-Up Sync Stage: Update IndexedDB songIndex');
      // Update sync timestamp
      await db.meta.put({
        id: LAST_SYNC_TIME_KEY,
        value: Date.now()
      });
      console.log('🔄 Wake-Up Sync Stage: Save new lastSyncTime');
    });
    setSyncState('SAVING_LAST_SYNC');

    setSyncState('UPDATING_SEARCH');
    console.log('🔄 Wake-Up Sync Stage: Update search engine');
    // Update search engine - only index changed songs
    await SearchEngine.indexSongs(songIndices.map(normalizeSongIndex));
    metrics.searchIndexUpdates = songIndices.length;
    metrics.songsDownloaded = changedSongs?.length || 0;
    metrics.duration = Date.now() - syncStartTime;
    metrics.status = 'success';

    console.log('✅ Wake-Up Sync: Successfully synced changes');
    
    // Sync Integrity Verification
    console.log('═══════════════════════════════');
    console.log('Sync Verification');
    console.log('═══════════════════════════════');
    console.log(`Supabase Changed Songs: ${changedIds.length}`);
    console.log(`Downloaded: ${changedSongs?.length || 0}`);
    console.log(`IndexedDB Updated: ${songDetails.length}`);
    console.log(`Search Updated: ${songIndices.length}`);
    console.log(`Deleted: 0`); // Will be implemented after deletion rules defined

    const allMatch = 
      changedIds.length === (changedSongs?.length || 0) &&
      (changedSongs?.length || 0) === songDetails.length &&
      songDetails.length === songIndices.length;

    console.log(`Status: ${allMatch ? 'PASS' : 'FAIL'}`);
    console.log('═══════════════════════════════');
    
    // Print metrics at end
    console.log('═══════════════════════════════');
    console.log('Wake-Up Sync Metrics');
    console.log('═══════════════════════════════');
    console.log(`Last Sync: ${new Date(metrics.lastSyncTime).toISOString()}`);
    console.log(`Changed Songs: ${metrics.changedSongsFound}`);
    console.log(`Downloaded: ${metrics.songsDownloaded}`);
    console.log(`IndexedDB Writes: ${metrics.indexedDBWrites}`);
    console.log(`Search Index Updates: ${metrics.searchIndexUpdates}`);
    console.log(`Duration: ${metrics.duration}ms`);
    console.log(`Status: ${metrics.status}`);
    console.log('═══════════════════════════════');
    setSyncState('READY');
  } catch (error) {
    setSyncState('FAILED');
    console.error('❌ Wake-Up Sync failed:', error);
    // Don't throw - allow app to continue with cached data
  }
}

/**
 * Get songs - Web Mode (Supabase) or App Mode (IndexedDB)
 */
export async function getSongs(): Promise<SongIndex[]> {
  const localSongs = await db.songIndex.toArray();

  if (localSongs.length > 0) {
    console.log('📱 App Mode: Returning songs from IndexedDB');
    return localSongs.map(normalizeSongIndex);
  }

  // 🛑 Prevent Supabase call if offline
  if (!navigator.onLine) {
    console.warn('⚠️ Offline and no local data. Returning empty list.');
    return [];
  }

  console.log('🌐 Web Mode: Fetching songs from Supabase');
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('is_active', true)
    .order('song_number', { ascending: true });

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((song: any) => ({
    id: song.id,
    songNumber: song.song_number,
    title: song.title,
    artist: song.artist,
    language: song.language,
    originalKey: song.original_key,
    hashtags: [],
    searchTokens: `${song.title} ${song.artist || ''} ${song.language || ''}`.toLowerCase(),
    romanTitle: song.title,
    isPublished: song.is_published !== false
  }));
}

/**
 * Get song by ID - IndexedDB first, then Supabase fallback.
 * If the cached song has no displayable content and we are online,
 * we bypass the cache and re-fetch from Supabase so any newly-added
 * content is picked up immediately without requiring a full re-download.
 */
export async function getSongById(id: number): Promise<SongDetail | null> {
  const localSong = await db.songs.get(id);

  if (localSong) {
    const hasContent = localSong.chords || localSong.lyrics;
    if (hasContent) {
      console.log('📱 App Mode: Returning song from IndexedDB');
      return localSong;
    }
    // Local cache hit but empty content — try Supabase if online
    if (!navigator.onLine) {
      console.warn('⚠️ Song cached but has no content, and we are offline.');
      return localSong; // Return what we have — caller shows appropriate message
    }
    console.log('🔄 Song in IndexedDB has no content — re-fetching fresh from Supabase...');
  } else {
    // Not in IndexedDB at all
    if (!navigator.onLine) {
      console.warn('⚠️ Offline and song not in local DB.');
      return null;
    }
    console.log('🌐 Web Mode: Song not in IndexedDB, fetching from Supabase...');
  }

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  if (!data) {
    return localSong ?? null; // Return stale local copy if we have one
  }

  const fresh: SongDetail = {
    id: data.id,
    songNumber: data.song_number,
    title: data.title,
    artist: data.artist,
    composer: data.composer,
    language: data.language,
    originalKey: data.original_key,
    capo: data.capo,
    bpm: data.bpm,
    timeSignature: data.time_signature,
    hashtags: [],
    sections: parseLyricsToSections(data.lyrics || ''),
    chords: data.chords,
    lyrics: data.lyrics,
    isPublished: data.is_published !== false,
    is_active: data.is_active !== false,
    updated_at: data.updated_at
  };

  // If Supabase now has content, update IndexedDB so next time is instant
  if (fresh.chords || fresh.lyrics) {
    console.log('✅ Supabase has content — updating IndexedDB cache.');
    await db.songs.put(fresh);
  } else {
    console.warn(`⚠️ Song #${id} has no chords or lyrics in Supabase either (database content gap).`);
  }

  return fresh;
}

/**
 * Helper function to parse lyrics string to sections
 */
function parseLyricsToSections(lyrics: string): Array<{ type: string; label: string; lines: Array<{ text: string }> }> {
  if (!lyrics) return [];
  
  const sections: Array<{ type: string; label: string; lines: Array<{ text: string }> }> = [];
  const lines = lyrics.split('\n');
  let currentSection: { type: string; label: string; lines: Array<{ text: string }> } | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Detect section headers (e.g., [Verse 1], [Chorus])
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'verse',
        label: sectionMatch[1],
        lines: []
      };
    } else if (currentSection) {
      currentSection.lines.push({ text: trimmed });
    } else {
      // First line without section header
      currentSection = {
        type: 'verse',
        label: 'Verse 1',
        lines: [{ text: trimmed }]
      };
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}
