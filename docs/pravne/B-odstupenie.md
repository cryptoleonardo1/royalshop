# B – Odstúpenie od zmluvy uzavretej na diaľku (Royal stroje s. r. o.)

Stav právnej úpravy k **23. 10. 2026**. Toto nie je právne poradenstvo; pred spustením ostrej prevádzky dajte VOP skontrolovať advokátovi. Neisté body sú označené **[NEISTÉ]**, sekundárne zdroje **[SEKUNDÁRNY]**.

## Pramene (primárne)

| Skratka | Prameň | Odkaz |
|---|---|---|
| **ZOS** | Zákon č. 108/2024 Z. z. o ochrane spotrebiteľa, konsolidované znenie účinné od 27. 9. 2026 | https://static.slov-lex.sk/pdf/SK/ZZ/2024/108/ZZ_2024_108_20260927.pdf |
| **311/2025** | Zákon č. 311/2025 Z. z. (čl. III vkladá § 20a, bod 3a prílohy č. 3, prechodné ust. § 53b; účinnosť 19. 6. 2026) | https://static.slov-lex.sk/pdf/SK/ZZ/2025/311/ZZ_2025_311_20260619.pdf |
| **OZ** | Zákon č. 40/1964 Zb. Občiansky zákonník, znenie účinné od 31. 7. 2026 (§ 52, § 580, § 618–621) | https://static.slov-lex.sk/pdf/SK/ZZ/1964/40/ZZ_1964_40_20260731.pdf |
| **CRD** | Smernica 2011/83/EÚ o právach spotrebiteľov (čl. 9–16) | https://eur-lex.europa.eu/legal-content/SK/TXT/?uri=CELEX:02011L0083-20220528 |
| **Usmernenie EK** | Oznámenie Komisie 2021/C 525/01, Ú. v. EÚ C 525, 29. 12. 2021 (SK verzia, oddiely 1.1, 3.x, 5.1–5.5, 5.11) | https://eur-lex.europa.eu/legal-content/SK/TXT/?uri=CELEX:52021XC1229(04) (stiahnuté cez http://publications.europa.eu/resource/cellar/a5f87ef3-6849-11ec-9136-01aa75ed71a1) |

Prechodné ustanovenie (311/2025, nový § 53b ZOS): úpravy účinné od 19. 6. 2026 (vrátane § 20a) *„sa použijú na zmluvu uzavretú na diaľku prostredníctvom online rozhrania uzavretú po 18. júni 2026“*. Pre nás teda platia v plnom rozsahu.

---

## 1. Kto má právo, lehota, viac zásielok, odstúpenie pred doručením

### 1.1 Iba spotrebiteľ
- § 19 ods. 1 ZOS: *„Spotrebiteľ má právo odstúpiť od zmluvy uzavretej na diaľku … aj bez uvedenia dôvodu v lehote podľa § 20 ods. 1 až 3 …“*
- Spotrebiteľ = § 52 ods. 4 OZ: *„Spotrebiteľom je fyzická osoba, ktorá v súvislosti so spotrebiteľskou zmluvou, z nej vyplývajúcim záväzkom alebo pri obchodnej praktike nekoná v rámci svojej podnikateľskej činnosti alebo povolania.“* (ZOS odkazuje v pozn. 1).
- Právnická osoba (s. r. o., a. s., obec, SVB) **nikdy** nie je spotrebiteľ → zákonné právo na odstúpenie nemá.
- **Živnostník (SZČO) nakupujúci na IČO:** rozhoduje *účel*, nie to, či zadal IČO. Ak kupuje vibračnú dosku na svoju stavebnú živnosť, koná v rámci podnikania → nie je spotrebiteľ. Pri **dvojúčelovej** kúpe (čiastočne súkromne, čiastočne pre podnikanie) je spotrebiteľom, ak podnikateľský účel **neprevažuje** (Usmernenie EK, odd. 1.1, s odkazom na odôvodnenie 17 CRD a C‑105/17 Kamenova; posúdenie „individuálne“).
  - Praktické riešenie: v pokladni prepínač **„Nakupujem ako podnikateľ / firma (na IČO)“** + vyhlásenie *„Tovar kupujem v rámci svojej podnikateľskej činnosti.“* Takýto zákazník dostane B2B režim (bez zákonného odstúpenia, viď bod 8). Vyhlásenie je silný dôkaz, ale nie je nevyvrátiteľné – ak by išlo zjavne o súkromný nákup (napr. elektrocentrála k chate), orgán dozoru/súd môže posúdiť inak. **[NEISTÉ – posúdenie vždy individuálne]**
  - Pozor: rozlišovanie nesmie byť zneužité (napr. vynucovať IČO od fyzických osôb) – to by bolo obchádzanie ochrany (§ 52 ods. 2 OZ: *„Odlišné zmluvné dojednania alebo dohody, ktorých obsahom alebo účelom je obchádzanie tohto ustanovenia, sú neplatné.“*).
- V našej DB: `customer_type = 'person'` ↔ spotrebiteľ; `company`/SZČO na IČO ↔ B2B (súlad s pravidlom v CLAUDE.md).

### 1.2 Osobný odber v Boldogu
- Ak zákazník objedná a zaplatí **cez e‑shop** a tovar si len vyzdvihne v Boldogu, je to stále **zmluva uzavretá na diaľku** → právo odstúpiť platí. Usmernenie EK (odd. 3.x k pojmu zmluva na diaľku): *„Skutočnosť, že strany sa po uzavretí zmluvy na diaľku stretnú, zvyčajne v čase dodania alebo platby, by nemala zmeniť klasifikáciu zmluvy ako zmluvy uzavretej na diaľku.“*
- Ak zákazník príde do prevádzky, stroj si pozrie, dohodne a **uzavrie kúpu na mieste** (podpíše/zaplatí v predajni), nejde o zmluvu na diaľku (§ 14 ods. 1 ZOS – „výlučne prostredníctvom … prostriedkov diaľkovej komunikácie“; odôvodnenie 20 CRD citované v Usmernení) → zákonné 14‑dňové odstúpenie neplatí. **Pozor:** objednávka cez web s „platbou pri odbere“ je stále na diaľku.

### 1.3 Lehota 14 dní od prevzatia
- § 20 ods. 1 písm. a) bod 1 ZOS: 14 dní odo dňa *„prevzatia tovaru spotrebiteľom podľa odseku 4“*.
- § 20 ods. 4 ZOS: *„Tovar sa považuje za prevzatý spotrebiteľom okamihom, keď spotrebiteľ alebo ním určená tretia osoba okrem dopravcu prevezme všetky časti objednaného tovaru, alebo ak sa a) tovary objednané spotrebiteľom v jednej objednávke dodávajú oddelene, okamihom prevzatia tovaru, ktorý bol dodaný ako posledný, b) dodáva tovar pozostávajúci z viacerých dielov alebo kusov, okamihom prevzatia posledného dielu alebo posledného kusu, …“*
  - Príklad: doska (paleta) príde 3. 11., gumová podložka (balík) 6. 11. → lehota beží od 6. 11.
- Počítanie: lehota začína plynúť dňom nasledujúcim po prevzatí (Usmernenie EK, odd. 5.1.2). Ak koniec pripadne na sobotu/nedeľu/sviatok, posúva sa na najbližší pracovný deň (§ 122 ods. 1 a 3 OZ: *„Lehota určená podľa dní začína sa dňom, ktorý nasleduje po udalosti…“*; *„Ak posledný deň lehoty pripadne na sobotu, nedeľu alebo sviatok, je posledným dňom lehoty najbližší nasledujúci pracovný deň.“*). Uplatnenie OZ na lehotu ZOS je bežný výklad (§ 52 ods. 2 OZ – prednostné použitie OZ v spotrebiteľských vzťahoch).
- Zachovanie lehoty: stačí **odoslať** oznámenie v posledný deň (§ 20 ods. 7 ZOS; pri online funkcii § 20a ods. 6).
- Ak obchodník nesplní poučovaciu povinnosť (§ 15 ods. 1 písm. f) ZOS), lehota sa predlžuje až o **12 mesiacov** (§ 20 ods. 3 ZOS); pri dodatočnom poučení beží 14 dní od dodatočného poučenia (§ 20 ods. 2 ZOS). Navyše spotrebiteľ potom **nezodpovedá za zníženie hodnoty** (§ 21 ods. 4 ZOS, časť za bodkočiarkou). → Riadne poučenie je pre nás kľúčová ochrana.
- 30‑dňová lehota platí len pri nevyžiadanej návšteve / predajnej akcii (§ 20 ods. 1 písm. b) ZOS) – nás sa netýka.

### 1.4 Odstúpenie pred doručením
- § 20 ods. 5 ZOS: *„Spotrebiteľ môže odstúpiť od zmluvy …, ktorých predmetom je dodanie tovaru, aj pred začatím plynutia lehoty na odstúpenie od zmluvy.“*
- Prakticky: storno pred expedíciou → pri Stripe manuálnom zachytení len zrušiť autorizáciu / vrátiť platbu do 14 dní od doručenia oznámenia. Ak už bolo odoslané a zákazník zásielku odmietne, riziko nesieme my (Usmernenie EK, odd. 5.5.5). Samotné odmietnutie zásielky bez vyhlásenia **nie je** platné odstúpenie (Usmernenie EK, odd. 5.3).

### 1.5 Forma odstúpenia
- § 20 ods. 6 ZOS: listinne alebo na inom trvanlivom médiu (e‑mail), *„akékoľvek jednoznačne formulované vyhlásenie“*; vzorový formulár je dobrovoľný. Nesmieme vyžadovať dôvod ani vlastný formulár.
- § 20 ods. 15 ZOS: dôkazné bremeno o uplatnení odstúpenia znáša spotrebiteľ.

---

## 2. Môže obchodník podmieniť odstúpenie tým, že tovar je „nepoužitý / nepoškodený / v pôvodnom obale“?

### 2.1 Nie.
- Právo odstúpiť je **bez uvedenia dôvodu** a zákon nepozná žiadnu podmienku stavu tovaru (§ 19 ods. 1 ZOS). Jediné výnimky sú taxatívne v § 19 ods. 1 písm. a)–m) (viď bod 5).
- § 21 ods. 6 ZOS: *„Spotrebiteľovi z uplatnenia práva na odstúpenie od zmluvy … nevznikajú okrem povinností podľa odsekov 1, 3 až 5 a povinnosti uhradiť dodatočné náklady podľa § 22 ods. 3 žiadne ďalšie povinnosti alebo náklady.“*
- Odôvodnenie 47 CRD (citované v Usmernení EK, odd. 5.5.4): *„V takom prípade by spotrebiteľ nemal stratiť právo na odstúpenie od zmluvy, ale mal by byť zodpovedný za akékoľvek zníženie hodnoty tovaru.“* Usmernenie: *„spotrebitelia môžu odstúpiť od zmluvy bez ohľadu na to, ako sa s tovarom počas lehoty na odstúpenie od zmluvy zaobchádzalo“*.
- Klauzula vo VOP typu „tovar musí byť nepoužitý a v originálnom obale, inak odstúpenie nebude akceptované“ je **v rozpore so zákonom, neplatná** (§ 52 ods. 2 OZ) a je postihnuteľná pokutou SOI 200 € až 2 % obratu, max. 200 000 € (§ 43 ods. 1 písm. a) ZOS – porušenie § 19 ods. 1, § 21 ods. 3 až 6, § 22 ods. 1, 2, 4 až 9).

### 2.2 Čo obchodník môže: náhrada za zníženie hodnoty (§ 21 ods. 4 ZOS)
- Presné znenie: *„(4) Spotrebiteľ zodpovedá za zníženie hodnoty tovaru, ktoré vzniklo v dôsledku zaobchádzania s tovarom, ktoré je nad rámec zaobchádzania potrebného na zistenie vlastností a funkčnosti tovaru; to neplatí, ak obchodník nesplnil informačnú povinnosť podľa § 15 ods. 1 písm. f).“*
- Text prílohy č. 3, bod 6 písm. c) Pokynov: *„Zodpovedáte len za akékoľvek zníženie hodnoty tovaru v dôsledku zaobchádzania s ním iným spôsobom, aký je potrebný na zistenie povahy, vlastností a funkčnosti tovaru.“*
- Obsah zníženia hodnoty (Usmernenie EK, odd. 5.5.4): *„Zníženie hodnoty tovaru môže pozostávať najmä z nákladov na čistenie a opravu, a ak tovar už nie je možné predať ako nový, z objektívne odôvodnenej straty príjmov pre obchodníka, keď vrátený tovar predá ako použitý tovar.“*
- Meradlo „potrebného zaobchádzania“ (odôvodnenie 47 CRD cez Usmernenie EK): *„spotrebiteľ by mal s tovarom manipulovať a skontrolovať ho len takým spôsobom, akým by mu to bolo umožnené v obchode. Napríklad spotrebiteľ by mal oblečenie len vyskúšať, ale nemal by ho nosiť.“* a *„Ako dobrý referenčný bod poslúži porovnanie s tým, čo môže spotrebiteľ bežne robiť v kamennom obchode“*. Príklady z Usmernenia: audio/video – vyskúšať obraz a zvuk; *„spotrebiteľ by za bežných okolností nemohol prakticky vyskúšať domáce spotrebiče, ako sú kuchynské spotrebiče, ktorých skutočné použitie nevyhnutne zanecháva stopy“*; *„„zistenie funkčnosti“ tovaru sa … odlišuje od kontroly, či je tovar v každom ohľade bezchybný“*.
- Obal: *„Poškodenie obalu iba jeho otvorením … nie je dôvodom na kompenzáciu.“* ale *„Vrátenie tovaru bez pôvodného obalu (… ) alebo s neobvykle znehodnoteným obalom by sa mohlo považovať za znehodnotenie tovaru.“* (Usmernenie EK, odd. 5.5.4, pozn. 126: týka sa obalu, ktorý je súčasťou marketingovej prezentácie, nie prepravného obalu).
- Paušálna „manipulačná/skladová poplatok“ alebo poplatok za „použitie“ je **neprípustný**: C‑489/07 Messner – obchodník *„nemôže požadovať od spotrebiteľa kompenzačnú náhradu za použitie tovaru“* (Usmernenie EK, odd. 5.5.4); „priame náklady“ vylučujú *„akékoľvek náklady na administratívu, manipuláciu alebo opätovné uskladnenie“* (odd. 5.5.2).
- Dôkazné bremeno nesie obchodník: C‑489/07 Messner – predpis ukladajúci spotrebiteľovi dokázať, že tovar nepoužíval nad rámec potrebného, by bol v rozpore s účinnosťou práva (Usmernenie EK, odd. 5.5.4). → **dokumentácia je nevyhnutná.**

### 2.3 Čo je „zaobchádzanie potrebné na zistenie povahy, vlastností a funkčnosti“ pri našich strojoch
Usmernenie EK neobsahuje príklad stavebných strojov; nasledujúce je **analógia** podľa testu „čo by zákazník smel urobiť v predajni / na predvádzacej ploche“. **[NEISTÉ – v spore individuálne posúdenie; nie je k tomu judikatúra SK]**

| Úkon | Hodnotenie | Poznámka |
|---|---|---|
| Rozbalenie, prehliadka, kontrola príslušenstva, štítkov, sériového čísla | ÁNO – v rámci | obal otvorený nie je dôvod na náhradu |
| Doplnenie oleja/paliva podľa návodu a **krátke naštartovanie** motora (benzín/diesel), chod naprázdno, overenie otáčok, vypnutia | ÁNO – v rámci | v predajni by to predajca predviedol; pri osobnom odbere to robíme pri zaškolení |
| Krátke zapnutie vibrácie dosky/žaby **na mieste / na podložke** (pár desiatok sekúnd až niekoľko minút), test elektrocentrály krátkou záťažou (napr. pripojiť náradie), test čerpadla krátkym nasatím čistej vody | ÁNO – pravdepodobne v rámci | rozsahovo „preskúšanie funkcie“ |
| Zhutňovanie reálnej plochy (štrk, zemina, dlažba), prevádzka na stavbe, čerpanie kalnej vody/kalu, celodenné napájanie stavby | NIE – nad rámec | zanecháva stopy (opotrebovaná spodná doska, abrazívne nečistoty, motohodiny) – ako „nosenie oblečenia“ |
| Rezanie betónu/asfaltu/dlažby kotúčom (škárovačka, pílka), vrátane jedného skúšobného rezu do reálneho materiálu | NIE – spravidla nad rámec | opotrebuje diamantový kotúč, zanečistí stroj kalom; kotúč je spotrebný a nepredajný ako nový. Výnimka: ak by sme v predajni bežne dávali „skúšobný rez“ – vtedy by aj doma bol v rámci **[NEISTÉ]** |
| Ponorenie vibrátora do betónu | NIE – nad rámec | betón na hlavici, opotrebenie |
| Zmeny nastavenia, demontáž, zásahy do motora, odstránenie plomb | NIE – nad rámec | náklady na uvedenie do pôvodného stavu = zníženie hodnoty (analógia „konfigurácia softvéru“ v Usmernení) |
| Motohodiny: 0,1–0,5 h | ÁNO – zodpovedá testu | **orientačná hranica, nie zákonná** |
| Motohodiny: niekoľko hodín a viac | NIE – indikuje reálne používanie | **[NEISTÉ]** |

Odporúčanie: vo VOP a v návode „Ako si stroj vyskúšať bez rizika“ popísať odporúčaný test (napr. „naštartujte, nechajte bežať max. 10 minút, vibráciu zapnite max. 2 minúty na pevnej čistej podložke, nerežte reálny materiál“). Takýto popis **nie je podmienkou** odstúpenia, ale poučením, ktoré pomôže preukázať, čo je „nad rámec“. **[NEISTÉ – súd ho nemusí považovať za záväzný; môže však slúžiť ako dôkaz informovanosti]**

### 2.4 Výpočet a uplatnenie náhrady; zákaz jednostranného započítania
- **Výška:** rozdiel medzi hodnotou stroja pri dodaní (spravidla predajná cena) a hodnotou vráteného stroja, t. j. a) náklady na čistenie, opravu a výmenu opotrebovaných dielov (spodná doska, kotúč, filtre, olej) a/alebo b) strata pri predaji ako „použitý/predvádzací“ (napr. predaj za 80 % ceny → zníženie hodnoty 20 %) – podľa toho, čo je objektívne odôvodnené (Usmernenie EK, odd. 5.5.4). Teoreticky môže dosiahnuť až plnú cenu (zničený stroj), ale musí ísť o reálne preukázané zníženie, nie paušál. **[NEISTÉ – zákon neurčuje strop ani metódu]**
- **Zákaz jednostranného započítania – § 22 ods. 8 ZOS (presné znenie):** *„Jednostranné započítanie pohľadávok obchodníka a spotrebiteľa, ktoré vzniknú odstúpením od zmluvy podľa § 19 ods. 1, sa zakazuje.“*
  - Usmernenie EK (odd. 5.5.4) potvrdzuje, že presadzovanie náhrady je vecou národného práva; SK zákonodarca zvolil zákaz jednostranného započítania.
  - Dôsledok: **nesmieme sami znížiť refundáciu** o sumu zníženia hodnoty. Musíme vrátiť celú platbu v lehote § 22 ods. 1 a náhradu vymáhať samostatne. To isté uvádza [SEKUNDÁRNY] pravoeshopov.sk (1. 9. 2026): *„…ste povinný zákazníkovi pri odstúpení vrátiť plnú platbu a až následne si od zákazníka samostatným úkonom uplatňujte škodu“* – https://pravoeshopov.sk/vratenie-poskodeneho-tovaru-odstupenie-od-zmluvy/. Pozn.: niektoré e‑shopy a weby (napr. vzory VOP) stále uvádzajú, že obchodník môže refundáciu „znížiť“ – podľa § 22 ods. 8 ZOS je to v SK **nesprávne**.
  - **Dobrovoľná dohoda o započítaní** po odstúpení (spotrebiteľ výslovne a slobodne súhlasí, napr. podpíše/odklikne „súhlasím s odpočítaním X €“) zákon výslovne nezakazuje (zakázané je „jednostranné“). Nesmie byť vopred vo VOP ani vynútená podmienkou vrátenia peňazí. **[NEISTÉ – SOI to môže hodnotiť prísne; odporúčame najprv vrátiť plnú sumu, ak spotrebiteľ nesúhlasí]**
- **Praktický postup:**
  1. Pri prevzatí vráteného stroja: preberací protokol (fotky, video, motohodiny, sériové číslo, stav spodnej dosky/kotúča, palivo, olej), ideálne za prítomnosti dopravcu (pri zjavnom poškodení zápis do prepravného listu).
  2. Do 14 dní od doručenia oznámenia o odstúpení (resp. hneď po prijatí tovaru, ak sme refund zadržiavali podľa § 22 ods. 5) vrátiť **plnú** sumu.
  3. Súčasne/následne zaslať písomnú **výzvu na úhradu náhrady za zníženie hodnoty** s vyčíslením (faktúra/cenová ponuka opravy, porovnanie s cenou použitého stroja), fotodokumentáciou, porovnaním s výstupným protokolom; lehota na úhradu napr. 14 dní.
  4. Ponúknuť dohodu (splátky, zľava) – prípadne mimosúdne riešenie (ARS).
  5. Ak neuhradí: návrh na vydanie platobného rozkazu / žaloba (pri nízkych sumách sa oplatí zvážiť).
- **Dokumentácia pri expedícii (výstupná kontrola):** fotky stroja zo všetkých strán, foto štítku so sériovým číslom, **foto počítadla motohodín** (ak stroj nemá, zvážiť montáž lacného počítadla motohodín alebo zaznamenať stav spodnej dosky/kotúča), krátke video skúšobného chodu, protokol o skúšobnom chode (dátum, technik, dĺžka chodu, stav oleja/paliva). Zákazník dostane kópiu (napr. PDF v e‑maile). To zároveň pomáha pri reklamáciách (§ 620 OZ – domnienka vady).

### 2.5 Palivo a olej v stroji pri vrátení
- Stroj s benzínom/naftou v nádrži je pri preprave nebezpečný tovar (ADR – motory/stroje so spaľovacím motorom, UN 3528/3530, osobitné ustanovenie 363) a väčšina dopravcov vyžaduje **vypustenú nádrž**. **[NEISTÉ – overiť u dopravcu a v ADR; nie je predmetom tejto rešerše]**
- Je legitímne vo VOP **poučiť**: „Pred odoslaním vypustite palivo z nádrže (olej v motore ponechajte), zabezpečte stroj proti úniku kvapalín, zabaľte ho na paletu.“ Nesmie to byť podmienka platnosti odstúpenia. Ak stroj kvôli palivu dopravca odmietne, je to problém spotrebiteľa pri plnení povinnosti vrátiť tovar (§ 21 ods. 1); znečistenie stroja palivom/únik môže zakladať zníženie hodnoty.
- Spotrebovaný olej/palivo nemôžeme účtovať ako „použitie“ (Messner); vymenený olej po zjavne dlhšej prevádzke je súčasťou nákladov na uvedenie do pôvodného stavu **[NEISTÉ]**.

---

## 3. Vrátenie platieb

- **Lehota 14 dní** od doručenia oznámenia (§ 22 ods. 1 ZOS): *„Obchodník je povinný do 14 dní odo dňa doručenia oznámenia o odstúpení od zmluvy vrátiť spotrebiteľovi všetky platby, ktoré od neho prijal … vrátane nákladov na dopravu, dodanie, poštovné a iných nákladov a poplatkov.“*
- **Najlacnejšie doručenie** (§ 22 ods. 3 ZOS): *„Obchodník nie je povinný uhradiť spotrebiteľovi dodatočné náklady, ak si spotrebiteľ výslovne zvolil iný spôsob dodania, ako je najlacnejší bežný spôsob dodania ponúkaný obchodníkom. Dodatočnými nákladmi sa rozumie rozdiel …“* → ak ponúkame osobný odber zdarma, je „najlacnejší bežný spôsob dodania“ práve osobný odber (0 €)? **[NEISTÉ]** – výklad: osobný odber je spôsob dodania, ale pri ťažkom stroji nemusí byť pre spotrebiteľa „bežný“; bezpečnejšie je vracať najlacnejšiu ponúkanú **doručovaciu** službu pre daný stroj (napr. paletová preprava 89 €) a nevracať len príplatky (expresné doručenie, termínové doručenie, hydraulické čelo na želanie).
- **Zadržanie refundácie** (§ 22 ods. 5 ZOS): *„Obchodník nie je povinný … vrátiť spotrebiteľovi platby podľa odseku 1 pred tým, ako mu je tovar doručený, alebo kým spotrebiteľ nepreukáže zaslanie tovaru späť obchodníkovi, ibaže obchodník navrhne, že tovar vyzdvihne osobne alebo prostredníctvom ním určenej osoby.“*
  - Platí **to, čo nastane skôr** (príloha č. 3, bod 5; čl. 13 ods. 3 CRD). Doklad o odoslaní = potvrdenie etablovaného dopravcu s odosielateľom a príjemcom (Usmernenie EK, odd. 5.5.3).
  - **Nemôžeme zadržiavať peniaze „do kontroly“** alebo do posúdenia zníženia hodnoty. Usmernenie EK, odd. 5.5.3: *„…podľa článku 13 ods. 3 musí obchodník vrátiť spotrebiteľovi platbu po tom, ako mu spotrebiteľ preukáže, že tovar bol odoslaný späť.“* Kontrolu treba urobiť hneď pri prevzatí.
  - Ak tovar/doklad príde po uplynutí 14 dní, refundovať *„bez zbytočného odkladu“* (spravidla do niekoľkých pracovných dní – Usmernenie EK).
  - **Ak sami ponúkneme vyzdvihnutie**, právo zadržať refundáciu **stratíme** (§ 22 ods. 5 in fine; Usmernenie EK odd. 5.5.3).
- **Rovnaký spôsob platby** (§ 22 ods. 6 ZOS) – pri Stripe refund na tú istú kartu; iný spôsob len dohodou a bez poplatkov pre spotrebiteľa. Poukážka/kredit len so súhlasom (odôvodnenie 46 CRD).
- **Čiastočné odstúpenie** (§ 20 ods. 10 ZOS): *„Spotrebiteľ môže odstúpiť od zmluvy len vo vzťahu ku konkrétnemu produktu alebo produktom, ak obchodník … dodal alebo poskytol viacero produktov.“* + § 22 ods. 2 ZOS: platby sa vracajú *„v rozsahu zodpovedajúcom odstúpeniu“*; *„Obchodník nemôže účtovať spotrebiteľovi dodatočné náklady za dopravu, dodanie, poštovné …“* (t. j. ak vráti jednu položku a tým stratí nárok na dopravu zdarma, nemôžeme dopočítať dopravu). Či sa pri čiastočnom odstúpení vracia pomerná časť dopravy **[NEISTÉ]** – odporúčame: dopravu vracať len pri odstúpení od celej zásielky; pri čiastočnom ju nevracať ani nedoúčtovať. Darček k stroju (napr. olej zdarma) – ak sa vracia stroj, treba vrátiť aj darček, resp. jeho hodnotu, ak bol podmienený kúpou **[NEISTÉ]**.
- **Doplnkové zmluvy** (§ 20 ods. 11–13 ZOS): odstúpením zanikajú aj súvisiace zmluvy (napr. predĺžená záruka, servisný balík, zaškolenie ako platená služba).

---

## 4. Náklady na vrátenie tovaru

- **Spotrebiteľ znáša len priame náklady na vrátenie** – § 21 ods. 3 ZOS: *„… znáša spotrebiteľ len náklady na vrátenie tovaru obchodníkovi alebo osobe určenej obchodníkom na prevzatie tovaru; to neplatí, ak obchodník súhlasil, že náklady bude znášať sám, alebo ak obchodník nesplnil informačnú povinnosť podľa § 15 ods. 1 písm. g).“*
- **Informačná povinnosť** – § 15 ods. 1 písm. g) ZOS (pred uzavretím zmluvy): *„poučenie o povinnosti spotrebiteľa znášať náklady na vrátenie tovaru po odstúpení od zmluvy podľa § 19 ods. 1, a ak spotrebiteľ odstúpi od zmluvy uzavretej na diaľku, aj náklady na vrátenie tovaru, ktorý vzhľadom na jeho povahu nie je možné vrátiť prostredníctvom pošty“*.
- **Sankcia za nesplnenie** – § 15 ods. 7 ZOS: *„… spotrebiteľ nie je povinný tieto náklady alebo poplatky uhradiť a obchodník nemôže od spotrebiteľa požadovať úhradu týchto nákladov…“*
- **Príloha č. 3, bod 6 písm. b) Pokynov** (presne): *„Ak pri zmluve uzavretej na diaľku neponúkate, že budete znášať náklady na vrátenie tovaru a tovar vzhľadom na jeho povahu nemožno vrátiť poštou: „Priame náklady na vrátenie tovaru v sume ..... eur [doplňte sumu] znášate Vy.“; alebo ak náklady spojené s vrátením tovaru nemožno primerane vypočítať vopred: „Priame náklady na vrátenie tovaru znášate Vy. Predpokladaný odhad týchto nákladov je ..... eur [doplňte sumu].““*
- **Odôvodnenie 36 CRD** (Usmernenie EK, odd. 5.2): ak náklady nemožno vypočítať vopred, obchodník uvedie, že *„môžu byť vysoké, pričom by mal poskytnúť aj rozumný odhad maximálnych nákladov, ktorý by mohol byť založený na nákladoch na dodávku spotrebiteľovi.“*; *„ak je zabezpečené dodanie na adresu spotrebiteľa, aj náklady na vrátenie tovaru môžu vychádzať z nákladov na vyzdvihnutie tovaru na tejto adrese.“*
- „Priame náklady“ nezahŕňajú administratívu, manipuláciu, naskladnenie (Usmernenie EK, odd. 5.5.2).

### 4.1 Odporúčanie pre naše pásma (sumy sú **placeholder – overiť cenníkom dopravcu**)
Kuriérske balíky v SK majú obvykle limit ~31,5 kg (niektorí do 40 kg) → stroje nad tento limit „nemožno vrátiť poštou“ a musíme uviesť sumu alebo odhad. Odhad zaokrúhliť **nahor** (vyzdvihnutie u súkromnej osoby býva drahšie než rozvoz: paleta, fólia, hydraulické čelo), ale nie prehnane (neodôvodnene vysoký odhad by mohol odrádzať od odstúpenia – rozpor s odôvodnením 47 CRD) **[NEISTÉ – výška]**:

| Hmotnosť stroja (naše pásmo) | Spôsob vrátenia | Naše doručenie (placeholder) | Odporúčaný text odhadu |
|---|---|---|---|
| do 40 kg (balík) | kuriér | 9,90 € | „Priame náklady na vrátenie tovaru znášate Vy. Tovar možno vrátiť kuriérom ako balík; predpokladaný odhad týchto nákladov je **najviac 20 eur**.“ |
| 40–100 kg | kusová zásielka / paleta | 49 € | „… Predpokladaný odhad týchto nákladov je **najviac 70 eur**.“ |
| 100–300 kg | paleta + hydraulické čelo | 89 € | „… Predpokladaný odhad … **najviac 120 eur**.“ |
| nad 300 kg (do 460 kg) | paleta + hydraulické čelo / VZV | 149 € | „… Predpokladaný odhad … **najviac 200 eur**.“ |

- Odhad zobraziť **na produktovej stránke** (sekcia Doprava a vrátenie), v **pokladni pred odoslaním objednávky** a v potvrdení objednávky na trvanlivom médiu (§ 15 ods. 1 písm. g), ods. 4 a 9 ZOS – dôkazné bremeno je na nás). Technicky: pole `return_cost_estimate_cents` odvodené z prepravného pásma produktu.
- **Môžeme ponúknuť vyzdvihnutie?** Áno. Ale:
  - Ak *„obchodník navrhne, že si tovar vyzdvihne“*, spotrebiteľ nemusí tovar posielať (§ 21 ods. 1 ZOS) a **strácame právo zadržať refundáciu** (§ 22 ods. 5 ZOS).
  - Ponuka vyzdvihnutia je pre spotrebiteľa záväzná len, ak náklady nesieme my; ak ju ponúkame za poplatok, spotrebiteľ môže zvoliť lacnejší spoľahlivý spôsob (Usmernenie EK, odd. 5.5.2).
  - Odporúčanie: **neponúkať vyzdvihnutie automaticky**. Vo VOP uviesť: „Na Vašu žiadosť Vám môžeme sprostredkovať odvoz stroja naším zmluvným dopravcom za cenu podľa aktuálneho cenníka (najviac odhad uvedený vyššie); objednávateľom prepravy ste Vy.“ Či sprostredkovanie zmluvného dopravcu nebude vyložené ako „návrh vyzdvihnutia“ podľa § 22 ods. 5 **[NEISTÉ]** – dôkaz o odovzdaní dopravcovi aj tak vznikne v deň vyzdvihnutia, takže prakticky to nevadí.
  - Riziko pri spätnej preprave: smernica ho neupravuje; spotrebiteľ má postupovať s primeranou starostlivosťou (Usmernenie EK, odd. 5.5.5). **[NEISTÉ – v SK výslovne neupravené]**. Odporúčame poučiť o zabalení na paletu a pripoistení.

---

## 5. Výnimky (§ 19 ods. 1 ZOS) – čo sa týka strojov

| Výnimka | Uplatní sa na nás? |
|---|---|
| **c) „dodanie tovaru vyrobeného podľa špecifikácií spotrebiteľa alebo tovaru vyrobeného na mieru“** | **Len výnimočne.** Vykladá sa reštriktívne; tovar *„nie je prefabrikovaný a … je vyrobený na základe individuálneho výberu alebo rozhodnutia spotrebiteľa“* (čl. 2 CRD, Usmernenie EK odd. 5.11.2). **Neuplatní sa**, ak zákazník len vyberá zo štandardných možností z katalógu výrobcu (*„automobil s doplnkovým vybavením vybraný z katalógu výrobcu“* – výslovne bez výnimky). → Variant motora Honda/Hatz, šírka dosky, doska s/bez kropenia, ktorý je v katalógu NTC/Bomag = **bez výnimky**. Môže sa uplatniť pri skutočnej individuálnej úprave (napr. na želanie zákazníka namontovaný neštandardný komponent, *„ktorý sa musí zaobstarať osobitne pre túto konkrétnu objednávku a ktorý nebol súčasťou všeobecnej ponuky obchodníka“*, špeciálna úprava rámu, firemné nápisy/lak na mieru). Ak výnimka platí, platí absolútne (C‑529/19 Möbel Kraft). Pred uzavretím zmluvy musíme spotrebiteľa výslovne poučiť, že právo nemá (§ 15 ods. 1 písm. i) ZOS). |
| **Objednanie „na objednávku“ od dodávateľa (nie je skladom)** | **Nie je výnimka.** Zákon nepozná výnimku pre tovar objednaný od dodávateľa; rozhodujúce je, či je tovar prefabrikovaný/štandardný (Usmernenie EK odd. 5.11.2 – sériové stroje z katalógu sú prefabrikované). Riziko vrátenia nesieme my. |
| **f) tovar, ktorý *„vzhľadom na svoju povahu môže byť po dodaní neoddeliteľne zmiešaný s iným tovarom“*** | Stroje nie. Príklad z odôvodnenia 49 CRD = **palivo** (Usmernenie EK odd. 5.11.5). Prípadne olej/palivo predávané samostatne, ak ich zákazník naleje do stroja **[NEISTÉ]**; uzavretý kanister oleja vrátiť možno. |
| **d) rýchla skaza** | Nie (stroje skladované bežne – Usmernenie EK odd. 5.11.3). |
| **e) hygienický ochranný obal** | Nie. |
| **h) naliehavé opravy u spotrebiteľa** | Len pri servise na mieste, nie pri predaji. |
| **a) služba plne poskytnutá so súhlasom** | Ak by sme predávali **platené** zaškolenie/uvedenie do prevádzky ako samostatnú službu a poskytli ho so súhlasom a poučením pred uplynutím lehoty – po úplnom poskytnutí služby právo na odstúpenie od služby zanikne. Bezplatné zaškolenie pri odbere nie je samostatná platená služba. |

Záver: **pre bežné stroje z nášho sortimentu sa žiadna výnimka neuplatní.** Nedá sa „obísť“ ani tým, že stroj pred odoslaním testujeme (to nie je výroba na mieru).

---

## 6. § 20a – online funkcia na odstúpenie („odstúpiť od zmluvy tu“)

### 6.1 Zhrnutie požiadaviek (§ 20a ods. 1–6 ZOS, účinné od 19. 6. 2026)
1. Povinnosť zabezpečiť odstúpenie cez online rozhranie **aj** funkciou na odstúpenie; iné formy (e‑mail, list) zostávajú (ods. 1).
2. Označenie: *„odstúpiť od zmluvy tu“* alebo obdobná jednoznačná formulácia; ľahko čitateľné, **zreteľne zobrazené**, **ľahko a nepretržite dostupné** počas celej lehoty (ods. 2). Odporúčanie: odkaz v pätičke každej stránky + v účte zákazníka pri objednávke + v potvrdzujúcom e‑maile. Nevyžadovať prihlásenie (stačí číslo objednávky + e‑mail) **[NEISTÉ – zákon prihlásenie výslovne nezakazuje, ale „ľahko dostupné“ hovorí proti povinnému loginu]**.
3. Formulár, v ktorom spotrebiteľ poskytne alebo potvrdí (ods. 3):
   a) **meno a priezvisko**,
   b) **identifikačné údaje zmluvy** (číslo objednávky; voliteľne výber položiek pri čiastočnom odstúpení),
   c) **e‑mail** (alebo iný prostriedok online komunikácie) na zaslanie potvrdenia.
   Ďalšie polia (dôvod, IBAN, adresa vyzdvihnutia) len **nepovinné** – nesmú byť prekážkou odoslania.
4. Potvrdzovacie tlačidlo *„potvrdiť odstúpenie od zmluvy“* alebo obdobná jednoznačná formulácia (ods. 4).
5. Po potvrdení **bezodkladne** potvrdenie o doručení na trvanlivom médiu (e‑mail), ktoré obsahuje **oznámenie o odstúpení (jeho obsah) a dátum a čas odoslania** (ods. 5; aj § 20 ods. 9).
6. Lehota zachovaná odoslaním cez funkciu v posledný deň (ods. 6).
7. Poučenie podľa § 15 ods. 1 písm. f) musí obsahovať **informáciu o existencii a umiestnení** funkcie; v poučení podľa prílohy č. 3 doplniť text bodu 3a.
8. Pokuta za porušenie § 20a ods. 1–5: 200 € až 2 % obratu, max. 200 000 € (§ 43 ods. 1 písm. a) ZOS).

Technicky (pre náš stack): verejná stránka `/odstupenie` (dostupná aj bez prihlásenia), serverová akcia so service role → záznam do tabuľky odstúpení (timestamp, IP, obsah), e‑mail cez Resend s presným obsahom a časom; stav objednávky cez `order-state.ts`.

### 6.2 Príloha č. 2 – presné znenie (ZOS v znení účinnom od 27. 9. 2026, s. 121)

> **VZOROVÝ FORMULÁR NA ODSTÚPENIE OD ZMLUVY UZAVRETEJ NA DIAĽKU A ZMLUVY UZAVRETEJ MIMO PREVÁDZKOVÝCH PRIESTOROV OBCHODNÍKA**
>
> (Vyplňte a zašlite tento formulár, len ak si želáte odstúpiť od zmluvy uzavretej na diaľku alebo od zmluvy uzavretej mimo prevádzkových priestorov obchodníka.)
>
> – Komu [Obchodník doplní svoje obchodné meno, sídlo alebo miesto podnikania a e-mailovú adresu]: ..............
>
> – Týmto oznamujem/oznamujeme*, že odstupujem/odstupujeme* od zmluvy o dodaní alebo poskytnutí tohto produktu: ..............
>
> – Dátum objednania/dátum prijatia* ..............
>
> – Meno a priezvisko spotrebiteľa/spotrebiteľov* ..............
>
> – Adresa spotrebiteľa/spotrebiteľov* ..............
>
> – Podpis spotrebiteľa/spotrebiteľov* (ak sa tento formulár podáva v listinnej podobe) ..............
>
> – Dátum ..............
>
> \* Nehodiace sa prečiarknite.

### 6.3 Príloha č. 3 – presné znenie (s. 122–123, vrátane bodu 3a vloženého zákonom 311/2025)

> **POUČENIE O UPLATNENÍ PRÁVA SPOTREBITEĽA NA ODSTÚPENIE OD ZMLUVY UZAVRETEJ NA DIAĽKU A ZMLUVY UZAVRETEJ MIMO PREVÁDZKOVÝCH PRIESTOROV OBCHODNÍKA**
>
> **1. Právo na odstúpenie od zmluvy**
>
> Máte právo odstúpiť od tejto zmluvy bez uvedenia dôvodu v lehote ..... dní (doplňte podľa bodu 1 Pokynov na vyplnenie)
> Lehota na odstúpenie od zmluvy uplynie po ..... dňoch (doplňte podľa bodu 1 Pokynov na vyplnenie) odo dňa ............................. (doplňte podľa bodu 2 Pokynov na vyplnenie)
>
> Pri uplatnení práva na odstúpenie od zmluvy nás informujte o svojom rozhodnutí odstúpiť od tejto zmluvy jednoznačným vyhlásením (napríklad listom zaslaným poštou alebo e-mailom) na adrese: ......................................................... (doplňte podľa bodu 3 Pokynov na vyplnenie). Na tento účel môžete použiť vzorový formulár na odstúpenie od zmluvy, ktorý sme Vám odovzdali alebo zaslali, jeho použitie však nie je povinné.
>
> Doplňte text podľa bodu 3a Pokynov na vyplnenie, ak sa na Vás vzťahuje povinnosť zabezpečiť, aby spotrebiteľ mohol odstúpiť od zmluvy uzavretej na diaľku prostredníctvom online rozhrania použitím funkcie na odstúpenie od zmluvy.
> (Doplňte text podľa bodu 4 Pokynov na vyplnenie, ak umožňujete spotrebiteľom odstúpiť od zmluvy prostredníctvom svojho webového sídla.)
> Lehota na odstúpenie od zmluvy je zachovaná, ak zašlete oznámenie o uplatnení práva na odstúpenie od zmluvy pred tým, ako uplynie lehota na odstúpenie od zmluvy.
>
> **2. Dôsledky odstúpenia od zmluvy**
>
> Po odstúpení od zmluvy Vám vrátime všetky platby, ktoré ste uhradili v súvislosti s uzavretím zmluvy, vrátane nákladov na doručenie tovaru k Vám. To sa nevzťahuje na dodatočné náklady, ak ste si zvolili iný druh doručenia, ako je najlacnejší bežný spôsob doručenia, ktorý ponúkame. Platby Vám budú vrátené najneskôr do 14 dní odo dňa, keď nám bude doručené Vaše oznámenie o odstúpení od tejto zmluvy. Úhrada bude uskutočnená rovnakým spôsobom, aký ste použili pri Vašej platbe, ak ste výslovne nesúhlasili s iným spôsobom úhrady, a to bez účtovania akýchkoľvek ďalších poplatkov.
>
> (Doplňte text podľa bodu 5 Pokynov na vyplnenie, ak neponúkate vyzdvihnutie tovaru pri odstúpení spotrebiteľa od zmluvy.)
>
> (Doplňte informácie podľa bodu 6 Pokynov na vyplnenie.)
>
> (Doplňte informácie podľa bodu 7 Pokynov na vyplnenie.)
>
> **Pokyny na vyplnenie:**
>
> 1. Doplňte číslicu „14“ alebo „30“ podľa dĺžky lehoty na odstúpenie od zmluvy uzavretej na diaľku a zmluvy uzavretej mimo prevádzkových priestorov obchodníka podľa § 20 ods. 1 zákona č. 108/2024 Z. z.
>
> 2. Doplňte jeden z textov uvedených v úvodzovkách
>    a) pri zmluve o poskytnutí služby alebo pri zmluve o dodaní digitálneho obsahu inak ako na hmotnom nosiči: „uzavretia zmluvy.“;
>    b) pri zmluve o dodaní tovaru: „keď Vy alebo Vami určená tretia osoba okrem dopravcu prevezmete tovar.“;
>    c) pri dodaní viacerých tovarov Vami objednaných v jednej objednávke oddelene: „keď Vy alebo Vami určená tretia osoba okrem dopravcu prevezmete tovar, ktorý bol dodaný ako posledný.“;
>    d) pri dodaní tovaru pozostávajúceho z viacerých častí: „keď Vy alebo Vami určená tretia osoba okrem dopravcu prevezmete poslednú časť tovaru.“;
>    e) pri dodávaní tovaru opakovane počas určitého času: „keď Vy alebo Vami určená tretia osoba okrem dopravcu prevezmete prvý dodaný tovar.“.
>
> 3. Doplňte Vaše obchodné meno a sídlo alebo miesto podnikania, telefónne číslo a e-mailovú adresu.
>
>    3a. „Právo na odstúpenie od zmluvy môžete uplatniť aj online na adrese ...................... [doplňte adresu webovej stránky alebo iné vhodné vysvetlenie toho, kde sa funkcia na odstúpenie od zmluvy nachádza]. Ak využijete túto možnosť, potvrdenie o doručení odstúpenia od zmluvy vrátane jeho obsahu, dátumu a času jeho odoslania Vám bezodkladne poskytneme na trvanlivom médiu (napríklad e-mailom).“.
>
> 4. „Ak máte záujem, môžete vyplniť a zaslať vzorový formulár na odstúpenie od zmluvy alebo akékoľvek iné jednoznačné vyhlásenie o odstúpení od zmluvy aj elektronicky prostredníctvom nášho webového sídla: ...................... [doplňte adresu webovej stránky]. Ak využijete túto možnosť, prijatie odstúpenia od zmluvy Vám bezodkladne potvrdíme na trvanlivom médiu (napríklad e-mailom).“
>
> 5. „S vrátením platby môžeme čakať do vrátenia tovaru späť na našu adresu alebo do preukázania, že ste tovar odoslali späť, podľa toho, čo nastane skôr.“
>
> 6. Informujte spotrebiteľa, ako možno vrátiť tovar po odstúpení od zmluvy
>    a) doplňte spôsob vrátenia tovaru
>       – „Tovar vyzdvihneme.“ alebo
>       – „Zašlite nám tovar späť alebo ho prineste na našu adresu alebo odovzdajte ...... [ak ste na prevzatie tovaru splnomocnili určitú osobu, doplňte jej meno a adresu] najneskôr do 14 dní odo dňa uplatnenia práva na odstúpenie od zmluvy. Lehota sa považuje za zachovanú, ak tovar odošlete späť pred uplynutím 14-dňovej lehoty.“;
>    b) doplňte informáciu o úhrade nákladov na vrátenie tovaru
>       – „Náklady na vrátenie tovaru znášame my.“;
>       – „Priame náklady na vrátenie tovaru znášate Vy.“;
>       – Ak pri zmluve uzavretej na diaľku neponúkate, že budete znášať náklady na vrátenie tovaru a tovar vzhľadom na jeho povahu nemožno vrátiť poštou: „Priame náklady na vrátenie tovaru v sume ..... eur [doplňte sumu] znášate Vy.“; alebo ak náklady spojené s vrátením tovaru nemožno primerane vypočítať vopred: „Priame náklady na vrátenie tovaru znášate Vy. Predpokladaný odhad týchto nákladov je ..... eur [doplňte sumu].“; alebo
>       – Ak pri zmluve uzavretej mimo prevádzkových priestorov obchodníka nemôže byť tovar vzhľadom na jeho povahu odoslaný späť obchodníkovi poštou a bol dodaný spotrebiteľovi domov v čase uzavretia zmluvy: „Tovar vyzdvihneme na vlastné náklady.“ a
>    c) doplňte informáciu o zodpovednosti spotrebiteľa za škodu vzniknutú na vrátenom tovare: „Zodpovedáte len za akékoľvek zníženie hodnoty tovaru v dôsledku zaobchádzania s ním iným spôsobom, aký je potrebný na zistenie povahy, vlastností a funkčnosti tovaru.“.
>
> 7. Pri zmluve o poskytnutí služby doplňte: „Ak ste požiadali o začatie poskytovania služby počas lehoty na odstúpenie od zmluvy, máte povinnosť uhradiť nám cenu za skutočne poskytnuté plnenie do dňa, kedy ste nám oznámili Vaše rozhodnutie odstúpiť od tejto zmluvy.“.

(Pozn.: v konsolidovanom PDF sú prílohy 2 a 3 vložené ako obrázok/PDF – text bol extrahovaný a zalomenie riadkov upravené; slovné znenie je zachované. Pred publikáciou odporúčame vizuálnu kontrolu proti PDF s. 121–123.)

§ 15 ods. 6 ZOS: informačná povinnosť podľa § 15 ods. 1 písm. f) až h) *„sa považuje za splnenú, ak obchodník poskytne spotrebiteľovi riadne vyplnené poučenie … podľa prílohy č. 3“*. → **Odporúčame použiť vyplnený vzor doslovne** (bezpečný prístav) a naše doplňujúce pravidlá dať do samostatného článku VOP.

### 6.4 Vyplnené poučenie pre Royal stroje (návrh)
Údaje v [hranatých zátvorkách] doplniť (sídlo, telefón, URL).

> **Poučenie o uplatnení práva spotrebiteľa na odstúpenie od zmluvy uzavretej na diaľku**
>
> **1. Právo na odstúpenie od zmluvy**
>
> Máte právo odstúpiť od tejto zmluvy bez uvedenia dôvodu v lehote 14 dní.
> Lehota na odstúpenie od zmluvy uplynie po 14 dňoch odo dňa, keď Vy alebo Vami určená tretia osoba okrem dopravcu prevezmete tovar. Ak ste si v jednej objednávke objednali viac tovarov, ktoré sa dodávajú oddelene, lehota uplynie po 14 dňoch odo dňa, keď Vy alebo Vami určená tretia osoba okrem dopravcu prevezmete tovar, ktorý bol dodaný ako posledný; ak sa dodáva tovar pozostávajúci z viacerých častí, odo dňa, keď prevezmete poslednú časť tovaru.
>
> Pri uplatnení práva na odstúpenie od zmluvy nás informujte o svojom rozhodnutí odstúpiť od tejto zmluvy jednoznačným vyhlásením (napríklad listom zaslaným poštou alebo e-mailom) na adrese: Royal stroje s. r. o., [ulica a číslo], [PSČ] Boldog, tel. [+421 …], e-mail: [info@…]. Na tento účel môžete použiť vzorový formulár na odstúpenie od zmluvy, ktorý sme Vám odovzdali alebo zaslali, jeho použitie však nie je povinné.
>
> Právo na odstúpenie od zmluvy môžete uplatniť aj online na adrese [https://…/odstupenie] (odkaz „Odstúpiť od zmluvy tu“ nájdete v pätičke každej stránky e-shopu a pri objednávke vo Vašom účte). Ak využijete túto možnosť, potvrdenie o doručení odstúpenia od zmluvy vrátane jeho obsahu, dátumu a času jeho odoslania Vám bezodkladne poskytneme na trvanlivom médiu (napríklad e-mailom).
>
> Lehota na odstúpenie od zmluvy je zachovaná, ak zašlete oznámenie o uplatnení práva na odstúpenie od zmluvy pred tým, ako uplynie lehota na odstúpenie od zmluvy.
>
> **2. Dôsledky odstúpenia od zmluvy**
>
> Po odstúpení od zmluvy Vám vrátime všetky platby, ktoré ste uhradili v súvislosti s uzavretím zmluvy, vrátane nákladov na doručenie tovaru k Vám. To sa nevzťahuje na dodatočné náklady, ak ste si zvolili iný druh doručenia, ako je najlacnejší bežný spôsob doručenia, ktorý ponúkame. Platby Vám budú vrátené najneskôr do 14 dní odo dňa, keď nám bude doručené Vaše oznámenie o odstúpení od tejto zmluvy. Úhrada bude uskutočnená rovnakým spôsobom, aký ste použili pri Vašej platbe, ak ste výslovne nesúhlasili s iným spôsobom úhrady, a to bez účtovania akýchkoľvek ďalších poplatkov.
>
> S vrátením platby môžeme čakať do vrátenia tovaru späť na našu adresu alebo do preukázania, že ste tovar odoslali späť, podľa toho, čo nastane skôr.
>
> Zašlite nám tovar späť alebo ho prineste na našu adresu Royal stroje s. r. o., [ulica a číslo], [PSČ] Boldog najneskôr do 14 dní odo dňa uplatnenia práva na odstúpenie od zmluvy. Lehota sa považuje za zachovanú, ak tovar odošlete späť pred uplynutím 14-dňovej lehoty.
>
> Priame náklady na vrátenie tovaru znášate Vy. Tovar, ktorý vzhľadom na jeho hmotnosť nemožno vrátiť poštou ani bežnou balíkovou zásielkou, je potrebné vrátiť paletovou prepravou. Predpokladaný odhad týchto nákladov je uvedený pri každom tovare a v potvrdení objednávky (pre tento tovar: [X] eur).
>
> Zodpovedáte len za akékoľvek zníženie hodnoty tovaru v dôsledku zaobchádzania s ním iným spôsobom, aký je potrebný na zistenie povahy, vlastností a funkčnosti tovaru.

Pozn.: posledná veta o odhade odchyľuje vzor tým, že odkazuje na sumu pri produkte. Keďže suma závisí od stroja, v potvrdení objednávky (e‑mail/PDF) generovať poučenie **s konkrétnou sumou za daný stroj** (najvyššia suma pri viacerých strojoch). **[NEISTÉ – či odkaz na produktovú stránku postačuje; konkrétna suma v potvrdení je bezpečná]**

---

## 7. Odstúpenie vs. reklamácia (zodpovednosť za vady) – vysvetlenie pre laika

| | **Odstúpenie od zmluvy (14 dní)** | **Reklamácia (zodpovednosť za vady)** |
|---|---|---|
| Na čo slúži | „Rozmyslel som si to“ – kúpa cez internet bez možnosti vidieť stroj | „Stroj je chybný“ – vada, ktorú mal stroj už pri dodaní |
| Kto | len spotrebiteľ, len zmluva na diaľku | každý kupujúci (spotrebiteľ podľa OZ, firma podľa ObZ) |
| Dôvod | netreba | musí existovať vada (§ 618 OZ) |
| Lehota | 14 dní od prevzatia | 2 roky od dodania (§ 619 ods. 1 OZ); vadu vytknúť do 2 mesiacov od zistenia (§ 621 ods. 3 OZ) |
| Stav tovaru | môže byť aj použitý/poškodený – právo trvá, ale spotrebiteľ **platí zníženie hodnoty** (§ 21 ods. 4 ZOS) | poškodenie spôsobené zákazníkom (zlé zaobchádzanie, nesprávne palivo, prevádzka bez oleja, pád) **nie je vada** → reklamácia sa zamietne |
| Dôkaz | odstúpenie dokazuje spotrebiteľ; zníženie hodnoty dokazuje obchodník | vada, ktorá sa prejaví do 2 rokov, sa **predpokladá** už pri dodaní; obchodník musí dokázať opak (napr. nesprávne zaobchádzanie) (§ 620 ods. 1 OZ) |
| Výsledok | zmluva zaniká, peniaze späť (mínus prípadná náhrada za zníženie hodnoty vymáhaná zvlášť) | oprava/výmena, zľava, alebo odstúpenie (§ 621 ods. 1 OZ) |

**Príklad vlastníka:** zákazník 13 dní stroj používa na stavbe a z nedbanlivosti ho poškodí (napr. prevádzka bez oleja → zadretý motor), 14. deň odstúpi.
- **Odstúpenie platí** (je v lehote, dôvod netreba). Musíme mu vrátiť celú cenu (po prijatí stroja alebo dokladu o odoslaní).
- Zároveň máme **nárok na náhradu za zníženie hodnoty** – v tomto prípade náklady na opravu motora + strata pri predaji ako použitý stroj, potenciálne až do výšky ceny, ak je stroj zničený. Musíme ho preukázať a vymáhať **samostatne** (nesmieme si ho sami strhnúť z refundácie – § 22 ods. 8 ZOS).
- Ak by namiesto odstúpenia **reklamoval** „zadretý motor“ – reklamáciu zamietneme na základe posudku (vada spôsobená zákazníkom, nie výrobná), podľa reklamačného poriadku (iná rešerš).
- Ak nesplníme poučovaciu povinnosť, spotrebiteľ za zníženie hodnoty **nezodpovedá vôbec** a lehota sa predĺži o 12 mesiacov (§ 20 ods. 3, § 21 ods. 4 ZOS) – najhorší scenár.

---

## 8. B2B (firmy, SZČO na IČO)

- Zákonné právo na odstúpenie bez dôvodu **neexistuje** (ZOS sa vzťahuje len na spotrebiteľov; B2B kúpa sa riadi Obchodným zákonníkom – odstúpenie len pri podstatnom porušení zmluvy alebo ak to zmluva/VOP dojednajú; zmluvná voľnosť) **[overiť konkrétne § ObZ v rešerši pre B2B]**.
- Odporúčaná politika (dobrovoľná, len zmluvná, výslovne vo VOP v časti pre podnikateľov):
  - **Bez zákonného odstúpenia.** Prípadne goodwill „14 dní na vrátenie **nepoužitého** stroja v pôvodnom obale“ – tu podmienku nepoužitosti stanoviť **môžeme** (nejde o spotrebiteľa).
  - **Storno/manipulačný poplatok** napr. 10–15 % z ceny (min. X €), náklady na vrátenie a dopravu tam aj späť znáša kupujúci; vrátenie len po kontrole stroja (motohodiny ≤ 0,5 h, bez stôp práce); refundácia do 14 dní od kontroly; možnosť započítania nákladov a zníženia hodnoty (v B2B zákaz § 22 ods. 8 ZOS neplatí).
  - Zákazkové/objednané stroje (mimo skladu) vylúčiť z goodwill vrátenia.
  - Uviesť, že ide o dobrovoľnú výhodu, na ktorú nie je právny nárok, a ktorú možno kedykoľvek zmeniť pre budúce objednávky.

---

## 9. VERDIKT k stanovisku majiteľa (pre laika)

> *„Peniaze vrátime, ak tovar vrátia do 14 dní nepoužitý a nepoškodený. Ak výrobok použije a potom ho chce vrátiť, nemá to byť možné. Ak ho 13 dní používal a z nedbanlivosti/nesprávnym používaním ho poškodil, odstúpenie ani reklamácia sa neuplatní.“*

**Čo je v poriadku:**
- ÁNO – Pri **firmách a živnostníkoch nakupujúcich na IČO pre podnikanie** môžete pravidlo „len nepoužité“ uplatniť v plnom rozsahu (zákonné odstúpenie nemajú).
- ÁNO – **Reklamácia** poškodenia spôsobeného zákazníkom (nedbanlivosť, nesprávne použitie) je skutočne vylúčená – nie je to vada, za ktorú zodpovedáte. Musíte to však vedieť preukázať (posudok, fotky, protokol).
- ÁNO – Spotrebiteľ, ktorý stroj reálne používal alebo poškodil, **vám musí zaplatiť zníženie hodnoty** (oprava, čistenie, strata pri predaji ako použitý) – môže to byť aj veľmi vysoká suma.

**Čo NIE je v súlade so zákonom:**
- NIE – U **spotrebiteľa** nemôžete odstúpenie podmieniť tým, že stroj je nepoužitý, nepoškodený alebo v originálnom obale. Spotrebiteľ môže odstúpiť **vždy** do 14 dní od prevzatia, aj keď stroj používal alebo poškodil (§ 19 ods. 1, § 21 ods. 4 a 6 ZOS; odôvodnenie 47 CRD). Taká klauzula vo VOP je neplatná a hrozí pokuta až 200 000 €.
- NIE – Nemôžete odmietnuť vrátiť peniaze ani si sami **strhnúť** náhradu z vrátenej sumy (§ 22 ods. 8 ZOS – zákaz jednostranného započítania). Najprv vrátite celú sumu, potom vymáhate náhradu.
- NIE – Nemôžete čakať s vrátením peňazí „kým stroj skontrolujeme“ – len kým stroj dorazí **alebo** zákazník ukáže doklad o odoslaní (čo nastane skôr) (§ 22 ods. 5 ZOS).
- NIE – Paušálne „storno/manipulačné poplatky“ alebo poplatok za „použitie“ u spotrebiteľa nie sú dovolené (Messner, § 21 ods. 6 ZOS).

**Čo môžete urobiť na svoju ochranu (odporúčaný balík):**
1. **Riadne poučenie** (vyplnená príloha č. 3 doslovne + vzorový formulár + tlačidlo „Odstúpiť od zmluvy tu“) – bez neho strácate nárok na náhradu a lehota sa predĺži o rok.
2. **Výstupný protokol** pri každom stroji: fotky, sériové číslo, **foto počítadla motohodín**, video skúšobného chodu, stav spodnej dosky/kotúča, stav paliva/oleja; kópia zákazníkovi. Zvážiť počítadlá motohodín na strojoch, ktoré ich nemajú.
3. **Vstupný protokol** pri vrátení (rovnaké body + zápis s dopravcom pri zjavnom poškodení).
4. **Návod „ako si stroj vyskúšať“** vo VOP aj v balení (krátke naštartovanie, krátka vibrácia na podložke, žiadne rezanie/hutnenie reálneho materiálu) – pomáha dokázať, že reálne používanie bolo „nad rámec“.
5. **Priame náklady na vrátenie platí zákazník** – ale len ak ich vopred uvediete (suma/odhad pri každom stroji, v pokladni a v potvrdení). Pri 300–460 kg stroji je to 150–200 €, čo prirodzene odrádza od „požičania si“ stroja na 14 dní.
6. **Vyzdvihnutie strojom neponúkajte automaticky** (inak strácate právo zadržať peniaze); ponúknite len sprostredkovanie dopravcu na náklady zákazníka.
7. **Pri osobnom odbere** urobte so zákazníkom skúšobný chod a zaškolenie a dajte to podpísať – zákazník tým „zistil vlastnosti a funkčnosť“ priamo u vás, a neskoršie reálne používanie je ľahšie označiť za „nad rámec“. **[NEISTÉ – posilňuje argument, ale právo odstúpiť nezaniká]**
8. **Rozlišujte B2B a B2C** v pokladni (vyhlásenie o nákupe na podnikanie) – pre firmy platí prísnejšia dobrovoľná politika.
9. **Náhradu vymáhajte samostatne** (výzva s vyčíslením a dôkazmi → dohoda → platobný rozkaz). Dobrovoľnú dohodu o započítaní uzatvárajte až po odstúpení, nikdy ako podmienku vrátenia peňazí.
10. **Výnimka „tovar na mieru“** len pri skutočnej individuálnej úprave mimo katalógu – a vtedy výslovne poučiť pred objednávkou, že odstúpenie nie je možné.

---

## 10. Návrh článku VOP – „Odstúpenie od zmluvy“ (B2C + B2B)

> **Článok X – Odstúpenie od zmluvy**
>
> **X.1 Kto má právo odstúpiť.** Kupujúci, ktorý je spotrebiteľom (fyzická osoba, ktorá pri kúpe nekoná v rámci svojej podnikateľskej činnosti alebo povolania), má právo odstúpiť od kúpnej zmluvy uzavretej prostredníctvom e-shopu (zmluvy uzavretej na diaľku) bez uvedenia dôvodu v lehote 14 dní podľa § 19 a nasl. zákona č. 108/2024 Z. z. Podrobnosti sú uvedené v Poučení o uplatnení práva spotrebiteľa na odstúpenie od zmluvy (Príloha č. 1 týchto VOP), ktoré je súčasťou zmluvy. Kupujúci, ktorý nakupuje ako podnikateľ (najmä na IČO v rámci svojej podnikateľskej činnosti), toto zákonné právo nemá; pre neho platí bod X.10.
>
> **X.2 Lehota.** Lehota 14 dní začína plynúť dňom nasledujúcim po dni, keď spotrebiteľ alebo ním určená tretia osoba okrem dopravcu prevezme tovar; ak sa tovar z jednej objednávky dodáva vo viacerých zásielkach alebo pozostáva z viacerých častí, odo dňa prevzatia poslednej zásielky alebo časti. Spotrebiteľ môže odstúpiť aj pred prevzatím tovaru. Lehota je zachovaná, ak spotrebiteľ odošle oznámenie o odstúpení najneskôr v posledný deň lehoty.
>
> **X.3 Ako odstúpiť.** Spotrebiteľ môže odstúpiť (a) online prostredníctvom funkcie „Odstúpiť od zmluvy tu“ dostupnej na [URL] a v pätičke každej stránky e-shopu, (b) e-mailom na [e-mail], alebo (c) listom na adresu Royal stroje s. r. o., [adresa], Boldog. Môže použiť vzorový formulár (Príloha č. 2), jeho použitie však nie je povinné; postačuje akékoľvek jednoznačné vyhlásenie. Uvedenie dôvodu sa nevyžaduje. Prijatie odstúpenia potvrdíme bezodkladne e-mailom; pri online odstúpení potvrdenie obsahuje obsah oznámenia a dátum a čas jeho odoslania.
>
> **X.4 Vrátenie tovaru.** Spotrebiteľ je povinný do 14 dní odo dňa odstúpenia tovar zaslať späť alebo ho odovzdať na adrese prevádzky v Boldogu. Lehota je zachovaná, ak tovar odošle najneskôr v posledný deň lehoty. Odporúčame tovar vrátiť kompletný (vrátane príslušenstva, návodu a dokladov), pokiaľ možno v pôvodnom obale, zabalený a upevnený na palete tak, aby sa pri preprave nepoškodil. **Pred odoslaním stroja so spaľovacím motorom vypustite palivo z nádrže** (prepravcovia stroje s palivom spravidla neprevezmú); stroj zabezpečte proti úniku prevádzkových kvapalín. Tieto odporúčania nie sú podmienkou platnosti odstúpenia.
>
> **X.5 Náklady na vrátenie.** Priame náklady na vrátenie tovaru znáša spotrebiteľ. Stroje, ktoré vzhľadom na hmotnosť nemožno vrátiť poštou ani bežnou balíkovou zásielkou, je potrebné vrátiť paletovou prepravou; predpokladaný odhad nákladov na ich vrátenie je uvedený pri každom stroji v e-shope, v súhrne objednávky a v potvrdení objednávky. Na žiadosť spotrebiteľa mu môžeme sprostredkovať objednanie prepravy u nášho zmluvného dopravcu; cenu prepravy v takom prípade hradí spotrebiteľ, najviac vo výške uvedeného odhadu.
>
> **X.6 Vrátenie platieb.** Všetky prijaté platby vrátane nákladov na doručenie (okrem dodatočných nákladov, ak si spotrebiteľ zvolil iný ako najlacnejší bežný spôsob doručenia, ktorý ponúkame) vrátime najneskôr do 14 dní odo dňa doručenia oznámenia o odstúpení, rovnakým spôsobom, aký spotrebiteľ použil pri platbe (pri platbe kartou na tú istú kartu), bez akýchkoľvek poplatkov. S vrátením platby môžeme počkať do vrátenia tovaru späť na našu adresu alebo do preukázania, že spotrebiteľ tovar odoslal späť, podľa toho, čo nastane skôr. Ak spotrebiteľ odstúpi len od časti objednávky, vrátime platby v rozsahu zodpovedajúcom odstúpeniu.
>
> **X.7 Vyskúšanie tovaru a zníženie hodnoty.** Spotrebiteľ si môže tovar prezrieť a vyskúšať v rozsahu potrebnom na zistenie jeho povahy, vlastností a funkčnosti, teda tak, ako by si ho mohol vyskúšať v predajni. Pri strojoch to spravidla znamená: rozbaliť a prezrieť stroj, doplniť prevádzkové kvapaliny podľa návodu, krátko naštartovať motor, krátko zapnúť vibráciu alebo pracovnú funkciu na čistej pevnej podložke a overiť ovládacie prvky. Za zaobchádzanie nad tento rámec považujeme najmä použitie stroja na reálnu prácu (hutnenie zeminy či štrku, rezanie betónu, asfaltu alebo dlažby, čerpanie kalnej vody, napájanie stavby), dlhší chod motora, zásahy do nastavení a konštrukcie a znečistenie stroja. Spotrebiteľ zodpovedá len za zníženie hodnoty tovaru, ktoré vzniklo v dôsledku zaobchádzania s ním iným spôsobom, aký je potrebný na zistenie povahy, vlastností a funkčnosti tovaru (§ 21 ods. 4 zákona č. 108/2024 Z. z.). Zníženie hodnoty zahŕňa najmä primerané náklady na čistenie, opravu a výmenu opotrebovaných dielov a objektívne odôvodnený rozdiel medzi cenou nového a použitého stroja. Odstúpenie od zmluvy tým nie je dotknuté.
>
> **X.8 Dokumentácia a uplatnenie náhrady.** Každý stroj pred odoslaním skúšobne spustíme a jeho stav (sériové číslo, stav počítadla motohodín, ak ho stroj má, fotografie, záznam zo skúšobného chodu) zaznamenáme do výstupného protokolu, ktorého kópiu dostane kupujúci. Rovnako zdokumentujeme stav vráteného tovaru pri jeho prevzatí. Ak zistíme zníženie hodnoty podľa bodu X.7, spotrebiteľovi napriek tomu vrátime platby v plnej výške v lehote podľa bodu X.6 a nárok na náhradu zníženia hodnoty mu oznámime samostatne písomne s vyčíslením a podkladmi. Jednostranné započítanie nárokov vzniknutých odstúpením od zmluvy nevykonávame.
>
> **X.9 Výnimky.** Spotrebiteľ nemôže odstúpiť od zmluvy, ktorej predmetom je dodanie tovaru vyrobeného podľa jeho špecifikácií alebo na mieru (§ 19 ods. 1 písm. c) zákona č. 108/2024 Z. z.), napríklad stroja s individuálnou úpravou mimo našej štandardnej ponuky dohodnutou na jeho žiadosť. Na túto skutočnosť spotrebiteľa výslovne upozorníme pred uzavretím takej zmluvy. Výber stroja alebo jeho variantu zo štandardnej ponuky (aj keď ho objednávame u dodávateľa až na základe objednávky) nie je výnimkou a právo na odstúpenie zostáva zachované.
>
> **X.10 Kupujúci – podnikatelia.** Kupujúci, ktorý nie je spotrebiteľom, nemá zákonné právo odstúpiť od zmluvy bez uvedenia dôvodu. Bez právneho nároku mu môžeme na základe jeho žiadosti doručenej do 14 dní od prevzatia umožniť vrátenie tovaru, ak je tovar nepoužitý (stav počítadla motohodín najviac [0,5] h nad stavom vo výstupnom protokole, bez stôp práce), kompletný a v pôvodnom obale. V takom prípade znáša kupujúci náklady na dopravu tovaru k nemu aj späť a manipulačný poplatok vo výške [10] % z ceny tovaru, najmenej [50] eur, ktorý sme oprávnení započítať voči vracanej sume. Kúpnu cenu vrátime do 14 dní od prevzatia a kontroly tovaru. Táto možnosť sa nevzťahuje na tovar objednávaný na želanie kupujúceho mimo skladových zásob.
>
> **X.11 Vzťah k reklamácii.** Odstúpením od zmluvy nie sú dotknuté práva zo zodpovednosti za vady podľa Reklamačného poriadku. Poškodenie spôsobené nesprávnym zaobchádzaním, nedodržaním návodu, prevádzkou bez oleja alebo s nesprávnym palivom, mechanickým poškodením a bežným opotrebovaním nie je vadou, za ktorú zodpovedáme.

Prílohy VOP: **Príloha č. 1** = vyplnené poučenie (bod 6.4), **Príloha č. 2** = vzorový formulár (bod 6.2) s doplneným „Komu: Royal stroje s. r. o., [sídlo], [e-mail]“.

**Pozn. k X.7:** pozor, aby sa formulácia nečítala ako podmienka; preto veta „Odstúpenie od zmluvy tým nie je dotknuté.“ **Pozn. k X.10:** výška poplatku a hranice motohodín sú obchodné rozhodnutia.

---

## Zoznam [NEISTÉ] bodov na overenie advokátom
1. Dvojúčelové nákupy SZČO – vyhlásenie v pokladni ako dôkaz.
2. Hranice „potrebného zaobchádzania“ pri strojoch (motohodiny, skúšobný rez) – bez SK judikatúry.
3. Dobrovoľná dohoda o započítaní po odstúpení vs. § 22 ods. 8 ZOS.
4. Metóda a strop výpočtu zníženia hodnoty.
5. „Najlacnejší bežný spôsob dodania“ pri ponuke bezplatného osobného odberu.
6. Pomerné vrátenie dopravy pri čiastočnom odstúpení.
7. Sprostredkovanie spätnej prepravy vs. „návrh vyzdvihnutia“ (§ 22 ods. 5).
8. Výška odhadov spätnej prepravy (overiť cenník dopravcu) a odkaz na sumu pri produkte namiesto sumy priamo v poučení.
9. ADR pravidlá pre stroje s palivom; riziko pri spätnej preprave.
10. Povinné prihlásenie pri funkcii § 20a (odporúčame bez prihlásenia).

## Sekundárne zdroje
- [SEKUNDÁRNY] pravoeshopov.sk, „Vrátenie poškodeného tovaru pri odstúpení od zmluvy“ (1. 9. 2026): https://pravoeshopov.sk/vratenie-poskodeneho-tovaru-odstupenie-od-zmluvy/
- [SEKUNDÁRNY] zakonypreludi.sk – zrkadlo OZ (§ 52, § 53 ods. 4 písm. m)), konsolidácia 31. 7. 2026: https://www.zakonypreludi.sk/zz/1964-40 (overené aj proti Slov-Lex PDF OZ 20260731).
