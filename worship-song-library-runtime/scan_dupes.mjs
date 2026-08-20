import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/.env', 'utf8');
function kv(key) {
  const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return m ? m[1].trim() : null;
}
const supa = createClient(kv('VITE_SUPABASE_URL'), kv('SUPABASE_SERVICE_ROLE_KEY'));

const { data, error } = await supa.from('songs').select('id, song_number, title, language, chords, lyrics, updated_at');
if (error) { console.error('ERR', error); process.exit(1); }

const byContent = new Map();
for (const s of data) {
  const key = (s.lyrics || '').trim();
  if (!key || key.length < 50) continue;
  if (!byContent.has(key)) byContent.set(key, []);
  byContent.get(key).push(s);
}

let clusters = 0;
for (const [content, songs] of byContent) {
  if (songs.length < 2) continue;
  const distinctTitles = new Set(songs.map(s => s.title));
  const distinctLang = new Set(songs.map(s => s.language));
  if (distinctTitles.size > 1) {
    clusters++;
    console.log(`CLUSTER (${songs.length} songs):`);
    for (const s of songs) {
      console.log(`  id=${s.id} #${s.song_number} [${s.language}] "${s.title}" upd=${s.updated_at}`);
    }
    console.log('');
  }
}
console.log('duplicate-content clusters with different titles:', clusters);