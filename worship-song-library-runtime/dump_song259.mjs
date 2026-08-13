import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase.from('songs').select('id, song_number, title, chords').eq('song_number', 259).maybeSingle();
if (error) { console.error(error); process.exit(1); }
console.log('id=' + data.id, 'num=' + data.song_number, 'title=' + data.title);
console.log('----------- LIVE CHORDS -----------');
console.log(data.chords);
console.log('-----------------------------------');
console.log('contains * :', data.chords.includes('*'));
console.log('contains [Chorus] :', /\[chorus\]/i.test(data.chords));