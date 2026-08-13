import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const GROUP1 = [162, 163, 169, 170, 173, 174, 175, 180, 185, 186, 188, 193, 196, 201, 207, 210, 211, 224, 225, 243, 262, 266, 278, 292, 293, 309, 361, 373, 376, 377];

function countChorus(c) { return (c.match(/\[chorus\]/gi) || []).length; }
function hasForm(c) { return /\[(verse|bridge|refrain|ending)\]/i.test(c); }

const { data, error } = await supabase.from('songs').select('id, song_number, title, language, chords').in('song_number', GROUP1);
if (error) { console.error(error.message); process.exit(1); }
console.log('rows =', data.length);
const byLang = {};
for (const s of data) {
  const key = (s.language || '').toLowerCase();
  byLang[key] = (byLang[key] || 0) + 1;
}
console.log('language counts:', JSON.stringify(byLang));

// For each song_number, show how many versions and their chorus count now
const seen = {};
for (const s of data) {
  const n = s.song_number;
  if (!seen[n]) seen[n] = [];
  seen[n].push({ lang: (s.language||'').toLowerCase(), id: s.id, chorus: countChorus(s.chords || ''), hasForm: hasForm(s.chords || ''), len: (s.chords||'').length });
}
for (const n of Object.keys(seen).sort((a,b)=>+a-+b)) {
  const rows = seen[n];
  console.log(`#${n}: ` + rows.map(r => `${r.lang}[${r.chorus}C${r.hasForm?'+form':''} len${r.len}]`).join(' | '));
}