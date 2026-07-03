const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, "worship-song-library-runtime", ".env") });

const EXPORTS_DIR = path.join(__dirname, "exports", "songs");
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const BATCH_SIZE = 50;

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

function loadAllSongs() {
  const songs = [];
  const files = fs.readdirSync(EXPORTS_DIR);
  
  files.forEach(file => {
    if (file.endsWith(".json")) {
      const filePath = path.join(EXPORTS_DIR, file);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const song = JSON.parse(content);
        songs.push(song);
      } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
      }
    }
  });
  
  return songs;
}

async function migrateLyrics() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log("Loading songs from exports...");
  const allSongs = loadAllSongs();
  console.log(`Loaded ${allSongs.length} songs total`);
  
  // Count songs by language
  const languageCounts = {};
  allSongs.forEach(song => {
    const lang = song.language || 'unknown';
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  });
  console.log("Songs by language:", languageCounts);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  // Track English song stats
  let englishInJson = languageCounts['english'] || 0;
  let englishUpdated = 0;
  let englishSkipped = 0;
  let englishErrors = 0;
  
  for (let i = 0; i < allSongs.length; i += BATCH_SIZE) {
    const batch = allSongs.slice(i, i + BATCH_SIZE);
    console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1} (${i + 1}-${Math.min(i + BATCH_SIZE, allSongs.length)})...`);
    
    for (const song of batch) {
      try {
        const lyrics = extractLyrics(song);
        
        if (!lyrics) {
          console.log(`Skipping song ${song.songNumber} (${song.title}): No lyrics data`);
          skippedCount++;
          if (song.language === 'english') englishSkipped++;
          continue;
        }
        
        // Match by title and language (with case-insensitive match for safety)
        const { data: existingSong, error: fetchError } = await supabase
          .from("songs")
          .select("id, song_number, title, language")
          .ilike("title", song.title.trim())
          .eq("language", song.language)
          .maybeSingle();
        
        if (fetchError || !existingSong) {
          console.log(`Song ${song.songNumber} (${song.title}) [${song.language}] not found in Supabase, skipping`);
          skippedCount++;
          if (song.language === 'english') englishSkipped++;
          continue;
        }
        
        const { error: updateError } = await supabase
          .from("songs")
          .update({ lyrics })
          .eq("id", existingSong.id);
        
        if (updateError) {
          throw updateError;
        }
        
        console.log(`✓ Updated song ${song.songNumber}: ${song.title} [${song.language}]`);
        successCount++;
        if (song.language === 'english') englishUpdated++;
        
      } catch (error) {
        console.error(`✗ Error processing song ${song.songNumber} (${song.title}):`, error.message);
        errorCount++;
        if (song.language === 'english') englishErrors++;
      }
    }
    
    if (i + BATCH_SIZE < allSongs.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log("\n=== Migration Summary ===");
  console.log(`Total processed: ${allSongs.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Skipped: ${skippedCount}`);
  
  console.log("\n=== English Song Details ===");
  console.log(`English songs in JSON: ${englishInJson}`);
  console.log(`English songs successfully updated: ${englishUpdated}`);
  console.log(`English songs skipped: ${englishSkipped}`);
  console.log(`English songs with errors: ${englishErrors}`);
}

migrateLyrics().catch(console.error);
