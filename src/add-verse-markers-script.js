import fs from 'fs';

// Read the SQL file
const sqlContent = fs.readFileSync('songs_rows (1).sql', 'utf8');

// Parse the SQL file to extract song data
function parseSongsFromSQL(sql) {
  const songs = [];
  
  // Find the VALUES part
  const valuesMatch = sql.match(/VALUES\s+(.+);$/s);
  if (!valuesMatch) {
    console.log('No VALUES found in SQL');
    return songs;
  }
  
  const valuesString = valuesMatch[1];
  
  // Split by ), ( to get individual song records
  const songRecords = valuesString.split(/\),\s*\(/);
  
  for (const record of songRecords) {
    // Remove leading/trailing parentheses
    const cleanRecord = record.replace(/^\(|\)$/g, '');
    
    // Parse the values
    const songData = parseValuesString(cleanRecord);
    if (songData && songData.length >= 6) {
      songs.push({
        id: songData[0],
        title: songData[2],
        language: songData[3],
        chords: songData[5]
      });
    }
  }
  
  return songs;
}

function parseValuesString(str) {
  const values = [];
  let current = '';
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      current += char;
      continue;
    }
    
    if (char === "'") {
      inString = !inString;
      current += char;
      continue;
    }
    
    if (char === ',' && !inString) {
      values.push(current.trim());
      current = '';
      continue;
    }
    
    current += char;
  }
  
  if (current) {
    values.push(current.trim());
  }
  
  return values;
}

function processChords(chords) {
  if (!chords) return chords;
  
  // Remove existing single quotes wrapper if present
  let cleanChords = chords;
  if (cleanChords.startsWith("'") && cleanChords.endsWith("'")) {
    cleanChords = cleanChords.slice(1, -1);
  }
  
  const lines = cleanChords.split('\n');
  const processedLines = [];
  let inChorus = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();
    
    // Skip [Chorus] markers (preserve them)
    if (trimmed.toLowerCase() === '[chorus]') {
      inChorus = true;
      processedLines.push(line);
      continue;
    }
    
    // Exit chorus on other markers
    if (trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.toLowerCase().includes('chorus')) {
      inChorus = false;
    }
    
    // Empty line means new paragraph - add [Verse] if not in chorus
    if (trimmed === '') {
      // Don't add empty lines to output, but mark that next line needs [Verse] if not in chorus
      continue;
    }
    
    // Skip existing [Verse] markers (preserve them)
    if (trimmed.toLowerCase() === '[verse]') {
      processedLines.push(line);
      continue;
    }
    
    // Skip directives like {title: ...}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      processedLines.push(line);
      continue;
    }
    
    // Check if previous line was empty (paragraph break) and we're not in chorus
    if (i > 0 && lines[i-1].trim() === '' && !inChorus && !trimmed.startsWith('[')) {
      processedLines.push('[Verse]');
    }
    
    // Remove * marks from lines (chorus markers)
    if (line.startsWith('* ')) {
      line = line.substring(2);
    }
    
    // Remove * marks anywhere in the line (like *(2)*)
    line = line.replace(/\*\([^)]*\)\*/g, ''); // Remove *(2)* patterns
    line = line.replace(/\*/g, ''); // Remove any remaining * marks
    
    // Remove extra spaces
    line = line.replace(/\s+/g, ' ').trim();
    
    processedLines.push(line);
  }
  
  return processedLines.join('\n');
}

// Process songs
const songs = parseSongsFromSQL(sqlContent);
console.log(`Found ${songs.length} songs`);

const sqlStatements = [];
let processedCount = 0;
let unchangedCount = 0;

for (const song of songs) {
  if (!song.chords) {
    unchangedCount++;
    continue;
  }
  
  // Process all songs (not just Marathi)
  const newChords = processChords(song.chords);
  
  // Only add to SQL if chords changed
  if (newChords !== song.chords) {
    // Properly escape for SQL
    const escapedChords = newChords.replace(/'/g, "''");
    sqlStatements.push(`UPDATE songs SET chords = '${escapedChords}' WHERE id = ${song.id};`);
    processedCount++;
    console.log(`Processed: ${song.title} (ID: ${song.id}, Lang: ${song.language})`);
  } else {
    unchangedCount++;
  }
}

console.log(`\nSummary:`);
console.log(`- Total songs: ${songs.length}`);
console.log(`- Processed (added [Verse]): ${processedCount}`);
console.log(`- Unchanged (already has markers or empty): ${unchangedCount}`);

// Write to SQL file
const outputContent = `-- SQL UPDATE statements to add [Verse] markers to all songs
-- Adds [Verse] at every paragraph break (empty line) where chorus tag is not present
-- Removes * marks (chorus indicators)
-- Removes extra spaces for better rendering
-- Preserves existing [Chorus] and [Verse] markers
-- Generated on ${new Date().toISOString()}
-- Total statements: ${sqlStatements.length}

-- IMPORTANT: Backup your database before running this!
-- Run in Supabase SQL Editor

${sqlStatements.join('\n')}`;

fs.writeFileSync('all-songs-verse-markers.sql', outputContent);
console.log(`\nSQL file written: all-songs-verse-markers.sql`);
