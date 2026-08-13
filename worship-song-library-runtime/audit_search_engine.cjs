// Comprehensive search engine audit after Devanagari title fix
const fs = require('fs');
const path = require('path');

// Load the data
const searchDocs = JSON.parse(fs.readFileSync('./src/Search_1.0.json', 'utf8'));

console.log('=== SEARCH ENGINE AUDIT (POST-FIX) ===\n');

// 1. Data Integrity Check
console.log('1. DATA INTEGRITY CHECK');
console.log('=========================');
const hindi = searchDocs.filter(d => d.language === 'hindi');
const marathi = searchDocs.filter(d => d.language === 'marathi');
const english = searchDocs.filter(d => d.language === 'english');
const konkani = searchDocs.filter(d => d.language === 'konkani');

console.log('Hindi:', hindi.length, 'with titles:', hindi.filter(d => d.title && d.title.trim() !== '').length);
console.log('Marathi:', marathi.length, 'with titles:', marathi.filter(d => d.title && d.title.trim() !== '').length);
console.log('English:', english.length, 'with titles:', english.filter(d => d.title && d.title.trim() !== '').length);
console.log('Konkani:', konkani.length, 'with titles:', konkani.filter(d => d.title && d.title.trim() !== '').length);

// Check for empty titles
const emptyTitles = searchDocs.filter(d => !d.title || d.title.trim() === '');
if (emptyTitles.length > 0) {
  console.log('\n⚠️  WARNING: Found', emptyTitles.length, 'documents with empty titles:');
  emptyTitles.forEach(d => console.log(`  - Song #${d.songNumber} (${d.language})`));
} else {
  console.log('\n✅ All documents have non-empty titles');
}

// 2. Devanagari Title Search Simulation
console.log('\n2. DEVANAGARI TITLE SEARCH SIMULATION');
console.log('=====================================');

// Test queries that should work with Devanagari titles
const devanagariQueries = [
  { query: 'यीशु', language: 'hindi', description: 'Hindi: Yeshu' },
  { query: 'यहोवा', language: 'hindi', description: 'Hindi: Yahova' },
  { query: 'प्रभु', language: 'hindi', description: 'Hindi: Prabhu' },
  { query: 'मसीहा', language: 'hindi', description: 'Hindi: Masiha' },
  { query: 'ख्रिस्त', language: 'marathi', description: 'Marathi: Khrist' },
];

devanagariQueries.forEach(({ query, language, description }) => {
  const langDocs = searchDocs.filter(d => d.language === language);
  const matches = langDocs.filter(d => 
    d.title && d.title.toLowerCase().includes(query.toLowerCase())
  );
  console.log(`\nQuery: "${query}" (${description})`);
  console.log(`  Matches: ${matches.length}`);
  if (matches.length > 0 && matches.length <= 5) {
    matches.forEach(m => console.log(`    - Song #${m.songNumber}: "${m.title}"`));
  } else if (matches.length > 5) {
    console.log(`    - First 5 matches:`);
    matches.slice(0, 5).forEach(m => console.log(`      Song #${m.songNumber}: "${m.title}"`));
  }
});

// 3. Transliterated Title Search Simulation
console.log('\n3. TRANSLITERATED TITLE SEARCH SIMULATION');
console.log('==========================================');

const transliteratedQueries = [
  { query: 'yeshu', description: 'Yeshu' },
  { query: 'yahova', description: 'Yahova' },
  { query: 'prabhu', description: 'Prabhu' },
  { query: 'masiha', description: 'Masiha' },
  { query: 'khrist', description: 'Khrist' },
];

transliteratedQueries.forEach(({ query, description }) => {
  const matches = searchDocs.filter(d => 
    d.transliteratedTitle && d.transliteratedTitle.toLowerCase().includes(query.toLowerCase())
  );
  console.log(`\nQuery: "${query}" (${description})`);
  console.log(`  Matches: ${matches.length}`);
  if (matches.length > 0 && matches.length <= 5) {
    matches.forEach(m => console.log(`    - Song #${m.songNumber}: "${m.transliteratedTitle}"`));
  } else if (matches.length > 5) {
    console.log(`    - First 5 matches:`);
    matches.slice(0, 5).forEach(m => console.log(`      Song #${m.songNumber}: "${m.transliteratedTitle}"`));
  }
});

// 4. Ranking Tier Simulation
console.log('\n4. RANKING TIER SIMULATION');
console.log('==========================');

// Simulate the ranking logic from SearchEngine.ts
function normalizeForPhrase(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function simulateRanking(searchDoc, query) {
  const title = normalizeForPhrase(searchDoc.title);
  const transliteratedTitle = normalizeForPhrase(searchDoc.transliteratedTitle);
  const normalizedQuery = query.toLowerCase().trim();
  
  // Tier 1: Title starts with query
  if (title.startsWith(normalizedQuery) || transliteratedTitle.startsWith(normalizedQuery)) {
    return { tier: 1, score: 10000000, reason: 'Title starts with query' };
  }
  
  // Tier 2: Word starts with query
  if (title.includes(' ' + normalizedQuery) || transliteratedTitle.includes(' ' + normalizedQuery)) {
    return { tier: 2, score: 1000000, reason: 'Word starts with query' };
  }
  
  // Tier 3: Substring match
  if (title.includes(normalizedQuery) || transliteratedTitle.includes(normalizedQuery)) {
    return { tier: 3, score: 100000, reason: 'Substring match' };
  }
  
  return { tier: 4, score: 0, reason: 'No match' };
}

const rankingQueries = [
  { query: 'yeshu', description: 'Yeshu' },
  { query: 'jay', description: 'Jay' },
  { query: 'stuti', description: 'Stuti' },
];

rankingQueries.forEach(({ query, description }) => {
  console.log(`\nQuery: "${query}" (${description})`);
  
  const hindiDocs = searchDocs.filter(d => d.language === 'hindi');
  const ranked = hindiDocs
    .map(doc => ({
      songNumber: doc.songNumber,
      title: doc.title,
      transliteratedTitle: doc.transliteratedTitle,
      ...simulateRanking(doc, query)
    }))
    .filter(r => r.tier < 4)
    .sort((a, b) => b.score - a.score);
  
  console.log(`  Ranked matches: ${ranked.length}`);
  if (ranked.length > 0) {
    console.log('  Top 5:');
    ranked.slice(0, 5).forEach(r => {
      console.log(`    Tier ${r.tier}: Song #${r.songNumber} - "${r.title}" (${r.reason})`);
    });
  }
});

// 5. Synonym Normalization Check
console.log('\n5. SYNONYM NORMALIZATION CHECK');
console.log('===============================');

const synonymGroups = [
  { canonical: 'yeshu', variants: ['yesu', 'yeshoo', 'yeesu', 'yesh'] },
  { canonical: 'yahova', variants: ['yehova', 'jehova', 'yahveh'] },
  { canonical: 'prabhu', variants: ['prabu', 'prabhoo', 'prbhu'] },
];

synonymGroups.forEach(({ canonical, variants }) => {
  console.log(`\nCanonical: "${canonical}"`);
  console.log(`  Variants: ${variants.join(', ')}`);
  
  // Check if canonical form matches
  const canonicalMatches = searchDocs.filter(d => 
    d.transliteratedTitle && d.transliteratedTitle.toLowerCase().includes(canonical)
  );
  console.log(`  Canonical matches: ${canonicalMatches.length}`);
  
  // Check if variant would match after normalization (simulated)
  variants.forEach(variant => {
    const variantMatches = searchDocs.filter(d => 
      d.transliteratedTitle && d.transliteratedTitle.toLowerCase().includes(variant)
    );
    console.log(`  Variant "${variant}" matches: ${variantMatches.length} (should normalize to ${canonicalMatches.length})`);
  });
});

// 6. Cross-Language Search
console.log('\n6. CROSS-LANGUAGE SEARCH');
console.log('========================');

const crossLangQuery = 'yeshu';
const allMatches = searchDocs.filter(d => 
  d.transliteratedTitle && d.transliteratedTitle.toLowerCase().includes(crossLangQuery)
);

console.log(`Query: "${crossLangQuery}" across all languages`);
console.log(`Total matches: ${allMatches.length}`);
const byLang = {};
allMatches.forEach(m => {
  if (!byLang[m.language]) byLang[m.language] = [];
  byLang[m.language].push(m.songNumber);
});
Object.entries(byLang).forEach(([lang, songs]) => {
  console.log(`  ${lang}: ${songs.length} songs`);
});

console.log('\n=== AUDIT COMPLETE ===');
