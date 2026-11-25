# Sortiment stavebných strojov (demo)

Stav k 22. 10. 2026. Sortiment NTC, Bomag, Honda a Enar = zeleno označené riadky v zošite „Royal Shop Cenniky.xlsx“ od foundera (cenníky dodávateľa Unicon Ostrava) + doplnky podľa foundera (Bomag BPR 45/55 DE a 60/65 DE, motory Honda GX, Enar Dingo v súpravách). Atlas Copco zostáva z pôvodného zoznamu Unicon; Cedima a Husqvarna boli 22. 10. odstránené. Katalóg v e-shope sa generuje zo `supabase/seed-data/catalog.json` (zdroj pravdy).

**Od 7. 11. 2026 e-shop zobrazuje len Gölz** (`SHOP_BRANDS` v `src/lib/shop-brands.ts`): 12 strojov + 9 diamantových kotúčov. Honda je skrytá, kým Honda nepotvrdí spoluprácu; ostatné značky ostávajú v databáze skryté. Pri jednej značke menu ukazuje podkategórie a úvod sekciu „Výrobca“ so všetkými strojmi; po zapnutí ďalších značiek sa web sám vráti k pôvodnému rozloženiu. Fotky strojov sú od Gölz (Klaus Schlör, 7. 11.), prevedené skriptom `scripts/convert-product-photos.mjs`, originály v git-ignorovanom `originals/`.

## Ako sú ceny nastavené

- **NTC, Bomag, Honda, Enar:** predajná cena = odporúčaná koncová cena z cenníka (CZK ÷ 24,47 = EUR bez DPH; kurz ČNB z 20. 11. 2026, pri zmene kurzu prepočítať: `docs/cenniky/data/zdroje.json`, `scripts/honda-engines.py`, `supabase/snippets/2026-11-20-unicon-prices.sql`, zaokrúhlené na centy, × 1,23), presne ako stĺpec „Cena s DPH 23 % (EUR)“ v zošite. Súprava Enar Dingo = súčet pohonnej jednotky DINGO a hriadeľa TAX-TDX 3/AX58 resp. 5/AX58.
- **Atlas Copco:** „cena na požiadanie“ (príznak `price_on_request`), kým nepríde cenník. Fiktívna cena ostáva v katalógu, ale nezobrazuje sa a produkt sa nedá kúpiť online. Po doplnení cien stačí v `catalog.json` zmazať `price_on_request` a nastaviť cenu.
- **Nákupná cena:** zatiaľ cena bez DPH × 0,8 (predvolená marža Unicon 20 %), lebo rabat v zošite je 0 %. Po dohodnutí rabatu treba prepočítať.
- Demo akcie (preškrtnuté ceny) boli 22. 10. zrušené.
- **Motory Honda GX** v konkrétnom variante z cenníka: GX120T3-QX-4E-OH, GX160H2-QX-3-OH, GX200H2-QX-3-OH, GX270T2-QH-B1-OH, GX390T2-QH-B1-OH (GX270/390 v type QX v cenníku nie sú).
- Odstránené 22. 10.: NTC NT 76 a NT 76P (nahradené NT 64P a NT 72P), Bomag BP 12/35, Honda EM30.
- **Gölz (od 22. 10. 2026, 12 strojov, dodávateľ priamo Gölz GmbH):** predajné ceny sú skutočné ceny bez DPH z golzgroup.com od foundera, s DPH 23 % presne dopočítané (bez zaokrúhlenia na …9). Nákupná cena je odhad: cena bez DPH × 0,78 (marža 22 %), kým nebude známy rabat od Gölz. Fotky a parametre sú z golzgroup.com.

- **Diamantové kotúče Gölz (od 7. 11. 2026):** cena = cena na ferrotech.sk s DPH + 5 %. Ferrotech má v našich priemeroch len LB20 400, TS40GX 400 a LCA65 500; ostatných 6 priemerov je **odhad** z cien nemeckých predajcov Gölz (goelz-shop.com má SLF10 230 za 56,00 €, ferrotech za 55,51 €, teda rovnaká úroveň), tiež + 5 %. Pôvod ceny je pri každom kotúči v `catalog.json` (`price_source`). Nákupná cena je odhad ako pri strojoch (bez DPH × 0,78). Kotúč je priradený strojom cez `accessory_for` (v DB `related_products` typ `accessory`) a ponúka sa vo výbere „Vyberte si diamantový kotúč“ na stránke stroja. SQL pre hostovanú DB: `supabase/snippets/2026-11-07-golz-diamond-blades.sql` (spustené 7. 11.).

## Produkty

| Kategória | Produkt | Naša cena | Nákup bez DPH (odhad) | Fotka |
|---|---|---:|---:|---|
| Vibračná technika › Vibračné pechy | NTC NT 64P Vibračný pech 64 kg (Honda GXR 120) | 2 915,30 € | 1 896 € | áno |
| Vibračná technika › Vibračné pechy | NTC NT 72P Vibračný pech 72 kg (Honda GXR 120) | 3 118,10 € | 2 028 € | áno |
| Vibračná technika › Vibračné pechy | Bomag BT 65 Vibračný pech 68 kg (Honda GXR 120) | 3 720,92 € | 2 420 € | áno |
| Vibračná technika › Jednosmerné vibračné dosky | NTC VD 12P Jednosmerná vibračná doska 60 kg (Honda GX 120) | 1 875,92 € | 1 220 € | áno |
| Vibračná technika › Jednosmerné vibračné dosky | NTC VD 15 Jednosmerná vibračná doska 85 kg (Honda GX 160) | 2 104,07 € | 1 368 € | áno |
| Vibračná technika › Jednosmerné vibračné dosky | NTC VD 18 Jednosmerná vibračná doska 95 kg (Honda GX 160) | 2 129,43 € | 1 385 € | áno |
| Vibračná technika › Jednosmerné vibračné dosky | NTC VD 24 Jednosmerná vibračná doska 110 kg (Honda GX 160) | 2 256,19 € | 1 467 € | áno |
| Vibračná technika › Jednosmerné vibračné dosky | Bomag BP 20/45 Jednosmerná vibračná doska 92 kg (Honda GX 160) | 2 311,96 € | 1 504 € | áno |
| Vibračná technika › Jednosmerné vibračné dosky | NTC VD 450/22 Jednosmerná vibračná doska 140 kg (Honda GX 160) | 2 813,90 € | 1 830 € | áno |
| Vibračná technika › Jednosmerné vibračné dosky | Bomag BP 25/50 Jednosmerná vibračná doska 110 kg (Honda GX 160) | 3 135,33 € | 2 039 € | áno |
| Vibračná technika › Reverzné vibračné dosky | NTC VDR 26 Reverzná vibračná doska 160 kg (Honda GX 200) | 5 196,82 € | 3 380 € | áno |
| Vibračná technika › Reverzné vibračné dosky | NTC VDR 32 Reverzná vibračná doska 210 kg (Honda GX 200) | 5 729,18 € | 3 726 € | áno |
| Vibračná technika › Reverzné vibračné dosky | Bomag BPR 25/50 Reverzná vibračná doska 140 kg (Honda GX 160) | 6 776,16 € | 4 407 € | áno |
| Vibračná technika › Reverzné vibračné dosky | Bomag BPR 35/60 Reverzná vibračná doska 205 kg (Honda GX 160) | 7 274,04 € | 4 731 € | áno |
| Vibračná technika › Reverzné vibračné dosky | Bomag BPR 60/65 DE Reverzná vibračná doska 460 kg (Hatz 1B40, diesel) | 13 973,64 € | 9 089 € | áno |
| Vibračná technika › Reverzné vibračné dosky | Bomag BPR 45/55 DE Reverzná vibračná doska 400 kg (Kohler KD 15 440, diesel) | 14 079,60 € | 9 157 € | áno |
| Elektrocentrály › Jednofázové elektrocentrály | Honda EC 3000G Jednofázová elektrocentrála 3,0 kVA | 1 130,94 € | 736 € | áno |
| Elektrocentrály › Jednofázové elektrocentrály | Honda EC 3000G AVR Jednofázová elektrocentrála 3,0 kVA s AVR | 1 361,36 € | 885 € | áno |
| Elektrocentrály › Jednofázové elektrocentrály | Honda EU32i Jednofázová invertorová elektrocentrála 3,2 kVA | 3 351,68 € | 2 180 € | áno |
| Elektrocentrály › Trojfázové elektrocentrály | Honda ECT 7000G Trojfázová elektrocentrála 7,0 kVA | 2 262,27 € | 1 471 € | áno |
| Elektrocentrály › Trojfázové elektrocentrály | Honda ECT 7000G AVR Trojfázová elektrocentrála 7,0 kVA s AVR | 2 597,45 € | 1 689 € | áno |
| Elektrocentrály › Trojfázové elektrocentrály | Honda TP 15 HP AVR Trojfázová elektrocentrála 15,0 kVA s podvozkom | 7 248,54 € | 4 714 € | áno |
| Čerpadlá › Ponorné čerpadlá 230 V | Atlas Copco WEDA D04BN Ponorné čerpadlo na zvyškovú vodu 230 V, 225 l/min | na požiadanie | – | áno |
| Čerpadlá › Ponorné čerpadlá 230 V | Atlas Copco WEDA S08N Ponorné kalové čerpadlo 230 V, 317 l/min | na požiadanie | – | áno |
| Čerpadlá › Ponorné čerpadlá 230 V | Atlas Copco WEDA D10N Ponorné odvodňovacie čerpadlo 230 V, 483 l/min | na požiadanie | – | nie |
| Čerpadlá › Ponorné čerpadlá 230 V | Atlas Copco WEDA D30N Ponorné odvodňovacie čerpadlo 230 V, 820 l/min | na požiadanie | – | áno |
| Čerpadlá › Motorové čerpadlá | Honda WT20 Motorové kalové čerpadlo 2", 710 l/min | 1 495,67 € | 973 € | áno |
| Čerpadlá › Motorové čerpadlá | Honda WT30 Motorové kalové čerpadlo 3", 1 210 l/min | 2 104,07 € | 1 368 € | áno |
| Rezacia technika › Rezače škár | NTC RZ 120 Rezač škár, kotúč 350 mm (Honda GX 270) | 2 636,44 € | 1 715 € | áno |
| Rezacia technika › Rezače škár | Gölz FS125 Rezač škár, kotúč 350 mm (Honda GX 200) | 2 693,70 € | 1 708 € | áno |
| Rezacia technika › Rezače škár | NTC RZ 170 Rezač škár, kotúč 450 mm (Honda GX 390) | 2 839,25 € | 1 847 € | áno |
| Rezacia technika › Rezače škár | NTC RZ 200 Rezač škár, kotúč 500 mm (Honda GX 390) | 2 889,95 € | 1 880 € | áno |
| Rezacia technika › Rezače škár | Gölz FS170 Rezač škár, kotúč 500 mm (Honda GX 390) | 3 622,35 € | 2 297 € | áno |
| Rezacia technika › Stolové a blokové píly | Gölz MS400 Stolová píla na murivo, kotúč 400 mm, 230 V | 1 537,50 € | 975 € | áno |
| Rezacia technika › Stolové a blokové píly | Gölz TS250 Stolová píla na obklady a dlažbu, kotúč 250 mm, 230 V | 1 592,85 € | 1 010 € | áno |
| Rezacia technika › Stolové a blokové píly | Gölz TS250A Stolová píla na obklady a dlažbu s hliníkovým rámom, kotúč 250 mm, 230 V | 2 324,70 € | 1 474 € | áno |
| Rezacia technika › Stolové a blokové píly | Gölz BS650 Bloková píla, kotúč 650 mm, 400 V | 5 817,90 € | 3 689 € | áno |
| Rezacia technika › Stolové a blokové píly | Gölz BS900/1000 Bloková píla, kotúč 900/1 000 mm, 400 V | 6 396 € | 4 056 € | áno |
| Rezacia technika › Stolové a blokové píly | Gölz TS250A-330 Stolová píla na veľkoformátové obklady, dĺžka rezu 3 300 mm, 230 V | 6 629,70 € | 4 204 € | áno |
| Rezacia technika › Elektrické rozbrusovačky | Gölz HS350 Elektrická rozbrusovačka, kotúč 350 mm, 230 V | 1 260,75 € | 800 € | áno |
| Rezacia technika › Elektrické rozbrusovačky | Gölz HS400F Elektrická rozbrusovačka na rezy pri stene, kotúč 400 mm, 230 V | 1 765,05 € | 1 119 € | áno |
| Betonárska technika | Enar TAXE-TDXE 3/AX25 Ohybný hriadeľ 3 m s hlavicou Ø 25 mm | 376 € | 245 € | áno |
| Betonárska technika | Enar TAX-TDX 3/AX40 Ohybný hriadeľ 3 m s hlavicou Ø 40 mm | 377,36 € | 245 € | áno |
| Betonárska technika | Enar AVMU Pohonná jednotka pre ponorné vibrátory, 2 300 W, 230 V | 384,10 € | 250 € | áno |
| Betonárska technika | Enar TAXE-TDXE 5/AX25 Ohybný hriadeľ 5 m s hlavicou Ø 25 mm | 424,67 € | 276 € | áno |
| Betonárska technika | Enar TAX-TDX 5/AX40 Ohybný hriadeľ 5 m s hlavicou Ø 40 mm | 426,04 € | 277 € | áno |
| Betonárska technika | Enar DINGO Pohonná jednotka pre ponorné vibrátory, 2 300 W, 230 V | 435,52 € | 283 € | áno |
| Betonárska technika | Enar DINGO 230 V Elektrický vibrátor do betónu, hriadeľ 3 m, hlavica Ø 58 mm | 843,97 € | 549 € | áno |
| Betonárska technika | Enar DINGO 230 V Elektrický vibrátor do betónu, hriadeľ 5 m, hlavica Ø 58 mm | 892,64 € | 581 € | áno |
| Betonárska technika | Enar QZH Plávajúca vibračná lišta (Honda GX25) | 1 020,30 € | 664 € | áno |
| Rezacia technika › Diamantové kotúče | Gölz SLF10 Ø 250 × 25,4 mm, obklady a dlažba (TS250, TS250A, TS250A-330) | 60,38 € (odhad) | 38 € | áno |
| Rezacia technika › Diamantové kotúče | Gölz RX1S Ø 400 × 25,4 mm, murivo a kameň (MS400) | 187,95 € (odhad) | 119 € | áno |
| Rezacia technika › Diamantové kotúče | Gölz LB20 Ø 400 × 25,4 mm, betón a železobetón (MS400) | 115,33 € | 73 € | áno |
| Rezacia technika › Diamantové kotúče | Gölz BS30 Ø 650 × 60 mm, murivo a kameň (BS650) | 282,45 € (odhad) | 179 € | áno |
| Rezacia technika › Diamantové kotúče | Gölz BS30 Ø 900 × 60 mm, murivo a kameň (BS900/1000) | 376,95 € (odhad) | 239 € | áno |
| Rezacia technika › Diamantové kotúče | Gölz BS30 Ø 1 000 × 60 mm, murivo a kameň (BS900/1000) | 670,95 € (odhad) | 425 € | áno |
| Rezacia technika › Diamantové kotúče | Gölz LCA65 Ø 350 × 25,4 mm, betón a asfalt (FS125, HS350) | 141,75 € (odhad) | 90 € | áno |
| Rezacia technika › Diamantové kotúče | Gölz LCA65 Ø 500 × 25,4 mm, betón a asfalt (FS170) | 247,84 € | 157 € | áno |
| Rezacia technika › Diamantové kotúče | Gölz TS40GX Ø 400 × 25,4 mm so zapusteným upínaním, rezy pri stene (HS400F) | 206,13 € | 131 € | áno |
| Brúsky na betón | Gölz SM250 Brúska na betón, Ø 250 mm, 230 V | 2 699,85 € | 1 712 € | áno |
| Brúsky na betón | Gölz SM280 Brúska na betón, Ø 280 mm, 230 V | 4 305 € | 2 730 € | áno |
| Motory | Honda GX 160 Benzínový motor 4,8 HP | 553,45 € | 360 € | áno |
| Motory | Honda GX 120 Benzínový motor 3,2 HP | 591,93 € | 385 € | áno |
| Motory | Honda GX 200 Benzínový motor 5,8 HP | 592,39 € | 385 € | áno |
| Motory | Honda GX 270 Benzínový motor 8,4 HP | 799,09 € | 520 € | áno |
| Motory | Honda GX 390 Benzínový motor 11,7 HP | 1 079,42 € | 702 € | áno |
| Príslušenstvo | NTC Tlmiaca doska pre vibračné dosky VD 450 | 182,52 € | 119 € | áno |
| Príslušenstvo | NTC Podvozok pre vibračné dosky VD 350 a VD 450 | 184,55 € | 120 € | áno |


## Makita (od 12. 11. 2026)

Royal stroje je autorizovaný predajca Makita a tovar berie priamo. Stroje sa neudržiavajú ručne v `catalog.json`, ale importujú sa:

1. `docs/cenniky/MakitaTovary.xlsx` (denný export Makity, v gite nie je): kód, EAN, názov, odporúčaná cena s DPH, skladom áno/nie, skupina (M = stroje, A = príslušenstvo, P = náhradné diely).
2. `python scripts/makita-catalog.py`: vyberie živé stroje (M, okrem „Nevyrába sa“), spáruje ich podľa kódu so stránkami makita.sk a doplní fotky, parametre, popis, hmotnosť a návod. Výstup: `supabase/seed-data/makita.json` a fotky v `originals/makita/img`.
3. `npx tsx scripts/import-makita.ts`: zapíše produkty do databázy a fotky do úložiska `product-images` (dá sa spúšťať opakovane; produkty, ktoré z exportu vypadli, archivuje).

Stav 12. 11. 2026: 888 strojov, z toho 870 spárovaných s makita.sk, 754 skladom. Predajná cena = odporúčaná cena Makity. Chýba: nákupné ceny (zľava z odporúčanej ceny), súhlas Makity s použitím fotiek a textov, 18 strojov bez stránky na makita.sk (bez fotky), 68 bez hmotnosti (doprava sa im počíta v najvyššom pásme). Príslušenstvo (5 025) a náhradné diely (24 225) zatiaľ importované nie sú.

## Zmeny 24. 11. 2026: Gölz skrytý, Makita len akcia, AG náradie

- **Gölz** je skrytý (`HIDDEN_BRANDS` v `src/lib/shop-brands.ts`), kým sa nevyriešia povinnosti dovozcu (obaly, elektrozariadenia). Produkty ostávajú v databáze.
- **Makita**: predávajú sa len stroje z aktuálnej akcie. Kódy sú v `supabase/seed-data/makita-akcia.json` (vytiahnuté z akciového zošita v `docs/cenniky/`), `scripts/import-makita.ts` importuje len tie a ostatné archivuje. Predajnú cenu určil founder z akciového zošita (24. 11. 2026); výpočet a nákupné ceny sú v `docs/cenniky/makita-akcia.py` mimo gitu, do repozitára idú len výsledné predajné ceny s DPH. Akcia platí do 30. 11. 2026, potom treba ceny aj výber prehodnotiť. Zošit má 230 kódov, 186 z nich sú stroje v exporte; zvyšných 44 (akumulátory, nabíjačky, lampy, hadice) na webe nie je, lebo sa importujú len stroje.
- **AG náradie** (veľkoobchod pre e-shopy): dva XML feedy, cenník (kód, zásoba, cena bez DPH) a karty (názvy, texty, fotky, strom kategórií). Adresy feedov obsahujú náš prístupový token, sú len v `.env.local` a vo Verceli (`AG_PRICE_FEED_URL`, `AG_CARDS_FEED_URL`).
  - Výber: cena s DPH od 50 € (`supabase/seed-data/ag-config.json`), s fotkou a popisom, bez značky Makita. K 19. 11. 2026 je to 2 399 produktov, z toho 1 090 skladom.
  - Predajná cena = cena z feedu + 23 % DPH, kým AG nepotvrdí, či je cena vo feede nákupná. Nákupné ceny sa nezapisujú.
  - Importujú sa aj produkty, ktoré nie sú skladom; v katalógu a vyhľadávaní sú len tie skladom (`is_listed`), stránka vypredaného produktu ostáva a píše, že nie je dostupný.
  - Postup: `python scripts/ag-catalog.py` (feedy -> `supabase/seed-data/ag.json` + fotky v `originals/ag/img/`, oboje mimo gitu) -> `npx tsx scripts/import-ag.ts`. Sklad a ceny denne aktualizuje cron `/api/cron/ag-sklad` (`vercel.json`), ručne `npx tsx scripts/ag-sync.ts`. Keď feed nejde alebo je neúplný, nič sa nemení.
  - Kategórie: elektrické náradie ide do existujúcich kategórií podľa názvu, ostatné do nových sekcií (Ručné náradie, Inštalatérske náradie, Rezné náradie a brusivo, Stavebné náradie, Dielenské vybavenie, Zváranie a spájkovanie, Dom a hospodárstvo).
  - Na overenie s AG: čo je cena vo feede, ako často sa feedy obnovujú, dodacia lehota (v databáze odhad 2 až 4 dni), súhlas s fotkami a textami, údaje o výrobcoch pre GPSR.

## Nivel System (od 25. 11. 2026)

- Meracia technika Nivel System (poľský výrobca). Dodávateľ je slovenský dovozca 3gon Slovakia, s.r.o. (IČO 52367339, prevádzka Galanta), ktorý predáva na 3gonshop.sk. Royal stroje je autorizovaný predajca, dodanie do 2 dní.
- Predajná cena = cena s DPH na 3gonshop.sk (founder, 25. 11. 2026). Náš rabat (z ceny bez DPH) je len v `docs/cenniky/data/nivel-naklady.json` mimo gitu; import z neho zapisuje nákupné ceny do `product_costs`.
- Výber: rotačné lasery, krížové lasery, nivelačné prístroje a teodolity, diaľkomery a meracie kolieska, digitálne vodováhy; od 50 € s DPH (oceľové pásma vypadli). K 25. 11. 2026 je to 57 produktov, z toho 45 skladom; 12 „na objednávku“ sa predáva tiež, bez údaja o sklade.
- Sekcia „Meracia technika“ je odteraz hlavná kategória (predtým pod „Ostatné náradie“); laserové prístroje Makita a AG v nej ostávajú priamo.
- 3gon zatiaľ nemá feed. `python scripts/nivel-catalog.py` číta stránky 3gonshopu (cache v `originals/nivel/html`, `--cached` bez sťahovania) -> `supabase/seed-data/nivel.json` + fotky v `originals/nivel/img/` (oboje mimo gitu, kým 3gon nepotvrdí súhlas s textami a fotkami) -> `npx tsx scripts/import-nivel.ts`.
- Hmotnosť: stránky ju uvádzajú len pri 5 produktoch, ostatné majú odhad podľa skupiny (1 až 8 kg, kvôli dopravnému pásmu do 40 kg); na stránke produktu sa zobrazuje ako „Hmotnosť balenia“.
- Na overenie s 3gonom: súhlas s textami a fotkami, výrobca pre GPSR (meno a adresa), hmotnosti, trieda lasera, EAN, dĺžka záruky, návody v slovenčine, registrácia výrobcu EEZ a batérií (EPR), XML feed (Shoptet ho vie), z akej ceny sa počíta rabat a dodanie tovaru „na objednávku“.

### Príslušenstvo Nivel a údaje výrobcu (25. 11. 2026)

- Statívy a laty z 3gonshopu (podkategória „Statívy a nivelačné laty“ pod Meracou technikou): SJJ1, SJJ32, SJJ-M1 EX, SJJ-M10 MOTOR, LS-24, LS-35, TS-5, TS-50, TS-70 (všetky nad 50 €; ťažký drevený statív Nedo nie je Nivel). TS-5 je na 3gonshope „Momentálne nedostupné“, preto `in_stock = false` (nedá sa kúpiť a v ponuke pri prístroji sa neukazuje).
- Párovanie (stránka prístroja, „Odporúčané príslušenstvo“) berie výlučne zoznam „Odporúčané príslušenstvo“ zo stránky výrobcu nivelsystem.com/sk. Jediná výnimka: motorizovaný statív SJJ-M10 je podľa výrobcu „určený pre krížové lasery“ so závitom 5/8″ (nosnosť do 5 kg), preto ide ku všetkým krížovým laserom, ktoré majú podľa výrobcu závit 5/8″ (všetkých 27).
- Výsledok: krížové lasery dostanú SJJ-M1 EX a SJJ-M10 (okrem CL4 aj latu LS-24), rotačné lasery SJJ1, SJJ32, LS-24, LS-35, N24x/N32x SJJ1 + TS-50 + TS-70, EL-32 SJJ1 + TS-5, teodolity SJJ1, diaľkomery HDM statív SJJ-M1 EX.
- Zo stránky výrobcu sa tiež preberá úplná tabuľka parametrov (trieda lasera, závity, napájanie, rozmery, „Hmotnosť prístroja“), obsah balenia (do popisu) a odkazy na PDF návod a leták (EN/PL/DE, nie slovenčina, preto ostáva aj veta o slovenskom návode v balení). GPSR výrobca: TPI Sp. z o.o., Wał Miedzeszyński 598, Varšava (z pätičky nivelsystem.com), potvrdiť s 3gonom.

## Príslušenstvo NTC k vibračným doskám (25. 11. 2026)

- Všetky položky príslušenstva z cenníka NTC 2026 k doskám, ktoré predávame (VD 12P, VD 15, VD 18, VD 24, VD 450/22, VDR 26, VDR 32), okrem merača motohodín. Cena ako ostatné Unicon položky (CZK / 24,47 × 1,23), najlacnejšia 123,15 €. K rezačom škár a pechom cenník nemá iné príslušenstvo než merač motohodín.
- Každá položka je v `catalog.json` s `accessory_for` presne podľa riadku cenníka („pro VD 15“, „pro VDR 20, 22, 26, 32“ …), overené na ntcshop.cz. Do DB: `npx tsx scripts/sync-accessories.ts ntc` (seed nie je potrebný).
- Páka plynu radu Praktik NIE je priradená k VD 12P: v cenníku je VD 12P v tabuľke Praktik, ale na ntc.cz má vlastný rad „Mini“. Overiť s Unicon.
- Bez fotky (na ntcshop.cz nie je): sada skrápania VD 450, VD 12P, VDR 26 a páka plynu Klasik. Fotky ostatných sú z ntcshop.cz.

## Kompletný cenník motorov Honda (stránka Motory)

- Pod produktmi v kategórii Motory je tabuľka všetkých 181 variantov z cenníka motorov Honda (platí 1. 10. – 31. 12. 2026), cena = odporúčaná koncová cena s DPH (rovnaký prepočet ako zošit). Varianty mimo ponuky sa dopytujú e-mailom, 5 variantov v ponuke odkazuje na produkt.
- Dáta: `python scripts/honda-engines.py` z git-ignorovaného `docs/cenniky/data/honda-motory.csv` do `src/data/honda-engines.json` (len EUR ceny s DPH). **Nový cenník od 1. 1. 2027:** aktualizovať CSV, skript spustiť znova a upraviť `validFrom` / `validTo` v skripte.
- Vysvetlivka kódov (`src/components/shop/honda-engine-codes.tsx`): overené je len prvé písmeno typu = hriadeľ (Honda shop manual GX120/160/200 UT2 https://www.honda-engines-eu.com/files/files/shop-manual-gx120-160-200-ut2-en.pdf, technické listy https://www.honda-engines-eu.com/files/files/technical-sheet-gx160.pdf). Druhé písmeno (X = olejový snímač, H = bez), verzia „E…“ = elektrický štart, farba OH červená / SD čierna a T/H v modeli = závod Thajsko/Čína sú odvodené z oficiálnych dokumentov, Honda ich priamo nevysvetľuje, preto sú na webe formulované „zvyčajne“. Farba „9S“ (GX270UT2X-RH-Q6) je pravdepodobne chyba v cenníku.
## Na overenie s Unicon / founderom

- Skutočné nákupné ceny, dodacie lehoty do Senca, EAN kódy.
- **Honda EC 3000G, EC 3000G AVR, ECT 7000G, ECT 7000G AVR, TP 15 HP AVR** vyrába Generga (GENERGA Ltd., Energetiku 17, Kaunas, Litva) ("powered by Honda"), predáva ich český importér Honda (BG Technik). Pre GPSR treba uviesť skutočného výrobcu.
- **Honda EC 3000G:** menovitý výkon 2,5 kVA podľa hondastroje.cz, návod uvádza 3 kW; v e-shope 3,0 kVA max. / 2,5 kVA menovitý.
- **WEDA D04B** zo zoznamu = oficiálne WEDA D04BN. **WEDA D30N** je verzia 230 V (prietok a výtlak z austrálskeho dealera, cena odhad).
- **Enar Dingo:** zvolená hlavica AX 58 (alternatíva AX 48 je o ~20 € lacnejšia); overiť, akú zostavu Unicon dodáva.
- **Motory Honda GX:** zvolené varianty s hriadeľom typu Q (pozri vyššie); overiť s Unicon, či ide o bežne skladom dodávané typy.
- **Hriadele Enar** (TAXE-TDXE / TAX-TDX): jeden riadok cenníka pokrýva dve fyzicky odlišné verzie (koncovka pre AVMU vs. DINGO). V e-shope je to jeden produkt, verziu zákazník uvedie v poznámke k objednávke.
- **Enar QZH:** hliníkový profil QZ (2 / 3 / 4 m) nie je v ponuke; zvážiť jeho doplnenie, bez neho lišta nefunguje.
- **NTC tlmiaca doska VD 450:** pre stroje od v. č. 3000 môže existovať iný diel; **podvozok VD 350/450** (kód 30165A) nemá vlastnú fotku, použitá je fotka dielu 31930C (podvozok VD 450/20 a 450/22).
- **Gölz:** skutočný rabat a dodacia lehota do Senca. FS170 je vo verzii s motorom Honda GX 390 (existuje aj Kohler CH440). MS400: stránka uvádza dĺžku rezu 800 mm v hlavičke a 700 mm v tabuľke, v e-shope je 700 mm. TS250 sa dodáva s kotúčom SLF10 a SM250 s brúsnym tanierom CG250-M, ostatné bez nástrojov.
- **Kotúče Gölz:** skutočné ceny 6 odhadovaných priemerov; či ferrotech kód TS40GX401A je verzia so zapusteným upínaním (TK60, 6 × M6) pre HS400F; či blokové píly BS650 a BS900/1000 majú upínací otvor 60 mm (Gölz ich odporúča len s otvorom 60 mm); max. obvodová rýchlosť RX1S (štítok na fotke ~63 m/s, MS400 beží 58,6 m/s). Elektrické rozbrusovačky HS350/HS400F bežia ~83 m/s, preto k nim patria len kotúče na 100 m/s (LCA65, TS40GX, LB20). Brúsne nástroje k SM250/SM280 zatiaľ nie sú v ponuke. Fotka TS250A-330 má len 624 px. Podklady rešerše: ferrotech.sk `/eshop/diamantove-kotuce`, golzgroup.com (stránky strojov uvádzajú odporúčané kotúče).
- Fotky: Atlas Copco WEDA D10N nemá fotku; fotky čerpadiel Atlas Copco a Enar Dingo sú od predajcov. Použitie fotiek výrobcov treba potvrdiť.
- Detailná rešerš pôvodného sortimentu (12. 10.) je v `docs/research-sortiment/`.
