import { useState, useEffect } from 'react';
import { debugDownloadAllSongs } from '../utils/debugDownload';
import { db } from '../db/Database';

export function UpdateStorageButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [localCount, setLocalCount] = useState<number | null>(null);

  // Check how many songs are currently in IndexedDB
  const checkLocalCount = async () => {
    const count = await db.songs.count();
    setLocalCount(count);
  };

  useEffect(() => {
    checkLocalCount();
  }, []);

  const handleUpdateStorage = async () => {
    setIsDownloading(true);
    try {
      // This calls your existing debug function!
      await debugDownloadAllSongs(); 
      
      // Refresh the count after download
      await checkLocalCount();
      alert('✅ Storage updated successfully! All songs are now offline.');
      
    } catch (error) {
      console.error('Manual download failed:', error);
      alert('❌ Failed to update storage. Check console for details.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 border border-slate-200 rounded-lg mt-4">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">🛠️ Storage Manager</h3>
      <p className="text-sm text-slate-600 mb-4">
        Songs currently saved for offline use: <strong>{localCount !== null ? localCount : 'Checking...'}</strong>
      </p>
      
      <button 
        onClick={handleUpdateStorage} 
        disabled={isDownloading}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        {isDownloading ? '⏳ Downloading Songs...' : '🔄 Update Local Storage'}
      </button>

      <button 
        onClick={checkLocalCount}
        className="w-full mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        Refresh Count
      </button>
    </div>
  );
}
