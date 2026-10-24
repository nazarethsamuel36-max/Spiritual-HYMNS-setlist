export interface ChordWordUnit {
  chord: string;
  lyric: string;
}

export interface ParsedSongLine {
  isDirective: boolean;
  directiveType?: string;
  directiveValue?: string;
  words?: ChordWordUnit[];
  isChorus?: boolean;
  isSectionMarker?: boolean;
  sectionLabel?: string;
  renderType?: 'directive' | 'text' | 'spacer' | 'skip';
}

export interface SongPage {
  pageIndex: number;
  totalPages: number;
  lines: ParsedSongLine[];
  startLineIndex: number;
  endLineIndex: number;
  sectionTitle?: string;
}

export type PageSpreadMode = 'single' | 'double' | 'auto';
