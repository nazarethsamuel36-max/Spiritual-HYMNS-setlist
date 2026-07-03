const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function getMissingLyrics() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('=== FETCHING SONGS WITH NULL LYRICS ===\n');

  const { data, error } = await supabase
    .from('songs')
    .select('id, song_number, title, language')
    .eq('is_active', true)
    .is('lyrics', null)
    .order('language, song_number');

  if (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }

  console.log(`Found ${data.length} songs with NULL lyrics\n`);
  
  // Group by language
  const byLanguage = {};
  data.forEach(song => {
    if (!byLanguage[song.language]) {
      byLanguage[song.language] = [];
    }
    byLanguage[song.language].push(song);
  });

  for (const [lang, songs] of Object.entries(byLanguage)) {
    console.log(`\n${lang.toUpperCase()} (${songs.length} songs):`);
    songs.forEach(song => {
      console.log(`  #${song.song_number}: ${song.title} (ID: ${song.id})`);
    });
  }

  console.log(`\n=== TOTAL: ${data.length} songs ===`);
  
  // Save to JSON for further processing
  const fs = require('fs');
  fs.writeFileSync('missing_lyrics_list.json', JSON.stringify(data, null, 2));
  console.log('\nSaved to: missing_lyrics_list.json');
}

getMissingLyrics().catch(console.error);
