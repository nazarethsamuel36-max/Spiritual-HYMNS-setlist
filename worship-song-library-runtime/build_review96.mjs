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

const SECTION_RE = /^\s*\[[^\]]*\]\s*$/i;
const DONE = new Set(['141','149','122','95','147','160','133','143','154','159','291','117','155','140','128','150','97']);

const props = JSON.parse(fs.readFileSync(OUT + 'stanza_proposals.json', 'utf8'));
const handfix = JSON.parse(fs.readFileSync(OUT + 'handfix_46.json', 'utf8'));
const handfixNums = new Set(handfix.map(x => String(x.num)));

let report = '';
let count = 0;

// 1) detector as-is (48): proposals not hand-fixed and not the 2 truncated
for (const p of props) {
  if (DONE.has(String(p.num))) continue;
  if (handfixNums.has(String(p.num))) continue;
  if ([1005, 1019].includes(Number(p.num))) continue;
  count++;
  report += `===== #${p.num} | ${p.title} [AS-IS ${p.confidence}] =====\n${p.rendered}\n\n\n`;
}

// 2) hand-fixed (46)
for (const h of handfix) {
  count++;
  report += `===== #${h.num} | ${h.title} [HAND-FIXED] =====\n${h.rendered}\n\n\n`;
}

// 3) completed truncated (2)
const completed = {
  1005: '[Verse 1]\nCome, Thou Fount of every blessing\nTune my heart to sing Thy grace\nStreams of mercy, never ceasing\nCall for songs of loudest praise\nTeach me some melodious sonnet\nSung by flaming tongues above\nPraise the mount! I\'m fixed upon it,\nMount of God\'s unchanging love!\n\n[Verse 2]\nHere I raise my Ebenezer;\nHither by Thy help I\'m come;\nAnd I hope, by Thy good pleasure,\nSafely to arrive at home.\nJesus sought me when a stranger,\nWandering from the fold of God;\nHe, to rescue me from danger,\nInterposed His precious blood.',
  1019: '[Verse 1]\nTake me past the outer courts,\nInto the holy place,\nPast the brazen altar.\nLord I want to see Your face.\nPass me by the crowds of people\nAnd the priests who sing Your praise.\nI hunger and thirst for Your righteousness,\nBut it\'s only found in one place\n\n[Chorus]\nTake me into the Holy of Holies\nTake me in by the blood of the Lamb\nTake me into the Holy of Holies\nTake the coal, touch my lips, here I am\n\n[Verse 2]\nTake me past the outer courts\nInto the Holy Place\nPast the brazen Altar\nLord, I want to see Your face\nPass me by the crowds of people\nThe priests who sing Your praise\nI hunger and thirst for Your righteousness\nAnd it\'s only found in one place',
};
for (const [n, txt] of Object.entries(completed)) {
  count++;
  const { data } = await supabase.from('songs').select('title').eq('song_number', n).eq('language', 'english').single();
  report += `===== #${n} | ${data.title} [COMPLETED] =====\n${txt}\n\n\n`;
}

fs.writeFileSync('D:/spiritual setlist/worship-song-library-runtime/REVIEW_all96.txt', report);
console.log('written REVIEW_all96.txt with', count, 'songs');