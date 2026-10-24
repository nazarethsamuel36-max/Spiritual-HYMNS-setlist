import { useState, useRef, useEffect } from 'react';
import { ChordPalette } from './reader/ChordPalette';
import { useLiveQuery } from 'dexie-react-hooks';
import type { SongDetail } from '../db/Database';
import { db } from '../db/Database';
import { useWorkflowStore } from '../store/workflowStore';
import { SearchBar } from './shared/SearchBar';
import { FilterTabs } from './shared/FilterTabs';
import { SortSelector } from './shared/SortSelector';
import { SongRow } from './shared/SongRow';
import { formatSongTitle, songMatchesLanguageFilter, getLanguagePriority } from '../utils/SongFormatter';
import { generateUUID } from '../utils/uuid';
import { LANGUAGES, GENRES } from '../utils/Genres';
import { formatKeyDisplay, KEY_ROOT_OPTIONS, type KeyQuality } from '../utils/KeyUtils';

interface PersonalSongsProps {
  isAddingSong?: boolean;
  onAddingSongChange?: (adding: boolean) => void;
}

export function PersonalSongs({ isAddingSong: controlledAdding, onAddingSongChange }: PersonalSongsProps = {}) {
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'number' | 'title'>('title');

  // Add form state
  const [internalShowAddForm, setInternalShowAddForm] = useState(false);
  const showAddForm = controlledAdding ?? internalShowAddForm;
  const setShowAddForm = onAddingSongChange ?? setInternalShowAddForm;

  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongKeyRoot, setNewSongKeyRoot] = useState('C');
  const [newSongKeyQuality, setNewSongKeyQuality] = useState<KeyQuality>('major');
  const [newSongChords, setNewSongChords] = useState('');
  const [newSongLanguage, setNewSongLanguage] = useState('English');
  const [newSongGenres, setNewSongGenres] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isKeyOpen, setIsKeyOpen] = useState(false);
  const [isNewGenreOpen, setIsNewGenreOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => prev.includes(genre)
      ? prev.filter(g => g !== genre)
      : [...prev, genre]
    );
  };

  const clearGenres = () => {
    setSelectedGenres([]);
  };

  const openSong = useWorkflowStore((s) => s.openSong);
  const reader = useWorkflowStore((s) => s.reader);
  const activeSongId = reader.type === 'song' ? reader.songId : null;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarker = (marker: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = newSongChords.slice(0, start);
    const after = newSongChords.slice(end);
    const newLine = before.endsWith('\n') || before === '' ? '' : '\n';
    const newText = `${before}${newLine}${marker}\n${after}`;
    setNewSongChords(newText);
    setTimeout(() => {
      const pos = start + newLine.length + marker.length + 1;
      ta.setSelectionRange(pos, pos);
      ta.focus();
    }, 0);
  };

  const hasUnsavedChanges = () => {
    return (
      newSongTitle.trim() !== '' ||
      newSongChords.trim() !== '' ||
      newSongGenres.length > 0 ||
      newSongLanguage !== 'English' ||
      newSongKeyRoot !== 'C' ||
      newSongKeyQuality !== 'major'
    );
  };

  const resetForm = () => {
    setNewSongTitle('');
    setNewSongChords('');
    setNewSongGenres([]);
    setNewSongLanguage('English');
    setNewSongKeyRoot('C');
    setNewSongKeyQuality('major');
    setIsLanguageOpen(false);
    setIsKeyOpen(false);
    setIsNewGenreOpen(false);
    setShowConfirmModal(false);
  };

  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setShowConfirmModal(true);
    } else {
      resetForm();
      setShowAddForm(false);
    }
  };

  const handleDiscard = () => {
    resetForm();
    setShowConfirmModal(false);
    setShowAddForm(false);
  };

  // Browser / device back button support
  useEffect(() => {
    if (!showAddForm) return;
    window.history.pushState({ modal: 'add-personal-song' }, '');
    const onPopState = () => {
      if (hasUnsavedChanges()) {
        window.history.pushState({ modal: 'add-personal-song' }, '');
        setShowConfirmModal(true);
      } else {
        resetForm();
        setShowAddForm(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [showAddForm, newSongTitle, newSongChords, newSongGenres, newSongLanguage, newSongKeyRoot, newSongKeyQuality]);

  // Load personal songs from IndexedDB
  const personalSongs = useLiveQuery(() => db.personalSongs.toArray()) || [];

  const handleAddPersonalSong = async () => {
    setIsAdding(true);
    try {
      const newSong: SongDetail = {
        id: Date.now(),
        uid: generateUUID(),
        songNumber: 0,
        title: newSongTitle.trim() || 'Untitled Personal Song',
        language: newSongLanguage.toLowerCase(),
        originalKey: formatKeyDisplay(newSongKeyRoot, newSongKeyQuality),
        chords: newSongChords,
        lyrics: '',
        sections: [],
        is_active: true,
        updated_at: new Date().toISOString(),
        genres: newSongGenres,
      };

      await db.personalSongs.add(newSong);
      resetForm();
      setShowAddForm(false);
      
      // Open the newly created song
      openSong(newSong.id, 'personal');
    } catch (err) {
      console.error('Failed to add personal song:', err);
      alert('Failed to add personal song');
    } finally {
      setIsAdding(false);
    }
  };

  // If in Add Song page mode, render dedicated view
  if (showAddForm) {
    return (
      <div className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-200">
        {/* Dedicated Page Header */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-2 border-b border-transparent">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all active:scale-95"
              aria-label="Back to Personal Songs"
              title="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">New Personal Song</h2>
          </div>
          <button
            type="button"
            onClick={handleAddPersonalSong}
            disabled={isAdding}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-700 text-[var(--color-on-inverse)] rounded-full text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {isAdding ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Dedicated Form Body */}
        <div className="space-y-3 pb-28">
          <label className="text-sm font-medium text-slate-700 block">
            <div className="mb-1">Title</div>
            <input
              value={newSongTitle}
              onChange={(e) => setNewSongTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300 transition-colors placeholder:text-slate-400 bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
              placeholder="Untitled Song..."
              autoFocus
            />
          </label>

          <div className="grid gap-2 grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <label className="text-sm font-medium text-slate-700 block">
              <div className="mb-1">Language</div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsLanguageOpen((open) => !open);
                    setIsKeyOpen(false);
                    setIsNewGenreOpen(false);
                  }}
                  className="flex h-9 w-full items-center justify-between rounded-xl border border-slate-200 bg-[var(--color-surface)] px-3 text-left text-sm text-[var(--color-text)] shadow-sm transition-colors focus:border-slate-300"
                >
                  <span>{newSongLanguage}</span>
                  <svg className={`h-3 w-3 flex-shrink-0 text-slate-400 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isLanguageOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-[var(--color-surface)] p-1 shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {LANGUAGES.filter((l) => l !== 'All').map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setNewSongLanguage(lang);
                          setIsLanguageOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition-all ${
                          newSongLanguage === lang
                            ? 'bg-slate-900 text-[var(--color-on-inverse)] shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {lang}
                        {newSongLanguage === lang && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </label>

            <label className="text-sm font-medium text-slate-700 block">
              <div className="mb-1">Key</div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsKeyOpen((open) => !open);
                    setIsLanguageOpen(false);
                    setIsNewGenreOpen(false);
                  }}
                  className="flex h-9 w-full items-center justify-between rounded-xl border border-slate-200 bg-[var(--color-surface)] px-3 text-left text-sm text-[var(--color-text)] shadow-sm transition-colors focus:border-slate-300"
                >
                  <span>{formatKeyDisplay(newSongKeyRoot, newSongKeyQuality)}</span>
                  <svg className={`h-3 w-3 flex-shrink-0 text-slate-400 transition-transform ${isKeyOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isKeyOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 overflow-hidden rounded-lg border border-slate-200 bg-[var(--color-surface)] shadow-xl">
                    <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Quality</div>
                      <div className="flex gap-2">
                        {(['major', 'minor'] as KeyQuality[]).map((quality) => (
                          <button
                            key={quality}
                            type="button"
                            onClick={() => setNewSongKeyQuality(quality)}
                            className={`flex-1 rounded-md px-2 py-2 text-center text-xs font-bold uppercase tracking-wide transition-all ${
                              newSongKeyQuality === quality
                                ? 'bg-slate-900 text-[var(--color-on-inverse)] shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {quality === 'major' ? 'Major' : 'Minor'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="max-h-44 overflow-y-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {KEY_ROOT_OPTIONS.map((keyOption) => (
                        <button
                          key={keyOption}
                          type="button"
                          onClick={() => {
                            setNewSongKeyRoot(keyOption);
                            setIsKeyOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition-all ${
                            newSongKeyRoot === keyOption
                              ? 'bg-slate-900 text-[var(--color-on-inverse)] shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {keyOption}
                          {newSongKeyRoot === keyOption && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="relative text-sm font-medium text-slate-700">
            <div className="mb-1">Genre</div>
            <button
              type="button"
              onClick={() => {
                setIsNewGenreOpen((open) => !open);
                setIsLanguageOpen(false);
                setIsKeyOpen(false);
              }}
              className="flex h-9 w-full items-center justify-between rounded-xl border border-slate-200 bg-[var(--color-surface)] px-3 text-left text-sm text-[var(--color-text)] shadow-sm transition-colors focus:border-slate-300"
            >
              <span className="truncate">{newSongGenres.length ? newSongGenres.join(', ') : 'Select genres'}</span>
              <svg className={`h-3 w-3 flex-shrink-0 text-slate-400 transition-transform ${isNewGenreOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isNewGenreOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-[var(--color-surface)] p-1 shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setNewSongGenres(prev => prev.includes(genre)
                      ? prev.filter(g => g !== genre)
                      : [...prev, genre]
                    )}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition-all ${
                      newSongGenres.includes(genre)
                        ? 'bg-slate-900 text-[var(--color-on-inverse)] shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {genre}
                    {newSongGenres.includes(genre) && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="text-sm font-medium text-slate-700 block w-full max-w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="font-bold text-slate-700">Chords & Lyrics</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertMarker('[Verse]');
                  }}
                  className="h-9 px-3 text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors flex items-center justify-center"
                >
                  + Verse
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertMarker('[Chorus]');
                  }}
                  className="h-9 px-3 text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors flex items-center justify-center"
                >
                  + Chorus
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={newSongChords}
              onChange={(e) => setNewSongChords(e.target.value)}
              rows={12}
              className="w-full max-w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-slate-300 box-border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-slate-400"
              placeholder="[C]Verse 1\n[G]Jesus is my friend\n[Am]His love will never end\n[F]He saves my soul"
            />
          </label>

          <div className="mt-1.5 w-full max-w-full overflow-hidden border border-slate-200 rounded-xl bg-[var(--color-reader-surface)]">
            <ChordPalette
              textareaRef={textareaRef}
              value={newSongChords}
              onChange={setNewSongChords}
              visible={true}
              songKey={formatKeyDisplay(newSongKeyRoot, newSongKeyQuality)}
              hasTopBorder={false}
            />
          </div>

          {/* Browser storage warning */}
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700">
            <span className="mt-0.5 shrink-0 text-slate-500">⚠️</span>
            <span>
              Your song book is stored in this browser.{' '}
              <strong>Clearing browser data will permanently erase{' '}
                <span className="text-red-600 font-bold">personal songs</span>
              </strong>{' '}
              and your song book. The main song library can be downloaded again, but personal songs cannot be recovered.
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleAddPersonalSong}
              disabled={isAdding}
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-700 text-[var(--color-on-inverse)] rounded-xl disabled:opacity-50 font-bold transition-colors shadow-sm"
            >
              {isAdding ? 'Saving...' : 'Save Song'}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Unsaved Changes Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-[var(--color-surface)] p-5 shadow-2xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Unsaved Changes</h3>
              <p className="mt-1 text-sm text-slate-500">
                You have unsaved changes in your song. Do you want to save or cancel?
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setShowConfirmModal(false);
                    await handleAddPersonalSong();
                  }}
                  disabled={isAdding}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-[var(--color-on-inverse)] font-bold rounded-xl text-sm transition-all"
                >
                  Save Song
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
                >
                  Discard & Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-2 px-4 text-slate-400 hover:text-slate-600 font-medium text-xs transition-colors"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Filter and sort songs for list view
  let visibleSongs = [...personalSongs];
  
  if (selectedLanguage !== 'All') {
    visibleSongs = visibleSongs.filter(song =>
      songMatchesLanguageFilter(song.language, selectedLanguage)
    );
  }

  if (selectedGenres.length > 0) {
    visibleSongs = visibleSongs.filter(song => {
      const genres = song.genres || [];
      return genres.some(g => selectedGenres.includes(g));
    });
  }

  if (search.trim()) {
    const searchLower = search.toLowerCase();
    visibleSongs = visibleSongs.filter(song =>
      song.title.toLowerCase().includes(searchLower) ||
      (song.chords && song.chords.toLowerCase().includes(searchLower))
    );
  }

  if (sortBy === 'title') {
    visibleSongs.sort((a, b) =>
      formatSongTitle(a.title).localeCompare(formatSongTitle(b.title), 'en', {
        sensitivity: 'base',
        numeric: true
      })
    );
  } else {
    visibleSongs.sort((a, b) => {
      if (a.songNumber !== b.songNumber) {
        return a.songNumber - b.songNumber;
      }
      return getLanguagePriority(a.language) - getLanguagePriority(b.language);
    });
  }

  return (
    <div className="w-full">
      {/* Add Personal Song Button */}
      <div className="px-3 pt-3">
        {/* Desktop: Full-width button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="hidden md:block w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-700 text-[var(--color-on-inverse)] font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>✚</span>
          <span>Add Personal Song</span>
        </button>
        {/* Mobile: FAB button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="md:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-700 text-[var(--color-on-inverse)] shadow-lg flex items-center justify-center transition-all active:scale-95 z-50"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v12M6 12h12" />
          </svg>
        </button>
      </div>

      {/* Search + Filters (scrolls naturally with tabs and songs; line is transparent) */}
      <div className="relative z-20 bg-slate-50/98 backdrop-blur-sm pt-2.5 pb-2.5 border-b border-transparent">
        <div className="px-3">
          <FilterTabs
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            selectedGenres={selectedGenres}
            onToggleGenre={toggleGenre}
            onClearGenres={clearGenres}
          />
        </div>
        {/* Search bar */}
        <div className="px-3 mt-2.5">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search personal songs..."
          />
        </div>
        {/* Sort control */}
        <div className="px-4 mt-2">
          <SortSelector
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
      </div>

      {/* Personal Songs List */}
      <div className="flex flex-col pb-32">
        {personalSongs.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-medium text-sm">
            No personal songs yet. Create your first one!
          </div>
        ) : visibleSongs.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-medium text-sm">
            No personal songs match your search.
          </div>
        ) : (
          visibleSongs.map((song) => (
            <div key={song.id}>
              <SongRow
                song={{
                  id: song.id,
                  songNumber: song.songNumber,
                  title: song.title,
                  artist: song.artist,
                  language: song.language,
                  originalKey: song.originalKey,
                  hashtags: song.hashtags,
                  searchTokens: song.title.toLowerCase(),
                  isPersonal: true,
                }}
                onSelect={(id) => openSong(id, 'personal')}
                isActive={song.id === activeSongId}
                hideNumber
                titleOnly
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
