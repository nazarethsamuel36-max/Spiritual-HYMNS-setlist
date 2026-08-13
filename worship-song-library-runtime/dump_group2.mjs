import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const nums = [181, 194, 198, 212, 213, 249, 255, 275, 302, 327, 360, 238];
const { data } = await supabase.from('songs').select('id, song_number, title, chords').in('song_number', nums).eq('language', 'english');
const map = {};
for (const s of data) map[s.song_number] = s;
for (const n of nums) {
  const s = map[n];
  if (!s) { console.log(`\n=== #${n} NOT FOUND english ===`); continue; }
  console.log(`\n${'#'.repeat(80)}\n#${n} ${s.title}\n${'#'.repeat(80)}`);
  console.log(s.chords);
}