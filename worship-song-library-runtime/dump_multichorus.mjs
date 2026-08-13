import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const sections = ['verse', 'chorus', 'chor', 'cho', 'chour', 'bridge', 'pre-chorus', 'refrain', 'ending', 'intro', 'outro', 'interlude', 'coda', 'solo', 'strophe'];

async function run() {
  let from = 0; const PAGE = 1000; let all = [];
  while (true) {
    const { data, error } = await supabase.from('songs').select('id, song_number, title, language, chords').range(from, from + PAGE - 1);
    if (error) { console.error('ERR', error.message); break; }
    if (!data || !data.length) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  const english = all.filter(s => (s.language || '').toLowerCase() === 'english');

  const out = {};
  for (const s of english) {
    if (!s.chords) continue;
    const chorusCount = (s.chords.match(/\[chorus\]/gi) || []).length;
    if (chorusCount < 2) continue;

    // Build a structural view: split lines, classify markers vs content
    const lines = s.chords.split(/\r?\n/);
    const blocks = [];
    let cur = null;
    for (const raw of lines) {
      const t = raw.trim();
      const m = t.match(/^\[([^\]]+)\]$/i);
      if (m) {
        const nm = m[1].trim().toLowerCase();
        if (sections.includes(nm) || /^verse\s*\d*\s*(\[[^\]]+\])*$/.test(nm)) {
          if (cur) blocks.push(cur);
          cur = { type: nm, lines: [] };
          continue;
        }
      }
      if (t === '') { if (cur) { cur.hadBlank = true; } continue; }
      if (!cur) { cur = { type: '(untagged)', lines: [] }; }
      cur.lines.push(t.replace(/\*\*/g, '*'));
    }
    if (cur) blocks.push(cur);

    out[s.song_number] = {
      num: s.song_number, title: s.title, id: s.id,
      blocks: blocks.map(b => ({
        type: b.type,
        first: b.lines[0] ? b.lines[0].slice(0, 80) : '',
        last: b.lines.length ? b.lines[b.lines.length - 1].slice(0, 80) : '',
        n: b.lines.length,
        blank: !!b.hadBlank
      }))
    };
  }

  const nums = Object.keys(out).sort((a, b) => +a - +b);
  let report = '';
  for (const n of nums) {
    const s = out[n];
    report += `\n${'='.repeat(90)}\n#${s.num} | ${s.title}\n`;
    s.blocks.forEach((b, i) => report += `  [${i}] ${b.type.padEnd(10)} n=${b.n} blankAfter=${b.blank}\n       first: ${b.first}\n       last:  ${b.last}\n`);
  }
  fs.writeFileSync('C:/Users/Lenovo/AppData/Local/Temp/opencode/multichorus_structure.txt', report);
  fs.writeFileSync('C:/Users/Lenovo/AppData/Local/Temp/opencode/multichorus_blocks.json', JSON.stringify(out, null, 1));
  console.log('wrote', nums.length, 'songs');
}

run().catch(console.error);