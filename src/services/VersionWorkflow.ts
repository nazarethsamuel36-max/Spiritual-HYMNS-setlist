import { SongResolver } from './SongResolver';
import { VersionService } from './VersionService';
import type { ReaderView } from '../store/workflowStore';

/**
 * Create a new personal version of the currently-open song, snapshotting its
 * full resolved content. Returns the new version's uid, or null if no song open.
 */
export async function createNewVersion(reader: ReaderView): Promise<string | null> {
  if (reader.type !== 'song') return null;
  const kind =
    reader.source === 'personal'
      ? 'personal'
      : reader.source === 'shared'
        ? 'shared'
        : reader.source === 'setlist'
          ? reader.refKind ?? 'official'
          : 'official';
  const resolved = await SongResolver.resolve({ kind, songId: reader.songId, versionUid: undefined });
  if (!resolved) return null;
  return VersionService.createFromSong({
    sourceSongId: reader.songId,
    owner: 'personal',
    song: resolved.detail,
  });
}
