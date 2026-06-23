# PWA Update Detection System

## Overview

The Spiritual Hymns app includes a lightweight PWA update detection system that notifies users when a newer version of the library is available. This system works entirely offline-first using local storage and doesn't require any backend infrastructure.

## Architecture

### 1. Version Source: `/public/version.json`

Contains the current version information:

```json
{
  "version": 46,
  "updatedAt": "2026-06-23",
  "changelog": {
    "songs": "Added 15 new hymns",
    "improvements": "Improved search performance"
  }
}
```

**Update this file whenever:**
- Songs are added or removed
- Lyrics are corrected
- Chords are corrected
- Major UI updates are deployed
- Search indexes change

### 2. Services

#### `UpdateChecker.ts` - Core Service

Handles version comparison and update workflow:

```typescript
import { checkForUpdate, performUpdate } from './services/UpdateChecker';

// Check if update is available
const result = await checkForUpdate();
// Returns: { hasUpdate: boolean, currentVersion: number, latestVersion: number }

// Perform update: fetch new version, activate service worker, reload
performUpdate();
```

**Key Functions:**
- `checkForUpdate()` - Async check with built-in throttling (4-hour intervals)
- `forceCheckForUpdate()` - Bypass throttling
- `performUpdate()` - Trigger update and reload
- `getInstalledVersion()` / `setInstalledVersion()` - LocalStorage management

### 3. Components

#### `UpdateBanner.tsx` - User Interface

Non-intrusive notification displayed at bottom of screen:

```
┌─────────────────────────────────────┐
│ 📦 Library Update Available          │
│ New songs and improvements ready.    │
│                                     │
│               [Later] [Update Now]   │
└─────────────────────────────────────┘
```

**Features:**
- Slides in from bottom with animation
- Mobile-friendly and responsive
- Shows changelog items if available
- Dismissible without blocking app
- Loading state while updating

### 4. Hooks

#### `useUpdateChecker.ts` - Lifecycle Integration

Automatically triggers version checks:

1. **On App Startup** - Component mount
2. **On App Resume** - `visibilitychange` event (tab focus)
3. **Periodic** - Every 4 hours if app remains open

```typescript
useUpdateChecker(); // Call once in App component
```

### 5. Service Worker

#### `service-worker.ts` - Offline Support

- Precaches runtime assets
- Listens for `SKIP_WAITING` message from UpdateChecker
- Implements cache strategies (Stale-While-Revalidate)
- Allows instant activation of new version

## User Experience Flow

### Scenario 1: User Starts App (Update Available)

```
1. App loads
2. useUpdateChecker hook mounts
3. Fetches /version.json
4. Compares with stored version in localStorage
5. Version mismatch detected
6. UpdateBanner component shows notification
7. User sees "Library Update Available" message
```

### Scenario 2: User Clicks "Update Now"

```
1. performUpdate() called
2. Fetches latest version.json
3. Updates stored version in localStorage
4. Sends SKIP_WAITING message to service worker
5. Service worker activates new cache
6. Page reloads automatically
7. User gets latest songs and data
```

### Scenario 3: User Clicks "Later"

```
1. Banner dismissed
2. App continues normally
3. Check will run again on:
   - App restart
   - App regains focus
   - 4-hour timer elapsed
```

## LocalStorage Keys

- `spiritual-hymns-version` - Stores current installed version number
- `spiritual-hymns-last-check` - Timestamp of last version check

## Implementation Integration

### App.tsx Integration

```tsx
import { UpdateBanner } from './components/UpdateBanner';
import { useUpdateChecker } from './hooks/useUpdateChecker';

function App() {
  useUpdateChecker(); // Starts checking on mount + resume

  return (
    <div>
      {/* Other components */}
      <UpdateBanner /> {/* Renders notification when update available */}
    </div>
  );
}
```

## Network Usage & Performance

**Design Principles:**
- ✅ No continuous polling
- ✅ Checks only on startup and resume
- ✅ 4-hour minimum between checks
- ✅ Lightweight JSON file (~200 bytes)
- ✅ Works perfectly offline when no update to check

**Network Impact:**
- Check interval: ~3 requests per day for heavy users
- Payload: ~200 bytes per request
- Total: ~600 bytes/day typical usage

## Future Extensions

The system is designed to support:

1. **Detailed Changelog** - Show what changed in each version
2. **Progressive Updates** - Update different data types incrementally
3. **Telemetry** - Track update adoption rates
4. **Scheduled Maintenance** - Force updates on specified dates
5. **Multi-Language Release Notes** - Localized update messages

## Deployment Checklist

When deploying a new version:

- [ ] Increment `version` number in `/public/version.json`
- [ ] Update `updatedAt` timestamp
- [ ] Update `changelog` with user-friendly description
- [ ] Deploy to Vercel
- [ ] Users will see notification next time they open app
- [ ] Users can update immediately without force-refresh

## Troubleshooting

### Update Banner Not Showing

1. Check `public/version.json` exists and has higher version number
2. Clear localStorage: `localStorage.removeItem('spiritual-hymns-version')`
3. Open browser DevTools → Application → Local Storage
4. Check network tab for `/version.json` request

### Update Not Completing

1. Check service worker registration in DevTools
2. Verify network connectivity
3. Try manual page refresh: `Ctrl+Shift+R` (hard refresh)
4. Check browser console for errors

### Version Check Throttled

The system throttles checks to every 4 hours. To force check during testing:

```javascript
// In browser console:
localStorage.removeItem('spiritual-hymns-last-check');
```

## Testing

### Manual Test Steps

1. **Local Testing:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Create test version.json:**
   - Increment version number
   - Update timestamp
   - Clear localStorage before testing

3. **Test on Mobile:**
   - Open on phone with Vercel preview URL
   - Lock/unlock screen to test resume detection
   - Close and reopen tab to test startup

4. **Test Service Worker:**
   - DevTools → Application → Service Workers
   - Verify notification and cache updates

## Browser Compatibility

- ✅ Chrome/Edge 88+
- ✅ Firefox 87+
- ✅ Safari 15+
- ✅ Mobile browsers (iOS Safari 15+, Chrome Mobile)

## API Reference

### UpdateChecker Service

```typescript
// Check if update available (with throttling)
async function checkForUpdate(): Promise<UpdateCheckResult>

// Force check regardless of throttle
async function forceCheckForUpdate(): Promise<UpdateCheckResult>

// Perform the update
function performUpdate(): void

// Get current installed version
function getInstalledVersion(): number

// Store version as installed
function setInstalledVersion(version: number): void

// Dismiss notification (internal use)
function dismissUpdate(): void

// Types
interface VersionInfo {
  version: number;
  updatedAt: string;
  changelog?: {
    songs?: string;
    improvements?: string;
    [key: string]: string | undefined;
  };
}

interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: number;
  latestVersion: number;
  remoteInfo?: VersionInfo; // Only if hasUpdate
}
```

## Summary

The PWA Update Detection System provides a lightweight, non-intrusive way to notify users of library updates without any backend dependencies. It respects offline usage, minimizes network traffic, and provides a smooth user experience across all devices.
