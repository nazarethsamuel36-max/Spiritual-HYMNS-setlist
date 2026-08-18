import { db, getSongById, type SongDetail, type Version, type Setlist } from '../db/Database';
import { supabase } from '../lib/supabaseClient';
import { generateUUID } from '../utils/uuid';
import { UserDataPackageService, type PortableSong, type PortableVersion, type UserDataPackage } from './UserDataPackage';

export class ShareError extends Error {
  title: string;
  constructor(title: string, message: string) {
    super(message);
    this.title = title;
    this.name = 'ShareError';
  }
}

export class ShareService {
  /**
   * Generates a cryptographically random, URL-safe share ID.
   */
  static generateShareId(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (num) => chars[num % chars.length]).join('');
  }

  /**
   * Shares a personal song.
   */
  static async sharePersonalSong(song: SongDetail): Promise<string> {
    const pkg: UserDataPackage = {
      format: 'worship-user-data',
      version: 1,
      exportedAt: new Date().toISOString(),
      exporter: 'worship-song-library-runtime',
      personalSongs: [
        {
          uid: song.uid ?? generateUUID(),
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
        },
      ],
      personalVersions: [],
      sharedSongs: [],
      sharedVersions: [],
      personalSetlists: [],
      sharedSetlists: [],
    };

    const shareId = this.generateShareId();
    const { error } = await supabase.from('shared_payloads').insert({
      share_id: shareId,
      type: 'song',
      payload: pkg,
    });

    if (error) throw new Error(error.message);
    return shareId;
  }

  /**
   * Shares a custom version of an official song.
   */
  static async shareVersion(version: Version): Promise<string> {
    const pkg: UserDataPackage = {
      format: 'worship-user-data',
      version: 1,
      exportedAt: new Date().toISOString(),
      exporter: 'worship-song-library-runtime',
      personalSongs: [],
      personalVersions: [
        {
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
          createdAt: version.createdAt,
          updatedAt: version.updatedAt,
        },
      ],
      sharedSongs: [],
      sharedVersions: [],
      personalSetlists: [],
      sharedSetlists: [],
    };

    const shareId = this.generateShareId();
    const { error } = await supabase.from('shared_payloads').insert({
      share_id: shareId,
      type: 'version',
      payload: pkg,
    });

    if (error) throw new Error(error.message);
    return shareId;
  }

  /**
   * Shares a setlist.
   * Gathers all referenced custom personal songs and custom versions from the database
   * to pack them into a self-contained package.
   */
  static async shareSetlist(setlist: Setlist): Promise<string> {
    const personalSongs: PortableSong[] = [];
    const personalVersions: PortableVersion[] = [];

    // Collect dependencies referenced in setlist items
    for (const item of setlist.songs) {
      if (item.refType === 'personal' && item.songId !== undefined) {
        const song = await db.personalSongs.get(item.songId);
        if (song && !personalSongs.some((s) => s.uid === song.uid)) {
          personalSongs.push({
            uid: song.uid ?? generateUUID(),
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
          });
        }
      }

      if (item.versionId) {
        const version = await db.versions.get(item.versionId);
        if (version && !personalVersions.some((v) => v.uid === version.uid)) {
          personalVersions.push({
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
            createdAt: version.createdAt,
            updatedAt: version.updatedAt,
          });
        }
      }
    }

    const pkg: UserDataPackage = {
      format: 'worship-user-data',
      version: 1,
      exportedAt: new Date().toISOString(),
      exporter: 'worship-song-library-runtime',
      personalSongs: [],
      personalVersions: [],
      sharedSongs: personalSongs, // Convert personal dependency records to shared format on upload
      sharedVersions: personalVersions,
      personalSetlists: [
        {
          uid: setlist.uid ?? generateUUID(),
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
        },
      ],
      sharedSetlists: [],
    };

    const shareId = this.generateShareId();
    const { error } = await supabase.from('shared_payloads').insert({
      share_id: shareId,
      type: 'setlist',
      payload: pkg,
    });

    if (error) throw new Error(error.message);
    return shareId;
  }

  /**
   * Fetches a shared snapshot from Supabase by exact ID.
   */
  static async fetchShare(shareId: string): Promise<{ type: 'song' | 'version' | 'setlist'; payload: UserDataPackage } | null> {
    const { data, error } = await supabase
      .from('shared_payloads')
      .select('type, payload')
      .eq('share_id', shareId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching share link:', error);
      throw new Error('Connection failed. Please check your internet connection.');
    }
    return data;
  }

  /**
   * Validates and imports a shared snapshot package transactionally.
   * If any dependency fails validation, the entire transaction is rolled back.
   */
  static async importShare(type: 'song' | 'version' | 'setlist', pkg: UserDataPackage): Promise<{ remappedId: string | number }> {
    // 1. Structural package validation
    try {
      UserDataPackageService.validate(pkg);
    } catch (e) {
      throw new ShareError('Couldn\'t import shared content', 'This share appears to be corrupted or incomplete. Nothing was imported.');
    }

    if (pkg.version !== 1) {
      throw new ShareError('Couldn\'t import shared content', 'This share was created with an unsupported version of the app.');
    }

    // Combine all songs and versions in the package to simplify validation checks
    const incomingSongs = [...(pkg.personalSongs ?? []), ...(pkg.sharedSongs ?? [])];
    const incomingVersions = [...(pkg.personalVersions ?? []), ...(pkg.sharedVersions ?? [])];

    // 2. Perform deep verification on setlist items before committing
    if (type === 'setlist') {
      const setlist = pkg.personalSetlists?.[0] || pkg.sharedSetlists?.[0];
      if (!setlist) {
        throw new ShareError('Couldn\'t import shared content', 'This share appears to be corrupted or incomplete. Nothing was imported.');
      }

      for (const item of setlist.items) {
        if (item.type === 'song' && item.songId !== undefined) {
          if (item.refType === 'official') {
            // Resolve official songs via getSongById so they can be fetched
            // from Supabase (and cached) instead of requiring them to already
            // exist in the recipient's local offline library.
            const exists = await getSongById(item.songId);
            if (!exists) {
              throw new ShareError(
                'Couldn\'t import setlist',
                `The official library song (ID: ${item.songId}) referenced in the setlist could not be resolved locally. Nothing was imported.`
              );
            }
          } else if (item.refType === 'personal' || item.refType === 'shared') {
            // Check if the referenced song exists in IndexedDB or is included in the package
            const inLocalShared = await db.sharedSongs.where('songNumber').equals(item.songId).first();
            const inLocalPersonal = await db.personalSongs.where('songNumber').equals(item.songId).first();
            const inPackage = incomingSongs.some((s) => s.localId === item.songId);

            if (!inLocalShared && !inLocalPersonal && !inPackage) {
              const matchedSong = incomingSongs.find((s) => s.localId === item.songId);
              const songTitle = matchedSong?.title || `ID: ${item.songId}`;
              throw new ShareError(
                'Couldn\'t import setlist',
                `The song "${songTitle}" is missing from the shared package. Nothing was imported.`
              );
            }
          }
        }

        if (item.versionUid) {
          const existsLocal = await db.versions.get(item.versionUid);
          const inPackage = incomingVersions.some((v) => v.uid === item.versionUid);

          if (!existsLocal && !inPackage) {
            const matchedVersion = incomingVersions.find((v) => v.uid === item.versionUid);
            const versionName = matchedVersion?.name || `UID: ${item.versionUid}`;
            throw new ShareError(
              'Couldn\'t import setlist',
              `The version "${versionName}" could not be found. Nothing was imported.`
            );
          }
        }
      }
    } else if (type === 'version') {
      // If importing a single version, ensure its base official song exists locally
      const version = incomingVersions[0];
      if (!version) {
        throw new ShareError('Couldn\'t import shared content', 'This share appears to be corrupted or incomplete. Nothing was imported.');
      }
      const officialSongExists = await db.songs.get(version.sourceSongId);
      if (!officialSongExists) {
        throw new ShareError(
          'Couldn\'t import version',
          `The base official song (ID: ${version.sourceSongId}) referenced by the version is missing locally. Nothing was imported.`
        );
      }
    }

    // Helper function to query the next song ID
    const nextSongId = async (store: 'personal' | 'shared'): Promise<number> => {
      const table = store === 'personal' ? db.personalSongs : db.sharedSongs;
      const last = await table.orderBy('id').last();
      return (last?.id ?? 0) + 1;
    };

    // 3. Execute database writes in a transaction to guarantee all-or-nothing atomicity
    let finalRemappedId: string | number = '';

    await db.transaction('rw', [db.sharedSongs, db.versions, db.sharedSetlists], async () => {
      const sharedLocalMap = new Map<number, number>();

      // A. Import all songs to db.sharedSongs
      for (const song of incomingSongs) {
        const existing = await db.sharedSongs.where('uid').equals(song.uid).first();
        if (existing) {
          sharedLocalMap.set(song.localId, existing.id);
          if (type === 'song' && song.uid === incomingSongs[0]?.uid) {
            finalRemappedId = existing.id;
          }
          continue;
        }

        const newId = await nextSongId('shared');
        await db.sharedSongs.put({
          id: newId,
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
        });
        sharedLocalMap.set(song.localId, newId);

        if (type === 'song' && song.uid === incomingSongs[0]?.uid) {
          finalRemappedId = newId;
        }
      }

      // B. Import all custom versions to db.versions (owner stays 'shared')
      for (const version of incomingVersions) {
        const existing = await db.versions.get(version.uid);
        if (existing) {
          if (type === 'version' && version.uid === incomingVersions[0]?.uid) {
            finalRemappedId = version.uid;
          }
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

        if (type === 'version' && version.uid === incomingVersions[0]?.uid) {
          finalRemappedId = version.uid;
        }
      }

      // C. Import setlist to db.sharedSetlists (remapping dependencies correctly)
      if (type === 'setlist') {
        const setlist = pkg.personalSetlists?.[0] || pkg.sharedSetlists?.[0];
        if (setlist) {
          const existing = await db.sharedSetlists.where('uid').equals(setlist.uid).first();
          if (existing) {
            finalRemappedId = existing.id;
            return;
          }

          const remapItem = (item: any) => {
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
              if (item.refType === 'personal' || item.refType === 'shared') {
                songId = sharedLocalMap.get(item.songId) ?? item.songId;
              }
            }
            return {
              id: item.id,
              type: item.type,
              songId,
              refType: (item.refType === 'personal' || item.refType === 'shared') ? 'shared' : (item.refType ?? 'official'),
              transpose: item.transpose,
              label: item.label,
              content: item.content,
              order: item.order,
            };
          };

          const targetSetlistId = generateUUID();
          await db.sharedSetlists.put({
            id: targetSetlistId,
            uid: setlist.uid,
            title: setlist.title,
            createdAt: setlist.createdAt ?? Date.now(),
            updatedAt: setlist.updatedAt ?? Date.now(),
            songs: setlist.items.map(remapItem),
          });
          finalRemappedId = targetSetlistId;
        }
      }
    });

    return { remappedId: finalRemappedId };
  }
}
