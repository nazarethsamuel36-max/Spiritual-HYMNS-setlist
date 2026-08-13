import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const nums = process.argv.slice(2);
for (const n of nums) {
  const { data, error } = await supabase.from('songs').select('id, song_number, title, chords').eq('song_number', n).eq('language', 'english').single();
  if (error || !data) { console.log(`\n-----#${n}: not found / ${error?.message}`); continue; }
  console.log(`\n##### #${data.song_number} | ${data.title} (id ${data.id})`);
  console.log(data.chords);
}