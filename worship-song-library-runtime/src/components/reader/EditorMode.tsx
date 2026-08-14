import { useEffect, useMemo, useRef, useState } from 'react';
import type { SongDetail, Version } from '../../db/Database';
import { supabase } from '../../lib/supabaseClient';
import { db } from '../../db/Database';
import { ChordPalette } from './ChordPalette';
import { VersionService } from '../../services/VersionService';

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
  versionId?: string | null;
  version?: Version | null;
  isAdmin?: boolean;
}

interface PreviewChordLineProps {
  line: string;
  changedSegments?: Array<{ text: string; isChanged: boolean }>;
}

const KEY_OPTIONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function CustomKeyPicker({
  value,
  onChange,
  label = 'Key',
  buttonClassName = '',
  className = '',
}: {
  value: string;
  onChange: (nextKey: string) => void;
  label?: string;
  buttonClassName?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex h-12 w-12 items-center justify-center rounded-lg border border-slate-300 bg-white text-base font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0 transition-colors hover:bg-[#F1F5F9] ${isOpen ? 'ring-2 ring-blue-500' : ''} ${buttonClassName}`}
      >
        {value}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 min-w-[96px] max-h-[240px] overflow-y-auto overflow-x-hidden rounded-lg border border-slate-200 bg-[var(--color-surface)] p-1 shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {label}
          </div>
          {KEY_OPTIONS.map((option) => {
            const isSelected = value === option;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isSelected ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                <span>{option}</span>
                {isSelected ? <span className="text-base">✓</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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

export function EditorMode({ song, songKey = 'D', source = 'library', versionId = null, version = null, isAdmin = false }: EditorModeProps) {
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showSaveOptionDialog, setShowSaveOptionDialog] = useState(false);
  const [versionNameInput, setVersionNameInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

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

  const handleCancelVersionDialog = () => {
    setShowVersionDialog(false);
    setVersionNameInput('');
   };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRef.current = true;
      const prevState = history[historyIndex - 1];
      setChordsText(prevState.chords);
      setHistoryIndex(historyIndex - 1);
      debouncedAutoSave({ chords: prevState.chords });
      if (!isAdmin) setHasUnsavedChanges(true);
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
    if (!isAdmin) setHasUnsavedChanges(true);
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
        const newText = text.substring(0, start) + text.substring(end);
        
        setChordsText(newText);
        if (!isAdmin) setHasUnsavedChanges(true);
        debouncedAutoSave({ chords: newText });
        
        e.preventDefault();
        break;
      }
    }
  };

  useEffect(() => {
    console.log('📝 Loading new song into editor:', song.id);
    setTitle(version?.name ?? song.title ?? '');
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
  }, [song.id, song.title, song.language, song.originalKey, song.songNumber, song.chords, songKey, version?.name]);

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

  // Navigation guard for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isAdmin) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isAdmin]);

  const performSave = async (currentSongId: number, updates: { title?: string; language?: string; original_key?: string; chords?: string }) => {
    try {
      if (isAdmin) {
        // Admin: auto-save to Supabase or personal/library as before
        console.log(`💾 Auto-saving song ${currentSongId}:`, updates);

        if (versionId) {
          const versionUpdates: Record<string, unknown> = {
            updatedAt: Date.now(),
          };
          if (updates.title !== undefined) versionUpdates.name = updates.title;
          if (updates.original_key !== undefined) versionUpdates.originalKey = updates.original_key;
          if (updates.chords !== undefined) versionUpdates.chords = updates.chords;
          await VersionService.updateVersion(versionId, versionUpdates as never);
          console.log(`✅ Auto-save successful for version ${versionId}`);
        } else if (source === 'personal') {
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
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentSongId);

          if (error) {
            console.error('❌ Auto-save failed:', error);
            alert('Failed to save changes: ' + error.message);
            return;
          }

          console.log(`✅ Auto-save successful for song ${currentSongId}`);
        }
      } else {
        // User: manual save only, no auto-save
        console.log(`User manual save requested for song ${currentSongId}`);
      }
    } catch (err) {
      console.error('❌ Auto-save exception:', err);
      alert('Failed to save changes');
    }
  };

  const debouncedAutoSave = (updates: { title?: string; language?: string; original_key?: string; chords?: string }) => {
    // Only auto-save for admins
    if (!isAdmin) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      void performSave(song.id, updates);
      saveTimeoutRef.current = null;
    }, 1500);
  };

  const handleManualSave = async () => {
    if (!versionId) {
      // Need to create a new version with name
      setShowVersionDialog(true);
      setVersionNameInput(version?.name || song.title || '');
      return;
    }

    // Editing an existing version — ask overwrite vs duplicate
    setShowSaveOptionDialog(true);
   };

  const handleOverwriteVersion = async () => {
    setShowSaveOptionDialog(false);
    const updates = { title, language, original_key: keyValue, chords: chordsText };
    if (!versionId) return;
    await saveVersion(versionId, updates);
  };

  const handleDuplicateVersion = () => {
    setShowSaveOptionDialog(false);
    setVersionNameInput(version?.name ? `${version.name} (copy)` : (song.title || ''));
    setShowVersionDialog(true);
  };

  const handleSaveWithName = async () => {
    if (!versionNameInput.trim()) {
      alert('Please enter a version name');
      return;
    }

    setShowVersionDialog(false);
    setSaveStatus('saving');

    try {
      await VersionService.createVersion({
        sourceSongId: song.id,
        name: versionNameInput,
        owner: source === 'shared' ? 'shared' : 'personal',
        snapshot: {
          chords: chordsText,
          lyrics: song.lyrics,
          originalKey: keyValue,
        },
      });

      setVersionNameInput('');
      setHasUnsavedChanges(false);
      setSaveStatus('success');

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving version:', error);
      alert('Failed to save version. Please try again.');
      setSaveStatus('idle');
    }
   };

  const saveVersion = async (uid: string, updates: { title?: string; language?: string; original_key?: string; chords?: string }) => {
    setSaveStatus('saving');
    try {
      const versionUpdates: Record<string, unknown> = {
        updatedAt: Date.now(),
      };
      if (updates.title !== undefined) versionUpdates.name = updates.title;
      if (updates.original_key !== undefined) versionUpdates.originalKey = updates.original_key;
      if (updates.chords !== undefined) versionUpdates.chords = updates.chords;
      
      await VersionService.updateVersion(uid, versionUpdates as never);
      setSaveStatus('success');
      setHasUnsavedChanges(false);
      
      // Show success message for admin
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Song added', type: 'success' } 
      });
      window.dispatchEvent(event);
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save version');
    }
   };

   const previewLines = useMemo(() => chordsText.split('\n').filter((line) => line.length > 0), [chordsText]);

  // FEATURE 2: Calculate diffs for each line
  const previewLinesWithDiffs = useMemo(() => previewLines.map((line) => ({ line, changedSegments: undefined })), [previewLines]);

  console.log('🔍 EditorMode RENDERING');

  return (
    <div className="w-full flex flex-col bg-[var(--color-surface)] min-h-0">
      <div className="w-full px-4 md:px-6 py-4 space-y-4 bg-slate-50">
        <div className="w-full rounded-xl border border-slate-200 bg-[var(--color-surface)] p-4 shadow-sm">
          {/* ROW 1: Title & Key */}
          <div className="flex gap-3 h-12 mb-4">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isAdmin) setHasUnsavedChanges(true);
                debouncedAutoSave({ title: e.target.value });
              }}
              className="flex-1 h-full px-4 rounded-lg border border-slate-300 bg-[var(--color-surface)] text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden text-ellipsis whitespace-nowrap"
              placeholder={versionId ? 'Version Name...' : 'Song Title...'}
            />

            <CustomKeyPicker
              value={keyValue}
              label="Set Root Key"
              onChange={(newKey) => {
                const shift = calculateSemitoneShift(currentTextKey, newKey);
                const corrected = shiftChordsInText(chordsText, shift);
                setKeyValue(newKey);
                setChordsText(corrected);
                setCurrentTextKey(newKey);
                if (!isAdmin) setHasUnsavedChanges(true);
                debouncedAutoSave({ original_key: newKey, chords: corrected });
              }}
              />
            </div>

            {/* Save Button + Status for non-admin users */}
            {!isAdmin && (
              <>
                {/* Mobile: inline save button below title */}
                <div className="block md:hidden">
                  {saveStatus === 'success' ? (
                    <div className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium mx-auto">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Song added
                    </div>
                  ) : (
                    <button
                      onClick={handleManualSave}
                      disabled={!hasUnsavedChanges}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-5 0V5a2 2 0 114 0v2m-4 0h4" />
                      </svg>
                      Save Version
                    </button>
                  )}
                </div>

                {/* Desktop: fixed save button at bottom-right */}
                <div className="hidden md:block">
                  {saveStatus === 'success' ? (
                    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Song added
                    </div>
                  ) : (
                    <button
                      onClick={handleManualSave}
                      disabled={!hasUnsavedChanges}
                      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-5 0V5a2 2 0 114 0v2m-4 0h4" />
                      </svg>
                      Save Version
                    </button>
                  )}
                </div>
              </>
            )}

          {/* ROW 2: Key Corrector - Desktop Inline Layout */}
          <div className="hidden md:flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Key Corrector:</span>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Current</label>
              <CustomKeyPicker
                value={currentTextKey}
                label="Current Key"
                onChange={(newKey) => setCurrentTextKey(newKey)}
              />
            </div>

            <span className="text-slate-400 font-bold">→</span>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Shift To</label>
              <CustomKeyPicker
                value={correctorTargetKey}
                label="Transpose To"
                onChange={(newTarget) => {
                  const shift = calculateSemitoneShift(currentTextKey, newTarget);
                  const corrected = shiftChordsInText(chordsText, shift);
                  setCorrectorTargetKey(newTarget);
                  setChordsText(corrected);
                  setCurrentTextKey(newTarget);
                  if (!isAdmin) setHasUnsavedChanges(true);
                  debouncedAutoSave({ chords: corrected });
                }}
              />
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
                  <CustomKeyPicker
                    value={currentTextKey}
                    label="Current Key"
                    buttonClassName="h-10 w-full min-w-[60px]"
                    onChange={(newKey) => setCurrentTextKey(newKey)}
                  />
                  <span className="text-slate-400 font-bold">→</span>
                  <label className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Shift To</label>
                  <CustomKeyPicker
                    value={correctorTargetKey}
                    label="Transpose To"
                    buttonClassName="h-10 w-full min-w-[60px]"
                    onChange={(newTarget) => {
                      const shift = calculateSemitoneShift(currentTextKey, newTarget);
                      const corrected = shiftChordsInText(chordsText, shift);
                      setCorrectorTargetKey(newTarget);
                      setChordsText(corrected);
                      setCurrentTextKey(newTarget);
                      if (!isAdmin) setHasUnsavedChanges(true);
                      debouncedAutoSave({ chords: corrected });
                    }}
                  />
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
                  className="px-2 py-1 text-[10px] font-semibold rounded border border-slate-300 bg-[var(--color-surface)] text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  if (!isAdmin) setHasUnsavedChanges(true);
                  debouncedAutoSave({ chords: e.target.value });
                }}
                rows={25}
                spellCheck={false}
                className="w-full flex-1 min-h-[500px] p-4 rounded-lg border border-slate-300 bg-[var(--color-surface)] font-mono text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
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
           if (!isAdmin) setHasUnsavedChanges(true);
           debouncedAutoSave({ chords: newVal });
         }}
         visible={paletteVisible}
         songKey={keyValue}
       />

      {/* Save Option Dialog */}
      {showSaveOptionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Save Version</h3>
            <p className="text-sm text-slate-500 mb-4">
              How would you like to save this version?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => void handleOverwriteVersion()}
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Overwrite this version
              </button>
              <button
                onClick={handleDuplicateVersion}
                className="w-full px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Save as duplicate
              </button>
              <button
                onClick={() => setShowSaveOptionDialog(false)}
                className="w-full px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version Naming Dialog */}
      {showVersionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Name Your Version</h3>
            <input
              type="text"
              value={versionNameInput}
              onChange={(e) => setVersionNameInput(e.target.value)}
              placeholder="Enter version name..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleSaveWithName();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancelVersionDialog();
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelVersionDialog}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWithName}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
