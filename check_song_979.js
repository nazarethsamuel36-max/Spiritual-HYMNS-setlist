const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function checkSong979() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('=== CHECKING SONG #979 IN SUPABASE ===\n');

  const { data, error } = await supabase
    .from('songs')
    .select('song_number, title, language, lyrics, chords')
    .eq('language', 'hindi')
    .limit(1);

  if (error) {
    console.error('Error fetching song:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No songs found');
    process.exit(1);
  }

  const song = data[0];
  console.log('Sample Hindi Song:');
  console.log(`  Song #: ${song.song_number}`);
  console.log(`  Title: ${song.title}`);
  console.log(`  Language: ${song.language}`);
  console.log(`\n--- LYRICS (first 500 chars) ---`);
  console.log(song.lyrics?.substring(0, 500));
  console.log(`\n--- CHORDS (first 500 chars) ---`);
  console.log(song.chords?.substring(0, 500));
  console.log(`\n--- FULL LYRICS ---`);
  console.log(song.lyrics);
}

checkSong979().catch(console.error);
