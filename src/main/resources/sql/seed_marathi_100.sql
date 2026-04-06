USE worship_db;

-- =============================================
-- MARATHI SEEDING - 100 SONGS (CLEAN UTF-8)
-- =============================================

INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, lyrics_roman, chords, original_key, capo, bpm, time_signature, structure, created_by, is_active) VALUES
(201, 'कशाने शुद्ध करू मी हृदय हे', 'Pandita Ramabai', 'Pandita Ramabai', 'marathi',
'कशाने शुद्ध करू मी हृदय हे, तूच सांगावे प्रभू\nमाझ्या अपराधांची ही गाठ, कशी सुटावी प्रभू\nकेवळ तुझ्याच रक्ताने, मलीनता ही जाईल\nतुझ्या पवित्र आत्म्याने, पावित्र्य हे राईल',
'Kashane shuddh karu mi hruday he, Tuch saangave Prabhu\nMajhya apradhanchi hi gaath, kashi sutavi Prabhu\nKeval tujhyach raktane, maleenta hi jaail\nTujhya pavitra aatmyane, pavitry he raahil',
'[Am]Kashane shuddh [G]karu mi [F]hruday [G]he, Tuch [F]saanga[G]ve Pra[Am]bhu\n[Am]Majhya apra[G]dhanchi hi [F]gaath, ka[G]shi suta[C]vi Pra[G]bhu\n[C]Keval tujhyach [G]rakta[F]ne, ma[G]leen[F]ta hi [G]jaa[C]il\n[Am]Tujhya pa[G]vitra aat[F]mya[G]ne, pa[F]vitry [G]he raahil',
'Am', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(202, 'ख्रिस्त माझा तो सर्वांचा', 'Rev. Bhaskar Pandurang Hivale', 'Traditional Hymn', 'marathi',
'ख्रिस्त माझा तो सर्वांचा, प्रभू माझा तो जगाचा\nपाप्यांचा तो तारणहार, आगत्याचा तो आधार\nत्याच्या प्रीतीने जग जिंकले, सर्वांना त्याने प्रेम दिले\nमरण सोसले क्रूसावरी, आम्हाला दिले जीवन उरी',
'Khrist majha to sarvancha, Prabhu majha to jagacha\nPaapyancha to tarannhaar, aagatyacha to aadhar\nTyachya preetine jag jinkle, sarvanna tyane prem dile\nMarann sosle krusavari, aamhalla dile jeevan uri',
'[C]Khrist majha to [G]sarvancha, [F]Prabhu majha to [G]jaga[C]cha\n[C]Paapyancha to [F]tarann[G]haar, [F]aagatyacha to [G]aa[C]dhar\n[C]Tyachya preetine [F]jag jin[G]kle, [F]sarvanna tyane [G]prem [C]dile\n[Am]Marann [F]sosle [G]krusava[C]ri, [F]aamhalla dile [G]jeevan [C]uri',
'C', 0, 74, '4/4', 'Verse1, Chorus', 1, TRUE),

(203, 'येशूचे नाव किती गोड आहे', 'Traditional', 'Upasana Sangeet', 'marathi',
'येशूचे नाव किती गोड आहे, मुखी यावे वारंवार\nत्या नावात आहे सामर्थ्य, त्या नावात आहे उद्धार\nसंकटात ते नाव आठवावे, भीतीत ते धीर देते\nप्रत्येक दुःख विरघळवते, शांतीचा पाझर फोडते',
'Yeshuche naav kiti goad aahe, mukhi yaave varamvar\nTya naavat aahe samarthy, tya naavat aahe uddhar\nSankatat te naav aathvave, bhitit te dhar dete\nPratyek duhkh virghalvate, shanticha pajhar phodte',
'[D]Yeshuche naav [G]kiti goad [D]aahe, mukhi [A]yaave va[D]ramvar\n[D]Tya naavat [G]aahe sa[D]marthy, [A]tya naavat aahe [D]uddhar\n[Bm]Sankatat te naav [G]aathva[D]ve, [A]bhitit te [G]dhar [D]dete\n[Bm]Pratyek duhkh [G]virghal[D]vate, [A]shanti[G]cha pajhar [D]phodte',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(204, 'प्रभू माझा पाठीराखा', 'Traditional', 'Upasana Sangeet', 'marathi',
'प्रभू माझा पाठीराखा, मला कशाची भीती नाही\nहरी चरागाहात तो मला, नेतो शांत पाण्यापाशी\nमाझ्या आत्म्याला तो ताजे करतो, नीतीच्या मार्गाने नेतो\nमरणच्छायेच्या दरीतून, तो मला सुखरूप नेतो',
'Prabhu majha pathirakha, mala kashachi bhiti nahi\nHari charagahat to mala, neto shant paanyapashi\nMajhya aatmyala to taje karto, neetichya margane neto\nMarannchhayechya daritun, to mala sukhrup neto',
'[G]Prabhu majha pa[D]thi[G]rakha, mala kashachi [C]bhiti [G]nahi\n[G]Hari chara[C]gahat to [G]mala, neto [D]shant paa[G]nyapashi\n[Em]Majhya aatmyala [C]to taje [G]karto, [D]neetichya mar[C]gane [G]neto\n[Em]Marannchhaye[C]chya dari[D]tun, to [C]mala sukh[D]rup [G]neto',
'G', 0, 80, '4/4', 'Verse1, Chorus', 1, TRUE),

(205, 'आम्ही आभारी मानतो येशूला', 'Contemporary', 'Contemporary', 'marathi',
'आम्ही आभारी मानतो येशूला, त्याने आम्हाला जीवन दिले\nत्याच्या अगाध प्रीतीने, आमचे रक्षण केले\nसंकटात तो धावून येतो, आम्हाला धीर देतो\nअंधारात तो प्रकाशाचा, दिवा होऊन उजळतो',
'Aamhi aabhari manto Yeshula, tyane aamhalla jeevan dile\nTyachya agaadh preetine, aamche rakshann kele\nSankatat to dhavun yeto, aamhalla dhar deto\nAndharat to prakashacha, diva houn ujaltto',
'[C]Aamhi aa[F]bhari manto [G]Yeshu[C]la, tyane [F]aamhalla [G]jeevan [C]dile\n[C]Tyachya a[F]gaadh preeti[G]ne, aamche [F]rakshann [G]ke[C]le\n[Am]Sankatat to [F]dhavun [G]ye[C]to, aam[F]halla [G]dhar de[C]to\n[Am]Andharat [F]to praka[G]shacha, [F]diva houn [G]ujalt[C]to',
'C', 0, 120, '4/4', 'Chorus, Verse1', 1, TRUE),

(206, 'धन्यवाद येशूला', 'Dr. Victor Benjamin', 'Dr. Victor Benjamin', 'marathi',
'धन्यवाद धन्यवाद धन्यवाद येशूला\nपापांतून त्याने आम्हाला सोडविले\nमरण सोसून आम्हाला जीवन दिले\nमहिमा महिमा महिमा येशूला',
'Dhanyawad dhanyawad dhanyawad Yeshula\nPaapantun tyane aamhalla sodvile\nMarann sosun aamhalla jeevan dile\nMahima mahima mahima Yeshula',
'[G]Dhanyawad [C]dhanyawad [D]dhanyawad Ye[G]shula\n[G]Paapantun [C]tyane aam[D]halla sod[G]vile\n[Em]Marann so[C]sun aam[D]halla jeevan [G]dile\n[Em]Mahima ma[C]hima mahi[D]ma Ye[G]shula',
'G', 0, 78, '4/4', 'Chorus, Verse1', 1, TRUE),

(207, 'माझा येशू', 'Mark Tribhuvan', 'Mark Tribhuvan', 'marathi',
'माझा येशू महान आहे, तो सर्वांचा तारणहार\nतुझ्या चरणी मी येतो प्रभू, तोच माझा विसावा\nदुःखात मी होतो तेव्हा, तूच मला सावरले\nतुझ्या प्रीतीच्या छायेत, तूच मला राखले',
'Maajha Yeshu mahan aahe, to sarvancha tarannhaar\nTujhya charni mi yeto Prabhu, toch majha visava\nDuhkhat mi hoto tevha, Tuch mala savarle\nTujhya preetichya chhayet, Tuch mala rakhle',
'[D]Maajha Yeshu [G]mahan [D]aahe, to [A]sarvancha tarann[D]haar\n[D]Tujhya charni [G]mi yeto [D]Prabhu, [A]toch majha vi[D]saava\n[Bm]Duhkhat mi [G]hoto te[vha], [A]Tuch mala [D]savarle\n[Bm]Tujhya pree[G]tichya chha[D]yet, [A]Tuch mala [D]rakhle',
'D', 0, 72, '4/4', 'Chorus, Verse1', 1, TRUE),

(208, 'आलो तुझ्या दर्शनाला', 'Contemporary', 'Contemporary', 'marathi',
'आलो तुझ्या दर्शनाला, प्रभू येशू राजा\nतुझ्या पवित्र मंदिरात, स्वीकार आमची पूजा\nआम्ही चुकलो आम्ही वाकलो, शुद्ध आम्हाला कर\nतुझ्या पवित्र आत्म्याने, आमचा ताबा तू घे',
'Aalo tujhya darshanala, Prabhu Yeshu Raja\nTujhya pavitra mandirat, sweekar aamchi puja\nAamhi chuklo aamhi vaklo, shuddh aamhalla kar\nTujhya pavitra aatmyane, aamcha taba Tu ghey',
'[C]Aalo tujhya [F]darshanala, [G]Prabhu Yeshu [C]Raja\n[C]Tujhya pa[F]vitra man[G]dirat, [F]sweekar aamchi [C]puja\n[Am]Aamhi chuklo [F]aamhi [G]vaklo, [F]shuddh aamhalla [C]kar\n[Am]Tujhya pa[F]vitra aat[G]myane, [F]aamcha taba [G]Tu [C]ghey',
'C', 0, 80, '4/4', 'Chorus, Verse1', 1, TRUE),

(209, 'मी वेचिले फुलांना', 'Contemporary', 'Contemporary', 'marathi',
'मी वेचिले फुलांना, तुझ्या चरणी वाहाया\nमाझे अवघे जीवन, तुझ्यासाठी वेचाया\nतूच माझा राजा प्रभू, तूच माझा श्रेष्ठ गुरु\nतुझ्याच मार्गाने प्रभू, मी आता हे चालू',
'Mi vechile phulanna, tujhya charni vahaya\nMajhe avghe jeevan, tujhyasathi vechaya\nTuch majha raja Prabhu, Tuch majha shreshth guru\nTujhyach margane Prabhu, mi aata he chalu',
'[G]Mi vechile [C]phulanna, [G]tujhya charni [D]va[G]haya\n[G]Majhe avghe [C]jeevan, [D]tujhya[C]sathi ve[G]chaya\n[Em]Tuch majha [C]raja [G]Prabhu, [Em]Tuch majha [Am]shreshth gu[D]ru\n[G]Tujhyach mar[C]gane Prabhu, [D]mi aata [G]he chalu',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(210, 'ईश्वराचा शब्द', 'Contemporary', 'Contemporary', 'marathi',
'ईश्वराचा शब्द आहे, महान आणि पवित्र\nत्याच्याच द्वारे उजळते, आमचे हे चारित्र\nतोच आम्हा वाट दाखवे, संकटाच्या वेळी\nत्याच्याच शब्दाने प्रभू, भीती पळते लांब',
'Ishwaracha shabda aahe, mahan aani pavitra\nTyachyach dware ujalttte, aamche he charitra\nToch aamha vaat dakhave, sankatachya veli\nTyachyach shabdane Prabhu, bhiti palte laamb',
'[D]Ishwaracha [G]shabda [D]aahe, mahan aani pa[A]vitra\n[D]Tyachyach dware [G]ujalt[A]tte, [G]aamche he cha[D]ritra\n[Bm]Toch aamha [G]vaat da[D]khave, [A]sankatachya [D]veli\n[Bm]Tyachyach shab[G]dane Pra[D]bhu, [A]bhiti palte [D]laamb',
'D', 0, 76, '4/4', 'Verse1, Chorus', 1, TRUE),

(211, 'तुझं नाव महिमावंत', 'Samuel Gawai', 'Samuel Gawai', 'marathi',
'तुझं नाव महिमावंत, तुझं नाव सामर्थ्यवंत\nयेशू राजा तू महान, तुझं नाव शांतिवंत\nतुझ्या नामात आहे शक्ती, तुझ्या नामात आहे मुक्ती\nसाऱ्या जगाचा तारणहार, राजांचा तू राजा',
'Tuza nav mahimavant, Tuza nav samarthyavant\nYeshu Raja Tu mahan, Tuza nav shantivant\nTujhya namat aahe shakti, tujhya namat aahe mukti\nSaarya jagacha tarannhaar, rajancha Tu raja',
'[G]Tuza nav mahi[C]mavanto, [G]tuza nav sa[D]marthyavanto\n[G]Yeshu Raja [C]Tu ma[D]han, [C]Tuza nav shan[G]tivant\n[Em]Tujhya namat [C]aahe [G]shakti, [Em]tujhya namat [Am]aahe [D]mukti\n[G]Saarya ja[C]gacha tarann[D]haar, [C]rajan[D]cha Tu [G]raja',
'G', 0, 84, '4/4', 'Chorus, Verse1', 1, TRUE),

(212, 'मोती माझा यीशु', 'Contemporary', 'Contemporary', 'marathi',
'मोती माझा यीशु, तो आहे अनमोल\nत्याच्या कडे यावे, टाकावे सर्व ओलं\nजगाच्या या प्रवासात, तोच आहे सोबती\nप्रत्येक संकटात, तोच आहे तारती',
'Moti majha Yeshu, to aahe anmol\nTyachya kade yave, takave sarva ol\nJagachya ya pravasat, toch aahe sobti\nPratyek sankatat, toch aahe tarti',
'[D]Moti majha [G]Yeshu, [D]to aahe an[A]mol\n[D]Tyachya kade [G]yave, ta[A]kave sarva [D]ol\n[Bm]Jagachya ya [G]prava[D]sat, toch aahe [A]sobti\n[Bm]Pratyek san[G]katat, [A]toch aahe [D]tarti',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(213, 'हल्लेलूया हल्लेलूया (Marathi)', 'Contemporary', 'Marathi Version', 'marathi',
'हल्लेलूया हल्लेलूया, प्रभूला धन्यवाद द्या\nहल्लेलूया हल्लेलूया, त्याचे नाव गाजावा\nतो महान आहे तो दयाळू आहे\nत्याच्याच प्रीतीत हे जीवन रंगलंय',
'Hallelujah Hallelujah, Prabhula dhanyawad dya\nHallelujah Hallelujah, tyache naav gajava\nTo mahan aahe to dayalu aahe\nTyachyach preetit he jeevan ranglay',
'[G]Hallelujah [C]Hallelujah, [D]Prabhula dhanya[G]wad dya\n[G]Hallelujah [C]Hallelujah, [D]tyache naav [G]gaajava\n[Em]To ma[C]han aahe [D]to da[G]ya[D]lu aahe\n[Em]Tyachyach preetit [C]he jee[D]van rang[G]lay',
'G', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(214, 'प्रभू तुझं प्रेम', 'Mark Tribhuvan', 'Mark Tribhuvan', 'marathi',
'प्रभू तुझं प्रेम किती महान आहे\nमाझ्या पापांसाठी तू दिलेला हा प्राण आहे\nतुझ्या रक्ताने तू मला शुद्ध केले\nमृतातून उठवून तू मला जीवन दिले',
'Prabhu Tuza prem kiti mahan aahe\nMajhya paapansathi Tu dilela ha prann aahe\nTujhya raktane Tu mala shuddh kele\nMrutatun uthvun Tu mala jeevan dile',
'[C]Prabhu Tuza [F]prem [G]kiti ma[C]han aahe\n[C]Majhya paa[G]pansathi Tu [F]dilela ha [G]prann [C]aahe\n[Am]Tujhya rakta[F]ne Tu [G]mala [F]shuddh ke[C]le\n[Am]Mrutatun [F]uthvun [G]Tu mala [F]jeevan [C]dile',
'C', 0, 70, '4/4', 'Verse1, Chorus', 1, TRUE),

(215, 'देवा तुझा जयकार असो', 'Contemporary', 'Contemporary', 'marathi',
'देवा तुझा जयकार असो, साऱ्या या जगात\nतुझचं गौरव गाऊ आम्ही, प्रत्येक क्षणात\nतूच आमचा राजा प्रभू, तूच तारणहार\nतुझ्याच चरणी आम्ही, अर्पू हा जोहार',
'Deva Tuza jaykar aso, saarya ya jagat\nTuzach gaurav gau aamhi, pratyek kshanat\nTuch aamcha raja Prabhu, Tuch tarannhaar\nTujhyach charni aamhi, arpu ha johaar',
'[D]Deva Tuza [G]jaykar a[D]so, saarya ya ja[A]gat\n[D]Tuzach gau[G]rav gau aa[D]mhi, prat[A]yek ksha[B]nat\n[Bm]Tuch aamcha [G]raja Prabhu, [D]Tuch tarann[A]haar\n[Bm]Tujhyach char[G]ni aa[D]mhi, [A]arpu ha jo[D]haar',
'D', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(216, 'येशूच्या मनात', 'Contemporary', 'Contemporary', 'marathi',
'येशूच्या मनात काय आहे, ते तू जाणून घे\nत्याच्या शब्दांचे अमृत, तू पिऊन घे\nतो तुला सांगतो प्रेम करायला\nसंकटात गरिबांना मदत करायला',
'Yeshuchya manat kaay aahe, te Tu janun ghey\nTyachya shabdanchye amrut, Tu piun ghey\nTo tula sangto prem karayla\nSankatat garibanna madat karayla',
'[G]Yeshuchya ma[C]nat kaay aa[D]he, te Tu ja[G]nun ghey\n[G]Tyachya shab[C]danchye am[D]rut, Tu [C]piun [G]ghey\n[Em]To tula [C]sangto [D]prem ka[G]rayla\n[Em]Sankatat ga[C]ribanna [D]madat ka[G]rayla',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(217, 'मला मिळाली नवीन शक्ती', 'Contemporary', 'Contemporary', 'marathi',
'मला मिळाली नवीन शक्ती, येशूच्या नावात\nमाझे अवघे जीवन बदलले, त्याच्याच रंगात\nनिराशा गेली आशा आली, शांती मिळाली\nयेशूच्या सानिध्यात, मुक्ती मिळाली',
'Mala milali navina shakti, Yeshuchya navat\nMajhe avghe jeevan badalle, tyachyach rangat\nNirasha geli asha aali, shanti milali\nYeshuchya sanidhyat, mukti milali',
'[Am]Mala milali [G]navina [F]shakti, [G]Yeshuchya na[Am]vat\n[Am]Majhe avghe [G]jeevan [F]badalle, [G]tyachyach ran[Am]gat\n[C]Nirasha [G]geli a[F]sha [G]aali, [F]shanti mi[G]la[C]li\n[Am]Yeshuchya [G]sanidh[F]yat, [G]mukti mi[Am]la[Am]li',
'Am', 0, 80, '4/4', 'Verse1, Chorus', 1, TRUE),

(218, 'स्वीकार स्वामी तू', 'Contemporary', 'Contemporary', 'marathi',
'स्वीकार स्वामी तू, हे अर्पण माझे\nमाझे हे हृदय प्रभू, झाले आहे तुझे\nतुझ्याच साक्षीनं मी, आता हे चालू\nतुझचं नाव प्रभू, साऱ्या जगात गाजू',
'Sweekar Swami Tu, he arpann majhe\nMajhe he hruday Prabhu, jhale aahe tujhe\nTujhyach sakshine mi, aata he chalu\nTuzach naav Prabhu, saarya jagat gaju',
'[C]Sweekar Swami [F]Tu, he [G]arpann [C]majhe\n[C]Majhe he [F]hruday Pra[G]bhu, jhale [F]aahe [G]tu[C]jhe\n[Am]Tujhyach sakshi[F]ne mi, [G]aata he [C]chalu\n[Am]Tuzach naav [F]Prabhu, [G]saarya [F]jagat [G]ga[C]ju',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(219, 'प्रभू तुझा विजय', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू तुझा विजय होवो, प्रत्येकाच्या जीवनात\nमुक्तीचा दीप प्रज्वलित होवो, प्रत्येकाच्या घरात\nअंधकार दूर होवो, प्रकाशाचा उदय होवो\nयेशू ख्रिस्ताचा जयजयकार, घरोघरी होवो',
'Prabhu Tuza vijay hovo, pratyekachya jeevanat\nMukticha deep prajwaltit hovo, pratyekachya gharat\nAndharat dur hovo, prakashacha uday hovo\nYeshu Khristacha jayjaykar, gharoghari hovo',
'[D]Prabhu Tuza [G]vijay ho[D]vo, prat[A]yekachya jeeva[D]nat\n[D]Mukticha deep [G]prajwalti[D]t hovo, prat[A]yekachya gha[D]rat\n[Bm]Andharat [G]dur ho[D]vo, pra[A]kashacha uday [D]hovo\n[Bm]Yeshu Khri[G]stacha jay[D]jaykar, [A]gharo[G]ghari [D]hovo',
'D', 0, 88, '4/4', 'Verse1, Chorus', 1, TRUE),

(220, 'तुझ्याच साठी मी', 'Dr. Victor Benjamin', 'Dr. Victor Benjamin', 'marathi',
'तुझ्याच साठी मी, हे सुंदर गाणे गातो\nतुझ्या पवित्र नावाचा, जयजयकार मी करतो\nमाझे सर्व दुःख तू, तुझ्या जवळ घेतले\nमाझे उरलेले जीवन, येशू मी तुला दिले',
'Tujhyach sathi mi, he sundar ganne gato\nTujhya pavitra navacha, jayjaykar mi karto\nMajhe sarva dukh Tu, tujhya javal ghetle\nMajhe urlele jeevan, Yeshu mi tula dile',
'[G]Tujhyach sathi [C]mi, he [D]sundar ganne [G]gato\n[G]Tujhya pavitra [C]navacha, [D]jayjaykar mi [G]karto\n[Em]Majhe sarva [C]dukh Tu, [D]tujhya javal [G]getle\n[Em]Majhe urlele [C]jeevan, [D]Yeshu mi tula [G]dile',
'G', 0, 74, '4/4', 'Verse1, Chorus', 1, TRUE),

(221, 'ईश्वराचे स्तवन', 'Krishnaji Ratnaji Sangale', 'Upasana Sangeet', 'marathi',
'ईश्वराचे स्तवन करा, तो महान आणि दयाळू\nत्याच्या अगाध प्रेमाने, ही सृष्टी त्याने उजळली\nमुक्तीचा तो दाता आहे, शांतीचा तो राजा\nत्याच्या चरणी नत होऊ, करूया त्याच्याची पूजा',
'Ishwarache stavan kara, to mahan aani dayalu\nTyachya agaadh preetine, hi srishti tyane ujaltti\nMukticha to daata aahe, shanticha to raja\nTyachya charni nat hou, karuya tyachi puja',
'[Am]Ishwarache [G]stavan [F]kara, [G]to mahan aani [Am]dayalu\n[Am]Tyachya a[G]gaadh preeti[F]ne, hi [G]srishti tyane [Am]u[G]jaltti\n[C]Mukticha [G]to daata [F]aahe, [G]shanticha to [Am]raja\n[C]Tyachya [G]charni [F]nat hou, [G]karuya tyachi [Am]puja',
'Am', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(222, 'सुंदर माझा येशू', 'Traditional', 'Upasana Sangeet', 'marathi',
'सुंदर माझा येशू, तो आहे सर्वांचा सखा\nत्याच्या कडे यावे, टाकावे सर्व दुःखा\nसंकटात तो धावून येतो, आम्हाला सावरतो\nअंधकार वर तो प्रकाशाचा, दीप होऊन उजळतो',
'Sundar majha Yeshu, to aahe sarvancha sakha\nTyachya kade yave, takave sarva duhkha\nSankatat to dhavun yeto, aamhalla savarto\nAndharat to prakashacha, deep houn ujaltto',
'[D]Sundar majha [G]Yeshu, [D]to aahe sarvancha [A]sakha\n[D]Tyachya kade [G]yave, ta[A]kave sarva [D]duhkha\n[Bm]Sankatat to [G]dhavun [D]ye[A]to, aam[G]halla sa[D]varto\n[Bm]Andharat to [G]praka[D]shacha, [A]deep houn [G]ujalt[D]to',
'D', 0, 75, '4/4', 'Verse1, Chorus', 1, TRUE),

(223, 'हे देवा माझ्या', 'Traditional', 'Upasana Sangeet', 'marathi',
'हे देवा माझ्या, तूच माझा आश्रय\nतुझ्या विना मजला, कोठेही नाही लय\nपापात मी होतो तेव्हा, तूच मला वाचविले\nतुझ्या पवित्र नावाचा, जयजयकार मी केले',
'He Deva majhya, Tuch majha aashray\nTujhya vina majla, kothehi nahi lay\nPaapat mi hoto tevha, Tuch mala vachvile\nTujhya pavitra navacha, jayjaykar mi kele',
'[G]He Deva [C]majhya, [G]Tuch majha aash[D]ray\n[G]Tujhya vi[C]na majla, [D]kothehi nahi [G]lay\n[Em]Paapat mi [C]hoto te[G]vha, [D]Tuch mala va[G]chvile\n[Em]Tujhya pa[C]vitra na[D]vacha, [C]jayjaykar [D]mi [G]kele',
'G', 0, 70, '4/4', 'Verse1, Chorus', 1, TRUE),

(224, 'माझा देव मला तारायला', 'Traditional', 'Upasana Sangeet', 'marathi',
'माझा देव मला तारायला, समर्थ आणि थोर\nत्याच्याच प्रेमाचा हा, अगाध तो जोर\nसंकटे येतील वादळे उठतील, तरी मी डगमगणार नाही\nकारण माझा प्रभू मजसोबत, नेहमीच राहणार आहे',
'Majha Dev mala tarayala, samarth aani thor\nTyachyach premacha ha, agaadh to joar\nSankate yetil vadle uthtil, tari mi dagmagnar nahi\nKarun majha Prabhu majsobat, nehmich rahnar aahe',
'[C]Majha Dev [F]mala tara[G]yala, [C]samarth aani [G]thor\n[C]Tyachyach pre[F]macha ha, [G]agaadh to [C]joar\n[Am]Sankate ye[F]til va[G]dle uth[C]til, tari mi dag[G]magnar nahi\n[Am]Karun majha [F]Prabhu maj[G]sobat, [F]neh[G]mich rah[C]nar aahe',
'C', 0, 78, '4/4', 'Verse1, Chorus', 1, TRUE),

(225, 'आमच्या देवाला धन्यवाद असो', 'Traditional', 'Traditional Hymn', 'marathi',
'आमच्या देवाला धन्यवाद असो, सदासर्वकाळ\nत्याने आम्हाला दिले, जीवनाचे फळ\nमरण सोसून त्याने, आम्हाला वाचविले\nत्याच्याच पवित्र नावाचा, महिमा आम्ही केले',
'Amuchya Devala dhanyawad aso, sadasarvakal\nTyane aamhalla dile, jeevanache phal\nMarann sosun tyane, aamhalla vachvile\nTyachyach pavitra navacha, mahima aamhi kele',
'[D]Amuchya Deva[G]la dhar[D]nyawad aso, sa[A]dasarva[D]kal\n[D]Tyane aam[G]halla di[D]le, jeeva[A]nache [D]phal\n[Bm]Marann so[G]sun tya[D]ne, aam[A]halla va[D]chvile\n[Bm]Tyachyach pa[G]vitra na[D]vacha, [A]mahima aam[G]hi [D]kele',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(226, 'तुझं नाव किती उंच', 'Contemporary', 'Marathi Version', 'marathi',
'तुझं नाव किती उंच, तुझं नाव किती महान\nयेशू राजा तू श्रेष्ठ, साऱ्या जगाचा हा प्राण\nतुझ्या नामात आहे शक्ती, तुझ्या नामात आहे शांती\nप्रत्येक संकटात प्रभू, तूच देतोस आम्हा क्रांती',
'Tuza nav kiti uncha, Tuza nav kiti mahan\nYeshu Raja Tu shreshth, saarya jagacha ha prann\nTujhya namat aahe shakti, tujhya namat aahe shanti\nPratyek sankatat Prabhu, Tuch detos aamha kranti',
'[G]Tuza nav kiti [C]uncha, [G]Tuza nav kiti [D]ma[G]han\n[G]Yeshu Raja Tu [C]shreshth, [D]saarya ja[C]gacha ha [G]prann\n[Em]Tujhya namat [C]aahe [G]shakti, [Em]tujhya namat [Am]aahe [D]shanti\n[G]Pratyek san[C]katat Pra[D]bhu, [C]Tuch detos [D]aamha [G]kranti',
'G', 0, 84, '4/4', 'Chorus, Verse1', 1, TRUE),

(227, 'आराधना करू', 'Contemporary', 'Contemporary', 'marathi',
'आराधना करू, तुझ्या पवित्र मंदिरात\nस्तुत्तीची गाणी गाऊ, तुझ्या पवित्र रंगात\nतू महान आहेस देवा, तूच आमचा आधार\nतुझ्याच चरणी आम्ही, अर्पू हा जोहार',
'Aaradhana karu, tujhya pavitra mandirat\nStutichi ganne gau, tujhya pavitra rangat\nTu mahan aahes Deva, Tuch aamcha aadhar\nTujhyach charni aamhi, arpu ha johaar',
'[C]Aaradha[G]na karu, tu[F]jhya pa[G]vitra man[C]dirat\n[C]Stutichi [F]ganne gau, tu[G]jhya pa[F]vitra [G]ran[C]gat\n[Am]Tu mahan [F]aahes [G]Deva, [Am]Tuch aam[F]cha aa[G]dhar\n[C]Tujhyach [F]charni aa[G]mhi, [F]arpu ha jo[G]haar',
'C', 0, 70, '4/4', 'Chorus, Verse1', 1, TRUE),

(228, 'पवित्र आत्मा ये', 'Contemporary', 'Contemporary', 'marathi',
'पवित्र आत्मा ये, आम्हा ताबा तू घे\nतुझ्या स्वर्गीय सामर्थ्याने, आमचे हृदय तू भर\nआम्ही तहानलेले आम्ही भुकेले, तूच आम्हाला तृप्त कर\nतुझ्या पवित्र अग्नीने, आमचे पावन तू कर',
'Pavitra Aatma ye, aamha taba Tu ghey\nTujhya swargiya samarthyane, aamche hruday Tu bhar\nAamhi tahanlele aamhi bhukele, Tuch aamhalla trupt kar\nTujhya pavitra agnine, aamche pavan Tu kar',
'[Am]Pavitra Aatma [G]ye, [F]aamha ta[G]ba Tu [Am]ghey\n[Am]Tujhya swar[G]giya sa[F]marthya[G]ne, aam[F]che hru[G]day Tu [Am]bhar\n[C]Aamhi ta[G]hanlele [F]aamhi [G]bhukele, [F]Tuch aam[G]halla [C]trupt kar\n[Am]Tujhya pa[G]vitra ag[F]ni[G]ne, aam[F]che pa[G]van Tu [Am]kar',
'Am', 0, 64, '4/4', 'Chorus, Verse1', 1, TRUE),

(229, 'तुझी स्तुती गाऊया', 'Contemporary', 'Contemporary', 'marathi',
'तुझी स्तुती गाऊया, आनंदात आम्ही नाचूया\nयेशू ख्रिस्ताचा जयजयकार, साऱ्या जगात करूया\nतोच आमचा तारणहार, तोच आमचा पालनहार\nत्याच्याच प्रीतीत हे जीवन, सुखकर आम्ही करूया',
'Tuzi stuti gauya, anandat aamhi nachuya\nYeshu Khristacha jayjaykar, saarya jagat karuya\nToch aamcha tarannhaar, toch aamcha paalannhaar\nTyachyach preetit he jeevan, sukhkar aamhi karuya',
'[G]Tuzi stuti [C]gauya, a[G]nandat aa[D]mhi na[G]chuya\n[G]Yeshu Khri[C]stacha jay[D]jaykar, saa[C]rya ja[D]gat ka[G]ruya\n[Em]Toch aamcha [C]tarann[G]haar, toch [D]aamcha paalann[G]haar\n[Em]Tyachyach pree[C]tit he [D]jeevan, [C]sukhkar [D]aamhi ka[G]ruya',
'G', 0, 120, '4/4', 'Chorus, Verse1', 1, TRUE),

(230, 'येशू तुझे प्रेम', 'Contemporary', 'Contemporary', 'marathi',
'येशू तुझे प्रेम, किती अगाध आहे\nमाझ्या पापांसाठी तू, वाहिला हा प्राण आहे\nतुझ्या रक्ताने तू मला, शुद्ध आणि पवित्र केले\nनया जीवन देऊन तू, माझे भाग्य उजळले',
'Yeshu Tuze prem, kiti agaadh aahe\nMajhya paapansathi Tu, vahila ha prann aahe\nTujhya raktane Tu mala, shuddh aani pavitra kele\nNaya jeevan deun Tu, majhe bhagy ujalttle',
'[D]Yeshu Tuze [G]prem, [D]kiti aga[A]adh [D]aahe\n[D]Majhya paa[G]pansathi [D]Tu, vahila [A]ha prann [D]aahe\n[Bm]Tujhya rakta[G]ne Tu ma[D]la, [A]shuddh aani pa[G]vitra [D]kele\n[Bm]Naya jee[G]van de[D]un Tu, majhe [A]bhagy u[G]jaltt[D]le',
'D', 0, 72, '4/4', 'Chorus, Verse1', 1, TRUE),

(231, 'सर्व जगात तुझा जय', 'Contemporary', 'Contemporary', 'marathi',
'सर्व जगात तुझा जय होवो, प्रभू येशू राजा\nतुझ्या पवित्र नावाचा, जयजयकार होवो ताजा\nअंधकार दूर होवो, प्रकाशाचा उदय होवो\nतुझ्या प्रीतीचा हा संदेश, घराघरात पोहोचावा',
'Sarva jagat Tuza jay hovo, Prabhu Yeshu Raja\nTujhya pavitra navacha, jayjaykar hovo taja\nAndharat dur hovo, prakashacha uday hovo\nTujhya preeticha ha sandesh, gharagharat pohochava',
'[C]Sarva jagat [F]Tuza jay [G]hovo, [C]Prabhu Yeshu [G]Raja\n[C]Tujhya pa[F]vitra na[G]vacha, [F]jayjaykar [G]hovo [C]taja\n[Am]Andharat [F]dur ho[G]vo, pra[F]kashacha u[G]day [C]hovo\n[Am]Tujhya pree[F]ticha ha [G]san[C]desh, [F]gharagha[G]rat poho[C]chava',
'C', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(232, 'मंडळीतून ये', 'Contemporary', 'Contemporary', 'marathi',
'मंडळीतून ये, प्रभू तुझा महिमा गात\nआम्हा सर्वांना तू, घे तुझ्या पवित्र हातात\nआम्ही एकत्र आलो, तुझी स्तुती कराया\nतुझ्या स्वर्गीय शांतीचा, अनुभव घ्याया',
'Mandalitun ye, Prabhu Tuza mahima gaat\nAamha sarvanna Tu, ghey tujhya pavitra hatat\nAamhi ekatra aalo, tujhi stuti karaya\nTujhya swargiya shanticha, anubhav ghyaya',
'[G]Manda[C]litun ye, Pra[G]bhu Tuza [D]mahima [G]gaat\n[G]Aamha sar[C]vanna [G]Tu, ghey tu[D]jhya pavitra [G]hatat\n[Em]Aamhi ekat[C]ra aa[G]lo, tujhi [D]stuti ka[G]raya\n[Em]Tujhya swar[C]giya shan[D]ticha, an[C]ubhav [D]ghya[G]ya',
'G', 0, 80, '4/4', 'Chorus, Verse1', 1, TRUE),

(233, 'नमस्कार माझा', 'Contemporary', 'Contemporary', 'marathi',
'नमस्कार माझा, तुला प्रभू येशू\nतुझ्या चरणी मी, माझे जीवन वाहू\nतूच माझा राजा, तूच माझा देव\nतुझ्याच नामात आहे, मुक्तीची ही भेव',
'Namaskar majha, tula Prabhu Yeshu\nTujhya charni mi, majhe jeevan vahu\nTuch majha raja, tuch majha dev\nTujhyach namat aahe, muktichi hi bhev',
'[D]Namas[G]kar ma[D]jha, tula [A]Prabhu Ye[D]shu\n[D]Tujhya char[G]ni mi, majhe [A]jeevan va[D]hu\n[Bm]Tuch ma[G]jha ra[D]ja, tuch [A]ma[G]jha [D]dev\n[Bm]Tujhyach na[G]mat aa[D]he, [A]muktichi hi [D]bhev',
'D', 0, 72, '4/4', 'Chorus, Verse1', 1, TRUE),

(234, 'भक्ती करूया', 'Contemporary', 'Contemporary', 'marathi',
'भक्ती करूया, प्रभूची स्तुती गाऊया\nआनंदी अंतःकरणाने, त्याला धन्यवाद देऊया\nत्याने आम्हाला दिले, हे सुंदर जीवन\nत्याच्याच प्रीतीत हे, अवघे मन पावन',
'Bhakti karuya, Prabhuchi stuti gauya\nAnandi antahkaranne, tyala dhanyawad deuya\nTyane aamhalla dile, he sundar jeevan\nTyachyach preetit he, avghe man pavan',
'[C]Bhakti ka[F]ruya, Pra[G]bhuchi stuti [C]gauya\n[C]Anandi antah[F]karanne, tya[G]la dhanyawad [C]deuya\n[Am]Tyane aam[F]halla di[G]le, he [F]sundar [G]jeevan [C]\n[Am]Tyachyach pree[F]tit [G]he, [F]avghe man [G]pa[C]van',
'C', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(235, 'स्तुती गाऊया स्तुती गाऊया', 'Contemporary', 'Contemporary', 'marathi',
'स्तुती गाऊया स्तुती गाऊया, प्रभू येशूची\nमहिमा गाऊया महिमा गाऊया, तारणहाराची\nत्याने आम्हाला दिली, मुक्तीची ही वाट\nत्याच्याच द्वारे उजळला, आमचा हा थाट',
'Stuti gauya stuti gauya, Prabhu Yeshuchi\nMahima gauya mahima gauya, tarannhaarachi\nTyane aamhalla dili, muktichi hi vaat\nTyachyach dware ujalttla, aamcha ha thaat',
'[G]Stuti gauya [C]stuti gauya, [D]Prabhu Yeshu[G]chi\n[G]Mahima gauya [C]mahima gauya, [D]tarannhaara[G]chi\n[Em]Tyane aam[C]halla di[D]li, mukti[C]chi hi [G]vaat\n[Em]Tyachyach dware [C]ujaltt[D]la, aam[C]cha ha [G]thaat',
'G', 0, 120, '4/4', 'Chorus, Verse1', 1, TRUE),

(236, 'प्रभू महान प्रभू महान', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू महान प्रभू महान, साऱ्या सृष्टीचा तो राजा\nआकाशात आणि पृथ्वीवर, त्याचाच आहे जोहार\nप्रत्येक श्वासा श्वासात, त्याचेच नाव गाता\nअगाध लीलेचा, तोच आहे दाता',
'Prabhu mahan Prabhu mahan, saarya srishticha to raja\nAakashat aani pruthvivar, tyachach aahe johaar\nPratyek shwasa shwasat, tyachech naav gaata\nAgaadh lilecha, toch aahe daata',
'[D]Prabhu mahan [G]Prabhu ma[D]han, saarya [A]srishticha to [D]raja\n[D]Aakashat aani [G]pruthvi[D]var, tyachhach [A]aahe jo[D]haar\n[Bm]Pratyek shwa[G]sa shwa[D]sat, tyachech [A]naav gaa[D]ta\n[Bm]Agaadh li[G]lecha, [A]toch aahe [D]daa[D]ta',
'D', 0, 75, '4/4', 'Chorus, Verse1', 1, TRUE),

(237, 'येशूच्या नावाने', 'Contemporary', 'Contemporary', 'marathi',
'येशूच्या नावाने, प्रत्येक गुडघा टेकेल\nयेशूच्या नावाने, प्रत्येक जीवा कबूल करेल\nतोच प्रभू आहे, तोच उद्धारकर्ता\nसाऱ्या जगाचा तोच, एकच तारणकर्ता',
'Yeshuchya navane, pratyek gudgha tekel\nYeshuchya navane, pratyek jiva kabul karel\nTuch Prabhu aahe, Tuch uddharkarta\nSaarya jagacha tuch, ekach tarannkarta',
'[C]Yeshuchya [F]nava[G]ne, prat[F]yek gudgha [C]tekel\n[C]Yeshuchya [F]nava[G]ne, prat[F]yek jiva ka[G]bul ka[C]rel\n[Am]Tuch Prabhu [F]aahe, [G]Tuch [F]uddharkarta [C]\n[Am]Saarya jaga[F]cha tuch, [G]ekach [F]tarann[G]karta',
'C', 0, 80, '4/4', 'Chorus, Verse1', 1, TRUE),

(238, 'पवित्र पवित्र पवित्र', 'Contemporary', 'Contemporary', 'marathi',
'पवित्र पवित्र पवित्र, माझा प्रभू आहे\nमहिमेने आणि तेजाने, तो साऱ्या जगाला पाहे\nस्वर्गदूत गातात, त्याच्या थोरवीचे गान\nआम्ही ही अर्पतो, त्याला आमचा सन्मान',
'Pavitra pavitra pavitra, majha Prabhu aahe\nMahimene aani tejane, to saarya jagala paahe\nSwargdoot gaatat, tyachya thorviche gaan\nAamhi hi arpto, tyala aamcha sanman',
'[G]Pavitra pavitra [C]pavitra, majha [D]Prabhu [G]aahe\n[G]Mahimene [C]aani tejane, [D]to saarya jagala [G]paahe\n[Em]Swargdoot [C]gaatat, [D]tyachya thorviche [G]gaan\n[Em]Aamhi hi [C]arpto, [D]tyala aam[C]cha san[G]man',
'G', 0, 68, '4/4', 'Chorus, Verse1', 1, TRUE),

(239, 'माझे जीवन येशूच्या चरणी', 'Contemporary', 'Contemporary', 'marathi',
'माझे जीवन येशूच्या चरणी, अर्पण मी केले\nत्याच्याच प्रीतीने मी, नवे जीवन मिळविले\nआता दुःखाचा अंत झाला, सुखाचा उदय झाला\nयेशू ख्रिस्ताच्या रंगात, माझा आत्मा रंगला',
'Majhe jeevan Yeshuchya charni, arpann mi kele\nTyachyach preetine mi, nave jeevan milvile\nAata duhkhaacha ant jhaala, sukhacha uday jhaala\nYeshu Khristachya rangat, majha aatma rangla',
'[Am]Majhe jeevan [G]Yeshuchya [F]charni, [G]arpann mi [Am]kele\n[Am]Tyachyach preeti[G]ne mi, [F]nave jee[G]van mil[Am]vile\n[C]Aata duhkhacha [G]ant jhaala, [F]sukhacha u[G]day [C]jhaala\n[Am]Yeshu Khri[G]stachya ran[F]gat, [G]majha aatma [Am]rangla',
'Am', 0, 72, '4/4', 'Chorus, Verse1', 1, TRUE),

(240, 'प्रभू माझा रक्षणकर्ता', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू माझा रक्षणकर्ता, तो माझ्या पाठीशी\nदुःखाच्या वेळी तो, आहे माझ्या साठीशी\nसंकटे येतील वादळे उठतील, तरी मी डगमगणार नाही\nकारण माझा येशू राजा, माझ्या सोबतच राहील',
'Prabhu majha rakshannkarta, to majhya pathishi\nDuhkhacha veli to, aahe majhya sathishi\nSankate yetil vadle uthtil, tari mi dagmagnar nahi\nKarun majha Yeshu Raja, majhya sobatch rahil',
'[D]Prabhu majha rakshann[G]karta, to [A]majhya pa[D]thishi\n[D]Duhkhacha veli [G]to, aahe [A]majhya sa[D]thishi\n[Bm]Sankate ye[G]til va[D]dle uthtil, ta[A]ri mi dag[G]magnar [D]nahi\n[Bm]Karun majha [G]Yeshu Raja, [A]majhya sobatch [D]rahil',
'D', 0, 80, '4/4', 'Chorus, Verse1', 1, TRUE),

(241, 'धन्यवाद देऊया आपण', 'Contemporary', 'Contemporary', 'marathi',
'धन्यवाद देऊया आपण, साऱ्या जगाच्या करत्याला\nमुक्तीचा मार्ग दाखवून, त्याने वाचविले आम्हाला\nत्याच्या प्रीतीचा अनुभव, प्रत्येकाला मिळो\nयेशू ख्रिस्ताचे हे नाव, घराघरात गाजो',
'Dhanyawad deuya aapann, saarya jagachya kartyala\nMukticha marg dakhvun, tyane vachvile aamhalla\nTyachya preeticha anubhav, pratyekala milo\nYeshu Khristache he naav, gharagharat gajo',
'[G]Dhanyawad [C]deuya aa[D]pann, saarya ja[G]gachya kar[D]tyala\n[G]Mukticha [C]marg da[D]khvun, [C]tyane vachvi[D]le aam[G]halla\n[Em]Tyachya preeti[C]चा anubhav, prat[D]yekala [G]milo\n[Em]Yeshu Khris[C]tache he [D]naav, [C]ghara[D]gharat [G]gajo',
'G', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(242, 'येशू माझा सखा', 'Contemporary', 'Contemporary', 'marathi',
'येशू माझा सखा, तो आहे माझ्या हृदयात\nसाऱ्या प्रवासात तो, आहे माझ्या सोबतच\nतो मला धीर देतो, तो मला सावरतो\nप्रत्येक संकटात तो, मला वाचवतो',
'Yeshu majha sakha, to aahe majhya hrudayat\nSaarya pravasat to, aahe majhya sobatch\nTo mala dhar deto, to mala savarto\nPratyek sankatat to, mala vachvto',
'[C]Yeshu majha [F]sakha, [G]to aahe majhya [C]hruda[G]yat\n[C]Saarya pra[F]vasat [G]to, aahe [F]majhya so[G]ba[C]tch\n[Am]To mala dhar [F]deto, [G]to mala sa[C]varto\n[Am]Pratyek san[F]katat to, [G]mala [F]va[G]chvto',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(243, 'देवा तुझे तेज', 'Contemporary', 'Contemporary', 'marathi',
'देवा तुझे तेज, या अवघ्या सृष्टीला उजळू दे\nतुझ्या पवित्र प्रेमाने, आमचे मन तू भरू दे\nपापांचा अंधकार दूर व्हावा, तुझ्या प्रकाशात आम्ही राहावे\nतुझ्याच दिव्य सानिध्यात, आमचे जीवन उजळू दे',
'Deva Tuze tej, ya avghya srishtila ujlu de\nTujhya pavitra premane, aamche man Tu bharu de\nPaapancha andhakar dur vhava, Tujhya prakashat aamhi rahave\nTujhyach divya sanidhyat, aamche jeevan ujlu de',
'[D]Deva Tuze [G]tej, ya [D]avghya srishti[A]la ujlu [D]de\n[D]Tujhya pavitra [G]premane, [A]aamche man Tu [D]bharu de\n[Bm]Paapancha andha[G]kar dur vha[D]va, Tujhya pra[A]kashat aamhi ra[D]have\n[Bm]Tujhyach divya sani[G]dhyat, [A]aamche jeevan [D]ujlu de',
'D', 0, 75, '4/4', 'Verse1, Chorus', 1, TRUE),

(244, 'महिमा महिमा येशूला', 'Contemporary', 'Contemporary', 'marathi',
'महिमा महिमा येशूला, महिमा तारणहाराला\nज्याने आम्हा मुक्ती दिली, अर्पण त्या देवाला\nसाऱ्या सृष्टीचा तो राजा, साऱ्या जगाचा आधार\nत्याच्याच द्वारे उजळला, आमचा हा संसार',
'Mahima mahima Yeshula, mahima tarannhaarala\nJyane aamha mukti dili, arpann tya devala\nSaarya srishticha to raja, saarya jagacha aadhar\nTyachyach dware ujalttla, aamcha ha sansar',
'[G]Mahima mahima [C]Yeshula, [G]mahima [D]tarannhaa[G]rala\n[G]Jyane aamha [C]mukti [G]dili, [D]arpann tya De[G]va[D]la\n[Em]Saarya srishti[C]cha to [G]raja, saarya [D]jagacha aa[G]dhar\n[Em]Tyachyach dware [C]ujaltt[D]la, aam[C]cha ha san[G]sar',
'G', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(245, 'प्रभू तुझी स्तुती गायक', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू तुझी स्तुती गायक, मी साऱ्या जगात व्हावे\nतुझ्या पवित्र नावाचा, जयजयकार मी गावे\nपापांच्या बंधनातून तू, मला मुक्त केले\nतुझ्या प्रीतीच्या रंगात, माझे जीवन रंगले',
'Prabhu Tuzi stuti gaayak, mi saarya jagat vhave\nTujhya pavitra navacha, jayjaykar mi gaave\nPaapanchya bandhanatun Tu, mala mukt kele\nTujhya preetichya rangat, majhe jeevan rangle',
'[Am]Prabhu Tuzi [G]stuti gaa[F]yak, [G]mi saarya jagat [Am]vhave\n[Am]Tujhya pavitra [G]navacha, [F]jayjaykar [G]mi gaa[Am]ve\n[C]Paapanchya bandha[G]natun [F]Tu, ma[G]la mukt [C]kele\n[Am]Tujhya preetichya [G]ran[F]gat, [G]majhe jeevan [Am]rangle',
'Am', 0, 80, '4/4', 'Verse1, Chorus', 1, TRUE),

(246, 'येशूच्या सानिध्यात', 'Contemporary', 'Contemporary', 'marathi',
'येशूच्या सानिध्यात, शांती मिळते आम्हाला\nतुझ्या पवित्र प्रेमात, विरघळून जातो आम्ही\nतूच आमचा राजा प्रभू, तूच तारणहार\nतुझ्याच चरणी आम्ही, अर्पू हा जोहार',
'Yeshuchya sanidhyat, shanti milte aamhalla\nTujhya pavitra premat, virghalun jato aamhi\nTuch aamcha raja Prabhu, Tuch tarannhaar\nTujhyach charni aamhi, arpu ha johaar',
'[G]Yeshuchya sani[C]dhyat, [G]shanti milte [D]aam[G]halla\n[G]Tujhya pavitra [C]premat, [D]virghalun [C]jato [G]aamhi\n[Em]Tuch aamcha [C]raja [G]Prabhu, [D]Tuch tarann[G]haar\n[Em]Tujhyach [C]charni [G]aamhi, [D]arpu ha [G]jo[G]haar',
'G', 0, 72, '4/4', 'Chorus, Verse1', 1, TRUE),

(247, 'प्रभू तुझी आराधना', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू तुझी आराधना, आम्ही करतो मनापासून\nतुझ्या पवित्र नावाचा, जयजयकार करतो प्रेमाने\nतू महान आहेस देवा, तूच आमचा आधार\nतुझ्याच द्वारे आम्हाला, मिळाला हा उद्धार',
'Prabhu Tuzi aaradhana, aamhi karto manapasun\nTujhya pavitra navacha, jayjaykar karto premane\nTu mahan aahes Deva, Tuch aamcha aadhar\nTyachyach dware aamhalla, milala ha uddhar',
'[C]Prabhu Tuzi [F]aaradha[G]na, [C]aamhi karto [G]manapa[C]sun\n[C]Tujhya pa[F]vitra na[G]vacha, [F]jayjaykar [G]karto [C]premane\n[Am]Tu mahan [F]aahes [G]Deva, [Am]Tuch aam[F]cha aa[G]dhar\n[C]Tyachyach [F]dware aam[G]halla, [F]milala ha [G]uddhar',
'C', 0, 80, '4/4', 'Chorus, Verse1', 1, TRUE),

(248, 'येशूसारखा कोणी नाही', 'Contemporary', 'Contemporary', 'marathi',
'येशूसारखा कोणी नाही, साऱ्या या जगात\nज्याने आम्हाला जीव दिले, त्याच्याच रंगात\nपापांतून त्याने आम्हाला सोडविले\nतुझ्या पवित्र रक्ताने, शुद्ध आम्हाला केले',
'Yeshusarkha koni nahi, saarya ya jagat\nJyane aamhalla jeev dile, tyachyach rangat\nPaapantun tyane aamhalla sodvile\nTujhya pavitra raktane, shuddh aamhalla kele',
'[D]Yeshusarkha [G]koni [D]nahi, saarya [A]ya ja[D]gat\n[D]Jyane aam[G]halla [D]jeev dile, [A]tyachyach ran[D]gat\n[Bm]Paapantun [G]tyane [D]aam[A]halla sod[D]vile\n[Bm]Tujhya pa[G]vitra rak[D]tane, [A]shuddh aam[G]halla [D]kele',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(249, 'आनंदाने गाऊया', 'Contemporary', 'Contemporary', 'marathi',
'आनंदाने गाऊया, येशू ख्रिस्ताची स्तुती\nत्याने आम्हाला दिली, मुक्तीची ही ज्योती\nतो आमचा तारणहार, तो आमचा रक्षक\nप्रत्येक संकटात तो, आमचा मार्गदर्शक',
'Anandane gauya, Yeshu Khristachi stuti\nTyane aamhalla dili, muktichi hi jyoti\nTo aamcha tarannhaar, to aamcha rakshak\nPratyek sankatat to, aamcha margdarshak',
'[G]Ananda[C]ne gauya, [D]Yeshu Khri[G]stachi stuti\n[G]Tyane aam[C]halla dili, [D]muktichi [C]hi [G]jyoti\n[Em]To aamcha [C]tarann[G]haar, to [D]aamcha rak[G]shak\n[Em]Pratyek san[C]katat to, [D]aamcha marg[G]darshak',
'G', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(250, 'येशूचे नाव गाऊया', 'Contemporary', 'Contemporary', 'marathi',
'येशूचे नाव गाऊया, साऱ्या या विश्वात\nत्याच्याच प्रीतीचा अनुभव, प्रत्येकाच्या हृदयात\nतो महान आहे तो दयाळू आहे\nतुझ्याच द्वारे आम्हाला, मुक्ती मिळाली आहे',
'Yeshuche naav gauya, saarya ya vishwat\nTyachyach preeticha anubhav, pratyekachya hrudayat\nTo mahan aahe to dayalu aahe\nTujhyach dware aamhalla, mukti milali aahe',
'[C]Yeshuche [F]naav gau[G]ya, saarya [F]ya vi[C]shwat\n[C]Tyachyach pree[F]ticha anu[G]bhav, prat[F]yekachya [C]hrudayat\n[Am]To mahan [G]aahe [F]to da[G]ya[C]lu aahe\n[Am]Tujhyach [F]dware aam[G]halla, [F]mukti mi[G]la[C]li aahe',
'C', 0, 84, '4/4', 'Chorus, Verse1', 1, TRUE),

(251, 'प्रभू तुझा महिमा', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू तुझा महिमा, गाऊ आम्ही सदासर्वकाळ\nतुझ्या अगाध लीलेचा, हाच आहे फळ\nतू आमचा राजा तू तारणहार\nतुझ्याच चरणी अर्पू, आमचा हा जोहार',
'Prabhu Tuza mahima, gau aamhi sadasarvakal\nTujhya agaadh lilecha, haach aahe phal\nTu aamcha raja Tu tarannhaar\nTujhyach charni arpu, aamcha ha johaar',
'[D]Prabhu Tuza [G]mahi[D]ma, gau [A]aamhi sa[D]dasarvakal\n[D]Tujhya a[G]gaadh li[D]lecha, [A]haach aahe [D]phal\n[Bm]Tu aamcha [G]raja [D]Tu [A]tarann[D]haar\n[Bm]Tujhyach char[G]ni ar[A]pu, aamcha [G]ha jo[D]haar',
'D', 0, 120, '4/4', 'Chorus, Verse1', 1, TRUE),

(252, 'येशूची स्तुती करा', 'Contemporary', 'Contemporary', 'marathi',
'येशूची स्तुती करा, साऱ्या या जगात\nमुक्तीचा दीप उजळा, प्रत्येकाच्या घरात\nतो महान आहे तो श्रेष्ठ आहे\nतुझ्याच प्रीतीचा हा, अनुभव गोड आहे',
'Yeshuchi stuti kara, saarya ya jagat\nMukticha deep ujaltta, pratyekachya gharat\nTo mahan aahe to shreshth aahe\nTujhya preeticha ha, anubhav goad aahe',
'[G]Yeshuchi [C]stuti [G]kara, saarya [D]ya ja[G]gat\n[G]Mukticha [C]deep uja[D]ltta, prat[C]yekachya [G]gharat\n[Em]To ma[C]han aahe [D]to shreshth [G]aahe\n[Em]Tujhya pree[C]ticha [D]ha, anubhav [C]goad [G]aahe',
'G', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(253, 'माझे जीवन तुझ्या हाती', 'Contemporary', 'Contemporary', 'marathi',
'माझे जीवन तुझ्या हाती, अर्पण प्रभू मी केले\nतुझ्या पवित्र साक्षीने, माझे भाग्य उजळले\nआता भीती नाही कशाची, चिंता नाही मनाला\nतुझ्या सानिध्यात प्रभू, शांती मिळाली मला',
'Majhe jeevan Tujhya haati, arpann Prabhu mi kele\nTujhya pavitra sakshine, majhe bhagy ujalttle\nAata bhiti nahi kashachi, chinta nahi manala\nTujhya sanidhyat Prabhu, shanti milali mala',
'[Am]Majhe jeevan [G]Tujhya [F]haati, [G]arpann Prabhu [Am]mi kele\n[Am]Tujhya pa[G]vitra sak[F]shine, [G]majhe bhagy [Am]ujalttle\n[C]Aata bhiti [G]nahi kasha[F]chi, [G]chinta nahi [C]manala\n[Am]Tujhya sa[G]nidh[F]yat Pra[G]bhu, [F]shanti mi[G]lali [Am]mala',
'Am', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(254, 'येशू राजा तू महान', 'Contemporary', 'Contemporary', 'marathi',
'येशू राजा तू महान, साऱ्या सृष्टीचा नियंता\nतुझ्याच द्वारे आम्हाला, मिळाला हा तारणकर्ता\nमुक्तीचा तू दाता आहेस, शांतीचा राजकुमार\nतुझ्याच चरणी नत होऊ, स्वीकार आमचा जोहार',
'Yeshu Raja Tu mahan, saarya srishticha niyanta\nTujhyach dware aamhalla, milala ha tarannkarta\nMukticha Tu daata aahes, shanticha rajkumar\nTujhyach charni nat hou, sweekar aamcha johaar',
'[D]Yeshu Raja [G]Tu ma[D]han, saarya [A]srishticha ni[D]yanta\n[D]Tujhyach dware [G]aam[D]halla, mi[A]lala ha ta[D]rannkarta\n[Bm]Mukticha Tu [G]daata [D]aahes, [A]shanticha raj[D]kumar\n[Bm]Tujhyach char[G]ni nat [A]hou, swee[G]kar aamcha [D]johaar',
'D', 0, 75, '4/4', 'Chorus, Verse1', 1, TRUE),

(255, 'स्तुती प्रार्थना करू', 'Krishnaji Ratnaji Sangale', 'Upasana Sangeet', 'marathi',
'स्तुती प्रार्थना करू, प्रभूची आपण\nत्याने आम्हाला दिले, जीवनाचे पावन\nतोच आमचा तारणहार, तोच आमचा आधार\nतुझ्याच पवित्र नावाचा, जयजयकार अपार',
'Stuti prarthana karu, Prabhuchi aapann\nTyane aamhalla dile, jeevanache pavan\nToch aamcha tarannhaar, toch aamcha aadhar\nTujhya pavitra navacha, jayjaykar aapaar',
'[C]Stuti prar[F]thana ka[G]ru, Pra[F]bhuchi aa[C]pann\n[C]Tyane aam[F]halla di[G]le, jeeva[F]nache [C]paavan\n[Am]Toch aamcha [G]tarann[F]haar, [G]toch aamcha [C]aa[G]dhar\n[Am]Tujhya pa[F]vitra na[G]vacha, [F]jayjaykar [G]aa[C]paar',
'C', 0, 70, '4/4', 'Verse1, Chorus', 1, TRUE),

(256, 'येता प्रभू दरबारात', 'Traditional', 'Upasana Sangeet', 'marathi',
'येता प्रभू दरबारात, अंतःकरण शुद्ध करा\nतुझ्या पवित्र प्रेमाचा, अनुभव सर्वांना दे ईश्वरा\nआम्ही चुकलो आम्ही वाकलो, शुद्ध आम्हाला कर\nतुझ्या स्वर्गीय शांतीने, आमचा ताबा तू घे',
'Yeta Prabhu darbarat, antahkarann shuddh kara\nTujhya pavitra premacha, anubhav sarvanna dey Ishwara\nAamhi chuklo aamhi vaklo, shuddh aamhalla kar\nTujhya swargiya shantine, aamcha taba Tu ghey',
'[G]Yeta Prabhu [C]darba[G]rat, antah[D]karann shuddh [G]kara\n[G]Tujhya pa[C]vitra pre[G]macha, anu[D]bhav sarvanna [G]dey\n[Em]Aamhi chuklo [C]aamhi [G]vaklo, [D]shuddh aamhalla [G]kar\n[Em]Tujhya swar[C]giya shan[D]tine, [C]aamcha ta[D]ba Tu [G]ghey',
'G', 0, 80, '4/4', 'Verse1, Chorus', 1, TRUE),

(257, 'सुंदर सुंदर येशू नाव', 'Traditional', 'Upasana Sangeet', 'marathi',
'सुंदर सुंदर येशू नाव, मुखी यावे वारंवार\nत्या नावात आहे शक्ती, त्या नावात आहे उद्धार\nसंकटात ते नाव आठवावे, भीतीत ते धीर देते\nप्रत्येक दुःख विरघळवते, शांतीचा पाझर फोडते',
'Sundar sundar Yeshu naav, mukhi yaave varamvar\nTya naavat aahe shakti, tya naavat aahe uddhar\nSankatat te naav aathvave, bhitit te dhar dete\nPratyek duhkh virghalvate, shanticha pajhar phodte',
'[D]Sundar sundar [G]Yeshu [D]naav, mukhi [A]yaave va[D]ramvar\n[D]Tya naavat [G]aahe sha[D]kti, [A]tya naavat aahe [D]uddhar\n[Bm]Sankatat te naav [G]aathva[D]ve, [A]bhitit te [G]dhar [D]dete\n[Bm]Pratyek duhkh [G]virghal[D]vate, [A]shanti[G]cha pajhar [D]phodte',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(258, 'हे हृदय मंदिर माझे', 'Traditional', 'Upasana Sangeet', 'marathi',
'हे हृदय मंदिर माझे, तूच त्यात राहावे\nतुझ्या पवित्र आत्म्याने, माझे हृदय तू भरावे\nजगाचा कलंक नसावा, फक्त तुझेच तेज दिसावे\nमाझ्या प्रत्येक कार्यातून, तुझेच नाव गाजावे',
'He hruday mandir majhe, Tuch tyat rahave\nTujhya pavitra aatmyane, majhe hruday Tu bharave\nJagacha kalank nasava, phakta tujhech tej disave\nMajhya pratyek karyatun, tujhech naav gajave',
'[C]He hruday [F]mandir [C]majhe, [G]Tuch tyat ra[C]have\n[C]Tujhya pa[F]vitra aat[C]myane, majhe [G]hruday Tu [C]bharave\n[Am]Jagacha ka[F]lank na[G]sava, phakta [F]tujhech tej [C]di[G]save\n[Am]Majhya prat[F]yek kar[G]yatun, [F]tujhech [G]naav ga[C]jave',
'C', 0, 70, '4/4', 'Verse1, Chorus', 1, TRUE),

(259, 'जीवना तू माझे', 'Traditional', 'Upasana Sangeet', 'marathi',
'जीवना तू माझे, येशू ख्रिस्ताच्या हाती द्यावे\nतुझ्या अगाध प्रीतीचे, गुणगान नेहमी करावे\nतोच माझा राजा प्रभू, तोच माझा देव\nतुझ्याच नामात आहे, मुक्तीची ही भेव',
'Jivana Tu majhe, Yeshu Khristachya haati dyave\nTujhya agaadh preetiche, gungaan nehmich karave\nToch majha raja Prabhu, toch majha dev\nTujhyach namat aahe, muktichi hi bhev',
'[G]Jivana Tu [C]majhe, [G]Yeshu Khristachya [D]haati [G]dyave\n[G]Tujhya a[C]gaadh preeti[G]चे, gun[D]gaan nehmich [G]ka[G]rave\n[Em]Toch majha [C]raja [G]Prabhu, [D]toch majha [G]dev\n[Em]Tujhyach na[C]mat aa[D]he, [C]muktichi [D]hi [G]bhev',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(260, 'देवा तुझ्या थोरवीचे', 'Hanipant Khisty', 'Traditional Hymn', 'marathi',
'देवा तुझ्या थोरवीचे, गान सदासर्वकाळ गाईन\nतुझ्या अगाध लीलेचे, वर्णन मी करीन\nसाऱ्या सृष्टीचा नियंता तू, महान पराक्रमी\nतुझ्या चरणी नत होतो, आम्ही तुझी लेकरे ही',
'Deva Tujhya thorviche, gaan sadasarvakal gaain\nTujhya agaadh lileche, varnann mi kareen\nSaarya srishticha niyanta Tu, mahan parakrami\nTujhya charni nat hoto, aamhi tujhi lehare hi',
'[D]Deva Tujhya [G]thorvi[D]चे, gaan [A]sadasarva[D]kal gaain\n[D]Tujhya a[G]gaadh li[D]leche, [A]varnann mi [D]ka[D]reen\n[Bm]Saarya srishti[G]cha niyanta [D]Tu, ma[A]han parak[D]rami\n[Bm]Tujhya char[G]ni nat [A]hoto, aamhi [G]tujhi lehare [D]hi',
'D', 0, 75, '4/4', 'Verse1, Chorus', 1, TRUE),

(261, 'कोण मित्र येशुवाणी', 'Mary E. Bissell', 'Upasana Sangeet', 'marathi',
'कोण मित्र येशुवाणी, सारे ओझे वाहाया?\nसर्व दुःखे तो ऐकुनी, सहाय्य करी सोसाया;\nत्याकडे कधी न जातां, आम्ही अवमानितो,\nशांति खरी हरवूनी, शोक किती करितो.',
'Kon Mitra Yeshuwani, saare ojhe vahaya?\nSarva dukhe to aikuni, sahayy kari sosaya;\nTyakade kadhi na jata, aamhi avmanito,\nShanti khari harvuni, shok kiti karito.',
'[G]Kon Mitra [C]Yeshu[G]wani, saare [D]ojhe va[G]haya?\n[G]Sarva dukhe [C]to ai[G]kuni, sa[D]hayy [C]kari [G]sosaya;\n[D]Tyakade ka[G]dhi na [C]jata, aamhi [G]avma[D]nito,\n[G]Shanti khari [C]harvu[G]ni, [D]shok kiti [G]karito.',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(262, 'होईल वृष्टी कृपेची', 'V. K. Koshe', 'Upasana Sangeet', 'marathi',
'होईल वृष्टी कृपेची, देवा तूच ती पाड\nपापामुळे सुकलेली, मने तूच ही लाड\nआशिर्वाद आशिर्वाद, आम्हाला द्या प्रभू\nतुझ्या पवित्र नावाचा, जयजयकार करू',
'Hoil vrushti krupechi, Deva Tuch ti paad\nPaapamule sukleli, mane Tuch hi laad\nAashirwad aashirwad, aamhalla dya Prabhu\nTujhya pavitra navacha, jayjaykar karu',
'[D]Hoil vrushti [G]krupe[D]chi, Deva [A]Tuch ti [D]paad\n[D]Paapamule [G]sukle[D]li, mane [A]Tuch hi [D]laad\n[G]Aashirwad aashi[D]rwad, aam[A]halla dya [D]Prabhu\n[G]Tujhya pavitra [D]nava[A]cha, jay[G]jaykar [D]karu',
'D', 0, 84, '3/4', 'Chorus, Verse1', 1, TRUE),

(263, 'ईश्वराची प्रार्थना', 'Hari Govind Kelkar', 'Traditional Hymn', 'marathi',
'ईश्वराची प्रार्थना, आम्ही करतो मनापासून\nतुझ्या पवित्र मंदिरात, येतो प्रभू आम्ही धावून\nतू आमचा पालनहार, तूच आमचा तारणहार\nतुझ्याच चरणी आम्ही, अर्पू आमचा जोहार',
'Ishwarachi prarthana, aamhi karto manapasun\nTujhya pavitra mandirat, yeto Prabhu aamhi dhavun\nTu aamcha paalannhaar, Tuch aamcha tarannhaar\nTujhyach charni aamhi, arpu aamcha johaar',
'[C]Ishwarachi [F]prar[G]thana, [C]aamhi karto [G]manapa[C]sun\n[C]Tujhya pa[F]vitra man[G]dirat, yeto [F]Prabhu [G]aamhi [C]dhavun\n[Am]Tu aamcha [F]paalann[G]haar, [Am]Tuch aam[F]cha tarann[G]haar\n[C]Tujhyach [F]charni aa[G]mhi, [F]arpu aamcha [G]jo[C]haar',
'C', 0, 75, '4/4', 'Verse1, Chorus', 1, TRUE),

(264, 'ख्रिस्ती सैनिकांस प्रोत्साहन', 'B. L. Salvi', 'Traditional Hymn', 'marathi',
'ख्रिस्ती सैनिकांनो उठा, सज्ज व्हा युद्धासाठी\nप्रभू येशू राजा आपला, आहे आपल्या पाठी\nसत्याचा पट्टा बांधा, शांतीचे पायतण घालून\nविजयाची ध्वजा फडकवू, शत्रूला आपण जिंकून',
'Khristi sainikanno utha, sajj vha yuddhasathi\nPrabhu Yeshu Raja aapla, aahe aaplya pathi\nSatyacha patta bandha, shantiche paytann ghalun\nVijayachi dhwaja phadkvu, shatrula aapann jinkun',
'[G]Khristi saini[C]kanno [G]utha, sajj [D]vha yu[G]ddhasathi\n[G]Prabhu Yeshu [C]Raja [G]aapla, aahe [D]aaplya [G]pathi\n[Em]Satyacha [C]patta [G]bandha, [D]shantiche pay[G]tann ghalun\n[Em]Vijayachi [C]dhwaja [D]phadkvu, [C]shatrula [D]aapann [G]jinkun',
'G', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(265, 'तू महान देव', 'Contemporary', 'Marathi Version', 'marathi',
'परमेश्वरा, तू महान देव आहेस\nसाऱ्या साऱ्या सृष्टीवर, तुझेच राज चालते\nतू महान आहेस देवा, तूच आमचा आधार\nतुझ्याच द्वारे आम्हाला, मिळाला हा उद्धार',
'Parameshwara, Tu mahan Dev aahes\nSaarya saarya srishtivar, Tujhech raaj chalte\nTu mahan aahes Deva, Tuch aamcha aadhar\nTujhyach dware aamhalla, milala ha uddhar',
'[C]Parameshwara, [F]Tu ma[G]han Dev [C]aahes\n[C]Saarya saarya [F]srishti[G]var, Tujhech [F]raaj chal[C]te\n[Am]Tu mahan [F]aahes [G]Deva, [Am]Tuch aam[F]cha aa[G]dhar\n[C]Tujhyach [F]dware aam[G]halla, mi[F]lala ha [G]u[C]ddhar',
'C', 0, 72, '4/4', 'Chorus, Verse1', 1, TRUE),

(266, 'तुझ्या दारी आलो आम्ही', 'Samuel Gawai', 'Samuel Gawai', 'marathi',
'तुझ्या दारी आलो आम्ही, प्रभू येशू राजा\nतुझ्या पवित्र मंदिरात, स्वीकार आमची पूजा\nआम्ही तहानलेले आम्ही भुकेले, तूच आम्हाला तृप्त कर\nतुझ्या स्वर्गीय शांतीने, आमचे हृदय तू भर',
'Tujhya dari aalo aamhi, Prabhu Yeshu Raja\nTujhya pavitra mandirat, sweekar aamchi puja\nAamhi tahanlele aamhi bhukele, Tuch aamhalla trupt kar\nTujhya swargiya shantine, aamche hruday Tu bhar',
'[D]Tujhya dari [G]aalo aa[D]mhi, [A]Prabhu Yeshu [D]Raja\n[D]Tujhya pa[G]vitra man[D]dirat, [A]sweekar aamchi [D]puja\n[Bm]Aamhi ta[G]hanlele aamhi [D]bhukele, [A]Tuch aamhalla [G]trupt [D]kar\n[Bm]Tujhya swar[G]giya shan[D]tine, [A]amche hru[G]day Tu [D]bhar',
'D', 0, 78, '4/4', 'Chorus, Verse1', 1, TRUE),

(267, 'माझ्या देवाचा महिमा', 'Contemporary', 'Contemporary', 'marathi',
'माझ्या देवाचा महिमा, गाऊ आम्ही आनंदाने\nत्याने आम्हाला वाचविले, आपल्या पवित्र रक्ताने\nतो महान आहे तो दयाळू आहे\nतुझ्याच प्रीतीने हे, जीवन सुखकर आहे',
'Mazya Devacha mahima, gau aamhi anandane\nTyane aamhalla vachvile, aaplya pavitra raktane\nTo mahan aahe to dayalu aahe\nTujhyach preetine he, jeevan sukhkar aahe',
'[G]Mazya Deva[C]cha mahi[G]ma, gau [D]aamhi a[G]nandane\n[G]Tyane aam[C]halla va[G]chvile, [D]aaplya pavitra [G]rak[D]tane\n[Em]To ma[C]han aahe [D]to da[G]ya[D]lu aahe\n[Em]Tujhyach pree[C]tine [D]he, [C]jeevan sukh[D]kar [G]aahe',
'G', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(268, 'येशूच्या चरणी विसावा', 'Contemporary', 'Contemporary', 'marathi',
'येशूच्या चरणी विसावा, आम्ही शोधतो नेहमी\nतुझ्या पवित्र प्रेमात, आम्ही राहतो नेहमी\nसंकटे येतील वादळे उठतील, तरी आम्हा भीती नाही\nकारण आमचा तارانहार, आमच्या सोबतच राहील',
'Yeshuchya charni visava, aamhi shodhto nehmich\nTujhya pavitra premat, aamhi rahto nehmich\nSankate yetil vadle uthtil, tari aamha bhiti nahi\nKarun aamcha tarannhaar, aamcha sobatch rahil',
'[C]Yeshuchya char[F]ni vi[G]saava, [C]aamhi shodhto [G]neh[C]mich\n[C]Tujhya pa[F]vitra pre[G]mat, [F]aamhi rah[G]to nehmich\n[Am]Sankate ye[F]til va[G]dle uthtil, ta[F]ri aamha [G]bhiti [C]nahi\n[Am]Karun aam[F]cha tarann[G]haar, [F]aamcha so[G]batch rah[C]il',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(269, 'तुझे नाव महान प्रभू', 'Contemporary', 'Contemporary', 'marathi',
'तुझे नाव महान प्रभू, तुझे नाव शांतिवंत\nयेशू राजा तू श्रेष्ठ, तुझे नाव सामर्थ्यवंत\nतुझ्या नामात आहे मुक्ती, तुझ्या नामात आहे शक्ती\nसाऱ्या साऱ्या जगाचा, तूच आहेस तारणकर्ता',
'Tuze naav mahan Prabhu, Tuze naav shantivant\nYeshu Raja Tu shreshth, Tuze naav samarthyavant\nTujhya namat aahe mukti, tujhya namat aahe shakti\nSaarya saarya jagacha, Tuch aahes tarannkarta',
'[D]Tuze naav ma[G]han Pra[D]bhu, Tuze naav [A]shan[D]tivant\n[D]Yeshu Raja [G]Tu shreshth, [A]Tuze naav sa[G]marthyavanto\n[Bm]Tujhya na[G]mat aahe [D]mukti, [A]tujhya namat [D]aahe shakti\n[Bm]Saarya saa[G]rya ja[D]gacha, [A]Tuch aahes [G]tarann[D]karta',
'D', 0, 84, '4/4', 'Chorus, Verse1', 1, TRUE),

(270, 'येशूच्या रक्ताचे सामर्थ्य', 'Contemporary', 'Contemporary', 'marathi',
'येशूच्या रक्ताचे सामर्थ्य, आम्ही अनुभवतो नेहमी\nपापांच्या बंधनातून, त्याने आम्हाला मुक्ती दिली\nतो आमचा राजा तो तारणहार\nतुझ्याच पवित्र नावाचा, जयजयकार अपार',
'Yeshuchya raktache samarthy, aamhi anubhavto nehmich\nPaapanchya bandhanatun, tyane aamhalla mukti dili\nTo aamcha raja to tarannhaar\nTujhya pavitra navacha, jayjaykar aapaar',
'[G]Yeshuchya rakta[C]चे sa[G]marthy, [D]aamhi anubhavto [G]nehmich\n[G]Paapanchya [C]bandha[G]natun, [D]tyane aamhalla [G]mukti [G]dili\n[Em]To aam[C]cha raja [G]to tarann[D]haar\n[Em]Tujhya pa[C]vitra na[D]vacha, [C]jayjaykar [D]aa[G]paar',
'G', 0, 75, '4/4', 'Verse1, Chorus', 1, TRUE),

(271, 'प्रभू माझा सांभाळणारा', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू माझा सांभाळणारा, तो माझ्या पाठीशी\nदुःखाच्या दरीतून, तो मला सुखरूप नेतो\nसंकटे येतील वादळे उठतील, तरी मी डगमगणार नाही\nकारण माझा येशू प्रभू, माझ्या सोबतच राहील',
'Prabhu majha sambhalnara, to majhya pathishi\nDuhkhacha daritun, to mala sukhrup neto\nSankate yetil vadle uthtil, tari mi dagmagnar nahi\nKarun majha Yeshu Prabhu, majhya sobatch rahil',
'[C]Prabhu majha [F]sambha[G]lnara, [C]to majhya pa[G]thishi\n[C]Duhkhacha [F]dari[G]tun, [F]to mala sukh[G]rup [C]neto\n[Am]Sankate ye[F]til va[G]dle uthtil, ta[F]ri mi dag[G]magnar [C]nahi\n[Am]Karun majha [F]Yeshu Pra[G]bhu, [F]majhya so[G]batch rah[C]il',
'C', 0, 80, '4/4', 'Verse1, Chorus', 1, TRUE),

(272, 'येशूचे प्रेम किती महान', 'Contemporary', 'Contemporary', 'marathi',
'येशूचे प्रेम किती महान, आम्हा सर्वांसाठी\nत्याने आपला प्राण दिला, आम्हा वाचविण्यासाठी\nअगाध प्रीतीचा हा अनुभव, प्रत्येकाला मिळो\nयेशू ख्रिस्ताचे नाव, घराघरात गाजो',
'Yeshuche prem kiti mahan, aamha sarvansathi\nTyane aapla prann dila, aamha vachvinyasathi\nAgaadh preeticha ha anubhav, pratyekala milo\nYeshu Khristache naav, gharagharat gajo',
'[G]Yeshuche [C]prem [G]kiti ma[D]han, [G]aamha sarvan[D]sathi\n[G]Tyane aapla [C]prann [D]dila, aamha [C]vachvinyasathi[G]\n[Em]Agaadh [C]preeti[G]cha ha anubha[D]v, pratyekala [G]milo\n[Em]Yeshu Khris[C]tache [D]naav, [C]ghara[D]gharat [G]gajo',
'G', 0, 72, '4/4', 'Chorus, Verse1', 1, TRUE),

(273, 'नमस्कार नमस्कार येशूला', 'Contemporary', 'Contemporary', 'marathi',
'नमस्कार नमस्कार नमस्कार येशूला\nमहिमा महिमा महिमा तारणहाराला\nतुझ्या चरणी आम्ही येतो, आमचे जीवन वाहतो\nतुझ्या पवित्र नावाचा, जयजयकार आम्ही करतो',
'Namaskar namaskar namaskar Yeshula\nMahima mahima mahima tarannhaarala\nTujhya charni aamhi yeto, aamche jeevan vahto\nTujhya pavitra navacha, jayjaykar aamhi karto',
'[D]Namas[G]kar namas[D]kar namas[A]kar Ye[D]shula\n[D]Mahima ma[G]hima ma[D]hima [A]tarannhaa[D]rala\n[Bm]Tujhya char[G]ni aamhi [D]yeto, aamche [A]jeevan [D]vahto\n[Bm]Tujhya pa[G]vitra na[D]vacha, [A]jayjaykar [G]aamhi [D]karto',
'D', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(274, 'मुक्तीचा दीप प्रज्वलित', 'Contemporary', 'Contemporary', 'marathi',
'मुक्तीचा दीप प्रज्वलित, झाला आहे जगात\nयेशू ख्रिस्ताचा विजय, झाला आहे घरात\nअंधकार दूर झाला, प्रकाशाचा उदय झाला\nयेशूच्या सानिध्यात, आमचा आत्मा रंगला',
'Mukticha deep prajwaltit, jhala aahe jagat\nYeshu Khristacha vijay, jhala aahe gharat\nAndharat dur jhala, prakashacha uday jhala\nYeshuchya sanidhyat, aamcha aatma rangla',
'[C]Mukticha deep [F]prajwal[G]tit, jhala [F]aahe [G]ja[C]gat\n[C]Yeshu Khrista[F]cha vi[G]jay, jha[F]la aahe [G]gha[C]rat\n[Am]Andharat [F]dur jha[G]la, pra[F]kashacha uday [C]jhala\n[Am]Yeshuchya [F]sanidh[G]yat, [F]aamcha aat[G]ma ran[C]gla',
'C', 0, 80, '4/4', 'Chorus, Verse1', 1, TRUE),

(275, 'येशू माझा तारणहार', 'Contemporary', 'Contemporary', 'marathi',
'येशू माझा तारणहार, तो माझ्या हृदयात\nतुझ्या पवित्र नावाचा, जयजयकार प्रत्येक क्षणात\nतू महान आहेस देवा, तूच आमचा आधार\nतुझ्याच द्वारे आम्हाला, मिळाला हा उद्धार',
'Yeshu majha tarannhaar, to majhya hrudayat\nTujhya pavitra navacha, jayjaykar pratyek kshanat\nTu mahan aahes Deva, Tuch aamcha aadhar\nTujhyach dware aamhalla, milala ha uddhar',
'[G]Yeshu majha [C]tarann[G]haar, [D]to majhya hruda[G]yat\n[G]Tujhya pavitra [C]navacha, [D]jayjaykar pratyek [C]ksha[G]nat\n[Em]Tu ma[C]han aahe [G]Deva, [D]Tuch aamcha [G]aa[D]dhar\n[Em]Tujhyach [C]dware aam[G]halla, [D]milala ha [C]uddhar',
'G', 0, 75, '4/4', 'Chorus, Verse1', 1, TRUE),

(276, 'तुझे प्रेम अफाट', 'Dr. Victor Benjamin', 'Dr. Victor Benjamin', 'marathi',
'तुझे प्रेम अफाट प्रभू, तुझे प्रेम अगाध\nतुझ्या पवित्र नावाचा, जयजयकार अपार\nपापांतून तू मला, मुक्ती दिली आहेस\nनवे जीवन देऊन, तू मला उजळले आहेस',
'Tuze prem aphat Prabhu, Tuze prem agaadh\nTujhya pavitra navacha, jayjaykar aapaar\nPaapantun Tu mala, mukti dili aahes\nNave jeevan deun, Tu mala ujalttle aahes',
'[D]Tuze prem a[G]phat [D]Pra[A]bhu, Tuze prem a[D]gaadh\n[D]Tujhya pa[G]vitra na[D]vacha, [A]jayjaykar [D]aapaar\n[Bm]Paapantun [G]Tu ma[D]la, [A]mukti dili [D]aahes\n[Bm]Nave jee[G]van de[D]un, [A]Tu mala uja[G]lttle [D]aahes',
'D', 0, 72, '4/4', 'Chorus, Verse1', 1, TRUE),

(277, 'येशूच्या नावात शक्ती', 'Contemporary', 'Contemporary', 'marathi',
'येशूच्या नावात शक्ती, येशूच्या नावात मुक्ती\nप्रत्येक संकटात प्रभू, तूच देतोस आम्हा क्रांती\nतुझ्या नामात आहे शांती, तुझ्या नामात आहे ज्योती\nसाऱ्या साऱ्या जगाचा, तूच आहेस तारती',
'Yeshuchya navat shakti, Yeshuchya navat mukti\nPratyek sankatat Prabhu, Tuch detos aamha kranti\nTujhya namat aahe shanti, tujhya namat aahe jyoti\nSaarya saarya jagacha, Tuch aahes tarti',
'[G]Yeshuchya na[C]vat sha[G]kti, [D]Yeshuchya na[G]vat [D]mukti\n[G]Pratyek san[C]katat Pra[D]bhu, [C]Tuch detos [D]aamha [G]kranti\n[Em]Tujhya na[C]mat aahe [G]shanti, [Em]tujhya namat [Am]aahe [D]jyoti\n[G]Saarya ja[C]gacha, [D]Tuch aahes [C]tar[D]ti',
'G', 0, 84, '4/4', 'Chorus, Verse1', 1, TRUE),

(278, 'पवित्र पवित्र येशू राजा', 'Contemporary', 'Contemporary', 'marathi',
'पवित्र पवित्र येशू राजा, साऱ्या जगाचा तारणहार\nतुझ्या पवित्र मंदिरात, स्वीकार आमचा जोहार\nमहिमेने आणि तेजाने, तू साऱ्या सृष्टीला पाहे\nतुझ्या पवित्र प्रेमात, आमचा आत्मा विरघळून राहे',
'Pavitra pavitra Yeshu Raja, saarya jagacha tarannhaar\nTujhya pavitra mandirat, sweekar aamcha johaar\nMahimene aani tejane, Tu saarya srishtila paahe\nTujhya pavitra premat, aamcha aatma virghalun rahe',
'[C]Pavitra pa[F]vitra [G]Yeshu [C]Raja, saarya [F]jagacha [C]tarann[G]haar\n[C]Tujhya pa[F]vitra man[G]dirat, [F]sweekar aamcha [C]johaar\n[Am]Mahimene [F]aani teja[G]ne, [F]Tu saarya srishti[C]la [G]paahe\n[Am]Tujhya pa[F]vitra pre[G]mat, [F]aamcha aat[G]ma virghalun [C]rahe',
'C', 0, 70, '4/4', 'Chorus, Verse1', 1, TRUE),

(279, 'माझे मन उजळले', 'Contemporary', 'Contemporary', 'marathi',
'माझे मन उजळले, येशू ख्रिस्ताच्या रंगात\nपापांचा अंधकार दूर झाला, प्रकाशाच्या या भंगात\nतूच आमचा राजा प्रभू, तूच तारणहार\nतुझ्याच चरणी आम्ही, अर्पू हा जोहार',
'Majhe man ujalttle, Yeshu Khristachya rangat\nPaapancha andhakar dur jhala, prakashachya ya bhangat\nTuch aamcha raja Prabhu, Tuch tarannhaar\nTujhyach charni aamhi, arpu ha johaar',
'[D]Majhe man u[G]jaltt[D]le, [A]Yeshu Khrista[D]chya rangat\n[D]Paapancha an[G]dhakar dur [D]jhala, [A]prakashachya ya [D]bhangat\n[Bm]Tuch aamcha [G]raja Prabhu, [D]Tuch tarann[A]haar\n[Bm]Tujhyach char[G]ni aa[D]mhi, [A]arpu ha jo[D]haar',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(280, 'प्रभू तुझी आराधना असो', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू तुझी आराधना असो, साऱ्या विश्वात\nतुझ्या पवित्र नावाचा जयजयकार, घराघरात\nमुक्तीचा तू मार्ग आहेस, जीवनाचा दीप आहेस\nप्रत्येक संकटात प्रभू, तूच आमचा आधार आहेस',
'Prabhu Tuzi aaradhana aso, saarya vishwat\nTujhya pavitra navacha jayjaykar, gharagharat\nMukticha Tu marg aahes, jeevanacha deep aahes\nPratyek sankatat Prabhu, Tuch aamcha aadhar aahes',
'[G]Prabhu Tuzi [C]aaradha[D]na a[G]so, saarya [C]vi[D]shwat\n[G]Tujhya pa[C]vitra na[D]vacha jay[C]jaykar, [D]ghara[G]gharat\n[Em]Mukticha Tu [C]marg aahes, [D]jeevanacha [G]deep aahes\n[Em]Pratyek san[C]katat Pra[D]bhu, [C]Tuch aamcha aa[D]dhar [G]aahes',
'G', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(281, 'येशूचे नाव किती सुंदर', 'Contemporary', 'Contemporary', 'marathi',
'येशूचे नाव किती सुंदर, किती गोड आहे\nत्या नावात आहे मुक्ती, त्या नावात आहे शक्ती\nसंकटात ते नाव आठवावे, भीतीत ते धीर देते\nप्रत्येक दुःख विरघळवते, शांतीचा पाझर फोडते',
'Yeshuche naav kiti sundar, kiti goad aahe\nTya naavat aahe mukti, tya naavat aahe shakti\nSankatat te naav aathvave, bhitit te dhar dete\nPratyek duhkh virghalvate, shanticha pajhar phodte',
'[C]Yeshuche naav kiti [F]sundar, [G]kiti goad [C]aahe\n[C]Tya naavat [F]aahe [G]mukti, [F]tya naavat aahe [C]shakti\n[Am]Sankatat te naav [F]aathva[G]ve, [F]bhitit te [G]dhar de[C]te\n[Am]Pratyek duhkh [F]virghal[G]vate, [F]shanti[G]cha pajhar [C]phodte',
'C', 0, 75, '4/4', 'Chorus, Verse1', 1, TRUE),

(282, 'येशूचा विजय', 'Contemporary', 'Contemporary', 'marathi',
'येशूचा विजय, साऱ्या या जगात\nमुक्तीचा दीप प्रज्वलित, प्रत्येकाच्या हृदयात\nतो महान आहे तो दयाळू आहे\nतुझ्याच प्रीतीने हे, जीवन सुखकर आहे',
'Yeshucha vijay, saarya ya jagat\nMukticha deep prajwaltit, pratyekachya hrudayat\nTo mahan aahe to dayalu aahe\nTujhyach preetine he, jeevan sukhkar aahe',
'[D]Yeshucha [G]vi[D]jay, saarya [A]ya ja[D]gat\n[D]Mukticha deep [G]prajwal[D]tit, prat[A]yekachya hru[D]dayat\n[Bm]To mahan [G]aahe [D]to da[A]yalu [D]aahe\n[Bm]Tujhyach pree[G]tine [D]he, [A]jeevan sukh[G]kar [D]aahe',
'D', 0, 80, '4/4', 'Chorus, Verse1', 1, TRUE),

(283, 'महिमा महिमा येशू राजाला', 'Contemporary', 'Contemporary', 'marathi',
'महिमा महिमा येशू राजाला, महिमा तारणहाराला\nज्याने आम्हा मुक्ती दिली, साऱ्या या विश्वाला\nतोच आमचा राजा प्रभू, तोच आमचा आधार\nतुझ्याच पवित्र नावाचा, जयजयकार अपार',
'Mahima mahima Yeshu Rajala, mahima tarannhaarala\nJyane aamha mukti dili, saarya ya vishwala\nToch aamcha raja Prabhu, toch aamcha aadhar\nTujhya pavitra navacha, jayjaykar aapaar',
'[G]Mahima mahima [C]Yeshu Ra[G]jala, [D]mahima tarann[G]haarala\n[G]Jyane aamha [C]mukti [G]dili, [D]saarya ya vi[G]shwala\n[Em]Toch aamcha [C]raja [G]Prabhu, toch [D]aamcha aa[G]dhar\n[Em]Tujhya pa[C]vitra na[D]vacha, [C]jayjaykar [D]aa[G]paar',
'G', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(284, 'देवा तुझी स्तुती', 'Contemporary', 'Contemporary', 'marathi',
'देवा तुझी स्तुती, करतो आम्ही आनंदाने\nतुझ्या पवित्र नावाचा जयजयकार, गातो आम्ही प्रेमाने\nतू महान आहेस देवा, तूच आमचा तारणहार\nतुझ्याच चरणी आम्ही, अर्पू हा जोहार',
'Deva Tuzi stuti, karto aamhi anandane\nTujhya pavitra navacha jayjaykar, gato aamhi premane\nTu mahan aahes Deva, Tuch aamcha tarannhaar\nTujhyach charni aamhi, arpu ha johaar',
'[C]Deva Tuzi [F]stuti, [G]karto aamhi a[C]nandane\n[C]Tujhya pa[F]vitra na[C]vacha jay[G]jaykar, gato [F]aamhi [C]premane\n[Am]Tu mahan [F]aahes [G]Deva, [Am]Tuch aam[F]cha ta[G]rannhaar\n[C]Tujhyach [F]charni aa[G]mhi, [F]arpu ha jo[G]haar',
'C', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(285, 'प्रभू माझा रक्षणकर्ता (२)', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू माझा रक्षणकर्ता, तो माझ्या पाठीशी\nप्रत्येक संकटाच्या वेळी, तोच माझ्या साथीशी\nअंधकार वर तो प्रकाशाचा, दीप होऊन उजळतो\nमाझ्या पापांची ही गाठ, तो मुक्त करून सोडवतो',
'Prabhu majha rakshannkarta, to majhya pathishi\nPratyek sankatachya veli, toch majhya sathishi\nAndharat to prakashacha, deep houn ujaltto\nMajhya paapanchi hi gaath, to mukt karun sodvato',
'[D]Prabhu majha rakshann[G]karta, to [A]majhya pa[D]thishi\n[D]Pratyek san[G]katachya [D]veli, [A]toch majhya sa[D]thishi\n[Bm]Andharat to [G]praka[D]shacha, [A]deep houn [D]ujaltto\n[Bm]Majhya paa[G]panchi hi [D]gaath, [A]to mukt ka[G]run [D]sodvato',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(286, 'आनंदी आनंद झाला', 'Contemporary', 'Contemporary', 'marathi',
'आनंदी आनंद झाला, येशूच्या भेटीने\nमाझे अवघे जीवन बदलले, त्याच्याच रितीने\nपापांचा अंधकार दूर झाला, प्रकाशाचा उदय झाला\nयेशूच्या सानिध्यात, आमचा आत्मा रंगला',
'Anandi anand jhala, Yeshuchya bhetine\nMajhe avghe jeevan badalle, tyachyach ritine\nPaapancha andhakar dur jhala, prakashacha uday jhala\nYeshuchya sanidhyat, aamcha aatma rangla',
'[G]Anandi a[C]nand [G]jhala, [D]Yeshuchya bhetine[G]\n[G]Majhe avghe [C]jeevan [G]badalle, [D]tyachyach riti[G]ne\n[Em]Paapancha an[C]dhakar dur [D]jhala, pra[C]kashacha uday [G]jhala\n[Em]Yeshuchya [C]sanidh[D]yat, aam[C]cha aatma [G]ran[G]gla',
'G', 0, 120, '4/4', 'Chorus, Verse1', 1, TRUE),

(287, 'प्रभू तुझे प्रेम महान', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू तुझे प्रेम महान, आम्हा सर्वांसाठी\nमरण सोसले तू क्रूसावर, आम्हा वाचविण्यासाठी\nतुझ्या रक्ताने तू आम्हाला, शुद्ध आणि पवित्र केले\nमुक्तीचा हा मार्ग दाखवून, आमचे भाग्य उजळले',
'Prabhu Tuze prem mahan, aamha sarvansathi\nMarann sosle Tu krusavar, aamha vachvinyasathi\nTujhya raktane Tu aamhalla, shuddh aani pavitra kele\nMukticha ha marg dakhvun, amche bhagy ujalttle',
'[C]Prabhu Tuze [F]prem [G]mahan, aam[F]ha sarvan[C]sathi\n[C]Marann sosle [G]Tu kru[F]savar, [G]aamha vachvinya[C]sathi\n[Am]Tujhya rakta[F]ne Tu [G]aamhalla, [F]shuddh aani [C]pavi[G]tra kele\n[Am]Mukticha [F]ha marg da[G]khvun, [F]amche bhagy [G]ujaltt[C]le',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(288, 'नमस्कार नमस्कार येशूला (२)', 'Contemporary', 'Contemporary', 'marathi',
'नमस्कार नमस्कार नमस्कार येशूला\nसाऱ्या साऱ्या विश्वाची, या तारणहाराला\nतुझ्या चरणी आम्ही येतो, आमचे जीवन वाहतो\nतुझ्या पवित्र नावाचा जयजयकार आम्ही करतो',
'Namaskar namaskar namaskar Yeshula\nSaarya saarya vishwachi, ya tarannhaarala\nTujhya charni aamhi yeto, aamche jeevan vahto\nTujhya pavitra navacha jayjaykar aamhi karto',
'[D]Namas[G]kar namas[D]kar namas[A]kar Ye[D]shula\n[D]Saarya saa[G]rya vi[D]shwachi, [A]ya tarannhaa[D]rala\n[Bm]Tujhya char[G]ni aamhi [D]yeto, aamche [A]jeevan [D]vahto\n[Bm]Tujhya pa[G]vitra na[D]vacha [A]jayjaykar [G]aamhi [D]karto',
'D', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(289, 'स्तुती स्तुती येशूची', 'Contemporary', 'Contemporary', 'marathi',
'स्तुती स्तुती येशूची, करू साऱ्या जगात\nमहिमा महिमा महिमा, तारणहाराचा घराघरात\nयेशू ख्रिस्ताचे हे नाव, आम्हाला शांती देते\nसंकटाच्या अंधारात, आम्हाला वाट दाखवते',
'Stuti stuti Yeshuchi, karu saarya jagat\nMahima mahima mahima, tarannhaaracha gharagharat\nYeshu Khristache he naav, aamhalla shanti dete\nSankatachya andharat, aamhalla vaat dakhvte',
'[G]Stuti stuti Ye[C]shuchi, [D]karu saarya ja[G]gat\n[G]Mahima ma[C]hima ma[D]hima, [C]tarannhaa[D]racha [G]ghara[G]gharat\n[Em]Yeshu Khris[C]tache he [D]naav, aam[C]halla shan[G]ti dete\n[Em]Sankatachya [C]andharat, aam[D]halla vaat [G]da[G]khvte',
'G', 0, 120, '4/4', 'Chorus, Verse1', 1, TRUE),

(290, 'येशू महान देव', 'Contemporary', 'Marathi Version', 'marathi',
'परमेश्वरा, तू महान देव आहेस\nतुझ्याच नावाने ही सृष्टी उजळते\nमहिमेचा तू राजा आहेस, तारणहाराचा तू आधार\nतुझ्याच चरणी आम्ही अर्पू हा जोहार',
'Parameshwara, Tu mahan Dev aahes\nTujhyach navane hi srishti ujalttle\nMahimecha Tu raja aahes, tarannhaaracha Tu aadhar\nTujhyach charni aamhi arpu ha johaar',
'[C]Parameshwara, [F]Tu ma[G]han Dev [C]aahes\n[C]Tujhyach nava[F]ne hi [G]srishti [C]u[G]jalttle\n[Am]Mahimecha [F]Tu raja [G]aahes, [F]tarannhaa[G]racha Tu aa[C]dhar\n[Am]Tujhyach [F]charni [G]aamhi [F]arpu ha [G]jo[C]haar',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(291, 'देवा तुझे प्रेम', 'Contemporary', 'Contemporary', 'marathi',
'देवा तुझे प्रेम, प्रत्येक क्षणात आठवते\nतुझ्या पवित्र सानिध्यात, मन हे माझे विरघळते\nतूच आमचा राजा प्रभू, तूच तारणहार\nतुझ्याच द्वारे आम्हाला, मिळाला हा उद्धार',
'Deva Tuze prem, pratyek kshanat aathvte\nTujhya pavitra sanidhyat, man he mazhe virghalltte\nTuch aamcha raja Prabhu, Tuch tarannhaar\nTujhyach dware aamhalla, milala ha uddhar',
'[D]Deva Tuze [G]prem, prat[A]yek kshanat aath[D]vte\n[D]Tujhya pa[G]vitra sani[A]dhyat, man [G]he mazhe [A]virghall[D]tte\n[Bm]Tuch aamcha [G]raja Prabhu, [D]Tuch tarann[A]haar\n[Bm]Tujhyach [G]dware aa[D]mhalla, [A]milala ha [D]uddhar',
'D', 0, 75, '4/4', 'Verse1, Chorus', 1, TRUE),

(292, 'येशूचे नाव गाऊया आपण', 'Contemporary', 'Contemporary', 'marathi',
'येशूचे नाव गाऊया आपण, आनंदी अंतःकरणाने\nत्याने आम्हाला दिले, जीवन आपल्या पवित्र रक्ताने\nमहिमा महिमा येशू राजाला, तारणहाराला\nज्याने वाचविले आम्हाला, मृत्यूच्या उंबरठ्यावरून',
'Yeshuche naav gauya aapann, anandi antahkaranne\nTyane aamhalla dile, jeevan aaplya pavitra raktane\nMahima mahima Yeshu Rajala, tarannhaarala\nJyane vachvile aamhalla, mrutyuchya umbarthya varun',
'[G]Yeshuche [C]naav gau[D]ya aapann, a[G]nandi an[D]tah[G]karanne\n[G]Tyane aam[C]halla di[D]le, jeeva[C]n aaplya pa[D]vitra rak[G]tane\n[Em]Mahima ma[C]hima Yeshu [G]Ra[D]jala, [G]tarannhaa[G]rala\n[Em]Jyane va[C]chvile [G]aamhalla, [D]mrutyu[C]chya umbar[D]thya va[G]run',
'G', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(293, 'प्रभू तुझा विजय असो', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू तुझा विजय असो, साऱ्या या जगात\nमुक्तीचा दीप प्रज्वलित होवो, प्रत्येकाच्या घरात\nअंधकार दूर होवो, प्रकाशाचा उदय होवो\nयेशू ख्रिस्ताचा जयजयकार, घरोघरी होवो',
'Prabhu Tuza vijay aso, saarya ya jagat\nMukticha deep prajwaltit hovo, pratyekachya gharat\nAndharat dur hovo, prakashacha uday hovo\nYeshu Khristacha jayjaykar, gharoghari hovo',
'[C]Prabhu Tuza [F]vijay a[G]so, saarya ya [C]ja[G]gat\n[C]Mukticha deep [F]prajwal[G]tit hovo, prat[F]yekachya [C]gha[G]rat\n[Am]Andharat [F]dur ho[G]vo, pra[F]kashacha u[G]day [C]hovo\n[Am]Yeshu Khrista[F]cha jay[G]jaykar, [F]gharo[G]ghari [C]hovo',
'C', 0, 88, '4/4', 'Chorus, Verse1', 1, TRUE),

(294, 'येशू राजा तू श्रेष्ठ', 'Contemporary', 'Contemporary', 'marathi',
'येशू राजा तू श्रेष्ठ, साऱ्या या विश्वात\nतुझ्याच नावाने ही सृष्टी, उजळली आहे रंगात\nपापांतून तू आम्हाला, मुक्ती दिली आहेस\nनवे जीवन देऊन तू, आम्हाला सावरले आहेस',
'Yeshu Raja Tu shreshth, saarya ya vishwat\nTujhyach navane hi srishti, ujalttli aahe rangat\nPaapantun Tu aamhalla, mukti dili aahes\nNave jeevan deun Tu, aamhalla savarle aahes',
'[D]Yeshu Raja [G]Tu shreshth, saarya [A]ya vi[D]shwat\n[D]Tujhyach nava[G]ne hi [D]srishti, [A]ujalttli aahe [D]ran[D]gat\n[Bm]Paapantun [G]Tu aam[D]halla, [A]mukti dili [D]aahes\n[Bm]Nave jee[G]van de[D]un Tu, aam[A]halla savar[G]le aa[D]hes',
'D', 0, 84, '4/4', 'Chorus, Verse1', 1, TRUE),

(295, 'स्तुती स्तुती येशूला', 'Contemporary', 'Contemporary', 'marathi',
'स्तुती स्तुती येशूला, साऱ्या सृष्टीच्या राजाला\nज्याने आम्हा मुक्ती दिली, अर्पण त्या देवाला\nतो महान आहे तो दयाळू आहे\nतुझ्याच प्रीतीने हे, जीवन सुखकर आहे',
'Stuti stuti Yeshula, saarya srishtichya Rajala\nJyane aamha mukti dili, arpann tya devala\nTo mahan aahe to dayalu aahe\nTujhyach preetine he, jeevan sukhkar aahe',
'[G]Stuti stuti [C]Yeshula, saarya [D]srishtichya [G]Ra[D]jala\n[G]Jyane aamha [C]mukti [D]dili, ar[C]pann tya De[G]va[D]la\n[Em]To ma[C]han aahe [D]to da[G]ya[D]lu aahe\n[Em]Tujhyach pree[C]tine [D]he, [C]jeevan sukh[D]kar [G]aahe',
'G', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(296, 'प्रभू माझा आधार', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू माझा आधार, तो माझ्या हृदयात\nसाऱ्या साऱ्या संकटात, तो आहे माझ्या सोबतात\nतो मला धीर देतो, तो मला सावरतो\nमहिमेचा तू राजा प्रभू, तारणहाराचा तू उदार',
'Prabhu majha aadhar, to majhya hrudayat\nSaarya saarya sankatat, to aahe majhya sobtat\nTo mala dhar deto, to mala savarto\nMahimecha Tu raja Prabhu, tarannhaaracha Tu udar',
'[C]Prabhu majha [F]aadhar, [G]to majhya [C]hruda[G]yat\n[C]Saarya saarya [F]sankatat, [G]to aahe [F]majhya so[G]btat\n[Am]To mala dhar [F]deto, [G]to mala sa[C]varto\n[Am]Mahimecha [F]Tu raja [G]Prabhu, [F]tarannhaara[G]cha Tu [C]udar',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(297, 'नमस्कार येशू राजाला', 'Contemporary', 'Contemporary', 'marathi',
'नमस्कार येशू राजाला, नमस्कार तारणहाराला\nज्याने आम्हा मुक्ती दिली, साऱ्या या विश्वाला\nतुझ्या चरणी आम्ही येतो, आमचे जीवन वाहतो\nतुझ्या पवित्र नावाचा जयजयकार आम्ही करतो',
'Namaskar Yeshu Rajala, namaskar tarannhaarala\nJyane aamha mukti dili, saarya ya vishwala\nTujhya charni aamhi yeto, aamche jeevan vahto\nTujhya pavitra navacha jayjaykar aamhi karto',
'[D]Namas[G]kar Yeshu Ra[D]jala, namas[A]kar tarann[D]haarala\n[D]Jyane aamha [G]mukti [D]dili, [A]saarya ya [D]vi[D]shwala\n[Bm]Tujhya char[G]ni aamhi [D]yeto, aamche [A]jeevan [D]vahto\n[Bm]Tujhya pa[G]vitra na[D]vacha [A]jayjaykar [G]aamhi [D]karto',
'D', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(298, 'येशू तुझे नाव', 'Contemporary', 'Contemporary', 'marathi',
'येशू तुझे नाव, किती गोड आणि पावन\nतुझ्याच नावाने ही सृष्टी, होते उजळून\nतुझ्या नामात आहे शक्ती, तुझ्या नामात आहे शांती\nप्रत्येक संकटात प्रभू, तूच देतोस आम्हा क्रांती',
'Yeshu Tuze naav, kiti goad aani pavan\nTujhyach navane hi srishti, hote ujalttun\nTujhya namat aahe shakti, tujhya namat aahe shanti\nPratyek sankatat Prabhu, Tuch detos aamha kranti',
'[G]Yeshu Tuze [C]naav, kiti [G]goad aani [D]pa[G]van\n[G]Tujhyach nava[C]ne hi [D]srishti, [C]hote uja[D]ltt[G]un\n[Em]Tujhya namat [C]aahe [G]shakti, [Em]tujhya namat [Am]aahe [D]shanti\n[G]Pratyek san[C]katat Pra[D]bhu, [C]Tuch detos [D]aamha [G]kranti',
'G', 0, 84, '4/4', 'Chorus, Verse1', 1, TRUE),

(299, 'प्रभू तुझी आराधना गाऊ', 'Contemporary', 'Contemporary', 'marathi',
'प्रभू तुझी आराधना गाऊ, आनंदात आम्ही राहू\nतुझ्या पवित्र नावाचा जयजयकार, गात आम्ही हे चालू\nतू महान आहेस देवा, तूच आमचा तारणहार\nतुझ्याच चरणी आम्ही, अर्पू हा जोहार',
'Prabhu Tuzi aaradhana gau, anandat aamhi rahu\nTujhya pavitra navacha jayjaykar, gaat aamhi he chalu\nTu mahan aahes Deva, Tuch aamcha tarannhaar\nTujhyach charni aamhi, arpu ha johaar',
'[C]Prabhu Tuzi [F]aaradha[G]na gau, a[C]nandat [G]aamhi [C]rahu\n[C]Tujhya pa[F]vitra na[G]vacha jay[F]jaykar, gaat aamhi [G]he [C]chalu\n[Am]Tu mahan [F]aahes [G]Deva, [Am]Tuch aam[F]cha ta[G]rannhaar\n[C]Tujhyach [F]charni aa[G]mhi, [F]arpu ha jo[G]haar',
'C', 0, 110, '4/4', 'Chorus, Verse1', 1, TRUE),

(300, 'जय जयकार येशूचा', 'Contemporary', 'Contemporary', 'marathi',
'जय जयकार येशूचा, साऱ्या विश्वात होवो\nमुक्तीचा प्रकाश, प्रत्येकाच्या हृदयात पोहोचावा\nतो महान आहे तो दयाळू आहे\nतुझ्याच प्रीतीने हे, जीवन सुखकर आहे',
'Jay jaykar Yeshucha, saarya vishwat hovo\nMukticha prakash, pratyekachya hrudayat pohochava\nTo mahan aahe to dayalu aahe\nTujhyach preetine he, jeevan sukhkar aahe',
'[C]Jay jay[F]kar Ye[G]shucha, saarya [F]vishwat [C]hovo\n[C]Mukticha [F]pra[G]kash, prat[F]yekachya [C]hruda[G]yat pohochava\n[Am]To mahan [G]aahe [F]to da[G]ya[C]lu aahe\n[Am]Tujhya pree[F]tine [G]he, [F]jeevan sukh[G]kar [C]aahe',
'C', 0, 120, '4/4', 'Chorus, Verse1', 1, TRUE);

-- =============================================
-- HASHTAG MAPPING FOR MARATHI SONGS (201-300)
-- =============================================

-- All 201-300 are #marathi (ID 3)
INSERT INTO song_hashtags (song_id, hashtag_id) 
SELECT id, 3 FROM songs WHERE song_number BETWEEN 201 AND 300;

-- Mapping to #classic (ID 1)
INSERT INTO song_hashtags (song_id, hashtag_id)
SELECT id, 1 FROM songs WHERE song_number BETWEEN 201 AND 300 AND (artist LIKE '%Traditional%' OR artist LIKE '%Ramabai%' OR artist LIKE '%Sangale%' OR artist LIKE '%Hivale%' OR artist LIKE '%Khisty%' OR artist LIKE '%Koshe%' OR artist LIKE '%Kelkar%' OR artist LIKE '%Salvi%' OR artist LIKE '%Bissell%');

-- Mapping to #contemporary (ID 2)
INSERT INTO song_hashtags (song_id, hashtag_id)
SELECT id, 2 FROM songs WHERE song_number BETWEEN 201 AND 300 AND artist LIKE '%Contemporary%';

-- Mapping to #devotional (ID 4)
INSERT INTO song_hashtags (song_id, hashtag_id)
SELECT id, 4 FROM songs WHERE song_number BETWEEN 201 AND 300;

