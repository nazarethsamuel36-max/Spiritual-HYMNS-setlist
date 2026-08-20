import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const content = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/songs_rows (1)_backup.sql', 'utf8');
const rows = new Map();
const re = /\((\d+),\s*(\d+),\s*'(?:[^']|'')*?',\s*'[^']*',\s*'[^']*',\s*'(.*?)',\s*(?:true|false),\s*(?:null|'[^']*'),\s*'(.*?)',\s*(?:true|false)\)/gs;
let m;
while ((m = re.exec(content)) !== null) {
  rows.set(parseInt(m[1]), { song_number: parseInt(m[2]), chords: m[6], lyrics: m[7] });
}

const env = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/.env', 'utf8');
function kv(k) {
  const mm = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return mm ? mm[1].trim() : null;
}
const supa = createClient(kv('VITE_SUPABASE_URL'), kv('SUPABASE_SERVICE_ROLE_KEY'));
const { data, error } = await supa.from('songs').select('id, song_number, title, language, chords, lyrics, updated_at');
if (error) { console.error('ERR', error); process.exit(1); }

// Song numbers the Aug-13 fix scripts touched (from DONE list + others)
const fixedNums = new Set(['141','149','122','95','147','160','133','143','154','159','291','117','155','140','128','150','97','258','259','366','154','17','46','96','1005','1019']);
const fixedRows = data.filter(s => fixedNums.has(String(s.song_number)));

console.log('Rows whose song_number was in Aug-13 fix set (and exist in backup):');
for (const s of fixedRows) {
  const b = rows.get(s.id);
  if (!b) continue;
  const curC = (s.chords||'').trim();
  const bakC = (b.chords||'').trim();
  const markerDiff = curC.includes('[Verse') !== bakC.includes('[Verse') || curC.includes('[Chorus]') !== bakC.includes('[Chorus]');
  console.log(`id=${s.id} #${s.song_number} [${s.language}] ${s.title} | backupHasVerse=${bakC.includes('[Verse')} curHasVerse=${curC.includes('[Verse')} backupHasChorus=${bakC.includes('[Chorus]')} curHasChorus=${curC.includes('[Chorus]')} | backupChordsLen=${bakC.length} curChordsLen=${curC.length} | contentSame=${curC===bakC}`);
}