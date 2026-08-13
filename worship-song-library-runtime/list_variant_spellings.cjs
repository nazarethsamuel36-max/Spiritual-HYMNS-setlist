// Script to identify variant spellings in transliterated titles
const fs = require('fs');

const searchDocs = JSON.parse(fs.readFileSync('./src/Search_1.0.json', 'utf8'));

// Canonical worship words from SearchEngine.ts
const canonicalWords = [
  'yeshu', 'yahova', 'prabhu', 'masih', 'khrista', 'krus',
  'dhanyavad', 'jai', 'aakash', 'aadi', 'jeevan', 'vande',
  'hallelujah', 'stuti', 'aradhana', 'mahima', 'atma',
  'swarg', 'pavitra'
];

// Collect all words from transliterated titles
const allWords = new Set();
searchDocs.forEach(doc => {
  if (doc.transliteratedTitle) {
    const words = doc.transliteratedTitle.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 2) { // Filter out short words
        allWords.add(word);
      }
    });
  }
});

console.log('=== VARIANT SPELLING ANALYSIS ===\n');
console.log('Total unique words in transliterated titles:', allWords.size);
console.log('\nAnalyzing worship word variants...\n');

// For each canonical word, find potential variants
canonicalWords.forEach(canonical => {
  const variants = [];
  allWords.forEach(word => {
    // Check if word is similar to canonical (Levenshtein distance or contains)
    if (word.includes(canonical) || canonical.includes(word) || word.startsWith(canonical.substring(0, 3))) {
      if (word !== canonical) {
        variants.push(word);
      }
    }
  });
  
  if (variants.length > 0) {
    console.log(`Canonical: "${canonical}"`);
    console.log(`  Variants found: ${variants.join(', ')}`);
    
    // Count occurrences
    const canonicalCount = searchDocs.filter(d => 
      d.transliteratedTitle && d.transliteratedTitle.toLowerCase().includes(canonical)
    ).length;
    
    variants.forEach(variant => {
      const variantCount = searchDocs.filter(d => 
        d.transliteratedTitle && d.transliteratedTitle.toLowerCase().includes(variant)
      ).length;
      console.log(`    "${variant}": ${variantCount} occurrences`);
    });
    console.log(`  Canonical "${canonical}": ${canonicalCount} occurrences`);
    console.log('');
  }
});

// Also find words that might be variants but not in our canonical list
console.log('=== POTENTIAL NEW VARIANTS ===\n');
const knownVariants = new Set();
canonicalWords.forEach(w => knownVariants.add(w));

// Add known variants from SearchEngine.ts
const knownVariantList = [
  'yesu', 'yeshoo', 'yeesu', 'yesh',
  'yehova', 'jehova', 'yahveh',
  'prabu', 'prabhoo', 'prbhu',
  'maseeh', 'mashih', 'masiha',
  'krista', 'christa', 'kristh', 'christ',
  'kruus', 'cruz', 'krusas', 'kroos',
  'dhanyawad', 'dhanyabad',
  'jay',
  'akash', 'asman', 'aasman',
  'adi',
  'jivan', 'jiwan',
  'bande',
  'halleluya', 'halleluja', 'alleluia',
  'stooti', 'stotri',
  'aaradhana', 'aradhan', 'aaradhan',
  'mahimaa',
  'aatma', 'atmaa',
  'swarga', 'svarg',
  'pawitra'
];
knownVariantList.forEach(v => knownVariants.add(v));

const potentialVariants = [];
allWords.forEach(word => {
  if (!knownVariants.has(word) && word.length > 3) {
    // Check if it looks like it could be a worship word (contains common patterns)
    if (word.includes('yesh') || word.includes('yah') || word.includes('prab') || 
        word.includes('mas') || word.includes('kris') || word.includes('krus') ||
        word.includes('dhany') || word.includes('jai') || word.includes('aak') ||
        word.includes('jeev') || word.includes('stut') || word.includes('arad') ||
        word.includes('hallel') || word.includes('swarg') || word.includes('pavit')) {
      potentialVariants.push(word);
    }
  }
});

if (potentialVariants.length > 0) {
  console.log('Potential new variants not in canonical list:');
  potentialVariants.forEach(variant => {
    const count = searchDocs.filter(d => 
      d.transliteratedTitle && d.transliteratedTitle.toLowerCase().includes(variant)
    ).length;
    console.log(`  "${variant}": ${count} occurrences`);
  });
} else {
  console.log('No potential new variants found.');
}
