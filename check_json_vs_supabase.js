const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function checkJsonVsSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Load index.json
  const indexData = JSON.parse(fs.readFileSync('exports/index.json', 'utf8'));
  const jsonSongs = indexData.songs;
  
  console.log(`Total songs in JSON exports: ${jsonSongs.length}`);
  
  let foundCount = 0;
  let notFoundCount = 0;
  const notFoundSongs = [];
  
  for (const song of jsonSongs) {
    const { data, error } = await supabase
      .from('songs')
      .select('id, song_number, title')
      .eq('title', song.title)
      .eq('language', song.language)
      .maybeSingle();
    
    if (data) {
      foundCount++;
    } else {
      notFoundCount++;
      notFoundSongs.push({ title: song.title, language: song.language });
    }
  }
  
  console.log(`Songs found in Supabase: ${foundCount}`);
  console.log(`Songs NOT found in Supabase: ${notFoundCount}`);
  
  if (notFoundSongs.length > 0) {
    console.log('\nFirst 20 songs not found:');
    notFoundSongs.slice(0, 20).forEach(s => {
      console.log(`  - ${s.title} (${s.language})`);
    });
  }
}

checkJsonVsSupabase().catch(console.error);
