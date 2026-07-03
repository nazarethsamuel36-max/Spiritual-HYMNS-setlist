const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function checkChordsNoLyrics() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('Checking songs with chords but no lyrics...\n');
  
  // Fetch songs that have chords but null/empty lyrics
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, song_number, title, language')
    .not('chords', 'is', null)
    .or('lyrics.is.null,lyrics.eq."",lyrics.eq." "');
  
  if (error) {
    console.error('Error fetching songs:', error);
    process.exit(1);
  }
  
  console.log(`Total songs with chords but no lyrics: ${songs.length}\n`);
  
  // Group by language
  const byLanguage = {};
  songs.forEach(song => {
    const lang = song.language || 'unknown';
    if (!byLanguage[lang]) byLanguage[lang] = [];
    byLanguage[lang].push(song);
  });
  
  console.log('Breakdown by language:');
  Object.keys(byLanguage).sort().forEach(lang => {
    console.log(`  ${lang}: ${byLanguage[lang].length} songs`);
  });
  
  console.log('\nSample songs (first 10):');
  songs.slice(0, 10).forEach(song => {
    console.log(`  ${song.song_number}: ${song.title} (${song.language})`);
  });
}

checkChordsNoLyrics().catch(console.error);
