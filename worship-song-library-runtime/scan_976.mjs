import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/.env', 'utf8');
function kv(key) {
  const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return m ? m[1].trim() : null;
}
const supa = createClient(kv('VITE_SUPABASE_URL'), kv('SUPABASE_SERVICE_ROLE_KEY'));

for (const id of [976, 1076]) {
  const { data, error } = await supa.from('songs').select('*').eq('id', id).single();
  if (error) { console.error('ERR', error); continue; }
  console.log(`==== id=${data.id} #${data.song_number} [${data.language}] "${data.title}" updated=${data.updated_at} ====`);
  console.log('--- chords (full) ---');
  console.log(data.chords || '(null)');
  console.log('--- lyrics (full) ---');
  console.log(data.lyrics || '(null)');
  console.log('\n');
}