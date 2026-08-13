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
const SKIP = new Set(['141','149','122','95','147','160','133','143','154','159','291','117','155','140','128','150','97']);
const props = JSON.parse(fs.readFileSync(OUT + 'stanza_proposals.json', 'utf8'));

function cleanText(t) {
  return t.split(/\r?\n/)
    .map(l => l.replace(/\s+$/, ''))
    .filter(l => l.trim() !== '' && !SECTION_RE.test(l.trim()))
    .join('\n');
}

const rows = [];
for (const p of props) {
  if (SKIP.has(String(p.num))) continue;
  const { data } = await supabase.from('songs').select('id, title, chords').eq('song_number', p.num).eq('language', 'english').single();
  if (!data) { rows.push({ num: p.num, title: p.title, status: 'NOTFOUND' }); continue; }
  const dbClean = cleanText(data.chords);
  const propClean = cleanText(p.rendered);
  rows.push({
    num: p.num, title: p.title, id: data.id, confidence: p.confidence,
    status: dbClean === propClean ? 'INTACT' : 'DIFF',
    dbLines: dbClean.split('\n').length, propLines: propClean.split('\n').length,
  });
}
fs.writeFileSync(OUT + 'stage_remaining.json', JSON.stringify(rows, null, 1));
for (const s of ['INTACT', 'DIFF', 'NOTFOUND']) {
  const g = rows.filter(r => r.status === s);
  console.log(`=== ${s}: ${g.length} ===`);
  for (const r of g) console.log(`  #${r.num} [${r.confidence}] ${r.title}`);
}