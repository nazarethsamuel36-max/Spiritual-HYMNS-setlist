const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Strip chord markers from chords text to create clean lyrics
function stripChordsFromText(chordsText) {
  if (!chordsText) return '';
  
  // Remove chord markers like [G], [C#m], [F/A], etc.
  return chordsText.replace(/\[[A-G][#b]?m?(?:\/[A-G][#b]?)?\]/g, '').trim();
}

async function fillNullLyrics() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('Fetching songs with null or empty lyrics...');
  
  // Fetch all songs that have chords but null/empty lyrics
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, song_number, title, chords, lyrics')
    .or('lyrics.is.null,lyrics.eq."",lyrics.eq." ",lyrics.eq."null"');
  
  if (error) {
    console.error('Error fetching songs:', error);
    process.exit(1);
  }
  
  console.log(`Found ${songs.length} songs with null/empty lyrics`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const song of songs) {
    try {
      if (!song.chords || song.chords.trim() === '') {
        console.log(`Skipping song ${song.song_number} (${song.title}): No chords to extract lyrics from`);
        skippedCount++;
        continue;
      }
      
      // Strip chords to create lyrics
      const lyrics = stripChordsFromText(song.chords);
      
      if (!lyrics || lyrics.trim() === '') {
        console.log(`Skipping song ${song.song_number} (${song.title}): No lyrics after stripping chords (result: "${lyrics?.substring(0, 50)}...")`);
        skippedCount++;
        continue;
      }
      
      // Update the song
      const { error: updateError } = await supabase
        .from('songs')
        .update({ lyrics })
        .eq('id', song.id);
      
      if (updateError) {
        throw updateError;
      }
      
      console.log(`✓ Updated song ${song.song_number}: ${song.title}`);
      updatedCount++;
      
    } catch (error) {
      console.error(`✗ Error processing song ${song.song_number}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n=== Migration Summary ===');
  console.log(`Total processed: ${songs.length}`);
  console.log(`Successfully updated: ${updatedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Skipped: ${skippedCount}`);
}

fillNullLyrics().catch(console.error);
