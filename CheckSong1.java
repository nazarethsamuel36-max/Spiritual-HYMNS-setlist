import java.sql.*; 
public class CheckSong1 { 
    public static void main(String[] args) { 
        try { 
            Class.forName("com.mysql.cj.jdbc.Driver"); 
            Connection conn = DriverManager.getConnection( 
                "jdbc:mysql://localhost:3306/worship_db?useUnicode=true&characterEncoding=UTF-8&useSSL=false", 
                "root", "root123"); 
ECHO is off.
            String sql = "SELECT song_number, title, language, " + 
                "CASE WHEN lyrics_original IS NULL OR lyrics_original = '' THEN 'NO' ELSE 'YES' END as has_lyrics_orig, " + 
                "CASE WHEN lyrics_roman IS NULL OR lyrics_roman = '' THEN 'NO' ELSE 'YES' END as has_lyrics_roman, " + 
                "CASE WHEN chords IS NULL OR chords = '' THEN 'NO' ELSE 'YES' END as has_chords, " + 
                "is_active, " + 
                "LENGTH(lyrics_original) as lyrics_orig_len, " + 
                "LENGTH(chords) as chords_len " + 
                "FROM songs WHERE song_number = 1 AND language = 'marathi'"; 
ECHO is off.
            PreparedStatement ps = conn.prepareStatement(sql); 
            ResultSet rs = ps.executeQuery(); 
            if (rs.next()) { 
                System.out.println("Song Number: " + rs.getInt("song_number")); 
                System.out.println("Title: " + rs.getString("title")); 
                System.out.println("Language: " + rs.getString("language")); 
                System.out.println("Active: " + rs.getBoolean("is_active")); 
                System.out.println("Has Lyrics (Original): " + rs.getString("has_lyrics_orig")); 
                System.out.println("Has Lyrics (Roman): " + rs.getString("has_lyrics_roman")); 
                System.out.println("Has Chords: " + rs.getString("has_chords")); 
                System.out.println("Lyrics Original Length: " + rs.getInt("lyrics_orig_len")); 
                System.out.println("Chords Length: " + rs.getInt("chords_len")); 
            } else { 
                System.out.println("Song #1 (Marathi) not found in database."); 
            } 
            conn.close(); 
        } catch (Exception e) { 
            System.err.println("Error: " + e.getMessage()); 
            e.printStackTrace(); 
        } 
    } 
} 
