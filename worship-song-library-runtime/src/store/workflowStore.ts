import { create } from 'zustand';

export type SidebarView =
  | { panel: 'library' }
  | { panel: 'shared' }
  | { panel: 'setlist-list' }
  | { panel: 'setlist-detail'; setlistId: string };

export type ReaderView =
  | { type: 'empty' }
  | { type: 'song'; songId: number; transpose: number; source: 'library' | 'setlist' | 'shared'; activeArrangementId: string | null; setlistId?: string; itemId?: string }
  | { type: 'marker'; label: string; setlistId: string; itemId: string }
  | { type: 'note'; label: string; content: string; setlistId: string; itemId: string };

export type ReaderMode = 'chords' | 'lyrics' | 'edit';

const READER_MODE_STORAGE_KEY = 'worship-reader-mode';

function getSavedReaderMode(): Exclude<ReaderMode, 'edit'> {
  if (typeof window === 'undefined') return 'lyrics';
  const saved = window.localStorage.getItem(READER_MODE_STORAGE_KEY);
  return saved === 'chords' || saved === 'lyrics' ? saved : 'lyrics';
}

interface WorkflowStore {
  sidebar: SidebarView;
  reader: ReaderView;
  readerMode: ReaderMode;
  mobileActivePane: 'sidebar' | 'reader';
  showSettings: boolean;
  showContextRail: boolean;
  libraryLanguage: string;
  setLibraryLanguage: (lang: string) => void;

  openSong: (id: number, source: 'library' | 'setlist' | 'shared', transpose?: number, setlistId?: string, itemId?: string) => void;
  openMarker: (label: string, setlistId: string, itemId: string) => void;
  openNote: (label: string, content: string, setlistId: string, itemId: string) => void;
  closeReader: () => void;
  openSetlist: (id: string) => void;
  closeSetlist: () => void;
  adjustTranspose: (delta: number) => void;
  setSidebarPanel: (panel: 'library' | 'setlist-list' | 'shared') => void;
  setReaderMode: (mode: ReaderMode) => void;
  setShowSettings: (show: boolean) => void;
  setShowContextRail: (show: boolean) => void;
  setActiveArrangementId: (id: string | null) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  sidebar: { panel: 'library' },
  reader: { type: 'empty' },
  readerMode: getSavedReaderMode(),
  mobileActivePane: 'sidebar',
  showSettings: false,
  showContextRail: false,
  libraryLanguage: 'All',
  setLibraryLanguage: (lang) => set({ libraryLanguage: lang }),

  openSong: (id, source, transpose = 0, setlistId, itemId) => set({
    reader: { type: 'song', songId: id, transpose, source, activeArrangementId: null, setlistId, itemId },
    readerMode: getSavedReaderMode(),
    mobileActivePane: 'reader',
  }),

  openMarker: (label, setlistId, itemId) => set({
    reader: { type: 'marker', label, setlistId, itemId },
    mobileActivePane: 'reader',
  }),

  openNote: (label, content, setlistId, itemId) => set({
    reader: { type: 'note', label, content, setlistId, itemId },
    mobileActivePane: 'reader',
  }),

  closeReader: () => set({
    reader: { type: 'empty' },
    mobileActivePane: 'sidebar',
  }),

  openSetlist: (id) => set({
    sidebar: { panel: 'setlist-detail', setlistId: id },
  }),

  closeSetlist: () => set({
    sidebar: { panel: 'setlist-list' },
  }),

  adjustTranspose: (delta) => set((state) => {
    if (state.reader.type !== 'song') return state;
    return { reader: { ...state.reader, transpose: state.reader.transpose + delta } };
  }),

  setSidebarPanel: (panel) => set({
    sidebar: panel === 'library' ? { panel: 'library' } : panel === 'shared' ? { panel: 'shared' } : { panel: 'setlist-list' },
  }),

  setReaderMode: (mode) => {
    if (mode === 'chords' || mode === 'lyrics') {
      window.localStorage.setItem(READER_MODE_STORAGE_KEY, mode);
    }
    set({ readerMode: mode });
  },

  setShowSettings: (show) => set({ showSettings: show }),

  setShowContextRail: (show) => set({ showContextRail: show }),

  setActiveArrangementId: (id) => set((state) => {
    if (state.reader.type !== 'song') return state;
    return { reader: { ...state.reader, activeArrangementId: id } };
  }),
}));
