import { db, fullSystemReset } from '../db/Database';
import { useLiveQuery } from 'dexie-react-hooks';
import { batchDownloadSongs } from '../services/DataService';
import { useState } from 'react';

export function SystemSettings({ onClose }: { onClose: () => void }) {
  const stats = useLiveQuery(async () => {
    const songCount = await db.songs.count();
    const syncMeta = await db.meta.get('last_sync_time');
    return { songCount, syncMeta };
  }, []);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const handleFullReset = async () => {
    if (!confirm('CRITICAL: This will delete EVERYTHING including your setlists. This cannot be undone. Proceed?')) return;
    await fullSystemReset();
  };

  const handleDownloadSongs = async () => {
    setIsDownloading(true);
    setStatusMsg('Checking...');
    setDownloadProgress(0);

    const result = await batchDownloadSongs((percent, message) => {
      setDownloadProgress(percent);
      setStatusMsg(message);
    });

    if (result === 'skipped') {
      alert('✅ Your offline library is already fully downloaded!');
      setTimeout(() => {
        setStatusMsg('');
        setDownloadProgress(0);
      }, 2000);
    } else if (result === 'completed') {
      alert('🎉 All songs downloaded successfully! You are now fully offline-ready.');
    } else if (result === 'error') {
      alert('❌ Download failed. Please check your internet connection.');
    }

    setIsDownloading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 pointer-events-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">System Status</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
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
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Storage Management</h3>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">
                Songs currently saved for offline use: <strong>{stats?.songCount ?? 0}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Last sync: {stats?.syncMeta ? new Date(stats.syncMeta.value as number).toLocaleDateString() : 'Never'}
              </p>
            </div>

            <button
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

            {downloadProgress > 0 && downloadProgress < 100 && (
              <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            )}

            <button 
              onClick={handleFullReset}
              className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all group"
            >
              <div className="text-left">
                <div className="font-bold text-slate-700 group-hover:text-red-600">Full System Reset</div>
                <div className="text-xs text-slate-400">Delete all data including setlists</div>
              </div>
              <svg className="w-5 h-5 text-slate-300 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Runtime Version 1.2.0 • Build Stable</p>
        </div>
      </div>
    </div>
  );
}
