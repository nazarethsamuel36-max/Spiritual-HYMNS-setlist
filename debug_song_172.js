const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: require("path").join(__dirname, "worship-song-library-runtime", ".env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

function extractLyrics(song) {
  if (!song.sections || song.sections.length === 0) {
    return "";
  }

  let lyricsText = "";

  song.sections.forEach(section => {
    const label = section.label || section.type.toUpperCase();
    lyricsText += `[${label}]\n`;

    if (section.lines && section.lines.length > 0) {
      section.lines.forEach(line => {
        const text = line.text || "";
        lyricsText += text + "\n";
      });
    }
    
    lyricsText += "\n";
  });

  return lyricsText.trim();
}

async function debugSong172() {
  console.log("=== Debugging Song #172 ===\n");
  
  // Load song 172 from JSON
  const song172 = JSON.parse(fs.readFileSync("exports/songs/172.json", "utf8"));
  console.log("JSON Data:");
  console.log(`  songNumber: ${song172.songNumber}`);
  console.log(`  title: ${song172.title}`);
  console.log(`  language: ${song172.language}`);
  console.log(`  sections: ${song172.sections.length}`);
  
  // Extract lyrics
  const lyrics = extractLyrics(song172);
  console.log(`\nExtracted lyrics length: ${lyrics.length} characters`);
  console.log("\nExtracted lyrics (first 300 chars):");
  console.log(lyrics.substring(0, 300));
  console.log("\n---");
  
  // Check Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log("\nChecking Supabase for song #172...");
  const { data: existingSong, error: fetchError } = await supabase
    .from("songs")
    .select("id, song_number, title, language, lyrics")
    .eq("song_number", 172)
    .eq("language", "english")
    .maybeSingle();
  
  if (fetchError) {
    console.error("Error fetching from Supabase:", fetchError);
  } else if (!existingSong) {
    console.log("Song #172 NOT found in Supabase");
  } else {
    console.log("Song #172 found in Supabase:");
    console.log(`  id: ${existingSong.id}`);
    console.log(`  song_number: ${existingSong.song_number}`);
    console.log(`  title: ${existingSong.title}`);
    console.log(`  language: ${existingSong.language}`);
    console.log(`  current lyrics: ${existingSong.lyrics ? existingSong.lyrics.substring(0, 100) + "..." : "NULL"}`);
    
    // Try to update
    console.log("\nAttempting UPDATE...");
    const { error: updateError } = await supabase
      .from("songs")
      .update({ lyrics })
      .eq("id", existingSong.id);
    
    if (updateError) {
      console.error("UPDATE Error:", updateError);
      console.error("Error details:", JSON.stringify(updateError, null, 2));
    } else {
      console.log("✓ UPDATE successful!");
      
      // Verify the update
      const { data: updatedSong } = await supabase
        .from("songs")
        .select("lyrics")
        .eq("id", existingSong.id)
        .single();
      
      console.log(`Verified lyrics length after update: ${updatedSong.lyrics?.length || 0}`);
    }
  }
}

debugSong172().catch(console.error);
