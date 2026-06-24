import { useState } from 'react';

interface ChordPaletteProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onChordInsert: (chord: string) => void;
  onCursorSave: () => void;
  isVisible: boolean;
  songKey: string;
}

const CHORD_DATA = {
  major: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  minor: ['Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm'],
  seventh: ['C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7'],
  sus: ['Csus4', 'Dsus4', 'Esus4', 'Fsus4', 'Gsus4', 'Asus4', 'Bsus4'],
};

const KEY_CHORDS: Record<string, string[]> = {
  C: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
  D: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
  E: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
  F: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
  G: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
  A: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
  B: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
};

export function ChordPalette({
  editorRef,
  onChordInsert,
  onCursorSave,
  isVisible,
  songKey,
}: ChordPaletteProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('key');

  const categories = [
    { key: 'key', label: `Key ${songKey}` },
    { key: 'major', label: 'Major' },
    { key: 'minor', label: 'Minor' },
    { key: 'seventh', label: '7th' },
    { key: 'sus', label: 'Sus' },
  ];

  const getChords = (category: string): string[] => {
    if (category === 'key') {
      return KEY_CHORDS[songKey] || KEY_CHORDS['D'];
    }
    return CHORD_DATA[category as keyof typeof CHORD_DATA] || [];
  };

  const handleChordClick = (chord: string) => {
    onCursorSave();
    onChordInsert(chord);
    setExpandedCategory(null);
  };

  const handleCategoryClick = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  if (!isVisible) return null;

  const expandedChords = expandedCategory ? getChords(expandedCategory) : [];

  return (
    <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-3 shadow-lg">
      {/* Expanded Chord Row */}
      {expandedChords.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {expandedChords.map((chord) => (
            <button
              key={chord}
              onMouseDown={(e) => {
                e.preventDefault();
                handleChordClick(chord);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-800 rounded-full hover:bg-slate-200 active:scale-95 transition-colors"
            >
              {chord}
            </button>
          ))}
        </div>
      )}

      {/* Category Buttons Row */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onMouseDown={(e) => {
              e.preventDefault();
              handleCategoryClick(category.key);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              expandedCategory === category.key
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
