import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const CHORUS_RE = /\[(chorus|chor|cho|chour)\]/i;

async function scan() {
  let all = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('songs')
      .select('id, song_number, title, language, chords')
      .range(from, from + PAGE - 1);
    if (error) { console.error('ERROR:', error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    console.log(`fetched ${all.length}...`);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  console.log(`\nTOTAL songs in Supabase: ${all.length}`);

  const starred = all.filter(s => !!s.chords && s.chords.includes('*'));
  const starredNoChorus = starred.filter(s => !CHORUS_RE.test(s.chords));
  const starredWithChorus = starred.filter(s => CHORUS_RE.test(s.chords));

  console.log(`songs with asterisk in chords: ${starred.length}`);
  console.log(`  WITH [Chorus] marker:      ${starredWithChorus.length}`);
  console.log(`  WITHOUT [Chorus] marker:   ${starredNoChorus.length}`);

  console.log('\n--- WITHOUT [Chorus] marker ---');
  for (const s of starredNoChorus) {
    const ast = (s.chords.match(/\*/g) || []).length;
    console.log(`  #${s.song_number} | ${s.title} | ${s.language} | asterisks=${ast}`);
  }

  console.log('\n--- WITH [Chorus] marker (count only) ---');
  for (const s of starredWithChorus) {
    const ast = (s.chords.match(/\*/g) || []).length;
    console.log(`  #${s.song_number} | ${s.title} | ${s.language} | asterisks=${ast} | chorus=yes`);
  }

  const fs = await import('fs');
  fs.writeFileSync('C:/Users/Lenovo/AppData/Local/Temp/opencode/supabase_starred.json', JSON.stringify({ all: all.length, starred, starredNoChorus, starredWithChorus }, null, 1));
}

scan().catch(console.error);