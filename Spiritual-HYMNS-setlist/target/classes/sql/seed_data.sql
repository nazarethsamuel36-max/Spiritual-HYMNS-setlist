-- =============================================
-- Worship Song Library — Seed Data
-- Run AFTER schema.sql
-- =============================================

USE worship_db;

-- =============================================
-- 1. Admin User
-- Password: admin123 (SHA-256 hashed)
-- SHA-256 of "admin123" = 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- =============================================
INSERT INTO users (username, email, password, role, church_name, instrument, default_key) VALUES
('admin', 'admin@worshipsongs.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'First Church', 'Guitar', 'G');

-- =============================================
-- 2. All Hashtags (unique set from all 15 occasions)
-- =============================================
INSERT INTO hashtags (name, category) VALUES
('praise', 'worship'),
('worship', 'worship'),
('adoration', 'worship'),
('thanksgiving', 'worship'),
('offertory', 'worship'),
('wedding', 'occasion'),
('love', 'emotion'),
('covenant', 'theme'),
('blessing', 'theme'),
('dedication', 'occasion'),
('protection', 'theme'),
('children', 'theme'),
('housewarming', 'occasion'),
('fellowship', 'theme'),
('prayer', 'worship'),
('devotional', 'worship'),
('intercession', 'worship'),
('christmas', 'occasion'),
('nativity', 'theme'),
('advent', 'theme'),
('joy', 'emotion'),
('funeral', 'occasion'),
('comfort', 'emotion'),
('hope', 'emotion'),
('eternallife', 'theme'),
('peace', 'emotion'),
('easter', 'occasion'),
('resurrection', 'theme'),
('cross', 'theme'),
('goodfriday', 'theme'),
('victory', 'theme'),
('youth', 'occasion'),
('contemporary', 'style'),
('upbeat', 'style'),
('harvest', 'occasion'),
('abundance', 'theme'),
('firstfruits', 'theme'),
('provision', 'theme'),
('newyear', 'occasion'),
('renewal', 'theme'),
('faith', 'theme'),
('newbeginning', 'theme'),
('watchnight', 'occasion'),
('vigil', 'theme'),
('convention', 'occasion'),
('conference', 'occasion'),
('teaching', 'theme'),
('unity', 'theme'),
('revival', 'occasion'),
('evangelism', 'theme'),
('healing', 'theme'),
('salvation', 'theme'),
('outreach', 'theme');

-- =============================================
-- 3. Fifteen Occasions with Hashtag Slugs
-- =============================================
INSERT INTO occasions (name, slug, hashtags) VALUES
('Sunday Worship', 'sunday-worship', 'praise,worship,adoration,thanksgiving,offertory'),
('Wedding', 'wedding', 'wedding,love,covenant,praise,blessing'),
('House Dedication', 'house-dedication', 'dedication,blessing,protection,praise,thanksgiving'),
('Baby Dedication', 'baby-dedication', 'dedication,children,blessing,thanksgiving,praise'),
('Housewarming', 'housewarming', 'housewarming,blessing,thanksgiving,fellowship,praise'),
('House Meeting', 'house-meeting', 'fellowship,prayer,devotional,worship,intercession'),
('Christmas', 'christmas', 'christmas,nativity,advent,praise,joy'),
('Funeral', 'funeral', 'funeral,comfort,hope,eternallife,peace'),
('Easter', 'easter', 'easter,resurrection,cross,goodfriday,victory'),
('Youth', 'youth', 'youth,contemporary,worship,upbeat,praise'),
('Harvest Festival', 'harvest-festival', 'harvest,thanksgiving,abundance,praise,firstfruits,provision'),
('New Year', 'new-year', 'newyear,hope,renewal,thanksgiving,faith,newbeginning'),
('Watchnight', 'watchnight', 'watchnight,prayer,intercession,worship,newyear,vigil'),
('Convention', 'convention', 'convention,conference,worship,praise,teaching,unity'),
('Revival Meeting', 'revival-meeting', 'revival,evangelism,healing,worship,salvation,outreach');

-- =============================================
-- 4. Five Sample English Songs with Full Chord Data
-- =============================================

-- Song 1: Amazing Grace
INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, chords, original_key, bpm, time_signature, structure, created_by, is_active) VALUES
(1, 'Amazing Grace', 'John Newton', 'John Newton', 'english',
'Amazing grace how sweet the sound\nThat saved a wretch like me\nI once was lost but now am found\nWas blind but now I see\n\nTwas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed\n\nThrough many dangers toils and snares\nI have already come\nTis grace hath brought me safe thus far\nAnd grace will lead me home\n\nWhen we have been there ten thousand years\nBright shining as the sun\nWe have no less days to sing Gods praise\nThan when we first begun',
'[G]Amazing [G7]grace how [C]sweet the [G]sound\n[G]That saved a [Em]wretch like [D]me\n[G]I once was [G7]lost but [C]now am [G]found\n[G]Was blind but [D]now I [G]see\n\n[G]Twas grace that [G7]taught my [C]heart to [G]fear\n[G]And grace my [Em]fears re[D]lieved\n[G]How precious [G7]did that [C]grace ap[G]pear\n[G]The hour I [D]first be[G]lieved\n\n[G]Through many [G7]dangers [C]toils and [G]snares\n[G]I have al[Em]ready [D]come\n[G]Tis grace hath [G7]brought me [C]safe thus [G]far\n[G]And grace will [D]lead me [G]home\n\n[G]When we have [G7]been there [C]ten thousand [G]years\n[G]Bright shining [Em]as the [D]sun\n[G]We have no [G7]less days to [C]sing Gods [G]praise\n[G]Than when we [D]first be[G]gun',
'G', 80, '3/4', 'Verse1, Verse2, Verse3, Verse4', 1, TRUE);

-- Song 2: How Great Thou Art
INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, chords, original_key, bpm, time_signature, structure, created_by, is_active) VALUES
(2, 'How Great Thou Art', 'Carl Boberg', 'Stuart K. Hine', 'english',
'O Lord my God when I in awesome wonder\nConsider all the worlds Thy hands have made\nI see the stars I hear the rolling thunder\nThy power throughout the universe displayed\n\nThen sings my soul my Saviour God to Thee\nHow great Thou art how great Thou art\nThen sings my soul my Saviour God to Thee\nHow great Thou art how great Thou art\n\nWhen through the woods and forest glades I wander\nAnd hear the birds sing sweetly in the trees\nWhen I look down from lofty mountain grandeur\nAnd hear the brook and feel the gentle breeze\n\nThen sings my soul my Saviour God to Thee\nHow great Thou art how great Thou art\nThen sings my soul my Saviour God to Thee\nHow great Thou art how great Thou art',
'[A]O Lord my [D]God when I in [A]awesome wonder\n[A]Consider [E]all the worlds Thy [A]hands have made\n[A]I see the [D]stars I hear the [A]rolling thunder\n[A]Thy power through[E]out the uni[A]verse displayed\n\n[A]Then sings my [D]soul my Saviour [A]God to Thee\n[E]How great Thou [A]art how [D]great Thou [A]art\n[A]Then sings my [D]soul my Saviour [A]God to Thee\n[E]How great Thou [A]art how [D]great Thou [A]art\n\n[A]When through the [D]woods and forest [A]glades I wander\n[A]And hear the [E]birds sing sweetly [A]in the trees\n[A]When I look [D]down from lofty [A]mountain grandeur\n[A]And hear the [E]brook and feel the [A]gentle breeze\n\n[A]Then sings my [D]soul my Saviour [A]God to Thee\n[E]How great Thou [A]art how [D]great Thou [A]art\n[A]Then sings my [D]soul my Saviour [A]God to Thee\n[E]How great Thou [A]art how [D]great Thou [A]art',
'A', 76, '4/4', 'Verse1, Chorus, Verse2, Chorus', 1, TRUE);

-- Song 3: Blessed Assurance
INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, chords, original_key, bpm, time_signature, structure, created_by, is_active) VALUES
(3, 'Blessed Assurance', 'Fanny Crosby', 'Phoebe Knapp', 'english',
'Blessed assurance Jesus is mine\nO what a foretaste of glory divine\nHeir of salvation purchase of God\nBorn of His Spirit washed in His blood\n\nThis is my story this is my song\nPraising my Saviour all the day long\nThis is my story this is my song\nPraising my Saviour all the day long\n\nPerfect submission perfect delight\nVisions of rapture now burst on my sight\nAngels descending bring from above\nEchoes of mercy whispers of love\n\nThis is my story this is my song\nPraising my Saviour all the day long\nThis is my story this is my song\nPraising my Saviour all the day long',
'[D]Blessed as[G]surance [D]Jesus is mine\n[D]O what a [E]foretaste of [A]glory divine\n[D]Heir of sal[G]vation pur[D]chase of God\n[D]Born of His [A]Spirit washed [D]in His blood\n\n[D]This is my [G]story [D]this is my song\n[D]Praising my [A]Saviour all the day [D]long\n[D]This is my [G]story [D]this is my song\n[D]Praising my [A]Saviour [A7]all the day [D]long\n\n[D]Perfect sub[G]mission [D]perfect delight\n[D]Visions of [E]rapture now [A]burst on my sight\n[D]Angels des[G]cending [D]bring from above\n[D]Echoes of [A]mercy whispers of [D]love\n\n[D]This is my [G]story [D]this is my song\n[D]Praising my [A]Saviour all the day [D]long\n[D]This is my [G]story [D]this is my song\n[D]Praising my [A]Saviour [A7]all the day [D]long',
'D', 92, '3/4', 'Verse1, Chorus, Verse2, Chorus', 1, TRUE);

-- Song 4: Great Is Thy Faithfulness
INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, chords, original_key, bpm, time_signature, structure, created_by, is_active) VALUES
(4, 'Great Is Thy Faithfulness', 'Thomas Chisholm', 'William Runyan', 'english',
'Great is Thy faithfulness O God my Father\nThere is no shadow of turning with Thee\nThou changest not Thy compassions they fail not\nAs Thou hast been Thou forever wilt be\n\nGreat is Thy faithfulness great is Thy faithfulness\nMorning by morning new mercies I see\nAll I have needed Thy hand hath provided\nGreat is Thy faithfulness Lord unto me\n\nSummer and winter and springtime and harvest\nSun moon and stars in their courses above\nJoin with all nature in manifold witness\nTo Thy great faithfulness mercy and love\n\nGreat is Thy faithfulness great is Thy faithfulness\nMorning by morning new mercies I see\nAll I have needed Thy hand hath provided\nGreat is Thy faithfulness Lord unto me',
'[C]Great is Thy [F]faithfulness [C]O God my [Am]Father\n[C]There is no [Dm]shadow of [G]turning with [C]Thee\n[C]Thou changest [F]not Thy com[C]passions they [Am]fail not\n[F]As Thou hast [C]been Thou for[G]ever wilt [C]be\n\n[C]Great is Thy [F]faithfulness [C]great is Thy [Am]faithfulness\n[F]Morning by [C]morning new [Dm]mercies I [G]see\n[C]All I have [F]needed Thy [Em]hand hath pro[Am]vided\n[F]Great is Thy [C]faithfulness [G]Lord unto [C]me\n\n[C]Summer and [F]winter and [C]springtime and [Am]harvest\n[C]Sun moon and [Dm]stars in their [G]courses a[C]bove\n[C]Join with all [F]nature in [C]manifold [Am]witness\n[F]To Thy great [C]faithfulness [G]mercy and [C]love\n\n[C]Great is Thy [F]faithfulness [C]great is Thy [Am]faithfulness\n[F]Morning by [C]morning new [Dm]mercies I [G]see\n[C]All I have [F]needed Thy [Em]hand hath pro[Am]vided\n[F]Great is Thy [C]faithfulness [G]Lord unto [C]me',
'C', 84, '3/4', 'Verse1, Chorus, Verse2, Chorus', 1, TRUE);

-- Song 5: What A Friend We Have In Jesus
INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, chords, original_key, bpm, time_signature, structure, created_by, is_active) VALUES
(5, 'What A Friend We Have In Jesus', 'Joseph Scriven', 'Charles Converse', 'english',
'What a friend we have in Jesus\nAll our sins and griefs to bear\nWhat a privilege to carry\nEverything to God in prayer\nO what peace we often forfeit\nO what needless pain we bear\nAll because we do not carry\nEverything to God in prayer\n\nHave we trials and temptations\nIs there trouble anywhere\nWe should never be discouraged\nTake it to the Lord in prayer\nCan we find a friend so faithful\nWho will all our sorrows share\nJesus knows our every weakness\nTake it to the Lord in prayer\n\nAre we weak and heavy laden\nCumbered with a load of care\nPrecious Saviour still our refuge\nTake it to the Lord in prayer\nDo thy friends despise forsake thee\nTake it to the Lord in prayer\nIn His arms He will take and shield thee\nThou wilt find a solace there',
'[G]What a friend we [C]have in [G]Jesus\n[G]All our sins and [D]griefs to bear\n[G]What a privilege [C]to [G]carry\n[G]Everything to [D]God in [G]prayer\n[G]O what peace we [C]often [G]forfeit\n[G]O what needless [D]pain we bear\n[G]All because we [C]do not [G]carry\n[G]Everything to [D]God in [G]prayer\n\n[G]Have we trials [C]and temp[G]tations\n[G]Is there trouble [D]anywhere\n[G]We should never [C]be dis[G]couraged\n[G]Take it to the [D]Lord in [G]prayer\n[G]Can we find a [C]friend so [G]faithful\n[G]Who will all our [D]sorrows share\n[G]Jesus knows our [C]every [G]weakness\n[G]Take it to the [D]Lord in [G]prayer\n\n[G]Are we weak and [C]heavy [G]laden\n[G]Cumbered with a [D]load of care\n[G]Precious Saviour [C]still our [G]refuge\n[G]Take it to the [D]Lord in [G]prayer\n[G]Do thy friends des[C]pise for[G]sake thee\n[G]Take it to the [D]Lord in prayer\n[G]In His arms He [C]will take and [G]shield thee\n[G]Thou wilt find a [D]solace [G]there',
'G', 88, '4/4', 'Verse1, Verse2, Verse3', 1, TRUE);

-- =============================================
-- 5. Link Songs to Hashtags
-- =============================================

-- Amazing Grace: praise, worship, thanksgiving
INSERT INTO song_hashtags (song_id, hashtag_id) VALUES
(1, (SELECT id FROM hashtags WHERE name = 'praise')),
(1, (SELECT id FROM hashtags WHERE name = 'worship')),
(1, (SELECT id FROM hashtags WHERE name = 'thanksgiving')),
(1, (SELECT id FROM hashtags WHERE name = 'blessing'));

-- How Great Thou Art: praise, worship, adoration
INSERT INTO song_hashtags (song_id, hashtag_id) VALUES
(2, (SELECT id FROM hashtags WHERE name = 'praise')),
(2, (SELECT id FROM hashtags WHERE name = 'worship')),
(2, (SELECT id FROM hashtags WHERE name = 'adoration'));

-- Blessed Assurance: praise, worship, joy, faith
INSERT INTO song_hashtags (song_id, hashtag_id) VALUES
(3, (SELECT id FROM hashtags WHERE name = 'praise')),
(3, (SELECT id FROM hashtags WHERE name = 'worship')),
(3, (SELECT id FROM hashtags WHERE name = 'joy')),
(3, (SELECT id FROM hashtags WHERE name = 'faith'));

-- Great Is Thy Faithfulness: praise, worship, thanksgiving, faith
INSERT INTO song_hashtags (song_id, hashtag_id) VALUES
(4, (SELECT id FROM hashtags WHERE name = 'praise')),
(4, (SELECT id FROM hashtags WHERE name = 'worship')),
(4, (SELECT id FROM hashtags WHERE name = 'thanksgiving')),
(4, (SELECT id FROM hashtags WHERE name = 'faith'));

-- What A Friend We Have In Jesus: prayer, comfort, fellowship, intercession
INSERT INTO song_hashtags (song_id, hashtag_id) VALUES
(5, (SELECT id FROM hashtags WHERE name = 'prayer')),
(5, (SELECT id FROM hashtags WHERE name = 'comfort')),
(5, (SELECT id FROM hashtags WHERE name = 'fellowship')),
(5, (SELECT id FROM hashtags WHERE name = 'intercession'));
