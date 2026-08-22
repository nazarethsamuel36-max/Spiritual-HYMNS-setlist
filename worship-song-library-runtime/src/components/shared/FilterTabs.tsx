import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWorkflowStore } from '../../store/workflowStore';
import { useShallow } from 'zustand/react/shallow';
import { GENRES, LANGUAGES } from '../../utils/Genres';


export function FilterTabs() {
  const { 
    libraryLanguage, 
    setLibraryLanguage,
    selectedGenres, 
    toggleGenre, 
    clearGenres 
  } = useWorkflowStore(
    useShallow((s) => ({ 
      libraryLanguage: s.libraryLanguage,
      setLibraryLanguage: s.setLibraryLanguage,
      selectedGenres: s.selectedGenres,
      toggleGenre: s.toggleGenre,
      clearGenres: s.clearGenres
    }))
  );

  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const genreButtonRef = useRef<HTMLButtonElement>(null);
  const languageScrollerRef = useRef<HTMLDivElement>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);
  const [genreMenuPosition, setGenreMenuPosition] = useState({ top: 0, left: 0 });
  const [hasMoreLanguages, setHasMoreLanguages] = useState(false);

  const toggleGenreMenu = () => {
    if (!isGenreOpen) {
      const rect = genreButtonRef.current?.getBoundingClientRect();
      if (rect) {
        const menuWidth = 176;
        setGenreMenuPosition({
          top: Math.min(rect.bottom + 8, window.innerHeight - 250),
          left: Math.max(16, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 16)),
        });
      }
    }
    setIsGenreOpen((open) => !open);
  };

  useEffect(() => {
    const updateLanguageOverflow = () => {
      const scroller = languageScrollerRef.current;
      if (!scroller) return;
      setHasMoreLanguages(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1);
    };
    updateLanguageOverflow();
    const scroller = languageScrollerRef.current;
    scroller?.addEventListener('scroll', updateLanguageOverflow, { passive: true });
    window.addEventListener('resize', updateLanguageOverflow);
    return () => {
      scroller?.removeEventListener('scroll', updateLanguageOverflow);
      window.removeEventListener('resize', updateLanguageOverflow);
    };
  }, []);

  return (
    <div ref={filterRowRef} className="relative flex items-center gap-0 min-w-0">
      {/* Language pills — single select */}
      <div ref={languageScrollerRef} className="relative flex space-x-2 overflow-x-auto hide-scrollbar pb-0.5 min-w-0">
        {LANGUAGES.map(lang => (
          <button
            key={`lang-${lang}`}
            onClick={() => setLibraryLanguage(lang)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-bold tracking-tight transition-all duration-150 flex-shrink-0 ${
              libraryLanguage === lang
                ? 'bg-slate-900 text-[var(--color-on-inverse)] shadow-sm'
                : 'bg-slate-500/15 text-slate-500 hover:bg-slate-500/25'
            }`}
          >
            {lang}
          </button>
        ))}

      </div>

      <div className="relative z-20 flex-shrink-0">
        {hasMoreLanguages && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-full z-10 h-8 w-8 bg-gradient-to-r from-transparent to-slate-50" />
        )}
        <button
          ref={genreButtonRef}
          onClick={toggleGenreMenu}
          className="flex h-8 max-w-[130px] items-center gap-1 rounded-lg border border-slate-200 bg-[var(--color-surface)] px-2 text-[11px] font-bold text-slate-700"
        >
          <span>Genre</span>
          <svg className={`h-3 w-3 flex-shrink-0 transition-transform ${isGenreOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isGenreOpen && createPortal(<>
          <div className="fixed inset-0 z-[90]" onClick={() => setIsGenreOpen(false)} />
          <div className="fixed z-[100] max-h-[min(240px,calc(100dvh-5rem))] w-44 overflow-y-auto rounded-lg border border-slate-200 bg-[var(--color-surface)] p-1 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={genreMenuPosition}>
          <button
            onClick={() => { clearGenres(); setIsGenreOpen(false); }}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold ${!selectedGenres.length ? 'bg-slate-900 text-[var(--color-on-inverse)]' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            All
          </button>
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold ${selectedGenres.includes(genre) ? 'bg-slate-900 text-[var(--color-on-inverse)]' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {genre}
              {selectedGenres.includes(genre) && <span>✓</span>}
            </button>
          ))}
          </div>
        </>, document.body)}
      </div>
    </div>
  );
}