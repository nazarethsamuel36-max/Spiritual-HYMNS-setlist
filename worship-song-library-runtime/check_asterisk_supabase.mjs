import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // inspect a couple known rows
  const { data: sample, error } = await supabase.from('songs').select('id, song_number, title, chords, lyrics').in('song_number', [259, 871]).maybeSingle();
  const { data: many } = await supabase.from('songs').select('id, song_number, title').order('song_number', { ascending: true }).range(0, 3);
  console.log('sample 259/871:', JSON.stringify(sample ? { id: sample.id, num: sample.song_number, chordsLen: (sample.chords||'').length, lyricsLen: (sample.lyrics||'').length, chordsHead: (sample.chords||'').slice(0,120) } : sample, null, 1));
  console.log('first rows by song_number:', many);

  // scan all rows for asterisk in chords OR lyrics
  let all = [];
  let from = 0; const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase.from('songs').select('id, song_number, title, language, chords, lyrics').range(from, from + PAGE - 1);
    if (error) { console.error('ERR', error.message); break; }
    if (!data || !data.length) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  console.log('total', all.length);
  const inChords = all.filter(s => s.chords && s.chords.includes('*'));
  const inLyrics = all.filter(s => s.lyrics && s.lyrics.includes('*'));
  console.log('asterisk in chords:', inChords.length);
  console.log('asterisk in lyrics:', inLyrics.length);
  console.log('\n-- in lyrics but not chords --');
  for (const s of inLyrics.filter(s => !(s.chords||'').includes('*'))) console.log(`  #${s.song_number} | ${s.title} | ${s.language}`);
  console.log('\n-- in chords --');
  for (const s of inChords) console.log(`  #${s.song_number} | ${s.title} | ${s.language} | ast=${(s.chords.match(/\*/g)||[]).length}`);
}
run().catch(console.error);