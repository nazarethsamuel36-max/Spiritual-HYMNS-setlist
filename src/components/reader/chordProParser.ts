import type { ChordWordUnit, ParsedSongLine } from './paginationTypes';

/**
 * Parses raw ChordPro text into structured lines containing word/chord pairs,
 * directives, and section markers.
 */
export function parseChordPro(rawChordPro: string): ParsedSongLine[] {
  if (!rawChordPro) return [];

  const lines = rawChordPro.split(/\r?\n/);
  let inChorusSection = false;

  return lines.map((line): ParsedSongLine => {
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

    // Section marker detection (e.g. [Verse 1], [Chorus])
    if (trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.slice(1, -1).includes('[')) {
      const sectionName = trimmed.slice(1, -1).trim();
      const isChorusSection = /^chorus/i.test(sectionName);
      if (isChorusSection) {
        inChorusSection = true;
      } else {
        inChorusSection = false;
      }
      return {
        isDirective: false,
        words: [],
        isChorus: false,
        isSectionMarker: true,
        sectionLabel: sectionName
      };
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

    // Expand multi-word lyric chunks into per-word units
    const expandedWords: ChordWordUnit[] = [];
    for (const unit of wordsArray) {
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
      if (isFirst && unit.chord) {
        expandedWords.push({ chord: unit.chord, lyric: '' });
      }
    }

    const finalWords = expandedWords.length > 0 ? expandedWords : [{ chord: '', lyric: ' ' }];

    return { isDirective: false, words: finalWords, isChorus, isSectionMarker: false };
  });
}

/**
 * Preprocesses lines to determine their render types ('text', 'spacer', 'directive', 'skip').
 * Collapses consecutive blank lines / markers into neat spacers.
 */
export function preprocessRenderedLines(
  parsedSongLines: ParsedSongLine[],
  hideChords: boolean = false
): ParsedSongLine[] {
  const processedLines: ParsedSongLine[] = [];
  let lastWasSpacer = true;

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
}
