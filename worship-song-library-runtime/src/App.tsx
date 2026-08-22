import { useEffect, useRef, useState } from 'react';
import { AppInitializer } from './services/AppInitializer';
import { SongList } from './components/SongList';
import { SongView } from './components/SongView';
import { ReaderItemView } from './components/reader/ReaderItemView';
import { SetlistManager } from './components/SetlistManager';
import { SetlistView } from './components/SetlistView';
import { SharedManager } from './components/SharedManager';
import { PersonalSongs } from './components/PersonalSongs';
import { MyVersions } from './components/MyVersions';
import { SystemSettings } from './components/SystemSettings';
import { InstallPrompt } from './components/InstallPrompt';
import { ContextRail } from './components/ContextRail';
import { SetupGatekeeper } from './components/SetupGatekeeper';
import { SetlistService } from './services/SetlistService';
import { useWorkflowStore } from './store/workflowStore';
import { useIsMobile } from './hooks/useMediaQuery';
import { db, ensureUid } from './db/Database';
import { generateUUID } from './utils/uuid';
import { batchDownloadSongs, wakeUpSync } from './services/DataService';
import { ShareService } from './services/ShareService';
import { authenticateDevice, clearAdminSession } from './services/DeviceAuthService';
import { AdminScreen } from './components/AdminScreen';


function App() {
  // ==========================================
  // 1. ALL HOOKS MUST BE AT THE VERY TOP
  // ==========================================
  const isMobile = useIsMobile();
  const [showGatekeeper, setShowGatekeeper] = useState<boolean | null>(null);
  const [personalTab, setPersonalTab] = useState<'songs' | 'versions'>('songs');
  const [syncToast, setSyncToast] = useState<'idle' | 'syncing' | 'done'>('idle');
  const [isSyncingHeader, setIsSyncingHeader] = useState(false);
  const [shareImportLoading, setShareImportLoading] = useState<string | null>(null);
  const [showAdminScreen, setShowAdminScreen] = useState(false);
  const [showAdminButton, setShowAdminButton] = useState(false);
  
  const sidebar = useWorkflowStore((s) => s.sidebar);
  const reader = useWorkflowStore((s) => s.reader);
  const readerMode = useWorkflowStore((s) => s.readerMode);
  const mobileActivePane = useWorkflowStore((s) => s.mobileActivePane);
  const showSettings = useWorkflowStore((s) => s.showSettings);
  const showContextRail = useWorkflowStore((s) => s.showContextRail);
  const isAdminAuthenticated = useWorkflowStore((s) => s.isAdminAuthenticated);
  const setAdminAuthenticated = useWorkflowStore((s) => s.setAdminAuthenticated);
  const openSong = useWorkflowStore((s) => s.openSong);
  const openSetlist = useWorkflowStore((s) => s.openSetlist);
  const setSidebarPanel = useWorkflowStore((s) => s.setSidebarPanel);
  const setShowSettings = useWorkflowStore((s) => s.setShowSettings);
  const closeReader = useWorkflowStore((s) => s.closeReader);
  const librarySearchActive = useWorkflowStore((s) => s.librarySearchActive);
  const librarySearchQuery = useWorkflowStore((s) => s.librarySearchQuery);
  const setLibrarySearchActive = useWorkflowStore((s) => s.setLibrarySearchActive);
  const setLibrarySearchQuery = useWorkflowStore((s) => s.setLibrarySearchQuery);
  const closeLibrarySearch = useWorkflowStore((s) => s.closeLibrarySearch);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const titleTapCountRef = useRef(0);
  const titleTapTimerRef = useRef<number | null>(null);

  // ==========================================
  // 2. ALL USE_EFFECTS MUST BE HERE
  // ==========================================
  

  useEffect(() => {
    const initializeApp = async () => {
      const result = await AppInitializer.initialize();
      
      console.log('App.tsx received InitializationResult');
      console.log('Result status:', result.status);
      console.log('Needs initial download:', result.needsInitialDownload);
      console.log('Errors:', result.errors);
      console.log('Duration:', result.duration);
      
      // Set UI state based on database check
      console.log('Setting showGatekeeper:');
      console.log(result.needsInitialDownload ? 'true' : 'false');
      // Always disable gatekeeper - show download button in SongList header instead
      setShowGatekeeper(false);
      if (new URLSearchParams(window.location.search).has('admin_enroll')) setShowAdminScreen(true);
      console.log('showGatekeeper updated');
    };

    void initializeApp();

    // Keep existing event forwarding unchanged
    const handleSongUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      window.dispatchEvent(new CustomEvent('app-data-changed', { detail: customEvent.detail }));
    };
    window.addEventListener('song-updated', handleSongUpdate);
  
    return () => {
      window.removeEventListener('song-updated', handleSongUpdate);
      AppInitializer.destroy();
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const importSongData = params.get('import_song');
      if (importSongData) {
        try {
          const decoded = decodeURIComponent(escape(atob(importSongData)));
          const songObj = JSON.parse(decoded);
          const targetId = songObj.id || (Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000));
          await db.sharedSongs.put({ ...songObj, id: targetId, uid: ensureUid(songObj) });
          alert(`Imported shared song: "${songObj.title}"`);
          setSidebarPanel('shared');
          window.history.replaceState({}, '', window.location.pathname);
        } catch (e) { alert('Failed to import song.'); }
      }
      const importSetlistData = params.get('import_setlist');
      if (importSetlistData) {
        try {
          const decoded = decodeURIComponent(escape(atob(importSetlistData)));
          const setlistObj = JSON.parse(decoded);
          if (setlistObj.sharedSongsList && Array.isArray(setlistObj.sharedSongsList)) {
            for (const s of setlistObj.sharedSongsList) {
              if (s && typeof s === 'object' && 'id' in s) await db.sharedSongs.put({ ...s, uid: ensureUid(s) });
              else await db.sharedSongs.put(s);
            }
          }
          const targetSetlistId = setlistObj.id || generateUUID();
          await db.sharedSetlists.put({ id: targetSetlistId, uid: ensureUid({ uid: setlistObj.uid }), title: setlistObj.title, createdAt: setlistObj.createdAt || Date.now(), updatedAt: Date.now(), songs: setlistObj.songs || [] });
          alert(`Imported shared setlist: "${setlistObj.title}"`);
          setSidebarPanel('shared');
          openSetlist(targetSetlistId);
          window.history.replaceState({}, '', window.location.pathname);
        } catch (e) { alert('Failed to import setlist.'); }
      }
      const sharedSetlist = params.get('setlist');
      if (sharedSetlist) {
        const ids = sharedSetlist.split(',').map(Number).filter(n => !isNaN(n));
        if (ids.length > 0) {
          const id = await SetlistService.createSetlist(`Shared: ${new Date().toLocaleDateString()}`);
          for (const songId of ids) await SetlistService.addSongToSetlist(id, songId);
          openSetlist(id);
          window.history.replaceState({}, '', window.location.pathname);
        }
      }

      // ── Remote Short Link Share Import ──
      const path = window.location.pathname;
      const shareMatch = path.match(/^\/s\/([a-zA-Z0-9\-_]{12})$/);
      if (shareMatch) {
        const shareId = shareMatch[1];
        setShareImportLoading('Retrieving shared content...');
        try {
          const shareData = await ShareService.fetchShare(shareId);
          if (!shareData) {
            throw new Error('This share link does not exist or has expired.');
          }
          const { remappedId } = await ShareService.importShare(shareData.type, shareData.payload);
          
          if (shareData.type === 'song') {
            alert('Successfully imported shared song!');
            setSidebarPanel('shared');
            openSong(remappedId as number, 'shared');
          } else if (shareData.type === 'version') {
            alert('Successfully imported version!');
            const version = await db.versions.get(remappedId as string);
            if (version) {
              setSidebarPanel('library');
              openSong(version.sourceSongId, 'library', 0, undefined, undefined, version.uid);
            }
          } else if (shareData.type === 'setlist') {
            alert('Successfully imported shared setlist!');
            setSidebarPanel('shared');
            openSetlist(remappedId as string);
          }
        } catch (e: any) {
          if (e.name === 'ShareError') {
            alert(`${e.title}\n\n${e.message}`);
          } else {
            alert(`Couldn't import shared content\n\n${e.message || 'An unexpected error occurred.'}`);
          }
        } finally {
          setShareImportLoading(null);
          window.history.replaceState({}, '', '/');
        }
      } else {
        const songMatch = path.match(/^\/song\/(\d+)$/);
        if (songMatch) openSong(parseInt(songMatch[1], 10), 'library');
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (reader.type === 'song') {
      let url = `/song/${reader.songId}`;
      if (reader.activeArrangementId) url += `/arrangement/${reader.activeArrangementId}`;
      history.replaceState(null, '', url);
    } else if (sidebar.panel === 'setlist-detail') {
      history.replaceState(null, '', `/setlist/${sidebar.setlistId}`);
    } else {
      history.replaceState(null, '', '/');
    }
  }, [reader, sidebar]);

  const readerPushedRef = useRef(false);
  const editPushedRef = useRef(false);
  const setlistDetailPushedRef = useRef(false);

  useEffect(() => {
    if (!isMobile) return;
    const inSetlistDetail = sidebar.panel === 'setlist-detail';
    if (inSetlistDetail && !setlistDetailPushedRef.current) {
      setlistDetailPushedRef.current = true;
      history.pushState({ setlistDetail: true }, '');
    }
    if (!inSetlistDetail) setlistDetailPushedRef.current = false;
    const enteringReader = mobileActivePane === 'reader';
    if (enteringReader && !readerPushedRef.current) {
      readerPushedRef.current = true;
      history.pushState({ pane: 'reader' }, '');
    }
    if (readerMode === 'edit' && !editPushedRef.current) {
      editPushedRef.current = true;
      history.pushState({ edit: true }, '');
    }
    if (mobileActivePane !== 'reader') readerPushedRef.current = false;
    if (readerMode !== 'edit') editPushedRef.current = false;
    const handlePopState = () => {
      const store = useWorkflowStore.getState();
      if (store.librarySearchActive) {
        closeLibrarySearch();
        return;
      }
      if (store.readerMode === 'edit') {
        store.setReaderMode(store.lastReaderMode);
        return;
      }
      if (store.mobileActivePane === 'reader') {
        closeReader();
        return;
      }
      if (store.sidebar.panel === 'setlist-detail') {
        store.closeSetlist();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobile, mobileActivePane, readerMode, sidebar.panel, closeReader, closeLibrarySearch]);

  // Focus the search input as soon as the search header state opens
  useEffect(() => {
    if (librarySearchActive) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [librarySearchActive]);

  // Mobile: opening search pushes a history entry so device back exits search
  useEffect(() => {
    if (!isMobile) return;
    if (librarySearchActive) history.pushState({ search: true }, '');
    const handlePopState = () => {
      const store = useWorkflowStore.getState();
      if (store.librarySearchActive) closeLibrarySearch();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobile, librarySearchActive, closeLibrarySearch]);

  // Close the search header with the Escape key (desktop)
  useEffect(() => {
    if (!librarySearchActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLibrarySearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [librarySearchActive, closeLibrarySearch]);

  // Close search when the user navigates away from the Songs tab
  useEffect(() => {
    if (sidebar.panel !== 'library' && librarySearchActive) {
      closeLibrarySearch();
    }
  }, [sidebar.panel, librarySearchActive, closeLibrarySearch]);

  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const handlePopState = () => {
      setAdminAuthenticated(false);
      closeReader();
      setSidebarPanel('library');
      window.history.replaceState({ adminMode: false }, '', '/');
    };

    window.history.pushState({ adminMode: true }, '', window.location.pathname + window.location.search);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminAuthenticated, setAdminAuthenticated, closeReader, setSidebarPanel]);

  // ==========================================
  // 3. VARIABLES & FUNCTIONS
  // ==========================================
  const isSongsTab = sidebar.panel === 'library' || (reader.type === 'song' && reader.source === 'library');
  const isSetlistTab = sidebar.panel === 'setlist-list' || sidebar.panel === 'setlist-detail' || (reader.type === 'song' && reader.source === 'setlist');
  const isPersonalTab = sidebar.panel === 'personal' || (reader.type === 'song' && reader.source === 'personal');
  const showSidebar = !isMobile || mobileActivePane === 'sidebar';
  const showReader = !isMobile || mobileActivePane === 'reader';
  const hasActiveSong = reader.type === 'song' || reader.type === 'marker' || reader.type === 'note';

  console.log('Layout debug:', { isMobile, showSidebar, showReader, sidebarPanel: sidebar.panel });

  const handleTitleTap = async () => {
    titleTapCountRef.current += 1;
    if (titleTapTimerRef.current) window.clearTimeout(titleTapTimerRef.current);
    if (titleTapCountRef.current >= 5) {
      titleTapCountRef.current = 0;
      if (titleTapTimerRef.current) window.clearTimeout(titleTapTimerRef.current);

      const session = await authenticateDevice();
      if (session) {
        setAdminAuthenticated(true);
        setShowAdminButton(true);
        setShowAdminScreen(true);
        return;
      }
      setShowAdminScreen(true);
      return;
    }
    titleTapTimerRef.current = window.setTimeout(() => { titleTapCountRef.current = 0; }, 1500);
  };
  void handleTitleTap;

  const handleExitAdminMode = () => {
    clearAdminSession();
    setAdminAuthenticated(false);
    setShowAdminScreen(false);
    setShowAdminButton(false);
    closeReader();
    setSidebarPanel('library');
    window.history.replaceState({ adminMode: false }, '', '/');
  };

  const handleAdminClose = () => {
    setShowAdminScreen(false);
    if (isAdminAuthenticated) window.history.replaceState({ adminMode: false }, '', '/');
  };

  const handleBootstrapped = async () => {
    const session = await authenticateDevice();
    if (!session) throw new Error('Device created, but admin sign-in could not be completed. Tap the title five times again.');
    setAdminAuthenticated(true);
    setShowAdminButton(true);
  };

  const handleHeaderSync = async () => {
    if (isSyncingHeader) return;
    setIsSyncingHeader(true);
    setSyncToast('syncing');
    try {
      // Run sync (patches changed songs) + download (pulls new songs)
      await wakeUpSync('manual');
      await batchDownloadSongs(() => {});
    } catch (e) {
      console.error('Header sync failed:', e);
    } finally {
      setIsSyncingHeader(false);
      setSyncToast('done');
      setTimeout(() => setSyncToast('idle'), 2000);
    }
  };

  // ==========================================
  // 4. EARLY RETURN (MUST BE AT THE VERY BOTTOM)
  // ==========================================
  if (shareImportLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-surface)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-black text-slate-800">BBF Song book</h1>
          <p className="text-slate-400 mt-2">{shareImportLoading}</p>
        </div>
      </div>
    );
  }

  if (showGatekeeper === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-surface)]">
        <div className="text-center">
          <h1 className="text-2xl font-black text-[var(--color-brand)]">BBF Song book</h1>
          <p className="text-slate-400 mt-2">Loading library...</p>
        </div>
      </div>
    );
  }

  if (showAdminScreen) {
    return <AdminScreen authenticated={isAdminAuthenticated} onClose={handleAdminClose} onExit={handleExitAdminMode} onBootstrapped={handleBootstrapped} />;
  }

  // ==========================================
  // 5. MAIN APP RETURN
  // ==========================================
  return (
    <>
      {showGatekeeper ? (
        <SetupGatekeeper onComplete={() => setShowGatekeeper(false)} />
      ) : (
        <div className="app-shell">
          {showSidebar && (
          <div className="sidebar-pane">
              {/* Sync toast — fixed so it floats above header */}
              {syncToast !== 'idle' && (
                <div
                  className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 px-4 py-2 rounded-full shadow-xl text-sm font-semibold text-white pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{ background: syncToast === 'done' ? '#0F172A' : '#1E293B' }}
                >
                  {syncToast === 'syncing' ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Up to date
                    </>
                  )}
                </div>
              )}
              <header className="sidebar-header">
                {librarySearchActive && isSongsTab ? (
                  /* Search header state — occupies the entire header */
                  <div className="flex items-center w-full gap-2">
                    <button
                      type="button"
                      onClick={closeLibrarySearch}
                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all active:scale-95"
                      aria-label="Close search"
                      title="Close search"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="relative flex-1 min-w-0">
                      <input
                        ref={searchInputRef}
                        id="library-search-input"
                        type="text"
                        value={librarySearchQuery}
                        onChange={(e) => setLibrarySearchQuery(e.target.value)}
                        placeholder="Search songs, numbers, lyrics..."
                        className="w-full pl-4 pr-10 py-2.5 rounded-full border-none bg-slate-100 focus:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all text-[15px] font-medium text-slate-800 placeholder-slate-400"
                      />
                      <svg className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <>
                <div className="flex justify-between items-center w-full">
                  <button type="button" className="hidden md:block text-lg font-black text-[var(--color-brand)] tracking-tighter uppercase italic select-none">BBF Song book</button>
                  <button type="button" className="md:hidden text-[19px] font-black text-slate-900 tracking-tight leading-none hover:opacity-70 transition-opacity active:scale-95 select-none">BBF Song book</button>
                  {(isAdminAuthenticated || showAdminButton) && (
                    <button type="button" onClick={() => setShowAdminScreen(true)} className="mr-2 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-800" title="Open admin screen">Admin</button>
                  )}
                  <div className="flex items-center gap-1">
                    {isSongsTab && (
                      <button onClick={() => setLibrarySearchActive(true)} className="p-2 text-blue-600 hover:text-blue-700 rounded-full transition-all" aria-label="Search songs" title="Search songs">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    )}
                    {/* Sync/Refresh button */}
                    <button
                      onClick={handleHeaderSync}
                      disabled={isSyncingHeader}
                      className="p-2 text-slate-400 hover:text-[var(--color-brand)] rounded-full transition-all disabled:opacity-50"
                      aria-label="Sync library"
                      title="Sync library"
                    >
                      <svg
                        className={`w-5 h-5 ${isSyncingHeader ? 'animate-spin' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-[var(--color-brand)] rounded-full transition-all" aria-label="Settings" title="Settings">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <nav className="hidden md:flex items-center space-x-1 mt-2 bg-slate-200/50 p-1 rounded-lg">
                  <button onClick={() => setSidebarPanel('library')} className={`flex-1 py-1.5 rounded-md text-xs font-black tracking-widest transition-all ${isSongsTab ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Songs</button>
                  <button onClick={() => setSidebarPanel('shared')} className={`flex-1 py-1.5 rounded-md text-xs font-black tracking-widest transition-all ${sidebar.panel === 'shared' ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Shared</button>
                  <button onClick={() => setSidebarPanel('setlist-list')} className={`flex-1 py-1.5 rounded-md text-xs font-black tracking-widest transition-all ${isSetlistTab ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Setlists</button>
                  <button onClick={() => setSidebarPanel('personal')} className={`flex-1 py-1.5 rounded-md text-xs font-black tracking-widest transition-all ${isPersonalTab ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Personal</button>
                </nav>
                  </>
                )}
              </header>
              <div className="sidebar-content hide-scrollbar">
                {(sidebar.panel === 'library') && <div className="animate-in fade-in duration-300"><SongList /></div>}
                {(sidebar.panel === 'shared') && <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 pt-3"><SharedManager /></div>}
                {(sidebar.panel === 'setlist-list') && <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 pt-3"><SetlistManager /></div>}
                {(sidebar.panel === 'setlist-detail') && <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 pt-3"><SetlistView setlistId={sidebar.setlistId} /></div>}
                {(sidebar.panel === 'personal') && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 pt-3">
                    <div className="flex items-center gap-1 p-1 mb-2 bg-slate-200/50 rounded-lg">
                      <button
                        onClick={() => setPersonalTab('songs')}
                        className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${personalTab === 'songs' ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        My Songs
                      </button>
                      <button
                        onClick={() => setPersonalTab('versions')}
                        className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${personalTab === 'versions' ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        My Versions
                      </button>
                    </div>
                    {personalTab === 'songs' ? <PersonalSongs /> : <MyVersions />}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {showReader && (
            <div className="reader-pane">
              {hasActiveSong ? (
                <div className="flex-1 flex flex-col h-full w-full overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                  {reader.type === 'song' && <SongView />}
                  {(reader.type === 'marker' || reader.type === 'note') && (
                    <ReaderItemView item={{ type: reader.type, label: reader.label, content: reader.type === 'note' ? reader.content : undefined, setlistId: reader.setlistId, itemId: reader.itemId }} onClose={closeReader} />
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-reader-surface)] h-full">
                  <div className="max-w-md text-center px-6">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-3">BBF Song book</h2>
                    <p className="text-sm text-slate-500 mb-10 leading-relaxed">Select a song from the library or choose a setlist sequence to begin reading.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isMobile && showContextRail && hasActiveSong && <ContextRail />}

          {isMobile && mobileActivePane === 'sidebar' && (
            <nav className="mobile-bottom-nav">
              <button id="mobile-nav-songs" onClick={() => setSidebarPanel('library')} className={`mobile-bottom-nav-btn ${isSongsTab ? 'mobile-bottom-nav-btn--active' : ''}`}>
                <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span>Songs</span>
              </button>
              <button id="mobile-nav-shared" onClick={() => setSidebarPanel('shared')} className={`mobile-bottom-nav-btn ${sidebar.panel === 'shared' ? 'mobile-bottom-nav-btn--active' : ''}`}>
                <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Shared</span>
              </button>
              <button id="mobile-nav-setlists" onClick={() => setSidebarPanel('setlist-list')} className={`mobile-bottom-nav-btn ${isSetlistTab ? 'mobile-bottom-nav-btn--active' : ''}`}>
                <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Setlists</span>
              </button>
              <button id="mobile-nav-personal" onClick={() => setSidebarPanel('personal')} className={`mobile-bottom-nav-btn ${isPersonalTab ? 'mobile-bottom-nav-btn--active' : ''}`}>
                <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Personal</span>
              </button>
            </nav>
          )}

          {showSettings && <SystemSettings onClose={() => setShowSettings(false)} />}
          <InstallPrompt />
        </div>
      )}
    </>
  );
}

export default App;
