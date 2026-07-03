import { db, fullSystemReset } from '../db/Database';
// 🔥 BURN THE CACHE: SyncService disabled
// import { SyncService } from '../services/SyncService';
import { useLiveQuery } from 'dexie-react-hooks';

export function SystemSettings({ onClose }: { onClose: () => void }) {
  // 🔥 BURN THE CACHE: All sync/download state removed - online only

  const stats = useLiveQuery(async () => {
    const songCount = await db.songIndex.count();
    const manifest = await db.syncMeta.get('manifest');
    return { songCount, manifest };
  }, []);

  const handleDownloadAll = async () => {
    // 🔥 BURN THE CACHE: Download disabled - online only
    alert('Offline downloading is disabled. The app now requires an internet connection.');
  };

  const handleResetCache = async () => {
    // 🔥 BURN THE CACHE: Cache reset disabled - no offline cache
    alert('Cache reset is disabled. The app no longer uses offline caching.');
  };

  const handleFullReset = async () => {
    if (!confirm('CRITICAL: This will delete EVERYTHING including your setlists. This cannot be undone. Proceed?')) return;
    await fullSystemReset();
  };

  const handleForceSync = async () => {
    // 🔥 BURN THE CACHE: Sync disabled - online only
    alert('Sync is disabled. The app now requires a direct internet connection.');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
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
                {stats?.manifest?.lastSyncedAt ? new Date(stats.manifest.lastSyncedAt).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Maintenance</h3>
            
            <button 
              onClick={handleDownloadAll}
              disabled
              className="w-full flex items-center justify-between p-4 bg-slate-100 border border-slate-200 rounded-2xl opacity-50 cursor-not-allowed"
            >
              <div className="text-left">
                <div className="font-bold text-slate-500">Download Entire Library</div>
                <div className="text-xs text-slate-400">⚠️ Offline downloading disabled - requires internet connection</div>
              </div>
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            <button 
              onClick={handleForceSync}
              disabled
              className="w-full flex items-center justify-between p-4 bg-slate-100 border border-slate-200 rounded-2xl opacity-50 cursor-not-allowed"
            >
              <div className="text-left">
                <div className="font-bold text-slate-500">Force Update</div>
                <div className="text-xs text-slate-400">⚠️ Sync disabled - app is online-only</div>
              </div>
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button 
              onClick={handleResetCache}
              disabled
              className="w-full flex items-center justify-between p-4 bg-slate-100 border border-slate-200 rounded-2xl opacity-50 cursor-not-allowed"
            >
              <div className="text-left">
                <div className="font-bold text-slate-500">Rebuild Local Cache</div>
                <div className="text-xs text-slate-400">⚠️ Caching disabled - online only</div>
              </div>
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

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
