# Worship Song Library Demo Paths

Base URL: `http://localhost:2832/worship-song-library`

## Demo 1: Song Library

1. Open `/songs`
2. Use the main page search to filter songs
3. Open a song detail page
4. Show the view toggle between lyrics and lyrics plus chords
5. Show transpose controls if needed

## Demo 2: Musician Leaflet

1. Open `/leaflet/new`
2. Choose an occasion
3. Fill the required event details
4. Add songs from suggestions or search
5. Leave `Lyrics + Chords` selected in `Print Format`
6. Click `Open Print Preview`
7. In preview, explain that musician mode starts each song on a fresh page for clarity

## Demo 3: Lyrics-Only Handout

1. Open `/leaflet/new`
2. Build a leaflet with the same flow
3. Switch `Print Format` to `Lyrics Only`
4. Click `Open Print Preview`
5. Show that chord lines are removed for a cleaner handout

## Demo 4: Account Features

1. Open `/setlist/my`
2. Show saved setlists
3. Open `/account`
4. Show personal account area

## Notes

- The navbar uses one primary search area on the Songs page now.
- Localhost service worker caching is disabled so JSP changes should appear without old cached UI sticking around.
- If Tomcat serves stale JSPs again, clear `D:\apache-tomcat-10.1.48\work\Catalina\localhost\worship-song-library` and restart Tomcat.
