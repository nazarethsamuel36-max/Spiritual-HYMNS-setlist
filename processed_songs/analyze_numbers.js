const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'english_songs.json');
const songs = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`Total songs in JSON: ${songs.length}`);

const numbers = songs.map(s => s.number);
const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);

console.log(`Min number: ${uniqueNumbers[0]}`);
console.log(`Max number: ${uniqueNumbers[uniqueNumbers.length - 1]}`);
console.log(`Unique numbers count: ${uniqueNumbers.length}`);

const gaps = [];
for (let i = uniqueNumbers[0]; i <= uniqueNumbers[uniqueNumbers.length - 1]; i++) {
    if (!uniqueNumbers.includes(i)) {
        gaps.push(i);
    }
}

if (gaps.length > 0) {
    console.log(`Gaps in numbering: ${gaps.slice(0, 10).join(', ')}${gaps.length > 10 ? '...' : ''} (Total gaps: ${gaps.length})`);
} else {
    console.log("No gaps in numbering.");
}

// Check for duplicates
const counts = {};
numbers.forEach(n => counts[n] = (counts[n] || 0) + 1);
const duplicates = Object.keys(counts).filter(n => counts[n] > 1);
if (duplicates.length > 0) {
    console.log(`Duplicate numbers: ${duplicates.slice(0, 10).join(', ')}${duplicates.length > 10 ? '...' : ''} (Total duplicates: ${duplicates.length})`);
}
