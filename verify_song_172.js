const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: require("path").join(__dirname, "worship-song-library-runtime", ".env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function verifySong172() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  const { data: song } = await supabase
    .from("songs")
    .select("song_number, title, language, lyrics")
    .eq("song_number", 172)
    .eq("language", "english")
    .single();
  
  console.log("Song #172 Verification:");
  console.log(`  song_number: ${song.song_number}`);
  console.log(`  title: ${song.title}`);
  console.log(`  language: ${song.language}`);
  console.log(`  lyrics length: ${song.lyrics ? song.lyrics.length : 0}`);
  console.log(`  lyrics: ${song.lyrics ? song.lyrics.substring(0, 200) + "..." : "NULL"}`);
}

verifySong172().catch(console.error);
