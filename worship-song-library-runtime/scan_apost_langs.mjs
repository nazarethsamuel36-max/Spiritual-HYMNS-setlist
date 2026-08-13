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
const byLang = {};
for (const x of all) {
  if (!x.chords) continue;
  const lang = (x.language || '?').toLowerCase();
  byLang[lang] ||= { songs: 0, apost: 0, quotes: 0 };
  byLang[lang].songs++;
  const apost = [...x.chords.matchAll(/''/g)].filter(m => {
    const i = m.index;
    const b = i > 0 ? x.chords[i - 1] : '';
    const a = i < x.chords.length - 2 ? x.chords[i + 2] : '';
    return /\p{L}/u.test(b) || /\p{L}/u.test(a);
  }).length;
  byLang[lang].apost += apost;
  byLang[lang].quotes += (x.chords.match(/"/g) || []).length;
}
for (const l of Object.keys(byLang).sort()) {
  console.log(l.padEnd(4), 'songs=' + byLang[l].songs, 'apostrophePairs=' + byLang[l].apost, 'validQuotes=' + byLang[l].quotes);
}