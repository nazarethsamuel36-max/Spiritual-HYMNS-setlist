const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Load missing songs list
const missingSongs = JSON.parse(fs.readFileSync('missing_lyrics_list.json', 'utf8'));

// Strip chord markers to extract lyrics
function stripChords(text) {
  if (!text) return '';
  return text.replace(/\[[A-G][#b]?m?(?:\/[A-G][#b]?)?\]/g, '').trim();
}

// Search in Hindi scratch file
function searchHindiScratch(song) {
  const scratchFile = 'd:\\spiritual setlist\\scratch_hindi_1.md';
  if (!fs.existsSync(scratchFile)) return null;
  
  const content = fs.readFileSync(scratchFile, 'utf8');
  const lines = content.split('\n');
  
  // Search by song number pattern: ### X - TITLE
  const pattern = new RegExp(`^### ${song.song_number} - (.+)$`, 'm');
  const match = content.match(pattern);
  
  if (match) {
    // Extract the song content
    const startIndex = content.indexOf(match[0]);
    const nextSongPattern = /\n### \d+ - /;
    const nextMatch = content.substring(startIndex + match[0].length).match(nextSongPattern);
    
    let songContent;
    if (nextMatch) {
      songContent = content.substring(startIndex, startIndex + match[0].length + nextMatch.index);
    } else {
      songContent = content.substring(startIndex);
    }
    
    // Extract lyrics (remove section headers and chord markers)
    let lyrics = songContent
      .replace(/\[CHORUS\]/g, '')
      .replace(/\[VERSE \d+\]/g, '')
      .replace(/\[BRIDGE\]/g, '')
      .replace(/\[PRE-CHORUS\]/g, '')
      .replace(/\[REFRAIN\]/g, '')
      .replace(/\*\*/g, '')
      .replace(/^### \d+ - .+\n/, '')
      .trim();
    
    return lyrics;
  }
  
  return null;
}

// Search in ChordPro files
function searchChordPro(song) {
  const extractDir = 'd:\\spiritual setlist\\temp_pro_extract';
  if (!fs.existsSync(extractDir)) return null;
  
  const langCode = song.language === 'hindi' ? 'H' : song.language === 'konkani' ? 'K' : '';
  if (!langCode) return null;
  
  // Find all .pro files
  const proFiles = getAllProFiles(extractDir);
  
  for (const filePath of proFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Search for {t:LANG-NUMBER (KEY) TITLE}
      const pattern = new RegExp(`\\{t:${langCode}-${song.song_number}\\s+\\([^)]+\\)\\s+(.+)\\}`);
      const match = content.match(pattern);
      
      if (match) {
        // Extract the entire song content
        const startIndex = content.indexOf(match[0]);
        const nextSongPattern = /\n\{t:[EHMK]-\d+/;
        const nextMatch = content.substring(startIndex + match[0].length).match(nextSongPattern);
        
        let songContent;
        if (nextMatch) {
          songContent = content.substring(startIndex, startIndex + match[0].length + nextMatch.index);
        } else {
          songContent = content.substring(startIndex);
        }
        
        // Extract lyrics (remove ChordPro directives)
        let lyrics = songContent
          .replace(/\{t:[^}]+\}/g, '')
          .replace(/\{st:[^}]+\}/g, '')
          .replace(/\{c:[^}]+\}/g, '')
          .replace(/\{soc\}/g, '')
          .replace(/\{eoc\}/g, '')
          .replace(/\{start_of_chorus\}/g, '')
          .replace(/\{end_of_chorus\}/g, '')
          .replace(/\{comment:[^}]+\}/g, '')
          .trim();
        
        return lyrics;
      }
    } catch (error) {
      console.error(`Error reading ${filePath}: ${error.message}`);
    }
  }
  
  return null;
}

function getAllProFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllProFiles(filePath, fileList);
    } else if (file.endsWith('.pro')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

async function findAndFillMissingLyrics() {
  console.log('=== SEARCHING FOR MISSING LYRICS ===\n');
  
  const results = {
    found: [],
    notFound: []
  };
  
  for (const song of missingSongs) {
    console.log(`Searching for #${song.song_number}: ${song.title} (${song.language})`);
    
    let lyrics = null;
    
    // Try scratch files first
    if (song.language === 'hindi') {
      lyrics = searchHindiScratch(song);
      if (lyrics) {
        console.log(`  ✓ Found in scratch file`);
        results.found.push({ ...song, source: 'scratch', lyrics });
        continue;
      }
    }
    
    // Try ChordPro files
    lyrics = searchChordPro(song);
    if (lyrics) {
      console.log(`  ✓ Found in ChordPro file`);
      results.found.push({ ...song, source: 'chordpro', lyrics });
    } else {
      console.log(`  ✗ Not found`);
      results.notFound.push(song);
    }
  }
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Found: ${results.found.length} songs`);
  console.log(`Not found: ${results.notFound.length} songs`);
  
  // Save results
  fs.writeFileSync('found_lyrics.json', JSON.stringify(results.found, null, 2));
  fs.writeFileSync('not_found_lyrics.json', JSON.stringify(results.notFound, null, 2));
  console.log(`\nSaved to: found_lyrics.json, not_found_lyrics.json`);
  
  // Ask if user wants to update Supabase
  if (results.found.length > 0) {
    console.log(`\n${results.found.length} songs found. Ready to update Supabase?`);
  }
}

findAndFillMissingLyrics().catch(console.error);
