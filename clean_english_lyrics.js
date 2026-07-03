const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Strip chord markers from text
function stripChordMarkers(text) {
  if (!text) return '';
  // Remove chord markers like [G], [C#m], [F/A], [D7], [Gm7], [C#m7], etc.
  return text.replace(/\[[A-G][#b]?(?:m|maj|min|dim|aug)?\d*(?:\/[A-G][#b]?(?:m|maj|min|dim|aug)?\d*)?\]/g, '').trim();
}

async function cleanEnglishLyrics() {
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

  console.log('=== CLEANING ENGLISH LYRICS (REMOVING CHORD MARKERS) ===\n');

  // Get all English songs with lyrics
  const { data: englishSongs, error } = await supabase
    .from('songs')
    .select('id, song_number, title, lyrics')
    .eq('language', 'english')
    .not('lyrics', 'is', null);

  if (error) {
    console.error('Error fetching English songs:', error);
    process.exit(1);
  }

  console.log(`Found ${englishSongs.length} English songs with lyrics\n`);

  let cleanedCount = 0;
  let skippedCount = 0;

  for (const song of englishSongs) {
    const cleanedLyrics = stripChordMarkers(song.lyrics);
    
    // Check if cleaning was needed
    if (cleanedLyrics !== song.lyrics) {
      console.log(`Cleaning #${song.song_number}: ${song.title}`);
      console.log(`  Before: ${song.lyrics.length} chars`);
      console.log(`  After: ${cleanedLyrics.length} chars`);
      
      const { error: updateError } = await supabase
        .from('songs')
        .update({ lyrics: cleanedLyrics })
        .eq('id', song.id);
      
      if (updateError) {
        console.log(`  ❌ Error: ${updateError.message}`);
      } else {
        console.log(`  ✓ Updated`);
        cleanedCount++;
      }
    } else {
      skippedCount++;
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Cleaned: ${cleanedCount} songs`);
  console.log(`Skipped (already clean): ${skippedCount} songs`);
  console.log(`Total: ${englishSongs.length} songs`);
}

cleanEnglishLyrics().catch(console.error);
