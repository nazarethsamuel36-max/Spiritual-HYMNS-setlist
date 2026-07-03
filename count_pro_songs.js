const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ZIP_FILE = 'C:\\Users\\Lenovo\\Downloads\\Impsong.zip';
const EXTRACT_DIR = 'd:\\spiritual setlist\\temp_pro_extract';

// Extract zip file
function extractZip(zipPath, extractDir) {
  console.log(`Extracting ${zipPath} to ${extractDir}...`);
  
  // Create extract directory if it doesn't exist
  if (!fs.existsSync(extractDir)) {
    fs.mkdirSync(extractDir, { recursive: true });
  }
  
  // Use PowerShell to extract
  try {
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`, {
      stdio: 'inherit'
    });
    console.log('✓ Extraction complete');
  } catch (error) {
    console.error('Error extracting zip:', error.message);
    throw error;
  }
}

// Find all .pro files recursively
function findProFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findProFiles(filePath, fileList);
    } else if (file.endsWith('.pro')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Parse {t:...} tag to extract language, number, title
function parseTitleTag(tag) {
  // Pattern: {t:E-0015 (F) Rejoice in the Lord always}
  const match = tag.match(/\{t:([EHMK])-([0-9]+)\s+\(([^)]+)\)\s+(.+)\}/);
  
  if (match) {
    return {
      language: match[1], // E, H, M, K
      number: match[2],   // 0015
      key: match[3],      // F
      title: match[4]      // Rejoice in the Lord always
    };
  }
  
  return null;
}

// Get language name from code
function getLanguageName(code) {
  const names = {
    'E': 'English',
    'H': 'Hindi',
    'M': 'Marathi',
    'K': 'Konkani'
  };
  return names[code] || code;
}

// Process all .pro files
function processProFiles(proFiles) {
  const songs = {
    english: [],
    hindi: [],
    marathi: [],
    konkani: []
  };
  
  for (const filePath of proFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const match = line.match(/\{t:([EHMK])-([0-9]+)\s+\(([^)]+)\)\s+(.+)\}/);
        
        if (match) {
          const song = {
            language: match[1],
            number: match[2],
            key: match[3],
            title: match[4],
            file: path.basename(filePath)
          };
          
          const langName = getLanguageName(song.language).toLowerCase();
          if (songs[langName]) {
            songs[langName].push(song);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading ${filePath}: ${error.message}`);
    }
  }
  
  return songs;
}

async function main() {
  console.log('=== COUNTING SONGS FROM CHORDPRO FILES ===\n');
  
  // Extract zip
  extractZip(ZIP_FILE, EXTRACT_DIR);
  
  // Find all .pro files
  console.log('\nFinding .pro files...');
  const proFiles = findProFiles(EXTRACT_DIR);
  console.log(`✓ Found ${proFiles.length} .pro files\n`);
  
  // Process files
  console.log('Processing .pro files...');
  const songs = processProFiles(proFiles);
  
  // Report results
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    SONG COUNT REPORT                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 English songs:     ${songs.english.length}`);
  console.log(`📊 Hindi songs:       ${songs.hindi.length}`);
  console.log(`📊 Marathi songs:     ${songs.marathi.length}`);
  console.log(`📊 Konkani songs:    ${songs.konkani.length}`);
  console.log(`────────────────────────────────────────────────────────────────────────`);
  console.log(`📊 GRAND TOTAL:       ${songs.english.length + songs.hindi.length + songs.marathi.length + songs.konkani.length} songs\n`);
  
  // Show sample songs from each language
  if (songs.english.length > 0) {
    console.log('Sample English songs:');
    songs.english.slice(0, 5).forEach(song => {
      console.log(`  E-${song.number} (${song.key}): ${song.title}`);
    });
    if (songs.english.length > 5) {
      console.log(`  ... and ${songs.english.length - 5} more`);
    }
    console.log('');
  }
  
  if (songs.hindi.length > 0) {
    console.log('Sample Hindi songs:');
    songs.hindi.slice(0, 5).forEach(song => {
      console.log(`  H-${song.number} (${song.key}): ${song.title}`);
    });
    if (songs.hindi.length > 5) {
      console.log(`  ... and ${songs.hindi.length - 5} more`);
    }
    console.log('');
  }
  
  if (songs.marathi.length > 0) {
    console.log('Sample Marathi songs:');
    songs.marathi.slice(0, 5).forEach(song => {
      console.log(`  M-${song.number} (${song.key}): ${song.title}`);
    });
    if (songs.marathi.length > 5) {
      console.log(`  ... and ${songs.marathi.length - 5} more`);
    }
    console.log('');
  }
  
  if (songs.konkani.length > 0) {
    console.log('Sample Konkani songs:');
    songs.konkani.slice(0, 5).forEach(song => {
      console.log(`  K-${song.number} (${song.key}): ${song.title}`);
    });
    if (songs.konkani.length > 5) {
      console.log(`  ... and ${songs.konkani.length - 5} more`);
    }
    console.log('');
  }
  
  console.log('\n✓ Processing complete');
}

main().catch(console.error);
