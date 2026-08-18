import { db, type Section } from '../db/Database';
import { generateUUID } from '../utils/uuid';

/**
 * v1 portable package shapes. `localId` preserves the source app's numeric
 * id so the importer can remap personal/shared song references across devices.
 * `versionUid` on setlist items references the portable uid of a version.
 */
export interface PortableSong {
  uid: string;
  localId: number;
  title: string;
  artist?: string;
  composer?: string;
  language?: string;
  originalKey?: string;
  capo?: number;
  bpm?: number;
  timeSignature?: string;
  hashtags?: string[];
  lyrics?: string;
  chords?: string;
  is_active?: boolean;
}

export interface PortableVersion {
  uid: string;
  sourceSongId: number;
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
}

export type PortableSetlistItemType = 'song' | 'marker' | 'note';

export interface PortableSetlistItem {
  id: string;
  type: PortableSetlistItemType;
  songId?: number;
  refType?: 'official' | 'personal' | 'shared';
  versionUid?: string;
  transpose?: number;
  label?: string;
  content?: string;
  order: number;
}

export interface PortableSetlist {
  uid: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  items: PortableSetlistItem[];
}

export interface UserDataPackage {
  format: 'worship-user-data';
  version: 1;
  exportedAt: string;
  exporter: string;
  personalSongs: PortableSong[];
  personalVersions: PortableVersion[];
  sharedSongs: PortableSong[];
  sharedVersions: PortableVersion[];
  personalSetlists: PortableSetlist[];
  sharedSetlists: PortableSetlist[];
}

function toPortableSong(song: {
  uid?: string;
  id: number;
  title: string;
  artist?: string;
  composer?: string;
  language?: string;
  originalKey?: string;
  capo?: number;
  bpm?: number;
  timeSignature?: string;
  hashtags?: string[];
  lyrics?: string;
  chords?: string;
  is_active?: boolean;
}): PortableSong {
  return {
    uid: song.uid ?? String(song.id),
    localId: song.id,
    title: song.title,
    artist: song.artist,
    composer: song.composer,
    language: song.language,
    originalKey: song.originalKey,
    capo: song.capo,
    bpm: song.bpm,
    timeSignature: song.timeSignature,
    hashtags: song.hashtags,
    lyrics: song.lyrics,
    chords: song.chords,
    is_active: song.is_active,
  };
}

function toPortableVersion(version: {
  uid: string;
  sourceSongId: number;
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
}): PortableVersion {
  return {
    uid: version.uid,
    sourceSongId: version.sourceSongId,
    name: version.name,
    owner: version.owner,
    lyrics: version.lyrics,
    chords: version.chords,
    sections: version.sections,
    originalKey: version.originalKey,
    capo: version.capo,
    bpm: version.bpm,
    timeSignature: version.timeSignature,
    artist: version.artist,
    composer: version.composer,
    hashtags: version.hashtags,
    createdAt: version.createdAt,
    updatedAt: version.updatedAt,
  };
}

function toPortableSetlist(setlist: {
  uid: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  songs: Array<{
    id: string;
    type?: 'song' | 'marker' | 'note';
    songId?: number;
    refType?: 'official' | 'personal' | 'shared';
    versionId?: string;
    transpose?: number;
    label?: string;
    content?: string;
    order: number;
  }>;
}): PortableSetlist {
  return {
    uid: setlist.uid,
    title: setlist.title,
    createdAt: setlist.createdAt,
    updatedAt: setlist.updatedAt,
    items: setlist.songs.map((item) => ({
      id: item.id,
      type: item.type ?? 'song',
      songId: item.songId,
      refType: item.refType,
      versionUid: item.versionId,
      transpose: item.transpose,
      label: item.label,
      content: item.content,
      order: item.order,
    })),
  };
}

/**
 * Build a UserDataPackage v1 from the local database. Export includes shared
 * content, but shared stays shared (never promoted to personal on import).
 */
export class UserDataPackageService {
  static async build(): Promise<UserDataPackage> {
    const [personalSongs, sharedSongs, versions, personalSetlists, sharedSetlists] = await Promise.all([
      db.personalSongs.toArray(),
      db.sharedSongs.toArray(),
      db.versions.toArray(),
      db.setlists.toArray(),
      db.sharedSetlists.toArray(),
    ]);

    return {
      format: 'worship-user-data',
      version: 1,
      exportedAt: new Date().toISOString(),
      exporter: 'worship-song-library-runtime',
      personalSongs: personalSongs.map(toPortableSong),
      personalVersions: versions.filter((v) => v.owner === 'personal').map(toPortableVersion),
      sharedSongs: sharedSongs.map(toPortableSong),
      sharedVersions: versions.filter((v) => v.owner === 'shared').map(toPortableVersion),
      personalSetlists: personalSetlists.map(toPortableSetlist),
      sharedSetlists: sharedSetlists.map(toPortableSetlist),
    };
  }

  static validate(pkg: unknown): asserts pkg is UserDataPackage {
    if (!pkg || typeof pkg !== 'object') throw new Error('Invalid backup: not an object');
    const p = pkg as Record<string, unknown>;
    if (p.format !== 'worship-user-data') throw new Error('Invalid backup: unknown format tag');
    if (p.version !== 1) throw new Error(`Unsupported backup version: ${String(p.version)}`);
  }

  /**
   * Import a UserDataPackage v1.
   *
   * Two-pass: (1) songs + versions, (2) setlists with remapped references.
   * Skip-duplicates: records whose portable uid already exists locally are left
   * untouched (never overwritten). Shared stays shared. Official-version and
   * official-song references are preserved as-is, so a missing official song
   * never blocks import of its versions or of a setlist that references it.
   */
  static async import(pkg: unknown): Promise<{
    personalSongs: { imported: number; skipped: number };
    sharedSongs: { imported: number; skipped: number };
    personalVersions: { imported: number; skipped: number };
    sharedVersions: { imported: number; skipped: number };
    personalSetlists: { imported: number; skipped: number };
    sharedSetlists: { imported: number; skipped: number };
  }> {
    this.validate(pkg);

    // ── PASS 1a: personal songs ──
    const personalLocalMap = new Map<number, number>();
    let personalImported = 0;
    let personalSkipped = 0;
    for (const song of pkg.personalSongs) {
      if (!song.uid) continue;
      const existing = await db.personalSongs.where('uid').equals(song.uid).first();
      if (existing) {
        personalLocalMap.set(song.localId, existing.id);
        personalSkipped += 1;
        continue;
      }
      const newId = await nextSongId('personal');
      await db.personalSongs.put({ ...toSongDetailFromPortable(song, newId) });
      personalLocalMap.set(song.localId, newId);
      personalImported += 1;
    }

    // ── PASS 1b: shared songs ──
    const sharedLocalMap = new Map<number, number>();
    let sharedImported = 0;
    let sharedSkipped = 0;
    for (const song of pkg.sharedSongs) {
      if (!song.uid) continue;
      const existing = await db.sharedSongs.where('uid').equals(song.uid).first();
      if (existing) {
        sharedLocalMap.set(song.localId, existing.id);
        sharedSkipped += 1;
        continue;
      }
      const newId = await nextSongId('shared');
      await db.sharedSongs.put({ ...toSongDetailFromPortable(song, newId) });
      sharedLocalMap.set(song.localId, newId);
      sharedImported += 1;
    }

    // ── PASS 1c: versions (uvuids are portable PKs — sourceSongId never rewritten) ──
    let personalVersionsImported = 0;
    let personalVersionsSkipped = 0;
    for (const version of pkg.personalVersions) {
      const existing = await db.versions.get(version.uid);
      if (existing) {
        personalVersionsSkipped += 1;
        continue;
      }
      const now = Date.now();
      await db.versions.put({
        uid: version.uid,
        sourceSongId: version.sourceSongId,
        name: version.name,
        owner: 'personal',
        lyrics: version.lyrics,
        chords: version.chords,
        sections: version.sections,
        originalKey: version.originalKey,
        capo: version.capo,
        bpm: version.bpm,
        timeSignature: version.timeSignature,
        artist: version.artist,
        composer: version.composer,
        hashtags: version.hashtags,
        createdAt: version.createdAt ?? now,
        updatedAt: version.updatedAt ?? now,
      });
      personalVersionsImported += 1;
    }

    let sharedVersionsImported = 0;
    let sharedVersionsSkipped = 0;
    for (const version of pkg.sharedVersions) {
      const existing = await db.versions.get(version.uid);
      if (existing) {
        sharedVersionsSkipped += 1;
        continue;
      }
      const now = Date.now();
      await db.versions.put({
        uid: version.uid,
        sourceSongId: version.sourceSongId,
        name: version.name,
        owner: 'shared',
        lyrics: version.lyrics,
        chords: version.chords,
        sections: version.sections,
        originalKey: version.originalKey,
        capo: version.capo,
        bpm: version.bpm,
        timeSignature: version.timeSignature,
        artist: version.artist,
        composer: version.composer,
        hashtags: version.hashtags,
        createdAt: version.createdAt ?? now,
        updatedAt: version.updatedAt ?? now,
      });
      sharedVersionsImported += 1;
    }

    // ── PASS 2: setlists (references remapped via uid→local-id maps) ──
    const remapItem = (item: PortableSetlistItem) => {
      if (item.versionUid) {
        return {
          id: item.id,
          type: item.type,
          songId: item.songId,
          refType: item.refType,
          versionId: item.versionUid,
          transpose: item.transpose,
          label: item.label,
          content: item.content,
          order: item.order,
        };
      }
      let songId = item.songId;
      if (item.songId !== undefined) {
        if (item.refType === 'personal') songId = personalLocalMap.get(item.songId) ?? item.songId;
        else if (item.refType === 'shared') songId = sharedLocalMap.get(item.songId) ?? item.songId;
      }
      return {
        id: item.id,
        type: item.type,
        songId,
        refType: item.refType ?? 'official',
        transpose: item.transpose,
        label: item.label,
        content: item.content,
        order: item.order,
      };
    };

    let personalSetlistsImported = 0;
    let personalSetlistsSkipped = 0;
    for (const setlist of pkg.personalSetlists) {
      if (!setlist.uid) continue;
      const existing = await db.setlists.where('uid').equals(setlist.uid).first();
      if (existing) {
        personalSetlistsSkipped += 1;
        continue;
      }
      await db.setlists.put({
        id: generateUUID(),
        uid: setlist.uid,
        title: setlist.title,
        createdAt: setlist.createdAt ?? Date.now(),
        updatedAt: setlist.updatedAt ?? Date.now(),
        songs: setlist.items.map(remapItem),
      });
      personalSetlistsImported += 1;
    }

    let sharedSetlistsImported = 0;
    let sharedSetlistsSkipped = 0;
    for (const setlist of pkg.sharedSetlists) {
      if (!setlist.uid) continue;
      const existing = await db.sharedSetlists.where('uid').equals(setlist.uid).first();
      if (existing) {
        sharedSetlistsSkipped += 1;
        continue;
      }
      await db.sharedSetlists.put({
        id: generateUUID(),
        uid: setlist.uid,
        title: setlist.title,
        createdAt: setlist.createdAt ?? Date.now(),
        updatedAt: setlist.updatedAt ?? Date.now(),
        songs: setlist.items.map(remapItem),
      });
      sharedSetlistsImported += 1;
    }

    return {
      personalSongs: { imported: personalImported, skipped: personalSkipped },
      sharedSongs: { imported: sharedImported, skipped: sharedSkipped },
      personalVersions: { imported: personalVersionsImported, skipped: personalVersionsSkipped },
      sharedVersions: { imported: sharedVersionsImported, skipped: sharedVersionsSkipped },
      personalSetlists: { imported: personalSetlistsImported, skipped: personalSetlistsSkipped },
      sharedSetlists: { imported: sharedSetlistsImported, skipped: sharedSetlistsSkipped },
    };
  }
}

function toSongDetailFromPortable(song: PortableSong, id: number): import('../db/Database').SongDetail {
  return {
    id,
    uid: song.uid,
    songNumber: song.localId,
    title: song.title,
    artist: song.artist,
    composer: song.composer,
    language: song.language,
    originalKey: song.originalKey,
    capo: song.capo,
    bpm: song.bpm,
    timeSignature: song.timeSignature,
    hashtags: song.hashtags,
    lyrics: song.lyrics,
    chords: song.chords,
    sections: [],
    is_active: song.is_active ?? true,
  };
}

async function nextSongId(store: 'personal' | 'shared'): Promise<number> {
  const table = store === 'personal' ? db.personalSongs : db.sharedSongs;
  const last = await table.orderBy('id').last();
  return (last?.id ?? 0) + 1;
}
