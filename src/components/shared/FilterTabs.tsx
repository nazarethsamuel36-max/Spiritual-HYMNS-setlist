import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWorkflowStore } from '../../store/workflowStore';
import { useShallow } from 'zustand/react/shallow';
import { GENRES, LANGUAGES } from '../../utils/Genres';

type FilterTabsProps = {
  selectedLanguage?: string;
  onLanguageChange?: (language: string) => void;
  selectedGenres?: string[];
  onToggleGenre?: (genre: string) => void;
  onClearGenres?: () => void;
};

export function FilterTabs({
  selectedLanguage: controlledLanguage,
  onLanguageChange,
  selectedGenres: controlledGenres,
  onToggleGenre,
  onClearGenres,
}: FilterTabsProps = {}) {
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
  const selectedLanguage = controlledLanguage ?? libraryLanguage;
  const setLanguage = onLanguageChange ?? setLibraryLanguage;
  const genres = controlledGenres ?? selectedGenres;
  const toggleSelectedGenre = onToggleGenre ?? toggleGenre;
  const clearSelectedGenres = onClearGenres ?? clearGenres;

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
        const menuWidth = 196;
        setGenreMenuPosition({
          top: Math.min(rect.bottom + 8, window.innerHeight - 280),
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
    <div ref={filterRowRef} className="relative flex items-center gap-2 min-w-0">
      {/* Language pills — single select */}
      <div
        ref={languageScrollerRef}
        className="relative flex-1 flex space-x-2 overflow-x-auto hide-scrollbar pb-0.5 min-w-0"
        style={hasMoreLanguages ? {
          maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
        } : undefined}
      >
        {LANGUAGES.map(lang => (
          <button
            key={`lang-${lang}`}
            onClick={() => setLanguage(lang)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-bold tracking-tight transition-all duration-150 flex-shrink-0 ${
              selectedLanguage === lang
                ? 'bg-slate-900 text-[var(--color-on-inverse)] shadow-sm'
                : 'bg-slate-500/15 text-slate-500 hover:bg-slate-500/25'
            }`}
          >
            {lang}
          </button>
        ))}

      </div>

      <div className="relative z-20 flex-shrink-0">
        {/* fade overlay removed — mask-image on scroller handles the fade cleanly */}
        <button
          ref={genreButtonRef}
          onClick={toggleGenreMenu}
          className={`flex h-8 max-w-[140px] items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold transition-colors ${
            genres.length > 0
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-[var(--color-surface)] text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Genre</span>
          {genres.length > 0 && (
            <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-white text-[9px] font-extrabold text-slate-900">
              {genres.length}
            </span>
          )}
          <svg className={`h-3 w-3 flex-shrink-0 transition-transform ${isGenreOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isGenreOpen && createPortal(<>
          <div className="fixed inset-0 z-[90]" onClick={() => setIsGenreOpen(false)} />
          <div className="fixed z-[100] max-h-[min(280px,calc(100dvh-5rem))] w-48 overflow-y-auto rounded-lg border border-slate-200 bg-[var(--color-surface)] p-1.5 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={genreMenuPosition}>
            {/* "All" Option — Defaulted to checked when no genres selected */}
            <button
              onClick={() => clearSelectedGenres()}
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-semibold transition-colors ${
                genres.length === 0
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                genres.length === 0
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white'
              }`}>
                {genres.length === 0 && (
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span>All Genres</span>
            </button>

            <div className="my-1 border-t border-slate-100" />

            {/* Individual Genre Options with Checkboxes */}
            {GENRES.map((genre) => {
              const isTicked = genres.includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => toggleSelectedGenre(genre)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                    isTicked
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                    isTicked
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {isTicked && (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{genre}</span>
                </button>
              );
            })}
          </div>
        </>, document.body)}
      </div>
    </div>
  );
}