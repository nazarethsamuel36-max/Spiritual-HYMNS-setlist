const testChords = `{Verse 1}
[G]Amazing grace how [C]sweet the [G]sound
That [G]saved a [Em]wretch like [D]me
I [G]once was lost but [C]now am [G]found
Was [G]blind but [D]now I [G]see`;

const regex = /\[[A-G][#b]?m?(?:\/[A-G][#b]?)?\]/g;

const result = testChords.replace(regex, '');
console.log('Original:');
console.log(testChords);
console.log('\nAfter stripping:');
console.log(result);
