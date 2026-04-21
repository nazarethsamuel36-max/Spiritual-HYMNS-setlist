# SONGBOOK INGESTION - QUICK REFERENCE & SUMMARY

**Version**: 1.0-COMPLETE  
**Date**: April 16, 2026  
**Status**: ARCHITECTURE DESIGN LOCKED (Ready for Implementation)

---

## 📚 COMPLETE ARCHITECTURE PACKAGE

You now have **4 comprehensive design documents** covering the full songbook image ingestion pipeline:

### Document #1: SONGBOOK_INGESTION_ARCHITECTURE.md
**Purpose**: High-level system design and pipeline overview  
**Contains**:
- Complete 5-layer pipeline diagram (text-based ASCII flow)
- Layer 1: Image Processing (OCR + song boundary detection)
- Layer 2: Structure Conversion (section parsing + chorus detection)
- Layer 3: Intermediate JSON Storage (staging files)
- Layer 4: Validation (deterministic quality checks)
- Layer 5: Chord Injection (v1.1 future hook)
- Data flow diagram with ASCII visualization
- Folder structure design
- Performance targets (2-4 sec per image)
- Implementation roadmap (4 phases)

### Document #2: DATA_SCHEMAS.md
**Purpose**: Complete JSON/data structure reference  
**Contains**:
- RawSongExtraction schema (Layer 1 output)
- StructuredSong full schema (Layer 2 output)
- ValidationResult schema
- Processing log (JSONL format)
- BatchValidationSummary
- ChordInjectionState (v1.1 tracking)
- ErrorReport schema
- Edge case examples (mixed language, unclear sections)
- Data invariants (must-always-be-true rules)

### Document #3: FAILURE_CASES_HANDLING.md
**Purpose**: Comprehensive troubleshooting & error handling guide  
**Contains**:
- Failure taxonomy (4 severity levels: FATAL, CRITICAL, VALIDATION, WARNING)
- Layer 1 failures: file I/O, OCR confidence, image corruption
- Layer 2 failures: section parsing, title extraction
- Layer 3 failures: disk space, encoding, directory creation
- Layer 4 failures: validation logic errors
- Cross-layer data consistency issues
- Failure handling algorithms (pseudocode)
- Recovery procedures for each failure type
- Diagnostic utilities and test frameworks
- Monitoring thresholds and alerting strategy

### Document #4: IMPLEMENTATION_GUIDE.md
**Purpose**: Complete Java implementation reference  
**Contains**:
- Maven pom.xml with all dependencies (Tesseract, GSON, etc.)
- Model classes (RawBlock, RawSong, StructuredSong, Section, Line)
- Layer 1: ImageProcessor class (full code)
- Layer 2: SongStructureConverter class (full code)
- Layer 3: JSONWriter class (full code)
- Layer 4: SongValidator class (full code)
- Main orchestrator: IngestionPipeline class
- Build commands (Maven, Docker)
- Unit test examples
- Running instructions

---

## 🎯 ARCHITECTURE AT A GLANCE

```
INPUT IMAGES                         STRUCTURED JSON OUTPUT
     │                                      │
     ▼                                      ▼
[LAYER 1] Image Processing          /processed_songs/
  • Tesseract OCR                   ├── batch_001/
  • Song boundary detection         │   ├── song_001_hindi.json
  • Italic formatting               │   ├── song_002_marathi.json
  • Confidence scoring              │   └── ...
     │                              ├── batch_002/
     ▼                              ├── valid/          (soft links)
[LAYER 2] Structure Conversion       ├── review_required/ (soft links)
  • Section parsing                 ├── errors/          (hard copies)
  • Verse/Chorus classification     └── __metadata__/
  • Line grouping                       ├── processing_log.jsonl
  • Label generation                    ├── validation_summary.json
     │                                  └── chord_injection_state.json
     ▼
[LAYER 3] JSON Staging
  • Write to /processed_songs/batch_XXX/
  • One file per song
  • NO database writes (yet)
  • Include metadata & status
     │
     ▼
[LAYER 4] Validation
  • Check required fields
  • Verify section completeness
  • Assess OCR confidence
  • Route to: valid/ or review_required/
  • Or mark as error
```

---

## 🔑 KEY DESIGN PRINCIPLES

### ✅ DETERMINISM
- Same image + Same config = IDENTICAL output (reproducible)
- No randomization anywhere
- Section order preserved from source
- Line breaks preserved exactly

### ✅ SEPARATION OF CONCERNS
- Each layer has single responsibility
- Layer 1: Raw OCR data
- Layer 2: Structured format
- Layer 3: File persistence
- Layer 4: Quality checks
- Clear interfaces between layers

### ✅ SAFETY
- NO direct database writes from this pipeline
- ALL output to staging JSON files
- Manual review required before import
- Comprehensive error handling
- Recovery procedures documented

### ✅ EXTENSIBILITY
- v1.1 Chord injection designed as separate layer
- Data structures include future_extensions stub
- Chord format planned: `[CHORD]lyrics text`
- Can inject without modifying base lyrics

### ✅ DEBUGGABILITY
- Every layer produces inspectable JSON
- Detailed logging at each step
- Error diagnostics include raw OCR output
- Soft links organize results by status
- Processing logs in JSONL format

---

## 📊 DATA FLOW EXAMPLE

### Input
```
/songbook_images/page_001.jpg
(Contains 3 songs, mixed Hindi/Marathi)
```

### Layer 1 Output (RawSongExtraction)
```json
[
  {
    "blockId": 0, "text": "1.", "confidence": 0.99, "isItalic": false,
    "blockId": 1, "text": "Aarati Ho", "confidence": 0.95, ...
    "blockId": 2, "text": "आरती हो आरती", "confidence": 0.92, "isItalic": true, ...
    ...
  }
]
```

### Layer 2 Output (StructuredSong - simplified)
```json
{
  "song": {
    "number": 1,
    "language": "hindi",
    "title": "Aarati Ho",
    "sections": [
      {
        "type": "verse",
        "label": "Verse 1",
        "lines": [{"text": "आरती हो आरती", "wasItalic": true}]
      },
      {
        "type": "chorus",
        "label": "Chorus",
        "lines": [{"text": "हरि हरि हरि", "wasItalic": true}]
      }
    ]
  },
  "validation": {
    "status": "VALID",
    "checksPassed": ["number_valid", "title_not_empty", "sections_not_empty"],
    "checksFailed": []
  }
}
```

### Layer 3 Output
File created: `/processed_songs/batch_001/song_001_hindi.json`

### Layer 4 Output
- Symbolic link created: `/processed_songs/valid/song_001_hindi.json → ../batch_001/song_001_hindi.json`
- Batch summary updated: `/processed_songs/__metadata__/validation_summary.json`

---

## ⚙️ VALIDATION RULES (Layer 4)

### REQUIRED CHECKS
```
✓ Song number exists and is positive integer
✓ Title not empty
✓ At least one section (verse OR chorus)
✓ Each section has at least one line
✓ Each line has non-empty text
✓ Section type is valid enum
✓ Language is valid enum
```

### IF VALID → Status = "VALID"
- Route to: `/processed_songs/valid/`
- Ready for database import

### IF ANY CHECK FAILS → Status = "REVIEW_REQUIRED"
- Route to: `/processed_songs/review_required/`
- Include detailed warnings
- Wait for human verification

### IF CRITICAL ERROR → Status = "ERROR"
- Route to: `/processed_songs/errors/`
- Include full diagnostics
- Log in batch summary as issue

---

## 🔄 FAILURE HANDLING MATRIX

| Scenario | Layer | Severity | Action | Output |
|----------|-------|----------|--------|--------|
| Image not readable | 1 | CRITICAL | Skip image | Error report |
| OCR confidence < 50% | 1 | CRITICAL | Mark ERROR | Error report |
| No song numbers found | 1 | CRITICAL | Mark UNSTRUCTURED | Diagnostic JSON |
| Cannot parse sections | 2 | VALIDATION | Mark REVIEW | Include all text |
| Empty section | 2 | CRITICAL | Mark ERROR | Error report |
| Missing title | 2 | VALIDATION | Infer + flag | REVIEW_REQUIRED |
| Disk full | 3 | FATAL | Exit + checkpoint | Batch state saved |
| JSON encoding error | 3 | CRITICAL | Skip song | Error report |
| Duplicate song number | 4 | VALIDATION | Flag duplicate | REVIEW_REQUIRED |
| Low OCR avg | 4 | VALIDATION | Add warning | REVIEW_REQUIRED or VALID+warning |

---

## 📂 OUTPUT STRUCTURE (After Processing)

```
/processed_songs/
├── __metadata__/
│   ├── processing_log.jsonl
│   ├── validation_summary.json
│   └── chord_injection_state.json
├── batch_001/
│   ├── song_001_hindi.json
│   ├── song_002_marathi.json
│   ├── song_003_english.json
│   └── SUMMARY.json
├── valid/                    ← Symlinks to clean songs
│   ├── song_001_hindi.json → ../batch_001/song_001_hindi.json
│   ├── song_002_marathi.json → ../batch_001/song_002_marathi.json
│   └── song_003_english.json → ../batch_001/song_003_english.json
├── review_required/          ← Symlinks to flagged songs
│   └── song_015_hindi.json → ../batch_001/song_015_hindi.json
└── errors/                   ← Hard copies of failures
    └── page_042_segment_3.json
```

---

## 🚀 PERFORMANCE TARGETS

| Metric | Target | Notes |
|--------|--------|-------|
| Per-image OCR | 1-3 sec | Depends on image quality |
| Structure conversion | <100ms | Fast parsing |
| JSON serialization | <50ms | GSON library |
| Validation | <50ms | Simple checks |
| **Total per image** | **2-4 sec** | Typical case |
| Batch of 100 images | 3-7 min | Linear scaling |
| Batch of 1000 images | 30-70 min | Can parallelize |
| Memory footprint | <2GB | For 1000 songs |

---

## 🔐 SECURITY & SAFETY

### What This Pipeline DOES
✓ Extract and structure song data  
✓ Validate quality  
✓ Stage output to JSON (inspection-ready)  
✓ Provide detailed error diagnostics  
✓ Track all processing steps  

### What This Pipeline DOES NOT DO
✗ Insert directly into database  
✗ Modify original images  
✗ Execute any user code  
✗ Process untrusted input (assumes valid song bookimages)  
✗ Require authenticated access  

### When to Add Import Layer
- After manual review of /processed_songs/valid/
- Create separate import_pipeline.java
- Implement database validation
- Add transaction handling
- Then insert into production database

---

## 📋 TESTING STRATEGY

### Unit Tests (Per Layer)
- ImageProcessor: mock OCR output, test segmentation
- StructureConverter: test section classification logic
- JSONWriter: test file creation and format
- SongValidator: test all validation rules

### Integration Tests
- Full pipeline on 10-20 representative images
- Test each status outcome (VALID, REVIEW_REQUIRED, ERROR)
- Verify output directory structure
- Validate JSON files against schema

### Regression Tests
- Re-process known good images
- Verify output unchanged (determinism)
- Track performance metrics

### Manual QA
- Inspect 10% of /processed_songs/valid/ files
- Review all /processed_songs/review_required/ files
- Spot-check error diagnostics
- Verify section classification accuracy

---

## 🔗 CHORD INJECTION (v1.1 - Future)

### How It's Designed (Now)

Current v1.0 StructuredSong includes:
```json
"future_extensions": {
  "chords": null,
  "chords_status": "NOT_EXTRACTED",
  "ready_for_chord_injection": true
}
```

### Chord Injection Flow (v1.1)

```
/processed_songs/batch_001/
    ↓
[Separate Chord Extraction Engine]
    • Parse chord sources (images, tabs, other)
    • Match chords to lyrics by position
    ↓
/processed_songs_with_chords/batch_001/
    • Same structure as v1.0
    • Added chords array in each line
    • Format: [CHORD]lyrics text
```

### Example (v1.1 Output)

```json
{
  "line": {
    "text": "आरती हो आरती",
    "chords": [
      {"position": 0, "chord": "C"},
      {"position": 8, "chord": "G"}
    ]
  },
  "chord_format": "inline",
  "chord_confidence": 0.85
}
```

Rendered: `[C]आरती हो [G]आरती`

---

## 📖 HOW TO USE THIS DOCUMENTATION

### For Architects
- Read **SONGBOOK_INGESTION_ARCHITECTURE.md** first
- Review data flow diagram and layer responsibilities
- Check failure taxonomy in FAILURE_CASES_HANDLING.md

### For Implementers
- Start with **IMPLEMENTATION_GUIDE.md**
- Use MODEL CLASSES section as template
- Copy code scaffolding (ImageProcessor, etc.)
- Reference FAILURE_CASES for error handling

### For QA/Testers
- Study DATA_SCHEMAS.md to understand expected outputs
- Review test examples in IMPLEMENTATION_GUIDE.md
- Use diagnostic tools from FAILURE_CASES_HANDLING.md

### For Operations/DevOps
- Review folder structure in SONGBOOK_INGESTION_ARCHITECTURE.md
- Check Docker setup in IMPLEMENTATION_GUIDE.md
- Monitor thresholds in FAILURE_CASES_HANDLING.md

---

## ✅ ARCHITECTURE CHECKPOINTS

Before implementing, verify:

- [ ] All 4 documents reviewed by team
- [ ] Layer responsibilities understood
- [ ] Data schemas validated against use cases
- [ ] Failure handling procedures acceptable
- [ ] Performance targets achievable
- [ ] Folder structure approved
- [ ] OCR engine (Tesseract) procured/licensed
- [ ] Test images procured
- [ ] Team trained on architecture

---

## 🎓 LESSONS EMBEDDED IN DESIGN

### Why NO Database Writes
**Lesson**: Direct OCR → DB creates data quality nightmares  
**Solution**: Stage to JSON first; human review required  
**Benefit**: Ability to re-process without database cleanup

### Why Soft Links
**Lesson**: Need to organize output by status (valid/review)  
**Solution**: Soft links preserve single source of truth  
**Benefit**: Audit trail; can revert categorization; no duplication

### Why DETERMINISM Requirement
**Lesson**: Non-deterministic extractors cause debugging nightmares  
**Solution**: No random elements; same input → same output always  
**Benefit**: Reproducible bugs; cache-friendly; deterministic testing

### Why Failure Taxonomy
**Lesson**: Treating all errors the same leads to lost data or false confidence  
**Solution**: Classify by severity (FATAL/CRITICAL/VALIDATION/WARNING)  
**Benefit**: Right response for each failure type

### Why v1.1 Hook for Chords
**Lesson**: Feature scope creep kills initial release  
**Solution**: Design extensibility BUT don't implement yet  
**Benefit**: Clean separation; v1.0 focused; v1.1 planned

---

## 📞 DESIGN DECISION RATIONALE

| Decision | Why | Alternative Rejected |
|----------|-----|----------------------|
| JSON staging (not DB) | Safe, inspectable, reversible | Direct DB writes too risky |
| Soft links for status | Single source of truth | Copies create duplicates |
| Tesseract (not ML) | Deterministic, open-source, reliable | ML models non-deterministic |
| 0.7 confidence threshold | Conservative (true positives only) | 0.5 causes too many false positives |
| REVIEW_REQUIRED status | Catches ambiguous cases | All-or-nothing breaks edge cases |
| 4-layer not 2-layer | Clear separation of concerns | 2-layer mixing logic, hard to test/debug |
| Chord as v1.1 | Focus on core feature | Scope creep delays v1.0 release |

---

## 🎉 YOU HAVE EVERYTHING NEEDED

To implement this architecture, you now have:

✅ **Complete System Design** - How everything fits together  
✅ **Data Structure Specifications** - Exact JSON schemas  
✅ **Error Handling Guide** - What to do when things fail  
✅ **Implementation Code** - Java classes ready to fill in  
✅ **Testing Strategy** - How to verify it works  
✅ **Deployment Guide** - How to run it  
✅ **Performance Targets** - What to measure  
✅ **Future Roadmap** - v1.1+ extensibility  

### Next Steps

1. **[ARCHITECTURE REVIEW]** - Team walkthrough of all 4 docs (2 hours)
2. **[ENVIRONMENT SETUP]** - Install Java 11, Maven, Tesseract (1 hour)
3. **[SKELETON IMPLEMENTATION]** - Create class stubs (2 hours)
4. **[LAYER 1 IMPL]** - ImageProcessor (4-6 hours)
5. **[LAYER 2 IMPL]** - SongStructureConverter (3-4 hours)
6. **[LAYER 3 IMPL]** - JSONWriter (1-2 hours)
7. **[LAYER 4 IMPL]** - SongValidator (2-3 hours)
8. **[INTEGRATION]** - Connect all layers (1-2 hours)
9. **[TESTING]** - Unit + integration tests (4-6 hours)
10. **[QA CYCLE]** - Manual testing, refinement (3-5 hours)

**Estimated Total**: 25-35 person-hours for full implementation

---

**Document Version**: 1.0-FINAL  
**Status**: ✅ ARCHITECTURE COMPLETE & READY FOR IMPLEMENTATION  
**Last Updated**: April 16, 2026

---

## 📎 DOCUMENT REFERENCE

| Document | Purpose | Audience |
|----------|---------|----------|
| SONGBOOK_INGESTION_ARCHITECTURE.md | System design overview | Architects, Tech leads |
| DATA_SCHEMAS.md | JSON/data structures | Developers, QA |
| FAILURE_CASES_HANDLING.md | Error handling & troubleshooting | QA, Operations |
| IMPLEMENTATION_GUIDE.md | Code & implementation | Developers |
| THIS FILE | Quick reference & summary | Everyone |

**All files located in**: `d:\worship-song-library\`
