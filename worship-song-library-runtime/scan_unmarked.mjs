import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SECTION_RE = /^\s*\[(verse|chorus|chor|cho|chour|bridge|pre-chorus|refrain|ending|intro|outro|interlude|coda|solo|strophe)[^\]]*\]\s*$/i;

let all = [], from = 0; const P = 1000;
while (true) {
  const { data, error } = await supabase.from('songs').select('id, song_number, title, language, chords').range(from, from + P - 1);
  if (error) { console.error('ERR', error.message); break; }
  if (!data || !data.length) break;
  all = all.concat(data);
  if (data.length < P) break;
  from += P;
}
const eng = all.filter(x => (x.language || '').toLowerCase() === 'english');
console.log('english songs:', eng.length);

const unmarked = [];   // no section markers at all
const oneMarked = [];  // exactly one section marker
for (const s of eng) {
  if (!s.chords || !s.chords.trim()) continue;
  const lines = s.chords.split(/\r?\n/);
  const lyricLines = lines.filter(l => {
    const t = l.trim();
    return t !== '' && !SECTION_RE.test(t);
  });
  const markerCount = lines.filter(l => SECTION_RE.test(l.trim())).length;
  if (lyricLines.length <= 6) continue; // only "big songs"
  const payload = lyricLines.join(' ');
  if (markerCount === 0) unmarked.push({ num: s.song_number, title: s.title, id: s.id, lines: lyricLines.length, sample: payload.slice(0, 100) });
  else if (markerCount === 1) oneMarked.push({ num: s.song_number, title: s.title, id: s.id, lines: lyricLines.length, sample: payload.slice(0, 100) });
}

const fs = await import('fs');
console.log(`\nsongs with NO section markers (>6 lines): ${unmarked.length}`);
for (const s of unmarked) console.log(`  #${s.num} | ${s.title} | ${s.lines} lines | ${s.sample}...`);
console.log(`\nsongs with EXACTLY ONE section marker (>6 lines): ${oneMarked.length}`);
for (const s of oneMarked) console.log(`  #${s.num} | ${s.title} | ${s.lines} lines | ${s.sample}...`);
fs.writeFileSync('C:/Users/Lenovo/AppData/Local/Temp/opencode/unmarked_songs.json', JSON.stringify({ unmarked, oneMarked }, null, 1));