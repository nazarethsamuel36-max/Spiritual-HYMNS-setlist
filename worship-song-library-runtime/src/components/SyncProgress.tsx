import { useMemo } from 'react';

export type SyncStatus = 'idle' | 'downloading' | 'saving' | 'complete' | 'error';

interface SyncProgressProps {
  current: number;
  total: number | null;
  status: SyncStatus;
}

export function SyncProgress({ current, total, status }: SyncProgressProps) {
  const isVisible = status !== 'idle' && status !== 'complete';

  if (!isVisible) {
    return null;
  }

  const percentage = useMemo(() => {
    if (!total || total <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((current / total) * 100));
  }, [current, total]);

  const message =
    status === 'downloading'
      ? `Downloading songs... ${current}/${total ?? '?'}`
      : status === 'saving'
        ? `Saving to device... ${percentage}%`
        : status === 'error'
          ? 'We could not finish the first download. Please check your connection and try again.'
          : 'Preparing your songbook';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/90 px-6 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-black text-slate-900">
            {status === 'error' ? 'Connection Issue' : 'Preparing Your Songbook'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {status === 'error'
              ? 'Your songs will be available offline as soon as the connection is restored.'
              : 'Downloading your songs for offline use. This only happens once for a fresh install.'}
          </p>
        </div>

        {status !== 'error' && (
          <>
            <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
              {message}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
