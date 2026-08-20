import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const targetIds = [599, 991, 1100, 1101, 1111, 1115, 1117, 1122];

async function fetchSongs() {
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, title, song_number, language, chords, lyrics')
    .in('id', targetIds);

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  songs.forEach(song => {
    console.log(`\n=========================================`);
    console.log(`🎵 ID: ${song.id} | #${song.song_number} - ${song.title}`);
    console.log(`=========================================`);
    if (song.chords) {
      console.log('--- CHORDS ---');
      console.log(song.chords);
    }
    if (song.lyrics) {
      console.log('--- LYRICS ---');
      console.log(song.lyrics);
    }
  });
}

fetchSongs();
