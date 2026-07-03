const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function checkEnglishLyricsStructure() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('=== CHECKING ENGLISH LYRICS STRUCTURE ===\n');

  // Get 10 English songs
  const { data: englishSongs, error } = await supabase
    .from('songs')
    .select('id, song_number, title, lyrics')
    .eq('language', 'english')
    .not('lyrics', 'is', null)
    .limit(10);

  if (error) {
    console.error('Error fetching English songs:', error);
    process.exit(1);
  }

  console.log(`Analyzing ${englishSongs.length} English songs:\n`);

  englishSongs.forEach((song, idx) => {
    console.log(`${idx + 1}. #${song.song_number}: ${song.title}`);
    console.log(`   lyrics column: ${song.lyrics ? song.lyrics.length + ' chars' : 'NULL'}`);
    
    if (song.lyrics) {
      console.log(`   First 150 chars of lyrics:`);
      console.log(`   "${song.lyrics.substring(0, 150)}"`);
      console.log(`   Contains section headers: ${/\[[A-Z]+\s+\d+\]/.test(song.lyrics) ? 'YES' : 'NO'}`);
      console.log(`   Contains only newlines: ${song.lyrics.replace(/\n/g, '').trim().length === 0 ? 'YES' : 'NO'}`);
    }
    console.log('');
  });

  // Check if there are English songs with empty lyrics
  const { data: emptyLyrics } = await supabase
    .from('songs')
    .select('id, song_number, title')
    .eq('language', 'english')
    .is('lyrics', null);

  console.log(`English songs with NULL lyrics: ${emptyLyrics.length}`);
}

checkEnglishLyricsStructure().catch(console.error);
