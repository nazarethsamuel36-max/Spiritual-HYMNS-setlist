# SONG BOOK INGESTION ARCHITECTURE

**Version**: 1.0-DESIGN  
**Date**: April 16, 2026  
**Status**: DETERMINISTIC PIPELINE (NO UI, NO DB WRITES)  
**Extensibility**: Designed for chord injection (v1.1)

---

## 1. PIPELINE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│  INPUT: /songbook_images/*.{jpg,png,tiff}                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  LAYER 1: IMAGE PROCESSING   │
        │  ────────────────────────    │
        │  • OCR extraction            │
        │  • Song boundary detection   │
        │  • Italic/formatting detect  │
        │  • Raw text output           │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  LAYER 2: STRUCTURE CONVERT  │
        │  ──────────────────────────  │
        │  • Parse song sections       │
        │  • Identify verses/chorus    │
        │  • Map to JSON structure     │
        │  • Preserve line breaks      │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  LAYER 3: JSON STAGING      │
        │  ──────────────────────────  │
        │  • Write to /processed_songs/│
        │  • Include metadata          │
        │  • NO database writes        │
        │  • Human review ready        │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  LAYER 4: VALIDATION        │
        │  ──────────────────────────  │
        │  • Field validation          │
        │  • Completeness checks       │
        │  • BUG DETECTION             │
        │  • REVIEW_REQUIRED tagging   │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  OUTPUT: /processed_songs/   │
        │  ────────────────────────    │
        │  • Clean JSON files          │
        │  • ValidationStatus metadata │
        │  • Ready for manual review   │
        │  • Later: Chord injection    │
        └─────────────────────────────┘

    [FUTURE] LAYER 5: CHORD INJECTION (v1.1)
    ────────────────────────────────────────
    • Read /processed_songs/
    • Parse chords from source
    • Inject as [CHORD]text format
    • Write to /processed_songs_chords/
```

---

## 2. LAYER 1: IMAGE PROCESSING

### 2.1 Input Requirements

- **Format**: JPEG, PNG, TIFF
- **Resolution**: 150+ DPI (legible text)
- **Location**: `/songbook_images/` (flat or subdirectories)
- **OCR Tool**: Tesseract 5.x (open-source, deterministic)

### 2.2 Processing Steps

```
Step 1: Load Image
  ├─ Read image bytes
  ├─ Detect language (Hindi, Marathi, English mixed)
  ├─ Pass to OCR engine
  └─ Output: Raw text + confidence scores

Step 2: Segment into Songs
  ├─ Split by song number pattern: /^[0-9]+\./ (start of line)
  ├─ For each segment:
  │  ├─ Extract song number
  │  ├─ Extract title (first non-empty line after number)
  │  ├─ Extract remaining lines (lyrics)
  │  └─ Tag line formatting (italic, bold, normal)
  └─ Output: Song[] with raw text

Step 3: Detect Formatting
  ├─ Italic detection:
  │  ├─ Tesseract italic confidence > 0.8 → Mark as ITALIC
  │  ├─ Accumulate consecutive italic lines → Potential chorus
  │  └─ Store formatting metadata per line
  ├─ Handle edge cases:
  │  ├─ Mixed italic/normal in same line → Normal (uncertainty)
  │  ├─ Single italic line → Verse (too short for chorus)
  │  └─ All italic → Chorus (default)
  └─ Output: Song with line-level formatting tags
```

### 2.3 OCR Configuration

**Tesseract Parameters** (for reproducibility):
```
--psm 6          # Multi-block text (default)
--oem 3          # Both legacy + LSTM modes
-l hin+mar+eng   # Multi-language support
--tessdata-dir   # Explicit path to training data
```

**Output Format**:
```json
{
  "raw_text": "1. Song Title\nVerse 1 lyrics...",
  "blocks": [
    {
      "text": "1.",
      "bbox": {"x": 0, "y": 0, "w": 10, "h": 20},
      "confidence": 0.99,
      "italic": false
    },
    {
      "text": "Song Title",
      "bbox": {"x": 15, "y": 0, "w": 100, "h": 20},
      "confidence": 0.95,
      "italic": false
    }
  ],
  "source_image": "/songbook_images/page_001.jpg",
  "extraction_timestamp": "2026-04-16T10:30:00Z"
}
```

### 2.4 Failure Cases (Layer 1)

| Failure | Root Cause | Handling |
|---------|-----------|----------|
| Missing song number | Lyrics without numbering | Flag paragraph as UNSTRUCTURED; mark REVIEW_REQUIRED |
| OCR confidence < 0.6 | Blurry/corrupted image | Include confidence in output; flag for manual verification |
| Mixed unrelated content | Image contains non-song text (ads, credits) | Segment filtering: reject blocks <50 chars or isolated |
| Overlapping text | Page format complex (columns, sidebars) | Use Tesseract PSM 11 (sparse text); flag if ambiguous |
| No italic data | Old OCR engine or unprintable italic | Mark all sections as UNCLASSIFIED_SECTION; require manual review |

---

## 3. LAYER 2: STRUCTURE CONVERSION

### 3.1 JSON Schema Definition

**Root Schema** (One file per song):
```json
{
  "extraction_metadata": {
    "version": "1.0",
    "source_image": "/songbook_images/page_001.jpg",
    "extraction_timestamp": "2026-04-16T10:30:00Z",
    "ocr_engine": "tesseract-5.3",
    "ocr_confidence_avg": 0.92,
    "status": "VALID|REVIEW_REQUIRED|ERROR"
  },
  "song": {
    "number": 1,
    "language": "hindi",
    "title": "Aarati Ho",
    "raw_lyrics": "1. Aarati Ho\nVerse 1...",
    "sections": [
      {
        "type": "verse",
        "label": "Verse 1",
        "section_number": 1,
        "lines": [
          {
            "text": "आरती हो आरती",
            "original_line_number": 2,
            "confidence": 0.95,
            "was_italic": false,
            "notes": null
          }
        ]
      },
      {
        "type": "chorus",
        "label": "Chorus",
        "section_number": 1,
        "lines": [
          {
            "text": "हरि हरि हरि",
            "original_line_number": 8,
            "confidence": 0.88,
            "was_italic": true,
            "notes": "Detected as italic in source"
          }
        ]
      }
    ]
  },
  "validation": {
    "checks_passed": ["number_valid", "title_not_empty", "sections_not_empty"],
    "checks_failed": [],
    "warnings": ["low_ocr_confidence_on_line_5"],
    "requires_human_review": false
  },
  "future_extensions": {
    "chords": null,
    "chords_status": "NOT_EXTRACTED"
  }
}
```

### 3.2 Conversion Algorithm

```python
CLASS SongStructureConverter:
  
  FUNCTION convert(raw_song_data: RawSong) → StructuredSong:
    
    Step 1: Extract Metadata
      number = extract_number(raw_song_data.first_line)
      title = extract_title(raw_song_data.lines[1])
      language = detect_language(title + raw_song_data.lines)
    
    Step 2: Parse Sections
      sections = []
      current_section_type = "verse"
      current_section_lines = []
      
      FOR EACH line IN raw_song_data.lines[2:]:
        IF is_section_boundary(line):
          # e.g., "Verse 2:", "Chorus:", "Bridge:"
          sections.append(Section(
            type = current_section_type,
            lines = current_section_lines
          ))
          current_section_type = parse_section_label(line)
          current_section_lines = []
        ELSE:
          # Determine section type from formatting
          section_type = classify_section(
            line.was_italic,
            line.confidence,
            accumulated_italic_lines
          )
          current_section_lines.append({
            text = line.text,
            was_italic = line.was_italic,
            confidence = line.confidence
          })
    
    Step 3: Handle Chorus Detection
      FOR EACH section IN sections:
        IF section contains consecutive italic lines (>=2) and section not labeled:
          section.type = "chorus"
          section.label = "Chorus"
        ELSE IF section.was_italic == false:
          section.type = "verse"
    
    Step 4: Generate Labels
      verse_counter = 1
      chorus_counter = 1
      FOR EACH section IN sections:
        IF section.type == "verse":
          section.label = f"Verse {verse_counter}"
          verse_counter += 1
        ELSE IF section.type == "chorus":
          section.label = f"Chorus" (no counter for chorus)
    
    RETURN StructuredSong(
      number = number,
      language = language,
      title = title,
      sections = sections,
      metadata = extraction_metadata
    )
```

### 3.3 Section Classification Rules

```
RULE 1: Explicit Labels
  IF line matches /^(Verse|Chorus|Bridge|Hook|Pre-Chorus).*:/ 
  THEN use explicit label and type
  
RULE 2: Italic Detection (Chorus)
  IF consecutive lines have was_italic=true AND count >= 2
  THEN type = "chorus"
  ELSE type = "verse"
  
RULE 3: Uncertainty Handling
  IF mixed italic/normal in same line
  THEN treat as "verse" (assume main lyrics, not chorus)
  
RULE 4: Single Italic Line
  IF isolated italic line (not part of group)
  THEN type = "verse" (likely title or emphasis, not chorus)
  
RULE 5: Default
  IF no italic detected and no explicit label
  THEN type = "verse"
```

### 3.4 Failure Cases (Layer 2)

| Failure | Root Cause | Handling |
|---------|-----------|----------|
| No clear section boundaries | Lyrics formatted as single block | Flag as UNSTRUCTURED; include raw_lyrics in output; mark REVIEW_REQUIRED |
| Verse/Chorus order ambiguous | Multiple verse/chorus patterns | Store ALL detected sections in order; include confidence for each classification |
| Missing title | Song number followed immediately by lyrics | Mark title as MISSING; include TITLE_INFERRED fields for algorithm suggestion |
| Line breaks lost in OCR | Tesseract merged multiple lines | Include raw OCR text; add "merged_line" flag in line metadata |
| Empty section | Section label but no lyrics | Reject empty section; log as ERROR; mark song REVIEW_REQUIRED |

---

## 4. LAYER 3: INTERMEDIATE JSON STORAGE

### 4.1 Folder Structure

```
/processed_songs/
├── __metadata__/
│   ├── processing_log.jsonl          # One JSON per line per image
│   ├── validation_summary.json        # Stats: total, valid, review_required, errors
│   └── chord_injection_state.json     # Tracks which songs need chord extraction (v1.1)
├── batch_001/                         # Optional batching by image or date
│   ├── song_001.json                  # One file per song
│   ├── song_002.json
│   └── ...
├── valid/                             # Soft links to validated songs
│   └── song_001.json → ../batch_001/song_001.json
├── review_required/                   # Soft links to problematic songs
│   └── song_042.json → ../batch_001/song_042.json
└── errors/                            # Hard copies of unparseable items
    └── page_003_segment_2.json        # Raw extraction, marked ERROR
```

### 4.2 File Naming Convention

```
song_{BATCH_ID}_{SONG_NUMBER}_{LANGUAGE}.json

Examples:
  song_001_042_hindi.json      # Batch 1, Song #42, Hindi
  song_002_123_marathi.json    # Batch 2, Song #123, Marathi
  song_003_001_english.json    # Batch 3, Song #1, English
```

### 4.3 Metadata Tracking

**Processing Log (JSONL format - one record per song)**:
```json
{
  "batch_id": "001",
  "source_image": "/songbook_images/page_001.jpg",
  "song_number": 42,
  "output_file": "batch_001/song_042_hindi.json",
  "extraction_status": "SUCCESS",
  "validation_status": "VALID",
  "processing_timestamp": "2026-04-16T10:30:15Z",
  "processing_duration_ms": 2340,
  "ocr_confidence_avg": 0.92,
  "detected_language": "hindi",
  "section_count": 3,
  "issues": []
}
```

**Validation Summary**:
```json
{
  "summary": {
    "total_processed": 150,
    "valid": 142,
    "review_required": 7,
    "errors": 1,
    "success_rate": 0.947
  },
  "by_status": {
    "VALID": 142,
    "REVIEW_REQUIRED": 7,
    "ERROR": 1
  },
  "common_issues": [
    {"issue": "low_ocr_confidence", "count": 5},
    {"issue": "missing_chorus_detection", "count": 2},
    {"issue": "malformed_song_number", "count": 1}
  ]
}
```

### 4.4 Failure Cases (Layer 3)

| Failure | Root Cause | Handling |
|---------|-----------|----------|
| Disk full | Output directory exceeds quota | Log ERROR; stop processing; provide recovery instructions |
| File exists | Song already processed | Use timestamp versioning: song_042_hindi_20260416_1030.json |
| Invalid JSON output | Encoding errors (special chars) | Escape special Unicode; use UTF-8 BOM if needed; log warning |
| Permission denied | Directory not writable | Fail gracefully; log to separate error directory |
| Path length exceeded (Windows) | Nested paths > 260 chars | Flatten structure or use hash-based naming |

---

## 5. LAYER 4: VALIDATION

### 5.1 Validation Rules

```yaml
FIELD VALIDATION:
  number:
    - Must exist
    - Must be positive integer
    - Must not repeat across batch
    - Type: INTEGER
    
  title:
    - Must not be empty
    - Must not be all whitespace
    - Length: 1-500 chars
    - Type: STRING
    
  language:
    - Must be one of: [hindi, marathi, english, mixed]
    - Type: ENUM
    
  sections: 
    - Array must not be empty
    - At least one section required
    - Each section must have type + lines
    - Type: ARRAY[Section]

SECTION VALIDATION:
  type:
    - Must be one of: [verse, chorus, bridge, hook, pre_chorus]
    - Type: ENUM
    
  label:
    - Must not be empty
    - Format: "{Type} {Number}" or "Chorus" (no number)
    - Type: STRING
    
  lines:
    - Array must not be empty
    - At least one line required
    - Each line must have text (non-empty)
    - Type: ARRAY[Line]

LINE VALIDATION:
  text:
    - Must not be empty (after trim)
    - Must not be only punctuation
    - Length: 1-1000 chars
    - Type: STRING
    
  was_italic:
    - Type: BOOLEAN
    - Must be present
    
  confidence:
    - Range: 0.0 to 1.0
    - Type: FLOAT
    - Warn if < 0.7

COMPLETENESS CHECKS:
  ✓ At least one verse OR one chorus
  ✓ No empty sections allowed
  ✓ Section order logical (verses before chorus, choruses interspersed)
  ✓ Song number continuity check (warn if gaps)
```

### 5.2 Validation Algorithm

```python
CLASS SongValidator:
  
  FUNCTION validate(structured_song: StructuredSong) → ValidationResult:
    
    checks_passed = []
    checks_failed = []
    warnings = []
    
    # SECTION A: Required Fields
    IF not structured_song.number:
      checks_failed.append("number_missing")
    ELSE IF not is_valid_number(structured_song.number):
      checks_failed.append("number_invalid")
    ELSE:
      checks_passed.append("number_valid")
    
    IF not structured_song.title or structured_song.title.strip() == "":
      checks_failed.append("title_empty")
    ELSE:
      checks_passed.append("title_not_empty")
    
    IF not structured_song.sections or len(structured_song.sections) == 0:
      checks_failed.append("sections_empty")
    ELSE:
      checks_passed.append("sections_not_empty")
    
    # SECTION B: Section Validation
    FOR EACH section IN structured_song.sections:
      IF not section.type or section.type not in VALID_TYPES:
        checks_failed.append(f"section_invalid_type: {section.label}")
      
      IF not section.lines or len(section.lines) == 0:
        checks_failed.append(f"section_no_lines: {section.label}")
      ELSE:
        # Validate each line
        FOR EACH line IN section.lines:
          IF not line.text or line.text.strip() == "":
            checks_failed.append(f"line_empty: {section.label}")
    
    # SECTION C: Consistency Checks
    chorus_count = count_sections_by_type(structured_song, "chorus")
    verse_count = count_sections_by_type(structured_song, "verse")
    
    IF chorus_count == 0 and verse_count == 0:
      checks_failed.append("no_verse_or_chorus")
    
    IF verse_count > 20:  # Sanity check
      warnings.append("excessive_verses")
    
    # SECTION D: OCR Confidence
    avg_confidence = calculate_average_confidence(structured_song)
    IF avg_confidence < 0.7:
      warnings.append("low_ocr_confidence")
    IF avg_confidence < 0.5:
      checks_failed.append("unacceptable_ocr_confidence")
    
    # SECTION E: Determine Status
    IF len(checks_failed) > 0:
      status = "REVIEW_REQUIRED"
    ELSE:
      status = "VALID"
    
    RETURN ValidationResult(
      checks_passed = checks_passed,
      checks_failed = checks_failed,
      warnings = warnings,
      status = status
    )
```

### 5.3 Review Requirements

**Mark as REVIEW_REQUIRED if**:
- ✗ Any required field missing
- ✗ OCR confidence < 0.7 on any critical field
- ✗ Chorus/Verse classification ambiguous
- ✗ Section contains very few lines (<2)
- ✗ Line text contains excessive special characters (possible OCR error)
- ✗ Song number appears duplicate
- ✗ Title seems truncated or garbled

**Mark as VALID if**:
- ✓ All required fields present
- ✓ At least one verse AND/OR one chorus
- ✓ All sections have content
- ✓ OCR confidence ≥ 0.7 (average)
- ✓ No obvious parsing errors

---

## 6. LAYER 5: CHORD INJECTION (v1.1 - FUTURE)

### 6.1 Design for Extensibility

**Current State (v1.0)**: 
- ✓ Song structure with sections and lines
- ✓ NO chord data

**Future State (v1.1)**:
- New sourcefor chords: `/chord_sources/` (separate extraction engine)
- Chord data joined with lyrics at LINE LEVEL
- Preserve original lyrics (non-destructive injection)

### 6.2 Extended Line Schema (v1.1)

```json
{
  "text": "आरती हो आरती",
  "original_line_number": 2,
  "confidence": 0.95,
  "was_italic": false,
  "notes": null,
  
  "chords": {
    "chord_sequence": [
      {"position": 0, "chord": "C"},
      {"position": 8, "chord": "G"},
      {"position": 16, "chord": "Am"}
    ],
    "chord_format": "inline",
    "chord_source": "manual_entry|chord_engine|ocr_extraction",
    "chord_confidence": 0.85
  }
}
```

### 6.3 Inline Rendering (for Testing)

```
Original:     आरती हो आरती
With Chords:  [C]आरती हो [G]आरती
```

### 6.4 Processing Flow (v1.1)

```
/processed_songs/ (v1.0 output)
         │
         ├─→ Chord Extraction Engine (separate process)
         │   └─→ Parse chord source (images, tabs, etc.)
         │
         ├─→ Chord Matching Engine
         │   └─→ Join chords to lines by position
         │
         └─→ /processed_songs_with_chords/ (v1.1 output)
             └─→ Same structure + chords field populated
```

---

## 7. FAILURE HANDLING & RECOVERY

### 7.1 Error Taxonomy

```
FATAL ERRORS (Stop processing):
  • Disk I/O failure
  • Out of memory
  • Corrupted OCR engine
  → Action: Log and exit with error code

CRITICAL ERRORS (Mark song as ERROR, continue batch):
  • Cannot parse song structure
  • Invalid JSON generation
  • Encoding failures
  → Action: Write to /errors/; continue to next song

VALIDATION WARNINGS (Mark as REVIEW_REQUIRED, continue):
  • Low OCR confidence
  • Ambiguous section classification
  • Missing optional fields
  → Action: Write to /review_required/; continue to next song

RECOVERABLE ISSUES (Mark as VALID with notes, continue):
  • Special characters potentially misread
  • Single line sections (unusual but valid)
  • Language detection uncertain
  → Action: Include "notes" field; continue to next song
```

### 7.2 Recovery Procedures

**If Image Processing Fails**:
1. Log image path and error
2. Retry with degraded OCR settings (lower confidence threshold)
3. If still fails, skip image; continue batch
4. Document skipped images in processing log

**If Validation Fails**:
1. Categorize failure type
2. Write full diagnostic JSON to /errors/
3. Include raw OCR output for manual inspection
4. Move to next song

**If Disk Space Exhausted**:
1. Stop processing immediately
2. Write summary of processed songs so far
3. Provide instructions to free space and resume

---

## 8. DETERMINISM GUARANTEES

### 8.1 Reproducibility Commitments

```
✓ Same image + Same OCR config = IDENTICAL output
✓ No randomization anywhere in pipeline
✓ Section ordering = Source document order (not sorted)
✓ Line breaks = Preserved exactly from OCR
✓ Formatting tags = Deterministic (italic/normal/unknown)
✓ Confidence scores = Tesseract output (no rounding)
✓ JSON serialization = Always UTF-8, no pretty-printing variance
```

### 8.2 Version Tracking

Each file includes:
```json
"extraction_metadata": {
  "version": "1.0",
  "ocr_engine": "tesseract-5.3",
  "extraction_code_version": "v1.0",
  "extraction_timestamp": "2026-04-16T10:30:00Z"
}
```

Future versions (v1.1, v1.2) will change extraction_code_version; old files remain unchanged.

---

## 9. DATA FLOW DIAGRAM (Text-Based)

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT LAYER                                                     │
│  ─────────────                                                   │
│  /songbook_images/page_001.jpg                                  │
│  /songbook_images/page_002.png                                  │
│  /songbook_images/page_003.tiff                                 │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: IMAGE PROCESSING                                      │
│  ──────────────────────────                                     │
│  [Tesseract OCR 5.3]                                            │
│    • Load image                                                 │
│    • Run OCR with lang=hin+mar+eng                              │
│    • Segment by song number /^[0-9]+\./                        │
│    • Detect italic (confidence > 0.8)                           │
│    • Extract metadata per block                                 │
│                                                                 │
│  OUTPUT: raw_song_data[]                                        │
│    {number, title, lines[], formatting[]}                       │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: STRUCTURE CONVERSION                                  │
│  ────────────────────────────────                               │
│  [SongStructureConverter]                                       │
│    • Parse sections (Verse X, Chorus, etc.)                    │
│    • Classify by formatting (italic → chorus candidate)         │
│    • Apply classification rules                                 │
│    • Generate section labels                                   │
│    • Preserve line breaks                                      │
│                                                                 │
│  OUTPUT: structured_song                                        │
│    {number, language, title, sections[]}                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: JSON STAGING                                          │
│  ──────────────────────                                         │
│  [JSONWriter]                                                   │
│    • Serialize to JSON structure                                │
│    • Include extraction_metadata                                │
│    • Include future_extensions stub (chords: null)              │
│    • Write to /processed_songs/batch_XXX/song_YYY.json         │
│    • Log to __metadata__/processing_log.jsonl                   │
│                                                                 │
│  OUTPUT FILES:                                                  │
│    /processed_songs/batch_001/song_001_hindi.json               │
│    /processed_songs/batch_001/song_002_marathi.json             │
│    /processed_songs/__metadata__/processing_log.jsonl           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4: VALIDATION                                            │
│  ────────────────────                                           │
│  [SongValidator]                                                │
│    • Check required fields (number, title, sections)            │
│    • Validate section types                                    │
│    • Check line content (non-empty)                             │
│    • Verify OCR confidence ≥ 0.7                                │
│    • Assess section classification confidence                   │
│    • Generate validation report                                 │
│                                                                 │
│  DECISION TREE:                                                 │
│    IF validation errors → Status = REVIEW_REQUIRED              │
│    ELSE                  → Status = VALID                        │
│                                                                 │
│  OUTPUT ROUTING:                                                │
│    /processed_songs/valid/               (soft link)            │
│    /processed_songs/review_required/     (soft link)            │
│    /processed_songs/errors/              (hard copy)            │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  METADATA & REPORTING                                           │
│  ──────────────────────                                         │
│  /processed_songs/__metadata__/                                 │
│    processing_log.jsonl          (one record per song)          │
│    validation_summary.json       (stats: valid/review/error)    │
│    chord_injection_state.json    (tracking for v1.1)            │
│                                                                 │
│  HUMAN REVIEW READY:                                            │
│    • Valid songs: Ready for database import (v2.0)              │
│    • Review required: Manual inspection needed                  │
│    • Errors: Full OCR context available for debugging           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
        [FUTURE v1.1]
    ┌────────────────────────────┐
    │  Layer 5: Chord Extraction  │
    │  & Injection (Separate)     │
    │  ────────────────────────   │
    │  • Parse chord sources      │
    │  • Join to /processed_songs/│
    │  • Output with [CHORD]text  │
    │  • Write to _with_chords/   │
    └────────────────────────────┘
```

---

## 10. FILE ORGANIZATION

### 10.1 Directory Tree

```
WORKSPACE ROOT
│
├── /songbook_images/                              # INPUT
│   ├── page_001.jpg
│   ├── page_002.png
│   ├── old_format/
│   │   └── page_003.tiff
│   └── README.md (source documentation)
│
├── INGESTION_CODE/                                # CODE (Java/Python)
│   ├── src/
│   │   ├── ImageProcessor.java        # Layer 1
│   │   ├── SongStructureConverter.java # Layer 2
│   │   ├── JSONWriter.java            # Layer 3
│   │   ├── SongValidator.java         # Layer 4
│   │   ├── models/
│   │   │   ├── RawSong.java
│   │   │   ├── StructuredSong.java
│   │   │   ├── ValidationResult.java
│   │   │   └── SongScore.java
│   │   └── config/
│   │       └── TesseractConfig.java
│   ├── resources/
│   │   ├── tesseract_config.properties
│   │   └── validation_rules.yaml
│   └── main/
│       └── IngestionPipeline.java     # Orchestrator
│
├── /processed_songs/                              # OUTPUT (JSON STAGING)
│   ├── __metadata__/
│   │   ├── processing_log.jsonl       # Line-delimited JSON
│   │   ├── validation_summary.json
│   │   └── chord_injection_state.json
│   │
│   ├── batch_001/                     # Batch 1 output
│   │   ├── song_001_hindi.json
│   │   ├── song_002_marathi.json
│   │   └── song_003_english.json
│   │
│   ├── batch_002/                     # Batch 2 output
│   │   ├── song_042_hindi.json
│   │   └── song_043_marathi.json
│   │
│   ├── valid/                         # Soft links to clean songs
│   │   ├── song_001_hindi.json → ../batch_001/song_001_hindi.json
│   │   └── song_002_marathi.json → ../batch_001/song_002_marathi.json
│   │
│   ├── review_required/               # Soft links to flagged songs
│   │   ├── song_015_hindi.json → ../batch_001/song_015_hindi.json
│   │   └── song_042_hindi.json → ../batch_002/song_042_hindi.json
│   │
│   └── errors/                        # Hard copies of failures
│       ├── page_005_segment_1.json    # Raw OCR + error context
│       └── page_006_segment_2.json
│
├── /processed_songs_with_chords/              # OUTPUT v1.1 (FUTURE)
│   └── batch_001/
│       ├── song_001_hindi_chords.json
│       └── song_002_marathi_chords.json
│
├── DOCUMENTATION/
│   ├── SONGBOOK_INGESTION_ARCHITECTURE.md     # THIS FILE
│   ├── DATA_SCHEMAS.md
│   ├── FAILURE_CASES.md
│   └── DEPLOYMENT_GUIDE.md
│
└── LOGS/
    ├── ingestion_2026_04_16.log              # Per-run logs
    ├── validation_report_2026_04_16.json
    └── error_dump_page_005.json              # Detailed failures
```

---

## 11. IMPLEMENTATION ROADMAP

### Phase 1: Core Pipeline (Weeks 1-2)
- [ ] ImageProcessor: Tesseract integration + song segmentation
- [ ] StructureConverter: Section parsing + chorus detection
- [ ] JSONWriter: Schema serialization
- [ ] Unit tests for each layer
- [ ] Manual testing on 50 sample images

### Phase 2: Validation & Error Handling (Week 3)
- [ ] SongValidator: All validation rules
- [ ] Error categorization + soft/hard links
- [ ] Recovery procedures
- [ ] Metadata tracking

### Phase 3: Testing & Documentation (Week 4)
- [ ] Integration tests (full pipeline)
- [ ] Performance benchmarks (songs/hour)
- [ ] Manual QA on edge cases
- [ ] Deploy to production folder structure

### Phase 4: Chord Injection (Later - v1.1)
- [ ] Chord source identification
- [ ] Matching algorithm
- [ ] Extended JSON schema
- [ ] Separate processor pipeline

---

## 12. PERFORMANCE TARGETS

```
Per-Image Performance:
  • OCR processing:      1-3 seconds (depends on image quality)
  • Structure conversion: <100ms
  • Validation:          <50ms
  • JSON serialization:  <50ms
  
  Total per image: ~2-4 seconds (typical)

Batch Processing:
  • 100 images:          3-7 minutes
  • 1,000 images:        30-70 minutes
  • Memory footprint:    <2GB for batch of 1000

Scaling (Linear):
  • Parallelizable:      Image processing (one thread per image)
  • Bottleneck:          OCR (CPU-bound)
  • Solution:            Multi-threading for batch processing
```

---

## 13. SECURITY CONSIDERATIONS

```
Input Validation:
  ✓ Image size limits (max 50MB per image)
  ✓ File type validation (jpg/png/tiff only)
  ✓ Path traversal prevention (normalized paths)

Output Safety:
  ✓ JSON validation before writing
  ✓ UTF-8 encoding enforced
  ✓ No code execution risk (data-only output)

Database Integration (Future):
  ✗ NO direct SQL from this layer
  ✗ Manual approval for all songs
  ✗ Import layer (separate) validates again
```

---

## SUMMARY

This architecture ensures:

✅ **DETERMINISTIC**: Same input → Same output, always  
✅ **DEBUGGABLE**: Each layer produces inspectable JSON  
✅ **EXTENSIBLE**: Chord injection ready (v1.1 separate layer)  
✅ **SAFE**: No DB writes, manual review required  
✅ **RECOVERABLE**: Comprehensive error handling + logs  
✅ **TESTABLE**: Clear interfaces between layers

---

**Document Version**: 1.0-DESIGN  
**Last Updated**: April 16, 2026  
**Status**: READY FOR IMPLEMENTATION
