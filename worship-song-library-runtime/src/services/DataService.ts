import { supabase } from '../lib/supabaseClient';
import { db, normalizeSongIndex } from '../db/Database';
import type { SongDetail, SongIndex } from '../db/Database';
import { SearchEngine } from '../utils/SearchEngine';

const LAST_SYNC_TIME_KEY = 'last_sync_time';

type SyncTrigger = 'app-start' | 'online-event' | 'manual';

/**
 * Manually update the sync timestamp to current time
 * Use this to force wakeUpSync to detect all recent changes
 */
export async function updateSyncTimestamp(): Promise<void> {
  await db.meta.put({
    id: LAST_SYNC_TIME_KEY,
    value: Date.now()
  });
  console.log('✅ Sync timestamp updated to current time');
}

interface SyncResult {
  success: boolean;
  changedSongs: number;
  updatedSongs: number;
  insertedSongs: number;
  deletedSongs: number;
  verificationPassed: boolean;
  duration: number;
  errors: string[];
}

/**
 * Batched Download - Downloads all songs in batches with progress callback
 * This is triggered only when user explicitly clicks download button
 */
export async function batchDownloadSongs(
  onProgress?: (percent: number, message: string) => void
): Promise<'completed' | 'skipped' | 'error'> {
  try {
    console.log('📦 Batch Download: Starting...');

    // Get total count first
    const { count, error: countError } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (countError) {
      console.warn(`⚠️ Supabase count error (${countError.message}). Switching to JSON backup download...`);
      return await batchDownloadFromJson(onProgress);
    }

    if (!count || count === 0) {
      console.warn('⚠️ No songs on server. Trying JSON backup download...');
      return await batchDownloadFromJson(onProgress);
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
        is_active: song.is_active !== false,
        updated_at: song.updated_at,
        genres: song.genre || [],
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
        genres: song.genre || [],
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

    // Update search engine (title index)
    await SearchEngine.indexSongs(allSongIndices.map(normalizeSongIndex));
    
    // Update lyrics search index
    await SearchEngine.indexLyrics(allSongDetails);

    console.log('✅ Batch Download: Successfully downloaded and cached all songs');
    onProgress?.(100, 'Successfully downloaded all songs!');
    return 'completed';
  } catch (error) {
    console.error('❌ Batch Download failed, trying JSON backup download:', error);
    return await batchDownloadFromJson(onProgress);
  }
}

function extractLyricsAndChordsFromSections(sections: any[]): { chords: string; lyrics: string } {
  if (!sections || !sections.length) return { chords: '', lyrics: '' };
  
  const chords = sections
    .map((s: any) => {
      const header = s.label ? `[${s.label}]\n` : '';
      const lines = (s.lines || []).map((l: any) => {
        if (typeof l === 'string') return l;
        let lineText = l.text || '';
        if (l.chords && l.chords.length > 0) {
          const sorted = [...l.chords].sort((a: any, b: any) => b.position - a.position);
          for (const c of sorted) {
            const pos = Math.min(Math.max(0, c.position), lineText.length);
            lineText = lineText.slice(0, pos) + `[${c.chord}]` + lineText.slice(pos);
          }
        }
        return lineText;
      }).join('\n');
      return header + lines;
    })
    .join('\n\n');

  const lyrics = sections
    .map((s: any) => {
      const header = s.label ? `[${s.label}]\n` : '';
      const lines = (s.lines || []).map((l: any) => (typeof l === 'string' ? l : l.text || '')).join('\n');
      return header + lines;
    })
    .join('\n\n');

  return { chords, lyrics };
}

/**
 * Fallback Batch Download from static JSON exports
 */
async function batchDownloadFromJson(
  onProgress?: (percent: number, message: string) => void
): Promise<'completed' | 'skipped' | 'error'> {
  try {
    console.log('🗂️ Batch Download via JSON Fallback starting...');
    onProgress?.(5, 'Fetching backup index...');
    
    const indexRes = await fetch('/exports/index.json');
    if (!indexRes.ok) throw new Error(`Failed to fetch index.json: HTTP ${indexRes.status}`);
    const indexData = await indexRes.json();
    const songsList = indexData.songs || [];
    
    if (songsList.length === 0) {
      onProgress?.(0, 'No songs found in backup index.');
      return 'error';
    }

    const count = songsList.length;
    const localCount = await db.songIndex.count();
    if (localCount >= count) {
      console.log(`✅ Library already fully downloaded (${localCount}/${count} songs).`);
      onProgress?.(100, `Already downloaded! (${localCount} songs offline)`);
      return 'skipped';
    }

    const allSongDetails: SongDetail[] = [];
    const allSongIndices: SongIndex[] = [];
    const BATCH_SIZE = 25;
    let processed = 0;

    for (let i = 0; i < count; i += BATCH_SIZE) {
      const batchSlice = songsList.slice(i, i + BATCH_SIZE);
      const songResults = await Promise.all(
        batchSlice.map(async (indexSong: any) => {
          try {
            const res = await fetch(`/exports/songs/${indexSong.id}.json`);
            if (!res.ok) return null;
            const songData = await res.json();
            
            const extracted = extractLyricsAndChordsFromSections(songData.sections);
            const chords = songData.chords || extracted.chords;
            const lyrics = songData.lyrics || extracted.lyrics;

            const detail: SongDetail = {
              id: songData.id,
              songNumber: songData.songNumber,
              title: songData.title,
              artist: songData.artist,
              composer: songData.composer,
              language: songData.language,
              originalKey: songData.originalKey,
              capo: songData.capo || 0,
              bpm: songData.bpm || 0,
              timeSignature: songData.timeSignature || '4/4',
              hashtags: songData.hashtags || [],
              sections: songData.sections || parseLyricsToSections(lyrics),
              chords,
              lyrics,
              is_active: true,
              updated_at: songData.updated_at,
              genres: songData.genres || [],
            };

            const songIndex: SongIndex = {
              id: songData.id,
              songNumber: songData.songNumber,
              title: songData.title,
              artist: songData.artist,
              language: songData.language,
              originalKey: songData.originalKey,
              hashtags: songData.hashtags || [],
              searchTokens: indexSong.searchTokens || `${songData.title} ${songData.artist || ''} ${songData.language || ''}`.toLowerCase(),
              genres: songData.genres || [],
            };

            return { detail, songIndex };
          } catch {
            return null;
          }
        })
      );

      for (const res of songResults) {
        if (res) {
          allSongDetails.push(res.detail);
          allSongIndices.push(res.songIndex);
        }
      }

      processed += batchSlice.length;
      const percent = Math.round((processed / count) * 100);
      onProgress?.(percent, `Downloading backup: ${processed}/${count} songs...`);
    }

    console.log(`💾 Saving ${allSongDetails.length} songs from JSON to IndexedDB...`);
    await db.transaction('rw', [db.songs, db.songIndex, db.meta], async () => {
      await db.songs.bulkPut(allSongDetails);
      await db.songIndex.bulkPut(allSongIndices.map(normalizeSongIndex));
      await db.meta.put({
        id: LAST_SYNC_TIME_KEY,
        value: Date.now()
      });
    });

    await SearchEngine.indexSongs(allSongIndices.map(normalizeSongIndex));
    await SearchEngine.indexLyrics(allSongDetails);

    console.log('✅ Batch Download from JSON completed successfully');
    onProgress?.(100, 'Successfully downloaded all songs from backup!');
    return 'completed';
  } catch (err) {
    console.error('❌ Batch Download from JSON failed:', err);
    onProgress?.(0, 'Download from backup failed.');
    return 'error';
  }
}

/**
 * Helper function to load songs from JSON fallback
 */
async function getSongsFromJsonFallback(): Promise<SongIndex[]> {
  try {
    console.log('🗂️ JSON Fallback: Fetching /exports/index.json');
    const res = await fetch('/exports/index.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const indexData = await res.json();
    const songs = indexData.songs || [];
    return songs.map((s: any) => ({
      id: s.id,
      songNumber: s.songNumber,
      title: s.title,
      artist: s.artist,
      language: s.language,
      originalKey: s.originalKey,
      hashtags: s.hashtags || [],
      searchTokens: s.searchTokens || `${s.title} ${s.language || ''}`.toLowerCase(),
      genres: s.genres || [],
    }));
  } catch (fallbackError) {
    console.error('❌ JSON Fallback failed:', fallbackError);
    return [];
  }
}

/**
 * Helper function to load song detail from JSON fallback
 */
async function getSongByIdFromJsonFallback(id: number): Promise<SongDetail | null> {
  try {
    console.log(`🗂️ JSON Fallback: Fetching /exports/songs/${id}.json`);
    const res = await fetch(`/exports/songs/${id}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const songData = await res.json();
    
    const extracted = extractLyricsAndChordsFromSections(songData.sections);
    const chords = songData.chords || extracted.chords;
    const lyrics = songData.lyrics || extracted.lyrics;

    const detail: SongDetail = {
      id: songData.id,
      songNumber: songData.songNumber,
      title: songData.title,
      artist: songData.artist,
      composer: songData.composer,
      language: songData.language,
      originalKey: songData.originalKey,
      capo: songData.capo || 0,
      bpm: songData.bpm || 0,
      timeSignature: songData.timeSignature || '4/4',
      hashtags: songData.hashtags || [],
      sections: songData.sections || parseLyricsToSections(lyrics),
      chords,
      lyrics,
      is_active: true,
      updated_at: songData.updated_at,
      genres: songData.genres || [],
    };

    try {
      await db.songs.put(detail);
      console.log(`✅ Saved song #${id} from JSON fallback into IndexedDB cache.`);
    } catch (e) {
      console.warn(`Failed to seed song #${id} to IndexedDB:`, e);
    }

    return detail;
  } catch (err) {
    console.error(`❌ JSON Fallback failed for song #${id}:`, err);
    return null;
  }
}

/**
 * Get songs - Web Mode (Supabase) or App Mode (IndexedDB) with JSON Fallback
 */
export async function getSongs(): Promise<SongIndex[]> {
  const localSongs = await db.songIndex.toArray();

  if (localSongs.length > 0) {
    console.log('📱 App Mode: Returning songs from IndexedDB');
    return localSongs.map(normalizeSongIndex);
  }

  // 🛑 Prevent Supabase call if offline
  if (!navigator.onLine) {
    console.warn('⚠️ Offline and no local data. Trying JSON fallback...');
    return getSongsFromJsonFallback();
  }

  try {
    console.log('🌐 Web Mode: Fetching songs from Supabase');
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('is_active', true)
      .order('song_number', { ascending: true });

    if (error) {
      console.warn(`⚠️ Supabase error: ${error.message}. Switching to JSON fallback.`);
      return getSongsFromJsonFallback();
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ Supabase returned 0 songs. Switching to JSON fallback.');
      return getSongsFromJsonFallback();
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
      genres: song.genre || [],
    }));
  } catch (err) {
    console.warn('⚠️ Supabase call failed. Switching to JSON fallback:', err);
    return getSongsFromJsonFallback();
  }
}

/**
 * Get song by ID - IndexedDB first, then Supabase fallback, then JSON fallback.
 */
export async function getSongById(id: number): Promise<SongDetail | null> {
  const localSong = await db.songs.get(id);

  if (localSong) {
    const hasContent = localSong.chords || localSong.lyrics;
    if (hasContent) {
      console.log('📱 App Mode: Returning song from IndexedDB');
      return localSong;
    }
    if (!navigator.onLine) {
      console.warn('⚠️ Song cached but has no content, and we are offline.');
      return getSongByIdFromJsonFallback(id);
    }
    console.log('🔄 Song in IndexedDB has no content — re-fetching fresh from Supabase...');
  } else {
    if (!navigator.onLine) {
      console.warn('⚠️ Offline and song not in local DB. Trying JSON fallback...');
      return getSongByIdFromJsonFallback(id);
    }
    console.log('🌐 Web Mode: Song not in IndexedDB, fetching from Supabase...');
  }

  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.warn(`⚠️ Supabase error for song #${id}: ${error.message}. Trying JSON fallback...`);
      return (await getSongByIdFromJsonFallback(id)) ?? localSong ?? null;
    }

    if (!data) {
      return (await getSongByIdFromJsonFallback(id)) ?? localSong ?? null;
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
      is_active: data.is_active !== false,
      updated_at: data.updated_at,
      genres: data.genre || [],
    };

    if (fresh.chords || fresh.lyrics) {
      console.log('✅ Supabase has content — updating IndexedDB cache.');
      await db.songs.put(fresh);
    } else {
      console.warn(`⚠️ Song #${id} has no chords or lyrics in Supabase either.`);
    }

    return fresh;
  } catch (err) {
    console.warn(`⚠️ Exception fetching song #${id} from Supabase. Trying JSON fallback:`, err);
    return (await getSongByIdFromJsonFallback(id)) ?? localSong ?? null;
  }
}

/**
 * Wake-Up Delta Sync - Fetches only changed songs since last sync
 * This runs on every app mount
 */
export async function wakeUpSync(_trigger: SyncTrigger = 'app-start'): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    changedSongs: 0,
    updatedSongs: 0,
    insertedSongs: 0,
    deletedSongs: 0,
    verificationPassed: false,
    duration: 0,
    errors: []
  };

  console.log('Wake-Up Sync START');

  try {
    // 1. Check connectivity
    console.log('Online:', navigator.onLine);
    if (!navigator.onLine) {
      result.errors.push('Offline - skipping sync');
      console.log('Wake-Up Sync END');
      console.log('Reason: Offline');
      return result;
    }

    // 2. Read checkpoint
    const syncMeta = await db.meta.get(LAST_SYNC_TIME_KEY);
    if (!syncMeta) {
      result.errors.push('No lastSyncTime found - initial sync required');
      console.log('Wake-Up Sync END');
      console.log('Reason: No lastSyncTime found');
      return result;
    }

    const lastSyncTime = syncMeta.value as number;
    const lastSyncDate = new Date(lastSyncTime).toISOString();

    // 3. Query Supabase for changed records
    console.log('Query starting');
    const { data: changedIds, error } = await supabase
      .from('songs')
      .select('id')
      .gt('updated_at', lastSyncDate)
      .eq('is_active', true);

    console.log('Query completed');

    if (error) {
      result.errors.push(`Supabase query failed: ${error.message}`);
      console.log('Wake-Up Sync END');
      console.log('Error:', error.message);
      return result;
    }

    if (!changedIds || changedIds.length === 0) {
      result.success = true;
      result.verificationPassed = true;
      result.duration = Date.now() - startTime;
      console.log('Changed songs: 0');
      console.log('Wake-Up Sync END');
      return result;
    }

    result.changedSongs = changedIds.length;
    console.log('Changed songs:', changedIds.length);

    // 4. Fetch full song data for changed IDs
    const ids = changedIds.map((item: any) => item.id);
    const { data: changedSongs, error: fetchError } = await supabase
      .from('songs')
      .select('*')
      .in('id', ids);

    if (fetchError) {
      result.errors.push(`Supabase fetch failed: ${fetchError.message}`);
      return result;
    }

    if (!changedSongs || changedSongs.length === 0) {
      result.errors.push('No song data returned for changed IDs');
      return result;
    }

    // 5. Transform records
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
      is_active: song.is_active !== false,
      updated_at: song.updated_at,
      genres: song.genre || [],
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
      genres: song.genre || [],
    }));

    // 6. Write to IndexedDB (atomic transaction)
    await db.transaction('rw', [db.songs, db.songIndex], async () => {
      await db.songs.bulkPut(songDetails);
      await db.songIndex.bulkPut(songIndices.map(normalizeSongIndex));
    });

    // 7. Verify writes
    let allVerified = true;
    for (const supabaseSong of changedSongs) {
      const dbSong = await db.songs.get(supabaseSong.id);
      if (!dbSong) {
        allVerified = false;
        result.errors.push(`Song ${supabaseSong.id} not found in IndexedDB after write`);
        continue;
      }

      const titleMatch = dbSong.title === supabaseSong.title;
      const updatedAtMatch = dbSong.updated_at === supabaseSong.updated_at;

      if (!titleMatch || !updatedAtMatch) {
        allVerified = false;
        result.errors.push(`Song ${supabaseSong.id} verification failed`);
      }

      // Track update vs insert
      const existingBefore = await db.songs.get(supabaseSong.id);
      if (existingBefore) {
        result.updatedSongs++;
      } else {
        result.insertedSongs++;
      }
    }

    result.verificationPassed = allVerified;

    if (!allVerified) {
      result.errors.push('Verification failed - aborting sync');
      console.log('Wake-Up Sync END');
      console.log('Reason: Verification failed');
      return result;
    }

    // 8. Update search engine if songs were changed
    if (result.success && result.changedSongs > 0) {
      try {
        const songs = await getSongs();
        await SearchEngine.indexSongs(songs);
        console.log('[DataService] SearchEngine indexed', songs.length, 'songs');
        
        // Also update lyrics index with full song details
        const songDetails = await db.songs.toArray();
        await SearchEngine.indexLyrics(songDetails);
        console.log('[DataService] SearchEngine indexed lyrics for', songDetails.length, 'songs');
      } catch (error) {
        result.errors.push(`SearchEngine indexing failed: ${error}`);
      }
    }

    // 9. Commit checkpoint (only after successful verification)
    await db.meta.put({
      id: LAST_SYNC_TIME_KEY,
      value: Date.now()
    });

    result.success = true;
    result.duration = Date.now() - startTime;
    console.log('Wake-Up Sync END');
    console.log(`Duration: ${result.duration} ms`);
    return result;

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
    result.duration = Date.now() - startTime;
    console.log('Wake-Up Sync END');
    console.log('Error:', error);
    console.log(`Duration: ${result.duration} ms`);
    return result;
  }
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
