const fs = require('fs');

const jsonPath = 'd:/worship-song-library/extracted_songs/all_songs.json';
const sqlPath = 'd:/worship-song-library/extracted_songs/ingest_songs.sql';

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let sql = '-- Ingestion script for 40 songs\nUSE worship_db;\n\n';

data.forEach((song) => {
    // Escape single quotes in title
    const safeTitle = song.title.replace(/'/g, "''");
    
    sql += `-- [${song.number}] ${safeTitle}\n`;
    sql += `INSERT INTO songs (song_number, title, language, created_by, is_active, book) \n`;
    sql += `VALUES (${song.number}, '${safeTitle}', 'english', 1, 1, 'prime_songbook');\n`;
    sql += `SET @song_id = LAST_INSERT_ID();\n\n`;

    song.sections.forEach((section, sIdx) => {
        const safeLabel = section.label.replace(/'/g, "''");
        sql += `  -- Section: ${safeLabel}\n`;
        sql += `  INSERT INTO sections (song_id, type, label, section_order) \n`;
        sql += `  VALUES (@song_id, '${section.type}', '${safeLabel}', ${sIdx + 1});\n`;
        sql += `  SET @section_id = LAST_INSERT_ID();\n\n`;

        section.lines.forEach((line, lIdx) => {
            const safeLine = line.replace(/'/g, "''");
            sql += `    INSERT INTO song_lines (section_id, line_text, line_order) \n`;
            sql += `    VALUES (@section_id, '${safeLine}', ${lIdx + 1});\n`;
        });
        sql += `\n`;
    });
    sql += `\n`;
});

fs.writeFileSync(sqlPath, sql);
console.log(`Generated SQL script: ${sqlPath}`);
