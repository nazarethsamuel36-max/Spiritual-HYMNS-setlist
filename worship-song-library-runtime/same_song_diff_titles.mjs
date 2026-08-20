import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/.env', 'utf8');
function kv(k) {
  const mm = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return mm ? mm[1].trim() : null;
}
const supa = createClient(kv('VITE_SUPABASE_URL'), kv('SUPABASE_SERVICE_ROLE_KEY'));
const { data, error } = await supa.from('songs').select('id, song_number, title, language, chords, lyrics').order('song_number');
if (error) { console.error('ERR', error); process.exit(1); }

// Two kinds of "same song under different titles":
// 1. Same song_number -> language variants (INTENDED)
// 2. Different song_number but identical/very-similar content (ACCIDENTAL dup)
const byNum = new Map();
for (const r of data) {
  if (!byNum.has(r.song_number)) byNum.set(r.song_number, []);
  byNum.get(r.song_number).push(r);
}

let multiLangNum = 0, singleNum = 0;
for (const [num, rows] of byNum) {
  if (rows.length > 1) { multiLangNum++; } else singleNum++;
}
console.log(`song_numbers with >1 row (language variants): ${multiLangNum}`);
console.log(`song_numbers with exactly 1 row: ${singleNum}`);

// Show a few example numbers with multiple language rows + different titles
console.log('\n=== Example: one song_number, several titles (INTENDED variants) ===');
let shown = 0;
for (const [num, rows] of byNum) {
  if (rows.length >= 3 && shown < 5) {
    console.log(`song_number ${num}:`);
    for (const r of rows) console.log(`  id=${r.id} [${r.language}] "${r.title}"`);
    shown++;
  }
}

// 2. True accidental dups: same lyrics content under DIFFERENT song_numbers
console.log('\n=== Same content but DIFFERENT song_number (actual duplicate?) ===');
const hash = new Map();
for (const r of data) {
  const k = ((r.chords||'').trim() + '||' + (r.lyrics||'').trim());
  if (k.length < 50) continue;
  if (!hash.has(k)) hash.set(k, []);
  hash.get(k).push(r);
}
let trueDupGroups = 0;
for (const [k, rows] of hash) {
  const nums = new Set(rows.map(r => r.song_number));
  if (nums.size > 1) {
    trueDupGroups++;
  }
}
console.log(`content-groups spanning >1 song_number: ${trueDupGroups}`);
let shown2 = 0;
for (const [k, rows] of hash) {
  const nums = new Set(rows.map(r => r.song_number));
  if (nums.size > 1 && shown2 < 6) {
    console.log(`  group: ${rows.map(r => `#${r.song_number} [${r.language}] "${r.title.slice(0,30)}"`).join('  |  ')}`);
    shown2++;
  }
}