import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('D:/spiritual setlist/worship-song-library-runtime/.env', 'utf8');
function kv(k) {
  const mm = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return mm ? mm[1].trim() : null;
}
const supa = createClient(kv('VITE_SUPABASE_URL'), kv('SUPABASE_SERVICE_ROLE_KEY'));
const { data, error } = await supa.from('songs').select('id, song_number, title, language, chords, lyrics, updated_at').order('song_number');
if (error) { console.error('ERR', error); process.exit(1); }

// Corruption window: 2026-08-14 04:28:00 to 04:31:00 UTC
const winStart = new Date('2026-08-14T04:28:00Z').getTime();
const winEnd = new Date('2026-08-14T04:31:00Z').getTime();

const affected = data.filter(r => {
  const t = new Date(r.updated_at).getTime();
  return t >= winStart && t <= winEnd;
});
console.log(`Rows updated in corruption window (04:28-04:31 UTC): ${affected.length}`);

// Which song_numbers
const nums = new Set(affected.map(r => r.song_number));
console.log(`Distinct song_numbers affected: ${nums.size}`);

// Group by language
const byLang = {};
for (const r of affected) { byLang[r.language] = (byLang[r.language] || 0) + 1; }
console.log('By language:', JSON.stringify(byLang));

// How many of these are in identical-clusters vs single-row songs
const clusterNums = new Set();
const byNum = new Map();
for (const r of data) {
  if (!byNum.has(r.song_number)) byNum.set(r.song_number, []);
  byNum.get(r.song_number).push(r);
}
for (const [num, rows] of byNum) {
  if (rows.length < 2) continue;
  const contentSet = new Set(rows.map(r => `${(r.chords||'').trim()}|${(r.lyrics||'').trim()}`));
  const timeSet = new Set(rows.map(r => r.updated_at));
  if (contentSet.size === 1 && timeSet.size === 1) clusterNums.add(num);
}
const windowedCluster = affected.filter(r => clusterNums.has(r.song_number));
const windowedSingle = affected.filter(r => !clusterNums.has(r.song_number));
console.log(`Windowed rows in identical-clusters: ${windowedCluster.length}`);
console.log(`Windowed rows NOT in clusters (single-row songs or non-identical): ${windowedSingle.length}`);

// List non-cluster windowed rows (these are single-language songs overwritten too)
console.log('\n=== Windowed single-row / non-cluster songs (could be legit or collateral) ===');
for (const r of windowedSingle.slice(0, 80)) {
  console.log(`#${r.song_number} id=${r.id} [${r.language}] ${r.title.slice(0,45)} upd=${r.updated_at}`);
}

// Save full affected list
fs.writeFileSync('D:/spiritual setlist/worship-song-library-runtime/affected_window.json', JSON.stringify({ count: affected.length, nums: nums.size, rows: affected.map(r => ({ id: r.id, song_number: r.song_number, language: r.language, title: r.title, updated_at: r.updated_at })) }, null, 1));
console.log('\nSaved affected_window.json');
