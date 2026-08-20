import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/.env', 'utf8');
function kv(key) {
  const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return m ? m[1].trim() : null;
}
const supa = createClient(kv('VITE_SUPABASE_URL'), kv('SUPABASE_SERVICE_ROLE_KEY'));

const { data, error } = await supa.from('songs').select('id, song_number, title, language, chords, lyrics, updated_at').order('updated_at', { ascending: false }).limit(400);
if (error) { console.error('ERR', error); process.exit(1); }

console.log('MOST RECENT 100 UPDATES:');
for (const s of data.slice(0, 100)) {
  console.log(`${s.updated_at}  id=${s.id} #${s.song_number} [${s.language}] ${s.title}`);
}
console.log('\nOLDEST 40 OF THIS SAMPLE (updated_at <= ?):');
for (const s of data.slice(-40)) {
  console.log(`${s.updated_at}  id=${s.id} #${s.song_number} [${s.language}] ${s.title}`);
}