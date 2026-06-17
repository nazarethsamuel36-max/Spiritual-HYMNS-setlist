-- =============================================
-- Worship Song Library — Full Database Schema
-- MySQL with UTF-8mb4 charset, InnoDB engine
-- =============================================

CREATE DATABASE IF NOT EXISTS worship_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE worship_db;

-- =============================================
-- TABLE 1: Users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    username     VARCHAR(100) NOT NULL UNIQUE,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         ENUM('guest','user','admin') DEFAULT 'user',
    church_name  VARCHAR(255),
    instrument   VARCHAR(100),
    default_key  VARCHAR(10),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE 2: Songs (master table — admin only writes)
-- =============================================
CREATE TABLE IF NOT EXISTS songs (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    song_number      INT,
    title            VARCHAR(255) NOT NULL,
    artist           VARCHAR(255),
    composer         VARCHAR(255),
    copyright        VARCHAR(255),
    language         ENUM('english','hindi','marathi','bengali','konkani','other'),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE 3: Hashtags
-- =============================================
CREATE TABLE IF NOT EXISTS hashtags (
    id       INT PRIMARY KEY AUTO_INCREMENT,
    name     VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE 4: Song ↔ Hashtag relationship
-- =============================================
CREATE TABLE IF NOT EXISTS song_hashtags (
    song_id    INT,
    hashtag_id INT,
    PRIMARY KEY (song_id, hashtag_id),
    FOREIGN KEY (song_id) REFERENCES songs(id),
    FOREIGN KEY (hashtag_id) REFERENCES hashtags(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE 5: Personal user song versions
-- =============================================
CREATE TABLE IF NOT EXISTS user_songs (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE 6: Chord accuracy reports
-- =============================================
CREATE TABLE IF NOT EXISTS chord_reports (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    song_id     INT NOT NULL,
    user_id     INT,
    reason      ENUM('wrong_chord','wrong_key','lyrics_mismatch','wrong_language','other'),
    suggestion  TEXT,
    status      ENUM('open','fixed','rejected') DEFAULT 'open',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (song_id) REFERENCES songs(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE 7: Occasions for leaflet builder
-- =============================================
CREATE TABLE IF NOT EXISTS occasions (
    id       INT PRIMARY KEY AUTO_INCREMENT,
    name     VARCHAR(100) NOT NULL,
    slug     VARCHAR(100) NOT NULL UNIQUE,
    hashtags TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE 8: Leaflets
-- =============================================
CREATE TABLE IF NOT EXISTS leaflets (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT,
    occasion_id INT,
    title       VARCHAR(255),
    header_data TEXT,
    print_type  ENUM('lyrics_only','chords','both') DEFAULT 'both',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (occasion_id) REFERENCES occasions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE 9: Songs inside a leaflet
-- =============================================
CREATE TABLE IF NOT EXISTS leaflet_songs (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    leaflet_id INT NOT NULL,
    song_id    INT NOT NULL,
    position   INT NOT NULL,
    custom_key VARCHAR(10),
    FOREIGN KEY (leaflet_id) REFERENCES leaflets(id),
    FOREIGN KEY (song_id) REFERENCES songs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE 10: Song view tracking
-- =============================================
CREATE TABLE IF NOT EXISTS song_views (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    song_id    INT NOT NULL,
    user_id    INT,
    viewed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (song_id) REFERENCES songs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- =============================================
-- TABLE 11: Setlists
-- =============================================
CREATE TABLE IF NOT EXISTS setlists (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    user_id      INT NOT NULL,
    title        VARCHAR(255) NOT NULL,
    occasion     VARCHAR(100),
    share_token  VARCHAR(64) UNIQUE,
    is_public    BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE 12: Setlist Songs
-- =============================================
CREATE TABLE IF NOT EXISTS setlist_songs (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    setlist_id   INT NOT NULL,
    song_id      INT NOT NULL,
    position     INT NOT NULL,
    creator_key  VARCHAR(10),
    creator_capo INT DEFAULT 0,
    FOREIGN KEY (setlist_id) REFERENCES setlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE 13: Position-based chord mappings (from alignment pipeline)
-- =============================================
CREATE TABLE IF NOT EXISTS line_chords (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    line_id    INT NOT NULL,
    chord      VARCHAR(30) NOT NULL,
    char_index INT NOT NULL,
    confidence DECIMAL(4,3),
    flag       VARCHAR(30),
    FOREIGN KEY (line_id) REFERENCES song_lines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
