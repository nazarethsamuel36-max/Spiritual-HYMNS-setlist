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

// ============ BUILD #154 full song (insert 4 missing verses after verse 1) ============
const d154 = (await supabase.from('songs').select('id, chords').eq('song_number', 154).eq('language', 'english').single()).data;
const L = d154.chords.split(/\r?\n/).map(l => l.replace(/\s+$/, '')).filter(l => l.trim() !== '' && !/^\s*\[(verse|chorus|chor|cho|chour|bridge|pre-chorus|refrain|ending|intro|outro|interlude|coda|solo|strophe)[^\]]*\]\s*$/i.test(l.trim()));

const chorus = ["Just like a [G]tree that''s planted by the [D]waters,", "I shall not be [A]moved."];
const newVerses = [
  ['[D]Glory Hallelujah, I shall not be [A]moved;', 'Anchored in Jehovah, I shall not be moved;'],
  ['[D]In His love abiding, I shall not be [A]moved;', 'And in Him confiding, I shall not be moved;'],
  ['[D]Though all hell assail me, I shall not be [A]moved;', 'Jesus will not fail me, I shall not be moved;'],
  ['[D]Though the tempest rages, I shall not be [A]moved;', 'On the rock of ages, I shall not be moved;'],
];

const sec154 = [
  { type: 'verse', lines: L.slice(0, 2) },
  { type: 'chorus', lines: L.slice(2, 8) },
  ...newVerses.flatMap(v => [{ type: 'verse', lines: v }, { type: 'chorus', lines: chorus }]),
  { type: 'verse', lines: L.slice(8, 10) },
  { type: 'chorus', lines: L.slice(10, 12) },
  { type: 'verse', lines: L.slice(12, 14) },
  { type: 'chorus', lines: L.slice(14, 16) },
  { type: 'verse', lines: L.slice(16, 18) },
  { type: 'chorus', lines: L.slice(18, 20) },
];

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

const renders = {};
renders['154'] = render(sec154);

// ============ LOAD keepers from detected proposals ============
const props = JSON.parse(fs.readFileSync(OUT + 'stanza_proposals.json', 'utf8'));
const keepers = ['141', '149', '122', '95', '147', '160', '133'];
for (const k of keepers) {
  const p = props.find(x => String(x.num) === k && x.confidence === 'high');
  renders[k] = p.rendered;
}

// ============ LOAD corrected 10 (except 154 which we override) ============
const corrected = JSON.parse(fs.readFileSync(OUT + 'corrected_10.json', 'utf8'));
for (const c of corrected) {
  if (String(c.num) === '154') continue;
  renders[String(c.num)] = c.rendered;
}

const order = [...keepers, 143, 154, 159, 291, 117, 155, 140, 128, 150, 97];
console.log('Preview of what will be written:\n');
for (const num of order) {
  console.log(`#${num}: sections rendered, ${renders[String(num)].split('\n').length} lines`);
}
fs.writeFileSync('C:/Users/Lenovo/AppData/Local/Temp/opencode/final_all_17.json', JSON.stringify(renders, null, 1));

// ============ APPLY ============
const results = [];
for (const num of order) {
  const { data: song } = await supabase.from('songs').select('id, title').eq('song_number', num).eq('language', 'english').single();
  if (!song) { console.log(`#${num} NOT FOUND`); continue; }
  const { error } = await supabase.from('songs').update({ chords: renders[String(num)] }).eq('id', song.id);
  results.push({ num, title: song.title, ok: !error, err: error?.message });
  console.log(`#${num} ${song.title} → ${error ? 'FAIL ' + error.message : 'UPDATED'}`);
}
fs.writeFileSync(OUT + 'apply_results.json', JSON.stringify(results, null, 1));