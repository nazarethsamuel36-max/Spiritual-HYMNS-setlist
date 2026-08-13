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

// categorize each line containing a quote
let dblPair = 0, single = 0;
const singleSamples = [];
for (const x of eng) {
  if (!x.chords) continue;
  const lines = x.chords.split(/\r?\n/);
  for (const l of lines) {
    // standalone single quotes (not part of a '' pair)
    const singles = [...l.matchAll(/(^|[^'])'(?!')/g)];
    if (singles.length) {
      single += singles.length;
      if (singleSamples.length < 40) {
        for (const m of singles) {
          singleSamples.push('#' + x.song_number + ' ' + x.title + ': ...' + l.slice(Math.max(0, m.index - 14), m.index + 16).trim() + '...');
        }
      }
    }
    const pairs = (l.match(/''/g) || []);
    dblPair += pairs.length;
  }
}
console.log('== English ==');
console.log("'' pair occurrences:", dblPair);
console.log("standalone ' occurrences:", single);
console.log('\nStandalone single-quote samples (context):');
for (const s of singleSamples.slice(0, 40)) console.log(' ', s);