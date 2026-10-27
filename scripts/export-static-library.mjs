import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exportsDir = path.resolve(root, 'public', 'exports');
const songsDir = path.resolve(exportsDir, 'songs');

// 1. Read environment variables (from process.env or .env file)
function loadEnv() {
  const envPath = path.resolve(root, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment or .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

function parseLyricsToSections(lyrics) {
  if (!lyrics) return [];
  const sections = [];
  const lines = lyrics.split('\n');
  let currentSection = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        type: 'verse',
        label: sectionMatch[1],
        lines: [],
      };
    } else if (currentSection) {
      currentSection.lines.push({ text: trimmed });
    } else {
      currentSection = {
        type: 'verse',
        label: 'VERSE',
        lines: [{ text: trimmed }],
      };
    }
  }

  if (currentSection) sections.push(currentSection);
  return sections;
}

async function exportStaticLibrary() {
  console.log('🚀 Starting static library export from Supabase...');

  fs.mkdirSync(songsDir, { recursive: true });

  // Read existing manifest if present
  const manifestPath = path.resolve(exportsDir, 'manifest.json');
  let oldManifest = null;
  if (fs.existsSync(manifestPath)) {
    try {
      oldManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      // ignore parse error
    }
  }

  // Fetch all active songs (in batches if needed, using range)
  let allSongs = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) {
      console.error('❌ Supabase fetch error:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) break;
    allSongs.push(...data);
    if (data.length < batchSize) break;
    from += batchSize;
  }

  console.log(`📥 Fetched ${allSongs.length} active songs from Supabase.`);

  const changedSongIds = [];
  const indexSongs = [];
  const allSongDetails = [];
  const languageStats = {};

  for (const song of allSongs) {
    const lang = (song.language || 'unknown').toLowerCase();
    if (!languageStats[lang]) {
      languageStats[lang] = { count: 0, minNumber: Infinity, maxNumber: -Infinity };
    }
    languageStats[lang].count++;
    if (song.song_number) {
      if (song.song_number < languageStats[lang].minNumber) languageStats[lang].minNumber = song.song_number;
      if (song.song_number > languageStats[lang].maxNumber) languageStats[lang].maxNumber = song.song_number;
    }

    const sections = parseLyricsToSections(song.lyrics || '');

    const songDetailPayload = {
      id: song.id,
      songNumber: song.song_number,
      title: song.title,
      artist: song.artist || null,
      composer: song.composer || null,
      language: song.language,
      originalKey: song.original_key,
      capo: song.capo || 0,
      bpm: song.bpm || 0,
      timeSignature: song.time_signature || '4/4',
      hashtags: [],
      sections,
      chords: song.chords || null,
      lyrics: song.lyrics || null,
      is_active: song.is_active !== false,
      updated_at: song.updated_at,
      genres: song.genre || [],
    };

    const searchTokens = `${song.title} ${song.artist || ''} ${song.language || ''}`.trim().toLowerCase();

    indexSongs.push({
      id: song.id,
      songNumber: song.song_number,
      title: song.title,
      artist: song.artist || null,
      language: song.language,
      originalKey: song.original_key,
      hashtags: [],
      searchTokens,
      genres: song.genre || [],
    });

    const songFilePath = path.resolve(songsDir, `${song.id}.json`);
    const newContent = JSON.stringify(songDetailPayload, null, 2);

    let hasChanged = true;
    if (fs.existsSync(songFilePath)) {
      const existing = fs.readFileSync(songFilePath, 'utf8');
      if (existing === newContent) {
        hasChanged = false;
      }
    }

    if (hasChanged) {
      fs.writeFileSync(songFilePath, newContent, 'utf8');
      changedSongIds.push(song.id);
    }
    allSongDetails.push(songDetailPayload);
  }

  // Format language stats for manifest
  const formattedLanguages = {};
  for (const [lang, stats] of Object.entries(languageStats)) {
    formattedLanguages[lang] = {
      count: stats.count,
      range: stats.minNumber !== Infinity ? `${stats.minNumber}-${stats.maxNumber}` : 'unknown',
    };
  }

  const generatedAt = new Date().toISOString();
  const versionTimestamp = Date.now().toString();

  const manifestPayload = {
    version: versionTimestamp,
    generatedAt,
    songCount: allSongs.length,
    languages: formattedLanguages,
    exportedBy: 'ExportService v2.0 (CDN Manifest Architecture)',
    changedSongIds: changedSongIds.slice(0, 100), // Recent changed IDs for delta sync
  };

  const indexPath = path.resolve(exportsDir, 'index.json');
  const indexPayload = {
    version: versionTimestamp,
    songs: indexSongs,
  };

  const allSongsPath = path.resolve(exportsDir, 'all-songs.json');

  fs.writeFileSync(manifestPath, JSON.stringify(manifestPayload, null, 2), 'utf8');
  fs.writeFileSync(indexPath, JSON.stringify(indexPayload, null, 2), 'utf8');
  fs.writeFileSync(allSongsPath, JSON.stringify(allSongDetails), 'utf8');

  console.log(`✅ Static export complete!`);
  console.log(`   - Total Songs: ${allSongs.length}`);
  console.log(`   - Changed Songs written: ${changedSongIds.length}`);
  console.log(`   - Manifest Version: ${versionTimestamp}`);
}

exportStaticLibrary().catch((err) => {
  console.error('Fatal export error:', err);
  process.exit(1);
});
