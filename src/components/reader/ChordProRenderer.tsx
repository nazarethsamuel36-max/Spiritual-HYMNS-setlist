import React, { useMemo } from 'react';
import { ChordTransposer } from '../../utils/ChordTransposer';
import type { ParsedSongLine } from './paginationTypes';
import { parseChordPro, preprocessRenderedLines } from './chordProParser';

export type { ParsedSongLine } from './paginationTypes';

interface ChordProRendererProps {
  rawChordPro?: string;
  parsedLines?: ParsedSongLine[];
  hideChords?: boolean;
  fontSize?: number;
  transpose?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ChordProRenderer: React.FC<ChordProRendererProps> = ({
  rawChordPro = '',
  parsedLines,
  hideChords = false,
  fontSize = 18,
  transpose = 0,
  className,
  style,
}) => {
  const parsedSongLines = useMemo<ParsedSongLine[]>(() => {
    if (parsedLines) return parsedLines;
    if (!rawChordPro) return [];
    return parseChordPro(rawChordPro);
  }, [rawChordPro, parsedLines]);

  const renderedLines = useMemo(() => {
    return preprocessRenderedLines(parsedSongLines, hideChords);
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
    <div className={className} style={{ ...styles.songSheet, fontSize: `${fontSize}px`, ...style }}>
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
