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

const SECTION_RE = /^\s*\[[^\]]*\]\s*$/i;
async function cleanLines(num) {
  const { data } = await supabase.from('songs').select('id, song_number, title, chords').eq('song_number', num).eq('language', 'english').single();
  if (!data) throw new Error(`#${num} not found`);
  const lines = data.chords.split(/\r?\n/).map(l => l.replace(/\s+$/, ''));
  const out = lines.filter(l => !SECTION_RE.test(l.trim()) && l.trim() !== '');
  return { id: data.id, num: data.song_number, title: data.title, lines: out };
}
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
const V = (a, b) => ({ type: 'verse', lines: null, a, b });
const C = (a, b) => ({ type: 'chorus', lines: null, a, b });

// line-index based section definitions (into clean line array)
const fixes = {
  83:  (L) => [V(0,4), V(4,8), C(8,10)],
  153: (L) => [V(0,4), C(4,8), V(8,12), V(12,16), V(16,20)],
  138: (L) => [V(0,4), C(4,8), V(8,12), V(12,16), V(16,20), V(20,24)],
  144: (L) => [V(0,4), C(4,8), V(8,16), V(16,20)],
  129: (L) => [V(0,4), C(4,8), V(8,12), V(12,16), V(16,20)],
  135: (L) => [V(0,4), C(4,8), V(8,12), V(12,16), V(16,20)],
  151: (L) => [V(0,4), C(4,8), V(8,12), V(12,16), V(16,20)],
  126: (L) => [V(0,4), C(4,8), V(8,12)],
  123: (L) => [V(0,4), C(4,8), V(8,12), V(12,16)],
  127: (L) => [V(0,4), C(4,7), V(7,11), V(11,15), V(15,19)],
  146: (L) => [V(0,8), C(8,12), V(12,16), V(16,20), V(20,24), V(24,28)],
  130: (L) => [V(0,4), C(4,8), V(8,12), V(12,16), V(16,20)],
  152: (L) => [V(0,4), C(4,8), V(8,12), V(12,16), V(16,20), V(20,24), V(24,28)],
  20:  (L) => [V(0,4), C(4,9)],
  66:  (L) => [C(0,5), V(5,9), C(9,10)],
  121: (L) => [V(0,8), C(8,12), V(12,20), V(20,28), V(28,36), V(36,40)],
  88:  (L) => [V(0,7), V(7,10), V(10,14)],
  89:  (L) => [V(0,4), C(4,12), V(12,16)],
  90:  (L) => [V(0,4), C(4,11)],
  69:  (L) => [V(0,4), V(4,9)],
  72:  (L) => [V(0,4), C(4,6), V(6,10)],
  21:  (L) => [V(0,4), V(4,9)],
  61:  (L) => [C(0,4), V(4,7)],
  24:  (L) => [V(0,4), V(4,9)],
  4:   (L) => [V(0,4), V(4,8)],
  76:  (L) => [V(0,5), C(5,12)],
  74:  (L) => [V(0,2), V(2,5), V(5,7)],
  139: (L) => [V(0,4), V(4,8)],
  82:  (L) => [V(0,4), V(4,7), V(7,11)],
  109: (L) => [V(0,4), V(4,9), V(9,15), V(15,19)],
  118: (L) => [V(0,4), C(4,8), V(8,12)],
  345: (L) => [V(0,4), V(4,9)],
  30:  (L) => [C(0,3), V(3,8), C(8,9)],
  115: (L) => [V(0,5), V(5,11)],
  102: (L) => [V(0,7), V(7,10), V(10,15)],
  125: (L) => [V(0,4), C(4,8), V(8,12), V(12,16), V(16,20)],
  64:  (L) => [V(0,6), V(6,11)],
  136: (L) => [V(0,4), C(4,8), V(8,12), V(12,16), V(16,20), V(20,24)],
  145: (L) => [V(0,4), C(4,12), V(12,16)],
  22:  (L) => [V(0,4), V(4,9)],
  101: (L) => [C(0,3), V(3,11)],
  99:  (L) => [V(0,4), C(4,9), V(9,11)],
  42:  (L) => [V(0,5), V(5,9)],
  45:  (L) => [V(0,4), V(4,8), V(8,10)],
  158: (L) => [V(0,6), C(6,12), V(12,16), V(16,20)],
  100: (L) => [V(0,6), V(6,12)],
};

const results = [];
for (const [num, fn] of Object.entries(fixes)) {
  const s = await cleanLines(Number(num));
  const sections = fn(s.lines).map(sec => ({ type: sec.type, lines: s.lines.slice(sec.a, sec.b) }));
  const flat = sections.flatMap(x => x.lines);
  const same = flat.length === s.lines.length && flat.every((l, i) => l === s.lines[i]);
  results.push({ ...s, sections, rendered: render(sections), intact: same });
  console.log(`#${s.num} ${s.title} — ${sections.map(x => `${x.type === 'chorus' ? 'C' : 'V'}(${x.lines.length})`).join(' ')} content=${same ? 'OK' : 'LOSS'}`);
}

fs.writeFileSync(OUT + 'handfix_46.json', JSON.stringify(results, null, 1));
let report = 'HAND-FIXED STRUCTURES (46 songs)\n\n';
for (const r of results) {
  report += `===== #${r.num} | ${r.title} =====\n${r.rendered}\n\n\n`;
}
fs.writeFileSync('D:/spiritual setlist/worship-song-library-runtime/REVIEW_handfix_46.txt', report);
console.log('\nwritten REVIEW_handfix_46.txt');