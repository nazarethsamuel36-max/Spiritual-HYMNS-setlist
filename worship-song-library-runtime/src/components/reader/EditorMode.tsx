import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SongDetail, Version } from '../../db/Database';
import { supabase } from '../../lib/supabaseClient';
import { db } from '../../db/Database';
import { ChordPalette } from './ChordPalette';
import { VersionService } from '../../services/VersionService';

interface HistoryState {
  chords: string;
  cursorPosition?: number;
}

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
  onExit?: () => void;
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
        className={`flex h-9 w-10 items-center justify-center rounded-lg border border-slate-300 bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none cursor-pointer flex-shrink-0 transition-colors hover:bg-slate-50 ${isOpen ? 'ring-2 ring-slate-400' : ''} ${buttonClassName}`}
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

export function EditorMode({ song, songKey = 'D', source = 'library', versionId = null, version = null, isAdmin = false }: EditorModeProps) {
  const [title, setTitle] = useState(song.title || '');
  const [language, setLanguage] = useState(song.language || 'English');
  const [keyValue, setKeyValue] = useState(song.originalKey || songKey || 'C');
  const [chordsText, setChordsText] = useState(song.chords || '');
  const [currentTextKey, setCurrentTextKey] = useState<string>(song.originalKey || songKey || 'C');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showSaveOptionDialog, setShowSaveOptionDialog] = useState(false);
  const [versionNameInput, setVersionNameInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [containerStyle, setContainerStyle] = useState<React.CSSProperties>({
    height: '100%',
  });

  // Track visual viewport dimensions to keep the editor viewport flush with the virtual keyboard
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => {
      setContainerStyle({
        height: `${vv.height}px`,
        transform: `translateY(${vv.offsetTop}px)`,
      });
    };
    vv.addEventListener('resize', handler);
    vv.addEventListener('scroll', handler);
    handler();
    return () => {
      vv.removeEventListener('resize', handler);
      vv.removeEventListener('scroll', handler);
    };
  }, []);

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

    // Allow practically unlimited history (up to 1000 states) during the edit session
    if (newHistory.length > 1000) {
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

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRef.current = true;
      const nextState = history[historyIndex + 1];
      setChordsText(nextState.chords);
      setHistoryIndex(historyIndex + 1);
      debouncedAutoSave({ chords: nextState.chords });
      if (!isAdmin) setHasUnsavedChanges(true);
      if (nextState.cursorPosition !== undefined && textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.setSelectionRange(nextState.cursorPosition ?? null, nextState.cursorPosition ?? null);
        }, 0);
      }
    }
  };

  const insertMarker = (marker: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = chordsText.slice(0, start);
    const after = chordsText.slice(end);
    const newLine = before.endsWith('\n') || before === '' ? '' : '\n';
    const newText = `${before}${newLine}${marker}\n${after}`;
    setChordsText(newText);
    addToHistory(newText);
    if (!isAdmin) setHasUnsavedChanges(true);
    debouncedAutoSave({ chords: newText });
    setTimeout(() => {
      const pos = start + newLine.length + marker.length + 1;
      ta.setSelectionRange(pos, pos);
      ta.focus();
    }, 0);
  };

  const handleTextareaDoubleClick = () => {
    // no-op for now
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z')) {
      e.preventDefault();
      handleRedo();
    }
  };

// Sync form when song changes
  useEffect(() => {
    setTitle(version?.name ?? song.title ?? '');
    setLanguage(song.language || 'English');
    setKeyValue(song.originalKey || songKey || 'C');
    setCurrentTextKey(song.originalKey || songKey || 'C');
    setChordsText(song.chords || '');
    
    // Initialize undo history with the original chords
    setHistory([{ chords: song.chords || '' }]);
    setHistoryIndex(0);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, [song.id, song.title, song.language, song.originalKey, song.chords, songKey, version?.name]);

  // Auto-grow textarea to fit content
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [chordsText]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  

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
        if (versionId) {
          const versionUpdates: Record<string, unknown> = { updatedAt: Date.now() };
          if (updates.title !== undefined) versionUpdates.name = updates.title;
          if (updates.original_key !== undefined) versionUpdates.originalKey = updates.original_key;
          if (updates.chords !== undefined) versionUpdates.chords = updates.chords;
          await VersionService.updateVersion(versionId, versionUpdates as never);
        } else if (source === 'personal') {
          const existingSong = await db.personalSongs.get(currentSongId);
          if (existingSong) {
            await db.personalSongs.update(currentSongId, {
              ...updates,
              originalKey: updates.original_key,
              updated_at: new Date().toISOString()
            });
          }
        } else {
          const { error } = await supabase
            .from('songs')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', currentSongId);

          if (error) {
            console.error('❌ Auto-save failed:', error);
            alert('Failed to save changes: ' + error.message);
            return;
          }
        }
      }
    } catch (err) {
      console.error('❌ Auto-save exception:', err);
      alert('Failed to save changes');
    }
  };

  const debouncedAutoSave = (updates: { title?: string; language?: string; original_key?: string; chords?: string }) => {
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
      setShowVersionDialog(true);
      setVersionNameInput(version?.name || song.title || '');
      return;
    }
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
      setTimeout(() => { setSaveStatus('idle'); }, 3000);
    } catch (error) {
      console.error('Error saving version:', error);
      alert('Failed to save version. Please try again.');
      setSaveStatus('idle');
    }
  };

  const saveVersion = async (uid: string, updates: { title?: string; language?: string; original_key?: string; chords?: string }) => {
    setSaveStatus('saving');
    try {
      const versionUpdates: Record<string, unknown> = { updatedAt: Date.now() };
      if (updates.title !== undefined) versionUpdates.name = updates.title;
      if (updates.original_key !== undefined) versionUpdates.originalKey = updates.original_key;
      if (updates.chords !== undefined) versionUpdates.chords = updates.chords;

      await VersionService.updateVersion(uid, versionUpdates as never);
      setSaveStatus('success');
      setHasUnsavedChanges(false);

      const event = new CustomEvent('show-toast', {
        detail: { message: 'Song saved', type: 'success' }
      });
      window.dispatchEvent(event);

      setTimeout(() => { setSaveStatus('idle'); }, 2000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save version');
    }
  };

  return (
    <div
      style={containerStyle}
      className="flex-1 flex flex-col min-h-0 bg-[var(--color-reader-surface)]"
    >
      {/* ── EDITOR HEADER: locked at top ── */}
      <div className="flex-shrink-0 bg-[var(--color-reader-surface)]/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-2 w-full">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-2">

          {/* Row 1: Title + Key + Save */}
          <div className="flex items-center gap-2">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isAdmin) setHasUnsavedChanges(true);
                debouncedAutoSave({ title: e.target.value });
              }}
              className="flex-1 h-9 min-w-0 px-0 bg-transparent text-lg font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none border-b border-transparent focus:border-slate-300 overflow-hidden text-ellipsis whitespace-nowrap transition-colors"
              placeholder={versionId ? 'Version Name...' : 'Song Title...'}
            />

            <CustomKeyPicker
              value={keyValue}
              label="Set Root Key"
              buttonClassName="h-9 w-10"
              onChange={(newKey) => {
                const shift = calculateSemitoneShift(currentTextKey, newKey);
                const corrected = shiftChordsInText(chordsText, shift);
                setKeyValue(newKey);
                setChordsText(corrected);
                addToHistory(corrected);
                setCurrentTextKey(newKey);
                if (!isAdmin) setHasUnsavedChanges(true);
                debouncedAutoSave({ original_key: newKey, chords: corrected });
              }}
            />

            {!isAdmin && (
              saveStatus === 'success' ? (
                <div className="flex-shrink-0 flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </div>
              ) : (
                <button
                  onClick={handleManualSave}
                  disabled={!hasUnsavedChanges}
                  className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                    hasUnsavedChanges
                      ? 'text-blue-600 hover:bg-blue-50'
                      : 'text-slate-400 hover:text-slate-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={hasUnsavedChanges ? 'Save changes' : 'No changes to save'}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )
            )}
          </div>

          {/* Row 2: Markers + divider + Undo/Redo — permanent, always visible */}
          <div className="flex items-center gap-2">
            {/* Verse / Chorus markers */}
            <button
              type="button"
              onClick={() => { insertMarker('[Verse]'); }}
              className="h-9 px-3 rounded-lg border border-slate-300 bg-[var(--color-brand-soft)] text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center flex-shrink-0"
            >
              + Verse
            </button>
            <button
              type="button"
              onClick={() => { insertMarker('[Chorus]'); }}
              className="h-9 px-3 rounded-lg border border-slate-300 bg-[var(--color-brand-soft)] text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center flex-shrink-0"
            >
              + Chorus
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 self-center flex-shrink-0" />

            {/* Undo */}
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="h-9 px-3 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0"
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>

            {/* Redo */}
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="h-9 px-3 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0"
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>
          </div>

          {/* Key Changer toolbox — commented out, not needed
          {toolboxOpen && (
            <div className="flex flex-col gap-4 pt-3 pb-2 border-t border-slate-100">
              <div className="flex flex-col w-full">
                <span className="text-[12px] font-semibold uppercase tracking-[0.03em] text-slate-400 mb-2">Key Changer</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-600">Current key set to</span>
                  <CustomKeyPicker
                    value={currentTextKey}
                    label="Current Key"
                    buttonClassName="h-9 w-10 text-sm font-bold rounded-lg"
                    onChange={(newKey) => setCurrentTextKey(newKey)}
                  />
                  <span className="text-sm font-semibold text-slate-600">shift to</span>
                  <CustomKeyPicker
                    value={correctorTargetKey}
                    label="Transpose To"
                    buttonClassName="h-9 w-10 text-sm font-bold rounded-lg"
                    onChange={(newTarget) => {
                      const shift = calculateSemitoneShift(currentTextKey, newTarget);
                      const corrected = shiftChordsInText(chordsText, shift);
                      setCorrectorTargetKey(newTarget);
                      setChordsText(corrected);
                      addToHistory(corrected);
                      setCurrentTextKey(newTarget);
                      if (!isAdmin) setHasUnsavedChanges(true);
                      debouncedAutoSave({ chords: corrected });
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          */}

        </div>
      </div>

      {/* ── BODY: independently scrollable textarea ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="w-full px-4 md:px-8 pt-5 pb-40">
          <div className="max-w-4xl mx-auto w-full">
            <textarea
              ref={textareaRef}
              value={chordsText}
              onDoubleClick={handleTextareaDoubleClick}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setChordsText(e.target.value);
                addToHistory(e.target.value);
                if (!isAdmin) setHasUnsavedChanges(true);
                debouncedAutoSave({ chords: e.target.value });
              }}
              rows={1}
              spellCheck={false}
              className="w-full resize-none overflow-hidden bg-transparent text-[20px] leading-8 text-slate-800 focus:outline-none"
              placeholder="Paste lyrics and chords here..."
            />
          </div>
        </div>
      </div>

      {/* ── FOOTER: ChordPalette fixed at viewport bottom ── */}
      <ChordPalette
        textareaRef={textareaRef}
        value={chordsText}
        onChange={(newVal) => {
          setChordsText(newVal);
          if (!isAdmin) setHasUnsavedChanges(true);
          debouncedAutoSave({ chords: newVal });
        }}
        visible={true}
        songKey={keyValue}
      />

      {/* Save Option Dialog */}
      {showSaveOptionDialog && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">Save Version</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">How would you like to save this version?</p>
            <div className="space-y-2">
              <button
                onClick={() => void handleOverwriteVersion()}
                className="w-full px-4 py-2.5 text-sm font-semibold text-[var(--color-on-inverse)] bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Overwrite this version
              </button>
              <button
                onClick={handleDuplicateVersion}
                className="w-full px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Save as duplicate
              </button>
              <button
                onClick={() => setShowSaveOptionDialog(false)}
                className="w-full px-4 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Version Naming Dialog */}
      {showVersionDialog && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Name Your Version</h3>
            <input
              type="text"
              value={versionNameInput}
              onChange={(e) => setVersionNameInput(e.target.value)}
              placeholder="Enter version name..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 mb-4 bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); void handleSaveWithName(); }
                if (e.key === 'Escape') { e.preventDefault(); handleCancelVersionDialog(); }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelVersionDialog}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWithName}
                className="px-4 py-2 text-sm font-medium text-[var(--color-on-inverse)] bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
