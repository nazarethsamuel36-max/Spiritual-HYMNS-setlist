import Dexie, { type EntityTable } from 'dexie';

export type SongIndex = {
  id: number;
  songNumber: number;
  title: string;
  artist?: string;
  language?: string;
  originalKey?: string;
  hashtags?: string[];
  searchTokens: string;
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
  songId: number;
  transpose: number;
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


export class WorshipDatabase extends Dexie {
  songs!: EntityTable<SongDetail, 'id'>;
  songIndex!: EntityTable<SongIndex, 'id'>;
  syncMeta!: EntityTable<SyncMetadata, 'id'>;
  setlists!: EntityTable<Setlist, 'id'>;
  arrangements!: EntityTable<Arrangement, 'id'>;

  sharedSongs!: EntityTable<SongDetail, 'id'>;
  sharedSetlists!: EntityTable<Setlist, 'id'>;

  constructor() {
    super('WorshipDatabase');
    this.version(4).stores({
      songs: 'id, songNumber, language',
      songIndex: 'id, songNumber, title, language, searchTokens',
      syncMeta: 'id',
      setlists: 'id, title, updatedAt',
      arrangements: 'id, songId, type, updatedAt',
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
  if (song) return song;

  song = await db.sharedSongs.get(id);
  if (song) return song;

  try {
    const res = await fetch(`/exports/songs/${id}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        await db.songs.put(data);
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to fetch song from exports:', e);
  }
  return null;
}

export async function getSongIndexById(id: number): Promise<SongIndex | null> {
  const index = await db.songIndex.get(id);
  if (index) return index;

  const shared = await db.sharedSongs.get(id);
  if (shared) {
    return {
      id: shared.id,
      songNumber: shared.songNumber,
      title: shared.title,
      artist: shared.artist,
      language: shared.language,
      originalKey: shared.originalKey,
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
