import { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import { useIsMobile } from '../hooks/useMediaQuery';

export function InstallPrompt() {
  const { showInstallPrompt, isInstalled, isIOS, installApp, dismissInstallPrompt } = usePWA();
  const isMobile = useIsMobile();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Only show on mobile devices
  if (!isMobile || isInstalled) {
    return null;
  }

  // Show iOS instructions
  if (isIOS && showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="text-3xl">📱</div>
            <h2 className="text-lg font-semibold text-slate-900">Install BBF Song book</h2>
            <p className="text-sm text-slate-600">
              Follow these steps to add BBF Song book to your home screen
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

  // Show iOS prompt
  if (isIOS && !showIOSInstructions) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-slate-800 text-white p-4 space-y-3 shadow-lg border-t border-slate-700 max-w-md mx-auto md:max-w-none md:bottom-4 md:right-4 md:left-auto md:rounded-lg md:shadow-xl">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">📱</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm md:text-base">Install BBF Song book</h3>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Access your songbook anytime, even offline
            </p>
          </div>
          <button
            onClick={() => setShowIOSInstructions(false)}
            className="text-slate-400 hover:text-white flex-shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowIOSInstructions(false)}
            className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-sm transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => setShowIOSInstructions(true)}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm transition-colors"
          >
            How to Install
          </button>
        </div>
      </div>
    );
  }

  // Show Android/Chrome prompt
  if (showInstallPrompt && !isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-900 to-emerald-800 text-white p-4 space-y-3 shadow-lg border-t border-emerald-700 max-w-md mx-auto md:max-w-none md:bottom-4 md:right-4 md:left-auto md:rounded-lg md:shadow-xl">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">⬇️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm md:text-base">Install BBF Song book</h3>
            <p className="text-xs md:text-sm text-emerald-100 mt-1">
              Add to your home screen for quick access
            </p>
          </div>
          <button
            onClick={dismissInstallPrompt}
            className="text-emerald-200 hover:text-white flex-shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={dismissInstallPrompt}
            className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg font-medium text-sm transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={installApp}
            className="flex-1 px-3 py-2 bg-white hover:bg-slate-100 text-emerald-900 font-bold rounded-lg text-sm transition-colors"
          >
            Install App
          </button>
        </div>
      </div>
    );
  }

  return null;
}
