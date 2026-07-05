import React, { useState, useMemo } from 'react';

// Define strict type contracts for our parsed data structure
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
  // Enforce specific text scaling boundaries
  const [fontSize, setFontSize] = useState<number>(16);
  const minFontSize = 14;
  const maxFontSize = 26;

  // The Core Parsing Pipeline Algorithm
  const parsedSongLines = useMemo<SongLine[]>(() => {
    if (!rawChordPro) return [];

    // Step 1: Split into individual lines
    const lines = rawChordPro.split(/\r?\n/);

    return lines.map((line): SongLine => {
      const trimmed = line.trim();

      // Step 2: Extract metadata directives
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

      // Step 3 & 4: Tokenize lyrics and chords together
      const wordsArray: ChordWordUnit[] = [];
      
      // This regex captures: Optional leading chord [Am] followed by non-bracket text characters
      const tokenRegex = /(\[[^\]]+\])?([^[ ]+| +)/g;
      let match;

      while ((match = tokenRegex.exec(line)) !== null) {
        let chordRaw = match[1] || '';
        let lyricText = match[2] || '';

        // Strip the raw structural square brackets off the chord name
        const cleanChord = chordRaw.replace('[', '').replace(']', '');

        wordsArray.push({
          chord: cleanChord,
          lyric: lyricText,
        });
      }

      // Fallback for empty spacer lines
      if (wordsArray.length === 0 && line.length === 0) {
        wordsArray.push({ chord: '', lyric: '\u00A0' }); // Non-breaking space keeps line height uniform
      }

      return { isDirective: false, words: wordsArray };
    });
  }, [rawChordPro]);

  // FontSize Controller Toggles
  const scaleUp = () => setFontSize((prev) => Math.min(prev + 2, maxFontSize));
  const scaleDown = () => setFontSize((prev) => Math.max(prev - 2, minFontSize));
  const resetScale = () => setFontSize(16);

  return (
    <div style={styles.appContainer}>
      {/* Dynamic Font Controller UI */}
      <div style={styles.toolbar}>
        <button onClick={scaleDown} disabled={fontSize <= minFontSize} style={styles.btn}>A-</button>
        <button onClick={resetScale} style={styles.btn}>Default ({fontSize}px)</button>
        <button onClick={scaleUp} disabled={fontSize >= maxFontSize} style={styles.btn}>A+</button>
      </div>

      {/* Step 5: Render tree using targeted inline styles for absolute layout consistency */}
      <div style={{ ...styles.songSheet, fontSize: ${fontSize}px }}>
        {parsedSongLines.map((line, lineIndex) => {
          if (line.isDirective) {
            // Render basic structural titles/headers differently
            if (line.directiveType === 'title' || line.directiveType === 't') {
              return <h1 key={lineIndex} style={styles.titleHeading}>{line.directiveValue}</h1>;
            }
            if (line.directiveType === 'artist' || line.directiveType === 'a') {
              return <h2 key={lineIndex} style={styles.artistHeading}>{line.directiveValue}</h2>;
            }
            return null; // Skip non-visual system metadata tokens for layout clarity
          }

          return (
            <div key={lineIndex} style={styles.songLine}>
              {line.words?.map((wordUnit, wordIndex) => (
                <div key={wordIndex} style={styles.chordWordGroup}>
                  {/* Chords layer */}
                  <span style={styles.chordSlot}>
                    {wordUnit.chord ? wordUnit.chord : '\u00A0'}
                  </span>
                  {/* Lyrics layer */}
                  <span style={styles.lyricSlot}>
                    {wordUnit.lyric}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Strict Responsive CSS Layout Rules
const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    fontFamily: 'sans-serif',
    padding: '16px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  toolbar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  btn: {
    padding: '8px 12px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  songSheet: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px',
    lineHeight: 1,
  },
  titleHeading: {
    fontSize: '1.4em',
    margin: '0 0 4px 0',
    color: '#333',
  },
  artistHeading: {
    fontSize: '1em',
    fontWeight: 'normal',
    margin: '0 0 16px 0',
    color: '#666',
  },
  songLine: {
    display: 'block',
    width: '100%',
    paddingBottom: '1.2em', // Creates exact vertical clearing room for subsequent rows
    wordWrap: 'break-word',
  },
  chordWordGroup: {
    display: 'inline-flex',
    flexDirection: 'column', // Stacks chords strictly over lyric tokens vertically
    verticalAlign: 'bottom',
    whiteSpace: 'nowrap',   // CRITICAL: Forces full word units to break to new line together
  },
  chordSlot: {
    fontWeight: 'bold',
    color: '#1a73e8',        // High contrast performance color
    fontSize: '0.75em',      // Scaled using relative system units
    lineHeight: 1.1,
    minHeight: '1.1em',      // Keeps layout rows flat even over silent layout words
    userSelect: 'none',      // Stops accidental highlights during performance interactions
  },
  lyricSlot: {
    fontSize: '1em',
    lineHeight: 1.1,
  },
};
