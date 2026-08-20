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

async function findSongs() {
  console.log('📡 Fetching English songs...');
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, title, song_number, language, chords')
    .ilike('language', 'english')
    .order('song_number');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const unmarked = [];

  songs.forEach(song => {
    const text = song.chords || '';
    // Look for bracketed section names
    const hasMarkers = /\[(verse|chorus|bridge|intro|outro|refrain|ending|interlude|coda|solo)/i.test(text);
    if (!hasMarkers && text.trim().length > 0) {
      unmarked.push(song);
    }
  });

  console.log(`\nFound ${unmarked.length} unmarked English songs out of ${songs.length} total English songs:\n`);
  unmarked.forEach(s => {
    console.log(`- #${s.song_number} - ${s.title} (ID: ${s.id})`);
  });
}

findSongs();
