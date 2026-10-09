# Royal Shop: analýza a research

Stav k 9. 10. 2026. Pracovný názov projektu je „Royal Shop“.

Tento dokument je orientačná mapa. Nie je to právne ani daňové stanovisko: DPH, elektroodpad a obchodné podmienky (VOP) musí potvrdiť účtovník alebo právnik.

---

## 1. Najdôležitejšie zistenia

1. **agnaradie.sk nie je spotrebiteľský e-shop.** Je to veľkoobchodný B2B portál:
   - Podľa VOP predávajú „výlučne iným prevádzkovateľom živnosti“. Koncový zákazník sa nemôže ani zaregistrovať.
   - Ich sila je sklad (17 až 20 tisíc položiek), presný stav zásob a vlastná rozvozová sieť. Web samotný nie je ich sila.
   - Preto treba rozhodnúť, či chceme B2C, B2B alebo oboje (pozri otázky pre foundera).
2. **Makita s.r.o. (Banská Bystrica) koncovým zákazníkom nepredáva.**
   - Je to dcérska firma Makita UK a funguje ako veľkoobchod a servis s obratom asi 27 mil. €.
   - Má B2B zónu len po prihlásení, s cenníkmi a katalógmi.
   - Verejne nikde neuvádza dropshipping ani dátový feed (XML/API). **Celý navrhovaný flow stojí na tom, čo s nimi founder dohodne.**
3. **V ponuke Makity je na trhu medzera.**
   - Žiadny e-shop nemá dobre spravenú UX pre batériové platformy (LXT 18V / XGT 40V / CXT 12V, „solo“ verzus „kit“).
   - Málokto má parametrické filtre a štruktúrované dáta.
   - Požičovňu ako doplnok k predaju má len MADMAT, A-Z Stroj a OBI.
   - **Royal Stroje už požičovňu má. To je naša najsilnejšia výhoda.**
4. **Technicky to nie je zložité. Úzke hrdlo je integrácia s dodávateľom a dáta o produktoch** (feed, EAN, ceny, sklad, tracking, vratky). Platobná brána ani dizajn nie sú problém.

---

## 2. Analýza trhu

### agnaradie.sk (AG NÁRADIE s.r.o., Trnava, od roku 1991)

| Silné stránky | Slabé stránky |
|---|---|
| Presné množstvo na sklade („27 ks“), rezervácia | Dizajn a technológia z obdobia okolo roku 2005 (ASP.NET WebForms, HTML 4) |
| Kuriér na ďalší deň pri objednávke do 12:00 | Chýba základné SEO: `<title>` produktu je názov kategórie, chýba meta description, JSON-LD aj sitemap |
| Doprava zdarma nad 150 € bez DPH, vlastné rozvozové trasy | Ceny na 3 desatinné miesta (206,640 €) |
| Možnosť „záväznej objednávky“, teda backorder | Popisy len v odrážkach, bez tabuľky parametrov, záložky s návodmi a videami sú prázdne |
| 17 hlavných kategórií, strom do hĺbky 3 až 4 úrovní | Na mobile je zakázaný zoom; domovská stránka má 298 obrázkov bez lazy-load |
| | Makita tvorí len 63 položiek v kategórii AKU náradia, nie je to ich zameranie |
| | Žiadne filtre podľa parametrov (napätie, platforma, výkon) |

### Ostatné e-shopy s náradím

| E-shop | Zameranie | Platforma | Čo robia dobre |
|---|---|---|---|
| **naradieshop.sk** | Silný dôraz na Makitu, 36 000+ produktov | PrestaShop | GoPay, vernostné body, Heureka 4,6★ |
| **madmat.sk** | DeWalt, Makita, Metabo | Vlastné riešenie | Doprava zdarma nad 150 €, Z-BOX, Apple Pay, splátky Quatro, **požičovňa**, Heureka 4,7★ |
| **a-zstroj.sk** | **Najviac špecializovaný na Makitu** | Vlastné riešenie | Strom kategórií podľa LXT/XGT, delenie podľa remesiel, servis aj požičovňa. Je však pomalý a obsah je zastaraný. |
| **boukal.sk** | Profi náradie, CZ/SK | Vlastné riešenie | B2B pre firmy, navigácia podľa remesiel, Stripe |
| **zepa.sk** | Železiarstvo | Shoptet | Heureka 5,0★, doručenie za asi 2,6 dňa |
| **doktorkladivo.sk** | Sieť e-shopov v celej EÚ | Vlastné riešenie | Veľký sortiment, B2B; chýba lokálna odbornosť |
| alza / hornbach / obi | Veľkí hráči | — | Cena a logistika, ale bez odborného poradenstva |

### Čo dnes zákazník berie ako samozrejmosť

- Heureka „Overené zákazníkmi“
- Packeta / Z-BOX, DPD, GLS, SPS
- Platba kartou, Apple Pay, Google Pay, dobierkou aj prevodom
- Doprava zdarma od 150 do 200 €
- Zobrazený stav skladu a termín doručenia
- Akcie, blog, vernostný program

### Kde môžeme byť lepší

1. **Výber podľa batériovej platformy.**
   - Filter LXT / XGT / CXT, jasne označené „bez batérie“ verzus „sada“.
   - Sprievodca „Mám batérie 18V, čo mi pasuje?“.
   - Výhodné balíčky (náradie + batéria + nabíjačka).
2. **Dôkladné parametre** (napätie, krútiaci moment, Ah, bezuhlíkový motor, hmotnosť), filtre podľa nich, porovnávač a štruktúrované dáta pre Google.
3. **Rýchlosť a mobil.** Väčšina konkurencie má ťažké stránky; my vieme mať LCP pod 1,5 s.
4. **Prepojenie s požičovňou Royal Stroje** (nikto to nerobí dobre):
   - „Vyskúšaj v požičovni, kúp v e-shope“
   - časť poplatku za prenájom sa započíta do kúpy
   - pri produkte odkaz „požičaj si od X €/deň“
5. **B2B účty** pre firmy, ktoré si už dnes v Royal Stroje požičiavajú:
   - firemné ceny a zľavy podľa klienta (CRM už pole `discount %` má)
   - platba na faktúru
   - rýchla objednávka podľa kódu a opakované objednávky
6. **Servis a záruka.** Pomoc s registráciou predĺženej záruky Makita, online objednanie servisu.
7. **Dôvera.** Odznak „Autorizovaný predajca Makita“ (makita.sk sama odporúča kupovať len u autorizovaných predajcov), prehľadné záručné podmienky.
8. **Obsah.** Porovnania, sady podľa remesla (murár, elektrikár), videá. Royal Stroje už má funkčnú blogovú SEO stratégiu.

---

## 3. Čo môžeme prevziať z projektu RoyalStroje

| Oblasť | Čo existuje | Dá sa použiť? |
|---|---|---|
| Stack | React 19, Vite, Tailwind, Supabase (Postgres, Auth, Storage), Vercel | Áno, rovnaký ekosystém |
| SEO | Prerender cez Puppeteer, sitemap, JSON-LD, Helmet | Pre e-shop navrhujem **Next.js** (viď ďalej) |
| Dizajn | Oranžová `#FF6600`, písma Archivo a Source Sans 3, pravidlá v `PRODUCT.md`, komponenty Header/Footer/ProductCard/CookieBanner | Áno, ako základ vizuálu „Royal“ značky |
| CRM (`apps/dashboard`) | Layout, UI kit (DataTable, Modal, Toast, Badge, StatCard), formulár produktu s nahrávaním obrázkov, databáza klientov (PO/FO, IČO, DIČ), PDF faktúry cez jsPDF s diakritikou, číselné rady, RLS role | **Áno, ako základ admin konzoly.** Rezervácie sú však postavené na prenájme, takže objednávky treba spraviť nanovo. |
| Klientsky portál (`apps/portal`) | Login, registrácia, profil | Áno, ako vzor pre používateľský účet |
| Produkty Makita | 31 produktov: názov, krátky popis, 1 až 3 parametre, obrázok, **len denná sadzba za prenájom** | Len čiastočne. Chýba EAN, kód produktu ako samostatné pole, predajná cena a plné parametre. **Dáta musia prísť od Makity.** |
| E-maily | EmailJS (z frontendu) | Nie. E-shop potrebuje transakčné e-maily zo servera (Resend / Postmark). |
| Platby | Žiadne | Nové |

---

## 4. Navrhovaná architektúra

```
          Zákazník
              │
   ┌──────────▼──────────┐      ┌───────────────────────┐
   │ Storefront           │      │ Admin konzola          │
   │ Next.js na Vercel    │      │ (React, odvodená z CRM)│
   │ SSR/ISR kvôli SEO    │      └──────────┬────────────┘
   └──────────┬──────────┘                  │
              │                             │
   ┌──────────▼─────────────────────────────▼──────────┐
   │ Supabase (EU región): Postgres + Auth + Storage    │
   │ products, variants, stock, orders, order_items,    │
   │ customers, payments, shipments, returns, claims    │
   └──────────┬─────────────────────────────▲──────────┘
              │                             │
   ┌──────────▼─────────────────────────────┴──────────┐
   │ Worker (Railway alebo Vercel Cron / Edge Functions)│
   │ • import feedu Makita (ceny, sklad) každých X min   │
   │ • odoslanie objednávky do Makity (API / e-mail / CSV)│
   │ • príjem trackingu → e-mail zákazníkovi             │
   │ • Heureka / Google feed, Heureka „Overené“           │
   └─────┬───────────────┬──────────────────┬──────────┘
         │               │                  │
      Stripe         Makita s.r.o.      Resend (e-maily)
   (+ neskôr         (dropship)         SuperFaktúra
    Comgate)                            (faktúry, e-faktúra 2027)
```

### Kľúčové rozhodnutia

- **Next.js namiesto Vite SPA.**
  - Pri e-shope s tisíckami produktov je SEO hlavný zdroj návštevnosti.
  - Prerender cez Puppeteer, ako ho má Royal Stroje, sa pri tisíckach produktov s meniacimi sa cenami a skladom neudrží.
  - Next.js je stále React a beží natívne na Verceli.
- **Admin konzola** ako samostatná aplikácia odvodená z CRM dashboardu Royal Stroje, aby sme využili už napísané komponenty.
- **Backend na Railway zatiaľ netreba.** Plánované úlohy zvládne Vercel Cron alebo Supabase Edge Functions, webhooky zvládne Next.js API.
  - Railway pridáme, ak bude integrácia s Makitou ťažšia (SFTP, EDI, dlhé importy).
- **Fakturácia:**
  - Odporúčam externý nástroj (SuperFaktúra / iDoklad) cez API.
  - Od 1. 1. 2027 platí povinná e-faktúra pri B2B v SK (Peppol). Vlastný jsPDF generátor to sám nepokryje.
- **Platby:**
  - Na štart **Stripe** (karta, Apple Pay, Google Pay; spustenie za pár dní; najlepšie API).
  - Pri vyššom obrate pridať **Comgate alebo GoPay** kvôli lacnejším bankovým tlačidlám.
  - Prevod s QR kódom **Pay by Square** je zadarmo.
  - Dobierka cez kuriéra.

---

## 5. Navrhovaný proces objednávky (dropshipping)

1. Zákazník zaplatí, alebo zvolí dobierku či faktúru.
2. Objednávka sa uloží v stave `paid` / `awaiting_confirmation`.
3. **Fáza 1:** admin objednávku potvrdí manuálne jedným klikom. **Fáza 2:** pri splnených pravidlách (skladom, zaplatené, bez rizika) sa potvrdí automaticky.
4. Objednávka sa odošle do Makity (API, e-mail alebo CSV podľa toho, čo Makita podporuje) v stave `sent_to_supplier`.
5. Makita vráti potvrdenie a číslo zásielky (tracking).
6. Stav sa zmení na `shipped` a zákazník dostane e-mail s trackingom.
7. Po doručení zásielky stav `delivered`. Faktúra zákazníkovi ide od nás, nikdy nie od Makity.
8. Odstúpenie od zmluvy alebo reklamácia rieši **naše** s.r.o. voči zákazníkovi a **potom** to vyrovnávame s Makitou.

**Cieľ do 3 dní je reálny** len ak:
- Makita expeduje do 24 hodín,
- máme aktuálny stav skladu, aby sme nepredali tovar, ktorý nemajú.

Konkurencia doručuje priemerne za 2,6 až 3,2 dňa (podľa Heureky).

---

## 6. Úzke hrdlá a na čo si dať pozor

### Technické a prevádzkové

| Riziko | Prečo je to problém | Riešenie |
|---|---|---|
| **Dáta o produktoch** | Bez EAN nie je Heureka ani Google Shopping. Bez parametrov nefungujú filtre. Okopírované popisy škodia SEO. | Získať od Makity feed s EAN, parametrami a obrázkami. Overiť licenciu na obrázky. Písať vlastné SK popisy aspoň pre kľúčové produkty. |
| **Synchronizácia skladu** | Predáme tovar, ktorý nie je. Nasleduje storno, zlá recenzia a horšie hodnotenie na Heureke. | Pravidelný import (ideálne každú hodinu alebo častejšie). Ak sklad nevieme, zobraziť „na objednávku, X dní“. |
| **Tracking** | Bez neho nevieme zákazníkovi poslať, kde je balík | Dohodnúť, ako ho Makita vráti (API, webhook alebo aspoň e-mail, ktorý vieme spracovať) |
| **Obsah balíka** | Makita nesmie do balíka vložiť svoju faktúru s veľkoobchodnými cenami | Neutrálny dodací list |
| **Vratky a reklamácie** | Zo zákona ich rieši predajca, teda my: 14 dní na odstúpenie, 30 dní na vybavenie reklamácie | Zmluvne dohodnúť adresu na vratky, kto tovar preberie a skontroluje, a lehoty dobropisov |
| **Poškodenie pri preprave** | Spor medzi Makitou a dopravcom, ale zákazník sa sťažuje nám | Upraviť v zmluve |
| **Ťažké a veľké produkty** | Do Z-BOXu sa zmestí len do 15 kg, potom musí ísť kuriér | Doprava podľa hmotnosti. Ponuka dopravcov závisí od zmluvy Makity s dopravcom. |
| **Cash flow** | Zákazník platí nám a my platíme Makite. Pri každej platbe navyše transakčná daň 0,4 % (max. 40 €). | Platiť Makite hromadne (týždenne), ideálne na splatnosť |

### Legislatíva (výber, detail potvrdí právnik)

- **Zákon 108/2024 o ochrane spotrebiteľa:**
  - povinné informácie
  - tlačidlo „Objednávka s povinnosťou platby“
  - potvrdenie objednávky e-mailom
  - pri zľave zobraziť najnižšiu cenu za posledných 30 dní
- **Od 19. 6. 2026 je povinná funkcia „Odstúpiť od zmluvy tu“** priamo na webe, s automatickým potvrdením e-mailom. Treba ju zapracovať do systému.
- **Platforma ODR (riešenie sporov online) bola zrušená 20. 7. 2025.** Odkazuje sa na SOI ako subjekt alternatívneho riešenia sporov (ARS).
- **GPSR (nariadenie o bezpečnosti výrobkov):** na stránke produktu výrobca, jeho adresa, identifikátor produktu a bezpečnostné upozornenia v slovenčine.
- **eKasa netreba:** platba online, prevodom a dobierkou cez kuriéra sa do nej nezapisuje. Treba ju len pri vlastnom výdajnom mieste s platbou na mieste.
- **Elektroodpad a batérie:**
  - Ak tovar dodáva Makita s.r.o. zo SK, sme distribútor. Musíme bezplatne spätne prevziať staré zariadenie (kus za kus) a informovať o tom na webe.
  - Ak by tovar išiel zo skladu mimo SK, môžeme sa stať výrobcom: registrácia, organizácia zodpovednosti výrobcov (OZV), hlásenia.
- **GDPR:** zmluvy o spracúvaní údajov so Supabase (EU región), Vercelom, Stripe, dopravcami a s Makitou, ktorá dostane adresy zákazníkov.
- **Cookies:** súhlas vopred (opt-in) pre analytiku a marketing. Royal Stroje to už má spravené (Consent Mode v2).
- **Zákon o prístupnosti (EAA):** mikropodnik (menej ako 10 zamestnancov a obrat do 2 mil. €) je vyňatý. Aj tak navrhujeme podľa WCAG AA.
- **DPH:**
  - Pri tenkých maržiach a nákupe od platiteľa DPH sa oplatí dobrovoľná registrácia (rozhodne účtovník).
  - Predaj do CZ cez OSS až nad 10 000 € za rok.

---

## 7. Navrhované etapy

| Fáza | Obsah | Podmienka |
|---|---|---|
| **0. Teraz** | Research (tento dokument), otázky pre foundera, wireframy a vizuál domovskej, kategórie a produktu | — |
| **1. Testovacia web stránka** | Next.js storefront: katalóg Makita, kategórie, filtre podľa platformy, detail produktu, košík, objednávka bez platby (dopyt/objednávka e-mailom), SEO základ | Founder potvrdí, že ideme do toho |
| **2. Účty a admin** | Registrácia a prihlásenie, história objednávok, admin konzola (produkty, objednávky, zákazníci), transakčné e-maily, PDF / SuperFaktúra | — |
| **3. Platby a právna časť** | Stripe, dobierka, Pay by Square, VOP, reklamačný poriadok, odstúpenie od zmluvy, GPSR údaje | Založená s.r.o., bankový účet, VOP od právnika |
| **4. Integrácia s Makitou** | Import feedu, odosielanie objednávok, tracking; najprv manuálne potvrdenie, potom automatizácia | Zmluva s Makitou a technické podklady |
| **5. Marketing a rast** | Heureka + Overené zákazníkmi, Google Merchant, B2B účty a ceny, prepojenie s požičovňou, servis, ďalšie značky | — |

> **Odporúčanie:** testovaciu verziu (fáza 1) môžeme spraviť už teraz z dát, ktoré máme (31 produktov Makita z Royal Stroje plus verejné údaje), a dátovú vrstvu postaviť tak, aby sa neskôr len napojil feed Makity.
