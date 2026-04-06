# Worship Song Library — Antigravity Agent Missions
> Complete build guide for Agent Manager. Paste each mission into a separate agent. Run Week 1 agents simultaneously. Week 2 agents depend on Week 1 being complete.

---

## Project Rules (Add to `.agent/rules/project-rules.md`)

```
--- trigger: always_on ---

# Worship Song Library — Project Rules

## Stack
- Language: Java (Maven project)
- IDE: NetBeans
- Frontend: JSP + Servlets + HTML/CSS/JavaScript
- Database: MySQL
- CSS Framework: Bootstrap 5
- Font: Noto Sans Mono (Google Fonts) for all song display
- Architecture: MVC — Model → DAO → Servlet → JSP

## Core Rules
- Always follow MVC pattern — no database calls in JSP files
- All database access goes through DAO classes only
- Session management via HttpSession for guest users
- Guest edits NEVER touch the database — session only
- User edits go to user_songs table ONLY — never master songs table
- Only Admin role can modify the songs master table
- All chord data stored as bracket format: [G]Amazing [Em]grace
- Always use UTF-8 encoding for all files — Hindi, Marathi, Bengali support
- Bootstrap 5 grid for all layouts — mobile first
- Minimum tap target 44px on all buttons — mobile musicians use this during service
- All song display uses font-family: 'Noto Sans Mono', monospace

## Roles
- GUEST: session only, no account required
- USER: logged in, personal edits saved to user_songs table
- ADMIN: full database access, song management

## Database
- Name: worship_db
- Engine: MySQL with UTF-8mb4 charset for all tables
- All tables use InnoDB engine

## File Naming Convention
- Models: Song.java, User.java, Leaflet.java
- DAOs: SongDAO.java, UserDAO.java, LeafletDAO.java
- Servlets: SongListServlet.java, SongViewServlet.java
- JSP: songList.jsp, songView.jsp, login.jsp
- Utils: ChordParser.java, ChordTransposer.java, NoteTransposer.java
```

---

## Database Schema (Add to `.agent/skills/database-schema.md`)

```sql
-- worship_db full schema

CREATE DATABASE worship_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE worship_db;

-- Users
CREATE TABLE users (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  username     VARCHAR(100) NOT NULL UNIQUE,
  email        VARCHAR(255) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('guest','user','admin') DEFAULT 'user',
  church_name  VARCHAR(255),
  instrument   VARCHAR(100),
  default_key  VARCHAR(10),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Songs master table (admin only writes here)
CREATE TABLE songs (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  song_number      INT,
  title            VARCHAR(255) NOT NULL,
  artist           VARCHAR(255),
  composer         VARCHAR(255),
  copyright        VARCHAR(255),
  language         ENUM('english','hindi','marathi','bengali','other'),
  lyrics_original  TEXT,
  lyrics_roman     TEXT,
  chords           TEXT,
  notes            TEXT,
  original_key     VARCHAR(10),
  capo             INT DEFAULT 0,
  bpm              INT,
  time_signature   VARCHAR(10) DEFAULT '4/4',
  structure        TEXT,
  audio_url        VARCHAR(500),
  created_by       INT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active        BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Hashtags
CREATE TABLE hashtags (
  id       INT PRIMARY KEY AUTO_INCREMENT,
  name     VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100)
);

-- Song to hashtag relationship
CREATE TABLE song_hashtags (
  song_id    INT,
  hashtag_id INT,
  PRIMARY KEY (song_id, hashtag_id),
  FOREIGN KEY (song_id) REFERENCES songs(id),
  FOREIGN KEY (hashtag_id) REFERENCES hashtags(id)
);

-- Personal user song versions
CREATE TABLE user_songs (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  user_id         INT NOT NULL,
  song_id         INT NOT NULL,
  custom_key      VARCHAR(10),
  custom_chords   TEXT,
  custom_lyrics   TEXT,
  custom_notes    TEXT,
  personal_note   TEXT,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (user_id, song_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (song_id) REFERENCES songs(id)
);

-- Chord accuracy reports
CREATE TABLE chord_reports (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  song_id     INT NOT NULL,
  user_id     INT,
  reason      ENUM('wrong_chord','wrong_key','lyrics_mismatch','wrong_language','other'),
  suggestion  TEXT,
  status      ENUM('open','fixed','rejected') DEFAULT 'open',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES songs(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Occasions for leaflet builder
CREATE TABLE occasions (
  id       INT PRIMARY KEY AUTO_INCREMENT,
  name     VARCHAR(100) NOT NULL,
  slug     VARCHAR(100) NOT NULL UNIQUE,
  hashtags TEXT
);

-- Leaflets
CREATE TABLE leaflets (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT,
  occasion_id INT,
  title       VARCHAR(255),
  header_data TEXT,
  print_type  ENUM('lyrics_only','chords','both') DEFAULT 'both',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (occasion_id) REFERENCES occasions(id)
);

-- Songs inside a leaflet
CREATE TABLE leaflet_songs (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  leaflet_id INT NOT NULL,
  song_id    INT NOT NULL,
  position   INT NOT NULL,
  custom_key VARCHAR(10),
  FOREIGN KEY (leaflet_id) REFERENCES leaflets(id),
  FOREIGN KEY (song_id) REFERENCES songs(id)
);

-- Song view tracking
CREATE TABLE song_views (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  song_id    INT NOT NULL,
  user_id    INT,
  viewed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES songs(id)
);
```

---

## Week 1 — Build Agents (Run All Simultaneously)

---

### Agent 1 — Project Structure and Database Setup

```
Mission: Set up the complete Maven web application project structure in NetBeans for a church worship song library. 

Do the following in order:

1. Create a Maven Web Application project named worship-song-library with the following folder structure:
   src/main/java/com/worship/
     model/       (Song.java, User.java, Leaflet.java, LeafletSong.java, ChordReport.java)
     dao/         (SongDAO.java, UserDAO.java, LeafletDAO.java, ReportDAO.java)
     servlet/     (SongListServlet.java, SongViewServlet.java, LoginServlet.java, RegisterServlet.java, AdminServlet.java, ImportServlet.java, LeafletServlet.java, SearchServlet.java, TransposeServlet.java, ReportServlet.java)
     util/        (ChordParser.java, ChordTransposer.java, NoteTransposer.java, DBConnection.java, SessionUtil.java)
   src/main/webapp/
     WEB-INF/web.xml
     jsp/         (login.jsp, register.jsp, songList.jsp, songView.jsp, admin/, leaflet/)
     css/style.css
     js/app.js

2. Create DBConnection.java with MySQL JDBC connection pool using connection string for worship_db database on localhost:3306 with UTF-8 encoding.

3. Create the full MySQL schema as provided in the project rules database schema. Include all 9 tables: users, songs, hashtags, song_hashtags, user_songs, chord_reports, occasions, leaflets, leaflet_songs, song_views.

4. Insert seed data:
   - 1 admin user (username: admin, password: hashed)
   - 15 occasions with their hashtag slugs: Sunday Worship (#praise #worship #adoration #thanksgiving #offertory), Wedding (#wedding #love #covenant #praise #blessing), House Dedication (#dedication #blessing #protection #praise #thanksgiving), Baby Dedication (#dedication #children #blessing #thanksgiving #praise), Housewarming (#housewarming #blessing #thanksgiving #fellowship #praise), House Meeting (#fellowship #prayer #devotional #worship #intercession), Christmas (#christmas #nativity #advent #praise #joy), Funeral (#funeral #comfort #hope #eternallife #peace), Easter (#easter #resurrection #cross #goodfriday #victory), Youth (#youth #contemporary #worship #upbeat #praise), Harvest Festival (#harvest #thanksgiving #abundance #praise #firstfruits #provision), New Year (#newyear #hope #renewal #thanksgiving #faith #newbeginning), Watchnight (#watchnight #prayer #intercession #worship #newyear #vigil), Convention (#convention #conference #worship #praise #teaching #unity), Revival Meeting (#revival #evangelism #healing #worship #salvation #outreach)
   - All hashtags as rows in the hashtags table
   - 5 sample English songs with full chord data in [G]Amazing [Em]grace bracket format

5. Create pom.xml with dependencies: javax.servlet-api, mysql-connector-java, jstl, opencsv, jackson-databind, commons-codec for password hashing.

Stack: Java, Maven, JSP, Servlets, MySQL, NetBeans. Follow MVC. No database calls in JSP.
```

---

### Agent 2 — Login, Registration, and Session System

```
Mission: Build the complete authentication system for a Java Maven JSP/Servlet worship song library app.

Create the following:

1. User.java model with fields: id, username, email, password, role (enum: guest/user/admin), churchName, instrument, defaultKey, createdAt.

2. UserDAO.java with methods:
   - findByUsername(String username) → User
   - findByEmail(String email) → User
   - createUser(User user) → boolean
   - updateUser(User user) → boolean
   - getAllUsers() → List<User>
   - updateRole(int userId, String role) → boolean

3. SessionUtil.java with static helper methods:
   - isGuest(HttpSession session) → boolean
   - isUser(HttpSession session) → boolean
   - isAdmin(HttpSession session) → boolean
   - getCurrentUser(HttpSession session) → User
   - saveGuestEdits(HttpSession session, int songId, String customChords, String customLyrics, String customKey)
   - getGuestEdits(HttpSession session, int songId) → Map
   - migrateGuestEditsToAccount(HttpSession session, int userId, UserSongDAO dao) — transfers all guest session edits to user_songs table on signup

4. LoginServlet.java (URL: /login):
   - GET: forward to login.jsp
   - POST: authenticate user against database using bcrypt, set session attributes (userId, username, role), redirect to /songs on success

5. RegisterServlet.java (URL: /register):
   - GET: forward to register.jsp
   - POST: validate inputs, hash password with bcrypt (commons-codec), create user, call migrateGuestEditsToAccount to save any session edits, redirect to /songs

6. LogoutServlet.java (URL: /logout):
   - Invalidate session, redirect to /

7. login.jsp: Clean Bootstrap 5 form with username and password fields, link to register.

8. register.jsp: Bootstrap 5 form with username, email, password, church name fields. Show message that current editing session will be saved.

Guest edits are stored in HttpSession as a Map<Integer, Map<String, String>> where the key is songId and the value contains customChords, customLyrics, customKey. Never touch the database for guest edits.

Stack: Java Maven JSP Servlet MySQL Bootstrap 5. MVC pattern. Password hashed with bcrypt.
```

---

### Agent 3 — Song Library Core

```
Mission: Build the complete song library feature for a Java Maven JSP/Servlet church worship app.

Create the following:

1. Song.java model with all fields: id, songNumber, title, artist, composer, copyright, language, lyricsOriginal, lyricsRoman, chords, notes, originalKey, capo, bpm, timeSignature, structure, audioUrl, createdBy, createdAt, isActive. Add a List<String> hashtags field.

2. SongDAO.java with methods:
   - getAllSongs() → List<Song>
   - getSongById(int id) → Song
   - searchSongs(String query) → List<Song> — searches title, artist, lyrics_original, lyrics_roman using LIKE
   - getSongsByHashtag(String hashtag) → List<Song>
   - getSongsByLanguage(String language) → List<Song>
   - getSongsByKey(String key) → List<Song>
   - getSongsByOccasion(List<String> hashtags) → List<Song> — ranked by number of matching hashtags
   - addSong(Song song) → boolean
   - updateSong(Song song) → boolean
   - deleteSong(int id) → boolean (soft delete — sets is_active = false)
   - getHashtagsForSong(int songId) → List<String>
   - addHashtagToSong(int songId, int hashtagId) → boolean
   - incrementViewCount(int songId, Integer userId)

3. SongListServlet.java (URL: /songs):
   - GET: fetch all active songs, pass to songList.jsp
   - Accept query params: q (search), hashtag, language, key for filtering

4. SongViewServlet.java (URL: /song):
   - GET: fetch song by id, check if user has personal version in user_songs, if yes load that, if no load master. Pass song + isPersonalVersion flag to songView.jsp. Increment view count.

5. songList.jsp:
   - Bootstrap 5 responsive grid — one column mobile, two tablet, three desktop
   - Each song shown as card: title, artist, key badge, BPM, language pill, hashtag pills
   - Search bar at top searching title/artist/lyrics
   - Hashtag filter pills
   - Language dropdown filter

6. songView.jsp:
   - Three view mode toggle tabs: Lyrics + Chords, Lyrics + Notes, Lyrics Only
   - Noto Sans Mono font for all song content
   - Chord lines in blue (#185FA5), note lines in green (#3B6D11)
   - Font size A− A+ controls
   - Script toggle button: shows lyricsOriginal or lyricsRoman
   - Auto-scroll with speed control (slow/medium/fast/off)
   - Transpose section (− semitones + display, key display, capo hint)
   - On mobile: bottom bar with Key display, scroll toggle, gear settings icon
   - Settings bottom sheet: transpose, font size, script toggle, scroll speed
   - Three-dot menu: Report wrong chord, Edit my version, Bookmark
   - Wake Lock API call to keep screen on when song is open
   - If isPersonalVersion is true show a banner: "Showing your personal version — Reset to original"

Stack: Java Maven JSP Servlet MySQL Bootstrap 5 Noto Sans Mono. MVC. No DB calls in JSP.
```

---

### Agent 4 — Chord Parser and Transposer Engine

```
Mission: Build the complete chord and note processing engine for a Java Maven worship app.

Create the following Java utility classes:

1. ChordParser.java:
   - parseChordLine(String rawLyricWithChords) → String[] where index 0 is the chord line and index 1 is the clean lyric line
   - Input format: "[G]Amazing [Em]grace how [C]sweet the [G]sound"
   - Output chord line: "G           Em        C    G" (padded with spaces to sit above correct syllable)
   - Output lyric line: "Amazing grace how sweet the sound"
   - Must handle: major, minor, 7th, sus2, sus4, dim, aug, maj7, add9, sharps (#), flats (b)
   - Must handle multi-line songs — process line by line
   - parseFullSong(String fullChordLyrics) → List<String[]> — returns list of [chordLine, lyricLine] pairs

2. ChordTransposer.java:
   - CHORD_ORDER array: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
   - ENHARMONIC map: Db→C#, Eb→D#, Gb→F#, Ab→G#, Bb→A#
   - transposeChord(String chord, int semitones) → String
   - transposeChordLine(String chordLine, int semitones) → String — applies transpose to every chord in a line
   - transposeSong(String fullChordLyrics, int semitones) → String — transposes all [X] markers in the full raw lyric string
   - getKeyAfterTranspose(String originalKey, int semitones) → String
   - getCapoSuggestion(int semitones) → String — returns "Capo 1" through "Capo 5" for positive semitone shifts, empty string otherwise

3. NoteTransposer.java:
   - NOTES_ORDER array: Sa, Re, Ga, Ma, Pa, Dha, Ni (Indian solfege)
   - transposeNotes(String noteLine, int semitones) → String
   - Maps Western chromatic scale positions to Indian solfege equivalents

4. TransposeServlet.java (URL: /transpose):
   - POST: accepts songId, semitones as params
   - Fetches raw chord-lyric string from database
   - Calls ChordTransposer.transposeSong()
   - Returns JSON: { chordLines: [], lyricLines: [], key: "Am", capo: "Capo 2" }
   - JavaScript on songView.jsp calls this endpoint and updates the DOM without page reload

5. A JavaScript function in app.js:
   - transposeUI(direction) — calls /transpose endpoint, updates all .chord-line elements in the page DOM
   - updateKeyDisplay(newKey, capo) — updates the key badge and capo hint

All chord processing happens server-side in Java. The servlet returns JSON. JavaScript only updates the DOM.
Stack: Java Maven Servlet JSON (Jackson). No JSP needed for this agent.
```

---

### Agent 5 — Admin Panel and Song Import

```
Mission: Build the complete admin panel and song import system for a Java Maven JSP/Servlet worship app.

Create the following:

1. AdminServlet.java (URL: /admin) with role check — redirect to /login if not admin:
   - GET /admin → admin dashboard JSP showing total songs, users, open reports
   - GET /admin/songs → song management list with edit/delete buttons
   - GET /admin/add → add song form JSP
   - POST /admin/add → save new song to database including hashtags
   - GET /admin/edit?id=X → edit song form pre-filled
   - POST /admin/edit → update song in database
   - POST /admin/delete → soft delete song (is_active = false)
   - GET /admin/users → user list with role management
   - POST /admin/role → change user role
   - GET /admin/reports → open chord reports list
   - POST /admin/report/resolve → mark report fixed or rejected

2. ImportServlet.java (URL: /admin/import):
   - GET: show import form JSP with two tabs: CSV Upload and Paste Import
   - POST /admin/import/csv: read uploaded CSV file using OpenCSV. Columns: title, artist, language, lyrics_original, lyrics_roman, chords, notes, original_key, bpm, capo, hashtags (comma separated). Insert each valid row into songs + song_hashtags tables. Return success count and error count.
   - POST /admin/import/paste: accept raw pasted song text. Call Claude API (claude-sonnet-4-20250514) with system prompt: "You are a music data extractor. Given raw song text, extract and return ONLY valid JSON with fields: title, artist, language, lyricsOriginal, lyricsRoman, chords, notes, originalKey, bpm, capo, hashtags. Chords must be in bracket format [G]lyric [Em]word. Return only JSON, no explanation." Parse JSON response and show preview form before saving. Admin reviews and confirms.

3. Admin JSPs:
   - adminDashboard.jsp: stats cards (total songs, users, open reports, songs added this week)
   - adminSongs.jsp: table with search, edit and delete buttons per row
   - adminAddSong.jsp: full form with all song fields, hashtag multi-select, preview of chord alignment before saving
   - adminReports.jsp: table showing song name, reporter, reason, suggestion, action buttons (Mark Fixed / Reject)
   - adminImport.jsp: two-tab interface for CSV upload and paste import

4. Duplicate detection in ImportServlet: before inserting any song, check if a song with the same title already exists (case insensitive). If yes, skip with a warning in the result summary.

5. Create a CSV template file: song_import_template.csv with column headers and 2 example rows showing correct format including bracket chord notation.

Stack: Java Maven JSP Servlet MySQL OpenCSV Jackson Bootstrap 5. Admin role required for all endpoints.
```

---

### Agent 6 — Personal Versions, Reports, and User Account

```
Mission: Build the personal song version system, chord reporting, and user account features for a Java Maven JSP/Servlet worship app.

Create the following:

1. UserSong.java model: id, userId, songId, customKey, customChords, customLyrics, customNotes, personalNote, updatedAt.

2. UserSongDAO.java:
   - getUserVersion(int userId, int songId) → UserSong or null
   - saveUserVersion(UserSong us) → boolean (INSERT or UPDATE)
   - deleteUserVersion(int userId, int songId) → boolean
   - getAllUserVersions(int userId) → List<UserSong>

3. UserSongServlet.java (URL: /song/edit):
   - GET: load song — if user logged in check user_songs for personal version, if guest check HttpSession
   - POST /song/save: if user logged in save to user_songs table, if guest save to HttpSession under key songId
   - POST /song/reset: delete user's personal version from user_songs, reload master song
   - POST /song/suggest: save user's version as a suggestion for admin review (status='open' in chord_reports with suggestion field containing the full chord text)
   - Response as JSON for AJAX calls from songView.jsp

4. Inline editor on songView.jsp:
   - Edit button opens an inline editable textarea below the song — pre-filled with current chord-lyric text
   - Save button: calls /song/save via AJAX
   - Reset to original button: calls /song/reset via AJAX, reloads song content
   - Suggest to admin button: calls /song/suggest via AJAX
   - For guest users show banner: "You are editing as a guest — sign up to save your edits permanently"

5. ChordReport.java model: id, songId, userId, reason, suggestion, status, createdAt.

6. ReportDAO.java:
   - submitReport(ChordReport report) → boolean
   - getAllOpenReports() → List<ChordReport>
   - updateReportStatus(int id, String status) → boolean

7. ReportServlet.java (URL: /song/report):
   - POST: accept songId, reason, suggestion params. Save to chord_reports. Works for both guest (userId null) and logged-in users.

8. Report modal in songView.jsp:
   - Three-dot menu → Report wrong chord → modal opens
   - Radio buttons: Wrong chord, Wrong key, Lyrics mismatch, Wrong language, Other
   - Optional textarea: Suggest correct version
   - Submit via AJAX to /song/report
   - Show confirmation: "Thank you, admin has been notified"

9. myAccount.jsp (URL: /account):
   - Show user profile: username, email, church, instrument, default key
   - List of personal song versions with link to each song
   - Edit profile form

Stack: Java Maven JSP Servlet MySQL Bootstrap 5. Guest edits in HttpSession only, never in database.
```

---

### Agent 7 — Leaflet Builder

```
Mission: Build the complete occasion-based song leaflet builder for a Java Maven JSP/Servlet church worship app.

Create the following:

1. Leaflet.java model: id, userId, occasionId, occasionName, title, headerData (JSON string), printType, createdAt, List<LeafletSong> songs.

2. LeafletSong.java model: id, leafletId, songId, songTitle, position, customKey.

3. LeafletDAO.java:
   - createLeaflet(Leaflet leaflet) → int (returns new leaflet id)
   - addSongToLeaflet(int leafletId, int songId, int position, String customKey) → boolean
   - getLeafletById(int id) → Leaflet with all songs
   - getUserLeaflets(int userId) → List<Leaflet>
   - deleteLeaflet(int id) → boolean
   - updateSongOrder(int leafletId, List<Integer> songIds) → boolean

4. LeafletServlet.java (URL: /leaflet):
   - GET /leaflet/new → show leaflet builder JSP
   - GET /leaflet/occasions → return JSON list of all occasions with their hashtags
   - POST /leaflet/suggestions → accept occasionId, return JSON list of suggested songs ranked by hashtag match count (songs matching more occasion hashtags rank higher)
   - POST /leaflet/save → save leaflet and all songs to database
   - GET /leaflet/print?id=X → generate print-ready HTML page for the leaflet
   - GET /leaflet/my → show user's saved leaflets

5. leafletBuilder.jsp (URL: /leaflet/new):

   Step 1 — Occasion picker:
   Show a grid of 15 occasion cards with icon and name. Click one to select.
   Occasions: Sunday Worship, Wedding, House Dedication, Baby Dedication, Housewarming, House Meeting, Christmas, Funeral, Easter, Youth, Harvest Festival, New Year, Watchnight, Convention, Revival Meeting.

   Step 2 — Dynamic header fields (shown after occasion selected via JavaScript):
   Each occasion shows different input fields:
   - Wedding: Bride name, Groom name, Wedding date, Venue, Church name
   - Funeral: Departed name, Date of birth, Date of passing, Service date, Church name
   - Baby Dedication: Baby name, Father name, Mother name, Date of birth, Dedication date, Church name
   - Convention: Convention name, Theme, Venue, From date, To date, Speaker name
   - Revival Meeting: Meeting name, Evangelist name, Venue, Dates, Church name
   - All others: Title/theme, Date, Church name

   Step 3 — Song suggestions panel:
   After occasion selected, call /leaflet/suggestions via AJAX. Show suggested songs as cards with Accept/Dismiss buttons. Accepted songs appear in the leaflet song list below.

   Step 4 — Search and add:
   Full text search bar — calls /search?q= endpoint — searches title, artist, lyrics_original, lyrics_roman using LIKE. Show results with Add to Leaflet button.

   Step 5 — Song list with drag and drop:
   Songs shown as draggable rows with position number, song title, key badge, remove button.
   Use HTML5 Drag and Drop API — no external libraries.
   On drop reorder the list and update position numbers.

   Step 6 — Print options:
   Two checkboxes: Congregation copy (lyrics only), Musicians copy (lyrics + chords).
   Save Leaflet button — POST to /leaflet/save.
   Preview and Print button — opens /leaflet/print?id=X in a new tab.

6. leafletPrint.jsp (URL: /leaflet/print):
   Clean printable layout with no navigation, no buttons.
   Header section showing occasion-specific fields (bride and groom, or baby name, or convention details).
   Each song printed with: song number, title, artist, key.
   If musicians copy: chord line above lyric line in Noto Sans Mono.
   If congregation copy: lyrics only, no chords.
   @media print CSS hides everything except the print content.
   WhatsApp share button (before print CSS kicks in): generates URL /leaflet/print?id=X and opens wa.me share link.

Stack: Java Maven JSP Servlet MySQL Bootstrap 5. HTML5 drag API for reorder. AJAX for suggestions and search. @media print for clean output.
```

---

### Agent 8 — Landing Page and Navigation

```
Mission: Build the landing page and main navigation for a Java Maven JSP/Servlet church worship song library app.

Create the following:

1. IndexServlet.java (URL: /):
   - GET: load 3 featured songs from database, load all hashtag genres, forward to index.jsp

2. index.jsp — the landing page:

   Navigation bar:
   - Left: App logo + name
   - Right: Login button, Sign Up button (primary)
   - If user logged in: show username + Logout link

   Hero section:
   - Tag line pill: "For church choirs and musicians"
   - Headline: "Every worship song. Perfectly in tune."
   - Subline: "Browse, transpose, and perform songs in any key. Works in English, Hindi, Marathi, Bengali and more."
   - Two buttons: "Browse songs free" (primary — links to /songs), "Sign up" (secondary — links to /register)

   Live song preview card:
   - Show one real song from database with actual chords and lyrics in Noto Sans Mono
   - Chord line in blue, lyric line below
   - Key badge, language tag

   Four feature cards grid (2x2 on mobile, 4 across on desktop):
   - Transpose chords: Any key instantly with capo suggestions
   - Song library: Chords, lyrics and notes all aligned
   - Multi-language: Hindi, Marathi, Bengali, English
   - Auto-scroll: Hands-free during performance

   Genre hashtag strip:
   - Section label: "Genres supported"
   - Pills for: #praise #worship #wedding #christmas #funeral #easter #harvest #revival #dedication #youth #convention

   Bottom CTA section:
   - Headline: "Start using it right now"
   - Subline: "No account needed to browse and transpose"
   - Button: "Browse songs free"
   - Small note: "Sign up to save your personal chord edits"

   Footer: App name + "Made for the church" + About + Contact links

3. navbar.jsp (included in all pages via JSP include):
   - Desktop: full nav with links Songs, Leaflet Builder, My Account (if logged in), Admin (if admin role)
   - Mobile: hamburger menu with Bootstrap 5 collapse
   - Always show: app logo, Login/Logout

4. CSS variables in style.css:
   --color-chord: #185FA5;
   --color-note: #3B6D11;
   --color-brand: #534AB7;
   --font-song: 'Noto Sans Mono', monospace;
   --radius-card: 12px;
   All Bootstrap 5 theme colors overridden with these brand colors.

5. Google Fonts import in style.css:
   @import url for Noto Sans Mono:wght@400;500

Stack: Java Maven JSP Servlet MySQL Bootstrap 5. Landing page accessible without login.
```

---

## Week 2 — Polish and Integration Agents

---

### Agent 9 — Responsive CSS and Mobile UX

```
Mission: Write complete responsive CSS and mobile UX polish for the worship song library JSP app.

Do the following:

1. In style.css write all responsive rules using mobile-first Bootstrap 5:

   Mobile (default — no media query):
   - Song body div: overflow-x: auto; white-space: nowrap — horizontal scroll for long chord lines
   - Bottom bar: display: flex — fixed at bottom with Key display, scroll toggle, gear icon
   - Hashtag pills on song cards: display: none
   - Artist and BPM metadata on song view: display: none
   - All buttons minimum height: 44px
   - Font size for song body: 12px

   Tablet @media (min-width: 768px):
   - Hashtag pills: display: flex
   - Artist metadata: display: block
   - Song list: 2 column grid
   - Font size for song body: 13px
   - Bottom bar: display: none
   - Show full controls inline instead

   Desktop @media (min-width: 1024px):
   - Navigation sidebar: always visible
   - Song list: 3 column grid
   - Max content width: 800px centered
   - Font size for song body: 14px

   Print @media print:
   - Hide: navbar, buttons, search, filters, bottom bar, all controls
   - Show only: leaflet header, song content
   - Page break before each song if one-song-per-page option selected
   - Chord lines: font-size 11px, color black (not blue — saves ink)
   - Lyric lines: font-size 12px

2. Settings bottom sheet (mobile):
   - A div fixed to bottom of screen, initially translated off screen (transform: translateY(100%))
   - When gear icon clicked: add class open → transform: translateY(0) with CSS transition 0.3s
   - Overlay behind it: semi-transparent, clicking it closes the sheet
   - Contents: Transpose (− key +), Font size (A− A+), Script toggle, Scroll speed radio buttons

3. Wake Lock implementation in app.js:
   - On song page load: navigator.wakeLock.request('screen') to prevent screen dim
   - On page unload or visibility change: release the wake lock
   - Wrap in try/catch — not all browsers support it

4. Swipe gesture on song view (mobile):
   - touchstart and touchend event listeners on the song body
   - If horizontal swipe detected and user is in a leaflet context: navigate to previous or next song

5. WhatsApp share function in app.js:
   - shareToWhatsApp(songTitle, songUrl) — opens https://wa.me/?text=Check+out+{songTitle}+{encodedUrl}

Stack: CSS3, Bootstrap 5, JavaScript. No external JS libraries for gestures or sheets.
```

---

### Agent 10 — Full Text Search

```
Mission: Build the full text lyric search system for a Java Maven JSP/Servlet worship app.

Create the following:

1. SearchServlet.java (URL: /search):
   - GET: accept param q (search query)
   - Run MySQL query:
     SELECT id, title, artist, language, original_key, lyrics_original, lyrics_roman
     FROM songs
     WHERE is_active = 1
     AND (
       title LIKE CONCAT('%', ?, '%')
       OR artist LIKE CONCAT('%', ?, '%')
       OR lyrics_original LIKE CONCAT('%', ?, '%')
       OR lyrics_roman LIKE CONCAT('%', ?, '%')
     )
     LIMIT 20
   - For each result find the matched line: split lyrics by newline, return the first line that contains the query string
   - Return JSON array: [{ id, title, artist, language, key, matchedLine }]
   - matchedLine is the actual lyric line that matched (not the whole lyrics)

2. search.jsp (URL: /search page):
   - Search bar at top (pre-filled with query)
   - Results shown as cards with:
     Title (bold), artist (muted), key badge, language pill
     Matched line shown below with search term highlighted in yellow using <mark> tag
   - "Add to Leaflet" button on each card (only visible if user is building a leaflet — check session)
   - "Open Song" button links to /song?id=X
   - If no results: show "No songs found — try different words" with suggestions to search by first line

3. Live search in app.js:
   - On songList.jsp and leafletBuilder.jsp: input event listener on search field
   - Debounce 300ms then call /search?q= via fetch API
   - Update results DOM without page reload
   - Show loading indicator during fetch

4. Add to leaflet from search:
   - If session contains an active leaflet (leafletId in session): show Add button on each search result
   - POST /leaflet/add-song with songId and leafletId
   - Update leaflet song count in the UI

Stack: Java Maven Servlet MySQL Bootstrap 5. AJAX search with debounce. JSON response. No page reload.
```

---

## Agent Rules Summary

```
Agent 1  → Foundation — run first, all others depend on it
Agent 2  → Auth — depends on Agent 1 (users table)
Agent 3  → Songs — depends on Agent 1 (songs table) and Agent 2 (session)
Agent 4  → Transposer — depends on Agent 3 (song data)
Agent 5  → Admin — depends on Agents 1, 2, 3
Agent 6  → Personal Versions — depends on Agents 2, 3
Agent 7  → Leaflet — depends on Agents 1, 2, 3, 10
Agent 8  → Landing Page — depends on Agent 3
Agent 9  → CSS/UX — depends on Agents 3, 7, 8 (run last in Week 1)
Agent 10 → Search — depends on Agent 3 (run alongside Agent 7)
```

---

## Dependency Order for Agent Manager

```
Week 1 Day 1:   Agent 1 (must complete first)
Week 1 Day 2:   Agent 2 + Agent 4 (parallel)
Week 1 Day 3:   Agent 3 + Agent 5 (parallel)
Week 1 Day 4:   Agent 6 + Agent 10 (parallel)
Week 1 Day 5:   Agent 7 + Agent 8 (parallel)
Week 1 Day 6:   Agent 9 (depends on all above)
Week 1 Day 7:   Integration testing and bug fixes

Week 2:         Study each file. Understand every class.
                Prepare to explain MVC, session management,
                chord parsing, and leaflet builder to your professor.
```

---

## Features Covered by These Missions

| Feature | Agent |
|---|---|
| Database schema — 9 tables | 1 |
| Maven project structure | 1 |
| Login and registration | 2 |
| Guest session and migration | 2 |
| Song library CRUD | 3 |
| Three view modes | 3 |
| Mobile song viewer UI | 3 |
| Chord bracket parser | 4 |
| Chord transposer | 4 |
| Note transposer (Sa Re Ga) | 4 |
| Capo suggestion | 4 |
| Admin dashboard | 5 |
| CSV bulk import | 5 |
| AI paste import (Claude API) | 5 |
| Personal song versions | 6 |
| Report wrong chord | 6 |
| Accuracy suggestion to admin | 6 |
| Leaflet builder — 15 occasions | 7 |
| Dynamic header fields | 7 |
| Hashtag-based song suggestions | 7 |
| Drag and drop reorder | 7 |
| Print layout — two versions | 7 |
| WhatsApp share | 7 |
| Landing page | 8 |
| Responsive CSS — 3 breakpoints | 9 |
| Mobile bottom bar | 9 |
| Settings bottom sheet | 9 |
| Wake Lock API | 9 |
| Full text lyric search | 10 |
| Live search AJAX | 10 |

---

## What is NOT in These Missions (Post-Launch)

- BPM metronome / tap tempo
- Chord diagram finger position popup
- Song request queue from users
- Setlist builder with team sharing
- Song usage analytics for admin
- Swipe between songs in setlist
- PWA manifest and service worker
- Capacitor APK build

---

*Generated from full product design session. All features, database schema, and architecture decisions finalized before coding.*
