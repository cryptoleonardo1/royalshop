# 08 – Vrátenia a reklamácie: riziká a ako ich minimalizovať (stav k 3. 11. 2026)

> **Účel:** prehľad pre foundera, ako znížiť počet vrátení a nákladných reklamácií pri predaji Gölz strojov s nulovým rozpočtom. Vychádza z docs/06 a príloh `docs/pravne/B` (odstúpenie) a `C` (reklamácie), z odpovede Gölzu (Klaus Schlör) a z porovnania s ferrotech.sk. **Nejde o právne poradenstvo**; pred spustením skontroluje Benji (Mind Palace), prípadne advokát.

## 1. Východisko

- **Gölz:** vrátenie len z platného dôvodu a po dohode s Gölzom. Drobné vady opravujú lokálni partneri „za úhradu nákladov“. Pri záručnom prípade Gölz platí dopravu tam aj späť. Kúpený nový stroj nám bez dôvodu nevezme.
- **Zákon (spotrebiteľ, zmluva na diaľku):** 14 dní na odstúpenie bez udania dôvodu, a to aj **pred doručením** (§ 20 ods. 5 z. 108/2024). Nedá sa podmieniť stavom stroja, dôvodom, súhlasom výrobcu ani osobným dovezením (§ 19, § 21 ods. 6; neplatná klauzula = pokuta SOI až 2 % obratu, max. 200 000 €).
- **Dôsledok:** odstúpenie spotrebiteľa nie je pre Gölz „platný dôvod“. Ak stroj už je objednaný, ostáva nám ako sklad. Pri nulovom rozpočte je to hlavné finančné riziko.

## 2. Ako to má ferrotech.sk (VOP z 22. 5. 2026)

Nemajú žiadny „trik“, len štandard a niekoľko zastaraných či sporných viet:

| Téma | Ferrotech | Hodnotenie |
|---|---|---|
| Odstúpenie | 14 dní od prevzatia, listom alebo e-mailom, vzorový formulár | štandard; chýba povinná online funkcia § 20a |
| Náklady vrátenia | platí spotrebiteľ, jeden odhad „5 až 150 €“ pre všetko | v poriadku, odhad je slabý (má byť pri tovare) |
| Zníženie hodnoty | spotrebiteľ „zodpovedá za škodu“ nad rámec vyskúšania | v poriadku, bez postupu |
| Refundácia | do 14 dní, zadržia ju, kým zákazník nepreukáže odoslanie | v poriadku (§ 22 ods. 5) |
| Reklamácia | 24 mes. spotrebiteľ, 12 mes. firma; tovar treba priniesť alebo poslať do Nových Zámkov | pri ťažkom stroji v rozpore so zákonom (náklady prevzatia platí predajca) |
| Ostatné | odkaz na zrušenú platformu ODR, chýba harmonizované oznámenie EÚ, VOP pred novelou OZ z 31. 7. 2026 | zastarané |

Ferrotech je kamenná predajňa so skladom (Makita, DeWALT, Metabo), vrátený stroj ľahko predá ďalej. Riziko vrátení riešia skladom, nie podmienkami.

## 3. Riziká zoradené podľa závažnosti

### R1 – Spotrebiteľ odstúpi, keď je stroj už objednaný u Gölzu (vysoké, finančné)
Vrátený stroj ostane u nás, peniaze vraciame celé do 14 dní. Zákonom sa to vylúčiť nedá. Opatrenia:
1. **Predaj spotrebiteľom „na predajni“ (najsilnejšie opatrenie).** Web slúži pre fyzické osoby ako **nezáväzná rezervácia bez platby**. Zákazník príde do Senca, stroj si vyskúša, absolvuje zaškolenie, kúpnu zmluvu podpíše a zaplatí **na mieste**. Nejde o zmluvu na diaľku (§ 14 ods. 1), takže 14-dňové odstúpenie neplatí (docs/pravne/B, 1.2). Sedí to s procesom schváleným Gölzom (test + zaškolenie v Senci). **Overené (Benji, 5. 11. 2026):** nejde o zmluvu na diaľku, ak rezervácia nikoho nezaväzuje a zmluva vznikne až podpisom v predajni (smernica 2011/83/EÚ, odôvodnenie 20: zmluva iniciovaná na diaľku, ale uzavretá v prevádzkových priestoroch nie je zmluvou na diaľku). Pravidlá, bez ktorých to neplatí:
   - **Žiadna online záloha od spotrebiteľa.** Záloha cez web = zmluva na diaľku s 14-dňovým odstúpením. Zálohu zaplatenú na predajni brať môžeme.
   - **Telefonát kúpu neuzatvára.** Telefón je prostriedok na diaľku; hovor slúži len na overenie a termín návštevy (skript: `docs/09-skript-rezervacia-telefonat.md`). Ak zákazník trvá na kúpe na diaľku, pošleme platobný odkaz a odstúpenie platí.
   - **U Gölzu objednávame až po podpise zmluvy a zálohe na predajni.** Stroj, ktorý nie je skladom = dve návštevy (podpis + záloha, potom odovzdanie + zaškolenie). Zmluva podpísaná v predajni ostáva zmluvou v prevádzke aj pri neskoršom odovzdaní.
   Nevýhoda: spotrebiteľ z druhého konca Slovenska musí prísť.
2. **Firmy a živnostníci kupujú v B2B režime** (prepínač „Nakupujem na IČO na podnikanie“). Nemajú zákonné odstúpenie; platí naša dobrovoľná politika (len nepoužitý stroj, po dohode, poplatok 10 %). Môžeme doplniť „vrátenie Gölz tovaru len so súhlasom dodávateľa“. IČO však nesmieme vynucovať od súkromných osôb (§ 52 ods. 2 OZ). Spotrebiteľa určuje účel nákupu, nie zaškrtnutie: pri B2B objednávke IČO overiť v ORSR/ŽRSR (aktívny subjekt, zhodné meno) a fakturovať na firmu; pri nezhode zákazníkovi zavolať a prípadne viesť ako spotrebiteľa.
3. **Doručenie spotrebiteľovi na diaľku** (ak ho ponecháme): náklady vrátenia platí spotrebiteľ, ak ich vopred uvedieme **pri každom stroji** (paletová preprava 100 až 200 €). Refundáciu môžeme zadržať, kým stroj nedorazí. Zníženie hodnoty vymáhame samostatne (nesmieme ho započítať). Dôkazy: výstupný protokol s motohodinami, fotky, výrobné číslo.
4. **Krátke okno pred objednávkou u Gölzu.** Odstúpenie pred objednaním u Gölzu nás stojí len poplatok Stripe. Stroj objednávame až po overení (do 1 pracovného dňa).
5. **Vrátený stroj** predať ako predvádzací alebo použitý (prípadne nasadiť do požičovne royalstroje.sk).

### R2 – Chybné alebo nedoručené poučenie (vysoké, právne)
Ak poučenie o odstúpení chýba alebo nie je na **trvanlivom médiu**, lehota sa predĺži až o 12 mesiacov a spotrebiteľ nezodpovedá za zníženie hodnoty (§ 20 ods. 3, § 21 ods. 4). Texty na webe máme. **Chýba e-mail s potvrdením objednávky a PDF (Resend).** Opatrenie: bez fungujúcich e-mailov nepredávať spotrebiteľom na diaľku.

### R3 – Reklamácie spotrebiteľov (stredné až vysoké, finančné)
2 roky + 12 mesiacov po prvej oprave, vada sa celé obdobie predpokladá od prevzatia, vybaviť najviac do 30 dní, **náklady prevzatia a vrátenia platí predajca** (§ 619, 620, 623 OZ). Diagnostiku pri neoprávnenej reklamácii spotrebiteľovi účtovať nemôžeme. Gölz platí dopravu len pri uznanom záručnom prípade.
Opatrenia:
1. **Pobočka ako predvolené miesto reklamácie** (formulár vyplní priamo na pobočke). Môžeme ju ponúknuť ako najrýchlejšiu cestu, ale u spotrebiteľa **nie ako podmienku**. Ak stroj privezie sám, môže si nárokovať náklady (§ 509). E-mail a online formulár musia ostať možné; povinný online formulár na reklamácie nie je, e-mail stačí.
2. **Dokázať, že nejde o vadu:** podpísaný záznam o zaškolení, slovenský návod, výstupný protokol (motohodiny, fotky, výrobné číslo). Dôkazné bremeno nesieme my.
3. **Od Gölzu písomne:** či preberá stroj priamo od zákazníka, kto platí partnera, dĺžka opravy voči našim 30 dňom (otázky v e-maile, vault: `Projects/RoyalShop/RoyalShop - Golz email reklamacie a dokumenty 2026-11-03.md`).
4. **B2B:** kupujúci dovezie stroj sám, 12 mesiacov, výluky opotrebenia, diagnostika podľa cenníka pri neoprávnenej reklamácii (platí už dnes, reklamačný poriadok časť B).

### R4 – Neplatné klauzuly v podmienkach (stredné, pokuta SOI)
Vety ako „vrátenie len nepoužitého stroja“, „odstúpenie len po dohode“, „reklamácia len osobne na pobočke“ či „neoprávnená reklamácia = poplatok“ sú voči spotrebiteľovi neplatné a pokutované. Prísnejšie pravidlá patria iba do B2B časti.

### R5 – Produktová zhoda (stredné, zákaz predaja)
Slovenský návod a bezpečnostné pokyny, vyhlásenie o zhode (CE), údaje výrobcu podľa GPSR pri každom produkte, registrácia výrobcu elektro a obalov (ISOH/OZV). Opatrenie: e-mail Gölzu (dokumenty, hmotnosti), preklady, registrácia pred spustením.

### R6 – Dodacia lehota (nízke až stredné)
Záväzne uvádzame „najneskôr do 10 pracovných dní“. SOI už pokutovala e-shop za nedodržanie hornej hranice. Opatrenie: lehota Gölzu pre každý model, pomalšie stroje s vlastnou lehotou.

### R7 – Ceny a zľavy (vyriešené)
Od 3. 11. 2026 bez zliav, iba cenníkové ceny. Pri budúcej akcii platí pravidlo najnižšej ceny za 30 dní (už implementované).

## 4. Rozhodnutia pre foundera

1. **Predaj spotrebiteľom:** (a) len osobne na predajni v Senci (rezervácia cez web, bez platby online), alebo (b) aj s doručením a 14-dňovým odstúpením, alebo (c) kombinácia: firmy online s doručením, spotrebitelia rezervácia + predaj na predajni. **Odporúčanie: (c).** Najviac znižuje riziko R1, zodpovedá procesu s Gölzom a firmám nechá pohodlný online nákup.
2. Zachovať doručenie spotrebiteľom pre vzdialených zákazníkov? Ak áno, s vysokými, vopred uvedenými nákladmi vrátenia.
3. Po odpovedi Gölzu upraviť reklamačný poriadok (miesto prevzatia, partner, lehoty).

## 5. Dopad na kód pri variante (c)

- Pokladňa: pre `customer_type = 'person'` namiesto platby „Odoslať nezáväznú rezerváciu“. Nový stav objednávky (rezervácia), admin ju po návšteve premení na predaj na mieste (zmluva, platba na predajni / terminál), faktúra.
- Firmy: bez zmeny (Stripe, doručenie), plus vyhlásenie o nákupe na podnikanie.
- Právne texty: VOP, odstúpenie (§ 20a funkcia ostáva pre prípadné zmluvy na diaľku), doprava a platba. `LEGAL_VERSION` zvýšiť.
