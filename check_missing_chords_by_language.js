const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function checkMissingChordsByLanguage() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('=== CHECKING MISSING CHORDS BY LANGUAGE ===\n');

  // Query songs grouped by language
  const { data: songs, error } = await supabase
    .from('songs')
    .select('language, chords, song_number, title')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching songs:', error);
    process.exit(1);
  }

  const stats = {};
  const missingSongs = {};

  songs.forEach((song) => {
    const lang = song.language || 'unknown';
    if (!stats[lang]) {
      stats[lang] = { total: 0, withChords: 0, missingChords: 0 };
      missingSongs[lang] = [];
    }

    stats[lang].total++;
    if (song.chords && song.chords.trim().length > 0) {
      stats[lang].withChords++;
    } else {
      stats[lang].missingChords++;
      missingSongs[lang].push({ song_number: song.song_number, title: song.title });
    }
  });

  // Print stats
  console.log('CHORDS STATISTICS BY LANGUAGE:\n');
  Object.keys(stats).forEach((lang) => {
    const stat = stats[lang];
    const percentage = ((stat.withChords / stat.total) * 100).toFixed(1);
    console.log(`${lang.toUpperCase()}:`);
    console.log(`  Total: ${stat.total}`);
    console.log(`  With Chords: ${stat.withChords} (${percentage}%)`);
    console.log(`  Missing Chords: ${stat.missingChords}`);
    console.log('');
  });

  // Print sample missing songs for each language
  console.log('\n=== SAMPLE SONGS MISSING CHORDS ===\n');
  Object.keys(missingSongs).forEach((lang) => {
    if (missingSongs[lang].length > 0) {
      console.log(`${lang.toUpperCase()} (showing first 10):`);
      missingSongs[lang].slice(0, 10).forEach((song) => {
        console.log(`  #${song.song_number}: ${song.title}`);
      });
      if (missingSongs[lang].length > 10) {
        console.log(`  ... and ${missingSongs[lang].length - 10} more`);
      }
      console.log('');
    }
  });
}

checkMissingChordsByLanguage().catch(console.error);
