const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, 'worship-song-library-runtime', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Strip chord markers to extract lyrics
function stripChords(text) {
  if (!text) return '';
  return text.replace(/\[[A-G][#b]?m?(?:\/[A-G][#b]?)?\]/g, '').trim();
}

async function fixBlessTheLordSongs() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('=== FIXING "BLESS THE LORD" SONGS ===\n');
  console.log(`Using SUPABASE_URL: ${SUPABASE_URL}`);
  console.log(`Using key type: ${SUPABASE_KEY.includes('service') ? 'SERVICE_KEY' : 'ANON_KEY'}\n`);

  // Song #5 (ID 686): Add lyrics from reference chords
  console.log('1. Processing Song #5 (ID 686): BLESS THE LORD O MY SOUL');
  const song5Chords = `[C]Bless the Lord, O my soul,
[F]Magnify His wonderful [C]Name
[C]For the glory of the [Am]Lord is [D7]mine for[G]ever,
[C]Jesus is [G]ever the [C]same;
[C]For the Lord has set me free,
[Am]And He's given me [D7]liber[G]ty,
[G]To tell the world that [C]Jesus is [G]mine,
[C]He has given me the [G]wine to make [D]my heart re[G]joice.
[G]And oil to make my [D]face to [G]shine.`;
  
  const song5Lyrics = stripChords(song5Chords);
  console.log(`   Lyrics extracted: ${song5Lyrics.length} chars`);
  
  const { data: data5, error: error5 } = await supabase
    .from('songs')
    .update({ lyrics: song5Lyrics, title: 'BLESS THE LORD O MY SOUL (Song 5)' })
    .eq('id', 686)
    .select();
  
  if (error5) {
    console.log(`   ❌ Error: ${error5.message}`);
    console.log(`   Details: ${JSON.stringify(error5)}`);
  } else {
    console.log(`   ✓ Updated lyrics and title for Song #5`);
    console.log(`   Returned data: ${JSON.stringify(data5)}`);
  }

  // Song #35 (ID 918): Add lyrics from reference chords
  console.log('\n2. Processing Song #35 (ID 918): BLESS THE LORD O MY SOUL');
  const song35Chords = `[C]Bless the Lord, O my soul,
[G]And all that is with[C]in me
[F]Bless His [G]holy [C]name,
[C]For He hath done great things,
[G]He hath done great [C]things
[F]Bless His [G]Holy [C]name.`;
  
  const song35Lyrics = stripChords(song35Chords);
  console.log(`   Lyrics extracted: ${song35Lyrics.length} chars`);
  
  const { data: data35, error: error35 } = await supabase
    .from('songs')
    .update({ lyrics: song35Lyrics, chords: song35Chords, title: 'BLESS THE LORD O MY SOUL (Song 35)' })
    .eq('id', 918)
    .select();
  
  if (error35) {
    console.log(`   ❌ Error: ${error35.message}`);
    console.log(`   Details: ${JSON.stringify(error35)}`);
  } else {
    console.log(`   ✓ Updated lyrics, chords and title for Song #35`);
    console.log(`   Returned data: ${JSON.stringify(data35)}`);
  }

  // Song #346 (ID 653): Add chords from JSON export
  console.log('\n3. Processing Song #346 (ID 653): BLESS THE LORD O MY SOUL');
  const song346Chords = `[D]Bless the Lord, O my soul,
[G]And all that is within me,
[A]Bless His Holy name.
[G]Bless the Lord, O my soul
And forget not all his benefits.
[G]Who forgiveth all thy iniquities;
[D]Who healeth all thy diseases ;
[G]Who redeemeth thy life from destruction;
[A]Who crowneth thee with loving kindness.
[D]He hath not dealt with us after our sins;
[G]Nor rewarded us according to our iniquities
[A]For as the heaven is high above the earth,
[D]So great is His mercy toward them that
[A]Fear Him.`;
  
  console.log(`   Chords extracted: ${song346Chords.length} chars`);
  
  const { data: data346, error: error346 } = await supabase
    .from('songs')
    .update({ chords: song346Chords, title: 'BLESS THE LORD O MY SOUL (Song 346)' })
    .eq('id', 653)
    .select();
  
  if (error346) {
    console.log(`   ❌ Error: ${error346.message}`);
    console.log(`   Details: ${JSON.stringify(error346)}`);
  } else {
    console.log(`   ✓ Updated chords and title for Song #346`);
    console.log(`   Returned data: ${JSON.stringify(data346)}`);
  }

  // Song #88 (ID 966): Add chords from reference chords
  console.log('\n4. Processing Song #88 (ID 966): COME BLESS THE LORD');
  const song88Chords = `[VERSE 1]
[D]Come bless the Lord,
All ye [G]servants of the [D]Lord,
Who [G]stand by [D]night,
In the [A]house of the [D]Lord,
Lift up your [D]hands in the [G]Holy [D]place,
And [A]bless the [D]Lord,
And [A]bless the [D]Lord.

O [D]taste and see that the [G]Lord is [D]good (3)
[D]Blessed is the [A]man,
who trusts in [D]Him.

He [D]lifted me up from the miry clay,
He [A]set my feet on the [D]Rock to stay,
He [D]put a song in my heart today
A [A]song of praise, a song of [D]praise.`;
  
  console.log(`   Chords extracted: ${song88Chords.length} chars`);
  
  const { data: data88, error: error88 } = await supabase
    .from('songs')
    .update({ chords: song88Chords })
    .eq('id', 966)
    .select();
  
  if (error88) {
    console.log(`   ❌ Error: ${error88.message}`);
    console.log(`   Details: ${JSON.stringify(error88)}`);
  } else {
    console.log(`   ✓ Updated chords for Song #88`);
    console.log(`   Returned data: ${JSON.stringify(data88)}`);
  }

  // Song #220 (ID 832): Disambiguate title only
  console.log('\n5. Processing Song #220 (ID 832): BLESS THE LORD O MY SOUL');
  const { data: data220, error: error220 } = await supabase
    .from('songs')
    .update({ title: 'BLESS THE LORD O MY SOUL (Song 220)' })
    .eq('id', 832)
    .select();
  
  if (error220) {
    console.log(`   ❌ Error: ${error220.message}`);
    console.log(`   Details: ${JSON.stringify(error220)}`);
  } else {
    console.log(`   ✓ Updated title for Song #220`);
    console.log(`   Returned data: ${JSON.stringify(data220)}`);
  }

  console.log('\n=== SUMMARY ===');
  console.log('✓ Song #5: Added lyrics from reference chords and disambiguated title');
  console.log('✓ Song #35: Added lyrics and chords from reference chords and disambiguated title');
  console.log('✓ Song #346: Added chords from JSON export and disambiguated title');
  console.log('✓ Song #88: Added chords from reference chords');
  console.log('✓ Song #220: Disambiguated title only (no chords found)');
  console.log('\nNote: All 4 "BLESS THE LORD O MY SOUL" songs now have unique titles');
}

fixBlessTheLordSongs().catch(console.error);
