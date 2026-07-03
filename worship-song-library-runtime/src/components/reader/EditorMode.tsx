import { useEffect, useMemo, useState } from 'react';
import type { SongDetail } from '../../db/Database';
import { supabase } from '../../lib/supabaseClient';
import { useWorkflowStore } from '../../store/workflowStore';
import { useIsMobile } from '../../hooks/useMediaQuery';

console.log('📍 EDITORMODE FILE LOADED');

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  }) as T;
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
  onBackClick?: () => void;
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

export function EditorMode({ song, songKey = 'D', onBackClick }: EditorModeProps) {
  const isMobile = useIsMobile();
  const setReaderMode = useWorkflowStore((s) => s.setReaderMode);
  const [title, setTitle] = useState(song.title || '');
  const [language, setLanguage] = useState(song.language || 'English');
  const [keyValue, setKeyValue] = useState(song.originalKey || songKey || 'C');
  const [songNumber, setSongNumber] = useState(song.songNumber || 0);
  const [chordsText, setChordsText] = useState(song.chords || '');
  const [currentTextKey, setCurrentTextKey] = useState<string>(song.originalKey || songKey || 'C');
  const [correctorTargetKey, setCorrectorTargetKey] = useState<string>('C');
  const [isHidden, setIsHidden] = useState(!song.is_active);
  const [isPublishLoading, setIsPublishLoading] = useState(false);

  useEffect(() => {
    console.log('📝 EditorMode mounted with song:', song);
    setTitle(song.title || '');
    setLanguage(song.language || 'English');
    setKeyValue(song.originalKey || songKey || 'C');
    setCurrentTextKey(song.originalKey || songKey || 'C');
    setSongNumber(song.songNumber || 0);
    setChordsText(song.chords || '');
    setIsHidden(!song.is_active);
  }, [song.title, song.language, song.originalKey, song.songNumber, song.chords, song.is_active, songKey]);

  useEffect(() => {
    console.log('📝 Editor form changed:', {
      title,
      language,
      keyValue,
      songNumber,
      chordsLength: chordsText.length,
    });
  }, [title, language, keyValue, songNumber, chordsText]);

  // Auto-save function
  const autoSave = async (updates: { title?: string; language?: string; original_key?: string; chords?: string }) => {
    try {
      console.log('💾 Auto-saving:', updates);

      const { error } = await supabase
        .from('songs')
        .update(updates)
        .eq('id', song.id);

      if (error) {
        console.error('❌ Auto-save failed:', error);
        alert('Failed to save changes: ' + error.message);
        return;
      }

      console.log('✅ Auto-save successful');
    } catch (err) {
      console.error('❌ Auto-save exception:', err);
      alert('Failed to save changes');
    }
  };

  // NOTE: manual Key Corrector button removed. Instant transpose runs when metadata Key changes.

  // Debounced auto-save (1.5 second delay)
  const debouncedAutoSave = useMemo(() => debounce(autoSave, 1500), []);

  const previewLines = useMemo(() => chordsText.split('\n').filter((line) => line.length > 0), [chordsText]);

  // FEATURE 2: Calculate diffs for each line
  const previewLinesWithDiffs = useMemo(() => previewLines.map((line) => ({ line, changedSegments: undefined })), [previewLines]);

  console.log('🔍 EditorMode RENDERING');
  console.log('🔍 isHidden state:', isHidden);
  console.log('🔍 isPublishLoading state:', isPublishLoading);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      setReaderMode('lyrics');
    }
  };

  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      {/* Mobile Header with Back Button */}
      {isMobile && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <button
            onClick={handleBackClick}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors active:scale-95"
            title="Back to song view"
            aria-label="Back to song view"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-bold text-slate-900 truncate">Edit Song</h2>
        </div>
      )}

      <div className="w-full px-4 md:px-6 py-4 space-y-4 bg-slate-50">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              <div className="mb-1">Title</div>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  debouncedAutoSave({ title: e.target.value });
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 md:py-2 text-sm outline-none focus:border-blue-400 min-h-[44px] md:min-h-auto"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              <div className="mb-1">Key</div>
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 md:py-2 text-sm outline-none focus:border-blue-400 min-h-[44px] md:min-h-auto"
              >
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="Am">Am</option>
                <option value="Bm">Bm</option>
                <option value="Cm">Cm</option>
                <option value="Dm">Dm</option>
                <option value="Em">Em</option>
                <option value="Fm">Fm</option>
                <option value="Gm">Gm</option>
              </select>
            </label>
          </div>

          <div 
            className="mt-4 flex flex-col md:flex-row items-stretch md:items-center gap-3"
            onClick={(e) => {
              e.stopPropagation();
              console.log('🎯 WRAPPER DIV CLICKED');
            }}
          >
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                console.log('🔘 BUTTON CLICKED!');
                console.log('Current isHidden:', isHidden);
                console.log('Song ID:', song.id);
                console.log('Supabase client:', supabase);

                const newHiddenState = !isHidden;
                const newIsActive = !newHiddenState;

                console.log('New is_active value:', newIsActive);

                setIsPublishLoading(true);
                try {
                  console.log('🔄 Attempting database update...');

                  const { data, error } = await supabase
                    .from('songs')
                    .update({ is_active: newIsActive })
                    .eq('id', song.id)
                    .select();

                  console.log('Database response:', { data, error });

                  if (error) {
                    console.error('❌ Database error:', error);
                    alert('Database error: ' + error.message);
                    throw error;
                  }

                  console.log('✅ Update successful!');
                  setIsHidden(newHiddenState);
                  console.log(newIsActive ? '✅ Song published' : '🔒 Song hidden');
                } catch (err: any) {
                  console.error('❌ Failed to toggle publish state', err);
                  alert('Failed: ' + (err?.message || err));
                } finally {
                  setIsPublishLoading(false);
                }
              }}
              disabled={isPublishLoading}
              style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
              className={`px-4 py-3 md:py-2 rounded-md border font-medium transition-colors cursor-pointer w-full md:w-auto min-h-[44px] md:min-h-auto flex items-center justify-center gap-2 ${
                isHidden
                  ? 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                  : 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isPublishLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>{isHidden ? '🔒 Hidden' : '✅ Published'}</span>
                </>
              )}
            </button>
            <span className={`text-xs text-slate-500 ${isMobile ? 'px-2' : ''}`}>Toggle visibility in library</span>
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                console.log('🔘 BUTTON CLICKED!');
                alert('Button works!');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              TEST BUTTON
            </button>
          </div>

          {/* FEATURE 3: Key Corrector Section */}
          <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">
              <div className="mb-1">Chords are currently written in:</div>
              <select
                value={currentTextKey}
                onChange={(e) => setCurrentTextKey(e.target.value)}
                className="w-full rounded-lg border border-slate-700/30 bg-slate-900/10 px-3 py-2.5 md:py-2 text-sm text-slate-800 outline-none focus:border-blue-400 min-h-[44px] md:min-h-auto"
              >
                <option value="C">C</option>
                <option value="C#">C#</option>
                <option value="Db">Db</option>
                <option value="D">D</option>
                <option value="D#">D#</option>
                <option value="Eb">Eb</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="F#">F#</option>
                <option value="Gb">Gb</option>
                <option value="G">G</option>
                <option value="G#">G#</option>
                <option value="Ab">Ab</option>
                <option value="A">A</option>
                <option value="A#">A#</option>
                <option value="Bb">Bb</option>
                <option value="B">B</option>
              </select>
            </label>

            <label className="block text-xs font-medium text-slate-700">
              <div className="mb-1">Shift chords to:</div>
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
                className="w-full rounded-lg border border-slate-700/30 bg-slate-900/10 px-3 py-2.5 md:py-2 text-sm text-slate-800 outline-none focus:border-blue-400 font-semibold min-h-[44px] md:min-h-auto"
              >
                <option value="C">C</option>
                <option value="C#">C#</option>
                <option value="Db">Db</option>
                <option value="D">D</option>
                <option value="D#">D#</option>
                <option value="Eb">Eb</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="F#">F#</option>
                <option value="Gb">Gb</option>
                <option value="G">G</option>
                <option value="G#">G#</option>
                <option value="Ab">Ab</option>
                <option value="A">A</option>
                <option value="A#">A#</option>
                <option value="Bb">Bb</option>
                <option value="B">B</option>
              </select>
            </label>
          </div>

          {/* FEATURE 2: Fixed layout with consistent heights - Responsive */}
          <div className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              <div className="mb-1">Raw database chords</div>
              <textarea
                value={chordsText}
                onChange={(e) => {
                  setChordsText(e.target.value);
                  debouncedAutoSave({ chords: e.target.value });
                }}
                rows={isMobile ? 12 : 20}
                spellCheck={false}
                className={`w-full resize-none rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-blue-400 overflow-auto min-h-[44px] ${isMobile ? 'h-[300px]' : 'h-[500px]'}`}
              />
            </label>

            <div className="block text-sm font-medium text-slate-700">
              <div className="mb-1">Live user preview</div>
              <div className={`rounded-lg border border-slate-200 bg-slate-50 p-3 overflow-auto ${isMobile ? 'h-[300px]' : 'h-[500px]'}`}>
                {previewLines.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                    Preview will appear here as you type the raw chord text.
                  </div>
                ) : (
                  <div className="space-y-3">
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
    </div>
  );
}
