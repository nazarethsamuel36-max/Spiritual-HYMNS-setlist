import { useState, useEffect, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/Database';
import { getSongById } from '../services/DataService';
import { useWorkflowStore } from '../store/workflowStore';
import { ReaderHeader } from './reader/ReaderHeader';
import { EditorMode } from './reader/EditorMode';
import { ChordProRenderer } from './reader/ChordProRenderer';

// Parse lyrics helper
function parseLyricsToSections(lyrics: string): Array<{ type: string; label: string; lines: Array<{ text: string }> }> {
  if (!lyrics) return [];
  const sections: Array<{ type: string; label: string; lines: Array<{ text: string }> }> = [];
  const lines = lyrics.split('\n');
  let currentSection: { type: string; label: string; lines: Array<{ text: string }> } | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'verse', label: sectionMatch[1], lines: [] };
    } else if (currentSection) {
      currentSection.lines.push({ text: trimmed });
    } else {
      currentSection = { type: 'verse', label: 'Verse 1', lines: [{ text: trimmed }] };
    }
  }
  if (currentSection) sections.push(currentSection);
  return sections;
}

export function SongView() {
  // 1. Store Connections
  const reader = useWorkflowStore((s) => s.reader);
  const readerMode = useWorkflowStore((s) => s.readerMode);
  const isAdminAuthenticated = useWorkflowStore((s) => s.isAdminAuthenticated);
  const adjustTranspose = useWorkflowStore((s) => s.adjustTranspose);
  const setReaderMode = useWorkflowStore((s) => s.setReaderMode);
  const openSong = useWorkflowStore((s) => s.openSong);
  const openMarker = useWorkflowStore((s) => s.openMarker);
  const openNote = useWorkflowStore((s) => s.openNote);
  const libraryLanguage = useWorkflowStore((s) => s.libraryLanguage);
  const fontSize = useWorkflowStore((s) => s.fontSize);

  const songId = reader.type === 'song' ? reader.songId : null;
  const transpose = reader.type === 'song' ? reader.transpose : 0;
  const setlistId = reader.type === 'song' ? reader.setlistId : undefined;
  const currentItemId = reader.type === 'song' ? reader.itemId : undefined;
  const source = reader.type === 'song' ? reader.source : 'library';
  const isSetlistContext = reader.type === 'song' && reader.source === 'setlist' && !!setlistId;

  // 2. Core State
  const [song, setSong] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 3. Auto-scroll & Swipe State
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Smooth slide direction tracking
  const [prevActiveIdx, setPrevActiveIdx] = useState<number | null>(null);
  const [slideDir, setSlideDir] = useState<'next' | 'prev' | null>(null);

  // 🔥 SAFE LOCAL DATA: Read from Dexie based on active context
  const activeNavigationList = useLiveQuery(async () => {
    if (isSetlistContext) return null;

    if (source === 'personal') {
      const pSongs = await db.personalSongs.toArray();
      // Sort personal songs alphabetically by title
      return pSongs.sort((a, b) =>
        a.title.localeCompare(b.title, 'en', { sensitivity: 'base', numeric: true })
      );
    }

    if (source === 'shared') {
      const sSongs = await db.sharedSongs.toArray();
      // Sort shared songs alphabetically by title
      return sSongs.sort((a, b) =>
        a.title.localeCompare(b.title, 'en', { sensitivity: 'base', numeric: true })
      );
    }

    // Default: 'library' mode
    const songs = await db.songIndex.toArray();
    let filtered = songs;
    if (libraryLanguage !== 'All') {
       filtered = songs.filter(s => s.language?.toLowerCase() === libraryLanguage.toLowerCase());
    }
    return filtered.sort((a, b) => a.songNumber - b.songNumber);
  }, [isSetlistContext, libraryLanguage, source]);

  const setlistItems = useLiveQuery(async () => {
    if (!isSetlistContext || !setlistId) return null;
    const local = await db.setlists.get(setlistId);
    const setlist = local || await db.sharedSetlists.get(setlistId);
    if (!setlist) return null;
    return [...setlist.songs].sort((a, b) => a.order - b.order);
  }, [isSetlistContext, setlistId]);

  // Dynamic slide direction calculation based on indices
  // (must be run before early returns)
  const totalItems = isSetlistContext ? (setlistItems?.length || 0) : (activeNavigationList?.length || 0);
  const activeIdx = isSetlistContext
    ? (currentItemId ? setlistItems?.findIndex(i => i.id === currentItemId) : setlistItems?.findIndex(i => i.songId === songId))
    : (activeNavigationList ? activeNavigationList.findIndex((s: any) => s.id === songId) : -1);

  useEffect(() => {
    if (activeIdx !== undefined && activeIdx !== -1) {
      if (prevActiveIdx !== null && prevActiveIdx !== activeIdx) {
        setSlideDir(activeIdx > prevActiveIdx ? 'next' : 'prev');
      }
      setPrevActiveIdx(activeIdx);
    }
  }, [activeIdx, prevActiveIdx]);

  // 4. The Bulletproof Fetch Logic
  useEffect(() => {
    if (!songId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const fetchSong = async () => {
      try {
        let song;

        if (source === 'personal') {
          // Fetch from personalSongs table in IndexedDB
          song = await db.personalSongs.get(songId);
        } else {
          // This checks db.songs first. If empty, falls back to Supabase.
          song = await getSongById(songId);
        }

        if (!song) {
          throw new Error('Song not found');
        }

        const songDetail = {
          ...song,
          sections: parseLyricsToSections(song.lyrics || ''),
          chords: song.chords || '',
          lyrics: song.lyrics || ''
        };
        console.log(`[SongView] Song #${songDetail.id} loaded — chords.length=${songDetail.chords.length} lyrics.length=${songDetail.lyrics.length} sections=${songDetail.sections.length}`);
        setSong(songDetail);
      } catch (err: any) {
        setError(err.message || 'Failed to load song');
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [songId]);

  // 6. Swipe Navigation Logic
  const navigateSetlist = useCallback((direction: 'prev' | 'next') => {
    if (!setlistItems || !setlistId) return;
    const currentIdx = currentItemId ? setlistItems.findIndex(i => i.id === currentItemId) : setlistItems.findIndex(i => i.songId === songId);
    const targetIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (targetIdx < 0 || targetIdx >= setlistItems.length) return;
    const target = setlistItems[targetIdx];
    if (!target.type || target.type === 'song') openSong(target.songId!, 'setlist', target.transpose ?? 0, setlistId, target.id);
    else if (target.type === 'marker') openMarker(target.label || 'Marker', setlistId, target.id);
    else if (target.type === 'note') openNote(target.label || 'Note', target.content || '', setlistId, target.id);
  }, [setlistItems, setlistId, currentItemId, songId, openSong, openMarker, openNote]);

  const navigateLibrary = useCallback((direction: 'prev' | 'next') => {
    if (!songId || !activeNavigationList || activeNavigationList.length === 0) return;
    const currentIdx = activeNavigationList.findIndex((s: any) => s.id === songId);
    if (currentIdx === -1) return;
    const targetIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (targetIdx >= 0 && targetIdx < activeNavigationList.length) {
      if (navigator.vibrate) navigator.vibrate(10);
      openSong(activeNavigationList[targetIdx].id, source);
    }
  }, [songId, activeNavigationList, openSong, source]);

  // Swipe navigation — document-level so it works regardless of
  // loading state or DOM mount order. Refs ensure callbacks are always fresh.
  const navigateSetlistRef = useRef(navigateSetlist);
  const navigateLibraryRef = useRef(navigateLibrary);
  const isSetlistContextRef = useRef(isSetlistContext);
  useEffect(() => { navigateSetlistRef.current = navigateSetlist; }, [navigateSetlist]);
  useEffect(() => { navigateLibraryRef.current = navigateLibrary; }, [navigateLibrary]);
  useEffect(() => { isSetlistContextRef.current = isSetlistContext; }, [isSetlistContext]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const dt = Date.now() - startTime;

      // Horizontal swipe: dx must dominate dy by 1.5x, travel ≥40px, within 600ms
      if (
        Math.abs(dx) >= 40 &&
        Math.abs(dx) > Math.abs(dy) * 1.5 &&
        dt < 600
      ) {
        const direction = dx < 0 ? 'next' : 'prev';
        if (isSetlistContextRef.current) {
          navigateSetlistRef.current(direction);
        } else {
          navigateLibraryRef.current(direction);
        }
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  // Empty deps: document always exists, callbacks kept fresh via refs above
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // 7. Render
  if (loading) return (
    <div className="p-12 text-center flex flex-col items-center">
      <div className="animate-spin h-8 w-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full mb-4"></div>
      <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Loading...</div>
    </div>
  );

  if (error || !song) return (
    <div className="p-12 text-center text-red-500 font-bold text-sm">{error || 'Song not found'}</div>
  );

  const displayTranspose = transpose + (song.capo || 0);
  const langClass = song.language ? `lang-${song.language.toLowerCase()}` : '';

  // --- Content resolution: chords → lyrics → sections reconstruction ---
  // On laptops without a local cache, Supabase may return chords/lyrics as null.
  // sections[] is always parsed from lyrics, but if lyrics is also null the array
  // is empty. We try each source in order so the reader is never blank.
  const rawContent: string = (() => {
    if (song.chords) return song.chords;          // full ChordPro with chord markers
    if (song.lyrics) return song.lyrics;          // plain lyrics text
    if (song.sections?.length) {                  // reconstruct from parsed sections
      return song.sections
        .map((s: any) => `[${s.label}]\n` + s.lines.map((l: any) => l.text).join('\n'))
        .join('\n\n');
    }
    return '';                                    // genuinely empty — show nudge below
  })();

  const hasContent = rawContent.trim().length > 0;

  // Page Dots Calculation
  const maxDots = 7;
  let startDot = 0, endDot = totalItems;
  if (totalItems > maxDots) {
    const half = Math.floor(maxDots / 2);
    startDot = Math.max(0, (activeIdx || 0) - half);
    endDot = Math.min(totalItems, startDot + maxDots);
    if (endDot === totalItems) startDot = Math.max(0, totalItems - maxDots);
  }
  const visibleDots = Array.from({ length: endDot - startDot }, (_, i) => startDot + i);

  return (
    <div className={`relative flex h-full w-full flex-col bg-[#FAFAFA] ${langClass}`}>
      <ReaderHeader
        song={song} transpose={displayTranspose} mode={readerMode}
        onTransposeUp={() => adjustTranspose(1)} onTransposeDown={() => adjustTranspose(-1)} onModeChange={setReaderMode}
      />

      {/* Page Indicator Dots */}
      {totalItems > 1 && activeIdx !== undefined && activeIdx !== -1 && (
        <div className="flex items-center justify-center space-x-1.5 py-2 bg-white border-b border-slate-100">
          {visibleDots.map((idx) => (
            <div key={idx} className={`rounded-full transition-all duration-200 ${idx === activeIdx ? 'w-4 h-1.5 bg-[var(--color-brand)]' : 'w-1.5 h-1.5 bg-slate-200'}`} />
          ))}
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ touchAction: 'pan-y' }}
      >
        <div className="w-full px-4 md:px-8 pt-8 pb-40 overflow-x-hidden">
          <div 
            key={songId || currentItemId || 'empty'}
            className={`max-w-4xl mx-auto w-full reader-anim-container ${
              slideDir === 'next' ? 'animate-slide-next' : slideDir === 'prev' ? 'animate-slide-prev' : ''
            }`}
          >
            {isAdminAuthenticated ? (
              <EditorMode song={{ ...song, sections: song.sections }} source={source} />
            ) : hasContent ? (
              <ChordProRenderer
                rawChordPro={rawContent}
                hideChords={readerMode === 'lyrics'}
                fontSize={fontSize}
              />
            ) : (
              /* No content available fallback */
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-4">
                <div className="text-4xl">📄</div>
                {navigator.onLine ? (
                  <>
                    <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed">
                      Song content is blank in the database.
                    </p>
                    <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                      This song does not have any chords or lyrics set on the server yet.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed">
                      Song content not available offline.
                    </p>
                    <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                      Connect to the internet and download the library to access all songs offline.
                    </p>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-download-library'))}
                      className="mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-slate-700 transition-colors"
                    >
                      Download Library
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
