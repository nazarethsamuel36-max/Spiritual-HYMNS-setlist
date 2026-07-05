interface ChordPosition {
  chord: string;
  position: number; // Character index in original lyrics
}

interface ChordOnLine {
  chord: string;
  position: number; // Character index relative to this line's start
}

export class ChordCalculator {
  /**
   * Calculate which chords belong to a wrapped line
   * and recalculate their positions relative to line start
   */
  calculateChordsForLine(
    allChords: ChordPosition[],
    lineStartIndex: number,
    lineEndIndex: number
  ): ChordOnLine[] {
    return allChords
      .filter(chord => chord.position >= lineStartIndex && chord.position <= lineEndIndex)
      .map(chord => ({
        chord: chord.chord,
        position: chord.position - lineStartIndex // Relative to line start
      }));
  }

  /**
   * Calculate pixel position for a chord based on character position
   */
  calculateChordPixelPosition(
    chordCharPosition: number,
    lineText: string,
    fontSize: number,
    fontFamily: string
  ): number {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = `${fontSize}px ${fontFamily}`;
    
    // Measure width of text before the chord
    const textBeforeChord = lineText.substring(0, chordCharPosition);
    return context.measureText(textBeforeChord).width;
  }
}
