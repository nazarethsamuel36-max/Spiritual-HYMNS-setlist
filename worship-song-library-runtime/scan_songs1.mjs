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

// Show #1 and #2 and #3 content
for (const num of [1, 2, 3, 4]) {
  const songs = data.filter(s => s.song_number === num);
  console.log(`=== song #${num} (${songs.length} rows) ===`);
  for (const s of songs) {
    console.log(`--- id=${s.id} [${s.language}] "${s.title}" upd=${s.updated_at}`);
    console.log('lyrics:', JSON.stringify((s.lyrics||'').slice(0, 300)));
    console.log('chords:', JSON.stringify((s.chords||'').slice(0, 300)));
  }
  console.log('');
}