import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const OUT = 'C:/Users/Lenovo/AppData/Local/Temp/opencode/';

const SECTION_RE = /^\s*\[(verse|chorus|chor|cho|chour|bridge|pre-chorus|refrain|ending|intro|outro|interlude|coda|solo|strophe)[^\]]*\]\s*$/i;

// strip leading marker + blank lines => clean line array
async function cleanLines(num) {
  const { data } = await supabase.from('songs').select('id, song_number, title, chords').eq('song_number', num).eq('language', 'english').single();
  if (!data) throw new Error(`#${num} not found`);
  const lines = data.chords.split(/\r?\n/).map(l => l.replace(/\s+$/, ''));
  const out = lines.filter(l => !SECTION_RE.test(l.trim()) && l.trim() !== '');
  return { id: data.id, num: data.song_number, title: data.title, lines: out };
}

// build rendered text from sections: sections = [{type:'verse'|'chorus', lines:[...]}]
function render(sections) {
  const parts = [];
  let v = 0;
  for (const s of sections) {
    if (s.type === 'chorus') parts.push('[Chorus]');
    else { v++; parts.push(`[Verse ${v}]`); }
    parts.push(s.lines.join('\n'));
    parts.push('');
  }
  return parts.join('\n').replace(/\n{3,}/g, '\n\n');
}

// ---- corrected structures (line indices into clean array) ----
const fixes = {
  154: (L) => [
    { type: 'verse', lines: L.slice(0, 2) },
    { type: 'chorus', lines: L.slice(2, 8) },
    { type: 'verse', lines: L.slice(8, 10) },
    { type: 'chorus', lines: L.slice(10, 12) },
    { type: 'verse', lines: L.slice(12, 14) },
    { type: 'chorus', lines: L.slice(14, 16) },
    { type: 'verse', lines: L.slice(16, 18) },
    { type: 'chorus', lines: L.slice(18, 20) },
  ],
  159: (L) => [
    { type: 'verse', lines: L.slice(0, 8) },
    { type: 'verse', lines: L.slice(8, 16) },
    { type: 'verse', lines: L.slice(16, 24) },
  ],
  143: (L) => [
    { type: 'verse', lines: L.slice(0, 10) },
    { type: 'verse', lines: L.slice(10, 18) },
    { type: 'verse', lines: L.slice(18, 26) },
    { type: 'verse', lines: L.slice(26, 32) },
  ],
  291: (L) => [
    { type: 'verse', lines: L.slice(0, 7) },
    { type: 'verse', lines: L.slice(7, 13) },
  ],
  117: (L) => [
    { type: 'verse', lines: L.slice(0, 5) },
    { type: 'verse', lines: L.slice(5, 10) },
  ],
  155: (L) => [
    { type: 'verse', lines: L.slice(0, 8) },
    { type: 'chorus', lines: L.slice(8, 16) },
    { type: 'verse', lines: L.slice(16, 24) },
    { type: 'verse', lines: L.slice(24, 32) },
    { type: 'verse', lines: L.slice(32, 40) },
    { type: 'verse', lines: L.slice(40, 48) },
    { type: 'verse', lines: L.slice(48, 56) },
  ],
  140: (L) => [
    { type: 'verse', lines: L.slice(0, 6) },
    { type: 'verse', lines: L.slice(6, 10) },
    { type: 'verse', lines: L.slice(10, 14) },
    { type: 'verse', lines: L.slice(14, 18) },
  ],
  128: (L) => [
    { type: 'verse', lines: L.slice(0, 4) },
    { type: 'chorus', lines: L.slice(4, 12) },
    { type: 'verse', lines: L.slice(12, 18) },
    { type: 'verse', lines: L.slice(18, 24) },
  ],
  150: (L) => [
    { type: 'verse', lines: L.slice(0, 3) },
    { type: 'chorus', lines: L.slice(3, 8) },
    { type: 'verse', lines: L.slice(8, 11) },
    { type: 'verse', lines: L.slice(11, 13) },
    { type: 'verse', lines: L.slice(13, 15) },
    { type: 'chorus', lines: L.slice(15, 16) },
  ],
  97: (L) => [
    { type: 'verse', lines: L.slice(0, 3) },
    { type: 'chorus', lines: L.slice(3, 6) },
    { type: 'verse', lines: L.slice(6, 12) },
    { type: 'verse', lines: L.slice(12, 18) },
    { type: 'verse', lines: L.slice(18, 24) },
  ],
};

const results = [];
for (const [num, fn] of Object.entries(fixes)) {
  const s = await cleanLines(Number(num));
  const sections = fn(s.lines);
  // verify all lines consumed in order
  const flat = sections.flatMap(x => x.lines);
  const same = flat.length === s.lines.length && flat.every((l, i) => l === s.lines[i]);
  results.push({ ...s, sections, rendered: render(sections), intact: same });
  console.log(`#${s.num} ${s.title} — sections=${sections.map(x => `${x.type==='chorus'?'C':'V'}(${x.lines.length})`).join(' ')} content=${same ? 'OK' : '⚠️ LINE LOSS'}`);
}

fs.writeFileSync(OUT + 'corrected_10.json', JSON.stringify(results, null, 1));
let report = 'CORRECTED STRUCTURES (10 songs)\n\n';
for (const r of results) {
  report += `════════ #${r.num} | ${r.title} ════════\n${r.rendered}\n\n\n`;
}
fs.writeFileSync('D:/spiritual setlist/worship-song-library-runtime/REVIEW_corrected_10.txt', report);
console.log('\nwritten REVIEW_corrected_10.txt');