import React, { useMemo } from 'react';
import { ChordTransposer } from '../../utils/ChordTransposer';

interface ChordWordUnit {
  chord: string;
  lyric: string;
}

interface SongLine {
  isDirective: boolean;
  directiveType?: string;
  directiveValue?: string;
  words?: ChordWordUnit[];
  isChorus?: boolean;
  isSectionMarker?: boolean;
  renderType?: 'directive' | 'text' | 'spacer' | 'skip';
}

interface ChordProRendererProps {
  rawChordPro: string;
  hideChords?: boolean;
  fontSize?: number;
  transpose?: number;
}

export const ChordProRenderer: React.FC<ChordProRendererProps> = ({ rawChordPro, hideChords = false, fontSize = 18, transpose = 0 }) => {
  const parsedSongLines = useMemo<SongLine[]>(() => {
    if (!rawChordPro) return [];
    
    const lines = rawChordPro.split(/\r?\n/);
    let inChorusSection = false;

    return lines.map((line): SongLine => {
      const trimmed = line.trim();

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

      let isChorus = false;
      let processLine = line;
      
      // ── Section marker detection ─────────────────────────────────────────────
      // A section marker is a line whose ENTIRE content is [SomeName].
      // We must return early so the bracket content is NEVER fed into the chord parser.
      if (trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.slice(1, -1).includes('[')) {
        const sectionName = trimmed.slice(1, -1).trim();
        const isChorusSection = /^chorus/i.test(sectionName);
        if (isChorusSection) {
          inChorusSection = true;
        } else {
          inChorusSection = false;
        }
        // Return as a pure section marker — do NOT parse any chords from this line
        return { isDirective: false, words: [], isChorus: false, isSectionMarker: true };
      }
      
      // Apply chorus styling if we're in chorus section or line starts with *
      if (inChorusSection || processLine.startsWith('* ')) {
        isChorus = true;
        if (processLine.startsWith('* ')) {
          processLine = processLine.substring(2);
        }
      }

      const wordsArray: ChordWordUnit[] = [];
      let i = 0;
      
      while (i < processLine.length) {
        let currentChord = '';
        let currentLyric = '';
        
        while (i < processLine.length && processLine[i] === '[') {
          const endBracket = processLine.indexOf(']', i);
          if (endBracket !== -1) {
            currentChord += (currentChord ? ' ' : '') + processLine.substring(i + 1, endBracket);
            i = endBracket + 1;
          } else {
            currentLyric += processLine[i];
            i++;
            break;
          }
        }
        
        while (i < processLine.length && processLine[i] !== '[') {
          currentLyric += processLine[i];
          i++;
        }
        
        if (currentChord || currentLyric) {
          wordsArray.push({ chord: currentChord, lyric: currentLyric });
        }
      }

      // ── Expand multi-word lyric chunks into per-word units ────────────────────
      // Each ChordWordUnit from the parser may hold a multi-word string like
      // "forever on that". Split those into individual word units so each word
      // becomes an independent inline-flex block. The chord stays on the first
      // word; subsequent words in the same chunk get an empty chord.
      const expandedWords: ChordWordUnit[] = [];
      for (const unit of wordsArray) {
        // Split on spaces but keep trailing/leading spaces attached to the token
        // so visual spacing is preserved between units.
        const tokens = unit.lyric.split(/(\s+)/);
        let isFirst = true;
        for (const token of tokens) {
          if (token === '') continue;
          if (isFirst) {
            expandedWords.push({ chord: unit.chord, lyric: token });
            isFirst = false;
          } else {
            expandedWords.push({ chord: '', lyric: token });
          }
        }
        // If the lyric was empty but there was a chord, preserve the chord unit
        if (isFirst && unit.chord) {
          expandedWords.push({ chord: unit.chord, lyric: '' });
        }
      }

      const finalWords = expandedWords.length > 0 ? expandedWords : [{ chord: '', lyric: ' ' }];

      return { isDirective: false, words: finalWords, isChorus, isSectionMarker: false };
    });
  }, [rawChordPro]);

  const renderedLines = useMemo(() => {
    const processedLines: SongLine[] = [];
    let lastWasSpacer = true; // treat start of song as spacer to avoid leading space
    
    for (let idx = 0; idx < parsedSongLines.length; idx++) {
      const line = parsedSongLines[idx];
      
      if (line.isDirective) {
        processedLines.push({ ...line, renderType: 'directive' });
        continue;
      }
      
      const isEmptyLine = line.words?.length === 1 && !line.words[0].chord && line.words[0].lyric === ' ';
      
      if (isEmptyLine) {
        if (lastWasSpacer) {
          processedLines.push({ ...line, renderType: 'skip' });
        } else {
          processedLines.push({ ...line, renderType: 'spacer' });
          lastWasSpacer = true;
        }
      } else if (line.isSectionMarker) {
        if (lastWasSpacer) {
          processedLines.push({ ...line, renderType: 'skip' });
        } else {
          processedLines.push({ ...line, renderType: 'spacer' });
          lastWasSpacer = true;
        }
      } else {
        const hasAnyLyric = line.words?.some(w => w.lyric && w.lyric.trim() !== '');
        const hasAnyChord = line.words?.some(w => w.chord && w.chord.trim() !== '');
        if (hideChords && !hasAnyLyric && hasAnyChord) {
          processedLines.push({ ...line, renderType: 'skip' });
        } else {
          processedLines.push({ ...line, renderType: 'text' });
          lastWasSpacer = false;
        }
      }
    }
    return processedLines;
  }, [parsedSongLines, hideChords]);

  // Safety net: if no lines were produced, show a diagnostic instead of blank
  if (renderedLines.filter(l => l.renderType !== 'skip').length === 0) {
    return (
      <div style={{ ...styles.songSheet, fontSize: `${fontSize}px` }}>
        <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9em' }}>
          No content to display.
        </p>
      </div>
    );
  }

  return (
    <div style={{ ...styles.songSheet, fontSize: `${fontSize}px` }}>
      {renderedLines.map((line, lineIndex) => {
        if (line.renderType === 'skip') {
          return null;
        }
        
        if (line.renderType === 'directive') {
          if (line.directiveType === 'title' || line.directiveType === 't') {
            return <h1 key={lineIndex} style={styles.titleHeading}>{line.directiveValue}</h1>;
          }
          return null;
        }
        
        if (line.renderType === 'spacer') {
          return (
            <div key={lineIndex} style={styles.paragraphSeparator} />
          );
        }

        return (
          <div 
            key={lineIndex} 
            style={{
              ...styles.songLine,
              ...(line.isChorus && hideChords ? styles.chorusLine : {})
            }}
          >
            {line.words?.map((wordUnit, wordIndex) => {
              const nextWord = line.words?.[wordIndex + 1];
              const isWordBoundary =
                wordUnit.lyric.endsWith(' ') ||
                (!!nextWord && !!nextWord.lyric && nextWord.lyric.startsWith(' '));
              const groupStyle = isWordBoundary
                ? styles.chordWordGroup
                : { ...styles.chordWordGroup, marginRight: 0 };
              return (
                <div key={wordIndex} style={groupStyle}>
                  {!hideChords && (
                    <span style={styles.chordSlot}>
                      {wordUnit.chord ? ChordTransposer.transposeChord(wordUnit.chord, transpose) : '\u00A0'}
                    </span>
                  )}
                  <span style={styles.lyricSlot}>
                    {wordUnit.lyric ? wordUnit.lyric : '\u00A0'}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  songSheet: {
    fontFamily: "'Noto Serif', 'Noto Serif Devanagari', Georgia, serif",
    padding: '8px',
  },
  titleHeading: {
    fontSize: '1.4em',
    margin: '0 0 16px 0',
  },
  songLine: {
    display: 'block',
    width: '100%',
    marginBottom: '4px',
  },
  chorusLine: {
    fontWeight: 'bold',
  },
  chordWordGroup: {
    display: 'inline-flex',
    flexDirection: 'column',
    verticalAlign: 'bottom',
    // 'pre' prevents the browser from wrapping INSIDE this unit.
    // The browser can only wrap BETWEEN independent word units.
    whiteSpace: 'pre',
    marginRight: '2px',
  },
  chordSlot: {
    fontWeight: 'bold',
    color: '#1a73e8',
    fontSize: '0.8em',
    height: '1.2em',
  },
  lyricSlot: {
    fontSize: '1em',
  },
  paragraphSeparator: {
    height: '20px',
    margin: '0',
    padding: '0',
    display: 'block',
    width: '100%',
  },
};
