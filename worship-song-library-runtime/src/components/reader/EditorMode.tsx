import { useState, useRef, useCallback, useEffect } from 'react';
import { ChordPalette } from './ChordPalette';
import { db, type SongDetail, type Section, type Chord, type Arrangement } from '../../db/Database';
import { useWorkflowStore } from '../../store/workflowStore';

interface EditorModeProps {
  song: SongDetail;
  songKey?: string;
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

export function EditorMode({ song, songKey = 'D' }: EditorModeProps) {
  const setActiveArrangementId = useWorkflowStore(s => s.setActiveArrangementId);
  const setReaderMode = useWorkflowStore(s => s.setReaderMode);
  const [text, setText] = useState(() => sectionsToMarkup(song.sections));
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Ref-based architecture for cursor tracking
  const editorRef = useRef<HTMLDivElement>(null);
  const cursorStateRef = useRef<Range | null>(null);

  // Initialize editor content on mount
  useEffect(() => {
    if (editorRef.current && !editorRef.current.textContent?.trim()) {
      editorRef.current.textContent = text;
    }
  }, [text]);

  // Track cursor position before palette buttons steal focus
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      cursorStateRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  // Restore cursor to saved position
  const restoreCursorPosition = useCallback(() => {
    if (cursorStateRef.current && editorRef.current && editorRef.current.contains(cursorStateRef.current.commonAncestorContainer)) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(cursorStateRef.current);
      }
    }
  }, []);

  // Insert chord at cursor position - ref-based, not querySelector
  const insertChordAtCursor = useCallback((chord: string) => {
    if (!editorRef.current) return;

    // Restore cursor position
    restoreCursorPosition();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Only insert if cursor is within the editor
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      return;
    }

    const chordText = document.createTextNode(`[${chord}]`);
    range.insertNode(chordText);
    
    // Move cursor after inserted chord
    range.setStartAfter(chordText);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    // Update state - use innerText to preserve newlines from <br> elements
    const updatedText = editorRef.current.innerText || '';
    setText(updatedText);

    // Keep editor focused and save cursor again
    editorRef.current.focus();
    saveCursorPosition();
  }, [restoreCursorPosition, saveCursorPosition]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // Use innerText to preserve newlines from <br> elements
    const newText = (e.currentTarget as HTMLDivElement).innerText || '';
    setText(newText);
    saveCursorPosition();
  };

  const handleFocus = () => {
    setIsEditing(true);
    saveCursorPosition();
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

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
    <div className="w-full flex flex-col bg-white h-screen overflow-hidden">
      {/* Header with Controls - Fixed to top */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 md:px-0 py-3 flex items-center justify-between shadow-md">
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

      {/* Editable Content - Single contentEditable block with ref */}
      <div
        ref={editorRef}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseDown={saveCursorPosition}
        contentEditable
        suppressContentEditableWarning
        className="flex-1 overflow-y-auto px-4 md:px-0 py-6 font-mono text-sm whitespace-pre-wrap break-words outline-none text-slate-800 focus:ring-0"
        spellCheck={false}
      />

      {/* Chord Palette - Receives song key */}
      <ChordPalette
        onChordInsert={insertChordAtCursor}
        onCursorSave={saveCursorPosition}
        isVisible={isEditing}
        songKey={songKey}
      />
    </div>
  );
}
