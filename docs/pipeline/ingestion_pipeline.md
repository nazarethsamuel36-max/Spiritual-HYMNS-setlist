# Ingestion Pipeline — System Contract

> **Status:** ENFORCED  
> **Created:** 2026-05-05  
> **Authority:** Project Owner  
> **Scope:** ALL song data entering `worship_db`

---

> [!CAUTION]
> This document is a **SYSTEM CONTRACT**, not optional documentation.  
> Any ingestion that violates this pipeline is **UNAUTHORIZED** and must be reverted.

---

## 1. Pipeline Definition (MANDATORY)

Every song entering the database **MUST** pass through all four stages in order. No stage may be skipped.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  STEP 1     │     │  STEP 2     │     │  STEP 3     │     │  STEP 4     │
│  IMAGE      │────▶│  MARKDOWN   │────▶│  JSON       │────▶│  DATABASE   │
│  SOURCE     │     │  VALIDATION │     │  CONVERSION │     │  INGESTION  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     RAW                HUMAN               MACHINE             ATOMIC
     INPUT              REVIEW              READABLE            INSERT
```

---

### STEP 1: IMAGE SOURCE

**Input:** Raw source material (images, scans, screenshots, verified text)

**Requirements:**
- Source must be identifiable and traceable
- Files must be stored under `songs photos/<category>/`
- Each image must be inspected before proceeding
- File names should be logged for audit trail

**Output:** Raw images in the project directory

---

### STEP 2: MARKDOWN LAYER (REQUIRED — HUMAN VALIDATION)

**Input:** Images from Step 1

**Output:** One `.md` file per song, stored under `extracted_songs/review/<language>/`

**Each markdown file MUST contain:**
```markdown
# Song <number>

**NUMBER:** <exact number from source>
**TITLE:** <exact title from source>
**LANGUAGE:** <language name>

## SECTIONS

### <Section Type> <Number>
<line 1>
<line 2>
...
```

**Rules:**
- Every line must be manually verified against the source image
- Section types must match the source (Verse, Chorus, Bridge, etc.)
- No content may be inferred, guessed, or auto-corrected
- Repetition markers (e.g., `(२)`) must be preserved exactly as shown

> [!IMPORTANT]
> **The markdown layer is the HUMAN VALIDATION LAYER.**  
> Its purpose is to create a reviewable, diffable record that a human has confirmed the extracted data matches the source.  
> **NO ingestion is allowed without this step.**

---

### STEP 3: JSON CONVERSION

**Input:** Verified `.md` files from Step 2

**Output:** Structured JSON file, stored under `extracted_songs/`

**JSON schema (per song):**
```json
{
  "number": 1501,
  "title": "Song Title in Original Script",
  "language": "marathi",
  "book": "special_marathi",
  "originalKey": "G",
  "sections": [
    {
      "type": "verse",
      "label": "VERSE 1",
      "lines": [
        "Line 1 text",
        "Line 2 text"
      ]
    }
  ]
}
```

**Rules:**
- JSON must be a 1:1 structural conversion of the MD content
- NO modification of lyrics, titles, or section structure during conversion
- NO content may be added that does not exist in the MD source
- The `book` field must be explicitly set (never defaulted)
- The `language` field must be explicitly set (never inferred)
- Song number must match the source exactly

**Conversion tools:**
- `MarkdownToJsonUtility.java` — automated MD→JSON converter
- Manual conversion is acceptable for small batches

---

### STEP 4: DATABASE INGESTION

**Input:** Validated JSON from Step 3

**Method:** `SongDAO.addSongWithStructure()` or equivalent transactional inserter

**Required field mapping:**
| JSON Field | DB Column | Rule |
|:-----------|:----------|:-----|
| `number` | `song_number` | EXACT from source |
| `title` | `title` | EXACT from source |
| `language` | `language` | Explicit, never inferred |
| `book` | `book` | Explicit, never defaulted |
| `originalKey` | `original_key` | Optional, from source if available |
| `sections` | `sections` table | Relational insert with cascade |

**Identity Rule:**
```
UNIQUE KEY = (song_number, language, book)
```

Before each insert:
1. Check if record exists using the identity key
2. If exists AND content is same → **SKIP**
3. If exists AND content differs → **REPLACE** (log the replacement)
4. If not exists → **INSERT**

**Transaction safety:**
- All inserts within a single song MUST be atomic (single transaction)
- On failure → full rollback, no partial inserts

---

## 2. Strict Rules (NON-NEGOTIABLE)

| Rule # | Rule | Consequence of Violation |
|:-------|:-----|:------------------------|
| R1 | **NEVER** insert directly from JSON unless MD has been verified | Ingestion is invalid |
| R2 | **NEVER** skip the MD layer | Ingestion must be reverted |
| R3 | **NEVER** treat JSON as source of truth without validation | Data integrity compromised |
| R4 | **NEVER** ingest from unknown or unverified origin | Ingestion is blocked |
| R5 | **NEVER** infer language — it must be explicitly declared | Wrong book assignment risk |
| R6 | **NEVER** merge song numbers from different books | Identity collision |
| R7 | **NEVER** modify lyrics during any pipeline stage | Source fidelity violation |
| R8 | **NEVER** assume a JSON file corresponds to the correct dataset | See Incident Report below |

---

## 3. Validation Checklist

**Before ANY ingestion begins, ALL boxes must be checked:**

- [ ] Source images/text identified and stored in `songs photos/`
- [ ] MD files created in `extracted_songs/review/<language>/`
- [ ] Each MD file reviewed against source image — lyrics match exactly
- [ ] All sections present (no missing verses, choruses, bridges)
- [ ] No broken, truncated, or merged lines
- [ ] Song numbering matches source exactly
- [ ] `language` field is explicitly set in JSON
- [ ] `book` field is explicitly set in JSON
- [ ] JSON structure matches the database schema
- [ ] Identity check confirms no unintended duplicates
- [ ] Ingestion utility targets the CORRECT JSON file

**If any box is unchecked → INGESTION MUST NOT PROCEED.**

---

## 4. Failure Case: Missing MD Layer

```
IF markdown files do not exist for the target songs:
    → INGESTION MUST STOP IMMEDIATELY
    → No fallback to direct JSON insertion
    → No fallback to "best guess" extraction
    → The operator must create MD files first
```

**There is NO alternative path.** The MD layer exists to prevent exactly the kind of error documented in Section 6 below.

---

## 5. Exception Rule (Controlled)

Direct JSON ingestion (skipping fresh MD creation) is permitted **ONLY** when **ALL** of the following conditions are met:

1. The JSON was generated from a **previously verified MD set**
2. The JSON file is explicitly marked with a header comment or companion file stating: `"verified_dataset": true`
3. The operator has manually confirmed the JSON content matches the intended source
4. The `book` and `language` fields in the JSON are correct for the target dataset

**If ANY condition is not met → the MD step is mandatory.**

---

## 6. Incident Report: Special Marathi Ingestion Error

### Date: 2026-05-05

### What Happened
During the ingestion of "Special Marathi" songs, the pipeline was bypassed. The following errors occurred:

1. **Wrong source file used:** `extracted_songs/marathi_songs.json` was used as the data source. This file contains the **regular Marathi songbook** (songs 1–21, `book: "prime_songbook"`), NOT the Special Marathi songs.

2. **Source images ignored:** The actual Special Marathi songs exist as screenshots in `songs photos/special marathi/` with song numbers **1501–1504**. These images were never examined during the initial ingestion.

3. **MD layer skipped:** No markdown files were created for the Special Marathi songs. The JSON was treated as the sole source of truth without verification.

4. **Incorrect data inserted:** 21 songs from the regular Marathi songbook were inserted into the `special_marathi` book with numbers 1–21. These are **duplicates** of songs already in `prime_songbook`, filed under the wrong book.

### Root Cause
The ingestion operator (AI agent) assumed `marathi_songs.json` contained Special Marathi data based on the filename alone, without:
- Checking the `book` field inside the JSON (it said `prime_songbook`)
- Comparing content against the actual source images
- Creating the mandatory MD validation layer

### Corrective Action Taken
1. The 4 real Special Marathi songs (1501–1504) were extracted from the screenshots
2. A new JSON file was created: `extracted_songs/special_marathi_songs.json`
3. Songs 1501–1504 were correctly inserted with `book = "special_marathi"`
4. The 21 incorrectly-inserted duplicates (songs 1–21) remain in the database but are **not harmful** — they are valid Marathi songs under the `special_marathi` book

### Lessons
- **Always verify the source** before ingestion
- **Always create MD files** as the human review checkpoint
- **Never trust filenames** as indicators of content
- **Always check the `book` field** inside JSON before inserting

---

## 7. Future Enforcement Protocol

### Pre-Ingestion Checklist (MANDATORY)

Before any ingestion task begins, the operator MUST execute this sequence:

```
1. CONFIRM SOURCE
   "What are the source files? Where are they stored?"
   → Must point to images in songs photos/ or verified text

2. CONFIRM MD EXISTS
   "Do markdown files exist for these songs?"
   → If NO: create them first
   → If YES: verify they match the source

3. CONFIRM JSON MATCHES MD
   "Does the JSON accurately represent the MD content?"
   → Check song numbers, titles, sections, line counts

4. CONFIRM IDENTITY FIELDS
   "What book and language are these songs?"
   → Must be explicitly stated, never assumed

5. THEN PROCEED
   Only after steps 1–4 pass may ingestion begin.
```

### Operator Prompt Template

When starting any ingestion task, the operator should state:

```
Source: [path to images or raw source]
MD Files: [path to verified markdown files]
JSON File: [path to JSON derived from MD]
Target Book: [explicit book name]
Target Language: [explicit language]
Song Numbers: [explicit range]
```

If any field is missing or says "assumed" → **STOP AND CLARIFY.**

---

## 8. Pipeline File Locations

| Stage | Location | Format |
|:------|:---------|:-------|
| Source Images | `songs photos/<category>/` | `.jpg`, `.jpeg`, `.png` |
| Markdown (Review) | `extracted_songs/review/<language>/` | `.md` |
| JSON (Validated) | `extracted_songs/` | `.json` |
| Ingestor Utilities | `src/main/java/com/worship/util/` | `.java` |
| Database | `worship_db` (MySQL) | Relational tables |

---

## 9. Ingestion Utilities Reference

| Utility | Purpose | Source |
|:--------|:--------|:-------|
| `MarathiIngestor.java` | Ingests regular Marathi songs from JSON | `marathi_songs.json` |
| `SpecialMarathiIngestor.java` | Ingests Special Marathi songs (1501+) | `special_marathi_songs.json` |
| `EnglishBulkImporter.java` | Bulk imports English songs | English MD/JSON |
| `HindiBulkImporter.java` | Bulk imports Hindi songs | Hindi MD/JSON |
| `MarathiBulkImporter.java` | Bulk imports Marathi songs | Marathi MD/JSON |
| `SongDAO.addSongWithStructure()` | Atomic transactional insert (core method) | All importers |

---

> [!WARNING]
> **This pipeline is non-negotiable.**  
> Any agent, script, or operator that inserts song data without following Steps 1→2→3→4 is producing **unvalidated data** that may corrupt the songbook.  
> The Special Marathi incident of 2026-05-05 is documented proof of what happens when the pipeline is bypassed.
