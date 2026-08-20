import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/.env', 'utf8');
function kv(key) {
  const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return m ? m[1].trim() : null;
}
const supa = createClient(kv('VITE_SUPABASE_URL'), kv('SUPABASE_SERVICE_ROLE_KEY'));

const { data, error } = await supa.from('songs').select('id, song_number, title, language, lyrics');
if (error) { console.error('ERR', error); process.exit(1); }
console.log('total rows:', data.length);

let suspicious = 0;
const singles = [];
for (const s of data) {
  const l = s.lyrics || '';
  // Songs whose lyrics are suspiciously short OR contain stray stray `[ ]`
  if (/\[[^\]]*\]/.test(l) && /\[\s*\]/.test(l)) {
    singles.push(`#${s.song_number} [${s.language}] "${s.title}" id=${s.id}`);
    suspicious++;
  }
}
console.log('\n--- songs containing EMPTY bracket "[ ]" ---');
for (const line of singles) console.log(line);
console.log('count:', singles.length);