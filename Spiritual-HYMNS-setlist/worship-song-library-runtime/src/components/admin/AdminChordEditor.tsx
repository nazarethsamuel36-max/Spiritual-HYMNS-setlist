import { useState, useRef } from 'react';
import type { EditableSong } from '../../types/AdminEditor';
import { formatChord, getChordSuggestions } from '../../utils/ChordFormatter';

interface AdminChordEditorProps {
  song: EditableSong;
  onSongUpdate: (song: EditableSong) => void;
}

export function AdminChordEditor({ song, onSongUpdate }: AdminChordEditorProps) {
  const [selectedChordId, setSelectedChordId] = useState<string | null>(null);
  const [chordInput, setChordInput] = useState('');
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chordInputRef = useRef<HTMLInputElement>(null);

  const handleWordClick = (lineId: string, wordPosition: number, word: string) => {
    setActiveLineId(lineId);
    setChordInput('');
    setSuggestions([]);
    setSelectedChordId(null);

    // Store which word was clicked for visual feedback
    (window as any).__lastClickedWord = { lineId, wordPosition, word };

    // Small delay to ensure input is focused after render
    setTimeout(() => chordInputRef.current?.focus(), 0);
  };

  const handleChordInputChange = (value: string) => {
    setChordInput(value);
    if (value.length > 0) {
      setSuggestions(getChordSuggestions(value));
    } else {
      setSuggestions([]);
    }
  };

  const addOrUpdateChord = (chordName: string) => {
    const formatted = formatChord(chordName);
    if (!formatted.isValid || !activeLineId) return;

    const updatedSong = JSON.parse(JSON.stringify(song)) as EditableSong;
    
    // Find the line
    for (const section of updatedSong.sections) {
      const line = section.lines.find(l => l.id === activeLineId);
      if (line) {
        // Check if chord already exists at position 0 (simplified for MVP)
        const existingChord = line.chords.find(c => c.position === 0);
        if (existingChord) {
          existingChord.chord = formatted.formatted;
        } else {
          line.chords.push({
            id: `c${Date.now()}`,
            position: 0,
            chord: formatted.formatted,
          });
        }
        break;
      }
    }

    onSongUpdate(updatedSong);
    setChordInput('');
    setSuggestions([]);
    setActiveLineId(null);
  };

  const deleteChord = (lineId: string, chordId: string) => {
    const updatedSong = JSON.parse(JSON.stringify(song)) as EditableSong;
    
    for (const section of updatedSong.sections) {
      const line = section.lines.find(l => l.id === lineId);
      if (line) {
        line.chords = line.chords.filter(c => c.id !== chordId);
        break;
      }
    }

    onSongUpdate(updatedSong);
    setSelectedChordId(null);
  };

  const handleSectionLabelChange = (sectionId: string, newLabel: string) => {
    const updatedSong = JSON.parse(JSON.stringify(song)) as EditableSong;
    const section = updatedSong.sections.find(s => s.id === sectionId);
    if (section) {
      section.label = newLabel;
      onSongUpdate(updatedSong);
    }
  };

  const handleLyricsChange = (lineId: string, newText: string) => {
    const updatedSong = JSON.parse(JSON.stringify(song)) as EditableSong;
    
    for (const section of updatedSong.sections) {
      const line = section.lines.find(l => l.id === lineId);
      if (line) {
        line.text = newText;
        break;
      }
    }

    onSongUpdate(updatedSong);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {song.sections.map((section) => (
            <div key={section.id} className="space-y-2">
              {/* Section Label (Editable) */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={section.label}
                  onChange={(e) => handleSectionLabelChange(section.id, e.target.value)}
                  className="text-xs font-bold uppercase tracking-wider bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-blue-500 text-slate-600 dark:text-slate-400 px-2 py-1"
                />
              </div>

              {/* Lines with Chords */}
              <div className="space-y-3">
                {section.lines.map((line) => (
                  <div key={line.id} className="space-y-1">
                    {/* Chord Layer */}
                    {line.chords.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-sm">
                        {line.chords.map((chord) => (
                          <div
                            key={chord.id}
                            onClick={() => setSelectedChordId(chord.id)}
                            className={`px-2 py-1 rounded font-bold cursor-pointer transition-all ${
                              selectedChordId === chord.id
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 hover:shadow-md'
                            }`}
                          >
                            {chord.chord}
                            {selectedChordId === chord.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChord(line.id, chord.id);
                                }}
                                className="ml-1 hover:opacity-70"
                                title="Delete chord"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lyric Layer - with clickable words */}
                    <div
                      className={`p-3 rounded-lg transition-all cursor-text ${
                        activeLineId === line.id
                          ? 'bg-blue-50 dark:bg-blue-900 ring-2 ring-blue-500'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-150 dark:hover:bg-slate-700'
                      }`}
                    >
                      {/* Editable lyrics field */}
                      <input
                        type="text"
                        value={line.text}
                        onChange={(e) => handleLyricsChange(line.id, e.target.value)}
                        onClick={() => {
                          if (activeLineId !== line.id) {
                            handleWordClick(line.id, 0, '');
                          }
                        }}
                        className="w-full bg-transparent text-base font-serif text-slate-900 dark:text-white focus:outline-none"
                        placeholder="Click to add lyrics..."
                      />

                      {/* Words breakdown for hover interaction */}
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {line.text.split(/\s+/).length} words •{' '}
                        <span className="font-mono">Position: 0</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chord Input Panel */}
      {activeLineId && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Add Chord to This Line
          </label>
          
          <div className="text-xs text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900 px-3 py-2 rounded">
            Type a chord name (e.g., <span className="font-mono font-bold">D</span>, <span className="font-mono font-bold">Dm</span>, <span className="font-mono font-bold">G#</span>, <span className="font-mono font-bold">Bb</span>)
          </div>

          <input
            ref={chordInputRef}
            type="text"
            value={chordInput}
            onChange={(e) => handleChordInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && chordInput) {
                addOrUpdateChord(chordInput);
              }
              if (e.key === 'Escape') {
                setActiveLineId(null);
                setChordInput('');
              }
            }}
            placeholder="Type chord name..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono"
          />

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => addOrUpdateChord(suggestion)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (chordInput) addOrUpdateChord(chordInput);
              }}
              disabled={!chordInput}
              className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>+</span>
              Add Chord
            </button>

            <button
              onClick={() => {
                setActiveLineId(null);
                setChordInput('');
              }}
              className="flex-1 px-3 py-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
