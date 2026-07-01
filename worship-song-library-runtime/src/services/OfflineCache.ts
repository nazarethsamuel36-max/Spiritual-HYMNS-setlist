import { supabase } from '../lib/supabaseClient';
import { db } from '../db/Database';
import type { SongIndex } from '../db/Database';

const SONG_LIST_RAW_CACHE_KEY = 'songListRaw';
const SONG_LIST_CACHE_KEY = 'songList';

type SupabaseSongRecord = Record<string, unknown> & {
  id?: number;
  song_number?: number;
  title?: string;
  artist?: string;
  language?: string;
  original_key?: string;
  is_active?: boolean;
};

export type SongListLoadResult = {
  songs: SongIndex[];
  source: 'network' | 'cache' | 'empty';
  isOffline: boolean;
};

function estimateSize(data: unknown): number {
  return JSON.stringify(data).length * 2;
}

function transformSongList(data: SupabaseSongRecord[]): SongIndex[] {
  return data.map((song) => ({
    id: Number(song.id ?? 0),
    songNumber: Number(song.song_number ?? 0),
    title: typeof song.title === 'string' ? song.title : '',
    artist: typeof song.artist === 'string' ? song.artist : undefined,
    language: typeof song.language === 'string' ? song.language : undefined,
    originalKey: typeof song.original_key === 'string' ? song.original_key : undefined,
    hashtags: [],
    searchTokens: `${typeof song.title === 'string' ? song.title : ''} ${typeof song.artist === 'string' ? song.artist : ''} ${typeof song.language === 'string' ? song.language : ''}`.toLowerCase(),
    romanTitle: typeof song.title === 'string' ? song.title : undefined
  }));
}

async function getCachedSongList(): Promise<SongIndex[] | null> {
  const transformedEntry = await db.cache.get(SONG_LIST_CACHE_KEY);
  if (transformedEntry?.data && Array.isArray(transformedEntry.data)) {
    return transformedEntry.data as SongIndex[];
  }

  const rawEntry = await db.cache.get(SONG_LIST_RAW_CACHE_KEY);
  if (rawEntry?.data && Array.isArray(rawEntry.data)) {
    return transformSongList(rawEntry.data as SupabaseSongRecord[]);
  }

  return null;
}

async function saveSongListCache(data: SupabaseSongRecord[]): Promise<void> {
  const transformed = transformSongList(data);
  const timestamp = Date.now();

  await db.cache.put({
    id: SONG_LIST_RAW_CACHE_KEY,
    data,
    timestamp,
    size: estimateSize(data),
    cachedAt: new Date().toISOString()
  });

  await db.cache.put({
    id: SONG_LIST_CACHE_KEY,
    data: transformed,
    timestamp,
    size: estimateSize(transformed),
    cachedAt: new Date().toISOString()
  });
}

async function fetchSongListFromSupabase(): Promise<SupabaseSongRecord[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('is_active', true)
    .order('song_number', { ascending: true });

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  if (!data || !Array.isArray(data)) {
    throw new Error('No data returned from Supabase');
  }

  return data as SupabaseSongRecord[];
}

export async function loadSongs(): Promise<SongListLoadResult> {
  const cachedSongs = await getCachedSongList();
  const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : true;

  if (cachedSongs && cachedSongs.length > 0) {
    if (isOffline) {
      return { songs: cachedSongs, source: 'cache', isOffline: true };
    }

    try {
      const freshData = await fetchSongListFromSupabase();
      if (freshData.length > 0) {
        await saveSongListCache(freshData);
        return {
          songs: transformSongList(freshData),
          source: 'network',
          isOffline: false
        };
      }
    } catch (err) {
      console.warn('Falling back to cached songs because the network request failed.', err);
      return { songs: cachedSongs, source: 'cache', isOffline: false };
    }

    return { songs: cachedSongs, source: 'cache', isOffline: false };
  }

  if (isOffline) {
    return { songs: [], source: 'empty', isOffline: true };
  }

  try {
    const freshData = await fetchSongListFromSupabase();
    if (freshData.length > 0) {
      await saveSongListCache(freshData);
      return {
        songs: transformSongList(freshData),
        source: 'network',
        isOffline: false
      };
    }
  } catch (err) {
    console.error('Unable to load songs from Supabase.', err);
  }

  return { songs: [], source: 'empty', isOffline: false };
}
