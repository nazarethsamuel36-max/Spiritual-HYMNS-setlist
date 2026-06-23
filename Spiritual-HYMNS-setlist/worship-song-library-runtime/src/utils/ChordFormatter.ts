/**
 * Chord formatting utilities for admin editor
 * Handles automatic chord normalization: d → D, dm → Dm, g# → G#, bb → Bb
 */

export interface FormattedChord {
  original: string;
  formatted: string;
  isValid: boolean;
}

const VALID_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const VALID_ACCIDENTALS = ['#', 'b']; // sharp or flat
const VALID_SUFFIXES = [
  // Triads
  'm', 'maj', 'aug', 'dim',
  // Sevenths
  '7', 'maj7', 'min7', 'm7', 'dim7', 'aug7',
  // Suspended
  'sus2', 'sus4',
  // Extensions
  '9', 'maj9', 'm9', '11', 'maj11', 'm11', '13', 'maj13', 'm13',
  // Other common
  'add9', 'add11', 'omit3', 'omit5',
];

/**
 * Format a chord input string to proper notation
 * Examples:
 *   "d" → "D"
 *   "dm" → "Dm"
 *   "g#" → "G#"
 *   "bb" → "Bb"
 *   "c#maj7" → "C#maj7"
 *   "fmin" → "Fm"
 */
export function formatChord(input: string): FormattedChord {
  if (!input || !input.trim()) {
    return { original: input, formatted: '', isValid: false };
  }

  const cleaned = input.trim().toLowerCase();

  // Root note (first character, must be A-G)
  if (!VALID_ROOTS.includes(cleaned[0].toUpperCase())) {
    return { original: input, formatted: '', isValid: false };
  }

  let root = cleaned[0].toUpperCase();
  let pos = 1;

  // Check for accidental (# or b)
  if (pos < cleaned.length && VALID_ACCIDENTALS.includes(cleaned[pos])) {
    root += cleaned[pos];
    pos++;
  }

  // Rest is the suffix (chord type)
  const suffixRaw = cleaned.substring(pos);

  // Normalize common variations
  let suffix = suffixRaw;
  
  // Convert "min" to "m"
  suffix = suffix.replace(/^min/, 'm');
  
  // Validate suffix exists in our list or is empty
  if (suffix && !VALID_SUFFIXES.includes(suffix)) {
    // Check if it's a partial match - some users might type "maj" for "maj7"
    // For now, we're strict - invalid suffix = invalid chord
    return { original: input, formatted: '', isValid: false };
  }

  const formatted = root + suffix;
  return {
    original: input,
    formatted,
    isValid: true,
  };
}

/**
 * Validate if a chord is valid without formatting
 */
export function isValidChord(chord: string): boolean {
  return formatChord(chord).isValid;
}

/**
 * Get suggestions for partially typed chords
 * e.g., "dmaj" might suggest "Dmaj7"
 */
export function getChordSuggestions(input: string): string[] {
  if (!input || input.length === 0) return [];

  const formatted = formatChord(input);
  if (formatted.isValid) {
    // Already valid, no suggestions needed
    return [formatted.formatted];
  }

  const cleaned = input.trim().toLowerCase();
  if (cleaned.length < 1) return [];

  // Extract root
  const root = cleaned[0].toUpperCase();
  if (!VALID_ROOTS.includes(root)) return [];

  // Try to find partial suffix matches
  let partialSuffix = cleaned.substring(1);
  
  // Handle accidentals
  if (partialSuffix && VALID_ACCIDENTALS.includes(partialSuffix[0])) {
    root + partialSuffix[0];
    partialSuffix = partialSuffix.substring(1);
  }

  const suggestions = VALID_SUFFIXES
    .filter(s => s.startsWith(partialSuffix.replace(/^min/, 'm')))
    .slice(0, 3) // Limit to 3 suggestions
    .map(s => root + s);

  return suggestions;
}

/**
 * Normalize a list of chords (used for batch operations)
 */
export function normalizeChords(chords: string[]): string[] {
  return chords
    .map(c => formatChord(c))
    .filter(c => c.isValid)
    .map(c => c.formatted);
}
