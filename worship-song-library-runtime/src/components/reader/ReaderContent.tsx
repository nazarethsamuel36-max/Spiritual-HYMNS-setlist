import { memo } from 'react';
import { SongLine } from './SongLine';
import type { Section } from '../../db/Database';
import type { ReaderMode } from '../../store/workflowStore';

const SECTION_STYLES: Record<string, string> = {
  verse: 'bg-[var(--color-verse-bg)] text-[var(--color-verse-text)] border-[var(--color-verse-bg)]',
  chorus: 'bg-[var(--color-chorus-bg)] text-[var(--color-chorus-text)] border-[var(--color-chorus-bg)]',
  bridge: 'bg-[var(--color-bridge-bg)] text-[var(--color-bridge-text)] border-[var(--color-bridge-bg)]',
  prechorus: 'bg-[var(--color-prechorus-bg)] text-[var(--color-prechorus-text)] border-[var(--color-prechorus-bg)]',
  outro: 'bg-[var(--color-outro-bg)] text-[var(--color-outro-text)] border-[var(--color-outro-bg)]',
  intro: 'bg-[var(--color-intro-bg)] text-[var(--color-intro-text)] border-[var(--color-intro-bg)]',
};

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

  const containerSpacing = mode === 'lyrics' ? 'space-y-5' : 'space-y-8';
  const lineSpacing = mode === 'lyrics' ? 'space-y-1.5' : 'space-y-4';

  return (
    <div className={containerSpacing}>
      {sections.map((section, idx) => {
        const sectionType = section.type?.toLowerCase() || 'other';
        const pillClass = SECTION_STYLES[sectionType] || 'bg-slate-50 text-slate-400 border-slate-200';

        return (
          <div key={idx} className="relative w-full px-4 md:px-0">
            {idx > 0 && (
              <div className="w-full border-t border-slate-300 my-6" />
            )}
            <div className={`inline-block text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-3 border shadow-sm ${pillClass}`}>
              {section.label}
            </div>

            <div className={`w-full ${lineSpacing}`}>
              {section.lines.map((line, lIdx) => (
                <SongLine key={lIdx} line={line} transpose={transpose} mode={mode} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});
