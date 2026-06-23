USE worship_db;

-- =============================================
-- RECOVERY BATCH (171-200)
-- =============================================

INSERT INTO songs (song_number, title, artist, composer, language, lyrics_original, lyrics_roman, chords, original_key, capo, bpm, time_signature, structure, created_by, is_active) VALUES
(171, 'यहोवा ही मेरा चरवाहा', 'Traditional', 'Bhakti / Psalm 23', 'hindi',
'यहोवा ही मेरा चरवाहा मुझे कोई घटी नहीं\nहरी चरागाहों में वह मुझे बिठाता है\nमेरी आत्मा को वह ताज़ा करता है\nधर्म के मार्गों पर वह मुझे ले चलता है\n\nप्रभु तू ही मेरा बल है\nप्रभु तू ही मेरी शक्ति है\nजब तक है मेरी साँस प्रभु\nतेरी ही आराधना मैं करूँ',
'Yahova hi mera charwaha mujhe koi ghati nahi\nHari charagahon mein woh mujhe bithata hai\nMeri aatma ko woh taza karta hai\nDharm ke maargon par woh mujhe le chalta hai\n\nPrabhu Tu hi mera bal hai\nPrabhu Tu hi meri shakti hai\nJab tak hai मेरी साँस Prabhu\nTeri hi aradhana main karoon',
'[G]Yahova hi mera char[D]waha [C]mujhe koi ghati [G]nahi\n[G]Hari chara[C]gahon में [G]woh mujhe bi[D]thata [G]hai\n[Em]Meri aatma ko [C]woh taza [G]karta [D]hai\n[Em]Dharm ke maar[C]gon par [D]woh mujhe le [G]chalta hai\n\n[G]Prabhu Tu hi [C]mera bal [G]hai\n[Em]Prabhu Tu hi [D]meri shak[G]ti hai\n[F]Jab tak hai meri [G]saans [C]Prabhu\n[F]Teri hi a[G]radhana [C]main karoon',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(172, 'प्रभु का धन्यवाद (Prabhu Ka Dhanyawad)', 'Traditional', 'Bhakti Style', 'hindi',
'प्रभु का धन्यवाद हो हर एक पल सदा\nउसकी दया हम पर बनी रहती है सदा\nपापों से बचाने हमें स्वर्ग छोड़ आया\nनया जीवन उसने हमें दिया है सदा\n\nधन्यवाद धन्यवाद धन्यवाद प्रभु\nतेरी ही दया से हम जीवित हैं प्रभु\nधन्यवाद धन्यवाद धन्यवाद प्रभु\nतेरा ही नाम हम लेते हैं सदा',
'Prabhu ka dhanyawad ho har ek pal sada\nUski daya ham par bani rehti hai sada\nPaapon se bachane hamein swarg chodh aaya\nNaya jeevan usne hamein diya hai sada\n\nDhanyawad dhanyawad dhanyawad Prabhu\nTeri hi daya se ham jeevit hain Prabhu\nDhanyawad dhanyawad dhanyawad Prabhu\nTera hi naam ham lete hain सदा',
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
'[G]Shanti ka Daata [C]Yeshu Ma[G]sih\n[G]Mukti ka Daata [C]Yeshu Ma[D]sih\n[G]Woh sabko [C]changa [G]karta [D]hai\n[Em]Woh sabko [C]naya jee[D]van deta [G]hai\n\n[G]Prabhu ka [C]naam pa[D]vitra [G]hai\n[G]Prabhu ka [C]naam ma[D]han [G]hai\n[Em]Jo भी पुकारेगा [D]payega ud[G]dhar\n[Em]Prabhu ka [C]naam hi [D]marg [G]hai',
'G', 0, 70, '4/4', 'Verse1, Chorus', 1, TRUE),

(176, 'तेरी स्तुति (Teri Stuti)', 'Traditional', 'Bhakti prayer', 'hindi',
'तेरी स्तुति मैं करूँ हर इक पल प्रभु\nतेरी महिमा मैं करूँ हर इक पल प्रभु\nतू ही मेरा बल है तू ही शक्ति है\nतेरी सामर्थ्य से मेरा जीवन बदल दे\n\nस्तुति हो स्तुति हो प्रभु की\nमहिमा हो महिमा हो प्रभु की\nभरो हमें पवित्र आत्मा से\nनया कर दो अपने सामर्थ्य से',
'Teri stuti main karoon har ik pal Prabhu\nTeri mahima main karoon har ik pal Prabhu\nTu hi mera bal hai Tu hi shakti hai\nTeri samarth se mera jeevan badal de\n\nStuti ho stuti ho prabhu ki\nMahima ho mahima ho prabhu ki\nBharo hamein Pavitra Aatma se\nNaya kar do apne samarth se',
'[D]Teri stuti main ka[G]roon har [D]ik pal Pra[A]bu\n[D]Teri mahima main ka[G]roon har [D]ik pal Pra[A]bu\n[Bm]Tu hi mera [G]bal hai [D]Tu hi shak[A]ti hai\n[Bm]Teri sam[G]arth se [A]mera jeevan ba[D]dal de\n\n[D]Stuti ho [G]stuti [A]ho prabhu [D]ki\n[D]Mahima ho [G]mahi[A]ma ho prabhu [D]ki\n[Bm]Bharo hamein Pa[G]vitra [A]Aatma [D]se\n[Bm]Naya kar [A]do apne [G]samarth [D]से',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(177, 'मसीहा तू है (Bhakti)', 'Traditional', 'Traditional / Masih Bhajan', 'hindi',
'मसीहा तू है मेरा खुदा तेरी जय सदा\nतूने दी है अपनी जान मेरे लिए सदा\nपापों से तूने है मुक्ति दिलाई\nस्वर्ग का रास्ता हमें दिखाया\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nआराधना आराधना तेरी\nसारे जहाँ का राजा तू ही है',
'Masiha Tu hai mera Khuda teri Jai sada\nToone di hai apni jaan mere liye sada\nPaapon se Toone hai mukti dilayi\nSwarg का rasta hamein dikhaya\n\nMahima ho mahima ho teri\nYeshu Masih Tu hi hai Prabhu\nAradhana aradhana teri\nSaare jahan का raja Tu hi hai',
'[Em]Masiha Tu hai mera [Am]Khuda teri [Em]Jai sa[B]da\n[Em]Toone di hai apni [Am]jaan mere [Em]liye sa[B]da\n[Em]Paapon se Too[Am]ne hai [D]mukti di[G]layi\n[Em]Swarg का ras[Am]ta ha[B]mein di[Em]khaya\n\n[Em]Mahima ho ma[Am]hima ho [Em]teri\n[Am]Yeshu Masih [D]Tu hi [G]hai Pra[B]bu\n[Em]Aradhana a[Am]radhana [Em]teri\n[Am]Saare jahan ka [B]raja Tu [Em]hi hai',
'Em', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(178, 'पावों में मैं झुका रहूँ', 'Traditional', 'Bhakti / Devotional', 'hindi',
'पावों में मैं झुका रहूँ तेरे चरणों में\nतुझ में ही मैं छिपा रहूँ तेरे चरणों में\nतू ही मेरा प्यार तू ही मेरा गीत\nतुझ में ही मेरी ज़िंदगी है प्रभु\n\nमहिमा हो महिमा हो तेरी\nयीशु राजा तू ही है प्रभु\nस्तुति हो स्तुति हो तेरी\nयीशु राजा तू ही है प्रभु',
'Paawon mein main jhuka rahoon tere charnon mein\nTujh mein hi main chipa rahoon tere charnon mein\nTu hi mera pyaar Tu hi mera geet\nTujh mein hi meri zindagi hai Prabhu\n\nMahima ho mahima हो तेरी\nYeshu Raja Tu hi hai Prabhu\nStuti ho stuti ho teri\nYeshu Raja Tu hi hai Prabhu',
'[G]Paawon mein main jhu[C]ka rahoon [D]tere charnon [G]mein\n[G]Tujh mein hi main chi[C]pa rahoon [D]tere charnon [G]mein\n[Em]Tu hi mera [C]pyaar Tu [G]hi mera [D]geet\n[Em]Tujh में ही मेरी ज़िंदगी है Pra[G]bu\n\n[G]Mahima ho ma[C]hima हो [D]teri\n[G]Yeshu Raja [C]Tu hi [D]hai Pra[G]bu\n[Em]Stuti ho stu[C]ti ho [D]teri\n[Em]Yeshu Raja [D]Tu hi [C]hai Pra[G]bu',
'G', 0, 64, '4/4', 'Verse1, Chorus', 1, TRUE),

(179, 'दिल से आराधना (Bhakti)', 'Traditional', 'Devotional prayer', 'hindi',
'दिल से आराधना करूँ मैं तेरी प्रभु\nआत्मा से स्तुति करूँ मैं तेरी प्रभु\nतू ही मेरा बल तू ही मेरी शक्ति\nतेरी ही महिमा मैं गाऊँ सदा\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nआराधना आराधना तेरी\nसारे जहाँ का राजा तू ही है',
'Dil se aradhana karoon main teri Prabhu\nAatma se stuti karoon main teri Prabhu\nTu hi mera bal Tu hi meri shakti\nTeri hi mahima main gaoon sada\n\nMahima हो mahima हो teri\nYeshu Masih Tu hi hai Prabhu\nAradhana aradhana teri\nSaare jahan ka raja Tu hi hai',
'[C]Dil se ara[G]dhana ka[C]roon main teri [G]Prabhu\n[C]Aatma से [F]stuti ka[G]roon main teri [C]Prabhu\n[Am]Tu hi mera [F]bal Tu [G]hi meri [C]shakti\n[Am]Teri hi ma[F]hima main [G]gaoon [C]sada\n\n[C]Mahima ho ma[G]hima ho [C]teri\n[F]Yeshu Masih [G]Tu hi [F]hai Pra[C]bu\n[C]Aradhana a[G]radhana [C]teri\n[F]Saare jahan ka [G]raja Tu [F]hi [C]hai',
'C', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(180, 'यीशु मसीह महान', 'Traditional', 'Bhakti Final', 'hindi',
'यीशु मसीह महान तू ही है प्रभु\nतेरी ही महिमा हो सारे संसार में\nपापों से तूने है मुक्ति दिलाई\nस्वर्ग का रास्ता हमें दिखाया\n\nजय जय जय यीशु तेरी जय\nमहिमा महिमा यीशु की महिमा\nजय जय जय यीशु तेरी जय\nमहिमा महिमा यीशु की महिमा',
'Yeshu Masih mahan Tu hi hai Prabhu\nTeri hi mahima ho saare sansar mein\nPaapon se Toone hai mukti dilayi\nSwarg का rasta hamein dikhaya\n\nJai Jai Jai Yeshu teri Jai\nMahima mahima Yeshu ki mahima\nJai Jai Jai Yeshu teri Jai\nMahima mahima Yeshu ki mahima',
'[G]Yeshu Masih ma[C]han Tu [G]hi hai Pra[D]bu\n[G]Teri hi ma[C]hima ho [G]saare san[D]sar [G]mein\n[Em]Paapon se Too[C]ne hai [G]mukti di[D]layi\n[Em]Swarg का ras[C]ta ha[D]mein di[G]khaya\n\n[G]Jai Jai [C]Jai Yeshu [G]teri [D]Jai\n[G]Mahima ma[C]hima [G]Yeshu ki mahi[D]ma\n[Em]Jai [D]Jai [C]Jai Yeshu [G]teri [D]Jai\n[Em]Mahima ma[G]hima [C]Yeshu ki mahi[G]ma',
'G', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(181, 'ख़ुशी ख़ुशी नया गीत गाओ', 'Traditional', 'Traditional Christmas Carol', 'hindi',
'ख़ुशी ख़ुशी नया गीत गाओ मसीह पैदा हुआ\nआज रात बेथलेहेम में मुक्ति दाता आया है\nपापों से बचाने हमें स्वर्ग छोड़ आया है\nउसका हम स्वागत करें दिल से गाकर गीत नया\n\nगाओ ख़ुशी के साथ महिमा हो\nराजाओं का राजा आया है\nगाओ ख़ुशी के साथ महिमा हो\nयीशु मसीह ही प्रभु है',
'Khushi khushi naya geet gao Masih paida hua\nAaj raat Bethlehem mein mukti data aaya hai\nPaapon se bachane hamein swarg chodh aaya hai\nUska ham swagat karein dil se gaakar geet naya\n\nGao khushi ke saath mahima ho\nRajayon ka raja aaya hai\nGao khushi ke saath mahima ho\nYeshu Masih hi Prabhu hai',
'[D]Khushi khushi naya [G]geet gao Ma[D]sih paida [A]hua\n[D]Aaj raat Bethle[G]hem mein [D]mukti data [A]aaya [D]hai\n[D]Paapon से ba[G]chane hamein [D]swarg chodh [A]aaya hai\n[D]Uska ham swa[G]gat karein [D]dil se gaa[A]kar geet [D]naya\n\n[D]Gao khushi ke saath [G]mahi[D]ma ho\n[G]Rajayon का [D]raja [A]aaya hai\n[D]Gao khushi ke saath [G]mahi[D]ma ho\n[G]Yeshu Ma[A]sih hi Pra[D]bu hai',
'D', 0, 120, '4/4', 'Verse1, Chorus', 1, TRUE),

(182, 'देखो आसमान में तारा', 'Traditional', 'Christmas Carol', 'hindi',
'देखो आसमान में तारा चमक रहा है सदा\nबेथलेहेम की ओर हमें बुला रहा है सदा\nवहाँ जन्मा है उद्धारकर्ता यीशु मसीह प्रभु\nसारे जहाँ का राजा शांति का दाता प्रभु\n\nआओ मिलकर सिजदा करें\nराजाओं के राजा को\nआओ मिलकर महिमा करें\nयीशु मसीह प्रभु को',
'Dekho aasman mein tara chamak raha hai sada\nBethlehem ki ore hamein bula raha hai sada\nWahan janma hai uddharkarta Yeshu Masih Prabhu\nSaare jahan ka raja shanti का data Prabhu\n\nAao milkar sijda karein\nRajayon ke raja ko\nAao milkar mahima karein\nYeshu Masih Prabhu ko',
'[G]Dekho aasman mein [C]tara cha[G]mak raha hai [D]sada\n[G]Bethlehem ki [C]ore hamein [G]bula raha hai [D]sada\n[Em]Wahan janma hai ud[C]dharkarta [G]Yeshu Ma[G]sih Pra[D]bu\n[Em]Saare ja[C]han ka raja shan[D]ti ka data [G]Prabhu\n\n[G]Aao milkar [C]sijda ka[D]rein\n[G]Rajayon ke [C]raja [D]ko\n[Em]Aao milkar [C]mahima ka[D]rein\n[Em]Yeshu Ma[D]sih Pra[G]bu ko',
'G', 0, 80, '4/4', 'Verse1, Chorus', 1, TRUE),

(183, 'शांत रात (Silent Night)', 'Joseph Mohr', 'Joseph Mohr / Hindi Adaptation', 'hindi',
'शांत रात पवित्र रात\nसब सोये सिर्फ माँ-बाप\nप्यारा सा बच्चा बेथलेहेम में\nस्वर्ग की शांति लाता है यहाँ\n\nयीशु राजा यीशु राजा\nतेरी जय हो तेरी जय हो\nतू ही है मेरा प्यारा खुदा\nतेरी महिमा हो सदा',
'Shant raat pavitra raat\nSab soye sirf maa-baap\nPyara sa baccha Bethlehem mein\nSwarg ki shanti laata hai yahan\n\nYeshu Raja Yeshu Raja\nTeri jai ho teri jai ho\nTu hi है मेरा प्यारा Khuda\nTeri mahima ho sada',
'[C]Shant raat pa[G]vitra [C]raat\n[F]Sab soye [G]sirf maa-[C]baap\n[F]Pyara sa baccha [G]Bethle[C]hem में\n[G]Swarg ki shanti [F]laata hai [G]ya[C]han\n\n[C]Yeshu Raja [G]Yeshu [C]Raja\n[F]Teri [G]jai ho [C]teri [G]jai ho\n[F]Tu hi [G]hai mera [C]pyara [G]Khuda\n[F]Teri ma[G]hima [C]ho sa[G]da',
'C', 0, 64, '3/4', 'Verse1, Chorus', 1, TRUE),

(184, 'सारी सृष्टि जॉय जॉय गाओ (Joy to the World)', 'Isaac Watts', 'Isaac Watts / Hindi Adaptation', 'hindi',
'सारी सृष्टि जॉय जॉय गाओ राजा आया है\nजगत का उद्धार करने यीशु आया है\nआँखें अपनी खोलें और देखें खुदा को\nशांति का राजकुमार यहाँ आया है\n\nजॉय जॉय जॉय प्रभु की जय\nमहिमा महिमा यीशु की महिमा\nजॉय जॉय जॉय प्रभु की जय\nमहिमा महिमा यीशु की महिमा',
'Sari srishti Joy Joy gao Raja aaya hai\nJagat का uddhar karne Yeshu aaya hai\nAankhein apni kholein aur dekhein Khuda ko\nShanti का Rajkumar yahan aaya hai\n\nJoy Joy Joy Prabhu ki Jai\nMahima mahima Yeshu ki mahima\nJoy Joy Joy Prabhu ki Jai\nMahima mahima Yeshu ki mahima',
'[D]Sari srishti [G]Joy Joy [D]gao [A]Raja aaya [D]hai\n[D]Jagat का ud[G]dhar karne [D]Yeshu [A]aaya [D]hai\n[Bm]Aankhein apni [G]kholein aur [D]dekhein Khu[A]da ko\n[Bm]Shanti का Raj[G]kumar ya[A]han aaya [D]hai\n\n[D]Joy Joy Joy [G]Prabhu ki [D]Jai\n[G]Mahima ma[D]hima [A]Yeshu ki mahi[D]ma\n[Bm]Joy Joy [G]Joy Prabhu [D]ki Jai\n[A]Mahima ma[D]hima [G]Yeshu ki mahi[D]ma',
'D', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(185, 'आया है मसीहा (Aaya Hai Masiha)', 'Traditional', 'Christmas Carol', 'hindi',
'आया है मसीहा देखो कितना महान दिन है\nमुक्ति दाता जन्मा है जगत का उद्धार करने\nपापों से बचाने हमें स्वर्ग छोड़ आया है\nउसका हम स्वागत करें दिल से गाकर गीत नया\n\nमहिमा हो महिमा हो तेरी\nयीशु राजा तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Aaya hai Masiha dekho kitna mahan din hai\nMukti data janma hai jagat ka uddhar karne\nPaapon se bachane hamein swarg chodh aaya hai\nUska ham swagat karein dil से gaakar geet naya\n\nMahima हो mahima ho teri\nYeshu Raja Tu hi hai Prabhu\nMahima हो mahima हो teri\nSaare jahan ka raja Tu hi hai',
'[G]Aaya hai Ma[C]siha dekho [G]kitna mahan [D]din hai\n[G]Mukti data [C]janma hai [G]jagat का uddhar [D]karne\n[Em]Paapon से ba[C]chane hamein [G]swarg chodh [D]aaya hai\n[Em]Uska ham swa[C]gat karein [G]dil से gaa[D]kar geet [G]naya\n\n[G]Mahima ho ma[C]hima हो [D]teri\n[G]Yeshu Raja [C]Tu hi [D]hai Pra[G]bu\n[Em]Mahima ho ma[C]hima ho [D]teri\n[Em]Saare ja[D]han का [C]raja Tu [G]hi hai',
'G', 0, 120, '4/4', 'Verse1, Chorus', 1, TRUE),

(186, 'चरवाहों को चरागाह में', 'Traditional', 'Christmas Carol', 'hindi',
'चरवाहों को चरागाह में स्वर्गदूत दिखा\nशुभ समाचार सुनाने स्वर्ग से उतरा\nआज जन्मा है मसीह बेथलेहेम नगर में\nआओ चलकर देखें हम राजा के चरणों में\n\nमहिमा हो महिमा हो तेरी\nयीशु राजा तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Charwahon ko charagah mein swargdoot dikha\nShubh samachar sunane swarg se utra\nAaj janma hai Masih Bethlehem nagar mein\nAao chalkar dekhein ham Raja ke charnon में\n\nMahima हो mahima ho teri\nYeshu Raja Tu hi hai Prabhu\nMahima ho mahima हो teri\nSaare jahan का raja Tu hi hai',
'[D]Charwahon ko cha[G]ragah में [D]swargdoot di[A]kha\n[D]Shubh sama[G]char sunane [D]swarg se u[A]tra\n[Bm]Aaj janma hai [G]Masih Bethle[D]hem nagar [A]mein\n[Bm]Aao chal[G]kar dekhein ham [A]Raja ke charnon [D]mein\n\n[D]Mahima ho ma[G]hima ho [D]teri\n[D]Yeshu Raja [G]Tu hi [A]hai Pra[D]bu\n[Bm]Mahima ho ma[G]hima ho [A]teri\n[Bm]Saare ja[D]han ka raja Tu [D]hi hai',
'D', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(187, 'बेथलेहेम में जन्मा है', 'Traditional', 'Christmas Carol', 'hindi',
'बेथलेहेम में जन्मा है हमारा राजा\nशांति का राजकुमार यीशु मसीह प्रभु\nस्वर्ग की महिमा छोड़ यहाँ आया है\nमुक्ति का मार्ग हमें दिखाने आया है\n\nमहिमा महिमा यीशु की महिमा\nस्तुति स्तुति यीशु की स्तुति\nपवित्र नाम है राजा का नाम\nजय जयकार हो सदा के लिए',
'Bethlehem mein janma hai hamara Raja\nShanti ka Rajkumar Yeshu Masih Prabhu\nSwarg ki mahima chodh yahan aaya hai\nMukti ka marg hamein dikhane aaya hai\n\nMahima mahima Yeshu ki mahima\nStuti stuti Yeshu ki stuti\nPavitra naam है Raja ka naam\nJai jaikar ho sada ke liye',
'[G]Bethlehem mein [C]janma hai ha[G]mara Ra[D]ja\n[G]Shanti ka Raj[C]kumar [G]Yeshu Ma[D]sih Pra[G]bu\n[Em]Swarg ki mahi[C]ma chodh ya[G]han aaya [D]hai\n[Em]Mukti का [C]marg hamein di[D]khane aaya [G]hai\n\n[G]Mahima ma[C]hima Ye[G]shu ki mahi[D]ma\n[G]Stuti stu[C]ti Ye[G]shu ki stu[D]ti\n[Em]Pavitra [C]naam hai [G]Raja ka [D]naam\n[Em]Jai jai[D]kar ho [C]sada के [G]liye',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(188, 'एक सितारा चमका (Ek Sitara Chamka)', 'Traditional', 'Christmas Carol', 'hindi',
'एक सितारा चमका आसमाँ की ओर\nशुभ संदेशा लाया बेथलेहेम की ओर\nराजाओं का राजा जन्मा है आज\nमुक्ति का दाता आया है आज\n\nजॉय जॉय जॉय प्रभु की जय\nमहिमा महिमा यीशु की महिमा\nजॉय जॉय जॉय प्रभु की जय\nमहिमा महिमा यीशु की महिमा',
'Ek sitara chamka aasman ki ore\nShubh sandesha laya Bethlehem ki ore\nRajayon ka raja janma hai aaj\nMukti का data aaya hai aaj\n\nJoy Joy Joy Prabhu ki Jai\nMahima mahima Yeshu ki mahima\nJoy Joy Joy Prabhu ki Jai\nMahima mahima Yeshu ki mahima',
'[D]Ek sitara [G]chamka [D]aasman ki [A]ore\n[D]Shubh san[G]desha laya [D]Bethlehem ki [A]ore [D]\n[Bm]Rajayon ka [G]raja [D]janma hai [A]aaj\n[Bm]Mukti का [G]data [A]aaya hai [D]aaj\n\n[D]Joy Joy Joy [G]Prabhu ki [D]Jai\n[G]Mahima ma[D]hima [A]Yeshu ki mahi[D]ma\n[Bm]Joy Joy [G]Joy Prabhu [D]ki Jai\n[A]Mahima ma[D]hima [G]Yeshu ki mahi[D]ma',
'D', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(189, 'मरियम का बेटा (Mary Boy Child)', 'Traditional', 'Christmas Adaptation', 'hindi',
'मरियम का बेटा यीशु मसीह\nआज जन्मा है बेथलेहेम में\nस्वर्गदूत गाएं महिमा उसकी\nजगत का उद्धार करने आया है\n\nगाओ ख़ुशी के साथ महिमा हो\nयीशु राजा की महिमा हो\nगाओ ख़ुशी के साथ महिमा हो\nयीशु मसीह ही प्रभु है',
'Maryam ka beta Yeshu Masih\nAaj janma hai Bethlehem mein\nSwargdoot gaayein mahima uski\nJagat का uddhar karne aaya hai\n\nGao khushi ke saath mahima ho\nYeshu Raja ki mahima हो\nGao khushi ke saath mahima हो\nYeshu Masih hi Prabhu hai',
'[G]Maryam ka [C]beta [D]Yeshu Ma[G]sih\n[G]Aaj janma [C]hai Bethle[D]hem [G]mein\n[Em]Swargdoot [C]gaayein ma[G]hima us[D]ki\n[Em]Jagat का ud[C]dhar karne [D]aaya [G]hai\n\n[G]Gao khushi ke saath [C]mahi[G]ma ho\n[C]Yeshu Raja ki [D]mahi[G]ma ho\n[Em]Gao khushi ke saath [C]mahi[G]ma ho\n[C]Yeshu Ma[D]sih hi Pra[G]bu hai',
'G', 0, 84, '4/4', 'Verse1, Chorus', 1, TRUE),

(190, 'गाओ गाओ खुशी से', 'Traditional', 'Christmas Final', 'hindi',
'गाओ गाओ खुशी से मसीह पैदा हुआ\nझूमो नाचो खुशी से राजा पैदा हुआ\nआज रात बेथलेहेम में तारा चमका है\nशांति का राजकुमार यहाँ आया है\n\nमहिमा हो महिमा हो तेरी\nयीशु राजा तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Gao gao khushi se Masih paida hua\nJhumo nacho khushi se Raja paida hua\nAaj raat Bethlehem में tara chamka hai\nShanti ka Rajkumar yahan aaya hai\n\nMahima ho mahima ho teri\nYeshu Raja Tu hi hai Prabhu\nMahima ho mahima ho teri\nSaare jahan का raja Tu hi hai',
'[C]Gao gao khushi se [F]Masih paida [G]hua\n[C]Jhumo nacho khushi se [F]Raja paida [G]hua\n[Am]Aaj raat Bethle[F]hem में [G]tara chamka [C]hai\n[Am]Shanti ka Raj[F]kumar ya[G]han aaya [C]hai\n\n[C]Mahima ho ma[G]hima ho [C]teri\n[F]Yeshu Raja [G]Tu hi [F]hai Pra[C]bu\n[Am]Mahima ho ma[F]hima ho [G]teri\n[Am]Saare ja[G]han का [F]raja Tu [C]hi hai',
'C', 0, 120, '4/4', 'Verse1, Chorus', 1, TRUE),

(191, 'जो क्रूस पे कुर्बान है', 'Traditional', 'Easter Hymn / traditional', 'hindi',
'जो क्रूस पे कुर्बान है वह मेरा मसीहा है\nजो कब्र में से जी उठा वह मेरा मसीहा है\nउसकी दया बनी रहती है मुझ पर सदा\nउसका धन्यवाद करूँ मैं हृदय से सदा\n\nयीशु मसीह ज़िंदा है सदा\nमौत पर उसने विजय पायी है\nयीशु मसीह ज़िंदा है सदा\nहम सबको नया जीवन दिया है',
'Jo krus pe kurban hai woh mera Masiha hai\nJo kabra mein se jee utha woh mera Masiha hai\nUski daya bani rehti hai mujh par sada\nUska dhanyawad karoon main hriday se sada\n\nYeshu Masih zinda hai sada\nMaut par usne vijay paayi hai\nYeshu Masih zinda hai sada\nHam sabko naya jeevan diya hai',
'[Em]Jo krus pe kur[Am]ban hai [D]woh mera Ma[G]siha hai\n[Em]Jo kabra mein se [Am]jee utha [D]woh mera Ma[G]siha [B]hai\n[Em]Uski daya ba[Am]ni rehti [D]hai mujh [G]par [B]sada\n[Em]Uska dhanyawad [Am]करूँ [D]main hri[G]day से [B]sa[Em]da\n\n[Em]Yeshu Masih [Am]zinda hai [B]sada\n[Em]Maut par usne [Am]vijay [B]paayi hai\n[Em]Yeshu Masih [Am]zinda hai [B]sada\n[Em]Ham sabko naya [D]jeevan [G]diya [B]hai',
'Em', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(192, 'ज़िंदा है (Zinda Hai)', 'Traditional', 'Easter Gospel', 'hindi',
'ज़िंदा है ज़िंदा है मेरा यीशु ज़िंदा है\nमौत की ज़ंजीरों को उसने तोड़ दिया है\nकब्र अब खाली है मौत की हार हुई है\nमहिमा में वह फिर से जी उठा है\n\nमहिमा महिमा यीशु की महिमा\nस्तुति स्तुति यीशु की स्तुति\nज़िंदा खुदा की महिमा हो सदा\nजय जयकार हो सदा',
'Zinda hai Zinda hai mera Yeshu zinda hai\nMaut ki zanjeeron ko usne tod diya hai\nKabra ab khaali hai maut ki haar hui hai\nMahima में woh phir se jee utha hai\n\nMahima mahima Yeshu ki mahima\nStuti stuti Yeshu ki stuti\nZinda Khuda की mahima ho sada\nJai jaikar ho sada',
'[G]Zinda hai Zinda hai [C]mera Yeshu [G]zinda [D]hai\n[G]Maut ki zan[C]jeeron ko [G]usne tod [D]diya [G]hai\n[Em]Kabra ab khaali [C]hai maut की [G]haar hui [D]hai\n[Em]Mahima mein [C]woh phir se [D]jee utha [G]hai\n\n[G]Mahima ma[C]hima Ye[G]shu ki mahi[D]ma\n[G]Stuti stu[C]ti Ye[G]shu ki stu[D]ti\n[Em]Zinda Khuda [C]ki mahima [D]ho sa[G]da\n[Em]Jai jai[D]kar ho [C]sada [G]',
'G', 0, 110, '4/4', 'Verse1, Chorus', 1, TRUE),

(193, 'कब्र खाली है (Kabar Khali Hai)', 'Traditional', 'Easter Worship', 'hindi',
'कब्र खाली है मसीहा जी उठा है\nअंधकार पर ज्योति की जीत हुई है\nउसने सबको नया जीवन दिया है\nस्वर्ग का रास्ता हमें दिखाया है\n\nहल्लेलूया हल्लेलूया यीशु ज़िंदा है\nहल्लेलूया हल्लेलूया राजा ज़िंदा है\nमौत की हार हुई है जीवन की जीत हुई\nमहिमा हो महिमा हो सदा',
'Kabar khali hai Masiha jee utha hai\nAndhkar par jyoti की jeet hui hai\nUsne sabko naya jeevan diya hai\nSwarg का rasta hamein dikhaya hai\n\nHallelujah Hallelujah Yeshu zinda hai\nHallelujah Hallelujah Raja zinda hai\nMaut की haar hui hai jeevan ki jeet hui\nMahima ho mahima ho sada',
'[C]Kabar khali hai Ma[F]siha jee [G]utha [C]hai\n[Am]Andhkar par [F]jyoti की [G]jeet hui [C]hai\n[C]Usne sabko [F]naya jee[G]van diya [C]hai\n[Am]Swarg का ras[F]ta ha[G]mein dikhaya [C]hai\n\n[C]Hallelujah Halle[F]lujah Yeshu [G]zinda [C]hai\n[C]Hallelujah Halle[F]lujah Raja [G]zinda [C]hai\n[Am]Maut की haar [F]hui hai jee[G]van ki jeet [C]hui\n[F]Mahima ho ma[G]hima हो [C]sada',
'C', 0, 78, '4/4', 'Verse1, Chorus', 1, TRUE),

(194, 'उठ गया मसीह (Uth Gaya Mashih)', 'Traditional', 'Traditional Easter Hymn', 'hindi',
'उठ गया मसीह कब्र को छोड़ के\nमहिमा में वह जी उठा है सदा\nमौत का डर अब रहा नहीं\nक्योंकि यीशु मेरे साथ है सदा\n\nजय मसीह की जय मसीह की\nगाओ ख़ुशी के साथ जय जय कार\nजय मसीह की जय मसीह की\nमहिमा हो महिमा हो सदा',
'Uth gaya Mashih kabra ko chodh ke\nMahima mein woh jee utha है sada\nMaut का darr ab raha nahi\nKyunki Yeshu mere saath है sada\n\nJai Masih की Jai Masih ki\nGao khushi के saath jai jai kar\nJai Masih की Jai Masih ki\nMahima हो mahima हो sada',
'[D]Uth gaya Ma[G]shih kabra ko [D]chodh [A]के\n[D]Mahima mein woh [G]jee utha [D]hai sa[A]da\n[Bm]Maut का darr [G]ab raha [D]na[A]hi\n[Bm]Kyunki Yeshu [G]mere saath [A]hai sa[D]da\n\n[D]Jai Masih की [G]Jai Masih [A]ki\n[D]Gao khushi के [G]saath jai [A]jai [D]kar\n[Bm]Jai Masih की [G]Jai Masih [A]ki\n[Bm]Mahima हो ma[A]hima हो [D]sada',
'D', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(195, 'यीशु में विजय (Victory in Jesus)', 'Traditional', 'Easter Adaptation', 'hindi',
'यीशु में विजय मेरी सदा के लिए\nमुक्ति की धारा बहती है मेरे लिए\nपापों से तूने है मुक्ति दिलाई\nस्वर्ग का जलाल मुझे है दिखाया\n\nविजय विजय यीशु की विजय\nमहिमा महिमा यीशु की महिमा\nविजय विजय यीशु की विजय\nजय जयकार हो सदा',
'Yeshu mein vijay meri sada ke liye\nMukti की dhara behti है mere liye\nPaapon से Toone है mukti dilayi\nSwarg का jalal mujhe है dikhaya\n\nVijay vijay Yeshu की vijay\nMahima mahima Yeshu की mahima\nVijay vijay Yeshu की vijay\nJai jaikar ho sada',
'[C]Yeshu mein vi[F]jay meri [C]sada के [G]liye\n[C]Mukti की [F]dhara behti [C]hai mere [G]liye\n[F]Paapon से Too[G]ne है [C]mukti di[G]layi\n[F]Swarg का ja[G]lal mujhe [C]hai di[G]khaya [C]\n\n[C]Vijay vijay [F]Yeshu की [G]vi[C]jay\n[C]Mahima ma[F]hima Ye[G]shu की mahi[C]ma\n[F]Vijay vijay [G]Yeshu की [C]vi[G]jay\n[F]Jai jai[G]kar ho [C]sa[G]da [C]',
'C', 0, 100, '4/4', 'Verse1, Chorus', 1, TRUE),

(196, 'मसीह ज़िंदा है (Masih Zinda Hai)', 'Traditional', 'Easter Praise', 'hindi',
'मसीह ज़िंदा है मौत हार गयी\nयीशु राजा है महिमा छा गयी\nकब्र के पत्थर को उसने हटाया\nनया जीवन हम सबको दिखाया\n\nमहिमा हो महिमा हो तेरी\nयीशु मसीह तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nपवित्र आत्मा आ छू ले हमें',
'Masih zinda है maut haar gayi\nYeshu Raja है mahima chha gayi\nKabra के patthar ko usne hataya\nNaya jeevan ham sabko dikhaya\n\nMahima ho mahima हो teri\nYeshu Masih Tu hi है Prabhu\nMahima ho mahima हो teri\nPavitra Aatma Aa choo le hamein',
'[G]Masih zinda [C]hai maut [G]haar [D]gayi\n[G]Yeshu Raja [C]hai mahima [G]chha [D]gayi [G]\n[Em]Kabra के patthar [C]ko usne ha[G]taya\n[Em]Naya jeevan [C]ham sabko di[D]khaya [G]\n\n[G]Mahima ho ma[C]hima हो [D]teri\n[G]Yeshu Masih [C]Tu hi [D]hai Pra[G]bu\n[Em]Mahima ho ma[C]hima हो [D]teri\n[Em]Pavitra Aat[D]ma Aa [C]choo le [G]hamein',
'G', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(197, 'क्यों खोजते हो (Kyon Khojte Ho)', 'Traditional', 'Easter Worship', 'hindi',
'क्यों खोजते हो ज़िंदा को मरे हुओं में\nवह यहाँ नहीं है वह जी उठा है\nस्वर्गदूतों ने शुभ समाचार सुनाया\nमसीहा राजा फिर से जी उठा है\n\nहल्लेलूया हल्लेलूया यीशु ज़िंदा है\nहल्लेलूया हल्लेलूया राजा ज़िंदा है\nमौत की हार हुई है जीवन की जीत हुई\nमहिमा हो महिमा हो सदा',
'Kyon khojte ho zinda ko mare huon mein\nWoh yahan nahi है woh jee utha hai\nSwargdooton ne shubh samachar sunaya\nMasiha Raja phir से jee utha hai\n\nHallelujah Hallelujah Yeshu zinda hai\nHallelujah Hallelujah Raja zinda hai\nMaut की haar hui है jeevan ki jeet hui\nMahima हो mahima हो sada',
'[Am]Kyon khojte ho [F]zinda ko [G]mare huon [Am]mein\n[Am]Woh yahan na[F]hi है woh [G]jee utha [Am]hai\n[F]Swargdooton ne [G]shubh sa[C]machar su[G]naya\n[F]Masiha Ra[G]ja phir से [Am]jee utha hai\n\n[Am]Hallelujah Halle[F]lujah Yeshu [G]zinda [Am]hai\n[Am]Hallelujah Halle[F]lujah Raja [G]zinda [Am]hai\n[F]Maut की haar [G]hui है jee[C]van ki jeet [G]hui\n[F]Mahima ho ma[G]hima हो [Am]sada',
'Am', 0, 68, '4/4', 'Verse1, Chorus', 1, TRUE),

(198, 'मौत पर विजय (Maut Par Vijay)', 'Traditional', 'Easter Celebration', 'hindi',
'मौत पर विजय पायी यीशु राजा ने\nजीवन की ज्योति जलायी अंधकार में\nपापों का बोझ उसने खुद पे उठाया\nस्वर्ग का द्वार हम सबके लिए खोला\n\nजय मसीह की जय मसीह की\nगाओ ख़ुशी के साथ जय जय कार\nजय मसीह की जय मसीह की\nमहिमा हो महिमा हो सदा',
'Maut par vijay paayi Yeshu Raja ne\nJeevan की jyoti jalayi andhkar mein\nPaapon ka bojh usne khud पे uthaya\nSwarg का dwar ham sabke liye khola\n\nJai Masih की Jai Masih ki\nGao khushi के saath jai jai kar\nJai Masih की Jai Masih ki\nMahima ho mahima हो sada',
'[E]Maut par vijay [A]paayi [B]Yeshu Raja [E]ne\n[E]Jeevan की jyo[A]ti jalayi [B]andhkar [E]mein\n[F#m]Paapon का bojh [E]usne khud [A]pe u[B]thaya\n[F#m]Swarg का dwar [E]ham sabke [B]liye [E]khola\n\n[E]Jai Masih की [A]Jai Masih [B]ki\n[E]Gao khushi के [A]saath jai [B]jai [E]kar\n[F#m]Jai Masih की [E]Jai Masih [B]ki\n[F#m]Mahima [B]ho mahima [E]ho sada',
'E', 0, 72, '4/4', 'Verse1, Chorus', 1, TRUE),

(199, 'ज़िंदा खुदवांद (Zinda Khudawand)', 'Traditional', 'Traditional Easter', 'hindi',
'ज़िंदा खुदवांद मेरा यीशु मसीह\nमौत पर उसने विजय पायी सदा\nकब्र के पत्थर को उसने हटाया\nनया जीवन हम सबको दिखाया\n\nमहिमा हो महिमा हो तेरी\nयीशु राजा तू ही है प्रभु\nमहिमा हो महिमा हो तेरी\nसारे जहाँ का राजा तू ही है',
'Zinda Khudawand मेरा Yeshu Masih\nMaut पर usne vijay paayi sada\nKabra के patthar ko usne hataya\nNaya jeevan ham sabko dikhaya\n\nMahima ho mahima हो teri\nYeshu Raja Tu hi है Prabhu\nMahima ho mahima हो teri\nSaare jahan का raja Tu hi hai',
'[D]Zinda Khudawand [G]mera Yeshu Ma[D]sih\n[D]Maut पर usne [G]vijay paayi [A]sada [D]\n[Bm]Kabra के pat[G]thar ko [D]usne ha[A]taya\n[Bm]Naya jeevan [G]ham sabko di[A]khaya [D]\n\n[D]Mahima ho ma[G]hima हो [D]teri\n[G]Yeshu Raja [A]Tu hi [D]hai Pra[A]bu\n[Bm]Mahima ho ma[G]hima हो [A]teri\n[Bm]Saare ja[D]han का [A]raja Tu [D]hi hai',
'D', 0, 74, '4/4', 'Verse1, Chorus', 1, TRUE),

(200, 'हल्लेलूया मसीह ज़िंदा है (Final)', 'Traditional', 'Easter Final', 'hindi',
'हल्लेलूया मसीह ज़िंदा है कब्र खाली है\nहल्लेलूया राजा ज़िंदा है महिमा छाई है\nमौत पर उसने विजय पायी है\nहम सबको नया जीवन दिया है\n\nहल्लेलूया हल्लेलूया यीशु ज़िंदा है\nहल्लेलूया हल्लेलूया राजा ज़िंदा है\nजीवन की ज्योति जलायी है प्रभु ने\nमहिमा हो महिमा हो सदा',
'Hallelujah Masih zinda है kabra khali hai\nHallelujah Raja zinda है mahima chhai hai\nMaut पर usne vijay paayi hai\nHam sabko naya jeevan diya hai\n\nHallelujah Hallelujah Yeshu zinda है\nHallelujah Hallelujah Raja zinda hai\nJeevan की jyoti jalayi hai Prabhu ne\nMahima ho mahima हो sada',
'[G]Hallelujah Masih [C]zinda hai kabra [G]khali [D]hai\n[G]Hallelujah Raja [C]zinda hai mahima [G]chhai [D]hai [G]\n[Em]Maut पर usne [C]vijay [G]paayi [D]hai\n[Em]Ham sabko naya [C]jeevan [D]diya [G]hai\n\n[G]Hallelujah Halle[C]lujah Yeshu [D]zinda [G]hai\n[G]Hallelujah Halle[C]lujah Raja [D]zinda [G]hai\n[Em]Jeevan की jyo[C]ti jalayi [G]hai Pra[D]bu ne\n[Em]Mahima ho ma[D]hima ho [G]sada',
'G', 0, 120, '4/4', 'Verse1, Chorus', 1, TRUE);

-- =============================================
-- HASHTAG MAPPINGS (RESTORED)
-- =============================================

-- All songs get 'hindi'
INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) 
SELECT id, (SELECT id FROM hashtags WHERE name = 'hindi') FROM songs WHERE song_number BETWEEN 101 AND 200;

-- Styles
INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) 
SELECT id, (SELECT id FROM hashtags WHERE name = 'classic') FROM songs WHERE song_number BETWEEN 101 AND 125;

INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) 
SELECT id, (SELECT id FROM hashtags WHERE name = 'hymn') FROM songs WHERE song_number BETWEEN 101 AND 125;

INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) 
SELECT id, (SELECT id FROM hashtags WHERE name = 'contemporary') FROM songs WHERE song_number BETWEEN 126 AND 160;

INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) 
SELECT id, (SELECT id FROM hashtags WHERE name = 'bhakti') FROM songs WHERE song_number BETWEEN 161 AND 180;

-- Occasions
INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) 
SELECT id, (SELECT id FROM hashtags WHERE name = 'christmas') FROM songs WHERE song_number BETWEEN 181 AND 190;

INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) 
SELECT id, (SELECT id FROM hashtags WHERE name = 'easter') FROM songs WHERE song_number BETWEEN 191 AND 200;

-- Categories
INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) 
SELECT id, (SELECT id FROM hashtags WHERE name = 'praise') FROM songs WHERE song_number BETWEEN 101 AND 125;

INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) 
SELECT id, (SELECT id FROM hashtags WHERE name = 'worship') FROM songs WHERE song_number BETWEEN 126 AND 160;

INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) 
SELECT id, (SELECT id FROM hashtags WHERE name = 'adoration') FROM songs WHERE song_number BETWEEN 161 AND 180;
