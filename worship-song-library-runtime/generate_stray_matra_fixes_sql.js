import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const targetIds = [599, 991, 1100, 1101, 1111, 1115, 1117, 1122];

async function generateFixes() {
  console.log('📡 Fetching target songs from database...');
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, title, song_number, language, chords, lyrics')
    .in('id', targetIds);

  if (error) {
    console.error('❌ Error fetching songs:', error);
    return;
  }

  const sqlStatements = [];

  songs.forEach(song => {
    let updatedChords = song.chords;
    let updatedLyrics = song.lyrics;
    let changed = false;

    // Apply specific corrections based on target song ID
    if (song.id === 599) {
      if (updatedChords.includes('कर[D]ाया')) {
        updatedChords = updatedChords.replace('कर[D]ाया', '[D]कराया');
        changed = true;
      }
    } else if (song.id === 991) {
      if (updatedChords.includes('गाये[D]ंगे')) {
        updatedChords = updatedChords.replace('गाये[D]ंगे', 'गायेंगे [D]');
        changed = true;
      }
    } else if (song.id === 1100) {
      if (updatedChords.includes('रह[D]ा')) {
        updatedChords = updatedChords.replace('रह[D]ा', 'रहा [D]');
        changed = true;
      }
    } else if (song.id === 1101) {
      if (updatedChords.includes('रास्ताोंको')) {
        updatedChords = updatedChords.replace(/रास्ताोंको/g, 'रास्तोंको');
        changed = true;
      }
      if (updatedLyrics.includes('रास्ताोंको')) {
        updatedLyrics = updatedLyrics.replace(/रास्ताोंको/g, 'रास्तोंको');
        changed = true;
      }
    } else if (song.id === 1111) {
      if (updatedChords.includes('संभाले[D]ंगे')) {
        updatedChords = updatedChords.replace('संभाले[D]ंगे', 'संभालेंगे [D]');
        changed = true;
      }
    } else if (song.id === 1115) {
      if (updatedChords.includes('कर[D]ूँ')) {
        updatedChords = updatedChords.replace('कर[D]ूँ', 'करूँ [D]');
        changed = true;
      }
    } else if (song.id === 1117) {
      if (updatedChords.includes('करू[G]ंगा')) {
        updatedChords = updatedChords.replace('करू[G]ंगा', 'करूंगा [G]');
        changed = true;
      }
    } else if (song.id === 1122) {
      if (updatedChords.includes('गाये[C]ंगे')) {
        updatedChords = updatedChords.replace('गाये[C]ंगे', 'गायेंगे [C]');
        changed = true;
      }
      if (updatedChords.includes('जाये[C]ंगे')) {
        updatedChords = updatedChords.replace('जाये[C]ंगे', 'जायेंगे [C]');
        changed = true;
      }
    }

    if (changed) {
      // Escape single quotes for SQL values
      const escapedChords = updatedChords ? updatedChords.replace(/'/g, "''") : null;
      const escapedLyrics = updatedLyrics ? updatedLyrics.replace(/'/g, "''") : null;

      let setClause = '';
      if (escapedChords && escapedLyrics) {
        setClause = `chords = '${escapedChords}', lyrics = '${escapedLyrics}'`;
      } else if (escapedChords) {
        setClause = `chords = '${escapedChords}'`;
      } else if (escapedLyrics) {
        setClause = `lyrics = '${escapedLyrics}'`;
      }

      sqlStatements.push(
        `-- ID: ${song.id} | #${song.song_number} - ${song.title} (${song.language})\nUPDATE songs SET ${setClause} WHERE id = ${song.id};`
      );
    }
  });

  const outputSql = `-- =====================================================================
-- SQL PATCH TO FIX DEVANAGARI STRAY MATRAS / CHORD PLACEMENT TYPOS
-- =====================================================================
-- Run this query in your Supabase SQL editor to apply the fixes.
-- =====================================================================

${sqlStatements.join('\n\n')}
`;

  fs.writeFileSync('apply_stray_matra_fixes.sql', outputSql);
  console.log(`\n🎉 Success! SQL script generated: apply_stray_matra_fixes.sql`);
  console.log(`Contains ${sqlStatements.length} update statements.`);
}

generateFixes();
