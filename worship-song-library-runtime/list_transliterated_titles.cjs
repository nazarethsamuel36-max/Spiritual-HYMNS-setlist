// Extract all transliterated titles from Search_1.0.json
const fs = require('fs');

const searchPath = './src/Search_1.0.json';
const data = JSON.parse(fs.readFileSync(searchPath, 'utf8'));

console.log('=== ALL TRANSLITERATED TITLES ===\n');

const transliteratedTitles = data.map(entry => ({
  songNumber: entry.songNumber,
  transliteratedTitle: entry.transliteratedTitle,
  language: entry.language
}));

console.log(`Total songs: ${transliteratedTitles.length}\n`);

transliteratedTitles.forEach((entry, index) => {
  console.log(`${index + 1}. Song #${entry.songNumber}: ${entry.transliteratedTitle} (${entry.language})`);
});

// Save to file
const output = {
  metadata: {
    description: "All transliterated titles from Search_1.0.json",
    totalSongs: transliteratedTitles.length,
    generatedAt: new Date().toISOString()
  },
  titles: transliteratedTitles
};

fs.writeFileSync('./transliterated_titles_all.json', JSON.stringify(output, null, 2), 'utf8');
console.log('\n✅ Results saved to transliterated_titles_all.json');
