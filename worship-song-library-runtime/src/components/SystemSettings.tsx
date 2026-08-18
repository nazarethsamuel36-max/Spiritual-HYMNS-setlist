import { db } from '../db/Database';
import { useLiveQuery } from 'dexie-react-hooks';
import { batchDownloadSongs, wakeUpSync } from '../services/DataService';
import { UserDataPackageService } from '../services/UserDataPackage';
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
  const [isExporting, setIsExporting] = useState(false);
  const [showDataBackup, setShowDataBackup] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<string | null>(null);
  const [showImportSuccess, setShowImportSuccess] = useState(false);

  useEffect(() => {
    const refreshOfflineState = async () => {
      const count = await db.songs.count();
      setHasOfflineLibrary(count > 0);
    };
    void refreshOfflineState();
  }, [stats?.songCount]);

  // Light/dark mode
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

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const pkg = await UserDataPackageService.build();
      const json = JSON.stringify(pkg, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `worship-userdata-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMsg('Export complete');
    } catch (err) {
      console.error('❌ Export failed:', err);
      setStatusMsg('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (file: File) => {
    setIsImporting(true);
    setImportReport(null);
    try {
      const text = await file.text();
      const pkg = JSON.parse(text);
      const report = await UserDataPackageService.import(pkg);
      const fmt = (r: { imported: number; skipped: number }) => `${r.imported} new / ${r.skipped} skipped`;
      setImportReport(
        `Imported from "${file.name}":\n` +
        `· Personal songs: ${fmt(report.personalSongs)}\n` +
        `· Shared songs: ${fmt(report.sharedSongs)}\n` +
        `· Personal versions: ${fmt(report.personalVersions)}\n` +
        `· Shared versions: ${fmt(report.sharedVersions)}\n` +
        `· Setlists: ${fmt(report.personalSetlists)}\n` +
        `· Shared setlists: ${fmt(report.sharedSetlists)}`
      );
      setShowImportSuccess(true);
    } catch (err) {
      console.error('❌ Import failed:', err);
      setImportReport(`Import failed: ${err instanceof Error ? err.message : 'invalid backup file'}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm z-[200] flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 pointer-events-auto flex flex-col">
        <div className="p-6 border-b border-[#F1F5F9] flex justify-between items-center bg-slate-50 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">System Status</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-[#F1F5F9]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Local Library</span>
              <span className="text-lg font-bold text-slate-700">{stats?.songCount ?? 0} Songs</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-[#F1F5F9]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Last Update</span>
              <span className="text-xs font-bold text-slate-700">
                {stats?.syncMeta ? new Date(stats.syncMeta.value as number).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Song Management */}
            <div className="bg-[var(--color-surface)] border border-[#E2E8F0] rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSongManagement((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-bold text-slate-700">Song Management</span>
                <span className="text-slate-400">{showSongManagement ? '▾' : '▸'}</span>
              </button>
              {showSongManagement && (
                <div className="border-t border-[#F1F5F9] px-4 py-3 space-y-2">
                  {hasOfflineLibrary ? (
                    <button
                      type="button"
                      onClick={handleDeleteOfflineLibrary}
                      className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] border border-[#E2E8F0] rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all group"
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
                      className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] border border-[#E2E8F0] rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] border border-[#E2E8F0] rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="rounded-2xl border border-[#E2E8F0] bg-slate-50 p-4">
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

            {/* Data Backup */}
            <div className="bg-[var(--color-surface)] border border-[#E2E8F0] rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDataBackup((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-bold text-slate-700">Data Backup</span>
                <span className="text-slate-400">{showDataBackup ? '▾' : '▸'}</span>
              </button>
              {showDataBackup && (
                <div className="border-t border-[#F1F5F9] px-4 py-3 space-y-2">
                  <button
                    type="button"
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] border border-[#E2E8F0] rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-left">
                      <div className="font-bold text-slate-700 group-hover:text-blue-600">
                        {isExporting ? 'Exporting...' : 'Export My Data'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Download a backup of personal songs, versions, and setlists
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('udp-import-input')?.click()}
                    disabled={isImporting}
                    className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] border border-[#E2E8F0] rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-left">
                      <div className="font-bold text-slate-700 group-hover:text-emerald-600">
                        {isImporting ? 'Importing...' : 'Import Backup'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Restore from a backup file (existing data is never overwritten)
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <input
                    id="udp-import-input"
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleImportFile(file);
                      e.target.value = '';
                    }}
                  />
                  {importReport && (
                    <div className="rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-xs text-slate-700 whitespace-pre-line font-medium">
                      {importReport}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The backup file can be imported on another device. Shared songs and setlists are included and
                    remain shared.
                  </p>
                </div>
              )}
            </div>

            {/* Appearance — Light / Dark */}
            <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[#E2E8F0]">
              <div className="mb-1 text-sm font-bold text-slate-700">Appearance</div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${theme === 'light' ? 'bg-slate-900 text-[var(--color-on-inverse)] border-slate-900 shadow-sm' : 'bg-[var(--color-surface)] text-slate-600 border-[#CBD5E1]'}`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${theme === 'dark' ? 'bg-slate-900 text-[var(--color-on-inverse)] border-slate-900 shadow-sm' : 'bg-[var(--color-surface)] text-slate-600 border-[#CBD5E1]'}`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 text-center flex-shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Runtime Version 1.2.0 • Build Stable</p>
        </div>
      </div>

      {/* Success Modal Popup for Data Import */}
      {showImportSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-[var(--color-surface)] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 flex-shrink-0">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Imported Successfully!</h3>
            <div className="text-xs text-slate-600 text-left bg-slate-50 rounded-xl p-4 border border-slate-100 font-medium whitespace-pre-line leading-relaxed mb-5 w-full">
              {importReport}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowImportSuccess(false);
                setImportReport(null);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
