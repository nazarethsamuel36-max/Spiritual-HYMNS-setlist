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
  if (mode === 'lyrics' && (!line.text || !line.text.trim())) {
    return null;
  }

  const words = segmentMusicalLine(line.text, line.chords || []);
  const hasChords = !!(line.chords && line.chords.length > 0);

  let paddingClass = 'pt-0.5';
  let fontClass = 'font-mukta font-normal';
  let gapClass = 'gap-y-0.5';

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
    <div className={`relative ${mode === 'lyrics' ? 'pb-0.5' : 'pb-1'} group w-full ${paddingClass} ${fontClass}`}>
      <div className={`flex flex-wrap items-end relative w-full ${gapClass}`}>
        {words.map((word, wIdx) => (
          <MusicalWord key={wIdx} word={word} transpose={transpose} mode={mode} isChorus={isChorus} />
        ))}
      </div>
    </div>
  );
});
