import type { ParsedSongLine, SongPage } from './paginationTypes';

export interface PaginationOptions {
  pageHeight: number;
  pageWidth: number;
  fontSize?: number;
  hideChords?: boolean;
  headerHeight?: number;
  footerHeight?: number;
  paddingY?: number;
  paddingX?: number;
}

/**
 * Calculates estimated rendered height of a single parsed song line.
 */
function estimateLineHeight(
  line: ParsedSongLine,
  contentWidth: number,
  fontSize: number,
  hideChords: boolean
): number {
  if (line.renderType === 'skip') return 0;
  if (line.renderType === 'spacer') return 20;

  if (line.renderType === 'directive' || line.isDirective) {
    if (line.directiveType === 'title' || line.directiveType === 't') {
      return fontSize * 1.8 + 20;
    }
    return 0; // Other directives don't render visually
  }

  // Base height of one single-line row:
  // With chords: chord slot (~0.8em * 1.2) + lyric slot (~1em * 1.3) + margin (~4px)
  const singleRowHeight = hideChords
    ? fontSize * 1.55 + 4
    : fontSize * 2.35 + 6;

  if (!line.words || line.words.length === 0) {
    return singleRowHeight;
  }

  // Estimate wrapping based on characters and chord widths
  const charWidth = fontSize * 0.58;
  let estimatedLineWidth = 0;

  for (const word of line.words) {
    const lyricLen = (word.lyric || '').length;
    const chordLen = hideChords ? 0 : (word.chord || '').length;
    // Word width is governed by either the lyric or chord length, plus spacing
    const effectiveChars = Math.max(lyricLen, chordLen > 0 ? chordLen + 1 : 0);
    estimatedLineWidth += effectiveChars * charWidth + (effectiveChars > 0 ? 6 : 0);
  }

  const safeContentWidth = Math.max(120, contentWidth);
  const visualRows = Math.max(1, Math.ceil(estimatedLineWidth / safeContentWidth));

  return visualRows * singleRowHeight;
}

/**
 * Paginates an array of structured parsed lines into deterministic book pages.
 * Guarantees that chords and lyrics for a given line are never separated.
 */
export function paginateSong(
  parsedLines: ParsedSongLine[],
  options: PaginationOptions
): SongPage[] {
  if (!parsedLines || parsedLines.length === 0) {
    return [
      {
        pageIndex: 0,
        totalPages: 1,
        lines: [],
        startLineIndex: 0,
        endLineIndex: 0,
        sectionTitle: '',
      },
    ];
  }

  const {
    pageHeight,
    pageWidth,
    fontSize = 18,
    hideChords = false,
    headerHeight = 36,
    footerHeight = 32,
    paddingY = 24,
    paddingX = 24,
  } = options;

  // Available vertical content space on each page
  const availableHeight = Math.max(180, pageHeight - headerHeight - footerHeight - paddingY * 2);
  const contentWidth = Math.max(140, pageWidth - paddingX * 2);

  const pages: SongPage[] = [];
  let currentPageLines: ParsedSongLine[] = [];
  let currentHeight = 0;
  let pageStartIndex = 0;
  let activeSectionTitle = '';
  let pageStartSection = '';

  for (let i = 0; i < parsedLines.length; i++) {
    const line = parsedLines[i];

    // Track section headings (e.g., [Verse 1], [Chorus])
    if (line.isSectionMarker && line.sectionLabel) {
      activeSectionTitle = line.sectionLabel;
    }

    if (line.renderType === 'skip') {
      continue;
    }

    const estimatedHeight = estimateLineHeight(line, contentWidth, fontSize, hideChords);

    // If adding this line exceeds the available height, finish current page (unless it's empty)
    const wouldOverflow = currentHeight + estimatedHeight > availableHeight;

    if (wouldOverflow && currentPageLines.length > 0) {
      // Check for orphan prevention: if the last item added was a spacer/heading, keep it with next page
      let carryOverLines: ParsedSongLine[] = [];
      const lastLine = currentPageLines[currentPageLines.length - 1];
      if (lastLine && (lastLine.renderType === 'spacer' || lastLine.isSectionMarker)) {
        carryOverLines.push(currentPageLines.pop()!);
      }

      pages.push({
        pageIndex: pages.length,
        totalPages: 0, // Will fill at the end
        lines: currentPageLines,
        startLineIndex: pageStartIndex,
        endLineIndex: i - 1 - carryOverLines.length,
        sectionTitle: pageStartSection || activeSectionTitle,
      });

      currentPageLines = [...carryOverLines];
      currentHeight = carryOverLines.reduce(
        (acc, l) => acc + estimateLineHeight(l, contentWidth, fontSize, hideChords),
        0
      );
      pageStartIndex = i - carryOverLines.length;
      pageStartSection = activeSectionTitle;
    }

    currentPageLines.push(line);
    currentHeight += estimatedHeight;

    if (!pageStartSection && activeSectionTitle) {
      pageStartSection = activeSectionTitle;
    }
  }

  // Final page
  if (currentPageLines.length > 0) {
    pages.push({
      pageIndex: pages.length,
      totalPages: 0,
      lines: currentPageLines,
      startLineIndex: pageStartIndex,
      endLineIndex: parsedLines.length - 1,
      sectionTitle: pageStartSection || activeSectionTitle,
    });
  }

  // If no pages were created (e.g. all lines skipped), return 1 empty page
  if (pages.length === 0) {
    pages.push({
      pageIndex: 0,
      totalPages: 1,
      lines: [],
      startLineIndex: 0,
      endLineIndex: 0,
      sectionTitle: '',
    });
  }

  // Assign totalPages to all pages
  const total = pages.length;
  pages.forEach((p) => {
    p.totalPages = total;
  });

  return pages;
}
