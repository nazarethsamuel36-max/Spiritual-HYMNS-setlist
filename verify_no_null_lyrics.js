const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function verifyNoNullLyrics() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('=== VERIFYING NULL LYRICS IN SUPABASE ===\n');

  const { data, error } = await supabase
    .from('songs')
    .select('id, song_number, title, language')
    .eq('is_active', true)
    .is('lyrics', null);

  if (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }

  if (data.length === 0) {
    console.log('✓ SUCCESS: No active songs have NULL lyrics!');
  } else {
    console.log(`⚠ WARNING: ${data.length} songs still have NULL lyrics:\n`);
    
    const byLanguage = {};
    data.forEach(song => {
      if (!byLanguage[song.language]) {
        byLanguage[song.language] = [];
      }
      byLanguage[song.language].push(song);
    });

    for (const [lang, songs] of Object.entries(byLanguage)) {
      console.log(`${lang.toUpperCase()} (${songs.length} songs):`);
      songs.forEach(song => {
        console.log(`  #${song.song_number}: ${song.title} (ID: ${song.id})`);
      });
    }
  }
}

verifyNoNullLyrics().catch(console.error);
