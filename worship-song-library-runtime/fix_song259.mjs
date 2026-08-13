import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const fixed = `[Verse 1]
[D]When upon lifes [G]billows
[D]You are tempest [A]tossed,
[D]When you are dis[G]couraged,
[D]Thinking all is [A]lost,
[D]Count your many [G]blessings,
[D]Name them one by [A]one,
[D]And it will sur[G]prise you
[D]What the [A]Lord hath [D]done.

[Chorus]
[D]Count your blessings,
[A]Name them one by one;
Count your blessings,
[G]See what [A]God hath [D]done;
Count your blessings,
Name them one by one;
Count your many blessings,
[D]See what [A]God hath [D]done.

[Verse 2]
Are you [D]ever [G]burdened
[D]With a load of [A]care?
[D]Does the cross seem [G]heavy
[D]You are called to [A]bear?
Count your many blessings,
[D]Every doubt will [A]fly,
[D]And you will be [G]singing
[D]As the [A]days go [D]by.

[Verse 3]
When you [D]look at [G]others
[D]With their lands and [A]gold,
[D]Think that Christ has [G]promised
[D]You His wealth un[A]told;
Count your many blessings,
[D]Money cannot [A]buy
[D]Your reward in [G]Heaven
[D]Nor your [A]home on [D]high.

[Verse 4]
So, a[D]mid the [G]conflict,
[D]Whether great or [A]small,
[D]Do not be dis[G]couraged,
[D]God is over [A]all;
[D]Count your many [G]blessings
[D]Angels will at[A]tend,
[D]Help and comfort [G]give you
[D]To your [A]journeys [D]end.`;

const { data, error } = await supabase.from('songs').update({ chords: fixed }).eq('id', 871).select('id, song_number, title');
if (error) { console.error('UPDATE FAILED:', error.message); process.exit(1); }
console.log('Updated:', data);

const { data: check } = await supabase.from('songs').select('chords').eq('id', 871).single();
console.log('--- VERIFY LIVE CHORDS ---');
console.log(check.chords);
console.log('--------------------------');
console.log('[Chorus] count:', (check.chords.match(/\[Chorus\]/g) || []).length);
console.log('[Verse] count:', (check.chords.match(/\[Verse \d\]/g) || []).length);
console.log('asterisk present:', check.chords.includes('*'));