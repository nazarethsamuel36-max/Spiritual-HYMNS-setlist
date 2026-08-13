import { db, getSongById, type SetlistItem, type SongDetail, type Version } from '../db/Database';

export type SongKind = 'official' | 'personal' | 'shared';

export type SongRef = {
  kind?: SongKind;
  songId?: number;
  versionUid?: string;
};

export type ResolvedSong = {
  detail: SongDetail;
  kind: SongKind;
  version?: Version;
};

/**
 * Single resolver for every song-source the Reader can display:
 * official songs, personal songs, shared songs, and personal/shared versions.
 */
export class SongResolver {
  static versionToDetail(version: Version): SongDetail {
    return {
      id: version.sourceSongId,
      songNumber: 0,
      title: version.name,
      artist: version.artist,
      composer: version.composer,
      language: undefined,
      originalKey: version.originalKey,
      capo: version.capo,
      bpm: version.bpm,
      timeSignature: version.timeSignature,
      hashtags: version.hashtags,
      sections: version.sections ?? [],
      chords: version.chords ?? '',
      lyrics: version.lyrics ?? '',
      is_active: true,
      updated_at: new Date(version.updatedAt).toISOString(),
    };
  }

  static async resolveMain(ref: SongRef): Promise<ResolvedSong | null> {
    const { songId, kind } = ref;
    if (!songId) return null;

    if (kind === 'personal') {
      const detail = await db.personalSongs.get(songId);
      return detail ? { detail, kind: 'personal' } : null;
    }
    if (kind === 'shared') {
      const detail = await db.sharedSongs.get(songId);
      return detail ? { detail, kind: 'shared' } : null;
    }
    if (kind === 'official') {
      const detail = await getSongById(songId);
      return detail ? { detail, kind: 'official' } : null;
    }

    // Probe fallback (official → shared → personal) so setlist references
    // that only carry a numeric songId still resolve personal/shared songs.
    const official = await getSongById(songId);
    if (official) return { detail: official, kind: 'official' };
    const shared = await db.sharedSongs.get(songId);
    if (shared) return { detail: shared, kind: 'shared' };
    const personal = await db.personalSongs.get(songId);
    if (personal) return { detail: personal, kind: 'personal' };
    return null;
  }

  static async resolve(ref: SongRef): Promise<ResolvedSong | null> {
    const main = await this.resolveMain(ref);
    if (ref.versionUid) {
      const version = await db.versions.get(ref.versionUid);
      if (version && version.sourceSongId === ref.songId) {
        const detail: SongDetail = main
          ? {
              ...main.detail,
              lyrics: version.lyrics ?? main.detail.lyrics,
              chords: version.chords ?? main.detail.chords,
              sections: version.sections && version.sections.length ? version.sections : main.detail.sections,
              originalKey: version.originalKey ?? main.detail.originalKey,
              capo: version.capo ?? main.detail.capo,
              bpm: version.bpm ?? main.detail.bpm,
              timeSignature: version.timeSignature ?? main.detail.timeSignature,
              artist: version.artist ?? main.detail.artist,
              composer: version.composer ?? main.detail.composer,
              hashtags: version.hashtags ?? main.detail.hashtags,
            }
          : this.versionToDetail(version);
        return {
          detail,
          kind: main?.kind ?? (version.owner === 'shared' ? 'shared' : 'personal'),
          version,
        };
      }
    }

    return main;
  }

  /** Convert a setlist item into a resolvable SongRef. */
  static refFromItem(item: SetlistItem): SongRef {
    if (item.versionId) {
      return {
        kind: item.refType === 'shared' ? 'shared' : item.refType === 'personal' ? 'personal' : undefined,
        songId: item.songId,
        versionUid: item.versionId,
      };
    }
    return { kind: item.refType, songId: item.songId };
  }
}
