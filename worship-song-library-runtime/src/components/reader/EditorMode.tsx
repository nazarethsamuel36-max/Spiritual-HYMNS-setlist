import { useState } from 'react';
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

  return (
    <div className="w-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Sticky Header */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Arrangement Workspace</span>
          <p className="text-[10px] text-amber-600 mt-0.5">Edit chords and lyrics in markup format</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setReaderMode('chords')}
            className="text-xs font-bold text-amber-700 px-3 py-1.5 rounded border border-amber-300 hover:bg-amber-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-bold bg-amber-600 text-white px-4 py-1.5 rounded shadow-sm hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Overlay'}
          </button>
        </div>
      </div>

      {/* Workspace Textarea */}
      <div className="flex flex-col">
        <textarea
          className="w-full p-5 font-mono text-sm resize-none outline-none text-slate-800 leading-loose bg-white"
          style={{ minHeight: 'min(65vh, calc(100dvh - 120px))' }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          placeholder={`[Verse 1]\n[C] Amazing [F] grace how [Am] sweet the sound\n\n[Chorus]\n[G] Hallelujah...`}
        />
        <div className="px-5 py-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-mono flex items-center justify-between">
          <span>Format: <span className="text-slate-600">[SectionLabel]</span> on its own line, then <span className="text-slate-600">[Chord]</span> inline with lyrics</span>
          <span>{text.split('\n').length} lines</span>
        </div>
      </div>
    </div>
  );
}
