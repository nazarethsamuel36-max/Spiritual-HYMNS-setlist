import Dexie, { type EntityTable } from 'dexie';
import { normalizeImportedText } from '../utils/SongFormatter';

export type SongIndex = {
  id: number;
  songNumber: number;
  title: string;
  artist?: string;
  language?: string;
  originalKey?: string;
  hashtags?: string[];
  searchTokens: string;
  romanTitle?: string;
  isPublished?: boolean;
}

export type SongDetail = {
  id: number;
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
  isPublished?: boolean; // Publication status for admin control
  is_active?: boolean; // Whether the song is active and visible in the app
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
  title: string;
  createdAt: number;
  updatedAt: number;
  songs: SetlistItem[];
}

export type SetlistItem = {
  id: string; // Unique UUID for each item in the setlist
  type?: 'song' | 'marker' | 'note'; // defaults to 'song' if undefined
  songId?: number; // Only for 'song' type
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

export type CacheEntry = {
  id: string;
  data: unknown;
  timestamp: number;
  size: number;
  cachedAt?: string;
}


export class WorshipDatabase extends Dexie {
  songs!: EntityTable<SongDetail, 'id'>;
  songIndex!: EntityTable<SongIndex, 'id'>;
  syncMeta!: EntityTable<SyncMetadata, 'id'>;
  setlists!: EntityTable<Setlist, 'id'>;
  arrangements!: EntityTable<Arrangement, 'id'>;
  cache!: EntityTable<CacheEntry, 'id'>;
  meta!: EntityTable<{ id: string; value: string | number }, 'id'>;

  sharedSongs!: EntityTable<SongDetail, 'id'>;
  sharedSetlists!: EntityTable<Setlist, 'id'>;

  constructor() {
    super('WorshipDatabase');
    this.version(6).stores({
      songs: 'id, songNumber, language, updated_at',
      songIndex: 'id, songNumber, title, language, searchTokens',
      syncMeta: 'id',
      setlists: 'id, title, updatedAt',
      arrangements: 'id, songId, type, updatedAt',
      cache: 'id, timestamp',
      meta: 'id',
      sharedSongs: 'id, songNumber, title, language',
      sharedSetlists: 'id, title, updatedAt'
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
    }
    return normalizeSongDetail(song);
  }

  song = await db.sharedSongs.get(id);
  if (song) return normalizeSongDetail(song);

  try {
    const res = await fetch(`/exports/songs/${id}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        const normalized = normalizeSongDetail(data);
        // Also merge originalKey from songIndex if the detail JSON lacks it
        if (!normalized.originalKey) {
          const indexEntry = await db.songIndex.get(id);
          if (indexEntry?.originalKey) {
            normalized.originalKey = indexEntry.originalKey;
          }
        }
        await db.songs.put(normalized);
        return normalized;
      }
    }
  } catch (e) {
    console.error('Failed to fetch song from exports:', e);
  }
  return null;
}

export function normalizeSongIndex(song: SongIndex): SongIndex {
  return {
    ...song,
    title: normalizeImportedText(song.title),
    artist: normalizeImportedText(song.artist),
    originalKey: normalizeImportedText(song.originalKey),
    searchTokens: normalizeImportedText(song.searchTokens),
    romanTitle: normalizeImportedText(song.romanTitle)
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
    })) || []
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
      searchTokens: ''
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
