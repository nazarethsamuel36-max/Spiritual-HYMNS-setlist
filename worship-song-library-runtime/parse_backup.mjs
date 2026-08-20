import fs from 'fs';
const content = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/songs_rows (1)_backup.sql', 'utf8');

const rows = [];
const re = /\((\d+),\s*(\d+),\s*'(?:[^']|'')*?',\s*'([^']*)',\s*'([^']*)',\s*'(.*?)',\s*(true|false),\s*(?:null|'[^']*'),\s*'(.*?)',\s*(true|false)\)/gs;
let m;
let count = 0;
while ((m = re.exec(content)) !== null) {
  count++;
  rows.push({
    id: parseInt(m[1]),
    song_number: parseInt(m[2]),
    title: m[3],
    language: m[4].toLowerCase(),
    original_key: m[5],
    chords: m[6],
    is_active: m[7],
    lyrics: m[8],
  });
}
console.log('parsed rows:', rows.length);

const byId = new Map(rows.map(r => [r.id, r]));

const seenNums = [];
for (let i = 1; i <= 232; i++) {
  const variants = rows.filter(r => r.song_number === i);
  if (variants.length === 0) continue;
  const langs = [...new Set(variants.map(v => v.language))];
  seenNums.push(`#${i}: ${variants.length} [${langs.join(',')}]`);
}
console.log('seen song numbers:', seenNums.length);
console.log(seenNums.join('\n'));