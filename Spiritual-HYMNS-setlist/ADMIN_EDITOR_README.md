# Admin Song Editor - UI/UX Implementation

**Status**: ✅ UI/UX Phase Complete (No Backend Integration Yet)

This document describes the admin song editor built for the Spiritual Hymns application. The editor provides a safe, user-friendly interface for music directors to manage the official song library.

---

## Overview

The admin editor is a **React + Vite + TypeScript + Tailwind CSS** application that runs as part of the main Spiritual Hymns app. It provides two distinct editing modes:

1. **Chord Editor** - Visual chord placement and editing
2. **Lyrics Editor** - Safe lyric editing with locked chords

### Design Philosophy

- **Familiar UI**: Uses the same visual language as the main song reader
- **No Raw JSON**: Admins never see bracket notation or internal data structures
- **Mode Separation**: Prevent accidental modifications by separating chord and lyric editing
- **Live Preview**: Real-time rendering shows exactly what users will see
- **Mobile-First**: Works on phones, tablets, and desktops

---

## Architecture

### Component Structure

```
worship-song-library-runtime/src/components/admin/
├── AdminSongEditor.tsx           (Main container & state management)
├── AdminEditorHeader.tsx          (Title & key selector)
├── AdminEditorModeToggle.tsx      (Chord/Lyrics mode switcher)
├── AdminChordEditor.tsx           (Chord editing interface)
├── AdminLyricsEditor.tsx          (Lyrics editing interface)
├── AdminEditorPreview.tsx         (Live preview pane)
├── AdminEditorFooter.tsx          (Save/Preview/Publish buttons)
├── AdminEditorDemo.tsx            (Standalone demo page)
└── index.ts                       (Exports)
```

### Data Models

Located in `src/types/AdminEditor.ts`:

```typescript
export type EditingMode = 'lyrics' | 'chords';

export interface EditableChord {
  id: string;           // Unique chord instance ID
  position: number;     // Character position in lyric (for future positional chords)
  chord: string;        // Chord name (e.g., "D", "Dm", "G#maj7")
}

export interface EditableLine {
  id: string;
  text: string;         // Lyric text
  chords: EditableChord[];
}

export interface EditableSection {
  id: string;
  type: string;         // "verse", "chorus", "bridge", etc.
  label: string;        // Display name (editable)
  lines: EditableLine[];
}

export interface EditableSong {
  id: string;
  title: string;
  artist: string;
  language: string;
  defaultKey: string;   // Official key
  sections: EditableSection[];
}
```

---

## Features Implemented

### 1. Header (AdminEditorHeader)

- **Song Title**: Click to edit inline
- **Default Key Selector**: Dropdown with all chromatic keys (C-B, including minors)
- **Back Button**: Navigate back from editor
- **Responsive**: Collapses on mobile

**Implementation**:
```typescript
// Click title to edit
<h1 onClick={() => setIsEditingTitle(true)}>
  {title}
</h1>

// Dropdown key selector
<select value={defaultKey} onChange={(e) => onKeyChange(e.target.value)}>
  {AVAILABLE_KEYS.map((key) => (
    <option key={key} value={key}>{key}</option>
  ))}
</select>
```

---

### 2. Mode Toggle (AdminEditorModeToggle)

Two distinct editing modes with visual indicators:

#### **Chord Mode** (Blue)
- Edit chords
- Edit default key
- Lyrics are locked (visible but not editable)
- Section labels remain editable

#### **Lyrics Mode** (Green)
- Edit lyrics
- Edit section names
- Chords are visible but locked (cannot be changed)

**Visual Design**:
```
┌─────────────────────────────────────────┐
│ [Edit Chords] [Edit Lyrics]             │
│  (Blue)        (Green)                  │
└─────────────────────────────────────────┘
```

---

### 3. Chord Editor (AdminChordEditor)

The core chord editing experience.

#### Features:

**Chord Entry**:
- Click on any line to activate chord input
- Type chord name: `d` → `D`, `dm` → `Dm`, `g#` → `G#`, `bb` → `Bb`
- Automatic formatting using `ChordFormatter` utility
- Suggestions appear as you type
- Press Enter or click "Add Chord" to confirm
- Press Escape to cancel

**Chord Display**:
- Chords shown above lyrics in amber/orange color
- Click chord to select it (turns blue)
- Selected chords show delete button (X)
- Click X or selected chord to delete

**Section Labels**:
- Editable inline (Verse 1, Chorus, etc.)
- Becomes active on click

**Locked Lyrics**:
- Displayed but cannot be edited in chord mode
- Shows word count for reference

#### Code Example:

```typescript
const addOrUpdateChord = (chordName: string) => {
  const formatted = formatChord(chordName);
  if (!formatted.isValid) return;
  
  // Find line and add/update chord
  const line = findLine(song, activeLineId);
  const existing = line.chords.find(c => c.position === 0);
  
  if (existing) {
    existing.chord = formatted.formatted;
  } else {
    line.chords.push({
      id: `c${Date.now()}`,
      position: 0,
      chord: formatted.formatted,
    });
  }
  
  onSongUpdate(updatedSong);
};
```

---

### 4. Lyrics Editor (AdminLyricsEditor)

Safe lyrics editing with protected chords.

#### Features:

**Lyric Editing**:
- Each line is a textarea
- Full multi-line editing support
- Add new lines with "+ Add Line" button
- Delete lines with ✕ button

**Section Labels**:
- Editable inline

**Chord Protection**:
- Chords shown above lyrics (read-only)
- Cannot be modified in this mode
- Info banner reminds admin to use Chord Mode

**Line Management**:
- Add lines after any line
- Delete lines
- Numbered line display

#### Code Example:

```typescript
const handleLyricsChange = (lineId: string, newText: string) => {
  const updatedSong = structuredClone(song);
  const line = findLine(updatedSong, lineId);
  line.text = newText;
  onSongUpdate(updatedSong);
};

const handleAddLine = (sectionId: string, afterLineId?: string) => {
  const section = findSection(updatedSong, sectionId);
  const newLine = {
    id: `l${Date.now()}`,
    text: '',
    chords: [],
  };
  
  if (afterLineId) {
    const idx = section.lines.findIndex(l => l.id === afterLineId);
    section.lines.splice(idx + 1, 0, newLine);
  } else {
    section.lines.push(newLine);
  }
  onSongUpdate(updatedSong);
};
```

---

### 5. Live Preview (AdminEditorPreview)

Real-time preview showing exactly what users will see.

#### Features:

- Shows song title and artist
- Displays current default key
- Renders all sections with labels
- Chords positioned above lyrics
- Responsive font sizing (base/md/lg)
- Dark mode support
- Scrollable pane

#### Rendering:

```typescript
{song.sections.map((section) => (
  <div key={section.id}>
    <div className="text-xs font-bold uppercase">
      {section.label}
    </div>
    
    {section.lines.map((line) => (
      <div key={line.id}>
        {/* Chords above */}
        {line.chords.length > 0 && (
          <div className="text-sm font-bold text-amber-600">
            {line.chords.map(c => c.chord).join('  ')}
          </div>
        )}
        
        {/* Lyrics below */}
        <p className="text-base font-serif">
          {line.text}
        </p>
      </div>
    ))}
  </div>
))}
```

---

### 6. Footer (AdminEditorFooter)

Action buttons and status indicator.

#### Buttons (Non-functional UI Placeholders):

- **Save Draft** (Blue): Saves changes locally (future: sends to backend)
- **Preview** (Gray): Full-screen preview mode (future implementation)
- **Publish** (Green): Publishes to library (future: updates backend)
- **Close** (Slate): Exit editor

#### Status Indicator:

- Green dot + "Ready" label
- Shows editor is ready for input

#### Info Banner:

```
Note: This is a UI prototype. Save, Preview, and Publish buttons 
are non-functional placeholders. Backend integration will be 
implemented next.
```

---

## Utilities

### ChordFormatter (`src/utils/ChordFormatter.ts`)

Handles automatic chord normalization and validation.

```typescript
export function formatChord(input: string): FormattedChord {
  // d → D
  // dm → Dm
  // g# → G#
  // bb → Bb
  // c#maj7 → C#maj7
  // fmin → Fm
}

export function getChordSuggestions(input: string): string[] {
  // Returns matching chords for partial input
}
```

**Supported Chords**:
- Roots: C, D, E, F, G, A, B
- Accidentals: #, b
- Suffixes:
  - Triads: m, maj, aug, dim
  - Sevenths: 7, maj7, min7, m7, dim7, aug7
  - Suspended: sus2, sus4
  - Extensions: 9, maj9, m9, 11, maj11, m11, 13, maj13, m13
  - Other: add9, add11, omit3, omit5

---

## Layout & Responsiveness

### Desktop (≥1024px)

Split-view layout:
```
┌──────────────────────────────────────────────────┐
│              Header (Title, Key)                 │
├──────────────────────────────────────────────────┤
│ Mode Toggle (Chord / Lyrics)                     │
├─────────────────────┬──────────────────────────┤
│                     │                          │
│  Editor Pane        │    Preview Pane          │
│  (50%)              │    (50%)                 │
│                     │                          │
│                     │                          │
├─────────────────────┴──────────────────────────┤
│              Footer (Buttons)                   │
└──────────────────────────────────────────────────┘
```

### Tablet & Mobile (<1024px)

Stacked layout:
```
┌──────────────────────┐
│  Header              │
├──────────────────────┤
│  Mode Toggle         │
├──────────────────────┤
│  Editor Pane         │
│  (Full width)        │
│                      │
├──────────────────────┤
│  Preview Pane        │
│  (Full width)        │
│                      │
├──────────────────────┤
│  Footer              │
└──────────────────────┘
```

### Tailwind Responsive Classes Used

```typescript
// Text sizing
className="text-lg md:text-2xl"

// Layout
className="flex flex-col lg:flex-row"

// Spacing
className="px-4 lg:px-6"

// Visibility
className="hidden sm:inline"
className="hidden md:block"

// Width & sizing
className="flex-1"
className="min-h-0"
```

---

## Dark Mode Support

All components include dark mode classes:

```typescript
// Header
className="bg-white dark:bg-slate-900"
className="text-slate-900 dark:text-white"
className="border-slate-200 dark:border-slate-700"

// Inputs
className="bg-white dark:bg-slate-700"
className="text-slate-900 dark:text-white"

// Chords
className="text-amber-600 dark:text-amber-400"

// Alerts
className="bg-blue-50 dark:bg-blue-900"
```

---

## Usage & Integration

### Standalone Demo

To test the editor in isolation:

```typescript
import { AdminEditorDemo } from './components/admin/AdminEditorDemo';

export function App() {
  return <AdminEditorDemo />;
}
```

### Integration with Main App

Once authentication is added, integrate like this:

```typescript
import { AdminSongEditor } from './components/admin/AdminSongEditor';

export function SongViewWithAdmin({ song, isAdmin }) {
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditing && isAdmin) {
    return (
      <AdminSongEditor
        initialSong={convertSongToEditableSong(song)}
        onClose={() => setIsEditing(false)}
      />
    );
  }
  
  return (
    <SongReader song={song}>
      {isAdmin && (
        <button onClick={() => setIsEditing(true)}>
          Edit Song
        </button>
      )}
    </SongReader>
  );
}
```

---

## State Management

**Current Approach**: Local React state with `useState`

```typescript
const [mode, setMode] = useState<EditingMode>('chords');
const [song, setSong] = useState<EditableSong>(initialSong);
const [selectedChordId, setSelectedChordId] = useState<string | null>(null);
const [activeLineId, setActiveLineId] = useState<string | null>(null);
```

**Future**: Can be enhanced with:
- Zustand store for global state
- IndexedDB for local persistence (Dexie is already in the project)
- Undo/redo history
- Auto-save drafts

---

## What's NOT Implemented (Out of Scope)

As per requirements, these are **intentionally excluded** from this UI/UX phase:

- ❌ Authentication
- ❌ Backend APIs
- ❌ Database integration
- ❌ Persistence/Save
- ❌ Publishing workflow
- ❌ User permissions
- ❌ Audit trail
- ❌ Undo/redo
- ❌ Auto-save

**Next Phase**: Backend integration will connect these UI buttons to actual backend endpoints.

---

## Code Style & Quality

### TypeScript

- Strict mode enabled
- Full type safety
- Interfaces for all props
- No `any` types

### React Best Practices

- Functional components
- Hooks for state management
- Proper key usage in lists
- Event handler cleanup
- Accessibility attributes (aria-label, title)

### Tailwind CSS

- Consistent color palette
- Responsive design
- Dark mode support
- Semantic component grouping
- Hover/focus states

---

## Testing Checklist

### Manual Testing

- [ ] Open editor with default Amazing Grace song
- [ ] Switch between Chord and Lyrics modes
- [ ] Edit title (click, type, press Enter)
- [ ] Change default key (select dropdown)
- [ ] Add chord to a line (type d, see D suggestion)
- [ ] Delete a chord (click, select, X button)
- [ ] Edit lyrics without affecting chords
- [ ] Add a new line
- [ ] Delete a line
- [ ] Observe live preview updates
- [ ] Check mobile responsiveness (DevTools)
- [ ] Check dark mode
- [ ] Verify section labels are editable

### Browser Compatibility

- [x] Chrome/Edge (latest)
- [x] Firefox (latest)
- [x] Safari (latest)
- [x] Mobile browsers

---

## Future Enhancements

### Phase 2: Backend Integration
1. Connect Save/Publish buttons to API
2. Implement authentication check
3. Load songs from database
4. Persist changes

### Phase 3: Advanced Features
1. Undo/redo history
2. Auto-save drafts
3. Conflict resolution (simultaneous edits)
4. Audit trail (who changed what when)
5. Multi-arrangement support
6. Chord position refinement (char-level positioning)

### Phase 4: Admin Dashboard
1. List all songs
2. Search/filter
3. Bulk operations
4. Import/export
5. Reporting

---

## File Organization

```
worship-song-library-runtime/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminSongEditor.tsx
│   │   │   ├── AdminEditorHeader.tsx
│   │   │   ├── AdminEditorModeToggle.tsx
│   │   │   ├── AdminChordEditor.tsx
│   │   │   ├── AdminLyricsEditor.tsx
│   │   │   ├── AdminEditorPreview.tsx
│   │   │   ├── AdminEditorFooter.tsx
│   │   │   ├── AdminEditorDemo.tsx
│   │   │   └── index.ts
│   │   ├── reader/
│   │   ├── shared/
│   │   └── ...
│   ├── types/
│   │   └── AdminEditor.ts
│   ├── utils/
│   │   ├── ChordFormatter.ts
│   │   └── ...
│   └── ...
├── package.json
├── vite.config.ts
└── ...
```

---

## Related Documentation

- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Overall project guide
- [SYSTEM_CHANGE_PLAN.md](./SYSTEM_CHANGE_PLAN.md) - Change management
- [DATA_SCHEMAS.md](./DATA_SCHEMAS.md) - Data model documentation

---

## Summary

✅ **Completed**: 
- UI/UX design and implementation
- Responsive mobile-first layout
- Chord editing experience
- Lyrics editing experience
- Live preview
- Dark mode support
- Chord formatting utilities

⏳ **Next Steps**:
1. Backend API endpoints for save/publish
2. Authentication middleware
3. Database persistence
4. Publishing workflow
5. Admin dashboard

---

**Built**: 2026-06-23
**Status**: Ready for backend integration
**Tech Stack**: React 19 + TypeScript 6 + Vite 8 + Tailwind CSS 4
