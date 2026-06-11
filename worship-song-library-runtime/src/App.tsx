import { useEffect } from 'react';
import { SyncService } from './services/SyncService';
import { SongList } from './components/SongList';
import { SongView } from './components/SongView';
import { SetlistManager } from './components/SetlistManager';
import { SetlistView } from './components/SetlistView';
import { SystemSettings } from './components/SystemSettings';
import { ContextRail } from './components/ContextRail';
import { SetlistService } from './services/SetlistService';
import { useWorkflowStore } from './store/workflowStore';
import { useIsMobile } from './hooks/useMediaQuery';
import { useState } from 'react';

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
            <div className="flex justify-between items-center w-full">
              <h1 className="text-lg font-black text-[var(--color-brand)] tracking-tighter uppercase italic">Worship Library</h1>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-400 hover:text-[var(--color-brand)] rounded-full transition-all"
              >
                <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              </button>
            </div>

            {/* Nav Tabs */}
            <nav className="flex items-center space-x-1 mt-2 bg-slate-200/50 p-1 rounded-lg">
              <button
                onClick={() => setSidebarPanel('library')}
                className={`flex-1 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${isSongsTab ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Songs
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

      {/* Global Overlays */}
      {showSettings && <SystemSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
