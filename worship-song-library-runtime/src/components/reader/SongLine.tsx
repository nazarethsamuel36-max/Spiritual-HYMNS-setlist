import { memo } from 'react';
import { segmentMusicalLine } from '../../utils/MusicalRenderer';
import { MusicalWord } from './MusicalWord';
import type { Line } from '../../db/Database';
import type { ReaderMode } from '../../store/workflowStore';

interface SongLineProps {
  line: Line;
  transpose: number;
  mode: ReaderMode;
  isChorus?: boolean;
}

export const SongLine = memo(function SongLine({ line, transpose, mode, isChorus }: SongLineProps) {
  if (!line.text || !line.text.trim()) {
    return <div className="h-4" />;
  }

  const words = segmentMusicalLine(line.text, line.chords || []);
  const hasChords = !!(line.chords && line.chords.length > 0);

  // Reduced padding because chords are rendered inline above syllables
  const paddingClass = mode === 'lyrics' ? 'pt-0' : (hasChords ? 'pt-0.25' : 'pt-0');
  const fontClass = 'font-normal';
  const gapClass = 'gap-y-0';

  return (
    <div className={`relative ${mode === 'lyrics' ? 'pb-0.5' : 'pb-1'} group w-full ${paddingClass} ${fontClass}`}>
      <div className={`flex flex-wrap items-baseline relative w-full ${gapClass}`}>
        {words.map((word, wIdx) => (
          <MusicalWord key={wIdx} word={word} transpose={transpose} mode={mode} isChorus={isChorus} />
        ))}
      </div>
    </div>
  );
});
