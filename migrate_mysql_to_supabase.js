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

// The 43 missing English songs
const missingSongs = [
  'Amazing Grace',
  'How Great Thou Art',
  'Blessed Assurance',
  'Great Is Thy Faithfulness',
  'What A Friend We Have In Jesus',
  '10,000 Reasons (Bless The Lord)',
  'In Christ Alone',
  'Oceans (Where Feet May Fail)',
  'Goodness of God',
  'Way Maker',
  'What A Beautiful Name',
  'Revelation Song',
  'Cornerstone',
  'Mighty To Save',
  'Here I Am To Worship',
  'Holy Holy Holy',
  'It Is Well With My Soul',
  'Be Thou My Vision',
  'Come Thou Fount Of Every Blessing',
  'Rock Of Ages',
  'Joyful Joyful We Adore Thee',
  'Crown Him With Many Crowns',
  'A Mighty Fortress Is Our God',
  'Nearer My God To Thee',
  'The Old Rugged Cross',
  'I Surrender All',
  'When I Survey The Wondrous Cross',
  'To God Be The Glory',
  'Just As I Am',
  'In The Garden',
  'How Great Is Our God',
  'Forever (We Sing Hallelujah)',
  'Your Grace Is Enough',
  'Blessed Be Your Name',
  'How He Loves',
  'Our God',
  'Everlasting God',
  'Shout To The Lord',
  'Lord I Lift Your Name On High',
  'Agnus Dei',
  'sam',
  'BLESS THE LORD O MY SOUL'
];

// Strip chord markers from chords text to create clean lyrics
function stripChordsFromText(chordsText) {
  if (!chordsText) return '';
  
  // Remove chord markers like [G], [C#m], [F/A], etc.
  return chordsText.replace(/\[[A-G][#b]?m?(?:\/[A-G][#b]?)?\]/g, '').trim();
}

async function migrateFromMySQL() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('Connecting to MySQL...');
  const mysqlConnection = await mysql.createConnection(mysqlConfig);
  console.log('Connected to MySQL successfully');
  
  // First, check the table structure
  console.log('\n=== Checking MySQL table structure ===');
  const [columns] = await mysqlConnection.execute('DESCRIBE songs');
  console.log('Columns in songs table:');
  columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
  
  let foundInMySQL = [];
  let notFoundInMySQL = [];
  let successfullyUpdated = [];
  let updateErrors = [];
  
  for (const songTitle of missingSongs) {
    try {
      console.log(`\n--- Processing: ${songTitle} ---`);
      
      // Query MySQL for this song (case-insensitive)
      const [rows] = await mysqlConnection.execute(
        'SELECT id, song_number, title, chords FROM songs WHERE LOWER(title) = LOWER(?) LIMIT 1',
        [songTitle]
      );
      
      if (rows.length === 0) {
        console.log(`❌ Not found in MySQL`);
        notFoundInMySQL.push(songTitle);
        continue;
      }
      
      const mysqlSong = rows[0];
      console.log(`✓ Found in MySQL (ID: ${mysqlSong.id}, song_number: ${mysqlSong.song_number})`);
      
      if (!mysqlSong.chords || mysqlSong.chords.trim() === '') {
        console.log(`⚠ No chords in MySQL, skipping`);
        foundInMySQL.push({ title: songTitle, hasLyrics: false });
        continue;
      }
      
      // Extract lyrics from chords by stripping chord markers
      const lyrics = stripChordsFromText(mysqlSong.chords);
      
      if (!lyrics || lyrics.trim() === '') {
        console.log(`⚠ No lyrics after stripping chords, skipping`);
        foundInMySQL.push({ title: songTitle, hasLyrics: false });
        continue;
      }
      
      console.log(`✓ Lyrics extracted from chords (${lyrics.length} characters)`);
      foundInMySQL.push({ title: songTitle, hasLyrics: true });
      
      // Find matching song in Supabase by title and language
      const { data: supabaseSong, error: fetchError } = await supabase
        .from('songs')
        .select('id, song_number, title, language')
        .ilike('title', songTitle.trim())
        .eq('language', 'english')
        .maybeSingle();
      
      if (fetchError || !supabaseSong) {
        console.log(`❌ Not found in Supabase`);
        updateErrors.push({ title: songTitle, error: 'Not found in Supabase' });
        continue;
      }
      
      console.log(`✓ Found in Supabase (ID: ${supabaseSong.id}, song_number: ${supabaseSong.song_number})`);
      
      // Update Supabase with lyrics extracted from MySQL chords
      const { error: updateError } = await supabase
        .from('songs')
        .update({ lyrics })
        .eq('id', supabaseSong.id);
      
      if (updateError) {
        console.log(`❌ Error updating Supabase: ${updateError.message}`);
        updateErrors.push({ title: songTitle, error: updateError.message });
        continue;
      }
      
      console.log(`✓ Successfully updated Supabase`);
      successfullyUpdated.push(songTitle);
      
    } catch (error) {
      console.error(`❌ Error processing ${songTitle}:`, error.message);
      updateErrors.push({ title: songTitle, error: error.message });
    }
  }
  
  await mysqlConnection.end();
  
  console.log('\n\n=== SUMMARY ===');
  console.log(`Total songs checked: ${missingSongs.length}`);
  console.log(`Found in MySQL: ${foundInMySQL.length}`);
  console.log(`Not found in MySQL: ${notFoundInMySQL.length}`);
  console.log(`Successfully updated in Supabase: ${successfullyUpdated.length}`);
  console.log(`Update errors: ${updateErrors.length}`);
  
  if (notFoundInMySQL.length > 0) {
    console.log('\n=== SONGS NOT FOUND IN MYSQL ===');
    notFoundInMySQL.forEach(title => console.log(`  - ${title}`));
  }
  
  if (updateErrors.length > 0) {
    console.log('\n=== UPDATE ERRORS ===');
    updateErrors.forEach(({ title, error }) => console.log(`  - ${title}: ${error}`));
  }
  
  if (successfullyUpdated.length > 0) {
    console.log('\n=== SUCCESSFULLY UPDATED ===');
    successfullyUpdated.forEach(title => console.log(`  ✓ ${title}`));
  }
}

migrateFromMySQL().catch(console.error);
