// Script to normalize Search_1.0.json entries
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeText(text) {
  if (!text) return '';
  // Convert to lowercase
  let normalized = text.toLowerCase();
  // Fix corrupted apostrophes first
  normalized = normalized.replace(/[â€™""''`]/g, "'");
  // Keep Devanagari characters (Hindi/Marathi) - range U+0900 to U+097F
  // Keep Latin letters, numbers, spaces, and hyphens
  normalized = normalized.replace(/[^\u0900-\u097Fa-z0-9\s\-]/g, '');
  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, ' ').trim();
  return normalized;
}

// Read Search_1.0.json
const inputPath = path.join(__dirname, 'src/Search_1.0.json');
const searchDocuments = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

console.log(`Processing ${searchDocuments.length} songs...`);

// Normalize each entry
for (const doc of searchDocuments) {
  doc.title = normalizeText(doc.title);
  doc.transliteratedTitle = normalizeText(doc.transliteratedTitle);
}

// Write back to file
fs.writeFileSync(inputPath, JSON.stringify(searchDocuments, null, 2));

console.log(`✅ Normalized ${searchDocuments.length} songs`);
console.log(`📁 Output: ${inputPath}`);

// Show some examples
console.log('\nSample normalized entries:');
for (let i = 0; i < Math.min(5, searchDocuments.length); i++) {
  const doc = searchDocuments[i];
  console.log(`  Song #${doc.songNumber}: "${doc.title}" (${doc.language})`);
}
