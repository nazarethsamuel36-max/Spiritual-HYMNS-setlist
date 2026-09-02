import { useEffect, useState, useRef, useMemo } from 'react';
import type { SongIndex } from '../db/Database';
import { db } from '../db/Database';
import { SearchEngine } from '../utils/SearchEngine';
import { useWorkflowStore } from '../store/workflowStore';
import { supabase } from '../lib/supabaseClient';
import { getSongs } from '../services/DataService';
import { FilterTabs } from './shared/FilterTabs';
import { LANGUAGES } from '../utils/Genres';
import { SortSelector } from './shared/SortSelector';
import { SongRow } from './shared/SongRow';
import { VisibilitySwitch } from './shared/VisibilitySwitch';
import { formatSongTitle, songMatchesLanguageFilter, getLanguagePriority } from '../utils/SongFormatter';
import { formatKeyDisplay, KEY_ROOT_OPTIONS, type KeyQuality } from '../utils/KeyUtils';

export function SongList() {
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`[PERF] SongList render #${renderCount.current}`);

  const selectedLanguage = useWorkflowStore((s) => s.libraryLanguage);
  const selectedGenres = useWorkflowStore((s) => s.selectedGenres);
  const [sortBy, setSortBy] = useState<'number' | 'title'>('number');
  const [allSongs, setAllSongs] = useState<SongIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAddingNewSong, setIsAddingNewSong] = useState(false);
  const [newSongLanguage, setNewSongLanguage] = useState<string>(
    selectedLanguage && selectedLanguage !== 'All' ? selectedLanguage : 'English'
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('Untitled Draft');
  const [newSongKeyRoot, setNewSongKeyRoot] = useState('C');
  const [newSongKeyQuality, setNewSongKeyQuality] = useState<KeyQuality>('major');
  const [newSongChords, setNewSongChords] = useState('');
  const [newSongIsActive, setNewSongIsActive] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isKeyOpen, setIsKeyOpen] = useState(false);
  const [genreMap, setGenreMap] = useState<Map<number, string[]>>(new Map());
  const openSong = useWorkflowStore((s) => s.openSong);
  const reader = useWorkflowStore((s) => s.reader);
  const isAdminAuthenticated = useWorkflowStore((s) => s.isAdminAuthenticated);
  const librarySearchActive = useWorkflowStore((s) => s.librarySearchActive);
  const librarySearchQuery = useWorkflowStore((s) => s.librarySearchQuery);
  const closeLibrarySearch = useWorkflowStore((s) => s.closeLibrarySearch);

  const activeSongId = reader.type === 'song' ? reader.songId : null;

  useEffect(() => {
    async function loadLibrarySongs() {
      setLoadError(null);
      setIsLoading(true);

      try {
        // This checks db.songIndex first. If empty, falls back to Supabase.
        const songs = await getSongs();

        // Filter by admin authentication status
        const filteredSongs = isAdminAuthenticated
          ? songs
          : songs.filter(song => song.is_active !== false);

        // 1. Render the UI immediately!
        setAllSongs(filteredSongs);

        // 2. Index songs for search (await to ensure index is built before building genre map)
        await SearchEngine.indexSongs(filteredSongs);
        
        // 3. Build genre map directly from SongIndex.genres (already synced from Supabase)
        const newGenreMap = new Map<number, string[]>();
        filteredSongs.forEach(song => {
          if (song.genres && song.genres.length > 0) {
            newGenreMap.set(song.id, song.genres);
          }
        });
        setGenreMap(newGenreMap);
        
        // 4. Build lyrics index from full song details
        const songDetails = await db.songs.toArray();
        await SearchEngine.indexLyrics(songDetails);
        console.log('[SongList] SearchEngine indexed lyrics for', songDetails.length, 'songs');
      } catch (err: any) {
        console.error('Failed to load songs:', err);
        setLoadError(err instanceof Error ? err.message : 'Failed to load songs.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadLibrarySongs();
  }, [isAdminAuthenticated]);

  const handleAddNewSong = async (
    languageArg?: string,
    opts?: { title?: string; key?: string; chords?: string; is_active?: boolean }
  ) => {
    setIsAddingNewSong(true);
    try {
      // Get the next song number for the selected language
      const rawLanguage = languageArg ?? selectedLanguage;
      const languageToUse = rawLanguage === 'All' ? 'english' : (rawLanguage || 'english').toLowerCase();
      console.log('🔍 Searching for max song number in language:', languageToUse);

      const { data: maxData, error: maxError } = await supabase
        .from('songs')
        .select('song_number, language')
        .ilike('language', languageToUse)
        .order('song_number', { ascending: false })
        .limit(1);

      console.log('📊 Supabase returned max data:', maxData);

      if (maxError) {
        console.warn('⚠️ Could not find max song number:', maxError);
      }

      const nextSongNumber = (maxData?.[0]?.song_number || 0) + 1;

      // Create a new draft song in Supabase (use provided form values if present)
      const titleToUse = opts?.title ?? 'Untitled Draft';
      const keyToUse = opts?.key ?? formatKeyDisplay(newSongKeyRoot, newSongKeyQuality);
      const chordsToUse = opts?.chords ?? '';
      const isActiveToUse = opts?.is_active !== false;

      const { data, error } = await supabase
        .from('songs')
        .insert({
          title: titleToUse,
          song_number: nextSongNumber,
          language: languageToUse,
          is_active: isActiveToUse,
          chords: chordsToUse,
          lyrics: '',
          artist: '',
          original_key: keyToUse
        })
        .select()
        .single();

      if (error) {
        alert('❌ Failed to create new song: ' + error.message);
        return;
      }

      if (data) {
        console.log('✅ New draft song created:', data);
        // Add to local state immediately
        const newSong: SongIndex = {
          id: data.id,
          songNumber: data.song_number,
          title: data.title,
          artist: data.artist,
          language: data.language,
          originalKey: data.original_key,
          hashtags: [],
          searchTokens: data.title.toLowerCase(),
        };
        setAllSongs([...allSongs, newSong]);
        // Open the new song in the editor
        openSong(data.id, 'library');
      }
    } catch (err) {
      console.error('❌ Error creating new song:', err);
      alert('Failed to create new song');
    } finally {
      setIsAddingNewSong(false);
    }
  };

  const songs = useMemo(
    () => getVisibleSongs(allSongs, selectedLanguage, selectedGenres, genreMap, sortBy),
    [allSongs, selectedLanguage, selectedGenres, genreMap, sortBy]
  );

  // keep the new-song language selector in sync with the overall filter
  useEffect(() => {
    if (selectedLanguage && selectedLanguage !== 'All') {
      setNewSongLanguage(selectedLanguage);
    }
  }, [selectedLanguage]);

  return (
    <div className="w-full">
      {/* Admin Add New Song Button */}
      {isAdminAuthenticated && (
        <div className="px-3 pt-3">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-4 bg-[var(--color-brand)] hover:opacity-80 text-[var(--color-on-inverse)] font-semibold rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <>
                <span>✚</span>
                <span>Add New Song</span>
              </>
            </button>
          ) : (
            <div className="w-full rounded-lg border border-slate-200 bg-[var(--color-surface)] p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  <div className="mb-1">Language</div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLanguageOpen((open) => !open);
                        setIsKeyOpen(false);
                      }}
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-[var(--color-surface)] px-3 text-left text-sm text-[var(--color-text)] shadow-sm transition-colors focus:border-slate-300"
                    >
                      <span>{newSongLanguage}</span>
                      <span className="text-slate-400">⌄</span>
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

                <label className="text-sm font-medium text-slate-700">
                  <div className="mb-1">Title</div>
                  <input
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none shadow-sm transition-colors focus:border-slate-300"
                  />
                </label>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  <div className="mb-1">Key</div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsKeyOpen((open) => !open);
                        setIsLanguageOpen(false);
                      }}
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-[var(--color-surface)] px-3 text-left text-sm text-[var(--color-text)] shadow-sm transition-colors focus:border-slate-300"
                    >
                      <span>{formatKeyDisplay(newSongKeyRoot, newSongKeyQuality)}</span>
                      <span className="text-slate-400">⌄</span>
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

                <label className="text-sm font-medium text-slate-700">
                  <div className="mb-1">Visibility</div>
                  <div className="flex items-center gap-3">
                    <VisibilitySwitch
                      checked={newSongIsActive}
                      onChange={setNewSongIsActive}
                    />
                    <span className="text-xs text-slate-500">
                      {newSongIsActive ? 'Visible in library' : 'Hidden from library'}
                    </span>
                  </div>
                </label>
              </div>

              <div className="mt-3">
                <label className="text-sm font-medium text-slate-700 block">
                  <div className="mb-1">Chords & Lyrics</div>
                  <textarea
                    value={newSongChords}
                    onChange={(e) => setNewSongChords(e.target.value)}
                    rows={12}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none"
                    placeholder="[C]Verse 1\n[G]Jesus is my friend\n[Am]His love will never end\n[F]He saves my soul"
                  />
                </label>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={async () => {
                      // submit form
                      await handleAddNewSong(newSongLanguage, {
                        title: newSongTitle,
                        key: formatKeyDisplay(newSongKeyRoot, newSongKeyQuality),
                        chords: newSongChords,
                        is_active: newSongIsActive,
                      });
                    }}
                  disabled={isAddingNewSong}
                  className="px-4 py-2 bg-[var(--color-brand)] text-[var(--color-on-inverse)] rounded-md"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search results — shown inline when the header search state is active */}
      {librarySearchActive && librarySearchQuery.trim().length > 0 ? (
        <SearchResults
          query={librarySearchQuery}
          songs={songs}
          selectedLanguage={selectedLanguage}
          activeSongId={activeSongId}
          onSelectSong={(id) => {
            openSong(id, 'library');
            closeLibrarySearch();
          }}
        />
      ) : (
        <div className="flex flex-col" style={{ minHeight: '500px' }}>
          {/* Filter bar — scrolls with the list */}
          <div className="relative z-20 bg-slate-50/98 backdrop-blur-sm border-b border-slate-100 flex-shrink-0">
            <div className="px-3 pt-3">
              <FilterTabs />
            </div>
            {/* Sort control */}
            <div className="px-4 pt-2.5 pb-2">
              <SortSelector
                value={sortBy}
                onChange={setSortBy}
              />
            </div>
          </div>

          {/* Content area */}
          <div className="relative z-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-10 text-center text-slate-400 font-bold text-xs tracking-wide">Loading...</div>
            ) : loadError ? (
              <div className="p-10 text-center text-red-500 font-medium text-sm">{loadError}</div>
            ) : songs.length === 0 ? (
              <div className="p-10 text-center text-slate-500 font-medium text-sm">
                No songs found.
              </div>
            ) : (
              <>
                {songs.map((song: SongIndex) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    onSelect={(id) => openSong(id, 'library')}
                    isActive={song.id === activeSongId}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getVisibleSongs(
  allSongs: SongIndex[] | null,
  selectedLanguage: string,
  selectedGenres: string[],
  genreMap: Map<number, string[]>,
  sortBy: 'number' | 'title'
) {
  if (!allSongs) return [];

  const normalizedLanguage = selectedLanguage?.trim().toLowerCase();
  const shouldFilterByLanguage = normalizedLanguage && normalizedLanguage !== 'all';
  const shouldFilterByGenres = selectedGenres && selectedGenres.length > 0;

  let visibleSongs = [...allSongs];
  
  if (shouldFilterByLanguage) {
    visibleSongs = visibleSongs.filter((song) =>
      songMatchesLanguageFilter(song.language, selectedLanguage)
    );
  }

  if (shouldFilterByGenres) {
    visibleSongs = visibleSongs.filter((song) => {
      const genres = genreMap.get(song.id) || [];
      return genres.some((genre) => selectedGenres.includes(genre));
    });
  }

  if (sortBy === 'title') {
    visibleSongs.sort(compareSongsByTitle);
  } else {
    visibleSongs.sort((a, b) => {
      if (a.songNumber !== b.songNumber) {
        return a.songNumber - b.songNumber;
      }
      return getLanguagePriority(a.language) - getLanguagePriority(b.language);
    });
  }

  return visibleSongs;
}

function compareSongsByTitle(a: SongIndex, b: SongIndex) {
  const titleCompare = formatSongTitle(a.title).localeCompare(formatSongTitle(b.title), 'en', {
    sensitivity: 'base',
    numeric: true
  });
  if (titleCompare !== 0) return titleCompare;
  return a.songNumber - b.songNumber;
}

interface SearchResultsProps {
  query: string;
  songs: SongIndex[];
  selectedLanguage: string;
  activeSongId: number | null;
  onSelectSong: (id: number) => void;
}

function SearchResults({ query, songs, selectedLanguage, activeSongId, onSelectSong }: SearchResultsProps) {
  const results = useMemo(() => {
    // songs is already filtered by language AND genre via getVisibleSongs
    try {
      return SearchEngine.searchWithLimit(songs, query, 100);
    } catch (err) {
      console.warn('[Search] Search error suppressed:', err);
      return [];
    }
  }, [query, songs, selectedLanguage]);

  return (
    <div className="flex flex-col pb-32">
      <div className="px-4 pt-3 pb-2">
        <div className="text-sm font-semibold text-slate-700">Search Results</div>
        <div className="text-xs text-slate-500">
          {results.length} song{results.length === 1 ? '' : 's'} found
          {results.some(r => r.matchType === 'lyrics') && <span className="text-blue-600 ml-1">· searching titles and lyrics</span>}
        </div>
      </div>
      {results.length === 0 ? (
        <div className="p-10 text-center text-slate-400 text-sm">No results found</div>
      ) : (
        results.map((song) => (
          <SongRow
            key={song.id}
            song={song}
            onSelect={onSelectSong}
            isActive={song.id === activeSongId}
          />
        ))
      )}
    </div>
  );
}
