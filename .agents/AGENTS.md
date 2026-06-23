# Project Rules and Design Guidelines

This workspace follows specific design principles and architecture constraints for the Spiritual Hymns app.

## Reader & Worship Mode Layout

1. **Reader Simplicity**: Most users read songs during worship, rather than managing them. The reader layout must stay extremely clean and focused on worship.
2. **Always Visible Controls**:
   - **Transpose** (`- Key [K] +`): Keep visible. This is a live performance tool.
   - **Auto Scroll**: Keep visible. This is actively used during worship.
   - **Chords/Lyrics View toggle**: Keep visible.
3. **No Direct Management Buttons**: Do NOT place buttons like Edit, Add to Setlist, Share, or Version Selector directly in the main reader view.
4. **No Visible Previous/Next Buttons**: Remove all visible previous/next page or song buttons (like `< VERSE 2 >` or floating nav arrows) to maintain a clean "digital hymnal" layout.
5. **Swipe-based Navigation**:
   - **Library Mode**: Swipe left to go to the next song number; swipe right to go to the previous song number. Follow the current language/filter context (e.g., Marathi #1 → #2 → #3). Do NOT navigate through search results (search is a discovery tool, not a navigation order).
   - **Setlist Mode**: Swipe follows the setlist service flow order (e.g., Opening Prayer → Song #23 → Song #45 → Scripture Reading → Sermon → Song #89). The reader must detect `Current Context = Setlist` and navigate through the service flow instead of song numbers.
6. **Swipe Hints**: On the first song open only, display a small onboarding hint: `← Swipe to navigate →`. Dismiss automatically after a few seconds and remember completion so it is not shown again.
7. **Persistent Indicator**: Keep a lightweight page indicator near the top (e.g., `○ ● ○ ○` or `● ○ ○ ○`) to communicate that additional pages/items exist (works for song, setlist, and service flow).
8. **Future Service Flow Integration**: Once Service Flow Markers are implemented, they must participate in the same swipe system (e.g. Opening Prayer → Song → Scripture Reading → Sermon).

## The More Menu (⋮)

All non-essential, secondary, and management actions must live behind a single `⋮ More` button inside the reader.
This menu must contain:
- Add to Setlist
- Share Song
- Versions
- Edit Overlay
- Song Details

## Navigation and Information Architecture

1. **Dedicated Shared Section**: Do not mix shared songs/setlists into the official library.
2. **Three-Tab Bottom Navigation**:
   - **Songs**: Official song library only.
   - **Shared**: Shared Songs and Shared Setlists from other users.
   - **Setlists**: Personal/local setlists.
3. **Sharing Architecture**:
   - Access via `⋮ More` -> `Share Song`.
   - Uses an Export -> Share -> Import flow.
   - The receiver gets a local copy/snapshot (no live sync or account requirements initially).
4. **Versions**: Access via `⋮ More` -> `Versions`. Do not place version selection on the main screen.
