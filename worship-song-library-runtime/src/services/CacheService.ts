import { supabase } from '../lib/supabaseClient';
import { db } from '../db/Database';
import type { SongIndex, SongDetail } from '../db/Database';

// Cache Management Constants
export const CACHE_DURATION_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours in ms
export const LIST_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in ms
export const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100 MB
export const STALE_WHILE_REVALIDATE = true;

// Song list cache entry
interface SongListCacheEntry {
  data: SongIndex[];
  timestamp: number;
}

// Song cache entry
interface SongCacheEntry {
  data: SongDetail;
  timestamp: number;
  cachedAt: string; // ISO timestamp for comparison with Supabase updated_at
}

// Estimate size of data in bytes
function estimateSize(data: unknown): number {
  return JSON.stringify(data).length * 2; // Rough estimate (2 bytes per char)
}

// Check if cache entry is still valid
function isCacheValid(timestamp: number, duration: number): boolean {
  return Date.now() - timestamp < duration;
}

// Get cached song list
async function getCachedSongList(): Promise<SongListCacheEntry | null> {
  const entry = await db.cache.get('songList');
  if (!entry) return null;
  
  return {
    data: entry.data as SongIndex[],
    timestamp: entry.timestamp
  };
}

// Get cached song
async function getCachedSong(songId: number): Promise<SongCacheEntry | null> {
  const entry = await db.cache.get(`song_${songId}`);
  if (!entry) return null;
  
  return {
    data: entry.data as SongDetail,
    timestamp: entry.timestamp,
    cachedAt: entry.cachedAt || new Date(entry.timestamp).toISOString()
  };
}

// Fetch song from Supabase
async function fetchSongFromSupabase(songId: number): Promise<SongDetail | null> {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', songId)
      .single();
    
    if (error) {
      console.error('Supabase error fetching song:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Transform Supabase data to SongDetail format
    const songDetail: SongDetail = {
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
      sections: parseLyricsToSections(data.lyrics_original || data.lyrics_roman || '')
    };
    
    return songDetail;
  } catch (e) {
    console.error('Error fetching song from Supabase:', e);
    return null;
  }
}

// Fetch song list from Supabase
async function fetchSongListFromSupabase(): Promise<SongIndex[]> {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('is_active', true)
      .order('song_number', { ascending: true });
    
    if (error) {
      console.error('Supabase error fetching song list:', error);
      return [];
    }
    
   if (!data) return [];
    
    // Transform to SongIndex format
    return data.map((song: any) => ({
      id: song.id,
      songNumber: song.song_number,
      title: song.title,
      artist: song.artist,
      language: song.language,
      originalKey: song.original_key,
      hashtags: [],
      searchTokens: `${song.title} ${song.artist || ''} ${song.language || ''}`.toLowerCase(),
      romanTitle: song.title
    }));
  } catch (e) {
    console.error('Error fetching song list from Supabase:', e);
    return [];
  }
}

// Parse lyrics string to sections (simple implementation)
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

// Main API: getSong with cache-first strategy
export async function getSong(songId: number): Promise<SongDetail | null> {
  // Check cache first
  const cached = await getCachedSong(songId);
  
  if (cached && isCacheValid(cached.timestamp, CACHE_DURATION_THRESHOLD)) {
    console.log(`[Cache] Serving song ${songId} from cache`);
    return cached.data;
  }
  
  // Fetch from API if online
  if (navigator.onLine) {
    console.log(`[Cache] Fetching song ${songId} from Supabase`);
    const freshData = await fetchSongFromSupabase(songId);
    
    if (freshData) {
      // Update cache
      await db.cache.put({
        id: `song_${songId}`,
        data: freshData,
        timestamp: Date.now(),
        size: estimateSize(freshData),
        cachedAt: new Date().toISOString()
      });
      return freshData;
    }
    
    // Fallback to stale cache if API fails
    if (cached) {
      console.log(`[Cache] API failed, serving stale cache for song ${songId}`);
      return cached.data;
    }
  } else {
    // Offline mode - serve stale cache
    if (cached) {
      console.log(`[Cache] Offline mode, serving stale cache for song ${songId}`);
      return cached.data;
    }
  }
  
  return null;
}

// Main API: getSongList with cache-first strategy
export async function getSongList(): Promise<SongIndex[]> {
  // Check cache first
  const cached = await getCachedSongList();
  
  if (cached && isCacheValid(cached.timestamp, LIST_CACHE_DURATION)) {
    console.log('[Cache] Serving song list from cache');
    return cached.data;
  }
  
  // Fetch from API if online
  if (navigator.onLine) {
    console.log('[Cache] Fetching song list from Supabase');
    const freshList = await fetchSongListFromSupabase();
    
    if (freshList.length > 0) {
      // Update cache
      await db.cache.put({
        id: 'songList',
        data: freshList,
        timestamp: Date.now(),
        size: estimateSize(freshList)
      });
      return freshList;
    }
    
    // Fallback to stale cache if API fails
    if (cached) {
      console.log('[Cache] API failed, serving stale song list from cache');
      return cached.data;
    }
  } else {
    // Offline mode - serve stale cache
    if (cached) {
      console.log('[Cache] Offline mode, serving stale song list from cache');
      return cached.data;
    }
  }
  
  return [];
}

// Background sync function
export async function backgroundSync(): Promise<void> {
  if (!navigator.onLine) {
    console.log('[Cache] Offline, skipping background sync');
    return;
  }
  
  console.log('[Cache] Starting background sync');
  
  // Get all cached songs
  const cachedSongs = await db.cache
    .where('id')
    .startsWith('song_')
    .toArray();
  
  for (const entry of cachedSongs) {
    const songId = parseInt(entry.id.replace('song_', ''));
    
    // Fetch fresh version from Supabase
    const freshData = await fetchSongFromSupabase(songId);
    
    if (freshData) {
      // Compare timestamps (if Supabase provides updated_at)
      // For now, just update if we got fresh data
      await db.cache.put({
        id: entry.id,
        data: freshData,
        timestamp: Date.now(),
        size: estimateSize(freshData),
        cachedAt: new Date().toISOString()
      });
    }
  }
  
  // Sync song list if needed
  const cachedList = await getCachedSongList();
  if (cachedList && !isCacheValid(cachedList.timestamp, LIST_CACHE_DURATION)) {
    console.log('[Cache] Syncing song list');
    await getSongList();
  }
  
  console.log('[Cache] Background sync complete');
}

// Clear all cache
export async function clearCache(): Promise<void> {
  await db.cache.clear();
  console.log('[Cache] Cache cleared');
}

// Get cache stats
export async function getCacheStats(): Promise<{ count: number; totalSize: number }> {
  const entries = await db.cache.toArray();
  const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
  return { count: entries.length, totalSize };
}
