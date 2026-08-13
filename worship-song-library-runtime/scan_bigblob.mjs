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
  const { data } = await supabase.from('songs').select('id, song_number, title, language, chords').range(from, from + P - 1);
  if (!data || !data.length) break;
  all = all.concat(data);
  if (data.length < P) break;
  from += P;
}
const eng = all.filter(x => (x.language || '').toLowerCase() === 'english');

const big = []; // >6 lyric lines, <2 section markers
for (const s of eng) {
  if (!s.chords || !s.chords.trim()) continue;
  const lines = s.chords.split(/\r?\n/);
  const markers = lines.filter(l => SECTION_RE.test(l.trim()));
  const lyricLines = lines.filter(l => { const t = l.trim(); return t !== '' && !SECTION_RE.test(t); });
  if (lyricLines.length > 6 && markers.length < 2) {
    // count blank-line paragraph breaks between lyric lines
    const raw = s.chords.split(/\r?\n/);
    let paragraphBreaks = 0;
    for (let i = 1; i < raw.length; i++) {
      if (raw[i].trim() === '' && raw[i - 1].trim() !== '') paragraphBreaks++;
    }
    big.push({ num: s.song_number, title: s.title, id: s.id, lines: lyricLines.length, markers: markers.length, breaks: paragraphBreaks });
  }
}
big.sort((a, b) => b.lines - a.lines);
console.log(`big songs (${big.length}) with <2 section markers:`);
for (const s of big) {
  console.log(`  #${s.num} | ${s.title} | ${s.lines} lines | markers=${s.markers} | paragraphBreaks=${s.breaks}`);
}