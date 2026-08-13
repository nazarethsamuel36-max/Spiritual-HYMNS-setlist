import fs from 'fs';
const OUT = 'C:/Users/Lenovo/AppData/Local/Temp/opencode/';
const props = JSON.parse(fs.readFileSync(OUT + 'stanza_proposals.json', 'utf8'));
const high = props.filter(p => p.confidence === 'high');

for (const p of high) {
  const lines = p.rendered.split(/\r?\n/);
  const seq = [];
  let cur = null;
  for (const l of lines) {
    if (/^\[(Verse \d+|Chorus)\]$/.test(l.trim())) {
      cur = { tag: l.trim(), n: 0 };
      seq.push(cur);
    } else if (cur && l.trim() !== '') cur.n++;
  }
  const pattern = seq.map(s => `${s.tag==='[Chorus]'?'C':'V'}(${s.n}L)`).join(' ');
  const firsts = [];
  for (const s of seq) {
    firsts.push(s.tag === '[Chorus]' ? `C:"${getFirst(lines, s)}"` : `V${s.tag.slice(7,-1)}:"${getFirst(lines, s)}"`);
  }
  console.log(`#${p.num} ${p.title}`);
  console.log(`   pattern: ${pattern}`);
  console.log(`   ${firsts.join('  ')}\n`);
}

function getFirst(lines, s) {
  const idx = lines.indexOf(s.tag);
  for (let i = idx + 1; i < lines.length; i++) {
    if (/^\[(Verse \d+|Chorus)\]$/.test(lines[i].trim())) return '';
    if (lines[i].trim() !== '') {
      let t = lines[i].trim().replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
      return t.length > 40 ? t.slice(0, 37) + '...' : t;
    }
  }
  return '';
}