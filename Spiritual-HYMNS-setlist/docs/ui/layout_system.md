# Layout System

## Purpose

This document defines the stabilized mobile-first layout system.

The layout system exists to maximize readable content on small screens while preserving fast access to songs and distraction-free performance.

## Rules

### Mobile-First Goal

- Mobile is the default layout.
- The default mobile layout must maximize content space.
- Every layout starts as one column.
- Larger screen layouts may expand only after the mobile flow works.

### Mobile Spacing

- Reduce padding aggressively on mobile.
- Avoid large vertical gaps on mobile.
- Use compact spacing when the screen's primary action is search, scanning, or reading.
- Correct mobile spacing pattern:
  - Horizontal padding: `px-4` to `px-6`.
  - Vertical padding: `py-4` to `py-8`.

### Forbidden Mobile Spacing

These spacing patterns are not allowed on mobile unless they are overridden for small screens:

- `py-12`
- `py-24`
- `p-16`
- Large stacked card gaps that push the primary action below the fold.

### Containers

- Content should use full width on mobile.
- Avoid narrow mobile containers.
- Do not center small desktop-style panels when the primary task needs width.
- Song content must have enough width for lyric and chord readability.
- Search and results must use space efficiently enough to keep multiple options visible.

### Mobile Flow

- Mobile layouts must flow from top to bottom.
- Do not use horizontal layouts on mobile.
- Do not place side panels before the primary content on mobile.
- Do not require horizontal scanning for actions.
- Expand to multi-column or side-by-side layouts only on larger screens.

### Positioning

Allowed positioning for layout:

- Flex.
- Grid.
- Normal document flow.

Restricted positioning:

- `absolute` is allowed only for decoration, input icons, visual overlays, and internal rendering details that do not change layout.
- `fixed` is allowed only for bottom controls, modal overlays, and transient messages.

### Fixed Elements

- Every fixed element must reserve space.
- Fixed bottom controls must not overlap content.
- The content area must include bottom padding equal to or greater than the fixed element height plus safe spacing.
- Fixed controls must not contain unrelated actions.
- Fixed controls must not appear on screens where normal flow is sufficient.
- A fixed bottom bar must not exceed 15-20% of viewport height.
- On small screens, fixed bottom controls must collapse, wrap, or reduce labels before they exceed the height limit.
- In landscape, fixed bottom controls must be shorter than in portrait when vertical space is constrained.

### Song Content Layout

- Lyrics and chords must dominate screen space.
- No controls may float inside song content.
- Song body must preserve readable line flow.
- Column mode is optional and only valid when it improves reading on wider screens.
- Column mode must not be forced on narrow mobile screens.
- Long songs must remain readable to the final line without content hidden under fixed controls.
- Small-screen and landscape layouts must prioritize vertical reading height over secondary controls.

### Search Result Layout

- Result layouts must be dense and scannable.
- Cards or rows must remain compact.
- Song number and title must appear near the top of each result.
- Metadata must be small and secondary.
- Entire result target must be clickable.

## Constraints

- Do not use absolute positioning for primary page layout.
- Do not use fixed positioning except for bottom controls, modals, or transient messages.
- Do not add a fixed control without reserved content space.
- Do not let a bottom control bar exceed 20% of viewport height.
- Do not use large mobile padding that delays the primary action.
- Do not place multiple columns on mobile.
- Do not allow horizontal mobile layouts for primary content.
- Do not place controls over lyrics or chords.
- Do not let decorative containers reduce readable song space.

## Examples

### Correct

- A mobile page uses `px-4 py-6` and one column.
- A song page reserves bottom padding for a fixed bottom control bar.
- A search result list shows many compact clickable results.
- Desktop may expand result cards into multiple columns after the mobile layout remains efficient.

### Incorrect

- A mobile screen starts with `py-24` and pushes search below the fold.
- A fixed bottom bar covers the final lyrics.
- A mobile song page uses a left metadata column before lyrics.
- Result cards use large decorative spacing so only one result is visible.
