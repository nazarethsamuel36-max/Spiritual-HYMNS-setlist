import { useState, useEffect, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SongDetail } from '../db/Database';
import { supabase } from '../lib/supabaseClient';
import { useWorkflowStore } from '../store/workflowStore';
import { ReaderHeader } from './reader/ReaderHeader';
import { EditorMode } from './reader/EditorMode';
import { DeterministicSongView } from './reader/DeterministicSongView';

// Parse ChordPro format to chord positions
function parseChordProToPositions(chordPro: string): Array<{ chord: string; position: number }> {
  if (!chordPro) return [];
  
  const chords: Array<{ chord: string; position: number }> = [];
  const lines = chordPro.split('\n');
  let charIndex = 0;
  
  for (const line of lines) {
    const chordRegex = /\[([^\]]+)\]/g;
    let match;
    
    while ((match = chordRegex.exec(line)) !== null) {
      chords.push({
        chord: match[1],
        position: charIndex + match.index
      });
    }
    
    // Add newline character to character index
    charIndex += line.length + 1;
  }
  
  return chords;
}

// Parse lyrics string to sections (copied from CacheService for direct fetch)
function parseLyricsToSections(lyrics: string): Array<{ type: string; label: string; lines: Array<{ text: string }> }> {
  if (!lyrics) return [];

  const sections: Array<{ type: string; label: string; lines: Array<{ text: string }> }> = [];
  const lines = lyrics.split('\n');
  let currentSection: { type: string; label: string; lines: Array<{ text: string }> } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect section headers (e.g., [Verse 1], [Chorus])
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'verse',
        label: sectionMatch[1],
        lines: []
      };
    } else if (currentSection) {
      currentSection.lines.push({ text: trimmed });
    } else {
      // First line without section header
      currentSection = {
        type: 'verse',
        label: 'Verse 1',
        lines: [{ text: trimmed }]
      };
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

export function SongView() {
  const reader = useWorkflowStore((s) => s.reader);
  const readerMode = useWorkflowStore((s) => s.readerMode);
  const isAdminAuthenticated = useWorkflowStore((s) => s.isAdminAuthenticated);
  const adjustTranspose = useWorkflowStore((s) => s.adjustTranspose);
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
  const [librarySongs, setLibrarySongs] = useState<Array<{ id: number; songNumber: number; title: string; language?: string | null }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  // viewMode is now controlled by readerMode from store

  useEffect(() => {
    if (isSetlistContext) {
      setLibrarySongs(null);
      return;
    }

    const loadLibrarySongs = async () => {
      console.log('📚 Loading library songs DIRECTLY from Supabase (cache disabled)...');
      try {
        let query = supabase
          .from('songs')
          .select('id, song_number, title, language')
          .eq('is_active', true)
          .order('song_number', { ascending: true });

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        let allSongs = (data ?? []).map((row: any) => ({
          id: row.id,
          songNumber: Number(row.song_number ?? 0),
          title: row.title ?? 'Untitled',
          language: row.language ?? 'English',
        }));

        if (libraryLanguage !== 'All') {
          allSongs = allSongs.filter((s) => s.language?.toLowerCase() === libraryLanguage.toLowerCase());
        }

        allSongs.sort((a, b) => a.songNumber - b.songNumber);
        setLibrarySongs(allSongs);
        console.log('📚 Library songs loaded from Supabase:', allSongs.length);
      } catch (err) {
        console.error('❌ Failed to load library songs from Supabase:', err);
        setLibrarySongs([]);
      }
    };

    loadLibrarySongs();
  }, [isSetlistContext, libraryLanguage]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
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

  const adjustSpeed = (delta: number) => {
    setScrollSpeed(prev => {
      const next = prev + delta;
      return Math.min(10, Math.max(1, next));
    });
    setIsScrolling(true);
  };

  // ─── Navigation functions for swipe ───────────────────────────────────────
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
  }, [setlistItems, setlistId, currentItemId, songId]);

  const navigateLibrary = useCallback((direction: 'prev' | 'next') => {
    if (!songId || !librarySongs || librarySongs.length === 0) {
      console.warn('Library songs not loaded yet');
      return;
    }

    const currentIdx = librarySongs.findIndex(s => s.id === songId);
    if (currentIdx === -1) return;

    const targetIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;

    if (targetIdx >= 0 && targetIdx < librarySongs.length) {
      const target = librarySongs[targetIdx];
      if (navigator.vibrate) navigator.vibrate(10);
      openSong(target.id, 'library');
    }
  }, [songId, librarySongs]);

  // ─── Touch event handlers for swipe navigation ───────────────────────────────
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    isHorizontalSwipeRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    // Determine swipe direction on first meaningful movement
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        isHorizontalSwipeRef.current = Math.abs(dx) > Math.abs(dy);
      }
    }

    // If horizontal swipe detected, prevent vertical scroll
    if (isHorizontalSwipeRef.current === true) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Reset refs
    const wasHorizontal = isHorizontalSwipeRef.current;
    touchStartRef.current = null;
    isHorizontalSwipeRef.current = null;

    // Only trigger if:
    // - It was a horizontal swipe
    // - Horizontal distance > 50px
    // - Vertical distance < 100px (not scrolling)
    // - Completed in under 500ms (quick gesture)
    if (
      wasHorizontal === true &&
      Math.abs(deltaX) > 50 &&
      deltaY < 100 &&
      deltaTime < 500
    ) {
      const direction = deltaX < 0 ? 'next' : 'prev';

      // Use the appropriate navigation function based on context
      if (isSetlistContext) {
        navigateSetlist(direction);
      } else {
        navigateLibrary(direction);
      }

      // Optional: haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  useEffect(() => {
    if (!songId) {
      setSong(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadSong = async () => {
      setError(null);

      const cachedSong = await db.songs.get(songId);
      if (cancelled) return;

      if (cachedSong) {
        setSong(cachedSong);
        setLoading(false);
      } else {
        setLoading(true);
      }

      if (!navigator.onLine) {
        if (!cachedSong) {
          setError('Offline and no cached song is available.');
        }
        return;
      }

      try {
        console.log('🎵 Background fetch song from Supabase...');
        const query = supabase.from('songs').select('*').eq('id', songId);
        const { data, error } = await (isAdminAuthenticated ? query : query.eq('is_active', true)).single();

        if (cancelled) return;

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        if (!data) {
          throw new Error('Song data not found');
        }

        if (!isAdminAuthenticated && data.is_published === false) {
          console.log('🚫 User attempted to access unpublished song');
          if (!cachedSong) {
            throw new Error('This song is not yet published');
          }
          return;
        }

        const songDetail: SongDetail = {
          id: data.id,
          songNumber: data.song_number,
          title: data.title,
          artist: data.artist,
          composer: data.composer,
          language: data.language,
          originalKey: data.original_key,
          capo: data.capo,
          bpm: data.bpm,
          timeSignature: data.time_signature,
          hashtags: [],
          sections: parseLyricsToSections(data.lyrics || ''),
          chords: data.chords || undefined,
          lyrics: data.lyrics || undefined,
          isPublished: data.is_published ?? true,
          is_active: data.is_active ?? true
        };

        await db.songs.put(songDetail);
        if (!cancelled) {
          setSong(songDetail);
          setLoading(false);
        }
      } catch (err) {
        console.warn('⚠️ Failed to fetch song from Supabase, using cache if available:', err);
        if (!cachedSong) {
          setError(err instanceof Error ? err.message : 'Failed to load song');
        }
      } finally {
        if (!cancelled && !cachedSong) {
          setLoading(false);
        }
      }
    };

    void loadSong();

    return () => {
      cancelled = true;
    };
  }, [songId, isAdminAuthenticated]);

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

  const langClass = song.language ? `lang-${song.language.toLowerCase()}` : '';

  return (
    <div className={`flex-col min-h-full w-full bg-[#FAFAFA] flex ${langClass}`}>
      <ReaderHeader
        song={song}
        transpose={displayTranspose}
        mode={readerMode}
        onTransposeUp={() => adjustTranspose(1)}
        onTransposeDown={() => adjustTranspose(-1)}
        onModeChange={setReaderMode}
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
        className="flex-1 flex flex-col overflow-y-auto overscroll-contain"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full px-4 md:px-8 pt-8 pb-40">
          <div className="max-w-4xl mx-auto w-full">
          {isAdminAuthenticated ? (
            (() => {
              console.log('📦 Parent component rendering EditorMode');
              console.log('🎵 Song ID:', song.id);
              console.log('🎵 Song is_active:', song.is_active);
              return (
                <EditorMode 
                  song={{ ...song, sections: displaySections }}
                />
              );
            })()
          ) : readerMode === 'lyrics' ? (
            <div className="text-[20px] leading-relaxed text-slate-800 font-medium">
              {song.lyrics ? (
                song.lyrics.split('\n').map((line, idx) => {
                  const isChorus = line.startsWith('* ');
                  const displayLine = isChorus ? line.slice(2) : line;
                  const isBlank = line.trim() === '';
                  return (
                    <div
                      key={idx}
                      className={isBlank ? 'h-2' : isChorus ? 'mb-1 italic pl-5' : 'mb-1'}
                    >
                      {!isBlank && displayLine}
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-400 italic text-center py-12">No lyrics available</div>
              )}
            </div>
          ) : (
            <DeterministicSongView 
              lyrics={song.lyrics || ''}
              chords={parseChordProToPositions(song.chords || '')}
            />
          )}
        </div>
      </div>
      </div>

      {/* Floating Auto Scroll Control HUD */}
      {readerMode === 'chords' && (
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
              <span className="w-6 text-center font-black text-slate-700">{scrollSpeed}</span>
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
