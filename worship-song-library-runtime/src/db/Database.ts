import Dexie, { type EntityTable } from 'dexie';
import { normalizeImportedText } from '../utils/SongFormatter';
import { generateUUID } from '../utils/uuid';

export type SongIndex = {
  id: number;
  songNumber: number;
  title: string;
  artist?: string;
  language?: string;
  originalKey?: string;
  hashtags?: string[];
  searchTokens: string;
  isPersonal?: boolean;
  is_active?: boolean;
  genres?: string[];
}

export type SongDetail = {
  id: number;
  uid?: string; // Portable identity, stable across devices (crypto.randomUUID)
  songNumber: number;
  title: string;
  artist?: string;
  composer?: string;
  language?: string;
  originalKey?: string;
  capo?: number;
  bpm?: number;
  timeSignature?: string;
  hashtags?: string[];
  sections: Section[];
  chords?: string; // Raw chords text with markers like [G]
  lyrics?: string; // Plain lyrics text without chords
  is_active?: boolean; // Whether the song is active and visible in the app
  updated_at?: string; // Timestamp for delta sync
  genres?: string[];
}

export type Section = {
  type: string;
  label: string;
  lines: Line[];
}

export type Line = {
  text: string;
  chords?: Chord[];
}

export type Chord = {
  chord: string;
  position: number;
}

export type Setlist = {
  id: string;
  uid: string; // Portable identity, stable across devices
  title: string;
  createdAt: number;
  updatedAt: number;
  songs: SetlistItem[];
}

export type SetlistItem = {
  id: string; // Unique UUID for each item in the setlist
  type?: 'song' | 'marker' | 'note'; // defaults to 'song' if undefined
  songId?: number; // Only for 'song' type
  refType?: 'official' | 'personal' | 'shared'; // ownership of referenced song (defaults to 'official')
  versionId?: string; // Set when the item references a version (uid into db.versions)
  transpose?: number; // Only for 'song' type
  label?: string; // For 'marker' or 'note' title
  content?: string; // For 'note' text content
  order: number;
}

export type SyncMetadata = {
  id: string;
  version: string;
  generatedAt: string;
  songCount: number;
  lastSyncedAt: number;
}

export type ArrangementOverride = {
  capo?: number;
  sections?: Section[];
}

export type Arrangement = {
  id: string;
  songId: number;
  name: string;
  type: 'personal' | 'shared';
  overrides: ArrangementOverride;
  createdAt: number;
  updatedAt: number;
}

export type Version = {
  uid: string; // Portable identity (primary key), stable across devices
  sourceSongId: number; // Official library song this version derives from
  name: string;
  owner: 'personal' | 'shared';
  lyrics?: string;
  chords?: string;
  sections?: Section[];
  originalKey?: string;
  capo?: number;
  bpm?: number;
  timeSignature?: string;
  artist?: string;
  composer?: string;
  hashtags?: string[];
  createdAt: number;
  updatedAt: number;
  genres?: string[];
}

export type CacheEntry = {
  id: string;
  data: unknown;
  timestamp: number;
  size: number;
  cachedAt?: string;
}

export type DeviceIdentityRecord = {
  id: 'current';
  deviceId: string;
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  createdAt: number;
}


export class WorshipDatabase extends Dexie {
  songs!: EntityTable<SongDetail, 'id'>;
  songIndex!: EntityTable<SongIndex, 'id'>;
  syncMeta!: EntityTable<SyncMetadata, 'id'>;
  setlists!: EntityTable<Setlist, 'id'>;
  arrangements!: EntityTable<Arrangement, 'id'>;
  versions!: EntityTable<Version, 'uid'>;
  cache!: EntityTable<CacheEntry, 'id'>;
  meta!: EntityTable<{ id: string; value: string | number }, 'id'>;
  deviceIdentity!: EntityTable<DeviceIdentityRecord, 'id'>;

  sharedSongs!: EntityTable<SongDetail, 'id'>;
  sharedSetlists!: EntityTable<Setlist, 'id'>;

  personalSongs!: EntityTable<SongDetail, 'id'>;

  constructor() {
    super('WorshipDatabase');
    this.version(7).stores({
      songs: 'id, songNumber, language, updated_at',
      songIndex: 'id, songNumber, title, language, searchTokens',
      syncMeta: 'id',
      setlists: 'id, title, updatedAt',
      arrangements: 'id, songId, type, updatedAt',
      cache: 'id, timestamp',
      meta: 'id',
      sharedSongs: 'id, songNumber, title, language',
      sharedSetlists: 'id, title, updatedAt',
      personalSongs: 'id, title, language'
    });

    this.version(8).stores({
      songs: 'id, songNumber, language, updated_at',
      songIndex: 'id, songNumber, title, language, searchTokens',
      syncMeta: 'id',
      setlists: 'id, uid, title, updatedAt',
      versions: 'uid, sourceSongId, owner, updatedAt',
      arrangements: 'id, songId, type, updatedAt',
      cache: 'id, timestamp',
      meta: 'id',
      sharedSongs: 'id, uid, songNumber, title, language',
      sharedSetlists: 'id, uid, title, updatedAt',
      personalSongs: 'id, uid, title, language'
    }).upgrade(async (tx) => {
      type MigratableRow = { id?: string | number; uid?: string };

      const backfillUids = async (tableName: string, reuseId: boolean) => {
        const rows = (await tx.table(tableName).toArray()) as MigratableRow[];
        let changed = false;
        for (const row of rows) {
          if (!row.uid) {
            row.uid = reuseId ? String(row.id) : generateUUID();
            changed = true;
          }
        }
        if (changed && rows.length) await tx.table(tableName).bulkPut(rows);
      };

      await backfillUids('personalSongs', false);
      await backfillUids('sharedSongs', false);
      await backfillUids('setlists', true);
      await backfillUids('sharedSetlists', true);

      const arrangements = (await tx.table('arrangements').toArray()) as Array<{
        id?: string;
        songId?: number;
        name?: string;
        type?: string;
        overrides?: { capo?: number; sections?: Section[] };
        createdAt?: number;
        updatedAt?: number;
      }>;
      if (arrangements.length) {
        await tx.table('versions').bulkPut(
          arrangements.map((a) => ({
            uid: a.id || generateUUID(),
            sourceSongId: a.songId,
            name: a.name || 'My Version',
            owner: a.type === 'shared' ? 'shared' : 'personal',
            capo: a.overrides?.capo,
            sections: a.overrides?.sections,
            createdAt: a.createdAt ?? Date.now(),
            updatedAt: a.updatedAt ?? Date.now()
          }))
        );
        await tx.table('arrangements').clear();
      }
    });

    this.version(9).stores({
      songs: 'id, songNumber, language, updated_at, genres',
      songIndex: 'id, songNumber, title, language, searchTokens, genres',
      syncMeta: 'id',
      setlists: 'id, uid, title, updatedAt',
      versions: 'uid, sourceSongId, owner, updatedAt, genres',
      arrangements: 'id, songId, type, updatedAt',
      cache: 'id, timestamp',
      meta: 'id',
      sharedSongs: 'id, uid, songNumber, title, language, genres',
      sharedSetlists: 'id, uid, title, updatedAt',
      personalSongs: 'id, uid, title, language, genres'
    }).upgrade(async (tx) => {
      // Add genre column to existing tables - backfill empty arrays
      const tablesToUpdate = ['songs', 'versions', 'personalSongs', 'sharedSongs'];
      for (const tableName of tablesToUpdate) {
        const rows = await tx.table(tableName).toArray();
        for (const row of rows) {
          if (!row.genres) {
            row.genres = [];
            await tx.table(tableName).put(row);
          }
        }
      }
    });

    this.version(10).stores({
      songs: 'id, songNumber, language, updated_at, genres',
      songIndex: 'id, songNumber, title, language, searchTokens, genres',
      syncMeta: 'id',
      setlists: 'id, uid, title, updatedAt',
      versions: 'uid, sourceSongId, owner, updatedAt, genres',
      arrangements: 'id, songId, type, updatedAt',
      cache: 'id, timestamp',
      meta: 'id',
      deviceIdentity: 'id',
      sharedSongs: 'id, uid, songNumber, title, language, genres',
      sharedSetlists: 'id, uid, title, updatedAt',
      personalSongs: 'id, uid, title, language, genres'
    });
  }

  async resetCache() {
    return this.transaction('rw', [this.songs, this.songIndex, this.syncMeta, this.arrangements], async () => {
      await this.songs.clear();
      await this.songIndex.clear();
      await this.syncMeta.clear();
      await this.arrangements.clear();
    });
  }
}

export const db = new WorshipDatabase();

export async function getSongById(id: number): Promise<SongDetail | null> {
  let song = await db.songs.get(id);
  if (song) {
    // Use title AND originalKey from songIndex as source of truth
    // (song detail JSONs may be missing originalKey while the index has it)
    const indexEntry = await db.songIndex.get(id);
    if (indexEntry) {
      song.title = indexEntry.title;
      if (!song.originalKey && indexEntry.originalKey) {
        song.originalKey = indexEntry.originalKey;
      }
      if (!song.genres && indexEntry.genres) {
        song.genres = indexEntry.genres;
      }
    }
    return normalizeSongDetail(song);
  }

  song = await db.sharedSongs.get(id);
  if (song) return normalizeSongDetail(song);

  // Fallback to Supabase if online (no JSON file reading)
  if (!navigator.onLine) {
    console.warn('⚠️ Offline: song not in IndexedDB and cannot reach Supabase.');
    return null;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const client = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await client.from('songs').select('*').eq('id', id).single();
    if (error || !data) return null;
    const normalized = normalizeSongDetail({
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
      sections: [],
      chords: data.chords,
      lyrics: data.lyrics,
      is_active: data.is_active !== false,
      updated_at: data.updated_at
    });
    // Cache in IndexedDB for next time
    await db.songs.put(normalized);
    return normalized;
  } catch (e) {
    console.error('Failed to fetch song from Supabase:', e);
  }
  return null;
}

export function ensureUid(record: { uid?: string }): string {
  return record.uid ?? (record.uid = generateUUID());
}

export function normalizeSongIndex(song: SongIndex): SongIndex {
  return {
    ...song,
    title: normalizeImportedText(song.title),
    artist: normalizeImportedText(song.artist),
    originalKey: normalizeImportedText(song.originalKey),
    searchTokens: normalizeImportedText(song.searchTokens),
  };
}

export function normalizeSongDetail(song: SongDetail): SongDetail {
  return {
    ...song,
    title: normalizeImportedText(song.title),
    artist: normalizeImportedText(song.artist),
    composer: normalizeImportedText(song.composer),
    originalKey: normalizeImportedText(song.originalKey),
    sections: song.sections?.map(section => ({
      ...section,
      label: normalizeImportedText(section.label),
      lines: section.lines?.map(line => ({
        ...line,
        text: normalizeImportedText(line.text),
        chords: line.chords?.map(chord => ({
          ...chord,
          chord: normalizeImportedText(chord.chord)
        }))
      })) || []
    })) || [],
    genres: song.genres || [],
  };
}

export async function getSongIndexById(id: number): Promise<SongIndex | null> {
  const index = await db.songIndex.get(id);
  if (index) return index;

  const shared = await db.sharedSongs.get(id);
  if (shared) {
    return {
      id: shared.id,
      songNumber: shared.songNumber,
      title: normalizeImportedText(shared.title),
      artist: normalizeImportedText(shared.artist),
      language: shared.language,
      originalKey: normalizeImportedText(shared.originalKey),
      hashtags: shared.hashtags,
      searchTokens: '',
      genres: shared.genres || [],
    };
  }

  const personal = await db.personalSongs.get(id);
  if (personal) {
    return {
      id: personal.id,
      songNumber: personal.songNumber,
      title: normalizeImportedText(personal.title),
      artist: normalizeImportedText(personal.artist),
      language: personal.language,
      originalKey: normalizeImportedText(personal.originalKey),
      hashtags: personal.hashtags,
      searchTokens: '',
      isPersonal: true,
      genres: personal.genres || [],
    };
  }

  return null;
}

/**
 * Emergency reset utility. Clears EVERYTHING including setlists.
 */
export async function fullSystemReset() {
  await db.delete();
  window.location.reload();
}

export async function needsInitialDownload(): Promise<boolean> {
  console.log('Database helper START');
  try {
    const count = await db.songIndex.count();
    console.log('Database helper END');
    console.log('Song count:', count);
    console.log('Database empty:', count === 0 ? 'true' : 'false');
    return count === 0;
  } catch (error) {
    console.log('Database helper END');
    console.error('Database helper error:', error);
    throw error;
  }
}
