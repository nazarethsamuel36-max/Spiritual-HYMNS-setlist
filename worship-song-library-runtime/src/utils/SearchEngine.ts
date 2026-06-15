import MiniSearch from 'minisearch';
import type { SongIndex } from '../db/Database';

export class SearchEngine {
  private static miniSearch = new MiniSearch<SongIndex>({
    fields: ['title', 'artist', 'songNumber', 'searchTokens'], // fields to index for full-text search
    storeFields: ['id', 'title', 'artist', 'songNumber', 'language'], // fields to return with search results
    searchOptions: {
      boost: { title: 2, songNumber: 5, artist: 1.2 },
      fuzzy: 0.2,
      prefix: true
    }
  });

  private static isIndexed = false;

  static async indexSongs(songs: SongIndex[]) {
    this.miniSearch.removeAll();
    // Deduplicate by ID to prevent MiniSearch duplicate key errors (handle string/number mismatches)
    const seen = new Set<string>();
    const unique = songs.filter(s => {
      const idStr = String(s.id);
      if (seen.has(idStr)) return false;
      seen.add(idStr);
      return true;
    });
    await this.miniSearch.addAllAsync(unique);
    this.isIndexed = true;
  }

  static search(songs: SongIndex[], query: string): (SongIndex & { score: number })[] {
    if (!query.trim()) return [];

    // 1. Numeric Search Bypass (Rule agx004)
    // If the query is just a number, do a deterministic exact match or prefix match on songNumber
    const numericQuery = query.trim();
    if (/^\d+$/.test(numericQuery)) {
      const results = songs
        .filter(s => s.songNumber.toString() === numericQuery || s.songNumber.toString().startsWith(numericQuery))
        .map(s => ({ ...s, score: s.songNumber.toString() === numericQuery ? 1000 : 900 }))
        .sort((a, b) => b.score - a.score || a.songNumber - b.songNumber);
      
      if (results.length > 0) return results;
    }

    // 2. Fallback to MiniSearch
    if (!this.isIndexed && songs.length > 0) {
      const seen = new Set<string>();
      const unique = songs.filter(s => {
        const idStr = String(s.id);
        if (seen.has(idStr)) return false;
        seen.add(idStr);
        return true;
      });
      this.miniSearch.addAll(unique);
      this.isIndexed = true;
    }

    const searchResults = this.miniSearch.search(query);
    
    // Map results and filter by the provided 'songs' list to respect language filters
    const validIds = new Set(songs.map(s => s.id));
    
    return searchResults
      .filter(res => validIds.has(res.id as any))
      .map(res => {
        const original = songs.find(s => s.id === (res.id as any));
        return {
          ...original,
          ...res,
          score: res.score
        };
      }) as unknown as (SongIndex & { score: number })[];
  }
}
