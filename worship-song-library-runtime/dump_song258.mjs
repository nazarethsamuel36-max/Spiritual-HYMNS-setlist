import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase.from('songs').select('id, song_number, title, language, original_key, chords').eq('song_number', 258).maybeSingle();
if (error) { console.error(error); process.exit(1); }
if (!data) { console.log('song 258 not found'); process.exit(0); }
console.log('id=' + data.id, 'num=' + data.song_number, 'title=' + data.title, 'lang=' + data.language, 'key=' + data.original_key);
console.log('----------- LIVE CHORDS -----------');
console.log(data.chords);
console.log('-----------------------------------');
console.log('contains * :', data.chords.includes('*'));
const markers = data.chords.match(/\[[^\]]*\]/g) || [];
console.log('all bracket markers:', JSON.stringify(markers));