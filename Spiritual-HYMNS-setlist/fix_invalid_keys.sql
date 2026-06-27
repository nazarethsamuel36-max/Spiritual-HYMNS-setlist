-- Fix invalid key formats in the songs table
-- This script applies 4 cleanup rules:
-- 1. Remove ** prefix (e.g., "** A" -> "A")
-- 2. Remove m/M suffix for minor keys (e.g., "Em" -> "E", "F#M" -> "F#")
-- 3. Keep only root note for slash chords (e.g., "G/A" -> "G")
-- 4. Fix "EE" to "E"

UPDATE songs 
SET original_key = 
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          original_key, 
          '^\\*\\* ',
          ''
        ),
        '[mM]$',
        ''
      ),
      '/.*$',
      ''
    ),
    '^EE$',
    'E'
  )
WHERE original_key NOT REGEXP '^[A-G][#b]?$';

-- Verify results
SELECT COUNT(*) as invalid_keys_remaining FROM songs WHERE original_key NOT REGEXP '^[A-G][#b]?$';
