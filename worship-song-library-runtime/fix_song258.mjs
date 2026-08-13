import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const fixed = `[Verse 1]
We [D]find many people who [G]cant under[D]stand
Why [D]we are so happy and [A]free.
Weve [D]crossed over Jordan to [G]Canaans fair [D]land,
And [D]this is like [A]Heaven to [D]me.

[Chorus]
Oh, [D]this is like [G]Heaven to [D]me,
Yes, [D]this is like [A]Heaven to me;
Ive [D]crossed over Jordan to [G]Canaans fair [D]land,
And this is like Heaven to me.

[Verse 2]
So [D]when we are happy we [G]sing and we [D]shout;
Some [D]dont understand us, I [A]see.
Were [D]filled with the Spirit, there [G]isnt a [D]doubt,
And this is like Heaven to me.

[Verse 3]
Weve [D]heard the sweet music, the [G]heavenly [D]chord,
From [D]glory land over the [A]sea;
A [D]soul-thrilling message from [G]Jesus, our [D]Lord,
And this is like Heaven to me.

[Verse 4]
Were [D]looking for Jesus with [G]glory to [D]come;
Tis [D]Jesus Who died on the [A]tree.
A [D]cloud of bright angels to [G]carry me [D]home-
Oh, [D]that will be [A]Heaven to [D]me.

[Ending]
Oh, [D]that will be [G]Heaven to [D]me,
Yes, [D]that will be [A]Heaven to me;
A cloud of bright angels to carry me home-
Yes, [D]that will be [A]Heaven to [D]me`;

const { data, error } = await supabase.from('songs').update({ chords: fixed }).eq('id', 870).select('id, song_number, title');
if (error) { console.error('UPDATE FAILED:', error.message); process.exit(1); }
console.log('Updated:', data);

const { data: check } = await supabase.from('songs').select('chords').eq('id', 870).single();
console.log('--- VERIFY LIVE CHORDS ---');
console.log(check.chords);
console.log('--------------------------');
console.log('[Chorus] count:', (check.chords.match(/\[Chorus\]/g) || []).length);
console.log('[Verse] count:', (check.chords.match(/\[Verse \d\]/g) || []).length);
console.log('[Ending] count:', (check.chords.match(/\[Ending\]/g) || []).length);
console.log('asterisk present:', check.chords.includes('*'));