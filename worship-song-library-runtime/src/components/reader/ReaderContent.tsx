import { memo } from 'react';
import { SongLine } from './SongLine';
import type { Section } from '../../db/Database';
import type { ReaderMode } from '../../store/workflowStore';

interface ReaderContentProps {
  sections: Section[];
  transpose: number;
  mode: ReaderMode;
}

export const ReaderContent = memo(function ReaderContent({ sections, transpose, mode }: ReaderContentProps) {
  if (sections.length === 0) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.3em]">No lyrics available</h3>
      </div>
    );
  }

  const lineSpacing = mode === 'lyrics' ? 'space-y-1' : 'space-y-3';

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      {sections.map((section, idx) => {
        const sectionType = section.type?.toLowerCase() || 'other';
        const isChorus = sectionType === 'chorus';

        return (
          <div key={idx} className={`relative w-full ${idx > 0 ? 'mt-4' : ''}`}>
            <div className={`w-full ${lineSpacing} ${isChorus ? 'border-l-2 border-slate-300 pl-3 bg-slate-50/50 rounded-r py-0.5' : ''}`}>
              {section.lines.map((line, lIdx) => (
                <SongLine key={lIdx} line={line} transpose={transpose} mode={mode} isChorus={isChorus} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});
