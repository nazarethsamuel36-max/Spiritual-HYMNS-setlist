// Script to create Search_1.0.json with all languages
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the main index.json with all songs
const indexPath = path.join(__dirname, 'public/exports/index.json');
const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

// Load Hindi DeepSeek JSON for transliterated titles
const hindiDeepSeekPath = path.join(__dirname, 'src/deepseek_json_20260714_414b65.json');
const hindiDeepSeek = JSON.parse(fs.readFileSync(hindiDeepSeekPath, 'utf8'));

// Create a map for Hindi transliterated titles by song_number
const hindiTransliterationMap = new Map();
for (const song of hindiDeepSeek) {
  hindiTransliterationMap.set(song.song_number, song.transliterated_title);
}

// Process all songs and create Search_1.0.json
const searchDocuments = [];

for (const song of indexData.songs) {
  const normalizedLang = song.language?.toLowerCase().trim();
  let transliteratedTitle;

  // Handle transliterated title based on language
  if (normalizedLang === 'hindi') {
    // Use DeepSeek transliterated title for Hindi
    transliteratedTitle = hindiTransliterationMap.get(song.songNumber) || song.romanTitle;
  } else if (normalizedLang === 'marathi') {
    // Use romanTitle for Marathi (already transliterated)
    transliteratedTitle = song.romanTitle;
  } else if (normalizedLang === 'konkani') {
    // Use romanTitle for Konkani (already transliterated)
    transliteratedTitle = song.romanTitle;
  } else if (normalizedLang === 'english') {
    // For English, the title is already in Latin script
    transliteratedTitle = song.title;
  } else {
    // For other languages, use romanTitle if available
    transliteratedTitle = song.romanTitle || song.title;
  }

  searchDocuments.push({
    songNumber: song.songNumber,
    title: song.title,
    language: song.language,
    transliteratedTitle: transliteratedTitle
  });
}

// Sort by language: English, Konkani, Hindi, Marathi
const languageOrder = { 'english': 1, 'konkani': 2, 'hindi': 3, 'marathi': 4 };
searchDocuments.sort((a, b) => {
  const langA = languageOrder[a.language.toLowerCase()] || 99;
  const langB = languageOrder[b.language.toLowerCase()] || 99;
  if (langA !== langB) {
    return langA - langB;
  }
  return a.songNumber - b.songNumber;
});

// Write to output file
const outputPath = path.join(__dirname, 'src/Search_1.0.json');
fs.writeFileSync(outputPath, JSON.stringify(searchDocuments, null, 2));

console.log(`✅ Created Search_1.0.json with ${searchDocuments.length} songs`);
console.log(`📁 Output: ${outputPath}`);

// Count by language
const langCounts = {};
for (const doc of searchDocuments) {
  langCounts[doc.language] = (langCounts[doc.language] || 0) + 1;
}
console.log(`\nLanguage breakdown:`);
for (const [lang, count] of Object.entries(langCounts)) {
  console.log(`  ${lang}: ${count} songs`);
}
