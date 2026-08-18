import { db, type SongDetail, type Version } from '../db/Database';
import { generateUUID } from '../utils/uuid';

export type VersionSnapshot = Partial<
  Pick<Version, 'lyrics' | 'chords' | 'sections' | 'originalKey' | 'capo' | 'bpm' | 'timeSignature' | 'artist' | 'composer' | 'hashtags'>
>;

export type VersionUpdate = Partial<Omit<Version, 'uid'>>;

export class VersionService {
  /**
   * Create a version as a FULL snapshot derived from an official song.
   * Returns the version's portable uid.
   */
  static async createVersion(input: {
    sourceSongId: number;
    name: string;
    owner: 'personal' | 'shared';
    snapshot?: VersionSnapshot;
  }): Promise<string> {
    const uid = generateUUID();
    const now = Date.now();
    const version: Version = {
      uid,
      sourceSongId: input.sourceSongId,
      name: input.name,
      owner: input.owner,
      ...input.snapshot,
      createdAt: now,
      updatedAt: now,
    };
    await db.versions.add(version);
    return uid;
  }

  /** Create a version that snapshots an existing song's full content. */
  static async createFromSong(input: {
    sourceSongId: number;
    owner: 'personal' | 'shared';
    name?: string;
    song: SongDetail;
  }): Promise<string> {
    return this.createVersion({
      sourceSongId: input.sourceSongId,
      name: input.name ?? 'Untitled Version',
      owner: input.owner,
      snapshot: {
        lyrics: input.song.lyrics,
        chords: input.song.chords,
        sections: input.song.sections,
        originalKey: input.song.originalKey,
        capo: input.song.capo,
        bpm: input.song.bpm,
        timeSignature: input.song.timeSignature,
        artist: input.song.artist,
        composer: input.song.composer,
        hashtags: input.song.hashtags,
      },
    });
  }

  static async getVersion(uid: string): Promise<Version | undefined> {
    return db.versions.get(uid);
  }

  static async updateVersion(uid: string, updates: VersionUpdate): Promise<void> {
    await db.versions.update(uid, { ...updates, updatedAt: Date.now() });
  }

  static async deleteVersion(uid: string): Promise<void> {
    await db.versions.delete(uid);
  }

  /** All versions of an official song, regardless of ownership. */
  static async findVersionsBySourceSongId(sourceSongId: number): Promise<Version[]> {
    const versions = await db.versions.where('sourceSongId').equals(sourceSongId).toArray();
    return versions.sort((a, b) => a.updatedAt - b.updatedAt);
  }

  /** Personal versions, optionally filtered to one source song. */
  static async findPersonalVersions(sourceSongId?: number): Promise<Version[]> {
    const versions = await db.versions.where('owner').equals('personal').toArray();
    const filtered = sourceSongId !== undefined
      ? versions.filter((v) => v.sourceSongId === sourceSongId)
      : versions;
    return filtered.sort((a, b) => a.updatedAt - b.updatedAt);
  }

  /** Shared versions, optionally filtered to one source song. */
  static async findSharedVersions(sourceSongId?: number): Promise<Version[]> {
    const versions = await db.versions.where('owner').equals('shared').toArray();
    const filtered = sourceSongId !== undefined
      ? versions.filter((v) => v.sourceSongId === sourceSongId)
      : versions;
    return filtered.sort((a, b) => a.updatedAt - b.updatedAt);
  }

  /**
   * Clone a shared version into a personal one. The clone receives a NEW uid so
   * it never collides with the source (shared stays shared). Returns the new
   * personal uid, or null when the version is not shared / not found.
   */
  static async makeMyVersion(uid: string): Promise<string | null> {
    const shared = await db.versions.get(uid);
    if (!shared || shared.owner !== 'shared') return null;
    const clone: Version = {
      ...shared,
      uid: generateUUID(),
      owner: 'personal',
      updatedAt: Date.now(),
    };
    await db.versions.add(clone);
    return clone.uid;
  }
}
