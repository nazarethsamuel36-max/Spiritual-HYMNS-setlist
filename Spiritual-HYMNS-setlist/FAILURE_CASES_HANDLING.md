# SONGBOOK INGESTION - FAILURE CASES & HANDLING

**Version**: 1.0  
**Purpose**: Comprehensive troubleshooting guide for all failure modes

---

## 1. FAILURE TAXONOMY

### 1.1 Severity Levels

```
LEVEL 1: FATAL (Stop All Processing)
  └─ System cannot continue
  └─ Action: Log error + exit with status code 1

LEVEL 2: CRITICAL (Skip Song, Continue Batch)
  └─ Individual song cannot be processed
  └─ Action: Mark ERROR; move to /errors/; continue to next song

LEVEL 3: VALIDATION (Flag for Review, Continue)
  └─ Song processable but quality uncertain
  └─ Action: Mark REVIEW_REQUIRED; move to /review_required/; continue

LEVEL 4: WARNING (Mark with Notes, Continue as VALID)
  └─ Song valid with minor quality concerns
  └─ Action: Include warnings in JSON; continue as VALID
```

---

## 2. LAYER 1 (IMAGE PROCESSING) FAILURES

### 2.1 Image Read Failures

#### Failure: File Not Found

```
Condition: /songbook_images/ missing or inaccessible
Root Cause: Path not configured or directory moved
Severity: FATAL

Detection:
  IF FileNotFoundException on image
  THEN log error and exit

Prevention:
  - Verify path exists before batch processing
  - Use absolute paths or mount volumes consistently
  
Recovery:
  1. Check directory structure: ls /songbook_images/
  2. Verify permissions: chmod 755 /songbook_images/
  3. Restart batch from last successful image

Example Log:
  ERROR: [2026-04-16T10:30:00Z] Image directory not found: /songbook_images/
  FATAL: Cannot proceed without input source
  Action: Check configuration and retry
```

#### Failure: Unsupported Image Format

```
Condition: Image is .bmp, .gif, or other non-supported format
Root Cause: Songbook scanned in unsupported format
Severity: CRITICAL

Detection:
  IF file extension NOT IN [jpg|png|tiff]
  THEN skip file and log warning

Handling:
  1. Log skipped file
  2. Continue to next image
  3. Add note: "Unsupported format"

Prevention:
  - Validate file extensions before processing
  - Document supported formats in README
  
Recovery:
  - Convert image to PNG: convert image.gif image.png
  - Re-run batch

Example Log:
  WARN: [2026-04-16T10:30:05Z] Skipping unsupported format: page_001.bmp
  INFO: Supported formats: jpg, png, tiff
  INFO: To continue: convert page_001.bmp to png and re-run
```

#### Failure: Image Corrupted

```
Condition: Image file exists but is unreadable or truncated
Root Cause: Download incomplete, storage corruption, or malformed file
Severity: CRITICAL

Detection:
  IF image.load() throws IOException
  THEN mark as ERROR

Handling:
  1. Check file integrity: file page_001.jpg
  2. Verify file size > 0
  3. Try to recover with ImageMagick: convert -auto-orient
  4. If recovery fails, skip and mark ERROR

Recovery Options:
  Option A: Re-download/re-scan image
  Option B: Use alternate copy if available
  Option C: Skip image (if redundant with others)

Example Log:
  ERROR: [2026-04-16T10:30:10Z] Image corrupt: page_042.jpg
  Reason: File truncated or not a valid image
  Suggested Action: 
    1. Re-download page_042.jpg
    2. Or verify against backup: ls -lah page_042*
    3. Or skip and re-scan page 42
```

#### Failure: Insufficient Memory for Image

```
Condition: Image too large for available RAM
Root Cause: Very high resolution (>300 DPI on large page) or large format
Severity: CRITICAL

Detection:
  IF OutOfMemoryError during image load
  THEN log and skip

Handling:
  1. Check image size: file -s *.jpg
  2. Reduce resolution: convert page_001.jpg -resize 50% page_001_low_res.jpg
  3. Increase JVM memory: -Xmx4G
  4. Or process images serially (not in parallel)

Prevention:
  - Set image size limit (e.g., max 50MB)
  - Monitor memory before large batch
  - Use streaming OCR for very large files

Example Log:
  ERROR: [2026-04-16T10:35:00Z] OutOfMemoryError processing page_100.jpg
  Image size: 125MB
  JVM heap: 2GB (limit reached)
  
  Recovery:
    1. Restart with -Xmx4G flag
    2. Or resize image: convert page_100.jpg -resize 50% page_100_small.jpg
    3. Or process one image at a time
```

#### Failure: File Permission Denied

```
Condition: Image file readable but Tesseract cannot write temp files
Root Cause: Directory not writable by process user
Severity: CRITICAL

Detection:
  IF Permission denied on /tmp or working directory
  THEN log and skip

Handling:
  1. Check file permissions: ls -la /processed_songs/
  2. Check temp directory: ls -la /tmp/
  3. Change ownership: chown -R processuser:group /processed_songs/
  4. Add write permission: chmod 755 /processed_songs/

Prevention:
  - Verify permissions before batch: [[ -w /processed_songs ]] && echo OK
  - Run process with correct user
  - Test write to output directory first

Example Log:
  ERROR: [2026-04-16T10:40:00Z] Permission denied writing to /processed_songs/
  Fix:
    sudo chown -R $(whoami):$(id -g -n) /processed_songs/
    chmod 755 /processed_songs/
```

---

### 2.2 OCR Processing Failures

#### Failure: OCR Confidence Too Low (Global)

```
Condition: All blocks have confidence < 0.5
Root Cause: Image too blurry, poor quality scan, or language not recognized
Severity: CRITICAL

Detection:
  IF avg_confidence < 0.5 for entire image
  THEN mark entire image ERROR

Handling:
  1. Visually inspect image quality
  2. Check if language selection was correct
  3. Try higher resolution version
  4. Manual data entry as fallback

Prevention:
  Test scan quality before processing full batch:
    tesseract --psm 6 -l hin+mar+eng test_page.jpg - | grep confidence
  
  If low, improve scanning:
    - Increase DPI (200->300)
    - Improve lighting during scan
    - Clean scanner glass
    - Replace old books

Recovery:
  1. Re-scan at 300 DPI
  2. Use alternate copy of songbook
  3. Apply image enhancement: convert -enhance -sharpen page.jpg page_sharp.jpg
  4. Try with different OCR engine (Tesseract --oem 0 vs 3)

Example Log:
  ERROR: [2026-04-16T10:45:00Z] Image quality unacceptable: page_015.jpg
  Average OCR confidence: 0.38 (minimum: 0.5)
  
  Recommended Action:
    1. The image is too blurry or low contrast
    2. Re-scan page 15 at higher resolution (300+ DPI)
    3. Ensure good lighting and clean scanner
    4. Re-run batch processing
```

#### Failure: Language Not Detectible

```
Condition: Tesseract cannot determine language
Root Cause: Mixed languages beyond engine capability, or corrupted text
Severity: VALIDATION (mark REVIEW_REQUIRED)

Detection:
  IF detected_language == "UNKNOWN"
  THEN mark REVIEW_REQUIRED

Handling:
  1. Inspect raw OCR output
  2. Manually identify language or rerun with explicit language flag
  3. Add note to review_required JSON
  4. User intervention for manual classification

Prevention:
  - Test language detection on sample images
  - Provide explicit -l flag: tesseract -l hin+mar+eng
  
Recovery:
  1. Manually identify primary language in OCR output
  2. Re-run with explicit language: tesseract -l marathi input.jpg output
  3. Or add metadata: "language_override": "marathi"

Example Warning:
  WARN: [2026-04-16T10:50:00Z] Language indeterminate for page_022.jpg
  Detected scripts: 1% Hindi, 1% Marathi, 87% Unknown
  Recommendation: Manual language classification required
  Status: REVIEW_REQUIRED
```

#### Failure: Formatting Detection Ambiguous

```
Condition: Tesseract italic/bold detection < 0.5 confidence
Root Cause: Font rendering unclear, mixed formatting, or oldprinting
Severity: VALIDATION (mark REVIEW_REQUIRED)

Detection:
  IF italic_confidence < 0.6 for section classified as chorus
  THEN flag as REVIEW_REQUIRED

Handling:
  1. Include all confidence scores in output
  2. Mark section_classification_confidence in JSON
  3. User reviews and provides manual classification
  4. Continue processing (don't block)

Prevention:
  - Set clear threshold: italic_confidence >= 0.7 for chorus classification
  - Manual spot-checks on test batch
  
Recovery:
  1. Review /processed_songs/review_required/ section classifications
  2. Manually reclassify sections if needed
  3. Or reprocess with lower threshold (if more false positives acceptable)

Example Log:
  WARN: [2026-04-16T10:55:00Z] Uncertain formatting in page_035.jpg, song #42
  Chorus classification confidence: 0.52 (threshold: 0.7)
  Issue: Font appears to be small italics mixed with normal weight
  Status: REVIEW_REQUIRED
  Action: Manual verification needed
```

---

### 2.3 Song Boundary Detection Failures

#### Failure: No Song Numbers Found

```
Condition: Image contains lyrics but no song numbers
Root Cause: Songbook format doesn't use numbers, or pre-title numbering missing
Severity: CRITICAL

Detection:
  IF no /^[0-9]+\./ found in OCR text
  THEN mark as UNSTRUCTURED

Handling:
  1. Check if image contains actual song content
  2. If yes, treat entire image as one "unknown structure" song
  3. Mark with flag: "structure_type": "unstructured"
  4. Store with generic number in batch: batch_id_unnumbered_1.json
  5. User must manually review and structure

Prevention:
  - Inspect first few pages to understand numbering format
  - Document expected format in metadata
  
Recovery:
  1. Manually identify song boundaries (verses, choruses)
  2. Assign song numbers sequentially
  3. Re-run structure conversion with custom song boundaries

Example Error:
  ERROR: [2026-04-16T11:00:00Z] No song numbers detected: page_branch_01.jpg
  Detected text: "[lyrics content]" but no "1.", "2.", etc. patterns
  Classification: UNSTRUCTURED_CONTENT
  Action: 
    1. Verify this is a song content (eyes on)
    2. If yes: extract as "batch_001_unnumbered_1.json" and mark REVIEW_REQUIRED
    3. If no: skip image (advertisement or non-song page)
```

#### Failure: Overlapping Song Numbers

```
Condition: Multiple sections start with "1." or same number repeated
Root Cause: OCR error mistaking punctuation for number, or page layout confusion
Severity: VALIDATION

Detection:
  IF song_number appears twice in same image
  THEN log warning and flag REVIEW_REQUIRED

Handling:
  1. Include all detected instances
  2. Mark potential_conflict: true
  3. User manually resolves which is correct

Prevention:
  - Validate number sequence: should be monotonic increasing
  - Check for common OCR errors: "I" → "1", "O" → "0"

Recovery:
  1. Inspect OCR confidence for conflicting numbers
  2. Keep highest-confidence one
  3. Mark other as note field
  4. User can correct manually

Example Log:
  WARN: [2026-04-16T11:05:00Z] Duplicate song number in page_050.jpg
  Detected: Song #5 at positions 0 and 450
  First match confidence: 0.98 (likely correct)
  Second match confidence: 0.42 (likely OCR error)
  Action: Using first match; second logged as note for review
```

---

## 3. LAYER 2 (STRUCTURE CONVERSION) FAILURES

### 3.1 Section Parsing Failures

#### Failure: Cannot Identify Verse/Chorus Boundary

```
Condition: Song is one block of text without clear section boundaries
Root Cause: No formatting, no explicit labels like "Verse 1:", continuous lyrics
Severity: VALIDATION

Detection:
  IF no section boundaries found AND italic_detection fails
  THEN section_count == 1, mark REVIEW_REQUIRED

Handling:
  1. Treat entire song as single "unclassified_verse"
  2. Mark as REVIEW_REQUIRED
  3. Include note: "Manual section classification required"
  4. User later manually breaks into verses/chorus

Prevention:
  - Scan test batch and check section parsing accuracy
  - Provide clear formatting guidelines to scanner
  
Recovery:
  1. Manual review of song lyrics
  2. Identify verse/chorus boundaries (often there are patterns)
  3. Re-mark sections
  4. Or accept as single section for now

Example JSON:
  {
    "sections": [
      {
        "type": "unclassified",
        "label": "Content",
        "classification_confidence": 0.0,
        "lines": [...]
      }
    ],
    "validation": {
      "warnings": ["no_section_boundaries_detected"],
      "status": "REVIEW_REQUIRED",
      "note": "Song appears to be single continuous block. Manual section breakdown needed."
    }
  }
```

#### Failure: Empty Section Detected

```
Condition: Section header ("Verse 1") found but no lines under it
Root Cause: OCR error missing lines, or page break between header and content
Severity: CRITICAL

Detection:
  IF section.lines.length == 0
  THEN mark ERROR for this song

Handling:
  1. Do not include empty section in output
  2. Mark as ERROR
  3. Move to /errors/
  4. Include diagnostic: section found but empty

Prevention:
  - Manual inspection of test batch
  - Adjust page scanning to avoid page breaks mid-section
  
Recovery:
  1. Re-scan page (ensure section content not on different page)
  2. Or use manual reconstruction from original source

Example Log:
  ERROR: [2026-04-16T11:10:00Z] Empty section in song: batch_001/song_043.json
  Section label: "Chorus" but contains 0 lines
  Likely cause: Page break between chorus label and content
  Recovery: Re-scan with overlap or adjust scanning parameters
```

---

### 3.2 Title and Metadata Extraction Failures

#### Failure: Song Title Missing or Truncated

```
Condition: Song number present but title line is empty or cut off
Root Cause: OCR missed title line, or page layout places title off-page
Severity: VALIDATION

Detection:
  IF title == "" OR title.length <= 2
  THEN mark REVIEW_REQUIRED

Handling:
  1. Try to infer title from first lyric line
  2. Mark as "title_inferred" or "title_missing"
  3. Include first lyric as suggestion
  4. User can correct during review

Prevention:
  - Ensure title is on same page as song number
  - Test on sample pages
  
Recovery:
  1. Manually enter title from original source
  2. Or identify consistent naming pattern from lyrics

Example JSON:
  {
    "song": {
      "number": 5,
      "title": "",
      "title_status": "MISSING",
      "title_suggestion_from_first_line": "Krishna Radha"
    },
    "validation": {
      "warnings": ["title_missing"],
      "status": "REVIEW_REQUIRED"
    }
  }
```

---

## 4. LAYER 3 (JSON STORAGE) FAILURES

### 4.1 File Write Failures

#### Failure: Disk Space Exhausted

```
Condition: Output directory full, no space to write JSON
Root Cause: /processed_songs/ on small partition, or large batch
Severity: FATAL

Detection:
  IF IOException: "No space left on device"
  THEN stop batch

Handling:
  1. Check disk space: df -h /processed_songs/
  2. Identify what can be cleared
  3. Compress or move old batches
  4. Retry batch

Prevention:
  - Pre-check disk space: require min 10GB available
  - Monitor batch size: estimate ~5KB per song JSON
  - For 1000 songs: ~5MB output expected
  
Recovery:
  1. Check current usage: du -sh /processed_songs/
  2. Archive old batches: tar -czf batch_001.tar.gz batch_001/
  3. Free space: rm -rf *.tar.gz or move to USB
  4. Restart batch from checkpoint

Example Log:
  FATAL: [2026-04-16T11:15:00Z] Disk space exhausted
  Partition: /processed_songs/ (full)
  Required: 50MB remaining, Available: 0MB
  Action:
    1. df -h to check all partitions
    2. Archive old batches or delete if not needed
    3. Free at least 100MB and retry
```

#### Failure: JSON Encoding Error (Unicode)

```
Condition: Special characters cannot be encoded to JSON (invalid UTF-8)
Root Cause: OCR output contains invalid Unicode or mixing of encodings
Severity: CRITICAL

Detection:
  IF JSONException during serialization
  THEN log encoding issue

Handling:
  1. Detect non-UTF-8 characters
  2. Replace with escape sequences or remove
  3. Include note: "line_N: invalid character at position_X"
  4. Mark song REVIEW_REQUIRED (if fixable) or ERROR (if data corrupted)

Prevention:
  - Always specify UTF-8 encoding
  - Validate text before serialization
  - Use character escaping library

Recovery:
  1. Manual review of original OCR text
  2. Manually verify/retype problematic lines
  3. Or use OCR engine with better encoding handling

Example Error:
  ERROR: [2026-04-16T11:20:00Z] JSON encoding failure in song_040.json
  Invalid UTF-8 sequence at line 12
  Raw bytes: 0x89 0x50 0x4E 0x47 (likely PNG header in text!)
  Cause: Possible OCR corruption or data insertion error
  Action: Manual inspection required
```

#### Failure: Parent Directory Missing

```
Condition: /processed_songs/ doesn't exist and cannot be created
Root Cause: No parent directory, permission denied on parent
Severity: FATAL

Detection:
  IF mkdir /processed_songs/ fails
  THEN stop batch

Handling:
  1. Check parent: ls -la /processed_songs/../
  2. Verify mount point: df /processed_songs
  3. Try to create: mkdir -p /processed_songs/batch_001
  4. If fails, check permissions: ls -ld /processed_songs/..

Prevention:
  - Initialize `/processed_songs/` directory structure in setup phase
  - Include folder creation in deployment scripts
  
Recovery:
  1. Create directories: mkdir -p /processed_songs/{batch_001,__metadata__,valid,review_required,errors}
  2. Set permissions: chmod 755 /processed_songs
  3. Verify: ls -la /processed_songs/
  4. Retry batch

Example Log:
  FATAL: [2026-04-16T11:25:00Z] Cannot create output directory
  Path: /processed_songs/batch_001
  Reason: Permission denied (parent dir not writable)
  Fix:
    chmod 755 /processed_songs
    mkdir -p /processed_songs/batch_001
```

---

## 5. LAYER 4 (VALIDATION) FAILURES

### 5.1 Logic Errors in Validation

#### Failure: Song Number Appears Duplicate

```
Condition: Two songs in same batch have same song number
Root Cause: OCR error (misreading number) or data entry duplicate
Severity: VALIDATION

Detection:
  IF song_number seen before in batch
  THEN flag REVIEW_REQUIRED

Handling:
  1. Log both instances
  2. Mark later occurrence as REVIEW_REQUIRED
  3. Include note: "potential_duplicate_song_number"
  4. Validation summary marks as issue

Prevention:
  - Check OCR confidence for song numbers
  - Validate sequence: numbers should increase
  
Recovery:
  1. Check original image: which is correct?
  2. Manually assign next available number to one
  3. Or if truly duplicate, remove one

Example Log:
  WARN: [2026-04-16T11:30:00Z] Duplicate song number in batch
  Song #42 appears in:
    - batch_001/song_042_hindi.json (confidence: 0.99)
    - batch_001/song_042b_marathi.json (confidence: 0.52)
  
  Action: Second occurrence marked REVIEW_REQUIRED
  User should manually verify original images
```

---

## 6. CROSS-LAYER FAILURES

### 6.1 Data Consistency Issues

#### Failure: Metadata Mismatch

```
Condition: extraction_metadata doesn't match actual song data
Root Cause: Processing interrupted, or data modification between layers
Severity: VALIDATION

Detection:
  IF metadata.line_count != actual section.lines.count()
  THEN log mismatch

Handling:
  1. Recalculate metrics from actual data
  2. Update metadata to reflect truth
  3. Mark as REVIEW_REQUIRED if mismatch significant
  
Prevention:
  - Recalculate metadata during layer 3 → layer 4 transition
  - Don't modify song data after layer 3

Recovery:
  1. Regenerate metrics: run SongMetricsCalculator
  2. Verify output is correct
```

---

## 7. FAILURE HANDLING ALGORITHMS

### 7.1 Graceful Degradation (Per Layer)

```python
CLASS FailureHandler:
  
  FUNCTION handle_layer_1_failure(error: Exception, image_path: str):
    severity = classify_error(error)
    
    IF severity == FATAL:
      log_fatal(error, image_path)
      return STOP_BATCH
    
    ELSE IF severity == CRITICAL:
      log_error(error, image_path)
      write_error_report(image_path, error)
      return SKIP_IMAGE_CONTINUE_BATCH
    
    ELSE IF severity == VALIDATION:
      log_warning(error, image_path)
      return MARK_REVIEW_REQUIRED
  
  FUNCTION handle_layer_2_failure(error: Exception, raw_song: RawSong):
    IF error == EmptySectionError:
      return MARK_AS_ERROR
    
    ELSE IF error == AmbiguousSectionBoundary:
      return MARK_AS_REVIEW_REQUIRED_WITH_DIAGNOSTIC
    
    ELSE:
      return SKIP_SONG_CONTINUE_BATCH
  
  FUNCTION handle_layer_3_failure(error: Exception, structured_song: StructuredSong):
    IF error == DiskSpaceError:
      return STOP_BATCH_WITH_DIAGNOSTIC
    
    ELSE IF error == EncodingError:
      return MARK_AS_ERROR_WITH_PARTIAL_OUTPUT
    
    ELSE IF error == IOError:
      retry count += 1
      IF retry count < 3:
        return RETRY
      ELSE:
        return SKIP_SONG_LOG_ERROR
  
  FUNCTION handle_layer_4_failure(error: Exception, song: StructuredSong):
    # Validation should never crash
    IF error raised:
      DEFAULT_VALIDATION = {
        status: REVIEW_REQUIRED,
        note: "Validation process error; marked for manual review"
      }
      return DEFAULT_VALIDATION
```

### 7.2 Recovery Checkpoints

```python
# Batch processing with checkpoints

batch_start_marker = create_checkpoint("batch_001_start")

FOR EACH image IN batch:
  image_checkpoint = create_checkpoint(f"image_{image.name}")
  
  TRY:
    # Process all 4 layers
    raw_song = layer1_process(image)
    structured_song = layer2_convert(raw_song)
    json_output = layer3_write(structured_song)
    validation_result = layer4_validate(json_output)
    
    # Mark image successful
    mark_checkpoint_complete(image_checkpoint)
    
  CATCH error:
    recovery_strategy = handle_failure(error)
    
    IF recovery_strategy == STOP_BATCH:
      save_batch_state(batch_id, current_image_index)
      exit(1)
    
    ELSE IF recovery_strategy == SKIP_IMAGE:
      mark_checkpoint_failed(image_checkpoint)
      continue to next image
    
    ELSE IF recovery_strategy == MARK_REVIEW:
      mark_checkpoint_review(image_checkpoint)
      continue to next image

# After batch completes (successfully or with partial failure)
batch_summary = create_summary(batch_start_marker)
write_summary_report(batch_summary)
```

---

## 8. MONITORING & ALERTING

### 8.1 Warning Thresholds

```
ALERT CONDITIONS:

1. OCR Confidence < 0.7:
   Action: Log warning, mark song REVIEW_REQUIRED
   Threshold: More than 5 per batch → Alert: "Scanning quality issue"
   
2. Unstructured Content (no sections):
   Action: Log validation warning
   Threshold: More than 10 per batch → Alert: "Check songbook format"
   
3. Empty Sections:
   Action: Log error
   Threshold: Any occurrence → Alert: "Data integrity issue"
   
4. Encoding Errors:
   Action: Log error, skip song
   Threshold: Any occurrence → Alert: "Check file encoding"
   
5. Disk Space:
   Action: Pre-check and warn
   Threshold: < 500MB available → Alert: "Insufficient disk space"
   
6. Processing Time:
   Action: Log and track
   Threshold: > 30sec per image → Alert: "Slow OCR performance"
```

### 8.2 Batch Completion Report

```json
{
  "batch_id": "001",
  "total_processed": 150,
  "successful": 142,
  "review_required": 7,
  "errors": 1,
  "success_rate": 0.947,
  
  "alerts": [
    {
      "severity": "INFO",
      "message": "Batch completed with 94.7% success rate"
    },
    {
      "severity": "WARN",
      "message": "7 songs require manual review (low OCR confidence or unclear sections)"
    },
    {
      "severity": "ERROR",
      "message": "1 song failed (unreadable image): page_042"
    }
  ],
  
  "recommendations": [
    "Review /processed_songs/review_required/ for manual verification",
    "Investigate error in /processed_songs/errors/page_042_segment_3.json",
    "Consider re-scanning page 42 at higher resolution",
    "142 songs ready for database import"
  ]
}
```

---

## 9. DEBUGGING UTILITIES

### 9.1 Diagnostic Tools

```bash
# Check image quality
$ tesseract page_001.jpg page_001_diagnosis -l hin+mar+eng
$ grep -i "confidence\|error" page_001_diagnosis.txt

# Validate JSON output
$ jq . processed_songs/batch_001/song_001_hindi.json
# If invalid: jq will show syntax error

# Count songs by status
$ find processed_songs -name "*.json" -path "*/batch_*/"|wc -l  # total
$ find processed_songs/valid -name "*.json" |wc -l              # valid
$ find processed_songs/review_required -name "*.json" |wc -l    # review
$ find processed_songs/errors -name "*.json" |wc -l             # errors

# Check validation summary
$ cat processed_songs/__metadata__/validation_summary.json |jq '.summary'

# Replay failed batch
$ grep -i "ERROR" processed_songs/__metadata__/processing_log.jsonl | jq '.output_file'
```

---

## 10. TESTING FAILURE SCENARIOS

### 10.1 Unit Tests for Error Handling

```java
@Test
public void testHandleLowOCRConfidence() {
  RawSong lowConfSong = createSongWithConfidence(0.4);
  ValidationResult result = validator.validate(lowConfSong);
  assertEquals("REVIEW_REQUIRED", result.status);
}

@Test
public void testHandleEmptySection() {
  StructuredSong songWithEmptySection = createSongWithEmptySection();
  assertThrows(ValidationException.class, () -> {
    validator.validate(songWithEmptySection);
  });
}

@Test
public void testHandleMissingTitle() {
  StructuredSong noTitleSong = createSongWithoutTitle();
  ValidationResult result = validator.validate(noTitleSong);
  assertTrue(result.warnings.contains("title_missing"));
}

@Test
public void testHandleDuplicateSongNumber() {
  List<StructuredSong> batch = createBatchWithDuplicates();
  BatchValidator batchValidator = new BatchValidator();
  BatchValidationResult result = batchValidator.validateBatch(batch);
  assertEquals(1, result.duplicateCount);
  assertTrue(result.summary.containsKey("DUPLICATE_NUMBERS"));
}

@Test
public void testDiskSpaceCheck() {
  long availableSpace = FileSystemUtils.freeSpace("/processed_songs/");
  assertTrue(availableSpace > 500 * 1024 * 1024);  // > 500MB
}
```

---

## 11. FAILURE RECOVERY MATRIX

| Layer | Failure | Severity | Action | Output |
|-------|---------|----------|--------|--------|
| 1 | File not found | FATAL | Exit | Exit code 1 |
| 1 | Image corrupt | CRITICAL | Skip image | Error report |
| 1 | OCR conf < 0.5 | CRITICAL | Mark ERROR | /errors/ + diagnostic |
| 1 | Language unknown | VALIDATION | Mark REVIEW | /review_required/ |
| 2 | No sections | VALIDATION | Mark REVIEW | /review_required/ |
| 2 | Empty section | CRITICAL | Mark ERROR | Error report |
| 2 | No title | VALIDATION | Infer title | /processed_songs/ + warning |
| 3 | Disk full | FATAL | Save checkpoint, exit | Checkpoint file |
| 3 | Encoding error | CRITICAL | Skip song | Error report |
| 4 | Duplicate number | VALIDATION | Mark REVIEW | /review_required/ |
| 4 | Missing fields | VALIDATION | Mark REVIEW | /review_required/ |

---

**Document Version**: 1.0-DESIGN  
**Last Updated**: April 16, 2026  
**Status**: TROUBLESHOOTING REFERENCE COMPLETE
