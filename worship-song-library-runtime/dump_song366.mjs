import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase.from('songs').select('id, song_number, title, language, chords, lyrics').eq('song_number', 366).maybeSingle();
if (error) { console.error('ERR', error.message); process.exit(1); }
if (!data) { console.log('song 366 not found'); process.exit(0); }
console.log('id=' + data.id, 'num=' + data.song_number, 'title=' + data.title, 'lang=' + data.language);
console.log('=== CHORDS ===');
console.log(JSON.stringify(data.chords));
console.log('=== LYRICS ===');
console.log(JSON.stringify(data.lyrics));
// find non-ascii / weird characters
const weird = (data.chords || '').match(/[^\x00-\x7F]/g);
console.log('\nnon-ascii chars in chords:', weird ? [...new Set(weird)].join(' ') : 'none');
const weird2 = (data.lyrics || '').match(/[^\x00-\x7F]/g);
console.log('non-ascii chars in lyrics:', weird2 ? [...new Set(weird2)].join(' ') : 'none');