import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SECTION_RE = /\[(verse|chorus|chor|cho|chour|bridge|refrain|ending|intro|outro|pre-chorus|interlude|coda|solo|strophe)\]/i;

async function run() {
  let all = [];
  let from = 0; const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase.from('songs').select('id, song_number, title, language, chords').range(from, from + PAGE - 1);
    if (error) { console.error('ERR', error.message); break; }
    if (!data || !data.length) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const english = all.filter(s => (s.language || '').toLowerCase() === 'english');
  console.log(`total=${all.length} english=${english.length}`);

  const multiChorus = [];   // 2+ [Chorus] markers
  const doubledMarkers = []; // [Verse][Verse] adjacency
  const noMarkers = [];      // chord content with no section markers at all

  for (const s of english) {
    if (!s.chords || !s.chords.trim()) continue;
    const chorusCount = (s.chords.match(/\[chorus\]/gi) || []).length;
    const verseCount = (s.chords.match(/\[verse[^\]]*\]/gi) || []).length;
    const hasDouble = /\[verse[^\]]*\]\s*\n\s*\[verse[^\]]*\]/i.test(s.chords);
    const hasAnySection = SECTION_RE.test(s.chords);

    if (chorusCount >= 2) multiChorus.push({ s, chorusCount, verseCount });
    if (hasDouble) doubledMarkers.push({ s, verseCount });
    if (verseCount === 0 && chorusCount === 0 && !hasAnySection && /\S/.test(s.chords)) noMarkers.push(s);
  }

  console.log(`\n=== songs with 2+ [Chorus] markers: ${multiChorus.length} ===`);
  for (const { s, chorusCount, verseCount } of multiChorus) {
    console.log(`  #${s.song_number} | ${s.title} | choruses=${chorusCount} verses=${verseCount}`);
  }

  console.log(`\n=== songs with doubled [Verse][Verse] markers: ${doubledMarkers.length} ===`);
  for (const { s, verseCount } of doubledMarkers) {
    console.log(`  #${s.song_number} | ${s.title} | verses=${verseCount}`);
  }

  console.log(`\n=== english songs with content but NO section markers: ${noMarkers.length} ===`);
  for (const s of noMarkers) {
    console.log(`  #${s.song_number} | ${s.title}`);
  }

  const fs = await import('fs');
  fs.writeFileSync('C:/Users/Lenovo/AppData/Local/Temp/opencode/english_anomalies.json', JSON.stringify({ multiChorus: multiChorus.map(x => x.s), doubledMarkers: doubledMarkers.map(x => ({ id: x.s.id, num: x.s.song_number, title: x.s.title })), noMarkers: noMarkers.map(x => ({ id: x.id, num: x.song_number, title: x.title })) }, null, 1));
}

run().catch(console.error);