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

const fixedNums = new Set(['141','149','122','95','147','160','133','143','154','159','291','117','155','140','128','150','97','258','259','366','154','17','46','96','1005','1019']);
for (const num of ['258','259','366']) {
  const rows = data.filter(s => s.song_number === Number(num));
  if (!rows.length) continue;
  const sameContent = new Set(rows.map(r => (r.chords||'').trim().slice(0,200))).size === 1;
  console.log(`#${num} (${rows.length} rows): all-identical-chords=${sameContent}`);
  for (const r of rows) {
    console.log(`  id=${r.id} [${r.language}] ${r.title} upd=${r.updated_at} chordsLen=${(r.chords||'').length}`);
  }
}