import java.sql.*; 
public class CheckActiveHindi { 
    public static void main(String[] args) { 
        try { 
            Class.forName("com.mysql.cj.jdbc.Driver"); 
            Connection conn = DriverManager.getConnection( 
                "jdbc:mysql://localhost:3306/worship_db?useUnicode=true&characterEncoding=UTF-8&useSSL=false", 
                "root", "root123"); 
ECHO is off.
            System.out.println("Active Hindi Songs:"); 
            System.out.println("Song # | Title                          | Lyrics | Chords"); 
            System.out.println("-------|--------------------------------|--------|-------"); 
ECHO is off.
            String sql = "SELECT song_number, title, " + 
                "CASE WHEN lyrics_original IS NULL OR lyrics_original = '' THEN 'NO' ELSE 'YES' END as has_lyrics, " + 
                "CASE WHEN chords IS NULL OR chords = '' THEN 'NO' ELSE 'YES' END as has_chords " + 
                "FROM songs WHERE language = 'hindi' AND is_active = TRUE ORDER BY song_number"; 
ECHO is off.
            PreparedStatement ps = conn.prepareStatement(sql); 
            ResultSet rs = ps.executeQuery(); 
            int count = 0, withLyrics = 0, withChords = 0; 
            while (rs.next()) { 
                count++; 
                String title = rs.getString("title"); 
                if (title.length()  title = title.substring(0, 27) + "..."; 
                System.out.printf("-30s | -6sn", 
                    rs.getInt("song_number"), title, 
                    rs.getString("has_lyrics"), rs.getString("has_chords")); 
                if (rs.getString("has_lyrics").equals("YES")) withLyrics++; 
                if (rs.getString("has_chords").equals("YES")) withChords++; 
            } 
ECHO is off.
            System.out.println(); 
            System.out.println("Summary:"); 
            System.out.println("Total active Hindi songs: " + count); 
            System.out.println("Songs with lyrics: " + withLyrics); 
            System.out.println("Songs with chords: " + withChords); 
ECHO is off.
            conn.close(); 
        } catch (Exception e) { 
            System.err.println("Error: " + e.getMessage()); 
            e.printStackTrace(); 
        } 
    } 
} 
