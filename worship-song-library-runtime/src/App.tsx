import { useEffect } from 'react';
import { SyncService } from './services/SyncService';
import { SongList } from './components/SongList';
import { SongView } from './components/SongView';
import { SetlistManager } from './components/SetlistManager';
import { SetlistView } from './components/SetlistView';
import { SharedManager } from './components/SharedManager';
import { SystemSettings } from './components/SystemSettings';
import { ContextRail } from './components/ContextRail';
import { SetlistService } from './services/SetlistService';
import { useWorkflowStore } from './store/workflowStore';
import { useIsMobile } from './hooks/useMediaQuery';
import { useState } from 'react';
import { db } from './db/Database';

function App() {
  const [syncing, setSyncing] = useState(true);
  const isMobile = useIsMobile();

  const sidebar = useWorkflowStore((s) => s.sidebar);
  const reader = useWorkflowStore((s) => s.reader);
  const mobileActivePane = useWorkflowStore((s) => s.mobileActivePane);
  const showSettings = useWorkflowStore((s) => s.showSettings);
  const showContextRail = useWorkflowStore((s) => s.showContextRail);

  const openSong = useWorkflowStore((s) => s.openSong);
  const openSetlist = useWorkflowStore((s) => s.openSetlist);
  const setSidebarPanel = useWorkflowStore((s) => s.setSidebarPanel);
  const setShowSettings = useWorkflowStore((s) => s.setShowSettings);
  const closeReader = useWorkflowStore((s) => s.closeReader);

  // Determine which sidebar tab is active
  const isSongsTab = sidebar.panel === 'library' || (reader.type === 'song' && reader.source === 'library');
  const isSetlistTab = sidebar.panel === 'setlist-list' || sidebar.panel === 'setlist-detail' || (reader.type === 'song' && reader.source === 'setlist');

  // Visibility logic
  const showSidebar = !isMobile || mobileActivePane === 'sidebar';
  const showReader = !isMobile || mobileActivePane === 'reader';
  const hasActiveSong = reader.type === 'song';

  // Initialize: sync + handle shared setlist URL + popstate for mobile back
  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      
      // Handle import_song
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
        } catch (e) {
          console.error('Failed to import song:', e);
          alert('Failed to import song. Link might be corrupted.');
        }
      }

      // Handle import_setlist
      const importSetlistData = params.get('import_setlist');
      if (importSetlistData) {
        try {
          const decoded = decodeURIComponent(escape(atob(importSetlistData)));
          const setlistObj = JSON.parse(decoded);
          
          if (setlistObj.sharedSongsList && Array.isArray(setlistObj.sharedSongsList)) {
            for (const s of setlistObj.sharedSongsList) {
              await db.sharedSongs.put(s);
            }
          }

          const targetSetlistId = setlistObj.id || crypto.randomUUID();
          await db.sharedSetlists.put({
            id: targetSetlistId,
            title: setlistObj.title,
            createdAt: setlistObj.createdAt || Date.now(),
            updatedAt: Date.now(),
            songs: setlistObj.songs || []
          });

          alert(`Imported shared workflow: "${setlistObj.title}"`);
          setSidebarPanel('shared');
          openSetlist(targetSetlistId);
          window.history.replaceState({}, '', window.location.pathname);
        } catch (e) {
          console.error('Failed to import setlist:', e);
          alert('Failed to import setlist. Link might be corrupted.');
        }
      }

      const sharedSetlist = params.get('setlist');
      if (sharedSetlist) {
        const ids = sharedSetlist.split(',').map(Number).filter(n => !isNaN(n));
        if (ids.length > 0) {
          const id = await SetlistService.createSetlist(`Shared: ${new Date().toLocaleDateString()}`);
          for (const songId of ids) {
            await SetlistService.addSongToSetlist(id, songId);
          }
          openSetlist(id);
          window.history.replaceState({}, '', window.location.pathname);
        }
      }

      // Parse deep link on cold start
      const path = window.location.pathname;
      const songMatch = path.match(/^\/song\/(\d+)$/);
      if (songMatch) {
        openSong(parseInt(songMatch[1], 10), 'library');
      }

      await SyncService.sync();
      setSyncing(false);

      // Kick off background download of all song details to ensure 100% offline access
      SyncService.downloadAllSongs((current, total) => {
        console.log(`Background caching progress: ${current}/${total}`);
      }).catch(err => {
        console.error('Background song cache prefetch failed:', err);
      });
    };
    init();
  }, []);

  // URL sync: reflect workflow state in URL
  useEffect(() => {
    if (reader.type === 'song') {
      let url = `/song/${reader.songId}`;
      if (reader.activeArrangementId) {
        url += `/arrangement/${reader.activeArrangementId}`;
      }
      history.replaceState(null, '', url);
    } else if (sidebar.panel === 'setlist-detail') {
      history.replaceState(null, '', `/setlist/${sidebar.setlistId}`);
    } else {
      history.replaceState(null, '', '/');
    }
  }, [reader, sidebar]);

  // Mobile back button support
  useEffect(() => {
    if (!isMobile) return;

    // Push a history entry when reader opens on mobile
    if (mobileActivePane === 'reader') {
      history.pushState({ pane: 'reader' }, '');
    }

    const handlePopState = () => {
      const store = useWorkflowStore.getState();
      if (store.mobileActivePane === 'reader') {
        closeReader();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobile, mobileActivePane]);

  return (
    <div className="app-shell">

      {/* ═══ SIDEBAR PANE ═══ */}
      {showSidebar && (
        <div className="sidebar-pane">

          {/* Sidebar Header */}
          <header className="sidebar-header">
            {/* Desktop: Show title + tabs. Mobile: Show only status dot */}
            <div className="flex justify-between items-center w-full">
              <h1 className="hidden md:block text-lg font-black text-[var(--color-brand)] tracking-tighter uppercase italic">Worship Library</h1>
              {/* Mobile: Spiritual Hymns compact title */}
              <span className="md:hidden text-[19px] font-black text-slate-900 tracking-tight leading-none">Spiritual Hymns</span>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-400 hover:text-[var(--color-brand)] rounded-full transition-all"
                aria-label="Settings"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${syncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              </button>
            </div>

            {/* Nav Tabs — desktop only */}
            <nav className="hidden md:flex items-center space-x-1 mt-2 bg-slate-200/50 p-1 rounded-lg">
              <button
                onClick={() => setSidebarPanel('library')}
                className={`flex-1 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${isSongsTab ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Songs
              </button>
              <button
                onClick={() => setSidebarPanel('shared')}
                className={`flex-1 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${sidebar.panel === 'shared' ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Shared
              </button>
              <button
                onClick={() => setSidebarPanel('setlist-list')}
                className={`flex-1 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${isSetlistTab ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Setlists
              </button>
            </nav>
          </header>

          {/* Sidebar Content — Independent Scroll */}
          <div className="sidebar-content hide-scrollbar">
            {(sidebar.panel === 'library') && (
              <div className="animate-in fade-in duration-300 px-1 pt-3">
                <SongList />
              </div>
            )}

            {(sidebar.panel === 'shared') && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 pt-3">
                <SharedManager />
              </div>
            )}

            {(sidebar.panel === 'setlist-list') && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 pt-3">
                <SetlistManager />
              </div>
            )}

            {(sidebar.panel === 'setlist-detail') && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 pt-3">
                <SetlistView setlistId={sidebar.setlistId} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ READER PANE ═══ */}
      {showReader && (
        <div className="reader-pane">
          {hasActiveSong ? (
            <div className="flex-1 flex flex-col h-full w-full overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              <SongView />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#FAFAFA] h-full">
              <div className="max-w-md text-center px-6">
                <svg className="w-16 h-16 mx-auto mb-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-3">Worship Workspace</h2>
                <p className="text-sm text-slate-500 mb-10 leading-relaxed">
                  Select a song from the library or choose a workflow sequence to begin reading.
                </p>
                <div className="text-xs font-medium text-slate-400 italic leading-loose">
                  "Sing to Him a new song;<br/>play skillfully, and shout for joy."<br/>— Psalm 33:3
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ CONTEXT RAIL PANE ═══ */}
      {!isMobile && showContextRail && hasActiveSong && (
        <ContextRail />
      )}

      {/* ═══ MOBILE BOTTOM NAV ═══ */}
      {isMobile && mobileActivePane === 'sidebar' && (
        <nav className="mobile-bottom-nav">
          <button
            id="mobile-nav-songs"
            onClick={() => setSidebarPanel('library')}
            className={`mobile-bottom-nav-btn ${isSongsTab ? 'mobile-bottom-nav-btn--active' : ''}`}
          >
            {/* Music note icon */}
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isSongsTab ? 2.5 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span>Songs</span>
          </button>
          <button
            id="mobile-nav-shared"
            onClick={() => setSidebarPanel('shared')}
            className={`mobile-bottom-nav-btn ${sidebar.panel === 'shared' ? 'mobile-bottom-nav-btn--active' : ''}`}
          >
            {/* Shared users/network icon */}
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={sidebar.panel === 'shared' ? 2.5 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Shared</span>
          </button>
          <button
            id="mobile-nav-setlists"
            onClick={() => setSidebarPanel('setlist-list')}
            className={`mobile-bottom-nav-btn ${isSetlistTab ? 'mobile-bottom-nav-btn--active' : ''}`}
          >
            {/* List icon */}
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isSetlistTab ? 2.5 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
            </svg>
            <span>Setlists</span>
          </button>
        </nav>
      )}

      {/* Global Overlays */}
      {showSettings && <SystemSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
