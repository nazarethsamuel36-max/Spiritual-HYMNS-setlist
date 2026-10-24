import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { ParsedSongLine, SongPage } from './paginationTypes';
import { parseChordPro } from './chordProParser';
import { paginateSong } from './SongPaginator';
import { ReaderPage } from './ReaderPage';

interface ReaderPageFlipProps {
  rawChordPro: string;
  fontSize: number;
  transpose: number;
  hideChords: boolean;
  songTitle?: string;
  songNumber?: number | string;
  onExitPageMode?: () => void;
}

export const ReaderPageFlip: React.FC<ReaderPageFlipProps> = ({
  rawChordPro,
  fontSize,
  transpose,
  hideChords,
  songTitle,
  songNumber,
  onExitPageMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Current page state
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Parse structured lines once from raw chordpro
  const parsedLines = useMemo<ParsedSongLine[]>(() => {
    return parseChordPro(rawChordPro);
  }, [rawChordPro]);

  // Measure container dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
        });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: Math.floor(entry.contentRect.width),
            height: Math.floor(entry.contentRect.height),
          });
        }
      }
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  // Determine whether to use two-page spread or single-page mode
  // Responsive breakpoint: >= 840px width allows comfortable 2-page spread
  const isTwoPageSpread = dimensions.width >= 840;

  // Single page dimension calculation
  const pageWidth = useMemo(() => {
    if (dimensions.width <= 0) return 400;
    if (isTwoPageSpread) {
      // Half width minus central spine gutter and padding
      return Math.floor((dimensions.width - 48) / 2);
    }
    // Single page with small margin
    return Math.min(680, dimensions.width - 24);
  }, [dimensions.width, isTwoPageSpread]);

  const pageHeight = useMemo(() => {
    if (dimensions.height <= 0) return 600;
    // Reserve bottom space for reader footer navigation bar (~56px)
    return Math.max(300, dimensions.height - 64);
  }, [dimensions.height]);

  // Paginate song into pages whenever dimensions, font size, or chord mode changes
  const pages = useMemo<SongPage[]>(() => {
    if (pageWidth <= 0 || pageHeight <= 0) return [];
    return paginateSong(parsedLines, {
      pageHeight,
      pageWidth,
      fontSize,
      hideChords,
      headerHeight: 36,
      footerHeight: 32,
      paddingY: 18,
      paddingX: isTwoPageSpread ? 20 : 18,
    });
  }, [parsedLines, pageHeight, pageWidth, fontSize, hideChords, isTwoPageSpread]);

  // Ensure current page index stays within valid range
  useEffect(() => {
    if (pages.length > 0 && currentPageIndex >= pages.length) {
      setCurrentPageIndex(Math.max(0, pages.length - (isTwoPageSpread ? 2 : 1)));
    }
  }, [pages.length, currentPageIndex, isTwoPageSpread]);

  // Step size for navigation: 2 pages in spread mode, 1 page in single mode
  const pageStep = isTwoPageSpread ? 2 : 1;

  const goToNextPage = useCallback(() => {
    if (isAnimating) return;
    if (currentPageIndex + pageStep < pages.length) {
      setFlipDirection('forward');
      setIsAnimating(true);
      setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + pageStep));
      setTimeout(() => {
        setIsAnimating(false);
        setFlipDirection(null);
      }, 320);
    }
  }, [currentPageIndex, pageStep, pages.length, isAnimating]);

  const goToPrevPage = useCallback(() => {
    if (isAnimating) return;
    if (currentPageIndex > 0) {
      setFlipDirection('backward');
      setIsAnimating(true);
      setCurrentPageIndex((prev) => Math.max(0, prev - pageStep));
      setTimeout(() => {
        setIsAnimating(false);
        setFlipDirection(null);
      }, 320);
    }
  }, [currentPageIndex, pageStep, isAnimating]);

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage]);

  // Touch swipe handling inside the page-flip container
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Stop propagation so global SongView song-switch listener doesn't trigger!
    e.stopPropagation();
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartXRef.current;
    const dy = touch.clientY - touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Horizontal swipe threshold: > 45px and predominantly horizontal
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) {
        goToNextPage();
      } else {
        goToPrevPage();
      }
    }
  };

  // Active page slices to render
  const leftPage = pages[currentPageIndex] || null;
  const rightPage = isTwoPageSpread ? pages[currentPageIndex + 1] || null : null;

  return (
    <div
      ref={containerRef}
      className="page-flip-container relative flex flex-col h-full w-full select-none overflow-hidden bg-slate-100/70 dark:bg-slate-950/80"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Book Spread Viewport */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0 perspective-[1400px]">
        {pages.length === 0 ? (
          <div className="text-slate-400 text-sm italic">Loading hymnbook pages...</div>
        ) : isTwoPageSpread ? (
          /* Two-Page Spread (Open Book) */
          <div
            className={`flex items-stretch justify-center w-full max-w-5xl h-full transition-transform duration-300 ${
              flipDirection === 'forward'
                ? 'animate-page-flip-next'
                : flipDirection === 'backward'
                ? 'animate-page-flip-prev'
                : ''
            }`}
            style={{ maxHeight: `${pageHeight}px` }}
          >
            {/* Left Page */}
            <div className="flex-1 max-w-[500px] h-full pr-1">
              {leftPage ? (
                <ReaderPage
                  page={leftPage}
                  fontSize={fontSize}
                  transpose={transpose}
                  hideChords={hideChords}
                  songTitle={songTitle}
                  songNumber={songNumber}
                  side="left"
                />
              ) : (
                <div className="h-full w-full bg-slate-50 dark:bg-slate-900 rounded-l-lg border border-slate-200" />
              )}
            </div>

            {/* Central Book Spine Divider */}
            <div className="w-[10px] bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 shadow-inner rounded-sm my-1 z-20 flex-shrink-0" />

            {/* Right Page */}
            <div className="flex-1 max-w-[500px] h-full pl-1">
              {rightPage ? (
                <ReaderPage
                  page={rightPage}
                  fontSize={fontSize}
                  transpose={transpose}
                  hideChords={hideChords}
                  songTitle={songTitle}
                  songNumber={songNumber}
                  side="right"
                />
              ) : (
                /* Blank back page to balance the spread */
                <div className="h-full w-full bg-[#fdfdfc] dark:bg-[#1a1c23] rounded-r-lg border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-300 text-xs italic">
                  End of Song
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Single Page (Mobile / Portrait) */
          <div
            className={`flex items-center justify-center w-full h-full max-w-xl transition-all duration-300 ${
              flipDirection === 'forward'
                ? 'animate-page-turn-forward'
                : flipDirection === 'backward'
                ? 'animate-page-turn-backward'
                : ''
            }`}
            style={{ maxHeight: `${pageHeight}px`, width: `${pageWidth}px` }}
          >
            {leftPage && (
              <ReaderPage
                page={leftPage}
                fontSize={fontSize}
                transpose={transpose}
                hideChords={hideChords}
                songTitle={songTitle}
                songNumber={songNumber}
                side="single"
              />
            )}
          </div>
        )}

        {/* Quick tap target zones on left and right borders */}
        <button
          onClick={goToPrevPage}
          disabled={currentPageIndex === 0}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-24 hidden md:flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 rounded-r-xl transition-all disabled:opacity-0 disabled:pointer-events-none z-30"
          aria-label="Previous page"
          title="Previous Page (Left Arrow)"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNextPage}
          disabled={currentPageIndex + pageStep >= pages.length}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-24 hidden md:flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 rounded-l-xl transition-all disabled:opacity-0 disabled:pointer-events-none z-30"
          aria-label="Next page"
          title="Next Page (Right Arrow)"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Reader Bottom Navigation Bar */}
      <div className="flex-shrink-0 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-transparent px-4 flex items-center justify-between z-30 select-none">
        {/* Previous Button */}
        <button
          onClick={goToPrevPage}
          disabled={currentPageIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page status & spread indicator */}
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
            {isTwoPageSpread && rightPage ? (
              <span>
                Pages {currentPageIndex + 1}–{currentPageIndex + 2} of {pages.length}
              </span>
            ) : (
              <span>
                Page {currentPageIndex + 1} of {pages.length}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold hidden sm:inline">
            {isTwoPageSpread ? '2-Page Spread' : 'Book Mode'}
          </span>
        </div>

        {/* Next Button + Optional Exit */}
        <div className="flex items-center gap-2">
          {onExitPageMode && (
            <button
              onClick={onExitPageMode}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              title="Return to standard scroll mode"
            >
              Scroll Mode
            </button>
          )}

          <button
            onClick={goToNextPage}
            disabled={currentPageIndex + pageStep >= pages.length}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
