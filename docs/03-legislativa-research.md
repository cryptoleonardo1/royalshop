# 03 – Legislatívny research pre e-shop (SK, stav k 9. 10. 2026)

> **Aktualizované 23. 10. 2026:** novší výskum pre súčasný model (Unicon CZ, Gölz DE, výdaj v Boldogu, bez akumulátorového náradia) a podklady k právnym stránkam sú v `docs/06-pravne-stranky.md`. Kde sa líšia, platí 06.

> **Účel:** podklad na zostavenie VOP, reklamačného poriadku, zásad ochrany osobných údajov a cookies a na technickú implementáciu. **Nejde o právne poradenstvo.** Všetko treba nechať skontrolovať advokátom. Miesta s neistotou sú označené **[NEISTÉ]**.
>
> **Metodika:** Kľúčové ustanovenia som overil priamo v **znení zo Zbierky zákonov (PDF zo Slov-Lexu)**: zákon 108/2024 Z. z. v konsolidovanom znení účinnom od 27. 9. 2026, zákony 310/2025 a 311/2025 Z. z., 384/2025 Z. z., 222/2004 Z. z. (znenia z 1. 1. 2026 a z 1. 1. 2027) a 79/2015 Z. z. (znenie z 1. 1. 2026). Ostatné body pochádzajú zo sekundárnych zdrojov a sú tak aj označené.

**Profil prípadu:** s.r.o., platiteľ DPH od 1. dňa. Predaj drahého náradia a strojov (Makita od Makita s.r.o. SK a tovar od CZ partnera ntc.cz). Model: platba vopred (Stripe, teda karta, Apple Pay a Google Pay, alebo bankový prevod) → nákup u dodávateľa → príjem v Senci → test, prebalenie a vyplnenie záručného listu → kuriér alebo osobný odber v Senci. Predaj B2C aj B2B, iba na Slovensku.

---

## 1. Nové povinnosti od 19. 6. 2026 a ďalšie zmeny v roku 2026

### 1.1 Funkcia na odstúpenie od zmluvy („tlačidlo“)

**Právny základ:** smernicu (EÚ) 2023/2673 transponoval **zákon č. 311/2025 Z. z.** o ochrane spotrebiteľa pri finančných službách na diaľku. Jeho **Čl. III** novelizuje zákon 108/2024 Z. z. Nový je **§ 20a zákona 108/2024**, ďalej je doplnený **§ 15 ods. 1 písm. f)**, prechodné ustanovenie **§ 53b** a v **prílohe č. 3** pribudol nový bod 3a. Zákon je **účinný od 19. 6. 2026** a vzťahuje sa na zmluvy uzavreté online **po 18. 6. 2026** (§ 53b).

**Presné požiadavky § 20a:**

| Prvok | Čo hovorí zákon | Implementácia |
|---|---|---|
| Prvé tlačidlo (ods. 2) | Musí byť označené ľahko čitateľne slovami **„odstúpiť od zmluvy tu“** alebo jednoznačnou obdobnou formuláciou. | Text tlačidla/odkazu: „Odstúpiť od zmluvy tu“ |
| Umiestnenie (ods. 2) | „V online rozhraní **zreteľne zobrazená**, ľahko a **nepretržite dostupná** počas plynutia lehoty na odstúpenie.“ | Odkaz v pätičke každej stránky, v e-maile s potvrdením objednávky aj doručenia, v detaile objednávky v účte a v „Moje objednávky“. Nie iba vo VOP. |
| Údaje (ods. 3) | Spotrebiteľ „poskytne alebo potvrdí“: a) meno a priezvisko, b) identifikačné údaje zmluvy, c) e-mail alebo iný online kontakt na zaslanie potvrdenia. | Povinné polia iba tieto tri. Ďalšie polia (dôvod, IBAN, výber položiek) majú byť **voliteľné**. Zákon nepovoľuje ďalšie povinné údaje. **[NEISTÉ: či je výber položiek pri čiastočnom odstúpení (§ 20 ods. 10) prípustný ako povinný – odporúčam voliteľný s predvolenou možnosťou „celá objednávka“]** |
| Druhé tlačidlo (ods. 4) | Odoslanie cez osobitnú funkciu označenú **„potvrdiť odstúpenie od zmluvy“** alebo obdobne. | Druhý krok s tlačidlom „Potvrdiť odstúpenie od zmluvy“ |
| Potvrdenie (ods. 5) | **Bezodkladne**, na **trvanlivom médiu**. Musí obsahovať **obsah oznámenia o odstúpení** a **dátum a čas jeho odoslania**. | Automatický e-mail hneď po odoslaní: kópia všetkých údajov, časová pečiatka (dátum aj čas) a číslo objednávky. Záznam uložiť v DB. |
| Zachovanie lehoty (ods. 6) | Lehota je zachovaná, ak spotrebiteľ odošle oznámenie najneskôr v posledný deň. | Rozhoduje časová pečiatka odoslania, nie spracovanie. |
| Pomer k iným spôsobom (ods. 1) | „§ 20 ods. 6 tým nie je dotknutý“ | Odstúpenie listom, e-mailom alebo vzorovým formulárom musí naďalej fungovať. |

**Prihlásenie:** zákon prihlásenie výslovne nezakazuje, no funkcia musí byť „ľahko a nepretržite dostupná“. Recitál 37 smernice uvádza, že prihlásený spotrebiteľ nemá znovu zadávať identifikáciu a nemá byť nútený napr. sťahovať aplikáciu. **Odporúčanie:** žiadna povinná registrácia ani prihlásenie. Hosťovský formulár (číslo objednávky + e-mail) s predvyplnením pre prihlásených. **[NEISTÉ: či vôbec možno vyžadovať login, ak bola objednávka vytvorená z účtu – odporúčam nie]**

**Obdobie dostupnosti:** 14 dní od prevzatia tovaru (§ 20 ods. 1). Ak by chýbalo poučenie, až 12 mesiacov po uplynutí lehoty (§ 20 ods. 3). Prakticky funkciu ponechať **trvalo** a systém nech posúdi, či lehota uplynula. Aj oneskorené odstúpenie treba prijať a potvrdiť a vybaviť ho ručne.

**Informačná povinnosť:** do poučenia o odstúpení (VOP, predzmluvné informácie, potvrdenie objednávky) treba doplniť **existenciu a umiestnenie funkcie** (§ 15 ods. 1 písm. f) a text bodu 3a prílohy č. 3: „Právo na odstúpenie od zmluvy môžete uplatniť aj online na adrese …. Ak využijete túto možnosť, potvrdenie o doručení odstúpenia od zmluvy vrátane jeho obsahu, dátumu a času jeho odoslania Vám bezodkladne poskytneme na trvanlivom médiu (napríklad e-mailom).“

**B2B:** § 20a sa vzťahuje iba na **spotrebiteľov**. Podnikateľ zákonné právo na odstúpenie nemá. Odporúčanie: funkciu nechať dostupnú pre všetkých a vo VOP B2B uviesť, že pre podnikateľov neplatí, prípadne poskytnúť dobrovoľné odstúpenie. Dozor vykonáva SOI (§ 26 ods. 3 v znení 311/2025).

*Zdroje:* [311/2025 Z. z. – PDF Slov-Lex](https://static.slov-lex.sk/pdf/SK/ZZ/2025/311/ZZ_2025_311_20260619.pdf) · [108/2024 konsolidované od 27. 9. 2026](https://static.slov-lex.sk/pdf/SK/ZZ/2024/108/ZZ_2024_108_20260927.pdf) · [Smernica 2023/2673 (EUR-Lex)](https://eur-lex.europa.eu/eli/dir/2023/2673/oj/eng) · [Liday Bašaryová & Partners](https://www.lidaybasaryova.sk/en/funkcia-na-odstupenie-od-zmluvy-nova-povinnost-e-shopov/) · [pravoeshopov.sk](https://pravoeshopov.sk/tlacidlo-na-odstupenie-od-zmluvy-nove-povinnosti-eshopov-od-19-06-2026/)

### 1.2 Ďalšie zmeny 2026 (časová os)

| Dátum | Predpis | Čo musí e-shop konkrétne urobiť |
|---|---|---|
| **1. 1. 2026** | 310/2025 (časť) | § 7 ods. 1: zľavu **počítať** od predchádzajúcej (najnižšej 30-dňovej) ceny, nielen ju uviesť. § 9 ods. 12: obchodník musí vedieť **preukázať pravdivosť** tvrdení v reklame. Lehota na opravu alebo výmenu najviac **30 dní** od vytknutia vady (OZ § 623, Čl. II bod 7). Odkaz na platformu ODR sa vypúšťa, platforma bola zrušená 20. 7. 2025, takže **vo VOP ju neuvádzať**. |
| 1. 1. 2026 / 1. 5. 2026 | 384/2025 (nový zákon o evidencii tržieb) | Pozri časť 8. Od 1. 5. 2026 platí povinnosť umožniť bezhotovostnú platbu nad 1 € tam, kde sa eviduje tržba. |
| **19. 6. 2026** | 311/2025 | Funkcia na odstúpenie (1.1). Zvyšok zákona sa týka finančných služieb na diaľku, e-shopu sa netýka, ak sám neposkytuje finančné služby. |
| **31. 7. 2026** | 310/2025 Čl. II (právo na opravu, smernica 2024/1799) | Nový **§ 619 ods. 4 OZ**: po **prvej oprave** sa doba zodpovednosti za vady **predlžuje o 12 mesiacov** (len raz). Nový **§ 623 ods. 2 OZ**: **pred odstránením vady informovať kupujúceho o práve vybrať si opravu alebo výmenu** a o tomto predĺžení. Možnosť poskytnúť renovovanú vec pri výmene (na žiadosť) a bezplatnú náhradnú vec počas opravy. Nový § 618 ods. 2 o použitých veciach. Nové § 13a a 13b zákona 108/2024 (európsky formulár o oprave, povinnosť výrobcu opraviť) zaťažujú hlavne opravovne a výrobcov. |
| **12. 8. 2026** | Nariadenie (EÚ) 2025/40 (PPWR) | Začína sa uplatňovať nariadenie o obaloch. Prísne pravidlá pre e-commerce obaly (prázdny priestor najviac 50 %) platia až od 2030. Teraz treba zaistiť registráciu výrobcu obalov (časť 7). **[NEISTÉ – detaily treba overiť s OZV]** |
| **27. 9. 2026** | 310/2025 (smernica 2024/825 „Empowering consumers“) | Pozri ďalej. |
| **20. 11. 2026** | 312/2025 Z. z. o spotrebiteľských úveroch | Ak sa ponúkajú splátky alebo „kúp teraz, zaplať neskôr“ (napr. Klarna cez Stripe), ide spravidla o spotrebiteľský úver. Reklama potom musí obsahovať varovanie, povinný je poskytovateľ s licenciou NBS. Bezúročný odklad priamo od predajcu na krátky čas zostáva mimo zákona. |
| **1. 1. 2027** | 385/2025 (novela DPH) | Povinná **e-faktúra (Peppol)** v domácom B2B vrátane faktúr k prijatej platbe (časť 6). |

**27. 9. 2026 – zmeny podľa smernice 2024/825, ktoré musí e-shop implementovať:**

- **Harmonizované oznámenie o zákonnej zodpovednosti za vady** (§ 5 ods. 1 písm. f), vykonávacie nariadenie (EÚ) 2025/1960). Ide o oficiálnu grafiku s QR kódom, ktorá sa **nesmie upravovať** a online musí byť **farebná**. Musí byť zobrazená pred odoslaním objednávky. Odporúčanie: produktová stránka (pri cene alebo záruke), košík a checkout, pätička. Text vo VOP ju nenahrádza.
- **Harmonizované označenie „GARAN“** (§ 5 ods. 1 písm. g) sa vyžaduje, iba ak **výrobca bezplatne poskytuje záruku na životnosť na celý tovar dlhšiu ako 2 roky** a informáciu sprístupnil predajcovi. Online sa zobrazí farebne pri produkte a môže byť „vnorené“ (rozbaľovacie). Musí obsahovať dĺžku v rokoch, značku a model. **[NEISTÉ – Makita 3-ročná záruka: je podmienená registráciou do 30 dní a nevzťahuje sa na batérie, nabíjačky, benzínové a pneumatické náradie a pod. Či ide o „záruku na životnosť“ na celý tovar, treba overiť s Makita SK a advokátom. Pri setoch s batériou skôr nie.]**
- § 5 ods. 1 písm. j): uvádzať podmienky popredajného servisu a **iných spotrebiteľských záruk**, napr. predĺženej záruky Makita.
- § 5 ods. 1 písm. k) a l): **index opraviteľnosti** (ak existuje, pri náradí zatiaľ spravidla nie) a informácie o **náhradných dieloch, ich cene a objednaní a návodoch na opravu**, ak ich výrobca sprístupnil. Písm. p) **minimálna doba softvérových aktualizácií** pri tovare s digitálnymi prvkami (napr. aplikáciou ovládané náradie).
- § 15 ods. 1 písm. l): informovať o **ekologickejších možnostiach doručenia**, ak sú dostupné (napr. Z-BOX alebo osobný odber).
- **Zákaz klamlivých praktík** (príloha č. 1): **všeobecné environmentálne tvrdenia** („ekologický“, „zelený“, „šetrný k prírode“) bez preukázateľných vynikajúcich vlastností, neoverené „značky udržateľnosti“, tvrdenia o kompenzácii emisií. **Prezentovať zákonné požiadavky ako výhodu ponuky** je zakázané (bod 15), čiže **neinzerovať „24 mesiacov záruka“ ako benefit**. Zakázané sú aj nepravdivé tvrdenia o životnosti a opraviteľnosti.
- § 10 ods. 1 písm. b): klamanie o životnosti, opraviteľnosti a recyklovateľnosti je nekalou praktikou.

*Zdroje:* [310/2025 Z. z. – PDF Slov-Lex](https://static.slov-lex.sk/pdf/SK/ZZ/2025/310/ZZ_2025_310_20260927.pdf) · [Your Europe – oznámenie a GARAN (SK)](https://europa.eu/youreurope/business/selling-in-eu/consumer-contracts-guarantees/eu-legal-guarantee-notice-and-garan-label/index_sk.htm) · [E-commerce Slovakia – záruky od 27. 9.](https://www.ecommerceslovakia.sk/od-27-septembra-potrebuje-vas-e-shop-nove-informacie-o-zarukach/) · [Makita – podmienky predĺženej záruky](https://warranty.makita.eu/pub/media_sk/Warranty.pdf) · [Legalion – 312/2025](https://www.legalion.sk/2026/01/27/ake-zmeny-prinesie-novy-zakon-o-spotrebitelskych-uveroch-zakon-c-312-2025-z-z/) · [ODR zrušená – kpw.law](https://kpw.law/en/r-i-p-odr-platform/) · [PPWR (EUR-Lex)](https://eur-lex.europa.eu/eli/reg/2025/40/oj)

**Ďalšie už platné povinnosti:** GPSR od 13. 12. 2024 (časť 9) a **zákon 351/2022 Z. z. o prístupnosti** (od 28. 6. 2025, úroveň WCAG 2.1 AA). Mikropodnik (menej ako 10 zamestnancov a obrat alebo súvaha do 2 mil. €) je pri službách oslobodený, napriek tomu odporúčam prístupnosť dodržať ([E-commerce Slovakia](https://ecommerceslovakia.sk/nove-povinnosti-e-shopov-podla-zakona-o-pristupnosti-vyrobkov-a-sluzieb-pre-osoby-so-zdravotnym-postihnutim-od-28-juna-2025/)).

---

## 2. Povinný obsah VOP (B2C) a samostatná B2B časť

### 2.1 Predzmluvné informácie (pred odoslaním objednávky)

**§ 5 ods. 1 zákona 108/2024** (znenie od 27. 9. 2026):

- a) hlavné vlastnosti tovaru;
- b), c) obchodné meno, sídlo a telefón;
- d) cena s DPH, náklady na dopravu a iné poplatky;
- e) platobné a dodacie podmienky a **lehota dodania**;
- f) harmonizované oznámenie o zodpovednosti za vady;
- g) GARAN, ak sa uplatní;
- j) servis a ďalšie záruky;
- k), l) opraviteľnosť a náhradné diely;
- p) softvérové aktualizácie;
- q) **poučenie o práve podať žiadosť o nápravu a ADR** s odkazom na web subjektu ARS. Podľa § 5 ods. 3 sa uvádza vo VOP a na webe.

**§ 15 ods. 1 (pri predaji na diaľku)** dopĺňa:

- a) e-mail;
- b) iný online komunikačný kanál (napr. WhatsApp), ak sa používa;
- c) adresa na reklamácie a odstúpenie (Senec), ak sa líši od sídla;
- d) informácia o personalizovanej cene (ak sa používa);
- f) poučenie o odstúpení + vzorový formulár (príloha č. 2) + **informácia o umiestnení funkcie na odstúpenie**;
- g) náklady na vrátenie, a ak tovar „nie je možné vrátiť poštou“, aj **tieto náklady**. Pri ťažkých strojoch uviesť **odhad maximálnej sumy**;
- i) výnimky z odstúpenia;
- k) poučenie o **povinnosti zaplatiť vopred** (preddavok) a o jej podmienkach;
- l) ekologickejšie možnosti doručenia.

Podľa § 15 ods. 6 sa informačná povinnosť podľa písm. f) až h) považuje za splnenú, ak sa poskytne **vyplnené poučenie podľa prílohy č. 3**. Odporúčam ho prevziať doslovne. Podľa § 15 ods. 7: ak obchodník neinformoval o nákladoch na dopravu alebo vrátenie, **spotrebiteľ ich nehradí**.

**§ 17 (proces objednávky):**

- ods. 2: najneskôr na začiatku objednávky uviesť obmedzenia dodania (len SK) a **spôsoby platby**;
- ods. 3: **bezprostredne pred odoslaním** zopakovať hlavné vlastnosti, celkovú cenu, GARAN (písm. g) a zodpovednosť za vady služby (písm. i);
- ods. 4: tlačidlo **„Objednávka s povinnosťou platby“** alebo jednoznačný ekvivalent. Inak spotrebiteľa objednávka nezaväzuje (ods. 6);
- ods. 12: **potvrdenie o uzavretí zmluvy na trvanlivom médiu** najneskôr pri dodaní. K e-mailu priložiť PDF s VOP a poučením.

Predzmluvné informácie sú súčasťou zmluvy (§ 15 ods. 8). **Dôkazné bremeno nesie obchodník**, preto treba verzovať VOP a ukladať, ktorú verziu zákazník odsúhlasil.

### 2.2 Uzavretie zmluvy, cena, dodanie, platba

- **Moment uzavretia:** zákon ho neurčuje, určujú ho VOP. Keďže tovar nakupujeme až po zaplatení, odporúčam: objednávka = návrh, **zmluva vzniká potvrdením (akceptáciou)** obchodníka. Technicky sa dá použiť **Stripe „manual capture“**: kartu iba autorizovať a stiahnuť platbu až po potvrdení dostupnosti u dodávateľa. Autorizácia platí zvyčajne 7 dní. Pri prevode vystaviť zálohovú výzvu až po potvrdení. **[Na posúdenie advokátom: doložka o zrušení pri nedostupnosti tovaru – riziko neprijateľnej podmienky]**
- **Cena:** pre spotrebiteľa vždy konečná cena **s DPH** a samostatne doprava. Pri zľave uviesť **najnižšiu cenu za 30 dní** (§ 7). Poplatok za platobný prostriedok je zakázaný (§ 4 ods. 2 písm. f).
- **Dodanie:** bez dohody do 30 dní (§ 613 OZ). Uvádzať reálnu lehotu (SK dodávateľ 2–4 pracovné dni, CZ 5–7 pracovných dní vrátane testu). Nebezpečenstvo škody prechádza **prevzatím** (§ 614 OZ). Ak predávajúci nedodá včas, spotrebiteľ môže odstúpiť (§ 613 ods. 5).
- **Platba:** karta, Apple Pay a Google Pay cez Stripe, prevod. Uviesť zdanenie preddavku a vystavovanie dokladov.

### 2.3 Odstúpenie od zmluvy (14 dní)

- **Lehota** 14 dní od **prevzatia** (pri viacerých zásielkach od poslednej), § 20 ods. 1 a 4. Odstúpiť možno aj pred dodaním (ods. 5).
- **Forma:** listinne, na trvanlivom médiu, vzorovým formulárom (príloha č. 2) alebo **funkciou podľa § 20a**.
- **Výnimky** (§ 19 ods. 1) pri náradí prakticky iba písm. c) – **tovar vyrobený podľa špecifikácií spotrebiteľa** (napr. stroj nakonfigurovaný na mieru). **Bežné objednanie tovaru „na objednávku“ od dodávateľa NIE JE výnimkou.**
- **Vrátenie tovaru:** spotrebiteľ ho pošle do 14 dní od odstúpenia (§ 21 ods. 1) a znáša **len priame náklady na vrátenie**, ak bol o tom poučený (§ 21 ods. 3).
- **Refundácia:** do **14 dní od doručenia odstúpenia** všetky platby vrátane **najlacnejšieho ponúkaného** poštovného (§ 22 ods. 1 a 3), **rovnakým platobným prostriedkom** (ods. 6). Započítanie je zakázané (ods. 8).
- **Zadržanie refundácie** do vrátenia tovaru alebo preukázania jeho odoslania je dovolené (§ 22 ods. 5).
- **Zníženie hodnoty:** spotrebiteľ zodpovedá za zníženie hodnoty v dôsledku zaobchádzania **nad rámec potrebného na zistenie vlastností a funkčnosti** (§ 21 ods. 4). Ak chýbalo poučenie, nezodpovedá. Pre náš model: naše vlastné testovanie **nejde na ťarchu spotrebiteľa**. Zdokumentovať stav pri odoslaní (fotky, protokol z testu, výrobné číslo), aby sa dalo preukázať, že napr. stopy po rezaní vznikli až u zákazníka. Nárok na zníženie hodnoty sa nesmie jednostranne započítať, treba ho uplatniť samostatne. **[NEISTÉ – postup pri náhrade zníženia hodnoty konzultovať s advokátom]**

### 2.4 ADR a dozor

- **ARS:** spotrebiteľ sa najprv obráti na predajcu so **žiadosťou o nápravu**. Ak predajca odpovie zamietavo alebo do 30 dní neodpovie, môže podať návrh subjektu ARS. Pre tovar je to **Slovenská obchodná inšpekcia** (reziduálny subjekt) alebo iný subjekt zo zoznamu MH SR. Odkaz na ODR už neuvádzať.
- **Dozor:** SOI, Inšpektorát SOI pre Bratislavský kraj (Senec patrí do BA kraja). Pri osobných údajoch ÚOOÚ SR, pri cookies Úrad pre reguláciu elektronických komunikácií a poštových služieb.

### 2.5 B2B časť (Obchodný zákonník)

Ak kupujúci nakupuje v súvislosti s podnikaním, ide o obchodný záväzkový vzťah (§ 261 ObZ). Zvyčajne sa rieši **samostatným článkom VOP**. Obsahuje:

- vyhlásenie o podnikateľskom účele (IČO a IČ DPH v checkoute);
- **žiadne zákonné odstúpenie** (prípadne dobrovoľné);
- výhradu vlastníctva do zaplatenia;
- prechod nebezpečenstva;
- **zodpovednosť za vady podľa § 422 a nasl. ObZ** s povinnosťou prehliadky a včasného oznámenia vád (§ 427, 428), pričom skryté vady najneskôr do 2 rokov;
- možné **skrátenie lehoty** na oznámenie vád (napr. 12 mesiacov) a výber nároku predávajúcim;
- obmedzenie náhrady škody **[NEISTÉ – § 386 ObZ zakazuje vzdať sa nároku na náhradu škody vopred, rozsah obmedzenia posúdi advokát]**;
- rozhodné právo a súd.

Spotrebiteľské ochranné pravidlá (§ 20a, harmonizované oznámenie) sa na B2B nevzťahujú.

*Zdroje:* [108/2024 konsolidované](https://static.slov-lex.sk/pdf/SK/ZZ/2024/108/ZZ_2024_108_20260927.pdf) (§ 4–7, 15, 17, 19–22, prílohy 2 a 3) · [Európske spotrebiteľské centrum – RSO](https://www.europskyspotrebitel.sk/novinka/62412/platforma-riesenie-sporov-online-platforma-rso)

---

## 3. Reklamačný poriadok (zodpovednosť za vady podľa OZ v znení 108/2024 a 310/2025)

**Je reklamačný poriadok povinný?** Od 1. 7. 2024 už osobitná úprava reklamačného konania v zákone o ochrane spotrebiteľa nie je a pre tovar platí iba OZ (§ 612–626). **Povinnosť mať samostatný „reklamačný poriadok“ ani viesť „evidenciu reklamácií“ som v 108/2024 pri predaji tovaru nenašiel.** Existuje len pri bankách, veriteľoch a pod. Niektoré sekundárne zdroje však evidenciu stále uvádzajú ako povinnú. **[NEISTÉ]** Odporúčam oboje mať: ide o dôkaz pre SOI a pre spory. Informácie o zodpovednosti za vady sú tak či tak povinné (§ 5 ods. 1 písm. f, harmonizované oznámenie).

| Téma | Pravidlo (OZ) |
|---|---|
| Terminológia | „**Vytknutie vady**“ (nie „reklamácia“), „zodpovednosť za vady“ (nie „záruka“). Slovo „reklamácia“ môže zostať ako bežný pojem. |
| Doba zodpovednosti | **2 roky od dodania** (§ 619 ods. 1). Kratšia (najmenej 1 rok) **len pri použitej veci** (ods. 3). |
| Predĺženie po oprave | Od 31. 7. 2026 **+12 mesiacov po prvej oprave**, len raz (§ 619 ods. 4). |
| Náhradná vec | Predávajúci zodpovedá za vady náhradnej veci podľa § 619, teda **nová 2-ročná doba**. |
| Dôkazné bremeno | Predpoklad, že vada existovala pri dodaní, platí **počas celej doby zodpovednosti** (§ 620 ods. 1 odkazuje na § 619 ods. 1 až 3, po novele aj na ods. 4). **Nie iba 1 rok.** |
| Lehota spotrebiteľa | Vadu treba vytknúť **do 2 mesiacov od zistenia**, najneskôr do konca doby zodpovednosti (§ 621 ods. 3). |
| Miesto | V prevádzkarni, u určenej osoby (napr. autorizovaný servis Makita, ak bol kupujúci vopred informovaný – § 622 ods. 1 a 5) alebo na diaľku. |
| Potvrdenie | **Písomné potvrdenie o vytknutí vady bezodkladne**, s **lehotou na odstránenie vady najviac 30 dní** od vytknutia; dlhšia je možná len z objektívneho dôvodu, ktorý predávajúci nemôže ovplyvniť (§ 622 ods. 3). |
| Zamietnutie | **Písomné odôvodnenie** (§ 622 ods. 4). Ak spotrebiteľ predloží posudok akreditovanej osoby, môže vadu vytknúť opakovane a predávajúci ju už nemôže odmietnuť. Posudok predávajúci nepotrebuje. |
| Doklad o vybavení | Výslovne sa vyžaduje len pri zamietnutí. Odporúčam vždy (e-mail alebo PDF). |
| Nároky – hierarchia | 1) **Oprava alebo výmena podľa voľby kupujúceho** (§ 623 ods. 1), ak nie je nemožná alebo neprimeraná. 2) Až potom **zľava alebo odstúpenie** v prípadoch podľa § 624 ods. 1 (neopravené, opakovaná vada, závažná vada…). Pri zanedbateľnej vade nemožno odstúpiť. Refundácia do 14 dní od vrátenia veci (§ 624 ods. 7). |
| Info pred opravou (od 31. 7. 2026) | **Informovať o práve voľby opravy alebo výmeny a o predĺžení o 12 mesiacov** (§ 623 ods. 2). Zaradiť do šablóny potvrdenia. |
| Náklady | Oprava alebo výmena **bezplatne a na náklady predávajúceho**. **Náklady prevzatia veci znáša predávajúci** a vrátenie opravenej veci tiež. Kupujúci má nárok na **náhradu účelne vynaložených nákladov** (napr. poštovné), musí ho uplatniť do 2 mesiacov (§ 509, § 621 ods. 3). Prakticky: **bezplatný zvoz kuriérom** alebo preplatenie poštovného. |
| Nevyzdvihnutá vec | Po 6 mesiacoch ju možno predať (§ 623). |
| Komerčná záruka výrobcu | Záručný list Makita je **spotrebiteľská záruka výrobcu** (§ 626). Zákonné práva voči predajcovi trvajú. Predĺženie Makita (3 roky) si **registruje zákazník do 30 dní** na makita.sk. Platí len pre náradie distribuované Makita s.r.o. na SK trh, preto odporúčam **nepoužívať ho pri tovare od CZ partnera**. V 3. roku rieši zákazník vadu cez Makita servis s certifikátom, záručným listom a dokladom. Predajca by mal vo VOP a na produktovej stránke uviesť podmienky (§ 5 ods. 1 písm. j) a nesmie ich zamieňať so zákonnou zodpovednosťou. |

**B2B:** podľa ObZ (§ 422 a nasl.), zmluvne je možné skrátiť lehoty a upraviť postup. Zákonnú 2-ročnú lehotu na oznámenie skrytých vád (§ 428) **zmluva môže skrátiť** **[overiť formuláciu s advokátom]**.

*Zdroje:* znenie OZ § 612–626 v Čl. II zákona 108/2024 ([PDF](https://static.slov-lex.sk/pdf/SK/ZZ/2024/108/ZZ_2024_108_20260927.pdf)) · novela Čl. II 310/2025 ([PDF](https://static.slov-lex.sk/pdf/SK/ZZ/2025/310/ZZ_2025_310_20260927.pdf)) · [E-commerce Slovakia – reklamácie](https://www.ecommerceslovakia.sk/ako-ma-e-shop-postupovat-pri-vybaveni-reklamacie-podla-noveho-zakona-o-ochrane-spotrebitela-od-1-7-2024/) · [epravo – právo na opravu](https://www.epravo.sk/top/clanky/pravo-na-opravu-a-nove-pravidla-reklamacii-pre-spotrebitelov-6648.html)

---

## 4. GDPR – zásady ochrany osobných údajov a cookies

**Rámec:** nariadenie GDPR, **zákon 18/2018 Z. z.**, cookies podľa **§ 109 ods. 8 zákona 452/2021 Z. z.** a e-mailový marketing podľa § 116 toho istého zákona.

**Obsah zásad (čl. 13 GDPR):**

- prevádzkovateľ a kontakt;
- účely a **právne základy**: plnenie zmluvy (objednávka, doručenie, reklamácie, odstúpenie, zákaznícky účet), **zákonná povinnosť** (účtovníctvo, DPH, spotrebiteľské povinnosti), **oprávnený záujem** (prevencia podvodov cez Stripe Radar, obrana nárokov, kamerový systém v Senci, ak bude, soft opt-in pre existujúcich zákazníkov pri podobných produktoch podľa § 116 ods. 15 zákona 452/2021) a **súhlas** (newsletter pre nezákazníkov, marketingové a analytické cookies, recenzie s menom);
- príjemcovia;
- prenosy do tretích krajín;
- doby uchovávania;
- práva dotknutých osôb a sťažnosť na ÚOOÚ;
- automatizované rozhodovanie (ak by Stripe Radar automaticky zamietal platby, uviesť to).

**Doby uchovávania (návrh):**

- účtovné doklady a faktúry: **10 rokov** (zákon 431/2002 Z. z. o účtovníctve, § 76 zákona o DPH);
- objednávky a komunikácia k nim: počas doby zodpovednosti za vady (2 roky + 12 mesiacov po oprave) + premlčacia lehota (OZ 3 roky, ObZ 4 roky). Navrhujem **5 rokov** od dodania;
- záznamy o odstúpení: rovnako;
- marketing: do odvolania súhlasu;
- účet: do zrušenia;
- cookies: podľa konkrétnej cookie (max. 13 mesiacov pre analytiku je bežná prax).

**Sprostredkovatelia a príjemcovia** (uzavrieť zmluvu podľa čl. 28 GDPR / DPA):

| Subjekt | Rola | Poznámka |
|---|---|---|
| Stripe | sprostredkovateľ **a čiastočne samostatný prevádzkovateľ** (podvody, AML) | Írsko a USA, štandardné zmluvné doložky / DPF |
| Supabase | sprostredkovateľ | zvoliť **EU región**, DPA |
| Vercel | sprostredkovateľ | USA, DPF a štandardné zmluvné doložky, minimalizovať logy |
| Kuriéri (SPS, DPD, Packeta…) | spravidla **samostatní prevádzkovatelia** alebo sprostredkovatelia podľa ich VOP | **[NEISTÉ – overiť ich zmluvy]** |
| Účtovná firma | sprostredkovateľ | |
| E-mailová služba (transakčná, newsletter) | sprostredkovateľ | |
| WhatsApp Business (Meta) | pri WhatsApp Business **API** sprostredkovateľ, pri **aplikácii** problematické (synchronizácia kontaktov, Meta ako prevádzkovateľ) | Odporúčam API alebo poskytovateľa BSP. **[NEISTÉ]** |
| Slovenská sporiteľňa | samostatný prevádzkovateľ | |
| Makita / servis | príjemca pri reklamáciách | |

- **Zodpovedná osoba (DPO):** podľa čl. 37 GDPR **nie je povinná** (bežný e-shop nemonitoruje vo veľkom rozsahu a nespracúva osobitné kategórie). Odporúčam určiť interný kontakt pre GDPR.
- **Záznamy o spracovateľských činnostiach (čl. 30):** výnimka pre menej ako 250 zamestnancov neplatí, ak spracovanie nie je príležitostné. E-shop spracúva údaje sústavne, preto **záznamy viesť**. Ďalej pripraviť **posúdenie oprávneného záujmu** (Radar, kamery) a postup pri porušení ochrany (72 h).
- **Cookies:** pre všetko okrem nevyhnutných treba **preukázateľný súhlas** (§ 109 ods. 8). Žiadne predzaškrtnuté políčka, **„Odmietnuť“ rovnako jednoducho ako „Prijať“**, granularita, možnosť súhlas odvolať (ikonka) a log súhlasov. Analytické a marketingové skripty (GA4, Meta Pixel) sa načítajú **až po súhlase** (Google Consent Mode v2). Pokuta až do 10 % obratu. Stripe.js používa cookies na prevenciu podvodov, ktoré sa obvykle považujú za nevyhnutné. **[NEISTÉ – zdokumentovať]**

*Zdroje:* [RÚ – stanovisko k § 109 ods. 8](https://www.teleoff.gov.sk/files/urad/informacie-urade/najcastejsie-otazky/problematika-cookies-osdek/8-musi-byt-webovej-stranke-vzdy-cookies-lista/52493_stanovisko-k-ziskavaniu-suhlasu-podla-ustanovenia-109-ods-8-zakona-c.pdf) · [Podnikajte – cookies](https://www.podnikajte.sk/zakonne-povinnosti-podnikatela/cookies-od-1-2-2022) · [GDPR (EUR-Lex)](https://eur-lex.europa.eu/eli/reg/2016/679/oj)

---

## 5. Predaj otvoreného alebo testovaného tovaru ako nového

- Zákon nezakazuje otvoriť balenie a vykonať kontrolu. **§ 4 ods. 1 písm. e) zákona 108/2024** dokonca ukladá predviesť alebo prekontrolovať tovar na žiadosť spotrebiteľa. Krátka **funkčná skúška naprázdno** z tovaru podľa mňa nerobí „použitý tovar“ v zmysle § 4 ods. 1 písm. d), ktorý sa musí predávať oddelene alebo označený. **[NEISTÉ – záver nie je potvrdený judikatúrou ani SOI]**
- **Riziko:** ak test zanechá stopy (rez do materiálu, palivo alebo olej v benzínových strojoch, opotrebenie kotúča či reťaze), tovar môže byť nesúladný so zmluvou (§ 617 OZ: obal a stav, aký možno „dôvodne očakávať“) alebo ide o klamlivú praktiku. Pri benzínových strojoch skúšku s palivom **robiť len so súhlasom** zákazníka alebo ju jasne popísať.
- **Odporúčané zverejnenie** (VOP, produktová stránka, checkout, list v balíku): „Každý stroj pred odoslaním rozbalíme, skontrolujeme kompletnosť, vykonáme funkčnú skúšku bez záťaže, vyplníme záručný list a stroj starostlivo zabalíme späť do originálneho obalu. Tovar je nový a nepoužívaný.“ Ak by sa pri teste menil stav (napr. palivo), získať **výslovný a osobitný súhlas** (analogicky § 615 ods. 2 OZ).
- **Ponechať originálny obal, návody a bezpečnostné upozornenia** (GPSR čl. 12: distribútor nesmie ohroziť zhodu; § 4 ods. 1 písm. g) 108/2024: dokumenty **v slovenčine**). **Tovar od CZ partnera s návodom iba v češtine nestačí.** **[overiť pri ntc.cz]** Pri vonkajšom prebalení nezakrývať označenie výrobcu ani CE.
- Pre spor o „zníženie hodnoty“ pri odstúpení dokumentovať stav (fotky a protokol so sériovým číslom).

---

## 6. Platba vopred a DPH

- **Daňová povinnosť** vzniká **dňom prijatia platby pred dodaním** v rozsahu prijatej sumy (§ 19 ods. 4 zákona 222/2004). Pri Stripe je to deň, keď sú peniaze prijaté/strhnuté (pri manual capture **capture**, nie autorizácia). **[NEISTÉ: či rozhoduje capture alebo pripísanie na účet od Stripe – overiť s daňovým poradcom; v praxi sa používa capture]** Pri prevode je to dátum pripísania. Pri odstúpení alebo refundácii nasleduje oprava základu dane.
- **Faktúra k prijatej platbe:** povinná pri **B2B a právnických osobách** (§ 72 ods. 1 písm. a) a f), lehota **15 dní od prijatia platby alebo do konca mesiaca**, v ktorom bola prijatá (§ 73 ods. 1 písm. b). Po dodaní nasleduje konečná faktúra so zúčtovaním preddavku.
- **B2C:** podľa zákona o DPH sa **faktúra spotrebiteľovi nevyžaduje**. Zákon 108/2024 § 4 ods. 1 písm. a) však vyžaduje **„potvrdenie o úhrade ceny“** a zákon o účtovníctve vyžaduje účtovný doklad. Odporúčam automaticky poslať **daňový doklad / faktúru e-mailom** aj spotrebiteľom (zjednodušuje to aj reklamácie a registráciu predĺženej záruky Makita). Preddavok B2C sa zdaní dňom prijatia, eviduje sa v DPH priznaní a súhrnne v kontrolnom výkaze (časť D). **[overiť s účtovníkom]**
- **Od 1. 1. 2027 (novela 385/2025, § 85o):** pri dodaní **slovenskej zdaniteľnej osobe** alebo nezdaniteľnej právnickej osobe **a pri prijatí platby pred takým dodaním** treba vystaviť **štruktúrovanú e-faktúru cez doručovaciu službu (Peppol)** do 15 dní. Súhrnná e-faktúra za mesiac je možná. Výnimka platí pre zjednodušenú faktúru: doklad do 100 € alebo doklad z e-kasa klient do 400 €. **E-shop teda musí do konca 2026 napojiť fakturáciu na Peppol** pre B2B objednávky vrátane preddavkov.

*Zdroje:* [222/2004 znenie 2026](https://static.slov-lex.sk/pdf/SK/ZZ/2004/222/ZZ_2004_222_20260101.pdf) · [znenie 2027](https://static.slov-lex.sk/pdf/SK/ZZ/2004/222/ZZ_2004_222_20270101.pdf) · [ePošťák – e-faktúra 2027](https://epostak.sk/blog/elektronicka-faktura-2027-kompletny-sprievodca)

---

## 7. Tovar od CZ partnera – EPR (elektro, batérie, obaly) a DPH

**Elektrozariadenia:** podľa **§ 32 ods. 16 písm. c) zákona 79/2015** je výrobcom elektrozariadení aj osoba so sídlom v SR, ktorá „uvádza v rámci podnikateľskej činnosti na trh SR elektrozariadenia **z iného členského štátu**“. Uvedenie na trh znamená prvé sprístupnenie v SR (ods. 15). **E-shop sa tak pri tovare od ntc.cz stáva výrobcom** a pri tovare od Makita s.r.o. SK **nie**, pretože tam je výrobcom Makita SK. Povinnosti:

1. **zápis do Registra výrobcov vyhradeného výrobku** (MŽP SR, portál Recyklačného fondu / ISOH) **pred** uvedením na trh;
2. **zmluva s OZV** (napr. SEWA, ASEKOL SK, ELEKOS, ENVIDOM, NATUR-PACK);
3. štvrťročné hlásenia množstiev;
4. informovanie a označenie (preškrtnutý kôš).

Výnimka: CZ dodávateľ môže mať v SR **splnomocneného zástupcu**, ktorý povinnosti plní za neho. Treba to písomne zmluvne doriešiť a preveriť zápis v registri. Ako distribútor elektrozariadení má e-shop podľa § 37 ods. 1 ďalšie povinnosti: zabezpečiť **spätný zber 1:1** v mieste výdaja alebo skladu (**Senec**), informovať o ňom (web, list) a uvádzať recyklačný poplatok, ak ho výrobca uviedol. Ak predáva tovar od výrobcu, ktorý nie je v registri, prechádzajú na neho povinnosti výrobcu (§ 37 ods. 3). Preto treba **overiť registráciu Makita SK** (formalita).

**Batérie:** podľa § 38 ods. 14 je výrobcom batérií ten, kto ich „uvádza prvýkrát na trh … získané zo zahraničia **vrátane batérií začlenených do prístrojov**“. Akumulátorové náradie a samostatné akumulátory od CZ partnera = e-shop je **výrobcom batérií** (aj podľa nariadenia (EÚ) 2023/1542). Treba registráciu a OZV pre batérie. Distribútor batérií má povinnosť spätného zberu.

**Obaly:** výrobcom obalov je aj ten, kto prepraví tovar v obaloch cez hranicu do SR a uvádza ho na trh, a ako distribútor **balí distribuovaný tovar** (§ 52 ods. 11 písm. c) a e). Kartóny, výplne a páska pri expedícii, plus originálne obaly tovaru od CZ partnera. Treba registráciu a OZV pre obaly. Pri **menej ako 100 kg obalov ročne** sa väčšina povinností neuplatní (§ 54 ods. 6), registrácia však podľa všetkého zostáva. **[NEISTÉ]**

**Náklady (orientačne):** vstupný a ročný poplatok OZV rádovo **desiatky až nízke stovky € ročne za každú komoditu** + recyklačné poplatky podľa hmotnosti a kategórie (pri malom elektre centy až cca 1–2 € za kus, batérie podľa kg). Pri malých objemoch spolu odhadom **300–1 000 € ročne** za elektro, batérie a obaly. **[NEISTÉ – vyžiadať si cenové ponuky aspoň od 2 OZV]** Pokuty sú vysoké, rádovo až stovky tisíc €.

**DPH – nadobudnutie tovaru v tuzemsku z iného členského štátu:**

- CZ platiteľ fakturuje **bez CZ DPH** (oslobodené dodanie do iného ČŠ). Podmienkou je, že e-shop mu oznámi **platné SK IČ DPH (SK…)** overené vo VIES.
- E-shop sám **priznáva SK DPH 23 %** a zároveň si ju **odpočíta** (neutrálne), § 11 a § 69 ods. 6 zákona o DPH.
- Daňová povinnosť vzniká **15. dňom mesiaca nasledujúceho** po nadobudnutí, alebo skôr dňom vyhotovenia faktúry (§ 20).
- Uvádza sa v DPH priznaní a kontrolnom výkaze (časť B.1).
- **Platba vopred CZ partnerovi sama osebe daňovú povinnosť nezakladá.**
- Pri prekročení prahu je povinný **Intrastat** (prah overiť na ŠÚ SR).

*Zdroje:* [79/2015 znenie od 1. 1. 2026](https://static.slov-lex.sk/pdf/SK/ZZ/2015/79/ZZ_2015_79_20260101.pdf) · [SEWA – povinnosti pri dovoze](https://www.sewa.sk/povinnosti-pri-dovoze-a-predaji-elektrozariadeni) · [273/2025 – Slov-Lex](https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2025/273/20260101) · [Nariadenie 2023/1542](https://eur-lex.europa.eu/eli/reg/2023/1542/oj) · [222/2004](https://static.slov-lex.sk/pdf/SK/ZZ/2004/222/ZZ_2004_222_20260101.pdf)

---

## 8. eKasa pri osobnom odbere v Senci

**Od 1. 1. 2026 platí nový zákon č. 384/2025 Z. z. o evidencii tržieb** (nahradil 289/2008). Podľa **§ 2 písm. u)** je tržbou platba z predaja tovaru prijatá **„na predajnom mieste“** v hotovosti alebo inými platobnými prostriedkami, ktoré hotovosť nahrádzajú (karta, **QR platba**, poukážka). **Tržbou je aj preddavok alebo doplatok.** Predajným miestom je miesto, kde sa tržba prijíma (písm. x).

| Situácia | eKasa? |
|---|---|
| Online platba kartou, Apple Pay alebo Google Pay cez Stripe a potom osobný odber | **Nie.** Platba sa neprijíma na predajnom mieste. Takto to vykladá prax aj sekundárne zdroje. **[NEISTÉ – zákon pojem „online platba“ výslovne nerieši; odporúčam si to potvrdiť stanoviskom FR SR]** |
| Bankový prevod vopred | **Nie.** |
| Platba kartou, v hotovosti alebo QR kódom pri vyzdvihnutí v Senci (aj **doplatok**) | **Áno.** Treba eKasa (ORP alebo bezplatná VRP), pokladničný doklad a evidenciu predajného miesta. Zároveň platí povinnosť **umožniť bezhotovostnú platbu nad 1 €** (§ 15, od 1. 5. 2026). |
| Dobierka cez kuriéra | Výnimka z evidencie (§ 3 ods. 2 písm. a) bod 3). |
| Vrátenie peňazí v Senci za tovar zaplatený cez eKasa | doklad o vrátení cez eKasa |

**Odporúčanie:** v Senci prijímať **iba vopred zaplatené objednávky** (aj pri odbere je možné zaplatiť QR alebo Stripe linkom vopred online), alebo zriadiť VRP alebo ORP. Senec je **prevádzkareň**: treba oznámiť jej zriadenie živnostenskému úradu a označiť ju obchodným menom, sídlom a prevádzkovým časom (§ 4 ods. 1 písm. c) 108/2024). Aj pri online platbe odovzdať **potvrdenie o úhrade**, napr. faktúru e-mailom.

*Zdroje:* [384/2025 Z. z. – PDF](https://static.slov-lex.sk/pdf/SK/ZZ/2025/384/ZZ_2025_384_20260101.pdf) · [Podnikajte – zmeny 2026](https://www.podnikajte.sk/ekasa/zmeny-v-evidencii-trzieb-od-2026) · [Wellbens – eKasa a e-shop](https://www.wellbens.sk/ekasa-online-platby-eshop/)

---

## 9. Povinné informácie na produktovej stránke

- **GPSR (nariadenie (EÚ) 2023/988, čl. 19):**
  - meno alebo obchodné meno a značka **výrobcu**, jeho **poštová a elektronická adresa**;
  - ak výrobca nie je v EÚ, **zodpovedná osoba v EÚ** a jej kontakt;
  - **identifikácia výrobku** (obrázok, typ alebo model, EAN);
  - **varovania a bezpečnostné informácie** v slovenčine (napr. PDF návodu alebo bezpečnostné pokyny).
- **Hlavné vlastnosti** (technické parametre, obsah balenia, či je batéria a nabíjačka v balení).
- **Cena s DPH** a pri akcii **predchádzajúca najnižšia cena za 30 dní** (§ 7). **Jednotková cena sa pri kusovom tovare nevyžaduje** (§ 6 ods. 1 – rovná sa predajnej cene). Vyžaduje sa pri tovare predávanom na dĺžku, hmotnosť alebo objem (oleje, mazivá, káble na metre, struny).
- **Dostupnosť a lehota dodania** (napr. „u dodávateľa – odoslanie do 3 pracovných dní“) a **náklady na dopravu**. Tie musia byť jasné najneskôr pred objednávkou, odporúčam priamo na produkte.
- **Harmonizované oznámenie o zákonnej zodpovednosti za vady** (od 27. 9. 2026), prípadne **GARAN** a informácia o **predĺženej záruke Makita** s podmienkami (registrácia do 30 dní, výnimky).
- **Náhradné diely a opraviteľnosť**, ak ich výrobca sprístupnil. Pri tovare s aplikáciou (Bluetooth/AWS) uviesť dobu softvérových aktualizácií.
- **Recenzie:** ak sa zobrazujú, informovať, **či a ako sa overuje**, že pochádzajú od kupujúcich (§ 11 ods. 6 108/2024).
- **Energetický štítok:** iba ak sa vzťahuje (pri náradí zriedka).
- **Nepoužívať** všeobecné eko tvrdenia ani „24 mesiacov záruka“ ako výhodu.
- Pri tovare od CZ partnera **slovenský návod** a označenie CE.

*Zdroje:* [GPSR (EUR-Lex)](https://eur-lex.europa.eu/eli/reg/2023/988/oj) · [MH SR – predaj na diaľku a bezpečnosť výrobkov](https://www.economy.gov.sk/obchod/ochrana-spotrebitela/bezpecnost-vyrobkov-a-dohlad/vseobecna-bezpecnost-vyrobkov/predaj-na-dialku-napr-prostrednictvom-e-shopov) · 108/2024 § 6, 7, 11

---

## 10. Konsolidovaný checklist implementácie (web a systém)

**Checkout a objednávka**
- [ ] Na začiatku objednávky: spôsoby platby, doručenie iba v SR, ekologické možnosti doručenia (§ 17 ods. 2, § 15 ods. 1 písm. l).
- [ ] Prepínač **Spotrebiteľ / Firma** (IČO, IČ DPH, DIČ), ktorý určí aplikované VOP (B2C/B2B) a typ dokladov.
- [ ] Rekapitulácia pred odoslaním: hlavné vlastnosti, celková cena s DPH, doprava, harmonizované oznámenie (prípadne GARAN), lehota dodania, informácia o platbe vopred (§ 17 ods. 3).
- [ ] Checkbox „Oboznámil som sa s VOP a poučením o odstúpení“ (nepredvyplnený) + odkazy. Marketingový súhlas samostatne a nepovinne.
- [ ] Tlačidlo **„Objednávka s povinnosťou platby“**.
- [ ] Stripe: **manual capture** (autorizácia → capture po potvrdení dodávateľom) alebo okamžitá platba s jasným procesom refundácie. Žiadny príplatok za spôsob platby.
- [ ] E-mail s prijatím objednávky. Potom **potvrdenie zmluvy na trvanlivom médiu** s PDF VOP, poučením (príloha č. 3 vrátane bodu 3a), vzorovým formulárom (príloha č. 2) a odkazom „Odstúpiť od zmluvy tu“.
- [ ] Verzovanie VOP a log odsúhlasenej verzie k objednávke.

**Odstúpenie (§ 20a)**
- [ ] Odkaz **„Odstúpiť od zmluvy tu“** v pätičke všetkých stránok, v e-mailoch a v účte. Bez nutnosti prihlásenia.
- [ ] Formulár: meno a priezvisko, číslo objednávky, e-mail (povinné). Dôvod, položky a IBAN voliteľné. Predvyplnenie pre prihlásených.
- [ ] 2. krok s tlačidlom **„Potvrdiť odstúpenie od zmluvy“**.
- [ ] Okamžitý e-mail s celým obsahom oznámenia a **dátumom a časom odoslania**. Záznam s časovou pečiatkou v DB.
- [ ] Interný workflow: lehota 14 dní na refundáciu od doručenia oznámenia, stav „čaká na vrátenie tovaru“, refundácia cez Stripe na pôvodný prostriedok, posúdenie zníženia hodnoty.

**Reklamácie**
- [ ] Online formulár na vytknutie vady → automatické **písomné potvrdenie** (dátum, popis, lehota najviac 30 dní) + **informácia o práve voliť opravu alebo výmenu a o +12 mesiacoch po oprave**.
- [ ] Objednanie bezplatného zvozu kuriérom.
- [ ] Evidencia reklamácií (číslo, dátumy, nárok, výsledok, odôvodnenie zamietnutia) a sledovanie doby zodpovednosti vrátane predĺženia.
- [ ] Šablóny: potvrdenie, vybavenie, zamietnutie s odôvodnením.

**Produkty a ceny**
- [ ] Polia GPSR (výrobca, adresa, e-mail, zodpovedná osoba, model, EAN, bezpečnostné PDF v SK).
- [ ] História cien a automatický výpočet **najnižšej ceny za 30 dní** pri zľave.
- [ ] Komponent harmonizovaného oznámenia (oficiálny súbor, farebne, bez úprav) + podmienené zobrazenie GARAN.
- [ ] Pole „predĺžená záruka výrobcu“ (podmienky) a „náhradné diely / opraviteľnosť“.
- [ ] Jednotková cena pri tovare na meter, kg alebo liter.

**Doklady, DPH a eKasa**
- [ ] Automatická **faktúra k prijatej platbe** (B2B do 15 dní) a konečná faktúra so zúčtovaním. B2C doklad o úhrade e-mailom.
- [ ] **Peppol e-faktúra pre B2B od 1. 1. 2027** vrátane preddavkov.
- [ ] Opravné doklady pri refundáciách.
- [ ] Ak sa v Senci prijímajú platby: VRP alebo ORP a QR alebo kartový terminál. Inak politika „iba vopred zaplatené“.

**GDPR a cookies**
- [ ] Cookie lišta s Prijať / Odmietnuť / Nastavenia, blokovanie skriptov pred súhlasom, log súhlasov, Consent Mode v2.
- [ ] DPA so Stripe, Supabase (EU región), Vercel, e-mailovou službou, účtovníkom, kuriérmi a WhatsApp BSP.
- [ ] Záznamy o spracovateľských činnostiach, posúdenie oprávneného záujmu, retenčné joby (mazanie po lehotách).
- [ ] Odhlásenie z newslettera v každom e-maile.

**Prevádzka a EPR**
- [ ] Oznámenie prevádzkarne Senec (živnostenský úrad) a jej označenie.
- [ ] Registrácia v Registri výrobcov (elektro, batérie, obaly) a zmluvy s OZV. Zmluvné doriešenie s ntc.cz (splnomocnený zástupca?).
- [ ] Informácia o **spätnom zbere elektroodpadu a batérií** (web a Senec).
- [ ] Testovací protokol a fotodokumentácia pred expedíciou (sériové číslo).
- [ ] Prístupnosť (WCAG 2.1 AA) ako best practice.

---

## 11. Otvorené body pre advokáta

1. **Moment uzavretia zmluvy** pri platbe vopred a nákupe až po objednávke. Prípustnosť doložky o zrušení pri nedostupnosti tovaru (neprijateľná podmienka?) a správne nastavenie autorizácie a capture.
2. **§ 20a:** možno vyžadovať prihlásenie, ak je objednávka v účte? Možno povinne požadovať výber položiek pri čiastočnom odstúpení? Ako dlho držať funkciu aktívnu (12-mesačná dodatočná lehota)?
3. **Testovanie pred expedíciou:** zostáva tovar „nový“? Formulácia zverejnenia a potreba osobitného súhlasu (§ 615 ods. 2 OZ). Benzínové stroje.
4. **Zníženie hodnoty pri odstúpení:** postup uplatnenia, keďže jednostranné započítanie je zakázané (§ 22 ods. 8).
5. **Predĺžená záruka Makita a GARAN:** ide o „spotrebiteľskú záruku na životnosť“? Ako ju komunikovať a ako postupovať pri tovare od CZ partnera.
6. **Evidencia reklamácií a reklamačný poriadok:** sú po 1. 7. 2024 pri tovare povinné? Odporúčaný rozsah.
7. **B2B VOP:** skrátenie lehôt na oznámenie vád, obmedzenie náhrady škody (§ 386 ObZ), výhrada vlastníctva, rozlíšenie SZČO a spotrebiteľa pri nákupe na IČO.
8. **Ťažké stroje:** výška nákladov na vrátenie, ktoré nemožno poslať poštou (odhad maximálnej sumy v poučení).
9. **Kuriéri a WhatsApp:** rola podľa GDPR (prevádzkovateľ alebo sprostredkovateľ), zmluvné zabezpečenie, prenosy do USA.
10. **Jazyk návodov** pri tovare z CZ (štátny jazyk, § 4 ods. 1 písm. g) 108/2024) a zodpovednosť podľa GPSR pri prebalení.
11. **Splátky / BNPL** (Stripe, Klarna) od 20. 11. 2026 podľa 312/2025: dopad na e-shop ako sprostredkovateľa a varovanie v reklame.
12. (Daňový poradca) Moment prijatia platby pri Stripe (capture alebo payout), B2C doklady, Peppol pri preddavkoch, Intrastat.
13. (OZV) Rozsah registrácie pri nákupe z CZ, splnomocnený zástupca CZ partnera, prah 100 kg obalov, ponuky cien.
