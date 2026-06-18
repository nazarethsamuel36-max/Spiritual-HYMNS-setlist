import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SongDetail, getSongById } from '../db/Database';
import { useWorkflowStore } from '../store/workflowStore';
import { ReaderHeader } from './reader/ReaderHeader';
import { ReaderContent } from './reader/ReaderContent';
import { EditorMode } from './reader/EditorMode';

export function SongView() {
  const reader = useWorkflowStore((s) => s.reader);
  const readerMode = useWorkflowStore((s) => s.readerMode);
  const adjustTranspose = useWorkflowStore((s) => s.adjustTranspose);
  const closeReader = useWorkflowStore((s) => s.closeReader);
  const setReaderMode = useWorkflowStore((s) => s.setReaderMode);

  const songId = reader.type === 'song' ? reader.songId : null;
  const transpose = reader.type === 'song' ? reader.transpose : 0;
  const activeArrangementId = reader.type === 'song' ? reader.activeArrangementId : null;

  const [song, setSong] = useState<SongDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(() => {
    const saved = localStorage.getItem('worship-autoscroll-speed');
    return saved ? parseInt(saved, 10) : 3;
  });

  const arrangement = useLiveQuery(() => 
    activeArrangementId ? db.arrangements.get(activeArrangementId) : undefined
  , [activeArrangementId]);

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

  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;

    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    const deltaX = Math.abs(e.clientX - start.x);
    const deltaY = Math.abs(e.clientY - start.y);
    const duration = performance.now() - start.time;

    if (deltaX < 8 && deltaY < 8 && duration < 250) {
      if (isScrolling) {
        setIsScrolling(false);
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

      {/* Calm Typography Area — Independent Scroll Region */}
      <div 
        ref={scrollContainerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="flex-1 overflow-y-auto w-full px-4 md:px-8 pt-8 pb-40 overscroll-contain"
      >
        <div className="max-w-4xl mx-auto w-full min-h-full">
          {readerMode === 'edit' ? (
            <EditorMode song={{ ...song, sections: displaySections }} />
          ) : (
            <ReaderContent sections={displaySections} transpose={displayTranspose} mode={readerMode} />
          )}
        </div>
      </div>

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
