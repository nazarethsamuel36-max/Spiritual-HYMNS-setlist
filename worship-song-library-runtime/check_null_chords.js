import fs from 'fs';

const sqlFile = fs.readFileSync('songs_rows (2).sql', 'utf8');

// Split by INSERT statements and parse each one
const insertStatements = sqlFile.split(/\),\s*\(/g);

const updateStatements = [];

insertStatements.forEach((stmt, index) => {
  // Skip the first one (it's the INSERT INTO part)
  if (index === 0) return;
  
  // Try to extract the song data
  const parts = stmt.match(/(\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(true|false),\s*(null|true|false),\s*'([^']*)'/);
  
  if (parts) {
    const [, id, songNumber, title, language, originalKey, chords, isActive, isPublished, lyrics] = parts;
    
    // Check if chords is null, empty, or only contains section markers without actual lyrics
    const hasNoChords = chords === 'null' || 
                        chords.trim() === '' || 
                        chords === '[Verse]' ||
                        chords === '[Chorus]' ||
                        chords.match(/^\[(Verse|Chorus)\]\s*null$/i) ||
                        chords.match(/^\[Verse\]\s+null$/i) ||
                        chords.length < 30;
    
    // Check if lyrics column has actual content
    const hasLyricsInLyricsColumn = lyrics !== 'null' && 
                                    lyrics.trim() !== '' && 
                                    lyrics.length > 30;
    
    if (isActive === 'true' && hasNoChords && hasLyricsInLyricsColumn) {
      // Process lyrics: add verse markers if missing
      let processedLyrics = lyrics;
      
      // Check if lyrics already has section markers
      const hasSectionMarkers = lyrics.match(/\[(Verse|Chorus|Bridge|Intro|Outro)/i);
      
      if (!hasSectionMarkers) {
        // Split by blank lines and add [Verse] markers
        const paragraphs = lyrics.split(/\n\s*\n/).filter(p => p.trim());
        processedLyrics = paragraphs.map((para, i) => {
          return `[Verse ${i + 1}]\n${para.trim()}`;
        }).join('\n\n');
      }
      
      // Escape single quotes for SQL
      const escapedLyrics = processedLyrics.replace(/'/g, "''");
      const escapedTitle = title.replace(/'/g, "''");
      
      // Generate UPDATE statement
      updateStatements.push(
        `UPDATE songs SET chords = '${escapedLyrics}' WHERE id = ${id} AND song_number = ${songNumber}; -- ${escapedTitle}`
      );
    }
  }
});

const output = `-- Generated ${updateStatements.length} UPDATE statements to copy lyrics to chords column
-- Verse markers added to songs missing section markers

${updateStatements.join('\n\n')}`;

fs.writeFileSync('fix_chords.sql', output);
console.log(`Generated ${updateStatements.length} UPDATE statements in fix_chords.sql`);
