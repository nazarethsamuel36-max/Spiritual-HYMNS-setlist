@echo off
echo ========================================
echo Checking Active Hindi Songs in MySQL
echo ========================================
echo.

REM Create a simple Java file that uses JDBC directly
echo import java.sql.*; > CheckActiveHindi.java
echo public class CheckActiveHindi { >> CheckActiveHindi.java
echo     public static void main(String[] args) { >> CheckActiveHindi.java
echo         try { >> CheckActiveHindi.java
echo             Class.forName("com.mysql.cj.jdbc.Driver"); >> CheckActiveHindi.java
echo             Connection conn = DriverManager.getConnection( >> CheckActiveHindi.java
echo                 "jdbc:mysql://localhost:3306/worship_db?useUnicode=true&characterEncoding=UTF-8&useSSL=false", >> CheckActiveHindi.java
echo                 "root", "root123"); >> CheckActiveHindi.java
echo             >> CheckActiveHindi.java
echo             System.out.println("Active Hindi Songs:"); >> CheckActiveHindi.java
echo             System.out.println("Song # | Title                          | Lyrics | Chords"); >> CheckActiveHindi.java
echo             System.out.println("-------|--------------------------------|--------|-------"); >> CheckActiveHindi.java
echo             >> CheckActiveHindi.java
echo             String sql = "SELECT song_number, title, " + >> CheckActiveHindi.java
echo                 "CASE WHEN lyrics_original IS NULL OR lyrics_original = '' THEN 'NO' ELSE 'YES' END as has_lyrics, " + >> CheckActiveHindi.java
echo                 "CASE WHEN chords IS NULL OR chords = '' THEN 'NO' ELSE 'YES' END as has_chords " + >> CheckActiveHindi.java
echo                 "FROM songs WHERE language = 'hindi' AND is_active = TRUE ORDER BY song_number"; >> CheckActiveHindi.java
echo             >> CheckActiveHindi.java
echo             PreparedStatement ps = conn.prepareStatement(sql); >> CheckActiveHindi.java
echo             ResultSet rs = ps.executeQuery(); >> CheckActiveHindi.java
echo             int count = 0, withLyrics = 0, withChords = 0; >> CheckActiveHindi.java
echo             while (rs.next()) { >> CheckActiveHindi.java
echo                 count++; >> CheckActiveHindi.java
echo                 String title = rs.getString("title"); >> CheckActiveHindi.java
echo                 if (title.length() > 30) title = title.substring(0, 27) + "..."; >> CheckActiveHindi.java
echo                 System.out.printf("%-6d | %-30s | %-6s | %-6s%n", >> CheckActiveHindi.java
echo                     rs.getInt("song_number"), title, >> CheckActiveHindi.java
echo                     rs.getString("has_lyrics"), rs.getString("has_chords")); >> CheckActiveHindi.java
echo                 if (rs.getString("has_lyrics").equals("YES")) withLyrics++; >> CheckActiveHindi.java
echo                 if (rs.getString("has_chords").equals("YES")) withChords++; >> CheckActiveHindi.java
echo             } >> CheckActiveHindi.java
echo             >> CheckActiveHindi.java
echo             System.out.println(); >> CheckActiveHindi.java
echo             System.out.println("Summary:"); >> CheckActiveHindi.java
echo             System.out.println("Total active Hindi songs: " + count); >> CheckActiveHindi.java
echo             System.out.println("Songs with lyrics: " + withLyrics); >> CheckActiveHindi.java
echo             System.out.println("Songs with chords: " + withChords); >> CheckActiveHindi.java
echo             >> CheckActiveHindi.java
echo             conn.close(); >> CheckActiveHindi.java
echo         } catch (Exception e) { >> CheckActiveHindi.java
echo             System.err.println("Error: " + e.getMessage()); >> CheckActiveHindi.java
echo             e.printStackTrace(); >> CheckActiveHindi.java
echo         } >> CheckActiveHindi.java
echo     } >> CheckActiveHindi.java
echo } >> CheckActiveHindi.java

echo Compiling...
javac -cp "Spiritual-HYMNS-setlist\target\worship-song-library-1.0-SNAPSHOT\WEB-INF\lib\mysql-connector-j-8.3.0.jar" CheckActiveHindi.java 2>&1
if errorlevel 1 (
    echo.
    echo Compilation failed.
    pause
    exit /b 1
)

echo.
echo Running...
java -cp ".;Spiritual-HYMNS-setlist\target\worship-song-library-1.0-SNAPSHOT\WEB-INF\lib\mysql-connector-j-8.3.0.jar" CheckActiveHindi

echo.
echo Cleaning up...
del CheckActiveHindi.java CheckActiveHindi.class 2>nul

pause
