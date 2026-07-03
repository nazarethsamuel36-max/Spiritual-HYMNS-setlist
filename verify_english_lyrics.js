const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function verifyEnglishLyrics() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('Checking English songs with lyrics...');
  
  // Count English songs with lyrics
  const { data: songsWithLyrics, error: lyricsError } = await supabase
    .from('songs')
    .select('id')
    .eq('language', 'english')
    .not('lyrics', 'is', null);
  
  if (lyricsError) {
    console.error('Error fetching songs with lyrics:', lyricsError);
    process.exit(1);
  }
  
  console.log(`English songs with lyrics: ${songsWithLyrics.length}`);
  
  // Count total English songs
  const { data: allEnglishSongs, error: totalError } = await supabase
    .from('songs')
    .select('id')
    .eq('language', 'english');
  
  if (totalError) {
    console.error('Error fetching all English songs:', totalError);
    process.exit(1);
  }
  
  console.log(`Total English songs: ${allEnglishSongs.length}`);
  
  // Count English songs without lyrics
  const { data: songsWithoutLyrics, error: nullError } = await supabase
    .from('songs')
    .select('id, song_number, title')
    .eq('language', 'english')
    .is('lyrics', null);
  
  if (nullError) {
    console.error('Error fetching songs without lyrics:', nullError);
    process.exit(1);
  }
  
  console.log(`English songs without lyrics: ${songsWithoutLyrics.length}`);
  
  if (songsWithoutLyrics.length > 0) {
    console.log('\nEnglish songs still missing lyrics:');
    songsWithoutLyrics.forEach(song => {
      console.log(`  - ${song.song_number}: ${song.title}`);
    });
  }
}

verifyEnglishLyrics().catch(console.error);
