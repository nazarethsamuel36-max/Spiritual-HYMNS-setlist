import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const OUT = 'C:/Users/Lenovo/AppData/Local/Temp/opencode/';

const DONE = new Set(['141','149','122','95','147','160','133','143','154','159','291','117','155','140','128','150','97']);
const props = JSON.parse(fs.readFileSync(OUT + 'stanza_proposals.json', 'utf8'));
const handfix = JSON.parse(fs.readFileSync(OUT + 'handfix_46.json', 'utf8'));
const handfixNums = new Set(handfix.map(x => String(x.num)));

// ---- gather rendered texts ----
const renders = {};
let asIsCount = 0, fixCount = 0;
for (const p of props) {
  if (DONE.has(String(p.num))) continue;
  if (handfixNums.has(String(p.num))) continue;
  if ([1005, 1019].includes(Number(p.num))) continue;
  renders[String(p.num)] = p.rendered;
  asIsCount++;
}
for (const h of handfix) {
  renders[String(h.num)] = h.rendered;
  fixCount++;
}

const completed = {
  1005: '[Verse 1]\nCome, Thou Fount of every blessing\nTune my heart to sing Thy grace\nStreams of mercy, never ceasing\nCall for songs of loudest praise\nTeach me some melodious sonnet\nSung by flaming tongues above\nPraise the mount! I\'m fixed upon it,\nMount of God\'s unchanging love!\n\n[Verse 2]\nHere I raise my Ebenezer;\nHither by Thy help I\'m come;\nAnd I hope, by Thy good pleasure,\nSafely to arrive at home.\nJesus sought me when a stranger,\nWandering from the fold of God;\nHe, to rescue me from danger,\nInterposed His precious blood.',
  1019: '[Verse 1]\nTake me past the outer courts,\nInto the holy place,\nPast the brazen altar.\nLord I want to see Your face.\nPass me by the crowds of people\nAnd the priests who sing Your praise.\nI hunger and thirst for Your righteousness,\nBut it\'s only found in one place\n\n[Chorus]\nTake me into the Holy of Holies\nTake me in by the blood of the Lamb\nTake me into the Holy of Holies\nTake the coal, touch my lips, here I am\n\n[Verse 2]\nTake me past the outer courts\nInto the Holy Place\nPast the brazen Altar\nLord, I want to see Your face\nPass me by the crowds of people\nThe priests who sing Your praise\nI hunger and thirst for Your righteousness\nAnd it\'s only found in one place',
};
renders['1005'] = completed[1005];
renders['1019'] = completed[1019];

console.log(`Loaded: ${asIsCount} as-is + ${fixCount} hand-fixed + 2 completed = ${Object.keys(renders).length}`);

// ---- apply ----
const results = [];
for (const num of Object.keys(renders)) {
  const { data: song } = await supabase.from('songs').select('id, title').eq('song_number', Number(num)).eq('language', 'english').single();
  if (!song) { console.log(`#${num} NOT FOUND`); continue; }
  const { error } = await supabase.from('songs').update({ chords: renders[num] }).eq('id', song.id);
  results.push({ num, title: song.title, ok: !error, err: error?.message });
  console.log(`#${num} ${song.title} → ${error ? 'FAIL ' + error.message : 'UPDATED'}`);
}
fs.writeFileSync(OUT + 'apply_all96_results.json', JSON.stringify(results, null, 1));
console.log('\nfailures:', results.filter(r => !r.ok).length);