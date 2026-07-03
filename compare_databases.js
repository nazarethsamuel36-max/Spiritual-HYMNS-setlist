const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

// MySQL connection (from DBConnection.java fallback)
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root123',
  database: process.env.MYSQL_DATABASE || 'worship_db',
  charset: 'utf8mb4'
};

// Supabase connection
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Normalize title for comparison
function normalizeTitle(title) {
  return title ? title.trim().toLowerCase() : '';
}

// Create a unique key for song matching
function createSongKey(title, language) {
  return `${normalizeTitle(title)}|${language}`;
}

async function compareDatabases() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  console.log('=== READ-ONLY DATABASE COMPARISON ===\n');
  console.log('Connecting to MySQL...');
  const mysqlConnection = await mysql.createConnection(mysqlConfig);
  console.log('✓ Connected to MySQL');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✓ Connected to Supabase\n');

  // Fetch active songs from MySQL
  console.log('Fetching active songs from MySQL...');
  const [mysqlSongs] = await mysqlConnection.execute(
    'SELECT id, song_number, title, language, chords FROM songs WHERE is_active = 1'
  );
  console.log(`✓ Fetched ${mysqlSongs.length} active songs from MySQL\n`);

  // Fetch active songs from Supabase
  console.log('Fetching active songs from Supabase...');
  const { data: supabaseSongs, error: supabaseError } = await supabase
    .from('songs')
    .select('id, song_number, title, language, chords')
    .eq('is_active', true);
  
  if (supabaseError) {
    console.error('Error fetching from Supabase:', supabaseError);
    await mysqlConnection.end();
    process.exit(1);
  }
  console.log(`✓ Fetched ${supabaseSongs.length} active songs from Supabase\n`);

  // Create maps for easy lookup
  const mysqlMap = new Map();
  mysqlSongs.forEach(song => {
    const key = createSongKey(song.title, song.language);
    mysqlMap.set(key, song);
  });

  const supabaseMap = new Map();
  supabaseSongs.forEach(song => {
    const key = createSongKey(song.title, song.language);
    supabaseMap.set(key, song);
  });

  // Find differences
  const onlyInMySQL = [];
  const onlyInSupabase = [];
  const differentSongNumber = [];
  const differentChords = [];

  // Check MySQL songs
  for (const [key, mysqlSong] of mysqlMap) {
    const supabaseSong = supabaseMap.get(key);
    
    if (!supabaseSong) {
      onlyInMySQL.push(mysqlSong);
    } else {
      // Compare song_number
      if (mysqlSong.song_number !== supabaseSong.song_number) {
        differentSongNumber.push({
          title: mysqlSong.title,
          language: mysqlSong.language,
          mysql_song_number: mysqlSong.song_number,
          supabase_song_number: supabaseSong.song_number
        });
      }
      
      // Compare chords
      const mysqlChords = mysqlSong.chords || '';
      const supabaseChords = supabaseSong.chords || '';
      if (mysqlChords !== supabaseChords) {
        differentChords.push({
          title: mysqlSong.title,
          language: mysqlSong.language,
          mysql_chords_length: mysqlChords.length,
          supabase_chords_length: supabaseChords.length
        });
      }
    }
  }

  // Check Supabase-only songs
  for (const [key, supabaseSong] of supabaseMap) {
    if (!mysqlMap.has(key)) {
      onlyInSupabase.push(supabaseSong);
    }
  }

  await mysqlConnection.end();

  // Generate report
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    DATABASE COMPARISON REPORT                                ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  console.log('📊 SUMMARY');
  console.log('─────────────────────────────────────────────────────────────────────────────');
  console.log(`Total active songs in MySQL:      ${mysqlSongs.length}`);
  console.log(`Total active songs in Supabase:   ${supabaseSongs.length}`);
  console.log(`Songs only in MySQL:              ${onlyInMySQL.length}`);
  console.log(`Songs only in Supabase:           ${onlyInSupabase.length}`);
  console.log(`Songs with different song_number: ${differentSongNumber.length}`);
  console.log(`Songs with different chords:      ${differentChords.length}\n`);

  if (onlyInMySQL.length > 0) {
    console.log('🔴 SONGS ONLY IN MYSQL');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    onlyInMySQL.forEach(song => {
      console.log(`  • ${song.song_number}: ${song.title} [${song.language}] (MySQL ID: ${song.id})`);
    });
    console.log('');
  }

  if (onlyInSupabase.length > 0) {
    console.log('🟢 SONGS ONLY IN SUPABASE');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    onlyInSupabase.forEach(song => {
      console.log(`  • ${song.song_number}: ${song.title} [${song.language}] (Supabase ID: ${song.id})`);
    });
    console.log('');
  }

  if (differentSongNumber.length > 0) {
    console.log('🟡 SONGS WITH DIFFERENT SONG_NUMBER');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    differentSongNumber.forEach(diff => {
      console.log(`  • ${diff.title} [${diff.language}]`);
      console.log(`    MySQL song_number:      ${diff.mysql_song_number}`);
      console.log(`    Supabase song_number:   ${diff.supabase_song_number}`);
    });
    console.log('');
  }

  if (differentChords.length > 0) {
    console.log('🟡 SONGS WITH DIFFERENT CHORDS');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    differentChords.forEach(diff => {
      console.log(`  • ${diff.title} [${diff.language}]`);
      console.log(`    MySQL chords length:      ${diff.mysql_chords_length} chars`);
      console.log(`    Supabase chords length:   ${diff.supabase_chords_length} chars`);
    });
    console.log('');
  }

  if (onlyInMySQL.length === 0 && onlyInSupabase.length === 0 && 
      differentSongNumber.length === 0 && differentChords.length === 0) {
    console.log('✅ No differences found! Both databases are in sync.\n');
  }

  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    END OF REPORT                                             ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
}

compareDatabases().catch(console.error);
