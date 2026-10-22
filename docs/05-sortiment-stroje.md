# Sortiment stavebných strojov (demo)

Stav k 22. 10. 2026. Sortiment NTC, Bomag, Honda a Enar = zeleno označené riadky v zošite „Royal Shop Cenniky.xlsx“ od foundera (cenníky dodávateľa Unicon Ostrava) + doplnky podľa foundera (Bomag BPR 45/55 DE a 60/65 DE, motory Honda GX, Enar Dingo v súpravách). Atlas Copco zostáva z pôvodného zoznamu Unicon; Cedima a Husqvarna boli 22. 10. odstránené. Katalóg v e-shope sa generuje zo `supabase/seed-data/catalog.json` (zdroj pravdy).

## Ako sú ceny nastavené

- **NTC, Bomag, Honda, Enar:** predajná cena = odporúčaná koncová cena z cenníka (CZK ÷ 24,26 = EUR bez DPH, zaokrúhlené na centy, × 1,23), presne ako stĺpec „Cena s DPH 23 % (EUR)“ v zošite. Súprava Enar Dingo = súčet pohonnej jednotky DINGO a hriadeľa TAX-TDX 3/AX58 resp. 5/AX58.
- **Atlas Copco:** „cena na požiadanie“ (príznak `price_on_request`), kým nepríde cenník. Fiktívna cena ostáva v katalógu, ale nezobrazuje sa a produkt sa nedá kúpiť online. Po doplnení cien stačí v `catalog.json` zmazať `price_on_request` a nastaviť cenu.
- **Nákupná cena:** zatiaľ cena bez DPH × 0,8 (predvolená marža Unicon 20 %), lebo rabat v zošite je 0 %. Po dohodnutí rabatu treba prepočítať.
- Demo akcie (preškrtnuté ceny) boli 22. 10. zrušené.
- **Motory Honda GX** v konkrétnom variante z cenníka: GX120T3-QX-4E-OH, GX160H2-QX-3-OH, GX200H2-QX-3-OH, GX270T2-QH-B1-OH, GX390T2-QH-B1-OH (GX270/390 v type QX v cenníku nie sú).
- Odstránené 22. 10.: NTC NT 76 a NT 76P (nahradené NT 64P a NT 72P), Bomag BP 12/35, Honda EM30.
- **Gölz (od 22. 10. 2026, 12 strojov, dodávateľ priamo Gölz GmbH):** predajné ceny sú skutočné ceny bez DPH z golzgroup.com od foundera, s DPH 23 % presne dopočítané (bez zaokrúhlenia na …9). Nákupná cena je odhad: cena bez DPH × 0,78 (marža 22 %), kým nebude známy rabat od Gölz. Fotky a parametre sú z golzgroup.com.

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
| Brúsky na betón | Gölz SM250 Brúska na betón, Ø 250 mm, 230 V | 2 699,85 € | 1 712 € | áno |
| Brúsky na betón | Gölz SM280 Brúska na betón, Ø 280 mm, 230 V | 4 305 € | 2 730 € | áno |
| Motory | Honda GX 160 Benzínový motor 4,8 HP | 553,45 € | 360 € | áno |
| Motory | Honda GX 120 Benzínový motor 3,2 HP | 591,93 € | 385 € | áno |
| Motory | Honda GX 200 Benzínový motor 5,8 HP | 592,39 € | 385 € | áno |
| Motory | Honda GX 270 Benzínový motor 8,4 HP | 799,09 € | 520 € | áno |
| Motory | Honda GX 390 Benzínový motor 11,7 HP | 1 079,42 € | 702 € | áno |
| Príslušenstvo | NTC Tlmiaca doska pre vibračné dosky VD 450 | 182,52 € | 119 € | áno |
| Príslušenstvo | NTC Podvozok pre vibračné dosky VD 350 a VD 450 | 184,55 € | 120 € | áno |

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
- Fotky: Atlas Copco WEDA D10N nemá fotku; fotky čerpadiel Atlas Copco a Enar Dingo sú od predajcov. Použitie fotiek výrobcov treba potvrdiť.
- Detailná rešerš pôvodného sortimentu (12. 10.) je v `docs/research-sortiment/`.
