const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, 'worship-song-library-runtime', '.env') });

// Configuration
const EXPORTS_DIR = path.join(__dirname, 'exports', 'songs');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Process all songs (English, Hindi, Marathi, Konkani, etc.)
function shouldProcessSong(song) {
  return true; // Process all songs from JSON exports
}

// Convert structured JSON to chord notation format
function convertToChordsFormat(song) {
  if (!song.sections || song.sections.length === 0) {
    return { chords: '', lyrics: '' };
  }

  let chordsText = '';
  let lyricsText = '';

  song.sections.forEach(section => {
    const label = section.label || section.type.toUpperCase();
    chordsText += `[${label}]\n`;
    lyricsText += `[${label}]\n`;

    if (section.lines && section.lines.length > 0) {
      section.lines.forEach(line => {
        const text = line.text || '';
        const chordData = line.chords || [];

        // Build chord line with chord markers
        if (chordData.length > 0) {
          let chordLine = '';
          let lastPos = 0;
          
          chordData.forEach(chord => {
            const position = chord.position || 0;
            // Add spaces to position the chord
            chordLine += ' '.repeat(Math.max(0, position - lastPos));
            chordLine += `[${chord.chord}]`;
            lastPos = position + chord.chord.length + 2; // +2 for brackets
          });
          
          chordsText += chordLine + '\n';
        }
        
        // Add lyrics line (plain text)
        lyricsText += text + '\n';
      });
    }
    
    chordsText += '\n';
    lyricsText += '\n';
  });

  return {
    chords: chordsText.trim(),
    lyrics: lyricsText.trim()
  };
}

// Strip chord markers from chords text to create clean lyrics
function stripChordsFromText(chordsText) {
  if (!chordsText) return '';
  
  // Remove chord markers like [G], [C#m], [F/A], etc.
  return chordsText.replace(/\[[A-G][#b]?m?(?:\/[A-G][#b]?)?\]/g, '').trim();
}

// Read all song JSON files
function loadAllSongs() {
  const songs = [];
  const files = fs.readdirSync(EXPORTS_DIR);
  
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(EXPORTS_DIR, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const song = JSON.parse(content);
        songs.push(song);
      } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
      }
    }
  });
  
  return songs;
}

// Main migration function
async function migrateToSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    console.error('Example: set SUPABASE_URL=your_url && set SUPABASE_SERVICE_KEY=your_key && node migrate_hindi_marathi_to_supabase.js');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('Loading songs from exports...');
  const allSongs = loadAllSongs();
  console.log(`Loaded ${allSongs.length} songs total`);
  
  // Filter for all songs
  const targetSongs = allSongs.filter(song => 
    shouldProcessSong(song)
  );
  
  console.log(`Found ${targetSongs.length} songs to process`);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  for (const song of targetSongs) {
    try {
      // Convert to chords/lyrics format
      const { chords, lyrics } = convertToChordsFormat(song);
      
      if (!chords && !lyrics) {
        console.log(`Skipping song ${song.songNumber} (${song.title}): No chord/lyrics data`);
        skippedCount++;
        continue;
      }
      
      // Check if song exists in Supabase by title (since songNumber doesn't match)
      const { data: existingSong, error: fetchError } = await supabase
        .from('songs')
        .select('id, song_number, chords, lyrics')
        .eq('title', song.title)
        .eq('language', song.language)
        .maybeSingle();
      
      if (fetchError || !existingSong) {
        console.log(`Song ${song.songNumber} (${song.title}) not found in Supabase, skipping`);
        skippedCount++;
        continue;
      }
      
      // Prepare update data
      const updateData = {};
      
      // Update chords if empty or if we have new data
      if (chords && (!existingSong.chords || existingSong.chords.trim() === '')) {
        updateData.chords = chords;
      }
      
      // Update/create lyrics
      if (lyrics) {
        updateData.lyrics = lyrics;
      } else if (existingSong.chords && existingSong.chords.trim() !== '' && (!existingSong.lyrics || existingSong.lyrics.trim() === '')) {
        // If lyrics is empty but chords exists, strip chords to create lyrics
        updateData.lyrics = stripChordsFromText(existingSong.chords);
      }
      
      if (Object.keys(updateData).length === 0) {
        console.log(`Song ${song.songNumber} already has data, skipping`);
        skippedCount++;
        continue;
      }
      
      // Update the song
      const { error: updateError } = await supabase
        .from('songs')
        .update(updateData)
        .eq('id', existingSong.id);
      
      if (updateError) {
        throw updateError;
      }
      
      console.log(`✓ Updated song ${song.songNumber}: ${song.title}`);
      successCount++;
      
    } catch (error) {
      console.error(`✗ Error processing song ${song.songNumber}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n=== Migration Summary ===');
  console.log(`Total processed: ${targetSongs.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Skipped: ${skippedCount}`);
}

// Run migration
migrateToSupabase().catch(console.error);
