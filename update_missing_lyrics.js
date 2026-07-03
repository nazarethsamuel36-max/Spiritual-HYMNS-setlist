const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function updateMissingLyrics() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('=== UPDATING SUPABASE WITH MISSING LYRICS ===\n');

  const foundSongs = JSON.parse(fs.readFileSync('found_lyrics.json', 'utf8'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const song of foundSongs) {
    console.log(`Updating #${song.song_number}: ${song.title} (${song.language})`);
    
    const { error } = await supabase
      .from('songs')
      .update({ lyrics: song.lyrics })
      .eq('id', song.id);
    
    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
      errorCount++;
    } else {
      console.log(`  ✓ Updated`);
      successCount++;
    }
  }
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Successfully updated: ${successCount} songs`);
  console.log(`Errors: ${errorCount} songs`);
  
  if (errorCount === 0 && successCount > 0) {
    console.log(`\n✓ All found lyrics have been updated in Supabase!`);
  }
}

updateMissingLyrics().catch(console.error);
