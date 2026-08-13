import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

let all = [], from = 0; const P = 1000;
while (true) {
  const { data } = await supabase.from('songs').select('id,song_number,title,language,chords').range(from, from + P - 1);
  if (!data || !data.length) break;
  all = all.concat(data);
  if (data.length < P) break;
  from += P;
}
const eng = all.filter(x => (x.language || '').toLowerCase() === 'english');

// classify each '' occurrence: is it between letters, or acting as standalone quote pair?
let n = 0, betweenLetters = 0, wordStart = 0, wordEnd = 0, other = 0;
const wordStartSamples = [], wordEndSamples = [], otherSamples = [];
for (const x of eng) {
  if (!x.chords) continue;
  const lines = x.chords.split(/\r?\n/);
  for (const l of lines) {
    let idx = l.indexOf("''");
    while (idx !== -1) {
      n++;
      const before = idx > 0 ? l[idx - 1] : '^';
      const after = idx < l.length - 2 ? l[idx + 2] : '$';
      const bL = /\p{L}/u.test(before), aL = /\p{L}/u.test(after);
      const ctx = l.slice(Math.max(0, idx - 8), Math.min(l.length, idx + 10)).trim();
      if (bL && aL) betweenLetters++;
      else if (!bL && aL) { wordStart++; if (wordStartSamples.length < 8) wordStartSamples.push('#' + x.song_number + ': ' + ctx); }
      else if (bL && !aL) { wordEnd++; if (wordEndSamples.length < 8) wordEndSamples.push('#' + x.song_number + ': ' + ctx); }
      else { other++; if (otherSamples.length < 8) otherSamples.push('#' + x.song_number + ': ' + ctx); }
      idx = l.indexOf("''", idx + 2);
    }
  }
}
console.log("'' total:", n, '| between-letters:', betweenLetters, '| word-start:', wordStart, '| word-end:', wordEnd, '| other:', other);
console.log('\nword-start samples (possible quote open):');
for (const s of wordStartSamples) console.log('  ' + s);
console.log('\nword-end samples (possible quote close):');
for (const s of wordEndSamples) console.log('  ' + s);
console.log('\nother samples:');
for (const s of otherSamples) console.log('  ' + s);