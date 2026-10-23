# 06 – Právne stránky a compliance pred spustením (stav k 23. 10. 2026)

> **Účel:** podklad na vyplnenie stránok Obchodné podmienky, Reklamačný poriadok, Odstúpenie od zmluvy, Doprava a platba, Ochrana osobných údajov a Cookies. Obsahuje aj odpovede na otázky foundera k platbe, dodacej lehote a vracaniu tovaru. **Nejde o právne poradenstvo.** Pred spustením ostrého predaja treba texty dať skontrolovať advokátovi. Neisté miesta sú označené **[NEISTÉ]**.
>
> **Zdroje:** konsolidované znenia zo Slov-Lexu platné k 23. 10. 2026: zákon 108/2024 o ochrane spotrebiteľa (ďalej ZOS) od 27. 9. 2026, Občiansky zákonník (OZ) od 31. 7. 2026, Obchodný zákonník (ObZ) od 17. 8. 2026, 452/2021 od 18. 8. 2026, 79/2015, 391/2015, 384/2025, 222/2004; ďalej usmernenie EK 2021/C 525/01, GDPR a prax SOI. Podrobnosti, presné znenia paragrafov a hotové návrhy textov sú v prílohách:
>
> | Príloha | Obsah |
> |---|---|
> | [pravne/A-platba-dodanie.md](pravne/A-platba-dodanie.md) | Vznik zmluvy, okamžitá platba, nedostupnosť, dodacia lehota, DPH, eKasa, prechod rizika, paletová preprava. Návrhy článkov VOP. |
> | [pravne/B-odstupenie.md](pravne/B-odstupenie.md) | Odstúpenie od zmluvy, používanie stroja počas 14 dní, náklady na vrátenie, § 20a. **Doslovné znenie príloh č. 2 a 3 ZOS** a vyplnené poučenie. |
> | [pravne/C-reklamacie.md](pravne/C-reklamacie.md) | Zodpovednosť za vady, výluky, dôkazné bremeno, záruky výrobcov, harmonizované oznámenie, B2B. **Návrh reklamačného poriadku.** |
> | [pravne/D-gdpr-cookies.md](pravne/D-gdpr-cookies.md) | Inventár údajov a cookies v kóde, **návrh stránok Ochrana osobných údajov a Cookies**, súhlasy v pokladni, DPA. |
> | [pravne/E-ostatne-povinnosti.md](pravne/E-ostatne-povinnosti.md) | Zoznam povinných stránok, identifikácia, ARS, elektroodpad a obaly, **návrh stránky Doprava a platba**, slovenské návody, CE, hluk. |
>
> `docs/03-legislativa-research.md` zostáva ako pôvodný výskum, no počíta ešte s akumulátorovým náradím Makita a skladom v Senci. Kde sa líši, platí tento dokument (opravy v časti 7).

---

## 1. Odpovede na otázky foundera

### 1.1 Platba: zrušiť blokáciu sumy a strhnúť platbu hneď?

**Áno, je to legálne.** Žiadny predpis nezakazuje prijať platbu spolu s objednávkou. Treba dodržať tri veci:

1. **Pred objednávkou poučiť o platbe vopred** (§ 15 ods. 1 písm. k) ZOS): platí sa celá suma vopred, akými spôsobmi, kedy sa odpíše a ako a dokedy ju vrátime, ak tovar nedodáme.
2. **Moment vzniku zmluvy** nastaviť vo VOP. Odporúčanie: objednávka je návrh, **zmluva vzniká naším e-mailom „Potvrdenie objednávky“**, ktorý pošleme po potvrdení dostupnosti u dodávateľa (cieľ: do 1 pracovného dňa). Okamžitý automatický e-mail sa volá „Prijali sme vašu objednávku a platbu“ a výslovne uvádza, že ešte nie je prijatím objednávky. Takto pri nedostupnosti zmluva vôbec nevznikne a nepotrebujeme rizikovú doložku „môžeme zrušiť“ (§ 53 ods. 4 písm. f) OZ, neprijateľné podmienky).
3. **Pri nedostupnosti peniaze vrátiť hneď.** Osobitnú zákonnú lehotu sme nenašli [NEISTÉ], preto odporúčame zaviazať sa vo VOP k **vráteniu do 2 pracovných dní**. Náhradný stroj **iba s výslovným súhlasom** zákazníka (§ 15 ods. 8 ZOS, § 44 ods. 2 OZ). Bez súhlasu sa peniaze vrátia automaticky.

Návrh článkov VOP „Uzavretie kúpnej zmluvy“ a „Nemožnosť dodania po uzavretí zmluvy“ je v [A, časť 1.7](pravne/A-platba-dodanie.md).

**Cena za zjednodušenie:** pri refundácii si Stripe ponechá poplatok z pôvodnej platby (1,5 % + 0,25 € pri štandardnej EÚ karte, viac pri prémiových a firemných kartách). Pri stroji za 3 000 € to je ~45 €. Pri ~5 % nedostupných objednávok je to zanedbateľné. Navyše 7-dňová platnosť blokácie by bola problém pri strojoch s dlhšou dodacou lehotou. **Odporúčame okamžité stiahnutie platby**, ako navrhuje founder.

Daňový dôsledok: daňová povinnosť z DPH vzniká dňom prijatia platby (§ 19 ods. 4 zákona 222/2004). Firme treba do 15 dní vystaviť faktúru k prijatej platbe. Od 1. 1. 2027 musí byť B2B faktúra (aj k platbe vopred) e-faktúrou cez Peppol.

### 1.2 Dodacia lehota: „3–5“ alebo „5–10“ pracovných dní?

Uvedená lehota **je záväzná**, nie je to odhad (§ 5 ods. 1 písm. e) ZOS: „lehota, do ktorej sa obchodník zaväzuje dodať“). SOI to potvrdila v rozhodnutí **P/0047/2025**. E-shop uvádzal „od 1 do 10 pracovných dní“, termín nedodržal a dostal pokutu 500 € za klamlivú obchodnú praktiku. Veta „pri meškaní vás budeme informovať“ mu nepomohla (overené priamo v rozhodnutí).

**Odporúčanie: uviesť oboje. Bežná lehota je informácia, horná hranica je záväzok:**

> **Dostupné u dodávateľa** · Doručenie zvyčajne do 3–5 pracovných dní, **najneskôr do 10 pracovných dní** od zaplatenia. Každý stroj pred odoslaním vybalíme a vyskúšame.

- Písať **„doručenie“**, nie „odoslanie“. Rozhoduje prevzatie zákazníkom (§ 613 ods. 2 OZ).
- Lehotu počítať **od zaplatenia** (zákazník to tak chápe a nevznikne spor o moment uzavretia zmluvy).
- Nikdy nepísať „Skladom“. Tovar nemáme na sklade.
- Stroje s dlhšou lehotou dodávateľa (napr. niektoré Gölz z Nemecka) označiť priamo na produkte („Na objednávku – doručenie do 20 pracovných dní“).
- Ak lehotu nedodržíme, zákazník nám dá dodatočnú lehotu a potom môže odstúpiť (§ 517 OZ, § 613 ods. 5–7 OZ). Interné pravidlo: ak dodávateľ do 2 pracovných dní nepotvrdí dostupnosť, zákazníkovi voláme.

Text pre košík a VOP („Dodacia lehota“ s postupom pri meškaní a nedostupnosti) je v [A, časť 2.3](pravne/A-platba-dodanie.md). Toto **nahrádza súčasný text „3–5 pracovných dní“** na produkte a v pokladni.

### 1.3 Sledovanie objednávky v zákazníckom účte

Je to v poriadku ako doplnková služba. **Nákup však nesmie byť podmienený registráciou** (zásada minimalizácie podľa GDPR, odporúčania EDPB 2/2025 [NEISTÉ, konzultačná verzia]). Hosť sleduje objednávku cez odkaz v e-maile (už máme stránku objednávky s tokenom). Prihlásený zákazník ju vidí aj v účte. Funkcia „Odstúpiť od zmluvy tu“ musí fungovať **aj bez prihlásenia**.

### 1.4 Vrátenie tovaru do 14 dní: „iba nepoužitý a nepoškodený“?

| Founderovo pravidlo | Spotrebiteľ (fyzická osoba, nekupuje na podnikanie) | Firma / živnostník kupujúci na podnikanie |
|---|---|---|
| Vrátiť do 14 dní | Áno, je to zákonné právo. 14 dní plynie od **prevzatia** (§ 20 ZOS). | Zákonné právo nemá. Vrátenie môžeme ponúknuť dobrovoľne za našich podmienok. |
| Len nepoužitý, nepoškodený, v obale | **Nie.** Odstúpenie sa takto podmieniť nedá. Spotrebiteľ môže odstúpiť **aj s použitým alebo poškodeným strojom** (§ 19 ods. 1, § 21 ods. 4 a 6 ZOS). Takáto veta vo VOP je neplatná a hrozí za ňu pokuta. | Áno. Môžeme vrátenie obmedziť na nepoužitý stroj, napr. s poplatkom 10 % a odpočítaním z vrátenej sumy. |
| Použil a chce vrátiť → nie | **Nie, odstúpiť môže.** Môžeme od neho ale vymáhať **náhradu za zníženie hodnoty** stroja, ak s ním zaobchádzal nad rámec vyskúšania (§ 21 ods. 4 ZOS). Náhrada môže byť vysoká: oprava, čistenie, výmena opotrebovaných dielov, rozdiel oproti predaju ako použitý stroj. | Áno. |
| Peniaze vrátime až po kontrole stroja | **Nie.** Peniaze vraciame do 14 dní od doručenia odstúpenia. Zadržať ich môžeme len do prijatia stroja **alebo** doloženia jeho odoslania, podľa toho, čo nastane skôr (§ 22 ods. 5). | Podľa našich podmienok. |
| Náhradu si odpočítame z vrátenej sumy | **Nie.** Jednostranné započítanie je zakázané (§ 22 ods. 8 ZOS). Vrátime **celú** sumu a náhradu vymáhame samostatne (výzva, dohoda, platobný rozkaz). | Áno, ak je to vo VOP pre firmy. |

**Čo je ešte „vyskúšanie“** (analógia „čo by zákazník smel v predajni“, [NEISTÉ], v SR k tomu nie je judikatúra): krátke naštartovanie a chod naprázdno, krátke zapnutie vibrácie na čistej podložke, krátka záťaž elektrocentrály, nasatie čistej vody. **Nad rámec:** hutnenie reálnej plochy, rezanie betónu alebo dlažby, ponorenie vibrátora do betónu, čerpanie kalu, prevádzka na stavbe, viac motohodín. Podrobná tabuľka je v [B, časť 2.3](pravne/B-odstupenie.md).

**Ako sa chrániť (to, čo naozaj funguje):**

1. **Riadne poučenie** (doslovná príloha č. 3 ZOS, vzorový formulár, tlačidlo „Odstúpiť od zmluvy tu“). Ak chýba, lehota sa predĺži o 12 mesiacov a **stratíme nárok na náhradu** za zníženie hodnoty.
2. **Výstupný protokol pri každom stroji**: fotky, výrobné číslo, **stav motohodín**, video zo skúšobného chodu, stav spodnej dosky alebo kotúča, palivo a olej. Kópiu dostane zákazník. Rovnaký **vstupný protokol** robíme pri vrátení stroja.
3. **Priame náklady na vrátenie platí zákazník**, ale **len ak ich vopred uvedieme** (suma alebo odhad pri každom stroji, v pokladni a v potvrdení objednávky, § 15 ods. 1 písm. g) a ods. 7 ZOS). Pri ťažkom stroji je to 100–200 € a to prirodzene odrádza od „požičania na 14 dní“. Návrh odhadov podľa našich prepravných pásiem je v [B, časť 4.1](pravne/B-odstupenie.md): do 40 kg najviac 20 €, do 100 kg 70 €, do 300 kg 120 €, nad 300 kg 200 €. Treba ich overiť cenníkom dopravcu.
4. **Neponúkať automaticky, že si stroj vyzdvihneme.** Ak to ponúkneme, stratíme právo zadržať peniaze do vrátenia stroja.
5. **Návod „Ako si stroj vyskúšať“** vo VOP aj v balení (napr. naštartovať, nechať bežať najviac 10 minút, vibrácia najviac 2 minúty na čistej podložke, nerezať reálny materiál). Nie je to podmienka odstúpenia, ale dôkaz, čo je „nad rámec“.
6. **Pri osobnom odbere** urobiť so zákazníkom skúšobný chod a zaškolenie a dať mu to podpísať.
7. **V pokladni rozlíšiť spotrebiteľa a firmu** (už máme `customer_type`). Pre firmy platí prísnejšia dobrovoľná politika.

### 1.5 Poškodenie nedbanlivosťou alebo nesprávnym používaním: reklamácia neplatí?

**Founder má v princípe pravdu**, s dvoma podmienkami:

- Zodpovedáme len za vadu, ktorú stroj mal **pri prevzatí** (§ 619 ods. 1 OZ). Poškodenie zlým použitím, nesprávnym palivom, zanedbanou údržbou, preťažením alebo neodborným zásahom vadou nie je. Opotrebenie spotrebných dielov (kotúče, remene, sviečky, filtre, spodné dosky) tiež nie, ak vydržali bežnú dobu.
- **Dokazovať to musíme my.** Pri spotrebiteľovi sa počas celých 2 rokov (a ďalších 12 mesiacov po prvej oprave) predpokladá, že vada existovala už pri prevzatí (§ 620 ods. 1 OZ). Reklamáciu preto **musíme vždy prijať**, stroj prevziať na naše náklady (aj 400 kg stroj, § 623 ods. 7–8) a do **30 dní** ju vybaviť. Zamietnutie musí byť **písomné a zdôvodnené** (§ 622 ods. 3–4). Odmietnuť už samotné prijatie reklamácie je správny delikt.

**Zaškolenie preto nie je výluka, ale dôkaz.** Spor vyhráme s podpísaným záznamom o zaškolení, prevzatým slovenským návodom, výstupným protokolom s motohodinami a fotkami a s výrobným číslom. Vo VOP môžeme výluky **vysvetliť** (čo nie je vada), ale nesmieme presúvať dôkazné bremeno. Nepoužívať ani vetu „neoriginálny diel znamená stratu reklamácie“. Poplatok za diagnostiku pri neoprávnenej reklamácii spotrebiteľovi zákon nedáva [NEISTÉ]. Firmám ho môžeme účtovať, ak je vopred v cenníku.

Firmy (ObZ): vadu dokazuje kupujúci, lehotu na oznámenie vád môžeme skrátiť na 12 mesiacov, opotrebiteľné diely vylúčiť a spôsob nápravy pri nepodstatnom porušení zmluvy si volíme my (§ 422–441 ObZ).

**Nepísať „2 roky záruka“ ako výhodu.** Prezentovať zákonné práva ako výhodu ponuky je klamlivá praktika (príloha č. 1 ZOS).

---

## 2. Stránky, ktoré web potrebuje

P = povinné, O = odporúčané. Hotové návrhy textov sú v uvedených prílohách.

| # | Stránka / prvok | P/O | Právny základ | Návrh textu |
|---|---|---|---|---|
| 1 | **Obchodné podmienky (VOP)** s článkom pre firmy | P | § 5, § 15, § 17 ZOS; ObZ pre B2B | časť 3.1 + A, B |
| 2 | **Reklamačný poriadok** (môže byť súčasťou VOP, praktickejšia je samostatná stránka) | P (obsah) | § 5 ods. 1 písm. f) ZOS; § 612–626 OZ | C, časť 11 |
| 3 | **Odstúpenie od zmluvy**: poučenie, vzorový formulár a **funkcia „Odstúpiť od zmluvy tu“** (odkaz v pätičke každej stránky, bez prihlásenia) | P (B2C) | § 15 ods. 1 písm. f)–i), § 19–22, **§ 20a** ZOS | B, časti 6 a 10 |
| 4 | **Doprava a platba** | P (obsah) | § 5 ods. 1 písm. d), e); § 15 ods. 1 písm. k), l); § 17 ods. 2 ZOS | E, časť 4.4 (upraviť podľa časti 1.1–1.2 tohto dokumentu) |
| 5 | **Ochrana osobných údajov** | P | čl. 13 GDPR | D, časť 3 |
| 6 | **Zásady používania cookies** | P (stránka áno, lišta zatiaľ nie, pozri 3.6) | § 109 ods. 8 zákona 452/2021 | D, časť 2.4 |
| 7 | **Riešenie sporov (ARS)**: žiadosť o nápravu, SOI ako subjekt ARS, odkaz na zoznam MH SR. **Odkaz na platformu ODR nesmie byť**, bola zrušená 20. 7. 2025. | P | § 5 ods. 1 písm. q), ods. 3 ZOS; § 11 zákona 391/2015 | E, časť 1.4 (stačí ako článok VOP + krátka stránka) |
| 8 | **Harmonizované oznámenie EÚ o zákonnej zodpovednosti za vady** (oficiálna farebná grafika, nemeniť) na produkte alebo v pokladni pred objednávkou, v potvrdzovacom e-maile a ako výtlačok aspoň A4 na výdajnom mieste | P (od 27. 9. 2026) | § 5 ods. 1 písm. f) ZOS; VN (EÚ) 2025/1960 | C, časť 5 |
| 9 | **Spätný zber elektroodpadu a batérií** (blok v Doprava a platba alebo samostatná stránka) | P (pre elektrické stroje) | § 37 ods. 1 zákona 79/2015 | E, časť 3.6 |
| 10 | **Identifikácia firmy** v pätičke a na Kontakte: obchodné meno, sídlo Boldog 182, 925 26 Boldog, IČO, zápis v OR, telefón, e-mail | P | § 3a ods. 3 ObZ; § 5, § 15 ZOS | už je na `/kontakt`, skontrolovať pätičku |
| 11 | **GPSR údaje na každom produkte**: výrobca (meno, poštová a e-mailová adresa), zodpovedná osoba v EÚ pri Honde, model, bezpečnostné informácie v slovenčine | P | čl. 19 GPSR | chýba v dátach produktov |
| 12 | **Označenie GARAN** (záruka životnosti) | P iba ak výrobca dáva bezplatnú záruku na celý stroj dlhšiu ako 2 roky (Honda možno) | § 5 ods. 1 písm. g) ZOS | overiť u Unicon/Honda |
| 13 | Vyhlásenie o prístupnosti | O (mikropodnik je vyňatý, § 2 ods. 3 zákona 351/2022) | | overiť veľkosť firmy, časť 6 |

**Recenzie** zatiaľ nemáme, preto netreba informáciu o ich overovaní (§ 11 ods. 6 ZOS). Ak ich zavedieme, treba ju doplniť.

---

## 3. Kostra jednotlivých stránok

### 3.1 Obchodné podmienky (VOP)

Odporúčané články (B2C, posledný článok pre firmy):

1. **Úvodné ustanovenia:** predávajúci (Royal stroje s. r. o., Boldog 182, 925 26 Boldog, IČO 57 405 425, DIČ 2122722063, IČ DPH SK2122722063, zapísaná v OR Mestského súdu Bratislava III, oddiel Sro, vložka č. 195530/B), kontakt (shop@royalstroje.sk, +421 948 555 551), adresa na reklamácie a vrátenie (Recká cesta 182, Boldog), orgán dohľadu SOI, definícia spotrebiteľa a podnikateľa.
2. **Tovar a ceny:** ceny s DPH, doprava zvlášť, žiadne príplatky za spôsob platby (§ 4 ods. 2 písm. f) ZOS), pri zľave najnižšia cena za 30 dní (§ 7), „Dostupné u dodávateľa“ namiesto „Skladom“, cena na vyžiadanie (Atlas Copco) nie je ponuka.
3. **Objednávka a uzavretie zmluvy:** návrh, okamžitý e-mail „Prijali sme…“, zmluva vzniká e-mailom „Potvrdenie objednávky“, náhradný tovar len so súhlasom, refundácia do 2 pracovných dní ([A 1.7](pravne/A-platba-dodanie.md)). Tlačidlo **„Objednávka s povinnosťou platby“** (§ 17 ods. 4).
4. **Platba:** celá suma vopred cez Stripe (karta, Apple Pay, Google Pay), prípadne prevod. Kedy sa suma odpíše, ako a dokedy ju vrátime. Faktúra e-mailom ([A 3](pravne/A-platba-dodanie.md)).
5. **Dodanie:** lehota „zvyčajne 3–5, najneskôr 10 pracovných dní od zaplatenia“, postup pri meškaní a nedostupnosti ([A 2.3](pravne/A-platba-dodanie.md)), doručenie len na Slovensku, osobný odber v Boldogu.
6. **Preprava ťažkých strojov:** doručenie k obrubníku, vyloženie zabezpečuje zákazník, ak si neobjedná vyloženie (hydraulické čelo), prístup pre nákladné vozidlo, avizácia. Kontrolu zásielky pri prevzatí a spísanie škody s dopravcom **odporúčame**, ale u spotrebiteľa to **nesmie byť podmienka** jeho práv (24-hodinová lehota by bola neplatná). Pre firmy ju môžeme dohodnúť ([A 9](pravne/A-platba-dodanie.md)).
7. **Prechod rizika a vlastníctva:** spotrebiteľ preberá riziko až prevzatím (§ 614 OZ), poškodenie pri preprave ide na náš účet. Firma ho preberá odovzdaním prvému dopravcovi (§ 457 ObZ), výhrada vlastníctva do zaplatenia.
8. **Kontrola strojov pred odoslaním:** „Každý stroj pred odoslaním vybalíme, skontrolujeme kompletnosť, vykonáme krátku funkčnú skúšku a zabalíme ho späť. Tovar je nový.“ Pri benzínových strojoch uviesť, či zostáva olej alebo palivo.
9. **Odstúpenie od zmluvy** (odkaz na samostatnú stránku, [B 10](pravne/B-odstupenie.md)).
10. **Zodpovednosť za vady** (odkaz na reklamačný poriadok) a **záruky výrobcov** (Honda, Bomag, Gölz, len ak ich máme overené písomne).
11. **Riešenie sporov:** žiadosť o nápravu, SOI ako subjekt ARS.
12. **Ochrana osobných údajov** (odkaz).
13. **Podnikatelia:** ObZ, bez zákonného odstúpenia (dobrovoľné vrátenie nepoužitého stroja), vady podľa § 422 a nasl. ObZ s 12-mesačnou lehotou, výluka opotrebenia, poplatok za neoprávnenú reklamáciu podľa cenníka, náhrada škody najviac do výšky ceny stroja [NEISTÉ, § 386 ObZ].
14. **Záverečné ustanovenia:** **verzia a dátum účinnosti**. Ku každej objednávke sa ukladá verzia, ktorú zákazník odsúhlasil (už ukladáme verziu a čas súhlasu).

### 3.2 Reklamačný poriadok

Kompletná štruktúra (časť A pre spotrebiteľov s 11 článkami, časť B pre firmy s 9 článkami) je v [C, časť 11](pravne/C-reklamacie.md). Kľúčové body pre spotrebiteľa:

- 2 roky od prevzatia a +12 mesiacov po prvej oprave (iba raz, pri zmluvách od 31. 7. 2026).
- Vadu treba vytknúť do 2 mesiacov od jej zistenia.
- Hneď po vytknutí vydáme písomné potvrdenie, vadu vybavíme najneskôr do 30 dní.
- **Pred opravou** poučíme zákazníka o práve vybrať si opravu alebo výmenu a o predĺžení o 12 mesiacov (§ 623 ods. 2 OZ).
- Prepravu tam aj späť platíme my.
- Vysvetlenie, čo nie je vada (opotrebenie, zlé použitie, údržba) bez presunu dôkazného bremena.
- Zamietnutie písomne so zdôvodnením a s informáciou o ARS.
- Reklamáciu môže prijímať aj autorizovaný servis, ak ho vopred oznámime. Zodpovednosť však zostáva na nás.

Samostatný reklamačný poriadok ani evidencia reklamácií už nie sú zákonom výslovne povinné. Evidenciu však potrebujeme ako dôkaz (lehota 30 dní, poučenie, predĺženie). Patrí do RCC.

### 3.3 Odstúpenie od zmluvy

- Doslovné poučenie podľa prílohy č. 3 ZOS, vyplnené pre Royal stroje ([B 6.4](pravne/B-odstupenie.md)), vrátane bodu 3a o online funkcii a **odhadu nákladov na vrátenie** podľa hmotnosti.
- Vzorový formulár podľa prílohy č. 2 (na stiahnutie ako PDF aj ako text).
- **Funkcia § 20a:** odkaz „Odstúpiť od zmluvy tu“ v pätičke každej stránky. Povinné polia sú len meno, číslo objednávky a e-mail; ostatné polia (dôvod, IBAN, výber položiek) sú voliteľné. Druhý krok má tlačidlo „Potvrdiť odstúpenie od zmluvy“. Hneď potom odchádza e-mail s obsahom oznámenia a dátumom a časom odoslania. Formulár musí fungovať bez prihlásenia.
- Návod „Ako si stroj vyskúšať bez rizika“ a pokyny na vrátenie (vypustiť palivo, zabaliť na paletu).
- Dobrovoľná politika pre firmy.

Poznámka: doslovné znenie príloh je extrahované z PDF. Pred zverejnením ho treba vizuálne porovnať s PDF zákona 108/2024 (strany 121–123).

### 3.4 Doprava a platba

Návrh je v [E 4.4](pravne/E-ostatne-povinnosti.md). Treba ho upraviť podľa rozhodnutí v časti 1:

- **Doručenie len na Slovensku.** Toto obmedzenie a spôsoby platby musia byť viditeľné **najneskôr na začiatku objednávky** (v košíku), § 17 ods. 2 ZOS.
- Ceny podľa hmotnosti objednávky: do 40 kg 9,90 €, do 100 kg 49 €, do 300 kg 89 €, nad 300 kg 149 €. Tieto pásma sú placeholdery do potvrdenia od dopravcu.
- Dodacia lehota: zvyčajne 3–5, najneskôr 10 pracovných dní od zaplatenia; pri produktoch „Na objednávku“ podľa lehoty pri produkte.
- Osobný odber: Recká cesta 182, Boldog, **prevádzkové hodiny**, skúšobný chod a zaškolenie pri odbere, bez platby na mieste (inak treba eKasu).
- Preprava ťažkých strojov: k obrubníku, vyloženie, prístup, avizácia, kontrola zásielky.
- Platba vopred (karta, Apple Pay, Google Pay cez Stripe), bez príplatkov, faktúra e-mailom.
- Odhad nákladov na vrátenie pri odstúpení podľa hmotnosti.
- Spätný zber elektroodpadu v Boldogu (blok [E 3.6](pravne/E-ostatne-povinnosti.md)).
- **Nepoužívať** „ekologické doručenie“ ani iné všeobecné environmentálne tvrdenia. Osobný odber stačí opísať vecne.

### 3.5 Ochrana osobných údajov

Návrh je v [D 3](pravne/D-gdpr-cookies.md). Obsahuje:

- prevádzkovateľa, účely a právne základy (zmluva, zákonné povinnosti, oprávnený záujem, súhlas);
- doby uchovávania: účtovné doklady 10 rokov, objednávky a reklamácie 5 rokov [NEISTÉ], účet do zrušenia;
- príjemcov: Stripe, Supabase (EÚ, Frankfurt), Vercel, Resend, dopravcovia, účtovník, dodávatelia pri priamom doručení;
- prenosy do USA (rámec DPF platí, štandardné zmluvné doložky ako záloha);
- automatizované rozhodovanie Stripe Radar s možnosťou ľudského posúdenia;
- práva dotknutých osôb a sťažnosť na ÚOOÚ: **Galvaniho 7/B, 821 04 Bratislava** (nová adresa, nie Hraničná 12).

Zodpovedná osoba (DPO) nie je povinná. Záznamy o spracovateľských činnostiach (čl. 30) áno.

### 3.6 Cookies

- **Dnes e-shop nenastavuje žiadne cookies.** Košík je v localStorage a zákazník si ho sám vyžiadal, takže ide o výnimku. Mapa sa načíta až po kliknutí, fonty sú na našom serveri, Stripe je presmerovanie a nemáme analytiku. **Lišta so súhlasom dnes nie je potrebná** a nebude ani po zavedení prihlasovacích cookies. **Stránka Zásady používania cookies je však potrebná** (stanovisko RÚ a ÚOOÚ) a odkaz na ňu patrí do pätičky.
- **Pred nasadením GA4, Meta Pixel alebo Google Ads lištu treba.** Požiadavky:
  - tlačidlá „Prijať všetko“, „Odmietnuť všetko“ a „Nastavenia“ na prvej obrazovke, rovnako výrazné;
  - nič predvolene zaškrtnuté, zavretie lišty = odmietnutie;
  - možnosť súhlas kedykoľvek odvolať a záznam o súhlasoch;
  - odporúčané riešenie: CookieConsent v3 a Google Consent Mode v2 v **Basic** režime.

  Pokuta je **až 5 % obratu** (nie 10 %, ako uvádzal docs/03).
- Text pod tlačidlom mapy na `/kontakt` je navrhnutý v [D 2.6](pravne/D-gdpr-cookies.md).

---

## 4. Povinnosti mimo webu (pred prvým ostrým predajom)

| # | Povinnosť | Prečo | Kto |
|---|---|---|---|
| 1 | **Slovenské návody a bezpečnostné pokyny** ku každému stroju (Gölz z Nemecka, Honda/NTC cez Unicon) | § 4 ods. 1 písm. g) ZOS, zákon o štátnom jazyku, GPSR. Bez nich sa stroj nesmie predávať. | Founder: overiť u Gölz a Unicon |
| 2 | **Registrácia výrobcu elektrozariadení, batérií a obalov** v ISOH a zmluvy s organizáciou zodpovednosti výrobcov (OZV) | Tovar z CZ a DE uvádzame na slovenský trh prví, takže sme výrobca (§ 32 ods. 16 písm. c), § 42 ods. 14, § 52 ods. 11 zákona 79/2015). Splnomocnený zástupca dodávateľa to za nás nevyrieši. V rozsahu sú: elektrické píly Gölz, čerpadlá Atlas Copco, vibrátory Enar, pravdepodobne aj elektrocentrály Honda [NEISTÉ]. Batérie sú v strojoch s elektrickým štartom. Obaly sú všetky. Spaľovacie dosky, ubíjadlá, motorové čerpadlá a rezače škár sú mimo rozsahu elektroodpadu. | Founder + OZV (cenové ponuky aspoň od dvoch, napr. SEWA, ASEKOL, ENVI-PAK, NATUR-PACK) |
| 3 | **Spätný zber 1:1** (bezplatne) v Boldogu + informácia na webe | § 37 ods. 1, § 34 ods. 5 zákona 79/2015 | Founder |
| 4 | **Ohlásenie prevádzkarne Recká cesta 182 a e-shopu** živnostenskému úradu do 15 dní, označenie prevádzkarne (obchodné meno, sídlo, prevádzkový čas) | § 17 živnostenského zákona; § 4 ods. 1 písm. c) ZOS | Founder |
| 5 | **Žiadne platby pri osobnom odbere** (alebo zriadiť eKasu) | zákon 384/2025. Online platba cez Stripe eKasu nevyžaduje [NEISTÉ, overiť s účtovníkom] | Founder |
| 6 | **CE, vyhlásenie o zhode, štítok hluku (L_WA)** pri doskách, ubíjadlách a elektrocentrálach | povinnosti distribútora; nariadenie vlády 78/2019 | kontrola pri príjme stroja |
| 7 | **Zmluvy so sprostredkovateľmi (DPA):** Supabase a Resend (prijaté s podmienkami), Stripe (súčasť zmluvy). **Vercel má DPA len na pláne Pro** a dnes sme na Hobby. | čl. 28 GDPR | prechod na Vercel Pro pred ostrou prevádzkou |
| 8 | **Peppol e-faktúry pre firmy od 1. 1. 2027** (aj faktúry k platbe vopred) | novela zákona o DPH 385/2025 | RCC / účtovník |
| 9 | **Záznamy o spracovateľských činnostiach**, postup pri porušení ochrany údajov | čl. 30 a 33 GDPR | Founder (máme podklady v D 5) |
| 10 | Vypnúť `is_demo`, odstrániť `noindex` a demo ceny až po splnení bodov 1–7 | | my |

---

## 5. Zmeny v e-shope, ktoré z toho vyplývajú

1. **Stripe:** zrušiť `capture_method: "manual"` v `src/lib/checkout-actions.ts`. Upraviť stavy objednávky (`paid_authorized` → zaplatené, čaká na potvrdenie), `docs/04` časť 4.1 a webhook, aby pracoval s okamžitým zaplatením. Refundácia pri nedostupnosti cez Stripe Refund. Toto je zmena v `src/lib/order-state.ts`, treba ju navrhnúť opatrne.
2. **Texty dodacej lehoty** na produkte, v košíku a v pokladni: „zvyčajne 3–5, najneskôr 10 pracovných dní od zaplatenia“. Pridať príznak produktu pre dlhšiu lehotu.
3. **Tlačidlo „Objednávka s povinnosťou platby“** a rekapitulácia pred ním. Overiť, či to súčasná pokladňa spĺňa.
4. **Obmedzenie „len Slovensko“ a spôsoby platby** zobraziť už v košíku.
5. **Odhad nákladov na vrátenie** podľa prepravného pásma na produkte, v pokladni a v potvrdení.
6. **Harmonizované oznámenie EÚ** (oficiálny súbor) na produkte alebo v pokladni a v e-maile.
7. **Pätička:** odkazy na VOP, Reklamačný poriadok, Odstúpenie od zmluvy, **„Odstúpiť od zmluvy tu“**, Doprava a platba, Ochrana osobných údajov, Cookies a Riešenie sporov. Doplniť identifikáciu firmy.
8. **Formulár § 20a** (`/odstupenie`) s potvrdzovacím e-mailom. E-mail závisí od Resend, ktorý čaká na schránku shop@royalstroje.sk.
9. **Checkbox v pokladni pre firmy:** vyhlásenie, že nakupujú na podnikanie. **Soft opt-in pre marketing** s možnosťou odmietnuť priamo v pokladni (§ 116 ods. 15–16 zákona 452/2021). Platí len 1 rok po skončení zmluvy.
10. **GPSR polia pri produktoch** (výrobca, adresa, e-mail, zodpovedná osoba v EÚ, bezpečnostné PDF v slovenčine).
11. `Referrer-Policy: no-referrer` na stránke objednávky (token v URL) a obmedzenie doby uchovávania `payment_events.payload` (obsahuje osobné údaje zo Stripe).
12. E-mailové šablóny (neskôr, s Resend): „Prijali sme objednávku a platbu“ (nie je prijatím), „Potvrdenie objednávky“ s PDF VOP, reklamačného poriadku, poučenia a formulára, oznámenie o nedostupnosti s možnosťami, potvrdenie odstúpenia a potvrdenie reklamácie.

---

## 6. Otázky pre foundera

**Odpovede z 23. 10. 2026** (founder ich ešte prejde 24. 10.):

- Body 1 a 2: **súhlas**. Platba sa stiahne hneď, zmluva vzniká potvrdením objednávky. Lehota je „zvyčajne 3–5, najneskôr 10 pracovných dní od zaplatenia“. Implementované.
- Bod 3: výdajné miesto Royal Shop **Po–Pi 8:00–15:00** (požičovňa má 7:00–16:00, pre e-shop je kratší čas, aby bol čas na prípravu).
- Bod 4: cenník dopravy ostáva, upraví sa pred spustením. Odhady nákladov na vrátenie sú v `src/lib/legal.ts`.
- Odstúpenie aj s poškodeným strojom vidí founder ako veľké riziko a vrátime sa k nemu podrobnejšie. Zatiaľ sú texty napísané podľa štandardu a s maximálnou zákonnou ochranou (časť 1.4).
- Záruky výrobcov Honda, Bomag a Gölz zistí founder. Dovtedy VOP a reklamačný poriadok uvádzajú záruky výrobcov len všeobecne.
- Slovenské návody: predpokladáme, že ich dodajú Gölz a Unicon. Inak si ich preložíme.

Pôvodné otázky:


1. **Súhlasí s modelom** „platba hneď → zmluva vzniká naším e-mailom Potvrdenie objednávky do 1 pracovného dňa → pri nedostupnosti vrátenie peňazí do 2 pracovných dní“?
2. **Súhlasí s textom lehoty** „zvyčajne 3–5, najneskôr 10 pracovných dní od zaplatenia“? Ktoré stroje (napr. Gölz) majú dlhšiu lehotu?
3. **Prevádzkové hodiny** výdajného miesta Recká cesta 182 (na web aj na prevádzkareň). Je prevádzkareň a e-shop ohlásený živnostenskému úradu?
4. **Dopravca** pre balíky a palety: cenník (overiť pásma a odhad nákladov na vrátenie), hydraulické čelo, avizácia, preberací protokol.
5. **Slovenské návody** od Gölz a Unicon? Ktoré modely majú elektrický štart a batériu?
6. Je Unicon (alebo Honda) registrovaný na Slovensku ako výrobca elektrozariadení a batérií pre tovar, ktorý nám predáva? Písomné potvrdenie.
7. **Veľkosť firmy:** počet zamestnancov, očakávaný obrat a súvaha, vzťah k firme za royalstroje.sk (pre výnimku z prístupnosti).
8. **Záruky výrobcov:** Honda (až 5 rokov pre spotrebiteľov?), Bomag (3-2-1?), Gölz (5 rokov po registrácii?). Písomné podmienky od Unicon a Gölz. Od toho závisí GARAN a text vo VOP.
9. Bude sa pri odbere niekedy platiť na mieste (hotovosť alebo karta)? Ak áno, treba eKasu.
10. Plánuje analytiku alebo reklamu (GA4, Meta) pri spustení? Ak áno, treba lištu so súhlasom.
11. Dobrovoľné vrátenie pre firmy: chce ho ponúkať? Za akých podmienok (napr. nepoužitý stroj, 14 dní, poplatok 10 %)?

## 7. Opravy k docs/03

- Pokuta za cookies a e-mailový marketing je **200 € až 5 % obratu** (nie 10 %).
- Adresa ÚOOÚ je **Galvaniho 7/B, 821 04 Bratislava**.
- Batérie: správna citácia je **§ 42 ods. 14** zákona 79/2015 (nie § 38).
- Model sa zmenil: žiadne akumulátorové náradie (Makita), výdaj v **Boldogu** (nie v Senci), dodávatelia sú **Unicon Ostrava (CZ)** a **Gölz (DE)**. Odpadá preto téma predĺženej záruky Makita. Povinnosti výrobcu elektrozariadení teraz platia pre Gölz a Atlas Copco.
- Vercel DPA platí len na pláne Pro.

## 8. Body pre advokáta (výber, úplné zoznamy sú v prílohách)

1. Model „objednávka = návrh, zmluva vzniká potvrdením“ pri okamžitej platbe a poistná doložka pri nemožnosti dodania po uzavretí zmluvy (§ 53 OZ).
2. Odhad nákladov na vrátenie pri ťažkých strojoch a ponuka sprostredkovania dopravcu.
3. Rozsah „vyskúšania“ pri stavebných strojoch a postup pri vymáhaní náhrady za zníženie hodnoty (dobrovoľná dohoda o započítaní po odstúpení).
4. Formulácie výluk v reklamačnom poriadku, poplatok za diagnostiku a B2B obmedzenia (§ 386 ObZ).
5. Doslovné znenie poučenia (príloha č. 3) a formulára (príloha č. 2) oproti PDF zákona.
6. Rola dopravcov a dodávateľov podľa GDPR. Soft opt-in cez spoločné CRM s požičovňou.
7. (Daňový poradca) Deň prijatia platby pri Stripe, eKasa pri platobnej bráne, Peppol pri platbách vopred.
