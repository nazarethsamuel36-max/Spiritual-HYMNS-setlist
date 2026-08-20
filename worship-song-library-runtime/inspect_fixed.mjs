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
    chords: m[6].replace(/''/g, "'"),
    lyrics: m[8].replace(/''/g, "'"),
  });
}

const target = ['141','149','122','95','147','46'];
for (const num of target) {
  const n = Number(num);
  const rows = data.filter(r => r.song_number === n);
  console.log(`\n===== #${num} (${rows.length} rows) =====`);
  for (const r of rows) {
    const b = backup.get(r.id);
    const curL = (r.lyrics||'').trim();
    const bakL = (b?.lyrics||'').trim();
    const curC = (r.chords||'').trim();
    const bakC = (b?.chords||'').trim();
    console.log(`\n--- id=${r.id} [${r.language}] ${r.title} upd=${r.updated_at}`);
    console.log(`  CUR chords[${curC.length}]: ${JSON.stringify(curC.slice(0, 300))}`);
    console.log(`  BAK chords[${bakC.length}]: ${JSON.stringify(bakC.slice(0, 300))}`);
    console.log(`  CUR lyrics[${curL.length}]: ${JSON.stringify(curL.slice(0, 300))}`);
    console.log(`  BAK lyrics[${bakL.length}]: ${JSON.stringify(bakL.slice(0, 300))}`);
  }
}