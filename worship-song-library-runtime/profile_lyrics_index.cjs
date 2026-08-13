/**
 * Lyrics Index Profiling Script
 * 
 * Measures the cost of building a lyrics search index from IndexedDB
 * This helps determine if the IndexedDB-based approach is performant enough
 * or if we need a pre-generated lyrics_search.json file.
 */

const MiniSearch = require('minisearch');

// Simulate the LyricsDocumentBuilder logic
function buildLyricsDocument(song) {
  if (!song.lyrics) return null;
  
  // Remove chord markers like [G], [Am], etc.
  let lyrics = song.lyrics.replace(/\[[^\]]+\]/g, '');
  
  // Remove section markers like [Verse], [Chorus], etc.
  lyrics = lyrics.replace(/\[Verse\]|\[Chorus\]|\[Bridge\]|\[Intro\]|\[Outro\]/gi, '');
  
  // Remove other formatting markers
  lyrics = lyrics.replace(/\{[^}]+\}/g, ''); // Remove {brackets}
  lyrics = lyrics.replace(/<[^>]+>/g, ''); // Remove <html>
  
  // Normalize whitespace
  lyrics = lyrics.replace(/\s+/g, ' ').trim();
  
  // Lowercase for search
  const lyricsSearch = lyrics.toLowerCase();
  
  if (!lyricsSearch || lyricsSearch.length < 10) return null;
  
  return {
    id: song.id,
    songNumber: song.songNumber,
    title: song.title,
    language: song.language,
    lyricsSearch: lyricsSearch
  };
}

async function profileLyricsIndex() {
  console.log('=== LYRICS INDEX PROFILING START ===\n');
  
  try {
    // Import Dexie dynamically
    const Dexie = require('dexie');
    
    // Open the database
    console.log('Step 1: Opening IndexedDB...');
    const dbOpenStart = performance.now();
    const db = new Dexie('WorshipDatabase');
    db.version(7).stores({
      songs: 'id, songNumber, language, updated_at',
      songIndex: 'id, songNumber, title, language, searchTokens',
    });
    await db.open();
    const dbOpenEnd = performance.now();
    console.log(`✓ IndexedDB opened in ${(dbOpenEnd - dbOpenStart).toFixed(2)}ms\n`);
    
    // Read all songs from IndexedDB
    console.log('Step 2: Reading songs from IndexedDB...');
    const readStart = performance.now();
    const songs = await db.songs.toArray();
    const readEnd = performance.now();
    console.log(`✓ Read ${songs.length} songs in ${(readEnd - readStart).toFixed(2)}ms\n`);
    
    // Generate lyrics documents
    console.log('Step 3: Generating lyrics search documents...');
    const docGenStart = performance.now();
    const lyricsDocuments = songs
      .map(buildLyricsDocument)
      .filter(doc => doc !== null);
    const docGenEnd = performance.now();
    console.log(`✓ Generated ${lyricsDocuments.length} lyrics documents in ${(docGenEnd - docGenStart).toFixed(2)}ms`);
    console.log(`  (Filtered out ${songs.length - lyricsDocuments.length} songs without sufficient lyrics)\n`);
    
    // Build MiniSearch index
    console.log('Step 4: Building MiniSearch index...');
    const indexBuildStart = performance.now();
    const miniSearch = new MiniSearch({
      fields: ['lyricsSearch', 'title'],
      storeFields: ['id', 'songNumber', 'title', 'language'],
      searchOptions: {
        boost: { lyricsSearch: 1, title: 0.5 },
        fuzzy: 0.2,
        prefix: true
      }
    });
    miniSearch.addAll(lyricsDocuments);
    const indexBuildEnd = performance.now();
    console.log(`✓ Built MiniSearch index in ${(indexBuildEnd - indexBuildStart).toFixed(2)}ms\n`);
    
    // Test search performance
    console.log('Step 5: Testing search performance...');
    const testQueries = [
      'grace',
      'how sweet',
      'yeshu',
      'praise',
      'love'
    ];
    
    const searchStart = performance.now();
    for (const query of testQueries) {
      const results = miniSearch.search(query);
      console.log(`  Query "${query}": ${results.length} results`);
    }
    const searchEnd = performance.now();
    console.log(`✓ Completed ${testQueries.length} test searches in ${(searchEnd - searchStart).toFixed(2)}ms\n`);
    
    // Calculate total
    const totalStart = dbOpenStart;
    const totalEnd = indexBuildEnd;
    const totalTime = totalEnd - totalStart;
    
    console.log('=== PROFILING RESULTS ===');
    console.log(`Total songs in database: ${songs.length}`);
    console.log(`Songs with lyrics: ${lyricsDocuments.length}`);
    console.log(`\nTime Breakdown:`);
    console.log(`  - Open IndexedDB: ${(dbOpenEnd - dbOpenStart).toFixed(2)}ms`);
    console.log(`  - Read songs: ${(readEnd - readStart).toFixed(2)}ms`);
    console.log(`  - Generate lyrics documents: ${(docGenEnd - docGenStart).toFixed(2)}ms`);
    console.log(`  - Build MiniSearch index: ${(indexBuildEnd - indexBuildStart).toFixed(2)}ms`);
    console.log(`\nTotal initialization time: ${totalTime.toFixed(2)}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log('\n=== LYRICS INDEX PROFILING END ===');
    
    // Close database
    await db.close();
    
    // Recommendation
    console.log('\n=== RECOMMENDATION ===');
    if (totalTime < 2000) {
      console.log('✓ Performance is EXCELLENT (< 2s). Proceed with IndexedDB-based approach.');
    } else if (totalTime < 5000) {
      console.log('⚠ Performance is ACCEPTABLE (< 5s). Proceed with IndexedDB-based approach.');
    } else {
      console.log('✗ Performance is SLOW (> 5s). Consider pre-generated lyrics_search.json.');
    }
    
  } catch (error) {
    console.error('Error during profiling:', error);
    process.exit(1);
  }
}

// Run the profiling
profileLyricsIndex().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
