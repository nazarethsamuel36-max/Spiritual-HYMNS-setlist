import { useState, useEffect } from 'react';
import { checkForUpdate, performUpdate, dismissUpdate, type UpdateCheckResult } from '../../services/UpdateChecker';

export function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check for update on component mount
    checkForUpdate().then(result => {
      if (result.hasUpdate) {
        setUpdateAvailable(true);
        setUpdateInfo(result);
      }
    });
  }, []);

  if (!updateAvailable || !updateInfo?.remoteInfo) {
    return null;
  }

  const handleUpdate = () => {
    setIsUpdating(true);
    performUpdate();
  };

  const handleDismiss = () => {
    dismissUpdate();
    setUpdateAvailable(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg border border-blue-400 p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm">Library Update Available</h3>
          <p className="text-xs text-blue-100 mt-1">
            New songs and improvements are ready.
          </p>
          {updateInfo.remoteInfo.changelog && (
            <ul className="text-xs text-blue-100 mt-2 space-y-1">
              {updateInfo.remoteInfo.changelog.songs && (
                <li>• {updateInfo.remoteInfo.changelog.songs}</li>
              )}
              {updateInfo.remoteInfo.changelog.improvements && (
                <li>• {updateInfo.remoteInfo.changelog.improvements}</li>
              )}
            </ul>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0 mt-2">
          <button
            onClick={handleDismiss}
            disabled={isUpdating}
            className="text-xs font-semibold px-3 py-1.5 rounded bg-blue-400/30 hover:bg-blue-400/50 text-blue-50 transition-colors disabled:opacity-50"
          >
            Later
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="text-xs font-semibold px-3 py-1.5 rounded bg-white text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
