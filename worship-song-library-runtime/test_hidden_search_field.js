// Test script to verify hidden search field (titleSearch) is working correctly
// This tests Phase 1 of the search implementation before adding dictionary/Levenshtein
import { SearchEngine } from './src/utils/SearchEngine.js';
import { buildSearchDocuments } from './src/utils/SearchDocumentBuilder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Hindi songs from JSON
const hindiSongsPath = path.join(__dirname, 'src/deepseek_json_20260714_ea5020.json');
const hindiSongsRaw = JSON.parse(fs.readFileSync(hindiSongsPath, 'utf8'));

// Convert to SongIndex format
const hindiSongs = hindiSongsRaw.map(song => ({
  id: song.song_number,
  songNumber: song.song_number,
  title: song.transliterated_title,
  artist: undefined,
  language: song.language,
  originalKey: undefined,
  hashtags: [],
  searchTokens: ''
}));

console.log('=== HIDDEN SEARCH FIELD TEST ===\n');
console.log(`Loaded ${hindiSongs.length} Hindi songs\n`);

// Build search documents (this creates the hidden titleSearch field)
console.log('Building SearchDocuments with hidden titleSearch fields...');
const searchDocuments = buildSearchDocuments(hindiSongs);

// Show example of hidden field
console.log('\n=== EXAMPLE: HIDDEN FIELD STRUCTURE ===');
const exampleDoc = searchDocuments[0];
console.log(`Song #${exampleDoc.songNumber}: "${exampleDoc.title}"`);
console.log(`Hidden titleSearch: "${exampleDoc.titleSearch}"`);
console.log(`Hidden artistSearch: "${exampleDoc.artistSearch}"`);

// Index the songs
console.log('\n=== INDEXING SONGS ===');
await SearchEngine.indexSongs(hindiSongs);
console.log('Songs indexed successfully\n');

// Test queries to verify hidden field matching
const testQueries = [
  'yeshu',           // Should match songs with "yeshu" in titleSearch
  'prabhu',          // Should match songs with "prabhu" in titleSearch  
  'stuti',           // Should match songs with "stuti" in titleSearch
  'aaradhana',       // Should match songs with "aaradhana" in titleSearch
  'swarg',           // Should match songs with "swarg" in titleSearch
  'Yahova',          // Should match songs with "yahova" in titleSearch
  'Masiha',          // Should match songs with "masiha" in titleSearch
];

console.log('=== TESTING HIDDEN FIELD MATCHING ===\n');

for (const query of testQueries) {
  console.log(`\n--- Testing query: "${query}" ---`);
  const results = SearchEngine.search(hindiSongs, query);
  console.log(`Found ${results.length} results`);
  
  if (results.length > 0) {
    // Show first 3 results with their hidden field values
    results.slice(0, 3).forEach((result, i) => {
      const searchDoc = searchDocuments.find(d => d.id === result.id);
      console.log(`  ${i + 1}. Song #${result.songNumber}: "${result.title}"`);
      console.log(`     Hidden titleSearch: "${searchDoc?.titleSearch}"`);
      console.log(`     Matched in hidden field: ${searchDoc?.titleSearch.toLowerCase().includes(query.toLowerCase()) ? '✅ YES' : '❌ NO'}`);
    });
  } else {
    console.log('  ❌ No matches found');
  }
}

console.log('\n=== TEST SUMMARY ===');
console.log('The audit logs above show:');
console.log('1. User query → Normalized query');
console.log('2. Which SearchDocuments matched');
console.log('3. The hidden titleSearch field value for each match');
console.log('4. Whether the query actually matched in the hidden field');
console.log('\nIf all tests show "✅ YES" for "Matched in hidden field",');
console.log('then Phase 1 (Hidden Search Field) is working correctly.');
