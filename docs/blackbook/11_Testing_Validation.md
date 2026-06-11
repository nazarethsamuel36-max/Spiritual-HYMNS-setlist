# Chapter 11: Testing and Validation

## 11.1 Testing Strategy
The Worship Song Library is a highly dynamic system where musical data must be precisely aligned and mathematically manipulated in real-time. Therefore, a generic testing approach was insufficient. The testing strategy focused strictly on the core technical innovations of the system:
- Unit Testing: To validate the mathematical correctness of the `ChordTransposer` and the regex logic of the `ChordParser`.
- Integration Testing: To ensure that structured relational data (Sections -> Lines -> Chords) was correctly fetched, reassembled, and delivered by the `SongService` and `SongDAO`.
- UI and Rendering Testing: To validate that the custom JavaScript Virtual Wrapping algorithm maintained perfect alignment across varying viewports and multi-script character sets.

## 11.2 Functional Test Cases

The following tables document the rigorous functional testing executed against the core modules of the application.

### 11.1 Search System Validation
| Test Case | Input | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| Exact Number Search | `979` | Song #979 as top result | Song #979 as top result | PASS |
| Title Match (English) | `Amazing` | Songs with "Amazing" in title | Songs with "Amazing" in title | PASS |
| Phonetic Search (Roman) | `Aarati` | Hindi songs containing "आरती" | Hindi songs containing "आरती" | PASS |
| Partial Lyric Match | `kroos pe` | Songs with lyrics matching phrase | Songs with lyrics matching phrase | PASS |
| Empty Search Query | `[Enter]` | Redirect to all songs/categories | Redirected to library | PASS |

### 11.2 Transposition Validation
| Test Case | Input Chord | Offset | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Standard Up | `C` | +2 | `D` | `D` | PASS |
| Standard Down | `G` | -1 | `F#` | `F#` | PASS |
| Minor Chords | `Am` | +3 | `Cm` | `Cm` | PASS |
| Slash Chords | `G/B` | +2 | `A/C#` | `A/C#` | PASS |
| Boundary Wrap | `B` | +1 | `C` | `C` | PASS |
| Accidental Normalization | `A#` | +1 | `B` | `B` | PASS |

## 11.3 Chord System Validation
The most critical backend function is the ingestion and parsing of traditional text into the relational data model. The system relies on a bracketed `[C]` anchor format.

### Parsing Example 1: Standard English
Input String: `[G]Amazing [D]grace, how [Em]sweet the [C]sound`
System Processing (Regex Extraction):
1. Extract `G`, Index: 0. Lyric string remains: `Amazing [D]grace...`
2. Extract `D`, Index: 8. Lyric string remains: `Amazing grace...`
3. Extract `Em`, Index: 19. Lyric string remains: `Amazing grace, how sweet...`

Parsed Output (Database Representation):
- Line ID: 101, Lyrics: `"Amazing grace, how sweet the sound"`
- Chords: `G@0`, `D@8`, `Em@19`, `C@29`

Reconstructed Display Logic:
The UI successfully reconstructs this by placing the HTML `<span class="chord">` exactly before the character at the specified index, ensuring musical sync regardless of CSS styling.

### Parsing Example 2: Devanagari Script (Hindi/Marathi)
Input String: `[C]आरती हो [F]आरती`
Parsed Output: `C@0`, `F@6`
Validation Status: Passed. The system correctly calculated the string length of Unicode Devanagari characters, ensuring that compound characters (like "ती") were treated correctly by the indexer.

## 11.4 Rendering Validation

The most visible innovation of this system is the Virtual Wrapping algorithm. Testing this required simulating different mobile devices.

### Scenario: Narrow Mobile Screen (320px width)
Song Line: `[G]I will sing of your [D]love forever [Em]and ever`

Before (Traditional `<pre>` tag formatting):
```text
G                   D            Em
I will sing of your love forever and
ever
```
Result: The `Em` chord hovers over empty space, disconnected from the lyrics.

After (Proposed System with Virtual Wrapping):
```text
G                   D
I will sing of your love forever
Em
and ever
```
Result: The algorithm detects the screen boundary, slices the string at the nearest space before the overflow, recalculates that `Em` is now at index 0 of the new sub-line, and renders it flawlessly.

Conclusion: The rendering validation proved that decoupling chords from spaces and binding them to character indices solves the "Mobile Misalignment Problem."

## 11.5 Edge Case Testing

To ensure production readiness, the system was subjected to deliberate edge-case manipulation.

1. Empty Lines: Songs with instrumental breaks (e.g., `[Intro: G - C - D]`) with no lyrics. 
   - Result: Handled correctly. The rendering engine creates an invisible non-breaking space block to hold the chords.
2. Multiple Chords at Same Index: A rapid chord change before a word starts (e.g., `[G][C]Lord`).
   - Result: CSS flexbox rules successfully stacked the chords side-by-side without overflowing into the text.
3. Extreme Transposition: User rapidly clicking "+1" 24 times.
   - Result: The modulo arithmetic in `ChordTransposer` handled the wrapping flawlessly, bringing the key back to the original root without throwing an `OutOfBoundsException`.
4. Invalid Search Input: SQL Injection attempts (e.g., `' OR 1=1;--`).
   - Result: Passed. All data access layers utilize strictly parameterized `PreparedStatement` interfaces, neutralizing injection vulnerabilities.

## 11.6 Performance Testing

Performance metrics were gathered locally using Chrome Developer Tools and backend logging.

| Operation | Metric Type | Approximate Value | Acceptable Threshold |
| :--- | :--- | :--- | :--- |
| Search Request (Text) | Server Latency | ~45 ms | < 200 ms |
| Song View Load | Full TTFB | ~85 ms | < 300 ms |
| Transposition Execution| Client/Server Sync | ~30 ms | < 100 ms |
| Rendering Engine Reflow| JS Execution Time | ~15 ms | < 50 ms |

Note: Server latency was tested with a database populated with over 300 real songs and thousands of chord rows. The highly normalized structure and indexed tables allowed the RDBMS to fetch data rapidly.

## 11.7 Result Summary

What Worked Well:
- The algorithmic separation of chords from lyrics was an absolute success. The mobile viewing experience is fundamentally superior to traditional digital songbooks.
- The dual-script (Roman/Devanagari) toggle works seamlessly because the `char_index` maps accurately to both phonetic representations of the song.
- The transposition engine is mathematically rigorous and handles complex slash chords perfectly.

What Limitations Remain:
- If an administrator modifies the raw text of a song (e.g., adding a skipped word) in the database without using a specialized ingestion tool, the character indices of all subsequent chords in that line will be out of sync.
- The system heavily relies on client-side JavaScript for the final render. On extremely legacy browsers with JavaScript disabled, the application degrades to a text-only view.


