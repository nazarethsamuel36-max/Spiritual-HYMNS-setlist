import { useState } from 'react';
import type { EditableSong, EditingMode } from '../../types/AdminEditor';
import { AdminEditorHeader } from './AdminEditorHeader';
import { AdminEditorModeToggle } from './AdminEditorModeToggle';
import { AdminChordEditor } from './AdminChordEditor';
import { AdminLyricsEditor } from './AdminLyricsEditor';
import { AdminEditorPreview } from './AdminEditorPreview';
import { AdminEditorFooter } from './AdminEditorFooter';

/**
 * Main Admin Song Editor Component
 * 
 * This is a UI/UX prototype that demonstrates the editing experience.
 * No backend integration, persistence, or authentication yet.
 */

interface AdminSongEditorProps {
  /**
   * Song data - for now, a mock/placeholder
   * In production, this would be loaded from the backend
   */
  initialSong?: EditableSong;
  onClose?: () => void;
}

export function AdminSongEditor({ initialSong, onClose }: AdminSongEditorProps) {
  const [mode, setMode] = useState<EditingMode>('chords');
  const [song, setSong] = useState<EditableSong>(
    initialSong || {
      id: '1',
      title: 'Amazing Grace',
      artist: 'John Newton',
      language: 'English',
      defaultKey: 'G',
      sections: [
        {
          id: 's1',
          type: 'verse',
          label: 'Verse 1',
          lines: [
            {
              id: 'l1',
              text: 'Amazing grace how sweet the sound',
              chords: [{ id: 'c1', position: 0, chord: 'G' }],
            },
            {
              id: 'l2',
              text: 'That saved a wretch like me',
              chords: [{ id: 'c2', position: 0, chord: 'D' }],
            },
            {
              id: 'l3',
              text: 'I once was lost but now am found',
              chords: [{ id: 'c3', position: 0, chord: 'G' }],
            },
            {
              id: 'l4',
              text: 'Was blind but now I see',
              chords: [{ id: 'c4', position: 0, chord: 'D' }],
            },
          ],
        },
        {
          id: 's2',
          type: 'chorus',
          label: 'Chorus',
          lines: [
            {
              id: 'l5',
              text: 'Twas grace that taught my heart to fear',
              chords: [{ id: 'c5', position: 0, chord: 'G' }],
            },
            {
              id: 'l6',
              text: 'And grace my fears relieved',
              chords: [{ id: 'c6', position: 0, chord: 'Am' }],
            },
          ],
        },
      ],
    }
  );

  const handleUpdateSong = (updated: EditableSong) => {
    setSong(updated);
  };

  const handleDefaultKeyChange = (newKey: string) => {
    setSong({ ...song, defaultKey: newKey });
  };

  const handleTitleChange = (newTitle: string) => {
    setSong({ ...song, title: newTitle });
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <AdminEditorHeader
        title={song.title}
        defaultKey={song.defaultKey}
        onTitleChange={handleTitleChange}
        onKeyChange={handleDefaultKeyChange}
      />

      {/* Mode Toggle */}
      <AdminEditorModeToggle currentMode={mode} onModeChange={setMode} />

      {/* Main Editor Area - Split view on desktop, stacked on mobile */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 p-4 lg:p-6">
        {/* Editor Pane */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          {mode === 'chords' ? (
            <AdminChordEditor song={song} onSongUpdate={handleUpdateSong} />
          ) : (
            <AdminLyricsEditor song={song} onSongUpdate={handleUpdateSong} />
          )}
        </div>

        {/* Preview Pane */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Live Preview
          </div>
          <AdminEditorPreview song={song} />
        </div>
      </div>

      {/* Footer Actions */}
      <AdminEditorFooter onClose={onClose} />
    </div>
  );
}
