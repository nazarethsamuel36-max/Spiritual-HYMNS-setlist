interface WordMeasurement {
  text: string;
  width: number;
  originalIndex: number;
}

interface WrappedLine {
  words: WordMeasurement[];
  startIndex: number;
  endIndex: number;
}

export class LineWrapper {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
  }

  /**
   * Measure a single word's width at given font size
   */
  measureWord(word: string, fontSize: number, fontFamily: string): number {
    this.context.font = `${fontSize}px ${fontFamily}`;
    return this.context.measureText(word).width;
  }

  /**
   * Wrap lyrics into lines based on available width
   * NEVER breaks words - only breaks at spaces
   */
  wrapLyrics(
    lyrics: string,
    availableWidth: number,
    fontSize: number,
    fontFamily: string = 'sans-serif'
  ): WrappedLine[] {
    const lines: WrappedLine[] = [];
    const words = lyrics.split(' ');
    
    let currentLine: WordMeasurement[] = [];
    let currentWidth = 0;
    let charIndex = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = this.measureWord(word, fontSize, fontFamily);
      const spaceWidth = i > 0 ? this.measureWord(' ', fontSize, fontFamily) : 0;
      
      const totalWordWidth = wordWidth + (currentLine.length > 0 ? spaceWidth : 0);

      // Check if word fits on current line
      if (currentWidth + totalWordWidth <= availableWidth || currentLine.length === 0) {
        // Word fits - add to current line
        currentLine.push({
          text: word,
          width: wordWidth,
          originalIndex: charIndex
        });
        currentWidth += totalWordWidth;
        charIndex += word.length + 1; // +1 for space
      } else {
        // Word doesn't fit - save current line and start new one
        if (currentLine.length > 0) {
          lines.push({
            words: currentLine,
            startIndex: currentLine[0].originalIndex,
            endIndex: charIndex - 1
          });
        }
        
        // Start new line with this word
        currentLine = [{
          text: word,
          width: wordWidth,
          originalIndex: charIndex
        }];
        currentWidth = wordWidth;
        charIndex += word.length + 1;
      }
    }

    // Don't forget the last line
    if (currentLine.length > 0) {
      lines.push({
        words: currentLine,
        startIndex: currentLine[0].originalIndex,
        endIndex: charIndex - 1
      });
    }

    return lines;
  }
}
