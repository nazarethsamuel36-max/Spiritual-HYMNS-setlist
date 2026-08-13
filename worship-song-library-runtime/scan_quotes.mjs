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

const quoteChars = ['"', '\u201C', '\u201D', '\u2018', '\u2019', "'", "''"];
const counts = {};
for (const c of quoteChars) counts[c] = 0;
const samples = {};

for (const x of eng) {
  if (!x.chords) continue;
  for (const c of quoteChars) {
    const m = (x.chords.match(new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []);
    if (m.length) {
      counts[c] += m.length;
      if (!samples[c]) {
        const idx = x.chords.indexOf(c);
        const start = Math.max(0, idx - 15);
        samples[c] = { num: x.song_number, title: x.title, ctx: x.chords.slice(start, idx + 20).replace(/\n/g, ' | ') };
      }
    }
  }
}
for (const c of quoteChars) {
  console.log(JSON.stringify(c), '=', counts[c], samples[c] ? 'sample: ' + JSON.stringify(samples[c]) : '');
}