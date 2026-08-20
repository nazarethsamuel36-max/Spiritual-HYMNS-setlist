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

const SECTION = /^\[(Chorus|CHORUS|Verse|VERSE|V1|V2|Verse 1|Verse 2|Intro|refrão|Verse 3|Verse 4|Bridge|Chorus 1|Chorus 2)[\s\d-]*\]\s*$/i;
const BARE = /^\[(C|C#|Db|D|D#|Eb|E|F|F#|Gb|G|G#|Ab|A|A#|Bb|B)(m|maj|sus|dim|aug|7|6|9|11|13)?(\/[A-G][#b]?)?\]\s*$/i;

let flagged = [];
for (const s of data) {
  const c = (s.chords || '').trim();
  if (!c) continue;
  const firstLine = c.split('\n')[0].trim();
  const firstTwoLines = c.split('\n').slice(0, 2).map(l => l.trim());
  const secondLine = firstTwoLines[1] || '';

  // Palette corruption: chords begins with a BARE chord line (no section label, no lyric on that line)
  if (BARE.test(firstLine)) {
    flagged.push({ s, reason: 'BARE_CHORD_FIRST_LINE', snippet: c.slice(0, 120) });
  }
}
console.log('bare-chord-first-line count:', flagged.length);
for (const f of flagged.slice(0, 60)) {
  console.log(`id=${f.s.id} #${f.s.song_number} [${f.s.language}] "${f.s.title}" upd=${f.s.updated_at}`);
  console.log(`   ${f.snippet.replace(/\n/g, '\\n')}`);
}