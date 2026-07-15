import MiniSearch from 'minisearch';
import type { SongIndex } from '../db/Database';
import { buildSearchDocuments, type SearchDocument } from './SearchDocumentBuilder';

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
 * Normalize a stored field for phrase comparison.
 * Strips non-alphanumeric chars, collapses whitespace, lowercases.
 */
function normalizeForPhrase(text: string | undefined | null): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

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
 * Compute ranking score according to Search Engine 1.0 Ranking Contract:
 * 
 * Primary Rank: Songs whose title contains a word that starts with the user's query
 * Secondary Rank: Songs where the query appears elsewhere in the title
 * 
 * Architectural rule: Treat original script and transliteration as the same title for ranking.
 * Primary Rank is absolute - all songs with word-starting matches must be shown before any Secondary Rank songs.
 * 
 * Ranking order (absolute score ranges that cannot be overridden):
 * 1. Title starts with query in either script: 10000000+ (Tier 1 - NO LIMIT)
 * 2. Word starts with query inside title in either script: 1000000+ (Tier 2 - NO LIMIT)
 * 3. Word appears later in title in either script (substring): 100000+ (Tier 3 - Secondary Rank)
 * 4. Everything else (MiniSearch base score): <100000 (lowest priority)
 */
function computeRankingScore(
  searchDoc: SearchDocument,
  queryPhrases: string[],
  normalizedQuery: string,
  miniSearchScore: number
): number {
  const title = normalizeForPhrase(searchDoc.title); // Original script (Devanagari)
  const transliteratedTitle = normalizeForPhrase(searchDoc.transliteratedTitle); // Transliterated title
  
  const queryWords = normalizedQuery.split(/\s+/);
  const firstQueryWord = queryWords[0];
  
  // Check both original script and transliteration for prefix matching
  const titleWords = title.split(/\s+/);
  const transliteratedTitleWords = transliteratedTitle.split(/\s+/);
  
  // DEBUG LOGGING
  console.log(`[RANKING DEBUG] Song ID: ${searchDoc.id}, Title: "${searchDoc.title}"`);
  console.log(`[RANKING DEBUG] Transliterated Title: "${searchDoc.transliteratedTitle}"`);
  console.log(`[RANKING DEBUG] Normalized Title: "${title}"`);
  console.log(`[RANKING DEBUG] Normalized Transliterated: "${transliteratedTitle}"`);
  console.log(`[RANKING DEBUG] First Query Word: "${firstQueryWord}"`);
  console.log(`[RANKING DEBUG] Title Words:`, titleWords);
  console.log(`[RANKING DEBUG] Transliterated Words:`, transliteratedTitleWords);
  
  // Tier 1: Title starts with the query phrase (or any of its synonym permutations)
  const titleStartsPhrase = queryPhrases.some(phrase => 
    title.startsWith(phrase) || transliteratedTitle.startsWith(phrase)
  );
  
  if (titleStartsPhrase) {
    console.log(`[RANKING DEBUG] TIER 1 MATCH (Title starts with query): Score = 10000000 + ${miniSearchScore}`);
    return 10000000 + miniSearchScore;
  }
  
  // Tier 2: A word inside the title starts with the query phrase at a word boundary
  const wordStartsPhrase = queryPhrases.some(phrase => 
    title.startsWith(phrase) || 
    title.includes(' ' + phrase) || 
    transliteratedTitle.startsWith(phrase) || 
    transliteratedTitle.includes(' ' + phrase)
  );
  
  if (wordStartsPhrase) {
    console.log(`[RANKING DEBUG] TIER 2 MATCH (Word starts with query): Score = 1000000 + ${miniSearchScore}`);
    return 1000000 + miniSearchScore;
  }
  
  // Tier 3: Query appears as a substring inside the title (contains but not starting at a word boundary)
  const substringMatch = queryPhrases.some(phrase => 
    title.includes(phrase) || transliteratedTitle.includes(phrase)
  );
  
  if (substringMatch) {
    console.log(`[RANKING DEBUG] TIER 3 MATCH (Substring match): Score = 100000 + ${miniSearchScore}`);
    return 100000 + miniSearchScore;
  }
  
  // Everything else (pure MiniSearch score)
  console.log(`[RANKING DEBUG] MINISEARCH ONLY: Score = ${miniSearchScore}`);
  return miniSearchScore;
}


export class SearchEngine {
  private static miniSearch = new MiniSearch<SearchDocument>({
    fields: ['transliteratedTitle', 'artistSearch', 'songNumber'],
    storeFields: ['id', 'title', 'artist', 'songNumber', 'language', 'transliteratedTitle'],
    searchOptions: {
      boost: { transliteratedTitle: 3, songNumber: 5, artistSearch: 1.2 },
      fuzzy: 0.2,
      prefix: true
    }
  });

  private static isIndexed = false;
  private static searchDocCache: Map<number, SearchDocument> = new Map();

  static async indexSongs(songs: SongIndex[]) {
    console.log('[SearchEngine] indexSongs: Building SearchDocuments for', songs.length, 'songs');
    this.miniSearch.removeAll();
    
    // Build SearchDocuments using SearchDocumentBuilder
    const searchDocuments = buildSearchDocuments(songs);
    
    // Deduplicate by ID to prevent MiniSearch duplicate key errors (handle string/number mismatches)
    const seen = new Set<string>();
    const unique = searchDocuments.filter(s => {
      const idStr = String(s.id);
      if (seen.has(idStr)) return false;
      seen.add(idStr);
      return true;
    });
    this.miniSearch.addAll(unique);
    this.isIndexed = true;
    
    // Cache SearchDocuments for reuse during search (avoid rebuilding on every keystroke)
    this.searchDocCache = new Map(unique.map(s => [s.id, s]));
    console.log('[SearchEngine] indexSongs: Cached', this.searchDocCache.size, 'SearchDocuments');
  }

  static search(songs: SongIndex[], query: string): (SongIndex & { score: number })[] {
    return this.searchWithLimit(songs, query, Infinity);
  }

  static searchWithLimit(songs: SongIndex[], query: string, limit: number = 10): (SongIndex & { score: number })[] {
    const startTime = performance.now();
    
    // === AUDIT LOGGING ===
    console.log('\n=== SEARCH AUDIT START ===');
    console.log(`User Query: "${query}"`);
    console.log(`Songs in scope: ${songs.length}`);
    console.log(`Limit: ${limit}`);
    
    if (!query.trim()) {
      console.log('=== SEARCH AUDIT END (empty query) ===\n');
      return [];
    }

    // 1. Numeric Search Bypass (Rule agx004)
    const numericQuery = query.trim();
    if (/^\d+$/.test(numericQuery)) {
      console.log(`Numeric Query Detected: "${numericQuery}"`);
      const numericStart = performance.now();
      const results = songs
        .filter(s => s.songNumber.toString() === numericQuery || s.songNumber.toString().startsWith(numericQuery))
        .map(s => ({ ...s, score: s.songNumber.toString() === numericQuery ? 1000 : 900 }))
        .sort((a, b) => b.score - a.score || a.songNumber - b.songNumber);
      const numericEnd = performance.now();
      
      console.log(`Numeric Search Results: ${results.length} songs (took ${(numericEnd - numericStart).toFixed(2)}ms)`);
      results.forEach(r => {
        console.log(`  - Song #${r.songNumber} (ID: ${r.id}): "${r.title}" [score: ${r.score}]`);
      });
      console.log(`=== SEARCH AUDIT END (numeric) ===\n`);
      
      return results.slice(0, limit);
    }

    // 2. Apply worship-word normalization before MiniSearch
    const normalizedQuery = normalizeSearchQuery(query);
    console.log(`Normalized Query: "${normalizedQuery}"`);

    // 3. Ensure index is built
    if (!this.isIndexed) {
      console.warn('ERROR: Search called before indexSongs was initialized');
      console.log('=== SEARCH AUDIT END (not indexed) ===\n');
      return [];
    }

    console.log(`Cached SearchDocuments: ${this.searchDocCache.size}`);

    // 4. MiniSearch for discovery
    const miniSearchStart = performance.now();
    const searchResults = this.miniSearch.search(normalizedQuery);
    const miniSearchEnd = performance.now();
    
    console.log(`MiniSearch Results: ${searchResults.length} matches`);
    console.log(`MiniSearch Duration: ${(miniSearchEnd - miniSearchStart).toFixed(2)}ms`);
    
    // 5. Build phrase variants for re-ranking
    const queryPhrases = expandQueryPhrases(query);
    console.log(`Query Phrase Variants: ${queryPhrases.length}`);
    queryPhrases.slice(0, 5).forEach((p, i) => console.log(`  ${i + 1}. "${p}"`));
    if (queryPhrases.length > 5) console.log(`  ... and ${queryPhrases.length - 5} more`);
    
    // 6. Map results with detailed audit logging
    const validIds = new Set(songs.map(s => s.id));
    const songMap = new Map(songs.map(s => [s.id, s]));
    const searchDocMap = this.searchDocCache;
    
    console.log('\n=== MATCHED SEARCHDOCUMENTS ===');
    
    const rankedResults = searchResults
      .filter(res => validIds.has(res.id as any))
      .map(res => {
        const original = songMap.get(res.id as any);
        const searchDoc = searchDocMap.get(res.id as any);
        if (!original || !searchDoc) return null;
        
        // Compute ranking score
        const rankingScore = computeRankingScore(searchDoc, queryPhrases, normalizedQuery, res.score);
        
        // AUDIT LOGGING: Log which SearchDocument matched
        console.log(`\nSong #${searchDoc.songNumber} (ID: ${searchDoc.id})`);
        console.log(`  Title: "${searchDoc.title}"`);
        console.log(`  Transliterated Title: "${searchDoc.transliteratedTitle}"`);
        console.log(`  Language: ${searchDoc.language}`);
        console.log(`  artistSearch: "${searchDoc.artistSearch}"`);
        console.log(`  MiniSearch Score: ${res.score.toFixed(2)}`);
        console.log(`  Ranking Score: ${rankingScore.toFixed(2)}`);
        console.log(`  Matched Terms: ${Object.keys(res.matchTerms || {}).join(', ')}`);
        
        return {
          ...original,
          score: rankingScore
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.score - a.score) as unknown as (SongIndex & { score: number })[];

    // Search Engine 1.0: Separate Primary Rank and Secondary Rank
    // Primary Rank (score >= 1000000): NO LIMIT - show all songs starting with query word
    // Secondary Rank (score < 1000000): Apply limit
    const primaryRankResults = rankedResults.filter(r => r.score >= 1000000);
    const secondaryRankResults = rankedResults.filter(r => r.score < 1000000);
    
    console.log(`\nPrimary Rank Results (NO LIMIT): ${primaryRankResults.length}`);
    console.log(`Secondary Rank Results (limited to ${limit}): ${Math.min(secondaryRankResults.length, limit)}`);
    
    const finalResults = [...primaryRankResults, ...secondaryRankResults.slice(0, limit)];

    console.log('\n=== FINAL RESULTS ===');
    finalResults.forEach((r, i) => {
      console.log(`${i + 1}. Song #${r.songNumber} (ID: ${r.id}): "${r.title}" [score: ${r.score.toFixed(2)}]`);
    });
    
    const endTime = performance.now();
    console.log(`\nTotal Duration: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`=== SEARCH AUDIT END ===\n`);
    
    return finalResults;
  }
}

