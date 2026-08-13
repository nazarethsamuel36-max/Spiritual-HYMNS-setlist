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
const re = /\p{L}"\p{L}/u;
const hits = [];
for (const x of eng) {
  if (!x.chords) continue;
  const lines = x.chords.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) {
      const c = (lines[i].match(re) || []).length;
      hits.push({ num: x.song_number, title: x.title, line: lines[i], count: c });
    }
  }
}
console.log('songs with in-word dquote:', new Set(hits.map(h => h.num)).size);
for (const h of hits) console.log('#' + h.num + ' ' + h.title + ': ' + h.line.trim());