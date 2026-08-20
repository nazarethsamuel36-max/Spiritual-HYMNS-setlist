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

// Load newest backup
const backupPath = 'D:/spiritual setlist/worship-song-library-runtime/songs_rows (2).sql';
const raw = fs.readFileSync(backupPath, 'utf8');

// Correct parser: capture groups 1=id, 2=song_number, 3=title, 4=language, 5=original_key, 6=chords, 7=artist, 8=lyrics
const rowRe = /\((\d+),\s*(\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(?:true|false),\s*((?:null|'[^']*')),\s*'((?:[^']|'')*)',\s*(?:true|false)\)/g;
const backup = new Map();
let m;
while ((m = rowRe.exec(raw)) !== null) {
  const id = Number(m[1]);
  const row = {
    id,
    song_number: Number(m[2]),
    title: m[3].replace(/''/g, "'"),
    language: m[4].replace(/''/g, "'"),
    original_key: m[5].replace(/''/g, "'"),
    chords: m[6].replace(/''/g, "'"),
    artist: m[7],
    lyrics: m[8].replace(/''/g, "'"),
  };
  backup.set(id, row);
}
console.log(`Backup parsed: ${backup.size} rows`);

// Which current rows have a backup row?
const currentIds = new Set(data.map(r => r.id));
let withBackup = 0, missingBackup = 0;
for (const r of data) {
  if (backup.has(r.id)) withBackup++; else missingBackup++;
}
console.log(`Current rows: ${data.length}, with backup: ${withBackup}, missing backup: ${missingBackup}`);

// For rows with backup, compare chords + lyrics
let differ = 0, same = 0;
const diffRows = [];
for (const r of data) {
  const b = backup.get(r.id);
  if (!b) continue;
  const curC = (r.chords || '').trim(), bakC = (b.chords || '').trim();
  const curL = (r.lyrics || '').trim(), bakL = (b.lyrics || '').trim();
  const d = (curC !== bakC) || (curL !== bakL);
  if (d) { differ++; diffRows.push({ ...r, bakChordsLen: bakC.length, bakLyricsLen: bakL.length, curChordsLen: curC.length, curLyricsLen: curL.length }); }
  else same++;
}
console.log(`Rows with backup: same=${same}, differ=${differ}`);

// Now: are the diff-rows concentrated among corrupted clusters (identical updated_at groups)?
// Group current rows by their exact content-hash within same song_number
const clusters = new Map();
for (const r of data) {
  const key = r.song_number;
  if (!clusters.has(key)) clusters.set(key, []);
  clusters.get(key).push(r);
}
let corruptNums = 0, corruptRows = 0;
const corruptSongNums = new Set();
for (const [num, rows] of clusters) {
  if (rows.length < 2) continue;
  const contentSet = new Set(rows.map(r => `${(r.chords||'').trim()}|${(r.lyrics||'').trim()}`));
  if (contentSet.size === 1 && rows.length >= 2) {
    const timeSet = new Set(rows.map(r => r.updated_at));
    if (timeSet.size === 1) {
      corruptNums++;
      corruptRows += rows.length;
      corruptSongNums.add(num);
    }
  }
}
console.log(`Corrupted clusters (identical content + same timestamp): ${corruptNums} song numbers, ${corruptRows} rows`);

// Do ALL corrupt rows differ from backup? And do NON-corrupt rows mostly match backup?
let corruptDiffer = 0, corruptSame = 0, nonCorruptDiffer = 0, nonCorruptSame = 0;
for (const r of data) {
  const b = backup.get(r.id);
  if (!b) continue;
  const d = ((r.chords||'').trim() !== (b.chords||'').trim()) || ((r.lyrics||'').trim() !== (b.lyrics||'').trim());
  if (corruptSongNums.has(r.song_number)) { if (d) corruptDiffer++; else corruptSame++; }
  else { if (d) nonCorruptDiffer++; else nonCorruptSame++; }
}
console.log(`In corrupt clusters: differ=${corruptDiffer}, same=${corruptSame}`);
console.log(`NOT in corrupt clusters: differ=${nonCorruptDiffer}, same=${nonCorruptSame}`);

// List non-corrupt rows that differ from backup (these are the Aug-13 fixes we must NOT lose)
console.log('\n=== NON-corrupt rows that DIFFER from backup (intentional Aug-13 edits?) ===');
const others = diffRows.filter(r => !corruptSongNums.has(r.song_number));
console.log(`Count: ${others.length}`);
for (const r of others.slice(0, 60)) {
  console.log(`#${r.song_number} id=${r.id} [${r.language}] ${r.title.slice(0,40)} upd=${r.updated_at} chords ${r.curChordsLen}->${r.bakChordsLen} lyrics ${r.curLyricsLen}->${r.bakLyricsLen}`);
}

// Aug-13 fix targets: are they in corrupt clusters or non-corrupt-differs?
const fixedNums = ['141','149','122','95','147','160','133','143','154','159','291','117','155','140','128','150','97','258','259','366','46','96','17'];
console.log('\n=== Aug-13 fixed song numbers status ===');
for (const num of fixedNums) {
  const n = Number(num);
  const rows = data.filter(r => r.song_number === n);
  if (!rows.length) { console.log(`#${num}: NOT FOUND`); continue; }
  const inCorrupt = corruptSongNums.has(n);
  let diffCount = 0;
  for (const r of rows) {
    const b = backup.get(r.id);
    if (b && ((r.chords||'').trim() !== (b.chords||'').trim() || (r.lyrics||'').trim() !== (b.lyrics||'').trim())) diffCount++;
  }
  console.log(`#${num} (${rows.length} rows, corruptCluster=${inCorrupt}, differFromBackup=${diffCount})`);
}

fs.writeFileSync('D:/spiritual setlist/worship-song-library-runtime/diff_report.json', JSON.stringify({ corruptRows, corruptNums, nonCorruptDiffer: others.length, others: others.map(r => ({ id: r.id, song_number: r.song_number, language: r.language, title: r.title })) }, null, 2));
console.log('\nSaved diff_report.json');
