import { useState, useRef, useEffect, useMemo } from 'react';
import type { SongIndex } from '../../db/Database';
import { SearchBar } from './SearchBar';
import { SearchOverlay } from './SearchOverlay';
import { SearchEngine } from '../../utils/SearchEngine';

interface SearchWithOverlayProps {
  songs: SongIndex[];
  selectedLanguage: string;
  onSelectSong: (id: number) => void;
  onSearchActiveChange?: (isActive: boolean) => void;
}

const LANGUAGE_ALIASES: Record<string, string[]> = {
  english: ['english', 'eng', 'en'],
  hindi: ['hindi', 'hin', 'hi'],
  marathi: ['marathi', 'mar', 'mr'],
  konkani: ['konkani', 'kok', 'kn'],
};

function toCanonicalLanguage(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();

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

export function SearchWithOverlay({ songs, selectedLanguage, onSelectSong, onSearchActiveChange }: SearchWithOverlayProps) {
  const [searchResults, setSearchResults] = useState<SongIndex[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // The search is active if the overlay is visible OR if there is an active search query.
  const isSearchActive = isSearchOverlayVisible || searchQuery.trim().length > 0;

  // Notify parent when search state changes
  useEffect(() => {
    onSearchActiveChange?.(isSearchActive);
  }, [isSearchActive, onSearchActiveChange]);

  // Memoize filtered songs to maintain reference stability and prevent infinite render loops
  const filteredSongs = useMemo(() => {
    return songs.filter(song => 
      songMatchesLanguageFilter(song.language, selectedLanguage)
    );
  }, [songs, selectedLanguage]);


  // Sync search results whenever the query OR the filtered songs list (due to language switch) changes
  useEffect(() => {
    if (searchQuery.trim()) {
      try {
        const results = SearchEngine.searchWithLimit(filteredSongs, searchQuery, 25);
        setSearchResults(results);
      } catch (err) {
        // Swallow MiniSearch errors (e.g. special regex chars in query) to prevent app crash
        console.warn('[Search] Search error suppressed:', err);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, filteredSongs]);

  return (
    <>
      <div ref={searchBarRef}>
        <SearchBar
          songs={filteredSongs}
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setIsSearchOverlayVisible(val.trim().length > 0);
          }}
          // The search results are now synced via useEffect above, but we pass this to avoid duplicate triggers
          onSearchResults={() => {}} 
          placeholder="Search songs, numbers, lyrics..."
        />
      </div>

      {isSearchActive && (

        <SearchOverlay
          results={searchResults}
          onSelectSong={onSelectSong}
          onClose={() => {
            // Only allow closing if query is empty
            if (searchQuery.trim().length === 0) {
              setIsSearchOverlayVisible(false);
            }
          }}
          searchBarRef={searchBarRef}
          hasQuery={searchQuery.trim().length > 0}
        />
      )}
    </>
  );
}

