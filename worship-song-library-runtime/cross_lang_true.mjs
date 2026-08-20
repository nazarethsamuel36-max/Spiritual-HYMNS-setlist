import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/.env', 'utf8');
function kv(k) {
  const mm = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return mm ? mm[1].trim() : null;
}
const supa = createClient(kv('VITE_SUPABASE_URL'), kv('SUPABASE_SERVICE_ROLE_KEY'));
const { data, error } = await supa.from('songs').select('id, song_number, title, language, chords, lyrics, updated_at, original_key').order('song_number');
if (error) { console.error('ERR', error); process.exit(1); }

// Parse backup properly (from correct_diff which was verified)
const backupPath = 'D:/spiritual setlist/worship-song-library-runtime/songs_rows (2).sql';
const raw = fs.readFileSync(backupPath, 'utf8');
const rowRe = /\((\d+),\s*(\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(?:true|false),\s*((?:null|'[^']*')),\s*'((?:[^']|'')*)',\s*(?:true|false)\)/g;
const backup = new Map();
let m;
while ((m = rowRe.exec(raw)) !== null) {
  backup.set(Number(m[1]), {
    song_number: Number(m[2]),
    title: m[3].replace(/''/g, "'"),
    language: m[4].replace(/''/g, "'"),
    original_key: m[5].replace(/''/g, "'"),
    chords: m[6].replace(/''/g, "'"),
    lyrics: m[8].replace(/''/g, "'"),
  });
}

const DEVANAGARI_LIKE = /[\u0900-\u097F]/;
function scriptOf(row) {
  const text = ((row.chords || '') + ' ' + (row.lyrics || '')).replace(/\[[^\]]*\]/g, '');
  const dev = (text.match(DEVANAGARI_LIKE) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  if (dev === 0 && latin === 0) return 'empty';
  return dev > latin ? 'devanagari' : 'latin';
}
const isLatinLang = (lang) => /^english-?/i.test(lang);
const isDevanagariLang = (lang) => /hindi|marathi|konkani/i.test(lang);

// For each current row whose script mismatches its declared language,
// check whether the BACKUP had the same script in that slot.
// - If backup ALSO latin-in-hindi-slot -> legitimate transliteration (NOT corruption)
// - If backup had devanagari but now latin (or vice versa) -> corruption
let corrupt = 0, legitTranslit = 0, noBackup = [];
const corruptList = [];
for (const r of data) {
  const b = backup.get(r.id);
  if (!b) { noBackup.push(r); continue; }
  const curScript = scriptOf(r);
  const bakScript = scriptOf(b);
  const curOk = (isLatinLang(r.language) && curScript === 'latin') || (isDevanagariLang(r.language) && curScript === 'devanagari');
  const bakOk = (isLatinLang(b.language) && bakScript === 'latin') || (isDevanagariLang(b.language) && bakScript === 'devanagari');
  if (curOk) continue; // current content fine
  if (!bakOk) { legitTranslit++; continue; } // even in backup content didn't match -> legitimately transcribed
  // backup was fine, current is not -> CORRUPTED
  corrupt++;
  corruptList.push({ ...r, curScript, bakScript });
}

console.log(`=== True cross-language corruption (backup had correct language content, now replaced) ===`);
console.log(`Corrupt rows: ${corrupt}`);
console.log(`Legitimately-transcribed rows (also latin/devanagari in backup, NOT corruption): ${legitTranslit}`);
console.log(`Rows with no backup entry: ${noBackup.length}`);

const byNum = new Map();
for (const r of corruptList) {
  if (!byNum.has(r.song_number)) byNum.set(r.song_number, []);
  byNum.get(r.song_number).push(r);
}
console.log(`Distinct song_numbers: ${byNum.size}`);

// language breakdown of the CORRUPT rows (by declared language tag)
const langB = {};
for (const r of corruptList) langB[r.language] = (langB[r.language] || 0) + 1;
console.log('By declared language:', JSON.stringify(langB));

// of these, how many english-rows now contain devanagari (English title + marathi/hindi lyrics) vs hindi rows containing english
const engRowDev = corruptList.filter(r => isLatinLang(r.language) && scriptOf(r) === 'devanagari');
const devRowLatin = corruptList.filter(r => isDevanagariLang(r.language) && scriptOf(r) === 'latin');
console.log(`English-named songs now holding Devanagari (marathi/hindi) content: ${engRowDev.length}`);
console.log(`Hindi/Marathi named songs now holding English content: ${devRowLatin.length}`);

// Which language provides most of the winning (last-written) content?
// For each corrupt row, what language is the current content actually in?
const contentLangs = {};
for (const r of corruptList) {
  const lang = scriptOf(r) === 'devanagari' ? 'devanagari(marathi/hindi)' : 'latin(english)';
  contentLangs[lang] = (contentLangs[lang] || 0) + 1;
}
console.log('Current overriding content by language:', JSON.stringify(contentLangs));

// Full list to file
fs.writeFileSync('D:/spiritual setlist/worship-song-library-runtime/cross_lang_true.json', JSON.stringify({ corrupt, rows: corruptList.map(r => ({ id: r.id, song_number: r.song_number, language: r.language, title: r.title, curScript: r.curScript, bakScript: r.bakScript, updated_at: r.updated_at })) }, null, 1));
console.log('\nSample:');
for (const r of corruptList.slice(0, 20)) {
  console.log(`#${r.song_number} id=${r.id} [${r.language}] "${r.title.slice(0,40)}" now=${r.curScript} backup=${r.bakScript}`);
}