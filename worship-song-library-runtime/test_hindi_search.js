// Test script to verify Hindi search works with English queries
import { buildSearchDocument } from './src/utils/SearchDocumentBuilder.js';

// Test Hindi song data from deepseek_json_20260714_ea5020.json
const testHindiSongs = [
  {
    id: 2001,
    songNumber: 2001,
    title: 'Aasman bhi tal jayega, prithvi bhi tal jayegi',
    artist: undefined,
    language: 'hindi',
    originalKey: undefined,
    hashtags: [],
    searchTokens: ''
  },
  {
    id: 2002,
    songNumber: 2002,
    title: 'Kya de sakta hoon, kya la sakta hoon',
    artist: undefined,
    language: 'hindi',
    originalKey: undefined,
    hashtags: [],
    searchTokens: ''
  },
  {
    id: 2003,
    songNumber: 2003,
    title: 'Dhanyawad ke saath stuti gaunga',
    artist: undefined,
    language: 'hindi',
    originalKey: undefined,
    hashtags: [],
    searchTokens: ''
  },
  {
    id: 2004,
    songNumber: 2004,
    title: 'Aaradhna me hai chutkara, aaradhna me hai changai',
    artist: undefined,
    language: 'hindi',
    originalKey: undefined,
    hashtags: [],
    searchTokens: ''
  },
  {
    id: 2005,
    songNumber: 2005,
    title: 'He swargiya Pita',
    artist: undefined,
    language: 'hindi',
    originalKey: undefined,
    hashtags: [],
    searchTokens: ''
  },
  {
    id: 2006,
    songNumber: 2006,
    title: 'Hallelujah hum gaate hain baarambar',
    artist: undefined,
    language: 'hindi',
    originalKey: undefined,
    hashtags: [],
    searchTokens: ''
  },
  {
    id: 2007,
    songNumber: 2007,
    title: 'Yesu naam mila',
    artist: undefined,
    language: 'hindi',
    originalKey: undefined,
    hashtags: [],
    searchTokens: ''
  },
  {
    id: 2008,
    songNumber: 2008,
    title: 'Dhanya dhanya Yeshu naam',
    artist: undefined,
    language: 'hindi',
    originalKey: undefined,
    hashtags: [],
    searchTokens: ''
  },
  {
    id: 2009,
    songNumber: 2009,
    title: 'Teri stuti main karoon, aaradhna karoon',
    artist: undefined,
    language: 'hindi',
    originalKey: undefined,
    hashtags: [],
    searchTokens: ''
  },
  {
    id: 2010,
    songNumber: 2010,
    title: 'Jata main jata kahan tu hi hai mera khuda',
    artist: undefined,
    language: 'hindi',
    originalKey: undefined,
    hashtags: [],
    searchTokens: ''
  }
];

console.log('=== HINDI SEARCH TEST ===\n');

for (const song of testHindiSongs) {
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
console.log('- "yeshu" (should find songs with Yeshu)');
console.log('- "yesu" (should find songs with Yesu)');
console.log('- "khuda" (should find songs with Khuda)');
console.log('- "prabhu" (should find songs with Prabhu)');
console.log('- "stuti" (should find songs with stuti)');
console.log('- "aaradhana" (should find songs with aaradhana)');
console.log('- "dhanya" (should find songs with dhanya)');
console.log('- "hallelujah" (should find songs with Hallelujah)');
console.log('');
console.log('All worship term aliases should also work:');
console.log('- "jesus" (for Yeshu)');
console.log('- "lord" (for Prabhu)');
console.log('- "praise" (for stuti)');
console.log('- "worship" (for aaradhana)');
console.log('- "blessed" (for dhanya)');
