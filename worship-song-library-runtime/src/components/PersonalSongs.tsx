import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { SongDetail } from '../db/Database';
import { db } from '../db/Database';
import { useWorkflowStore } from '../store/workflowStore';
import { SearchBar } from './shared/SearchBar';
import { LanguageTabs } from './shared/LanguageTabs';
import { SortSelector } from './shared/SortSelector';
import { SongRow } from './shared/SongRow';
import { formatSongTitle } from '../utils/SongFormatter';

const LANGUAGES = ['All', 'English', 'Hindi', 'Marathi', 'Konkani'];

const LANGUAGE_ALIASES: Record<string, string[]> = {
  english: ['english', 'eng', 'en'],
  hindi: ['hindi', 'hin', 'hi'],
  marathi: ['marathi', 'mar', 'mr'],
  konkani: ['konkani', 'kok', 'kn'],
};

function toCanonicalLanguage(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
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

export function PersonalSongs() {
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState<'number' | 'title'>('title');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('Untitled Personal Song');
  const [newSongKey, setNewSongKey] = useState('C');
  const [newSongChords, setNewSongChords] = useState('');
  const [newSongLanguage, setNewSongLanguage] = useState('English');
  const [isAdding, setIsAdding] = useState(false);

  const openSong = useWorkflowStore((s) => s.openSong);
  const reader = useWorkflowStore((s) => s.reader);
  const activeSongId = reader.type === 'song' ? reader.songId : null;

  // Load personal songs from IndexedDB
  const personalSongs = useLiveQuery(() => db.personalSongs.toArray()) || [];

  const handleAddPersonalSong = async () => {
    setIsAdding(true);
    try {
      const newSong: SongDetail = {
        id: Date.now(), // Use timestamp as ID for personal songs
        songNumber: 0, // Personal songs don't have song numbers
        title: newSongTitle,
        language: newSongLanguage.toLowerCase(),
        originalKey: newSongKey,
        chords: newSongChords,
        lyrics: '',
        sections: [],
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      await db.personalSongs.add(newSong);
      setShowAddForm(false);
      setNewSongTitle('Untitled Personal Song');
      setNewSongChords('');
      
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

  // Filter and sort songs
  let visibleSongs = [...personalSongs];
  
  if (selectedLanguage !== 'All') {
    visibleSongs = visibleSongs.filter(song =>
      songMatchesLanguageFilter(song.language, selectedLanguage)
    );
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
    // Sort by song number (personal songs have 0, so they'll be grouped together)
    visibleSongs.sort((a, b) => a.songNumber - b.songNumber);
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
              className="hidden md:block w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>✚</span>
              <span>Add Personal Song</span>
            </button>
            {/* Mobile: FAB button */}
            <button
              onClick={() => setShowAddForm(true)}
              className="md:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full bg-[#FF8C32] hover:bg-[#E67A2B] text-white shadow-lg flex items-center justify-center transition-all active:scale-95 z-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v12M6 12h12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="grid gap-3">
              <label className="text-sm font-medium text-slate-700">
                <div className="mb-1">Title</div>
                <input
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                />
              </label>

              <div className="grid gap-3 grid-cols-2">
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
              </div>

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

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleAddPersonalSong}
                  disabled={isAdding}
                  className="px-4 py-2 bg-amber-500 text-white rounded-md disabled:opacity-50"
                >
                  {isAdding ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded-md"
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
        {/* Language pills */}
        <div className="px-3">
          <LanguageTabs
            languages={LANGUAGES}
            selected={selectedLanguage}
            onSelect={setSelectedLanguage}
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
            <div key={song.id} className="border-l-4 border-[#3B2F2E]">
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
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
