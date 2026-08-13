# Semantic UI Audit Inventory

Scope: audit-only semantic inventory of the visible interface surfaces in the worship song library runtime before any styling or theming changes are applied.

## Audit objective
The goal is not to document React components or CSS classes.
The goal is to map every visible interface element into a semantic design system that future themes can reuse.

This audit should answer:
- What is the element?
- Why does it exist?
- How important is it?
- What family does it belong to?
- What visual hierarchy does it belong to?

## Audit constraints
- Do not redesign anything yet.
- Do not recolor anything yet.
- Do not implement a new theme yet.
- Keep this purely descriptive and structural.

## Semantic design-system lens
Each visible element should be classified by:
- Element Name
- Screen
- Purpose
- Component Family
- Visual Emphasis
- Material Identity
- Interaction States
- Current Visual Style

### Visual emphasis categories
- Hero: main focus area or primary content subject.
- Primary: prominent interactive or structural element.
- Secondary: supporting content or secondary action.
- Supporting: metadata, badges, hints, or minor affordances.
- Decorative: separators, ornaments, or purely visual rhythm cues.

### Material identity categories (conceptual)
These are design abstractions, not CSS properties.
They describe the conceptual feel of each element so themes can remain coherent across surfaces.

- Paper: reading surfaces, content bodies, and neutral content cards.
- Sandstone: large persistent surfaces such as sidebars or broad containers.
- Wood: headers, toolbars, and structural controls.
- Polished Wood: primary buttons and prominent interactive controls.
- Leather: active pills, pressed states, or tactile interactive surfaces.
- Wax Seal: small status badges and minor marks.
- Carved Stone: dialogs, modal surfaces, and ceremonial or high-importance overlays.
- Writing Desk: input surfaces and form fields.
- Pencil Line: dividers and separators.
- Thick Paper: list cards and content containers that feel substantial and tactile.

## Semantic families to inventory

### 1) Surfaces and containers
These define the background and structural visual layers.

- Primary background
- Secondary background
- Elevated surface
- Reader surface
- Modal / overlay surface
- Sidebar surface
- Card surface
- Divider / border
- Shadow

### 2) Typography roles
These define the meaning and hierarchy of text.

- Primary text
- Secondary text
- Muted text
- Accent text
- Label text
- Inverse text
- Decorative / status text

### 3) Buttons
These are interaction elements with clear hierarchy.

- Primary button
- Secondary button
- Ghost button
- Icon button
- Danger button
- Success button
- Floating action button

### 4) Inputs and controls
These allow user input or selection.

- Text input
- Search input
- Dropdown / select
- Toggle switch
- Key picker
- Toolbar control
- Form field

### 5) Pills, chips, and badges
These communicate status, filtering, or metadata.

- Language filter pill
- Reader mode pill
- Status pill
- Badge
- Draft badge
- Search-match badge
- Active-state chip

### 6) Cards and list items
These group content into repeatable, scannable units.

- Song card / song row
- Information card
- Status card
- Preview card
- Empty-state card
- Section card

### 7) Reader semantics
These define the reading experience and should remain theme-safe.

- Reader background
- Reader header
- Song title
- Song metadata
- Lyrics body
- Chords
- Section divider
- Progress indicator
- Reader toolbar

### 8) Navigation and overlays
These help users move between content and screens.

- Sidebar navigation
- Header bar
- Mobile bottom nav
- Floating menu
- Context rail
- Dialog / modal
- Popover / dropdown
- Toast / status banner

### 9) Admin and editing surfaces
These support authoring, editing, and management operations.

- Form container
- Input label
- Helper text
- Dropdown / picker
- Toolbar
- Preview panel
- Key picker
- Insert tool palette
- Save / cancel controls

## Inventory by screen

### Song list and library view
| Element | Purpose | Component family | Visual Emphasis | Material Identity | Interaction states | Current visual style |
|---|---|---|---|---|---|---|
| Sidebar surface | Provides the main app navigation and content switcher | Surface | Primary | Sandstone | Normal, active, hover | Light neutral surface with subtle border |
| Header bar | Hosts app title, admin controls, download button, settings access | Navigation / surface | Primary | Wood | Hover, active, admin-only states | Light header with muted icon buttons |
| Language filter pill | Allows filtering songs by language | Pill / chip | Primary | Leather | Normal, selected, hover | Rounded pill with slate fill and active contrast |
| Search input | Allows text-based discovery of songs | Input | Primary | Writing Desk | Normal, focused, empty, query active | Rounded input with light fill and subtle focus ring |
| Sort control | Lets users switch list ordering | Dropdown / control | Secondary | Wood | Normal, open, selected | Inline control with popover panel |
| Song card / song row | Displays a single song entry in the list | Card / list item | Primary | Thick Paper | Normal, hover, active, draft state | Light row with title, metadata, avatar, action affordance |
| Song number badge | Identifies the song number visually | Badge | Supporting | Wax Seal | Normal | Small circular/rounded badge |
| Song title | Identifies the song in the list | Text role | Hero | Paper | Normal, hover, active | Bold title text with muted supporting metadata |
| Song metadata | Conveys language, key, and status details | Text / badge | Secondary | Paper | Normal | Smaller muted text and small badges |
| Status badge | Communicates draft, search match, or active/inactive state | Badge | Supporting | Wax Seal | Normal | Colored badge with strong contrast |
| Empty state | Explains that no songs match or no content is present | Card / state | Supporting | Paper | Empty | Light center-aligned copy with muted text |
| Loading state | Communicates library loading progress | State / indicator | Secondary | Paper | Loading | Neutral spinner and muted text |

### Song reader
| Element | Purpose | Component family | Visual Emphasis | Material Identity | Interaction states | Current visual style |
|---|---|---|---|---|---|---|
| Reader background | Provides the main reading canvas | Surface | Primary | Paper | Normal | Near-white paper-like container |
| Reader header | Shows song identity and reader controls | Surface / toolbar | Primary | Wood | Normal, hover, open menu | White or near-white header with subtle border |
| Song title | Names the current song in the reader | Text role | Hero | Paper | Normal | Bold title with strong hierarchy |
| Song metadata | Shows artist, song number, and related context | Text / metadata | Secondary | Paper | Normal | Smaller muted text |
| Lyrics body | Presents the actual content for reading | Reader content | Hero | Paper | Normal, hidden-chords mode, transpose state | Neutral body text with chord emphasis |
| Chords | Shows chord markers above or beside lyrics | Inline accent | Secondary | Polished Wood | Normal, transposed, hidden | Muted blue or brand-toned chord markers |
| Section divider | Separates verses, chorus, bridge, and other sections | Divider | Decorative | Pencil Line | Normal | Spacing and subtle visual separator |
| Reader toolbar | Offers transpose, mode, and menu actions | Toolbar / control | Secondary | Wood | Normal, hover, active | Compact button cluster |
| Progress indicator | Indicates navigation position in a sequence | Indicator | Supporting | Wax Seal | Active / inactive | Small dots or markers |
| Empty fallback | Explains missing or unavailable content | Empty state | Supporting | Paper | Empty / offline | Centered muted copy with CTA-style button |

### Search and discovery surfaces
| Element | Purpose | Component family | Visual Emphasis | Material Identity | Interaction states | Current visual style |
|---|---|---|---|---|---|---|---|
| Search input | Accepts search terms | Input | Primary | Writing Desk | Normal, focused, cleared | Rounded input with clear affordance |
| Search results overlay | Presents the live search result viewport | Overlay / surface | Primary | Paper | Open, empty, result-present | Fixed overlay with light surface and result rows |
| Search result row | Presents a single result entry | Card / list item | Secondary | Thick Paper | Normal, hover, selected | Light row with title and metadata |
| Search metadata | Explains whether the result matched title, lyrics, or both | Badge / supporting text | Supporting | Wax Seal | Normal | Small badge or muted label |

### Setlists, shared songs, and personal songs
| Element | Purpose | Component family | Visual Emphasis | Material Identity | Interaction states | Current visual style |
|---|---|---|---|---|---|---|---|
| Setlist list card | Presents created setlists | Card / list item | Primary | Thick Paper | Normal, hover, active | Light row with title and metadata |
| Setlist create form | Allows creating a setlist | Form / input | Primary | Writing Desk | Normal, focused, submit / cancel | White form card with border |
| Marker / note entry | Adds structural items to a setlist | Badge / button | Secondary | Polished Wood | Normal, active, editing | Brand or amber accent treatment |
| Shared song collection | Displays imported shared songs | Card / list item | Secondary | Thick Paper | Normal, hover, delete | Light boxed container with item rows |
| Personal song collection | Displays personal songs | Card / list item | Secondary | Thick Paper | Normal, hover, delete, active | Light container with amber accent framing |

### Settings, overlays, and status surfaces
| Element | Purpose | Component family | Visual Emphasis | Material Identity | Interaction states | Current visual style |
|---|---|---|---|---|---|---|---|
| Settings panel | Hosts settings and operational controls | Dialog / panel | Primary | Carved Stone | Open, closed, collapsed | White modal panel with clear sections |
| Song management section | Supports download, sync, and library deletion actions | Card / panel | Primary | Thick Paper | Loading, success, error | White card with accent buttons |
| Appearance section | Lets the user choose a theme variant | Control / pill group | Secondary | Leather | Normal, selected | Rounded pill buttons |
| Extras section | Holds future or secondary settings | Card / placeholder | Supporting | Paper | Static | Dashed placeholder styling |
| Download progress overlay | Shows active download progress | Overlay / status | Primary | Polished Wood | Active, complete, error | Floating card with progress bar |
| Connectivity status badge | Communicates online/offline/sync state | Status indicator / pill | Supporting | Wax Seal | Normal, changed | Circular or pill-shaped status chip |
| Install prompt | Encourages PWA install | Dialog / sheet | Secondary | Carved Stone | Visible, dismissed, install instructions | Bottom sheet or centered modal |
| Startup gate | Guides first-run setup and download | Surface / CTA | Primary | Paper | Loading, setup, skip | Full-screen light setup screen |

## Visual hierarchy by screen
These diagrams describe how attention should flow through each screen, from the broadest shell structure down to the most specific content units.

### Song list screen
```text
App
└── Sidebar (Primary)
    ├── Header (Hero)
    │   ├── App Title (Hero)
    │   ├── Settings Button (Secondary)
    │   └── Download Button (Secondary)
    ├── Search (Primary)
    ├── Language Filters (Primary Interactive)
    ├── Sort Controls (Secondary)
    └── Song List
        ├── Song Card (Primary)
        │   ├── Song Number (Supporting)
        │   ├── Song Title (Hero)
        │   ├── Metadata (Secondary)
        │   └── Status Badge (Supporting)
```

### Song reader
```text
App
└── Reader Surface (Primary)
    ├── Reader Header (Primary)
    │   ├── Song Title (Hero)
    │   ├── Song Metadata (Secondary)
    │   └── Reader Toolbar (Secondary)
    ├── Lyrics Body (Hero)
    │   ├── Chord Markers (Secondary)
    │   └── Section Divider (Decorative)
    └── Progress Indicator (Supporting)
```

### Admin editor
```text
App
└── Editor Surface (Primary)
    ├── Editor Header (Primary)
    │   ├── Save / Cancel Controls (Secondary)
    │   └── Metadata Controls (Secondary)
    ├── Song Content Editor (Hero)
    │   ├── Song Text (Hero)
    │   ├── Chord Preview (Secondary)
    │   └── Preview Panel (Secondary)
    ├── Key Picker (Primary)
    └── Chord Palette (Secondary)
```

### Search overlay
```text
App
└── Search Overlay (Primary)
    ├── Overlay Header (Primary)
    │   ├── Search Input (Primary)
    │   └── Close Action (Secondary)
    └── Search Results
        ├── Result Row (Secondary)
        │   ├── Result Title (Hero)
        │   └── Result Metadata (Supporting)
```

### Settings
```text
App
└── Settings Dialog (Primary)
    ├── Dialog Header (Primary)
    ├── Song Management Section (Primary)
    ├── Appearance Section (Secondary)
    ├── Extras Section (Supporting)
    └── Action Controls (Secondary)
```

### Setlists
```text
App
└── Setlist Surface (Primary)
    ├── Setlist Header (Primary)
    │   ├── Title (Hero)
    │   └── Share Action (Secondary)
    ├── Add Controls (Secondary)
    └── Setlist Items
        ├── Song Row (Primary)
        ├── Marker Row (Secondary)
        └── Note Row (Secondary)
```

### Personal songs
```text
App
└── Personal Songs Surface (Primary)
    ├── Header / Add Action (Primary)
    ├── Create Form (Secondary)
    └── Personal Song List
        ├── Personal Song Card (Primary)
        │   ├── Song Title (Hero)
        │   ├── Metadata (Secondary)
        │   └── Status / Delete Cue (Supporting)
```

## Component relationships
These relationships describe how the interface behaves as a system, not just how it is visually assembled.

### Relationship vocabulary
- Opens
- Controls
- Filters
- Updates
- Creates
- Deletes
- Synchronizes
- Navigates

| Source | Relationship | Target | Notes |
|---|---|---|---|
| Language Filter | Filters | Song List | Narrows the visible song set by language |
| Search Input | Filters | Search Overlay | Drives the live result overlay experience |
| Search Overlay | Opens | Reader | Selection of a search result opens the song reader |
| Song Row | Opens | Reader | Selecting a song opens the primary reading surface |
| Reader Toolbar | Controls | Chord Renderer | Transpose or formatting controls affect the rendered lyrics |
| Theme Selector | Updates | Entire UI | Changes the selected visual theme across the app |
| Reader Menu | Opens | Options Dialog | Reveals contextual choices for the active reader state |
| Add Marker / Add Note | Creates | Setlist Items | Adds new structural content to the active setlist |
| Setlist Item Row | Deletes | Setlist Sequence | Removes an item from the current setlist order |
| Download / Sync Controls | Synchronizes | Library State | Updates the available offline or synced content |
| Sidebar Navigation | Navigates | Screen Surface | Switches between library, shared, setlists, and personal views |

## Semantic token map for future theming
The following semantic roles should eventually drive the theme system rather than component-specific colors:

- Primary background
- Secondary background
- Elevated surface
- Reader background
- Primary text
- Secondary text
- Muted text
- Border / divider
- Primary accent
- Secondary accent
- Success state
- Warning state
- Danger state
- Shadow
- Interactive hover state
- Selected state
- Disabled state

## Final design-system goal
The final deliverable should not require editing individual components to change the theme.
Instead, every visible component should consume semantic roles, and themes should change those roles globally.

Example outcome:
- A primary button always maps to the same semantic role regardless of where it appears.
- A language filter pill and a status pill can both reuse the same chip family token set.
- The reader can be themed by changing reader-surface, reader-text, chord-accent, and divider roles without redeclaring color per component.
