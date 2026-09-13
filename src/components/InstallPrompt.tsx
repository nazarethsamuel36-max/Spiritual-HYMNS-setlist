import { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useWorkflowStore } from '../store/workflowStore';
import { batchDownloadSongs } from '../services/DataService';

const NEVER_SHOW_KEY = 'pwa_prompt_never_show';

export function InstallPrompt() {
  const { showInstallPrompt, isInstalled, isIOS, installApp, dismissInstallPrompt } = usePWA();
  const isMobile = useIsMobile();
  const mobileActivePane = useWorkflowStore(s => s.mobileActivePane);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(NEVER_SHOW_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Only show on mobile devices when app is not installed and not dismissed
  if (dismissed || isInstalled || !isMobile) {
    return null;
  }

  // On mobile, only show when viewing the sidebar / songlist pane
  if (mobileActivePane === 'reader') {
    return null;
  }

  const handleNeverShow = () => {
    try {
      localStorage.setItem(NEVER_SHOW_KEY, 'true');
    } catch (e) {
      console.error('Failed to save dismissal preference:', e);
    }
    setDismissed(true);
    dismissInstallPrompt();
  };

  const handleDismiss = () => {
    setDismissed(true);
    dismissInstallPrompt();
  };

  const handleDownloadAndInstall = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadMessage('Preparing download...');

    try {
      // Step 1: Download all songs into IndexedDB
      const result = await batchDownloadSongs((percent, message) => {
        setDownloadProgress(percent);
        setDownloadMessage(message || 'Downloading songs...');
      });

      if (result === 'error') {
        setIsDownloading(false);
        return;
      }

      // Step 2: Install PWA (creates home screen shortcut)
      if (isIOS) {
        setIsDownloading(false);
        setShowIOSInstructions(true);
      } else {
        setIsDownloading(false);
        await installApp();
      }
    } catch (err) {
      console.error('Download + install failed:', err);
      setIsDownloading(false);
    }
  };

  // Show iOS instructions modal
  if (isIOS && showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md p-1.5 mx-auto flex items-center justify-center border border-slate-100">
              <img
                src="/bbf-logo-transparent.png"
                alt="BBF Song Book."
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Install BBF Song Book.</h2>
            <p className="text-sm text-slate-600">
              Follow these steps to add BBF Song Book. to your home screen
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  Tap the Share button
                </p>
                <p className="text-xs text-slate-600">
                  Look for the square icon with an arrow pointing up
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  Scroll down and tap
                </p>
                <p className="text-xs text-slate-600">
                  "Add to Home Screen"
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  Tap "Add"
                </p>
                <p className="text-xs text-slate-600">
                  App will appear on your home screen
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleNeverShow}
              className="flex-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors"
            >
              Don't show again
            </button>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-xs hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show iOS prompt bar
  if (isIOS && !showIOSInstructions) {
    return (
      <>
        {/* Download progress overlay for iOS */}
        {isDownloading && (
          <div className="fixed inset-x-0 top-4 z-[120] flex justify-center px-3 pointer-events-none">
            <div className="w-full max-w-md rounded-2xl border border-blue-200 bg-[var(--color-surface)]/95 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-700">Downloading library</span>
                </div>
                <span className="text-sm font-medium text-slate-500">{downloadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-b-2xl bg-slate-200">
                <div
                  className="h-full rounded-b-2xl bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <div className="px-4 py-2 text-xs text-slate-600">{downloadMessage}</div>
            </div>
          </div>
        )}

        <div className="fixed z-[70] bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 md:right-auto md:w-[400px] bg-[#0F172A] text-white p-3.5 space-y-2.5 shadow-2xl border-t border-slate-700/80 md:border-r rounded-none">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
              <img
                src="/bbf-logo-transparent.png"
                alt="BBF Song Book."
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-slate-100 truncate">Install BBF Song Book.</h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {isDownloading ? downloadMessage : 'Downloads songs + add to home screen'}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              disabled={isDownloading}
              className="text-slate-400 hover:text-white flex-shrink-0 p-1 transition-colors disabled:opacity-40"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleNeverShow}
              disabled={isDownloading}
              className="text-[11px] md:text-xs text-slate-400 hover:text-rose-300 underline decoration-slate-600 underline-offset-2 transition-colors disabled:opacity-40"
            >
              Don't show again
            </button>
            <button
              type="button"
              onClick={handleDownloadAndInstall}
              disabled={isDownloading}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {downloadProgress}%
                </>
              ) : (
                'How to Install'
              )}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show Android/Chrome prompt bar (only when beforeinstallprompt event is available)
  if (showInstallPrompt && !isIOS) {
    return (
      <>
        {/* Download progress overlay */}
        {isDownloading && (
          <div className="fixed inset-x-0 top-4 z-[120] flex justify-center px-3 pointer-events-none">
            <div className="w-full max-w-md rounded-2xl border border-blue-200 bg-[var(--color-surface)]/95 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-700">Downloading library</span>
                </div>
                <span className="text-sm font-medium text-slate-500">{downloadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-b-2xl bg-slate-200">
                <div
                  className="h-full rounded-b-2xl bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <div className="px-4 py-2 text-xs text-slate-600">{downloadMessage}</div>
            </div>
          </div>
        )}

        <div className="fixed z-[70] bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 md:right-auto md:w-[400px] bg-[#0F172A] text-white p-3.5 space-y-2.5 shadow-2xl border-t border-slate-700/80 md:border-r rounded-none">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
              <img
                src="/bbf-logo-transparent.png"
                alt="BBF Song Book."
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-slate-100 truncate">Install BBF Song Book.</h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {isDownloading ? downloadMessage : 'Downloads songs + adds to home screen'}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              disabled={isDownloading}
              className="text-slate-400 hover:text-white flex-shrink-0 p-1 transition-colors disabled:opacity-40"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleNeverShow}
              disabled={isDownloading}
              className="text-[11px] md:text-xs text-slate-400 hover:text-rose-300 underline decoration-slate-600 underline-offset-2 transition-colors disabled:opacity-40"
            >
              Don't show again
            </button>
            <button
              type="button"
              onClick={handleDownloadAndInstall}
              disabled={isDownloading}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {downloadProgress}%
                </>
              ) : (
                'Install'
              )}
            </button>
          </div>
        </div>
      </>
    );
  }


  return null;
}
