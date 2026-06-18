import { db, type SetlistItem } from '../db/Database';

export class SetlistService {
  private static async getTableAndSetlist(setlistId: string) {
    const local = await db.setlists.get(setlistId);
    if (local) return { table: db.setlists, setlist: local };
    const shared = await db.sharedSetlists.get(setlistId);
    if (shared) return { table: db.sharedSetlists, setlist: shared };
    return { table: null, setlist: null };
  }

  static async createSetlist(title: string): Promise<string> {
    const id = crypto.randomUUID();
    const now = Date.now();
    await db.setlists.add({
      id,
      title,
      createdAt: now,
      updatedAt: now,
      songs: []
    });
    return id;
  }

  static async deleteSetlist(id: string): Promise<void> {
    await db.setlists.delete(id);
    await db.sharedSetlists.delete(id);
  }

  static async renameSetlist(id: string, newTitle: string): Promise<void> {
    const { table } = await this.getTableAndSetlist(id);
    if (!table) return;
    await table.update(id, {
      title: newTitle,
      updatedAt: Date.now()
    });
  }

  static async addSongToSetlist(setlistId: string, songId: number, transpose: number = 0): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;

    const maxOrder = setlist.songs.reduce((max, s) => Math.max(max, s.order), -1);
    
    const newItems: SetlistItem[] = [
      ...setlist.songs,
      { songId, transpose, order: maxOrder + 1 }
    ];

    await table.update(setlistId, {
      songs: newItems,
      updatedAt: Date.now()
    });
  }

  static async removeSongFromSetlist(setlistId: string, songId: number, order: number): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;

    const newItems = setlist.songs
      .filter(s => !(s.songId === songId && s.order === order))
      .map((s, idx) => ({ ...s, order: idx })); // Resequence

    await table.update(setlistId, {
      songs: newItems,
      updatedAt: Date.now()
    });
  }

  static async moveSong(setlistId: string, order: number, direction: 'up' | 'down'): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;

    const songs = [...setlist.songs].sort((a, b) => a.order - b.order);
    const idx = songs.findIndex(s => s.order === order);
    
    if (direction === 'up' && idx > 0) {
      [songs[idx - 1], songs[idx]] = [songs[idx], songs[idx - 1]];
    } else if (direction === 'down' && idx < songs.length - 1) {
      [songs[idx], songs[idx + 1]] = [songs[idx + 1], songs[idx]];
    } else {
      return;
    }

    const updatedSongs = songs.map((s, i) => ({ ...s, order: i }));

    await table.update(setlistId, {
      songs: updatedSongs,
      updatedAt: Date.now()
    });
  }

  static async reorderSongs(setlistId: string, oldIndex: number, newIndex: number): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;

    const songs = [...setlist.songs].sort((a, b) => a.order - b.order);
    const [movedItem] = songs.splice(oldIndex, 1);
    songs.splice(newIndex, 0, movedItem);

    const updatedSongs = songs.map((s, i) => ({ ...s, order: i }));

    await table.update(setlistId, {
      songs: updatedSongs,
      updatedAt: Date.now()
    });
  }

  static async updateSongTranspose(setlistId: string, songId: number, order: number, transpose: number): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;

    const newItems = setlist.songs.map(s => {
      if (s.songId === songId && s.order === order) {
        return { ...s, transpose };
      }
      return s;
    });

    await table.update(setlistId, {
      songs: newItems,
      updatedAt: Date.now()
    });
  }
}
