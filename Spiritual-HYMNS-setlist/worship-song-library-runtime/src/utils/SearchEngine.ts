import MiniSearch from 'minisearch';
import type { SongIndex } from '../db/Database';

// Worship-word synonym groups (bidirectional).
// Each group contains the canonical form first, followed by common variants.
// Applied to the user's query before passing to MiniSearch.
const WORSHIP_SYNONYM_GROUPS: string[][] = [
  ['yeshu', 'yesu', 'yeshoo', 'yeesu', 'yesh'],
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
  ['mazha', 'majha', 'maja', 'maajha'],
];

/**
 * Normalize a user search query:
 * 1. Lowercase
 * 2. Map any worship variant to canonical form
 * Returns the normalized query string.
 */
function normalizeSearchQuery(query: string): string {
  const lower = query.toLowerCase().trim();
  const tokens = lower.split(/\s+/);
  const normalized = tokens.map(token => {
    for (const group of WORSHIP_SYNONYM_GROUPS) {
      if (group.includes(token)) {
        return group[0];
      }
    }
    return token;
  });
  return normalized.join(' ');
}

/**
 * Normalize a stored field for phrase comparison.
 * Strips non-alphanumeric chars, collapses whitespace, lowercases.
 */
function normalizeForPhrase(text: string | undefined | null): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Expand a query phrase into all synonym permutations for phrase matching.
 * For "hum yeshu ke san", if "yeshu" has synonyms ["yeshu","yesu","yeshoo"],
 * we generate multiple phrase variants to match against stored fields.
 * Returns an array of normalized phrase strings.
 */
function expandQueryPhrases(query: string): string[] {
  const lower = query.toLowerCase().trim();
  const tokens = lower.split(/\s+/);
  
  // For each token, collect all possible forms (original + synonym group members)
  const tokenVariants: string[][] = tokens.map(token => {
    const variants = [token];
    for (const group of WORSHIP_SYNONYM_GROUPS) {
      if (group.includes(token)) {
        for (const member of group) {
          if (!variants.includes(member)) variants.push(member);
        }
        break;
      }
    }
    return variants;
  });
  
  // Generate cartesian product of all token variants (capped to prevent explosion)
  // For typical 3-5 word queries with 1-2 synonym groups, this is very manageable
  let phrases: string[][] = [[]];
  for (const variants of tokenVariants) {
    const next: string[][] = [];
    for (const prefix of phrases) {
      for (const v of variants) {
        if (next.length >= 50) break; // Safety cap
        next.push([...prefix, v]);
      }
    }
    phrases = next;
  }
  
  return phrases.map(p => p.join(' '));
}

/**
 * Compute phrase-aware ranking bonus for a song against the query.
 * 
 * Ranking tiers (bonuses are additive on top of MiniSearch base score):
 *   Tier 1: romanTitle starts with query phrase     → +10000
 *   Tier 2: romanTitle contains full query phrase    → +5000
 *   Tier 3: searchTokens starts with query phrase    → +3000
 *   Tier 4: searchTokens contains full query phrase  → +1000
 *   Tier 5: Individual token matches (MiniSearch)    → base score only
 */
function computePhraseBonus(
  song: SongIndex,
  queryPhrases: string[],
  normalizedQuery: string
): number {
  const romanTitle = normalizeForPhrase(song.romanTitle);
  const searchTokens = normalizeForPhrase(song.searchTokens);
  
  let bestBonus = 0;
  
  for (const phrase of queryPhrases) {
    // Tier 1: romanTitle starts with query phrase
    if (romanTitle && romanTitle.startsWith(phrase)) {
      bestBonus = Math.max(bestBonus, 10000);
      break; // Can't do better than this
    }
    
    // Tier 2: romanTitle contains full query phrase
    if (romanTitle && romanTitle.includes(phrase)) {
      bestBonus = Math.max(bestBonus, 5000);
    }
    
    // Tier 3: searchTokens starts with query phrase
    if (searchTokens && searchTokens.startsWith(phrase)) {
      bestBonus = Math.max(bestBonus, 3000);
    }
    
    // Tier 4: searchTokens contains full query phrase
    if (searchTokens && searchTokens.includes(phrase)) {
      bestBonus = Math.max(bestBonus, 1000);
    }
  }
  
  // If multi-word query but no phrase match found, also check the canonical form
  if (bestBonus === 0 && normalizedQuery.includes(' ')) {
    if (romanTitle && romanTitle.startsWith(normalizedQuery)) {
      bestBonus = 10000;
    } else if (romanTitle && romanTitle.includes(normalizedQuery)) {
      bestBonus = 5000;
    } else if (searchTokens && searchTokens.startsWith(normalizedQuery)) {
      bestBonus = 3000;
    } else if (searchTokens && searchTokens.includes(normalizedQuery)) {
      bestBonus = 1000;
    }
  }
  
  return bestBonus;
}

export class SearchEngine {
  private static miniSearch = new MiniSearch<SongIndex>({
    fields: ['title', 'romanTitle', 'artist', 'songNumber', 'searchTokens'],
    storeFields: ['id', 'title', 'artist', 'songNumber', 'language', 'romanTitle'],
    searchOptions: {
      boost: { title: 3, romanTitle: 3, songNumber: 5, artist: 1.2 },
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

    // 3. Ensure index is built
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

    // 4. MiniSearch for discovery (which songs match at all)
    const searchResults = this.miniSearch.search(normalizedQuery);
    
    // 5. Build phrase variants for re-ranking
    const queryPhrases = expandQueryPhrases(query);
    const isMultiWord = normalizedQuery.includes(' ');
    
    // 6. Map results, apply phrase-aware re-ranking bonuses
    const validIds = new Set(songs.map(s => s.id));
    const songMap = new Map(songs.map(s => [s.id, s]));
    
    return searchResults
      .filter(res => validIds.has(res.id as any))
      .map(res => {
        const original = songMap.get(res.id as any);
        if (!original) return null;
        
        // Compute phrase bonus on top of MiniSearch base score
        const phraseBonus = isMultiWord
          ? computePhraseBonus(original, queryPhrases, normalizedQuery)
          : 0;
        
        return {
          ...original,
          ...res,
          score: res.score + phraseBonus
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.score - a.score) as unknown as (SongIndex & { score: number })[];
  }
}

