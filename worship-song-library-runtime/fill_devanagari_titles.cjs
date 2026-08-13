// Script to fill empty Devanagari titles in Search_1.0.json from deepseek JSON files
const fs = require('fs');
const path = require('path');

// Load the files
const searchDocs = JSON.parse(fs.readFileSync('./src/Search_1.0.json', 'utf8'));
const hindiDeepseek = JSON.parse(fs.readFileSync('./src/deepseek_json_20260714_414b65.json', 'utf8'));
const marathiDeepseek = JSON.parse(fs.readFileSync('./src/deepseek_json_20260715_16b482.json', 'utf8'));

console.log('=== FILLING DEVANAGARI TITLES ===\n');

// Create maps for quick lookup
const hindiMap = new Map();
hindiDeepseek.forEach(doc => {
  if (doc.language === 'hindi' && doc.devnagari_title) {
    hindiMap.set(doc.song_number, doc.devnagari_title);
  }
});

const marathiMap = new Map();
marathiDeepseek.forEach(doc => {
  if (doc.language === 'marathi' && doc.devnagari_title) {
    marathiMap.set(doc.song_number, doc.devnagari_title);
  }
});

console.log('Hindi Devanagari titles available:', hindiMap.size);
console.log('Marathi Devanagari titles available:', marathiMap.size);

// Update Search_1.0.json
let hindiUpdated = 0;
let marathiUpdated = 0;

searchDocs.forEach(doc => {
  if (doc.language === 'hindi') {
    const devanagariTitle = hindiMap.get(doc.songNumber);
    if (devanagariTitle && (!doc.title || doc.title.trim() === '' || doc.title === '-')) {
      doc.title = devanagariTitle;
      hindiUpdated++;
    }
  } else if (doc.language === 'marathi') {
    const devanagariTitle = marathiMap.get(doc.songNumber);
    if (devanagariTitle && (!doc.title || doc.title.trim() === '' || doc.title === '-')) {
      doc.title = devanagariTitle;
      marathiUpdated++;
    }
  }
});

console.log('\n=== UPDATE SUMMARY ===');
console.log('Hindi titles updated:', hindiUpdated);
console.log('Marathi titles updated:', marathiUpdated);

// Verify the updates
const hindiAfter = searchDocs.filter(d => d.language === 'hindi' && d.title && d.title.trim() !== '' && d.title !== '-');
const marathiAfter = searchDocs.filter(d => d.language === 'marathi' && d.title && d.title.trim() !== '' && d.title !== '-');

console.log('\n=== VERIFICATION ===');
console.log('Hindi docs with titles after update:', hindiAfter.length);
console.log('Marathi docs with titles after update:', marathiAfter.length);

// Write the updated file
fs.writeFileSync('./src/Search_1.0.json', JSON.stringify(searchDocs, null, 2), 'utf8');
console.log('\n✅ Search_1.0.json updated successfully');
