import { useEffect, useRef, useState } from 'react';
import { AppInitializer } from './services/AppInitializer';
import { SongList } from './components/SongList';
import { SongView } from './components/SongView';
import { ReaderItemView } from './components/reader/ReaderItemView';
import { SetlistManager } from './components/SetlistManager';
import { SetlistView } from './components/SetlistView';
import { SharedManager } from './components/SharedManager';
import { PersonalSongs } from './components/PersonalSongs';
import { SystemSettings } from './components/SystemSettings';
import { InstallPrompt } from './components/InstallPrompt';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ContextRail } from './components/ContextRail';
import { ConnectionStatus } from './components/ConnectionStatus';
import { SetupGatekeeper } from './components/SetupGatekeeper';
import { SetlistService } from './services/SetlistService';
import { useWorkflowStore } from './store/workflowStore';
import { useIsMobile } from './hooks/useMediaQuery';
import { db } from './db/Database';

function App() {
  // ==========================================
  // 1. ALL HOOKS MUST BE AT THE VERY TOP
  // ==========================================
  const isMobile = useIsMobile();
  const [showGatekeeper, setShowGatekeeper] = useState<boolean | null>(null);
  
  const sidebar = useWorkflowStore((s) => s.sidebar);
  const reader = useWorkflowStore((s) => s.reader);
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
          await db.sharedSongs.put({ ...songObj, id: targetId });
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
            for (const s of setlistObj.sharedSongsList) await db.sharedSongs.put(s);
          }
          const targetSetlistId = setlistObj.id || crypto.randomUUID();
          await db.sharedSetlists.put({ id: targetSetlistId, title: setlistObj.title, createdAt: setlistObj.createdAt || Date.now(), updatedAt: Date.now(), songs: setlistObj.songs || [] });
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
      const path = window.location.pathname;
      const songMatch = path.match(/^\/song\/(\d+)$/);
      if (songMatch) openSong(parseInt(songMatch[1], 10), 'library');
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

  useEffect(() => {
    if (!isMobile) return;
    if (mobileActivePane === 'reader') history.pushState({ pane: 'reader' }, '');
    const handlePopState = () => {
      const store = useWorkflowStore.getState();
      if (store.mobileActivePane === 'reader') closeReader();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobile, mobileActivePane]);

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

  const handleTitleTap = () => {
    titleTapCountRef.current += 1;
    if (titleTapTimerRef.current) window.clearTimeout(titleTapTimerRef.current);
    if (titleTapCountRef.current >= 5) {
      const username = window.prompt('Admin username')?.trim();
      const password = window.prompt('Admin password')?.trim();
      if (username === 'church' && password === 'shalom') {
        setAdminAuthenticated(true);
        alert('Admin unlocked');
      } else {
        alert('Invalid admin credentials');
      }
      titleTapCountRef.current = 0;
      if (titleTapTimerRef.current) window.clearTimeout(titleTapTimerRef.current);
      return;
    }
    titleTapTimerRef.current = window.setTimeout(() => { titleTapCountRef.current = 0; }, 1500);
  };

  // ==========================================
  // 4. EARLY RETURN (MUST BE AT THE VERY BOTTOM)
  // ==========================================
  if (showGatekeeper === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-black text-[var(--color-brand)]">BBF Song book</h1>
          <p className="text-slate-400 mt-2">Loading library...</p>
        </div>
      </div>
    );
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
              <header className="sidebar-header">
                <div className="flex justify-between items-center w-full">
                  <button type="button" onClick={handleTitleTap} className="hidden md:block text-lg font-black text-[var(--color-brand)] tracking-tighter uppercase italic select-none">BBF Song book</button>
                  <button type="button" onClick={handleTitleTap} className="md:hidden text-[19px] font-black text-slate-900 tracking-tight leading-none hover:opacity-70 transition-opacity active:scale-95 select-none" title="Tap 5 times to unlock admin mode">BBF Song book</button>
                  {isAdminAuthenticated && (
                    <button type="button" onClick={() => setAdminAuthenticated(false)} className="mr-2 text-base transition-transform hover:scale-110" title="Exit admin" aria-label="Exit admin">🔑</button>
                  )}
                  <PWAInstallButton />
                  <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-[var(--color-brand)] rounded-full transition-all" aria-label="Settings">
                    <div className='w-2.5 h-2.5 rounded-full bg-emerald-400' />
                  </button>
                </div>
                <nav className="hidden md:flex items-center space-x-1 mt-2 bg-slate-200/50 p-1 rounded-lg">
                  <button onClick={() => setSidebarPanel('library')} className={`flex-1 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${isSongsTab ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Songs</button>
                  <button onClick={() => setSidebarPanel('shared')} className={`flex-1 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${sidebar.panel === 'shared' ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Shared</button>
                  <button onClick={() => setSidebarPanel('setlist-list')} className={`flex-1 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${isSetlistTab ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Setlists</button>
                  <button onClick={() => setSidebarPanel('personal')} className={`flex-1 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${isPersonalTab ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Personal</button>
                </nav>
              </header>
              <div className="sidebar-content hide-scrollbar">
                {(sidebar.panel === 'library') && <div className="animate-in fade-in duration-300"><SongList /></div>}
                {(sidebar.panel === 'shared') && <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 pt-3"><SharedManager /></div>}
                {(sidebar.panel === 'setlist-list') && <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 pt-3"><SetlistManager /></div>}
                {(sidebar.panel === 'setlist-detail') && <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 pt-3"><SetlistView setlistId={sidebar.setlistId} /></div>}
                {(sidebar.panel === 'personal') && <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 pt-3"><PersonalSongs /></div>}
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
                <div className="flex-1 flex flex-col items-center justify-center bg-[#FAFAFA] h-full">
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
          <ConnectionStatus />
        </div>
      )}
    </>
  );
}

export default App;
