import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/.env', 'utf8');
function kv(key) {
  const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return m ? m[1].trim() : null;
}
const supa = createClient(kv('VITE_SUPABASE_URL'), kv('SUPABASE_SERVICE_ROLE_KEY'));

const { data, error } = await supa.from('songs').select('id, song_number, title, language, chords');
if (error) { console.error('ERR', error); process.exit(1); }

// Palette-corruption signature: chords starts with a bare chord marker like
// [C] [G] [Em] [Am] right at position 0 (no section label), OR a short chord
// inserted before the real content.
const chordBracket = /^\[(C|C#|Db|D|D#|Eb|E|F|F#|Gb|G|G#|Ab|A|A#|Bb|B)[a-zA-Z0-9#/majsusdim7]*\]/;

let found = 0;
for (const s of data) {
  const c = (s.chords || '').trimStart();
  if (!c) continue;
  const m = c.match(chordBracket);
  if (m) {
    // Legit ChordPro files often start with a chord on a line then the lyric.
    // But a palette insert happens when the song began with lyrics text and a
    // chord got prepended. Flag anything that starts with a bare chord where
    // the FIRST line is ONLY a chord (single short line).
    const firstLine = c.split('\n')[0].trim();
    const secondLine = (c.split('\n')[1] || '').trim();
    if (firstLine === m[0] && secondLine) {
      console.log(`id=${s.id} #${s.song_number} [${s.language}] "${s.title}"`);
      console.log(`  START: ${c.slice(0, 160).replace(/\n/g, '\\n')}`);
      found++;
    }
  }
}
console.log('\ncorruption-signature count:', found);