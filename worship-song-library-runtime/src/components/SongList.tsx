import { useEffect, useState, useRef, useMemo } from 'react';
import type { SongIndex } from '../db/Database';
import { db } from '../db/Database';
import { SearchEngine } from '../utils/SearchEngine';
import { useWorkflowStore } from '../store/workflowStore';
import { supabase } from '../lib/supabaseClient';
import { getSongs } from '../services/DataService';
import { LanguageTabs } from './shared/LanguageTabs';
import { SortSelector } from './shared/SortSelector';
import { SongRow } from './shared/SongRow';
import { VisibilitySwitch } from './shared/VisibilitySwitch';
import { formatSongTitle, normalizeImportedText } from '../utils/SongFormatter';

const LANGUAGES = ['All', 'English', 'Hindi', 'Marathi', 'Konkani'];

const LANGUAGE_ALIASES: Record<string, string[]> = {
  english: ['english', 'eng', 'en'],
  hindi: ['hindi', 'hin', 'hi'],
  marathi: ['marathi', 'mar', 'mr'],
  konkani: ['konkani', 'kok', 'kn'],
};

function toCanonicalLanguage(value: string | undefined): string | undefined {
  const normalized = normalizeImportedText(value).toLowerCase();
  if (!normalized) return undefined;

  for (const [canonical, aliases] of Object.entries(LANGUAGE_ALIASES)) {
    if (aliases.includes(normalized)) {
      return canonical;
    }
  }

  return normalized;
}

function songMatchesLanguageFilter(songLanguage: string | undefined, selectedLanguage: string): boolean {
  const filter = toCanonicalLanguage(selectedLanguage);
  if (!filter || filter === 'all') return true;

  const songLang = toCanonicalLanguage(songLanguage);
  return songLang === filter;
}

export function SongList() {
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`[PERF] SongList render #${renderCount.current}`);

  const selectedLanguage = useWorkflowStore((s) => s.libraryLanguage);
  const setSelectedLanguage = useWorkflowStore((s) => s.setLibraryLanguage);
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
  const [newSongKey, setNewSongKey] = useState('C');
  const [newSongChords, setNewSongChords] = useState('');
  const [newSongIsActive, setNewSongIsActive] = useState(false);
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

        // 2. Temporarily removed deferred search indexing to test mobile cold-start click issue
        // setTimeout(() => {
        //   SearchEngine.indexSongs(filteredSongs);
        // }, 500);
        SearchEngine.indexSongs(filteredSongs);
        
        // 3. Build lyrics index from full song details
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
      const keyToUse = opts?.key ?? 'C';
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

  const songs = getVisibleSongs(allSongs, selectedLanguage, sortBy);

  useEffect(() => {
    if (isLoading) return;
    console.log('Songs from Supabase:', allSongs);
    console.log('Filtered songs:', songs);
    console.log('Active language filter:', selectedLanguage);
  }, [allSongs, songs, selectedLanguage, isLoading]);

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
                  <select
                    value={newSongLanguage}
                    onChange={(e) => setNewSongLanguage(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                  >
                    {LANGUAGES.filter((l) => l !== 'All').map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  <div className="mb-1">Title</div>
                  <input
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                  />
                </label>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  <div className="mb-1">Key</div>
                  <select
                    value={newSongKey}
                    onChange={(e) => setNewSongKey(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
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
                        key: newSongKey,
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
          songs={allSongs}
          selectedLanguage={selectedLanguage}
          activeSongId={activeSongId}
          onSelectSong={(id) => {
            openSong(id, 'library');
            closeLibrarySearch();
          }}
        />
      ) : (
        <div className="flex flex-col pb-32" style={{ minHeight: '500px' }}>
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
            {/* Language pills — scrolls with the list */}
            <div className="px-3 pt-3">
              <LanguageTabs
                languages={LANGUAGES}
                selected={selectedLanguage}
                onSelect={setSelectedLanguage}
              />
            </div>
            {/* Sort control — scrolls with the list */}
            <div className="px-4 pt-2.5">
              <SortSelector
                value={sortBy}
                onChange={setSortBy}
              />
            </div>
            <div className="pt-3 pb-2 px-2 text-xs text-slate-400">Showing {songs.length} songs</div>
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
      )}
    </div>
  );
}

function getVisibleSongs(
  allSongs: SongIndex[] | null,
  selectedLanguage: string,
  sortBy: 'number' | 'title'
) {
  if (!allSongs) return [];

  const normalizedLanguage = selectedLanguage?.trim().toLowerCase();
  const shouldFilterByLanguage = normalizedLanguage && normalizedLanguage !== 'all';

  let visibleSongs = [...allSongs];
  if (shouldFilterByLanguage) {
    visibleSongs = visibleSongs.filter((song) =>
      songMatchesLanguageFilter(song.language, selectedLanguage)
    );
  }

  if (sortBy === 'title') {
    visibleSongs.sort(compareSongsByTitle);
  } else {
    visibleSongs.sort((a, b) => a.songNumber - b.songNumber);
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
    const filtered = songs.filter(song => songMatchesLanguageFilter(song.language, selectedLanguage));
    try {
      return SearchEngine.searchWithLimit(filtered, query, 100);
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
