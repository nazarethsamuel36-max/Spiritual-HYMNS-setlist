import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/Database';
import type { SongIndex } from '../db/Database';
import { SearchEngine } from '../utils/SearchEngine';
import { useWorkflowStore } from '../store/workflowStore';
import { SearchBar } from './shared/SearchBar';
import { LanguageTabs } from './shared/LanguageTabs';
import { SongRow } from './shared/SongRow';

const LANGUAGES = ['All', 'English', 'Hindi', 'Marathi'];

export function SongList() {
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const openSong = useWorkflowStore((s) => s.openSong);
  const reader = useWorkflowStore((s) => s.reader);

  const activeSongId = reader.type === 'song' ? reader.songId : null;

  const songs = useLiveQuery(async () => {
    let allSongs = await db.songIndex.orderBy('songNumber').toArray();

    if (selectedLanguage !== 'All') {
      allSongs = allSongs.filter(s => s.language?.toLowerCase() === selectedLanguage.toLowerCase());
    }

    if (!search.trim()) {
      return allSongs;
    }

    return SearchEngine.search(allSongs, search);
  }, [search, selectedLanguage]);

  return (
    <div className="w-full">
      {/* Search + Filters */}
      <div className="bg-slate-50 pb-2 pt-0 sticky top-0 z-40 transition-all border-b border-slate-200/60 shadow-sm relative -mt-2 mb-0 px-1">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search songs, numbers, lyrics..."
        />
        <LanguageTabs
          languages={LANGUAGES}
          selected={selectedLanguage}
          onSelect={setSelectedLanguage}
        />
      </div>

      {/* Song List */}
      <div className="flex flex-col pb-32">
        {!songs ? (
          <div className="p-10 text-center text-slate-400 font-bold text-xs tracking-wide">Loading...</div>
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
