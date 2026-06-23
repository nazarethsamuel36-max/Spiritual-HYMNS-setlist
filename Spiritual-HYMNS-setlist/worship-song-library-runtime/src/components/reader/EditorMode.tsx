import { useState, useRef } from 'react';
import { db, type SongDetail, type Section, type Chord } from '../../db/Database';
import { useWorkflowStore } from '../../store/workflowStore';

interface EditorModeProps {
  song: SongDetail;
}

const SECTION_STYLES: Record<string, string> = {
  verse: 'bg-blue-100 text-blue-700',
  chorus: 'bg-purple-100 text-purple-700',
  bridge: 'bg-amber-100 text-amber-700',
  prechorus: 'bg-pink-100 text-pink-700',
  outro: 'bg-slate-100 text-slate-700',
  intro: 'bg-slate-100 text-slate-700',
};

function parseLineMarkup(text: string): { text: string; chords: Chord[] } {
  const chords: Chord[] = [];
  let textOut = '';
  const chordRegex = /\[(.*?)\]/g;
  let match;
  let lastIndex = 0;

  while ((match = chordRegex.exec(text)) !== null) {
    const chordText = match[1];
    textOut += text.substring(lastIndex, match.index);
    chords.push({
      chord: chordText,
      position: textOut.length
    });
    lastIndex = match.index + match[0].length;
  }
  textOut += text.substring(lastIndex);

  return { text: textOut, chords };
}

export function EditorMode({ song }: EditorModeProps) {
  const setActiveArrangementId = useWorkflowStore(s => s.setActiveArrangementId);
  const setReaderMode = useWorkflowStore(s => s.setReaderMode);
  const [sections, setSections] = useState<Section[]>(song.sections);
  const [saving, setSaving] = useState(false);
  const editRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleSectionLabelChange = (idx: number, newLabel: string) => {
    setSections(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], label: newLabel };
      return updated;
    });
  };

  const handleLineChange = (sectionIdx: number, lineIdx: number, rawMarkup: string) => {
    setSections(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const { text, chords } = parseLineMarkup(rawMarkup);
      updated[sectionIdx].lines[lineIdx] = {
        text,
        chords: chords.length > 0 ? chords : undefined
      };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalSections = sections.map((section, sectionIdx) => {
        const updatedLines = section.lines.map((line, lineIdx) => {
          const el = editRefs.current.get(`${sectionIdx}-${lineIdx}`);
          if (el) {
            const markup = el.textContent || '';
            const { text, chords } = parseLineMarkup(markup);
            return {
              text,
              chords: chords.length > 0 ? chords : undefined
            };
          }
          return line;
        });
        return {
          ...section,
          lines: updatedLines
        };
      });

      const id = crypto.randomUUID();
      const arrangement = {
        id,
        songId: song.id,
        name: `Personal Overlay (${new Date().toLocaleDateString()})`,
        type: 'personal' as const,
        overrides: {
          sections: finalSections
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await db.arrangements.put(arrangement);
      setActiveArrangementId(id);
      setReaderMode('chords');
    } catch (err) {
      console.error(err);
      alert("Failed to save arrangement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Inline Editor - Same layout as song reader */}
      {sections.map((section, sectionIdx) => {
        const sectionType = section.type?.toLowerCase() || 'other';
        const pillClass = SECTION_STYLES[sectionType] || 'bg-slate-50 text-slate-400';

        // Reconstruct markup for display
        const reconstructedLines = section.lines.map(line => {
          if (!line.chords || line.chords.length === 0) return line.text;
          
          let markup = '';
          let lastPos = 0;
          const sortedChords = [...line.chords].sort((a, b) => a.position - b.position);
          
          for (const chord of sortedChords) {
            markup += line.text.substring(lastPos, chord.position);
            markup += `[${chord.chord}]`;
            lastPos = chord.position;
          }
          markup += line.text.substring(lastPos);
          return markup;
        });

        return (
          <div key={sectionIdx}>
            {/* Editable Section Label */}
            <input
              type="text"
              value={section.label}
              onChange={(e) => handleSectionLabelChange(sectionIdx, e.target.value)}
              className={`inline-block text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-3 border shadow-sm outline-none focus:ring-2 focus:ring-offset-1 ${pillClass}`}
            />

            {/* Editable Lines */}
            <div className="space-y-4">
              {section.lines.map((_, lineIdx) => (
                <div
                  key={lineIdx}
                  ref={(el) => {
                    if (el) editRefs.current.set(`${sectionIdx}-${lineIdx}`, el);
                  }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const markup = e.currentTarget.textContent || '';
                    handleLineChange(sectionIdx, lineIdx, markup);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  className="text-base leading-relaxed font-serif outline-none focus:bg-yellow-50 focus:px-2 focus:py-1 focus:rounded transition-colors cursor-text select-text"
                >
                  {reconstructedLines[lineIdx]}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer Controls */}
      <div className="flex flex-col gap-3 mt-12 pt-6 border-t border-slate-200">
        <div className="text-xs text-slate-500 space-y-1">
          <p>💡 Edit lyrics directly • Use <code className="bg-slate-100 px-1 rounded">[Chord]</code> markup inline • Changes appear instantly</p>
          <p>⌘Ctrl+Enter to save</p>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setReaderMode('chords')}
            className="text-xs font-bold text-slate-600 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-bold bg-slate-700 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Overlay'}
          </button>
        </div>
      </div>
    </div>
  );
}
