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
      let isSectionMarker = false;
      
      // Detect chorus section markers
      if (trimmed.toLowerCase() === '[chorus]') {
        inChorusSection = true;
        return { isDirective: false, words: [], isChorus: false, isSectionMarker: true }; // Skip the [Chorus] line itself
      }
      
      // Detect other section markers to exit chorus
      if (trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.toLowerCase().includes('chorus')) {
        inChorusSection = false;
        const sectionName = trimmed.slice(1, -1).trim();
        const isSection = /^(verse|chorus|bridge|intro|outro|pre-chorus|refrain|ending|interlude|coda|solo|strophe|chor|cho|chour)/i.test(sectionName);
        if (isSection) {
          isSectionMarker = true;
        }
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

      if (wordsArray.length === 0) {
        wordsArray.push({ chord: '', lyric: ' ' });
      }

      return { isDirective: false, words: wordsArray, isChorus, isSectionMarker };
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
            {line.words?.map((wordUnit, wordIndex) => (
              <div key={wordIndex} style={styles.chordWordGroup}>
                {!hideChords && (
                  <span style={styles.chordSlot}>
                    {wordUnit.chord ? ChordTransposer.transposeChord(wordUnit.chord, transpose) : '\u00A0'}
                  </span>
                )}
                <span style={styles.lyricSlot}>
                  {wordUnit.lyric ? wordUnit.lyric : '\u00A0'}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  songSheet: {
    fontFamily: 'sans-serif',
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
    fontStyle: 'italic',
    paddingLeft: '24px',
    color: '#475569',
  },
  chordWordGroup: {
    display: 'inline-flex',
    flexDirection: 'column',
    verticalAlign: 'bottom',
    whiteSpace: 'pre-wrap',
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
