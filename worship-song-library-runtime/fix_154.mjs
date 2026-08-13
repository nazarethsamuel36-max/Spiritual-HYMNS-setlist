import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const d154 = (await supabase.from('songs').select('id').eq('song_number', 154).eq('language', 'english').single()).data;

const chorus = [
  "I shall not [D]be, I shall not be [A]moved,",
  "I shall not [D]be, I shall not be moved;",
];
const treeTag = [
  "Just like a [G]tree that''s planted by the [D]waters,",
  "I shall not be [A]moved.",
];

const verses = [
  ["[D]Jesus is my Saviour, I shall not be [A]moved;", "In His love and favor, I shall not be moved;"],
  ["[D]Glory Hallelujah, I shall not be [A]moved;", "Anchored in Jehovah, I shall not be moved;"],
  ["[D]In His love abiding, I shall not be [A]moved;", "And in Him confiding, I shall not be moved;"],
  ["[D]Though all hell assail me, I shall not be [A]moved;", "Jesus will not fail me, I shall not be moved;"],
  ["[D]Though the tempest rages, I shall not be [A]moved;", "On the rock of ages, I shall not be moved;"],
  ["In my [D]Christ abiding, I shall not be [A]moved;", "In His love I''m [D]hiding, I shall not be moved;"],
  ["If I [D]trust Him ever, I shall not be [A]moved;", "He will fail me [D]never, I shall not be moved;"],
  ["On His [D]Word I''m feeding, I shall not be [A]moved;", "He''s the One that''s [D]leading, I shall not be moved;"],
];

// every verse = 2 main lines + tree tag; chorus ONLY after Verse 1
const parts = [];
let v = 0;
for (const ver of verses) {
  v++;
  parts.push(`[Verse ${v}]`);
  parts.push([...ver, ...treeTag].join('\n'));
  parts.push('');
  if (v === 1) {
    parts.push('[Chorus]');
    parts.push(chorus.join('\n'));
    parts.push('');
  }
}
const final = parts.join('\n').replace(/\n{3,}/g, '\n\n');

console.log(final);

const { error } = await supabase.from('songs').update({ chords: final }).eq('id', d154.id);
console.log('\n' + (error ? 'FAIL ' + error.message : 'UPDATED #154'));

const { data: chk } = await supabase.from('songs').select('chords').eq('id', d154.id).single();
console.log('verify: Verses=%d, Chorus=%d', (chk.chords.match(/\[Verse \d+\]/g) || []).length, (chk.chords.match(/\[Chorus\]/g) || []).length);