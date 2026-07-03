const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function compareLyricsData() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('=== COMPARING HINDI VS ENGLISH LYRICS DATA ===\n');

  // Get a Hindi song
  const { data: hindiSong, error: hindiError } = await supabase
    .from('songs')
    .select('id, song_number, title, language, lyrics')
    .eq('language', 'hindi')
    .not('lyrics', 'is', null)
    .limit(1)
    .single();

  if (hindiError) {
    console.error('Error fetching Hindi song:', hindiError);
  } else {
    console.log('📌 HINDI SONG:');
    console.log(`  Title: ${hindiSong.title}`);
    console.log(`  Song #: ${hindiSong.song_number}`);
    console.log(`  Language: ${hindiSong.language}`);
    console.log(`  Lyrics present: ${!!hindiSong.lyrics}`);
    console.log(`  Lyrics length: ${hindiSong.lyrics?.length || 0} chars`);
    console.log(`  Lyrics type: ${typeof hindiSong.lyrics}`);
    console.log(`  Lyrics preview (first 200 chars):`);
    console.log(`    "${hindiSong.lyrics?.substring(0, 200)}..."`);
    console.log(`  Lyrics raw (first 500 chars):`);
    console.log(`    ${JSON.stringify(hindiSong.lyrics?.substring(0, 500))}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Get an English song
  const { data: englishSong, error: englishError } = await supabase
    .from('songs')
    .select('id, song_number, title, language, lyrics')
    .eq('language', 'english')
    .not('lyrics', 'is', null)
    .limit(1)
    .single();

  if (englishError) {
    console.error('Error fetching English song:', englishError);
  } else {
    console.log('📌 ENGLISH SONG:');
    console.log(`  Title: ${englishSong.title}`);
    console.log(`  Song #: ${englishSong.song_number}`);
    console.log(`  Language: ${englishSong.language}`);
    console.log(`  Lyrics present: ${!!englishSong.lyrics}`);
    console.log(`  Lyrics length: ${englishSong.lyrics?.length || 0} chars`);
    console.log(`  Lyrics type: ${typeof englishSong.lyrics}`);
    console.log(`  Lyrics preview (first 200 chars):`);
    console.log(`    "${englishSong.lyrics?.substring(0, 200)}..."`);
    console.log(`  Lyrics raw (first 500 chars):`);
    console.log(`    ${JSON.stringify(englishSong.lyrics?.substring(0, 500))}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Check if there's a pattern issue - sample multiple English songs
  console.log('📌 SAMPLING 5 ENGLISH SONGS FOR PATTERN ANALYSIS:\n');
  const { data: englishSongs, error: englishSongsError } = await supabase
    .from('songs')
    .select('id, song_number, title, lyrics')
    .eq('language', 'english')
    .not('lyrics', 'is', null)
    .limit(5);

  if (englishSongsError) {
    console.error('Error fetching English songs:', englishSongsError);
  } else {
    englishSongs.forEach((song, idx) => {
      console.log(`${idx + 1}. #${song.song_number}: ${song.title}`);
      console.log(`   Lyrics length: ${song.lyrics?.length || 0} chars`);
      console.log(`   First 100 chars: "${song.lyrics?.substring(0, 100)}..."`);
      console.log('');
    });
  }
}

compareLyricsData().catch(console.error);
