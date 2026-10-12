# Sortiment stavebných strojov (demo)

Stav k 12. 10. 2026. Katalóg v e-shope je vygenerovaný zo `supabase/seed-data/catalog.json` (zdroj pravdy). Tento prehľad slúži na doplnenie presných cien a overenie parametrov.

## Ako sú ceny nastavené

- **Trhová cena:** priemer alebo medián cien zo slovenských, českých a rakúsko-nemeckých e-shopov, prepočítaný na SK DPH 23 % (CZK/25, cudzia DPH odpočítaná). Zdroje sú v rešerši; nižšie je uvedená doména prvého zdroja.
- **Naša cena:** trhová cena −5 %, zaokrúhlená na …9 €. Tri produkty majú demo akciu (−10 až −14 %).
- **Nákupná cena:** zatiaľ len odhad z predvolenej marže dodávateľa (Unicon 20 %, Honda 15 %, Atlas Copco 18 %, Gölz/Cedima/Enar 22 %, Master 20 %). Po doplnení skutočných nákupných cien sa marža dopočíta sama.
- **Minimálna cena:** 800 € s DPH; seed odmietne lacnejší produkt.

## Dodávatelia

| Dodávateľ | Značky | Dodanie do Senca | Poznámka |
|---|---|---|---|
| UNICON OSTRAVA s.r.o. | Bomag, Grindex, NTC | 2–4 prac. dni | Autorizovaný predajca a servis NTC, distribútor Grindex, predáva aj Bomag. Halasova 2999/8A, 703 00 Ostrava-Vítkovice, unicon.cz. |
| Honda – autorizovaný distribútor SK | Honda | 1–3 prac. dni | Honda Motor Europe Limited Slovensko, o. z., Bratislava; v CZ BG Technik cs, a.s. |
| Atlas Copco s.r.o. | Atlas Copco | 3–5 prac. dni | Power Technique, čerpadlá WEDA. Elektrárenská 4, Bratislava. |
| Gölz GmbH | Gölz | 5–8 prac. dni | Priamo od výrobcu alebo cez Gölz Ges.m.b.H. Salzburg; v CZ SC Koutský, JKL servis. |
| CEDIMA GmbH | Cedima | 5–8 prac. dni | Priamo od výrobcu; v CZ cedima-diamant.cz, v SK predáva madmat.sk. |
| ENARCO S.A. | Enar | 6–10 prac. dni | Priamo od výrobcu; v SK predáva vibrotech.sk. |
| Dantherm S.p.A. (Master) | Master | 4–7 prac. dni | Výrobca; v SK STEFO TRADE (master-ohrievace.sk), v CZ MANEK stavební stroje. |

Dodacie lehoty sú odhad na demo, treba ich potvrdiť s dodávateľmi.


## Vibračná technika › Vibračné pechy

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| Bomag BT 60 Vibračný pech 58 kg (Honda GXR 120) | 2 489 € | 2 622 € | 1 619 € | elvaprofi.cz | Ceny v zdrojoch 2 035 – 3 786 €; časť parametrov z neprehľadného datasheetu. |
| NTC NT 64P Vibračný pech 64 kg (Honda GXR 120) | 2 719 € | 2 862 € | 1 768 € | eprofi.sk |  |
| NTC NT 72P Vibračný pech 72 kg (Honda GXR 120) | 2 859 € | 3 007 € | 1 860 € | eprofi.sk |  |
| NTC NT 76P Vibračný pech 76 kg (Honda GXR 120) | 3 179 € | 3 343 € | 2 068 € | eprofi.sk | V CZ lacnejší ako NT 72P (pravdepodobne akcia), použitá SK cena. |
| Bomag BT 65 Vibračný pech 68 kg (Honda GXR 120) | 3 739 € | 3 941 € | 2 432 € | naradiestroje.sk | Časť parametrov (rázová sila, zdvih) z neprehľadného datasheetu. |

## Vibračná technika › Jednosmerné vibračné dosky

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| Bomag BP 20/45 Jednosmerná vibračná doska 92 kg (Honda GX 160) | 1 779 € | 1 870 € | 1 157 € | dek.cz | Bez SK ceny (CZ/DE), dve DE ceny len zo snippetov. |
| NTC VD 20P Jednosmerná vibračná doska 105 kg (Honda GX 160) | 1 919 € | 2 016 € | 1 248 € | eprofi.sk |  |
| NTC VD 450/20 Jednosmerná vibračná doska 115 kg (Honda GX 160) | 2 149 € | 2 263 € | 1 398 € | ntcshop.cz | Jediný zdroj: cenník NTC. |
| NTC VD 24 Jednosmerná vibračná doska 110 kg (Honda GX 160) | 2 169 € | 2 279 € | 1 411 € | eprofi.sk |  |
| NTC VD 450/22 Jednosmerná vibračná doska 140 kg (Honda GX 160) | 2 539 € | 2 674 € | 1 651 € | eprofi.sk |  |
| Bomag BP 25/50 Jednosmerná vibračná doska 110 kg (Honda GX 160) | 3 069 € | 3 232 € | 1 996 € | naradiestroje.sk |  |

## Vibračná technika › Reverzné vibračné dosky

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| NTC VDR 22 Reverzná vibračná doska 120 kg (Honda GX 160) | 3 809 € (akcia, pôvodne 4 330 €) | 4 334 € | 2 477 € | eprofi.sk |  |
| NTC VDR 32 Reverzná vibračná doska 210 kg (Honda GX 200) | 5 299 € | 5 583 € | 3 446 € | eprofi.sk |  |
| Bomag BPR 25/50 Reverzná vibračná doska 140 kg (Honda GX 160) | 6 059 € | 6 378 € | 3 941 € | elvaprofi.cz | Bez SK ceny (CZ/DE). |
| Bomag BPR 35/60 Reverzná vibračná doska 205 kg (Honda GX 160) | 6 449 € | 6 790 € | 4 194 € | naradiestroje.sk |  |
| NTC VDR 32H Reverzná vibračná doska 215 kg (Hatz 1B20, diesel) | 7 749 € | 8 154 € | 5 040 € | eprofi.sk |  |
| NTC VDR 52 Reverzná vibračná doska 340 kg (Honda GX 270) | 8 199 € | 8 630 € | 5 333 € | eprofi.sk |  |
| Bomag BPR 40/60 D Reverzná vibračná doska 260 kg (Hatz 1B20, diesel) | 9 459 € | 9 962 € | 6 152 € | naradiestroje.sk |  |
| NTC VDR 63HE Reverzná vibračná doska 450 kg (Hatz 1B50, diesel) | 11 299 € | 11 892 € | 7 349 € | eprofi.sk |  |
| Bomag BPR 60/65 D Reverzná vibračná doska 460 kg (Hatz 1B40, diesel) | 13 579 € | 14 291 € | 8 832 € | naradiestroje.sk |  |

## Elektrocentrály › Jednofázové elektrocentrály

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| Honda EU22i Jednofázová invertorová elektrocentrála 2,2 kVA | 1 569 € | 1 649 € | 1 084 € | boel.sk |  |
| NTC TR 5 AVR Jednofázová elektrocentrála 5,0 kVA | 1 729 € | 1 819 € | 1 125 € | ntcshop.cz | Bez SK ceny (e-shop NTC + CZ predajca). |
| NTC TR 7 AVR Jednofázová elektrocentrála 7,0 kVA | 2 089 € | 2 205 € | 1 359 € | ntcshop.cz | Bez SK ceny; bez fotky (NTC používa fotku TR 5). |
| Honda EG5500CL Jednofázová elektrocentrála 5,5 kVA | 2 139 € | 2 255 € | 1 478 € | boel.sk |  |
| Honda EM5500CXS Jednofázová elektrocentrála 5,5 kVA | 2 729 € | 2 869 € | 1 886 € | boel.sk |  |
| Honda EU32i Jednofázová invertorová elektrocentrála 3,2 kVA | 3 309 € (akcia, pôvodne 3 680 €) | 3 679 € | 2 287 € | boel.sk |  |
| Honda EU70is Jednofázová invertorová elektrocentrála 7,0 kVA | 4 809 € | 5 059 € | 3 323 € | boel.sk |  |

## Elektrocentrály › Trojfázové elektrocentrály

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| NTC TRT 6,5 AVR Trojfázová elektrocentrála 7,0 kVA | 2 189 € | 2 306 € | 1 424 € | ntcshop.cz | Bez SK ceny. |
| NTC TRT 15E AVR Trojfázová elektrocentrála 15,0 kVA | 5 609 € | 5 908 € | 3 648 € | ntcshop.cz | Bez SK ceny. |

## Čerpadlá › Ponorné čerpadlá 230 V

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| Atlas Copco WEDA D08N Ponorné odvodňovacie čerpadlo 230 V, 325 l/min | 969 € | 1 021 € | 646 € | eshop.kolex.sk | Bez fotky; prietok/výtlak zo staršieho prospektu. |
| Grindex Mini Ponorné odvodňovacie čerpadlo 230 V, 360 l/min | 1 389 € | 1 464 € | 903 € | e-cerpadla.cz | Bez fotky; bez SK distribútora (v CZ Unicon), ceny z AT/NL. |
| Atlas Copco WEDA D10N Ponorné odvodňovacie čerpadlo 230 V, 483 l/min | 1 889 € | 1 990 € | 1 259 € | eshop.kolex.sk | Bez fotky; prietok/výtlak zo staršieho prospektu. |
| Grindex Minex Ponorné odvodňovacie čerpadlo 230 V, 696 l/min | 2 639 € | 2 783 € | 1 716 € | eshop.empl.at | Bez fotky; priemer dvoch zdrojov AT/NL. |
| Grindex Minette Ponorné odvodňovacie čerpadlo 230 V | 3 639 € | 3 830 € | 2 367 € | bst-hornstein.at | Bez fotky; priemer dvoch zdrojov AT/NL. |
| Atlas Copco WEDA S30N Kalové čerpadlo 230 V, 800 l/min | 4 069 € | 4 282 € | 2 713 € | eshop.kolex.sk | Bez fotky; parametre z austrálskeho listingu (240 V). |

## Čerpadlá › Ponorné čerpadlá 400 V

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| Atlas Copco WEDA D30N Ponorné odvodňovacie čerpadlo 400 V, 822 l/min | 3 079 € | 3 247 € | 2 053 € | eshop.kolex.sk | Bez fotky. |
| Atlas Copco WEDA D40N Ponorné odvodňovacie čerpadlo 400 V, 1 320 l/min | 3 099 € | 3 265 € | 2 066 € | manek.cz | Bez fotky. |
| Grindex Major N Ponorné odvodňovacie čerpadlo 400 V, 2 310 l/min | 6 489 € | 6 828 € | 4 220 € | eshop.empl.at | Bez fotky; ceny z AT/CZ. |
| Atlas Copco WEDA D51N Ponorné odvodňovacie čerpadlo 400 V, 2 200 l/min | 7 139 € | 7 515 € | 4 759 € | eshop.kolex.sk | Bez fotky; prietok/výtlak len približné (švédsky predajca). |

## Čerpadlá › Motorové čerpadlá

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| Honda WH20 Motorové vysokotlakové čerpadlo 2", výtlak 50 m | 919 € | 969 € | 635 € | romerx.sk | Bez fotky. |
| Honda WT30 Motorové kalové čerpadlo 3", 1 210 l/min | 1 859 € | 1 955 € | 1 285 € | naradiestroje.sk |  |
| Honda WT40 Motorové kalové čerpadlo 4", 1 640 l/min | 2 709 € | 2 850 € | 1 872 € | cerpadla.heureka.sk |  |

## Rezacia technika › Rezače škár

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| NTC RZ 123 Rezač škár, kotúč 350 mm (Honda GX 200) | 1 899 € | 1 996 € | 1 235 € | eprofi.sk |  |
| Gölz FS125 Rezač škár, kotúč 350 mm (Honda GX 200) | 1 959 € | 2 066 € | 1 242 € | goelz-shop.com |  |
| Gölz FS170 Rezač škár, kotúč 500 mm (Honda GX 390) | 2 569 € | 2 707 € | 1 629 € | goelz-shop.com |  |
| NTC RZ 170 Rezač škár, kotúč 450 mm (Honda GX 390) | 2 809 € | 2 961 € | 1 827 € | eprofi.sk |  |
| NTC RZ 200 Rezač škár, kotúč 500 mm (Honda GX 390) | 2 929 € | 3 079 € | 1 905 € | eprofi.sk |  |
| NTC RZ 202 Rezač škár, kotúč 500 mm (Honda GX 390) | 3 339 € | 3 512 € | 2 172 € | eprofi.sk |  |
| Gölz FS170E Rezač škár, kotúč 500 mm (400 V) | 3 859 € | 4 059 € | 2 447 € | goelz-shop.com |  |
| Gölz FS190 Rezač škár, kotúč 500 mm (Honda GX 390) | 6 999 € | 7 368 € | 4 438 € | goelz-shop.com |  |
| Gölz FS30E Rezač škár, kotúč 800 mm (400 V) | 7 379 € | 7 769 € | 4 679 € | goelz-shop.com |  |

## Rezacia technika › Stolové píly

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| Cedima CTS-56.2 Stolová píla, kotúč 400 mm, 230 V | 969 € | 1 023 € | 614 € | bauportal24h.de | Jediný zdroj (DE, možno akciová cena). |
| Cedima CTS-175.2 Stolová píla, kotúč 450 mm, 230 V | 1 589 € | 1 677 € | 1 008 € | bauportal24h.de |  |
| Cedima CTS-57 G Stolová píla, kotúč 400 mm, 230 V | 1 649 € | 1 734 € | 1 046 € | madmat.sk | Hĺbka rezu: 105 mm (Cedima) vs. 125 mm (SK predajca). |
| Cedima CTS-200 Stolová píla, kotúč 500 mm, 400 V | 2 339 € | 2 460 € | 1 483 € | bauportal24h.de |  |
| Cedima CTS-81 L Stolová píla na dlažbu, dĺžka rezu 1 200 mm | 2 339 € | 2 459 € | 1 483 € | madmat.sk |  |
| Cedima CTS-265.2 Píla na murovacie bloky, kotúč 650 mm, 400 V | 4 179 € | 4 398 € | 2 650 € | madmat.sk | Rozptyl cien 3 813 € (DE) – 5 992 € (SK). |

## Rezacia technika › Rozbrusovačky a jadrové vŕtanie

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| Gölz HS400S Elektrická rozbrusovačka, kotúč 400 mm, 230 V | 1 909 € | 2 015 € | 1 211 € | goelz-shop.com |  |
| Gölz SD250 + EDM25 Jadrová vŕtacia súprava do Ø 250 mm | 2 529 € | 2 665 € | 1 604 € | goelz-shop.com | Jediný zdroj; motor uvádzaný ako EDM25 aj EDM22L; hmotnosť neznáma. |

## Vibrátory do betónu

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| Enar VIB-BAR Prenosný benzínový vibrátor do betónu | 1 209 € | 1 276 € | 767 € | eprofi.sk | Nejasné, či ohybný hriadeľ a hlavica sú v cene. |
| Enar BACKPACK H Chrbtový benzínový vibrátor, súprava s hlavicou Ø 40 mm | 1 239 € | 1 303 € | 786 € | vibrotech.sk |  |
| Enar i-SPYDER 2V 50 B Vysokofrekvenčný vibrátor 230 V, hlavica Ø 50 mm | 1 509 € | 1 586 € | 957 € | vibrotech.sk |  |
| Enar i-SPYDER 2V 70 B Vysokofrekvenčný vibrátor 230 V, hlavica Ø 65 mm | 1 579 € | 1 661 € | 1 001 € | vibrotech.sk | Priemer hlavice 65 mm (Enar) vs. 68 mm (predajca). |
| Enar AFGH 2000 + M 38 AFP Benzínový VF generátor s vibrátorom, súprava | 2 769 € | 2 915 € | 1 756 € | vibrotech.sk | Jediný zdroj ceny. |

## Odvlhčovače a ohrievače › Odvlhčovače

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| Master DH 26 Stavebný odvlhčovač 27 l/24 h | 1 419 € | 1 497 € | 923 € | master-ohrievace.sk |  |
| Master DHP 55 Stavebný odvlhčovač 45,9 l/24 h | 1 669 € | 1 762 € | 1 086 € | master-ohrievace.sk |  |
| Master DH 44 Stavebný odvlhčovač 41 l/24 h | 1 929 € | 2 031 € | 1 255 € | master-ohrievace.sk |  |
| Master DH 62 Stavebný odvlhčovač 52 l/24 h | 2 049 € | 2 163 € | 1 333 € | master-ohrievace.sk |  |
| Master DH 92 Stavebný odvlhčovač 80 l/24 h | 2 739 € | 2 889 € | 1 781 € | master-ohrievace.sk | Príkon 1,2 kW (výrobca) vs. 1,6 kW (SK predajca). |

## Odvlhčovače a ohrievače › Ohrievače

| Produkt | Naša cena | Trh | Nákup bez DPH (odhad) | Zdroj ceny | Na overenie |
|---|---:|---:|---:|---|---|
| Master B 150 CED Naftový ohrievač s priamym ohrevom 44 kW | 829 € | 875 € | 539 € | master-ohrievace.sk | Tesne nad hranicou 800 €. |
| Master XL 61 Naftový infračervený ohrievač 17 kW | 1 009 € | 1 063 € | 656 € | master-ohrievace.sk |  |
| Master BV 77 E Naftový ohrievač s nepriamym ohrevom 21 kW | 1 249 € | 1 318 € | 812 € | master-ohrievace.sk |  |
| Master BV 110 E Naftový ohrievač s nepriamym ohrevom 34 kW | 1 819 € (akcia, pôvodne 2 120 €) | 2 121 € | 1 183 € | master-ohrievace.sk |  |
| Master B 30 EPR Elektrický ohrievač 400 V 30 kW | 1 859 € | 1 956 € | 1 209 € | master-ohrievace.sk |  |
| Master B 230 Naftový ohrievač s priamym ohrevom 65 kW | 2 029 € | 2 137 € | 1 320 € | master-ohrievace.sk |  |
| Master BV 170 E Naftový ohrievač s nepriamym ohrevom 49 kW | 2 279 € | 2 400 € | 1 482 € | master-ohrievace.sk |  |
| Master XL 91 Naftový infračervený ohrievač 43 kW | 2 589 € | 2 728 € | 1 684 € | master-ohrievace.sk |  |
| Master BV 290 E Naftový ohrievač s nepriamym ohrevom 85 kW | 2 969 € | 3 123 € | 1 931 € | master-ohrievace.sk |  |

## Čo zostáva pred ostrým predajom

- Skutočné nákupné ceny a dohodnuté marže od dodávateľov (nahradia odhad).
- Fotky: 12 produktov nemá oficiálnu fotku (čerpadlá Atlas Copco a Grindex, Honda WH20, NTC TR 7 AVR). Použitie fotiek výrobcov treba potvrdiť (dealerský media kit).
- EAN kódy: nie sú doplnené pri žiadnom produkte.
- GPSR: overiť presný právny názov výrobcu na typovom štítku (Master: Dantherm S.p.A. vs. Dantherm Group S.p.A.) a e-mail pre Enar.
- Vyradené z návrhu: trojfázové „Honda“ ECT/ECMT 7000G (vyrába ich pravdepodobne Generga, nie Honda), Grindex Master N (len odhad ceny), Gölz SF150 (na hranici 800 €), Enar AVMU/Dingo (pod 800 €).
