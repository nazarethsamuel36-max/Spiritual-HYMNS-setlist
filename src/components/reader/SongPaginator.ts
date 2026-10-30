import { parseChordProLines } from './chordProParser';
import type { SongLine, SongPage } from './paginationTypes';

/**
 * Greedily paginates measured line heights into fixed pages.
 * Never cuts a chord-lyric line in half.
 */
export function paginateSongLines(
  lines: SongLine[],
  lineHeights: number[],
  pageAvailableHeight: number
): SongPage[] {
  if (!lines.length || !lineHeights.length) return [];

  const pages: SongPage[] = [];
  let currentPageLines: SongLine[] = [];
  let currentAccumulatedHeight = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const height = lineHeights[i] || 28; // fallback reasonable line height

    // If adding this line exceeds available page height (and current page isn't empty)
    if (currentAccumulatedHeight + height > pageAvailableHeight && currentPageLines.length > 0) {
      pages.push({
        pageIndex: pages.length,
        lines: currentPageLines,
      });
      currentPageLines = [line];
      currentAccumulatedHeight = height;
    } else {
      currentPageLines.push(line);
      currentAccumulatedHeight += height;
    }
  }

  if (currentPageLines.length > 0) {
    pages.push({
      pageIndex: pages.length,
      lines: currentPageLines,
    });
  }

  return pages;
}

export { parseChordProLines };
