# Admin Song Editor UI/UX Implementation

## Overview

A complete React + Vite + Tailwind CSS UI/UX for the **Admin Song Management System**. This is a functional editor prototype with **no backend integration yet**—the focus is entirely on the editing experience.

## What's Built

### ✅ Components Created

1. **AdminSongEditor** (`AdminSongEditor.tsx`)
   - Main container component
   - Manages editing state and mode switching
   - Includes mock song data for demonstration
   - Split view: Editor pane (left) + Live preview pane (right)
   - Mobile-responsive: Stacks vertically on small screens

2. **AdminEditorHeader** (`AdminEditorHeader.tsx`)
   - Song title (editable with click-to-edit)
   - Default key selector (dropdown with all chromatic keys)
   - Responsive layout with back button

3. **AdminEditorModeToggle** (`AdminEditorModeToggle.tsx`)
   - Toggle between "Edit Chords" and "Edit Lyrics" modes
   - Color-coded buttons (blue for chords, green for lyrics)
   - Contextual help text on desktop

4. **AdminChordEditor** (`AdminChordEditor.tsx`)
   - **Chord Mode**: Lyrics are read-only, chords are editable
   - Click on a lyric line to add/edit chords
   - **Auto-formatting**: `d` → `D`, `dm` → `Dm`, `g#` → `G#`, `bb` → `Bb`
   - **Suggestions**: Real-time chord suggestions as you type
   - **Chord deletion**: Click to select chord, then press delete button
   - **Section labels**: Editable (Verse, Chorus, Bridge, etc.)
   - **Visual feedback**: Selected lines highlight in blue

5. **AdminLyricsEditor** (`AdminLyricsEditor.tsx`)
   - **Lyrics Mode**: Lyrics are editable, chords are visible but protected
   - Edit section labels
   - Edit individual lyric lines with line numbers
   - Add/delete lines per section
   - Info banner: Reminds user that chords are protected in this mode

6. **AdminEditorPreview** (`AdminEditorPreview.tsx`)
   - Real-time preview showing exactly what users will see
   - Matches the existing Spiritual Hymns design language
   - Shows title, artist, key, and all sections
   - Live updates as you edit

7. **AdminEditorFooter** (`AdminEditorFooter.tsx`)
   - **Save Draft** button (placeholder)
   - **Preview** button (placeholder)
   - **Publish** button (placeholder)
   - Status indicator
   - Close button
   - Info banner noting this is a prototype

### ✅ Utilities & Types

1. **ChordFormatter.ts** (`/src/utils/ChordFormatter.ts`)
   - `formatChord(input)` → Normalizes chord input
   - `isValidChord(chord)` → Validates chord format
   - `getChordSuggestions(partial)` → Returns suggestions for partial input
   - `normalizeChords(list)` → Batch normalization
   - Supports: All chromatic roots (C-B, with # and b), common suffixes (m, 7, maj7, sus4, etc.)

2. **AdminEditor.ts** (`/src/types/AdminEditor.ts`)
   - `EditingMode` - "lyrics" | "chords"
   - `EditableChord` - Chord data with position tracking
   - `EditableLine` - Line with text and chords
   - `EditableSection` - Section (Verse, Chorus, etc.)
   - `EditableSong` - Full song structure

### ✅ Demo Component

**AdminEditorDemo.tsx** - Standalone demo page for testing the editor in isolation

## Key Features Implemented

### 🎯 Chord Editing
- Click on a lyric line to activate chord editing
- Type chord name with automatic formatting
- Live suggestions for partial input
- Delete chords with visual confirmation
- Chords displayed above lyrics

### ✏️ Lyrics Editing
- Full lyrics editing with line numbers
- Add/delete individual lines per section
- Section label editing
- Chords remain visible but read-only

### 🔄 Mode Separation
- **Chord Mode**: Protects lyrics, enables chord editing
- **Lyrics Mode**: Protects chords, enables lyrics editing
- One-click mode switching
- Clear visual indicators for each mode

### 📱 Mobile-First Responsive Design
- Responsive layout for phone, tablet, desktop
- Touch-friendly chord input
- Stacking editor and preview on small screens
- Readable text sizes on all devices

### 👁️ Live Preview
- Always-visible preview pane on desktop
- Shows exactly what users will see
- Updates in real-time as you edit
- Matches existing Spiritual Hymns styling

### 🎨 Design Language
- Matches existing Material Design 3 system
- Tailwind CSS for consistency
- Dark mode support
- Color-coded modes and sections

## How to Use

### Testing the Editor

**Option 1: Import and view in your app**
```tsx
import { AdminSongEditor } from './components/admin';

// In your component:
<AdminSongEditor onClose={() => console.log('Closed')} />
```

**Option 2: Use the demo component**
```tsx
import { AdminEditorDemo } from './components/admin/AdminEditorDemo';

// View at a route or in your app
<AdminEditorDemo />
```

### Current Behavior

1. **Header**: Click song title to edit, change key from dropdown
2. **Mode Toggle**: Click Chords or Lyrics button to switch modes
3. **Chord Mode**:
   - Click on a lyric line
   - Type chord name (e.g., `d`, `dm7`, `g#maj9`)
   - Press Enter or click "Add Chord"
   - Select chord to delete it
4. **Lyrics Mode**:
   - Edit lyrics in textarea
   - Edit section labels by clicking them
   - Add new lines with "+ Add Line" button
   - Delete lines with ✕ button
5. **Preview**: Real-time preview updates as you edit
6. **Footer**: Buttons are non-functional placeholders

## Architecture Notes

### State Management
- Uses React `useState` for local component state
- Song data structure stored in `EditableSong` type
- Deep cloning for immutable updates

### Chord Formatting Algorithm
- Root note validation (A-G)
- Accidental support (#, b)
- Suffix validation against known chord types
- Automatic capitalization

### Mobile Responsiveness
- Breakpoints: `sm:`, `lg:`, `md:` using Tailwind
- Stacking: Editor + preview stack vertically on mobile
- Touch-friendly: Larger tap targets, no hover-only interactions
- Responsive text sizing

## Next Steps: Backend Integration

Once UI/UX is approved, the following will be needed:

### 1. **Authentication**
   - Admin login endpoint
   - Session management
   - Protected routes

### 2. **Backend APIs**
   - `GET /api/admin/songs/:id` - Load song for editing
   - `POST /api/admin/songs/:id/draft` - Save as draft
   - `POST /api/admin/songs/:id/publish` - Publish changes
   - `GET /api/admin/songs/:id/history` - Audit trail

### 3. **Database Changes**
   - Draft storage (if needed)
   - Change audit table
   - Publishing timestamps

### 4. **Real-time Sync**
   - Invalidate user caches on publish
   - Update CDN/JSON exports
   - Library refresh for connected users

### 5. **Error Handling**
   - Validation feedback
   - Conflict resolution
   - Undo/redo support

### 6. **Permissions**
   - Admin-only access control
   - Rate limiting
   - Audit logging

## File Structure

```
src/
├── components/
│   └── admin/
│       ├── AdminSongEditor.tsx          (Main component)
│       ├── AdminEditorHeader.tsx        (Title + Key selector)
│       ├── AdminEditorModeToggle.tsx    (Mode switcher)
│       ├── AdminChordEditor.tsx         (Chord editing mode)
│       ├── AdminLyricsEditor.tsx        (Lyrics editing mode)
│       ├── AdminEditorPreview.tsx       (Live preview)
│       ├── AdminEditorFooter.tsx        (Action buttons)
│       ├── AdminEditorDemo.tsx          (Demo/test component)
│       └── index.ts                     (Exports)
├── utils/
│   └── ChordFormatter.ts                (Chord formatting utilities)
└── types/
    └── AdminEditor.ts                   (TypeScript types)
```

## Styling Notes

- Uses **Tailwind CSS v4** (already in project)
- **Dark mode** support with `dark:` prefix
- **CSS variables** for consistency (inherited from theme)
- **No external component libraries** - pure Tailwind + vanilla React

## Testing Checklist

- [ ] Chord input with various formats (d, dm, g#, bb, maj7, etc.)
- [ ] Chord suggestions working
- [ ] Chord deletion working
- [ ] Lyrics editing working
- [ ] Section labels editable
- [ ] Mode switching smooth
- [ ] Preview updates in real-time
- [ ] Mobile responsive (test on phone/tablet sizes)
- [ ] Dark mode displays correctly
- [ ] Back button / close button works

## Known Limitations (MVP)

- No backend persistence (draft/publish non-functional)
- No multi-language chord support (English only for MVP)
- No undo/redo (future feature)
- No collaboration/conflict resolution (future feature)
- Chord positions simplified (position 0 only for MVP)
- No audit trail yet (future feature)
- No user accounts/permissions (future feature)

## Accessibility

- Semantic HTML (`<button>`, `<input>`, `<textarea>`)
- ARIA labels where needed
- Keyboard navigation support (Tab, Enter, Escape)
- Color not the only indicator (uses text labels + icons)
- Sufficient color contrast for readability

---

**Status**: ✅ UI/UX Complete - Ready for backend integration phase
