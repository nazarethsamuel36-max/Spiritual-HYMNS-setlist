import { type Chord } from '../db/Database';

export interface MusicalWord {
  text: string;
  chords: Chord[];
  startIndex: number;
}

/**
 * Splits a line of text into words (including following whitespace)
 * and associates chords with their respective words.
 */
export function segmentMusicalLine(text: string, chords: Chord[]): MusicalWord[] {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(text));
  
  const words: MusicalWord[] = [];
  let currentWord: MusicalWord | null = null;
  
  segments.forEach((segment) => {
    const char = segment.segment;
    const index = segment.index;
    const isSpace = char === ' ' || char === '\u00A0';
    
    // Start a new word if:
    // 1. No word started yet
    // 2. We hit a non-space character AFTER we've been collecting spaces
    const lastChar = currentWord ? currentWord.text.slice(-1) : '';
    const lastCharIsSpace = lastChar === ' ' || lastChar === '\u00A0';
    
    if (!currentWord || (!isSpace && lastCharIsSpace)) {
      if (currentWord) {
        words.push(currentWord);
      }
      currentWord = {
        text: '',
        chords: [],
        startIndex: index
      };
    }
    
    currentWord.text += char;
    
    // Check for chords at this absolute position
    const chordAtPos = chords.find(c => c.position === index);
    if (chordAtPos) {
      // Map absolute position to relative position within the word
      currentWord.chords.push({
        ...chordAtPos,
        position: index - currentWord.startIndex
      });
    }
  });
  
  // Handle chords that might be at the very end of the line (past text length)
  chords.forEach(c => {
    if (c.position >= text.length) {
      if (!currentWord) {
        currentWord = { text: '\u00A0', chords: [], startIndex: text.length };
      }
      currentWord.chords.push({
        ...c,
        position: c.position - currentWord.startIndex
      });
    }
  });

  if (currentWord) {
    words.push(currentWord);
  }
  
  return words;
}
