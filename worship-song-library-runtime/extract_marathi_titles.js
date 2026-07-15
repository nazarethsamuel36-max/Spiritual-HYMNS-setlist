// Marathi Title Extraction Script
// This script extracts all Marathi song titles from exports/index.json
// for audit purposes before transliteration implementation

import fs from 'fs';
import path from 'path';

async function extractMarathiTitles() {
  console.log('=== MARATHI TITLE EXTRACTION REPORT ===\n');
  
  try {
    // Read the exports/index.json file
    const indexPath = path.join(process.cwd(), '../exports/index.json');
    const rawData = fs.readFileSync(indexPath, 'utf-8');
    const data = JSON.parse(rawData);
    
    const allSongs = data.songs || [];
    console.log(`Total songs in exports/index.json: ${allSongs.length}\n`);
    
    // Filter only Marathi songs
    const marathiSongs = allSongs.filter(song => {
      const lang = song.language?.toLowerCase().trim();
      return lang === 'marathi' || lang === 'mar' || lang === 'mr';
    });
    
    console.log(`Total Marathi songs found: ${marathiSongs.length}\n`);
    console.log('=== MARATHI SONG TITLES ===\n');
    
    // Generate report for each Marathi song
    for (const song of marathiSongs.sort((a, b) => a.songNumber - b.songNumber)) {
      console.log(`Song #${song.songNumber}`);
      console.log(`ID: ${song.id}`);
      console.log('');
      console.log(`Original Title:`);
      console.log(song.title);
      console.log('');
      console.log(`Future titleSearch:`);
      console.log('[Pending Transliteration]');
      console.log('');
      console.log('---');
      console.log('');
    }
    
    console.log('=== SUMMARY ===');
    console.log(`Total Marathi songs: ${marathiSongs.length}`);
    console.log(`These titles will be transformed into titleSearch = Original + Transliterated`);
    console.log('');
    console.log('=== END OF REPORT ===');
    
  } catch (error) {
    console.error('Error extracting Marathi titles:', error);
    process.exit(1);
  }
}

// Run the extraction
extractMarathiTitles()
  .then(() => {
    console.log('Extraction complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
