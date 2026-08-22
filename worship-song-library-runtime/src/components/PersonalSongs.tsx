import { useState, useRef } from 'react';
import { ChordPalette } from './reader/ChordPalette';
import { useLiveQuery } from 'dexie-react-hooks';
import type { SongDetail } from '../db/Database';
import { db } from '../db/Database';
import { useWorkflowStore } from '../store/workflowStore';
import { SearchBar } from './shared/SearchBar';
import { LanguageTabs } from './shared/LanguageTabs';
import { SortSelector } from './shared/SortSelector';
import { SongRow } from './shared/SongRow';
import { formatSongTitle, songMatchesLanguageFilter, getLanguagePriority } from '../utils/SongFormatter';
import { generateUUID } from '../utils/uuid';
import { LANGUAGES, GENRES } from '../utils/Genres';

export function PersonalSongs() {
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'number' | 'title'>('title');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('Untitled Personal Song');
  const [newSongKey, setNewSongKey] = useState('C');
  const [newSongChords, setNewSongChords] = useState('');
  const [newSongLanguage, setNewSongLanguage] = useState('English');
  const [newSongGenres, setNewSongGenres] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

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

  // Load personal songs from IndexedDB
  const personalSongs = useLiveQuery(() => db.personalSongs.toArray()) || [];

  const handleAddPersonalSong = async () => {
    setIsAdding(true);
    try {
      const newSong: SongDetail = {
        id: Date.now(), // Use timestamp as ID for personal songs
        uid: generateUUID(),
        songNumber: 0, // Personal songs don't have song numbers
        title: newSongTitle,
        language: newSongLanguage.toLowerCase(),
        originalKey: newSongKey,
        chords: newSongChords,
        lyrics: '',
        sections: [],
        is_active: true,
        updated_at: new Date().toISOString(),
        genres: newSongGenres,
      };

      await db.personalSongs.add(newSong);
      setShowAddForm(false);
      setNewSongTitle('Untitled Personal Song');
      setNewSongChords('');
      setNewSongGenres([]);
      
      // Open the newly created song
      openSong(newSong.id, 'personal');
    } catch (err) {
      console.error('Failed to add personal song:', err);
      alert('Failed to add personal song');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSong = async (id: number) => {
    if (!confirm('Delete this personal song?')) return;
    try {
      await db.personalSongs.delete(id);
    } catch (err) {
      console.error('Failed to delete personal song:', err);
      alert('Failed to delete personal song');
    }
  };

  const [isNewGenreOpen, setIsNewGenreOpen] = useState(false);

  // Filter and sort songs
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
    // Sort by song number and language priority (personal songs have 0, so they'll be grouped together)
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
        {!showAddForm ? (
          <>
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
          </>
        ) : (
          <div className="w-full max-w-full overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-surface)] p-3 sm:p-4">
            <div className="grid gap-3">
              <label className="text-sm font-medium text-slate-700">
                <div className="mb-1">Title</div>
                <input
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300 transition-colors placeholder:text-slate-400 bg-[var(--color-surface)] text-[var(--color-text)]"
                  placeholder="Untitled Song..."
                />
              </label>

              <div className="grid gap-2 grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <label className="text-sm font-medium text-slate-700">
                  <div className="mb-1">Language</div>
                  <select
                    value={newSongLanguage}
                    onChange={(e) => setNewSongLanguage(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text)] outline-none focus:border-slate-300 cursor-pointer transition-colors appearance-none pl-3 pr-8"
                  >
                    {LANGUAGES.filter((l) => l !== 'All').map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  <div className="mb-1">Key</div>
                  <select
                    value={newSongKey}
                    onChange={(e) => setNewSongKey(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text)] outline-none focus:border-slate-300 cursor-pointer transition-colors appearance-none pl-3 pr-8"
                  >
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </label>
              </div>

              <div className="relative text-sm font-medium text-slate-700">
                <div className="mb-1">Genre</div>
                <button type="button" onClick={() => setIsNewGenreOpen((open) => !open)} className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-[var(--color-surface)] px-3 text-left text-sm text-[var(--color-text)]">
                  <span className="truncate">{newSongGenres.length ? newSongGenres.join(', ') : 'Select genres'}</span>
                  <span className="text-slate-400">⌄</span>
                </button>
                {isNewGenreOpen && <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-[var(--color-surface)] p-1 shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                </div>}
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
                  songKey={newSongKey}
                  hasTopBorder={false}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleAddPersonalSong}
                  disabled={isAdding}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-700 text-[var(--color-on-inverse)] rounded-md disabled:opacity-50 font-semibold transition-colors"
                >
                  {isAdding ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search + Filters */}
      <div className="bg-slate-50/98 backdrop-blur-sm pt-2.5 pb-2.5 sticky top-0 z-40 border-b border-slate-100 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
        {/* Language pills & Genre toggle */}
        <div className="px-3 flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 flex-grow">
            <div className="relative min-w-0 flex-grow">
              <LanguageTabs
                languages={LANGUAGES}
                selected={selectedLanguage}
                onSelect={setSelectedLanguage}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 h-8 w-8 bg-gradient-to-r from-transparent to-slate-50" />
            </div>
            {/* Genre Toggle */}
            <button
              onClick={() => setIsGenreOpen(!isGenreOpen)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                isGenreOpen
                  ? 'bg-slate-900 text-[var(--color-on-inverse)] shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="flex items-center gap-1">
                Genres
                <svg className={`w-4 h-4 transition-transform duration-200 ${isGenreOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Expandable genre selection pills */}
        <div className={`max-h-48 overflow-y-auto transition-all duration-200 ease-in-out px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isGenreOpen ? 'opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={clearGenres}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                !selectedGenres.length
                  ? 'bg-slate-900 text-[var(--color-on-inverse)] shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedGenres.includes(genre)
                    ? 'bg-slate-900 text-[var(--color-on-inverse)] shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
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
                }}
                onSelect={(id) => openSong(id, 'personal')}
                isActive={song.id === activeSongId}
                onDelete={() => handleDeleteSong(song.id)}
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
