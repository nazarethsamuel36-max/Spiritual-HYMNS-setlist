const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function checkEnglishSong1() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('=== CHECKING ENGLISH SONG #1 ===\n');

  const { data, error } = await supabase
    .from('songs')
    .select('song_number, title, language, lyrics')
    .eq('song_number', 1)
    .eq('language', 'english');

  if (error) {
    console.error('Error fetching song:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('English song #1 not found');
    process.exit(1);
  }

  const song = data[0];
  console.log(`Song #${song.song_number}: ${song.title}`);
  console.log(`Language: ${song.language}`);
  console.log(`\n--- LYRICS ---`);
  console.log(song.lyrics);
}

checkEnglishSong1().catch(console.error);
