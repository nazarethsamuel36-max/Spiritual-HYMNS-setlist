// Transliteration Audit Script
// Run with: node transliteration_audit.js

import { db } from './src/db/Database.js';

async function generateTransliterationReport() {
  console.log('=== TRANSLITERATION AUDIT REPORT ===\n');
  
  const allSongs = await db.songIndex.toArray();
  const hindiSongs = allSongs.filter(s => s.language?.toLowerCase() === 'hindi');
  const marathiSongs = allSongs.filter(s => s.language?.toLowerCase() === 'marathi');
  
  console.log(`Total Hindi songs: ${hindiSongs.length}`);
  console.log(`Total Marathi songs: ${marathiSongs.length}\n`);
  
  // Import transliteration functions
  const { buildSearchDocument } = await import('./src/utils/SearchDocumentBuilder.js');
  
  console.log('=== HINDI SONGS ===\n');
  for (const song of hindiSongs.slice(0, 10)) { // Show first 10 for demo
    const searchDoc = buildSearchDocument(song);
    console.log(`Song #${song.songNumber} (ID: ${song.id})`);
    console.log(`Language: ${song.language}`);
    console.log(`Original Title: ${song.title}`);
    console.log(`titleSearch: ${searchDoc.titleSearch}`);
    console.log(`artistSearch: ${searchDoc.artistSearch || '(none)'}`);
    console.log('---\n');
  }
  
  console.log('=== MARATHI SONGS ===\n');
  for (const song of marathiSongs.slice(0, 10)) { // Show first 10 for demo
    const searchDoc = buildSearchDocument(song);
    console.log(`Song #${song.songNumber} (ID: ${song.id})`);
    console.log(`Language: ${song.language}`);
    console.log(`Original Title: ${song.title}`);
    console.log(`titleSearch: ${searchDoc.titleSearch}`);
    console.log(`artistSearch: ${searchDoc.artistSearch || '(none)'}`);
    console.log('---\n');
  }
}

generateTransliterationReport().catch(console.error);
