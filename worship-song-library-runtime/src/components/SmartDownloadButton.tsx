import { useState, useEffect } from 'react';
import { batchDownloadSongs } from '../services/DataService';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function SmartDownloadButton({ onComplete, forceShow = false, compact = false }: { onComplete?: () => void; forceShow?: boolean; compact?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed
    const standalone = (window.navigator as any).standalone === true;
    const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(standalone || displayModeStandalone);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('📱 beforeinstallprompt event triggered');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      console.log('✅ App installed successfully');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDownloadAndInstall = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Step 1: Download songs
      await batchDownloadSongs((percent, _message) => {
        setDownloadProgress(percent);
      });

      // Step 2: Install PWA (if not iOS and prompt available)
      if (!isIOS && deferredPrompt) {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        setDeferredPrompt(null);

        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
      }

      // Step 3: Show iOS instructions if needed
      if (isIOS) {
        setShowIOSInstructions(true);
      }

      // Step 4: Notify completion
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please check your internet connection and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isInstalled && !forceShow) {
    return null; // Only hide if it's NOT forced to show
  }

  // Compact mode for header - bright green button with text
  if (compact) {
    return (
      <button
        onClick={handleDownloadAndInstall}
        disabled={isDownloading}
        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download songs for offline use"
      >
        {isDownloading ? 'Downloading...' : 'Download'}
      </button>
    );
  }

  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="text-3xl">📱</div>
            <h2 className="text-lg font-semibold text-slate-900">Install BBF Song book</h2>
            <p className="text-sm text-slate-600">
              Songs downloaded! Now add to home screen:
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Tap the Share button</p>
                <p className="text-xs text-slate-600">Look for the square with arrow up</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Scroll and tap</p>
                <p className="text-xs text-slate-600">"Add to Home Screen"</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Tap "Add"</p>
                <p className="text-xs text-slate-600">App appears on your home screen</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowIOSInstructions(false)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleDownloadAndInstall}
        disabled={isDownloading}
        className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Downloading... {downloadProgress}%
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </span>
        )}
      </button>

      {isDownloading && (
        <div className="w-full max-w-md bg-slate-200 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${downloadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
