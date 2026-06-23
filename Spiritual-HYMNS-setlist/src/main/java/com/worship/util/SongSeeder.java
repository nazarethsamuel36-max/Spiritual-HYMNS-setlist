package com.worship.util;

import com.worship.dao.SongDAO;
import com.worship.model.Song;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SongSeeder {

    public static void main(String[] args) {
        System.out.println("Starting to seed 10 premium English worship songs...");
        SongDAO songDAO = new SongDAO();
        Map<String, Integer> hashtagMap = loadHashtags();

        // 1. 10,000 Reasons
        seedSong(songDAO, hashtagMap, 
            6, "10,000 Reasons (Bless The Lord)", "Matt Redman", "Matt Redman, Jonas Myrin", "english", "G", 73, "4/4", "Chorus, Verse1, Chorus, Verse2, Chorus, Verse3, Chorus",
            "Bless the Lord O my soul\nO my soul\nWorship His holy name\nSing like never before\nO my soul\nI'll worship Your holy name\n\nThe sun comes up it's a new day dawning\nIt's time to sing Your song again\nWhatever may pass and whatever lies before me\nLet me be singing when the evening comes",
            "[C]Bless the [G]Lord O my [D]soul\n[Em]O [C]my [G]soul\n[C]Worship His [G]holy [D]name\n[C]Sing like [Em]never be[C]fore [D] \n[Em]O [C]my [G]soul\nI'll [C]worship Your [D]holy [G]name\n\nThe [C]sun comes [G]up it's a [D]new day [Em]dawning\n[C]It's time to [G]sing Your [D]song a[Em]gain\nWhat[C]ever may [G]pass and what[D]ever lies be[Em]fore me\n[C]Let me be [G]singing when the [D]evening [G]comes",
            Arrays.asList("praise", "worship", "adoration", "thanksgiving")
        );

        // 2. In Christ Alone
        seedSong(songDAO, hashtagMap, 
            7, "In Christ Alone", "Keith & Kristyn Getty", "Keith Getty, Stuart Townend", "english", "D", 68, "3/4", "Verse1, Verse2, Verse3, Verse4",
            "In Christ alone my hope is found\nHe is my light my strength my song\nThis Cornerstone this solid Ground\nFirm through the fiercest drought and storm\nWhat heights of love what depths of peace\nWhen fears are stilled when strivings cease\nMy Comforter my All in All\nHere in the love of Christ I stand",
            "In [G]Christ [D]alone my [G]hope [A]is [D]found\n[G]He is my [D/F#]light my [Em]strength [A]my [D]song\nThis [G]Cor[D]nerstone this [G]so[A]lid [D]Ground\n[G]Firm through the [D/F#]fiercest [Em]drought [A]and [D]storm\nWhat [G]heights of [D/F#]love what [G]depths of [A]peace\nWhen [G]fears are [D/F#]stilled when [G]strivings [A]cease\nMy [G]Com[D]forter my [G]All [A]in [D]All\n[G]Here in the [D/F#]love of [Em]Christ [A]I [D]stand",
            Arrays.asList("hope", "faith", "worship", "resurrection")
        );

        // 3. Oceans (Where Feet May Fail)
        seedSong(songDAO, hashtagMap, 
            8, "Oceans (Where Feet May Fail)", "Hillsong UNITED", "Matt Crocker, Joel Houston, Salomon Ligthelm", "english", "D", 70, "4/4", "Verse1, Chorus, Verse2, Chorus, Bridge",
            "You call me out upon the waters\nThe great unknown where feet may fail\nAnd there I find You in the mystery\nIn oceans deep my faith will stand\n\nAnd I will call upon Your name\nAnd keep my eyes above the waves\nWhen oceans rise My soul will rest in Your embrace\nFor I am Yours and You are mine",
            "You [Bm]call me out up[A/C#]on the [D]waters\nThe great un[A]known where feet may [G]fail\nAnd [Bm]there I find You [A/C#]in the [D]mystery\nIn oceans [A]deep my faith will [G]stand\n\n[G]And I will [D]call upon Your [A]name\n[G]And keep my [D]eyes above the [A]waves\nWhen oceans [G]rise My soul will [D]rest in Your em[A]brace\nFor I am [G]Yours and [A]You are [Bm]mine",
            Arrays.asList("worship", "faith", "devotional")
        );

        // 4. Goodness of God
        seedSong(songDAO, hashtagMap, 
            9, "Goodness of God", "Bethel Music", "Ed Cash, Ben Fielding, Jason Ingram, Brian Johnson, Jenn Johnson", "english", "G", 63, "4/4", "Verse1, Chorus, Verse2, Chorus, Bridge, Chorus",
            "I love You Lord\nOh Your mercy never fails me\nAll my days\nI've been held in Your hands\nFrom the moment that I wake up\nUntil I lay my head\nI will sing of the goodness of God\n\nAll my life You have been faithful\nAll my life You have been so so good\nWith every breath that I am able\nI will sing of the goodness of God",
            "I love You [G]Lord\nOh Your [C]mercy never [G]fails me\nAll my [D/F#]days [Em]\nI've been [C]held in Your [D]hands\nFrom the [Em]moment that I [C]wake up\nUn[G]til I [D/F#]lay my [Em]head\nI will [C]sing of the [D]goodness of [G]God\n\n[C]All my life You have been [G]faithful\n[C]All my life You have been [G]so so [D]good\n[C]With every breath that I am [G]a[D/F#]ble [Em]\nI will [C]sing of the [D]goodness of [G]God",
            Arrays.asList("praise", "thanksgiving", "worship", "love")
        );

        // 5. Way Maker
        seedSong(songDAO, hashtagMap, 
            10, "Way Maker", "Sinach", "Osinachi Kalu Okoro Egbu", "english", "B", 68, "4/4", "Verse1, Chorus, Verse2, Chorus",
            "You are here moving in our midst\nI worship You I worship You\nYou are here working in this place\nI worship You I worship You\n\nWay Maker Miracle Worker Promise Keeper\nLight in the darkness my God that is who You are\nWay Maker Miracle Worker Promise Keeper\nLight in the darkness my God that is who You are",
            "You are [E]here moving in our [B]midst\nI worship [F#]You I worship [G#m]You\nYou are [E]here working in this [B]place\nI worship [F#]You I worship [G#m]You\n\n[E]Way Maker Miracle Worker [B]Promise Keeper\nLight in the darkness my [F#]God that is who You [G#m]are\n[E]Way Maker Miracle Worker [B]Promise Keeper\nLight in the darkness my [F#]God that is who You [G#m]are",
            Arrays.asList("praise", "worship", "healing", "hope")
        );

        // 6. What A Beautiful Name
        seedSong(songDAO, hashtagMap, 
            11, "What A Beautiful Name", "Hillsong Worship", "Ben Fielding, Brooke Ligertwood", "english", "D", 68, "4/4", "Verse1, Chorus, Verse2, Chorus, Bridge",
            "You were the Word at the beginning\nOne with God the Lord Most High\nYour hidden glory in creation\nNow revealed in You our Christ\n\nWhat a beautiful Name it is\nWhat a beautiful Name it is\nThe Name of Jesus Christ my King\nWhat a beautiful Name it is\nNothing compares to this\nWhat a beautiful Name it is\nThe Name of Jesus",
            "You were the [D]Word at the beginning\nOne with [G]God the [Bm]Lord Most [A]High\nYour hidden [Bm]glory [A/C#]in cre[D]ation\nNow re[G]vealed in [Bm]You our [A]Christ\n\nWhat a beautiful [D]Name it is\nWhat a beautiful [A]Name it is\nThe Name of [Bm]Jesus [A]Christ my [G]King\nWhat a beautiful [D/F#]Name it is\n[A]Nothing compares to this\nWhat a beautiful [Bm]Name it is [A]\nThe Name of [G]Jesus",
            Arrays.asList("worship", "adoration", "praise", "easter")
        );

        // 7. Revelation Song
        seedSong(songDAO, hashtagMap, 
            12, "Revelation Song", "Gateway Worship", "Jennie Lee Riddle", "english", "D", 60, "4/4", "Verse1, Chorus, Verse2, Chorus",
            "Worthy is the Lamb Who was slain\nHoly holy is He\nSing a new song to Him Who sits on\nHeaven's mercy seat\n\nHoly holy holy\nIs the Lord God Almighty\nWho was and is and is to come\nWith all creation I sing\nPraise to the King of kings\nYou are my everything\nAnd I will adore You",
            "[D]Worthy is the [Am]Lamb Who was slain\n[C]Holy holy is [G]He\n[D]Sing a new song [Am]to Him Who sits on\n[C]Heaven's mercy [G]seat\n\n[D]Holy holy holy\n[Am]Is the Lord God Almighty\n[C]Who was and is and is to [G]come\n[D]With all creation I sing\n[Am]Praise to the King of kings\n[C]You are my everything\nAnd [G]I will adore You",
            Arrays.asList("worship", "adoration", "praise")
        );

        // 8. Cornerstone
        seedSong(songDAO, hashtagMap, 
            13, "Cornerstone", "Hillsong Worship", "Edward Mote, Eric Liljero, Jonas Myrin, Reuben Morgan", "english", "C", 71, "4/4", "Verse1, Chorus, Verse2, Chorus, Verse3",
            "My hope is built on nothing less\nThan Jesus blood and righteousness\nI dare not trust the sweetest frame\nBut wholly trust in Jesus Name\n\nChrist alone cornerstone\nWeak made strong in the Saviour's love\nThrough the storm He is Lord\nLord of all",
            "My [C]hope is built on nothing less\n[F]Than Jesus blood and [G]righteousness\nI [Am]dare not trust the [Am/G]sweetest frame\n[F]But wholly [G]trust in Jesus [C]Name\n\n[C/E]Christ a[F]lone [Am]corner[G]stone\n[C/E]Weak made [F]strong in the [Am]Saviour's [G]love\nThrough the [C]storm He is [F]Lord\n[Am]Lord of [G]all [C]",
            Arrays.asList("hope", "faith", "worship", "cross")
        );

        // 9. Mighty To Save
        seedSong(songDAO, hashtagMap, 
            14, "Mighty To Save", "Hillsong Worship", "Ben Fielding, Reuben Morgan", "english", "A", 69, "4/4", "Verse1, Chorus, Verse2, Chorus",
            "Everyone needs compassion\nLove that's never failing\nLet mercy fall on me\nEveryone needs forgiveness\nThe kindness of a Saviour\nThe hope of nations\n\nSaviour He can move the mountains\nMy God is mighty to save\nHe is mighty to save\nForever Author of salvation\nHe rose and conquered the grave\nJesus conquered the grave",
            "[D]Everyone needs com[A]passion\nLove that's never [F#m]failing\nLet [E]mercy fall on [D]me\n[D]Everyone needs for[A]giveness\nThe kindness of a [F#m]Saviour\nThe [E]hope of nations [D] [E] [D] [E]\n\n[A]Saviour He can move the [E]mountains\nMy God is [D]mighty to save [A]\nHe is [F#m]mighty to save [E]\nFor[A]ever Author of sal[E]vation\nHe rose and [D]conquered the grave [A]\nJesus [F#m]conquered the grave [E]",
            Arrays.asList("praise", "salvation", "easter", "hope")
        );

        // 10. Here I Am To Worship
        seedSong(songDAO, hashtagMap, 
            15, "Here I Am To Worship", "Tim Hughes", "Tim Hughes", "english", "E", 72, "4/4", "Verse1, Chorus, Verse2, Chorus, Bridge",
            "Light of the world\nYou stepped down into darkness\nOpened my eyes let me see\nBeauty that made\nThis heart adore You\nHope of a life spent with You\n\nSo here I am to worship\nHere I am to bow down\nHere I am to say that You're my God\nAnd You're altogether lovely\nAltogether worthy\nAltogether wonderful to me",
            "[E]Light of the [B]world\nYou stepped [F#m]down into darkness\n[E]Opened my [B]eyes let me [A]see\n[E]Beauty that [B]made\nThis [F#m]heart adore You\n[E]Hope of a [B]life spent with [A]You\n\nSo here I am to [E]worship\nHere I am to [B/D#]bow down\nHere I am to [E/G#]say that You're my [A]God\nAnd You're altogether [E]lovely\nAltogether [B/D#]worthy\nAltogether [E/G#]wonderful to [A]me",
            Arrays.asList("worship", "adoration", "praise", "christmas")
        );

        System.out.println("Finished seeding 10 English worship songs.");
    }

    private static void seedSong(SongDAO dao, Map<String, Integer> hashtagMap, int number, String title, String artist, String composer, String lang, String key, int bpm, String sig, String structure, String orig, String chords, List<String> tags) {
        // Skip if exists
        List<Song> existing = dao.searchSongs(title);
        for(Song s : existing) {
            if(s.getTitle().equalsIgnoreCase(title)) {
                System.out.println("Song already exists, skipping: " + title);
                return;
            }
        }

        Song s = new Song();
        s.setSongNumber(number);
        s.setTitle(title);
        s.setArtist(artist);
        s.setComposer(composer);
        s.setLanguage(lang);
        s.setOriginalKey(key);
        s.setBpm(bpm);
        s.setTimeSignature(sig);
        s.setStructure(structure);
        s.setLyricsOriginal(orig);
        s.setChords(chords);
        s.setCreatedBy(1); // admin

        if (dao.addSong(s)) {
            System.out.println("Inserted: " + title + " (ID: " + s.getId() + ")");
            for (String tag : tags) {
                Integer tagId = hashtagMap.get(tag.toLowerCase());
                if (tagId != null) {
                    dao.addHashtagToSong(s.getId(), tagId);
                }
            }
        } else {
            System.err.println("Failed to insert: " + title);
        }
    }

    private static Map<String, Integer> loadHashtags() {
        Map<String, Integer> map = new HashMap<>();
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM hashtags");
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                map.put(rs.getString("name"), rs.getInt("id"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return map;
    }
}
