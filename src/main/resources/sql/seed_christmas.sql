USE worship_db;

INSERT IGNORE INTO hashtags (name, category) VALUES ('christmas', 'occasion');

INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, chords, original_key, capo, bpm, time_signature, structure, created_by, is_active) VALUES
(56, 'O Come All Ye Faithful', 'Traditional', 'John F. Wade', 'english',
'[Verse 1]\nO come all ye faithful joyful and triumphant\nO come ye O come ye to Bethlehem\nCome and behold Him born the King of angels\n\n[Chorus]\nO come let us adore Him\nO come let us adore Him\nO come let us adore Him\nChrist the Lord\n\n[Verse 2]\nSing all ye citizens of heaven above\nGlory to God in the highest\nGlory to God all glory in the highest',
'[Verse 1]\n[G]O come all ye [D]faithful [G]joyful and tri[C]umphant\n[G]O come ye O [D]come ye to [G]Bethlehem\n[C]Come and be[G]hold Him [D]born the King of [G]angels\n\n[Chorus]\n[G]O come let us a[C]dore Him\n[G]O come let us a[D]dore Him\n[G]O come let us a[Em]dore Him\n[G]Christ the [D]Lord [G]\n\n[Verse 2]\n[G]Sing all ye citi[D]zens of [G]heaven a[C]bove\n[G]Glory to [D]God in the [G]highest\n[C]Glory to [G]God all [D]glory in the [G]highest',
'G', 0, 96, '4/4', 'Verse1, Chorus, Verse2, Chorus', 1, TRUE),

(57, 'O Holy Night', 'Adolphe Adam', 'Adolphe Adam', 'english',
'[Verse 1]\nO holy night the stars are brightly shining\nIt is the night of our dear Saviour''s birth\nLong lay the world in sin and error pining\nTill He appeared and the soul felt its worth\nA thrill of hope the weary world rejoices\nFor yonder breaks a new and glorious morn\n\n[Chorus]\nFall on your knees O hear the angel voices\nO night divine O night when Christ was born\nO night O holy night O night divine',
'[Verse 1]\n[C]O holy night the [F]stars are brightly [C]shining\n[C]It is the night of [G]our dear Saviour''s [C]birth\n[C]Long lay the world in [F]sin and error [C]pining\n[C]Till He appeared and [G]the soul felt its [C]worth\n[Am]A thrill of hope the [Em]weary world re[F]joices\n[C]For yonder breaks a [G]new and glorious [C]morn\n\n[Chorus]\n[F]Fall on your knees O [C]hear the angel [G]voices\n[C]O night divine O [G]night when Christ was [Am]born\n[C]O night O holy [F]night O night di[C]vine [G] [C]',
'C', 0, 60, '6/8', 'Verse1, Chorus', 1, TRUE),

(58, 'Silent Night', 'Franz Gruber', 'Franz Gruber', 'english',
'[Verse 1]\nSilent night holy night\nAll is calm all is bright\nRound yon virgin mother and child\nHoly infant so tender and mild\nSleep in heavenly peace\nSleep in heavenly peace\n\n[Verse 2]\nSilent night holy night\nShepherds quake at the sight\nGlories stream from heaven afar\nHeavenly hosts sing alleluia\nChrist the Savior is born\nChrist the Savior is born\n\n[Verse 3]\nSilent night holy night\nSon of God love''s pure light\nRadiant beams from Thy holy face\nWith the dawn of redeeming grace\nJesus Lord at Thy birth\nJesus Lord at Thy birth',
'[Verse 1]\n[G]Silent night [D]holy night\n[G]All is calm [D]all is bright\n[C]Round yon virgin [G]mother and child\n[C]Holy infant so [G]tender and mild\n[D]Sleep in heavenly [G]peace\n[D]Sleep in heavenly [G]peace\n\n[Verse 2]\n[G]Silent night [D]holy night\n[G]Shepherds quake [D]at the sight\n[C]Glories stream from [G]heaven afar\n[C]Heavenly hosts sing [G]alleluia\n[D]Christ the Savior is [G]born\n[D]Christ the Savior is [G]born\n\n[Verse 3]\n[G]Silent night [D]holy night\n[G]Son of God [D]love''s pure light\n[C]Radiant beams from [G]Thy holy face\n[C]With the dawn of re[G]deeming grace\n[D]Jesus Lord at Thy [G]birth\n[D]Jesus Lord at Thy [G]birth',
'G', 0, 66, '3/4', 'Verse1, Verse2, Verse3', 1, TRUE),

(59, 'Joy To The World', 'Isaac Watts', 'Lowell Mason', 'english',
'[Verse 1]\nJoy to the world the Lord is come\nLet earth receive her King\nLet every heart prepare Him room\nAnd heaven and nature sing\nAnd heaven and nature sing\nAnd heaven and heaven and nature sing\n\n[Verse 2]\nJoy to the world the Savior reigns\nLet men their songs employ\nWhile fields and floods rocks hills and plains\nRepeat the sounding joy\nRepeat the sounding joy\nRepeat repeat the sounding joy\n\n[Verse 3]\nHe rules the world with truth and grace\nAnd makes the nations prove\nThe glories of His righteousness\nAnd wonders of His love\nAnd wonders of His love\nAnd wonders wonders of His love',
'[Verse 1]\n[D]Joy to the world the [A]Lord is [D]come\nLet [G]earth re[D]ceive her [A]King\n[D]Let every heart pre[G]pare Him room\nAnd [D]heaven and nature [A]sing And heaven and nature [D]sing\nAnd [G]heaven and [D]heaven and na[A]ture [D]sing\n\n[Verse 2]\n[D]Joy to the world the [A]Savior [D]reigns\nLet [G]men their [D]songs em[A]ploy\n[D]While fields and floods rocks [G]hills and plains\nRe[D]peat the sounding [A]joy Re[D]peat the sounding joy\nRe[G]peat re[D]peat the sound[A]ing [D]joy\n\n[Verse 3]\n[D]He rules the world with [A]truth and [D]grace\nAnd [G]makes the [D]nations [A]prove\n[D]The glories of His [G]righteousness\nAnd [D]wonders of His [A]love And wonders of His [D]love\nAnd [G]wonders [D]wonders of His [A]love [D]',
'D', 0, 120, '2/2', 'Verse1, Verse2, Verse3', 1, TRUE),

(60, 'Hark The Herald Angels Sing', 'Charles Wesley', 'Felix Mendelssohn', 'english',
'[Verse 1]\nHark the herald angels sing glory to the newborn King\nPeace on earth and mercy mild God and sinners reconciled\nJoyful all ye nations rise join the triumph of the skies\nWith the angelic host proclaim Christ is born in Bethlehem\n\n[Chorus]\nHark the herald angels sing glory to the newborn King\n\n[Verse 2]\nChrist by highest heaven adored Christ the everlasting Lord\nLate in time behold Him come offspring of a virgin''s womb\nVeiled in flesh the Godhead see hail the incarnate Deity\nPleased as man with man to dwell Jesus our Emmanuel',
'[Verse 1]\n[G]Hark the herald angels [D]sing [G]glory to the newborn [D]King\n[G]Peace on earth and [D]mercy [G]mild [Em]God and sinners [A]reconciled\n[G]Joyful all ye [C]nations rise [G]join the triumph [D]of the skies\n[G]With the angelic [C]host pro[G]claim [D]Christ is born in Bethle[G]hem\n\n[Chorus]\n[G]Hark the herald angels [D]sing [G]glory to the newborn [D]King [G]\n\n[Verse 2]\n[G]Christ by highest [D]heaven a[G]dored [D]Christ the everlasting [G]Lord\n[G]Late in time be[D]hold Him [G]come [Em]offspring of a vir[A]gin''s womb\n[G]Veiled in flesh the [C]Godhead see [G]hail the incarnate [D]Deity\n[G]Pleased as man with [C]man to [G]dwell [D]Jesus our Emma[G]nuel',
'G', 0, 108, '4/4', 'Verse1, Chorus, Verse2, Chorus', 1, TRUE),

(61, 'O Come O Come Emmanuel', 'Thomas Helmore', 'Thomas Helmore', 'english',
'[Verse 1]\nO come O come Emmanuel\nAnd ransom captive Israel\nThat mourns in lonely exile here\nUntil the Son of God appear\n\n[Chorus]\nRejoice rejoice Emmanuel\nShall come to thee O Israel\n\n[Verse 2]\nO come Thou Rod of Jesse free\nThine own from Satan''s tyranny\nFrom depths of hell Thy people save\nAnd give them victory o''er the grave',
'[Verse 1]\n[Am]O come O come Em[G]manuel\n[Am]And ransom captive [C]Israel\n[Am]That mourns in lonely [G]exile here\n[F]Until the Son of [G]God ap[Am]pear\n\n[Chorus]\n[C]Rejoice rejoice Em[G]manuel\n[Am]Shall come to thee O [G]Israel [Am]\n\n[Verse 2]\n[Am]O come Thou Rod of [G]Jesse free\n[Am]Thine own from Satan''s [C]tyranny\n[Am]From depths of hell Thy [G]people save\n[F]And give them victory [G]o''er the [Am]grave',
'Am', 0, 76, '4/4', 'Verse1, Chorus, Verse2, Chorus', 1, TRUE),

(62, 'Go Tell It On The Mountain', 'John Wesley Work Jr.', 'John Wesley Work Jr.', 'english',
'[Chorus]\nGo tell it on the mountain\nOver the hills and everywhere\nGo tell it on the mountain\nThat Jesus Christ is born\n\n[Verse 1]\nWhile shepherds kept their watching\nO''er silent flocks by night\nBehold throughout the heavens\nThere shone a holy light\n\n[Verse 2]\nThe shepherds feared and trembled\nWhen lo above the earth\nRang out the angel chorus\nThat hailed the Savior''s birth',
'[Chorus]\n[G]Go tell it on the [C]mountain\n[G]Over the hills and every[D]where\n[G]Go tell it on the [C]mountain\nThat [G]Jesus Christ is [D]born [G]\n\n[Verse 1]\n[G]While shepherds kept their [D]watching\n[G]O''er silent flocks by [C]night\n[G]Behold throughout the [D]heavens\n[G]There shone a holy [D]light [G]\n\n[Verse 2]\n[G]The shepherds feared and [D]trembled\n[G]When lo above the [C]earth\n[G]Rang out the angel [D]chorus\n[G]That hailed the Savior''s [D]birth [G]',
'G', 0, 120, '4/4', 'Chorus, Verse1, Chorus, Verse2, Chorus', 1, TRUE),

(63, 'The First Noel', 'Traditional', 'Traditional English', 'english',
'[Verse 1]\nThe first Noel the angels did say\nWas to certain poor shepherds in fields as they lay\nIn fields where they lay keeping their sheep\nOn a cold winter''s night that was so deep\n\n[Chorus]\nNoel Noel Noel Noel\nBorn is the King of Israel\n\n[Verse 2]\nThey looked up and saw a star\nShining in the east beyond them far\nAnd to the earth it gave great light\nAnd so it continued both day and night',
'[Verse 1]\n[G]The first No[Em]el the [D]angels did [G]say\n[G]Was to certain poor[Em]shepherds in[D]fields as they[G]lay\n[G]In fields where they [Em]lay keeping their [D]sheep\nOn a [G]cold winter''s [Em]night that was so [D]deep [G]\n\n[Chorus]\n[G]Noel No[D]el No[Em]el No[D]el\n[G]Born is the [C]King of Is[D]rael [G]\n\n[Verse 2]\n[G]They looked up and [Em]saw a [D]star [G]\n[G]Shining in the [Em]east beyond [D]them far [G]\n[G]And to the earth it [Em]gave great [D]light\nAnd [G]so it continued [Em]both day and [D]night [G]',
'G', 0, 84, '3/4', 'Verse1, Chorus, Verse2, Chorus', 1, TRUE),

(64, 'O Little Town Of Bethlehem', 'Phillips Brooks', 'Lewis Redner', 'english',
'[Verse 1]\nO little town of Bethlehem how still we see thee lie\nAbove thy deep and dreamless sleep the silent stars go by\nYet in thy dark streets shineth the everlasting Light\nThe hopes and fears of all the years are met in thee tonight\n\n[Verse 2]\nFor Christ is born of Mary and gathered all above\nWhile mortals sleep the angels keep their watch of wondering love\nO morning stars together proclaim the holy birth\nAnd praises sing to God the King and peace to men on earth',
'[Verse 1]\n[G]O little town of [D]Bethlehem how [G]still we see thee [D]lie\n[G]Above thy deep and [G7]dreamless sleep the [C]silent stars go [Cm]by\n[G]Yet in thy dark streets [Em]shineth the ever[B]lasting Light\nThe [G]hopes and fears of [D]all the years are [G]met in thee to[D]night [G]\n\n[Verse 2]\n[G]For Christ is born of [D]Mary and [G]gathered all a[D]bove\n[G]While mortals sleep the [G7]angels keep their [C]watch of wondering [Cm]love\n[G]O morning stars to[Em]gether pro[B]claim the holy birth\nAnd [G]praises sing to [D]God the King and [G]peace to men on [D]earth [G]',
'G', 0, 76, '4/4', 'Verse1, Verse2', 1, TRUE),

(65, 'Away In A Manger', 'Martin Luther', 'James Ramsey Murray', 'english',
'[Verse 1]\nAway in a manger no crib for a bed\nThe little Lord Jesus laid down His sweet head\nThe stars in the sky looked down where He lay\nThe little Lord Jesus asleep on the hay\n\n[Verse 2]\nThe cattle are lowing the baby awakes\nBut little Lord Jesus no crying He makes\nI love Thee Lord Jesus look down from the sky\nAnd stay by my cradle till morning is nigh\n\n[Verse 3]\nBe near me Lord Jesus I ask Thee to stay\nClose by me forever and love me I pray\nBless all the dear children in Thy tender care\nAnd take us to heaven to live with Thee there',
'[Verse 1]\n[G]Away in a manger no [C]crib for a [G]bed\nThe [G]little Lord Jesus laid [D]down His sweet [G]head\nThe [G]stars in the sky looked [C]down where He [G]lay\nThe [G]little Lord Jesus a[D]sleep on the [G]hay\n\n[Verse 2]\n[G]The cattle are lowing the [C]baby a[G]wakes\nBut [G]little Lord Jesus no [D]crying He [G]makes\nI [G]love Thee Lord Jesus look [C]down from the [G]sky\nAnd [G]stay by my cradle till [D]morning is [G]nigh\n\n[Verse 3]\n[G]Be near me Lord Jesus I [C]ask Thee to [G]stay\nClose [G]by me forever and [D]love me I [G]pray\n[G]Bless all the dear children in [C]Thy tender [G]care\nAnd [G]take us to heaven to [D]live with Thee [G]there',
'G', 0, 72, '3/4', 'Verse1, Verse2, Verse3', 1, TRUE),

(66, 'Angels We Have Heard On High', 'Traditional', 'Traditional French', 'english',
'[Verse 1]\nAngels we have heard on high sweetly singing o''er the plains\nAnd the mountains in reply echoing their joyous strains\n\n[Chorus]\nGloria in excelsis Deo\nGloria in excelsis Deo\n\n[Verse 2]\nShepherds why this jubilee why your joyous strains prolong\nWhat the gladsome tidings be which inspire your heavenly song',
'[Verse 1]\n[G]Angels we have heard on [D]high [G]sweetly singing o''er the [D]plains\n[G]And the mountains in re[D]ply [G]echoing their joyous [D]strains [G]\n\n[Chorus]\n[G]Gloria [D]in ex[Em]celsis [C]Deo [G] [D] [G]\n[G]Gloria [D]in ex[Em]celsis [C]Deo [G] [D] [G]\n\n[Verse 2]\n[G]Shepherds why this jubi[D]lee [G]why your joyous strains pro[D]long\n[G]What the gladsome tidings [D]be [G]which inspire your heavenly [D]song [G]',
'G', 0, 116, '4/4', 'Verse1, Chorus, Verse2, Chorus', 1, TRUE),

(67, 'Deck The Halls (Come Christians Join To Sing)', 'Public Domain', 'Charles Everest', 'english',
'[Verse 1]\nCome Christians join to sing alleluia amen\nLoud praise to Christ our King alleluia amen\nLet all with heart and voice before His throne rejoice\nPraise is His gracious choice alleluia amen\n\n[Verse 2]\nCome lift your hearts on high alleluia amen\nLet praises fill the sky alleluia amen\nHe is our Guide and Friend to us He''ll condescend\nHis love shall never end alleluia amen',
'[Verse 1]\n[G]Come Christians join to [D]sing alle[G]luia amen\n[D]Loud praise to Christ our [G]King alle[D]luia amen\n[G]Let all with heart and [C]voice be[G]fore His throne re[D]joice\n[G]Praise is His gracious [C]choice alle[G]luia a[D]men [G]\n\n[Verse 2]\n[G]Come lift your hearts on [D]high alle[G]luia amen\n[D]Let praises fill the [G]sky alle[D]luia amen\n[G]He is our Guide and [C]Friend to [G]us He''ll condescend\n[G]His love shall never [C]end alle[G]luia a[D]men [G]',
'G', 0, 116, '4/4', 'Verse1, Verse2', 1, TRUE),

(68, 'What Child Is This', 'William Dix', 'Traditional English', 'english',
'[Verse 1]\nWhat child is this who laid to rest\nOn Mary''s lap is sleeping\nWhom angels greet with anthems sweet\nWhile shepherds watch are keeping\n\n[Chorus]\nThis this is Christ the King\nWhom shepherds guard and angels sing\nHaste haste to bring Him laud\nThe babe the son of Mary\n\n[Verse 2]\nWhy lies He in such mean estate\nWhere ox and ass are feeding\nGood Christian fear for sinners here\nThe silent Word is pleading',
'[Verse 1]\n[Am]What child is this who [C]laid to rest\n[G]On Mary''s lap is [Em]sleeping\n[Am]Whom angels greet with [C]anthems sweet\n[E]While shepherds watch are [Am]keeping\n\n[Chorus]\n[C]This this is [G]Christ the King\n[Em]Whom shepherds guard and [B]angels sing\n[C]Haste haste to [G]bring Him laud\n[Am]The babe the son of [E]Mary [Am]\n\n[Verse 2]\n[Am]Why lies He in such [C]mean estate\n[G]Where ox and ass are [Em]feeding\n[Am]Good Christian fear for [C]sinners here\n[E]The silent Word is [Am]pleading',
'Am', 0, 96, '3/4', 'Verse1, Chorus, Verse2, Chorus', 1, TRUE),

(69, 'We Three Kings', 'John Henry Hopkins Jr.', 'John Henry Hopkins Jr.', 'english',
'[Verse 1]\nWe three kings of Orient are\nBearing gifts we traverse afar\nField and fountain moor and mountain\nFollowing yonder star\n\n[Chorus]\nO star of wonder star of night\nStar with royal beauty bright\nWestward leading still proceeding\nGuide us to thy perfect light\n\n[Verse 2]\nBorn a King on Bethlehem''s plain\nGold I bring to crown Him again\nKing forever ceasing never\nOver us all to reign',
'[Verse 1]\n[Em]We three kings of [B7]Orient are\n[Em]Bearing gifts we tra[B7]verse afar\n[Em]Field and fountain [D]moor and [G]mountain\n[Em]Following yonder [B7]star [Em]\n\n[Chorus]\n[G]O star of wonder [C]star of night\n[G]Star with royal [C]beauty bright\n[G]Westward leading [C]still pro[G]ceeding\n[Em]Guide us to thy [D]perfect [G]light\n\n[Verse 2]\n[Em]Born a King on [B7]Bethlehem''s plain\n[Em]Gold I bring to [B7]crown Him again\n[Em]King forever [D]ceasing [G]never\n[Em]Over us all to [B7]reign [Em]',
'Em', 0, 84, '3/4', 'Verse1, Chorus, Verse2, Chorus', 1, TRUE),

(70, 'O Come O Come Emmanuel (Contemporary)', 'Sufjan Stevens arr.', 'Thomas Helmore arr. contemporary', 'english',
'[Verse 1]\nO come O come Emmanuel\nAnd ransom captive Israel\nThat mourns in lonely exile here\nUntil the Son of God appear\n\n[Chorus]\nRejoice rejoice Emmanuel\nShall come to thee O Israel\n\n[Verse 2]\nO come Thou Dayspring come and cheer\nOur spirits by Thine advent here\nAnd drive away the shades of night\nAnd pierce the clouds and bring us light\n\n[Bridge]\nO come Desire of nations bind\nAll peoples in one heart and mind\nBid envy strife and quarrels cease\nFill the whole world with heaven''s peace',
'[Verse 1]\n[Dm]O come O come Em[F]manuel\n[Bb]And ransom captive [C]Israel\n[Dm]That mourns in lonely [F]exile here\n[Gm]Until the Son of [C]God ap[Dm]pear\n\n[Chorus]\n[F]Rejoice rejoice Em[C]manuel\n[Bb]Shall come to thee O [C]Israel [Dm] [F]\n\n[Verse 2]\n[Dm]O come Thou Dayspring [F]come and cheer\n[Bb]Our spirits by Thine [C]advent here\n[Dm]And drive away the [F]shades of night\n[Gm]And pierce the clouds and [C]bring us [Dm]light\n\n[Bridge]\n[F]O come Desire of [C]nations bind\n[Bb]All peoples in one [Dm]heart and mind\n[F]Bid envy strife and [C]quarrels cease\n[Bb]Fill the whole world with [C]heaven''s peace [Dm]',
'Dm', 0, 68, '4/4', 'Verse1, Chorus, Verse2, Chorus, Bridge, Chorus', 1, TRUE);

INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) VALUES
((SELECT id FROM songs WHERE title='O Come All Ye Faithful'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='O Come All Ye Faithful'), (SELECT id FROM hashtags WHERE name='adoration')),
((SELECT id FROM songs WHERE title='O Holy Night'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='O Holy Night'), (SELECT id FROM hashtags WHERE name='worship')),
((SELECT id FROM songs WHERE title='Silent Night'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='Silent Night'), (SELECT id FROM hashtags WHERE name='adoration')),
((SELECT id FROM songs WHERE title='Joy To The World'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='Joy To The World'), (SELECT id FROM hashtags WHERE name='joy')),
((SELECT id FROM songs WHERE title='Hark The Herald Angels Sing'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='Hark The Herald Angels Sing'), (SELECT id FROM hashtags WHERE name='praise')),
((SELECT id FROM songs WHERE title='O Come O Come Emmanuel'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='O Come O Come Emmanuel'), (SELECT id FROM hashtags WHERE name='hope')),
((SELECT id FROM songs WHERE title='Go Tell It On The Mountain'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='Go Tell It On The Mountain'), (SELECT id FROM hashtags WHERE name='praise')),
((SELECT id FROM songs WHERE title='The First Noel'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='The First Noel'), (SELECT id FROM hashtags WHERE name='adoration')),
((SELECT id FROM songs WHERE title='O Little Town Of Bethlehem'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='O Little Town Of Bethlehem'), (SELECT id FROM hashtags WHERE name='devotional')),
((SELECT id FROM songs WHERE title='Away In A Manger'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='Away In A Manger'), (SELECT id FROM hashtags WHERE name='adoration')),
((SELECT id FROM songs WHERE title='Angels We Have Heard On High'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='Angels We Have Heard On High'), (SELECT id FROM hashtags WHERE name='praise')),
((SELECT id FROM songs WHERE title='What Child Is This'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='What Child Is This'), (SELECT id FROM hashtags WHERE name='adoration')),
((SELECT id FROM songs WHERE title='We Three Kings'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='We Three Kings'), (SELECT id FROM hashtags WHERE name='worship')),
((SELECT id FROM songs WHERE title='O Come O Come Emmanuel (Contemporary)'), (SELECT id FROM hashtags WHERE name='christmas')),
((SELECT id FROM songs WHERE title='O Come O Come Emmanuel (Contemporary)'), (SELECT id FROM hashtags WHERE name='hope'));
