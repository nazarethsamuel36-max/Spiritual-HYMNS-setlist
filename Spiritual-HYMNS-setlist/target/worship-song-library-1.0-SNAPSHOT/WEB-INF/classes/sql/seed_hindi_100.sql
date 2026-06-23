-- =============================================
-- Mission: 100 Popular Hindi Christian Worship Songs
-- Seeding file for worship_db
-- Encoding: UTF-8mb4
-- =============================================

USE worship_db;

-- 1. Create hashtags if they don't exist
INSERT IGNORE INTO hashtags (name, category) VALUES 
('classic', 'style'),
('hindi', 'language'),
('masihigeet', 'style'),
('hymn', 'style'),
('contemporary', 'style'),
('bhakti', 'style'),
('christmas', 'occasion'),
('easter', 'occasion'),
('praise', 'category'),
('worship', 'category'),
('adoration', 'category'),
('thanksgiving', 'category'),
('blessing', 'category'),
('youth', 'category'),
('dedication', 'category');

-- =============================================
-- BATCH 1: CLASSIC HINDI HYMNS (1-25)
-- =============================================

INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, lyrics_roman, chords, original_key, capo, bpm, time_signature, structure, created_by, is_active) VALUES
(101, 'प्यारा संगठन', 'Traditional', 'William W. Walford / Masih Bhajan Sangrah', 'hindi',
'प्यारा संगठन प्यारा संगठन\nजो मुझे इस दुख की दुनिया से\nअलग ले जाता है पिता के पास\nजहाँ मेरी सब इच्छाएं पूरी होती हैं\n\nजब मैं दुखी और परेशान होता हूँ\nमेरी आत्मा को शांति मिलती है\nधोखेबाज़ और शैतान के जाल से\nप्यारा संगठन मुझे बचाता है',
'Pyara Sangathan Pyara Sangathan\nJo mujhe is dukh ki duniya se\nAlag le jata hai Pita ke paas\nJahan meri sab ichhayen puri hoti hain\n\nJab main dukhi aur pareshan hota hoon\nMeri aatma ko shanti milti hai\nDhokebaz aur Shaitan ke jaal se\nPyara Sangathan mujhe bachata hai',
'[G]Pyara sanga[C]than [G]pyara sanga[D]than\n[G]Jo mujhe is [C]dukh ki [G]duniya [D]se\n[G]Alag le [C]jata hai [G]Pita ke [D]paas\n[G]Jahan meri [C]sab ichha[G]yen puri [D]hoti [G]hain\n\n[G]Jab main du[C]khi aur [G]pareshan [D]hota hoon\n[G]Meri aat[C]ma ko [G]shanti [D]milti hai\n[G]Dhokebaz [C]aur Shai[G]tan ke [D]jaal se\n[G]Pyara san[C]gathan [G]mujhe ba[D]chata [G]hai',
'G', 0, 72, '6/8', 'Verse1, Verse2', 1, TRUE),

(102, 'क्या धन्य भरोसा', 'Fanny Crosby', 'Fanny Crosby / Masih Bhajan Sangrah', 'hindi',
'क्या धन्य भरोसा यीशु है मेरा\nउसने है स्वर्ग में जलाल मुझे दिया\nरूह और नजात का वारिस मैं बना\nउसके ही खून से मैं धोया गया\n\nयही है मेरा गीत यही है मेरा गान\nहरदम अपने मसीह की करूँ प्रशंसा\nयही है मेरा गीत यही है मेरा गान\nहरदम अपने मसीह की करूँ प्रशंसा',
'Kya dhanya bharosa Yeshu hai mera\nUsne hai swarg mein jalal mujhe diya\nRooh aur najat ka waaris main bana\nUske hi khoon se main dhoya gaya\n\nYahi hai mera geet yahi hai mera gaan\nHardam apne Masih ki karoon prashansa\nYahi hai mera geet yahi hai mera gaan\nHardam apne Masih ki karoon prashansa',
'[D]Kya dhanya [G]bharosa [D]Yeshu hai [A]mera\n[D]Usne hai [G]swarg mein [D]jalal mujhe [A]diya\n[D]Rooh aur [G]najat ka [D]waaris main [A]bana\n[D]Uske hi [G]khoon se [D]main [A]dhoya [D]gaya\n\n[D]Yahi hai [G]mera geet [G]yahi hai [D]mera gaan\n[G]Hardam apne [D]Masih ki [A]karoon prashansa\n[D]Yahi hai [G]mera geet [G]yahi hai [D]mera gaan\n[G]Hardam apne [D]Masih ki [A]karoon [D]prashansa',
'D', 0, 92, '9/8', 'Verse1, Chorus', 1, TRUE),

(103, 'अजीब प्यार है देखो', 'Traditional', 'Masih Bhajan Sangrah', 'hindi',
'अजीब प्यार है देखो उस मसीहा का\nजिसने अपनी जान दी है हम गुनाहगारों के लिए\nकौरवों के ताज को उसने पहन लिया\nकि हम पा सकें मुकुट जलाल का हमेशा के लिए\n\nमेरा यीशु मेरा यीशु\nतेरा प्यार है महान\nतूने दी है अपनी जान\nकि हम पाएं जीवन महान',
'Ajeeb pyaar hai dekho us Masiha ka\nJisne apni jaan di hai ham gunahgaron ke liye\nKaurvon ke taj ko usne pehan liya\nKi ham pa saken mukut jalal ka hamesha ke liye\n\nMera Yeshu mera Yeshu\nTera pyaar hai mahan\nToone di hai apni jaan\nKi ham paayein jeevan mahan',
'[Em]Ajeeb pyaar hai [Am]dekho us Ma[D]siha [G]ka\n[Em]Jisne apni [Am]jaan di hai [D]ham guna[G]hgaron ke [B]liye\n[Em]Kaurvon ke [Am]taj ko [D]usne [G]pehan liya\n[Em]Ki ham pa [Am]saken mukut [D]jalal ka [G]hamesha ke [B]liye\n\n[Em]Mera Yeshu [Am]mera Yeshu\n[D]Tera pyaar [G]hai mahan\n[Em]Toone di hai [Am]apni jaan\n[D]Ki ham paa[G]yein jeevan [B]mahan',
'Em', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(104, 'सेनाओं का यहोवा हमारे साथ है', 'Traditional', 'Traditional / Masih Bhajan Sangrah', 'hindi',
'सेनाओं का यहोवा हमारे साथ है\nयाकूब का परमेश्वर हमारा ऊँचा गढ़ है\nओ सारी पृथ्वी के लोगों ताली बजाओ\nविजय के स्वर से गाओ धन्यवाद\n\nकोई भी हथियार जो तेरे विरुद्ध बना है\nसफल न होगा कभी भी\nक्योंकि वह है मेरा सहारा\nऔर वही है मेरा ऊँचा गढ़',
'Senaon ka Yahova hamare saath hai\nYaqub ka Parmeshwar hamara ooncha garh hai\nO saari prithvi ke logon taali bajao\nVijay ke swar se gao dhanyawad\n\nKoi bhi hathiyar jo tere viruddh bana hai\nSaphal na hoga kabhi bhi\nKyunki woh hai mera sahara\nAur wahi hai mera ooncha garh',
'[G]Senaon ka Ya[C]hova [G]hamare [D]saath hai\n[G]Yaqub ka Par[C]meshwar ha[G]mara [D]ooncha [G]garh hai\n[G]O saari [C]prithvi ke [G]logon [D]taali bajao\n[G]Vijay ke [C]swar se [G]gao [D]dhanya[G]wad\n\n[G]Koi bhi ha[C]thiyar jo [G]tere vi[D]ruddh bana hai\n[G]Saphal na [C]hoga [G]kabhi [D]bhi\n[G]Kyunki woh [C]hai mera [G]saha[D]ra\n[G]Aur wahi [C]hai mera [G]ooncha [D]garh [G]',
'G', 0, 116, '4/4', 'Verse1, Verse2', 1, TRUE),

(105, 'मेरे मन तू कर धन्यवाद', 'Traditional', 'Masihi Sangeet / traditional', 'hindi',
'मेरे मन तू कर धन्यवाद उस परमेश्वर का\nजिसने अपनी दया से तुझे बचा लिया है\nपापों से है धोया तुझे और नया किया\nउसका तू कर धन्यवाद हर एक पल सदा\n\nधन्यवाद धन्यवाद धन्यवाद प्रभु\nतूने है हम पर दया की महान\nधन्यवाद धन्यवाद धन्यवाद प्रभु\nतू ही है मेरा प्यारा उद्धारकर्ता',
'Mere man tu kar dhanyawad us Parmeshwar ka\nJisne apni daya se tujhe bacha liya hai\nPaapon se hai dhoya tujhe aur naya kiya\nUska tu kar dhanyawad har ek pal sada\n\nDhanyawad dhanyawad dhanyawad Prabhu\nToone hai ham par daya ki mahan\nDhanyawad dhanyawad dhanyawad Prabhu\nTu hi hai mera pyara uddharkarta',
'[C]Mere man tu kar [G]dhanyawad us [C]Parmeshwar [G]ka\n[C]Jisne apni [G]daya se tu[F]jhe bacha [G]liya [C]hai\n[C]Paapon se hai [G]dhoya tujhe [F]aur naya [G]kiya\n[C]Uska tu kar [G]dhanyawad [F]har ek [G]pal sa[C]da\n\n[C]Dhanyawad [G]dhanyawad [F]dhanyawad [G]Prabhu\n[C]Toone hai ham [F]par daya [G]ki ma[C]han\n[C]Dhanyawad [G]dhanyawad [F]dhanyawad [G]Prabhu\n[C]Tu hi hai [F]mera pya[G]ra uddhar[C]karta',
'C', 0, 78, '4/4', 'Verse1, Chorus', 1, TRUE);

-- Batch 1 Cont. (106-120)
INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, lyrics_roman, chords, original_key, capo, bpm, time_signature, structure, created_by, is_active) VALUES
(106, 'मसीह मेरे साथ है', 'Traditional', 'Masih Bhajan Sangrah', 'hindi',
'मसीह मेरे साथ है मुझे डर नहीं\nउसकी दया मुझ पर है सदा\nवह मेरा बल है और मेरा गीत\nउसका सहारा है मुझे हरदम\n\nयीशु राजा यीशु राजा\nतेरी जय हो तेरी जय हो\nतू ही है मेरा जीवन दाता\nतेरी महिमा हो सदा',
'Masih mere saath hai mujhe darr nahi\nUski daya mujh par hai sada\nWoh mera bal hai aur mera geet\nUska sahara hai mujhe hardam\n\nYeshu Raja Yeshu Raja\nTeri jai ho teri jai ho\nTu hi hai mera jeevan data\nTeri mahima ho sada',
'[G]Masih mere [C]saath hai [G]mujhe darr [D]nahi\n[G]Uski da[C]ya mujh [G]par hai [D]sada\n[G]Woh mera [C]bal hai [G]aur mera [D]geet\n[G]Uska sa[C]hara है [G]mujhe [D]har[G]dam\n\n[G]Yeshu Raja [C]Yeshu [G]Raja\n[G]Teri [C]jai ho [G]teri [D]jai ho\n[G]Tu hi [C]hai mera [G]jeevan [D]data\n[G]Teri ma[C]hima [D]ho sa[G]da',
'G', 0, 84, '4/4', 'Verse1, Chorus', 1, TRUE),

(107, 'ख़ुशी ख़ुशी मनाओ', 'Traditional', 'Traditional / Church Council', 'hindi',
'ख़ुशी ख़ुशी मनाओ देखो क्या ही धन्य दिन है\nमुक्ति दाता आया है जगत का उद्धार करने\nपापों से बचाने हमें स्वर्ग छोड़ आया\nउसका हम स्वागत करें दिल से गाकर गीत नया\n\nगाओ ख़ुशी के साथ महिमा हो\nराजाओं का राजा आया है\nगाओ ख़ुशी के साथ महिमा हो\nयीशु मसीह ही प्रभु है',
'Khushi Khushi manao dekho kya hi dhanya din hai\nMukti data aaya hai jagat ka uddhar karne\nPaapon se bachane hamein swarg chodh aaya\nUska ham swagat karein dil se gaakar geet naya\n\nGao khushi ke saath mahima ho\nRajayon ka raja aaya hai\nGao khushi ke saath mahima ho\nYeshu Masih hi Prabhu hai',
'[D]Khushi khushi ma[G]nao dekho [D]kya hi dhanya [A]din hai\n[D]Mukti data [G]aaya hai [D]jagat ka uddhar [A]karne\n[D]Paapon se ba[G]chane hamein [D]swarg chodh [A]aaya\n[D]Uska ham swa[G]gat karein [D]dil se gaa[A]kar geet [D]naya\n\n[D]Gao khushi ke saath [G]mahi[D]ma ho\n[G]Rajayon ka [D]raja [A]aaya hai\n[D]Gao khushi ke saath [G]mahi[D]ma ho\n[G]Yeshu Ma[A]sih hi Pra[D]bu hai',
'D', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(108, 'आराधना करेंगे आराधना', 'Traditional', 'Traditional / Masihi Bhajan', 'hindi',
'आराधना करेंगे आराधना\nयीशु मसीह की आराधना\nदिल की गहराई से आराधना\nसच्ची आत्मा से आराधना\n\nतू ही हमारा खुदा है\nतू ही हमारा प्रभु है\nतेरी हम स्तुति करें\nहरदम हम महिमा करें',
'Aradhana karenge aradhana\nYeshu Masih ki aradhana\nDil ki gehrai se aradhana\nSacchi aatma se aradhana\n\nTu hi hamara Khuda hai\nTu hi hamara Prabhu hai\nTeri ham stuti karein\nHardam ham mahima karein',
'[C]Aradhana karenge a[G]radhana\n[F]Yeshu Masih ki a[G]radhana\n[C]Dil ki gehrai se a[G]radhana\n[F]Sacchi aatma se a[G]radhana [C]\n\n[C]Tu hi ha[F]mara Khu[G]da hai\n[C]Tu hi ha[F]mara Pra[G]bhu hai\n[C]Teri ham [F]stuti ka[G]rein\n[C]Hardam ham [F]mahima [G]ka[C]rein',
'C', 0, 72, '4/4', 'Verse1, Verse2', 1, TRUE),

(109, 'यीशु ही है सच्चा चरवाहा', 'Traditional', 'Masih Bhajan Sangrah', 'hindi',
'यीशु ही है सच्चा चरवाहा\nवह मुझे हरी चरागाहों में ले जाता है\nवह मुझे ठंडे पानी के पास ले चलता है\nमेरी आत्मा को वह ताज़ा करता है\n\nचाहे मैं मौत की घाटी से गुज़रूँ\nदडूंगा नहीं बुराई से कभी भी\nक्योंकि तू मेरे साथ है प्रभु\nतेरा सोंटा और लाठी मुझे तसल्ली देते हैं',
'Yeshu hi hai saccha charwaha\nWoh mujhe hari charagahon mein le jata hai\nWoh mujhe thande paani ke paas le chalta hai\nMeri aatma ko woh taza karta hai\n\nChahe main maut ki ghati se guzroon\nDaroonga nahi burai se kabhi bhi\nKyunki Tu mere saath hai Prabhu\nTera sonta aur lathi mujhe tasalli dete hain',
'[G]Yeshu hi hai saccha char[D]waha\n[G]Woh mujhe hari chara[C]gahon mein le [D]jata [G]hai\n[G]Woh mujhe thande paani ke [C]paas le [D]chalta [G]hai\n[G]Meri aatma ko [D]woh taza [G]karta hai\n\n[G]Chahe main maut ki [C]ghati se [G]guzroon\n[D]Daroonga nahi burai se [G]kabhi bhi\n[G]Kyunki Tu mere [C]saath hai [G]Prabhu\n[D]Tera sonta aur lathi mujhe ta[G]salli dete hain',
'G', 0, 76, '3/4', 'Verse1, Verse2', 1, TRUE),

(110, 'पावों के पास मैं बैठा रहूँ', 'Traditional', 'Traditional / devotional hymn', 'hindi',
'पावों के पास मैं बैठा रहूँ\nतेरी वाणी मैं सुनता रहूँ\nयीशु मेरे पिता मेरे प्रभु\nतुझ में ही मैं छिपा रहूँ\n\nतू ही मेरा सहारा है\nतू ही मेरा किनारा है\nजब तक है मेरी जान प्रभु\nतेरी ही सेवा मैं करूँ',
'Paawon ke paas main baitha rahoon\nTeri waani main sunta rahoon\nYeshu mere pita mere prabhu\nTujh mein hi main chipa rahoon\n\nTu hi mera sahara hai\nTu hi mera kinara hai\nJab tak hai मेरी jaan Prabhu\nTeri hi sewa main karoon',
'[A]Paawon ke paas main [E]baitha rahoon\n[F#m]Teri waani main [D]sunta rahoon\n[A]Yeshu mere pita [E]mere prabhu\n[F#m]Tujh mein hi main [D]chipaa rahoon [A]\n\n[A]Tu hi mera [E]sahara hai\n[F#m]Tu hi mera [D]kinara hai\n[A]Jab tak hai meri [E]jaan Prabhu\n[F#m]Teri hi sewa [D]main ka[A]roon',
'A', 0, 68, '4/4', 'Verse1, Verse2', 1, TRUE),

(111, 'यहोवा मेरा चरवाहा है', 'Traditional', 'Psalm 23 / traditional', 'hindi',
'यहोवा मेरा चरवाहा है\nमुझे कुछ भी कमी न होगी\nवह मुझे हरी चरागाहों में बिठाता है\nवह मुझे सुखद जल के पास ले चलता है\n\nवह मेरे प्राण में प्राण ले आता है\nधर्म के मार्गों में वह अगवाई करता है\nअपने नाम के निमित्त\nमेरी सहायता करता है',
'Yahova mera charwaha hai\nMujhe kuch bhi kami na hogi\nWoh mujhe hari charagahon mein bithata hai\nWoh mujhe sukhad jal ke paas le chalta hai\n\nWoh mere praan mein praan le aata hai\nDharm ke maargon mein woh agwai karta hai\nApne naam ke nimmitt\nMeri sahayata karta hai',
'[G]Yahova mera char[D]waha hai\n[G]Mujhe kuch bhi [C]kami na [G]hogi\n[G]Woh mujhe hari chara[D]gahon mein bi[G]thata hai\n[G]Woh mujhe sukhad jal ke [C]paas le [D]chalta [G]hai\n\n[G]Woh mere praan mein [D]praan le aata hai\n[G]Dharm ke maargon mein woh ag[D]wai karta [G]hai\n[G]Apne naam ke [C]nimmitt\n[D]Meri sahayata [G]karta hai',
'G', 0, 72, '4/4', 'Verse1, Verse2', 1, TRUE),

(112, 'हम गाये होसन्ना', 'Lenny LeBlanc', 'Lenny LeBlanc / Hindi Adaptation', 'hindi',
'हम गाये होसन्ना राजाओं के राजा को\nमहिमा और सम्मान मिले यीशु मसीह को\nस्वर्ग और पृथ्वी गाएं मिलकर\nपवित्र पवित्र पवित्र है प्रभु\n\nहोसन्ना होसन्ना होसन्ना प्रभु को\nहोसन्ना होसन्ना होसन्ना प्रभु को\nतू ही है उद्धारकर्ता\nतू ही है मेरा खुदा',
'Ham gaye Hosanna rajayon ke raja ko\nMahima aur samman mile Yeshu Masih ko\nSwarg aur prithvi gaayein milkar\nPavitra pavitra pavitra hai Prabhu\n\nHosanna Hosanna Hosanna Prabhu ko\nHosanna Hosanna Hosanna Prabhu ko\nTu hi hai uddharkarta\nTu hi hai mera Khuda',
'[E]Ham gaye Ho[B]sanna [A]rajayon ke [B]raja ko\n[E]Mahima aur sam[B]man mile [A]Yeshu Ma[B]sih ko\n[E]Swarg aur prithvi [B]gaayein milkar\n[A]Pavitra pavitra pa[B]vitra hai [E]Prabhu\n\n[E]Hosanna Ho[B]sanna Ho[A]sanna Prabhu [B]ko\n[E]Hosanna Ho[B]sanna Ho[A]sanna Prabhu [B]ko\n[A]Tu hi hai uddhar[E]karta\n[A]Tu hi hai mera [B]Khu[E]da',
'E', 0, 80, '4/4', 'Verse1, Chorus', 1, TRUE),

(113, 'मसीहा तू है महान', 'Traditional', 'Traditional / Masih Bhajan Sangrah', 'hindi',
'मसीहा तू है महान तेरी जय हो सदा\nतूने दी है अपनी जान हम गुनाहगारों के लिए\nतेरे खून से हमें मिली है माफ़ी\nतेरे नाम से हमें मिली है शांति\n\nमहिमा हो महिमा हो तेरी\nस्तुति हो स्तुति हो तेरी\nसारे जगत में तेरा नाम ऊँचा हो\nयीशु मसीह ही प्रभु है',
'Masiha Tu hai mahan teri jai ho sada\nToone di hai apni jaan ham gunahgaron ke liye\nTere khoon se hamein mili hai maafi\nTere naam se hamein mili hai shanti\n\nMahima ho mahima ho teri\nStuti ho stuti ho teri\nSaare jagat mein tera naam ooncha ho\nYeshu Masih hi Prabhu hai',
'[D]Masiha Tu hai ma[G]han teri [D]jai ho [A]sada\n[D]Toone di hai [G]apni jaan ham [D]gunahgaron ke [A]liye\n[Bm]Tere khoon se ha[G]mein mili hai [D]maafi\n[Bm]Tere naam se ha[G]mein mili hai [D]shanti [A]\n\n[D]Mahima ho ma[G]hima ho [D]teri\n[G]Stuti ho [D]stuti ho [A]teri\n[D]Saare jagat में [G]tera naam [D]ooncha ho\n[G]Yeshu Ma[A]sih hi Pra[D]bu hai',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(114, 'तेरी स्तुति मैं करूँ', 'Traditional', 'Devotional / Traditional', 'hindi',
'तेरी स्तुति मैं करूँ ऐ प्रभु मेरे खुदा\nजब तक है मेरी साँस ऐ प्रभु मेरे खुदा\nतू ही मेरा बल है तू ही मेरी ढाल\nतेरी शरण में मैं सुरक्षित हूँ सदा\n\nस्तुति हो स्तुति हो प्रभु\nमहिमा हो महिमा हो प्रभु\nतू ही है मेरा प्यारा खुदा\nतेरा ही नाम लूँ सदा',
'Teri stuti main karoon ae Prabhu mere Khuda\nJab tak hai meri saans ae Prabhu mere Khuda\nTu hi mera bal hai Tu hi meri dhaal\nTeri sharan mein main surakshit hoon sada\n\nStuti ho stuti ho Prabhu\nMahima ho mahima ho Prabhu\nTu hi hai mera pyara Khuda\nTera hi naam loon sada',
'[G]Teri stuti main ka[C]roon ae [D]Prabhu mere [G]Khuda\n[G]Jab tak hai meri [C]saans ae [D]Prabhu mere [G]Khuda\n[Em]Tu hi mera [C]bal hai [G]Tu hi meri [D]dhaal\n[Em]Teri sharan [C]mein main su[G]rakshit hoon [D]sada [G]\n\n[G]Stuti ho [C]stuti ho [D]Prabhu\n[G]Mahima ho [C]mahima ho [D]Prabhu\n[G]Tu hi hai [C]mera pyara [D]Khuda\n[G]Tera hi [D]naam loon [G]sada',
'G', 0, 74, '4/4', 'Verse1, Chorus', 1, TRUE),

(115, 'प्रभु को धन्य कहो', 'Traditional', 'Traditional / Masih Bhajan Sangrah', 'hindi',
'प्रभु को धन्य कहो मेरे प्राणों\nउसकी सब भलाइयों को याद करो\nउसने ही तुझे चंगा किया है\nउसने ही तुझे नया जीवन दिया है\n\nवह दया और करुणा से भरा है\nउसका क्रोध पल भर का है\nपर उसकी करुणा सदा की है\nप्रभु को धन्य कहो सदा',
'Prabhu ko dhanya kaho mere praano\nUski sab bhalaiyon ko yaad karo\nUsne hi tujhe changa kiya hai\nUsne hi tujhe naya jeevan diya hai\n\nWoh daya aur karuna se bhara hai\nUska krodh pal bhar ka hai\nPar uski karuna sada ki hai\nPrabhu ko dhanya kaho sada',
'[C]Prabhu ko dhanya [G]kaho mere [C]praano\n[C]Uski sab bha[F]laiyon ko [G]yaad [C]karo\n[C]Usne hi tu[G]jhe changa [C]kiya hai\n[F]Usne hi tujhe [G]naya jeevan [C]diya hai\n\n[C]Woh daya aur ka[F]runa se [C]bhara hai\n[G]Uska krodh [F]pal bhar [G]ka hai\n[C]Par uski ka[F]runa sa[C]da ki hai\n[G]Prabhu ko dhanya [C]kaho sada',
'C', 0, 72, '4/4', 'Verse1, Verse2', 1, TRUE),

(116, 'मेरे जीवन का आधार तू है', 'Traditional', 'Traditional / Praise', 'hindi',
'मेरे जीवन का आधार तू है\nमेरी हर खुशी का ठिकाना तू है\nतेरे बिना मैं कुछ भी नहीं\nतेरी ही दया से मैं जीवित हूँ\n\nयीशु मसीह तू ही है प्रभु\nतेरी ही महिमा मैं करूँ\nसारे जहाँ में तेरा नाम गाऊँ\nतू ही है मेरा भगवान',
'Mere jeevan ka adhaar Tu hai\nMeri har khushi ka thikana Tu hai\nTere bina main kuch bhi nahi\nTeri hi daya se main jeevit hoon\n\nYeshu Masih Tu hi hai Prabhu\nTeri hi mahima main karoon\nSaare jahan mein tera naam gaoon\nTu hi hai mera bhagwan',
'[G]Mere jeevan ka a[C]dhaar Tu [D]hai\n[G]Meri har khushi ka thi[C]kana Tu [D]hai\n[Em]Tere bina main [C]kuch bhi [G]nahi\n[Em]Teri hi daya se [D]main jeevit [G]hoon\n\n[G]Yeshu Masih [C]Tu hi hai [D]Prabhu\n[G]Teri hi ma[C]hima main [D]karoon\n[G]Saare jahan में [C]tera naam [G]gaoon\n[C]Tu hi hai [D]mera bhag[G]wan',
'G', 0, 76, '4/4', 'Verse1, Chorus', 1, TRUE),

(117, 'प्यार की बरसात', 'Anil Kant', 'Anil Kant', 'hindi',
'प्यार की बरसात हो रही है\nप्रभु की दया हम पर हो रही है\nझूमो नाचो खुशी मनाओ\nयीशु मसीह की जय जयकार गाओ\n\nवह चंगा करता है बीमारों को\nवह चंगा करता है टूटे दिलों को\nआओ मिलकर हम स्तुति करें\nउसकी महिमा सारे जहाँ में करें',
'Pyaar ki barsaat ho rahi hai\nPrabhu ki daya ham par ho rahi hai\nJhumo nacho khushi manao\nYeshu Masih ki jai jaikar gao\n\nWoh changa karta hai bimaron ko\nWoh changa karta hai toote dilon ko\nAao milkar ham stuti karein\nUski mahima saare jahan mein karein',
'[C]Pyaar ki barsaat [G]ho rahi [C]hai\n[C]Prabhu ki daya ham [F]par ho [G]rahi [C]hai\n[C]Jhumo nacho [G]khushi ma[C]nao\n[F]Yeshu Masih ki [G]jai jaikar [C]gao\n\n[C]Woh changa karta [F]hai bima[G]ron [C]ko\n[C]Woh changa karta [F]hai toote [G]dilon [C]ko\n[C]Aao milkar [F]ham stuti [G]karein\n[C]Uski mahima [G]saare jahan mein [C]karein',
'C', 0, 120, '4/4', 'Verse1, Verse2', 1, TRUE),

(118, 'तू ही है मेरा सहारा', 'Traditional', 'Traditional / Worship', 'hindi',
'तू ही है मेरा सहारा प्रभु\nतू ही है मेरा किनारा प्रभु\nलहरों के बीच मैं सुरक्षित हूँ\nक्योंकि तू मेरे साथ है प्रभु\n\nडरने की कोई बात नहीं\nपीछे हटने की कोई बात नहीं\nजीत मेरी निश्चित है\nक्योंकि यीशु मेरे साथ है',
'Tu hi hai mera sahara Prabhu\nTu hi hai mera kinara Prabhu\nLehron ke beech main surakshit hoon\nKyunki Tu mere saath hai Prabhu\n\nDarrne ki koi baat nahi\nPeeche hatne ki koi baat nahi\nJeet meri nishchit hai\nKyunki Yeshu mere saath hai',
'[D]Tu hi hai mera sa[G]hara Pra[D]bu\n[D]Tu hi hai mera ki[A]nara Pra[D]bu\n[Bm]Lehron ke beech main [G]surakshit [D]hoon\n[Bm]Kyunki Tu mere [A]saath hai Pra[D]bu\n\n[D]Darrne ki koi [G]baat na[D]hi\n[A]Peeche hatne ki [D]koi baat nahi\n[Bm]Jeet meri [G]nishchit [D]hai\n[A]Kyunki Yeshu [D]mere saath hai',
'D', 0, 80, '4/4', 'Verse1, Verse2', 1, TRUE),

(119, 'पवित्र पवित्र पवित्र प्रभु', 'Traditional', 'Traditional / Hymn', 'hindi',
'पवित्र पवित्र पवित्र प्रभु\nसर्वशक्तिमान परमेश्वर तू ही है\nभोर के समय हम तुझे पुकारते हैं\nपवित्र पवित्र पवित्र महान खुदा\n\nसारे स्वर्गदूत तुझे सिजदा करें\nअपनी आँखें तेरी ओर लगायें\nतू ही है जलाल का राजा\nतेरी महिमा हम गाते रहें',
'Pavitra pavitra pavitra Prabhu\nSarvashaktiman Parmeshwar Tu hi hai\nBhor ke samay ham tujhe pukarte hain\nPavitra pavitra pavitra mahan Khuda\n\nSaare swargdoot tujhe sijda karein\nApni aankhein teri ore lagayein\nTu hi hai jalal ka raja\nTeri mahima ham gaate rahein',
'[G]Pavitra pavitra pa[C]vitra Pra[G]bhu\n[G]Sarvashak[Em]timan Par[D]meshwar Tu [G]hi hai\n[G]Bhor ke sa[Em]may ham tu[C]jhe pu[D]karte hain\n[G]Pavitra pavitra pa[D]vitra mahan [G]Khuda\n\n[G]Saare swargdoot tu[C]jhe sijda [G]karein\n[Em]Apni aankhein [C]teri ore la[D]gayein\n[G]Tu hi hai ja[C]lal ka [G]raja\n[Em]Teri mahi[D]ma ham gaate [G]rahein',
'G', 0, 68, '4/4', 'Verse1, Verse2', 1, TRUE),

(120, 'यीशु का नाम सबसे प्यारा है', 'Traditional', 'Traditional / Gospel', 'hindi',
'यीशु का नाम सबसे प्यारा है\nवही तो मेरा सहारा है\nदुखों के सागर में वह नाव है\nउद्धार का वही तो मार्ग है\n\nनाम नाम यीशु का नाम\nप्यारा प्यारा यीशु का नाम\nपापों से वह मुक्ति दिलाता है\nनया जीवन वह देता है',
'Yeshu ka naam sabse pyara hai\nWahi to mera sahara hai\nDukhon ke saagar mein woh naav hai\nUddhar ka wahi to marg hai\n\nNaam naam Yeshu ka naam\nPyara pyara Yeshu ka naam\nPaapon se woh mukti dilata hai\nNaya jeevan woh deta hai',
'[C]Yeshu ka naam sabse [G]pyara [C]hai\n[C]Wahi to [F]mera sa[G]hara [C]hai\n[F]Dukhon ke saagar में [C]woh naav hai\n[G]Uddhar ka wahi to [C]marg hai\n\n[C]Naam naam [F]Yeshu ka [G]naam\n[C]Pyara pyara [F]Yeshu ka [G]naam\n[C]Paapon se woh [F]mukti di[G]lata [C]hai\n[G]Naya jeevan woh [C]deta hai',
'C', 0, 100, '4/4', 'Verse1, Chorus', 1, TRUE);

-- Batch 1 Finish & Batch 2 Start (121-135)
INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, lyrics_roman, chords, original_key, capo, bpm, time_signature, structure, created_by, is_active) VALUES
(121, 'प्रभु की स्तुति हो', 'Johnson Martin', 'Johnson Martin', 'hindi',
'प्रभु की स्तुति हो हर पल हर घड़ी\nप्रभु की महिमा हो सारे जहाँ में\nउसने हमारे लिए अद्भुत काम किए\nउसका हम धन्यवाद करें हृदय से\n\nगाओ महिमा गाओ महिमा\nयीशु राजा की महिमा\nगाओ महिमा गाओ महिमा\nयीशु राजा की महिमा',
'Prabhu ki stuti ho har pal har ghadi\nPrabhu ki mahima ho saare jahan mein\nUsne hamare liye adbhut kaam kiye\nUska ham dhanyawad karein hriday se\n\nGao mahima gao mahima\nYeshu Raja ki mahima\nGao mahima gao mahima\nYeshu Raja ki mahima',
'[G]Prabhu ki stuti [C]ho har pal [D]har ghadi\n[G]Prabhu ki ma[C]hima ho saare [D]jahan mein\n[Em]Usne hamare [C]liye adbhut [G]kaam kiye\n[Em]Uska ham dhar[C]nyawad karein [D]hriday se\n\n[G]Gao mahima gao mahima\n[C]Yeshu Raja ki ma[D]hima\n[Em]Gao mahima gao ma[D]hima\n[C]Yeshu Raja ki ma[G]hima',
'G', 0, 82, '4/4', 'Verse1, Chorus', 1, TRUE),

(122, 'धन्यवाद के साथ', 'Traditional', 'Traditional / Church Worship', 'hindi',
'धन्यवाद के साथ हम आएँगे उसके भवन में\nस्तुति के साथ हम आएँगे उसके आँगन में\nवह हमारा प्रभु है वही हमारा खुदा\nउसकी हम आराधना करें सच्चाई से\n\nस्तुति हो स्तुति हो प्रभु की\nमहिमा हो महिमा हो प्रभु की\nतू ही हमारा सहारा तू ही किनारा\nतेरी जय जयकार हो प्रभु',
'Dhanyawad ke saath ham aayenge uske bhawan mein\nStuti ke saath ham aayenge uske aangan mein\nWoh hamara prabhu hai wahi hamara khuda\nUski ham aradhana karein sacchai se\n\nStuti ho stuti ho prabhu ki\nMahima ho mahima ho prabhu ki\nTu hi hamara sahara tu hi kinara\nTeri jai jaikar ho prabhu',
'[A]Dhanyawad ke [D]saath ham [E]aayenge uske [A]bhawan में\n[A]Stuti ke [D]saath ham [E]aayenge uske [A]aangan में\n[F#m]Woh hamara [D]prabhu hai [E]wahi hamara [A]khuda\n[F#m]Uski ham a[D]radhana ka[E]rein sacchai [A]se\n\n[A]Stuti ho [D]stuti ho [E]prabhu [A]ki\n[A]Mahima ho [D]mahima ho [E]prabhu [A]ki\n[F#m]Tu hi hamara sa[D]hara tu hi ki[E]nara\n[F#m]Teri jai jai[E]kar ho Pra[A]bu',
'A', 0, 116, '4/4', 'Verse1, Chorus', 1, TRUE),

(123, 'मेरे मन भज ले प्रभु का नाम', 'Traditional', 'Devotional Hymn', 'hindi',
'मेरे मन भज ले प्रभु का नाम\nवह सब दुखों को हर लेता है\nपापों से वह मुक्ति दिलाता\nनया जीवन वह देता है\n\nप्रभु ही मेरा जीवन है\nप्रभु ही मेरा गीत है\nउसके बिना मैं कुछ भी नहीं\nउसके चरणों में ही मेरा सुख है',
'Mere man bhaj le Prabhu ka naam\nWoh sab dukhon ko har leta hai\nPaapon se woh mukti dilata\nNaya jeevan woh deta hai\n\nPrabhu hi mera jeevan hai\nPrabhu hi mera geet hai\nUske bina main kuch bhi nahi\nUske charnon mein hi mera sukh hai',
'[Em]Mere man [Am]bhaj le [D]Prabhu ka [G]naam\n[Em]Woh sab du[Am]khon ko [D]har leta [B]hai\n[Em]Paapon se [Am]woh mukti di[D]lata\n[Em]Naya jee[D]van woh [G]deta [B]hai\n\n[Em]Prabhu hi [Am]mera jeevan [D]hai\n[Em]Prabhu hi [Am]mera geet [D]hai\n[G]Uske bina [Am]main kuch bhi [Em]nahi\n[D]Uske charnon में [G]hi mera [B]sukh [Em]hai',
'Em', 0, 72, '4/4', 'Verse1, Verse2', 1, TRUE),

(124, 'जय जय कार (होने पाए)', 'Traditional', 'Praise / Chorus', 'hindi',
'जय जय कार होने पाए सदा\nयीशु के नाम की स्तुति हो सदा\nउसने ही हमें बचाया है\nउसका हम धन्यवाद करें सदा\n\nराजाओं का राजा प्रभु का प्रभु\nजलाल का राजा यीशु मसीह\nसारे जहाँ में उसका नाम ऊँचा हो\nजय जय कार हो सदा',
'Jai Jai Kar hone paaye sada\nYeshu ke naam ki stuti ho sada\nUsne hi hamein bachaya hai\nUska ham dhanyawad karein sada\n\nRajayon ka raja Prabhu ka Prabhu\nJalal ka raja Yeshu Masih\nSaare jahan mein uska naam ooncha ho\nJai Jai Kar ho sada',
'[G]Jai Jai [C]Kar hone [G]paaye [D]sada\n[G]Yeshu ke [C]naam ki [G]stuti [D]ho [G]sada\n[G]Usne hi [C]hamein ba[G]chaya [D]hai\n[G]Uska ham [C]dhanyawad ka[G]rein [D]sada [G]\n\n[G]Rajayon ka [C]raja Pra[G]bu ka Pra[D]bu\n[G]Jalal ka [C]raja [G]Yeshu Ma[D]sih\n[G]Saare jahan में [C]uska naam [G]ooncha [D]ho\n[G]Jai Jai [D]Kar ho sa[G]da',
'G', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(125, 'प्यारा प्रभु मेरा यीशु मसीह', 'Traditional', 'Hymn / Bhajan', 'hindi',
'प्यारा प्रभु मेरा यीशु मसीह\nवह मुझे राह दिखाता है\nजब मैं अकेला होता हूँ\nवह मुझे गले लगाता है\n\nतेरी जय हो तेरी स्तुति हो\nतू ही मेरा उद्धारकर्ता\nसारे जीवन मैं तुझे भजूंगा\nतू ही मेरा खुदा महान',
'Pyara Prabhu mera Yeshu Masih\nWoh mujhe raah dikhata hai\nJab main akela hota hoon\nWoh mujhe gale lagata hai\n\nTeri jai ho teri stuti ho\nTu hi mera uddharkarta\nSaare jeevan main tujhe bhajoonga\nTu hi mera Khuda mahan',
'[D]Pyara Pra[G]bu mera [D]Yeshu Ma[A]sih\n[D]Woh mujhe [G]raah di[D]khata [A]hai\n[Bm]Jab main a[G]kela [D]hota [A]hoon\n[Bm]Woh mujhe [G]gale la[A]gata [D]hai\n\n[D]Teri jai [G]ho teri [D]stuti [A]ho\n[D]Tu hi [G]mera ud[D]dharkar[A]ta\n[Bm]Saare jeevan [G]main tujhe bha[D]joonga\n[Bm]Tu hi mera [A]Khuda ma[D]han',
'D', 0, 74, '4/4', 'Verse1, Chorus', 1, TRUE),

(126, 'यीशु तेरा नाम सबसे ऊँचा है', 'Bridge Music', 'Bridge Music India', 'hindi',
'यीशु तेरा नाम सबसे ऊँचा है\nआसमाँ और ज़मीन में तू ही प्रभु है\nहर घुटना झुकेगा और हर ज़बान कहेगी\nकि यीशु तू ही है प्रभु\n\nमहिमा हो महिमा हो तेरी\nतू ही हमारा खुदा\nआराधना आराधना तेरी\nतू ही हमारा प्रभु',
'Yeshu tera naam sabse ooncha hai\nAasman aur zameen mein Tu hi Prabhu hai\nHar ghutna jhukega aur har zaban kahegi\nKi Yeshu Tu hi hai Prabhu\n\nMahima ho mahima ho teri\nTu hi hamara Khuda\nAradhana aradhana teri\nTu hi hamara Prabhu',
'[E]Yeshu Tera [B]naam sabse [A]ooncha [B]hai\n[E]Aasman aur za[B]meen mein [A]Tu hi Pra[B]bu hai\n[F#m]Har ghutna jhu[E]kega aur [A]har zaban ka[B]hegi\n[F#m]Ki Yeshu [E]Tu hi [A]hai Pra[B]bu\n\n[E]Mahima ho ma[B]hima ho [A]teri\n[E]Tu hi ha[B]mara Khu[A]da\n[E]Aradhana a[B]radhana [A]teri\n[E]Tu hi ha[B]mara Pra[A]bu',
'E', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(127, 'योग्य (Yogy)', 'Amit Kamble', 'Amit Kamble (New Wine)', 'hindi',
'योग्य तू योग्य है राजाओं का राजा तू ही है\nमहिमा और सम्मान के योग्य तू ही है प्रभु\nसारे स्वर्ग में और पृथ्वी पर\nतेरा ही नाम गूँजे सदा\n\nपवित्र पवित्र पवित्र तू है\nप्रभु परमेश्वर सर्वशक्तिमान\nजो था और जो है और जो आने वाला है\nयोग्य तू ही है प्रभु',
'Yogy Tu yogy hai rajayon ka raja Tu hi hai\nMahima aur samman ke yogy Tu hi hai Prabhu\nSaare swarg mein aur prithvi par\nTera hi naam goonje sada\n\nPavitra pavitra pavitra Tu hai\nPrabhu Parmeshwar sarvashaktiman\nJo tha aur jo hai aur jo aane wala hai\nYogy Tu hi hai Prabhu',
'[G]Yogy Tu [C]yogy hai ra[G]jayon ka raja [D]Tu hi hai\n[G]Mahima aur sam[C]man ke [G]yogy Tu hi [D]hai Pra[G]bu\n[Em]Saare swarg [C]mein aur [G]prithvi [D]par\n[Em]Tera hi [C]naam goon[D]je sa[G]da\n\n[G]Pavitra pavitra pa[C]vitra Tu [D]hai\n[G]Prabhu Par[C]meshwar sarva[D]shak[G]timan\n[Em]Jo tha aur [C]jo hai aur [G]jo aane [D]wala hai\n[Em]Yogy Tu [D]hi hai Pra[G]bu',
'G', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(128, 'दिल से आराधना करूँगा', 'Traditional', 'Contemporary Worship', 'hindi',
'दिल से आराधना करूँगा मैं तेरी\nआत्मा से स्तुति करूँगा मैं तेरी\nतू ही मेरा प्यार तू ही मेरी जान\nतेरी ही महिमा मैं करूँ सदा\n\nयीशु मेरे यीशु मेरे\nतेरा ही नाम लूँ मैं सदा\nयीशु मेरे यीशु मेरे\nतुझ में ही खो जाऊँ सदा',
'Dil se aradhana karoonga main teri\nAatma se stuti karoonga main teri\nTu hi mera pyaar Tu hi meri jaan\nTeri hi mahima main karoon sada\n\nYeshu mere Yeshu mere\nTera hi naam loon main sada\nYeshu mere Yeshu mere\nTujh mein hi kho jaoon sada',
'[Am]Dil se ara[F]dhana ka[G]roonga main [C]teri\n[Am]Aatma se [F]stuti ka[G]roonga main [Am]teri\n[Am]Tu hi mera [F]pyaar Tu [G]hi meri [C]jaan\n[F]Teri hi ma[G]hima main ka[Am]roon sada\n\n[Am]Yeshu mere [G]Yeshu mere\n[F]Tera hi [G]naam loon main [Am]sada\n[Am]Yeshu mere [G]Yeshu mere\n[F]Tujh mein hi [G]kho jaoon sa[Am]da',
'Am', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(129, 'बोलूँ जय यीशु की जय', 'Johnson Martin', 'Johnson Martin', 'hindi',
'बोलूँ जय यीशु की जय जय जय\nसारे जग में उसका नाम ऊँचा हो\nउसने हमारे लिए दुख उठाए\nकि हम पा सकें जीवन महान\n\nजय मसीह की जय मसीह की\nगाओ ख़ुशी के साथ जय जय कार\nजय मसीह की जय मसीह की\nहृदय से करो उसका धन्यवाद',
'Bolun Jai Yeshu ki Jai Jai Jai\nSaare jag mein uska naam ooncha ho\nUsne hamare liye dukh uthaye\nKi ham pa saken jeevan mahan\n\nJai Masih ki Jai Masih ki\nGao khushi ke saath jai jai kar\nJai Masih ki Jai Masih ki\nHriday se karo uska dhanyawad',
'[D]Bolun Jai Yeshu ki [G]Jai Jai [A]Jai\n[D]Saare jag में [G]uska naam [A]ooncha [D]ho\n[Bm]Usne ha[G]mare liye [D]dukh u[A]thaye\n[Bm]Ki ham pa [G]saken jee[A]van ma[D]han\n\n[D]Jai Masih ki [G]Jai Masih [A]ki\n[D]Gao khushi ke [G]saath jai [A]jai [D]kar\n[Bm]Jai Masih ki [G]Jai Masih [D]ki\n[Bm]Hriday se [A]karo uska [D]dhanyawad',
'D', 0, 116, '4/4', 'Verse1, Chorus', 1, TRUE),

(130, 'पवित्र आत्मा आ', 'Traditional', 'Renewal Worship', 'hindi',
'पवित्र आत्मा आ और हमें छू ले\nस्वर्ग की आग से हमें भर दे\nतेरे बिना हम अधूरे हैं प्रभु\nअपनी सामर्थ्य से हमें नया कर दे\n\nछू ले हमें छू ले हमें\nपवित्र आत्मा छू ले हमें\nभर दे हमें भर दे हमें\nअपनी आग से भर दे हमें',
'Pavitra Aatma Aa aur hamein choo le\nSwarg ki aag se hamein bhar de\nTere bina ham adhure hain Prabhu\nApni samarth se hamein naya kar de\n\nChoo le hamein choo le hamein\nPavitra Aatma choo le hamein\nBhar de hamein bhar de hamein\nApni aag se bhar de hamein',
'[Em]Pavitra Aatma [Am]Aa aur [D]hamein choo [G]le\n[Em]Swarg ki aag [Am]se hamein [D]bhar [B]de\n[Em]Tere bina ham [Am]adhure [D]hain Pra[G]bu\n[Em]Apni samarth [Am]se hamein naya [D]kar [B]de\n\n[Em]Choo le hamein [Am]choo le [B]hamein\n[Em]Pavitra Aatma [Am]choo le [B]hamein\n[Em]Bhar de hamein [Am]bhar [B]de hamein\n[Em]Apni aag [Am]se bhar [B]de ha[Em]mein',
'Em', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(131, 'अब्बा पिता (Abba Pita)', 'Traditional', 'Praise & Worship', 'hindi',
'अब्बा पिता तू ही हमारा खुदा\nतेरी ही दया से हम जीवित हैं प्रभु\nतेरे प्यार का कोई अंत नहीं\nतेरी करुणा सदा बनी रहती है\n\nअब्बा पिता अब्बा पिता\nप्यार करने वाला पिता\nतूने है हमें अपना बनाया\nतेरा धन्यवाद हो सदा',
'Abba Pita Tu hi hamara Khuda\nTeri hi daya se ham jeevit hain Prabhu\nTere pyaar ka koi ant nahi\nTeri karuna sada bani rehti hai\n\nAbba Pita Abba Pita\nPyaar karne wala Pita\nToone hai hamein apna banaya\nTera dhanyawad ho sada',
'[D]Abba Pita [G]Tu hi ha[D]mara Khu[A]da\n[D]Teri hi da[G]ya se ham [D]jeevit [A]hain Pra[D]bu\n[Bm]Tere pyaar [G]ka koi [D]ant na[A]hi\n[Bm]Teri ka[G]runa sa[A]da bani [D]rehti hai\n\n[D]Abba Pita [G]Abba Pi[D]ta\n[G]Pyaar karne [A]wala Pi[D]ta\n[Bm]Toone hai ha[G]mein apna ba[D]naya\n[A]Tera dhanyawad [D]ho sada',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(132, 'हम गायें होसन्ना (Part 2)', 'Lenny LeBlanc', 'Lenny LeBlanc / Hindi Adaptation', 'hindi',
'हम गायें होसन्ना महिमा यीशु की\nउसके चरणों में हम सिजदा करें\nवही है महान वही है प्रभु\nउसका नाम ऊँचा हो सारे जहाँ में\n\nहोसन्ना होसन्ना होसन्ना प्रभु को\nहोसन्ना होसन्ना होसन्ना प्रभु को\nमहिमा और सम्मान सदा\nसिर्फ यीशु मसीह को',
'Ham gayein Hosanna mahima Yeshu ki\nUske charnon mein ham sijda karein\nWahi hai mahan wahi hai prabhu\nUska naam ooncha ho saare jahan mein\n\nHosanna Hosanna Hosanna Prabhu ko\nHosanna Hosanna Hosanna Prabhu ko\nMahima aur samman sada\nSirf Yeshu Masih ko',
'[G]Ham gayein Ho[C]sanna ma[G]hima Yeshu [D]ki\n[G]Uske charnon [C]mein ham [G]sijda ka[D]rein\n[Em]Wahi hai ma[C]han wahi [G]hai pra[D]bu\n[Em]Uska naam [C]ooncha ho [D]saare ja[G]han में\n\n[G]Hosanna Ho[C]sanna Ho[G]sanna Prabhu [D]ko\n[G]Hosanna Ho[C]sanna Ho[G]sanna Prabhu [D]ko\n[C]Mahima aur sam[G]man sada\n[C]Sirf [D]Yeshu Ma[G]sih ko',
'G', 0, 78, '4/4', 'Verse1, Chorus', 1, TRUE),

(133, 'यीशु तू है महान', 'Traditional', 'Contemporary Worship', 'hindi',
'यीशु तू है महान तेरी स्तुति करूँ\nतू ही है मेरा भगवान तेरी महिमा करूँ\nपापों से तूने है मुक्ति दिलाई\nस्वर्ग का रास्ता हमें दिखाया\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Yeshu Tu hai mahan teri stuti karoon\nTu hi hai mera bhagwan teri mahima karoon\nPaapon se Toone hai mukti dilayi\nSwarg ka rasta hamein dikhaya\n\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nMahima ho mahima ho teri\nSaare jahan ka raja Tu hi hai',
'[C]Yeshu Tu hai ma[G]han teri [C]stuti ka[G]roon\n[C]Tu hi hai mera bha[F]gwan teri [G]mahima ka[C]roon\n[C]Paapon se Too[G]ne hai [F]mukti di[G]layi\n[C]Swarg ka ras[G]ta ha[F]mein di[G]khaya [C]\n\n[C]Mahima ho ma[G]hima ho [C]teri\n[F]Yeshu Masih [G]Tu hi hai [C]Prabhu\n[C]Mahima ho ma[G]hima ho [C]teri\n[F]Saare jahan ka [G]raja Tu hi [C]hai',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(134, 'संग तेरे (Sang Tere)', 'Bridge Music', 'Bridge Music India', 'hindi',
'संग तेरे अब चलना है हमको प्रभु\nतेरी राहों में बहना है हमको प्रभु\nतू ही हमारा सहारा तू ही हमारी जान\nतेरे बिना हम जी न सकेंगे कभी\n\nसंग तेरे संग तेरे संग तेरे\nयीशु मेरे यीशु मेरे\nसंग तेरे संग तेरे संग तेरे\nयीशु मेरे यीशु मेरे',
'Sang tere ab chalna hai humko Prabhu\nTeri rahon mein behna hai humko Prabhu\nTu hi humara sahara Tu hi humari jaan\nTere bina hum jee na sakenge kabhi\n\nSang tere sang tere sang tere\nYeshu mere Yeshu mere\nSang tere sang tere sang tere\nYeshu mere Yeshu mere',
'[E]Sang tere ab [B]chalna hai [A]humko Pra[B]bu\n[E]Teri rahon mein [B]behna hai [A]humko Pra[B]bu\n[F#m]Tu hi humara sa[E]hara Tu [A]hi humari [B]jaan\n[F#m]Tere bina hum [E]jee na sa[A]kenge ka[B]bhi\n\n[E]Sang tere sang [B]tere [A]sang te[B]re\n[E]Yeshu [B]mere [A]Yeshu [B]mere\n[E]Sang tere sang [B]tere [A]sang te[B]re\n[E]Yeshu [B]mere [A]Yeshu [B]mere',
'E', 0, 70, '4/4', 'Verse1, Chorus', 1, TRUE),

(135, 'यीशु का नाम (Bridge Music)', 'Bridge Music', 'Bridge Music India', 'hindi',
'यीशु का नाम दुनिया में सबसे प्यारा है\nवही तो अंधकार में ज्योति हमारा है\nजो भी पुकारेगा पाएगा वह उद्धार\nयीशु मसीह ही मार्ग और सत्य है\n\nनाम नाम यीशु का नाम\nशक्तिशाली उद्धार का नाम\nनाम नाम यीशु का नाम\nसारे जहाँ का राजा का नाम',
'Yeshu ka naam duniya mein sabse pyara hai\nWahi to andhkar mein jyoti humara hai\nJo bhi pukarega payega woh uddhar\nYeshu Masih hi marg aur satya hai\n\nNaam naam Yeshu ka naam\nShaktishali uddhar ka naam\nNaam naam Yeshu ka naam\nSaare jahan ka raja ka naam',
'[G]Yeshu ka naam du[C]niya में [G]sabse pyara [D]hai\n[G]Wahi to andh[C]kar में [G]jyoti hu[D]mara [G]hai\n[Em]Jo bhi pu[C]karega [G]payega woh ud[D]dhar\n[Em]Yeshu Ma[C]sih hi [G]marg aur [D]satya [G]hai\n\n[G]Naam naam [C]Yeshu ka [D]naam\n[Em]Shaktishali ud[C]dhar ka [G]naam\n[G]Naam naam [C]Yeshu ka [D]naam\n[Em]Saare jahan का [C]raja का [G]naam',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE);

-- Batch 2 Cont. (136-150)
INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, lyrics_roman, chords, original_key, capo, bpm, time_signature, structure, created_by, is_active) VALUES
(136, 'प्रभु की स्तुति करेंगे', 'Johnson Martin', 'Johnson Martin', 'hindi',
'प्रभु की स्तुति करेंगे हम दिल से गाकर\nप्रभु की महिमा करेंगे हम झूम झूम कर\nउसकी दया बनी रहती है हम पर सदा\nउसका नाम ऊँचा हो सारे संसार में\n\nस्तुति हो स्तुति हो प्रभु की\nमहिमा हो महिमा हो प्रभु की\nप्रशंसा हो प्रशंसा हो प्रभु की\nजय जयकार हो प्रभु की',
'Prabhu ki stuti karenge ham dil se gaakar\nPrabhu ki mahima karenge ham jhoom jhoom kar\nUski daya bani rehti hai ham par sada\nUska naam ooncha ho saare sansar mein\n\nStuti ho stuti ho prabhu ki\nMahima ho mahima ho prabhu ki\nPrashansa ho prashansa ho prabhu ki\nJai jaikar ho prabhu ki',
'[G]Prabhu ki stuti ka[C]renge ham [D]dil se gaakar\n[G]Prabhu ki ma[C]hima karenge [D]ham jhoom jhoom [G]kar\n[Em]Uski daya ba[C]ni rehti [G]hai ham [D]par sada\n[Em]Uska naam [C]ooncha ho [D]saare san[G]sar में\n\n[G]Stuti ho [C]stuti [D]ho prabhu [G]ki\n[G]Mahima ho [C]mahi[D]ma ho prabhu [G]ki\n[Em]Prashansa ho [C]pra[D]shansa ho prabhu [G]ki\n[Em]Jai jai[D]kar ho [C]Prabhu [G]ki',
'G', 0, 118, '4/4', 'Verse1, Chorus', 1, TRUE),

(137, 'यीशु मसीह की जय', 'Traditional', 'Contemporary Worship', 'hindi',
'यीशु मसीह की जय हो सदा\nजीत हमारी निश्चित हुई\nमौत पर उसने विजय पायी\nहम सबको नया जीवन दिया\n\nगाओ ख़ुशी के साथ महिमा हो\nयीशु राजा की महिमा हो\nगाओ ख़ुशी के साथ महिमा हो\nयीशु मसीह ही प्रभु है',
'Yeshu Masih ki Jai ho sada\nJeet hamari nishchit hui\nMaut par usne vijay paayi\nHam sabko naya jeevan diya\n\nGao khushi ke saath mahima ho\nYeshu Raja ki mahima ho\nGao khushi ke saath mahima ho\nYeshu Masih hi Prabhu hai',
'[D]Yeshu Masih ki [G]Jai [D]ho sa[A]da\n[D]Jeet hamari [G]nishchit [D]hui [A]\n[Bm]Maut par usne [G]vijay [D]paayi\n[Bm]Ham sabko na[A]ya jeevan [D]diya\n\n[D]Gao khushi ke saath [G]mahi[D]ma ho\n[G]Yeshu Raja ki [D]mahi[A]ma ho\n[D]Gao khushi ke saath [G]mahi[D]ma ho\n[G]Yeshu Ma[A]sih hi Pra[D]bu hai',
'D', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(138, 'क्रूस पर अपनी जान दी', 'Traditional', 'Contemporary Worship', 'hindi',
'क्रूस पर अपनी जान दी तूने मेरे लिए\nकोड़ों की मार सही तूने मेरे लिए\nकितना महान तेरा प्यार है यीशु\nतूने बचाया मुझे पापों से यीशु\n\nधन्यवाद धन्यवाद धन्यवाद प्रभु\nतेरी ही दया से मैं जीवित हूँ\nधन्यवाद धन्यवाद धन्यवाद प्रभु\nतेरा ही नाम लूँ मैं सदा',
'Krus par apni jaan di Toone mere liye\nKodon ki maar sahi Toone mere liye\nKitna mahan tera pyaar hai Yeshu\nToone bachaya mujhe paapon se Yeshu\n\nDhanyawad dhanyawad dhanyawad Prabhu\nTeri hi daya se main jeevit hoon\nDhanyawad dhanyawad dhanyawad Prabhu\nTera hi naam loon main sada',
'[Em]Krus par apni [Am]jaan di [D]Toone mere [G]liye\n[Em]Kodon ki maar [Am]sahi [D]Toone mere [B]liye\n[Em]Kitna mahan [Am]tera [D]pyaar hai [G]Yeshu\n[Em]Toone bachaya [Am]mujhe [D]paapon se [B]Ye[Em]shu\n\n[Em]Dhanyawad dhanyawad [Am]dhanyawad [B]Prabhu\n[Em]Teri hi da[Am]ya se main [B]jeevit [Em]hoon\n[Em]Dhanyawad dhanyawad [Am]dhanyawad [B]Prabhu\n[Em]Tera hi [D]naam loon [G]main [B]sa[Em]da',
'Em', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(139, 'यहोवा यिरेह (Yahova Jireh)', 'Traditional', 'Contemporary Worship', 'hindi',
'यहोवा यिरेह मेरी ज़रूरत पूरी करता है\nवह मेरा बल है और मेरी शक्ति\nउसके वादे सदा सच्चे हैं\nवह मुझे कभी न छोड़ेगा\n\nयहोवा यिरेह मेरा प्रदाता\nतेरी महिमा हो सदा\nतू ही हमारा खुदा महान\nतेरी जय हो सदा',
'Yahova Jireh meri zaroorat puri karta hai\nWoh mera bal hai aur meri shakti\nUske waade sada sacche hain\nWoh mujhe kabhi na chhodega\n\nYahova Jireh mera pradata\nTeri mahima ho sada\nTu hi hamara Khuda mahan\nTeri jai ho sada',
'[C]Yahova Jireh [G]meri za[F]roorat [G]puri [C]karta hai\n[F]Woh mera [G]bal hai [C]aur meri [G]shakti\n[C]Uske waade [G]sada [F]sacche [G]hain\n[F]Woh mujhe ka[G]bhi na [C]chhodega\n\n[C]Yahova Jireh [F]mera pra[G]data\n[C]Teri ma[F]hima [C]ho [G]sada\n[C]Tu hi ha[F]mara Khu[G]da ma[C]han\n[F]Teri jai [G]ho sa[C]da',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(140, 'प्रभु मेरा चरवाहा (Contemporary)', 'Bridge Music', 'Bridge Music India', 'hindi',
'प्रभु मेरा चरवाहा मुझे कोई घटी नहीं\nहरी चरागाहों में वह मुझे बिठाता है\nमेरा प्याला भर देता है प्रभु\nतेरी दया सदा मुझ पर बनी रहती है\n\nतेरी स्तुति तेरी स्तुति\nमेरे दिल से निकले सदा\nतेरी महिमा तेरी महिमा\nसारे जहाँ में हो सदा',
'Prabhu mera charwaha mujhe koi ghati nahi\nHari charagahon mein woh mujhe bithata hai\nMera pyala bhar deta hai Prabhu\nTeri daya sada mujh par bani rehti hai\n\nTeri stuti teri stuti\nMere dil se nikle sada\nTeri mahima teri mahima\nSaare jahan mein ho sada',
'[G]Prabhu mera char[D]waha [C]mujhe koi ghati [D]nahi\n[G]Hari chara[D]gahon में [C]woh mujhe bi[D]thata [G]hai\n[Em]Mera pyala [C]bhar deta [G]hai Pra[D]bu\n[Em]Teri daya [C]sada mujh [G]par bani [D]rehti [G]hai\n\n[G]Teri stuti [C]teri [D]stuti\n[Em]Mere dil se [C]nikle [D]sada\n[G]Teri mahima [C]teri [D]mahima\n[Em]Saare ja[D]han में [C]ho sa[G]da',
'G', 0, 76, '4/4', 'Verse1, Chorus', 1, TRUE),

(141, 'तेरी महिमा (Teri Mahima)', 'Johnson Martin', 'Johnson Martin', 'hindi',
'तेरी महिमा हो सारे जहाँ में प्रभु\nतेरी स्तुति हो हर इक ज़बान पे प्रभु\nतूने हमारे लिए क्रूस को उठाया\nकि हम पा सकें जीवन महान\n\nयीशु यीशु तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nयीशु यीशु तू ही है प्रभु\nआराधना आराधना तेरी',
'Teri mahima ho saare jahan mein Prabhu\nTeri stuti ho har ik zaban pe Prabhu\nToone hamare liye krus ko uthaya\nKi ham pa saken jeevan mahan\n\nYeshu Yeshu Tu hi hai Prabhu\nMahima ho mahima ho teri\nYeshu Yeshu Tu hi hai Prabhu\nAradhana aradhana teri',
'[A]Teri mahima ho [D]saare ja[E]han में Pra[A]bu\n[A]Teri stuti ho [D]har ik za[E]ban pe Pra[A]bu\n[F#m]Toone ha[D]mare liye [E]krus ko u[A]thaya\n[F#m]Ki ham pa [D]saken jee[E]van ma[A]han\n\n[A]Yeshu Yeshu Tu [D]hi hai Pra[E]bu\n[F#m]Mahima ho ma[D]hima ho [E]teri\n[A]Yeshu Yeshu Tu [D]hi hai Pra[E]bu\n[F#m]Aradhana a[D]radhana [E]te[A]ri',
'A', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(142, 'होसन्ना (Hosanna)', 'Traditional', 'Contemporary Adaptation', 'hindi',
'होसन्ना होसन्ना महिमा यीशु की हो\nआसमाँ और ज़मीन में तेरी जय जयकार हो\nपवित्र पवित्र पवित्र है तू खुदा\nतेरी स्तुति हम गाएं मिलकर सदा\n\nराजाओं का राजा प्रभु का प्रभु\nजलाल का राजा यीशु मसीह\nस्वर्ग और पृथ्वी गाएं मिलकर\nपवित्र पवित्र पवित्र है प्रभु',
'Hosanna Hosanna mahima Yeshu ki ho\nAasman aur zameen mein teri jai jaikar ho\nPavitra pavitra pavitra hai Tu Khuda\nTeri stuti ham gaayein milkar sada\n\nRajayon ka raja Prabhu ka Prabhu\nJalal ka raja Yeshu Masih\nSwarg aur prithvi gaayein milkar\nPavitra pavitra pavitra hai Prabhu',
'[E]Hosanna Ho[B]sanna [A]mahima Yeshu [B]ki ho\n[E]Aasman aur za[B]meen में [A]teri jai jai[B]kar ho\n[F#m]Pavitra pavitra pa[B]vitra hai [E]Tu Khu[B]da\n[F#m]Teri stuti ham [B]gaayein milkar [E]sada\n\n[E]Rajayon ka [B]raja Pra[A]bu ka Pra[B]bu\n[E]Jalal ka [B]raja [A]Yeshu Ma[B]sih\n[E]Swarg aur prithvi [B]gaayein milkar\n[A]Pavitra pavitra pa[B]vitra hai [E]Prabhu',
'E', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(143, 'जय जय जय यीशु', 'Anil Kant', 'Anil Kant', 'hindi',
'जय जय जय यीशु तेरी जय मसीहा\nतू ही है मेरा प्यारा खुदा\nपापों से बचाने हमें तू आया\nस्वर्ग का रास्ता हमें दिखाया\n\nस्तुति हो तेरी स्तुति हो\nमहिमा हो तेरी महिमा हो\nसारे संसार में तेरा नाम ऊँचा हो\nयीशु मसीह तू ही प्रभु है',
'Jai Jai Jai Yeshu teri jai Masiha\nTu hi hai mera pyara Khuda\nPaapon se bachane hamein Tu aaya\nSwarg ka rasta hamein dikhaya\n\nStuti ho teri stuti ho\nMahima ho teri mahima ho\nSaare sansar mein tera naam ooncha ho\nYeshu Masih Tu hi Prabhu hai',
'[C]Jai Jai Jai [F]Yeshu teri [G]jai Ma[C]siha\n[C]Tu hi hai [F]mera pyara [G]Khu[C]da\n[C]Paapon se ba[F]chane [G]hamein Tu [C]aaya\n[C]Swarg ka ras[F]ta ha[G]mein di[C]khaya\n\n[C]Stuti ho [F]teri stu[G]ti [C]ho\n[F]Mahima ho [G]teri mahi[C]ma ho\n[F]Saare sansar में [G]tera naam [C]ooncha ho\n[F]Yeshu Ma[G]sih Tu hi [C]Prabhu hai',
'C', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(144, 'मसीही प्रेम (Masihi Prem)', 'Traditional', 'Bridge Music Adaptation', 'hindi',
'मसीही प्रेम कितना महान है\nजो हम पर छाया रहता है\nयीशु का प्यार कितना गहरा है\nजो हमें कभी नहीं छोड़ता\n\nपवित्र प्यार पवित्र प्यार\nयीशु तेरा पवित्र प्यार\nमहिमा हो महिमा हो\nतेरे प्यार की महिमा हो',
'Masihi prem kitna mahan hai\nJo ham par chhaya rehta hai\nYeshu ka pyaar kitna gehra hai\nJo hamein kabhi nahi chhodta\n\nPavitra pyaar Pavitra pyaar\nYeshu tera Pavitra pyaar\nMahima ho mahima ho\nTere pyaar ki mahima ho',
'[G]Masihi prem [C]kitna ma[D]han [G]hai\n[G]Jo ham par [C]chhaya [D]rehta [G]hai\n[Em]Yeshu ka pyaar [C]kitna [D]gehra [G]hai\n[Em]Jo hamein [C]kabhi na[D]hi chhod[G]ta\n\n[G]Pavitra [C]pyaar Pa[D]vitra [G]pyaar\n[Em]Yeshu tera Pa[C]vitra [D]pyaar\n[G]Mahima [C]ho mahi[D]ma [G]ho\n[Em]Tere pyaar [D]ki mahi[G]ma ho',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(145, 'दिल से आराधना (Johnson Martin)', 'Johnson Martin', 'Johnson Martin', 'hindi',
'दिल से आराधना करूँगा मैं तेरी\nहर इक पल महिमा करूँगा मैं तेरी\nतूने दी है अपनी जान मेरे लिए\nअब मैं तेरा ही रहूँगा सदा के लिए\n\nयीशु राजा यीशु राजा\nआराधना तेरी आराधना\nयीशु राजा यीशु राजा\nमहिमा तेरी महिमा',
'Dil se aradhana karoonga main teri\nHar ik pal mahima karoonga main teri\nToone di hai apni jaan mere liye\nAb main tera hi rahoonga sada ke liye\n\nYeshu Raja Yeshu Raja\nAradhana teri aradhana\nYeshu Raja Yeshu Raja\nMahima teri mahima',
'[Am]Dil se ara[F]dhana ka[G]roonga main [C]teri\n[Am]Har ik pal [F]mahima ka[G]roonga main [C]teri\n[Am]Toone di hai [F]apni jaan [G]mere [C]liye\n[Am]Ab main tera [F]hi rahoonga [G]sada ke [Am]liye\n\n[Am]Yeshu Raja [G]Yeshu Raja\n[F]Aradhana [G]teri ara[Am]dhana\n[Am]Yeshu Raja [G]Yeshu Raja\n[F]Mahima [G]teri mahi[Am]ma',
'Am', 0, 74, '4/4', 'Verse1, Chorus', 1, TRUE),

(146, 'मेरे यीशु (Mere Yeshu)', 'Traditional', 'Contemporary Worship', 'hindi',
'मेरे यीशु तू ही है मेरा खुदा\nतेरे बिना मैं कहाँ जाऊंगा प्रभु\nतू ही मार्ग और सत्य और जीवन है\nतुझ में ही मेरी जीत है सदा\n\nमहिमा हो महिमा हो तेरी\nतू ही हमारा उद्धारकर्ता\nस्तुति हो स्तुति हो तेरी\nतू ही हमारा परमेश्वर',
'Mere Yeshu Tu hi hai mera Khuda\nTere bina main kahan jaoonga Prabhu\nTu hi marg aur satya aur jeevan hai\nTujh mein hi meri jeet hai sada\n\nMahima ho mahima ho teri\nTu hi hamara uddharkarta\nStuti ho stuti ho teri\nTu hi hamara Parmeshwar',
'[D]Mere Yeshu Tu [G]hi hai mera [D]Khu[A]da\n[D]Tere bina main [G]kahan jaoon[D]ga Pra[A]bu\n[Bm]Tu hi marg aur [G]satya aur [D]jeevan [A]hai\n[Bm]Tujh mein hi [G]meri jeet [A]hai sa[D]da\n\n[D]Mahima ho ma[G]hima ho [D]teri\n[G]Tu hi ha[D]mare ud[A]dharkar[D]ta\n[Bm]Stuti ho stu[G]ti ho [D]teri\n[A]Tu hi ha[D]mare Par[A]mesh[D]war',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(147, 'तू ही है (Tu Hi Hai)', 'Amit Kamble', 'Amit Kamble (New Wine)', 'hindi',
'तू ही है मेरी शक्ति प्रभु\nतू ही है मेरा बल प्रभु\nजब तक है मेरी जान प्रभु\nतेरी ही आराधना मैं करूँ\n\nतू ही है तू ही है\nमेरा प्यारा खुदा तू ही है\nतू ही है तू ही है\nमेरा राजा प्रभु तू ही है',
'Tu hi hai meri shakti Prabhu\nTu hi hai mera bal Prabhu\nJab tak hai meri jaan Prabhu\nTeri hi aradhana main karoon\n\nTu hi hai Tu hi hai\nMera pyara Khuda Tu hi hai\nTu hi hai Tu hi hai\nMera raja Prabhu Tu hi hai',
'[G]Tu hi hai meri [C]shakti Pra[D]bu\n[G]Tu hi hai mera [C]bal Pra[D]bu\n[Em]Jab tak hai meri [C]jaan Pra[G]bu\n[Em]Teri hi a[C]radhana [D]main ka[G]roon\n\n[G]Tu hi hai [C]Tu hi [D]hai\n[G]Mera pyara [C]Khuda [D]Tu hi [G]hai\n[Em]Tu hi hai [C]Tu hi [D]hai\n[G]Mera raja [C]Prabhu [D]Tu hi [G]hai',
'G', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(148, 'सबसे ऊँचा (Sabse Uncha)', 'Bridge Music', 'Bridge Music India', 'hindi',
'सबसे ऊँचा तेरा नाम है यीशु\nसबसे शक्तिशाली तेरा काम है यीशु\nस्वर्ग और पृथ्वी तेरे चरणों में झुके\nतू ही है राजाओं का राजा प्रभु\n\nऊँचा ऊँचा ऊँचा नाम तेरा\nमहान महान महान काम तेरा\nस्तुति और महिमा हो सदा\nसिर्फ यीशु मसीह को',
'Sabse uncha Tera naam hai Yeshu\nSabse shaktishali Tera kaam hai Yeshu\nSwarg aur prithvi Tere charnon mein jhuke\nTu hi hai rajayon ka raja Prabhu\n\nUncha uncha uncha naam Tera\nMahan mahan mahan kaam Tera\nStuti aur mahima ho sada\nSirf Yeshu Masih ko',
'[E]Sabse uncha [B]Tera naam [A]hai Ye[B]shu\n[E]Sabse shakti[B]shali Tera [A]kaam hai Ye[B]shu\n[F#m]Swarg aur prithvi [E]Tere charnon [A]mein jhu[B]ke\n[F#m]Tu hi hai ra[E]jayon ka [A]raja Pra[B]bu\n\n[E]Uncha uncha [B]uncha naam [A]Tera\n[E]Mahan mahan [B]mahan kaam [A]Tera\n[F#m]Stuti aur [E]mahima [B]ho sa[E]da\n[A]Sirf [B]Yeshu Masih [E]ko',
'E', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(149, 'रूह-ए-पाक आ (Rooh-e-Paak Aa)', 'Traditional', 'Worship / Prayer', 'hindi',
'रूह-ए-पाक आ हमें छू ले\nअपनी आग से हमें भर दे\nतेरे बिना हम शक्तिहीन हैं\nअपनी सामर्थ्य से हमें नया कर दे\n\nआ रूह-ए-पाक आ\nहमें नया कर दे प्रभु\nआ रूह-ए-पाक आ\nहमें पवित्र कर दे प्रभु',
'Rooh-e-Paak Aa hamein choo le\nApni aag se hamein bhar de\nTere bina ham shaktihin hain\nApni samarth se hamein naya kar de\n\nAa Rooh-e-Paak Aa\nHamein naya kar de Prabhu\nAa Rooh-e-Paak Aa\nHamein pavitra kar de Prabhu',
'[Em]Rooh-e-Paak [Am]Aa ha[D]mein choo [G]le\n[Em]Apni aag se [Am]hamein bhar [D]de [B]\n[Em]Tere bina ham [Am]shaktihin [D]hain [G]\n[Em]Apni samarth [Am]se hamein naya [D]kar [Em]de\n\n[Em]Aa Rooh-e-Paak [Am]Aa\n[D]Hamein naya [G]kar de Pra[B]bu\n[Em]Aa Rooh-e-Paak [Am]Aa\n[D]Hamein pavitra [B]kar de Pra[Em]bu',
'Em', 0, 64, '4/4', 'Verse1, Chorus', 1, TRUE),

(150, 'यीशु तू है (Yeshu Tu Hai)', 'Traditional', 'Contemporary Worship', 'hindi',
'यीशु तू है मेरी ज़िंदगी\nयीशु तू है मेरी हर खुशी\nतेरे बिना मैं अधूरा हूँ\nतुझ में ही मैं पूरा हूँ\n\nआराधना आराधना\nयीशु मसीह की आराधना\nस्तुति और महिमा\nयीशु मसीह की महिमा',
'Yeshu Tu hai meri zindagi\nYeshu Tu hai meri har khushi\nTere bina main adhura hoon\nTujh mein hi main poora hoon\n\nAradhana aradhana\nYeshu Masih ki aradhana\nStuti aur mahima\nYeshu Masih ki mahima',
'[C]Yeshu Tu hai [G]meri zin[F]da[G]gi\n[C]Yeshu Tu hai [G]meri har [F]khu[G]shi\n[Am]Tere bina main [F]adhura [G]hoon\n[Am]Tujh mein hi main [F]poora [G]hoon [C]\n\n[C]Aradhana a[G]radhana\n[F]Yeshu Masih ki a[G]radhana\n[C]Stuti [G]aur ma[F]hima\n[G]Yeshu Masih ki mahima [C]',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE);

-- Batch 2 Finish & Batch 3 Start (151-170)
INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, lyrics_roman, chords, original_key, capo, bpm, time_signature, structure, created_by, is_active) VALUES
(151, 'मसीहा मसीहा (Masiha Masiha)', 'Johnson Martin', 'Johnson Martin', 'hindi',
'मसीहा मसीहा तू ही है मेरा खुदा\nमसीहा मसीहा तू ही है मेरा खुदा\nपापों से तूने है मुक्ति दिलाई\nस्वर्ग का रास्ता हमें दिखाया\n\nतेरी स्तुति तेरी महिमा\nहो सारे जहाँ में प्रभु\nतेरी आराधना तेरी प्रशंसा\nहो सारे जहाँ में प्रभु',
'Masiha Masiha Tu hi hai mera Khuda\nMasiha Masiha Tu hi hai mera Khuda\nPaapon se Toone hai mukti dilayi\nSwarg ka rasta hamein dikhaya\n\nTeri stuti teri mahima\nHo saare jahan mein Prabhu\nTeri aradhana teri prashansa\nHo saare jahan mein Prabhu',
'[Am]Masiha Masiha Tu [G]hi hai mera [Am]Khuda\n[Am]Masiha Masiha Tu [G]hi hai mera [Am]Khuda\n[F]Paapon se Too[G]ne hai [Am]mukti dilayi\n[F]Swarg ka ras[G]ta ha[Am]mein dikhaya\n\n[Am]Teri stuti [G]teri ma[Am]hima\n[F]Ho saare ja[G]han mein Pra[Am]bu\n[Am]Teri aradhana [G]teri pra[Am]shansa\n[F]Ho saare ja[G]han mein Pra[Am]bu',
'Am', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(152, 'जय हो जय हो (Jai Ho Jai Ho)', 'Traditional', 'Praise Chorus', 'hindi',
'जय हो जय हो यीशु की जय हो\nमहिमा हो महिमा हो यीशु की महिमा हो\nउसने ही हमें बचाया है\nउसका हम धन्यवाद करें सदा\n\nराजाओं का राजा प्रभु का प्रभु\nजलाल का राजा यीशु मसीह\nसारे जहाँ में उसका नाम ऊँचा हो\nजय हो जय हो जय हो',
'Jai ho Jai ho Yeshu ki Jai ho\nMahima ho Mahima ho Yeshu ki Mahima ho\nUsne hi hamein bachaya hai\nUska ham dhanyawad karein sada\n\nRajayon ka raja Prabhu ka Prabhu\nJalal ka raja Yeshu Masih\nSaare jahan mein uska naam ooncha ho\nJai ho Jai ho Jai ho',
'[D]Jai ho [G]Jai ho [D]Yeshu ki [A]Jai [D]ho\n[D]Mahima ho [G]Mahima ho [D]Yeshu ki [A]Mahi[D]ma ho\n[D]Usne hi ha[G]mein ba[D]chaya [A]hai\n[D]Uska ham [G]dhanyawad ka[A]rein sa[D]da\n\n[D]Rajayon ka [G]raja Pra[D]bu ka Pra[A]bu\n[D]Jalal ka [G]raja [D]Yeshu Ma[A]sih\n[D]Saare jahan में [G]uska naam [D]ooncha [A]ho\n[D]Jai ho [A]Jai ho [G]Jai [D]ho',
'D', 0, 116, '4/4', 'Verse1, Chorus', 1, TRUE),

(153, 'यीशु तेरा नाम (Psalmist)', 'Shelly Reddy', 'Psalmist Music', 'hindi',
'यीशु तेरा नाम कितना महान है\nसारे जहाँ में तेरा नाम ऊँचा है\nहर घुटना झुकेगा और हर ज़बान कहेगी\nकि यीशु तू ही है प्रभु\n\nमहिमा महिमा महिमा हो तेरी\nस्तुति स्तुति स्तुति हो तेरी\nतू ही हमारा खुदा महान\nतेरी जय हो सदा',
'Yeshu tera naam kitna mahan hai\nSaare jahan mein tera naam ooncha hai\nHar ghutna jhukega aur har zaban kahegi\nKi Yeshu Tu hi hai Prabhu\n\nMahima mahima mahima ho teri\nStuti stuti stuti ho teri\nTu hi hamara Khuda mahan\nTeri jai ho sada',
'[G]Yeshu Tera [C]naam kitna ma[D]han [G]hai\n[G]Saare jahan में [C]tera naam [D]ooncha [G]hai\n[Em]Har ghutna jhu[C]kega aur [G]har zaban ka[D]hegi\n[Em]Ki Yeshu [C]Tu hi [D]hai Pra[G]bu\n\n[G]Mahima ma[C]hima ma[D]hima ho [G]teri\n[G]Stuti stu[C]ti stu[D]ti ho [G]teri\n[Em]Tu hi ha[C]mara Khu[G]da ma[D]han\n[Em]Teri jai [D]ho sa[G]da',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(154, 'तू ही है (Bridge Music)', 'Bridge Music', 'Bridge Music India', 'hindi',
'तू ही है मेरा सहारा प्रभु\nतू ही है मेरी शक्ति प्रभु\nतेरे बिना मैं कुछ भी नहीं\nतेरी दया से मैं जीवित हूँ\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Tu hi hai mera sahara Prabhu\nTu hi hai meri shakti Prabhu\nTere bina main kuch bhi nahi\nTeri daya se main jeevit hoon\n\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nMahima ho mahima ho teri\nSaare jahan ka raja Tu hi hai',
'[E]Tu hi hai mera sa[B]hara Pra[A]bu\n[E]Tu hi hai meri [B]shakti Pra[A]bu\n[F#m]Tere bina main [E]kuch bhi [A]nahi\n[F#m]Teri daya se [B]main jeevit [E]hoon\n\n[E]Mahima ho ma[B]hima ho [A]teri\n[E]Yeshu Masih [B]Tu hi hai [A]Prabhu\n[E]Mahima ho ma[B]hima ho [A]teri\n[E]Saare jahan ka [B]raja Tu [A]hi [E]hai',
'E', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(155, 'हम तेरे चरणों में आए हैं', 'Traditional', 'Contemporary Worship', 'hindi',
'हम तेरे चरणों में आए हैं प्रभु\nअपनी स्तुति तुझे देने आए हैं प्रभु\nतू ही हमारा राजा तू ही हमारा खुदा\nतेरी ही महिमा हम गालें मिलकर सदा\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nआराधना आराधना तेरी\nसारे जहाँ का राजा तू ही है',
'Ham tere charnon mein aaye hain Prabhu\nApni stuti tujhe dene aaye hain Prabhu\nTu hi hamara raja Tu hi hamara Khuda\nTeri hi mahima ham gaalein milkar sada\n\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nAradhana aradhana teri\nSaare jahan ka raja Tu hi hai',
'[C]Ham tere charnon mein [G]aaye hain [C]Prabhu\n[C]Apni stuti tu[F]jhe dene [G]aaye hain [C]Prabhu\n[C]Tu hi ha[F]mara raja [G]Tu hi ha[C]mara Khuda\n[F]Teri hi ma[G]hima ham [C]gaalein milkar [G]sa[C]da\n\n[C]Mahima ho ma[G]hima ho [C]teri\n[F]Yeshu Masih [G]Tu hi hai [C]Prabhu\n[C]Aradhana a[G]radhana [C]teri\n[F]Saare jahan ka [G]raja Tu hi [C]hai',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(156, 'महिमा हो तेरी (Mahima Ho Teri)', 'Johnson Martin', 'Johnson Martin', 'hindi',
'महिमा हो तेरी महिमा हो सदा\nस्तुति हो तेरी स्तुति हो सदा\nतू ही है मेरा प्यार तू ही मेरी जान\nतेरी आराधना मैं करूँ सदा\n\nयीशु राजा यीशु राजा\nतेरा ही नाम लूँ मैं सदा\nयीशु राजा यीशु राजा\nतुझ में ही खो जाऊँ सदा',
'Mahima ho teri mahima ho sada\nStuti ho teri stuti ho sada\nTu hi hai mera pyaar Tu hi meri jaan\nTeri aradhana main karoon sada\n\nYeshu Raja Yeshu Raja\nTera hi naam loon main sada\nYeshu Raja Yeshu Raja\nTujh mein hi kho jaoon sada',
'[D]Mahima ho teri ma[G]hima ho [D]sada\n[G]Stuti ho [D]teri stu[A]ti ho [D]sada\n[Bm]Tu hi hai [G]mera pyaar [D]Tu hi meri [A]jaan\n[Bm]Teri ara[G]dhana main [A]karoon sa[D]da\n\n[D]Yeshu Raja [G]Yeshu Raja\n[D]Tera hi [A]naam loon main [D]sada\n[Bm]Yeshu Raja [G]Yeshu Raja\n[A]Tujh mein hi [D]kho jaoon sa[D]da',
'D', 0, 74, '4/4', 'Verse1, Chorus', 1, TRUE),

(157, 'यीशु के नाम में (Yeshu Ke Naam Mein)', 'Traditional', 'Renewal Worship', 'hindi',
'यीशु के नाम में है चंगाई\nयीशु के नाम में है मुक्ति\nयीशु के नाम में है नया जीवन\nयीशु के नाम में है शांति\n\nनाम नाम यीशु का नाम\nशक्तिशाली उद्धार का नाम\nनाम नाम यीशु का नाम\nसारे जहाँ का राजा का नाम',
'Yeshu ke naam mein hai changayi\nYeshu ke naam mein hai mukti\nYeshu ke naam mein hai naya jeevan\nYeshu के naam mein hai shanti\n\nNaam naam Yeshu ka naam\nShaktishali uddhar ka naam\nNaam naam Yeshu ka naam\nSaare jahan ka raja ka naam',
'[G]Yeshu ke naam mein [C]hai changa[G]yi\n[G]Yeshu ke naam [C]mein hai [D]mukti\n[Em]Yeshu ke naam में [C]hai naya [G]jeevan\n[Em]Yeshu ke [C]naam mein [D]hai shan[G]ti\n\n[G]Naam naam [C]Yeshu ka [D]naam\n[Em]Shaktishali ud[C]dhar ka [G]naam\n[G]Naam naam [C]Yeshu ka [D]naam\n[Em]Saare jahan का [C]raja का [G]naam',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(158, 'तू मेरा है (Tu Mera Hai)', 'Traditional', 'Contemporary Worship', 'hindi',
'तू मेरा है प्रभु तू मेरा है\nतेरे बिना मैं कहाँ जाऊंगा\nतू ही मेरा प्यार तू ही मेरा गीत\nतुझ में ही मेरी ज़िंदगी है\n\nमहिमा हो महिमा हो तेरी\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nमहिमा हो महिमा हो तेरी',
'Tu mera hai Prabhu Tu mera hai\nTere bina main kahan jaoonga\nTu hi mera pyaar Tu hi mera geet\nTujh mein hi meri zindagi hai\n\nMahima ho mahima ho teri\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nMahima ho mahima ho teri',
'[C]Tu mera hai [G]Prabhu Tu [C]mera hai\n[C]Tere bina main [F]kahan jaoon[G]ga\n[Am]Tu hi mera [F]pyaar Tu [G]hi mera [C]geet\n[Am]Tujh mein hi [F]meri zin[G]dagi [C]hai\n\n[C]Mahima ho ma[G]hima ho [C]teri\n[F]Mahima ho [G]mahima ho [C]teri\n[C]Yeshu Masih [G]Tu hi [F]hai Pra[C]bu\n[F]Mahima ho [G]mahima ho [C]teri',
'C', 0, 70, '4/4', 'Verse1, Chorus', 1, TRUE),

(159, 'पवित्र आत्मा (Anil Kant)', 'Anil Kant', 'Anil Kant', 'hindi',
'पवित्र आत्मा आ हमें छू ले\nअपनी आग से हमें भर दे\nतेरे बिना हम अधूरे हैं प्रभु\nअपनी सामर्थ्य से हमें नया कर दे\n\nपवित्र आत्मा पवित्र आत्मा\nमहिमा हो तेरी पवित्र आत्मा\nपवित्र आत्मा पवित्र आत्मा\nस्तुति हो तेरी पवित्र आत्मा',
'Pavitra Aatma Aa hamein choo le\nApni aag se hamein bhar de\nTere bina ham adhure hain Prabhu\nApni samarth se hamein naya kar de\n\nPavitra Aatma Pavitra Aatma\nMahima ho teri Pavitra Aatma\nPavitra Aatma Pavitra Aatma\nStuti ho teri Pavitra Aatma',
'[G]Pavitra Aatma [C]Aa hamein choo [G]le\n[G]Apni aag se [C]hamein bhar [D]de\n[Em]Tere bina ham [C]adhure [G]hain Pra[D]bu\n[Em]Apni samarth [C]se hamein naya [D]kar [G]de\n\n[G]Pavitra Aatma [C]Pavitra Aa[G]tma\n[Em]Mahima ho teri [C]Pavitra Aa[D]tma\n[G]Pavitra Aatma [C]Pavitra Aa[G]tma\n[Em]Stuti ho teri [D]Pavitra Aa[G]tma',
'G', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(160, 'यीशु तू है महान (Final)', 'Traditional', 'Contemporary Final', 'hindi',
'यीशु तू है महान सारे जहाँ में\nतेरी ही महिमा हो सदा\nतूने दी है अपनी जान हम गुनाहगारों के लिए\nकि हम पा सकें जीवन महान\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nआराधना आराधना तेरी\nसारे जहाँ का राजा तू ही है',
'Yeshu Tu hai mahan saare jahan mein\nTeri hi mahima ho sada\nToone di hai apni jaan ham gunahgaron ke liye\nKi ham pa saken jeevan mahan\n\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nAradhana aradhana teri\nSaare jahan ka raja Tu hi hai',
'[D]Yeshu Tu hai ma[G]han saare [D]jahan [A]mein\n[D]Teri hi ma[G]hima ho [D]sada [A]\n[Bm]Toone di hai [G]apni jaan ham [D]gunahgaron ke [A]liye\n[Bm]Ki ham pa [G]saken jee[A]van ma[D]han\n\n[D]Mahima ho ma[G]hima ho [D]teri\n[D]Yeshu Masih [G]Tu hi hai [A]Prabhu\n[D]Aradhana a[G]radhana [D]teri\n[G]Saare jahan ka [A]raja Tu hi [D]hai',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(161, 'हे प्रभु हे प्रभु (He Prabhu He Prabhu)', 'Traditional', 'Bhakti Style / Devotional', 'hindi',
'हे प्रभु हे प्रभु तेरे चरणों में हम आते हैं\nअपनी स्तुति तुझे देने हम आए हैं\nतू ही है मेरा प्यारा खुदा\nतेरी ही महिमा हम गाते हैं\n\nप्रभु तू ही मेरा बल है\nप्रभु तू ही मेरी शक्ति है\nजब तक है मेरी साँस प्रभु\nतेरी ही आराधना मैं करूँ',
'He Prabhu He Prabhu tere charnon mein ham aate hain\nApni stuti tujhe dene ham aaye hain\nTu hi hai mera pyara Khuda\nTeri hi mahima ham gaate hain\n\nPrabhu Tu hi mera bal hai\nPrabhu Tu hi meri shakti hai\nJab tak hai meri saans Prabhu\nTeri hi aradhana main karoon',
'[C]He Prabhu He Pra[G]bu tere [C]charnon में ham [G]aate hain\n[C]Apni stuti tu[F]jhe dene [G]ham aaye [C]hain\n[C]Tu hi hai [G]mera pyara [C]Khuda\n[F]Teri hi ma[G]hima ham [C]gaate hain\n\n[C]Prabhu Tu hi [G]mera bal [C]hai\n[F]Prabhu Tu hi [G]meri shak[C]ti hai\n[F]Jab tak hai meri [G]saans [C]Prabhu\n[F]Teri hi a[G]radhana [C]main karoon',
'C', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(162, 'चरणों में तेरे (Charanon Mein Tere)', 'Traditional', 'Bhakti Style', 'hindi',
'चरणों में तेरे सिर झुकाते हैं हम\nअपनी स्तुति तुझे देते हैं हम\nतू ही हमारा राजा तू ही हमारा खुदा\nतेरी ही महिमा हम गाते हैं सब\n\nमहिमा हो महिमा हो तेरी\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nमहिमा हो महिमा हो तेरी',
'Charanon mein Tere sir jhukate hain ham\nApni stuti Tujhe dete hain ham\nTu hi hamara raja Tu hi hamara Khuda\nTeri hi mahima ham gaate hain sab\n\nMahima ho mahima ho teri\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nMahima ho mahima ho teri',
'[Am]Charanon में Te[G]re sir jhu[Am]kate hain ham\n[Am]Apni stuti Tu[G]jhe dete [Am]hain ham\n[F]Tu hi ha[G]mara raja [Am]Tu hi ha[G]mara Khuda\n[F]Teri hi ma[G]hima ham [Am]gaate hain sab\n\n[Am]Mahima ho ma[G]hima ho [Am]teri\n[F]Mahima ho [G]mahima ho [Am]teri\n[Am]Yeshu Masih [G]Tu hi [F]hai Pra[Am]bu\n[F]Mahima ho [G]mahima ho [Am]teri',
'Am', 0, 64, '4/4', 'Verse1, Chorus', 1, TRUE),

(163, 'कैसा अनोखा है तेरा प्यार', 'Anil Kant', 'Anil Kant', 'hindi',
'कैसा अनोखा है तेरा प्यार\nजो तूने मुझ पर छाया है\nपापों से तूने है मुक्ति दिलाई\nस्वर्ग का रास्ता हमें दिखाया\n\nअनोखा प्यार अनोखा प्यार\nयीशु तेरा अनोखा प्यार\nमहिमा हो महिमा हो\nतेरे प्यार की महिमा हो',
'Kaisa anokha hai Tera pyaar\nJo Toone mujh par chhaya hai\nPaapon se Toone hai mukti dilayi\nSwarg ka rasta hamein dikhaya\n\nAnokha pyaar Anokha pyaar\nYeshu tera Anokha pyaar\nMahima ho mahima ho\nTere pyaar ki mahima ho',
'[G]Kaisa a[C]nokha [D]hai Tera [G]pyaar\n[G]Jo Toone [C]mujh par [D]chhaya [G]hai\n[Em]Paapon se Too[C]ne hai [G]mukti di[D]layi\n[Em]Swarg ka ras[C]ta ha[D]mein di[G]khaya\n\n[G]Anokha [C]pyaar A[D]nokha [G]pyaar\n[Em]Yeshu tera A[C]nokha [D]pyaar\n[G]Mahima [C]ho mahi[D]ma [G]ho\n[Em]Tere pyaar [D]ki mahi[G]ma ho',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(164, 'मेरे मन भला है (Mere Man Bhala Hai)', 'Traditional', 'Bhakti Style / Devotional', 'hindi',
'मेरे मन भला है प्रभु का नाम\nवह सब दुखों को हर लेता है\nपापों से वह मुक्ति दिलाता\nनया जीवन वह देता है\n\nभला है प्रभु भला है प्रभु\nमेरा खुदा भला है प्रभु\nभला है प्रभु भला है प्रभु\nमेरा राजा भला है प्रभु',
'Mere man bhala hai Prabhu ka naam\nWoh sab dukhon ko har leta hai\nPaapon se woh mukti dilata\nNaya jeevan woh deta hai\n\nBhala hai Prabhu bhala hai Prabhu\nMera Khuda bhala hai Prabhu\nBhala hai Prabhu bhala hai Prabhu\nMera Raja bhala hai Prabhu',
'[Em]Mere man [Am]bhala hai [B]Prabhu ka [Em]naam\n[Em]Woh sab du[Am]khon ko [B]har leta [Em]hai\n[Em]Paapon se [Am]woh mukti di[D]lata\n[G]Naya jee[B]van woh [Em]deta hai\n\n[Em]Bhala hai Pra[Am]bu bhala [B]hai Pra[Em]bu\n[Em]Mera Khu[Am]da bhala [B]hai Pra[Em]bu\n[Em]Bhala hai Pra[Am]bu bhala [B]hai Pra[Em]bu\n[Em]Mera Ra[D]ja bhala [G]hai Pra[B]bu [Em]',
'Em', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(165, 'यहोवा मेरा चरवाहा (Bhakti)', 'Traditional', 'Psalm 23 / Bhakti Style', 'hindi',
'यहोवा मेरा चरवाहा है मुझे कोई घटी नहीं\nहरी चरागाहों में वह मुझे बिठाता है\nमेरा प्याला भर देता है प्रभु\nतेरी दया सदा मुझ पर बनी रहती है\n\nप्रभु तू ही मेरा बल है\nप्रभु तू ही मेरी शक्ति है\nजब तक है मेरी साँस प्रभु\nतेरी ही आराधना मैं करूँ',
'Yahova mera charwaha hai mujhe koi ghati nahi\nHari charagahon mein woh mujhe bithata hai\nMera pyala bhar deta hai Prabhu\nTeri daya sada mujh par bani rehti hai\n\nPrabhu Tu hi mera bal hai\nPrabhu Tu hi meri shakti hai\nJab tak hai meri saans Prabhu\nTeri hi aradhana main karoon',
'[C]Yahova mera char[G]waha hai [C]mujhe koi ghati [G]nahi\n[C]Hari chara[G]gahon में [C]woh mujhe bi[F]thata [C]hai\n[C]Mera pyala [G]bhar deta [F]hai Pra[G]bu\n[C]Teri daya [G]sada mujh [F]par bani [G]rehti [C]hai\n\n[C]Prabhu Tu hi [G]mera bal [C]hai\n[F]Prabhu Tu hi [G]meri shak[C]ti hai\n[F]Jab tak hai meri [G]saans [C]Prabhu\n[F]Teri hi a[G]radhana [C]main karoon',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(166, 'तू मेरी शक्ति (Tu Meri Shakti)', 'Traditional', 'Bhakti Style', 'hindi',
'तू मेरी शक्ति तू मेरा बल\nतू ही सहारा मेरा हर पल\nतेरे बिना मैं कुछ भी नहीं\nतुझ में ही मेरी जीत है सदा\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Tu meri shakti Tu mera bal\nTu hi sahara mera har pal\nTere bina main kuch bhi nahi\nTujh mein hi meri jeet hai sada\n\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nMahima ho mahima ho teri\nSaare jahan ka raja Tu hi hai',
'[D]Tu meri [G]shakti [D]Tu mera [A]bal\n[D]Tu hi sa[G]hara [D]mera har [A]pal\n[Bm]Tere bina main [G]kuch bhi [D]nahi\n[Bm]Tujh mein hi [G]meri jeet [A]hai sa[D]da\n\n[D]Mahima ho ma[G]hima ho [D]teri\n[G]Yeshu Masih [D]Tu hi [A]hai Pra[D]bu\n[Bm]Mahima ho ma[G]hima ho [A]teri\n[Bm]Saare jahan ka [A]raja Tu [D]hi hai',
'D', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(167, 'प्रभु का नाम (Prabhu Ka Naam)', 'Traditional', 'Bhakti Style', 'hindi',
'प्रभु का नाम पवित्र है\nप्रभु का नाम महान है\nजो भी पुकारेगा पाएगा उद्धार\nप्रभु का नाम ही मार्ग है\n\nपवित्र नाम पवित्र नाम\nप्रभु का प्यारा पवित्र नाम\nपवित्र नाम पवित्र नाम\nप्रभु का प्यारा पवित्र नाम',
'Prabhu ka naam pavitra hai\nPrabhu ka naam mahan hai\nJo bhi pukarega payega uddhar\nPrabhu ka naam hi marg hai\n\nPavitra naam Pavitra naam\nPrabhu ka pyara Pavitra naam\nPavitra naam Pavitra naam\nPrabhu ka pyara Pavitra naam',
'[G]Prabhu ka naam pa[C]vitra [G]hai\n[G]Prabhu ka [C]naam ma[D]han [G]hai\n[Em]Jo bhi pu[C]karega [G]payega ud[D]dhar\n[Em]Prabhu ka [C]naam hi [D]marg [G]hai\n\n[G]Pavitra naam Pa[C]vitra [G]naam\n[G]Prabhu ka [C]pyara Pa[D]vitra [G]naam\n[Em]Pavitra naam Pa[C]vitra [G]naam\n[Em]Prabhu ka [D]pyara Pa[C]vitra [G]naam',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(168, 'मेरे यीशु रे (Mere Yeshu Re)', 'Traditional', 'Bhakti Style / Folk', 'hindi',
'मेरे यीशु रे तू ही मेरा खुदा\nमेरे यीशु रे तू ही मेरा सहारा\nतेरे बिना मैं कहाँ जाऊंगा रे\nतुझ में ही मेरी ज़िंदगी है रे\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Mere Yeshu re Tu hi mera Khuda\nMere Yeshu re Tu hi mera sahara\nTere bina main kahan jaoonga re\nTujh mein hi meri zindagi hai re\n\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nMahima ho mahima ho teri\nSaare jahan ka raja Tu hi hai',
'[Am]Mere Yeshu re [G]Tu hi mera [Am]Khuda\n[Am]Mere Yeshu re [G]Tu hi mera sa[Am]hara\n[F]Tere bina main [G]kahan jaoon[Am]ga re\n[F]Tujh mein hi [G]meri zin[Am]dagi hai re\n\n[Am]Mahima ho ma[G]hima ho [Am]teri\n[F]Yeshu Masih [G]Tu hi [Am]hai Pra[G]bu\n[F]Mahima ho [G]mahima ho [Am]teri\n[F]Saare jahan ka [G]raja Tu [Am]hi hai',
'Am', 0, 74, '4/4', 'Verse1, Chorus', 1, TRUE),

(169, 'आत्मा से भर दे (Atma Se Bhar De)', 'Traditional', 'Bhakti / Prayer', 'hindi',
'आत्मा से भर दे हमें प्रभु\nअपनी सामर्थ्य से नया कर दे प्रभु\nतेरे बिना हम अधूरे हैं प्रभु\nअपनी आग से हमें जला दे प्रभु\n\nभर दे हमें भर दे हमें\nपवित्र आत्मा भर दे हमें\nनया कर दे नया कर दे\nअपनी सामर्थ्य से नया कर दे',
'Atma se bhar de hamein Prabhu\nApni samarth se naya kar de Prabhu\nTere bina ham adhure hain Prabhu\nApni aag se hamein jala de Prabhu\n\nBhar de hamein bhar de hamein\nPavitra Aatma bhar de hamein\nNaya kar de naya kar de\nApni samarth se naya kar de',
'[Em]Atma se [Am]bhar de ha[B]mein Pra[Em]bu\n[Em]Apni samarth [Am]se naya [D]kar de [G]Pra[B]bu\n[Em]Tere bina ham [Am]adhure [D]hain Pra[G]bu\n[Em]Apni aag se ha[Am]mein jala [B]de Pra[Em]bu\n\n[Em]Bhar de ha[Am]mein bhar [B]de ha[Em]mein\n[Em]Pavitra Aat[Am]ma bhar [B]de ha[Em]mein\n[Em]Naya kar [Am]de naya [D]kar [G]de\n[Em]Apni samarth [Am]se naya [B]kar [Em]de',
'Em', 0, 64, '4/4', 'Verse1, Chorus', 1, TRUE),

(170, 'यीशु मसीह की जय (Bhakti)', 'Traditional', 'Bhakti Style', 'hindi',
'यीशु मसीह की जय हो सदा\nजीत हमारी निश्चित हुई\nमौत पर उसने विजय पायी\nहम सबको नया जीवन दिया\n\nजय जय जय यीशु तेरी जय\nमहिमा महिमा यीशु की महिमा\nजय जय जय यीशु तेरी जय\nमहिमा महिमा यीशु की महिमा',
'Yeshu Masih ki Jai ho sada\nJeet hamari nishchit hui\nMaut par usne vijay paayi\nHam sabko naya jeevan diya\n\nJai Jai Jai Yeshu teri Jai\nMahima mahima Yeshu ki mahima\nJai Jai Jai Yeshu teri Jai\nMahima mahima Yeshu ki mahima',
'[D]Yeshu Masih ki [G]Jai ho sa[D]da\n[D]Jeet hamari [G]nishchit [D]hui [A]\n[Bm]Maut par usne [G]vijay [D]paayi\n[Bm]Ham sabko na[A]ya jeevan [D]diya\n\n[D]Jai Jai Jai [G]Yeshu teri [D]Jai\n[G]Mahima ma[D]hima [A]Yeshu ki mahi[D]ma\n[Bm]Jai Jai Jai [G]Yeshu teri [D]Jai\n[A]Mahima ma[D]hima [G]Yeshu ki mahi[D]ma',
'D', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE);

-- Batch 3 Finish & Batch 4 Start (171-185)
INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, lyrics_roman, chords, original_key, capo, bpm, time_signature, structure, created_by, is_active) VALUES
(171, 'यहोवा ही मेरा चरवाहा', 'Traditional', 'Bhakti / Psalm 23', 'hindi',
'यहोवा ही मेरा चरवाहा मुझे कोई घटी नहीं\nहरी चरागाहों में वह मुझे बिठाता है\nमेरी आत्मा को वह ताज़ा करता है\nधर्म के मार्गों पर वह मुझे ले चलता है\n\nप्रभु तू ही मेरा बल है\nप्रभु तू ही मेरी शक्ति है\nजब तक है मेरी साँस प्रभु\nतेरी ही आराधना मैं करूँ',
'Yahova hi mera charwaha mujhe koi ghati nahi\nHari charagahon mein woh mujhe bithata hai\nMeri aatma ko woh taza karta hai\nDharm ke maargon par woh mujhe le chalta hai\n\nPrabhu Tu hi mera bal hai\nPrabhu Tu hi meri shakti hai\nJab tak hai meri saans Prabhu\nTeri hi aradhana main karoon',
'[G]Yahova hi mera char[D]waha [C]mujhe koi ghati [G]nahi\n[G]Hari chara[C]gahon में [G]woh mujhe bi[D]thata [G]hai\n[Em]Meri aatma ko [C]woh taza [G]karta [D]hai\n[Em]Dharm ke maar[C]gon par [D]woh mujhe le [G]chalta hai\n\n[G]Prabhu Tu hi [C]mera bal [G]hai\n[Em]Prabhu Tu hi [D]meri shak[G]ti hai\n[F]Jab tak hai meri [G]saans [C]Prabhu\n[F]Teri hi a[G]radhana [C]main karoon',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(172, 'प्रभु का धन्यवाद (Prabhu Ka Dhanyawad)', 'Traditional', 'Bhakti Style', 'hindi',
'प्रभु का धन्यवाद हो हर एक पल सदा\nउसकी दया हम पर बनी रहती है सदा\nपापों से बचाने हमें स्वर्ग छोड़ आया\nनया जीवन उसने हमें दिया है सदा\n\nधन्यवाद धन्यवाद धन्यवाद प्रभु\nतेरी ही दया से हम जीवित हैं प्रभु\nधन्यवाद धन्यवाद धन्यवाद प्रभु\nतेरा ही नाम हम लेते हैं सदा',
'Prabhu ka dhanyawad ho har ek pal sada\nUski daya ham par bani rehti hai sada\nPaapon se bachane hamein swarg chodh aaya\nNaya jeevan usne hamein diya hai sada\n\nDhanyawad dhanyawad dhanyawad Prabhu\nTeri hi daya se ham jeevit hain Prabhu\nDhanyawad dhanyawad dhanyawad Prabhu\nTera hi naam ham lete hain sada',
'[C]Prabhu ka dhar[G]nyawad [F]ho har ek [G]pal sa[C]da\n[C]Uski daya ham [F]par bani [G]rehti hai [C]sada\n[C]Paapon se ba[F]chane [G]hamein swarg [C]chodh [G]aaya\n[F]Naya jeevan [G]usne hamein [C]diya hai [G]sa[C]da\n\n[C]Dhanyawad [G]dhanyawad [F]dhanyawad [G]Prabhu\n[C]Teri hi da[F]ya se ham [G]jeevit [C]hain Pra[G]bu\n[C]Dhanyawad [G]dhanyawad [F]dhanyawad [G]Prabhu\n[C]Tera hi [G]naam ham [F]lete [G]hain sa[C]da',
'C', 0, 78, '4/4', 'Verse1, Chorus', 1, TRUE),

(173, 'मेरे यीशु तेरा नाम (Mere Yeshu Tera Naam)', 'Traditional', 'Devotional / Bhakti', 'hindi',
'मेरे यीशु तेरा नाम कितना पवित्र है\nमेरे यीशु तेरा काम कितना महान है\nतूने दी है अपनी जान मेरे लिए\nअब मैं तेरा ही रहूँगा सदा के लिए\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Mere Yeshu Tera naam kitna pavitra hai\nMere Yeshu Tera kaam kitna mahan hai\nToone di hai apni jaan mere liye\nAb main tera hi rahoonga sada ke liye\n\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nMahima ho mahima ho teri\nSaare jahan ka raja Tu hi hai',
'[D]Mere Yeshu Tera [G]naam kitna pa[D]vitra [A]hai\n[D]Mere Yeshu Tera [G]kaam kitna ma[D]han [A]hai\n[Bm]Toone di hai [G]apni jaan [D]mere [A]liye\n[Bm]Ab main tera [G]hi rahoonga [A]sada ke [D]liye\n\n[D]Mahima ho ma[G]hima ho [D]teri\n[G]Yeshu Masih [D]Tu hi [A]hai Pra[D]bu\n[Bm]Mahima ho ma[G]hima ho [A]teri\n[Bm]Saare jahan का [A]raja Tu [D]hi hai',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(174, 'तू मेरा राजा (Tu Mera Raja)', 'Traditional', 'Bhakti Style / Folk', 'hindi',
'तू मेरा राजा तू मेरा खुदा\nतेरे चरणों में मैं झुका रहूँ\nतू ही मेरा प्यार तू ही मेरा गीत\nतुझ में ही मेरी ज़िंदगी है\n\nजय जय जय यीशु तेरी जय\nमहिमा महिमा यीशु की महिमा\nजय जय जय यीशु तेरी जय\nमहिमा महिमा यीशु की महिमा',
'Tu mera Raja Tu mera Khuda\nTere charnon mein main jhuka rahoon\nTu hi mera pyaar Tu hi mera geet\nTujh mein hi meri zindagi hai\n\nJai Jai Jai Yeshu teri Jai\nMahima mahima Yeshu ki mahima\nJai Jai Jai Yeshu teri Jai\nMahima mahima Yeshu ki mahima',
'[Am]Tu mera Raja [G]Tu mera [Am]Khuda\n[Am]Tere charnon [G]mein main jhu[Am]ka rahoon\n[F]Tu hi mera [G]pyaar Tu [Am]hi mera [G]geet\n[F]Tujh mein hi [G]meri zin[Am]dagi [G]hai\n\n[Am]Jai Jai Jai [G]Yeshu teri [Am]Jai\n[F]Mahima ma[G]hima [Am]Yeshu ki mahi[G]ma\n[Am]Jai Jai Jai [G]Yeshu teri [Am]Jai\n[F]Mahima ma[G]hima [Am]Yeshu ki mahi[G]ma',
'Am', 0, 74, '4/4', 'Verse1, Chorus', 1, TRUE),

(175, 'शांति का दाता (Shanti Ka Daata)', 'Anil Kant', 'Anil Kant', 'hindi',
'शांति का दाता यीशु मसीह\nमुक्ति का दाता यीशु मसीह\nवह सबको चंगा करता है\nवह सबको नया जीवन देता है\n\nप्रभु का नाम पवित्र है\nप्रभु का नाम महान है\nजो भी पुकारेगा पाएगा उद्धार\nप्रभु का नाम ही मार्ग है',
'Shanti ka Daata Yeshu Masih\nMukti ka Daata Yeshu Masih\nWoh sabko changa karta hai\nWoh sabko naya jeevan deta hai\n\nPrabhu ka naam pavitra hai\nPrabhu ka naam mahan hai\nJo bhi pukarega payega uddhar\nPrabhu ka naam hi marg hai',
'[G]Shanti ka Daata [C]Yeshu Ma[G]sih\n[G]Mukti ka Daata [C]Yeshu Ma[D]sih\n[G]Woh sabko [C]changa [G]karta [D]hai\n[Em]Woh sabko [C]naya jee[D]van deta [G]hai\n\n[G]Prabhu ka [C]naam pa[D]vitra [G]hai\n[G]Prabhu ka [C]naam ma[D]han [G]hai\n[Em]Jo bhi pu[C]karega [D]payega ud[G]dhar\n[Em]Prabhu ka [C]naam hi [D]marg [G]hai',
'G', 0, 70, '4/4', 'Verse1, Chorus', 1, TRUE),

(176, 'तेरी स्तुति (Teri Stuti)', 'Traditional', 'Bhakti prayer', 'hindi',
'तेरी स्तुति मैं करूँ हर इक पल प्रभु\nतेरी महिमा मैं करूँ हर इक पल प्रभु\nतू ही मेरा बल है तू ही शक्ति है\nतेरी सामर्थ्य से मेरा जीवन बदल दे\n\nस्तुति हो स्तुति हो प्रभु की\nमहिमा हो महिमा हो प्रभु की\nभरो हमें पवित्र आत्मा से\nनया कर दो अपने सामर्थ्य से',
'Teri stuti main karoon har ik pal Prabhu\nTeri mahima main karoon har ik pal Prabhu\nTu hi mera bal hai Tu hi shakti hai\nTeri samarth se mera jeevan badal de\n\nStuti ho stuti ho prabhu ki\nMahima ho mahima ho prabhu ki\nBharo hamein Pavitra Aatma se\nNaya kar do apne samarth se',
'[D]Teri stuti main ka[G]roon har [D]ik pal Pra[A]bu\n[D]Teri mahima main ka[G]roon har [D]ik pal Pra[A]bu\n[Bm]Tu hi mera [G]bal hai [D]Tu hi shak[A]ti hai\n[Bm]Teri sam[G]arth se [A]mera jeevan ba[D]dal de\n\n[D]Stuti ho [G]stuti [A]ho prabhu [D]ki\n[D]Mahima ho [G]mahi[A]ma ho prabhu [D]ki\n[Bm]Bharo hamein Pa[G]vitra [A]Aatma [D]se\n[Bm]Naya kar [A]do apne [G]samarth [D]se',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(177, 'मसीहा तू है (Bhakti)', 'Traditional', 'Traditional / Masih Bhajan', 'hindi',
'मसीहा तू है मेरा खुदा तेरी जय सदा\nतूने दी है अपनी जान मेरे लिए सदा\nपापों से तूने है मुक्ति दिलाई\nस्वर्ग का रास्ता हमें दिखाया\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nआराधना आराधना तेरी\nसारे जहाँ का राजा तू ही है',
'Masiha Tu hai mera Khuda teri Jai sada\nToone di hai apni jaan mere liye sada\nPaapon se Toone hai mukti dilayi\nSwarg ka rasta hamein dikhaya\n\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nAradhana aradhana teri\nSaare jahan ka raja Tu hi hai',
'[Em]Masiha Tu hai mera [Am]Khuda teri [Em]Jai sa[B]da\n[Em]Toone di hai apni [Am]jaan mere [Em]liye sa[B]da\n[Em]Paapon se Too[Am]ne hai [D]mukti di[G]layi\n[Em]Swarg ka ras[Am]ta ha[B]mein di[Em]khaya\n\n[Em]Mahima ho ma[Am]hima ho [Em]teri\n[Am]Yeshu Masih [D]Tu hi [G]hai Pra[B]bu\n[Em]Aradhana a[Am]radhana [Em]teri\n[Am]Saare jahan ka [B]raja Tu [Em]hi hai',
'Em', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(178, 'पावों में मैं झुका रहूँ', 'Traditional', 'Bhakti / Devotional', 'hindi',
'पावों में मैं झुका रहूँ तेरे चरणों में\nतुझ में ही मैं छिपा रहूँ तेरे चरणों में\nतू ही मेरा प्यार तू ही मेरा गीत\nतुझ में ही मेरी ज़िंदगी है प्रभु\n\nमहिमा हो महिमा हो तेरी\nयीशु राजा तू ही है प्रभु\nस्तुति हो स्तुति हो तेरी\nयीशु राजा तू ही है प्रभु',
'Paawon mein main jhuka rahoon tere charnon mein\nTujh mein hi main chipa rahoon tere charnon mein\nTu hi mera pyaar Tu hi mera geet\nTujh mein hi meri zindagi hai Prabhu\n\nMahima ho mahima ho teri\nYeshu Raja Tu hi hai Prabhu\nStuti ho stuti ho teri\nYeshu Raja Tu hi hai Prabhu',
'[G]Paawon mein main jhu[C]ka rahoon [D]tere charnon [G]mein\n[G]Tujh mein hi main chi[C]pa rahoon [D]tere charnon [G]mein\n[Em]Tu hi मेरा [C]pyaar Tu [G]hi mera [D]geet\n[Em]Tujh mein hi [C]meri zin[D]dagi hai Pra[G]bu\n\n[G]Mahima ho ma[C]hima ho [D]teri\n[G]Yeshu Raja [C]Tu hi [D]hai Pra[G]bu\n[Em]Stuti ho stu[C]ti ho [D]teri\n[Em]Yeshu Raja [D]Tu hi [C]hai Pra[G]bu',
'G', 0, 64, '4/4', 'Verse1, Chorus', 1, TRUE),

(179, 'दिल से आराधना (Bhakti)', 'Traditional', 'Devotional prayer', 'hindi',
'दिल से आराधना करूँ मैं तेरी प्रभु\nआत्मा से स्तुति करूँ मैं तेरी प्रभु\nतू ही मेरा बल तू ही मेरी शक्ति\nतेरी ही महिमा मैं गाऊँ सदा\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nआराधना आराधना तेरी\nसारे जहाँ का राजा तू ही है',
'Dil se aradhana karoon main teri Prabhu\nAatma se stuti karoon main teri Prabhu\nTu hi mera bal Tu hi meri shakti\nTeri hi mahima main gaoon sada\n\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nAradhana aradhana teri\nSaare jahan ka raja Tu hi hai',
'[C]Dil se ara[G]dhana ka[C]roon main teri [G]Prabhu\n[C]Aatma se [F]stuti ka[G]roon main teri [C]Prabhu\n[Am]Tu hi mera [F]bal Tu [G]hi meri [C]shakti\n[Am]Teri hi ma[F]hima main [G]gaoon [C]sada\n\n[C]Mahima ho ma[G]hima ho [C]teri\n[F]Yeshu Masih [G]Tu hi [F]hai Pra[C]bu\n[C]Aradhana a[G]radhana [C]teri\n[F]Saare jahan ka [G]raja Tu [F]hi [C]hai',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(180, 'यीशु मसीह महान', 'Traditional', 'Bhakti Final', 'hindi',
'यीशु मसीह महान तू ही है प्रभु\nतेरी ही महिमा हो सारे संसार में\nपापों से तूने है मुक्ति दिलाई\nस्वर्ग का रास्ता हमें दिखाया\n\nजय जय जय यीशु तेरी जय\nमहिमा महिमा यीशु की महिमा\nजय जय जय यीशु तेरी जय\nमहिमा महिमा यीशु की महिमा',
'Yeshu Masih mahan Tu hi hai Prabhu\nTeri hi mahima ho saare sansar mein\nPaapon se Toone hai mukti dilayi\nSwarg ka rasta hamein dikhaya\n\nJai Jai Jai Yeshu teri Jai\nMahima mahima Yeshu ki mahima\nJai Jai Jai Yeshu teri Jai\nMahima mahima Yeshu ki mahima',
'[G]Yeshu Masih ma[C]han Tu [G]hi hai Pra[D]bu\n[G]Teri hi ma[C]hima ho [G]saare san[D]sar [G]mein\n[Em]Paapon se Too[C]ne hai [G]mukti di[D]layi\n[Em]Swarg ka ras[C]ta ha[D]mein di[G]khaya\n\n[G]Jai Jai [C]Jai Yeshu [G]teri [D]Jai\n[G]Mahima ma[C]hima [G]Yeshu ki mahi[D]ma\n[Em]Jai Jai [D]Jai Yeshu [C]teri [G]Jai\n[D]Mahima ma[G]hima [C]Yeshu ki mahi[G]ma',
'G', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(181, 'ख़ुशी ख़ुशी नया गीत गाओ', 'Traditional', 'Traditional Christmas Carol', 'hindi',
'ख़ुशी ख़ुशी नया गीत गाओ मसीह पैदा हुआ\nआज रात बेथलेहेम में मुक्ति दाता आया है\nपापों से बचाने हमें स्वर्ग छोड़ आया है\nउसका हम स्वागत करें दिल से गाकर गीत नया\n\nगाओ ख़ुशी के साथ महिमा हो\nराजाओं का राजा आया है\nगाओ ख़ुशी के साथ महिमा हो\nयीशु मसीह ही प्रभु है',
'Khushi khushi naya geet gao Masih paida hua\nAaj raat Bethlehem mein mukti data aaya hai\nPaapon se bachane hamein swarg chodh aaya hai\nUska ham swagat karein dil se gaakar geet naya\n\nGao khushi ke saath mahima ho\nRajayon ka raja aaya hai\nGao khushi ke saath mahima ho\nYeshu Masih hi Prabhu hai',
'[D]Khushi khushi naya [G]geet gao Ma[D]sih paida [A]hua\n[D]Aaj raat Bethle[G]hem mein [D]mukti data [A]aaya [D]hai\n[D]Paapon se ba[G]chane hamein [D]swarg chodh [A]aaya hai\n[D]Uska ham swa[G]gat karein [D]dil se gaa[A]kar geet [D]naya\n\n[D]Gao khushi ke saath [G]mahi[D]ma ho\n[G]Rajayon ka [D]raja [A]aaya hai\n[D]Gao khushi ke saath [G]mahi[D]ma ho\n[G]Yeshu Ma[A]sih hi Pra[D]bu hai',
'D', 0, 120, '4/4', 'Verse1, Chorus', 1, TRUE),

(182, 'देखो आसमान में तारा', 'Traditional', 'Christmas Carol', 'hindi',
'देखो आसमान में तारा चमक रहा है सदा\nबेथलेहेम की ओर हमें बुला रहा है सदा\nवहाँ जन्मा है उद्धारकर्ता यीशु मसीह प्रभु\nसारे जहाँ का राजा शांति का दाता प्रभु\n\nआओ मिलकर सिजदा करें\nराजाओं के राजा को\nआओ मिलकर महिमा करें\nयीशु मसीह प्रभु को',
'Dekho aasman mein tara chamak raha hai sada\nBethlehem ki ore hamein bula raha hai sada\nWahan janma hai uddharkarta Yeshu Masih Prabhu\nSaare jahan ka raja shanti ka data Prabhu\n\nAao milkar sijda karein\nRajayon ke raja ko\nAao milkar mahima karein\nYeshu Masih Prabhu ko',
'[G]Dekho aasman mein [C]tara cha[G]mak raha hai [D]sada\n[G]Bethlehem ki [C]ore hamein [G]bula raha hai [D]sada\n[Em]Wahan janma hai ud[C]dharkarta [G]Yeshu Ma[G]sih Pra[D]bu\n[Em]Saare jahan ka [C]raja shan[D]ti ka data [G]Prabhu\n\n[G]Aao milkar [C]sijda ka[D]rein\n[G]Rajayon ke [C]raja [D]ko\n[Em]Aao milkar [C]mahima ka[D]rein\n[Em]Yeshu Ma[D]sih Pra[G]bu ko',
'G', 0, 80, '4/4', 'Verse1, Chorus', 1, TRUE),

(183, 'शांत रात (Silent Night)', 'Joseph Mohr', 'Joseph Mohr / Hindi Adaptation', 'hindi',
'शांत रात पवित्र रात\nसब सोये सिर्फ माँ-बाप\nप्यारा सा बच्चा बेथलेहेम में\nस्वर्ग की शांति लाता है यहाँ\n\nयीशु राजा यीशु राजा\nतेरी जय हो तेरी जय हो\nतू ही है मेरा प्यारा खुदा\nतेरी महिमा हो सदा',
'Shant raat pavitra raat\nSab soye sirf maa-baap\nPyara sa baccha Bethlehem mein\nSwarg ki shanti laata hai yahan\n\nYeshu Raja Yeshu Raja\nTeri jai ho teri jai ho\nTu hi hai mera pyara Khuda\nTeri mahima ho sada',
'[C]Shant raat pa[G]vitra [C]raat\n[F]Sab soye [G]sirf maa-[C]baap\n[F]Pyara sa baccha [G]Bethle[C]hem में\n[G]Swarg ki shanti [F]laata hai [G]ya[C]han\n\n[C]Yeshu Raja [G]Yeshu [C]Raja\n[F]Teri [G]jai ho [C]teri [G]jai ho\n[F]Tu hi [G]hai mera [C]pyara [G]Khuda\n[F]Teri ma[G]hima [C]ho sa[G]da',
'C', 0, 64, '3/4', 'Verse1, Chorus', 1, TRUE),

(184, 'सारी सृष्टि जॉय जॉय गाओ (Joy to the World)', 'Isaac Watts', 'Isaac Watts / Hindi Adaptation', 'hindi',
'सारी सृष्टि जॉय जॉय गाओ राजा आया है\nजगत का उद्धार करने यीशु आया है\nआँखें अपनी खोलें और देखें खुदा को\nशांति का राजकुमार यहाँ आया है\n\nजॉय जॉय जॉय प्रभु की जय\nमहिमा महिमा यीशु की महिमा\nजॉय जॉय जॉय प्रभु की जय\nमहिमा महिमा यीशु की महिमा',
'Sari srishti Joy Joy gao Raja aaya hai\nJagat ka uddhar karne Yeshu aaya hai\nAankhein apni kholein aur dekhein Khuda ko\nShanti ka Rajkumar yahan aaya hai\n\nJoy Joy Joy Prabhu ki Jai\nMahima mahima Yeshu ki mahima\nJoy Joy Joy Prabhu ki Jai\nMahima mahima Yeshu ki mahima',
'[D]Sari srishti [G]Joy Joy [D]gao [A]Raja aaya [D]hai\n[D]Jagat ka ud[G]dhar karne [D]Yeshu [A]aaya [D]hai\n[Bm]Aankhein apni [G]kholein aur [D]dekhein Khu[A]da ko\n[Bm]Shanti ka Raj[G]kumar ya[A]han aaya [D]hai\n\n[D]Joy Joy Joy [G]Prabhu ki [D]Jai\n[G]Mahima ma[D]hima [A]Yeshu ki mahi[D]ma\n[Bm]Joy Joy [G]Joy Prabhu [D]ki Jai\n[A]Mahima ma[D]hima [G]Yeshu ki mahi[D]ma',
'D', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(185, 'आया है मसीहा (Aaya Hai Masiha)', 'Traditional', 'Christmas Carol', 'hindi',
'आया है मसीहा देखो कितना महान दिन है\nमुक्ति दाता जन्मा है जगत का उद्धार करने\nपापों से बचाने हमें स्वर्ग छोड़ आया है\nउसका हम स्वागत करें दिल से गाकर गीत नया\n\nमहिमा हो महिमा हो तेरी\nयीशु राजा तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Aaya hai Masiha dekho kitna mahan din hai\nMukti data janma hai jagat ka uddhar karne\nPaapon se bachane hamein swarg chodh aaya hai\nUska ham swagat karein dil se gaakar geet naya\n\nMahima ho mahima ho teri\nYeshu Raja Tu hi hai Prabhu\nMahima ho mahima ho teri\nSaare jahan ka raja Tu hi hai',
'[G]Aaya hai Ma[C]siha dekho [G]kitna mahan [D]din hai\n[G]Mukti data [C]janma hai [G]jagat ka uddhar [D]karne\n[Em]Paapon se ba[C]chane hamein [G]swarg chodh [D]aaya hai\n[Em]Uska ham swa[C]gat karein [G]dil se gaa[D]kar geet [G]naya\n\n[G]Mahima ho ma[C]hima ho [D]teri\n[G]Yeshu Raja [C]Tu hi [D]hai Pra[G]bu\n[Em]Mahima ho ma[C]hima ho [D]teri\n[Em]Saare ja[D]han का [C]raja Tu [G]hi hai',
'G', 0, 120, '4/4', 'Verse1, Chorus', 1, TRUE),

-- Batch 5: Christmas (Finish) & Easter (186-200)
INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, lyrics_roman, chords, original_key, capo, bpm, time_signature, structure, created_by, is_active) VALUES
(186, 'चरवाहों को चरागाह में', 'Traditional', 'Christmas Carol', 'hindi',
'चरवाहों को चरागाह में स्वर्गदूत दिखा\nशुभ समाचार सुनाने स्वर्ग से उतरा\nआज जन्मा है मसीह बेथलेहेम नगर में\nआओ चलकर देखें हम राजा के चरणों में\n\nमहिमा हो महिमा हो तेरी\nयीशु राजा तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Charwahon ko charagah mein swargdoot dikha\nShubh samachar sunane swarg se utra\nAaj janma hai Masih Bethlehem nagar mein\nAao chalkar dekhein ham Raja ke charnon mein\n\nMahima ho mahima ho teri\nYeshu Raja Tu hi hai Prabhu\nMahima ho mahima ho teri\nSaare jahan ka raja Tu hi hai',
'[D]Charwahon ko cha[G]ragah में [D]swargdoot di[A]kha\n[D]Shubh sama[G]char sunane [D]swarg se u[A]tra\n[Bm]Aaj janma hai [G]Masih Bethle[D]hem nagar [A]mein\n[Bm]Aao chal[G]kar dekhein ham [A]Raja ke charnon [D]mein\n\n[D]Mahima ho ma[G]hima ho [D]teri\n[D]Yeshu Raja [G]Tu hi [A]hai Pra[D]bu\n[Bm]Mahima ho ma[G]hima ho [A]teri\n[Bm]Saare jahan का [A]raja Tu [D]hi hai',
'D', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(187, 'बेथलेहेम में जन्मा है', 'Traditional', 'Christmas Carol', 'hindi',
'बेथलेहेम में जन्मा है हमारा राजा\nशांति का राजकुमार यीशु मसीह प्रभु\nस्वर्ग की महिमा छोड़ यहाँ आया है\nमुक्ति का मार्ग हमें दिखाने आया है\n\nमहिमा महिमा यीशु की महिमा\nस्तुति स्तुति यीशु की स्तुति\nपवित्र नाम है राजा का नाम\nजय जयकार हो सदा के लिए',
'Bethlehem mein janma hai hamara Raja\nShanti ka Rajkumar Yeshu Masih Prabhu\nSwarg ki mahima chodh yahan aaya hai\nMukti ka marg hamein dikhane aaya hai\n\nMahima mahima Yeshu ki mahima\nStuti stuti Yeshu ki stuti\nPavitra naam hai Raja ka naam\nJai jaikar ho sada ke liye',
'[G]Bethlehem mein [C]janma hai ha[G]mara Ra[D]ja\n[G]Shanti ka Raj[C]kumar [G]Yeshu Ma[D]sih Pra[G]bu\n[Em]Swarg ki mahi[C]ma chodh ya[G]han aaya [D]hai\n[Em]Mukti ka [C]marg hamein di[D]khane aaya [G]hai\n\n[G]Mahima ma[C]hima Ye[G]shu ki mahi[D]ma\n[G]Stuti stu[C]ti Ye[G]shu ki stu[D]ti\n[Em]Pavitra [C]naam hai [G]Raja ka [D]naam\n[Em]Jai jai[D]kar ho [C]sada ke [G]liye',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(188, 'एक सितारा चमका (Ek Sitara Chamka)', 'Traditional', 'Christmas Carol', 'hindi',
'एक सितारा चमका आसमाँ की ओर\nशुभ संदेशा लाया बेथलेहेम की ओर\nराजाओं का राजा जन्मा है आज\nमुक्ति का दाता आया है आज\n\nजॉय जॉय जॉय प्रभु की जय\nमहिमा महिमा यीशु की महिमा\nजॉय जॉय जॉय प्रभु की जय\nमहिमा महिमा यीशु की महिमा',
'Ek sitara chamka aasman ki ore\nShubh sandesha laya Bethlehem ki ore\nRajayon ka raja janma hai aaj\nMukti ka data aaya hai aaj\n\nJoy Joy Joy Prabhu ki Jai\nMahima mahima Yeshu ki mahima\nJoy Joy Joy Prabhu ki Jai\nMahima mahima Yeshu ki mahima',
'[D]Ek sitara [G]chamka [D]aasman ki [A]ore\n[D]Shubh san[G]desha laya [D]Bethlehem ki [A]ore [D]\n[Bm]Rajayon ka [G]raja [D]janma hai [A]aaj\n[Bm]Mukti ka [G]data [A]aaya hai [D]aaj\n\n[D]Joy Joy Joy [G]Prabhu ki [D]Jai\n[G]Mahima ma[D]hima [A]Yeshu ki mahi[D]ma\n[Bm]Joy Joy [G]Joy Prabhu [D]ki Jai\n[A]Mahima ma[D]hima [G]Yeshu ki mahi[D]ma',
'D', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(189, 'मरियम का बेटा (Mary Boy Child)', 'Traditional', 'Christmas Adaptation', 'hindi',
'मरियम का बेटा यीशु मसीह\nआज जन्मा है बेथलेहेम में\nस्वर्गदूत गाएं महिमा उसकी\nजगत का उद्धार करने आया है\n\nगाओ ख़ुशी के साथ महिमा हो\nयीशु राजा की महिमा हो\nगाओ ख़ुशी के साथ महिमा हो\nयीशु मसीह ही प्रभु है',
'Maryam ka beta Yeshu Masih\nAaj janma hai Bethlehem mein\nSwargdoot gaayein mahima uski\nJagat ka uddhar karne aaya hai\n\nGao khushi ke saath mahima ho\nYeshu Raja ki mahima ho\nGao khushi ke saath mahima ho\nYeshu Masih hi Prabhu hai',
'[G]Maryam ka [C]beta [D]Yeshu Ma[G]sih\n[G]Aaj janma [C]hai Bethle[D]hem [G]mein\n[Em]Swargdoot [C]gaayein ma[G]hima us[D]ki\n[Em]Jagat ka ud[C]dhar karne [D]aaya [G]hai\n\n[G]Gao khushi ke saath [C]mahi[G]ma ho\n[C]Yeshu Raja ki [D]mahi[G]ma ho\n[Em]Gao khushi ke saath [C]mahi[G]ma ho\n[C]Yeshu Ma[D]sih hi Pra[G]bu hai',
'G', 0, 84, '4/4', 'Verse1, Chorus', 1, TRUE),

(190, 'गाओ गाओ खुशी से', 'Traditional', 'Christmas Final', 'hindi',
'गाओ गाओ खुशी से मसीह पैदा हुआ\nझूमो नाचो खुशी से राजा पैदा हुआ\nआज रात बेथलेहेम में तारा चमका है\nशांति का राजकुमार यहाँ आया है\n\nमहिमा हो महिमा हो तेरी\nयीशु राजा तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Gao gao khushi se Masih paida hua\nJhumo nacho khushi se Raja paida hua\nAaj raat Bethlehem mein tara chamka hai\nShanti ka Rajkumar yahan aaya hai\n\nMahima ho mahima ho teri\nYeshu Raja Tu hi hai Prabhu\nMahima ho mahima ho teri\nSaare jahan ka raja Tu hi hai',
'[C]Gao gao khushi se [F]Masih paida [G]hua\n[C]Jhumo nacho khushi se [F]Raja paida [G]hua\n[Am]Aaj raat Bethle[F]hem में [G]tara chamka [C]hai\n[Am]Shanti ka Raj[F]kumar ya[G]han aaya [C]hai\n\n[C]Mahima ho ma[G]hima ho [C]teri\n[F]Yeshu Raja [G]Tu hi [F]hai Pra[C]bu\n[Am]Mahima ho ma[F]hima ho [G]teri\n[Am]Saare ja[G]han का [F]raja Tu [C]hi hai',
'C', 0, 120, '4/4', 'Verse1, Chorus', 1, TRUE),

(191, 'जो क्रूस पे कुर्बान है', 'Traditional', 'Easter Hymn / traditional', 'hindi',
'जो क्रूस पे कुर्बान है वह मेरा मसीहा है\nजो कब्र में से जी उठा वह मेरा मसीहा है\nउसकी दया बनी रहती है मुझ पर सदा\nउसका धन्यवाद करूँ मैं हृदय से सदा\n\nयीशु मसीह ज़िंदा है सदा\nमौत पर उसने विजय पायी है\nयीशु मसीह ज़िंदा है सदा\nहम सबको नया जीवन दिया है',
'Jo krus pe kurban hai woh mera Masiha hai\nJo kabra mein se jee utha woh mera Masiha hai\nUski daya bani rehti hai mujh par sada\nUska dhanyawad karoon main hriday se sada\n\nYeshu Masih zinda hai sada\nMaut par usne vijay paayi hai\nYeshu Masih zinda hai sada\nHam sabko naya jeevan diya hai',
'[Em]Jo krus pe kur[Am]ban hai [D]woh mera Ma[G]siha hai\n[Em]Jo kabra mein se [Am]jee utha [D]woh mera Ma[G]siha [B]hai\n[Em]Uski daya ba[Am]ni rehti [D]hai mujh [G]par [B]sada\n[Em]Uska dhanyawad [Am]karoon [D]main hri[G]day se [B]sa[Em]da\n\n[Em]Yeshu Masih [Am]zinda hai [B]sada\n[Em]Maut par usne [Am]vijay [B]paayi hai\n[Em]Yeshu Masih [Am]zinda hai [B]sada\n[Em]Ham sabko naya [D]jeevan [G]diya [B]hai',
'Em', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(192, 'ज़िंदा है (Zinda Hai)', 'Traditional', 'Easter Gospel', 'hindi',
'ज़िंदा है ज़िंदा है मेरा यीशु ज़िंदा है\nमौत की ज़ंजीरों को उसने तोड़ दिया है\nकब्र अब खाली है मौत की हार हुई है\nमहिमा में वह फिर से जी उठा है\n\nमहिमा महिमा यीशु की महिमा\nस्तुति स्तुति यीशु की स्तुति\nज़िंदा खुदा की महिमा हो सदा\nजय जयकार हो सदा',
'Zinda hai Zinda hai mera Yeshu zinda hai\nMaut ki zanjeeron ko usne tod diya hai\nKabra ab khaali hai maut ki haar hui hai\nMahima mein woh phir se jee utha hai\n\nMahima mahima Yeshu ki mahima\nStuti stuti Yeshu ki stuti\nZinda Khuda ki mahima ho sada\nJai jaikar ho sada',
'[G]Zinda hai Zinda hai [C]mera Yeshu [G]zinda [D]hai\n[G]Maut ki zan[C]jeeron ko [G]usne tod [D]diya [G]hai\n[Em]Kabra ab khaali [C]hai maut ki [G]haar hui [D]hai\n[Em]Mahima mein [C]woh phir se [D]jee utha [G]hai\n\n[G]Mahima ma[C]hima Ye[G]shu ki mahi[D]ma\n[G]Stuti stu[C]ti Ye[G]shu ki stu[D]ti\n[Em]Zinda Khuda [C]ki mahima [D]ho sa[G]da\n[Em]Jai jai[D]kar ho [C]sada [G]',
'G', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(193, 'कब्र खाली है (Kabar Khali Hai)', 'Traditional', 'Easter Worship', 'hindi',
'कब्र खाली है मसीहा जी उठा है\nअंधकार पर ज्योति की जीत हुई है\nउसने सबको नया जीवन दिया है\nस्वर्ग का रास्ता हमें दिखाया है\n\nहल्लेलूया हल्लेलूया यीशु ज़िंदा है\nहल्लेलूया हल्लेलूया राजा ज़िंदा है\nमौत की हार हुई है जीवन की जीत हुई\nमहिमा हो महिमा हो सदा',
'Kabar khali hai Masiha jee utha hai\nAndhkar par jyoti ki jeet hui hai\nUsne sabko naya jeevan diya hai\nSwarg ka rasta hamein dikhaya hai\n\nHallelujah Hallelujah Yeshu zinda hai\nHallelujah Hallelujah Raja zinda hai\nMaut ki haar hui hai jeevan ki jeet hui\nMahima ho mahima ho sada',
'[C]Kabar khali hai Ma[F]siha jee [G]utha [C]hai\n[Am]Andhkar par [F]jyoti ki [G]jeet hui [C]hai\n[C]Usne sabko [F]naya jee[G]van diya [C]hai\n[Am]Swarg ka ras[F]ta ha[G]mein dikhaya [C]hai\n\n[C]Hallelujah Halle[F]lujah Yeshu [G]zinda [C]hai\n[C]Hallelujah Halle[F]lujah Raja [G]zinda [C]hai\n[Am]Maut ki haar [F]hui hai jee[G]van ki jeet [C]hui\n[F]Mahima ho ma[G]hima ho [C]sada',
'C', 0, 78, '4/4', 'Verse1, Chorus', 1, TRUE),

(194, 'उठ गया मसीह (Uth Gaya Mashih)', 'Traditional', 'Traditional Easter Hymn', 'hindi',
'उठ गया मसीह कब्र को छोड़ के\nमहिमा में वह जी उठा है सदा\nमौत का डर अब रहा नहीं\nक्योंकि यीशु मेरे साथ है सदा\n\nजय मसीह की जय मसीह की\nगाओ ख़ुशी के साथ जय जय कार\nजय मसीह की जय मसीह की\nमहिमा हो महिमा हो सदा',
'Uth gaya Mashih kabra ko chodh ke\nMahima mein woh jee utha hai sada\nMaut ka darr ab raha nahi\nKyunki Yeshu mere saath hai sada\n\nJai Masih ki Jai Masih ki\nGao khushi ke saath jai jai kar\nJai Masih ki Jai Masih ki\nMahima ho mahima ho sada',
'[D]Uth gaya Ma[G]shih kabra ko [D]chodh [A]ke\n[D]Mahima mein woh [G]jee utha [D]hai sa[A]da\n[Bm]Maut ka darr [G]ab raha [D]na[A]hi\n[Bm]Kyunki Yeshu [G]mere saath [A]hai sa[D]da\n\n[D]Jai Masih ki [G]Jai Masih [A]ki\n[D]Gao khushi ke [G]saath jai [A]jai [D]kar\n[Bm]Jai Masih ki [G]Jai Masih [A]ki\n[Bm]Mahima हो ma[A]hima ho [D]sada',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(195, 'यीशु में विजय (Victory in Jesus)', 'Traditional', 'Easter Adaptation', 'hindi',
'यीशु में विजय मेरी सदा के लिए\nमुक्ति की धारा बहती है मेरे लिए\nपापों से तूने है मुक्ति दिलाई\nस्वर्ग का जलाल मुझे है दिखाया\n\nविजय विजय यीशु की विजय\nमहिमा महिमा यीशु की महिमा\nविजय विजय यीशु की विजय\nजय जयकार हो सदा',
'Yeshu mein vijay meri sada ke liye\nMukti ki dhara behti hai mere liye\nPaapon se Toone hai mukti dilayi\nSwarg ka jalal mujhe hai dikhaya\n\nVijay vijay Yeshu ki vijay\nMahima mahima Yeshu ki mahima\nVijay vijay Yeshu ki vijay\nJai jaikar ho sada',
'[C]Yeshu mein vi[F]jay meri [C]sada के [G]liye\n[C]Mukti ki [F]dhara behti [C]hai mere [G]liye\n[F]Paapon se Too[G]ne hai [C]mukti di[G]layi\n[F]Swarg ka ja[G]lal mujhe [C]hai di[G]khaya [C]\n\n[C]Vijay vijay [F]Yeshu ki [G]vi[C]jay\n[C]Mahima ma[F]hima Ye[G]shu ki mahi[C]ma\n[F]Vijay vijay [G]Yeshu ki [C]vi[G]jay\n[F]Jai jai[G]kar ho [C]sa[G]da [C]',
'C', 0, 100, '4/4', 'Verse1, Chorus', 1, TRUE),

(196, 'मसीह ज़िंदा है (Masih Zinda Hai)', 'Traditional', 'Easter Praise', 'hindi',
'मसीह ज़िंदा है मौत हार गयी\nयीशु राजा है महिमा छा गयी\nकब्र के पत्थर को उसने हटाया\nनया जीवन हम सबको दिखाया\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nपवित्र आत्मा आ छू ले हमें',
'Masih zinda hai maut haar gayi\nYeshu Raja hai mahima chha gayi\nKabra ke patthar ko usne hataya\nNaya jeevan ham sabko dikhaya\n\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nMahima ho mahima ho teri\nPavitra Aatma Aa choo le hamein',
'[G]Masih zinda [C]hai maut [G]haar [D]gayi\n[G]Yeshu Raja [C]hai mahima [G]chha [D]gayi [G]\n[Em]Kabra ke patthar [C]ko usne ha[G]taya\n[Em]Naya jeevan [C]ham sabko di[D]khaya [G]\n\n[G]Mahima ho ma[C]hima ho [D]teri\n[G]Yeshu Masih [C]Tu hi [D]hai Pra[G]bu\n[Em]Mahima ho ma[C]hima ho [D]teri\n[Em]Pavitra Aat[D]ma Aa [C]choo le [G]hamein',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(197, 'क्यों खोजते हो (Kyon Khojte Ho)', 'Traditional', 'Easter Worship', 'hindi',
'क्यों खोजते हो ज़िंदा को मरे हुओं में\nवह यहाँ नहीं है वह जी उठा है\nस्वर्गदूतों ने शुभ समाचार सुनाया\nमसीहा राजा फिर से जी उठा है\n\nहल्लेलूया हल्लेलूया यीशु ज़िंदा है\nहल्लेलूया हल्लेलूया राजा ज़िंदा है\nमौत की हार हुई है जीवन की जीत हुई\nमहिमा हो महिमा हो सदा',
'Kyon khojte ho zinda ko mare huon mein\nWoh yahan nahi hai woh jee utha hai\nSwargdooton ne shubh samachar sunaya\nMasiha Raja phir se jee utha hai\n\nHallelujah Hallelujah Yeshu zinda hai\nHallelujah Hallelujah Raja zinda hai\nMaut ki haar hui hai jeevan ki jeet hui\nMahima ho mahima ho sada',
'[Am]Kyon khojte ho [F]zinda ko [G]mare huon [Am]mein\n[Am]Woh yahan na[F]hi hai woh [G]jee utha [Am]hai\n[F]Swargdooton ne [G]shubh sa[C]machar su[G]naya\n[F]Masiha Ra[G]ja phir se [Am]jee utha hai\n\n[Am]Hallelujah Halle[F]lujah Yeshu [G]zinda [Am]hai\n[Am]Hallelujah Halle[F]lujah Raja [G]zinda [Am]hai\n[F]Maut ki haar [G]hui hai jee[C]van ki jeet [G]hui\n[F]Mahima ho ma[G]hima ho [Am]sada',
'Am', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(198, 'मौत पर विजय (Maut Par Vijay)', 'Traditional', 'Easter Celebration', 'hindi',
'मौत पर विजय पायी यीशु राजा ने\nजीवन की ज्योति जलायी अंधकार में\nपापों का बोझ उसने खुद पे उठाया\nस्वर्ग का द्वार हम सबके लिए खोला\n\nजय मसीह की जय मसीह की\nगाओ ख़ुशी के साथ जय जय कार\nजय मसीह की जय मसीह की\nमहिमा हो महिमा हो सदा',
'Maut par vijay paayi Yeshu Raja ne\nJeevan ki jyoti jalayi andhkar mein\nPaapon ka bojh usne khud pe uthaya\nSwarg ka dwar ham sabke liye khola\n\nJai Masih ki Jai Masih ki\nGao khushi ke saath jai jai kar\nJai Masih ki Jai Masih ki\nMahima ho mahima ho sada',
'[E]Maut par vijay [A]paayi [B]Yeshu Raja [E]ne\n[E]Jeevan ki jyo[A]ti jalayi [B]andhkar [E]mein\n[F#m]Paapon ka bojh [E]usne khud [A]pe u[B]thaya\n[F#m]Swarg ka dwar [E]ham sabke [B]liye [E]khola\n\n[E]Jai Masih ki [A]Jai Masih [B]ki\n[E]Gao khushi ke [A]saath jai [B]jai [E]kar\n[F#m]Jai Masih ki [E]Jai Masih [B]ki\n[F#m]Mahima [B]ho mahima [E]ho sada',
'E', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(199, 'ज़िंदा खुदवांद (Zinda Khudawand)', 'Traditional', 'Traditional Easter', 'hindi',
'ज़िंदा खुदवांद मेरा यीशु मसीह\nमौत पर उसने विजय पायी सदा\nकब्र के पत्थर को उसने हटाया\nनया जीवन हम सबको दिखाया\n\nमहिमा हो महिमा हो तेरी\nयीशु राजा तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Zinda Khudawand mera Yeshu Masih\nMaut par usne vijay paayi sada\nKabra ke patthar ko usne hataya\nNaya jeevan ham sabko dikhaya\n\nMahima ho mahima ho teri\nYeshu Raja Tu hi hai Prabhu\nMahima ho mahima ho teri\nSaare jahan ka raja Tu hi hai',
'[D]Zinda Khudawand [G]mera Yeshu Ma[D]sih\n[D]Maut par usne [G]vijay paayi [A]sada [D]\n[Bm]Kabra ke pat[G]thar ko [D]usne ha[A]taya\n[Bm]Naya jeevan [G]ham sabko di[A]khaya [D]\n\n[D]Mahima ho ma[G]hima ho [D]teri\n[G]Yeshu Raja [A]Tu hi [D]hai Pra[A]bu\n[Bm]Mahima ho ma[G]hima ho [A]teri\n[Bm]Saare jahan का [A]raja Tu [D]hi hai',
'D', 0, 74, '4/4', 'Verse1, Chorus', 1, TRUE),

(200, 'हल्लेलूया मसीह ज़िंदा है (Final)', 'Traditional', 'Easter Final', 'hindi',
'हल्लेलूया मसीह ज़िंदा है कब्र खाली है\nहल्लेलूया राजा ज़िंदा है महिमा छाई है\nमौत पर उसने विजय पायी है\nहम सबको नया जीवन दिया है\n\nहल्लेलूया हल्लेलूया यीशु ज़िंदा है\nहल्लेलूया हल्लेलूया राजा ज़िंदा है\nजीवन की ज्योति जलायी है प्रभु ने\nमहिमा हो महिमा हो सदा',
'Hallelujah Masih zinda hai kabra khali hai\nHallelujah Raja zinda hai mahima chhai hai\nMaut par usne vijay paayi hai\nHam sabko naya jeevan diya hai\n\nHallelujah Hallelujah Yeshu zinda hai\nHallelujah Hallelujah Raja zinda hai\nJeevan ki jyoti jalayi hai Prabhu ne\nMahima ho mahima ho sada',
'[G]Hallelujah Masih [C]zinda hai kabra [G]khali [D]hai\n[G]Hallelujah Raja [C]zinda hai mahima [G]chhai [D]hai [G]\n[Em]Maut par usne [C]vijay [G]paayi [D]hai\n[Em]Ham sabko naya [C]jeevan [D]diya [G]hai\n\n[G]Hallelujah Halle[C]lujah Yeshu [D]zinda [G]hai\n[G]Hallelujah Halle[C]lujah Raja [D]zinda [G]hai\n[Em]Jeevan ki jyo[C]ti jalayi [G]hai Pra[D]bu ne\n[Em]Mahima ho ma[D]hima ho [G]sada',
'G', 0, 120, '4/4', 'Verse1, Chorus', 1, TRUE);

-- =============================================
-- SONG HASHTAG MAPPINGS (101-200)
-- =============================================

-- All songs get 'hindi' (ID 2)
INSERT INTO song_hashtags (song_id, hashtag_id) 
SELECT id, 2 FROM songs WHERE song_number BETWEEN 101 AND 200;

-- 101-125: Classic (ID 1), Hymn (ID 4), Praise (ID 9)
INSERT INTO song_hashtags (song_id, hashtag_id) 
SELECT id, 1 FROM songs WHERE song_number BETWEEN 101 AND 125;
INSERT INTO song_hashtags (song_id, hashtag_id) 
SELECT id, 4 FROM songs WHERE song_number BETWEEN 101 AND 125;
INSERT INTO song_hashtags (song_id, hashtag_id) 
SELECT id, 9 FROM songs WHERE song_number BETWEEN 101 AND 125;

-- 126-160: Contemporary (ID 5), Worship (ID 10)
INSERT INTO song_hashtags (song_id, hashtag_id) 
SELECT id, 5 FROM songs WHERE song_number BETWEEN 126 AND 160;
INSERT INTO song_hashtags (song_id, hashtag_id) 
SELECT id, 10 FROM songs WHERE song_number BETWEEN 126 AND 160;

-- 161-180: Bhakti (ID 6), Adoration (ID 11)
INSERT INTO song_hashtags (song_id, hashtag_id) 
SELECT id, 6 FROM songs WHERE song_number BETWEEN 161 AND 180;
INSERT INTO song_hashtags (song_id, hashtag_id) 
SELECT id, 11 FROM songs WHERE song_number BETWEEN 161 AND 180;

-- 181-190: Christmas (ID 7)
INSERT INTO song_hashtags (song_id, hashtag_id) 
SELECT id, 7 FROM songs WHERE song_number BETWEEN 181 AND 190;

-- 191-200: Easter (ID 8)
INSERT INTO song_hashtags (song_id, hashtag_id) 
SELECT id, 8 FROM songs WHERE song_number BETWEEN 191 AND 200;

-- Additional generic tags for variety
INSERT INTO song_hashtags (song_id, hashtag_id)
SELECT id, 3 FROM songs WHERE song_number IN (101, 103, 105, 123, 161, 164, 168, 172, 177, 191) -- Masihigeet
UNION SELECT id, 12 FROM songs WHERE song_number IN (105, 121, 122, 124, 129, 131, 143, 172) -- Thanksgiving
UNION SELECT id, 14 FROM songs WHERE song_number IN (126, 127, 134, 148, 153, 160) -- Youth
;
