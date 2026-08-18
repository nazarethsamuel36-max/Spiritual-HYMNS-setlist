import { create } from 'zustand';

export type SidebarView =
  | { panel: 'library' }
  | { panel: 'shared' }
  | { panel: 'setlist-list' }
  | { panel: 'setlist-detail'; setlistId: string }
  | { panel: 'personal' };

export type SongKind = 'official' | 'personal' | 'shared';

export type ReaderView =
  | { type: 'empty' }
  | { type: 'song'; songId: number; transpose: number; source: 'library' | 'setlist' | 'shared' | 'personal'; activeArrangementId: string | null; refKind?: SongKind; setlistId?: string; itemId?: string }
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
  if (typeof window === 'undefined') return 24;
  const saved = window.localStorage.getItem(FONT_SIZE_STORAGE_KEY);
  const size = saved ? parseInt(saved, 10) : 24;
  return (size >= 12 && size <= 24) ? size : 24;
}

interface WorkflowStore {
  sidebar: SidebarView;
  reader: ReaderView;
  readerMode: ReaderMode;
  lastReaderMode: Exclude<ReaderMode, 'edit'>;
  mobileActivePane: 'sidebar' | 'reader';
  showSettings: boolean;
  showContextRail: boolean;
  libraryLanguage: string;
  isAdminAuthenticated: boolean;
  fontSize: number;
  librarySearchActive: boolean;
  librarySearchQuery: string;
  setLibraryLanguage: (lang: string) => void;
  setAdminAuthenticated: (value: boolean) => void;
  setFontSize: (size: number) => void;
  setLibrarySearchActive: (active: boolean) => void;
  setLibrarySearchQuery: (query: string) => void;
  closeLibrarySearch: () => void;

  openSong: (id: number, source: 'library' | 'setlist' | 'shared' | 'personal', transpose?: number, setlistId?: string, itemId?: string, versionId?: string, refKind?: SongKind) => void;
  openMarker: (label: string, setlistId: string, itemId: string) => void;
  openNote: (label: string, content: string, setlistId: string, itemId: string) => void;
  closeReader: () => void;
  openSetlist: (id: string) => void;
  closeSetlist: () => void;
  adjustTranspose: (delta: number) => void;
  resetTranspose: () => void;
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
  lastReaderMode: 'lyrics',
  mobileActivePane: 'sidebar',
  showSettings: false,
  showContextRail: false,
  libraryLanguage: 'English',
  isAdminAuthenticated: false,
  fontSize: getSavedFontSize(),
  librarySearchActive: false,
  librarySearchQuery: '',
  setLibraryLanguage: (lang) => set({ libraryLanguage: lang }),
  setAdminAuthenticated: (value) => set({ isAdminAuthenticated: value }),
  setFontSize: (size) => {
    const clampedSize = Math.max(12, Math.min(24, size));
    window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, clampedSize.toString());
    set({ fontSize: clampedSize });
  },
  setLibrarySearchActive: (active) => set({ librarySearchActive: active }),
  setLibrarySearchQuery: (query) => set({ librarySearchQuery: query }),
  closeLibrarySearch: () => set({ librarySearchActive: false, librarySearchQuery: '' }),

  openSong: (id, source, transpose = 0, setlistId, itemId, versionId, refKind) => {
    set({
      reader: { type: 'song', songId: id, transpose, source, activeArrangementId: versionId ?? null, refKind, setlistId, itemId },
      readerMode: 'lyrics',
      mobileActivePane: 'reader'
    });
  },

  openMarker: (label, setlistId, itemId) => set({
    reader: { type: 'marker', label, setlistId, itemId },
    mobileActivePane: 'reader',
  }),

  openNote: (label, content, setlistId, itemId) => set({
    reader: { type: 'note', label, content, setlistId, itemId },
    mobileActivePane: 'reader',
  }),

  closeReader: () => set((state) => {
    // If the reader was opened from a setlist, return to that setlist detail view
    const r = state.reader;
    const setlistId = r.type !== 'empty' ? r.setlistId : undefined;
    return {
      reader: { type: 'empty' },
      mobileActivePane: 'sidebar',
      sidebar: setlistId ? { panel: 'setlist-detail', setlistId } : state.sidebar,
    };
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

  resetTranspose: () => set((state) => {
    if (state.reader.type !== 'song') return state;
    return { reader: { ...state.reader, transpose: 0 } };
  }),

  setSidebarPanel: (panel) => set({
    sidebar: panel === 'library' ? { panel: 'library' } : panel === 'shared' ? { panel: 'shared' } : panel === 'personal' ? { panel: 'personal' } : { panel: 'setlist-list' },
  }),

  setReaderMode: (mode) => {
    if (mode === 'chords' || mode === 'lyrics') {
      window.localStorage.setItem(READER_MODE_STORAGE_KEY, mode);
      set({ readerMode: mode, lastReaderMode: mode });
    } else {
      set({ readerMode: mode });
    }
  },

  setShowSettings: (show) => set({ showSettings: show }),

  setShowContextRail: (show) => set({ showContextRail: show }),

  setActiveArrangementId: (id) => set((state) => {
    if (state.reader.type !== 'song') return state;
    return { reader: { ...state.reader, activeArrangementId: id } };
  }),
}));
