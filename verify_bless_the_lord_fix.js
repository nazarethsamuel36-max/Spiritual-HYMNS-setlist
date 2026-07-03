const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function verifyFix() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('=== VERIFYING "BLESS THE LORD" FIXES ===\n');

  const ids = [686, 918, 832, 653, 966];
  
  for (const id of ids) {
    const { data, error } = await supabase
      .from('songs')
      .select('id, song_number, title, language, lyrics, chords')
      .eq('id', id)
      .single();
    
    if (error) {
      console.log(`❌ Error fetching ID ${id}: ${error.message}`);
      continue;
    }
    
    console.log(`ID ${id} (Song #${data.song_number}):`);
    console.log(`  Title: ${data.title}`);
    console.log(`  Language: ${data.language}`);
    console.log(`  Lyrics: ${data.lyrics ? data.lyrics.length + ' chars' : 'NULL'}`);
    console.log(`  Chords: ${data.chords ? data.chords.length + ' chars' : 'NULL'}`);
    console.log('');
  }
}

verifyFix().catch(console.error);
