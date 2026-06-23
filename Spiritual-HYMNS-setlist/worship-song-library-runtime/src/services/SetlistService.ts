import { db, type SetlistItem } from '../db/Database';

export class SetlistService {
  private static normalizeItems(songs: SetlistItem[]): SetlistItem[] {
    return (songs || []).map((s, idx) => {
      const id = s.id || `${s.songId || 'item'}-${idx}-${Date.now()}`;
      return {
        ...s,
        id,
        type: s.type || 'song',
        order: s.order !== undefined ? s.order : idx
      };
    });
  }

  private static async getTableAndSetlist(setlistId: string) {
    const local = await db.setlists.get(setlistId);
    if (local) {
      local.songs = this.normalizeItems(local.songs);
      return { table: db.setlists, setlist: local };
    }
    const shared = await db.sharedSetlists.get(setlistId);
    if (shared) {
      shared.songs = this.normalizeItems(shared.songs);
      return { table: db.sharedSetlists, setlist: shared };
    }
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
      { id: crypto.randomUUID(), type: 'song', songId, transpose, order: maxOrder + 1 }
    ];

    await table.update(setlistId, {
      songs: newItems,
      updatedAt: Date.now()
    });
  }

  static async addMarkerToSetlist(setlistId: string, label: string): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;

    const maxOrder = setlist.songs.reduce((max, s) => Math.max(max, s.order), -1);

    const newItems: SetlistItem[] = [
      ...setlist.songs,
      { id: crypto.randomUUID(), type: 'marker', label, order: maxOrder + 1 }
    ];

    await table.update(setlistId, {
      songs: newItems,
      updatedAt: Date.now()
    });
  }

  static async addNoteToSetlist(setlistId: string, label: string, content: string = ''): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;

    const maxOrder = setlist.songs.reduce((max, s) => Math.max(max, s.order), -1);

    const newItems: SetlistItem[] = [
      ...setlist.songs,
      { id: crypto.randomUUID(), type: 'note', label, content, order: maxOrder + 1 }
    ];

    await table.update(setlistId, {
      songs: newItems,
      updatedAt: Date.now()
    });
  }

  static async removeItemFromSetlist(setlistId: string, itemId: string): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;

    const newItems = setlist.songs
      .filter(s => s.id !== itemId)
      .map((s, idx) => ({ ...s, order: idx })); // Resequence

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
      .map((s, idx) => ({ ...s, order: idx }));

    await table.update(setlistId, {
      songs: newItems,
      updatedAt: Date.now()
    });
  }

  static async moveItem(setlistId: string, itemId: string, direction: 'up' | 'down'): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;

    const items = [...setlist.songs].sort((a, b) => a.order - b.order);
    const idx = items.findIndex(s => s.id === itemId);
    
    if (direction === 'up' && idx > 0) {
      [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]];
    } else if (direction === 'down' && idx < items.length - 1) {
      [items[idx], items[idx + 1]] = [items[idx + 1], items[idx]];
    } else {
      return;
    }

    const updated = items.map((s, i) => ({ ...s, order: i }));

    await table.update(setlistId, {
      songs: updated,
      updatedAt: Date.now()
    });
  }

  static async moveSong(setlistId: string, order: number, direction: 'up' | 'down'): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;
    const item = setlist.songs.find(s => s.order === order);
    if (item) {
      await this.moveItem(setlistId, item.id, direction);
    }
  }

  static async reorderItems(setlistId: string, oldIndex: number, newIndex: number): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;

    const items = [...setlist.songs].sort((a, b) => a.order - b.order);
    const [movedItem] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, movedItem);

    const updated = items.map((s, i) => ({ ...s, order: i }));

    await table.update(setlistId, {
      songs: updated,
      updatedAt: Date.now()
    });
  }

  static async reorderSongs(setlistId: string, oldIndex: number, newIndex: number): Promise<void> {
    await this.reorderItems(setlistId, oldIndex, newIndex);
  }

  static async updateItem(setlistId: string, itemId: string, updates: Partial<SetlistItem>): Promise<void> {
    const { table, setlist } = await this.getTableAndSetlist(setlistId);
    if (!table || !setlist) return;

    const newItems = setlist.songs.map(s => {
      if (s.id === itemId) {
        return { ...s, ...updates };
      }
      return s;
    });

    await table.update(setlistId, {
      songs: newItems,
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
