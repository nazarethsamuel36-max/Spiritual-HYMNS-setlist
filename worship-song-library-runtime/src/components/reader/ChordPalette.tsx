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
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (newValue: string) => void;
  visible: boolean;
  songKey?: string; // Passed from parent to compute Key category chords
}

export function ChordPalette({ textareaRef, value, onChange, visible, songKey = 'C' }: ChordPaletteProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [detectedRange, setDetectedRange] = useState<{ start: number; end: number } | null>(null);
  const [bottomOffset, setBottomOffset] = useState(0);
  const savedPos = useRef<number>(0);

  // Slash chord builder local state
  const [slashRoot, setSlashRoot] = useState('G');
  const [slashQuality, setSlashQuality] = useState('');
  const [slashBass, setSlashBass] = useState('B');

  // ── Keyboard height calculation ────────────────────────────────────────────
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => {
      const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
      setBottomOffset(Math.max(0, keyboardHeight));
    };
    vv.addEventListener('resize', handler);
    vv.addEventListener('scroll', handler);
    handler();
    return () => {
      vv.removeEventListener('resize', handler);
      vv.removeEventListener('scroll', handler);
    };
  }, []);

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

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.addEventListener('click', handleCursorMove);
    ta.addEventListener('keyup', handleCursorMove);
    ta.addEventListener('selectionchange', handleCursorMove);
    return () => {
      ta.removeEventListener('click', handleCursorMove);
      ta.removeEventListener('keyup', handleCursorMove);
      ta.removeEventListener('selectionchange', handleCursorMove);
    };
  }, [handleCursorMove, textareaRef]);

  // ── Core Insertion Logic ────────────────────────────────────────────────────
  const handleInsert = (chord: string) => {
    const ta = textareaRef.current;
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
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: bottomOffset,
        zIndex: 200,
      }}
    >
      <div style={{
        background: '#0f172a',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}>

        {/* ── Layer 2: Secondary Toolbar (Chords List or Slash Builder) ──────── */}
        {activeCategory && (
          <div style={{
            background: '#1e293b',
            borderBottom: '1px solid #334155',
            padding: '8px 12px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            alignItems: 'center',
            minHeight: '48px',
          }}>
            {activeCategory === 'Slash' ? (
              // Dedicated Slash Chord Builder
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                {/* Base Note */}
                <select
                  value={slashRoot}
                  onChange={(e) => setSlashRoot(e.target.value)}
                  style={{
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                {/* Quality */}
                <select
                  value={slashQuality}
                  onChange={(e) => setSlashQuality(e.target.value)}
                  style={{
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '13px',
                  }}
                >
                  <option value="">Major</option>
                  <option value="m">m</option>
                  <option value="7">7</option>
                  <option value="maj7">maj7</option>
                  <option value="m7">m7</option>
                  <option value="sus4">sus4</option>
                </select>

                <span style={{ color: '#94a3b8', fontWeight: 800 }}>/</span>

                {/* Bass Note */}
                <select
                  value={slashBass}
                  onChange={(e) => setSlashBass(e.target.value)}
                  style={{
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '13px',
                    fontWeight: 700,
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
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
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
                    flex: '0 0 auto',
                    background: '#0f172a',
                    color: '#60a5fa',
                    border: '1px solid #3b82f6',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontWeight: 800,
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
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
          background: '#0f172a',
          borderTop: '1px solid #334155',
          padding: '8px 12px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          minHeight: '44px',
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onMouseDown={(e) => {
                e.preventDefault();
                setActiveCategory(activeCategory === cat ? null : cat);
              }}
              style={{
                flex: '0 0 auto',
                background: activeCategory === cat ? '#3b82f6' : '#1e293b',
                color: activeCategory === cat ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
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
