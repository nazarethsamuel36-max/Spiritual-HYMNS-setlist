import React from 'react';
import type { SongLine } from './paginationTypes';
import { ChordTransposer } from '../../utils/ChordTransposer';

interface ReaderPageProps {
  lines: SongLine[];
  fontSize?: number;
  transpose?: number;
  hideChords?: boolean;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({
  lines,
  fontSize = 18,
  transpose = 0,
  hideChords = false,
}) => {
  return (
    <div style={{ ...styles.pageContainer, fontSize: `${fontSize}px` }}>
      {lines.map((line, lineIndex) => {
        if (line.renderType === 'directive') {
          if (line.directiveType === 'title' || line.directiveType === 't') {
            return (
              <h1 key={lineIndex} style={styles.titleHeading}>
                {line.directiveValue}
              </h1>
            );
          }
          return null;
        }

        if (line.renderType === 'spacer') {
          return <div key={lineIndex} style={styles.paragraphSeparator} />;
        }

        return (
          <div
            key={lineIndex}
            style={{
              ...styles.songLine,
              ...(line.isChorus && hideChords ? styles.chorusLine : {}),
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
                      {wordUnit.chord
                        ? ChordTransposer.transposeChord(wordUnit.chord, transpose)
                        : '\u00A0'}
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
  pageContainer: {
    fontFamily: "'Noto Serif', 'Noto Serif Devanagari', Georgia, serif",
    padding: '24px 36px',
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  titleHeading: {
    fontSize: '1.3em',
    fontWeight: 'bold',
    margin: '0 0 12px 0',
    color: 'var(--color-text)',
  },
  songLine: {
    display: 'block',
    width: '100%',
    marginBottom: '4px',
    lineHeight: 1.35,
  },
  chorusLine: {
    fontWeight: 'bold',
  },
  chordWordGroup: {
    display: 'inline-flex',
    flexDirection: 'column',
    verticalAlign: 'bottom',
    whiteSpace: 'pre',
    marginRight: '2px',
  },
  chordSlot: {
    fontWeight: 'bold',
    color: '#1a73e8',
    fontSize: '0.8em',
    height: '1.2em',
    lineHeight: '1.2em',
  },
  lyricSlot: {
    fontSize: '1em',
    lineHeight: '1.2em',
  },
  paragraphSeparator: {
    height: '16px',
    margin: '0',
    padding: '0',
    display: 'block',
    width: '100%',
  },
};
