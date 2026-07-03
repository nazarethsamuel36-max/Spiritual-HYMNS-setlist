const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Convert JSON chord format to clean songbook format (no section headers, chorus in italics)
function convertToChordPro(sections) {
  if (!sections || sections.length === 0) return '';

  let chordPro = '';
  let isFirstSection = true;

  sections.forEach((section) => {
    // Add blank line between sections (but not before first section)
    if (!isFirstSection) {
      chordPro += '\n\n';
    }
    isFirstSection = false;

    // Check if this is a chorus section
    const isChorus = section.type === 'chorus' || (section.label && section.label.toLowerCase().includes('chorus'));

    if (section.lines) {
      section.lines.forEach((line) => {
        if (!line.text) return;

        let chordProLine = '';
        let lastPos = 0;
        const chords = line.chords || [];

        // Sort chords by position
        chords.sort((a, b) => a.position - b.position);

        chords.forEach((chord) => {
          // Add text before this chord
          const textBefore = line.text.substring(lastPos, chord.position);
          chordProLine += textBefore;
          // Add the chord
          chordProLine += `[${chord.chord}]`;
          lastPos = chord.position;
        });

        // Add remaining text
        let remainingText = line.text.substring(lastPos);

        // Wrap chorus text in italics
        if (isChorus && remainingText.trim()) {
          chordProLine += `*${remainingText}*`;
        } else {
          chordProLine += remainingText;
        }

        chordPro += chordProLine + '\n';
      });
    }
  });

  return chordPro.trim();
}

// Convert JSON lyrics to clean songbook format (no section headers, chorus marked with *)
function convertToCleanLyrics(sections) {
  if (!sections || sections.length === 0) return '';

  let lyrics = '';
  let isFirstSection = true;

  sections.forEach((section) => {
    // Add blank line between sections (but not before first section)
    if (!isFirstSection) {
      lyrics += '\n\n';
    }
    isFirstSection = false;

    // Check if this is a chorus section
    const isChorus = section.type === 'chorus' || (section.label && section.label.toLowerCase().includes('chorus'));

    if (section.lines) {
      section.lines.forEach((line) => {
        if (!line.text) return;

        // Mark chorus lines with * at the start for CSS styling
        if (isChorus && line.text.trim()) {
          lyrics += `* ${line.text}`;
        } else {
          lyrics += line.text;
        }
        lyrics += '\n';
      });
    }
  });

  return lyrics.trim();
}

async function extractAndUpdateChords() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const exportsDir = path.join(__dirname, 'exports', 'songs');
  const jsonFiles = fs.readdirSync(exportsDir).filter(f => f.endsWith('.json'));

  console.log(`Found ${jsonFiles.length} JSON files in exports/songs/\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(exportsDir, file);
    const songData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const songNumber = songData.songNumber;
    const language = songData.language;

    // Process all languages to update with clean format
    if (!language) {
      skippedCount++;
      continue;
    }

    // Check if song has sections with chords
    if (!songData.sections || songData.sections.length === 0) {
      console.log(`#${songNumber} (${language}): No sections found, skipping`);
      skippedCount++;
      continue;
    }

    const hasChords = songData.sections.some(section =>
      section.lines && section.lines.some(line => line.chords && line.chords.length > 0)
    );

    if (!hasChords) {
      console.log(`#${songNumber} (${language}): No chords in JSON, skipping`);
      skippedCount++;
      continue;
    }

    // Convert to ChordPro format (for chords column)
    const chordPro = convertToChordPro(songData.sections);

    // Convert to clean lyrics format (for lyrics column)
    const cleanLyrics = convertToCleanLyrics(songData.sections);

    if (!chordPro || chordPro.length === 0) {
      console.log(`#${songNumber} (${language}): Empty ChordPro output, skipping`);
      skippedCount++;
      continue;
    }

    // Update Supabase (both chords and lyrics) - match by song_number AND language
    console.log(`Updating #${songNumber} (${language}): ${songData.title}`);
    const { error } = await supabase
      .from('songs')
      .update({ chords: chordPro, lyrics: cleanLyrics })
      .eq('song_number', songNumber)
      .eq('language', language);

    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
      errorCount++;
    } else {
      console.log(`  ✓ Updated (${chordPro.length} chars)`);
      updatedCount++;
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Updated: ${updatedCount} songs`);
  console.log(`Skipped: ${skippedCount} songs`);
  console.log(`Errors: ${errorCount} songs`);
}

extractAndUpdateChords().catch(console.error);
