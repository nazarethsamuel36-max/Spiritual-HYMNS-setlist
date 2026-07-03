import { useEffect, useMemo, useState } from 'react';
import type { SongDetail } from '../../db/Database';
import { supabase } from '../../lib/supabaseClient';

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

export function EditorMode({ song, songKey = 'D' }: EditorModeProps) {
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

  

  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      <div className="w-full px-4 md:px-6 py-4 space-y-4 bg-slate-50">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              <div className="mb-1">Title</div>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  debouncedAutoSave({ title: e.target.value });
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
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
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  const newHiddenState = !isHidden;
                  const newIsActive = !newHiddenState;
                  setIsPublishLoading(true);
                  try {
                    const { error } = await supabase
                      .from('songs')
                      .update({ is_active: newIsActive })
                      .eq('id', song.id);
                    if (error) throw error;
                    setIsHidden(newHiddenState);
                    console.log(newIsActive ? '✅ Song published' : '🔒 Song hidden');
                  } catch (err) {
                    console.error('❌ Failed to toggle publish state', err);
                  } finally {
                    setIsPublishLoading(false);
                  }
                }}
                disabled={isPublishLoading}
                className={`px-3 py-2 rounded-md border font-medium transition-colors ${
                  isHidden
                    ? 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                    : 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPublishLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                    Saving...
                  </span>
                ) : (
                  isHidden ? 'Hidden' : 'Published'
                )}
              </button>
              <span className="text-xs text-slate-500">Toggle visibility in library</span>
            </div>
          </div>

          {/* FEATURE 3: Key Corrector Section */}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">
              <div className="mb-1">Chords are currently written in:</div>
              <select
                value={currentTextKey}
                onChange={(e) => setCurrentTextKey(e.target.value)}
                className="w-full rounded-lg border border-slate-700/30 bg-slate-900/10 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
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
                className="w-full rounded-lg border border-slate-700/30 bg-slate-900/10 px-3 py-2 text-sm text-white outline-none focus:border-blue-400 font-semibold"
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

          {/* FEATURE 2: Fixed layout with consistent heights */}

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              <div className="mb-1">Raw database chords</div>
              <textarea
                value={chordsText}
                onChange={(e) => {
                  setChordsText(e.target.value);
                  debouncedAutoSave({ chords: e.target.value });
                }}
                rows={20}
                spellCheck={false}
                className="w-full h-[500px] resize-none rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-blue-400 overflow-auto"
              />
            </label>

            <div className="block text-sm font-medium text-slate-700">
              <div className="mb-1">Live user preview</div>
              <div className="h-[500px] rounded-lg border border-slate-200 bg-slate-50 p-3 overflow-auto">
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
