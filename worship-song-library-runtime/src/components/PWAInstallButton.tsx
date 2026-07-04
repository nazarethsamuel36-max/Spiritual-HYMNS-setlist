import { useEffect, useState } from 'react';
import { usePWA } from '../hooks/usePWA';

export function PWAInstallButton() {
  const { isInstalled, isIOS, installApp } = usePWA();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (!isInstalled) {
      return;
    }

    setShowSuccessToast(true);
    const timer = window.setTimeout(() => setShowSuccessToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [isInstalled]);

  if (isInstalled) {
    return null;
  }

  if (isIOS && showIOSModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="text-3xl">📱</div>
            <h2 className="text-lg font-semibold text-slate-900">Install BBF Song book</h2>
            <p className="text-sm text-slate-600">
              Follow these steps to add the app to your home screen
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
            onClick={() => setShowIOSModal(false)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          if (isIOS) {
            setShowIOSModal(true);
          } else {
            void installApp();
          }
        }}
        className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-medium text-sm whitespace-nowrap transition-colors ${
          isIOS
            ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600'
        }`}
        title="Install BBF Song book"
      >
        <span className="text-lg">{isIOS ? '📱' : '⬇️'}</span>
        <span className="hidden md:inline">Install App</span>
        <span className="md:hidden">Install</span>
      </button>

      {showSuccessToast && (
        <div className="fixed left-1/2 top-4 z-[70] -translate-x-1/2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white shadow-lg">
          ✅ App Installed Successfully!
        </div>
      )}
    </>
  );
}
