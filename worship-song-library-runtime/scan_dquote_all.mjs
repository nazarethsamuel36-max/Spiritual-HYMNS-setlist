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
const re = /\p{L}"\p{L}/u;
let n = 0;
for (const x of all) {
  if (!x.chords) continue;
  const lines = x.chords.split(/\r?\n/);
  for (const l of lines) {
    const m = l.match(re);
    if (m) { n++; console.log('#' + x.song_number + ' [' + x.language + '] ' + x.title + ': ' + l.trim()); }
  }
}
console.log('ALL-language in-word dquotes:', n);