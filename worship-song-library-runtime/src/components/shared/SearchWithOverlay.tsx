import { useState, useRef } from 'react';
import type { SongIndex } from '../../db/Database';
import { SearchBar } from './SearchBar';
import { SearchOverlay } from './SearchOverlay';

interface SearchWithOverlayProps {
  songs: SongIndex[];
  selectedLanguage: string;
  onSelectSong: (id: number) => void;
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

export function SearchWithOverlay({ songs, selectedLanguage, onSelectSong }: SearchWithOverlayProps) {
  const [searchResults, setSearchResults] = useState<SongIndex[]>([]);
  const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`[PERF] SearchWithOverlay render #${renderCount.current}`);

  // Filter songs by selected language for search
  const filteredSongs = songs.filter(song => 
    songMatchesLanguageFilter(song.language, selectedLanguage)
  );

  return (
    <>
      <div ref={searchBarRef}>
        <SearchBar
          songs={filteredSongs}
          onSearchResults={setSearchResults}
          onOverlayVisibilityChange={setIsSearchOverlayVisible}
          placeholder="Search songs, numbers, lyrics..."
        />
      </div>

      {isSearchOverlayVisible && (
        <SearchOverlay
          results={searchResults}
          onSelectSong={onSelectSong}
          onClose={() => setIsSearchOverlayVisible(false)}
          searchBarRef={searchBarRef}
        />
      )}
    </>
  );
}
