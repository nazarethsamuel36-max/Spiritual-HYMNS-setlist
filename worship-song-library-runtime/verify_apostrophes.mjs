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

// 1) any remaining letter-adjacent '' pairs (should be 0)
let remainingApost = 0;
// 2) valid " quotes still present (should be 90)
let quotes = 0;
// 3) in-word " still present (should be 0)
let inword = 0;
// 4) remaining '' quote-delimiters (should be 4)
let quoteDelims = [];
for (const x of all) {
  if (!x.chords) continue;
  const t = x.chords;
  for (const m of t.matchAll(/''/g)) {
    const i = m.index;
    const b = i > 0 ? t[i - 1] : '';
    const a = i < t.length - 2 ? t[i + 2] : '';
    if (/\p{L}/u.test(b) || /\p{L}/u.test(a)) remainingApost++;
    else quoteDelims.push('#' + x.song_number + ' [' + x.language + '] ' + x.title + ': ' + t.slice(Math.max(0, i - 15), i + 18).replace(/\n/g, ' ').trim());
  }
  quotes += (t.match(/"/g) || []).length;
  inword += (t.match(/\p{L}"\p{L}/u) || []).length;
}
console.log('remaining letter-adjacent \'\' :', remainingApost);
console.log('valid " quotes:', quotes);
console.log('in-word " :', inword);
console.log('\'\' quote-delimiters left (' + quoteDelims.length + '):');
for (const s of quoteDelims) console.log('  ' + s);