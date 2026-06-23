# Discovery Flow Rules

## Purpose

This document defines the stabilized discovery system for home, search, and search results.

The discovery system exists for one task: find and open a song instantly.

## Rules

### Primary Action

- The discovery primary action is: find and open a song instantly.
- Search must be the dominant interaction on discovery screens.
- Result selection must be faster than browsing controls, filters, or decoration.

### Home Page

- The search bar must be the first and dominant element.
- Search must be visible without scrolling.
- Hero text must not delay search interaction.
- Decorative content must not appear before the search path.
- The home page should make the next action obvious: type a query or choose a known quick link.

### Search Input Behavior

- Search submits the query as digits or text without changing user intent.
- Search must support title, artist, lyrics, and song number discovery.
- The search field must remain reachable at the top of the discovery flow.
- Search controls must not be hidden behind menus on mobile.

### Search Results Goal

- The result screen exists for fast scanning and song selection.
- Results must prioritize recognition over decoration.
- The entire card or row must be clickable.

### Result Card Priority

Cards must present information in this order:

1. Song number.
2. Title, as the most prominent text.
3. Artist, as secondary text.
4. Metadata, such as key and language.

### Result Density

- Cards must be compact.
- A typical mobile screen should show as many results as practical without making tap targets unreliable.
- Target density is 8 to 12 visible results per screen when content length allows.
- Avoid large card padding, large vertical gaps, oversized icons, or repeated decorative panels in result lists.

### Number Search

- If the query contains digits only, use direct song number lookup.
- Digit-only means the trimmed query matches only numbers.
- Trigger number search only after explicit submit or when live-search input length is at least 2 characters.
- Number search must not use fuzzy search.
- Number search must not use ranking.
- Number search must return the direct matching song result immediately.
- Queries that include symbols or words are not number search.

### Text Search

- Text search may use normalization, token matching, ranking, and matched-line display.
- Text search must still serve the scan-and-open goal.
- Ranking details must not be exposed as UI complexity.
- Matched lyric lines are allowed only when they help identify the result without expanding the card too much.

### Empty States

- Empty states must not become landing pages.
- Empty states must show the next useful action.
- Search empty state should invite another query or browsing all songs.
- No-results state should preserve the query and keep search available.

## Constraints

- Do not hide search behind hero content.
- Do not require scrolling before searching on the home page.
- Do not make result cards large enough that only one or two results are visible.
- Do not make icons more prominent than song number or title.
- Do not remove song numbers from discovery surfaces.
- Do not make metadata compete with the title.
- Do not apply fuzzy logic to digit-only search.
- Do not trigger number search for a single typed digit during live search before submit.
- Do not show filters as the dominant control when the primary action is search.

## Examples

### Correct

- The home page opens with a prominent search field immediately visible.
- Searching `913` performs direct song number lookup.
- Typing `9` into a live-search field does not trigger number lookup until submit or a second digit is typed.
- A result row shows `#913`, the title, artist, and small key/language metadata.
- Tapping anywhere on a result opens the song.

### Incorrect

- A large hero section pushes search below the fold.
- Search results use oversized cards with only two visible results on mobile.
- A digit-only query goes through fuzzy ranked search.
- Result cards emphasize decorative icons before song number and title.
