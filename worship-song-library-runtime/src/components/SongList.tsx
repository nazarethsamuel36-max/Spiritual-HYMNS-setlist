import { useEffect, useState } from 'react';
import type { SongIndex } from '../db/Database';
import { SearchEngine } from '../utils/SearchEngine';
import { useWorkflowStore } from '../store/workflowStore';
// import { getSongList } from '../services/CacheService'; // TEMPORARILY DISABLED FOR DEBUGGING
import { supabase } from '../lib/supabaseClient';
import { SearchBar } from './shared/SearchBar';
import { LanguageTabs } from './shared/LanguageTabs';
import { SortSelector } from './shared/SortSelector';
import { SongRow } from './shared/SongRow';
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
  const [search, setSearch] = useState('');
  const selectedLanguage = useWorkflowStore((s) => s.libraryLanguage);
  const setSelectedLanguage = useWorkflowStore((s) => s.setLibraryLanguage);
  const [sortBy, setSortBy] = useState<'number' | 'title'>('number');
  const [allSongs, setAllSongs] = useState<SongIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const openSong = useWorkflowStore((s) => s.openSong);
  const reader = useWorkflowStore((s) => s.reader);

  const activeSongId = reader.type === 'song' ? reader.songId : null;

  useEffect(() => {
    let cancelled = false;

    async function loadSongs() {
      setIsLoading(true);
      setLoadError(null);

      try {
        console.log('Loading songs DIRECTLY from Supabase (cache disabled)...');
        // TEMPORARY: Direct Supabase fetch to bypass IndexedDB cache
        const { data, error } = await supabase
          .from('songs')
          .select('*') // Include all columns including lyrics
          .eq('is_active', true)
          .order('song_number', { ascending: true });

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        if (!data) {
          throw new Error('No data returned from Supabase');
        }

        // Transform to SongIndex format
        const songs = data.map((song: any) => ({
          id: song.id,
          songNumber: song.song_number,
          title: song.title,
          artist: song.artist,
          language: song.language,
          originalKey: song.original_key,
          hashtags: [],
          searchTokens: `${song.title} ${song.artist || ''} ${song.language || ''}`.toLowerCase(),
          romanTitle: song.title
        }));

        if (cancelled) return;

        console.log('Songs loaded from Supabase:', songs.length);
        console.log('Unique languages:', [...new Set(songs.map((song) => song.language ?? '(missing)'))]);
        console.log('Sample song data:', songs[0]);
        setAllSongs(songs);
        await SearchEngine.indexSongs(songs);
      } catch (err) {
        if (cancelled) return;
        console.error('Unexpected error loading songs:', err);
        setLoadError(err instanceof Error ? err.message : 'Failed to load songs.');
        setAllSongs([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSongs();

    return () => {
      cancelled = true;
    };
  }, []);

  const songs = getVisibleSongs(allSongs, selectedLanguage, search, sortBy);

  useEffect(() => {
    if (isLoading) return;
    console.log('Songs from Supabase:', allSongs);
    console.log('Filtered songs:', songs);
    console.log('Active language filter:', selectedLanguage);
  }, [allSongs, songs, selectedLanguage, isLoading]);

  return (
    <div className="w-full">
      {/* Search + Filters — sticky header */}
      <div className="bg-slate-50/98 backdrop-blur-sm pt-2.5 pb-2.5 sticky top-0 z-40 border-b border-slate-100 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
        {/* Language pills */}
        <div className="px-3">
          <LanguageTabs
            languages={LANGUAGES}
            selected={selectedLanguage}
            onSelect={setSelectedLanguage}
          />
        </div>
        {/* Search bar — prominent */}
        <div className="px-3 mt-2.5">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search songs, numbers, lyrics..."
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

      {/* Song List */}
      <div className="flex flex-col pb-32">
        {isLoading ? (
          <div className="p-10 text-center text-slate-400 font-bold text-xs tracking-wide">Loading...</div>
        ) : loadError ? (
          <div className="p-10 text-center text-red-500 font-medium text-sm">{loadError}</div>
        ) : songs.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-medium text-sm">
            No songs found.
          </div>
        ) : (
          songs.map((song: SongIndex) => (
            <SongRow
              key={song.id}
              song={song}
              onSelect={(id) => openSong(id, 'library')}
              isActive={song.id === activeSongId}
            />
          ))
        )}
      </div>
    </div>
  );
}

function getVisibleSongs(
  allSongs: SongIndex[] | null,
  selectedLanguage: string,
  search: string,
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

  if (search.trim()) {
    const searched = SearchEngine.search(visibleSongs, search);
    searched.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (Math.abs(scoreDiff) > 0.0001) {
        return scoreDiff;
      }
      if (sortBy === 'title') {
        return compareSongsByTitle(a, b);
      }
      return a.songNumber - b.songNumber;
    });
    return searched;
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
