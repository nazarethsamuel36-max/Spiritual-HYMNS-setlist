import { useEffect } from 'react';
import { checkForUpdate } from '../services/UpdateChecker';

/**
 * Hook to check for updates on:
 * 1. App startup (component mount)
 * 2. App focus/resume (visibilitychange event)
 * 3. Periodic check (every 4 hours)
 */
export function useUpdateChecker() {
  useEffect(() => {
    // Check on mount
    checkForUpdate();

    // Check when app comes back to focus
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Optional: Periodic check every 4 hours
    const intervalId = setInterval(() => {
      checkForUpdate();
    }, 4 * 60 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);
}
