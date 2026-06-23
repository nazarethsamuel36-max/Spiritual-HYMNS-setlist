import type { EditableSong } from '../../types/AdminEditor';

interface AdminLyricsEditorProps {
  song: EditableSong;
  onSongUpdate: (song: EditableSong) => void;
}

export function AdminLyricsEditor({ song, onSongUpdate }: AdminLyricsEditorProps) {
  const handleSectionLabelChange = (sectionId: string, newLabel: string) => {
    const updatedSong = JSON.parse(JSON.stringify(song)) as EditableSong;
    const section = updatedSong.sections.find(s => s.id === sectionId);
    if (section) {
      section.label = newLabel;
      onSongUpdate(updatedSong);
    }
  };

  const handleLyricsChange = (lineId: string, newText: string) => {
    const updatedSong = JSON.parse(JSON.stringify(song)) as EditableSong;
    
    for (const section of updatedSong.sections) {
      const line = section.lines.find(l => l.id === lineId);
      if (line) {
        line.text = newText;
        break;
      }
    }

    onSongUpdate(updatedSong);
  };

  const handleAddLine = (sectionId: string, afterLineId?: string) => {
    const updatedSong = JSON.parse(JSON.stringify(song)) as EditableSong;
    const section = updatedSong.sections.find(s => s.id === sectionId);
    
    if (section) {
      const newLine = {
        id: `l${Date.now()}`,
        text: '',
        chords: [],
      };

      if (afterLineId) {
        const idx = section.lines.findIndex(l => l.id === afterLineId);
        section.lines.splice(idx + 1, 0, newLine);
      } else {
        section.lines.push(newLine);
      }

      onSongUpdate(updatedSong);
    }
  };

  const handleDeleteLine = (sectionId: string, lineId: string) => {
    const updatedSong = JSON.parse(JSON.stringify(song)) as EditableSong;
    const section = updatedSong.sections.find(s => s.id === sectionId);
    
    if (section) {
      section.lines = section.lines.filter(l => l.id !== lineId);
      onSongUpdate(updatedSong);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-4 -mr-4">
        <div className="space-y-6">
          {song.sections.map((section) => (
            <div key={section.id} className="space-y-3">
              {/* Section Label (Editable) */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={section.label}
                  onChange={(e) => handleSectionLabelChange(section.id, e.target.value)}
                  className="text-xs font-bold uppercase tracking-wider bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-blue-500 text-slate-600 dark:text-slate-400 px-2 py-1 cursor-pointer hover:border-slate-500"
                />
              </div>

              {/* Lines */}
              <div className="space-y-2">
                {section.lines.map((line, lineIdx) => (
                  <div key={line.id} className="flex items-start gap-2">
                    {/* Line Number */}
                    <div className="text-xs text-slate-400 dark:text-slate-600 font-mono pt-3 w-6 flex-shrink-0">
                      {lineIdx + 1}
                    </div>

                    {/* Lyrics Input */}
                    <textarea
                      value={line.text}
                      onChange={(e) => handleLyricsChange(line.id, e.target.value)}
                      placeholder="Enter lyrics..."
                      className="flex-1 p-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-serif text-base resize-none"
                      rows={2}
                    />

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteLine(section.id, line.id)}
                      className="mt-3 px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors text-sm font-semibold flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Line Button */}
              <button
                onClick={() => handleAddLine(section.id)}
                className="px-3 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
              >
                + Add Line
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          💡 Chords are protected in Lyrics mode. Use Chord Mode to edit chord placements and positions.
        </p>
      </div>
    </div>
  );
}
