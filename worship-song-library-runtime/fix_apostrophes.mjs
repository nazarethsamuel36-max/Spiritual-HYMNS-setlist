import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const OUT = 'C:/Users/Lenovo/AppData/Local/Temp/opencode/';

// convert '' -> ' ONLY when adjacent to a letter (contraction / elision / s-possessive).
// Leave '' quote-delimiters (surrounded by space/punct) and all " quotes untouched.
function fixApostrophes(text) {
  let i = 0, out = '', fixed = 0;
  while (i < text.length) {
    if (text[i] === "'" && text[i + 1] === "'") {
      const before = i > 0 ? text[i - 1] : '';
      const after = i < text.length - 2 ? text[i + 2] : '';
      if (/\p{L}/u.test(before) || /\p{L}/u.test(after)) {
        out += "'";
        fixed++;
        i += 2;
        continue;
      }
      out += "''";
      i += 2;
      continue;
    }
    out += text[i];
    i++;
  }
  return { out, fixed };
}

let all = [], from = 0; const P = 1000;
while (true) {
  const { data } = await supabase.from('songs').select('id,song_number,title,language,chords').range(from, from + P - 1);
  if (!data || !data.length) break;
  all = all.concat(data);
  if (data.length < P) break;
  from += P;
}

const results = [];
let totalFixed = 0;
for (const x of all) {
  if (!x.chords) continue;
  const { out, fixed } = fixApostrophes(x.chords);
  if (fixed === 0) continue;
  totalFixed += fixed;
  const { error } = await supabase.from('songs').update({ chords: out }).eq('id', x.id);
  results.push({ num: x.song_number, title: x.title, lang: x.language, fixed, ok: !error, err: error?.message });
  console.log(`#${x.song_number} [${x.language}] ${x.title} — fixed ${fixed} → ${error ? 'FAIL ' + error.message : 'OK'}`);
}
fs.writeFileSync(OUT + 'apostrophe_fix_results.json', JSON.stringify(results, null, 1));
console.log('\ntotal apostrophes fixed:', totalFixed, '| songs touched:', results.length, '| failures:', results.filter(r => !r.ok).length);