# Chord Ingestion Documentation: Prime Songbook (English)

## 📂 Sources
### 1. Primary Source (Offline)
*   **File Path**: `d:\worship-song-library\raw chords lyrics\Praise-and-Worship-Book-WITH-CHORDS (1).pdf`
*   **Description**: The main reference for traditional and contemporary worship songs in the prime_songbook.

### 2. Secondary Sources (Online / Internal Knowledge)
*   **Source**: General web research and AI internal knowledge of standard worship chord progressions.
*   **Usage**: Used for songs not present in the PDF or for modern versions where standard progressions (e.g., G-C-D-Em) are universally recognized.
*   **Validation**: All internet-sourced chords were cross-referenced against the exported database lyrics to ensure the rhythm and placement were correct for the specific version in the DB.

## 🛠 Ingestion Process
The chords were extracted and mapped to the existing database lyrics using the following pipeline:

1.  **Lyric Extraction**: Database lyrics were exported to batch text files (`lyrics_X_Y.txt`) to ensure a 100% match with the existing `song_lines` table.
2.  **Chord Mapping**: Chords from the reference material were applied to the lyrics using the `[Chord]word` bracketed format.
3.  **Atomic Injection**: A custom Java utility (`BatchChordInjector.java`) calculated the exact character index for each chord based on the bracketed text and inserted the records into the `line_chords` table.
4.  **Verification**: After each batch, a verification check was run to ensure:
    *   No broken words.
    *   Precise alignment over the correct characters.
    *   No modification to the original lyric text.

## 📈 Final Statistics
*   **Total Songs Migrated**: 351 (out of 377 processed).
*   **Remaining Songs**: 26 songs (either had no chords in the source PDF or had lyric mismatches that were skipped to maintain data integrity).

## 🗃 Workspace Reference Files
*   `reference_chords/english/jehovah_jireh_reference.txt`
*   `reference_chords/english/from_the_rising_of_the_sun_reference.txt`
*   `scratch/chords_*.txt` (Contains the intermediate bracketed versions used for injection).
