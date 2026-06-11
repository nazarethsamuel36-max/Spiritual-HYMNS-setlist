import { db, type Setlist, type SetlistItem } from '../db/Database';

export class SetlistService {
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
  }

  static async renameSetlist(id: string, newTitle: string): Promise<void> {
    await db.setlists.update(id, {
      title: newTitle,
      updatedAt: Date.now()
    });
  }

  static async addSongToSetlist(setlistId: string, songId: number, transpose: number = 0): Promise<void> {
    const setlist = await db.setlists.get(setlistId);
    if (!setlist) return;

    // Avoid duplicates if needed, but here we allow same song multiple times if desired
    // For now, let's just append at the end
    const maxOrder = setlist.songs.reduce((max, s) => Math.max(max, s.order), -1);
    
    const newItems: SetlistItem[] = [
      ...setlist.songs,
      { songId, transpose, order: maxOrder + 1 }
    ];

    await db.setlists.update(setlistId, {
      songs: newItems,
      updatedAt: Date.now()
    });
  }

  static async removeSongFromSetlist(setlistId: string, songId: number, order: number): Promise<void> {
    const setlist = await db.setlists.get(setlistId);
    if (!setlist) return;

    const newItems = setlist.songs
      .filter(s => !(s.songId === songId && s.order === order))
      .map((s, idx) => ({ ...s, order: idx })); // Resequence

    await db.setlists.update(setlistId, {
      songs: newItems,
      updatedAt: Date.now()
    });
  }

  static async moveSong(setlistId: string, order: number, direction: 'up' | 'down'): Promise<void> {
    const setlist = await db.setlists.get(setlistId);
    if (!setlist) return;

    const songs = [...setlist.songs].sort((a, b) => a.order - b.order);
    const idx = songs.findIndex(s => s.order === order);
    
    if (direction === 'up' && idx > 0) {
      [songs[idx - 1], songs[idx]] = [songs[idx], songs[idx - 1]];
    } else if (direction === 'down' && idx < songs.length - 1) {
      [songs[idx], songs[idx + 1]] = [songs[idx + 1], songs[idx]];
    } else {
      return;
    }

    // Update orders based on new array position
    const updatedSongs = songs.map((s, i) => ({ ...s, order: i }));

    await db.setlists.update(setlistId, {
      songs: updatedSongs,
      updatedAt: Date.now()
    });
  }

  static async reorderSongs(setlistId: string, oldIndex: number, newIndex: number): Promise<void> {
    const setlist = await db.setlists.get(setlistId);
    if (!setlist) return;

    const songs = [...setlist.songs].sort((a, b) => a.order - b.order);
    const [movedItem] = songs.splice(oldIndex, 1);
    songs.splice(newIndex, 0, movedItem);

    const updatedSongs = songs.map((s, i) => ({ ...s, order: i }));

    await db.setlists.update(setlistId, {
      songs: updatedSongs,
      updatedAt: Date.now()
    });
  }

  static async updateSongTranspose(setlistId: string, songId: number, order: number, transpose: number): Promise<void> {
    const setlist = await db.setlists.get(setlistId);
    if (!setlist) return;

    const newItems = setlist.songs.map(s => {
      if (s.songId === songId && s.order === order) {
        return { ...s, transpose };
      }
      return s;
    });

    await db.setlists.update(setlistId, {
      songs: newItems,
      updatedAt: Date.now()
    });
  }
}
