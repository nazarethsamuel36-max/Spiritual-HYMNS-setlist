import fs from 'fs';
const OUT = 'C:/Users/Lenovo/AppData/Local/Temp/opencode/';
const props = JSON.parse(fs.readFileSync(OUT + 'stanza_proposals.json', 'utf8'));

const list = props.filter(p => p.confidence === 'high');
for (const p of list) {
  const lines = p.rendered.split(/\r?\n/);
  console.log(`\n#${p.num} ${p.title}`);
  // show first 3 section boundaries (marker + first lyric line), then "…"
  const shown = [];
  let cur = null;
  for (const l of lines) {
    if (/^\[(Verse \d+|Chorus)\]$/.test(l.trim())) { cur = l.trim(); shown.push(`  ${cur}`); }
    else if (cur && (shown.length === 1 || shown.length % 2 === 0) && l.trim() !== '') {
      const t = l.trim().replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
      shown.push(`      "${t.slice(0, 50)}${t.length>50?'...':''}"`);
      cur = null;
    }
  }
  console.log(shown.slice(0, 6).join('\n') + (shown.length > 6 ? '\n      …' : ''));
}