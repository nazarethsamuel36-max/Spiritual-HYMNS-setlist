import fs from 'fs';
const OUT = 'C:/Users/Lenovo/AppData/Local/Temp/opencode/';
const props = JSON.parse(fs.readFileSync(OUT + 'stanza_proposals.json', 'utf8'));
const high = props.filter(p => p.confidence === 'high');

for (const p of high) {
  console.log(`\n### #${p.num} | ${p.title}`);
  const lines = p.rendered.split(/\r?\n/);
  let cur = '  ';
  for (const l of lines) {
    if (/^\[(Verse \d+|Chorus)\]$/.test(l.trim())) {
      if (cur.trim()) console.log(cur);
      cur = `  ${l.trim()}  →  `;
    } else if (l.trim() !== '') {
      let text = l.trim();
      text = text.length > 55 ? text.slice(0, 52) + '...' : text;
      if (cur === `  ${l.trim()}  →  `) continue;
      if (!cur.includes(text)) cur += text + ' / ';
    }
  }
  if (cur.trim()) console.log(cur);
}