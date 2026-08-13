import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const OUT = 'C:/Users/Lenovo/AppData/Local/Temp/opencode/';

const SECTION_RE = /^\s*\[(verse|chorus|chor|cho|chour|bridge|pre-chorus|refrain|ending|intro|outro|interlude|coda|solo|strophe)[^\]]*\]\s*$/i;

const chordTok = (l) => {
  const toks = [...l.matchAll(/\[([A-G][#b]?(?:maj|min|m|dim|aug|sus)?(?:\d{1,2})?(?:\/[A-G][#b]?)?)\]/gi)].map(m => m[1]);
  if (!toks.length) {
    const b = [...l.matchAll(/\{([A-G][#b]?(?:maj|min|m|dim|aug|sus)?(?:\d{1,2})?(?:\/[A-G][#b]?)?)\}/gi)].map(m => m[1]);
    return b.join(' ');
  }
  return toks.join(' ');
};
const stripChords = (l) => l
  .replace(/\[[A-G][#b]?(?:maj|min|m|dim|aug|sus)?(?:\d{1,2})?(?:\/[A-G][#b]?)?\]/gi, '')
  .replace(/\{[A-G][#b]?(?:maj|min|m|dim|aug|sus)?(?:\d{1,2})?(?:\/[A-G][#b]?)?\}/gi, '')
  .replace(/[{}]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

// ---- find verbatim repeated blocks (chorus) ----
function findChorus(lines) {
  const sigs = lines.map(l => stripChords(l).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim());
  const n = sigs.length;
  let bestLen = 0, starts = [];
  for (let len = Math.min(12, Math.floor(n / 2)); len >= 2; len--) {
    const seen = new Map();
    for (let i = 0; i + len <= n; i++) {
      const key = sigs.slice(i, i + len).join('\u0001');
      if (!key.split('\u0001').every(s => s.length > 1)) continue;
      const a = seen.get(key) || [];
      a.push(i);
      seen.set(key, a);
    }
    for (const [, a] of seen) {
      if (a.length >= 2) { bestLen = len; starts = a; len = 0; break; }
    }
    if (bestLen) break;
  }
  return bestLen ? { len: bestLen, starts } : null;
}

// ---- chord-period of a line region (for verse length guessing) ----
function chordPeriod(sigs) {
  const n = sigs.length;
  let bestP = null, bestScore = -1;
  for (let P = 3; P <= Math.min(10, Math.floor(n / 2)); P++) {
    let match = 0, total = 0;
    for (let i = 0; i + P < n; i++) {
      if (!sigs[i] && !sigs[i + P]) continue;
      total++;
      if (sigs[i] === sigs[i + P]) match++;
    }
    if (total > 0) {
      const score = match / total;
      if (score > bestScore) { bestScore = score; bestP = P; }
    }
  }
  return bestScore > 0.5 ? bestP : null;
}

function buildSong(raw) {
  let lines = raw.split(/\r?\n/).map(l => l.replace(/\s+$/, ''));
  lines = lines.filter(l => {
    if (SECTION_RE.test(l.trim())) { return false; }
    return l.trim() !== '';
  });
  if (!lines.length) return null;

  const chorus = findChorus(lines);
  const isChorus = new Set();
  if (chorus) for (const s of chorus.starts) for (let i = s; i < s + chorus.len; i++) isChorus.add(i);

  // verse-length template = distance from 0 to first chorus (if nonzero), else chord period of non-chorus
  let verseLen = null;
  if (chorus && chorus.starts[0] >= 3) verseLen = chorus.starts[0];
  else {
    const ncSigs = lines.map((l, i) => isChorus.has(i) ? '' : chordTok(l));
    const p = chordPeriod(ncSigs);
    if (p) verseLen = p;
  }

  // group into blocks
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    if (isChorus.has(i)) {
      let j = i;
      while (j < lines.length && isChorus.has(j)) j++;
      blocks.push({ type: 'chorus', lines: lines.slice(i, j) });
      i = j;
    } else {
      let j = i;
      while (j < lines.length && !isChorus.has(j)) j++;
      const seg = lines.slice(i, j);
      blocks.push({ type: 'verse-blob', lines: seg });
      i = j;
    }
  }

  const out = { sections: [], confidence: 'low', note: '', chorusCount: 0 };
  for (const b of blocks) {
    if (b.type === 'chorus') {
      out.sections.push({ type: 'chorus', lines: b.lines });
      out.chorusCount++;
      continue;
    }
    if (verseLen && b.lines.length >= verseLen * 1.5) {
      const nb = Math.round(b.lines.length / verseLen);
      if (nb >= 2) {
        for (let k = 0; k < nb; k++) {
          const slice = b.lines.slice(k * verseLen, (k + 1) * verseLen);
          if (slice.length > 0) out.sections.push({ type: 'verse', lines: slice });
        }
        continue;
      }
    }
    out.sections.push({ type: 'verse', lines: b.lines });
  }

  const nVerse = out.sections.filter(s => s.type === 'verse').length;
  if (out.chorusCount >= 1 && verseLen) out.confidence = 'high';
  else if (out.chorusCount >= 1) out.confidence = 'medium';
  else if (nVerse === 1) out.confidence = 'low';
  else out.confidence = 'med-norefrain';
  return out;
}

function render(song) {
  const parts = [];
  let v = 0;
  for (const s of song.sections) {
    if (s.type === 'chorus') parts.push('[Chorus]');
    else { v++; parts.push(`[Verse ${v}]`); }
    parts.push(s.lines.join('\n'));
    parts.push('');
  }
  return parts.join('\n').replace(/\n{3,}/g, '\n\n');
}

// ---- fetch & run ----
let all = [], from = 0; const P = 1000;
while (true) {
  const { data } = await supabase.from('songs').select('id, song_number, title, language, chords').range(from, from + P - 1);
  if (!data || !data.length) break;
  all = all.concat(data);
  if (data.length < P) break;
  from += P;
}
const eng = all.filter(x => (x.language || '').toLowerCase() === 'english');

const results = [];
for (const s of eng) {
  if (!s.chords || !s.chords.trim()) continue;
  const lines = s.chords.split(/\r?\n/);
  const markers = lines.filter(l => SECTION_RE.test(l.trim()));
  const lyricLines = lines.filter(l => { const t = l.trim(); return t !== '' && !SECTION_RE.test(t); });
  if (lyricLines.length > 6 && markers.length < 2) {
    const built = buildSong(s.chords);
    if (built) { built.num = s.song_number; built.title = s.title; built.id = s.id; results.push(built); }
  }
}

const byConf = {};
for (const r of results) (byConf[r.confidence] ||= []).push(r);
for (const c in byConf) console.log(`${c.toUpperCase()}: ${byConf[c].length}`);

fs.writeFileSync(OUT + 'stanza_proposals.json', JSON.stringify(results.map(r => ({ num: r.num, title: r.title, id: r.id, confidence: r.confidence, rendered: render(r) })), null, 1));
for (const c in byConf)
  fs.writeFileSync(OUT + `stanza_${c}.txt`, byConf[c].map(r => `##### #${r.num} | ${r.title}\n${render(r)}\n`).join('\n'));
console.log('done');