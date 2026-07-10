# Module Responsibility Specification (MRS)

## 1. Responsibility Matrix

| Responsibility | Owner Module |
| --------------- | ------------ |
| Application Orchestration | App.tsx |
| Global State Management | workflowStore |
| Local Data Persistence | Database |
| Song Retrieval | DataService |
| Batch Song Downloads | DataService |
| Delta Synchronization | DataService |
| Manifest Synchronization | SyncService |
| Realtime Database Updates | RealtimeService |
| Setlist CRUD Operations | SetlistService |
| Search Indexing | SearchEngine |
| Query Processing | SearchEngine |
| Result Ranking | SearchEngine |
| Text Normalization | SongFormatter |
| Song Library Display | SongList |
| Song Reader Display | SongView |
| Setlist Management Display | SetlistManager |
| Setlist Detail Display | SetlistView |
| ChordPro Parsing | ChordProRenderer |
| ChordPro Rendering | ChordProRenderer |
| Reader Controls | ReaderHeader |
| Song Line Rendering | SongLine |
| Search Input | SearchBar |
| Song List Item Display | SongRow |
| Language Filtering | SongList |
| Sort Operations | SongList |
| Slide Animations | SongView |
| Swipe Navigation | SongView |
| Keyboard Navigation | SongView |
| URL Parameter Handling | App.tsx |
| Service Worker Registration | main.tsx |
| PWA Install Prompts | PWAInstallButton |
| Online/Offline Detection | RealtimeService |
| Connection Status Display | ConnectionStatus |
| Admin Authentication | App.tsx |
| Initial Setup Flow | SetupGatekeeper |
| Mobile/Responsive Layout | App.tsx |
| Font Size Management | workflowStore |
| Reader Mode Management | workflowStore |
| Language Preference | workflowStore |
| Transpose State | workflowStore |
| Navigation State | workflowStore |
| Sidebar Panel State | workflowStore |
| Settings Panel State | workflowStore |

---

## 2. Module Specifications

### App.tsx

**Purpose**
Root component that orchestrates the entire application, manages layout state, handles initialization, and coordinates between all subsystems.

**Owns**
- Application shell layout (sidebar/reader split)
- Mobile/desktop responsive layout
- Service initialization coordination
- URL parameter parsing and routing
- Admin authentication state
- Database initialization checks
- Component routing based on workflowStore state
- Import/export handling via URL parameters
- Mobile navigation state coordination

**Does NOT Own**
- Song data fetching
- Setlist operations
- Search functionality
- Database operations
- State persistence
- Individual component rendering logic

**Inputs**
- workflowStore state (sidebar, reader, mobileActivePane)
- URL parameters
- Database song count
- User interactions (clicks, taps)

**Outputs**
- Rendered application shell
- Conditional component rendering
- Service initialization calls
- State updates via workflowStore actions

**Collaborates With**
- workflowStore (reads state, calls actions)
- DataService (wakeUpSync)
- SetlistService (setlist operations)
- RealtimeService (initialization)
- Database (initialization check)
- All major components (conditional rendering)

**Dependencies**
- React
- workflowStore
- DataService
- SetlistService
- RealtimeService
- Database
- All major components

**Public Responsibilities**
- Application layout management
- Service lifecycle coordination
- URL-based routing
- Admin authentication handling
- Import/export coordination

**Internal Responsibilities**
- Layout state calculation
- URL parameter parsing logic
- Service initialization timing
- Component conditional rendering logic
- Admin tap detection logic

---

### workflowStore

**Purpose**
Centralized global state management using Zustand, maintaining all application-wide UI state and navigation state.

**Owns**
- Sidebar panel state (library, shared, setlist-list, setlist-detail, personal)
- Reader state (empty, song, marker, note with associated data)
- Reader mode (chords, lyrics, edit)
- Mobile layout state (sidebar, reader)
- Settings panel visibility
- Context rail visibility
- Library language filter
- Admin authentication state
- Reader font size
- All state transitions and actions

**Does NOT Own**
- Data fetching
- Database operations
- UI rendering
- Business logic
- Persistence (except localStorage for preferences)
- API communication

**Inputs**
- Action calls from components (openSong, closeReader, setSidebarPanel, etc.)
- localStorage for initial preferences

**Outputs**
- State accessors for components
- Action functions for state updates
- localStorage updates for preferences

**Collaborates With**
- All components (state access)
- localStorage (preference persistence)

**Dependencies**
- Zustand
- localStorage

**Public Responsibilities**
- State access via selectors
- State update via actions
- Preference persistence
- State initialization from localStorage

**Internal Responsibilities**
- State transition logic
- Default value handling
- localStorage synchronization
- State validation

---

### Database

**Purpose**
IndexedDB wrapper providing typed data access, schema management, and Supabase fallback for offline-first data persistence.

**Owns**
- IndexedDB schema definition and versioning
- Table structure and indexing
- Data access methods (get, put, bulk operations)
- Supabase fallback logic
- Data normalization
- Transaction management
- Cache coordination between tables

**Does NOT Own**
- Business logic
- UI state
- Search indexing
- Sync orchestration
- Realtime subscriptions
- Data transformation beyond normalization

**Inputs**
- Song IDs, setlist IDs
- Data queries
- Supabase records (for fallback)

**Outputs**
- Song data (SongDetail, SongIndex)
- Setlist data
- Sync metadata
- Query results

**Collaborates With**
- DataService (data access)
- SetlistService (setlist access)
- SyncService (sync metadata)
- RealtimeService (realtime updates)
- SongFormatter (normalization)
- Supabase (fallback)

**Dependencies**
- Dexie
- SongFormatter
- Supabase (fallback)

**Public Responsibilities**
- getSongById (with Supabase fallback)
- getSongs (via DataService)
- Table access methods
- Normalization methods
- Reset utilities

**Internal Responsibilities**
- Schema versioning
- Index configuration
- Transaction management
- Fallback logic
- Data normalization
- Cache coordination

---

### DataService

**Purpose**
Business logic layer for song data operations, including fetching, batch downloading, and delta synchronization with Supabase.

**Owns**
- Song fetching from IndexedDB and Supabase
- Batch download orchestration with progress tracking
- Delta sync based on timestamps
- Content validation and fallback logic
- Lyrics-to-sections parsing
- Search engine coordination after data updates
- Sync timestamp management

**Does NOT Own**
- IndexedDB schema
- UI state
- Search algorithm
- Realtime subscriptions
- Setlist operations
- User preferences

**Inputs**
- Song IDs
- Sync parameters
- Progress callbacks
- Online status

**Outputs**
- Song data arrays
- Individual song data
- Sync status
- Progress updates

**Collaborates With**
- Database (IndexedDB access)
- Supabase (cloud data)
- SearchEngine (index updates)
- RealtimeService (called by handleOnline)

**Dependencies**
- Supabase)
- Database
- SearchEngine

**Public Responsibilities**
- batchDownloadSongs (with progress)
- wakeUpSync (delta sync)
- getSongs (list fetching)
- getSongById (individual fetching)

**Internal Responsibilities**
- Batch size management
- Progress calculation
- Delta query construction
- Content validation
- Lyrics parsing
- Fallback decision logic

---

### SyncService

**Purpose**
Manifest-based synchronization system that validates and updates the local song index from exported JSON files.

**Owns**
- Manifest comparison logic
- Index JSON fetching
- Data validation and corruption detection
- Atomic index updates
- Bulk song detail downloading
- Sync metadata management
- Search engine re-indexing after sync

**Does NOT Own**
- Delta sync (handled by DataService)
- Realtime subscriptions
- UI state
- Database schema
- Search algorithm

**Inputs**
- Sync flags
- Progress callbacks
- Manifest data

**Outputs**
- Sync status
- Updated local index
- Progress updates

**Collaborates With**
- Database (index and metadata tables)
- SearchEngine (re-indexing)
- Fetch API (manifest and index files)

**Dependencies**
- Database
- SearchEngine
- Fetch API

**Public Responsibilities**
- sync (main entry point)
- downloadAllSongs (bulk caching)

**Internal Responsibilities**
- Manifest comparison
- Validation logic
- Atomic transaction management
- Batch downloading
- Fallback to last known good state

---

### RealtimeService

**Purpose**
Supabase realtime subscription manager that handles database change events and online/offline transitions.

**Owns**
- Websocket subscription management
- Online/offline event handling
- Database change event processing
- IndexedDB immediate updates on changes
- Custom event dispatching for UI updates
- Subscription lifecycle management
- Record transformation from Supabase format

**Does NOT Own**
- UI rendering
- State management
- Sync orchestration
- Search indexing
- Business logic

**Inputs**
- Supabase change events
- Online/offline browser events

**Outputs**
- IndexedDB updates
- Custom events for UI
- Subscription status

**Collaborates With**
- Supabase (subscriptions)
- Database (updates)
- DataService (wakeUpSync on online)

**Dependencies**
- Supabase
- Database
- DataService

**Public Responsibilities**
- initialize (setup subscriptions)
- destroy (cleanup)
- getOnlineStatus (current state)

**Internal Responsibilities**
- Subscription management
- Event type handling (INSERT/UPDATE/DELETE)
- Record transformation
- Custom event dispatching
- Online/offline state tracking

---

### SetlistService

**Purpose**
Business logic layer for setlist CRUD operations, item management, and ordering within setlists.

**Owns**
- Setlist creation, deletion, renaming
- Song/marker/note item addition
- Item removal and reordering
- Item movement (up/down)
- Transpose value updates
- Item normalization
- Order field management
- Table selection (local vs shared)

**Does NOT Own**
- UI rendering
- State management
- Database schema
- Song data fetching
- Search functionality

**Inputs**
- Setlist IDs
- Song IDs
- Item data
- Update parameters

**Outputs**
- Setlist data
- Operation results
- Updated item arrays

**Collaborates With**
- Database (setlists and sharedSetlists tables)

**Dependencies**
- Database

**Public Responsibilities**
- createSetlist
- deleteSetlist
- renameSetlist
- addSongToSetlist
- addMarkerToSetlist
- addNoteToSetlist
- removeItemFromSetlist
- removeSongFromSetlist
- moveItem
- moveSong
- reorderItems
- reorderSongs
- updateItem
- updateSongTranspose

**Internal Responsibilities**
- Item normalization
- Order calculation
- Table selection logic
- UUID generation
- Resequence logic

---

### SearchEngine

**Purpose**
Client-side search engine using MiniSearch with query normalization, synonym handling, and phrase-aware ranking.

**Owns**
- Search index building and management
- Query normalization with synonym mapping
- Numeric search bypass logic
- MiniSearch configuration
- Phrase expansion for multi-word queries
- Phrase-aware ranking bonuses
- Result filtering and sorting
- Index deduplication

**Does NOT Own**
- Data fetching
- UI state
- Database operations
- Song data storage
- Result display

**Inputs**
- Song arrays
- Search queries

**Outputs**
- Ranked search results
- Index status

**Collaborates With**
- MiniSearch (search library)
- SongList (index building)
- DataService (index updates after sync)

**Dependencies**
- MiniSearch

**Public Responsibilities**
- indexSongs (build search index)
- search (perform search with ranking)

**Internal Responsibilities**
- Query normalization
- Synonym mapping
- Phrase expansion
- Ranking bonus calculation
- Index deduplication
- Numeric query detection

---

### SongFormatter

**Purpose**
Utility module for text normalization, title formatting, and data cleaning operations.

**Owns**
- Text normalization (Unicode, whitespace)
- Title formatting for display
- Language alias resolution
- Import text cleaning
- Data consistency operations

**Does NOT Own**
- Data fetching
- UI rendering
- State management
- Database operations
- Search logic

**Inputs**
- Raw text strings
- Language codes

**Outputs**
- Normalized strings
- Formatted titles
- Canonical language codes

**Collaborates With**
- Database (normalization)
- SearchEngine (via Database)
- SongList (language filtering)

**Dependencies**
- None (pure utilities)

**Public Responsibilities**
- normalizeImportedText
- formatSongTitle
- Language alias resolution functions

**Internal Responsibilities**
- Unicode normalization
- Whitespace handling
- Case conversion
- Language mapping logic

---

### SongList

**Purpose**
Component that displays the searchable, filterable song library with language tabs, search bar, and sorting options.

**Owns**
- Song library display
- Search input handling
- Language filtering
- Sort operations
- Song selection
- Admin add song form
- Loading and error states
- Search engine coordination
- Song row rendering

**Does NOT Own**
- Song data fetching (delegates to DataService)
- Search algorithm (delegates to SearchEngine)
- State management (uses workflowStore)
- Database operations

**Inputs**
- workflowStore state (language filter, reader state)
- User search input
- User sort selection
- User song selection

**Outputs**
- Rendered song list
- Search queries to SearchEngine
- Song selection events to workflowStore

**Collaborates With**
- workflowStore (state, actions)
- DataService (song fetching)
- SearchEngine (search operations)
- SearchBar (search input)
- LanguageTabs (language filter)
- SortSelector (sort options)
- SongRow (song items)
- Supabase (new song creation)

**Dependencies**
- React
- workflowStore
- DataService
- SearchEngine
- Supabase
- Child components

**Public Responsibilities**
- Song list rendering
- Filter application
- Search coordination
- Song selection handling
- Add song form handling

**Internal Responsibilities**
- Local search state
- Local sort state
- Loading state
- Error state
- Add form state
- Filter logic
- Sort logic

---

### SongView

**Purpose**
Component that displays individual songs with reader controls, slide animations, and navigation between songs.

**Owns**
- Song content display
- Reader controls coordination
- Slide animation management
- Swipe gesture handling
- Keyboard navigation
- Setlist navigation
- Library navigation
- Content resolution (chords/lyrics/sections)
- Page indicator display
- Song fetching coordination
- Transpose display

**Does NOT Own**
- Song data fetching (delegates to DataService/Database)
- ChordPro parsing (delegates to ChordProRenderer)
- State management (uses workflowStore)
- Database operations

**Inputs**
- workflowStore state (reader, transpose, mode)
- User navigation gestures
- User control interactions

**Outputs**
- Rendered song content
- Navigation events to workflowStore
- Transpose adjustments to workflowStore

**Collaborates With**
- workflowStore (state, actions)
- Database (song fetching)
- ReaderHeader (controls)
- ChordProRenderer (content)
- SetlistService (setlist navigation)

**Dependencies**
- React
- workflowStore
- Database
- Child components

**Public Responsibilities**
- Song display
- Navigation handling
- Animation coordination
- Control rendering

**Internal Responsibilities**
- Local song state
- Loading state
- Error state
- Slide direction tracking
- Swipe detection logic
- Content resolution logic

---

### SetlistManager

**Purpose**
Component that displays and manages the list of user setlists with creation and deletion capabilities.

**Owns**
- Setlist list display
- Setlist creation
- Setlist deletion
- Setlist selection
- Loading states
- Empty state handling

**Does NOT Own**
- Setlist CRUD operations (delegates to SetlistService)
- State management (uses workflowStore)
- Database operations

**Inputs**
- workflowStore state
- User creation/deletion actions
- User selection actions

**Outputs**
- Rendered setlist list
- Creation events to SetlistService
- Deletion events to SetlistService
- Selection events to workflowStore

**Collaborates With**
- workflowStore (state, actions)
- SetlistService (CRUD operations)
- Database (via useLiveQuery)

**Dependencies**
- React
- workflowStore
- SetlistService
- Database

**Public Responsibilities**
- Setlist list rendering
- Creation handling
- Deletion handling
- Selection handling

**Internal Responsibilities**
- Local loading state
- Empty state logic

---

### SetlistView

**Purpose**
Component that displays setlist details with song ordering, item management, and transpose controls.

**Owns**
- Setlist detail display
- Item rendering (songs, markers, notes)
- Item ordering (drag-drop)
- Item addition/removal
- Transpose value display
- Setlist navigation
- Empty state handling

**Does NOT Own**
- Setlist CRUD operations (delegates to SetlistService)
- State management (uses workflowStore)
- Database operations
- Song data fetching

**Inputs**
- workflowStore state
- Setlist ID
- User ordering actions
- User addition/removal actions

**Outputs**
- Rendered setlist detail
- Ordering events to SetlistService
- Addition/removal events to SetlistService
- Navigation events to workflowStore

**Collaborates With**
- workflowStore (state, actions)
- SetlistService (CRUD operations)
- Database (via useLiveQuery)
- SongRow (song items)

**Dependencies**
- React
- workflowStore
- SetlistService
- Database
- Child components

**Public Responsibilities**
- Setlist detail rendering
- Item ordering handling
- Item management handling
- Navigation handling

**Internal Responsibilities**
- Local setlist state (via useLiveQuery)
- Empty state logic

---

### ChordProRenderer

**Purpose**
Component that parses ChordPro format strings and renders chords and lyrics with proper formatting and styling.

**Owns**
- ChordPro format parsing
- Chord/lyric pair extraction
- Section marker detection
- Chorus detection and styling
- Directive parsing ({title: ...})
- Content filtering based on display mode
- Spacer and skip logic
- Responsive font sizing
- Rendered line generation

**Does NOT Own**
- Song data fetching
- State management
- Search functionality
- Database operations
- Transpose logic

**Inputs**
- Raw ChordPro string
- Display mode (chords/lyrics)
- Font size

**Outputs**
- Rendered song content
- Styled chord/lyric pairs

**Collaborates With**
- React (rendering)
- Parent components (props)

**Dependencies**
- React

**Public Responsibilities**
- ChordPro parsing
- Content rendering
- Mode-based filtering

**Internal Responsibilities**
- Parsing logic
- Detection logic (sections, chorus, directives)
- Filtering logic
- Styling application

---

### ReaderHeader

**Purpose**
Component that provides reader controls including transpose buttons, mode switching, and font size adjustment.

**Owns**
- Transpose up/down controls
- Reader mode switching (chords/lyrics)
- Font size adjustment
- Reader close button
- Key display
- Control button rendering

**Does NOT Own**
- Transpose logic (state only)
- State management (uses workflowStore)
- Song content rendering

**Inputs**
- workflowStore state (transpose, mode, fontSize)
- User control interactions

**Outputs**
- Transpose adjustment events to workflowStore
- Mode change events to workflowStore
- Font size change events to workflowStore
- Close event to workflowStore

**Collaborates With**
- workflowStore (state, actions)

**Dependencies**
- React
- workflowStore

**Public Responsibilities**
- Control rendering
- User interaction handling
- State updates

**Internal Responsibilities**
- None (pure presentation)

---

### SongLine

**Purpose**
Component that renders individual song lines with chords above lyrics and transpose application.

**Owns**
- Individual line rendering
- Chord display above lyric
- Transpose application to chords
- Line styling
- Chorus styling

**Does NOT Own**
- Song data fetching
- State management
- Parsing logic

**Inputs**
- Line data
- Transpose value
- Display mode
- Chorus flag

**Outputs**
- Rendered line with chords

**Collaborates With**
- React (rendering)
- Parent components (props)

**Dependencies**
- React

**Public Responsibilities**
- Line rendering
- Transpose application
- Styling application

**Internal Responsibilities**
- Transpose logic
- Styling logic

---

### SearchBar

**Purpose**
Component that provides search input field with clear button and loading state.

**Owns**
- Search input field
- Clear button
- Loading state display
- Input value management
- Clear action handling

**Does NOT Own**
- Search logic (delegates to parent)
- State management
- Result display

**Inputs**
- Current search value
- onChange callback
- onClear callback
- Loading state

**Outputs**
- Search input changes
- Clear actions

**Collaborates With**
- Parent components (callbacks)

**Dependencies**
- React

**Public Responsibilities**
- Input rendering
- Value management
- Clear handling

**Internal Responsibilities**
- None (pure presentation)

---

### SongRow

**Purpose**
Component that renders individual song list items with song number, title, artist, and active state styling.

**Owns**
- Song item rendering
- Song number display
- Title display
- Artist display
- Language indicator
- Active state styling
- Selection handling

**Does NOT Own**
- Song data fetching
- State management
- Search logic

**Inputs**
- Song data
- Active state flag
- Selection callback

**Outputs**
- Selection events

**Collaborates With**
- Parent components (callbacks)

**Dependencies**
- React

**Public Responsibilities**
- Item rendering
- Selection handling
- Styling application

**Internal Responsibilities**
- None (pure presentation)

---

## 3. Responsibility Boundaries

### App.tsx

**Owns:**
- Application layout and shell
- Service lifecycle coordination
- URL-based routing
- Admin authentication
- Import/export coordination
- Mobile/desktop layout state

**Must Never:**
- Fetch data directly from Database or Supabase
- Implement business logic
- Render song content
- Manage search functionality
- Handle setlist operations

---

### workflowStore

**Owns:**
- Global application state
- Reader state and navigation
- UI panel states
- User preferences
- State transitions

**Must Never:**
- Fetch database records
- Render UI components
- Communicate directly with Supabase
- Implement business logic
- Perform data transformations

---

### Database

**Owns:**
- IndexedDB schema and versioning
- Data access methods
- Supabase fallback logic
- Data normalization
- Transaction management

**Must Never:**
- Implement business logic
- Manage UI state
- Perform search operations
- Handle sync orchestration
- Render components

---

### DataService

**Owns:**
- Song fetching logic
- Batch download orchestration
- Delta sync implementation
- Content validation
- Search engine coordination

**Must Never:**
- Manage UI state
- Render components
- Handle setlist operations
- Implement search algorithm
- Manage realtime subscriptions

---

### SyncService

**Owns:**
- Manifest-based sync
- Index validation
- Atomic index updates
- Bulk song downloading
- Sync metadata management

**Must Never:**
- Implement delta sync (handled by DataService)
- Manage realtime subscriptions
- Render UI components
- Handle business logic outside sync

---

### RealtimeService

**Owns:**
- Websocket subscriptions
- Online/offline handling
- Database change event processing
- IndexedDB immediate updates

**Must Never:**
- Render UI components
- Manage application state
- Implement business logic
- Handle sync orchestration

---

### SetlistService

**Owns:**
- Setlist CRUD operations
- Item management
- Ordering logic
- Transpose value updates

**Must Never:**
- Render UI components
- Manage application state
- Fetch song data
- Implement search functionality

---

### SearchEngine

**Owns:**
- Search index management
- Query processing
- Ranking algorithm
- Synonym normalization

**Must Never:**
- Fetch data
- Render UI components
- Manage state
- Handle database operations

---

### SongFormatter

**Owns:**
- Text normalization
- Title formatting
- Language alias resolution

**Must Never:**
- Fetch data
- Render UI components
- Manage state
- Handle business logic

---

### SongList

**Owns:**
- Song library display
- Search input handling
- Filter application
- Sort operations
- Song selection

**Must Never:**
- Fetch song data directly (uses DataService)
- Implement search algorithm (uses SearchEngine)
- Manage global state (uses workflowStore)
- Access Database directly

---

### SongView

**Owns:**
- Song content display
- Navigation handling
- Animation coordination
- Control rendering

**Must Never:**
- Fetch song data directly (uses Database)
- Parse ChordPro (uses ChordProRenderer)
- Manage global state (uses workflowStore)
- Access Database directly

---

### SetlistManager

**Owns:**
- Setlist list display
- Creation/deletion handling
- Selection handling

**Must Never:**
- Perform setlist CRUD directly (uses SetlistService)
- Manage global state (uses workflowStore)
- Access Database directly

---

### SetlistView

**Owns:**
- Setlist detail display
- Item ordering
- Item management
- Navigation handling

**Must Never:**
- Perform setlist CRUD directly (uses SetlistService)
- Manage global state (uses workflowStore)
- Access Database directly

---

### ChordProRenderer

**Owns:**
- ChordPro parsing
- Content rendering
- Mode-based filtering

**Must Never:**
- Fetch data
- Manage state
- Implement business logic
- Access database

---

### ReaderHeader

**Owns:**
- Control rendering
- User interaction handling
- State updates via workflowStore

**Must Never:**
- Implement transpose logic
- Manage state directly
- Access database
- Fetch data

---

### SongLine

**Owns:**
- Line rendering
- Transpose application
- Styling application

**Must Never:**
- Fetch data
- Manage state
- Access database

---

### SearchBar

**Owns:**
- Input rendering
- Value management
- Clear handling

**Must Never:**
- Implement search logic
- Manage state
- Access database

---

### SongRow

**Owns:**
- Item rendering
- Selection handling
- Styling application

**Must Never:**
- Fetch data
- Manage state
- Access database

---

## 4. Collaboration Map

### Song Data Fetching Flow

**SongView**
↓ (requests song by ID)
**Database.getSongById**
↓ (checks IndexedDB, falls back to Supabase if needed)
**IndexedDB or Supabase**
↓ (returns song data)
**Database**
↓ (returns normalized song)
**SongView**
↓ (renders via ChordProRenderer)

**Collaboration Purpose:** SongView needs song data to display. Database provides data access with fallback. SongView never accesses IndexedDB or Supabase directly.

---

### Library Loading Flow

**SongList**
↓ (requests song list)
**DataService.getSongs**
↓ (checks IndexedDB, falls back to Supabase)
**IndexedDB or Supabase**
↓ (returns song index data)
**DataService**
↓ (returns normalized songs)
**SongList**
↓ (indexes songs)
**SearchEngine.indexSongs**
↓ (builds search index)
**SongList**
↓ (renders songs via SongRow)

**Collaboration Purpose:** SongList needs library data. DataService provides fetching with fallback. SearchEngine indexes for search. SongList never accesses database directly.

---

### Search Execution Flow

**SongList**
↓ (provides search query and songs)
**SearchEngine.search**
↓ (normalizes query, searches index)
**MiniSearch**
↓ (returns ranked results)
**SearchEngine**
↓ (applies phrase bonuses, sorts)
**SearchEngine**
↓ (returns final results)
**SongList**
↓ (renders results via SongRow)

**Collaboration Purpose:** SongList needs search functionality. SearchEngine provides search algorithm. SongList never implements search logic.

---

### Setlist Creation Flow

**SetlistManager**
↓ (requests setlist creation)
**SetlistService.createSetlist**
↓ (generates UUID, creates object)
**Database.setlists.add**
↓ (stores setlist)
**Database**
↓ (returns setlist ID)
**SetlistService**
↓ (returns ID)
**SetlistManager**
↓ (updates workflowStore)
**workflowStore.openSetlist**
↓ (updates state)
**App.tsx**
↓ (renders SetlistView)

**Collaboration Purpose:** SetlistManager needs setlist creation. SetlistService provides business logic. Database provides persistence. workflowStore manages navigation state.

---

### Setlist Item Addition Flow

**SetlistView**
↓ (requests song addition)
**SetlistService.addSongToSetlist**
↓ (calculates order, creates item)
**Database.setlists.update**
↓ (updates setlist)
**Database**
↓ (returns success)
**SetlistService**
↓ (returns success)
**SetlistView**
↓ (re-renders via useLiveQuery)

**Collaboration Purpose:** SetlistView needs item addition. SetlistService provides business logic. Database provides persistence. SetlistView never accesses database directly.

---

### Delta Sync Flow

**App.tsx**
↓ (calls on app mount)
**DataService.wakeUpSync**
↓ (gets last sync time)
**Database.meta.get**
↓ (returns timestamp)
**DataService**
↓ (queries Supabase for changes)
**Supabase**
↓ (returns changed song IDs)
**DataService**
↓ (fetches full data)
**Supabase**
↓ (returns song data)
**DataService**
↓ (transforms and updates IndexedDB)
**Database**
↓ (updates songs and songIndex tables)
**DataService**
↓ (re-indexes)
**SearchEngine.indexSongs**
↓ (updates search index)

**Collaboration Purpose:** App.tsx coordinates sync. DataService implements delta sync logic. Database provides persistence. SearchEngine updates index. Supabase provides cloud data.

---

### Realtime Update Flow

**RealtimeService**
↓ (subscribes to Supabase)
**Supabase**
↓ (detects database change)
**Supabase**
↓ (pushes event via websocket)
**RealtimeService**
↓ (handles change event)
**RealtimeService.handleDatabaseChange**
↓ (transforms record)
**Database**
↓ (updates IndexedDB)
**RealtimeService**
↓ (dispatches custom event)
**Window**
↓ (component receives event)
**Component**
↓ (re-renders via useLiveQuery)

**Collaboration Purpose:** RealtimeService manages subscriptions. Database receives updates. Components react via useLiveQuery. RealtimeService never manages UI state.

---

### Navigation Flow

**SongRow**
↓ (user clicks song)
**workflowStore.openSong**
↓ (updates reader state)
**workflowStore**
↓ (state change triggers re-render)
**App.tsx**
↓ (detects reader.type === 'song')
**App.tsx**
↓ (renders SongView)

**Collaboration Purpose:** Components trigger navigation via workflowStore actions. workflowStore manages state. App.tsx routes based on state. Components never manage navigation state directly.

---

### Transpose Flow

**ReaderHeader**
↓ (user clicks transpose button)
**workflowStore.adjustTranspose**
↓ (updates reader.transpose)
**workflowStore**
↓ (state change triggers re-render)
**SongView**
↓ (receives new transpose value)
**SongView**
↓ (passes to ChordProRenderer/SongLine)
**Component**
↓ (displays updated transpose)

**Collaboration Purpose:** ReaderHeader triggers transpose change. workflowStore manages transpose state. SongView displays transpose. Components never manage transpose state directly.

---

## 5. Ownership Rules

### Current Implementation Rules

**Components never access IndexedDB directly.**
- All data access goes through Database.ts or service layer
- Components use DataService, SetlistService, or Database methods
- No direct Dexie calls in components

**Services own business logic.**
- DataService owns song fetching and sync logic
- SetlistService owns setlist CRUD logic
- SyncService owns manifest sync logic
- RealtimeService owns realtime subscription logic
- Components do not implement business logic

**Database owns persistence.**
- Database.ts owns all IndexedDB operations
- Services call Database methods
- Components never call Dexie directly
- Database owns schema and versioning

**Store owns shared UI state.**
- workflowStore owns all global application state
- Components read state via selectors
- Components update state via actions
- No local state for shared concerns

**SearchEngine owns search algorithm.**
- SearchEngine owns MiniSearch configuration
- SearchEngine owns query processing
- SearchEngine owns ranking logic
- Components delegate search to SearchEngine

**SongFormatter owns text normalization.**
- SongFormatter owns normalization logic
- SongFormatter owns formatting logic
- Services and components use SongFormatter utilities
- No inline normalization in components

**App.tsx owns orchestration.**
- App.tsx owns service initialization
- App.tsx owns layout coordination
- App.tsx owns URL routing
- Components do not coordinate services

**Presentation components own rendering only.**
- SearchBar, SongRow, ReaderHeader own only rendering
- These components do not implement logic
- These components receive callbacks from parents
- These components do not access services or database

**Parent components own child coordination.**
- SongList coordinates SearchBar, LanguageTabs, SortSelector
- SongView coordinates ReaderHeader, ChordProRenderer
- SetlistView coordinates item rendering
- Child components do not coordinate siblings

**useLiveQuery owns reactive data access.**
- Components use useLiveQuery for reactive database queries
- Components do not manually query and subscribe
- Database layer does not manage reactivity

**Services own external API communication.**
- DataService communicates with Supabase
- SyncService communicates with /exports endpoint
- RealtimeService communicates with Supabase realtime
- Components never call external APIs directly

---

## 6. Dependency Direction

### Intended Dependency Flow

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (Components: SongList, SongView)   │
└──────────────┬──────────────────────┘
               │ reads state, calls actions
               ↓
┌─────────────────────────────────────┐
│         State Layer                  │
│       (workflowStore)                │
└──────────────┬──────────────────────┘
               │ calls services
               ↓
┌─────────────────────────────────────┐
│        Service Layer                 │
│ (DataService, SetlistService, etc.) │
└──────────────┬──────────────────────┘
               │ reads/writes data
               ↓
┌─────────────────────────────────────┐
│      Persistence Layer               │
│         (Database.ts)               │
└──────────────┬──────────────────────┘
               │ fallback
               ↓
┌─────────────────────────────────────┐
│         Cloud Layer                  │
│        (Supabase)                    │
└─────────────────────────────────────┘
```

### Layer Rules

**Presentation Layer → State Layer**
- Components read state via workflowStore selectors
- Components update state via workflowStore actions
- Components never bypass state layer for shared state

**State Layer → Service Layer**
- workflowStore does not call services
- Services are called by components directly
- State layer owns state only, not business logic

**Service Layer → Persistence Layer**
- Services call Database methods
- Services never access IndexedDB directly
- Services never call Supabase directly (except DataService and RealtimeService)

**Persistence Layer → Cloud Layer**
- Database falls back to Supabase when needed
- Services never call Supabase directly (except DataService and RealtimeService)
- Cloud layer is accessed only by Database, DataService, and RealtimeService

### Legitimate Exceptions

**App.tsx → Service Layer**
- App.tsx directly calls DataService.wakeUpSync
- App.tsx directly calls SetlistService for URL imports
- App.tsx directly calls RealtimeService.initialize
- Reason: App.tsx owns service lifecycle coordination

**Components → Service Layer**
- Components directly call service methods (DataService, SetlistService)
- Reason: Services own business logic, components orchestrate workflows

**Components → Persistence Layer**
- Components directly call Database methods (getSongById)
- Reason: Database provides data access, components need data
- This is acceptable as Database is a persistence abstraction

**Components → Utility Layer**
- Components directly call SearchEngine and SongFormatter
- Reason: Utilities provide pure functions, no state or side effects

**RealtimeService → Service Layer**
- RealtimeService calls DataService.wakeUpSync on online event
- Reason: RealtimeService owns online handling, needs to trigger sync

---

## 7. Feature Ownership

### Search

**Primary Owner:** SearchEngine

**Supporting Modules:**
- SongList (search input handling, result display)
- SearchBar (search input UI)
- SongFormatter (text normalization used by SearchEngine)

**Responsibility Split:**
- SearchEngine: Search algorithm, indexing, ranking
- SongList: Search coordination, result rendering
- SearchBar: Input UI only

---

### Reader

**Primary Owner:** SongView

**Supporting Modules:**
- ChordProRenderer (content parsing and rendering)
- ReaderHeader (controls)
- SongLine (line rendering)
- workflowStore (reader state)

**Responsibility Split:**
- SongView: Reader orchestration, navigation, animations
- ChordProRenderer: Content parsing and rendering
- ReaderHeader: Control UI
- workflowStore: Reader state management

---

### Synchronization

**Primary Owner:** DataService (delta sync), SyncService (manifest sync)

**Supporting Modules:**
- Database (persistence)
- RealtimeService (realtime updates)
- SearchEngine (index updates)
- App.tsx (sync coordination)

**Responsibility Split:**
- DataService: Delta sync, batch downloads
- SyncService: Manifest sync, validation
- RealtimeService: Realtime subscriptions
- Database: Data persistence
- SearchEngine: Index updates
- App.tsx: Sync lifecycle

---

### Setlists

**Primary Owner:** SetlistService

**Supporting Modules:**
- SetlistManager (setlist list display)
- SetlistView (setlist detail display)
- Database (persistence)
- workflowStore (navigation state)

**Responsibility Split:**
- SetlistService: Setlist CRUD, item management
- SetlistManager: Setlist list UI
- SetlistView: Setlist detail UI
- Database: Persistence
- workflowStore: Navigation state

---

### Song Library

**Primary Owner:** SongList

**Supporting Modules:**
- DataService (song fetching)
- SearchEngine (search)
- SongRow (song item display)
- workflowStore (library state)

**Responsibility Split:**
- SongList: Library display, filtering, sorting
- DataService: Song fetching
- SearchEngine: Search functionality
- SongRow: Song item UI
- workflowStore: Library state

---

### Offline Support

**Primary Owner:** Database (with Supabase fallback)

**Supporting Modules:**
- DataService (offline-aware fetching)
- RealtimeService (online/offline detection)
- main.tsx (service worker)
- ConnectionStatus (status display)

**Responsibility Split:**
- Database: IndexedDB persistence, Supabase fallback
- DataService: Offline-aware data access
- RealtimeService: Online/offline state
- main.tsx: Service worker registration
- ConnectionStatus: Status UI

---

### PWA Functionality

**Primary Owner:** main.tsx

**Supporting Modules:**
- vite-plugin-pwa (service worker generation)
- PWAInstallButton (install UI)
- InstallPrompt (install guidance)

**Responsibility Split:**
- main.tsx: Service worker registration
- vite-plugin-pwa: Service worker generation
- PWAInstallButton: Install UI
- InstallPrompt: Install guidance

---

### Admin Features

**Primary Owner:** App.tsx

**Supporting Modules:**
- workflowStore (admin state)
- EditorMode (editor UI)
- SongList (add song form)

**Responsibility Split:**
- App.tsx: Admin authentication, coordination
- workflowStore: Admin state
- EditorMode: Editor UI
- SongList: Add song form

---

### Navigation

**Primary Owner:** workflowStore

**Supporting Modules:**
- App.tsx (routing based on state)
- SongView (navigation gestures)
- All components (navigation triggers)

**Responsibility Split:**
- workflowStore: Navigation state
- App.tsx: Routing logic
- SongView: Navigation gestures
- Components: Navigation triggers

---

### Transpose

**Primary Owner:** workflowStore (state), SongLine (logic)

**Supporting Modules:**
- ReaderHeader (transpose controls)
- SongView (transpose display)

**Responsibility Split:**
- workflowStore: Transpose state
- SongLine: Transpose application logic
- ReaderHeader: Transpose controls
- SongView: Transpose display

---

## 8. Extension Points

### Adding Favorites

**Owner:** Database

**Reasoning:** Database owns data persistence. Favorites would be a new table or field in the existing schema. Components would read/write via Database methods.

---

### Song Tags

**Owner:** Database

**Reasoning:** Database owns data schema. Tags would be added to song schema. SearchEngine would need to index tags. SongList would need tag filtering UI.

---

### Song History

**Owner:** Database

**Reasoning:** Database owns persistence. History would be a new table tracking song access. workflowStore might manage current history state for display.

---

### Collaborative Editing

**Owner:** RealtimeService

**Reasoning:** RealtimeService already manages realtime subscriptions. Collaborative editing would extend existing realtime capabilities to track edit conflicts and concurrent edits.

---

### User Profiles

**Owner:** Database

**Reasoning:** Database owns persistence. User profiles would be a new table. workflowStore would manage current user state. App.tsx would handle authentication flow.

---

### Song Versions

**Owner:** Database

**Reasoning:** Database owns data schema. Song versions would be a new table or relationship. SetlistService might need to handle version selection. SongView would need version display.

---

### Song Ratings

**Owner:** Database

**Reasoning:** Database owns persistence. Ratings would be a field in song schema or separate table. SongList would display ratings. SearchEngine might rank by ratings.

---

### Playlists

**Owner:** SetlistService

**Reasoning:** SetlistService already owns setlist logic. Playlists would be similar to setlists, possibly with different ownership rules. SetlistManager/SetlistView would need playlist-specific UI.

---

### Song Sharing

**Owner:** SetlistService

**Reasoning:** SetlistService already owns shared setlists. Song sharing would extend existing sharing logic. Database would need shared songs table. SharedManager would handle sharing UI.

---

### Audio Integration

**Owner:** New Service (AudioService)

**Reasoning:** Audio playback is a new concern not owned by existing modules. A new AudioService would own audio logic. SongView would integrate audio controls. Database might store audio metadata.

---

### PDF Export

**Owner:** New Service (ExportService)

**Reasoning:** Export is a new concern not owned by existing modules. A new ExportService would own export logic. SongView or ReaderHeader would trigger export. ChordProRenderer might provide formatted data.

---

### Song Transposition (Actual Implementation)

**Owner:** ChordTransposer (utility), SongLine (application)

**Reasoning:** ChordTransposer already exists as a utility. SongLine applies transpose to chords. This would require integrating ChordTransposer into the rendering pipeline rather than just storing the transpose value.

---

### Advanced Search Filters

**Owner:** SearchEngine

**Reasoning:** SearchEngine owns search algorithm. Advanced filters would extend search query processing. SongList would need filter UI components.

---

### Song Annotations

**Owner:** Database

**Reasoning:** Database owns persistence. Annotations would be a new table linked to songs. SongView would need annotation display and editing UI.

---

### Setlist Templates

**Owner:** SetlistService

**Reasoning:** SetlistService owns setlist logic. Templates would be a new setlist type or separate table. SetlistManager would need template selection UI.

---

### Performance Metrics

**Owner:** New Service (AnalyticsService)

**Reasoning:** Analytics is a new concern not owned by existing modules. A new AnalyticsService would own metrics collection. App.tsx would initialize service. Components would report events.

---

### Cloud Backup

**Owner:** SyncService

**Reasoning:** SyncService already owns sync logic. Cloud backup would extend sync to include user data (setlists, personal songs). Database would need additional tables for user data.

---

### Multi-language Support

**Owner:** SongFormatter, Database

**Reasoning:** SongFormatter already handles text normalization. Database stores language field. SongList already filters by language. Extension would require translation infrastructure, likely a new TranslationService.

---

### Accessibility Features

**Owner:** Components (individual implementation)

**Reasoning:** Accessibility is a cross-cutting concern. Each component would need to implement ARIA labels, keyboard navigation, and screen reader support. No single module owns this.

---

### Theme System

**Owner:** New Utility (ThemeService) or CSS Layer

**Reasoning:** Theming is a new concern. Could be implemented as a CSS layer with Tailwind, or a ThemeService for dynamic theming. workflowStore would manage theme state.
