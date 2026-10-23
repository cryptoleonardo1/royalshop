# D – GDPR, cookies a súhlasy pre Royal Shop (stav k 23. 10. 2026)

> **Nejde o právne poradenstvo.** Podklad na prípravu textov a implementáciu. Pred spustením nechať skontrolovať advokátom. Sekundárne zdroje a miesta s neistotou sú označené **[NEISTÉ]**.
>
> **Overené z primárnych zdrojov (stiahnuté 23. 10. 2026):**
> - zákon 452/2021 Z. z., časová verzia **účinná od 18. 8. 2026 do 31. 12. 2026** (static.slov-lex.sk, `ZZ_2021_452_20260818.pdf`): § 109 ods. 8, § 116 ods. 3, 5, 6, 14, 15, 16 a pokuty,
> - zákon 431/2002 Z. z., časová verzia **účinná od 1. 6. 2026** (`ZZ_2002_431_20260601.pdf`): § 35 ods. 3,
> - Stanovisko RÚ (Úrad pre reguláciu elektronických komunikácií a poštových služieb) k § 109 ods. 8, vydané v spolupráci s ÚOOÚ (teleoff.gov.sk),
> - kontakt ÚOOÚ z dataprotection.gov.sk/sk/kontakt/,
> - DPA Supabase, Vercel, Stripe a Resend (ich webstránky).

---

## 0. Čo sa zmenilo v roku 2025–2026 a dve opravy k `docs/03`

| Téma | Stav k 10/2026 | Dopad na Royal Shop |
|---|---|---|
| **Digital Omnibus** (návrh Komisie z 19. 11. 2025: cookies sa presúvajú z ePrivacy do GDPR, nové čl. 88a/88b, odmietnutie jedným klikom, 6-mesačný zákaz opätovne žiadať súhlas, signály prehliadača) | **Neprijatý.** Prvé čítanie. V EP vyše 1 750 pozmeňujúcich návrhov, Rada nemá mandát. Podľa sekundárneho zdroja kompromisný text Rady z 3. 9. 2026 čl. 88a vypustil a pravidlá vrátil do ePrivacy. EP nemá zaujať pozíciu pred februárom 2027. **[NEISTÉ – sekundárne zdroje]** | **Dnes platí bez zmeny § 109 ods. 8 zákona 452/2021.** Neplánovať podľa návrhu. Časť Omnibusu o AI je podľa sekundárneho zdroja prijatá ako nariadenie (EÚ) 2026/1744 a cookies sa netýka. **[NEISTÉ]** |
| **Nariadenie ePrivacy** | Komisia návrh stiahla vo februári 2025 | Platí smernica 2002/58/ES transponovaná do § 109 ods. 8 |
| **EU-US Data Privacy Framework (DPF)** | **Platí.** Všeobecný súd ho 3. 9. 2025 potvrdil (T-553/23 *Latombe*). Odvolanie C-703/25 P je na Súdnom dvore, rozsudok sa čaká v rokoch 2027. Rozsudok Najvyššieho súdu USA *Trump v. Slaughter* (29. 6. 2026) oslabil nezávislosť FTC, o ktorú sa DPF opiera. **[NEISTÉ – sekundárne zdroje]** | Pri dodávateľoch z USA sa opierať o DPF **a zároveň mať SCC** ako záložný mechanizmus. DPA Vercel, Stripe aj Resend SCC obsahujú. |
| **EDPB Guidelines 2/2023** (technický rozsah čl. 5 ods. 3 ePrivacy), finálna verzia 7. 10. 2024 | Platí | Pravidlá sa vzťahujú aj na **localStorage**, pixely, sledovacie odkazy, fingerprinting a niektoré cookieless riešenia |

**Opravy k `docs/03-legislativa-research.md`:**
1. **Pokuta za cookies a e-mailový marketing nie je „až 10 % obratu“**, ale **od 200 € do 5 % obratu** za predchádzajúce účtovné obdobie. Ak obrat nemožno určiť, najviac 300 000 €. Ide o sankčné ustanovenie zákona 452/2021, ktoré vymenúva aj „§ 109 ods. 8“ a „§ 116 ods. 3 až 6, 8, 12, 14 až 16“. Číslo paragrafu sa z PDF nepodarilo spoľahlivo určiť. **[NEISTÉ – overiť]** Pokuty podľa GDPR (ÚOOÚ) sú popri tom až 20 mil. € alebo 4 % obratu.
2. **Adresa ÚOOÚ je dnes Galvaniho Business Centrum II, Galvaniho 7/B, 821 04 Bratislava.** Staré vzory na internete uvádzajú Hraničnú 12 a sú neaktuálne.
3. Lehota pri soft opt-in: § 116 **ods. 16** obmedzuje použitie kontaktu na **1 rok od skončenia zmluvného vzťahu**.

---

## 1. Inventár: aké údaje a úložiská e-shop naozaj používa (kód k 23. 10. 2026)

### 1.1 Údaje z pokladne (`src/components/shop/checkout-form.tsx`, `src/lib/checkout-actions.ts`)
| Pole | Povinné | Kam sa ukladá |
|---|---|---|
| typ zákazníka (`person` / `company`) | áno | `orders.customer_type` |
| meno, priezvisko | áno | `orders.billing` (JSON) |
| e-mail | áno | `orders.email`, posiela sa aj do Stripe (`customer_email`) |
| telefón | áno („pre kuriéra alebo pri doručení stroja“) | `orders.phone` |
| obchodné meno, IČO, DIČ, IČ DPH (len firma) | áno pre firmu | `orders.company` |
| ulica, mesto, PSČ | áno | `orders.billing` |
| iná doručovacia adresa: meno príjemcu alebo firma, ulica, mesto, PSČ | voliteľné (pri osobnom odbere sa nezbiera) | `orders.shipping_address` |
| spôsob dopravy (`courier` / `pickup_senec`) | áno | `orders.shipping_method` |
| poznámka | nie | `orders.customer_note` |
| súhlas s VOP a reklamačným poriadkom (checkbox `terms`) | áno | `orders.terms_version`, `orders.terms_accepted_at` |

Ďalej sa ukladajú položky objednávky, história stavov, platby a **`payment_events.payload` = celý Stripe event** (`src/app/api/webhooks/stripe`). Ten obsahuje aj e-mail, meno a fakturačné údaje z karty, posledné 4 číslice a krajinu karty. Pre túto tabuľku treba nastaviť retenciu a zvážiť, či ukladať celý payload.
Objednávka je dostupná cez URL s tokenom `?t=access_token`. Nejde o cookie, ale token môže skončiť v logoch Vercelu a v hlavičke `Referer`. Odporúčam `Referrer-Policy: no-referrer` (alebo `strict-origin`) na `/objednavka/*`.
**IP adresu ani user-agent aplikácia neukladá.** Ukladajú sa len v platformových logoch Vercelu a Supabase.

Plánované podľa `docs/04` (dátový model): `profiles` (vrátane `marketing_consent`), `addresses`, `companies`, `returns`, `claims`, `claim_attachments` (fotky), `claim_messages`, `test_reports` (sériové čísla a fotky strojov), `notifications_log` (e-maily a WhatsApp), `activity_log`, `cart_items`. Administrácia bude v samostatnom CRM „RCC“ toho istého prevádzkovateľa.

### 1.2 Cookies, localStorage a tretie strany
| Prvok | Stav v kóde | Kvalifikácia podľa § 109 ods. 8 |
|---|---|---|
| **Supabase auth cookies** (`sb-<ref>-auth-token`, prípadne rozdelené na `.0` a `.1`) | Klienti `src/lib/supabase/server.ts` a `client.ts` **existujú, ale nikde sa nevolajú**. Nie je tu prihlásenie ani `proxy.ts`. **Dnes sa nenastavujú.** | Po spustení účtov ide o **nevyhnutné cookies** (prihlásenie, ktoré si používateľ vyžiadal). Platnosť určuje knižnica @supabase/ssr. **[NEISTÉ – zistiť skutočnú `maxAge` po implementácii]** |
| **localStorage `royal-cart-v1`** (`src/lib/cart-store.ts`): slug, názov, SKU, cena, obrázok, množstvo | Áno. Bez osobných údajov a bez expirácie. | Spadá pod § 109 ods. 8 (Guidelines 2/2023), ale je to **výnimka „bezpodmienečne potrebné pre službu výslovne požadovanú užívateľom“**: košík pridaný používateľom (WP29 Opinion 04/2012, „user-input“ a „shopping cart“ cookies). **Súhlas netreba.** Odporúčam doplniť expiráciu, napr. 30 dní. |
| **Google Maps iframe** na `/kontakt` (`src/components/shop/map-embed.tsx`) | Načíta sa **až po kliknutí** na „Zobraziť mapu“. Pod tlačidlom je text „Mapa sa načíta zo služby Google Maps.“ | Pred kliknutím Google nedostane nič. Kliknutie po informácii je aktívny úkon: buď súhlas, alebo výslovne vyžiadaná služba. **[NEISTÉ – kvalifikácia]** Odporúčam doplniť text o cookies a IP adrese a odkaz na zásady cookies (pozri 2.6). Google Ireland je samostatný prevádzkovateľ. |
| **next/font/google** (`src/components/shop/fonts.ts`) | Next.js písma pri builde stiahne a **hostuje sám**. Pri návšteve sa nevolá Google. | Žiadna cookie a žiadny prenos IP adresy do Google. Netreba riešiť. |
| **Stripe Checkout** | Presmerovanie na hostovanú stránku `checkout.stripe.com`. **Stripe.js sa na našich stránkach nenačítava** (`@stripe/stripe-js` nie je v závislostiach). | Cookies Stripe sa nastavujú na doméne Stripe, kde je Stripe sám prevádzkovateľom. Ak sa neskôr nasadí Stripe Elements alebo Stripe.js, jeho cookies proti podvodom (`__stripe_mid`, `__stripe_sid`) sa bežne považujú za nevyhnutné. **[NEISTÉ – zdokumentovať]** |
| Vercel Analytics a Speed Insights, GA4, Meta Pixel, Hotjar, chat | **Nepoužívajú sa.** V kóde nie je `<Script>` ani `gtag`. | — |
| `tel:` a `mailto:` odkazy, `next/image` (servírované z Vercelu) | Áno | Nejde o prístup ku koncovému zariadeniu. |
| Vercel na produkcii | Na produkčnej doméne Vercel štandardne cookies nenastavuje. Na náhľadových nasadeniach áno (toolbar, `_vercel_jwt`). | Týka sa iba tímu, nie zákazníkov |

---

## 2. Cookies: právne požiadavky a odpoveď na otázku, či treba lištu

### 2.1 Pravidlá (§ 109 ods. 8 zákona 452/2021 v znení účinnom od 18. 8. 2026)
Citát: *„Každý, kto ukladá alebo získava prístup k informáciám uloženým v koncovom zariadení užívateľa, je na to oprávnený iba ak užívateľ udelil preukázateľný súhlas spĺňajúci náležitosti podľa osobitného predpisu [GDPR]. … To nebráni technickému uloženiu údajov alebo prístupu k nim, ktorých jediným účelom je prenos alebo uľahčenie prenosu správy prostredníctvom siete, alebo ak je to bezpodmienečne potrebné pre poskytovateľa služieb informačnej spoločnosti na poskytovanie služby informačnej spoločnosti, ktorú výslovne požaduje užívateľ.“*

Čo z toho vyplýva podľa stanoviska RÚ a ÚOOÚ, EDPB 05/2020, správy Cookie Banner Taskforce EDPB (17. 1. 2023) a rozsudku SDEÚ C-673/17 *Planet49*:
1. **Súhlas pred uložením.** Nevyhnutné cookies nesmú byť „nevyhnutné“ len formálne. Cookies tretích strán RÚ vo všeobecnosti za nevyhnutné nepovažuje.
2. **V prvej vrstve lišty: „Prijať všetky“, „Odmietnuť všetky“ a „Nastavenia“.** Odmietnutie nesmie byť až v druhej vrstve. RÚ za správne považuje aj kombináciu „Odmietnuť všetky“ a „Upraviť nastavenia“.
3. **Rovnocenný dizajn tlačidiel.** Nesmie byť zelené „Prijať“ a červené alebo sivé „Odmietnuť“. Bez klamlivého kontrastu a bez odmietnutia schovaného v odkaze.
4. **Granularita podľa účelov** (analytické a marketingové), **nič predvolene zaškrtnuté**. Lišta, ktorá ponúka iba „Prijať všetko“ a „Odmietnuť všetko“, nestačí, ak sa používa viac druhov cookies.
5. **Žiadna cookie wall.** Prístup na web nesmie závisieť od súhlasu. Zatvorenie lišty krížikom = odmietnutie. Scrollovanie nie je súhlas (EDPB 05/2020, bod 86).
6. **Formulácia súhlasu:** „Prijať“ alebo „Súhlasím“. Slovo **„Rozumiem“ je platné len vtedy, ak web používa výlučne nevyhnutné cookies** a lišta má iba informačný charakter.
7. **Informovanosť:** identita prevádzkovateľa, účely, druhy údajov, zoznam tretích strán, právo odvolať súhlas a riziká prenosu do tretích krajín (čl. 49 ods. 1 písm. a)). Ďalšie informácie môžu byť v zásadách cookies.
8. **Odvolanie rovnako jednoduché ako udelenie** (čl. 7 ods. 3 GDPR): trvalo dostupné tlačidlo alebo ikona, napr. „Nastavenia cookies“ v pätičke.
9. **Preukázateľnosť:** viesť **log súhlasov** (náhodné ID, čas, verzia lišty a textu, voľby). Dôkazné bremeno nesie prevádzkovateľ (čl. 7 ods. 1).
10. Na ďalšie spracúvanie údajov získaných z cookies treba právny základ podľa čl. 6 GDPR, spravidla súhlas. **Oprávnený záujem na analytické a marketingové cookies nestačí** (Taskforce).
11. **Opätovné pýtanie:** zákon lehotu neurčuje. Prax je nanovo sa pýtať po 6 až 12 mesiacoch. Analytické cookies nemajú mať platnosť dlhšiu ako 13 mesiacov. **[NEISTÉ – odporúčanie, nie zákon]**

### 2.2 Treba cookie lištu? Jasná odpoveď
| Situácia | Lišta so súhlasom | Čo treba |
|---|---|---|
| **DNES** (demo: žiadne cookies, košík v localStorage, mapa na klik, písma hostované lokálne, Stripe ako presmerovanie) | **NIE** | Zverejniť **zásady cookies**. RÚ: *„V prípade ukladania … iba prostredníctvom nevyhnutných cookies je … potrebné túto skutočnosť uviesť v Cookie policy.“* Informačná lišta je len dobrovoľná, a vtedy stačí „Rozumiem“. Odporúčam lištu nedávať a do pätičky dať odkaz „Cookies“. |
| **Spustenie s účtami** (Supabase auth cookies) a prípadne Stripe.js | **NIE** | Doplniť auth cookies do tabuľky v zásadách cookies |
| **Spustenie s GA4, Meta Pixel, Google Ads alebo remarketingom** | **ÁNO, pred spustením** | Plnohodnotná lišta (2.1), skripty blokované do súhlasu, Consent Mode v2 a log súhlasov |
| **Vercel Web Analytics** (bez cookies, s denne rotovaným hashom) | **[NEISTÉ]** | Podľa Guidelines 2/2023 môže aj skript bez cookies, ktorý číta údaje zo zariadenia, spadať pod čl. 5 ods. 3. Bezpečná cesta je dať ho pod súhlas „Analytické“. Agresívnejšia cesta je považovať ho za anonymnú štatistiku bez súhlasu, čo slovenské úrady nepotvrdili. |
| **Vložené YouTube alebo Facebook** | Na klik (fasáda) alebo so súhlasom | Rovnaký vzor ako mapa. Pri YouTube použiť `youtube-nocookie.com` a fasádu. |

### 2.3 Odporúčaný nástroj na súhlas
- **Dnes nič.** Iba stránka „Zásady používania cookies“.
- **Pri spustení s GA4 alebo Meta Pixel** sú dve cesty:
  - **Vlastná lišta v Next.js** stačí pri 2 až 3 nástrojoch. Výhody: rýchlosť, dizajn a žiadny ďalší sprostredkovateľ. Treba však vlastný log súhlasov (napr. tabuľka `consent_log` v Supabase, zapisovaná serverovou akciou), verzionovanie textu a nastavovanie Consent Mode v2.
  - **CMP** (napr. Cookiebot, CookieYes, Usercentrics, Didomi; open-source Klaro alebo CookieConsent v3 od orestbida s vlastným logom): automatický sken cookies, log a šablóny. Google vyžaduje **CMP certifikovanú Googlom (IAB TCF)** len pre **vydavateľov** (AdSense, Ad Manager, AdMob), nie pre inzerenta, ktorý používa Google Ads alebo GA4. **[NEISTÉ – overiť aktuálnu politiku Google]**
  - **Moje odporúčanie:** CookieConsent v3 (open-source, bez cloudu), vlastný log v Supabase a Consent Mode v2 v **základnom (Basic) režime**.
- **Google Consent Mode v2** sa v EHP vyžaduje od marca 2024 (politika Google EU User Consent Policy) pre remarketing, publiká a personalizáciu v Google Ads a pre plnohodnotné meranie konverzií. Signály: `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`, predvolene všetky `denied`.
  - **Basic mode:** značky Google sa do súhlasu vôbec nenačítajú. Je v súlade s § 109 ods. 8 a odporúčam ho.
  - **Advanced mode:** značky posielajú „cookieless pings“ aj bez súhlasu. Podľa Guidelines 2/2023 je to riziko. **[NEISTÉ]**
- **GA4:** prijať Google Ads Data Processing Terms v administrácii, retenciu nastaviť na 2 alebo 14 mesiacov, vypnúť Google signals a zdieľanie údajov, IP adresu GA4 neukladá.
- **Meta Pixel a Conversions API:** pri pixeli je spoločná zodpovednosť (SDEÚ C-40/17 *Fashion ID*) a treba **Meta Controller Addendum**. Načítať až po súhlase „Marketingové“. Na serverový CAPI s hashovaným e-mailom treba rovnako súhlas.

### 2.4 Návrh textu: „Zásady používania cookies“

> **Zásady používania súborov cookies**
> Účinné od: [DD. MM. RRRR] · verzia [1.0]
>
> **Kto ich používa:** Royal stroje s. r. o., Boldog 182, [PSČ] Boldog, IČO 57 405 425 (ďalej „my“), prevádzkovateľ e-shopu [doména].
>
> **Čo sú cookies a podobné technológie**
> Cookies sú malé textové súbory, ktoré webová stránka uloží do vášho prehliadača. Podobne funguje aj lokálne úložisko prehliadača (localStorage). Podľa § 109 ods. 8 zákona č. 452/2021 Z. z. o elektronických komunikáciách smieme bez vášho súhlasu ukladať len tie, ktoré sú nevyhnutné na prevádzku služby, ktorú od nás výslovne požadujete. Na všetky ostatné potrebujeme váš súhlas.
>
> **Aké cookies používame**
> *[Variant DNES / pri spustení bez analytiky:]* Používame **iba nevyhnutné technológie**. Na ich uloženie nepotrebujeme váš súhlas, preto vám nezobrazujeme lištu so súhlasom. Nepoužívame analytické ani reklamné cookies a nesledujeme vás naprieč webmi.
> *[Variant s analytikou:]* Okrem nevyhnutných cookies používame analytické a marketingové cookies **len s vaším súhlasom**. Súhlas udeľujete v lište pri prvej návšteve a kedykoľvek ho zmeníte alebo odvoláte cez odkaz **„Nastavenia cookies“** v pätičke stránky. Odvolanie neovplyvní zákonnosť spracúvania pred ním.
>
> | Názov | Poskytovateľ | Typ | Účel | Platnosť | Súhlas |
> |---|---|---|---|---|---|
> | `royal-cart-v1` (localStorage) | Royal stroje s. r. o. | nevyhnutné | uchovanie obsahu košíka v prehliadači. Obsahuje len produkty a množstvá, žiadne osobné údaje. | do vyprázdnenia košíka alebo vymazania údajov prehliadača [alebo 30 dní, ak sa doplní expirácia] | nie |
> | `sb-[ref]-auth-token` (*od spustenia účtov*) | Royal stroje s. r. o. (technológia Supabase) | nevyhnutné | prihlásenie do zákazníckeho účtu a bezpečnosť relácie | [doplniť podľa implementácie] | nie |
> | `[názov]_consent` (*len pri lište*) | Royal stroje s. r. o. | nevyhnutné | zapamätanie vašej voľby cookies | 6 alebo 12 mesiacov | nie |
> | `_ga`, `_ga_<ID>` (*len ak nasadíme*) | Google Ireland Ltd. | analytické | štatistika návštevnosti | 13 mesiacov [*Google uvádza 2 roky, platnosť skrátiť*] | **áno** |
> | `_fbp` (*len ak nasadíme*) | Meta Platforms Ireland Ltd. | marketingové | meranie reklám a remarketing | 90 dní | **áno** |
>
> **Mapa Google na stránke Kontakt**
> Mapu sa načíta až po kliknutí na „Zobraziť mapu“. Potom Google Ireland Ltd. dostane vašu IP adresu a môže ukladať vlastné cookies podľa svojich zásad (policies.google.com/privacy). Google je pri tom samostatným prevádzkovateľom a údaje môže prenášať do USA (EU-US Data Privacy Framework). Ak na mapu nekliknete, Google od nás nič nedostane.
>
> **Platba**
> Platba prebieha na stránke spoločnosti Stripe (checkout.stripe.com). Cookies na tejto stránke nastavuje Stripe ako samostatný prevádzkovateľ na bezpečnosť platieb a prevenciu podvodov (stripe.com/privacy).
>
> **Ako cookies vymazať alebo zablokovať:** v nastaveniach prehliadača ([odkazy na Chrome, Firefox, Safari, Edge]). Ak zablokujete nevyhnutné úložisko, košík ani prihlásenie nemusia fungovať.
>
> **Viac o spracúvaní osobných údajov** nájdete v [Zásadách ochrany osobných údajov]. Otázky: shop@royalstroje.sk.

### 2.5 Ak bude lišta: minimálny text prvej vrstvy
> **Cookies na Royal Shop.** Nevyhnutné cookies používame vždy, aby e-shop fungoval (košík, prihlásenie). So súhlasom použijeme aj **analytické** cookies (návštevnosť) a **marketingové** cookies (reklamy Google a Meta, ktoré môžu údaje prenášať do USA). Súhlas môžete kedykoľvek zmeniť v „Nastaveniach cookies“ v pätičke. [Zásady cookies]
> **[Prijať všetky] [Odmietnuť všetky] [Nastavenia]**  (všetky tri rovnako veľké a v rovnakej farbe; krížik = odmietnutie)

### 2.6 Odporúčaný text pod tlačidlom mapy (doplnenie `map-embed.tsx`)
> „Po kliknutí sa načíta mapa zo služby Google Maps. Google pritom získa vašu IP adresu a môže ukladať cookies. [Viac v zásadách cookies]“ a vedľa toho odkaz „Otvoriť v Mapách Google“ (už existuje).

---

## 3. Návrh: „Ochrana osobných údajov“ (informácie podľa čl. 13 a 14 GDPR)

> Hranaté zátvorky = doplniť. Text je písaný pre stav pri spustení. Časti „ak“ zverejniť len vtedy, keď sa daná činnosť naozaj vykonáva.

---

**Zásady ochrany osobných údajov**
Účinné od [DD. MM. RRRR] · verzia [1.0]

**1. Kto spracúva vaše údaje**
Prevádzkovateľom je **Royal stroje s. r. o.**, Boldog 182, [PSČ] Boldog, IČO 57 405 425, DIČ [ ], IČ DPH [ ], zapísaná v obchodnom registri Okresného súdu [Trnava], oddiel Sro, vložka č. [ ] (ďalej „my“). Prevádzkujeme e-shop Royal Shop na [doméne] a požičovňu royalstroje.sk.

**2. Ako nás kontaktovať**
E-mail: **shop@royalstroje.sk** · telefón: **+421 948 555 551** · poštou na adresu sídla s označením „GDPR“.
Zodpovednú osobu (DPO) sme nevymenovali, pretože podľa čl. 37 GDPR nám táto povinnosť nevzniká. Všetky otázky k osobným údajom vybavuje [meno alebo funkcia] na uvedenom e-maile.

**3. Odkiaľ údaje máme**
Väčšinu údajov nám poskytnete sami pri objednávke, registrácii, reklamácii alebo pri komunikácii s nami. Pri nákupe na firmu môžeme údaje overiť vo verejných registroch (ORSR, ŽRSR, register platiteľov DPH). Ak objednávku za vás zadal niekto iný alebo ste uvedení ako príjemca či kontaktná osoba firmy, údaje sme dostali od neho. O platbe dostávame od Stripe informáciu o výsledku platby a jej základné údaje (napr. posledné 4 číslice karty, krajinu karty, výsledok kontroly proti podvodom). Úplné číslo karty nikdy nevidíme.

**4. Na aké účely, na akom základe a ako dlho**

| Účel | Údaje | Právny základ | Ako dlho |
|---|---|---|---|
| **Objednávka a plnenie kúpnej zmluvy** (prijatie a potvrdenie objednávky, platba, objednanie tovaru u dodávateľa, test stroja, doručenie alebo osobný odber, komunikácia o stave) | meno, priezvisko, e-mail, telefón, fakturačná a doručovacia adresa, pri firme obchodné meno, IČO, DIČ, IČ DPH, obsah objednávky, poznámka, údaje o platbe | čl. 6 ods. 1 písm. b) GDPR: plnenie zmluvy a opatrenia pred jej uzavretím. Pri kontaktnej osobe firemného zákazníka čl. 6 ods. 1 písm. f): oprávnený záujem komunikovať so zástupcom zmluvnej strany. | počas plnenia zmluvy, potom na účel „právne nároky“ nižšie |
| **Účtovníctvo a dane** (faktúry, dobropisy, doklady o platbe) | identifikačné a fakturačné údaje, položky, sumy | čl. 6 ods. 1 písm. c): zákonná povinnosť podľa zákona č. 431/2002 Z. z. o účtovníctve a zákona č. 222/2004 Z. z. o DPH | **10 rokov nasledujúcich po roku, ktorého sa doklad týka** (§ 35 ods. 3 písm. c) zákona o účtovníctve; § 76 zákona o DPH) |
| **Reklamácie, odstúpenie od zmluvy a záruka** (prijatie, vybavenie a potvrdenie reklamácie, evidencia odstúpení, vrátenie peňazí, komunikácia so servisom alebo výrobcom) | údaje z objednávky, popis vady, fotografie, sériové číslo, protokol z testu, komunikácia, bankový účet na vrátenie platby | čl. 6 ods. 1 písm. c): Občiansky zákonník a zákon č. 108/2024 Z. z. o ochrane spotrebiteľa. Pri firmách čl. 6 ods. 1 písm. b). | počas záručnej doby a **5 rokov** od vybavenia reklamácie alebo od odstúpenia **[NEISTÉ – navrhovaná lehota, pozri § 101 OZ a § 397 ObZ]** |
| **Preukazovanie, uplatňovanie a obhajoba právnych nárokov** | údaje o objednávke, platbe, komunikácia, prijaté verzie VOP s časom súhlasu | čl. 6 ods. 1 písm. f): oprávnený záujem | **5 rokov od dodania** tovaru (premlčanie 3 roky podľa OZ a 4 roky podľa ObZ plus rezerva). Pri prebiehajúcom spore až do jeho skončenia. |
| **Zákaznícky účet** (prehľad objednávok, sledovanie stavu, reklamácie a odstúpenie online, uložené adresy) | e-mail, heslo (uložené len ako hash), meno, telefón, adresy, firemné údaje, história | čl. 6 ods. 1 písm. b): zmluva o zriadení účtu | do zrušenia účtu. Neaktívny účet zrušíme po [3] rokoch, vopred vás upozorníme. Údaje o objednávkach ostávajú podľa riadkov vyššie. |
| **Komunikácia** (otázky e-mailom, telefonicky, cez kontaktný formulár, *ak bude* WhatsApp) | meno, kontakt, obsah správy | čl. 6 ods. 1 písm. b), ak ide o otázku pred nákupom alebo k objednávke; inak čl. 6 ods. 1 písm. f) (odpovedať na vašu správu) | **1 rok** od vybavenia. Ak sa týka objednávky, rovnako dlho ako objednávka. |
| **Bezpečnosť a prevencia podvodov** (kontrola platieb, ochrana pred zneužitím, technické logy servera) | údaje o platbe, IP adresa, údaje o zariadení v logoch | čl. 6 ods. 1 písm. f): ochrana pred podvodmi a bezpečnosť služby (odôvodnenie 47 a 49 GDPR) | logy servera [rádovo dni až 30 dní podľa nastavenia hostingu]. Údaje Stripe podľa zásad Stripe. |
| **Ponuky podobného tovaru existujúcim zákazníkom e-mailom** (soft opt-in) | e-mail, meno, kategórie kúpeného tovaru | čl. 6 ods. 1 písm. f) a **§ 116 ods. 15 zákona č. 452/2021 Z. z.** Súhlas netreba, môžete však kedykoľvek odmietnuť. | do odmietnutia, najdlhšie **1 rok od skončenia zmluvného vzťahu** (§ 116 ods. 16) |
| ***Ak bude:* Newsletter** pre tých, ktorí sa prihlásia | e-mail, prípadne meno, záznam o súhlase | čl. 6 ods. 1 písm. a): **súhlas** (§ 116 ods. 3 zákona 452/2021) | do odvolania súhlasu. Doklad o súhlase a o jeho odvolaní uchovávame **4 roky od odvolania** (§ 116 ods. 5 a 6). |
| **Cookies a podobné technológie** | podľa [Zásad používania cookies] | nevyhnutné: § 109 ods. 8 (výnimka); ostatné: súhlas | podľa tabuľky v zásadách cookies |
| ***Ak bude:* Kamerový systém** v areáli osobného odberu v Boldogu | záznam osôb v areáli | čl. 6 ods. 1 písm. f): ochrana majetku a bezpečnosť osôb. Priestor je označený. | **[15] dní**, pri incidente do skončenia konania **[NEISTÉ – lehotu určiť v LIA]** |
| ***Ak bude:* Recenzie s menom** | meno alebo prezývka, text, hodnotenie | súhlas | do odvolania |

**Musíte nám údaje poskytnúť?** Údaje v objednávke označené ako povinné potrebujeme na uzavretie a splnenie zmluvy, bez nich objednávku nevybavíme. Údaje na faktúre vyžaduje zákon. Súhlas s newsletterom nie je podmienkou nákupu.

**5. Komu údaje poskytujeme**

| Príjemca | Rola | Na čo | Kde |
|---|---|---|---|
| Supabase (Supabase Pte. Ltd., Singapur) | sprostredkovateľ | databáza, prihlásenie, ukladanie súborov | údaje uložené v EÚ (Frankfurt). Podpora môže mať prístup z tretích krajín na základe SCC. |
| Vercel Inc. (USA) | sprostredkovateľ | hosting webu a serverové funkcie | EÚ a USA, DPF a SCC |
| Stripe Payments Europe Ltd. (Írsko) | sprostredkovateľ pri spracovaní platby, **samostatný prevádzkovateľ** pri prevencii podvodov a plnení povinností proti praniu špinavých peňazí | platby kartou, Apple Pay a Google Pay | EÚ a USA, DPF a SCC |
| Resend (Plus Five Five, Inc., USA) *[až po nasadení]* | sprostredkovateľ | odosielanie e-mailov k objednávke | USA, DPF a SCC |
| Kuriérske a prepravné spoločnosti [SPS, DPD, dopravca nadrozmerného nákladu – doplniť] | samostatní prevádzkovatelia alebo sprostredkovatelia podľa ich zmlúv **[NEISTÉ]** | doručenie (meno, adresa, telefón, e-mail) | SR a EÚ |
| Dodávatelia a výrobcovia (napr. Unicon s.r.o., Ostrava, CZ; Gölz GmbH, DE; [ďalší]) | samostatní prevádzkovatelia | **len ak** tovar doručujú priamo vám alebo pri vybavení reklamácie a servisu (meno, adresa, telefón, údaje o vade) | EÚ |
| Účtovná firma [názov] | sprostredkovateľ | vedenie účtovníctva | SR |
| Banka [názov] | samostatný prevádzkovateľ | platby a vrátenie peňazí | SR |
| IT dodávatelia (vývoj a správa e-shopu a interného systému) | sprostredkovatelia | údržba a podpora | [ ] |
| *Ak bude:* Meta Platforms Ireland (WhatsApp Business) | [sprostredkovateľ pri API **[NEISTÉ]**] | správy o stave objednávky, ak si ich zvolíte | EÚ a USA, DPF |
| *Ak bude:* Google Ireland, Meta Platforms Ireland (analytika a reklama) | samostatní alebo spoloční prevádzkovatelia | len so súhlasom cez cookies | EÚ a USA, DPF |
| Google Ireland Ltd. (mapa) | samostatný prevádzkovateľ | len po kliknutí na mapu | EÚ a USA, DPF |
| Advokát, súd, exekútor, inkasná spoločnosť | samostatní prevádzkovatelia | uplatnenie a obhajoba nárokov | SR |
| Orgány verejnej moci (SOI, finančná správa, polícia, ÚOOÚ) | samostatní prevádzkovatelia | ak to ukladá zákon | SR |

Údaje nepredávame. Objednávky spravujeme v internom systéme našej spoločnosti, ktorý používame aj pre požičovňu Royal stroje. Údaje zo e-shopu však na iné účely než tie, ktoré tu uvádzame, nepoužívame.

**6. Prenos mimo EÚ**
Niektorí naši dodávatelia (Vercel, Stripe, Resend, prípadne Google a Meta) sídlia v USA alebo tam majú prístup k údajom. Prenos sa opiera o **rozhodnutie Európskej komisie o primeranosti pre rámec EU-US Data Privacy Framework** (rozhodnutie (EÚ) 2023/1795) pri certifikovaných spoločnostiach a o **štandardné zmluvné doložky** podľa rozhodnutia (EÚ) 2021/914. Prenos do Singapuru (Supabase Pte. Ltd.) zabezpečujú štandardné zmluvné doložky. Kópiu záruk vám na požiadanie poskytneme.

**7. Automatizované rozhodovanie**
Platby kartou kontroluje služba **Stripe Radar**. Automaticky vyhodnocuje riziko podvodu a podozrivú platbu môže zamietnuť. Ide o rozhodnutie potrebné na uzavretie zmluvy (čl. 22 ods. 2 písm. a) GDPR) a Stripe ho robí aj ako samostatný prevádzkovateľ. Ak bola vaša platba zamietnutá, kontaktujte nás. Situáciu posúdi človek a ponúkneme vám inú možnosť platby, napr. bankový prevod. Iné automatizované rozhodovanie ani profilovanie s právnymi účinkami nerobíme. **[NEISTÉ – overiť rozsah Radaru a vlastných pravidiel]**

**8. Vaše práva**
Máte právo:
- na **prístup** k údajom a ich kópiu (čl. 15),
- na **opravu** (čl. 16),
- na **vymazanie** (čl. 17), ak nám to nebráni zákonná povinnosť (napr. faktúry),
- na **obmedzenie** spracúvania (čl. 18),
- na **prenosnosť** údajov, ktoré spracúvame na základe zmluvy alebo súhlasu (čl. 20),
- **namietať** proti spracúvaniu na základe oprávneného záujmu (čl. 21). **Proti priamemu marketingu môžete namietať kedykoľvek a bez udania dôvodu.** Stačí kliknúť na odkaz na odhlásenie v každom e-maile alebo nám napísať.
- **odvolať súhlas** kedykoľvek. Odvolanie nemá vplyv na spracúvanie pred ním (čl. 7 ods. 3).

Žiadosti posielajte na shop@royalstroje.sk. Vybavíme ich bezplatne **do 1 mesiaca**, v zložitých prípadoch najviac o ďalšie 2 mesiace, o čom vás informujeme. Aby sme údaje nevydali inej osobe, môžeme si overiť vašu totožnosť.

**9. Sťažnosť**
Ak si myslíte, že s vašimi údajmi zaobchádzame v rozpore so zákonom, môžete podať **návrh na začatie konania** (§ 100 zákona č. 18/2018 Z. z.) na **Úrad na ochranu osobných údajov Slovenskej republiky**, Galvaniho Business Centrum II, Galvaniho 7/B, 821 04 Bratislava, www.dataprotection.gov.sk, statny.dozor@pdp.gov.sk, +421 2 3231 3214. Najprv sa však môžete obrátiť na nás a problém vyriešime.

**10. Zabezpečenie**
Používame šifrované spojenie (HTTPS), prístup k údajom podľa rolí s dvojfaktorovým prihlásením, oddelené oprávnenia v databáze a zálohy. K údajom majú prístup len poverení zamestnanci, ktorí sú viazaní mlčanlivosťou.

**11. Zmeny**
Zásady aktualizujeme pri zmene spracúvania. Dátum účinnosti je uvedený hore a predchádzajúce verzie poskytneme na požiadanie.

---

### 3.1 Poznámky k zásadám (interne, nezverejňovať)
- **DPO nie je povinný** podľa čl. 37 ods. 1 GDPR a § 44 zákona 18/2018. Hlavnou činnosťou je predaj, nie rozsiahle a systematické monitorovanie, a nespracúvajú sa osobitné kategórie údajov. Platí to aj pri GA4 alebo Pixeli. Odporúčam písomne určiť interného „GDPR koordinátora“.
- **Záznamy o spracovateľských činnostiach (čl. 30) viesť treba.** Výnimka pre menej ako 250 zamestnancov sa neuplatní, lebo spracúvanie nie je príležitostné.
- **Vek:** súhlas dieťaťa so službami informačnej spoločnosti platí od 16 rokov (§ 15 ods. 1 zákona 18/2018). Pri newsletteri treba vyhlásenie „mám aspoň 16 rokov“ alebo dvojité potvrdenie. **[NEISTÉ – zvážiť]**
- **CRM RCC (spoločné s požičovňou):** zákazníci e-shopu nesmú dostávať marketing požičovne, kým nie je jasné, či ide o „podobné tovary a služby“ podľa § 116 ods. 15. Prenájom strojov a predaj strojov ako podobné služby? **[NEISTÉ]** Bezpečnejšie je mať samostatný súhlas.
- **Dodávatelia pri priamej dodávke (Unicon CZ, Gölz DE):** ide o poskytnutie údajov ďalšiemu prevádzkovateľovi na plnenie zmluvy (čl. 6 ods. 1 písm. b)) alebo o sprostredkovanie (dodávateľ koná podľa našich pokynov), vtedy treba zmluvu podľa čl. 28. Rolu dohodnúť písomne. **[NEISTÉ]**
- **DPIA nie je pravdepodobne povinné.** Pri kamerách alebo profilovaní ho však posúdiť podľa zoznamu operácií, ktorý zverejnil ÚOOÚ. **[NEISTÉ]**

---

## 4. Pokladňa: návrh súhlasov a informovania

Stav v kóde: checkbox „Súhlasím s obchodnými podmienkami a reklamačným poriadkom“ a pod ním text „Osobné údaje spracúvame podľa zásad ochrany osobných údajov“ s odkazom. **Je to správne:** súhlas so spracúvaním údajov na objednávku sa nežiada, údaje sa spracúvajú na základe zmluvy.

**Odporúčaný návrh (zhora nadol v súhrne objednávky):**

1. **VOP (povinný, nezaškrtnutý)**
   ☐ *Oboznámil(a) som sa s [obchodnými podmienkami] a [reklamačným poriadkom] a súhlasím s nimi.*
   Ukladať `terms_version` a `terms_accepted_at`, čo už funguje. Pre spotrebiteľa i firmu zobrazovať správnu verziu (`terms_b2c` / `terms_b2b`).
   **Nikdy** nespájať s „súhlasom so spracúvaním osobných údajov“ ani s marketingom. Súhlas podmienený zmluvou je neplatný (čl. 7 ods. 4 GDPR).

2. **Informácia o ochrane osobných údajov (bez checkboxu)**
   *„Vaše údaje spracúvame na vybavenie objednávky, vystavenie faktúry a vybavenie prípadnej reklamácie. Podrobnosti nájdete v [Zásadách ochrany osobných údajov].“* Text musí byť viditeľný pred tlačidlom.

3. **Marketing: vybrať jeden model**
   - **A. Soft opt-in (§ 116 ods. 15), odporúčaný pre existujúcich zákazníkov.** Zákon vyžaduje dať možnosť odmietnuť **„v čase ich získavania“**:
     ☐ *Nechcem dostávať e-maily s ponukami podobného tovaru. Odhlásiť sa dá aj neskôr jedným klikom v každom e-maile.*
     Nezaškrtnuté = soft opt-in povolený. Ukladať čas, verziu textu a ID objednávky. Posielať len **ponuky vlastného podobného tovaru** (stroje a príslušenstvo), najdlhšie **1 rok od skončenia zmluvného vzťahu** (§ 116 ods. 16). Odhlásenie musí byť v každom e-maile a odosielateľ nesmie byť skrytý (§ 116 ods. 15 posledná veta).
   - **B. Výslovný súhlas (newsletter so širším obsahom, napr. akcie partnerov alebo požičovňa):**
     ☐ *Chcem dostávať e-mailom novinky a ponuky Royal Shop. Súhlas môžem kedykoľvek odvolať odkazom v e-maile.* (nezaškrtnuté, nepovinné)
     Odporúčam **double opt-in**. Záznam o súhlase a o jeho odvolaní uchovávať **4 roky od odvolania** (§ 116 ods. 5 a 6). Pri súhlase uviesť, ako ho odvolať (§ 116 ods. 5 posledná veta). Potvrdenie odvolania do 30 dní (§ 116 ods. 6).
   - Formulárom ani e-mailom **nežiadať súhlas** s marketingom: § 116 ods. 4 zakazuje žiadať o súhlas e-mailom.

4. **Registrácia účtu (nepovinná, nákup bez registrácie musí ostať)**
   ☐ *Vytvoriť účet na sledovanie objednávky a jednoduchšie reklamácie* → pole heslo.
   Text pod ním: *„Účet môžete kedykoľvek zrušiť v nastaveniach alebo e-mailom. Údaje v účte spracúvame do jeho zrušenia ([zásady]).“* Netreba súhlas, ide o zmluvu o účte. Pridať funkciu zrušenia účtu (self-service).

5. **Telefón:** ponechať povinný s odôvodnením (už je tam hint), to je minimalizácia v poriadku. **Poznámka:** pridať hint *„Nepíšte sem citlivé údaje.“*
6. **Firma:** pri firemných údajoch je meno a e-mail osobný údaj kontaktnej osoby. V zásadách je to pokryté oprávneným záujmom.
7. **Mimo GDPR, ale v pokladni:** tlačidlo musí znieť napr. „Objednávka s povinnosťou platby“ (zákon 108/2024). Overiť v inom podklade.

---

## 5. Interné GDPR dokumenty (checklist)

| # | Dokument | Kde ho získať alebo ako vytvoriť | Stav |
|---|---|---|---|
| 1 | **Záznamy o spracovateľských činnostiach** (čl. 30) pre každý účel z bodu 3.4: účel, kategórie, príjemcovia, prenosy, lehoty, opatrenia | Vlastná tabuľka (vzory ponúka ÚOOÚ na dataprotection.gov.sk). Zdieľané s požičovňou: oddeliť účely. | ☐ |
| 2 | **Supabase DPA** | https://supabase.com/legal/dpa. **Uzatvára sa prijatím ToS** („acceptance of the Agreement shall have the same effect as signing the SCCs“). Podpísanú kópiu si vyžiadať cez Dashboard v časti Legal Documents. **[NEISTÉ – postup]** Strana: Supabase Pte. Ltd. (Singapur). SCC áno, DPF **nie**. Sprostredkovatelia: https://supabase.com/legal/customer-resources/subprocessor-list (prihlásiť sa na odber). Projekt musí byť v regióne **eu-central-1 (Frankfurt)**. | ☐ |
| 3 | **Vercel DPA** | https://vercel.com/legal/dpa. **Platí len pre plány Pro a Enterprise.** Hobby je navyše len na nekomerčné použitie, preto e-shop **musí ísť na Pro**. Vercel Inc. (USA) má DPF certifikát a DPA obsahuje SCC (moduly 1 až 3). Sprostredkovatelia: security.vercel.com. Funkcie nastaviť do regiónu `fra1` a nastaviť retenciu logov. | ☐ |
| 4 | **Stripe DPA** | https://stripe.com/legal/dpa je **súčasťou Stripe Services Agreement** a prijíma sa automaticky. V EHP je zmluvnou stranou Stripe Payments Europe Ltd. (Írsko). DPF a SCC. Stripe je **samostatný prevádzkovateľ** pre podvody, riziká a AML/KYC. Stiahnuť PDF a archivovať. | ☐ |
| 5 | **Resend DPA** | https://resend.com/legal/dpa sa uzatvára prijatím ToS. Plus Five Five, Inc. (USA), DPF a SCC (modul 2). Sprostredkovatelia: https://resend.com/legal/subprocessors. Overiť, či sa dá zvoliť región odosielania v EÚ. **[NEISTÉ]** | ☐ |
| 6 | **Zmluva s účtovnou firmou** (čl. 28) | Vlastná zmluva alebo vzor od účtovnej firmy | ☐ |
| 7 | Zmluva s **IT dodávateľom** alebo vývojárom s prístupom k produkčným údajom a s **poskytovateľom hostingu CRM RCC** | Vlastná zmluva podľa čl. 28 | ☐ |
| 8 | **Kuriéri a dopravcovia** | Overiť ich VOP a zmluvy (rola prevádzkovateľ alebo sprostredkovateľ). Pri sprostredkovateľovi treba DPA. | ☐ |
| 9 | **Dodávatelia pri priamej dodávke** (Unicon, Gölz) | Doložka o ochrane údajov v rámcovej zmluve, rola podľa bodu 3.1 | ☐ |
| 10 | *Ak bude:* **Google Ads Data Processing Terms** a GA4 nastavenia; **Meta Controller Addendum** a Business Tools Terms; **WhatsApp Business** (API cez BSP, Data Processing Terms) | Prijať v administrácii Google a Meta, archivovať snímky obrazovky | ☐ |
| 11 | **Posúdenie prenosov (TIA)**, stručné, pre Vercel, Stripe, Resend a Supabase | Interný dokument: DPF certifikácia (dataprivacyframework.gov, uložiť snímku obrazovky), SCC, šifrovanie, EU región | ☐ |
| 12 | **Testy oprávneného záujmu (LIA)**: prevencia podvodov, soft opt-in, obhajoba nárokov, B2B kontaktné osoby, logy servera, *kamery* | Interný dokument: trojkrokový test (záujem, nevyhnutnosť, vyváženie) | ☐ |
| 13 | **Bezpečnostné opatrenia** (čl. 32): MFA na Supabase, Vercel, Stripe, GitHub a Resend; RLS; ochrana `service_role` kľúča; zálohy; prístupy podľa rolí v RCC | Interná smernica | ☐ |
| 14 | **Postup pri porušení ochrany údajov** (čl. 33 a 34): oznámenie ÚOOÚ do **72 h**, oznámenie dotknutým osobám pri vysokom riziku, **evidencia všetkých porušení** (čl. 33 ods. 5) | Interná smernica, formulár ÚOOÚ na oznámenie | ☐ |
| 15 | **Postup vybavovania žiadostí dotknutých osôb** (lehota 1 mesiac) a evidencia | Interná smernica s vzorovými odpoveďami | ☐ |
| 16 | **Poverenie a poučenie oprávnených osôb** a záväzok mlčanlivosti (čl. 29 a 32 ods. 4 GDPR, § 79 zákona 18/2018) | Podpis každého zamestnanca alebo brigádnika s prístupom | ☐ |
| 17 | **Retenčný plán a mazacie joby** (objednávky po 5 rokoch, faktúry po 10 rokoch, `payment_events.payload`, `notifications_log`, neaktívne účty, logy) | Implementovať v Supabase (cron alebo pg_cron) | ☐ |
| 18 | **Log súhlasov** (cookies, newsletter, soft opt-in odmietnutia), uchovávať 4 roky od odvolania | Tabuľka v Supabase | ☐ |
| 19 | *Ak bude:* **kamerový systém**: LIA, označenie „priestor je monitorovaný“ s odkazom na informácie, retencia | — | ☐ |
| 20 | **Verzionovanie** zásad ochrany údajov a cookies v `legal_documents` | Už je v dátovom modeli | ☐ |

---

## 6. Konkrétne úlohy v kóde (vyplývajú z analýzy)
1. Vytvoriť stránky `/ochrana-osobnych-udajov` (odkaz už existuje v pokladni) a `/cookies`. Do pätičky dať odkazy na oboje.
2. `map-embed.tsx`: rozšíriť text o IP adrese a cookies a pridať odkaz na `/cookies` (2.6).
3. `cart-store.ts`: voliteľne doplniť expiráciu košíka (napr. 30 dní).
4. `/objednavka/*`: `Referrer-Policy: no-referrer`. Zvážiť, či má token platiť obmedzene dlho.
5. `payment_events.payload`: retencia (napr. 90 dní), potom vymazať alebo anonymizovať.
6. Pokladňa: pridať soft opt-in odmietnutie (model A) a nepovinný účet (bod 4). Rozšíriť schému o `marketing_opt_out_at`, `consent_log`.
7. Pred nasadením analytiky: lišta (CookieConsent v3 alebo vlastná), Consent Mode v2 v režime Basic, `consent_log`.
8. Supabase projekt v `eu-central-1`, Vercel funkcie v `fra1`, Vercel plán Pro.

---

## Zdroje
**Primárne:**
- Zákon 452/2021 Z. z., časová verzia od 18. 8. 2026: https://static.slov-lex.sk/pdf/SK/ZZ/2021/452/ZZ_2021_452_20260818.pdf (§ 109 ods. 8; § 116 ods. 3 až 6, 14 až 16; sankcie 200 € až 5 % obratu)
- Zákon 431/2002 Z. z., časová verzia od 1. 6. 2026: https://static.slov-lex.sk/pdf/SK/ZZ/2002/431/ZZ_2002_431_20260601.pdf (§ 35 ods. 3 písm. c))
- RÚ a ÚOOÚ, Stanovisko k získavaniu súhlasu podľa § 109 ods. 8: https://www.teleoff.gov.sk/files/urad/informacie-urade/najcastejsie-otazky/problematika-cookies-osdek/8-musi-byt-webovej-stranke-vzdy-cookies-lista/52493_stanovisko-k-ziskavaniu-suhlasu-podla-ustanovenia-109-ods-8-zakona-c.pdf
- ÚOOÚ SR, kontakt: https://dataprotection.gov.sk/sk/kontakt/
- GDPR (EÚ) 2016/679: https://eur-lex.europa.eu/eli/reg/2016/679/oj · zákon 18/2018 Z. z. (slov-lex)
- EDPB Guidelines 05/2020 on consent: https://edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_202005_consent_sk.pdf
- EDPB Guidelines 2/2023 on Technical Scope of Art. 5(3) ePD (v2, 7. 10. 2024): https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf
- EDPB Report of the Cookie Banner Taskforce (17. 1. 2023): edpb.europa.eu
- DPA: https://supabase.com/legal/dpa · https://vercel.com/legal/dpa · https://stripe.com/legal/dpa · https://resend.com/legal/dpa
- Vercel DPF: https://vercel.com/kb/guide/is-vercel-certified-under-dpf

**Sekundárne [NEISTÉ]:**
- Digital Omnibus, stav k septembru 2026: https://acompli.ie/news/digital-omnibus-gdpr-cookies-status-september-2026/ · https://secureprivacy.ai/blog/eu-digital-omnibus-what-article-88a-changes-for-cookie-consent-2026 · https://research.eutechreg.com/dossiers/gdpr-reform-digital-omnibus/
- DPF, odvolanie Latombe C-703/25 P: https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework · https://www.dataguidance.com/news/eu-cjeu-admits-microsoft-intervener-appeal-concerning
- *Trump v. Slaughter* a DPF: https://www.skadden.com/insights/publications/2026/07/supreme-court-decision-raises-new-questions
- Supabase bez DPF certifikácie: https://eurobase.app/vs/supabase-dpa
