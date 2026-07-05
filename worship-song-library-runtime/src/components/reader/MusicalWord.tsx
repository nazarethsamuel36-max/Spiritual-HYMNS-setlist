import { memo } from 'react';
import { ChordTransposer, EnharmonicPref } from '../../utils/ChordTransposer';
import type { MusicalWord as MusicalWordType } from '../../utils/MusicalRenderer';
import type { ReaderMode } from '../../store/workflowStore';

interface MusicalWordProps {
  word: MusicalWordType;
  transpose: number;
  mode: ReaderMode;
  isChorus?: boolean;
}

export const MusicalWord = memo(function MusicalWord({ word, transpose, mode }: MusicalWordProps) {
  const transposedChords = word.chords.map(c => ({
    ...c,
    name: ChordTransposer.transposeChord(c.chord, transpose, EnharmonicPref.AUTO)
  }));

  // Find all unique split points (0, chord positions, and text length)
  const splitPoints = Array.from(new Set([0, ...transposedChords.map(c => c.position), word.text.length])).sort((a, b) => a - b);

  const segments = [];
  for (let i = 0; i < splitPoints.length - 1; i++) {
    const start = splitPoints[i];
    const end = splitPoints[i + 1];
    segments.push({
      start,
      // allow normal spaces so lines can wrap naturally
      text: word.text.slice(start, end),
      chords: transposedChords.filter(c => c.position === start)
    });
  }

  // Handle trailing chords (position >= text length)
  const trailingChords = transposedChords.filter(c => c.position >= word.text.length);
  if (trailingChords.length > 0) {
    segments.push({
      start: word.text.length,
      text: '',
      chords: trailingChords
    });
  }

  return (
    <div className="inline-flex align-bottom whitespace-pre-wrap leading-none">
      {segments.map((segment, idx) => (
        <span key={idx} className="inline-flex flex-col items-center mr-1 gap-0.5">
          {/* Chord Layer (above text) */}
          {mode === 'chords' && segment.chords.map((chord, i) => (
            <span key={i} className="mb-1 text-sm font-bold leading-tight text-[var(--color-chord)]">
              {chord.name}
            </span>
          ))}

          {/* Lyric Layer */}
          <span className="text-base leading-relaxed text-[var(--color-text)]">
            {segment.text}
          </span>
        </span>
      ))}
    </div>
  );
});
