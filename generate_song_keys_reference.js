const fs = require('fs');
const path = require('path');

function normalizeImportedText(value) {
  if (!value) return '';
  return String(value)
    .replace(/aÌ‚â‚¬â„¢/g, "'")
    .replace(/aÌ‚â‚¬Å“/g, '"')
    .replace(/aÌ‚â‚¬Â/g, '"')
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€/g, "'")
    .replace(/â€/g, "'")
    .replace(/â€/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€”/g, '-')
    .replace(/â€“/g, '-')
    .replace(/â€"/g, '-')
    .replace(/â€–/g, '-')
    .replace(/â€¦/g, '...')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function formatKey(key) {
  if (!key) return 'Nil';
  const cleaned = normalizeImportedText(key).replace(/[\s\*\-\_]+/g, '').trim();
  if (!cleaned || cleaned === '**' || cleaned === '*' || cleaned.startsWith('**')) {
    return 'Nil';
  }
  return cleaned;
}

function normalizeLanguage(lang) {
  switch ((lang || '').toLowerCase()) {
    case 'english': return 'English';
    case 'hindi': return 'Hindi';
    case 'marathi': return 'Marathi';
    default: return (lang || '').trim() || 'Other';
  }
}

const root = path.resolve(__dirname);
const payload = JSON.parse(fs.readFileSync(path.join(root, 'exports', 'index.json'), 'utf8'));
const songs = payload.songs || [];
const rows = [];

for (const [index, song] of songs.entries()) {
  const songId = song.id;
  let keyValue = 'Nil';
  const songPath = path.join(root, 'exports', 'songs', `${songId}.json`);
  if (fs.existsSync(songPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(songPath, 'utf8'));
      keyValue = formatKey(data.originalKey);
    } catch (error) {
      keyValue = 'Nil';
    }
  }

  rows.push({
    no: index + 1,
    language: normalizeLanguage(song.language),
    title: normalizeImportedText(song.title),
    key: keyValue,
  });
}

const lines = [
  '# Song Keys Reference',
  '',
  '| No. | Language | Song Title | Current Key |',
  '| --- | --- | --- | --- |',
  ...rows.map((row) => `| ${row.no} | ${row.language} | ${row.title.replace(/\|/g, '\\|')} | ${row.key} |`),
];

const outPath = path.join(root, 'Song Keys Reference.md');
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log(`Wrote ${rows.length} rows to ${outPath}`);
console.log(`First: ${JSON.stringify(rows[0])}`);
console.log(`Last: ${JSON.stringify(rows[rows.length - 1])}`);
