import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class QueryFirst20Keys {
    public static void main(String[] args) throws Exception {
        String url = System.getenv("DB_URL");
        String user = System.getenv("DB_USER");
        String pass = System.getenv("DB_PASSWORD");
        if (url == null || url.isEmpty()) {
            url = "jdbc:mysql://localhost:3306/worship_db?useUnicode=true&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
            user = "root";
            pass = "root123";
        }
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            String sql = "SELECT song_number, title, original_key FROM songs WHERE book != 'raw_songbook' AND is_active = TRUE AND song_number > 0 ORDER BY song_number, title LIMIT 20";
            try (PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
                int i = 1;
                while (rs.next()) {
                    System.out.printf("%02d: %s | %s | %s%n", i++, rs.getString("song_number"), rs.getString("title"), rs.getString("original_key"));
                }
            }
        }
    }
}
