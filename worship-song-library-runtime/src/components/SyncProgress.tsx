import { useMemo } from 'react';

export type SyncStatus = 'idle' | 'calculating' | 'downloading' | 'saving' | 'complete' | 'error';

interface SyncProgressProps {
  currentMB: number;
  totalMB: number;
  percentage: number;
  status: SyncStatus;
  message: string;
}

export function SyncProgress({ currentMB, totalMB, percentage, status, message }: SyncProgressProps) {
  const isVisible = status !== 'idle' && status !== 'complete';

  if (!isVisible) {
    return null;
  }

  const safePercentage = useMemo(() => Math.min(100, Math.max(0, Math.round(percentage))), [percentage]);

  const formatBytes = (bytes: number) => {
    if (bytes <= 0) return '0.0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-black text-slate-900">
            {status === 'calculating' && 'Preparing Download...'}
            {status === 'downloading' && 'Downloading App'}
            {status === 'saving' && 'Installing...'}
            {status === 'error' && 'Download Failed'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {status === 'calculating' && 'Checking available songs...'}
            {status === 'downloading' && 'This will only happen once. Songs will work offline!'}
            {status === 'saving' && 'Saving to your device...'}
            {status === 'error' && 'Please check your internet connection and try again.'}
          </p>
        </div>

        {status !== 'error' && (
          <>
            <div className="mb-4 h-4 overflow-hidden rounded-full bg-slate-200 shadow-inner">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${safePercentage}%` }}
              />
            </div>
            <div className="mb-2 flex items-center justify-between text-sm font-bold">
              <span className="text-blue-600">{formatBytes(currentMB)}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600">{formatBytes(totalMB)}</span>
            </div>
            <div className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              {safePercentage}% complete
            </div>
            <div className="mt-3 text-center text-sm font-semibold text-slate-600">{message}</div>
          </>
        )}

        {status === 'error' && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
