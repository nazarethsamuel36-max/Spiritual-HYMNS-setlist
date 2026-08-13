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
  const blocks = [];
  let cur = null;
  for (const raw of chords.split(/\r?\n/)) {
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

function build(parts) {
  let out = '';
  let vCount = 1;
  for (const p of parts) {
    if (p.type === 'skip') continue;
    if (p.type === 'del') continue;
    let label;
    if (p.label === 'Verse') { label = 'Verse ' + vCount; vCount++; }
    else label = p.label;
    out += `[${label}]\n` + p.lines.join('\n') + '\n\n';
  }
  return out.trimEnd();
}

const cfgs = {
  181: { kinds: ['V', '+', 'skip', 'skip', 'C', 'skip', 'V', 'skip', 'V', 'skip', 'V'] },
  194: { kinds: ['V', 'skip', 'skip', 'C', '+', 'skip', 'V', 'skip', 'V', 'skip', 'V'] },
  198: { kinds: ['V', '+', 'skip', 'skip', 'C', 'skip', 'V', 'skip', 'V', 'skip', 'V'] },
  212: { kinds: ['V', 'skip', 'skip', 'C', '+', 'skip', 'V', 'skip', 'V', 'skip', 'V'] },
  213: { kinds: ['V', 'skip', 'skip', 'C', 'skip', 'V', 'skip', 'V', 'skip', 'V'] },
  249: { kinds: ['V', 'skip', 'skip', 'C', 'skip', 'V', 'skip', 'V'] },
  255: { kinds: ['C', 'skip', 'skip', 'V', 'skip', 'V', 'skip', 'V', 'skip', 'V', 'skip', 'V', 'skip', 'V', 'skip', 'V'] },
  275: { kinds: ['V', '+', '+', 'skip', 'skip', 'C', 'skip', 'V', 'skip', 'V'] },
  302: { kinds: ['V', '+', 'skip', 'del', 'C', 'skip', 'V', 'skip', 'V', 'skip', 'V'] },
  327: { kinds: ['V', 'skip', 'V', 'skip', 'C', '+', 'skip', 'V', 'skip', 'skip', 'Br', '+', 'skip', 'Outro'] },
  360: { kinds: ['V', '+', '+', 'skip', 'skip', 'C', '+', 'skip', 'V', 'skip', 'V', 'skip', 'V', 'skip', 'V'] },
  238: { kinds: ['V', 'C', 'skip', 'skip', '+', 'skip', 'V', 'skip', 'V', 'skip', 'V', 'skip', 'V', 'skip', 'V'] },
};

function applyTransform(chords, cfg) {
  const blocks = parseBlocks(chords);
  if (blocks.length < cfg.kinds.length) return null;
  const parts = [];
  for (let i = 0; i < cfg.kinds.length; i++) {
    const kind = cfg.kinds[i];
    const b = blocks[i];
    if (kind === 'skip' || kind === 'del') continue;
    if (kind === '+') {
      if (!parts.length) return null;
      parts[parts.length - 1].lines = parts[parts.length - 1].lines.concat(b.lines);
      continue;
    }
    const label = kind === 'C' ? 'Chorus' : kind === 'Br' ? 'Bridge' : kind === 'Outro' ? 'Outro' : 'Verse';
    parts.push({ label, lines: b.lines });
  }
  let out = build(parts);
  if ((out.match(/\[Chorus\]/g) || []).length !== 1) return null;
  if (/\[Verse \d+\]\n\[Verse \d+\]/.test(out)) return null;
  return out;
}

const nums = [181, 194, 198, 212, 213, 249, 255, 275, 302, 327, 360, 238];
const { data, error } = await supabase.from('songs').select('id, song_number, title, language, chords').in('song_number', nums).eq('language', 'english');
if (error) { console.error('fetch err', error.message); process.exit(1); }

let updated = 0, failed = [];
for (const s of data) {
  const cfg = cfgs[s.song_number];
  if (!cfg) { failed.push(`#${s.song_number}: no cfg`); continue; }
  if (!s.chords) { failed.push(`#${s.song_number}: no chords`); continue; }
  const before = (s.chords.match(/\[chorus\]/gi) || []).length;
  const newCh = applyTransform(s.chords, cfg);
  if (!newCh) { failed.push(`#${s.song_number}: transform rejected`); continue; }
  if (s.song_number === 327) { console.log(`### #327 PREVIEW:\n${newCh}\n--------`); }
  const { error: ue } = await supabase.from('songs').update({ chords: newCh }).eq('id', s.id);
  if (ue) { failed.push(`#${s.song_number}: ${ue.message}`); continue; }
  const after = (newCh.match(/\[Chorus\]/g) || []).length;
  console.log(`#${s.song_number} ${s.title}: ${before}->${after} chorus ✓`);
  updated++;
}
console.log(`\nupdated=${updated}`);
if (failed.length) { console.log('FAILED:'); failed.forEach(f => console.log('  ', f)); }