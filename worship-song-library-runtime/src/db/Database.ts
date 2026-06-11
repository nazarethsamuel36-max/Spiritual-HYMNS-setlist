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

  constructor() {
    super('WorshipDatabase');
    this.version(3).stores({
      songs: 'id, songNumber, language',
      songIndex: 'id, songNumber, title, language, searchTokens',
      syncMeta: 'id',
      setlists: 'id, title, updatedAt',
      arrangements: 'id, songId, type, updatedAt'
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

/**
 * Emergency reset utility. Clears EVERYTHING including setlists.
 */
export async function fullSystemReset() {
  await db.delete();
  window.location.reload();
}
