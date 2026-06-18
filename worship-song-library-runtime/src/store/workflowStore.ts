import { create } from 'zustand';

export type SidebarView =
  | { panel: 'library' }
  | { panel: 'shared' }
  | { panel: 'setlist-list' }
  | { panel: 'setlist-detail'; setlistId: string };

export type ReaderView =
  | { type: 'empty' }
  | { type: 'song'; songId: number; transpose: number; source: 'library' | 'setlist' | 'shared'; activeArrangementId: string | null };

export type ReaderMode = 'chords' | 'lyrics' | 'edit';

interface WorkflowStore {
  sidebar: SidebarView;
  reader: ReaderView;
  readerMode: ReaderMode;
  mobileActivePane: 'sidebar' | 'reader';
  showSettings: boolean;
  showContextRail: boolean;

  openSong: (id: number, source: 'library' | 'setlist' | 'shared', transpose?: number) => void;
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
  readerMode: 'chords',
  mobileActivePane: 'sidebar',
  showSettings: false,
  showContextRail: false,

  openSong: (id, source, transpose = 0) => set({
    reader: { type: 'song', songId: id, transpose, source, activeArrangementId: null },
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

  setReaderMode: (mode) => set({ readerMode: mode }),

  setShowSettings: (show) => set({ showSettings: show }),

  setShowContextRail: (show) => set({ showContextRail: show }),

  setActiveArrangementId: (id) => set((state) => {
    if (state.reader.type !== 'song') return state;
    return { reader: { ...state.reader, activeArrangementId: id } };
  }),
}));
