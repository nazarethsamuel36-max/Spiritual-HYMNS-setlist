import { memo } from 'react';
import { segmentMusicalLine } from '../../utils/MusicalRenderer';
import { MusicalWord } from './MusicalWord';
import type { Line } from '../../db/Database';
import type { ReaderMode } from '../../store/workflowStore';

interface SongLineProps {
  line: Line;
  transpose: number;
  mode: ReaderMode;
}

export const SongLine = memo(function SongLine({ line, transpose, mode }: SongLineProps) {
  const words = segmentMusicalLine(line.text, line.chords || []);
  const hasChords = !!(line.chords && line.chords.length > 0);

  let paddingClass = 'pt-1';
  let fontClass = 'font-sans';
  let gapClass = 'gap-y-1';

  if (mode !== 'lyrics') {
    fontClass = 'font-mono';
    if (hasChords) {
      paddingClass = 'pt-[1.3rem]';
      gapClass = 'gap-y-5';
    } else {
      paddingClass = 'pt-1';
      gapClass = 'gap-y-1';
    }
  }

  return (
    <div className={`relative pb-1 group w-full ${paddingClass} ${fontClass}`}>
      <div className={`flex flex-wrap items-end relative w-full ${gapClass}`}>
        {words.map((word, wIdx) => (
          <MusicalWord key={wIdx} word={word} transpose={transpose} mode={mode} />
        ))}
      </div>
    </div>
  );
});
