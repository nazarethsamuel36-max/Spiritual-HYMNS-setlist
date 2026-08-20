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

// Unicode ranges for Devanagari
const IS_CONSONANT = /[\u0915-\u0939\u0958-\u095F]/;
const IS_INDEPENDENT_VOWEL = /[\u0904-\u0914\u0960-\u0961\u0972]/;
const IS_VOWEL_SIGN = /[\u093E-\u094C\u094E-\u094F\u0955-\u0957]/; // matras like ा, ि, ी, ु, ू, ृ, े, ै, ो, ौ
const IS_DIACRITIC = /[\u0901-\u0903]/; // ँ, ं, ः (Chandrabindu, Anusvara, Visarga)
const IS_NUKTA = /\u093C/; // ़
const IS_VIRAMA = /\u094D/; // ्
const IS_COMBINING_MARK = /[ँंःािीुूृॄॅॆेैॉॊोौ़्]/;

function findStrayMatrasInText(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const anomalies = [];

  lines.forEach((line, lineIndex) => {
    // Skip chord markers or comments if they are not Devanagari
    if (line.trim().startsWith('{') || line.trim().startsWith('#')) return;

    for (let idx = 0; idx < line.length; idx++) {
      const char = line[idx];

      // Check if it's a combining mark (matra/diacritic)
      if (IS_COMBINING_MARK.test(char)) {
        let isStray = false;
        let reason = '';

        if (idx === 0) {
          isStray = true;
          reason = `Stray mark '${char}' starts the line without a consonant`;
        } else {
          const prev = line[idx - 1];

          if (IS_INDEPENDENT_VOWEL.test(prev)) {
            // Independent vowels (अ, आ, इ, ई, उ, ऊ, ए, ऐ, ओ, औ) CAN take diacritics (ँ, ं, ः) like in 'अंधेरा', 'ऊँचा', 'आँख'
            // But they CANNOT take vowel signs (matras like ा, ि, ी, ु, ू, ृ, े, ै, ो, ौ) or virama (्) or nukta (़)
            if (!IS_DIACRITIC.test(char)) {
              isStray = true;
              reason = `Malformed vowel spelling: Matra '${char}' placed directly on independent vowel '${prev}' (e.g. typing error like 'एे')`;
            }
          } else if (/\s/.test(prev)) {
            isStray = true;
            reason = `Stray mark '${char}' preceded by a space`;
          } else if (/[\[\](){},.:;!?\-"'।॥0-9a-zA-Z]/.test(prev)) {
            isStray = true;
            reason = `Stray mark '${char}' preceded by non-Devanagari or punctuation character '${prev}'`;
          } else if (IS_COMBINING_MARK.test(prev)) {
            // Combining mark following another combining mark
            if (IS_VOWEL_SIGN.test(char) && IS_VOWEL_SIGN.test(prev)) {
              isStray = true;
              reason = `Double vowel matras: '${prev}' followed by '${char}' (invalid combination)`;
            } else if (IS_VIRAMA.test(prev)) {
              isStray = true;
              reason = `Mark '${char}' following virama/halant '${prev}'`;
            } else if (IS_DIACRITIC.test(prev) && !IS_NUKTA.test(char)) {
              isStray = true;
              reason = `Combining mark '${char}' placed after diacritic/modifier '${prev}'`;
            }
          } else if (!IS_CONSONANT.test(prev)) {
            isStray = true;
            reason = `Stray mark '${char}' following invalid character '${prev}'`;
          }
        }

        if (isStray) {
          // Get some context (8 chars before and after)
          const start = Math.max(0, idx - 8);
          const end = Math.min(line.length, idx + 9);
          const context = line.substring(start, end);
          
          anomalies.push({
            lineNumber: lineIndex + 1,
            charIndex: idx,
            char,
            context,
            reason
          });
        }
      }
    }
  });

  return anomalies;
}

async function runAudit() {
  console.log('📡 Fetching songs from database...');
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, title, song_number, language, chords, lyrics')
    .order('id');

  if (error) {
    console.error('❌ Error fetching songs:', error);
    process.exit(1);
  }

  console.log(`🔍 Auditing ${songs.length} songs for stray Devanagari matras (excluding valid independent vowel diacritics)...`);
  const report = [];
  let totalAnomalies = 0;

  for (const song of songs) {
    const chordAnomalies = findStrayMatrasInText(song.chords);
    const lyricAnomalies = findStrayMatrasInText(song.lyrics);

    if (chordAnomalies.length > 0 || lyricAnomalies.length > 0) {
      const songRef = `#${song.song_number} - ${song.title} (${song.language})`;
      report.push(`### 🎵 ${songRef} (ID: ${song.id})`);
      
      if (chordAnomalies.length > 0) {
        report.push('#### Chords Column:');
        chordAnomalies.forEach(a => {
          report.push(`- **Line ${a.lineNumber}**: \`${a.context}\` (Index: ${a.charIndex}) — *${a.reason}*`);
          totalAnomalies++;
        });
      }

      if (lyricAnomalies.length > 0) {
        report.push('#### Lyrics Column:');
        lyricAnomalies.forEach(a => {
          report.push(`- **Line ${a.lineNumber}**: \`${a.context}\` (Index: ${a.charIndex}) — *${a.reason}*`);
          totalAnomalies++;
        });
      }
      report.push('\n');
    }
  }

  const outputFilename = 'stray_matra_audit_report.md';
  const header = `# Devanagari Stray Matra Audit Report\n\nGenerated on: ${new Date().toLocaleString()}\nTotal Malformed/Stray Matras Found: **${totalAnomalies}**\n\n`;
  
  fs.writeFileSync(outputFilename, header + report.join('\n'));
  console.log(`\n🎉 Audit Complete! Found ${totalAnomalies} anomalies across affected songs.`);
  console.log(`📝 Detailed report written to: ${outputFilename}`);
}

runAudit();
