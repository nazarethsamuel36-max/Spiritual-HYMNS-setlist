# Worship Song Library - System Documentation

## 1. System Overview
**Purpose:** The Worship Song Library is a web-based platform designed to store, manage, and display multi-language worship songs (English, Hindi, Marathi). It serves as a digital songbook that allows musicians and worship leaders to view lyrics with synchronized chords, transpose keys in real-time, and create custom setlists.

**Problem Solved:** Traditional songbooks and flat-text chord files (like raw Markdown or TXT) break easily on different screen sizes and make transposition difficult. This system separates lyrics from chords, anchoring chords to specific character positions, enabling responsive, multi-language rendering and dynamic key transposition without losing alignment.

**Key Features:**
*   Multi-language support (English, Hindi, Marathi) with phonetic transliteration.
*   Dynamic chord rendering over lyrics.
*   Real-time chord transposition.
*   Search by song number or lyric text.
*   Personalized edits and setlist creation.

---

## 2. Architecture
The system follows a classic Java Web architecture.

**High-level System Structure:**
*   **Frontend (UI):** JSP, HTML, Vanilla CSS, and JavaScript. Responsible for dynamic layout, transposition controls, and rendering structured chords.
*   **Backend:** Java Servlets for HTTP request routing, Java Utility classes for chord parsing and alignment logic.
*   **Database:** MySQL relational database for persistent storage.
*   **Ingestion Engine:** Java-based utilities (`HindiBulkImporter`, `SingleHindiSongInserter`) to parse flat-text/JSON songs and insert them into the relational schema.

---

## 3. Data Flow (DFD)

### Level 0
`User → Web Interface (Browser) → Java Servlets (Backend) → MySQL Database → Web Interface (UI)`

### Level 1
*   **Search Flow:** User Input → `SearchServlet` → Tokenize & Query `SongDAO` (Number lookup or Text MATCH) → Return JSON → Render Results.
*   **Rendering Flow:** User Requests Song (`SongViewServlet`) → DB fetch (`sections`, `lines`, `line_chords`) → `ChordAligner.buildStructuredLines()` → UI renders chords anchored to text using CSS.
*   **Chord Ingestion Flow:** Raw Image/Text → Structured JSON → `ChordAligner` (Levenshtein distance matching) → DB insert (`songs`, `sections`, `song_lines`, `line_chords`).
*   **Edit View Reconstruction Flow:** `UserSongServlet` → Fetch DB Data → Reconstruct inline `[Chord]text` string using `ChordAligner.reconstructInlineChordText()` → Display in Textarea.

---

## 4. Database Design
The core data model is relational to ensure lyrics are immutable and chords are a positional overlay.

**Tables & Relationships:**
*   **`songs`**: Core entity (id, number, language, title, book, original_key, lyrics_original, chords).
*   **`sections`**: Logical parts of a song like Verse/Chorus (id, song_id, type, order). *Foreign Key: `song_id` references `songs.id`*.
*   **`song_lines`**: Individual lyric lines (id, section_id, text, order). *Foreign Key: `section_id` references `sections.id`*.
*   **`line_chords`**: Chord occurrences mapped to characters (id, line_id, chord, char_index). *Foreign Key: `line_id` references `song_lines.id`*.

**Constraints:**
*   Lyrics are immutable; chords are mapped via `char_index`.
*   Song number + language combinations must be unique.

---

## 5. Chord System
The chord system is designed to handle multiple input and output representations.

**Input Formats:**
1.  **Inline format (`[C]`)**: Chords are bracketed directly inside the text (e.g., `[G]Amazing [C]grace`).
2.  **Two-line format**: Chords sit exactly on the line above the lyrics.

**Internal Representation:**
In the DB (`line_chords`), chords are stored strictly via `char_index` (position). E.g., `chord="G", char_index=0`.

**Reconstruction (formatChordedLine Algorithm):**
To rebuild inline formats for editing:
1. Iterates over `line_chords` ordered by `char_index`.
2. Uses a `StringBuilder` to insert chords `[C]` at the exact `char_index` relative to the pure lyric string.
3. Tracks an `offset` variable so that inserting `[C]` (which adds length) shifts subsequent chord insertions correctly without index-out-of-bounds errors.
4. Multiple chords at the same position are stacked side-by-side.

---

## 6. Rendering Engine
The rendering engine uses a **position-based alignment** strategy.
*   **No spaces used:** Using spaces for alignment breaks on mobile devices and non-monospace fonts.
*   **Anchoring:** Chords are attached to their corresponding lyric word/syllable using structured HTML (e.g., `<span class="chord-word">`). CSS positions the chord above the specific syllable, ensuring perfect vertical alignment regardless of screen width or font size.

---

## 7. Search System
*   **Tokenization:** User queries are split into lowercase tokens.
*   **Numeric Search:** Directly checks if the query is purely numeric to perform a fast index lookup by `song.number`.
*   **Text Search Pipeline:** Uses SQL `LIKE` and `MATCH() AGAINST()` for full-text search.
*   **AND Logic:** All tokens must be present in the song to return a match.
*   **Phonetic Variants:** Transliteration logic maps English characters to approximate Devanagari sounds to help users search Hindi/Marathi songs using English keyboards.

---

## 8. Edit View Logic
**Documented Actual Behavior:**
*   **English Songs:** Historically retrieved from the legacy flat-text `songs.chords` column directly into the textarea.
*   **Hindi/Marathi Songs:** Rely entirely on the relational schema (`sections` → `song_lines` → `line_chords`).
*   **Difference between View Page and Edit Page:** The View page (`SongViewServlet`) prioritizes structured parsing (merging flat-text or relational DB). The Edit page (`UserSongServlet`) must reconstruct a unified flat-text editable format from the relational database via the `ChordAligner`.

---

## 9. Known Issues
*   **Edit page not showing Hindi/Marathi chords:** Due to differing data paths, the edit view failed to reconstruct Hindi/Marathi relational chords properly.
*   **Dual System (Legacy vs Relational):** The application contains legacy logic that relies on `songs.chords` alongside the modernized `line_chords` relational architecture.
*   **Duplicate Chord Entries in `line_chords`:** Some ingestion scripts mistakenly inserted redundant positional chords on the exact same character index.

---

## 10. Current System State
*   **What is working:** The core DB, search tokenization, English song rendering, and relational rendering on the view page work reliably. The transposition and phonetic systems are active.
*   **What is partially working:** The edit view has inconsistencies based on the language and DB column in use.
*   **What is not working:** Legacy cleanup. The presence of duplicates and deprecated columns requires a final migration to unify the stack purely onto the relational model.
