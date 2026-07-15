// Test script to verify Marathi search works with English queries
import { buildSearchDocument } from './src/utils/SearchDocumentBuilder.js';

// Test Marathi song data
const testMarathiSongs = [
  {
    id: 587,
    songNumber: 1,
    title: 'ख्रिस्त माझा, तो सर्वांचा, या नमा त्याला',
    artist: undefined,
    language: 'marathi',
    originalKey: 'G',
    hashtags: [],
    searchTokens: ''
  },
  {
    id: 588,
    songNumber: 2,
    title: 'धन्यवाद येशूला',
    artist: undefined,
    language: 'marathi',
    originalKey: 'C',
    hashtags: [],
    searchTokens: ''
  },
  {
    id: 602,
    songNumber: 16,
    title: 'वंदा, वंदा तारक प्रभु येशूला ! (Praise Him Praise Him)',
    artist: undefined,
    language: 'marathi',
    originalKey: 'D',
    hashtags: [],
    searchTokens: ''
  }
];

console.log('=== MARATHI SEARCH TEST ===\n');

for (const song of testMarathiSongs) {
  const searchDoc = buildSearchDocument(song);
  
  console.log(`Song #${song.songNumber} (ID: ${song.id})`);
  console.log(`Original Title: ${song.title}`);
  console.log(`Generated titleSearch:`);
  console.log(searchDoc.titleSearch);
  console.log('');
  console.log('---');
  console.log('');
}

console.log('=== TEST QUERIES ===');
console.log('Try searching for these English terms:');
console.log('- "yeshu" (should find songs with येशू)');
console.log('- "khrista" (should find songs with ख्रिस्त)');
console.log('- "prabhu" (should find songs with प्रभु)');
console.log('- "tarak" (should find songs with तारक)');
console.log('- "stuti" (should find songs with स्तुती)');
console.log('');
console.log('All worship term aliases should also work:');
console.log('- "yesu", "jesus" (for येशू)');
console.log('- "christ", "krista" (for ख्रिस्त)');
console.log('- "lord", "prabu" (for प्रभु)');
