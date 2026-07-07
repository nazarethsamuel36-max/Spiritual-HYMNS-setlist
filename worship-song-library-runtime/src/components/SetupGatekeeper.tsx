import { useState, useEffect } from 'react';
import { SmartDownloadButton } from './SmartDownloadButton';
import { debugDownloadAllSongs } from '../utils/debugDownload';
import { db } from '../db/Database';

export function SetupGatekeeper({ onComplete }: { onComplete: () => void }) {
  const [isChecking, setIsChecking] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [songCount, setSongCount] = useState(0);
  const [isDebugDownloading, setIsDebugDownloading] = useState(false);

  const handleDebugDownload = async () => {
    setIsDebugDownloading(true);
    try {
      await debugDownloadAllSongs();
      const count = await db.songs.count();
      setSongCount(count);
      setHasData(count >= 724);
      if (count >= 724) {
        onComplete();
      }
    } catch (error) {
      console.error('Debug download failed:', error);
      alert('Debug download failed. Check console for details.');
    } finally {
      setIsDebugDownloading(false);
    }
  };

  useEffect(() => {
    const checkData = async () => {
      const count = await db.songs.count();
      setSongCount(count);
      setHasData(count >= 724);
      setIsChecking(false);
    };

    checkData();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking setup...</p>
        </div>
      </div>
    );
  }

  if (hasData) {
    // Data exists (>= 724 songs), proceed to app
    onComplete();
    return null;
  }

  // No data - show setup screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img src="/pwa-192x192.png" alt="BBF Song book" className="w-24 h-24" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">BBF Song book</h1>
          <p className="text-slate-600">
            {songCount > 0 
              ? `Download complete songs (${songCount}/728) for full offline access`
              : 'Download the library for instant offline access to 728+ songs'}
          </p>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">What you'll get:</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span className="text-slate-700">728+ songs with lyrics and chords</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span className="text-slate-700">Instant search and load (no waiting)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span className="text-slate-700">Works completely offline</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span className="text-slate-700">Real-time updates when online</span>
            </li>
          </ul>

          {/* Debug Manual Download Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleDebugDownload}
              disabled={isDebugDownloading}
              className="w-full px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDebugDownloading ? '⏳ Downloading...' : '🔧 Manual Download (Debug)'}
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Use if main download fails
            </p>
          </div>
        </div>

        {/* Download Button */}
        <SmartDownloadButton onComplete={onComplete} />

        {/* Skip option */}
        <div className="text-center">
          <button
            onClick={onComplete}
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Skip for now (use online mode)
          </button>
        </div>
      </div>
    </div>
  );
}
