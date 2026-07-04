import { useEffect, useMemo, useState } from 'react';
import type { SongDetail } from '../../db/Database';
import { supabase } from '../../lib/supabaseClient';

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

  console.log('🔍 EditorMode RENDERING');
  console.log('🔍 isHidden state:', isHidden);
  console.log('🔍 isPublishLoading state:', isPublishLoading);

  return (
    <div className="w-full flex flex-col bg-white min-h-0">
      <div className="w-full px-4 md:px-6 py-4 space-y-4 bg-slate-50">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {/* ROW 1: Title, Key & Publish */}
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

            <button
              type="button"
              onClick={async () => {
                const newIsActive = !isHidden;
                
                // 1. Optimistic update - update UI immediately
                setIsHidden(!newIsActive);
                setIsPublishLoading(true);
                
                try {
                  // 2. Update IndexedDB immediately (optional but recommended)
                  // await db.songs.update(song.id, { is_active: newIsActive });
                  
                  // 3. Update Supabase (this will trigger realtime for other users)
                  const { error } = await supabase
                    .from('songs')
                    .update({ is_active: newIsActive })
                    .eq('id', song.id);
                  
                  if (error) throw error;
                  console.log('✅ Song updated in database');
                } catch (err) {
                  console.error('❌ Failed to update:', err);
                  // Revert optimistic update on error
                  setIsHidden(!newIsActive);
                  alert('Failed to update song: ' + (err as Error).message);
                } finally {
                  setIsPublishLoading(false);
                }
              }}
              disabled={isPublishLoading}
              className="w-36 h-full flex items-center justify-center px-4 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {isPublishLoading ? 'Saving...' : isHidden ? 'Hidden' : 'Published'}
            </button>
          </div>

          {/* ROW 2: Key Corrector */}
          <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
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
          </div>

          {/* ROW 3: Big Editor Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Raw Database Chords</label>
              <textarea
                value={chordsText}
                onChange={(e) => {
                  setChordsText(e.target.value);
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
    </div>
  );
}
