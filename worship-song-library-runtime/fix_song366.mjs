import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase.from('songs').select('id, song_number, title, chords').eq('song_number', 366).single();
if (error) { console.error('ERR', error.message); process.exit(1); }

const fixed = data.chords.replace(/â€“/g, '-').replace(/\uFFFD/g, '-');
const { error: ue } = await supabase.from('songs').update({ chords: fixed }).eq('id', data.id);
if (ue) { console.error('update err', ue.message); process.exit(1); }

const { data: chk } = await supabase.from('songs').select('chords').eq('id', data.id).single();
console.log('=== FIXED CHORDS ===');
console.log(chk.chords);
const weird = (chk.chords || '').match(/[^\x00-\x7F]/g);
console.log('\nremaining non-ascii:', weird ? [...new Set(weird)].join(' ') : 'none');