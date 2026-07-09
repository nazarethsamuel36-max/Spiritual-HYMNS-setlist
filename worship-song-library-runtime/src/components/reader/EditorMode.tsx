import { useEffect, useMemo, useRef, useState } from 'react';
import type { SongDetail } from '../../db/Database';
import { supabase } from '../../lib/supabaseClient';
import { db } from '../../db/Database';
import { ChordPalette } from './ChordPalette';

interface HistoryState {
  chords: string;
  cursorPosition?: number;
}

console.log('📍 EDITORMODE FILE LOADED');

// ============================================
// KEY CORRECTOR: Admin tool to fix mismatched metadata keys
// ============================================
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatToSharp: Record<string, string> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
};

// Calculate how many semitones to shift chords
function calculateSemitoneShift(source: string, target: string): number {
  const s = flatToSharp[source] || source;
  const t = flatToSharp[target] || target;

  const sourceIndex = NOTES.indexOf(s);
  const targetIndex = NOTES.indexOf(t);
  if (sourceIndex === -1 || targetIndex === -1) return 0;

  let shift = targetIndex - sourceIndex;
  if (shift < 0) shift += 12;
  return shift;
}

// Shift chords in text by semitones (ONLY affects chords, NOT metadata)
function shiftChordsInText(text: string, shift: number): string {
  if (shift === 0) return text;
  // Regex to find chords in brackets like [Cmaj7] or [F#m]
  return text.replace(/\[([A-G][b#]?)([^\]]*)\]/g, (match, root, suffix) => {
    const normalizedRoot = flatToSharp[root] || root;
    const currentIndex = NOTES.indexOf(normalizedRoot);
    if (currentIndex === -1) return match;

    const newIndex = (currentIndex + shift) % 12;
    return `[${NOTES[newIndex]}${suffix}]`;
  });
}

interface EditorModeProps {
  song: SongDetail;
  songKey?: string;
  source?: 'library' | 'setlist' | 'shared' | 'personal';
}

interface PreviewChordLineProps {
  line: string;
  changedSegments?: Array<{ text: string; isChanged: boolean }>;
}

function PreviewChordLine({ line, changedSegments }: PreviewChordLineProps) {
  const parts = line.split(/(\[[^\]]+\])/);
  const segments: Array<{ chord: string | null; text: string }> = [];
  let currentChord: string | null = null;

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('[') && part.endsWith(']')) {
      currentChord = part.slice(1, -1);
      continue;
    }

    if (part.trim()) {
      segments.push({ chord: currentChord, text: part });
      currentChord = null;
    }
  }

  // If we have changed segments, use those for highlighting; otherwise use regular segments
  if (changedSegments && changedSegments.length > 0) {
    return (
      <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {changedSegments.map((segment, index) => (
          <span
            key={`${segment.text}-${index}`}
            className={segment.isChanged ? 'bg-yellow-200 text-black rounded px-0.5' : ''}
          >
            {segment.text}
          </span>
        ))}
      </div>
    );
  }

  // Original rendering (no highlighting)
  return (
    <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
      {segments.map((segment, index) => (
        <span key={`${segment.text}-${index}`} className="inline-block mr-1 align-top">
          {segment.chord && (
            <span className="block text-[10px] font-bold uppercase tracking-wide text-blue-600">
              {segment.chord}
            </span>
          )}
          <span>{segment.text}</span>
        </span>
      ))}
    </div>
  );
}

export function EditorMode({ song, songKey = 'D', source = 'library' }: EditorModeProps) {
  const [title, setTitle] = useState(song.title || '');
  const [language, setLanguage] = useState(song.language || 'English');
  const [keyValue, setKeyValue] = useState(song.originalKey || songKey || 'C');
  const [songNumber, setSongNumber] = useState(song.songNumber || 0);
  const [chordsText, setChordsText] = useState(song.chords || '');
  const [currentTextKey, setCurrentTextKey] = useState<string>(song.originalKey || songKey || 'C');
  const [correctorTargetKey, setCorrectorTargetKey] = useState<string>('C');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [isCorrectorExpanded, setIsCorrectorExpanded] = useState(false);

  // Undo/Redo history
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRef = useRef(false);

  const addToHistory = (newChords: string) => {
    if (isUndoRef.current) {
      isUndoRef.current = false;
      return;
    }

    const textarea = textareaRef.current;
    const cursorPosition = textarea?.selectionStart;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ chords: newChords, cursorPosition });

    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRef.current = true;
      const prevState = history[historyIndex - 1];
      setChordsText(prevState.chords);
      setHistoryIndex(historyIndex - 1);
      debouncedAutoSave({ chords: prevState.chords });

      // Restore cursor position if available
      if (prevState.cursorPosition !== undefined && textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.setSelectionRange(prevState.cursorPosition ?? null, prevState.cursorPosition ?? null);
        }, 0);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    }
  };

  const insertMarker = (marker: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = chordsText;

    const before = text.substring(0, start);
    const after = text.substring(end);

    let markerToInsert = marker;
    if (start > 0 && !before.endsWith('\n')) {
      markerToInsert = '\n' + markerToInsert;
    }
    if (!after.startsWith('\n')) {
      markerToInsert = markerToInsert + '\n';
    }

    const newText = before + markerToInsert + after;
    setChordsText(newText);
    addToHistory(newText);
    debouncedAutoSave({ chords: newText });

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + markerToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleTextareaDoubleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const pos = textarea.selectionStart;
    const text = textarea.value;
    
    // Matches any bracketed ChordPro tag, e.g. [G], [Am7/E], [Verse], [Chorus]
    const regex = /\[([^\]]+)\]/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = regex.lastIndex;
      if (pos >= start && pos <= end) {
        let newText = text.substring(0, start) + text.substring(end);
        
        setChordsText(newText);
        debouncedAutoSave({ chords: newText });
        
        e.preventDefault();
        break;
      }
    }
  };

  useEffect(() => {
    console.log('📝 Loading new song into editor:', song.id);
    setTitle(song.title || '');
    setLanguage(song.language || 'English');
    setKeyValue(song.originalKey || songKey || 'C');
    setCurrentTextKey(song.originalKey || songKey || 'C');
    setSongNumber(song.songNumber || 0);
    setChordsText(song.chords || '');

    if (saveTimeoutRef.current) {
      console.log('🛑 Cancelling pending auto-save for song:', song.id);
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, [song.id, song.title, song.language, song.originalKey, song.songNumber, song.chords, songKey]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    console.log('📝 Editor form changed:', {
      title,
      language,
      keyValue,
      songNumber,
      chordsLength: chordsText.length,
    });
  }, [title, language, keyValue, songNumber, chordsText]);

  const performSave = async (currentSongId: number, updates: { title?: string; language?: string; original_key?: string; chords?: string }) => {
    try {
      console.log(`💾 Auto-saving song ${currentSongId}:`, updates);

      if (source === 'personal') {
        // Save to IndexedDB for personal songs
        const existingSong = await db.personalSongs.get(currentSongId);
        if (existingSong) {
          await db.personalSongs.update(currentSongId, {
            ...updates,
            originalKey: updates.original_key,
            updated_at: new Date().toISOString()
          });
          console.log(`✅ Auto-save successful for personal song ${currentSongId}`);
        }
      } else {
        // Save to Supabase for library songs
        const { error } = await supabase
          .from('songs')
          .update(updates)
          .eq('id', currentSongId);

        if (error) {
          console.error('❌ Auto-save failed:', error);
          alert('Failed to save changes: ' + error.message);
          return;
        }

        console.log(`✅ Auto-save successful for song ${currentSongId}`);
      }
    } catch (err) {
      console.error('❌ Auto-save exception:', err);
      alert('Failed to save changes');
    }
  };

  const debouncedAutoSave = (updates: { title?: string; language?: string; original_key?: string; chords?: string }) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      void performSave(song.id, updates);
      saveTimeoutRef.current = null;
    }, 1500);
  };

  const previewLines = useMemo(() => chordsText.split('\n').filter((line) => line.length > 0), [chordsText]);

  // FEATURE 2: Calculate diffs for each line
  const previewLinesWithDiffs = useMemo(() => previewLines.map((line) => ({ line, changedSegments: undefined })), [previewLines]);

  console.log('🔍 EditorMode RENDERING');

  return (
    <div className="w-full flex flex-col bg-white min-h-0">
      <div className="w-full px-4 md:px-6 py-4 space-y-4 bg-slate-50">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {/* ROW 1: Title & Key */}
          <div className="flex gap-3 h-12 mb-4">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                debouncedAutoSave({ title: e.target.value });
              }}
              className="flex-1 h-full px-4 rounded-lg border border-slate-300 bg-white text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden text-ellipsis whitespace-nowrap"
              placeholder="Song Title..."
            />

            <select
              value={keyValue}
              onChange={(e) => {
                const newKey = e.target.value;
                const shift = calculateSemitoneShift(currentTextKey, newKey);
                const corrected = shiftChordsInText(chordsText, shift);
                setKeyValue(newKey);
                setChordsText(corrected);
                setCurrentTextKey(newKey);
                debouncedAutoSave({ original_key: newKey, chords: corrected });
              }}
              className="w-12 h-12 px-0 rounded-lg border border-slate-300 bg-white text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
            >
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="G">G</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>

          {/* ROW 2: Key Corrector - Desktop Inline Layout */}
          <div className="hidden md:flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Key Corrector:</span>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Current</label>
              <select
                value={currentTextKey}
                onChange={(e) => setCurrentTextKey(e.target.value)}
                className="w-12 h-12 px-0 rounded-lg border border-slate-300 text-base font-bold text-center bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
              >
                <option value="C">C</option>
                <option value="C#">C#</option>
                <option value="D">D</option>
                <option value="D#">D#</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="F#">F#</option>
                <option value="G">G</option>
                <option value="G#">G#</option>
                <option value="A">A</option>
                <option value="A#">A#</option>
                <option value="B">B</option>
              </select>
            </div>

            <span className="text-slate-400 font-bold">→</span>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Shift To</label>
              <select
                value={correctorTargetKey}
                onChange={(e) => {
                  const newTarget = e.target.value;
                  const shift = calculateSemitoneShift(currentTextKey, newTarget);
                  const corrected = shiftChordsInText(chordsText, shift);
                  setCorrectorTargetKey(newTarget);
                  setChordsText(corrected);
                  setCurrentTextKey(newTarget);
                  debouncedAutoSave({ chords: corrected });
                }}
                className="w-12 h-12 px-0 rounded-lg border border-slate-300 text-base font-bold text-center bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
              >
                <option value="C">C</option>
                <option value="C#">C#</option>
                <option value="D">D</option>
                <option value="D#">D#</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="F#">F#</option>
                <option value="G">G</option>
                <option value="G#">G#</option>
                <option value="A">A</option>
                <option value="A#">A#</option>
                <option value="B">B</option>
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => insertMarker('[Verse]')}
                className="h-12 px-3 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors flex-shrink-0"
              >
                + [Verse]
              </button>
              <button
                type="button"
                onClick={() => insertMarker('[Chorus]')}
                className="h-12 px-3 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors flex-shrink-0"
              >
                + [Chorus]
              </button>
            </div>
          </div>

          {/* ROW 2: Key Corrector - Mobile Collapsed Layout */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setIsCorrectorExpanded(!isCorrectorExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 uppercase tracking-wide hover:bg-slate-100 transition-colors"
            >
              <span>Correcting Tools</span>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${isCorrectorExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isCorrectorExpanded && (
              <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                {/* Row 1: Key Corrector */}
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Current</label>
                  <select
                    value={currentTextKey}
                    onChange={(e) => setCurrentTextKey(e.target.value)}
                    className="flex-1 h-10 px-2 rounded-lg border border-slate-300 text-sm font-bold text-center bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="C">C</option>
                    <option value="C#">C#</option>
                    <option value="D">D</option>
                    <option value="D#">D#</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="F#">F#</option>
                    <option value="G">G</option>
                    <option value="G#">G#</option>
                    <option value="A">A</option>
                    <option value="A#">A#</option>
                    <option value="B">B</option>
                  </select>
                  <span className="text-slate-400 font-bold">→</span>
                  <label className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Shift To</label>
                  <select
                    value={correctorTargetKey}
                    onChange={(e) => {
                      const newTarget = e.target.value;
                      const shift = calculateSemitoneShift(currentTextKey, newTarget);
                      const corrected = shiftChordsInText(chordsText, shift);
                      setCorrectorTargetKey(newTarget);
                      setChordsText(corrected);
                      setCurrentTextKey(newTarget);
                      debouncedAutoSave({ chords: corrected });
                    }}
                    className="flex-1 h-10 px-2 rounded-lg border border-slate-300 text-sm font-bold text-center bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="C">C</option>
                    <option value="C#">C#</option>
                    <option value="D">D</option>
                    <option value="D#">D#</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="F#">F#</option>
                    <option value="G">G</option>
                    <option value="G#">G#</option>
                    <option value="A">A</option>
                    <option value="A#">A#</option>
                    <option value="B">B</option>
                  </select>
                </div>

                {/* Row 2: Verse/Chorus Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => insertMarker('[Verse]')}
                    className="flex-1 h-10 px-3 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                  >
                    + [Verse]
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarker('[Chorus]')}
                    className="flex-1 h-10 px-3 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                  >
                    + [Chorus]
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ROW 3: Big Editor Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex flex-col relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Raw Database Chords</label>
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="px-2 py-1 text-[10px] font-semibold rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  ↶ Undo
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={chordsText}
                onFocus={() => setPaletteVisible(true)}
                onBlur={() => setTimeout(() => setPaletteVisible(false), 150)}
                onDoubleClick={handleTextareaDoubleClick}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setChordsText(e.target.value);
                  addToHistory(e.target.value);
                  debouncedAutoSave({ chords: e.target.value });
                }}
                rows={25}
                spellCheck={false}
                className="w-full flex-1 min-h-[500px] p-4 rounded-lg border border-slate-300 bg-white font-mono text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Paste lyrics and chords here..."
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Live User Preview</label>
              <div className="w-full flex-1 min-h-[500px] p-4 rounded-lg border border-slate-300 bg-slate-50 overflow-y-auto">
                {previewLines.length === 0 ? (
                  <div className="text-center text-sm text-slate-400 py-10">
                    Preview will appear here as you type.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previewLinesWithDiffs.map((item, index) => (
                      <PreviewChordLine
                        key={`${item.line}-${index}`}
                        line={item.line}
                        changedSegments={item.changedSegments}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChordPalette
        textareaRef={textareaRef}
        value={chordsText}
        onChange={(newVal) => {
          setChordsText(newVal);
          debouncedAutoSave({ chords: newVal });
        }}
        visible={paletteVisible}
        songKey={keyValue}
      />
    </div>
  );
}
