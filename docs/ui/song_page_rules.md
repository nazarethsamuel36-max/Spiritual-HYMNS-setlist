# Song Page Rules

## Purpose

This document defines the stabilized song page system. The song page exists for one task: read and perform the song.

Song editing is a separate mode and must never visually coexist with performance reading.

## Rules

### Primary Action

- The song page primary action is: read and perform the song.
- Opening a song must default to performance mode.
- Performance mode is the only mode shown on initial song load.

### Performance Mode Layout

Performance mode must follow this structure:

```text
[Header: Title + Song Number + Key]

[Song Content: Lyrics + Chords]

[Bottom Controls: fixed, reserved space]
```

### Allowed Elements In Performance Mode

- Title.
- Song number.
- Key.
- Lyrics.
- Chords.
- Bottom control bar.

### Forbidden Elements In Performance Mode

- Edit controls.
- Print button.
- Share button.
- Notes UI.
- Floating buttons inside lyrics.
- Floating buttons above lyrics.
- Visible previous/next buttons (e.g. `< VERSE 2 >` or floating nav arrows).
- Metadata panels that compete with lyrics and chords.
- Account, admin, or management controls.

### Bottom Controls

Only these controls are allowed in the performance bottom bar:

- `A-` and `A+` for font size.
- Scroll toggle.
- Column toggle when it improves reading.

The bottom bar must be fixed only when it reserves enough page space to avoid covering readable content.

### Content Protection

- Lyrics and chords are the protected content area.
- The bottom bar must never overlap lyrics or chords.
- The page body or song content wrapper must include bottom padding equal to or greater than the fixed control height.
- No controls may be placed inside the song content block.
- Chord alignment must remain readable after font-size changes, scrolling, and column changes.

### Edit Mode Separation

- Edit mode exists to modify chords and song structure.
- Edit mode must be a separate route or full-screen mode.
- A valid route pattern is `/edit-song/{id}` or another equivalent route that fully leaves performance mode.
- Edit mode must not appear inline below the performance song content.
- Edit mode may be accessible from the header menu or from separate navigation.
- Edit entry points must not appear inside song content.
- Edit entry points must not float over lyrics or chords.

### Allowed Elements In Edit Mode

- Editable text.
- Chord tools.
- Section or structure tools.
- Save button.
- Cancel button.

### Forbidden Elements In Edit Mode

- Performance controls.
- Auto-scroll controls.
- Font controls.
- Column controls.
- Reading-only bottom bar.

### Mode Boundary

- Performance mode and edit mode must never coexist visually.
- A user must always know which mode they are in.
- Entering edit mode must remove performance controls.
- Returning to performance mode must remove editing controls.

### Swipe Navigation

- **Default Interaction**: Reader navigation relies on swipe gestures instead of visible buttons.
- **Library Mode**: Swipe left navigates to the next song number; swipe right navigates to the previous song number. Navigation follows the current language/filter context (e.g., Marathi #1 → Marathi #2 → Marathi #3). Do NOT navigate through search results (search is a discovery tool, opening a song from search results still navigates by song-number order).
- **Setlist Mode**: Swipe follows the setlist service flow order (e.g., Opening Prayer → Song → Scripture Reading → Sermon). The reader must detect `Current Context = Setlist` and navigate through the service flow instead of song numbers.
- **Swipe Onboarding Hint**: On first song open only, display a lightweight onboarding hint `← Swipe to navigate →`. Dismiss it automatically after a few seconds and persist the completion status so it is not shown again.
- **Persistent Hint**: Keep a lightweight page indicator near the top (e.g., `○ ● ○ ○` or `● ○ ○ ○`) to communicate that additional pages/items exist (works for song, setlist, and future service-flow navigation).
- **Future Service Flow Integration**: Once Service Flow Markers are implemented, they must participate in the same swipe navigation system to keep the experience unified.

### Viewport Behavior

- Small screens must keep the song in a single vertical flow: header, content, bottom controls.
- Landscape screens must preserve readable lyric/chord height before showing nonessential controls.
- Long songs must remain scrollable without the bottom bar covering the final lines.
- Long songs must keep the reading controls available without inserting controls into the content.
- The song content area must include enough bottom padding for the full collapsed or wrapped bottom bar.

## Constraints

- Do not show editing, sharing, printing, or notes on the default song page.
- Do not add any floating action inside the lyric or chord area.
- Do not place controls between song lines.
- Do not allow a fixed element without reserved bottom space.
- Do not use side panels on mobile for song metadata or actions.
- Do not let any toolbar reduce the dominance of lyrics and chords.
- Do not add secondary actions to performance mode unless they are directly reading-related.

## Examples

### Correct

- A song opens with title, song number, key, lyrics, chords, and a small bottom bar.
- The bottom bar contains font size and scroll controls only.
- Tapping an edit route opens a separate full-screen edit experience with Save and Cancel.
- Song content has enough bottom padding that the final line remains visible above the bottom bar.
- Edit is reached from a header menu or separate edit navigation, not from inside the lyrics.

### Incorrect

- Showing Edit Chords, Print, Share, and My Notes on the performance song page.
- Hiding lyrics behind a fixed bottom bar.
- Opening an inline editor below the song while the performance controls remain visible.
- Adding a floating edit button inside the lyrics column.
- Keeping a tall control bar visible in landscape so only a small strip of song content remains.
