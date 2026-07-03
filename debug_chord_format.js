const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function debugChordFormat() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Fetch a sample song with chords but no lyrics
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, song_number, title, chords, lyrics')
    .not('chords', 'is', null)
    .or('lyrics.is.null,lyrics.eq."",lyrics.eq." "')
    .limit(3);
  
  if (error) {
    console.error('Error fetching songs:', error);
    process.exit(1);
  }
  
  console.log('Sample chord data from songs with chords but no lyrics:\n');
  
  songs.forEach(song => {
    console.log(`Song ${song.song_number}: ${song.title}`);
    console.log(`Chords length: ${song.chords?.length || 0}`);
    console.log(`Lyrics: "${song.lyrics}"`);
    console.log(`First 200 chars of chords:`);
    console.log(song.chords?.substring(0, 200) || 'No chords');
    console.log('\n---\n');
  });
}

debugChordFormat().catch(console.error);
