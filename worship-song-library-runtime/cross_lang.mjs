import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/.env', 'utf8');
function kv(k) {
  const mm = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return mm ? mm[1].trim() : null;
}
const supa = createClient(kv('VITE_SUPABASE_URL'), kv('SUPABASE_SERVICE_ROLE_KEY'));
const { data, error } = await supa.from('songs').select('id, song_number, title, language, chords, lyrics, updated_at').order('song_number');
if (error) { console.error('ERR', error); process.exit(1); }

// Devanagari script check (Hindi/Marathi/Konkani all use it); Latin for English
const DEVANAGARI_LIKE = /[\u0900-\u097F]/;
function contentLanguage(row) {
  const text = ((row.chords || '') + ' ' + (row.lyrics || '')).replace(/\[[^\]]*\]/g, ''); // strip section markers
  let dev = (text.match(DEVANAGARI_LIKE) || []).length;
  let latin = (text.match(/[a-zA-Z]/g) || []).length;
  if (dev === 0 && latin === 0) return 'empty';
  return dev > latin ? 'devanagari' : 'latin';
}
const isDevanagariLang = (lang) => /hindi|marathi|konkani/i.test(lang);
const isLatinLang = (lang) => /^english-?/i.test(lang);

// Group by song_number
const byNum = new Map();
for (const r of data) {
  if (!byNum.has(r.song_number)) byNum.set(r.song_number, []);
  byNum.get(r.song_number).push(r);
}

// Detect rows whose content language doesn't match their declared language
const mismatches = [];
const corruptClusters = [];
for (const [num, rows] of byNum) {
  if (rows.length < 2) continue;
  // all content identical?
  const contentSet = new Set(rows.map(r => `${(r.chords||'').trim()}|||${(r.lyrics||'').trim()}`));
  const allIdentical = contentSet.size === 1;
  if (allIdentical) {
    const contentLang = contentLanguage(rows[0]);
    const wrong = rows.filter(r => (isDevanagariLang(r.language) && contentLang === 'latin') || (isLatinLang(r.language) && contentLang === 'devanagari'));
    corruptClusters.push({ num, rows: rows.length, wrong });
  }
  // Also per-row mismatch regardless of clustering
  for (const r of rows) {
    const cl = contentLanguage(r);
    const mismatch = (isLatinLang(r.language) && cl === 'devanagari') || (isDevanagariLang(r.language) && cl === 'latin');
    if (mismatch) mismatches.push(r);
  }
}

console.log(`=== Corrupted cross-language cases ===`);
console.log(`Rows whose content script does NOT match declared language: ${mismatches.length}`);
const byNumMismatch = new Map();
for (const r of mismatches) {
  if (!byNumMismatch.has(r.song_number)) byNumMismatch.set(r.song_number, []);
  byNumMismatch.get(r.song_number).push(r);
}
console.log(`Distinct song_numbers affected: ${byNumMismatch.size}`);

// Summarize by language of the row
const rowLang = {};
for (const r of mismatches) rowLang[r.language] = (rowLang[r.language] || 0) + 1;
console.log('Mismatching rows by declared language:', JSON.stringify(rowLang));

// Show a sample breakdown
console.log('\n=== Sample (first 30) ===');
let shown = 0;
for (const [num, rows] of byNumMismatch) {
  if (shown >= 30) break;
  const contentLangs = [...new Set(rows.map(r => contentLanguage(r)))];
  console.log(`#${num}: ${rows.length} row(s)`);
  for (const r of rows) {
    const cl = contentLanguage(r);
    const text = (r.lyrics || r.chords || '').slice(0, 60).replace(/\n/g, ' ');
    const ok = (isLatinLang(r.language) && cl === 'latin') || (isDevanagariLang(r.language) && cl === 'devanagari');
    console.log(`   id=${r.id} [${r.language}] "${r.title.slice(0, 38)}" content=${cl} ${ok ? 'OK' : '*** MISMATCH ***'} upd=${r.updated_at.slice(0,19)}`);
  }
  shown++;
}

// How many of the identical-clusters are fully corrupted (all rows wrong)
let fullWrong = 0, partialWrong = 0;
for (const c of corruptClusters) {
  if (c.wrong.length === c.rows) fullWrong++;
  else if (c.wrong.length > 0) partialWrong++;
}
console.log(`\nIdentical-content clusters: ${corruptClusters.length}`);
console.log(`  fully wrong (every variant content-mismatched): ${fullWrong}`);
console.log(`  partially wrong: ${partialWrong}`);

fs.writeFileSync('D:/spiritual setlist/worship-song-library-runtime/cross_lang_cases.json', JSON.stringify(mismatches.map(r => ({ id: r.id, song_number: r.song_number, language: r.language, title: r.title })), null, 1));