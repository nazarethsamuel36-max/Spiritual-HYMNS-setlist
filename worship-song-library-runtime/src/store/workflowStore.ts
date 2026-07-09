import { create } from 'zustand';

export type SidebarView =
  | { panel: 'library' }
  | { panel: 'shared' }
  | { panel: 'setlist-list' }
  | { panel: 'setlist-detail'; setlistId: string }
  | { panel: 'personal' };

export type ReaderView =
  | { type: 'empty' }
  | { type: 'song'; songId: number; transpose: number; source: 'library' | 'setlist' | 'shared' | 'personal'; activeArrangementId: string | null; setlistId?: string; itemId?: string }
  | { type: 'marker'; label: string; setlistId: string; itemId: string }
  | { type: 'note'; label: string; content: string; setlistId: string; itemId: string };

export type ReaderMode = 'chords' | 'lyrics' | 'edit';

const READER_MODE_STORAGE_KEY = 'worship-reader-mode';
const FONT_SIZE_STORAGE_KEY = 'worship-font-size';

function getSavedReaderMode(): Exclude<ReaderMode, 'edit'> {
  if (typeof window === 'undefined') return 'lyrics';
  const saved = window.localStorage.getItem(READER_MODE_STORAGE_KEY);
  return saved === 'chords' || saved === 'lyrics' ? saved : 'lyrics';
}

function getSavedFontSize(): number {
  if (typeof window === 'undefined') return 18;
  const saved = window.localStorage.getItem(FONT_SIZE_STORAGE_KEY);
  const size = saved ? parseInt(saved, 10) : 18;
  return (size >= 12 && size <= 24) ? size : 18;
}

interface WorkflowStore {
  sidebar: SidebarView;
  reader: ReaderView;
  readerMode: ReaderMode;
  mobileActivePane: 'sidebar' | 'reader';
  showSettings: boolean;
  showContextRail: boolean;
  libraryLanguage: string;
  isAdminAuthenticated: boolean;
  fontSize: number;
  setLibraryLanguage: (lang: string) => void;
  setAdminAuthenticated: (value: boolean) => void;
  setFontSize: (size: number) => void;

  openSong: (id: number, source: 'library' | 'setlist' | 'shared' | 'personal', transpose?: number, setlistId?: string, itemId?: string) => void;
  openMarker: (label: string, setlistId: string, itemId: string) => void;
  openNote: (label: string, content: string, setlistId: string, itemId: string) => void;
  closeReader: () => void;
  openSetlist: (id: string) => void;
  closeSetlist: () => void;
  adjustTranspose: (delta: number) => void;
  setSidebarPanel: (panel: 'library' | 'setlist-list' | 'shared' | 'personal') => void;
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
  isAdminAuthenticated: false,
  fontSize: getSavedFontSize(),
  setLibraryLanguage: (lang) => set({ libraryLanguage: lang }),
  setAdminAuthenticated: (value) => set({ isAdminAuthenticated: value }),
  setFontSize: (size) => {
    const clampedSize = Math.max(12, Math.min(24, size));
    window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, clampedSize.toString());
    set({ fontSize: clampedSize });
  },

  openSong: (id, source, transpose = 0, setlistId, itemId) => set({
    reader: { type: 'song', songId: id, transpose, source, activeArrangementId: null, setlistId, itemId },
    readerMode: 'lyrics',
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
    sidebar: panel === 'library' ? { panel: 'library' } : panel === 'shared' ? { panel: 'shared' } : panel === 'personal' ? { panel: 'personal' } : { panel: 'setlist-list' },
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
