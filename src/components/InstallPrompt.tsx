import { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useWorkflowStore } from '../store/workflowStore';

const NEVER_SHOW_KEY = 'pwa_prompt_never_show';

export function InstallPrompt() {
  const { showInstallPrompt, isInstalled, isIOS, installApp, dismissInstallPrompt } = usePWA();
  const isMobile = useIsMobile();
  const mobileActivePane = useWorkflowStore(s => s.mobileActivePane);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
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

  // Show iOS instructions modal
  if (isIOS && showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
          <div className="text-center space-y-2">
            <img
              src="/pwa-192x192.png"
              alt="BBF Song book"
              className="w-14 h-14 rounded-2xl mx-auto shadow-md object-cover border border-slate-200"
            />
            <h2 className="text-lg font-semibold text-slate-900">Install BBF Song book</h2>
            <p className="text-sm text-slate-600">
              Follow these steps to add BBF Song book to your home screen
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
      <div className="fixed z-[70] bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 md:right-auto md:w-[400px] bg-[#0F172A] text-white p-3.5 space-y-2.5 shadow-2xl border-t border-slate-700/80 md:border-r rounded-none">
        <div className="flex items-start gap-3">
          <img
            src="/pwa-192x192.png"
            alt="BBF Song book"
            className="w-10 h-10 rounded-lg shadow-sm flex-shrink-0 object-cover border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-slate-100 truncate">Install BBF Song book</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              Access your songbook anytime, even offline
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white flex-shrink-0 p-1 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleNeverShow}
            className="text-[11px] md:text-xs text-slate-400 hover:text-rose-300 underline decoration-slate-600 underline-offset-2 transition-colors"
          >
            Don't show again
          </button>
          <button
            type="button"
            onClick={() => setShowIOSInstructions(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            How to Install
          </button>
        </div>
      </div>
    );
  }

  // Show Android/Chrome prompt bar (only when beforeinstallprompt event is available)
  if (showInstallPrompt && !isIOS) {
    return (
      <div className="fixed z-[70] bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 md:right-auto md:w-[400px] bg-[#0F172A] text-white p-3.5 space-y-2.5 shadow-2xl border-t border-slate-700/80 md:border-r rounded-none">
        <div className="flex items-start gap-3">
          <img
            src="/pwa-192x192.png"
            alt="BBF Song book"
            className="w-10 h-10 rounded-lg shadow-sm flex-shrink-0 object-cover border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-slate-100 truncate">Install BBF Song book</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              Add to your home screen for quick access
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white flex-shrink-0 p-1 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleNeverShow}
            className="text-[11px] md:text-xs text-slate-400 hover:text-rose-300 underline decoration-slate-600 underline-offset-2 transition-colors"
          >
            Don't show again
          </button>
          <button
            type="button"
            onClick={installApp}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            Install
          </button>
        </div>
      </div>
    );
  }

  return null;
}
