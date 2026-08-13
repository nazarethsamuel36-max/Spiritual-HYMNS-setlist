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

let report = 'DIFF REVIEW — HIGH CONFIDENCE (17 songs)\n\n';
for (const p of high) {
  const orig = (await supabase.from('songs').select('chords').eq('id', p.id).single()).data.chords;
  report += `════════ #${p.num} | ${p.title} ════════\n`;
  report += `--- ORIGINAL ---\n${orig}\n\n--- PROPOSED ---\n${p.rendered}\n\n\n`;
}
fs.writeFileSync('D:/spiritual setlist/worship-song-library-runtime/REVIEW_high_17.txt', report);
console.log('written REVIEW_high_17.txt,', high.length, 'songs');