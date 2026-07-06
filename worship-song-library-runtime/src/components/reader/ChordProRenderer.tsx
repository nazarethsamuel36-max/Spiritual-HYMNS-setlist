import React, { useMemo } from 'react';

interface ChordWordUnit {
  chord: string;
  lyric: string;
}

interface SongLine {
  isDirective: boolean;
  directiveType?: string;
  directiveValue?: string;
  words?: ChordWordUnit[];
}

interface ChordProRendererProps {
  rawChordPro: string;
}

export const ChordProRenderer: React.FC<ChordProRendererProps> = ({ rawChordPro }) => {
  const fontSize = 16;

  const parsedSongLines = useMemo<SongLine[]>(() => {
    if (!rawChordPro) return [];
    const lines = rawChordPro.split(/\r?\n/);

    return lines.map((line): SongLine => {
      const trimmed = line.trim();

      // Simplified Check: Handle metadata strings
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const content = trimmed.slice(1, -1);
        const colonIndex = content.indexOf(':');
        if (colonIndex !== -1) {
          return {
            isDirective: true,
            directiveType: content.slice(0, colonIndex).trim().toLowerCase(),
            directiveValue: content.slice(colonIndex + 1).trim(),
          };
        }
        return { isDirective: true, directiveType: content.toLowerCase(), directiveValue: '' };
      }

      const wordsArray: ChordWordUnit[] = [];
      const tokenRegex = /((?:\[[^\]]+\])+)?([^[ ]*(?: +)?)/g;
      let match;

      while ((match = tokenRegex.exec(line)) !== null) {
        if (!match) break;
        const chordRaw = match[1] || '';
        const lyricText = match[2] || '';
        const cleanChord = chordRaw.replace(/\]\[/g, ' ').replace('[', '').replace(']', '');

        if (cleanChord || lyricText) {
          wordsArray.push({ chord: cleanChord, lyric: lyricText });
        }
      }

      // MINIMALIST FIX: If the text line is empty, put a simple space character inside it
      if (wordsArray.length === 0) {
        wordsArray.push({ chord: '', lyric: ' ' });
      }

      return { isDirective: false, words: wordsArray };
    });
  }, [rawChordPro]);

  return (
    <div style={{ ...styles.songSheet, fontSize: `${fontSize}px` }}>
      {parsedSongLines.map((line, lineIndex) => {
        if (line.isDirective) {
          if (line.directiveType === 'title' || line.directiveType === 't') {
            return <h1 key={lineIndex} style={styles.titleHeading}>{line.directiveValue}</h1>;
          }
          return null;
        }

        return (
          <div key={lineIndex} style={styles.songLine}>
            {line.words?.map((wordUnit, wordIndex) => (
              <div key={wordIndex} style={styles.chordWordGroup}>
                {/* Clean, unpadded text layers */}
                <span style={styles.chordSlot}>
                  {wordUnit.chord ? wordUnit.chord : ' '}
                </span>
                <span style={styles.lyricSlot}>
                  {wordUnit.lyric}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// Stripped down style tree — no extra paddings, heights, or line-height adjustments
const styles: Record<string, React.CSSProperties> = {
  songSheet: {
    fontFamily: 'sans-serif',
    padding: '12px',
  },
  titleHeading: {
    fontSize: '1.4em',
    margin: '0 0 16px 0',
  },
  songLine: {
    display: 'block',
    width: '100%',
  },
  chordWordGroup: {
    display: 'inline-flex',
    flexDirection: 'column',
    verticalAlign: 'bottom',
    whiteSpace: 'pre-wrap', 
  },
  chordSlot: {
    fontWeight: 'bold',
    color: '#1a73e8',
    fontSize: '0.8em',
  },
  lyricSlot: {
    fontSize: '1em',
  },
};
