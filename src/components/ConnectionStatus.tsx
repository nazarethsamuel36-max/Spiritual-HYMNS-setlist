import { useState, useEffect } from 'react';
import { db } from '../db/Database';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'up-to-date' | 'synced' | 'required'>('up-to-date');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connection restored');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('📴 Connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check sync status periodically
  useEffect(() => {
    const checkSyncStatus = async () => {
      const syncMeta = await db.meta.get('last_sync_time');
      const now = Date.now();
      const lastSync = syncMeta?.value ? Number(syncMeta.value) : 0;
      
      setLastSyncTime(lastSync || null);
      
      if (!lastSync) {
        setSyncStatus('required');
      } else if (now - lastSync > 24 * 60 * 60 * 1000) { // 24 hours
        setSyncStatus('synced');
      } else {
        setSyncStatus('up-to-date');
      }
    };
    
    checkSyncStatus();
    const interval = setInterval(checkSyncStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-2 right-2 flex flex-col items-end gap-1">
      <div
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          isOnline
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-orange-100 text-orange-700'
        }`}
      >
        {isOnline ? '🟢 Online' : '🔴 Offline'}
      </div>
      {syncStatus === 'up-to-date' && (
        <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
          ✓ Up to date
        </div>
      )}
      {syncStatus === 'synced' && lastSyncTime && (
        <div className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
          Last synced: {new Date(lastSyncTime).toLocaleDateString()}
        </div>
      )}
      {syncStatus === 'required' && (
        <div className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
          Sync required
        </div>
      )}
    </div>
  );
}
