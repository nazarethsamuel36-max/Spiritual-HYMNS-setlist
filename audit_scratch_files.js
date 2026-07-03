const fs = require('fs');
const path = require('path');

// Get all scratch files by language
function getScratchFiles() {
  const files = {
    english: [],
    hindi: [],
    marathi: [],
    konkani: []
  };

  const rootDir = 'd:\\spiritual setlist';
  
  // Find all files
  const allFiles = getAllFiles(rootDir);
  
  for (const file of allFiles) {
    const fileName = path.basename(file).toLowerCase();
    
    // English scratch files
    if (fileName.startsWith('scratch_english') && fileName.endsWith('.md')) {
      files.english.push(file);
    }
    
    // Hindi scratch files
    if (fileName.startsWith('scratch_hindi') && fileName.endsWith('.md')) {
      files.hindi.push(file);
    }
    
    // Marathi scratch files
    if (fileName.includes('marathi') && fileName.endsWith('.md') && !fileName.includes('node_modules')) {
      files.marathi.push(file);
    }
    
    // Konkani scratch files
    if (fileName.includes('konkani') && fileName.endsWith('.md')) {
      files.konkani.push(file);
    }
  }
  
  return files;
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, target, and Spiritual-HYMNS-setlist directories
      if (!file.includes('node_modules') && !file.includes('target') && !file.includes('Spiritual-HYMNS-setlist') && !file.includes('worship-song-library-runtime')) {
        getAllFiles(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Count songs in English scratch files (pattern: ### SONG X — TITLE)
function countEnglishSongs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/### SONG \d+ —/g);
    return matches ? matches.length : 0;
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return 0;
  }
}

// Count songs in Hindi scratch files (pattern: ### X - TITLE)
function countHindiSongs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/^### \d+ - /gm);
    return matches ? matches.length : 0;
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return 0;
  }
}

// Count songs in Marathi scratch files (pattern: NUMBER: X)
function countMarathiSongs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/^NUMBER: \d+$/gm);
    return matches ? matches.length : 0;
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return 0;
  }
}

// Count songs in Konkani scratch files
function countKonkaniSongs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Try various patterns
    const patterns = [
      /^### \d+ - /gm,
      /^NUMBER: \d+$/gm,
      /^### SONG \d+ —/gm
    ];
    
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) return matches.length;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return 0;
  }
}

async function auditScratchFiles() {
  console.log('=== SCRATCH FILES AUDIT ===\n');
  
  const files = getScratchFiles();
  
  console.log('📁 FILES FOUND:');
  console.log(`  English: ${files.english.length} files`);
  console.log(`  Hindi: ${files.hindi.length} files`);
  console.log(`  Marathi: ${files.marathi.length} files`);
  console.log(`  Konkani: ${files.konkani.length} files`);
  console.log('');
  
  // Count English songs
  let englishTotal = 0;
  console.log('📊 ENGLISH SCRATCH FILES:');
  for (const file of files.english) {
    const count = countEnglishSongs(file);
    const fileName = path.basename(file);
    console.log(`  ${fileName}: ${count} songs`);
    englishTotal += count;
  }
  console.log(`  Total English songs: ${englishTotal}\n`);
  
  // Count Hindi songs
  let hindiTotal = 0;
  console.log('📊 HINDI SCRATCH FILES:');
  for (const file of files.hindi) {
    const count = countHindiSongs(file);
    const fileName = path.basename(file);
    console.log(`  ${fileName}: ${count} songs`);
    hindiTotal += count;
  }
  console.log(`  Total Hindi songs: ${hindiTotal}\n`);
  
  // Count Marathi songs
  let marathiTotal = 0;
  console.log('📊 MARATHI SCRATCH FILES:');
  for (const file of files.marathi) {
    const count = countMarathiSongs(file);
    const fileName = path.basename(file);
    console.log(`  ${fileName}: ${count} songs`);
    marathiTotal += count;
  }
  console.log(`  Total Marathi songs: ${marathiTotal}\n`);
  
  // Count Konkani songs
  let konkaniTotal = 0;
  console.log('📊 KONKANI SCRATCH FILES:');
  for (const file of files.konkani) {
    const count = countKonkaniSongs(file);
    const fileName = path.basename(file);
    console.log(`  ${fileName}: ${count} songs`);
    konkaniTotal += count;
  }
  console.log(`  Total Konkani songs: ${konkaniTotal}\n`);
  
  // Grand total
  const grandTotal = englishTotal + hindiTotal + marathiTotal + konkaniTotal;
  
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY REPORT                                            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log(`\n  Total English songs in scratch files:     ${englishTotal}`);
  console.log(`  Total Hindi songs in scratch files:       ${hindiTotal}`);
  console.log(`  Total Marathi songs in scratch files:     ${marathiTotal}`);
  console.log(`  Total Konkani songs in scratch files:    ${konkaniTotal}`);
  console.log(`  ─────────────────────────────────────────────────────────────────────────`);
  console.log(`  GRAND TOTAL:                              ${grandTotal} songs\n`);
}

auditScratchFiles().catch(console.error);
