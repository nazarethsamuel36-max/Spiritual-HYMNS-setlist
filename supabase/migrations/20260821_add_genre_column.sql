-- Create versions table (if not exists)
-- Based on Version type in src/db/Database.ts
CREATE TABLE IF NOT EXISTS versions (
    uid TEXT PRIMARY KEY,
    source_song_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    owner TEXT NOT NULL CHECK (owner IN ('personal', 'shared')),
    lyrics TEXT,
    chords TEXT,
    sections JSONB,
    original_key TEXT,
    capo INTEGER,
    bpm INTEGER,
    time_signature TEXT,
    artist TEXT,
    composer TEXT,
    hashtags TEXT[],
    genre TEXT[] DEFAULT '{}',
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::bigint,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::bigint
);

-- Add genre column to songs table (if not exists)
ALTER TABLE songs ADD COLUMN IF NOT EXISTS genre text[] DEFAULT '{}';

-- Add genre column to versions table (if not already added above)
ALTER TABLE versions ADD COLUMN IF NOT EXISTS genre text[] DEFAULT '{}';

-- Backfill existing rows with empty arrays
UPDATE songs SET genre = '{}' WHERE genre IS NULL;
UPDATE versions SET genre = '{}' WHERE genre IS NULL;

-- Create GIN index for efficient genre filtering
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs USING GIN (genre);
CREATE INDEX IF NOT EXISTS idx_versions_genre ON versions USING GIN (genre);

-- Comment on column
COMMENT ON COLUMN songs.genre IS 'Array of genre tags (e.g., ["Praise", "Worship"])';
COMMENT ON COLUMN versions.genre IS 'Array of genre tags (e.g., ["Praise", "Worship"])';

-- Add trigger to auto-update updated_at on versions table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = EXTRACT(EPOCH FROM NOW())::bigint;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_versions_updated_at ON versions;
CREATE TRIGGER update_versions_updated_at
    BEFORE UPDATE ON versions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();