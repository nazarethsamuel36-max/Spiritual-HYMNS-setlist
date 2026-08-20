import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const content = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/songs_rows (1)_backup.sql', 'utf8');

const rows = [];
const re = /\((\d+),\s*(\d+),\s*'(?:[^']|'')*?',\s*'[^']*',\s*'[^']*',\s*'(.*?)',\s*(?:true|false),\s*(?:null|'[^']*'),\s*'(.*?)',\s*(?:true|false)\)/gs;
let m;
while ((m = re.exec(content)) !== null) {
  rows.push({ id: parseInt(m[1]), song_number: parseInt(m[2]), chords: m[6], lyrics: m[7] });
}
const byId = new Map(rows.map(r => [r.id, r]));
console.log('backup parsed:', rows.length, 'ids');

const env = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/.env', 'utf8');
function kv(key) {
  const mm = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return mm ? mm[1].trim() : null;
}
const supa = createClient(kv('VITE_SUPABASE_URL'), kv('SUPABASE_SERVICE_ROLE_KEY'));
const { data, error } = await supa.from('songs').select('id, song_number, title, language, chords, lyrics, updated_at');
if (error) { console.error('ERR', error); process.exit(1); }

// Group current by lyrics content to find clusters
const byContent = new Map();
for (const s of data) {
  const key = (s.lyrics || '').trim();
  if (!key || key.length < 50) continue;
  if (!byContent.has(key)) byContent.set(key, []);
  byContent.get(key).push(s);
}

let corruptedRows = 0;
let restorable = 0;
let notInBackup = 0;
let backupMatchesCurrent = 0;
const examples = [];

for (const [content, songs] of byContent) {
  if (songs.length < 2) continue;
  const distinctTitles = new Set(songs.map(s => s.title));
  if (distinctTitles.size < 2) continue; // legit duplicate (same title multiple langs? keep anyway)
  const langs = [...new Set(songs.map(s => s.language))];
  // Among these, the "winner" is the row whose language matches the content script detection is hard.
  // For each row, check backup:
  for (const s of songs) {
    corruptedRows++;
    const b = byId.get(s.id);
    if (!b) { notInBackup++; continue; }
    const curL = (s.lyrics || '').trim();
    const curC = (s.chords || '').trim();
    const bakL = (b.lyrics || '').trim();
    const bakC = (b.chords || '').trim();
    if (curL === bakL && curC === bakC) { backupMatchesCurrent++; continue; }
    restorable++;
    if (examples.length < 15) {
      examples.push(`id=${s.id} #${s.song_number} [${s.language}] "${s.title}" upd=${s.updated_at}`);
    }
  }
}
console.log('corrupted cluster rows:', corruptedRows);
console.log('rows whose backup content DIFFERS (restorable):', restorable);
console.log('rows matching backup already:', backupMatchesCurrent);
console.log('rows NOT in backup:', notInBackup);
console.log('\nexamples of restorable:');
for (const e of examples) console.log(' ', e);