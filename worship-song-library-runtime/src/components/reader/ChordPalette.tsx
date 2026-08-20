import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ─── Constants & Helpers ──────────────────────────────────────────────────────

const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const CATEGORIES = [
  'Key',
  'Major',
  'Minor',
  '7th',
  'maj7',
  'm7',
  'Suspended',
  'Added',
  'Diminished',
  'Augmented',
  'Slash',
];

// Helper to get notes of a major scale (for Key category)
const SEMITONE_SHIFTS = [0, 2, 4, 5, 7, 9, 11];
const DIATONIC_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'];

function getDiatonicChords(key: string): string[] {
  const normalizedKey = key.replace(/min|m/i, '').trim();
  const rootIdx = ROOTS.indexOf(normalizedKey);
  if (rootIdx === -1) return ROOTS; // Fallback to raw roots

  return SEMITONE_SHIFTS.map((shift, i) => {
    const noteIdx = (rootIdx + shift) % 12;
    return ROOTS[noteIdx] + DIATONIC_QUALITIES[i];
  });
}

function detectChordAtCursor(
  text: string,
  pos: number
): { start: number; end: number; chord: string } | null {
  let start = pos - 1;
  while (start >= 0 && text[start] !== '[' && text[start] !== ']') start--;
  if (start < 0 || text[start] !== '[') return null;

  let end = pos;
  while (end < text.length && text[end] !== ']' && text[end] !== '[') end++;
  if (end >= text.length || text[end] !== ']') return null;

  const chord = text.slice(start + 1, end);
  return { start, end: end + 1, chord };
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface ChordPaletteProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (newValue: string) => void;
  visible: boolean;
  songKey?: string; // Passed from parent to compute Key category chords
  hasTopBorder?: boolean;
}

export function ChordPalette({ textareaRef, value, onChange, visible, songKey = 'C', hasTopBorder = true }: ChordPaletteProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [detectedRange, setDetectedRange] = useState<{ start: number; end: number } | null>(null);
  const savedPos = useRef<number>(0);
  const focusedRef = useRef(false);

  // Slash chord builder local state
  const [slashRoot, setSlashRoot] = useState('G');
  const [slashQuality, setSlashQuality] = useState('');
  const [slashBass, setSlashBass] = useState('B');

  // ── Selection/cursor monitoring ────────────────────────────────────────────
  const handleCursorMove = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    savedPos.current = pos;

    const detected = detectChordAtCursor(value, pos);
    if (detected) {
      setDetectedRange({ start: detected.start, end: detected.end });
    } else {
      setDetectedRange(null);
    }
  }, [value, textareaRef]);

  // Guard: only insert chords if the textarea is actually focused.
  // Without this, tapping a palette button inserts at position 0 and
  // auto-saves garbage to the database.
  const handleFocusIn = useCallback(() => { focusedRef.current = true; }, []);
  const handleFocusOut = useCallback(() => {
    focusedRef.current = false;
    setDetectedRange(null);
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.addEventListener('focus', handleFocusIn);
    ta.addEventListener('blur', handleFocusOut);
    ta.addEventListener('click', handleCursorMove);
    ta.addEventListener('keyup', handleCursorMove);
    ta.addEventListener('selectionchange', handleCursorMove);
    return () => {
      ta.removeEventListener('focus', handleFocusIn);
      ta.removeEventListener('blur', handleFocusOut);
      ta.removeEventListener('click', handleCursorMove);
      ta.removeEventListener('keyup', handleCursorMove);
      ta.removeEventListener('selectionchange', handleCursorMove);
    };
  }, [handleFocusIn, handleFocusOut, handleCursorMove, textareaRef]);

  // ── Core Insertion Logic ────────────────────────────────────────────────────
  const handleInsert = (chord: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    // Never insert when the textarea isn't focused — otherwise we corrupt the
    // song by writing at position 0.
    if (!focusedRef.current) {
      ta.focus();
      return;
    }
    const pos = savedPos.current;

    let newText: string;
    let newCursor: number;

    if (detectedRange) {
      newText =
        value.slice(0, detectedRange.start) +
        `[${chord}]` +
        value.slice(detectedRange.end);
      newCursor = detectedRange.start + chord.length + 2;
    } else {
      newText = value.slice(0, pos) + `[${chord}]` + value.slice(pos);
      newCursor = pos + chord.length + 2;
    }

    onChange(newText);
    setDetectedRange(null);
    setActiveCategory(null); // Close secondary toolbar

    // Restore focus and position cursor right after the closing bracket
    setTimeout(() => {
      if (ta) {
        ta.focus();
        ta.setSelectionRange(newCursor, newCursor);
        savedPos.current = newCursor;
      }
    }, 30);
  };

  // ── Compute Chords for Active Category ──────────────────────────────────────
  const categoryChords = useMemo(() => {
    if (!activeCategory) return [];

    switch (activeCategory) {
      case 'Key':
        return getDiatonicChords(songKey);
      case 'Major':
        return ROOTS;
      case 'Minor':
        return ROOTS.map(r => r + 'm');
      case '7th':
        return ROOTS.map(r => r + '7');
      case 'maj7':
        return ROOTS.map(r => r + 'maj7');
      case 'm7':
        return ROOTS.map(r => r + 'm7');
      case 'Suspended':
        return ROOTS.flatMap(r => [r + 'sus2', r + 'sus4']);
      case 'Added':
        return ROOTS.flatMap(r => [r + '5', r + '6', r + '9', r + 'm9', r + 'add9']);
      case 'Diminished':
        return ROOTS.map(r => r + 'dim');
      case 'Augmented':
        return ROOTS.map(r => r + 'aug');
      default:
        return [];
    }
  }, [activeCategory, songKey]);

  if (!visible) return null;

  return (
    <div
      style={{
        flexShrink: 0,
        background: 'var(--color-reader-surface, #fff)',
        borderTop: hasTopBorder ? '1px solid var(--color-slate-200, #E2E8F0)' : 'none',
        zIndex: 200,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        width: '100%',
        maxWidth: '100%',
      }}>
        {/* Chords Group Label */}
        <div style={{
          padding: '8px 12px 0 12px',
        }}>
          <span className="text-[12px] font-semibold uppercase tracking-[0.03em] text-slate-400">Chords</span>
        </div>

        {/* ── Layer 2: Secondary Toolbar (Chords List or Slash Builder) ──────── */}
        {activeCategory && (
          <div style={{
            background: 'var(--color-reader-surface, #fff)',
            borderBottom: '1px solid var(--color-slate-200, #E2E8F0)',
            padding: '8px 12px',
            display: 'flex',
            overflowX: 'auto',
            flexWrap: 'nowrap',
            gap: '8px',
            alignItems: 'center',
            minHeight: '48px',
            scrollbarWidth: 'none',
          }}
          className="hide-scrollbar"
          >
            {activeCategory === 'Slash' ? (
              // Dedicated Slash Chord Builder
              <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: '8px', width: 'auto' }}>
                {/* Base Note */}
                <select
                  value={slashRoot}
                  onChange={(e) => setSlashRoot(e.target.value)}
                  style={{
                    background: 'var(--color-surface, #fff)',
                    color: 'var(--color-text, #0f172a)',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    height: '36px',
                  }}
                >
                  {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                {/* Quality */}
                <select
                  value={slashQuality}
                  onChange={(e) => setSlashQuality(e.target.value)}
                  style={{
                    background: 'var(--color-surface, #fff)',
                    color: 'var(--color-text, #0f172a)',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '13px',
                    height: '36px',
                  }}
                >
                  <option value="">Major</option>
                  <option value="m">m</option>
                  <option value="7">7</option>
                  <option value="maj7">maj7</option>
                  <option value="m7">m7</option>
                  <option value="sus4">sus4</option>
                </select>

                <span style={{ color: '#64748b', fontWeight: 800 }}>/</span>

                {/* Bass Note */}
                <select
                  value={slashBass}
                  onChange={(e) => setSlashBass(e.target.value)}
                  style={{
                    background: 'var(--color-surface, #fff)',
                    color: 'var(--color-text, #0f172a)',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    height: '36px',
                  }}
                >
                  {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleInsert(`${slashRoot}${slashQuality}/${slashBass}`);
                  }}
                  style={{
                    marginLeft: 'auto',
                    background: 'var(--color-brand)',
                    color: 'var(--color-on-inverse)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Insert {slashRoot}{slashQuality}/{slashBass}
                </button>
              </div>
            ) : (
              // Simple Horizontal List of Chords
              categoryChords.map(chord => (
                <button
                  key={chord}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleInsert(chord);
                  }}
                  style={{
                    background: 'var(--color-brand)',
                    color: 'var(--color-on-inverse)',
                    border: '1px solid var(--color-brand)',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontWeight: 800,
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {chord}
                </button>
              ))
            )}
          </div>
        )}

        {/* ── Layer 1: Primary Toolbar (Categories) ─────────────────────────── */}
        <div style={{
          background: 'var(--color-reader-surface, #fff)',
          padding: '8px 12px',
          display: 'flex',
          overflowX: 'auto',
          flexWrap: 'nowrap',
          gap: '8px',
          minHeight: '44px',
          scrollbarWidth: 'none',
        }}
        className="hide-scrollbar"
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onMouseDown={(e) => {
                e.preventDefault();
                setActiveCategory(activeCategory === cat ? null : cat);
              }}
              style={{
                flex: '0 0 auto',
                background: activeCategory === cat ? 'var(--color-brand)' : 'var(--color-brand-soft)',
                color: activeCategory === cat ? 'var(--color-on-inverse)' : 'var(--color-text-muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
