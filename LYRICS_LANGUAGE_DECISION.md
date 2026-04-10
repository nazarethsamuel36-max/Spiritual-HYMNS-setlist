# LYRICS LANGUAGE DECISION

**Document Version:** 1.0  
**Last Updated:** April 10, 2026  
**Status:** Active Decision  
**Applies to:** All features that display, search, or process lyrical content

---

## 1. PURPOSE

The Worship Song Library must support worship songs in multiple languages (Hindi, Marathi, English) while ensuring:

- **Fast readability** during live performance (critical)
- **Accurate chord alignment** (non-negotiable)
- **Language flexibility** for users from different regions
- **Searchability** across language variants
- **Simplicity** in implementation and maintenance

This document establishes the definitive strategy for language handling in the application.

---

## 2. CORE DECISION

### Storage Strategy

The system will store both original and transliterated formats for every song:

| Field | Purpose | Format | Example |
|-------|---------|--------|---------|
| `lyrics_original` | Native script for readability and cultural authenticity | Hindi (Devanagari), Marathi (Devanagari), or English | जीवित है मेरी आशा |
| `lyrics_roman` | English transliteration for chord notation and performance | Latin alphabet (IAST or simplified) | jivit hai meri aasha |
| `language` | Language identifier | ENUM: english, hindi, marathi, bengali, other | hindi |

### Non-Negotiable Constraints

- **Both formats must always exist** for non-English songs
- The system does **NOT** rely on automatic transliteration at runtime
- Transliteration is **pre-computed and stored** in the database
- Word order, spacing, and structure **must be identical** between `lyrics_original` and `lyrics_roman`

### Example

**Hindi song:**
```
lyrics_original: [G]जीवित है \n मेरी आशा [Em]प्रभु में
lyrics_roman:    [G]jivit hai \n meri aasha [Em]Prabhu mein
```

Notice: Same line breaks, same chord positions, same word count.

---

## 3. DEFAULT DISPLAY MODE

### Primary Display: Roman (Transliteration)

The default view mode is **English transliteration (roman)**.

```
Example display to user:
[G]jivit hai
meri aasha
[Em]Prabhu mein
```

### Rationale

1. **Chord alignment safety** — Roman text has predictable character width (monospace rendering)
2. **Readability speed** — Most church musicians read English faster during performance
3. **Performance reliability** — No complex Unicode rendering issues
4. **Universal compatibility** — Works on all devices and browsers without font issues
5. **Mobile optimization** — Consistent text rendering across devices

---

## 4. LANGUAGE TOGGLE

### User Capability

Users must be able to instantly switch between display modes:

| Mode | Display Content | Use Case |
|------|---|---|
| **Roman** (default) | `lyrics_roman` (English transliteration) | Performance, readability |
| **Original Script** | `lyrics_original` (Hindi/Marathi Devanagari) | Cultural study, native speakers |

### Implementation Requirements

The toggle must be:

- **Instantly responsive** — Toggle between modes in <100ms (no page reload)
- **Persistent during session** — Remember user's preference while viewing song
- **Visible and obvious** — Button or switch clearly labeled "हिंदी / Hinglish"
- **Located** — In the song header, always visible alongside other controls
- **Non-intrusive** — Single toggle button (not dropdown or modal)

### Example UI Placement

```
[Song Title]  [Transpose ±]  [Language: Roman ▼]  [Print]  [Add to Setlist]
```

---

## 5. CHORD MODE RULE

### Lyrics Display in Chord View

When the user selects "Chords + Lyrics" mode:

- **Display ONLY:** `lyrics_roman` (transliteration)
- **Never display:** `lyrics_original` (native script in chord mode)

### Rationale

1. **Chord alignment guarantee** — Roman characters have consistent monospace width
2. **No rendering bugs** — Unicode Devanagari characters can shift chord positions
3. **Performance** — No complex text measurement needed for chord placement
4. **Mobile safety** — Prevents text reflow on phones with limited resources

### Example

**✅ CORRECT (Chord mode shows Roman only):**
```
[G]jivit hai
meri aasha
[Em]Prabhu mein
```

**❌ INCORRECT (Do NOT show native script in chord mode):**
```
[G]जीवित है
[Em]मेरी आशा
```
(This risks chord misalignment)

### Non-Chord Views

In "Lyrics Only" mode, the language toggle works normally — users can see either Roman or native script.

---

## 6. SEARCH BEHAVIOR

### Language-Independent Search

The search system must be **completely language-agnostic**.

### Search Scope

Users must be able to search by typing in:

| Input | Matches Against |
|-------|---|
| Roman (e.g., "jivit") | Both `lyrics_original` and `lyrics_roman` |
| Native script (e.g., "जीवित") | Both `lyrics_original` and `lyrics_roman` |
| Title in any language | Song `title` field |
| Artist in any language | Song `artist` field |

### Search Implementation

- Search processes **all available language fields** without prioritization
- Results ranked by field (title > artist > lyrics)
- **No automatic transliteration** at search time (transliteration already stored)

### Example

**User searches:** "jivit"
**System returns:** All songs containing "jivit" in `lyrics_roman` AND all songs containing "जीवित" in `lyrics_original`

---

## 7. CONSTRAINTS

### Mandatory Rules for All Lyrical Content

#### 7.1 Transliteration Standardization

- All transliterations must use **IAST (International Alphabet of Sanskrit Transliteration)** or simplified Latin equivalents
- Avoid multiple transliteration forms for the same word:
  - ✅ "Krishna" (chosen standard)
  - ❌ Don't also use "Krsna" or "Krishn" or "Krisna" in different songs
- Maintain consistency across the entire library

#### 7.2 Word Order and Structure Preservation

- `lyrics_roman` must maintain **identical word order** to `lyrics_original`
- Word boundaries must be identical (no reordering, no combining)
- Line breaks must match exactly
- Chord positions must align identically

**Example:**
```
lyrics_original (Hindi): नमन करो तुम्हें प्रभु को
lyrics_roman:           naman karo tumhein Prabhu ko
```
Same word order, different script only.

#### 7.3 No Automatic Translation

- **Transliteration only** — convert script, do not translate meaning
- Example: "Arun" (अरुण) remains "Arun", NOT "Dawn" (translation)
- Preserve cultural names and references as-is

### Optional but Recommended

- Use monospace font for `lyrics_roman` display
- Document transliteration rules in a separate guide (for data entry teams)
- Validate transliteration consistency during data import

---

## 8. NON-GOALS (FOR NOW)

These features are **explicitly NOT supported** in the current system:

### ❌ Dual-Language Display (Side-by-Side)

**Not supported:** Showing both `lyrics_original` and `lyrics_roman` simultaneously.

Why:
- Doubles screen width, reduces readability
- Renders poorly on mobile
- Makes chord alignment ambiguous
- Heavy visual clutter during performance

**Alternative:** Use language toggle to switch between full-screen views.

### ❌ Chord Rendering in Native Script

**Not supported:** Rendering chords in Hindi/Marathi script (e.g., showing "[सोल]" instead of "[G]").

Why:
- Chord symbols are international standards (C, G, Am, etc.)
- Hindi chord symbols don't exist (not used in Indian classical music tradition)
- Would break all transposition logic
- No musician expects this

**Standard practice:** Chords are always in English, lyrics in user's preferred language.

### ❌ Automatic Transliteration at Runtime

**Not supported:** Computing transliteration on-the-fly from stored `lyrics_original`.

Why:
- Transliteration rules are complex and language-specific
- Requires external library (performance overhead)
- No guarantee of correctness
- Inconsistency across songs
- 5-10x slower than stored transliteration

**Standard practice:** Transliteration pre-computed and stored in database during import.

---

## 9. FUTURE EXTENSIONS (POSSIBLE)

These features are documented for potential future implementation:

### 9.1 Practice Mode (Dual Language)

**Concept:** In a "Practice" mode, show both `lyrics_original` and `lyrics_roman` side-by-side.

**Use case:** Language learners practicing transliteration.

**Challenges to solve first:**
- Screen layout for 2-column display
- Chord alignment with dual content
- Mobile responsiveness
- Font sizing balance

**Decision:** Do NOT implement until user demand is clear.

### 9.2 Word-Level Chord Alignment

**Concept:** Map chords to specific words across both language versions.

**Use case:** Advanced musicians understanding which word carries the chord.

**Challenges to solve first:**
- Word-level data structure redesign
- UI for showing word-level alignment
- Maintenance complexity for data entry
- Performance impact

**Decision:** Do NOT implement until proven necessary.

### 9.3 Transliteration Normalization

**Concept:** Automatically normalize variant transliterations (e.g., "Krishn" → "Krishna").

**Use case:** Improving search across songs with minor spelling variations.

**Challenges to solve first:**
- Fuzzy matching algorithm
- False positive handling
- Performance impact
- Cultural sensitivity

**Decision:** Do NOT implement until fuzzy search is tested and proven reliable.

---

## 10. FINAL NOTE

### Design Philosophy

This decision prioritizes:

1. **Simplicity** — Single format per view, no mode complexity
2. **Reliability** — Pre-computed data, no runtime conversion
3. **Performance** — Fast rendering, <100ms mode switching
4. **Consistency** — Same data across all user devices

### Over Advanced Features

Deliberately rejected:
- Auto-transliteration (unreliable, slow)
- Dual-language display (confusing, performance risk)
- Hindi chord notation (non-standard, breaks convention)
- Runtime format conversion (complexity, latency)

### Principle

> We optimize for what matters most: Musicians need to read lyrics quickly and reliably during live performance. Everything else is secondary.

---

## 11. IMPLEMENTATION REFERENCE

### Database Schema

```sql
CREATE TABLE songs (
    -- ...existing fields...
    language ENUM('english', 'hindi', 'marathi', 'bengali', 'other') NOT NULL,
    lyrics_original TEXT,  -- Native script or NULL for English
    lyrics_roman TEXT,     -- Transliteration or full text for English
    -- ...rest of schema...
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Code References

- [SongDAO.java](src/main/java/com/worship/dao/SongDAO.java) — Language-aware query methods
- [SearchServlet.java](src/main/java/com/worship/servlet/SearchServlet.java) — Multi-language search (line 107-125)
- [songView.jsp](src/main/webapp/jsp/songView.jsp) — Language toggle UI
- [app.js](src/main/webapp/js/app.js) — Toggle implementation (transposeUI function)

---

## 12. CHANGE LOG

### Version 1.0 (April 10, 2026)
- Initial language handling decision
- Defined dual-storage strategy (original + roman)
- Established default roman display
- Defined chord mode rule (roman only)
- Documented language-independent search
- Explicitly rejected non-goals
- Listed future extension possibilities
