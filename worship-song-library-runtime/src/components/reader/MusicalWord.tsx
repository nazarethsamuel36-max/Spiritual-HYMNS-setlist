import { memo } from 'react';
import { ChordTransposer, EnharmonicPref } from '../../utils/ChordTransposer';
import type { MusicalWord as MusicalWordType } from '../../utils/MusicalRenderer';
import type { ReaderMode } from '../../store/workflowStore';

interface MusicalWordProps {
  word: MusicalWordType;
  transpose: number;
  mode: ReaderMode;
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
      text: word.text.slice(start, end).replace(/ /g, '\u00A0'),
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
    <div className="inline-flex relative align-bottom whitespace-nowrap">
      {segments.map((segment, idx) => (
        <span key={idx} className="relative inline-flex flex-col justify-end">
          {/* Chord Layer */}
          {mode === 'chords' && segment.chords.map((chord, i) => (
            <span
              key={i}
              className="absolute bottom-full left-0 font-bold text-[1rem] text-[var(--color-chord)] leading-none mb-1 whitespace-nowrap z-10"
            >
              {chord.name}
            </span>
          ))}

          {/* Lyric Layer */}
          <span className={`text-[1.25rem] text-[var(--color-text)] leading-[1.6] ${mode === 'lyrics' ? 'font-medium' : ''}`}>
            {segment.text}
          </span>
        </span>
      ))}
    </div>
  );
});
