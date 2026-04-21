-- Ingestion script for 40 songs
USE worship_db;

-- [1] SPIRIT OF THE LIVING GOD
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (1, 'SPIRIT OF THE LIVING GOD', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Spirit of the Living God } 2', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Fall afresh on me.', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Break me, melt me, mould me,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'fill me,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Spirit of the Living God,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Fall afresh on me.', 6);


-- [2] SET MY SPIRIT FREE
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (2, 'SET MY SPIRIT FREE', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Set my spirit free that I may', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'worship Thee,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Set my spirit free that I may praise', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Thy Name,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Let all bondage go and let', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'deliverance flow,', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Set my spirit free to worship Thee.', 7);


-- [3] SWEEP OVER MY SOUL
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (3, 'SWEEP OVER MY SOUL', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Sweep over my soul (2)', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Sweet Spirit sweep over my soul,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'My rest is complete,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'As I sit at Thy feet;', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Sweet Spirit sweep over my soul.', 5);


-- [4] THE WINDOWS OF HEAVEN
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (4, 'THE WINDOWS OF HEAVEN', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'The windows of Heaven are open,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'The blessings are falling today,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'There''s joy, joy, joy in my heart,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'For Jesus makes everything right;', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I gave Him my old tattered garment,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He gave me a robe of pure white,', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''m feasting today on the Manna,', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And that''s why I''m happy today.', 8);


-- [5] BLESS THE LORD O MY SOUL
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (5, 'BLESS THE LORD O MY SOUL', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Bless the Lord, O my soul,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Magnify His wonderful Name', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'For the glory of the Lord is mine', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'forever,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jesus is ever the same;', 5);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'For the Lord has set me free,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And He''s given me liberty,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'To tell the world that Jesus is mine,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He has given me the wine to make', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'my heart rejoice.', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And oil to make my face to shine.', 6);


-- [6] GREAT IS THE LORD
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (6, 'GREAT IS THE LORD', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Great is the Lord and greatly to be', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'praised,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'In the city of our God,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'In the mountain of His holiness,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Beautiful for situation,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'the joy of the whole earth,', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Is mount Zion on the sides of the', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'north,', 8);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'The city of our great King.', 9);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'One body, one spirit, one faith,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'one Lord,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'One people, one nation, praise the', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Lord !', 4);


-- [7] I KNOW IT WAS THE BLOOD
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (7, 'I KNOW IT WAS THE BLOOD', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I know it was the Blood, I know it', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'was the Blood,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I know it was the Blood for me;', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'One day when I was lost,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He died upon the Cross,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I know it was the Blood for me.', 6);


-- [8] BURN BURN HOLY SPIRIT
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (8, 'BURN BURN HOLY SPIRIT', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Burn, burn, Holy Spirit, burn in me,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Set my heart on fire,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Fill me with the Holy Ghost,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And God''s richest desire.', 4);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Make me like the Christ of old,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Healing and raising the dead,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Give me the power that Jesus had,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Through the blood that was shed.', 4);


-- [9] HIS NAME IS WONDERFUL
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (9, 'HIS NAME IS WONDERFUL', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'His Name is Wonderful, (3)', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jesus my Lord.', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He is the Mighty King,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Master of everything', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'His Name is Wonderful,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jesus my Lord.', 6);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He''s the great Shepherd,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'The Rock of all Ages,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Almighty God is He.', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Bow down before Him,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Love and adore Him,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'His Name is Wonderful,', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jesus my Lord.', 7);


-- [10] FROM GLORY TO GLORY
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (10, 'FROM GLORY TO GLORY', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'From glory to glory He''s changing', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'me,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Changing me, changing me,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'His likeness and image to perfect', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'in me,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'The love of God shown to the world.', 6);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'For He''s changing, changing me,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'From earthly things to the heavenly,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'His likeness and image to perfect', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'in me,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'The love of God shown to the world.', 5);


-- [11] I''LL PRAISE HIS NAME
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (11, 'I''LL PRAISE HIS NAME', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ll praise His Name for evermore,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ll praise His Name for evermore,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ll praise, and praise,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'and praise and praise,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ll praise His Name for evermore.', 5);


-- [12] IT''S A LOVELY LOVELY NAME
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (12, 'IT''S A LOVELY LOVELY NAME', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'It''s a lovely, lovely, Name,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'The Name of Jesus.', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'It''s a lovely, lovely, Name', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'From heaven above.', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Dispelling the clouds of doubt and', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'fear,', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Filling the saddened heart with', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'cheer,', 8);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'It''s a lovely, lovely, Name', 9);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'The Name I love.', 10);


-- [13] IN THE NAME OF JESUS
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (13, 'IN THE NAME OF JESUS', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'In the name of Jesus,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'through the blood of Jesus,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'We have the victory,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'In the name of Jesus,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'through the blood of Jesus,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Demons will have to flee!', 6);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Who can tell what God can do?', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Who can tell of His love for you?', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'In the name of Jesus, Jesus,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'We have the victory!', 4);


-- [14] ALL OVER THE WORLD
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (14, 'ALL OVER THE WORLD', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'All over the world,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'the Spirit is moving,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'All over the world, as the prophets', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'said it would be,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'All over the world,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'there''s a mighty revelation,', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Of the glory of the Lord,', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'As the waters cover the sea.', 8);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Deep down in my heart.....', 9);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Right here in our midst.....', 10);


-- [15] REJOICE IN THE LORD
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (15, 'REJOICE IN THE LORD', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Rejoice in the Lord always', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And again I say rejoice (Repeat)', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Rejoice, rejoice,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And again I say rejoice. (Repeat)', 4);


-- [16] I''LL SAY "YES"
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (16, 'I''LL SAY "YES"', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ll say yes, yes, yes, (2)', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ll say yes Lord, (2)', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ll say yes, yes, yes.', 3);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Where He leads me, I will follow (3)', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ll go with Him, with Him,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'All the way.', 3);


-- [17] WE ARE GATHERING TOGETHER
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (17, 'WE ARE GATHERING TOGETHER', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'We are gathering together unto', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Him (2)', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Unto Him shall the gathering of', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'the people be,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'We are gathering together unto Him.', 5);


-- [18] TO BE LIKE JESUS
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (18, 'TO BE LIKE JESUS', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'To be like Jesus, to be like Jesus,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'All I ask, to be like Him', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'All thru life''s journey,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'from earth to glory,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'All I ask, to be like Him.', 5);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'To be like Jesus, to be like Jesus,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'All I ask, to be like Him,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Not in a measure but in His fullness,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'All I ask, to be like Him.', 4);


-- [19] IT''S NOT BY MIGHT
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (19, 'IT''S NOT BY MIGHT', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'It''s not by might, it''s not by power,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'But by my Spirit, saith the Lord.', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'It''s not by might, it''s not by power,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'But by my Spirit, saith the Lord.', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'This mountain shall be removed, (3)', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'By my Spirit, saith the Lord.', 6);


-- [20] I''VE FOUND A NEW WAY OF LIVING
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (20, 'I''VE FOUND A NEW WAY OF LIVING', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ve found a new way of living', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ve found a new life divine,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ve found the fruit of the Spirit,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'By abiding, abiding in the Vine.', 4);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Abiding in the Vine,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Abiding in the Vine,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Love, joy, health, peace, He has', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'made them mine,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ve found prosperity, power and', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'victory,', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Abiding, abiding in the Vine.', 7);


-- [21] WITH MY HANDS LIFTED UP
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (21, 'WITH MY HANDS LIFTED UP', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'With my hands lifted up,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And my mouth filled with praise,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'With a heart of thanksgiving,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will bless Thee, O Lord. (3)', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'With a heart of thanksgiving,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will bless Thee, O Lord.', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'We bless Thee, O Lord, (2)', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'With a heart of thanksgiving,', 8);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'We bless Thee, O Lord.', 9);


-- [22] I WILL SING OF THE MERCIES OF THE LORD
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (22, 'I WILL SING OF THE MERCIES OF THE LORD', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will sing of the mercies of the Lord', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'forever,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will sing, I will sing;', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will sing of the mercies of the Lord', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'forever,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will sing of the mercies of the Lord.', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'With my mouth will I make known,', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Thy faithfulness, Thy faithfulness,', 8);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'With my mouth will I make known,', 9);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Thy faithfulness to all generations.', 10);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, '(Repeat first four lines)', 11);


-- [23] THEREFORE THE REDEEMED OF THE LORD
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (23, 'THEREFORE THE REDEEMED OF THE LORD', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Therefore the redeemed of the Lord', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'shall return,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And come with singing unto Zion,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And everlasting joy shall be upon', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'their head.', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, '(Repeat)', 6);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'They shall obtain gladness and joy,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And sorrow and mourning shall flee', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'away,', 3);

  -- Section: VERSE 3
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 3', 3);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Therefore the redeemed of the Lord', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'shall return,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And come with singing unto Zion,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And everlasting joy shall be upon', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'their head.', 5);


-- [24] COVER ME COVER ME
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (24, 'COVER ME COVER ME', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Cover me, cover me', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Extend the border of Thy mantle', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'over me,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Because Thou art my nearest', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'kinsman', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Cover me, cover me, cover me.', 6);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Fear not, fear not', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'My daughter I will do to thee', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'All you need,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Because thou art a virtuous woman', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Fear not, fear not.', 5);


-- [25] LIFT JESUS HIGHER
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (25, 'LIFT JESUS HIGHER', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Lift Jesus higher,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Lift Jesus higher,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Lift Him up for the world to see.', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He said, if I be lifted up from the', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'earth,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will draw all men unto Me.', 6);


-- [26] HE IS THE SAME UNCHANGING JESUS
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (26, 'HE IS THE SAME UNCHANGING JESUS', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He is the same unchanging Jesus,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Unchanging Jesus, unchanging', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jesus.', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He is the same unchanging Jesus', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Now and through Eternity.', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Hallelujah.........', 6);


-- [27] JEHOVAH JIREH
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (27, 'JEHOVAH JIREH', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jehovah, Jireh, my Provider, } 2', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'His grace is sufficient for me.', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'My God shall supply all my needs', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'According to His riches in glory,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He shall give His angels charge', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'over thee;', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jehovah Jireh cares for me, for me,', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'for me,', 8);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jehovah Jireh cares for me.', 9);


-- [28] FROM THE RISING OF THE SUN
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (28, 'FROM THE RISING OF THE SUN', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'From the rising of the sun', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'To the going down of the same', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'The Lord''s name is to be praised.', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Praise ye the Lord,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Praise Him all ye servants of the', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Lord,', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Praise the name of the Lord.', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Blessed be the name of the Lord', 8);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'From this time forth,', 9);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And for evermore.', 10);


-- [29] EVERYBODY OUGHT TO KNOW
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (29, 'EVERYBODY OUGHT TO KNOW', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Everybody ought to know (3)', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Who Jesus is.', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He''s the Lily of the Valley,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He''s the Bright and Morning Star,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He''s the fairest of ten thousand,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Everybody ought to know.', 6);


-- [30] SING ALLELUJAH TO THE LORD
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (30, 'SING ALLELUJAH TO THE LORD', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Sing Allelujah to the Lord..... } 2', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Sing Allelujah, sing Allelujah', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Sing Allelujah to the Lord.', 3);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jesus has conquered sin and', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'death.....', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jesus has risen from the dead......', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jesus is seated on the throne......', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jesus is Lord of Heaven and', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'earth......', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jesus is coming back again......', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Sing Allelujah to the Lord.......', 8);


-- [31] I WILL SING UNTO THE LORD
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (31, 'I WILL SING UNTO THE LORD', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will sing unto the Lord as long as', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I live,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will sing praise to my God while', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I have my being,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'My meditation of Him shall be', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'sweet,', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will be glad, I will be glad in the', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Lord,', 8);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Bless thou the Lord, O my soul } 4', 9);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Praise ye the Lord.', 10);


-- [32] I WILL ENTER HIS GATES
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (32, 'I WILL ENTER HIS GATES', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will enter His gates with', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'thanksgiving in my heart,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will enter His courts with praise,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will say this is the day that the', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Lord has made,', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will rejoice for He has made me', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'glad.', 7);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He has made me glad (2)', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I will rejoice for He has', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'made me glad.', 3);


-- [33] COME AND PRAISE HIM
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (33, 'COME AND PRAISE HIM', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Come and praise Him,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'royal priesthood,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Come and worship, holy nation,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Worship Jesus, our Redeemer,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He is Precious, King of Glory.', 5);


-- [34] COME INTO HIS PRESENCE SINGING
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (34, 'COME INTO HIS PRESENCE SINGING', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Come into His presence singing', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Allelujah* Allelujah, Allelujah,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, '(Repeat)', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, '*Jesus is Lord.', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, '*Glory to God.', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, '*Worthy the Lamb. etc.', 6);


-- [35] BLESS THE LORD O MY SOUL
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (35, 'BLESS THE LORD O MY SOUL', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Bless the Lord, O my soul, } 2', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And all that is within me', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Bless His holy name,', 3);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'For He hath done great things,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'He hath done great things (2)', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Bless His Holy name.', 3);


-- [36] JESUS TAKE ME AS I AM
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (36, 'JESUS TAKE ME AS I AM', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Jesus take me as I am;', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I can come no other way,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Take me deeper into You,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Make my flesh-life melt away,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Make me like a precious stone', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Crystal-clear and finely-honed,', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Life of Jesus shining through', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Giving glory back to You.', 8);


-- [37] WHEN I FEEL THE TOUCH
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (37, 'WHEN I FEEL THE TOUCH', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'When I feel the touch of Your hand', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'upon my life,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'It causes me to sing a song that I', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'love you Lord,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'So from deep within, my spirit', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'singeth unto Thee,', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'You are my King, You are my God,', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And I love you Lord.', 8);


-- [38] I THANK YOU JESUS FOR YOUR LOVE TO ME
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (38, 'I THANK YOU JESUS FOR YOUR LOVE TO ME', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I thank you Jesus for Your love to me,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I thank you Jesus for Your grace', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'so free,', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I lift my voice to praise Your Name,', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ll praise you again and again', 5);

  -- Section: VERSE 2
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 2', 2);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'You''re everything,', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'You are my Lord.', 2);


-- [39] I''VE TAKEN MY HARP DOWN
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (39, 'I''VE TAKEN MY HARP DOWN', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'I''ve taken my harp down from the', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'willow tree,', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'My heart is singing the victory.', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'My past is forgiven, my home is in', 4);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'heaven.', 5);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'All sorrow has gone the glory', 6);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'has come,', 7);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'And now I am free.', 8);


-- [40] THANK YOU GOD
INSERT INTO songs (song_number, title, language, created_by, is_active, book) 
VALUES (40, 'THANK YOU GOD', 'english', 1, 1, 'prime_songbook');
SET @song_id = LAST_INSERT_ID();

  -- Section: VERSE 1
  INSERT INTO sections (song_id, type, label, section_order) 
  VALUES (@song_id, 'verse', 'VERSE 1', 1);
  SET @section_id = LAST_INSERT_ID();

    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Thank you God for sending Jesus.', 1);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Thank you, Jesus, that you came.', 2);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'Holy Spirit, won''t you tell me', 3);
    INSERT INTO song_lines (section_id, line_text, line_order) 
    VALUES (@section_id, 'More about His lovely Name.', 4);


