const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function checkLyricsFormatting() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('=== CHECKING LYRICS FORMATTING ===\n');

  // Check a song with chorus
  const { data: songs, error } = await supabase
    .from('songs')
    .select('song_number, title, language, lyrics')
    .in('song_number', [1, 35, 45])
    .order('song_number');

  if (error) {
    console.error('Error fetching songs:', error);
    process.exit(1);
  }

  songs.forEach((song) => {
    console.log(`\n--- Song #${song.song_number}: ${song.title} (${song.language}) ---`);
    console.log(song.lyrics);
  });
}

checkLyricsFormatting().catch(console.error);
