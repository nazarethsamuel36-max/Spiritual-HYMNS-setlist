import { supabase } from '../lib/supabaseClient';
import { db, normalizeSongIndex } from '../db/Database';
import type { SongDetail, SongIndex } from '../db/Database';
import { SearchEngine } from '../utils/SearchEngine';

const LAST_SYNC_TIME_KEY = 'last_sync_time';

/**
 * Silent Bootstrap - Downloads all songs on first visit if on fast network
 * This runs once when the app is first opened
 */
export async function bootstrapApp(): Promise<void> {
  try {
    console.log('🚀 Bootstrap: Checking if data already exists...');
    
    // Check if we already have songs
    const existingSongs = await db.songs.count();
    if (existingSongs > 0) {
      console.log('✅ Bootstrap: Data already exists, skipping download');
      return;
    }

    console.log('📡 Bootstrap: No data found, checking network conditions...');

    // Check network conditions
    const connection = (navigator as any).connection;
    if (connection) {
      const { saveData, effectiveType } = connection;
      if (saveData || effectiveType === '2g' || effectiveType === '3g') {
        console.log('⚠️ Bootstrap: Slow network detected, skipping download to save bandwidth');
        return;
      }
    }

    // Fetch all active songs from Supabase in one query
    console.log('📥 Bootstrap: Fetching all songs from Supabase...');
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ Bootstrap: No songs returned from Supabase');
      return;
    }

    console.log(`📊 Bootstrap: Downloaded ${data.length} songs, saving to IndexedDB...`);

    // Transform and save to IndexedDB
    const songDetails: SongDetail[] = data.map((song: any) => ({
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

    const songIndices: SongIndex[] = data.map((song: any) => ({
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

    // Bulk save to IndexedDB
    await db.transaction('rw', [db.songs, db.songIndex, db.meta], async () => {
      await db.songs.bulkPut(songDetails);
      await db.songIndex.bulkPut(songIndices.map(normalizeSongIndex));
      
      // Save sync timestamp
      await db.meta.put({
        id: LAST_SYNC_TIME_KEY,
        value: Date.now()
      });
    });

    // Update search engine
    await SearchEngine.indexSongs(songIndices.map(normalizeSongIndex));

    console.log('✅ Bootstrap: Successfully downloaded and cached all songs');
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    throw error;
  }
}

/**
 * Wake-Up Delta Sync - Fetches only changed songs since last sync
 * This runs on every app mount
 */
export async function wakeUpSync(): Promise<void> {
  try {
    console.log('🔄 Wake-Up Sync: Checking for updates...');

    // Get last sync time
    const syncMeta = await db.meta.get(LAST_SYNC_TIME_KEY);
    if (!syncMeta) {
      console.log('⚠️ Wake-Up Sync: No last sync time found, skipping delta sync');
      return;
    }

    const lastSyncTime = syncMeta.value as number;
    const lastSyncDate = new Date(lastSyncTime).toISOString();

    console.log(`📅 Wake-Up Sync: Last sync was at ${lastSyncDate}`);

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

    // Update IndexedDB
    await db.transaction('rw', [db.songs, db.songIndex, db.meta], async () => {
      await db.songs.bulkPut(songDetails);
      await db.songIndex.bulkPut(songIndices.map(normalizeSongIndex));
      
      // Update sync timestamp
      await db.meta.put({
        id: LAST_SYNC_TIME_KEY,
        value: Date.now()
      });
    });

    // Update search engine
    const allSongs = await db.songIndex.toArray();
    await SearchEngine.indexSongs(allSongs.map(normalizeSongIndex));

    console.log('✅ Wake-Up Sync: Successfully synced changes');
  } catch (error) {
    console.error('❌ Wake-Up Sync failed:', error);
    // Don't throw - allow app to continue with cached data
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
