import { db } from '../db/Database';
import { useLiveQuery } from 'dexie-react-hooks';
import { batchDownloadSongs, wakeUpSync } from '../services/DataService';
import { useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark';
const THEME_STORAGE_KEY = 'app-theme-mode';

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  return saved === 'dark' ? 'dark' : 'light';
}

export function SystemSettings({ onClose }: { onClose: () => void }) {
  const stats = useLiveQuery(async () => {
    const songCount = await db.songs.count();
    const syncMeta = await db.meta.get('last_sync_time');
    return { songCount, syncMeta };
  }, []);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSongManagement, setShowSongManagement] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [hasOfflineLibrary, setHasOfflineLibrary] = useState<boolean>(false);
  const [showOfflineRemovalNotice, setShowOfflineRemovalNotice] = useState(false);

  useEffect(() => {
    const refreshOfflineState = async () => {
      const count = await db.songs.count();
      setHasOfflineLibrary(count > 0);
    };
    void refreshOfflineState();
  }, [stats?.songCount]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleDownloadSongs = async () => {
    setIsDownloading(true);
    setStatusMsg('Checking...');
    setDownloadProgress(0);
    setShowOfflineRemovalNotice(false);

    const result = await batchDownloadSongs((percent, message) => {
      setDownloadProgress(percent);
      setStatusMsg(message);
    });

    if (result === 'skipped') {
      setStatusMsg('Library already available offline');
    } else if (result === 'completed') {
      setStatusMsg('Download complete');
      setHasOfflineLibrary(true);
    } else if (result === 'error') {
      setStatusMsg('Download failed');
    }

    setIsDownloading(false);
  };

  const handleDeleteOfflineLibrary = async () => {
    if (!confirm('Remove the downloaded offline library? This will not delete your settings or setlists.')) return;
    await db.songs.clear();
    await db.songIndex.clear();
    await db.meta.delete('last_sync_time');
    setHasOfflineLibrary(false);
    setShowOfflineRemovalNotice(true);
    setStatusMsg('Offline library removed');
    setDownloadProgress(0);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await wakeUpSync('manual');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 pointer-events-auto flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">System Status</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Local Library</span>
              <span className="text-lg font-bold text-slate-700">{stats?.songCount ?? 0} Songs</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Last Update</span>
              <span className="text-xs font-bold text-slate-700">
                {stats?.syncMeta ? new Date(stats.syncMeta.value as number).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Song Management */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSongManagement((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-bold text-slate-700">Song Management</span>
                <span className="text-slate-400">{showSongManagement ? '▾' : '▸'}</span>
              </button>
              {showSongManagement && (
                <div className="border-t border-slate-100 px-4 py-3 space-y-2">
                  {hasOfflineLibrary ? (
                    <button
                      type="button"
                      onClick={handleDeleteOfflineLibrary}
                      className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all group"
                    >
                      <div className="text-left">
                        <div className="font-bold text-slate-700 group-hover:text-red-600">Delete Offline Library</div>
                        <div className="text-xs text-slate-400">Remove downloaded songs from this device</div>
                      </div>
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDownloadSongs}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-left">
                        <div className="font-bold text-slate-700 group-hover:text-emerald-600">
                          {isDownloading ? statusMsg : 'Download Songs Offline'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {isDownloading ? `${downloadProgress}%` : 'Download ~728 songs (5MB) for offline use'}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSyncNow}
                    disabled={isSyncing}
                    className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-left">
                      <div className="font-bold text-slate-700 group-hover:text-blue-600">
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                      </div>
                      <div className="text-xs text-slate-400">Check for updates from server</div>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>

                  {isDownloading && downloadProgress > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>{statusMsg}</span>
                        <span>{downloadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-emerald-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${downloadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {showOfflineRemovalNotice && (
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      Offline library removed. Songs are now being loaded directly from the server. Download the library anytime for offline access.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Appearance */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <div className="mb-2 text-sm font-bold text-slate-700">Appearance</div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${theme === 'light' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                  ☀ Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${theme === 'dark' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                  🌙 Dark
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">Select your preferred viewing theme: Light or Dark.</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 text-center flex-shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Runtime Version 1.2.0 • Build Stable</p>
        </div>
      </div>
    </div>
  );
}
