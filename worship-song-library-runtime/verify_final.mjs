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
  const { data } = await supabase.from('songs').select('song_number,title,language,chords').range(from, from + P - 1);
  if (!data || !data.length) break;
  all = all.concat(data);
  if (data.length < P) break;
  from += P;
}
const eng = all.filter(x => (x.language || '').toLowerCase() === 'english');
let multi = 0; const bad = [];
for (const x of eng) {
  if (!x.chords) continue;
  const c = (x.chords.match(/\[chorus\]/gi) || []).length;
  if (c > 1) { multi++; bad.push(`#${x.song_number} ${x.title} (${c})`); }
}
console.log('english songs:', eng.length, '| still >1 chorus:', multi);
bad.forEach(b => console.log('  ' + b));