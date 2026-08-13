import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const targets = [
  { num: 162, lang: 'english' },
  { num: 169, lang: 'english' },
  { num: 201, lang: 'hindi' },
  { num: 373, lang: 'english' },
];
for (const t of targets) {
  const { data } = await supabase.from('songs').select('song_number, title, language, chords').eq('song_number', t.num).eq('language', t.lang).single();
  if (!data) { console.log(`#${t.num} ${t.lang} not found\n`); continue; }
  console.log(`\n=== #${data.song_number} ${data.title} [${data.language}] ===`);
  console.log(data.chords);
}