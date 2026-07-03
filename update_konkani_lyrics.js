const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Convert JSON song structure to lyrics text
function songToLyrics(song) {
  let lyrics = '';
  
  for (const section of song.sections) {
    lyrics += `[${section.label}]\n`;
    for (const line of section.lines) {
      lyrics += line + '\n';
    }
    lyrics += '\n';
  }
  
  return lyrics.trim();
}

async function updateKonkaniLyrics() {
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

  console.log('=== UPDATING KONKANI LYRICS FROM JSON ===\n');

  const konkaniSongs = JSON.parse(fs.readFileSync('extracted_songs/konkani_songs.json', 'utf8'));
  const notFoundSongs = JSON.parse(fs.readFileSync('not_found_lyrics.json', 'utf8'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const missingSong of notFoundSongs) {
    const songData = konkaniSongs.find(s => s.number === missingSong.song_number);
    
    if (!songData) {
      console.log(`Song #${missingSong.song_number} not found in JSON`);
      continue;
    }
    
    const lyrics = songToLyrics(songData);
    console.log(`Updating #${missingSong.song_number}: ${missingSong.title}`);
    console.log(`  Lyrics length: ${lyrics.length} chars`);
    
    const { error } = await supabase
      .from('songs')
      .update({ lyrics })
      .eq('id', missingSong.id);
    
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
    console.log(`\n✓ All 8 Konkani songs have been updated in Supabase!`);
  }
}

updateKonkaniLyrics().catch(console.error);
