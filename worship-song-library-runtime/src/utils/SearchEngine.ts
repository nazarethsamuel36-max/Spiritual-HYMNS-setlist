import MiniSearch from 'minisearch';
import type { SongIndex } from '../db/Database';

// Worship-word synonym groups (bidirectional).
// Each group contains the canonical form first, followed by common variants.
// Applied to the user's query before passing to MiniSearch.
const WORSHIP_SYNONYM_GROUPS: string[][] = [
  ['yeshu', 'yesu', 'yeshoo', 'yeesu'],
  ['yahova', 'yehova', 'jehova', 'yahveh'],
  ['prabhu', 'prabu', 'prabhoo', 'prbhu'],
  ['masih', 'maseeh', 'mashih', 'masiha'],
  ['khrista', 'krista', 'christa', 'kristh', 'christ'],
  ['krus', 'kruus', 'cruz', 'krusas', 'kroos'],
  ['dhanyavad', 'dhanyawad', 'dhanyabad'],
  ['jai', 'jay'],
  ['aakash', 'akash', 'asman', 'aasman'],
  ['aadi', 'adi'],
  ['jeevan', 'jivan', 'jiwan'],
  ['vande', 'bande'],
  ['hallelujah', 'halleluya', 'halleluja', 'alleluia'],
  ['stuti', 'stooti', 'stotri'],
  ['aradhana', 'aaradhana', 'aradhan', 'aaradhan'],
  ['mahima', 'mahimaa'],
  ['atma', 'aatma', 'atmaa'],
  ['swarg', 'swarga', 'svarg'],
  ['pavitra', 'pawitra'],
];

/**
 * Normalize a user search query:
 * 1. Lowercase
 * 2. Map any worship variant to canonical form
 * Returns the normalized query string.
 */
function normalizeSearchQuery(query: string): string {
  const lower = query.toLowerCase().trim();
  // Split into tokens, normalize each, rejoin
  const tokens = lower.split(/\s+/);
  const normalized = tokens.map(token => {
    for (const group of WORSHIP_SYNONYM_GROUPS) {
      if (group.includes(token)) {
        return group[0]; // canonical is always first in the group
      }
    }
    return token;
  });
  return normalized.join(' ');
}

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
    this.miniSearch.addAll(unique);
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

    // 2. Apply worship-word normalization before MiniSearch
    const normalizedQuery = normalizeSearchQuery(query);

    // 3. Fallback to MiniSearch
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

    const searchResults = this.miniSearch.search(normalizedQuery);
    
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
