const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: require("path").join(__dirname, "worship-song-library-runtime", ".env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function testSimpleUpdate() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log("Test 1: Update with simple string");
  const { error: err1 } = await supabase
    .from("songs")
    .update({ lyrics: "Test lyrics" })
    .eq("song_number", 172)
    .eq("language", "english");
  
  console.log("Error:", err1);
  
  const { data: song1 } = await supabase
    .from("songs")
    .select("lyrics")
    .eq("song_number", 172)
    .eq("language", "english")
    .single();
  
  console.log("Lyrics after simple update:", song1.lyrics);
  
  console.log("\nTest 2: Update with longer text");
  const longText = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";
  const { error: err2 } = await supabase
    .from("songs")
    .update({ lyrics: longText })
    .eq("song_number", 172)
    .eq("language", "english");
  
  console.log("Error:", err2);
  
  const { data: song2 } = await supabase
    .from("songs")
    .select("lyrics")
    .eq("song_number", 172)
    .eq("language", "english")
    .single();
  
  console.log("Lyrics after longer update:", song2.lyrics);
}

testSimpleUpdate().catch(console.error);
