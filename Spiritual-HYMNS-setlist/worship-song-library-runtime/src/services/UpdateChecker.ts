/**
 * PWA Update Checker - Detects when a newer version is available
 * Stores current version in localStorage and compares with remote version.json
 */

const VERSION_KEY = 'spiritual-hymns-version';
const LAST_CHECK_KEY = 'spiritual-hymns-last-check';
const CHECK_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

export interface VersionInfo {
  version: number;
  updatedAt: string;
  changelog?: {
    songs?: string;
    improvements?: string;
    [key: string]: string | undefined;
  };
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: number;
  latestVersion: number;
  remoteInfo?: VersionInfo;
}

/**
 * Get the currently installed version from localStorage
 */
export function getInstalledVersion(): number {
  const stored = localStorage.getItem(VERSION_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * Store the current version in localStorage
 */
export function setInstalledVersion(version: number): void {
  localStorage.setItem(VERSION_KEY, version.toString());
}

/**
 * Check if enough time has passed since last check
 */
function shouldCheckForUpdate(): boolean {
  const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
  if (!lastCheck) return true;
  
  const lastCheckTime = parseInt(lastCheck, 10);
  const now = Date.now();
  return now - lastCheckTime > CHECK_INTERVAL;
}

/**
 * Record that we just checked for updates
 */
function recordCheckTime(): void {
  localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
}

/**
 * Fetch the remote version information
 */
async function fetchRemoteVersion(): Promise<VersionInfo | null> {
  try {
    // Add cache-busting query param to avoid stale responses
    const response = await fetch(`/version.json?t=${Date.now()}`);
    if (!response.ok) {
      console.warn('Failed to fetch version info:', response.status);
      return null;
    }
    const data = await response.json();
    return data as VersionInfo;
  } catch (error) {
    console.warn('Error fetching remote version:', error);
    return null;
  }
}

/**
 * Check if an update is available
 * Returns update status and optionally fetches remote version
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  const currentVersion = getInstalledVersion();

  // Skip check if we've checked recently (unless forced)
  if (!shouldCheckForUpdate()) {
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion
    };
  }

  recordCheckTime();

  const remoteInfo = await fetchRemoteVersion();
  if (!remoteInfo) {
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion
    };
  }

  const hasUpdate = remoteInfo.version > currentVersion;
  
  return {
    hasUpdate,
    currentVersion,
    latestVersion: remoteInfo.version,
    remoteInfo: hasUpdate ? remoteInfo : undefined
  };
}

/**
 * Force check for update regardless of last check time
 */
export async function forceCheckForUpdate(): Promise<UpdateCheckResult> {
  localStorage.removeItem(LAST_CHECK_KEY);
  return checkForUpdate();
}

/**
 * Complete the update process:
 * 1. Update stored version
 * 2. Trigger service worker skipWaiting if available
 * 3. Reload the page
 */
export function performUpdate(): void {
  fetchRemoteVersion().then(remoteInfo => {
    if (remoteInfo) {
      setInstalledVersion(remoteInfo.version);
    }

    // Trigger service worker to activate and skip waiting
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }

    // Reload after a short delay to allow service worker to activate
    setTimeout(() => {
      window.location.reload();
    }, 500);
  });
}

/**
 * Dismiss the update notification for this session
 * (User can still update manually via menu)
 */
export function dismissUpdate(): void {
  // Could add to sessionStorage if we wanted to skip showing banner again this session
  // For now, just a no-op that allows the component to be hidden
}
