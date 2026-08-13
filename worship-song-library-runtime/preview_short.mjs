import fs from 'fs';
const OUT = 'C:/Users/Lenovo/AppData/Local/Temp/opencode/';
const props = JSON.parse(fs.readFileSync(OUT + 'stanza_proposals.json', 'utf8'));
const high = props.filter(p => p.confidence === 'high');

for (const p of high) {
  const lines = p.rendered.split(/\r?\n/);
  const out = [];
  let cur = null;
  for (const l of lines) {
    if (/^\[(Verse \d+|Chorus)\]$/.test(l.trim())) { cur = { tag: l.trim(), first: '' }; out.push(cur); }
    else if (cur && cur.first === '' && l.trim() !== '') {
      let t = l.trim().replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
      cur.first = t.length > 60 ? t.slice(0, 57) + '...' : t;
    }
  }
  console.log(`\n#${p.num} ${p.title}`);
  for (const s of out) console.log(`  ${s.tag}: "${s.first}"`);
}