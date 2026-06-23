import { useState, useCallback } from 'react';
import { db, type SongDetail, type Section, type Chord, type Arrangement } from '../../db/Database';
import { useWorkflowStore } from '../../store/workflowStore';

interface EditorModeProps {
  song: SongDetail;
}

function sectionsToMarkup(sections: Section[]): string {
  return sections.map(section => {
    let out = `[${section.label}]\n`;
    out += section.lines.map(line => {
      if (!line.chords || line.chords.length === 0) return line.text;
      
      let lineOut = '';
      let lastPos = 0;
      const sortedChords = [...line.chords].sort((a, b) => a.position - b.position);
      
      for (const chord of sortedChords) {
        lineOut += line.text.substring(lastPos, chord.position);
        lineOut += `[${chord.chord}]`;
        lastPos = chord.position;
      }
      lineOut += line.text.substring(lastPos);
      return lineOut;
    }).join('\n');
    return out;
  }).join('\n\n');
}

function markupToSections(markup: string): Section[] {
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  
  const lines = markup.split('\n');
  const headerRegex = /^\[(Verse|Chorus|Bridge|Pre-Chorus|Intro|Outro|Tag|Ending|Interlude|V|C|B|P|I|O|Misc)[^\]]*\]$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (headerRegex.test(trimmed)) {
      if (currentSection) sections.push(currentSection);
      let label = trimmed.substring(1, trimmed.length - 1);
      let type = label.toLowerCase().replace(/[^a-z]/g, '');
      currentSection = { type, label, lines: [] };
      continue;
    }
    
    if (!currentSection) {
      currentSection = { type: 'verse', label: 'Verse', lines: [] };
    }
    
    const chordRegex = /\[(.*?)\]/g;
    let match;
    let textOut = '';
    const chords: Chord[] = [];
    let lastIndex = 0;
    
    while ((match = chordRegex.exec(line)) !== null) {
      const chordText = match[1];
      textOut += line.substring(lastIndex, match.index);
      chords.push({
        chord: chordText,
        position: textOut.length
      });
      lastIndex = match.index + match[0].length;
    }
    textOut += line.substring(lastIndex);
    
    currentSection.lines.push({
      text: textOut,
      chords: chords.length > 0 ? chords : undefined
    });
  }
  
  if (currentSection) sections.push(currentSection);
  return sections;
}

const SECTION_STYLES: Record<string, string> = {
  verse: 'bg-[var(--color-verse-bg)] text-[var(--color-verse-text)] border-[var(--color-verse-bg)]',
  chorus: 'bg-[var(--color-chorus-bg)] text-[var(--color-chorus-text)] border-[var(--color-chorus-bg)]',
  bridge: 'bg-[var(--color-bridge-bg)] text-[var(--color-bridge-text)] border-[var(--color-bridge-bg)]',
  prechorus: 'bg-[var(--color-prechorus-bg)] text-[var(--color-prechorus-text)] border-[var(--color-prechorus-bg)]',
  outro: 'bg-[var(--color-outro-bg)] text-[var(--color-outro-text)] border-[var(--color-outro-bg)]',
  intro: 'bg-[var(--color-intro-bg)] text-[var(--color-intro-text)] border-[var(--color-intro-bg)]',
};

export function EditorMode({ song }: EditorModeProps) {
  const setActiveArrangementId = useWorkflowStore(s => s.setActiveArrangementId);
  const setReaderMode = useWorkflowStore(s => s.setReaderMode);
  const [text, setText] = useState(() => sectionsToMarkup(song.sections));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedSections = markupToSections(text);
      const id = crypto.randomUUID();
      
      const arrangement: Arrangement = {
        id,
        songId: song.id,
        name: `Personal Overlay (${new Date().toLocaleDateString()})`,
        type: 'personal',
        overrides: {
          sections: parsedSections
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

  const sections = markupToSections(text);

  const updateLine = useCallback((sectionIdx: number, lineIdx: number, newValue: string) => {
    const lines = text.split('\n');
    const headerRegex = /^\[(Verse|Chorus|Bridge|Pre-Chorus|Intro|Outro|Tag|Ending|Interlude|V|C|B|P|I|O|Misc)[^\]]*\]$/i;
    
    let currentSectionIdx = 0;
    let currentLineIdxInSection = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      
      if (headerRegex.test(trimmed)) {
        if (currentSectionIdx === sectionIdx && currentLineIdxInSection === lineIdx) {
          // Found the line to update
          lines[i] = newValue;
          setText(lines.join('\n'));
          return;
        }
        currentSectionIdx++;
        currentLineIdxInSection = 0;
      } else if (currentSectionIdx === sectionIdx && trimmed) {
        if (currentLineIdxInSection === lineIdx) {
          lines[i] = newValue;
          setText(lines.join('\n'));
          return;
        }
        currentLineIdxInSection++;
      }
    }
  }, [text]);

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Minimal Header with Controls */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 md:px-0 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">Editing...</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setReaderMode('chords')}
            className="text-xs font-semibold text-slate-600 px-3 py-1.5 rounded hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-semibold bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editable Content - Same layout as normal view */}
      <div className="space-y-8 px-4 md:px-0 py-6">
        {sections.map((section, sIdx) => {
          const sectionType = section.type?.toLowerCase() || 'other';
          const pillClass = SECTION_STYLES[sectionType] || 'bg-slate-50 text-slate-400 border-slate-200';

          return (
            <div key={sIdx} className="relative w-full">
              <div className={`inline-block text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-3 border shadow-sm ${pillClass}`}>
                {section.label}
              </div>

              <div className="space-y-4 font-mono text-sm">
                {section.lines.map((line, lIdx) => {
                  const lineMarkup = line.chords && line.chords.length > 0
                    ? (() => {
                        let out = '';
                        let lastPos = 0;
                        const sortedChords = [...line.chords].sort((a, b) => a.position - b.position);
                        for (const chord of sortedChords) {
                          out += line.text.substring(lastPos, chord.position);
                          out += `[${chord.chord}]`;
                          lastPos = chord.position;
                        }
                        out += line.text.substring(lastPos);
                        return out;
                      })()
                    : line.text;

                  const rowCount = (lineMarkup.match(/\n/g) || []).length + 1;

                  return (
                    <textarea
                      key={lIdx}
                      value={lineMarkup}
                      onChange={(e) => updateLine(sIdx, lIdx, e.target.value)}
                      className="w-full bg-transparent outline-none resize-none text-slate-800 pb-2 border-b border-slate-200 focus:border-blue-400 transition-colors hover:bg-slate-50 focus:bg-slate-50"
                      spellCheck={false}
                      rows={Math.max(1, rowCount)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
