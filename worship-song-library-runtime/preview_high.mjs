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

const props = JSON.parse(fs.readFileSync(OUT + 'stanza_proposals.json', 'utf8'));
const high = props.filter(p => p.confidence === 'high');

let report = '';
for (const p of high) {
  const orig = (await supabase.from('songs').select('chords').eq('id', p.id).single()).data.chords;
  const origClean = orig.split(/\r?\n/).filter(l => l.trim() !== '' && !/^\s*\[(verse|chorus|chor|cho|chour|bridge|pre-chorus|refrain|ending|intro|outro|interlude|coda|solo|strophe)[^\]]*\]\s*$/i.test(l.trim())).join('\n');
  // proposed: strip markers+blank lines to compare content
  const propLines = p.rendered.split(/\r?\n/).filter(l => l.trim() !== '' && !/^\[(Verse \d+|Chorus)\]$/.test(l.trim()));
  const propClean = propLines.join('\n');
  const same = origClean === propClean;
  const markerOrder = p.rendered.split(/\r?\n/).filter(l => /^\[(Verse \d+|Chorus)\]$/.test(l.trim())).join(' → ');
  report += `### #${p.num} | ${p.title}  ${same ? '✅ content identical' : '⚠️ CONTENT CHANGED'}\n`;
  report += `Structure: ${markerOrder}\n\n`;
}
fs.writeFileSync(OUT + 'high_diffs.txt', report);
console.log(report);
console.log('\nSee stanza_high.txt for full proposed text of each song.');