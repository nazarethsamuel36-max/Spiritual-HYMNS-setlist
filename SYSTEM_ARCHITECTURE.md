# System Architecture Overview

## 1. Project Overview

### Purpose
The application is a Progressive Web App (PWA) for worship song management. It provides a searchable library of songs with chords and lyrics, setlist creation and management, and offline-first functionality for use during worship services.

### High-Level Architecture
The application follows a client-side React architecture with offline-first data persistence. It uses IndexedDB for local storage, Supabase for cloud sync and real-time updates, and a service worker for PWA capabilities. The architecture is organized into distinct layers: presentation (React components), state management (Zustand), data access (services), and persistence (IndexedDB/Supabase).

### Main Technologies
- **React 19.2.5** - UI framework for component-based rendering
- **TypeScript 6.0.2** - Type safety and interface definitions
- **Vite 5.4.11** - Build tool and development server
- **Zustand 5.0.13** - Global state management
- **Dexie 4.4.2** - IndexedDB wrapper for offline storage
- **Supabase 2.108.2** - Cloud backend, real-time subscriptions, authentication
- **Tailwind CSS 4.3.0** - Utility-first CSS framework
- **MiniSearch 7.2.0** - Client-side search engine
- **vite-plugin-pwa 1.3.0** - Service worker generation and PWA configuration

---

## 2. Folder Structure

### `/src`
Root directory for all application source code.

### `/src/components`
Contains all React components organized by functionality.

**Main Components:**
- `SongList.tsx` - Displays searchable, filterable song library
- `SongView.tsx` - Displays individual song with reader controls and navigation
- `SetlistManager.tsx` - Lists and manages setlists
- `SetlistView.tsx` - Displays setlist detail view with song ordering
- `SetupGatekeeper.tsx` - Initial setup flow for first-time users
- `ConnectionStatus.tsx` - Online/offline status indicator
- `PersonalSongs.tsx` - Personal song management
- `SharedManager.tsx` - Shared content management
- `SmartDownloadButton.tsx` - Download library button with progress
- `SyncProgress.tsx` - Sync operation progress display
- `SystemSettings.tsx` - Settings panel
- `UpdateStorageButton.tsx` - Storage management
- `ContextRail.tsx` - Desktop context sidebar

**Reader Components (`/src/components/reader`):**
- `ChordProRenderer.tsx` - Parses and renders ChordPro format chords/lyrics
- `ReaderHeader.tsx` - Reader controls (transpose, mode switching)
- `SongLine.tsx` - Individual song line rendering
- `EditorMode.tsx` - Admin editing interface
- `ChordPalette.tsx` - Chord input helper
- `ReaderContent.tsx` - Alternative content layout
- `ReaderItemView.tsx` - Marker/note display
- `MusicalWord.tsx` - Musical notation rendering

**Shared Components (`/src/components/shared`):**
- `SearchBar.tsx` - Search input component
- `SongRow.tsx` - Song list item display
- `LanguageTabs.tsx` - Language filter tabs
- `SetlistAddDropdown.tsx` - Setlist addition dropdown
- `SortSelector.tsx` - Sort options selector

**PWA Components:**
- `PWAInstallButton.tsx` - PWA install prompt button
- `InstallPrompt.tsx` - PWA installation guidance

### `/src/services`
Business logic layer for data operations and external API interactions.

- `DataService.ts` - Song fetching, batch downloads, delta sync
- `SetlistService.ts` - Setlist CRUD operations
- `SyncService.ts` - Manifest-based sync, validation, bulk downloads
- `RealtimeService.ts` - Supabase realtime subscriptions, online/offline handling

### `/src/db`
Database layer and type definitions.

- `Database.ts` - Dexie database schema, table definitions, data access functions

### `/src/store`
Global state management.

- `workflowStore.ts` - Zustand store for app state (sidebar, reader, navigation, settings)

### `/src/hooks`
Custom React hooks.

- `useMediaQuery.ts` - Responsive design breakpoint detection
- `useDownloadProgress.ts` - Download progress tracking
- `usePWA.ts` - PWA feature detection

### `/src/utils`
Utility functions and helper modules.

- `SearchEngine.ts` - MiniSearch wrapper, query normalization, phrase matching
- `SongFormatter.ts` - Text normalization, title formatting
- `ChordTransposer.ts` - Chord transposition logic
- `MusicalRenderer.ts` - Musical notation rendering
- `debugDownload.ts` - Download debugging utilities

### `/src/lib`
Third-party library configurations and type definitions.

- `supabaseClient.d.ts` - Supabase client TypeScript definitions

### `/src/assets`
Static assets (images, icons).

### `/public`
Public assets served directly.

- PWA icons (pwa-192x192.png, pwa-512x512.png)
- favicon.ico
- Other static assets

---

## 3. Core Modules

### App.tsx
**Responsibility:** Root component, application orchestrator, layout management, initialization coordination.

**Inputs:** None (root component)

**Outputs:** Rendered application shell with conditional component rendering based on state

**Dependencies:** workflowStore, all major components, services (DataService, SetlistService, RealtimeService), Database

**Files involved:** App.tsx

**Key Functions:**
- Database initialization check
- URL parameter handling (import songs/setlists, direct song links)
- Service initialization (wakeUpSync, RealtimeService)
- Layout state management (mobile/desktop, sidebar/reader)
- Component routing based on workflowStore state
- Admin authentication handling

### workflowStore.ts
**Responsibility:** Global state management for application-wide state.

**Inputs:** State updates from components

**Outputs:** State accessors for components

**Dependencies:** Zustand, localStorage for persistence

**Files involved:** workflowStore.ts

**State Managed:**
- `sidebar` - Current sidebar panel (library, shared, setlist-list, setlist-detail, personal)
- `reader` - Current reader view (empty, song, marker, note)
- `readerMode` - Display mode (chords, lyrics, edit)
- `mobileActivePane` - Mobile layout state (sidebar, reader)
- `showSettings` - Settings panel visibility
- `showContextRail` - Context rail visibility
- `libraryLanguage` - Language filter setting
- `isAdminAuthenticated` - Admin authentication state
- `fontSize` - Reader font size

**Actions:**
- `openSong` - Opens song in reader
- `openMarker` - Opens marker in reader
- `openNote` - Opens note in reader
- `closeReader` - Closes reader
- `openSetlist` - Opens setlist detail
- `closeSetlist` - Closes setlist
- `adjustTranspose` - Adjusts transpose value
- `setSidebarPanel` - Changes sidebar panel
- `setReaderMode` - Changes reader mode
- `setShowSettings` - Toggles settings
- `setShowContextRail` - Toggles context rail
- `setLibraryLanguage` - Sets language filter
- `setAdminAuthenticated` - Sets admin state
- `setFontSize` - Sets font size
- `setActiveArrangementId` - Sets active arrangement

### Database.ts
**Responsibility:** IndexedDB schema definition, data access layer, Supabase fallback.

**Inputs:** Song IDs, setlist IDs, data queries

**Outputs:** Song data, setlist data, sync metadata

**Dependencies:** Dexie, SongFormatter, Supabase (fallback)

**Files involved:** Database.ts

**Tables:**
- `songs` - Full song details with chords/lyrics
- `songIndex` - Song metadata for search and listing
- `syncMeta` - Sync metadata and timestamps
- `setlists` - User setlists
- `sharedSetlists` - Shared setlists
- `arrangements` - Song arrangements
- `cache` - General cache
- `meta` - Metadata storage
- `sharedSongs` - Shared songs
- `personalSongs` - Personal songs

**Key Functions:**
- `getSongById` - Fetches song from IndexedDB with Supabase fallback
- `normalizeSongIndex` - Normalizes song index data
- `normalizeSongDetail` - Normalizes song detail data
- `getSongIndexById` - Fetches song index from multiple tables
- `fullSystemReset` - Clears all database data

### DataService.ts
**Responsibility:** Song data fetching, batch downloads, delta synchronization.

**Inputs:** Song IDs, sync parameters, progress callbacks

**Outputs:** Song data arrays, sync status

**Dependencies:** Supabase, Database, SearchEngine

**Files involved:** DataService.ts

**Key Functions:**
- `batchDownloadSongs` - Downloads all songs in batches with progress tracking
- `wakeUpSync` - Delta sync for changed songs since last sync
- `getSongs` - Fetches songs (IndexedDB first, Supabase fallback)
- `getSongById` - Fetches individual song with content validation
- `parseLyricsToSections` - Parses lyrics string into section structure

### SetlistService.ts
**Responsibility:** Setlist CRUD operations, item management, ordering.

**Inputs:** Setlist IDs, song IDs, item data

**Outputs:** Setlist data, operation results

**Dependencies:** Database

**Files involved:** SetlistService.ts

**Key Functions:**
- `createSetlist` - Creates new setlist
- `deleteSetlist` - Deletes setlist
- `renameSetlist` - Renames setlist
- `addSongToSetlist` - Adds song to setlist
- `addMarkerToSetlist` - Adds marker to setlist
- `addNoteToSetlist` - Adds note to setlist
- `removeItemFromSetlist` - Removes item by ID
- `removeSongFromSetlist` - Removes song by ID and order
- `moveItem` - Moves item up/down
- `moveSong` - Moves song by order
- `reorderItems` - Reorders items by index
- `reorderSongs` - Reorders songs by index
- `updateItem` - Updates item data
- `updateSongTranspose` - Updates song transpose value

### SyncService.ts
**Responsibility:** Manifest-based synchronization, validation, bulk song caching.

**Inputs:** Sync flags, progress callbacks

**Outputs:** Sync status, cached song data

**Dependencies:** Database, SearchEngine

**Files involved:** SyncService.ts

**Key Functions:**
- `sync` - Main sync entry point with manifest comparison
- `performSync` - Performs deep sync with validation
- `downloadAllSongs` - Downloads all song details for offline access

### RealtimeService.ts
**Responsibility:** Supabase realtime subscriptions, online/offline event handling.

**Inputs:** Database change events

**Outputs:** IndexedDB updates, UI event dispatches

**Dependencies:** Supabase, Database, DataService

**Files involved:** RealtimeService.ts

**Key Functions:**
- `initialize` - Sets up listeners and subscriptions
- `handleOnline` - Handles coming back online
- `handleOffline` - Handles going offline
- `subscribeToSongs` - Subscribes to songs table changes
- `handleDatabaseChange` - Processes INSERT/UPDATE/DELETE events
- `transformSong` - Transforms Supabase record to SongDetail
- `transformSongIndex` - Transforms Supabase record to SongIndex
- `destroy` - Cleanup and unsubscribe

### SearchEngine.ts
**Responsibility:** Client-side search with MiniSearch, query normalization, phrase matching.

**Inputs:** Song arrays, search queries

**Outputs:** Ranked search results

**Dependencies:** MiniSearch

**Files involved:** SearchEngine.ts

**Key Functions:**
- `indexSongs` - Builds search index from song array
- `search` - Performs search with phrase-aware ranking
- `normalizeSearchQuery` - Normalizes query with synonym mapping
- `expandQueryPhrases` - Generates phrase variants for matching
- `computePhraseBonus` - Calculates ranking bonuses for phrase matches

### ChordProRenderer.tsx
**Responsibility:** Parses ChordPro format and renders chords/lyrics with proper formatting.

**Inputs:** Raw ChordPro string, display options

**Outputs:** Rendered song content

**Dependencies:** React

**Files involved:** ChordProRenderer.tsx

**Key Functions:**
- Parses ChordPro format ([C]chord notation)
- Detects section markers and directives
- Handles chorus detection and styling
- Filters content based on display mode
- Applies responsive font sizing

---

## 4. Application Startup Flow

### User Opens App

1. **main.tsx Execution**
   - Registers or unregisters service worker based on environment
   - Renders App component in StrictMode

2. **App.tsx Mount**
   - Executes hooks in order (workflowStore, local state)
   - Checks database initialization state

3. **Database Check**
   - Queries IndexedDB for song count
   - If count is 0, shows SetupGatekeeper
   - If count > 0, proceeds to main app

4. **Service Initialization**
   - Calls wakeUpSync if online
   - Initializes RealtimeService if online
   - Sets up event listeners for song updates

5. **URL Parameter Processing**
   - Checks for import_song parameter
   - Checks for import_setlist parameter
   - Checks for setlist parameter
   - Checks for /song/:id path
   - Processes imports or opens direct links

6. **Layout Determination**
   - Detects mobile vs desktop via useMediaQuery
   - Sets initial mobileActivePane state
   - Determines sidebar/reader visibility

7. **Component Rendering**
   - Renders SetupGatekeeper if first-time setup
   - Otherwise renders main app shell
   - Shows appropriate sidebar panel based on workflowStore
   - Shows reader if song is open

8. **Data Loading**
   - SongList component loads songs via getSongs
   - SearchEngine indexes loaded songs
   - SetlistManager loads setlists if in setlist view
   - SongView loads song data if song is open

### UI Becomes Interactive

- Sidebar navigation functional
- Search operational with indexed songs
- Song selection opens reader
- Setlist management available
- Realtime updates active if online
- Offline mode functional with cached data

---

## 5. Component Architecture

### Root Component
```
App.tsx
├── SetupGatekeeper (conditional)
└── App Shell
    ├── Sidebar Pane
    │   ├── SongList (library panel)
    │   ├── SharedManager (shared panel)
    │   ├── SetlistManager (setlist-list panel)
    │   ├── SetlistView (setlist-detail panel)
    │   └── PersonalSongs (personal panel)
    ├── Reader Pane
    │   ├── SongView (song reader)
    │   └── ReaderItemView (marker/note reader)
    ├── ContextRail (desktop only)
    ├── Mobile Bottom Nav (mobile only)
    ├── SystemSettings (modal)
    ├── InstallPrompt
    └── ConnectionStatus
```

### Child Components

**SongList**
- SearchBar
- LanguageTabs
- SortSelector
- SongRow (repeated)

**SongView**
- ReaderHeader
- ChordProRenderer
- Page indicator dots

**SetlistManager**
- Setlist items
- Add setlist button

**SetlistView**
- Setlist items with drag-drop
- Song/marker/note items
- Transpose controls

**ReaderHeader**
- Transpose controls
- Mode switcher
- Font size controls
- Close button

### Reader Components

**ChordProRenderer**
- Parses ChordPro format
- Renders chord/lyric pairs
- Handles section markers
- Applies chorus styling

**SongLine**
- Renders individual line
- Displays chord above lyric
- Handles transpose

**EditorMode**
- Chord input
- Section management
- Save functionality

### Shared Components

**SongRow**
- Song number
- Title
- Artist
- Language indicator
- Active state styling

**SearchBar**
- Search input
- Clear button
- Loading state

**LanguageTabs**
- Language filter pills
- Active state styling

**SortSelector**
- Number/title sort options
- Active state styling

---

## 6. State Flow

### Global State (Zustand)

**workflowStore** contains all application-wide state:

**Sidebar State:**
- `sidebar.panel` - Current active panel
- Updated by: setSidebarPanel action
- Read by: App.tsx, mobile navigation, desktop tabs

**Reader State:**
- `reader.type` - Current reader type (empty/song/marker/note)
- `reader.songId` - Active song ID
- `reader.transpose` - Current transpose value
- `reader.source` - Data source (library/setlist/shared/personal)
- Updated by: openSong, openMarker, openNote, closeReader, adjustTranspose
- Read by: SongView, SongList, SetlistView, navigation components

**UI State:**
- `readerMode` - Display mode (chords/lyrics/edit)
- `mobileActivePane` - Mobile layout state
- `showSettings` - Settings visibility
- `showContextRail` - Context rail visibility
- Updated by: setReaderMode, navigation actions, toggle actions
- Read by: App.tsx, ReaderHeader, layout components

**Settings State:**
- `libraryLanguage` - Language filter
- `fontSize` - Reader font size
- `isAdminAuthenticated` - Admin authentication
- Updated by: setLibraryLanguage, setFontSize, setAdminAuthenticated
- Read by: SongList, SongView, admin components

### Local Component State

**SongList:**
- `search` - Search query string
- `sortBy` - Sort preference
- `allSongs` - Loaded songs array
- `isLoading` - Loading state
- `loadError` - Error message
- `isAddingNewSong` - Add form state
- `newSong*` - New song form fields

**SongView:**
- `song` - Current song data
- `loading` - Loading state
- `error` - Error message
- `slideDir` - Slide animation direction
- `prevActiveIdx` - Previous active index for animation

**SetlistManager:**
- Local setlist array from useLiveQuery

**SetlistView:**
- Local setlist items from useLiveQuery

### State Persistence

**localStorage:**
- `worship-reader-mode` - Reader mode preference
- `worship-font-size` - Font size preference

**IndexedDB:**
- All song data, setlists, settings
- Persisted across sessions

### State Flow Diagram

```
User Action
    ↓
Component Event Handler
    ↓
workflowStore Action
    ↓
State Update
    ↓
Component Re-render (via Zustand subscription)
    ↓
UI Update
```

---

## 7. Data Flow

### React Components → Store

Components read state from workflowStore using selectors:
```typescript
const reader = useWorkflowStore((s) => s.reader);
const openSong = useWorkflowStore((s) => s.openSong);
```

Components update state via actions:
```typescript
openSong(songId, 'library');
```

### Store → Services

Store actions don't directly call services. Services are called by components when needed:
- SongView calls getSongById
- SongList calls getSongs
- SetlistView calls SetlistService methods

### Services → Database

Services interact with Database layer:
- DataService uses db.songs, db.songIndex
- SetlistService uses db.setlists, db.sharedSetlists
- SyncService uses db.syncMeta, db.songIndex

### Database → Cloud Sync

Two sync mechanisms:

**Delta Sync (DataService.wakeUpSync):**
```
IndexedDB (last sync time)
    ↓
Supabase query (changed songs)
    ↓
IndexedDB update
    ↓
SearchEngine re-index
```

**Manifest Sync (SyncService.sync):**
```
/exports/manifest.json
    ↓
Compare with local manifest
    ↓
/exports/index.json (if changed)
    ↓
IndexedDB atomic update
    ↓
SearchEngine re-index
```

**Realtime Sync (RealtimeService):**
```
Supabase Realtime subscription
    ↓
Database change event
    ↓
IndexedDB immediate update
    ↓
Custom event dispatch
    ↓
Component re-render
```

### Complete Data Flow Diagram

```
User Interaction
    ↓
Component
    ↓
workflowStore (state)
    ↓
Service (business logic)
    ↓
Database (IndexedDB)
    ↓
Supabase (cloud sync)
    ↓
RealtimeService (push updates)
    ↓
Database (local update)
    ↓
Component (re-render)
```

---

## 8. Database Layer

### Dexie Database

**Database Name:** WorshipDatabase
**Version:** 7

### Tables

**songs**
- Primary key: id (number)
- Indexed fields: id, songNumber, language, updated_at
- Purpose: Full song details with chords and lyrics
- Used by: DataService, SongView, Database.getSongById

**songIndex**
- Primary key: id (number)
- Indexed fields: id, songNumber, title, language, searchTokens
- Purpose: Song metadata for search and listing
- Used by: SongList, SearchEngine, DataService

**syncMeta**
- Primary key: id (string)
- Purpose: Sync metadata and timestamps
- Used by: SyncService, DataService

**setlists**
- Primary key: id (string)
- Indexed fields: id, title, updatedAt
- Purpose: User-created setlists
- Used by: SetlistService, SetlistManager

**sharedSetlists**
- Primary key: id (string)
- Indexed fields: id, title, updatedAt
- Purpose: Shared setlists from other users
- Used by: SetlistService, SharedManager

**arrangements**
- Primary key: id (string)
- Indexed fields: id, songId, type, updatedAt
- Purpose: Song arrangements (personal/shared)
- Used by: Arrangement system

**cache**
- Primary key: id (string)
- Indexed fields: id, timestamp
- Purpose: General-purpose cache
- Used by: Caching system

**meta**
- Primary key: id (string)
- Purpose: Metadata storage (sync timestamps, settings)
- Used by: DataService, SyncService

**sharedSongs**
- Primary key: id (number)
- Indexed fields: id, songNumber, title, language
- Purpose: Shared songs from other users
- Used by: SharedManager, Database.getSongIndexById

**personalSongs**
- Primary key: id (number)
- Indexed fields: id, title, language
- Purpose: User-created personal songs
- Used by: PersonalSongs, Database.getSongIndexById

### Data Access Patterns

**Read Operations:**
- Direct table access via db.table.get()
- Query via db.table.where()
- Array access via db.table.toArray()

**Write Operations:**
- Single insert/update via db.table.put()
- Bulk operations via db.table.bulkPut(), db.table.bulkAdd()
- Transactions for atomic multi-table operations

**Fallback Pattern:**
1. Check IndexedDB first
2. If missing or empty, check Supabase
3. Cache Supabase results in IndexedDB
4. Return data to caller

### Service Integration

**DataService:**
- Reads/writes songs, songIndex, meta tables
- Uses transactions for atomic sync operations

**SetlistService:**
- Reads/writes setlists, sharedSetlists tables
- Normalizes item data on read

**SyncService:**
- Reads/writes syncMeta, songIndex tables
- Uses atomic transactions for safe updates

**RealtimeService:**
- Updates songs, songIndex on realtime events
- Transforms Supabase records to local format

---

## 9. Search Architecture

### Search Components

**SearchEngine.ts**
- Core search logic
- MiniSearch wrapper
- Query normalization
- Phrase matching

**SongList.tsx**
- Search input handling
- Filter application
- Result display

**SearchBar.tsx**
- Search input UI
- Clear functionality

### MiniSearch Usage

**Index Configuration:**
```typescript
fields: ['title', 'romanTitle', 'artist', 'songNumber', 'searchTokens']
storeFields: ['id', 'title', 'artist', 'songNumber', 'language', 'romanTitle']
searchOptions: {
  boost: { title: 3, romanTitle: 3, songNumber: 5, artist: 1.2 },
  fuzzy: 0.2,
  prefix: true
}
```

**Index Building:**
- Called on app startup
- Called after sync operations
- Deduplicates by ID to prevent errors

### Search Index

**Source:** songIndex table in IndexedDB
**Content:** Song metadata (title, artist, language, searchTokens)
**Normalization:** Applied via normalizeSongIndex
**Storage:** In-memory MiniSearch index

### Result Flow

```
User Query
    ↓
SearchBar input
    ↓
SongList state update
    ↓
SearchEngine.search()
    ↓
Query normalization (synonyms)
    ↓
Numeric query bypass (if pure number)
    ↓
MiniSearch search
    ↓
Phrase expansion (multi-word queries)
    ↓
Phrase bonus calculation
    ↓
Result filtering (valid IDs)
    ↓
Result sorting (score + bonus)
    ↓
SongRow rendering
```

### Search Features

**Numeric Search:**
- Pure number queries bypass MiniSearch
- Exact match on songNumber
- Prefix match on songNumber
- Higher score for exact matches

**Synonym Normalization:**
- Worship-word synonyms mapped to canonical forms
- Applied before MiniSearch query
- Supports multiple language variants

**Phrase Matching:**
- Multi-word queries expanded into phrase variants
- Tiered ranking bonuses:
  - Tier 1: romanTitle starts with phrase (+10000)
  - Tier 2: romanTitle contains phrase (+5000)
  - Tier 3: searchTokens starts with phrase (+3000)
  - Tier 4: searchTokens contains phrase (+1000)

**Fuzzy Search:**
- MiniSearch fuzzy matching enabled (0.2 threshold)
- Prefix matching enabled
- Field-specific boosting

---

## 10. Setlist Architecture

### Creation

**User Flow:**
1. User clicks "Create Setlist" in SetlistManager
2. SetlistManager calls SetlistService.createSetlist(title)
3. SetlistService generates UUID, creates setlist object
4. Setlist stored in db.setlists table
5. UI updates to show new setlist

**Data Structure:**
```typescript
{
  id: string (UUID),
  title: string,
  createdAt: number,
  updatedAt: number,
  songs: SetlistItem[]
}
```

### Storage

**Tables:**
- `setlists` - User-created setlists
- `sharedSetlists` - Shared setlists

**Item Types:**
- `song` - Song reference with transpose
- `marker` - Text marker (e.g., "Prayer Time")
- `note` - Note with content

**Item Structure:**
```typescript
{
  id: string (UUID),
  type: 'song' | 'marker' | 'note',
  songId?: number (song type only),
  transpose?: number (song type only),
  label?: string (marker/note type),
  content?: string (note type),
  order: number
}
```

### Retrieval

**SetlistManager:**
- Uses useLiveQuery to watch db.setlists
- Displays all user setlists
- Shows shared setlists from db.sharedSetlists

**SetlistView:**
- Uses useLiveQuery to watch specific setlist
- Loads from db.setlists or db.sharedSetlists
- Normalizes items on load
- Sorts by order field

### Display

**SetlistView Component:**
- Renders items in order
- Shows song titles with transpose indicators
- Shows marker/note labels
- Supports drag-drop reordering
- Provides add/remove controls

**Item Rendering:**
- Song items: SongRow with transpose badge
- Marker items: Text label with icon
- Note items: Text label with preview

**Setlist Context:**
- When song opened from setlist, SongView uses setlist context
- Navigation uses setlist items array
- Transpose values preserved per item

---

## 11. Reader Architecture

### Song Loading

**Trigger:**
- User clicks song in SongList
- User navigates via swipe/keyboard
- URL direct link (/song/:id)

**Flow:**
```
openSong(songId, source)
    ↓
workflowStore state update
    ↓
SongView component mount
    ↓
useEffect with songId dependency
    ↓
getSongById(songId)
    ↓
IndexedDB check (db.songs.get)
    ↓
Supabase fallback (if missing/empty)
    ↓
Song data normalization
    ↓
setSong state
    ↓
Component render
```

**Source Handling:**
- `library` - Uses library navigation list
- `setlist` - Uses setlist items array
- `shared` - Uses shared songs
- `personal` - Uses personal songs

### Formatting

**Content Resolution Priority:**
1. `song.chords` - Full ChordPro format
2. `song.lyrics` - Plain lyrics text
3. `song.sections` - Reconstructed from parsed sections
4. Empty - Shows fallback message

**Section Parsing:**
- Lyrics split by newlines
- Section headers detected: `[Verse 1]`, `[Chorus]`
- Lines grouped into sections
- Default section: "Verse 1"

**ChordPro Parsing:**
- Bracket notation: `[C]Amazing grace`
- Chords extracted with positions
- Lyrics separated from chords
- Chorus detection via `[Chorus]` or `*` prefix

### Rendering

**ChordProRenderer:**
- Parses raw ChordPro string
- Creates SongLine array
- Detects directives ({title: ...})
- Identifies section markers
- Handles chorus styling

**Rendering Pipeline:**
```
rawChordPro string
    ↓
Line splitting
    ↓
Directive detection
    ↓
Section marker detection
    ↓
Chorus detection
    ↓
Chord/lyric parsing
    ↓
ChordWordUnit array
    ↓
Spacer/skip logic
    ↓
Rendered lines
```

**Display Modes:**
- `chords` - Shows chords and lyrics
- `lyrics` - Shows lyrics only
- `edit` - Shows editor (admin only)

### Navigation

**Swipe Navigation:**
- Document-level touch event listeners
- Horizontal swipe detection (dx > 40px, dx > dy * 1.5)
- Time threshold (< 600ms)
- Calls navigateSetlist or navigateLibrary

**Keyboard Navigation:**
- Arrow keys for next/prev
- Escape to close reader

**Setlist Navigation:**
- Uses setlistItems array
- Calculates current index
- Moves to next/prev item
- Handles song/marker/note types

**Library Navigation:**
- Uses activeNavigationList array
- Calculates current index
- Moves to next/prev song
- Filters by language

**Slide Animation:**
- Tracks slide direction (next/prev)
- Applies CSS animation classes
- Animates on song change

---

## 12. Synchronization Flow

### Supabase → Sync Service → Local Database → UI

**Delta Sync (wakeUpSync):**

```
App initialization
    ↓
wakeUpSync() call
    ↓
Check online status
    ↓
Get last sync time from db.meta
    ↓
Query Supabase for changed songs (updated_at > last_sync)
    ↓
Fetch full data for changed songs
    ↓
Transform to local format
    ↓
Update IndexedDB (songs, songIndex tables)
    ↓
Update sync timestamp
    ↓
Re-index SearchEngine
    ↓
UI updates via useLiveQuery
```

**Manifest Sync (SyncService.sync):**

```
Sync trigger (manual or periodic)
    ↓
Fetch /exports/manifest.json
    ↓
Compare with local manifest (db.syncMeta)
    ↓
If versions differ:
    ↓
Fetch /exports/index.json
    ↓
Validate structure (corruption detection)
    ↓
Normalize songs
    ↓
Atomic transaction:
    - Clear songIndex
    - Add new songs
    - Update syncMeta
    ↓
Re-index SearchEngine
    ↓
UI updates
```

**Realtime Sync (RealtimeService):**

```
App initialization
    ↓
RealtimeService.initialize()
    ↓
Subscribe to songs table changes
    ↓
Supabase detects change
    ↓
Websocket push to client
    ↓
handleDatabaseChange() called
    ↓
Transform record to local format
    ↓
Update IndexedDB (songs, songIndex)
    ↓
Dispatch 'song-updated' event
    ↓
Component listens and updates
```

### Sync Triggers

**Automatic:**
- App mount (wakeUpSync)
- Coming back online (RealtimeService.handleOnline)
- Realtime subscription (RealtimeService)

**Manual:**
- User clicks download button (batchDownloadSongs)
- User triggers sync (SyncService.sync)

### Sync Validation

**Manifest Sync Validation:**
- Checks array structure
- Validates non-empty array
- Samples first item for required fields
- Falls back to last known good state on failure

**Delta Sync Validation:**
- Checks online status before sync
- Handles missing last sync time gracefully
- Continues with cached data on failure

---

## 13. Offline Architecture

### Cached Assets

**Service Worker:**
- Generated by vite-plugin-pwa
- Caches application shell
- Caches static assets
- Provides offline fallback

**PWA Assets:**
- Icons (192x192, 512x512)
- Manifest.json
- Static assets in /public

### IndexedDB

**Offline Data Storage:**
- `songs` - Full song details with chords/lyrics
- `songIndex` - Song metadata for search
- `setlists` - User setlists
- `sharedSetlists` - Shared setlists
- `personalSongs` - Personal songs
- `sharedSongs` - Shared songs

**Cache Strategy:**
- IndexedDB first for reads
- Supabase fallback if missing
- Supabase results cached locally
- Delta sync updates cache

### Service Worker

**Registration:**
- Registered in main.tsx
- Unregistered in dev mode for hot reload
- Registered in production for PWA

**Caching:**
- Application shell cached on install
- Static assets cached on fetch
- Network-first for API calls
- Cache-first for static assets

**Offline Handling:**
- Returns cached shell when offline
- Shows cached songs from IndexedDB
- Displays offline status indicator
- Disables sync operations

### Startup Without Internet

**Flow:**
```
App launch
    ↓
Service worker serves cached shell
    ↓
App.tsx initializes
    ↓
Database check (IndexedDB)
    ↓
If data exists:
    ↓
    Load from IndexedDB
    ↓
    Skip sync operations
    ↓
    Show offline indicator
    ↓
    Full functionality with cached data
If no data:
    ↓
    Show SetupGatekeeper
    ↓
    Prompt for internet connection
```

**Offline Capabilities:**
- Search cached songs
- View song details
- Create/edit setlists
- Navigate songs
- Transpose songs
- Add personal songs

**Online Detection:**
- navigator.onLine API
- Window online/offline events
- RealtimeService handles transitions
- Sync resumes when online

---

## 14. Dependency Relationships

### Module Communication

```
┌─────────────────────────────────────────┐
│           Components Layer              │
│  (SongList, SongView, SetlistManager)  │
└──────────────┬──────────────────────────┘
               │ reads/writes
               ↓
┌─────────────────────────────────────────┐
│           State Layer                   │
│         (workflowStore)                  │
└──────────────┬──────────────────────────┘
               │ calls
               ↓
┌─────────────────────────────────────────┐
│          Services Layer                 │
│ (DataService, SetlistService, etc.)    │
└──────────────┬──────────────────────────┘
               │ reads/writes
               ↓
┌─────────────────────────────────────────┐
│          Database Layer                 │
│           (Database.ts)                 │
└──────────────┬──────────────────────────┘
               │ fallback
               ↓
┌─────────────────────────────────────────┐
│          Cloud Layer                     │
│           (Supabase)                     │
└─────────────────────────────────────────┘
```

### Component Dependencies

**App.tsx depends on:**
- workflowStore
- All major components
- DataService (wakeUpSync)
- SetlistService
- RealtimeService
- Database

**SongList depends on:**
- workflowStore (state, actions)
- DataService (getSongs)
- SearchEngine
- SearchBar, LanguageTabs, SortSelector, SongRow

**SongView depends on:**
- workflowStore (state, actions)
- Database (getSongById)
- ReaderHeader, ChordProRenderer

**SetlistView depends on:**
- workflowStore (state, actions)
- SetlistService
- Database (useLiveQuery)

### Service Dependencies

**DataService depends on:**
- Supabase
- Database
- SearchEngine

**SetlistService depends on:**
- Database

**SyncService depends on:**
- Database
- SearchEngine
- Fetch API (/exports/*)

**RealtimeService depends on:**
- Supabase
- Database
- DataService (wakeUpSync)

### Utility Dependencies

**SearchEngine depends on:**
- MiniSearch

**SongFormatter depends on:**
- None (pure utilities)

**ChordTransposer depends on:**
- None (pure utilities)

### Cross-Cutting Concerns

**State Management:**
- workflowStore used by all major components
- Local state for component-specific data
- localStorage for user preferences

**Data Access:**
- All data access through Database.ts
- Services provide business logic
- Components never access IndexedDB directly

**Error Handling:**
- Services catch and log errors
- Components show error states
- Fallback to cached data on failure

---

## 15. End-to-End Feature Flows

### Search Song

**Modules Involved:**
- SongList
- SearchBar
- SearchEngine
- workflowStore
- DataService
- Database

**Flow:**
```
User types in SearchBar
    ↓
SearchBar onChange event
    ↓
SongList search state update
    ↓
getVisibleSongs() called
    ↓
Language filter applied
    ↓
If search query exists:
    ↓
    SearchEngine.search(allSongs, query)
    ↓
    Query normalization (synonyms)
    ↓
    Numeric query check
    ↓
    MiniSearch search
    ↓
    Phrase expansion
    ↓
    Phrase bonus calculation
    ↓
    Result sorting
    ↓
    Return ranked results
Else:
    ↓
    Sort by number or title
    ↓
    Return filtered results
    ↓
SongRow rendering for each result
```

### Open Song

**Modules Involved:**
- SongRow
- workflowStore
- SongView
- Database
- DataService
- ChordProRenderer

**Flow:**
```
User clicks song in SongRow
    ↓
SongRow onSelect event
    ↓
workflowStore.openSong(songId, source)
    ↓
State update: reader = { type: 'song', songId, source, ... }
    ↓
App.tsx detects reader.type === 'song'
    ↓
SongView component renders
    ↓
SongView useEffect with songId dependency
    ↓
getSongById(songId) called
    ↓
Database.songs.get(songId)
    ↓
If found and has content:
    ↓
    Return from IndexedDB
Else if online:
    ↓
    Supabase fetch
    ↓
    Cache in IndexedDB
    ↓
    Return fresh data
Else:
    ↓
    Return null or cached
    ↓
Content resolution (chords → lyrics → sections)
    ↓
ChordProRenderer renders content
    ↓
ReaderHeader shows controls
    ↓
UI becomes interactive
```

### Create Setlist

**Modules Involved:**
- SetlistManager
- SetlistService
- Database
- workflowStore

**Flow:**
```
User clicks "Create Setlist"
    ↓
SetlistManager prompts for title
    ↓
SetlistService.createSetlist(title)
    ↓
Generate UUID
    ↓
Create setlist object:
    {
      id: UUID,
      title: title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      songs: []
    }
    ↓
db.setlists.add(setlist)
    ↓
Return setlist ID
    ↓
workflowStore.openSetlist(id)
    ↓
State update: sidebar = { panel: 'setlist-detail', setlistId }
    ↓
App.tsx renders SetlistView
    ↓
SetlistView loads setlist via useLiveQuery
    ↓
Empty setlist displayed
    ↓
User can add songs
```

### Transpose Song

**Modules Involved:**
- SongView
- ReaderHeader
- workflowStore
- ChordProRenderer

**Flow:**
```
User clicks transpose up/down in ReaderHeader
    ↓
ReaderHeader onTransposeUp/Down event
    ↓
workflowStore.adjustTranspose(+1 or -1)
    ↓
State update: reader.transpose += delta
    ↓
SongView detects transpose change
    ↓
SongView re-renders
    ↓
ChordProRenderer receives same rawContent
    ↓
Transpose is display-only in current implementation
    ↓
ReaderHeader updates key display
    ↓
UI shows updated transpose value
```

**Note:** Current implementation stores transpose in state but does not actually transpose the chords. The transpose value is used for display purposes and setlist item storage.

### Sync Data

**Modules Involved:**
- App.tsx
- DataService
- SyncService
- Database
- SearchEngine
- RealtimeService

**Flow (Delta Sync):**
```
App mounts
    ↓
App.tsx useEffect
    ↓
wakeUpSync() called
    ↓
Check navigator.onLine
    ↓
Get last sync time from db.meta
    ↓
If no last sync time, skip
    ↓
Query Supabase:
    SELECT id FROM songs
    WHERE updated_at > last_sync
    AND is_active = true
    ↓
If no changes, return
    ↓
Fetch full data for changed IDs:
    SELECT * FROM songs
    WHERE id IN (changed_ids)
    ↓
Transform to SongDetail/SongIndex format
    ↓
Parse lyrics to sections
    ↓
IndexedDB transaction:
    - db.songs.bulkPut(songDetails)
    - db.songIndex.bulkPut(songIndices)
    - db.meta.put(last_sync_time)
    ↓
SearchEngine.indexSongs(allSongs)
    ↓
UI updates via useLiveQuery
```

**Flow (Manifest Sync):**
```
User triggers sync or periodic check
    ↓
SyncService.sync()
    ↓
Fetch /exports/manifest.json
    ↓
Get local manifest from db.syncMeta
    ↓
Compare generatedAt timestamps
    ↓
If different:
    ↓
    performSync(remoteManifest)
    ↓
    Fetch /exports/index.json
    ↓
    Validate structure
    ↓
    Normalize songs
    ↓
    IndexedDB transaction:
        - db.songIndex.clear()
        - db.songIndex.bulkAdd(normalizedSongs)
        - db.syncMeta.put(manifest)
    ↓
    SearchEngine.indexSongs(normalizedSongs)
    ↓
    UI updates
Else:
    ↓
    SearchEngine.indexSongs(existing)
    ↓
    No UI update needed
```

**Flow (Realtime Sync):**
```
RealtimeService.initialize()
    ↓
Subscribe to songs table
    ↓
Supabase detects INSERT/UPDATE/DELETE
    ↓
Websocket push to client
    ↓
handleDatabaseChange(payload)
    ↓
Switch on eventType:
    INSERT:
        ↓
        Transform record
        ↓
        db.songs.put(songDetail)
        ↓
        db.songIndex.put(songIndex)
    UPDATE:
        ↓
        Transform record
        ↓
        db.songs.put(songDetail)
        ↓
        db.songIndex.put(songIndex)
    DELETE:
        ↓
        db.songs.delete(id)
        ↓
        db.songIndex.delete(id)
    ↓
Dispatch 'song-updated' custom event
    ↓
Component listens and updates
```

---

## 16. Current Limitations

### Transpose Implementation
- Transpose value is stored in state and displayed in UI
- ChordProRenderer does not actually transpose chord symbols
- Transpose is used for display purposes and setlist item storage only
- No actual chord transposition logic applied to rendered content

### Content Gaps
- Some songs in database have empty chords and lyrics fields
- UI shows fallback message when content is missing
- Supabase fallback may also return empty content
- No validation or content completeness checks

### Search Limitations
- Phrase matching capped at 50 variants to prevent explosion
- Synonym groups are manually defined
- No fuzzy matching for numeric searches
- Search index rebuilt on every sync (not incremental)

### Sync Limitations
- Delta sync only tracks updated_at timestamp
- No conflict resolution for concurrent edits
- Manifest sync replaces entire index (not incremental)
- No retry logic for failed sync operations
- Realtime sync may miss events if offline

### Offline Limitations
- Initial setup requires internet connection
- No background sync when offline
- Shared songs/setlists require internet to import
- No offline queue for pending operations

### Setlist Limitations
- No setlist sharing functionality implemented
- No setlist templates or presets
- No setlist duplication
- No setlist export/import (except URL parameter import)

### Admin Limitations
- Admin authentication is hardcoded (username: "church", password: "shalom")
- No user management system
- No role-based permissions
- Admin mode unlocked by tapping title 5 times (hidden feature)

### Performance Limitations
- All songs loaded into memory for search
- No virtual scrolling for large song lists
- No lazy loading for song details
- Search index rebuilt on app startup

### Mobile Limitations
- No native app integration
- Limited offline storage (IndexedDB quota)
- No background sync capabilities
- PWA install prompt may not show on all devices

### Data Limitations
- No data migration system for schema changes
- No backup/restore functionality
- No data export capabilities
- Song number assignment requires online connection

### UI Limitations
- No dark mode
- Fixed font size range (12-24px)
- No custom themes
- Limited accessibility features
