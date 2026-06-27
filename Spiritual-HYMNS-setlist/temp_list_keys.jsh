import com.worship.dao.SongDAO;
import com.worship.model.Song;
SongDAO dao = new SongDAO();
java.util.List<Song> songs = dao.getAllSongs();
for (int i = 0; i < Math.min(20, songs.size()); i++) {
    Song s = songs.get(i);
    System.out.println((i + 1) + ": #" + s.getSongNumber() + " " + s.getTitle() + " => " + s.getOriginalKey());
}
