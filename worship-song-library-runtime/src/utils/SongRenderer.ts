import { LineWrapper } from './LineWrapper';
import { ChordCalculator } from './ChordCalculator';

interface SongData {
  lyrics: string;
  chords: Array<{ chord: string; position: number }>;
}

interface RenderedLine {
  lyrics: string;
  chords: Array<{ chord: string; pixelPosition: number }>;
}

export class SongRenderer {
  private lineWrapper: LineWrapper;
  private chordCalculator: ChordCalculator;

  constructor() {
    this.lineWrapper = new LineWrapper();
    this.chordCalculator = new ChordCalculator();
  }

  /**
   * Main render function - always starts from original data
   */
  render(
    songData: SongData,
    availableWidth: number,
    fontSize: number,
    fontFamily: string = 'sans-serif'
  ): RenderedLine[] {
    // Phase 1: Wrap lyrics into lines
    const wrappedLines = this.lineWrapper.wrapLyrics(
      songData.lyrics,
      availableWidth,
      fontSize,
      fontFamily
    );

    // Phase 2: For each line, calculate chords
    const renderedLines: RenderedLine[] = wrappedLines.map(wrappedLine => {
      // Get chords for this line
      const lineChords = this.chordCalculator.calculateChordsForLine(
        songData.chords,
        wrappedLine.startIndex,
        wrappedLine.endIndex
      );

      // Build the line text
      const lineText = wrappedLine.words.map(w => w.text).join(' ');

      // Calculate pixel positions for each chord
      const chordsWithPixels = lineChords.map(chord => ({
        chord: chord.chord,
        pixelPosition: this.chordCalculator.calculateChordPixelPosition(
          chord.position,
          lineText,
          fontSize,
          fontFamily
        )
      }));

      return {
        lyrics: lineText,
        chords: chordsWithPixels
      };
    });

    return renderedLines;
  }
}
