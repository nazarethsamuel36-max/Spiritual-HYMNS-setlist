# UI Principles

## Purpose

This document defines the stabilized UI rule system for the Worship Song Library.

The application is designed for fast song access and distraction-free performance on mobile. Every UI decision must prioritize speed, clarity, and zero cognitive load.

## Rules

### Core Goal

- Users must be able to find a song quickly.
- Users must be able to open a song quickly.
- Users must be able to read and perform a song without UI interference.
- Mobile performance use is the priority environment.

### Single Primary Action

- Each screen must have exactly one primary action.
- If a screen exposes more than one primary action, the layout is invalid.
- Secondary actions may exist only when they do not compete with the primary action.
- Primary action by screen:
  - Home: find and open a song instantly.
  - Search results: scan and select a song.
  - Song page: read and perform the song.
  - Edit mode: save or cancel song edits after modifying chords or structure.

### Read Mode Priority

- When viewing a song, only reading-related elements may be visible.
- Editing, sharing, printing, and notes must not appear in song read mode.
- Read mode must contain only the song header, readable content, and approved bottom controls.
- Any non-reading task must move to a separate mode, route, or full-screen view.

### 5-Second Rule

- If the user does not need an element within the first 5 seconds of the screen's main task, hide it.
- Do not show optional tools by default.
- Do not show account, admin, editing, print, share, or note controls on a song performance screen.
- Use progressive disclosure only when it does not interrupt reading or discovery.

### No Overlap

- No UI element may overlap readable content.
- Lyrics and chords are protected content.
- Fixed controls must reserve space in the page layout.
- Floating controls inside or over song content are forbidden.

### Vertical Flow

- Mobile layouts must follow a top-to-bottom flow.
- Do not place horizontal tool clusters inside mobile content.
- Do not insert floating UI inside lyric or chord content.
- Mobile screens start as one column and expand only on larger screens.

### Content Over Controls

- Lyrics and chords must dominate the song screen.
- Search must dominate the home and discovery screens.
- Controls must be minimal, predictable, and task-specific.
- Decorative surfaces must never reduce usable space for content.

### User-Focused Behavior

- The user should know what to do without reading instructions.
- The first visible interactive area must match the screen's primary action.
- The UI must avoid choices that are not needed for the current task.
- A user should complete the screen's main task in under 2 seconds without thinking.

## Constraints

- Do not mix read UI and edit UI.
- Do not add floating buttons over lyrics or chords.
- Do not add multiple primary actions to a screen.
- Do not hide search behind hero content or decorative content.
- Do not add controls that interrupt reading.
- Do not keep rarely used actions visible by default.
- Do not use mobile spacing that pushes the primary task below the fold.
- Do not accept a UI change if the main task cannot be completed quickly and without confusion.

## Examples

### Correct

- A song opens directly into performance read mode.
- The song page shows title, song number, key, lyrics, chords, and a minimal bottom bar.
- The home page shows the search bar as the first dominant element.
- Search result cards are compact and entirely clickable.

### Incorrect

- A song page shows Edit, Print, Share, and Notes beside the lyrics.
- A bottom control bar covers the last lines of a song.
- The home page makes the user scroll before searching.
- A screen shows two equally prominent actions.
