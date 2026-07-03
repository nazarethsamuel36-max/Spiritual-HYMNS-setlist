const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: require("path").join(__dirname, "worship-song-library-runtime", ".env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log("SUPABASE_URL:", SUPABASE_URL ? "SET" : "NOT SET");
console.log("ANON_KEY:", ANON_KEY ? "SET (length: " + ANON_KEY.length + ")" : "NOT SET");
console.log("SERVICE_KEY:", SERVICE_KEY ? "SET (length: " + SERVICE_KEY.length + ")" : "NOT SET");

async function testKeys() {
  console.log("\n--- Testing with ANON key ---");
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);

  const { data: song1, error: err1 } = await anonClient
    .from("songs")
    .update({ lyrics: "Test with ANON key" })
    .eq("song_number", 172)
    .eq("language", "english")
    .select();

  console.log("Error:", err1);
  console.log("Data returned:", song1);

  if (SERVICE_KEY) {
    console.log("\n--- Testing with SERVICE key ---");
    const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);
    
    const { data: song2, error: err2 } = await serviceClient
      .from("songs")
      .update({ lyrics: "Test with SERVICE key" })
      .eq("song_number", 172)
      .eq("language", "english")
      .select();
    
    console.log("Error:", err2);
    console.log("Data returned:", song2);
    
    // Verify
    const { data: verify } = await serviceClient
      .from("songs")
      .select("lyrics")
      .eq("song_number", 172)
      .eq("language", "english")
      .single();
    
    console.log("Verified lyrics:", verify.lyrics);
  }
}

testKeys().catch(console.error);
