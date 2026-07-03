@echo off
echo Checking Song #1 (Marathi) for lyrics and chords...
echo.

echo import java.sql.*; > CheckSong1.java
echo public class CheckSong1 { >> CheckSong1.java
echo     public static void main(String[] args) { >> CheckSong1.java
echo         try { >> CheckSong1.java
echo             Class.forName("com.mysql.cj.jdbc.Driver"); >> CheckSong1.java
echo             Connection conn = DriverManager.getConnection( >> CheckSong1.java
echo                 "jdbc:mysql://localhost:3306/worship_db?useUnicode=true&characterEncoding=UTF-8&useSSL=false", >> CheckSong1.java
echo                 "root", "root123"); >> CheckSong1.java
echo             >> CheckSong1.java
echo             String sql = "SELECT song_number, title, language, " + >> CheckSong1.java
echo                 "CASE WHEN lyrics_original IS NULL OR lyrics_original = '' THEN 'NO' ELSE 'YES' END as has_lyrics_orig, " + >> CheckSong1.java
echo                 "CASE WHEN lyrics_roman IS NULL OR lyrics_roman = '' THEN 'NO' ELSE 'YES' END as has_lyrics_roman, " + >> CheckSong1.java
echo                 "CASE WHEN chords IS NULL OR chords = '' THEN 'NO' ELSE 'YES' END as has_chords, " + >> CheckSong1.java
echo                 "is_active, " + >> CheckSong1.java
echo                 "LENGTH(lyrics_original) as lyrics_orig_len, " + >> CheckSong1.java
echo                 "LENGTH(chords) as chords_len " + >> CheckSong1.java
echo                 "FROM songs WHERE song_number = 1 AND language = 'marathi'"; >> CheckSong1.java
echo             >> CheckSong1.java
echo             PreparedStatement ps = conn.prepareStatement(sql); >> CheckSong1.java
echo             ResultSet rs = ps.executeQuery(); >> CheckSong1.java
echo             if (rs.next()) { >> CheckSong1.java
echo                 System.out.println("Song Number: " + rs.getInt("song_number")); >> CheckSong1.java
echo                 System.out.println("Title: " + rs.getString("title")); >> CheckSong1.java
echo                 System.out.println("Language: " + rs.getString("language")); >> CheckSong1.java
echo                 System.out.println("Active: " + rs.getBoolean("is_active")); >> CheckSong1.java
echo                 System.out.println("Has Lyrics (Original): " + rs.getString("has_lyrics_orig")); >> CheckSong1.java
echo                 System.out.println("Has Lyrics (Roman): " + rs.getString("has_lyrics_roman")); >> CheckSong1.java
echo                 System.out.println("Has Chords: " + rs.getString("has_chords")); >> CheckSong1.java
echo                 System.out.println("Lyrics Original Length: " + rs.getInt("lyrics_orig_len")); >> CheckSong1.java
echo                 System.out.println("Chords Length: " + rs.getInt("chords_len")); >> CheckSong1.java
echo             } else { >> CheckSong1.java
echo                 System.out.println("Song #1 (Marathi) not found in database."); >> CheckSong1.java
echo             } >> CheckSong1.java
echo             conn.close(); >> CheckSong1.java
echo         } catch (Exception e) { >> CheckSong1.java
echo             System.err.println("Error: " + e.getMessage()); >> CheckSong1.java
echo             e.printStackTrace(); >> CheckSong1.java
echo         } >> CheckSong1.java
echo     } >> CheckSong1.java
echo } >> CheckSong1.java

javac -cp "Spiritual-HYMNS-setlist\target\worship-song-library-1.0-SNAPSHOT\WEB-INF\lib\mysql-connector-j-8.3.0.jar" CheckSong1.java 2>&1
if errorlevel 1 (
    echo Compilation failed.
    pause
    exit /b 1
)

java -cp ".;Spiritual-HYMNS-setlist\target\worship-song-library-1.0-SNAPSHOT\WEB-INF\lib\mysql-connector-j-8.3.0.jar" CheckSong1

del CheckSong1.java CheckSong1.class 2>nul
pause
