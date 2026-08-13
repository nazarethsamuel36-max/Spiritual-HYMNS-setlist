// Script to fix only specific variants as requested by user
// yesu → yeshu, dhanyawad → dhanyavad, aakaash → aakash
const fs = require('fs');

const searchDocs = JSON.parse(fs.readFileSync('./src/Search_1.0.json', 'utf8'));

console.log('=== FIXING SPECIFIC VARIANTS ===\n');

// Define the specific replacements requested
const replacements = [
  { from: 'yesu', to: 'yeshu', description: 'yesu → yeshu' },
  { from: 'dhanyawad', to: 'dhanyavad', description: 'dhanyawad → dhanyavad' },
  { from: 'aakaash', to: 'aakash', description: 'aakaash → aakash' },
];

let totalReplacements = 0;

replacements.forEach(({ from, to, description }) => {
  let count = 0;
  
  searchDocs.forEach(doc => {
    if (doc.transliteratedTitle) {
      // Replace all occurrences of the variant with canonical form
      const regex = new RegExp(from, 'gi');
      const original = doc.transliteratedTitle;
      doc.transliteratedTitle = doc.transliteratedTitle.replace(regex, to);
      
      if (original !== doc.transliteratedTitle) {
        count++;
        console.log(`Song #${doc.songNumber}: "${original}" → "${doc.transliteratedTitle}"`);
      }
    }
  });
  
  console.log(`\n${description}: ${count} replacements`);
  totalReplacements += count;
});

console.log(`\n=== TOTAL REPLACEMENTS: ${totalReplacements} ===`);

// Write the updated file
fs.writeFileSync('./src/Search_1.0.json', JSON.stringify(searchDocs, null, 2), 'utf8');
console.log('\n✅ Search_1.0.json updated successfully');
