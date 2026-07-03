const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

// MySQL connection
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

async function queryBlessTheLord() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  console.log('=== QUERYING "BLESS THE LORD" SONGS ===\n');

  // Connect to MySQL
  const mysqlConnection = await mysql.createConnection(mysqlConfig);
  console.log('✓ Connected to MySQL');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✓ Connected to Supabase\n');

  // Query MySQL (using chords since lyrics column doesn't exist)
  console.log('📌 MYSQL RESULTS:');
  console.log('─────────────────────────────────────────────────────────────────────────────');
  const [mysqlSongs] = await mysqlConnection.execute(
    `SELECT id, song_number, title, language, 
     LEFT(chords, 100) as chords_preview,
     CHAR_LENGTH(chords) as chords_length
     FROM songs 
     WHERE title LIKE '%BLESS THE LORD%' 
       AND language = 'english' 
       AND is_active = 1
     ORDER BY song_number`
  );

  if (mysqlSongs.length === 0) {
    console.log('No songs found in MySQL');
  } else {
    mysqlSongs.forEach(song => {
      console.log(`\n  ID: ${song.id}`);
      console.log(`  Song Number: ${song.song_number}`);
      console.log(`  Title: ${song.title}`);
      console.log(`  Language: ${song.language}`);
      console.log(`  Chords Length: ${song.chords_length} characters`);
      console.log(`  Chords Preview: ${song.chords_preview}...`);
    });
  }

  // Query Supabase
  console.log('\n\n📌 SUPABASE RESULTS:');
  console.log('─────────────────────────────────────────────────────────────────────────────');
  const { data: supabaseSongs, error } = await supabase
    .from('songs')
    .select('id, song_number, title, language, lyrics, chords')
    .ilike('title', '%BLESS THE LORD%')
    .eq('language', 'english')
    .eq('is_active', true)
    .order('song_number');

  if (error) {
    console.error('Error querying Supabase:', error);
  } else if (supabaseSongs.length === 0) {
    console.log('No songs found in Supabase');
  } else {
    supabaseSongs.forEach(song => {
      console.log(`\n  ID: ${song.id}`);
      console.log(`  Song Number: ${song.song_number}`);
      console.log(`  Title: ${song.title}`);
      console.log(`  Language: ${song.language}`);
      console.log(`  Chords Length: ${song.chords ? song.chords.length : 0} characters`);
      console.log(`  Lyrics Length: ${song.lyrics ? song.lyrics.length : 0} characters`);
      console.log(`  Chords Preview: ${song.chords ? song.chords.substring(0, 100) + '...' : 'NULL'}`);
      console.log(`  Lyrics Preview: ${song.lyrics ? song.lyrics.substring(0, 100) + '...' : 'NULL'}`);
    });
  }

  await mysqlConnection.end();
  console.log('\n\n=== END OF QUERY ===');
}

queryBlessTheLord().catch(console.error);
