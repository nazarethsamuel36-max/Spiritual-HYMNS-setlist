import { useState, useEffect, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SongDetail, getSongById, normalizeSongIndex } from '../db/Database';
import { useWorkflowStore } from '../store/workflowStore';
import { ReaderHeader } from './reader/ReaderHeader';
import { ReaderContent } from './reader/ReaderContent';
import { EditorMode } from './reader/EditorMode';

const SWIPE_THRESHOLD = 60; // px horizontal travel required
const SWIPE_MAX_VERTICAL = 80; // px — abort if too much vertical movement

export function SongView() {
  const reader = useWorkflowStore((s) => s.reader);
  const readerMode = useWorkflowStore((s) => s.readerMode);
  const adjustTranspose = useWorkflowStore((s) => s.adjustTranspose);
  const closeReader = useWorkflowStore((s) => s.closeReader);
  const setReaderMode = useWorkflowStore((s) => s.setReaderMode);
  const openSong = useWorkflowStore((s) => s.openSong);
  const openMarker = useWorkflowStore((s) => s.openMarker);
  const openNote = useWorkflowStore((s) => s.openNote);

  const songId = reader.type === 'song' ? reader.songId : null;
  const transpose = reader.type === 'song' ? reader.transpose : 0;
  const activeArrangementId = reader.type === 'song' ? reader.activeArrangementId : null;
  const setlistId = reader.type === 'song' ? reader.setlistId : undefined;
  const currentItemId = reader.type === 'song' ? reader.itemId : undefined;
  const isSetlistContext = reader.type === 'song' && reader.source === 'setlist' && !!setlistId;

  const libraryLanguage = useWorkflowStore((s) => s.libraryLanguage);

  const [song, setSong] = useState<SongDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('worship-swipe-hint-seen');
    if (!hasSeen) {
      setShowSwipeHint(true);
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem('worship-swipe-hint-seen', 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const librarySongs = useLiveQuery(async () => {
    if (isSetlistContext) return null;
    let allSongs = (await db.songIndex.orderBy('songNumber').toArray()).map(normalizeSongIndex);
    if (libraryLanguage !== 'All') {
      allSongs = allSongs.filter(s => s.language?.toLowerCase() === libraryLanguage.toLowerCase());
    }
    allSongs.sort((a, b) => a.songNumber - b.songNumber);
    return allSongs;
  }, [isSetlistContext, libraryLanguage]);

  // Swipe indicator state
  const [swipeOffset, setSwipeOffset] = useState(0); // live drag offset in px

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(() => {
    const saved = localStorage.getItem('worship-autoscroll-speed');
    return saved ? parseInt(saved, 10) : 3;
  });

  const arrangement = useLiveQuery(() =>
    activeArrangementId ? db.arrangements.get(activeArrangementId) : undefined
  , [activeArrangementId]);

  // Load the setlist items when in setlist context for swipe navigation
  const setlistItems = useLiveQuery(async () => {
    if (!isSetlistContext || !setlistId) return null;
    const local = await db.setlists.get(setlistId);
    const setlist = local || await db.sharedSetlists.get(setlistId);
    if (!setlist) return null;
    return [...setlist.songs].sort((a, b) => a.order - b.order);
  }, [isSetlistContext, setlistId]);

  useEffect(() => {
    localStorage.setItem('worship-autoscroll-speed', scrollSpeed.toString());
  }, [scrollSpeed]);

  useEffect(() => {
    if (!isScrolling || !scrollContainerRef.current) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let accumulatedScroll = 0;

    const scrollContainer = scrollContainerRef.current;

    const loop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      const pixelsPerMs = scrollSpeed * 0.005;
      accumulatedScroll += delta * pixelsPerMs;

      if (accumulatedScroll >= 1) {
        const scrollAmt = Math.floor(accumulatedScroll);
        scrollContainer.scrollTop += scrollAmt;
        accumulatedScroll -= scrollAmt;
      }

      const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
      const isAtBottom = isScrollable && (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 4);
      if (isAtBottom) {
        setIsScrolling(false);
        return;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isScrolling, scrollSpeed]);

  // ─── Navigate to setlist neighbour ───────────────────────────────────────
  const navigateSetlist = useCallback((direction: 'prev' | 'next') => {
    if (!setlistItems || !setlistId) return;
    const currentIdx = currentItemId
      ? setlistItems.findIndex(i => i.id === currentItemId)
      : setlistItems.findIndex(i => i.songId === songId);

    const targetIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (targetIdx < 0 || targetIdx >= setlistItems.length) return;

    const target = setlistItems[targetIdx];
    if (!target.type || target.type === 'song') {
      openSong(target.songId!, 'setlist', target.transpose ?? 0, setlistId, target.id);
    } else if (target.type === 'marker') {
      openMarker(target.label || 'Event Marker', setlistId, target.id);
    } else if (target.type === 'note') {
      openNote(target.label || 'Note', target.content || '', setlistId, target.id);
    }
  }, [setlistItems, setlistId, currentItemId, songId, openSong, openMarker, openNote]);

  const navigateLibrary = useCallback(async (direction: 'prev' | 'next') => {
    if (!songId || !librarySongs) return;
    const currentIdx = librarySongs.findIndex(s => s.id === songId);
    if (currentIdx === -1) return;

    const targetIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (targetIdx < 0 || targetIdx >= librarySongs.length) return;

    const target = librarySongs[targetIdx];
    openSong(target.id, 'library');
  }, [songId, librarySongs, openSong]);

  // ─── Pointer / Touch swipe tracking ──────────────────────────────────────
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null); // null = undecided

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    isHorizontalSwipeRef.current = null;
    setSwipeOffset(0);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    // Decide lock direction on first meaningful move
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        isHorizontalSwipeRef.current = Math.abs(dx) > Math.abs(dy);
      }
    }

    if (isHorizontalSwipeRef.current) {
      e.stopPropagation();
      setSwipeOffset(dx);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (!pointerStartRef.current) return;

    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    const deltaX = e.clientX - start.x;
    const deltaY = Math.abs(e.clientY - start.y);
    const absDx = Math.abs(deltaX);
    const duration = performance.now() - start.time;

    setSwipeOffset(0);
    isHorizontalSwipeRef.current = null;

    // Tap to stop autoscroll
    if (absDx < 8 && deltaY < 8 && duration < 250) {
      if (isScrolling) {
        setIsScrolling(false);
      }
      return;
    }

    // Swipe navigation
    if (absDx >= SWIPE_THRESHOLD && deltaY <= SWIPE_MAX_VERTICAL) {
      const direction = deltaX < 0 ? 'next' : 'prev';
      if (isSetlistContext) {
        navigateSetlist(direction);
      } else {
        navigateLibrary(direction);
      }
    }
  };

  const adjustSpeed = (delta: number) => {
    setScrollSpeed(prev => {
      const next = prev + delta;
      return Math.min(10, Math.max(1, next));
    });
    setIsScrolling(true);
  };

  useEffect(() => {
    if (!songId) {
      setSong(null);
      setLoading(false);
      return;
    }

    const loadSong = async () => {
      setLoading(true);
      setSong(null);
      setError(null);

      try {
        const data = await getSongById(songId);
        if (!data) throw new Error('Song data not found');
        setSong(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load song');
      } finally {
        setLoading(false);
      }
    };
    loadSong();
  }, [songId]);

  if (loading) return (
    <div className="p-12 text-center flex flex-col items-center">
      <div className="animate-spin h-8 w-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full mb-4"></div>
      <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Loading...</div>
    </div>
  );

  if (error || !song) return (
    <div className="p-12 text-center text-red-500 font-bold text-sm">{error || 'Song not found'}</div>
  );

  const displaySections = arrangement?.overrides?.sections || song.sections;
  const displayTranspose = transpose + (arrangement?.overrides?.capo || 0);
  // Setlist position for the nav indicator
  const currentIdx = setlistItems
    ? (currentItemId
        ? setlistItems.findIndex(i => i.id === currentItemId)
        : setlistItems.findIndex(i => i.songId === songId))
    : -1;

  // Page indicator calculation
  const totalItems = isSetlistContext
    ? (setlistItems?.length || 0)
    : (librarySongs?.length || 0);

  const activeIdx = isSetlistContext
    ? currentIdx
    : (librarySongs ? librarySongs.findIndex(s => s.id === songId) : -1);

  const maxDots = 7;
  let startDot = 0;
  let endDot = totalItems;
  if (totalItems > maxDots) {
    const half = Math.floor(maxDots / 2);
    startDot = activeIdx - half;
    if (startDot < 0) startDot = 0;
    endDot = startDot + maxDots;
    if (endDot > totalItems) {
      endDot = totalItems;
      startDot = endDot - maxDots;
    }
  }
  const visibleDots = Array.from({ length: endDot - startDot }, (_, i) => startDot + i);

  return (
    <div className="flex-col h-full w-full bg-[#FAFAFA] flex">
      <ReaderHeader
        song={song}
        transpose={displayTranspose}
        mode={readerMode}
        onTransposeUp={() => adjustTranspose(1)}
        onTransposeDown={() => adjustTranspose(-1)}
        onModeChange={setReaderMode}
        onBack={closeReader}
      />

      {/* Position Page Indicator */}
      {totalItems > 1 && (
        <div className="flex items-center justify-center space-x-1.5 py-2 bg-white border-b border-slate-100">
          {visibleDots.map((idx) => (
            <div
              key={idx}
              className={`rounded-full transition-all duration-200 ${
                idx === activeIdx
                  ? 'w-4 h-1.5 bg-[var(--color-brand)]'
                  : 'w-1.5 h-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>
      )}

      {/* Calm Typography Area — Independent Scroll Region */}
      <div
        ref={scrollContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: swipeOffset !== 0 ? `translateX(${swipeOffset * 0.3}px)` : undefined,
          transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none',
          touchAction: 'pan-y',
        }}
        className="flex-1 overflow-y-auto w-full px-4 md:px-8 pt-8 pb-40 overscroll-contain select-none"
      >
        <div className="max-w-4xl mx-auto w-full min-h-full">
          {readerMode === 'edit' ? (
            <EditorMode song={{ ...song, sections: displaySections }} />
          ) : (
            <ReaderContent sections={displaySections} transpose={displayTranspose} mode={readerMode} />
          )}
        </div>
      </div>

      {showSwipeHint && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg pointer-events-none transition-all duration-500 animate-pulse">
          ← Swipe to navigate →
        </div>
      )}

      {/* Floating Auto Scroll Control HUD */}
      {readerMode !== 'edit' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-6 right-6 z-40 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xl rounded-full px-4 py-2 flex items-center space-x-4 transition-all duration-300 hover:shadow-2xl hover:scale-102"
        >
          <button
            onClick={() => setIsScrolling(!isScrolling)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 ${
              isScrolling
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            title={isScrolling ? 'Pause Scroll' : 'Start Auto Scroll'}
          >
            {isScrolling ? (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <rect x="4" y="4" width="4" height="16" rx="1" />
                <rect x="16" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Speed</span>
            <div className="flex items-center space-x-1 bg-slate-100 rounded-full p-0.5 border border-slate-200">
              <button
                disabled={scrollSpeed <= 1}
                onClick={() => adjustSpeed(-1)}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent font-bold transition-all"
              >
                -
              </button>
              <span className="w-6 text-center font-black text-slate-700 font-mono">{scrollSpeed}</span>
              <button
                disabled={scrollSpeed >= 10}
                onClick={() => adjustSpeed(1)}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent font-bold transition-all"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
