export interface ChordWordUnit {
  chord: string;
  lyric: string;
}

export interface SongLine {
  isDirective: boolean;
  directiveType?: string;
  directiveValue?: string;
  words?: ChordWordUnit[];
  isChorus?: boolean;
  isSectionMarker?: boolean;
  sectionTitle?: string;
  renderType?: 'directive' | 'text' | 'spacer' | 'skip';
}

export interface SongPage {
  pageIndex: number;
  lines: SongLine[];
  songId?: number;
  songTitle?: string;
  isFirstPageOfSong?: boolean;
}
