# SONGBOOK INGESTION - DATA SCHEMAS

**Version**: 1.0  
**Purpose**: Reference schemas for all data structures produced by each layer

---

## 1. LAYER 1 OUTPUT: RAW OCR DATA

### RawSongExtraction Schema

```json
{
  "source_image": "/songbook_images/page_001.jpg",
  "extraction_timestamp": "2026-04-16T10:30:00Z",
  "ocr_engine": "tesseract-5.3",
  "tesseract_version": "5.3.0",
  "language_detected": ["hin", "mar", "eng"],
  "blocks": [
    {
      "block_id": 1,
      "text": "1.",
      "bbox": {
        "x": 10,
        "y": 20,
        "width": 15,
        "height": 25
      },
      "confidence": 0.99,
      "is_italic": false,
      "font_size_estimate": 12,
      "detected_language": "eng",
      "character_recognized": "1."
    },
    {
      "block_id": 2,
      "text": "Aarati Ho",
      "bbox": {
        "x": 30,
        "y": 20,
        "width": 120,
        "height": 25
      },
      "confidence": 0.95,
      "is_italic": false,
      "font_size_estimate": 14,
      "detected_language": "hin",
      "character_recognized": "Aarati Ho"
    },
    {
      "block_id": 3,
      "text": "Verse 1",
      "bbox": {
        "x": 10,
        "y": 50,
        "width": 70,
        "height": 20
      },
      "confidence": 0.88,
      "is_italic": false,
      "font_size_estimate": 11,
      "detected_language": "eng"
    },
    {
      "block_id": 4,
      "text": "आरती हो आरती",
      "bbox": {
        "x": 10,
        "y": 75,
        "width": 95,
        "height": 20
      },
      "confidence": 0.92,
      "is_italic": true,
      "font_size_estimate": 11,
      "detected_language": "hin"
    }
  ],
  "extraction_notes": "No errors; all blocks successfully extracted",
  "line_breaks_detected": true,
  "special_formatting": {
    "italic_count": 3,
    "bold_count": 0,
    "underline_count": 0
  }
}
```

---

## 2. LAYER 2 OUTPUT: STRUCTURED SONG

### StructuredSong Schema (Complete)

```json
{
  "extraction_metadata": {
    "version": "1.0",
    "source_image": "/songbook_images/page_001.jpg",
    "extraction_timestamp": "2026-04-16T10:30:00Z",
    "extraction_duration_ms": 2340,
    "ocr_engine": "tesseract-5.3",
    "ocr_confidence_avg": 0.92,
    "conversion_code_version": "v1.0",
    "status": "VALID|REVIEW_REQUIRED|ERROR"
  },
  
  "song": {
    "number": 1,
    "language": "hindi",
    "language_confidence": 0.95,
    "title": "Aarati Ho",
    "title_ocr_confidence": 0.95,
    "alternate_titles": [],
    "raw_lyrics": "1. Aarati Ho\nVerse 1\nआरती हो आरती...",
    
    "sections": [
      {
        "type": "verse",
        "label": "Verse 1",
        "section_id": "v1",
        "section_number": 1,
        "classification_confidence": 0.98,
        "classification_method": "explicit_label|italic_detection|heuristic",
        "is_repeated": false,
        "lines": [
          {
            "line_id": "v1_l1",
            "text": "आरती हो आरती",
            "original_line_number": 1,
            "source_block_id": 4,
            "ocr_confidence": 0.92,
            "was_italic": true,
            "line_length_chars": 14,
            "length_category": "short|medium|long",
            "notes": "Detected as italic in source; classified as verse per heuristic",
            "encoding": "UTF-8"
          },
          {
            "line_id": "v1_l2",
            "text": "तुम्हारी पालना",
            "original_line_number": 2,
            "source_block_id": 5,
            "ocr_confidence": 0.88,
            "was_italic": false,
            "line_length_chars": 12,
            "notes": null
          }
        ]
      },
      {
        "type": "chorus",
        "label": "Chorus",
        "section_id": "c1",
        "section_number": 1,
        "classification_confidence": 0.85,
        "classification_method": "italic_detection_group",
        "is_repeated": true,
        "repetition_count": 2,
        "lines": [
          {
            "line_id": "c1_l1",
            "text": "हरि हरि हरि",
            "original_line_number": 8,
            "source_block_id": 12,
            "ocr_confidence": 0.88,
            "was_italic": true,
            "notes": "Part of consecutive italic group"
          }
        ]
      }
    ],
    
    "section_summary": {
      "total_sections": 2,
      "verse_count": 1,
      "chorus_count": 1,
      "bridge_count": 0,
      "other_count": 0,
      "verse_labels": ["Verse 1"],
      "total_lines": 3,
      "total_characters": 41
    }
  },
  
  "validation": {
    "is_valid": true,
    "status": "VALID",
    "checks_performed": {
      "required_fields": {
        "number_present": {
          "passed": true,
          "message": null
        },
        "title_not_empty": {
          "passed": true,
          "message": null
        },
        "sections_not_empty": {
          "passed": true,
          "message": null
        }
      },
      "field_validation": {
        "number_is_integer": {
          "passed": true,
          "value": 1
        },
        "number_positive": {
          "passed": true
        },
        "title_length": {
          "passed": true,
          "length": 9,
          "constraints": "1-500 chars"
        },
        "language_valid": {
          "passed": true,
          "value": "hindi",
          "allowed": ["hindi", "marathi", "english", "mixed"]
        }
      },
      "section_validation": {
        "each_section_has_lines": {
          "passed": true,
          "section_count": 2
        },
        "no_empty_lines": {
          "passed": true
        },
        "section_types_valid": {
          "passed": true,
          "detected_types": ["verse", "chorus"]
        }
      },
      "consistency_checks": {
        "at_least_one_verse_or_chorus": {
          "passed": true,
          "verses": 1,
          "choruses": 1
        },
        "reasonable_section_count": {
          "passed": true,
          "count": 2,
          "max_allowed": 50
        },
        "ocr_confidence_acceptable": {
          "passed": true,
          "avg_confidence": 0.92,
          "min_threshold": 0.7
        }
      }
    },
    "checks_passed": [
      "number_present",
      "title_not_empty",
      "sections_not_empty",
      "number_is_integer",
      "number_positive",
      "title_length",
      "language_valid",
      "each_section_has_lines",
      "no_empty_lines"
    ],
    "checks_failed": [],
    "warnings": [],
    "failure_reason": null,
    "human_review_required": false
  },
  
  "quality_metrics": {
    "ocr_confidence_avg": 0.92,
    "ocr_confidence_min": 0.88,
    "ocr_confidence_max": 0.95,
    "zero_confidence_lines": 0,
    "low_confidence_lines": 0,
    "classification_confidence_avg": 0.91,
    "parsing_uncertainty_score": 0.05,
    "data_completeness_score": 1.0
  },
  
  "future_extensions": {
    "chords": null,
    "chords_status": "NOT_EXTRACTED",
    "chord_format": null,
    "chord_source": null,
    "ready_for_chord_injection": true
  },
  
  "processing_notes": [
    "Successfully extracted from page 1",
    "Section classification high confidence",
    "All OCR confidence > 0.7 threshold"
  ]
}
```

---

## 3. VALIDATION RESULT SCHEMA

### ValidationResult

```json
{
  "song_number": 1,
  "validation_timestamp": "2026-04-16T10:30:15Z",
  "validation_duration_ms": 45,
  
  "overall_status": "VALID|REVIEW_REQUIRED|ERROR",
  
  "validation_results": {
    "field_checks": {
      "number": {
        "status": "PASS",
        "message": "Number is valid positive integer",
        "value": 1
      },
      "title": {
        "status": "PASS",
        "message": "Title non-empty and within length limits",
        "value": "Aarati Ho"
      },
      "language": {
        "status": "PASS",
        "message": "Language is valid enum value",
        "value": "hindi"
      },
      "sections": {
        "status": "PASS",
        "message": "Song has 2 sections",
        "count": 2
      }
    },
    
    "section_checks": {
      "verse_1": {
        "type": "PASS",
        "label_format": "PASS",
        "has_lines": "PASS",
        "line_count": 2
      },
      "chorus": {
        "type": "PASS",
        "label_format": "PASS",
        "has_lines": "PASS",
        "line_count": 1
      }
    },
    
    "consistency_checks": {
      "verse_or_chorus_exists": {
        "status": "PASS",
        "message": "Song has both verses and choruses"
      },
      "section_order_logical": {
        "status": "PASS",
        "message": "Verse before chorus"
      },
      "unique_song_number": {
        "status": "WARN",
        "message": "Song number 1 already exists in batch (potential duplicate)"
      }
    },
    
    "quality_checks": {
      "ocr_confidence": {
        "status": "PASS",
        "average": 0.92,
        "threshold": 0.7,
        "message": "Average OCR confidence acceptable"
      },
      "classification_confidence": {
        "status": "PASS",
        "average": 0.91,
        "message": "Section classification high confidence"
      }
    }
  },
  
  "issues": {
    "errors": [],
    "warnings": ["potential_duplicate_song_number"],
    "suggestions": []
  },
  
  "recommendation": "VALID - Ready for database import",
  "batch_category": "valid"
}
```

---

## 4. PROCESSING LOG (JSONL FORMAT)

Each line is a complete JSON record:

```json
{
  "batch_id": "001",
  "batch_timestamp": "2026-04-16T10:00:00Z",
  "source_image": "/songbook_images/page_001.jpg",
  "song_number": 1,
  "detected_title": "Aarati Ho",
  "detected_language": "hindi",
  "output_file": "batch_001/song_001_hindi.json",
  "file_size_bytes": 4521,
  "processing_status": "SUCCESS",
  "validation_status": "VALID",
  "processing_timestamp": "2026-04-16T10:30:15Z",
  "processing_duration_ms": 2340,
  "layers": {
    "layer1_ocr_ms": 1800,
    "layer2_conversion_ms": 340,
    "layer3_json_write_ms": 50,
    "layer4_validation_ms": 45,
    "overhead_ms": 105
  },
  "metrics": {
    "ocr_confidence_avg": 0.92,
    "ocr_confidence_min": 0.88,
    "classification_confidence": 0.91,
    "section_count": 2,
    "line_count": 3,
    "total_characters": 41
  },
  "issues": {
    "errors": 0,
    "warnings": 0,
    "review_flags": []
  },
  "batch_progress": {
    "song_sequence": 1,
    "remaining_in_batch": 149
  }
}
```

---

## 5. VALIDATION SUMMARY SCHEMA

### BatchValidationSummary

```json
{
  "summary_timestamp": "2026-04-16T10:45:00Z",
  "batch_id": "001",
  "batch_duration_minutes": 5.5,
  
  "statistics": {
    "total_images_processed": 150,
    "total_songs_extracted": 150,
    "total_duration_seconds": 330,
    "average_duration_per_song_ms": 2200
  },
  
  "validation_results": {
    "valid": 142,
    "review_required": 7,
    "error": 1,
    "total": 150,
    "success_rate": 0.947
  },
  
  "status_breakdown": {
    "VALID": {
      "count": 142,
      "percentage": 94.7,
      "examples": ["song_001_hindi", "song_002_marathi"]
    },
    "REVIEW_REQUIRED": {
      "count": 7,
      "percentage": 4.7,
      "reasons": [
        {
          "reason": "low_ocr_confidence",
          "count": 4,
          "songs": ["song_015_hindi", "song_042_marathi", "song_089_english", "song_123_hindi"]
        },
        {
          "reason": "unclear_section_boundary",
          "count": 2,
          "songs": ["song_057_marathi", "song_101_english"]
        },
        {
          "reason": "potential_duplicate_number",
          "count": 1,
          "songs": ["song_143_hindi"]
        }
      ]
    },
    "ERROR": {
      "count": 1,
      "percentage": 0.7,
      "reasons": [
        {
          "reason": "unreadable_text",
          "songs": ["page_042_segment_3"]
        }
      ]
    }
  },
  
  "language_distribution": {
    "hindi": {
      "total": 75,
      "valid": 72,
      "review_required": 3
    },
    "marathi": {
      "total": 50,
      "valid": 47,
      "review_required": 3
    },
    "english": {
      "total": 20,
      "valid": 19,
      "review_required": 1
    },
    "mixed": {
      "total": 5,
      "valid": 4,
      "review_required": 0
    }
  },
  
  "quality_metrics": {
    "avg_ocr_confidence": 0.904,
    "avg_classification_confidence": 0.897,
    "avg_lines_per_song": 8.3,
    "avg_sections_per_song": 2.1,
    "data_completeness_avg": 0.985
  },
  
  "common_issues": [
    {
      "issue": "low_ocr_confidence_on_specific_lines",
      "count": 5,
      "severity": "MEDIUM",
      "recommendation": "Manual review of 5 songs; consider re-scanning at higher DPI"
    },
    {
      "issue": "ambiguous_section_classification",
      "count": 2,
      "severity": "LOW",
      "recommendation": "User judgment required; formatting guidelines need clarification"
    },
    {
      "issue": "potential_duplicate_song_numbers",
      "count": 1,
      "severity": "MEDIUM",
      "recommendation": "Manually verify song#143 against existing database"
    }
  ],
  
  "next_steps": [
    "Review 7 songs in /processed_songs/review_required/",
    "Investigate 1 error in /processed_songs/errors/",
    "142 songs ready for database import",
    "Consider re-scanning page 42 (contains error)"
  ],
  
  "file_counts": {
    "valid_files": 142,
    "review_required_files": 7,
    "error_files": 1,
    "total_json_files": 150,
    "total_size_bytes": 678234,
    "avg_file_size_bytes": 4521
  }
}
```

---

## 6. CHORD INJECTION STATE (for v1.1 tracking)

### ChordInjectionState

```json
{
  "state_version": "1.0",
  "batch_id": "001",
  "total_songs_in_batch": 150,
  
  "chord_readiness": {
    "ready_for_chords": 142,
    "not_ready": 8,
    "status_breakdown": {
      "VALID": 142,
      "REVIEW_REQUIRED": 7,
      "ERROR": 1
    }
  },
  
  "processing_status": {
    "chord_extraction_started": false,
    "chord_extraction_completed": false,
    "songs_with_chords": 0,
    "songs_without_chords": 142
  },
  
  "future_work": {
    "v1_1_ready_songs": [
      "batch_001/song_001_hindi.json",
      "batch_001/song_002_marathi.json"
    ],
    "needs_manual_review_first": [
      "batch_001/song_015_hindi.json"
    ]
  }
}
```

---

## 7. ERROR REPORT SCHEMA

### ErrorReport (for /processed_songs/errors/)

```json
{
  "error_id": "error_20260416_001",
  "error_timestamp": "2026-04-16T10:35:22Z",
  
  "source": {
    "image": "/songbook_images/page_042.jpg",
    "image_section": "lower_third",
    "page_segment": "segment_3"
  },
  
  "extraction_attempt": {
    "layer_failed": 1,
    "step_failed": "image_to_text_conversion",
    "error_type": "IMAGE_UNREADABLE"
  },
  
  "error_details": {
    "message": "Tesseract failed: Image too corrupted for text extraction",
    "confidence_threshold_failed": 0.2,
    "min_confidence_required": 0.5
  },
  
  "raw_ocr_output": {
    "confidence_score": 0.2,
    "partial_text": "...corrupted...",
    "warning": "Output unreliable"
  },
  
  "recovery_suggestion": "Re-scan page 42 at higher resolution (300+ DPI) or with better lighting",
  
  "workaround_options": [
    "Manual data entry from original source",
    "Find alternate copy of songbook",
    "Skip this page (if non-critical)"
  ],
  
  "next_action": "MANUAL_REVIEW_REQUIRED"
}
```

---

## 8. EDGE CASE SCHEMA EXAMPLES

### Example 1: Mixed Language Song

```json
{
  "song": {
    "number": 5,
    "language": "mixed",
    "title": "Jesus Loves Me - हिंदी संस्करण",
    "sections": [
      {
        "type": "verse",
        "label": "Verse 1",
        "lines": [
          {
            "text": "Jesus loves me this I know",
            "detected_language": "english"
          },
          {
            "text": "यीशु मुझसे प्रेम करता है",
            "detected_language": "hindi"
          }
        ]
      }
    ]
  }
}
```

### Example 2: Song with Missing Chorus Detection

```json
{
  "validation": {
    "issues": {
      "warnings": [
        "missing_chorus_detection"
      ]
    },
    "human_review_required": true
  },
  "validation_notes": "Song appears to have chorus but italic detection failed. Manual verification needed."
}
```

### Example 3: Very Short Song (edge case)

```json
{
  "song": {
    "number": 42,
    "section_summary": {
      "total_lines": 2
    }
  },
  "validation": {
    "warnings": ["minimal_content"],
    "status": "VALID",
    "message": "Song is valid but unusually short. Confirm not truncated."
  }
}
```

---

## 9. SCHEMA USAGE GUIDELINES

### When to Use Which Schema

| Scenario | Schema | Location |
|----------|--------|----------|
| Raw OCR output | `RawSongExtraction` | Memory only (not persisted) |
| After structure conversion | `StructuredSong` | All `/processed_songs/batch_*/` files |
| Batch validation complete | `BatchValidationSummary` | `/processed_songs/__metadata__/validation_summary.json` |
| Processing log entries | JSONL format | `/processed_songs/__metadata__/processing_log.jsonl` |
| Song extraction failed | `ErrorReport` | `/processed_songs/errors/` |
| Chord v1.1 tracking | `ChordInjectionState` | `/processed_songs/__metadata__/chord_injection_state.json` |

---

## 10. DATA INVARIANTS

**These must ALWAYS be true for valid output**:

```
1. Every StructuredSong has a unique (batch_id, number) pair
2. Every line has non-empty text (after trim)
3. Every section has at least one line
4. Every song has at least one section
5. OCR confidence values are in [0.0, 1.0]
6. Classification confidence values are in [0.0, 1.0]
7. Language is one of: hindi, marathi, english, mixed
8. Section type is one of: verse, chorus, bridge, hook, pre_chorus
9. No circular references in extensions or metadata
10. All timestamps are ISO-8601 format
11. All file paths use forward slashes (/)
12. All text is valid UTF-8
```

---

**Document Version**: 1.0-DESIGN  
**Status**: Reference Implementation Ready
