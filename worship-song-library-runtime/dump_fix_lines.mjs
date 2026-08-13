import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SECTION_RE = /^\s*\[[^\]]*\]\s*$/i;
const FIX = new Set([83,153,138,144,129,135,151,126,123,127,146,130,152,20,66,121,88,89,90,69,72,21,61,24,4,76,74,139,82,109,118,345,30,115,102,125,64,136,145,22,101,99,42,45,158,100]);

let report = '';
for (const n of FIX) {
  const { data } = await supabase.from('songs').select('id, song_number, title, chords').eq('song_number', n).eq('language', 'english').single();
  const lines = data.chords.split(/\r?\n/).map(l => l.replace(/\s+$/, '')).filter(l => l.trim() !== '' && !SECTION_RE.test(l.trim()));
  report += `===== #${n} | ${data.title} (${lines.length} lines) =====\n`;
  lines.forEach((l, i) => { report += `${String(i).padStart(2)}| ${l}\n`; });
  report += '\n';
}
fs.writeFileSync('C:/Users/Lenovo/AppData/Local/Temp/opencode/fix_lines_dump.txt', report);
console.log('written', report.length, 'bytes');