# Deployment & Version Management Guide

## Updating the Version for Deployment

### Step 1: Update `public/version.json`

```bash
# Edit this file before deploying
nano public/version.json
```

Example update:

```json
{
  "version": 47,
  "updatedAt": "2026-06-24",
  "changelog": {
    "songs": "Added 8 new worship songs",
    "improvements": "Faster search indexing"
  }
}
```

**Rules:**
- Increment `version` by 1 (or more for major updates)
- Update `updatedAt` with current date (YYYY-MM-DD format)
- Add user-friendly changelog items
- Keep changelog items short (one sentence each)

### Step 2: Build the App

```bash
cd worship-song-library-runtime

# Build the production bundle
npm run build

# Verify build succeeded
# Output: dist/ folder created
```

### Step 3: Deploy to Vercel

```bash
# Option A: Using Vercel CLI
vercel deploy --prod

# Option B: Push to Git (if connected to Vercel)
git add public/version.json
git commit -m "Release: v47 - New worship songs"
git push origin main
```

### Step 4: Verify Deployment

1. Visit production URL
2. Open DevTools → Network tab
3. Filter by `version.json`
4. Refresh page
5. Confirm `version.json` loads with new version number

## What Triggers User Notifications

Users will see "Library Update Available" notification when:

- ✅ App is reopened after deployment
- ✅ App regains focus (tab becomes active)
- ✅ 4 hours have passed since last check

Users **won't** see notification if:
- ❌ Same version number in `version.json` (no increment)
- ❌ App was closed before deployment was live
- ❌ Browser cache hasn't updated yet

## Version Number Strategy

### Recommended Approach

```
Format: Major.Minor

v1.0  - Initial release
v1.1  - Bug fixes
v1.2  - New features
v2.0  - Major redesign
```

### Simple Approach (Recommended for this project)

Just use sequential integers: 1, 2, 3, 4, ...

Users don't see version numbers, so simplicity wins.

## Changelog Best Practices

### Good Examples

```json
{
  "songs": "Added 12 new hymns from classical collection",
  "improvements": "Search now finds partial matches"
}
```

### Examples to Avoid

```json
{
  "technical": "Upgraded React 18→19, TypeScript 5→6",  // Too technical
  "version": "Now at v1.2.3 stable build",              // Redundant
  "multiple": "Songs + search + UI + database fixes"    // Too many items
}
```

### What to Include

- ✅ New content (songs added, corrected)
- ✅ User-visible improvements
- ✅ Performance enhancements
- ✅ Bug fixes that affect UX

### What to Exclude

- ❌ Technical details
- ❌ Version numbers
- ❌ Implementation details
- ❌ Too many items (keep to 2-3 max)

## Rollback Procedure

If you need to revert to a previous version:

```bash
# Option 1: Using Git
git log --oneline  # Find previous version commit
git revert <commit-hash>
git push origin main

# Option 2: Direct revert
# Edit public/version.json to previous number
npm run build
vercel deploy --prod
```

## Monitoring Update Adoption

### How to Check if Updates are Being Adopted

1. **Browser DevTools:**
   - Open app with current version
   - Note `localStorage.getItem('spiritual-hymns-version')`
   - After update deployment, check if this value increments

2. **Server Logs (Vercel):**
   - Check `/version.json` request count
   - Higher requests = more users checking for updates

3. **Service Worker Updates:**
   - Monitor if service worker updates are being activated
   - Check browser console for update events

## Common Scenarios

### Scenario: Add 5 New Songs

```json
{
  "version": 48,
  "updatedAt": "2026-06-25",
  "changelog": {
    "songs": "Added 5 new worship songs",
    "improvements": "Improved chord search"
  }
}
```

### Scenario: Fix Chord Corrections

```json
{
  "version": 49,
  "updatedAt": "2026-06-26",
  "changelog": {
    "songs": "Corrected chords in 3 classic hymns",
    "improvements": "Better mobile keyboard support"
  }
}
```

### Scenario: Major UI Redesign

```json
{
  "version": 50,
  "updatedAt": "2026-06-27",
  "changelog": {
    "improvements": "Redesigned song editor interface",
    "songs": "Added dark mode for worship venues"
  }
}
```

## Timing Considerations

### Best Times to Deploy

- ✅ During business hours (for support if issues arise)
- ✅ When update is ready and tested
- ✅ Not during active worship service hours (if tracking users)

### Notification Behavior

- Users see notification when they **next open** the app
- Doesn't interrupt current usage
- Users can choose "Later" to update manually
- Update persists across tab closes and refreshes

## Testing Before Deployment

### Local Testing Checklist

```bash
# 1. Build locally
npm run build

# 2. Preview production build
npm run preview

# 3. Test version check
# - Open DevTools → Console
# - Run: localStorage.removeItem('spiritual-hymns-version')
# - Refresh: Check if notification appears

# 4. Test update
# - Click "Update Now"
# - Verify page reloads
# - Check if version.json was fetched
```

### Staging Deployment

```bash
# Deploy to staging first
vercel deploy

# Test on staging URL
# https://worship-song-library-runtime-staging.vercel.app

# Once verified, deploy to production
vercel deploy --prod
```

## Automating Version Increments

### Optional: Automated Version Management

Create a script to auto-increment versions:

```bash
#!/bin/bash
# Script: increment-version.sh

VERSION_FILE="public/version.json"
CURRENT_VERSION=$(jq '.version' $VERSION_FILE)
NEW_VERSION=$((CURRENT_VERSION + 1))
TODAY=$(date +%Y-%m-%d)

# Update version.json
jq ".version = $NEW_VERSION | .updatedAt = \"$TODAY\"" $VERSION_FILE > temp.json
mv temp.json $VERSION_FILE

echo "Version incremented: $CURRENT_VERSION → $NEW_VERSION"
```

Usage:
```bash
chmod +x increment-version.sh
./increment-version.sh
# Edit public/version.json to add changelog, then deploy
```

## Emergency Updates

### If Users Are Stuck on Old Version

1. Check if service worker is caching aggressively
2. Deploy with new version number
3. Notify users to hard-refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Version check runs on page reload

### If New Version Has a Bug

1. Fix the bug in code
2. **Don't** increment version yet
3. Deploy code fix to Vercel
4. Service worker caches automatically update
5. Once verified stable, increment version in next deployment

## Summary

1. **Before deploying:** Update `public/version.json`
2. **Increment version** number
3. **Update changelog** with user-friendly description
4. **Build & deploy:** `npm run build && vercel deploy --prod`
5. **Users see notification** next time they open app
6. **Users can update** immediately with one click

That's it! No backend, no authentication, no complexity.
