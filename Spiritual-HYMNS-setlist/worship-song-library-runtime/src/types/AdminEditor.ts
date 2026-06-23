/**
 * Admin editor data models
 */

export type EditingMode = 'lyrics' | 'chords';

export interface EditableChord {
  id: string; // unique ID for this chord instance
  position: number; // character position in the lyric line
  chord: string; // chord name (e.g., "D", "Dm", "G#maj7")
}

export interface EditableLine {
  id: string;
  text: string;
  chords: EditableChord[];
}

export interface EditableSection {
  id: string;
  type: string; // "verse", "chorus", "bridge", etc.
  label: string;
  lines: EditableLine[];
}

export interface EditableSong {
  id: string;
  title: string;
  artist: string;
  language: string;
  defaultKey: string;
  sections: EditableSection[];
}

/**
 * Diff tracking for undo/redo (future implementation)
 */
export interface SongEditDiff {
  timestamp: number;
  field: keyof EditableSong | 'sections' | 'lines' | 'chords';
  before: any;
  after: any;
}
