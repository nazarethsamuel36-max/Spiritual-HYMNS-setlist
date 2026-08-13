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

let n = 0;
for (const x of eng) {
  if (!x.chords) continue;
  const lines = x.chords.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const idxs = [...l.matchAll(/"/g)].map(m => m.index);
    if (!idxs.length) continue;
    // classify each quote by neighbors
    for (const idx of idxs) {
      const before = idx > 0 ? l[idx - 1] : '^';
      const after = idx < l.length - 1 ? l[idx + 1] : '$';
      const kind = /\p{L}/u.test(before) && /\p{L}/u.test(after) ? 'INWORD'
        : /\p{L}/u.test(after) ? 'OPEN'
        : /\p{L}/u.test(before) ? 'CLOSE'
        : 'ALONE';
      n++;
      console.log(`#${x.song_number} ${x.title} [${kind}] ...${l.slice(Math.max(0, idx - 12), idx + 13).trim()}...`);
    }
  }
}
console.log('total dquotes:', n);