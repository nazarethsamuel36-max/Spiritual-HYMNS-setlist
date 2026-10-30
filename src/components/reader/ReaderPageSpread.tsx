import {
  useState,
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import type { SongPage } from './paginationTypes';
import { parseChordProLines, paginateSongLines } from './SongPaginator';
import { ReaderPage } from './ReaderPage';
import { PageFlip } from '../../lib/page-flip/page-flip.js';

export interface ReaderPageSpreadRef {
  flipForward: (onAfterFlip?: () => void) => boolean;
  flipBackward: (onAfterFlip?: () => void) => boolean;
  isFlipping: () => boolean;
}

interface AdjacentSongData {
  id: number;
  rawContent: string;
  transpose: number;
}

interface ReaderPageSpreadProps {
  rawChordPro: string;
  fontSize: number;
  transpose: number;
  hideChords: boolean;
  spreadIndex: number;
  onSpreadChange?: (newSpread: number) => void;
  onTotalSpreadsCalculated?: (total: number) => void;
  prevSongData?: AdjacentSongData | null;
  nextSongData?: AdjacentSongData | null;
  hasNextSong?: boolean;
  hasPrevSong?: boolean;
  onNextSong?: () => void;
  onPrevSong?: () => void;
}

export const ReaderPageSpread = forwardRef<ReaderPageSpreadRef, ReaderPageSpreadProps>(
  (
    {
      rawChordPro,
      fontSize,
      transpose,
      hideChords,
      spreadIndex,
      onSpreadChange,
      onTotalSpreadsCalculated,
      prevSongData,
      nextSongData,
      hasNextSong = false,
      hasPrevSong = false,
      onNextSong,
      onPrevSong,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mountRef = useRef<HTMLDivElement>(null);
    const stagingRef = useRef<HTMLDivElement>(null);
    const measureContainerRef = useRef<HTMLDivElement>(null);

    const pageFlipInstance = useRef<PageFlip | null>(null);

    const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
      width: 0,
      height: 0,
    });

    const [currentSongPages, setCurrentSongPages] = useState<SongPage[]>([]);
    const [prevSongPages, setPrevSongPages] = useState<SongPage[]>([]);
    const [nextSongPages, setNextSongPages] = useState<SongPage[]>([]);

    const lines = useMemo(() => {
      return parseChordProLines(rawChordPro, hideChords);
    }, [rawChordPro, hideChords]);

    const prevLines = useMemo(() => {
      return prevSongData ? parseChordProLines(prevSongData.rawContent, hideChords) : [];
    }, [prevSongData, hideChords]);

    const nextLines = useMemo(() => {
      return nextSongData ? parseChordProLines(nextSongData.rawContent, hideChords) : [];
    }, [nextSongData, hideChords]);

    // Measure container size on mount and window resize
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      let timeoutId: any = null;
      const updateDimensions = () => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerDimensions({
            width: Math.floor(rect.width),
            height: Math.floor(rect.height),
          });
        }
      };

      updateDimensions();
      const resizeObserver = new ResizeObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(updateDimensions, 100);
      });

      resizeObserver.observe(el);
      return () => {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
      };
    }, []);

    const isDualPage = containerDimensions.width >= 600;
    const singlePageWidth = isDualPage
      ? Math.floor(containerDimensions.width / 2)
      : Math.floor(containerDimensions.width);
    const availablePageHeight = Math.max(100, containerDimensions.height);

    // Dynamic song text pagination
    useEffect(() => {
      if (!lines.length || !measureContainerRef.current || containerDimensions.height <= 0) {
        return;
      }

      const measureAndPaginate = () => {
        const measureEl = measureContainerRef.current;
        if (!measureEl) return;

        const lineNodes = measureEl.children;
        const heights: number[] = [];

        for (let i = 0; i < lineNodes.length; i++) {
          const item = lineNodes[i] as HTMLElement;
          const rect = item.getBoundingClientRect();
          const style = window.getComputedStyle(item);
          const marginBottom = parseFloat(style.marginBottom) || 0;
          heights.push(Math.ceil(rect.height + marginBottom));
        }

        const calculatedPages = paginateSongLines(lines, heights, availablePageHeight);
        calculatedPages.forEach(p => { p.isFirstPageOfSong = p.pageIndex === 0; });
        setCurrentSongPages(calculatedPages);

        // Also paginate prevSongLines if present (approximate height measurement based on average height)
        if (prevLines.length > 0) {
          const avgH = heights.length > 0 ? heights.reduce((a, b) => a + b, 0) / heights.length : 28;
          const pHeights = prevLines.map(() => avgH);
          const pPages = paginateSongLines(prevLines, pHeights, availablePageHeight);
          pPages.forEach(p => { p.isFirstPageOfSong = p.pageIndex === 0; });
          setPrevSongPages(pPages);
        } else {
          setPrevSongPages([]);
        }

        // Also paginate nextSongLines if present
        if (nextLines.length > 0) {
          const avgH = heights.length > 0 ? heights.reduce((a, b) => a + b, 0) / heights.length : 28;
          const nHeights = nextLines.map(() => avgH);
          const nPages = paginateSongLines(nextLines, nHeights, availablePageHeight);
          nPages.forEach(p => { p.isFirstPageOfSong = p.pageIndex === 0; });
          setNextSongPages(nPages);
        } else {
          setNextSongPages([]);
        }

        const currentOrientation = containerDimensions.width >= 600 ? 'landscape' : 'portrait';
        const total = currentOrientation === 'landscape'
          ? Math.max(1, Math.ceil(calculatedPages.length / 2))
          : Math.max(1, calculatedPages.length);

        onTotalSpreadsCalculated?.(total);
      };

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          requestAnimationFrame(measureAndPaginate);
        });
      } else {
        const animFrame = requestAnimationFrame(measureAndPaginate);
        return () => cancelAnimationFrame(animFrame);
      }
    }, [lines, prevLines, nextLines, availablePageHeight, singlePageWidth, fontSize, hideChords, containerDimensions.width, onTotalSpreadsCalculated]);

    // Build unified continuous book stream: [...prevSongPages, ...currentSongPages, ...nextSongPages]
    const { displayPages, currentSongStartIndex } = useMemo(() => {
      if (!currentSongPages.length) return { displayPages: [], currentSongStartIndex: 0 };

      const allPages: Array<SongPage & { songTranspose: number }> = [];

      // 1. Previous song pages (if present)
      if (prevSongPages.length > 0) {
        prevSongPages.forEach((p) => {
          allPages.push({ ...p, pageIndex: allPages.length, songTranspose: prevSongData?.transpose ?? transpose });
        });
        // In dual-page landscape mode, ensure song boundary starts on clean page alignment
        if (isDualPage && allPages.length % 2 !== 0) {
          allPages.push({ pageIndex: allPages.length, lines: [], songTranspose: prevSongData?.transpose ?? transpose });
        }
      }

      const startIndex = allPages.length;

      // 2. Current song pages
      currentSongPages.forEach((p) => {
        allPages.push({ ...p, pageIndex: allPages.length, songTranspose: transpose });
      });

      // 3. Next song pages (if present)
      if (nextSongPages.length > 0) {
        if (isDualPage && allPages.length % 2 !== 0) {
          allPages.push({ pageIndex: allPages.length, lines: [], songTranspose: transpose });
        }
        nextSongPages.forEach((p) => {
          allPages.push({ ...p, pageIndex: allPages.length, songTranspose: nextSongData?.transpose ?? transpose });
        });
      }

      // Balance end of entire book
      if (isDualPage && allPages.length % 2 !== 0) {
        allPages.push({ pageIndex: allPages.length, lines: [], songTranspose: transpose });
      }

      return { displayPages: allPages, currentSongStartIndex: startIndex };
    }, [currentSongPages, prevSongPages, nextSongPages, isDualPage, transpose, prevSongData?.transpose, nextSongData?.transpose]);

    // Initialize and sync StPageFlip
    useEffect(() => {
      if (!displayPages.length || !mountRef.current || !stagingRef.current || containerDimensions.width <= 0) {
        return;
      }

      // Cleanup existing PageFlip instance before mounting new one
      if (pageFlipInstance.current) {
        try {
          pageFlipInstance.current.destroy();
        } catch {}
        pageFlipInstance.current = null;
      }

      const mountEl = mountRef.current;
      mountEl.innerHTML = '';

      // Create host element for StPageFlip
      const hostEl = document.createElement('div');
      hostEl.className = 'w-full h-full flex justify-center items-center';
      mountEl.appendChild(hostEl);

      const targetOrientation = containerDimensions.width >= 600 ? 'landscape' : 'portrait';
      const targetPageWidth = targetOrientation === 'landscape'
        ? Math.floor(containerDimensions.width / 2)
        : Math.floor(containerDimensions.width);
      const targetPageHeight = availablePageHeight;

      const initialPage = targetOrientation === 'landscape'
        ? Math.min(displayPages.length - 1, currentSongStartIndex + spreadIndex * 2)
        : Math.min(displayPages.length - 1, currentSongStartIndex + spreadIndex);

      const pageFlip = new PageFlip(hostEl, {
        width: targetPageWidth,
        height: targetPageHeight,
        size: 'stretch',
        minWidth: 260,
        maxWidth: 1400,
        minHeight: availablePageHeight,
        maxHeight: availablePageHeight,
        drawShadow: true,
        maxShadowOpacity: 0.35,
        showCover: false,
        usePortrait: true, // Automatically uses 1 page on mobile portrait and 2 pages on desktop landscape
        startPage: Math.max(0, initialPage),
        flippingTime: 550,
        useMouseEvents: true,
        mobileScrollSupport: false,
        showPageCorners: true,
        clickEventForward: true,
      });

      // Clone staging page elements and load into PageFlip
      const stagingChildren = Array.from(stagingRef.current.children) as HTMLElement[];
      const clonedPages = stagingChildren.map((child) => child.cloneNode(true) as HTMLElement);

      pageFlip.loadFromHTML(clonedPages);

      pageFlip.on('flip', (e) => {
        const curOrientation = pageFlip.getOrientation();
        const absolutePageIndex = e.data;

        // Check if user turned past current song boundaries
        if (absolutePageIndex < currentSongStartIndex) {
          // Turned back into previous song
          if (onPrevSong) onPrevSong();
          return;
        }

        const currentSongEndIndex = currentSongStartIndex + currentSongPages.length;
        if (absolutePageIndex >= currentSongEndIndex) {
          // Turned forward into next song
          if (onNextSong) onNextSong();
          return;
        }

        // Within current song: calculate relative spread
        const relativePageIndex = absolutePageIndex - currentSongStartIndex;
        const currentSpreadIndex = curOrientation === 'landscape'
          ? Math.floor(relativePageIndex / 2)
          : relativePageIndex;
        onSpreadChange?.(currentSpreadIndex);
      });

      pageFlip.on('changeOrientation', (e) => {
        const newOrient = e.data;
        const total = newOrient === 'landscape'
          ? Math.max(1, Math.ceil(currentSongPages.length / 2))
          : Math.max(1, currentSongPages.length);
        onTotalSpreadsCalculated?.(total);
      });

      pageFlip.on('init', (e) => {
        const initialOrient = e.data.mode as 'portrait' | 'landscape';
        const total = initialOrient === 'landscape'
          ? Math.max(1, Math.ceil(currentSongPages.length / 2))
          : Math.max(1, currentSongPages.length);
        onTotalSpreadsCalculated?.(total);
      });

      pageFlipInstance.current = pageFlip;

      return () => {
        if (pageFlipInstance.current) {
          try {
            pageFlipInstance.current.destroy();
          } catch {}
          pageFlipInstance.current = null;
        }
      };
    }, [displayPages, containerDimensions.width, containerDimensions.height, availablePageHeight, fontSize, transpose, hideChords]);

    // Imperative ref methods for programmatic Next/Prev flipping
    const flipForward = useCallback(
      (onAfterFlip?: () => void): boolean => {
        const flip = pageFlipInstance.current;
        if (!flip) {
          if (onAfterFlip) onAfterFlip();
          else if (hasNextSong && onNextSong) onNextSong();
          return true;
        }

        const currentIdx = flip.getCurrentPageIndex();
        const pageCount = flip.getPageCount();
        const curOrientation = flip.getOrientation();

        const isAtEnd =
          curOrientation === 'landscape'
            ? currentIdx >= pageCount - 2
            : currentIdx >= pageCount - 1;

        if (isAtEnd) {
          if (onAfterFlip) {
            onAfterFlip();
          } else if (hasNextSong && onNextSong) {
            onNextSong();
          }
          return true;
        }

        flip.flipNext('bottom');
        if (onAfterFlip) {
          setTimeout(onAfterFlip, 600);
        }
        return true;
      },
      [hasNextSong, onNextSong]
    );

    const flipBackward = useCallback(
      (onAfterFlip?: () => void): boolean => {
        const flip = pageFlipInstance.current;
        if (!flip) {
          if (onAfterFlip) onAfterFlip();
          else if (hasPrevSong && onPrevSong) onPrevSong();
          return true;
        }

        const currentIdx = flip.getCurrentPageIndex();
        const isAtStart = currentIdx <= 0;

        if (isAtStart) {
          if (onAfterFlip) {
            onAfterFlip();
          } else if (hasPrevSong && onPrevSong) {
            onPrevSong();
          }
          return true;
        }

        flip.flipPrev('bottom');
        if (onAfterFlip) {
          setTimeout(onAfterFlip, 600);
        }
        return true;
      },
      [hasPrevSong, onPrevSong]
    );

    const isFlipping = useCallback(() => {
      const flip = pageFlipInstance.current;
      if (!flip) return false;
      return flip.getState() !== 'read';
    }, []);

    useImperativeHandle(ref, () => ({
      flipForward,
      flipBackward,
      isFlipping,
    }));

    // Sync external spread navigation (e.g. from sliders or buttons)
    useEffect(() => {
      const flip = pageFlipInstance.current;
      if (!flip) return;

      const currentIdx = flip.getCurrentPageIndex();
      const curOrientation = flip.getOrientation();
      const targetAbsolutePage = curOrientation === 'landscape'
        ? currentSongStartIndex + spreadIndex * 2
        : currentSongStartIndex + spreadIndex;

      if (curOrientation === 'landscape') {
        const currentRelativeSpread = Math.floor((currentIdx - currentSongStartIndex) / 2);
        if (currentRelativeSpread !== spreadIndex && targetAbsolutePage >= 0 && targetAbsolutePage < flip.getPageCount()) {
          flip.turnToPage(targetAbsolutePage);
        }
      } else {
        const currentRelativeIndex = currentIdx - currentSongStartIndex;
        if (currentRelativeIndex !== spreadIndex && targetAbsolutePage >= 0 && targetAbsolutePage < flip.getPageCount()) {
          flip.turnToPage(targetAbsolutePage);
        }
      }
    }, [spreadIndex, currentSongStartIndex]);

    return (
      <div
        ref={containerRef}
        className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden select-none bg-[var(--color-surface,#fcfbf9)]"
        style={{
          touchAction: 'pan-y',
        }}
      >
        {/* Mobile Persistent Left Spine Binding (< 600px) — touches left edge completely */}
        {!isDualPage && (
          <div className="absolute top-0 bottom-0 left-0 w-4 z-30 pointer-events-none flex select-none">
            {/* Spine seam line flush against edge */}
            <div className="w-[2px] h-full bg-slate-400 flex-shrink-0" />
            {/* Spine depth shadow fading into the page */}
            <div className="w-full h-full bg-gradient-to-r from-black/[0.18] via-black/[0.06] to-transparent" />
          </div>
        )}

        {/* Active StPageFlip Render Host (spans 100% width flush with edges) */}
        <div
          ref={mountRef}
          className="w-full h-full flex justify-center items-center overflow-hidden"
        />

        {/* Hidden Staging Container (rendered by React, cloned into StPageFlip) */}
        <div
          ref={stagingRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -99999,
            left: -99999,
            visibility: 'hidden',
            pointerEvents: 'none',
            width: `${Math.floor(singlePageWidth)}px`,
            height: `${Math.floor(availablePageHeight)}px`,
          }}
        >
          {displayPages.map((page, idx) => (
            <div
              key={idx}
              className="stf-page"
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--color-surface, #fcfbf9)',
                boxSizing: 'border-box',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {page.lines.length > 0 ? (
                <ReaderPage
                  lines={page.lines}
                  fontSize={fontSize}
                  transpose={page.songTranspose ?? transpose}
                  hideChords={hideChords}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30 italic text-sm">
                  {/* Blank page placeholder for balanced spread */}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Hidden measurement container for SongPaginator */}
        <div
          ref={measureContainerRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -99999,
            left: -99999,
            width: `${Math.floor(singlePageWidth)}px`,
            visibility: 'hidden',
            pointerEvents: 'none',
            fontSize: `${fontSize}px`,
            fontFamily: "'Noto Serif', 'Noto Serif Devanagari', Georgia, serif",
            padding: '24px 36px',
            boxSizing: 'border-box',
          }}
        >
          {lines.map((line, idx) => (
            <div
              key={idx}
              style={{
                display: 'block',
                width: '100%',
                marginBottom: line.renderType === 'spacer' ? '0px' : '4px',
                height: line.renderType === 'spacer' ? '16px' : 'auto',
                lineHeight: 1.35,
              }}
            >
              {line.renderType === 'directive' ? (
                <h1 style={{ fontSize: '1.3em', fontWeight: 'bold', margin: '0 0 12px 0' }}>
                  {line.directiveValue}
                </h1>
              ) : line.renderType === 'spacer' ? (
                <div style={{ height: '16px' }} />
              ) : (
                line.words?.map((wordUnit, wordIdx) => (
                  <div
                    key={wordIdx}
                    style={{
                      display: 'inline-flex',
                      flexDirection: 'column',
                      verticalAlign: 'bottom',
                      whiteSpace: 'pre',
                      marginRight: '2px',
                    }}
                  >
                    {!hideChords && (
                      <span
                        style={{
                          fontWeight: 'bold',
                          fontSize: '0.8em',
                          height: '1.2em',
                          lineHeight: '1.2em',
                        }}
                      >
                        {wordUnit.chord || '\u00A0'}
                      </span>
                    )}
                    <span style={{ fontSize: '1em', lineHeight: '1.2em' }}>
                      {wordUnit.lyric || '\u00A0'}
                    </span>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ReaderPageSpread.displayName = 'ReaderPageSpread';
