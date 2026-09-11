# Storage Protection & Custom 404/Error Handling

This document details how IndexedDB persistent storage, full-disk (`QuotaExceededError`) handling, and custom 404 error flows are implemented across the application.

---

## 1. Persistent Storage Protection (`navigator.storage.persist`)

### Overview
In standard web browsers (especially Chromium-based browsers like Chrome and Edge), storage for IndexedDB, Cache Storage, and LocalStorage is classified by default as **Best-Effort**. Under storage pressure (low system disk space), the browser may silently evict your app's data using a Least-Recently-Used (LRU) policy.

By requesting **Persistent Storage**, Chrome exempts the site from automated eviction.

### Implementation
In [`src/main.tsx`](./src/main.tsx), persistent storage is requested immediately on startup before React mounts:

```ts
async function requestPersistentStorage(): Promise<void> {
  if (!navigator.storage) return;
  try {
    const alreadyPersistent = await navigator.storage.persisted();
    if (alreadyPersistent) {
      console.log('✅ Storage: PERSISTENT — IndexedDB data is protected from auto-eviction.');
      return;
    }
    if (navigator.storage.persist) {
      const granted = await navigator.storage.persist();
      if (granted) {
        console.log('🚀 Storage: PERSISTENT granted — Chrome will not auto-delete song data!');
      } else {
        console.warn('⚠️ Storage: BEST-EFFORT — data may be evicted under low disk space. Install the PWA to lock it down.');
      }
    }
  } catch (e) {
    console.warn('⚠️ Could not request persistent storage:', e);
  }
}
requestPersistentStorage();
```

### Browser Approval Heuristics
Chrome does not show a permission popup. Persistence is granted automatically based on:
1. The app being **installed as a PWA** to desktop or mobile home screen.
2. High site engagement (frequent visits).
3. Push notification permission granted to the site.

---

## 2. QuotaExceededError (100% Full Disk Handling)

Even with persistent storage granted, if the device's physical disk reaches 100% capacity, write operations to IndexedDB will throw a `QuotaExceededError`.

### What Was Changed:
1. **[`src/services/DataService.ts`](./src/services/DataService.ts)**:
   - **`batchDownloadSongs`**: Wrapped IndexedDB bulk-put in a quota-aware `try/catch`. When quota is exceeded, it immediately notifies the caller with:
     ```
     ⚠️ Your device storage is full. Free up space and try again.
     ```
     It stops immediately rather than falling back to JSON (which would repeatedly fail for the same disk reason).
   - **`batchDownloadFromJson`**: Added `QuotaExceededError` detection so JSON fallback errors report disk-full instead of misleading "check your internet connection" errors.
   - **`getSongByIdFromJsonFallback`**: Captures quota errors distinctly when caching individual songs to IndexedDB, letting the song continue rendering from memory.

2. **[`src/hooks/useDownloadProgress.ts`](./src/hooks/useDownloadProgress.ts)**:
   - In `saveToDatabase`, catches `QuotaExceededError` and surfaces:
     ```
     ⚠️ Device storage is full. Free up space and try again.
     ```

3. **[`src/components/SmartDownloadButton.tsx`](./src/components/SmartDownloadButton.tsx)**:
   - Eliminated the native browser `alert('Download failed. Please check your internet connection and try again.')`.
   - Replaced with an **in-app error card** displaying specific quota vs network error states and a **"Try Again"** button.

4. **[`src/components/SyncProgress.tsx`](./src/components/SyncProgress.tsx)**:
   - Added an `errorType?: 'network' | 'quota' | 'unknown'` prop to display contextual error subtitles instead of a hardcoded network error string.

---

## 3. Custom 404 Messages & Missing Content Handling

### 1. Song View 404 Card ([`src/components/SongView.tsx`](./src/components/SongView.tsx))
Replaced bare red text (`<div className="text-red-500">Song not found</div>`) with a structured UI card featuring:
- Music note icon.
- Context-aware explanations:
  - **Offline**: *"You're offline and this song isn't downloaded yet. Connect to the internet and try again."*
  - **Deleted / Invalid ID**: *"This song may have been removed or the link is broken."*
  - **General Error**: Fallback error description.
- A **"← Go Back"** navigation button.

### 2. Export JSON Fallback 404 Logging ([`src/services/DataService.ts`](./src/services/DataService.ts))
In the JSON fallback batch download loop, individual missing song files (`/exports/songs/${id}.json`) returned HTTP 404 and were previously dropped silently. A warning is now emitted to console for tracking:
```ts
if (!res.ok) {
  console.warn(`⚠️ Song JSON missing: /exports/songs/${indexSong.id}.json (HTTP ${res.status})`);
  return null;
}
```

---

## 4. Verification & Build Status

The project build was executed and verified:
- **Build command**: `npm run build`
- **Result**: `✓ built in 14.86s`
- **TypeScript**: 0 compilation errors.
