const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function debugHindiChords() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Check specific Hindi songs
  const songNumbers = [1001, 1002, 2001, 2002];
  
  for (const num of songNumbers) {
    const { data: song, error } = await supabase
      .from('songs')
      .select('id, song_number, title, chords, lyrics')
      .eq('song_number', num)
      .single();
    
    if (error) {
      console.log(`Song ${num}: Error - ${error.message}`);
    } else {
      console.log(`Song ${num}: ${song.title}`);
      console.log(`  Chords length: ${song.chords?.length || 0}`);
      console.log(`  Chords (first 150 chars): ${song.chords?.substring(0, 150) || 'null/empty'}`);
      console.log(`  Lyrics: ${song.lyrics?.substring(0, 50) || 'null/empty'}`);
      console.log();
    }
  }
}

debugHindiChords().catch(console.error);
