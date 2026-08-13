// Extract all Devanagari titles containing "यीशु" (yeshu)
const fs = require('fs');

const searchPath = './src/Search_1.0.json';
const data = JSON.parse(fs.readFileSync(searchPath, 'utf8'));

console.log('=== DEVANAGARI TITLES CONTAINING "यीशु" (YESHU) ===\n');

const yeshuTitles = data.filter(entry => 
  entry.title && entry.title.includes('यीशु')
);

console.log(`Found ${yeshuTitles.length} songs with "यीशु" in Devanagari title:\n`);

yeshuTitles.forEach((entry, index) => {
  console.log(`${index + 1}. Song #${entry.songNumber}`);
  console.log(`   Devanagari: ${entry.title}`);
  console.log(`   Transliterated: ${entry.transliteratedTitle}`);
  console.log(`   Language: ${entry.language}`);
  console.log();
});

// Save to file
const output = {
  metadata: {
    description: "All Devanagari titles containing 'यीशु' (yeshu)",
    totalFound: yeshuTitles.length,
    generatedAt: new Date().toISOString()
  },
  titles: yeshuTitles.map(entry => ({
    songNumber: entry.songNumber,
    devanagariTitle: entry.title,
    transliteratedTitle: entry.transliteratedTitle,
    language: entry.language
  }))
};

fs.writeFileSync('./yeshu_devanagari_titles.json', JSON.stringify(output, null, 2), 'utf8');
console.log('✅ Results saved to yeshu_devanagari_titles.json');
