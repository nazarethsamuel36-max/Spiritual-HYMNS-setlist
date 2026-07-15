// Script to convert all Hindi songs from deepseek_json to SearchDocument format
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Worship term aliases from WorshipSearchDictionary
const WORSHIP_TERM_ALIASES = {
  'yeshu': ['yesu', 'yeshoo', 'yeesu', 'jesus'],
  'khrista': ['khrist', 'christ', 'christa', 'krista'],
  'prabhu': ['prabu', 'prabhoo', 'lord'],
  'tarak': ['taranara', 'saviour', 'savior', 'redeemer'],
  'krus': ['krusas', 'cross', 'kroos'],
  'stuti': ['stutii', 'stooti', 'praise'],
  'aradhana': ['aaradhana', 'karuya', 'worship'],
  'swarg': ['swarga', 'svarg', 'heaven'],
  'anand': ['aanand', 'joy'],
  'krupa': ['krupe', 'krupae', 'grace'],
  'daya': ['mercy'],
  'rakte': ['rakta', 'blood'],
  'mendhpal': ['mendhapal', 'shepherd'],
  'mitra': ['friend'],
  'seva': ['service', 'ministry'],
  'prakash': ['prakashit', 'light'],
  'divya': ['heavenly', 'divine'],
  'dhanya': ['blessed', 'blessing'],
};

function expandWorshipTerms(text) {
  const words = text.toLowerCase().split(/\s+/);
  const expandedWords = [];
  
  for (const word of words) {
    let found = false;
    for (const [canonical, aliases] of Object.entries(WORSHIP_TERM_ALIASES)) {
      if (word === canonical.toLowerCase() || aliases.includes(word)) {
        expandedWords.push(canonical, ...aliases);
        found = true;
        break;
      }
    }
    
    if (!found) {
      expandedWords.push(word);
    }
  }
  
  return expandedWords.join(' ');
}

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function buildTitleSearch(title) {
  const normalizedTitle = normalizeText(title);
  return normalizedTitle; // Pure transliteration only - no worship term expansion
}

// Read the Hindi songs JSON (with Devanagari titles)
const inputPath = path.join(__dirname, 'src/deepseek_json_20260714_414b65.json');
const hindiSongs = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Convert to SearchDocument format - Devanagari in title, pure transliterated in titleSearch
const searchDocuments = hindiSongs.map((song, index) => {
  const id = song.song_number;
  const title = song.devnagari_title; // Devanagari title for display
  const transliteratedTitle = song.transliterated_title; // Pure transliterated for search
  
  return {
    id: id,
    title: title, // Devanagari title
    artist: null,
    songNumber: song.song_number,
    language: 'hindi',
    transliteratedTitle: transliteratedTitle, // Transliterated title from DeepSeek
    artistSearch: ''
  };
});

// Write to output file
const outputPath = path.join(__dirname, 'src/hindi_search_documents.json');
fs.writeFileSync(outputPath, JSON.stringify(searchDocuments, null, 2));

console.log(`✅ Converted ${searchDocuments.length} Hindi songs to SearchDocument format`);
console.log(`📁 Output: ${outputPath}`);
