import { db, normalizeSongIndex } from '../db/Database';
import type { SongDetail, SongIndex } from '../db/Database';
import { SearchEngine } from '../utils/SearchEngine';
import { SyncService } from './SyncService';

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
  return batchDownloadFromJson(onProgress);
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
            if (!res.ok) {
              console.warn(`⚠️ Song JSON missing: /exports/songs/${indexSong.id}.json (HTTP ${res.status})`);
              return null;
            }
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
    try {
      await db.transaction('rw', [db.songs, db.songIndex, db.meta], async () => {
        await db.songs.bulkPut(allSongDetails);
        await db.songIndex.bulkPut(allSongIndices.map(normalizeSongIndex));
        await db.meta.put({
          id: LAST_SYNC_TIME_KEY,
          value: Date.now()
        });
      });
    } catch (writeError) {
      const isQuota = writeError instanceof Error &&
        (writeError.name === 'QuotaExceededError' || writeError.message.toLowerCase().includes('quota'));
      if (isQuota) {
        console.error('💾 JSON Fallback: Device storage full — cannot save songs.', writeError);
        onProgress?.(0, '⚠️ Your device storage is full. Free up space and try again.');
        return 'error';
      }
      throw writeError; // re-throw so outer catch handles it
    }

    await SearchEngine.indexSongs(allSongIndices.map(normalizeSongIndex));
    await SearchEngine.indexLyrics(allSongDetails);

    console.log('✅ Batch Download from JSON completed successfully');
    onProgress?.(100, 'Successfully downloaded all songs from backup!');
    return 'completed';
  } catch (err) {
    const isQuota = err instanceof Error &&
      (err.name === 'QuotaExceededError' || err.message.toLowerCase().includes('quota'));
    console.error('❌ Batch Download from JSON failed:', err);
    onProgress?.(0, isQuota
      ? '⚠️ Your device storage is full. Free up space and try again.'
      : 'Download failed. Please check your internet connection and try again.'
    );
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
      const isQuota = e instanceof Error &&
        (e.name === 'QuotaExceededError' || e.message.toLowerCase().includes('quota'));
      if (isQuota) {
        console.warn(`⚠️ Device storage full — could not cache song #${id} to IndexedDB. Song will still display from memory.`);
      } else {
        console.warn(`Failed to seed song #${id} to IndexedDB:`, e);
      }
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

  console.log('🗂️ Static Mode: Loading songs from JSON fallback');
  return getSongsFromJsonFallback();
}

/**
 * Get song by ID - IndexedDB first, then JSON fallback.
 */
export async function getSongById(id: number): Promise<SongDetail | null> {
  const localSong = await db.songs.get(id);

  if (localSong) {
    const hasContent = localSong.chords || localSong.lyrics;
    if (hasContent) {
      console.log('📱 App Mode: Returning song from IndexedDB');
      return localSong;
    }
  }

  console.log(`🗂️ Static Mode: Fetching song #${id} from JSON fallback`);
  return (await getSongByIdFromJsonFallback(id)) ?? localSong ?? null;
}

/**
 * Wake-Up Delta Sync - Fetches only changed songs since last sync
 * This runs on every app mount
 */
export async function wakeUpSync(_trigger: SyncTrigger = 'app-start'): Promise<SyncResult> {
  const startTime = Date.now();
  console.log('Static Sync START (Manifest-based)');

  try {
    await SyncService.sync();
    return {
      success: true,
      changedSongs: 0,
      updatedSongs: 0,
      insertedSongs: 0,
      deletedSongs: 0,
      verificationPassed: true,
      duration: Date.now() - startTime,
      errors: []
    };
  } catch (error) {
    console.error('Static Sync error:', error);
    return {
      success: false,
      changedSongs: 0,
      updatedSongs: 0,
      insertedSongs: 0,
      deletedSongs: 0,
      verificationPassed: false,
      duration: Date.now() - startTime,
      errors: [String(error)]
    };
  }
}
function parseLyricsToSections(lyrics: string): Array<{ type: string; label: string; lines: Array<{ text: string }> }> {
  if (!lyrics) return [];
  const sections: Array<{ type: string; label: string; lines: Array<{ text: string }> }> = [];
  const lines = lyrics.split('\n');
  let currentSection: { type: string; label: string; lines: Array<{ text: string }> } | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
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
