import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const sections = ['verse', 'chorus', 'chor', 'cho', 'chour', 'bridge', 'pre-chorus', 'refrain', 'ending', 'intro', 'outro', 'interlude', 'coda', 'solo', 'strophe'];
const isSection = (m) => sections.includes(m) || /^verse\s*\d*\s*(\[[^\]]+\])*$/.test(m);

function parseBlocks(chords) {
  const lines = chords.split(/\r?\n/);
  const blocks = [];
  let cur = null;
  for (const raw of lines) {
    const t = raw.trim();
    const m = t.match(/^\[([^\]]+)\]$/i);
    if (m && isSection(m[1].trim().toLowerCase())) {
      if (cur) blocks.push(cur);
      cur = { type: m[1].trim().toLowerCase(), lines: [] };
      continue;
    }
    if (t === '') continue;
    if (!cur) cur = { type: '(untagged)', lines: [] };
    cur.lines.push(t);
  }
  if (cur) blocks.push(cur);
  return blocks;
}

const REPEAT_RE = /^\(?\s*(repeat|chorus|twice|2x|2 x|\(\s*2\s*\))\s*\)?\s*/i;

function transform(chords) {
  const blocks = parseBlocks(chords);
  if (blocks.length < 3) return null;
  if (blocks[0].type !== 'verse' || !blocks[0].lines.length) return null;
  if (blocks[1].type !== 'chorus' || !blocks[1].lines.length) return null;

  // Verse 1 = body + tag
  const verse1 = [...blocks[0].lines, ...blocks[1].lines];

  // Find real chorus = next non-empty non-(Repeat) chorus block
  let chorus = null;
  let i = 2;
  for (; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === 'chorus' && b.lines.length && !REPEAT_RE.test(b.lines[0])) {
      chorus = b.lines;
      i++;
      break;
    }
  }
  if (!chorus) return null;

  // Remaining verse blocks
  const verses = [];
  for (; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === 'verse' && b.lines.length) verses.push(b.lines);
  }

  let out = '';
  out += '[Verse 1]\n' + verse1.join('\n') + '\n\n';
  out += '[Chorus]\n' + chorus.join('\n') + '\n\n';
  verses.forEach((v, vi) => {
    out += `[Verse ${vi + 2}]\n` + v.join('\n') + '\n\n';
  });
  out = out.trimEnd();
  if ((out.match(/\[Chorus\]/g) || []).length !== 1) return null;
  return out;
}

const GROUP1 = [162, 163, 169, 170, 173, 174, 175, 180, 185, 186, 188, 193, 196, 201, 207, 210, 211, 224, 225, 243, 262, 266, 278, 292, 293, 309, 361, 373, 376, 377];

async function run() {
  const { data, error } = await supabase.from('songs').select('id, song_number, title, chords').in('song_number', GROUP1);
  if (error) { console.error('ERR', error.message); process.exit(1); }
  console.log('fetched', data.length, 'songs\n');

  let updated = 0, failed = [];
  for (const s of data) {
    if (!s.chords) { failed.push([s.song_number, 'no chords']); continue; }
    const before = (s.chords.match(/\[chorus\]/gi) || []).length;
    const newCh = transform(s.chords);
    if (!newCh) { failed.push([s.song_number, 'transform rejected']); continue; }
    const { error: ue } = await supabase.from('songs').update({ chords: newCh }).eq('id', s.id);
    if (ue) { failed.push([s.song_number, 'update: ' + ue.message]); continue; }
    const after = (newCh.match(/\[Chorus\]/g) || []).length;
    console.log(`#${s.song_number} ${s.title}: ${before} choruses -> ${after} chorus ✓`);
    updated++;
  }
  console.log(`\nupdated=${updated}`);
  if (failed.length) { console.log('FAILED/EXCLUDED:'); failed.forEach(f => console.log('  ', f[0], f[1])); }
}

run().catch(console.error);