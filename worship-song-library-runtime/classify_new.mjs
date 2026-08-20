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

// Backup rows
const backupPath = 'D:/spiritual setlist/worship-song-library-runtime/songs_rows (2).sql';
const raw = fs.readFileSync(backupPath, 'utf8');
const rowRe = /\((\d+),\s*(\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(?:true|false),\s*((?:null|'[^']*')),\s*'((?:[^']|'')*)',\s*(?:true|false)\)/g;
const backup = new Map();
let m;
while ((m = rowRe.exec(raw)) !== null) {
  backup.set(Number(m[1]), {
    song_number: Number(m[2]),
    chords: m[6].replace(/''/g, "'"),
    lyrics: m[8].replace(/''/g, "'"),
  });
}

// Corrupt clusters: identical content + same timestamp per song_number (>=2 rows)
const byNum = new Map();
for (const r of data) {
  if (!byNum.has(r.song_number)) byNum.set(r.song_number, []);
  byNum.get(r.song_number).push(r);
}
const corruptNums = new Set();
for (const [num, rows] of byNum) {
  if (rows.length < 2) continue;
  const contentSet = new Set(rows.map(r => `${(r.chords||'').trim()}|${(r.lyrics||'').trim()}`));
  const timeSet = new Set(rows.map(r => r.updated_at));
  if (contentSet.size === 1 && timeSet.size === 1) corruptNums.add(num);
}

// The 04:30 Hindi batch ids 3135-3142 (song ~2030-2043): legit new songs or corruption?
const hindiBatch = data.filter(r => r.id >= 3135 && r.id <= 3142);
console.log('=== Hindi batch ids 3135-3142 ===');
for (const r of hindiBatch) {
  const inBackup = backup.has(r.id);
  const inCorrupt = corruptNums.has(r.song_number);
  console.log(`#${r.song_number} id=${r.id} [${r.language}] ${r.title.slice(0,50)} upd=${r.updated_at} inBackup=${inBackup} inCorruptCluster=${inCorrupt}`);
}

// Also: what about ids 3100-3134 (other new songs)?
const newIds = data.filter(r => r.id >= 3100 && r.id < 3135);
console.log(`\n=== ids 3100-3134: ${newIds.length} rows ===`);
for (const r of newIds.slice(0, 40)) {
  const inBackup = backup.has(r.id);
  console.log(`#${r.song_number} id=${r.id} [${r.language}] ${r.title.slice(0,45)} upd=${r.updated_at} inBackup=${inBackup}`);
}

// Global: rows NOT in backup at all
const notInBackup = data.filter(r => !backup.has(r.id));
console.log(`\nTotal current rows: ${data.length}, not in backup: ${notInBackup.length}`);
const byRange = {};
for (const r of notInBackup) {
  const bucket = r.id >= 3000 ? 'id>=3000' : (r.id >= 1500 ? '1500-2999' : 'id<1500');
  byRange[bucket] = (byRange[bucket] || 0) + 1;
}
console.log('Not-in-backup by id range:', JSON.stringify(byRange));
