# Royal Shop: technická dokumentácia (demo verzia)

- **Verzia:** 0.1, 9. 10. 2026
- **Rozsah:** demo verzia s ukážkovými dátami: e-shop, klientsky portál a admin konzola, platby cez Stripe v testovacom režime.
- **Súvisiace dokumenty:**
  - [01 – analýza a research](01-analyza-a-research.md)
  - [02 – otázky pre foundera](02-otazky-pre-foundera.md)
  - [03 – legislatívny research](03-legislativa-research.md)

---

## 1. Cieľ demo verzie

Cieľom je overiť celý proces od zákazníka po admina na realistických (ukážkových) dátach:

1. Zákazník (súkromná osoba alebo firma) sa zaregistruje a prihlási. Vidí profil, históriu objednávok a stav aktuálnej objednávky.
2. Prezerá produkty, filtruje ich, vkladá do košíka, zvolí dopravu (kuriér, náš vlastný rozvoz alebo osobný odber v Senci) a zaplatí kartou alebo cez Apple Pay / Google Pay. Platí sa v testovacom režime Stripe, takže bez reálnych peňazí.
3. V admin konzole sa objaví objednávka s údajmi o klientovi a stavom platby. Admin ju prevedie cez celý proces: objednané u dodávateľa → prijaté na pobočke → otestované → odoslané alebo pripravené na odber → doručené.
4. Zákazník môže **do 14 dní od doručenia odstúpiť od zmluvy** a **kedykoľvek počas zodpovednosti za vady podať reklamáciu**, oboje cez portál. Admin vidí a rieši oboje so stavmi.
5. Po zaplatení sa automaticky vystaví faktúra (PDF s QR kódom Pay by Square podľa vzoru MDN TECH). Zákazník aj admin dostanú e-mailové notifikácie.

**Mimo demo verzie:**
- platba prevodom,
- reálne napojenie na dodávateľov (Unicon Ostrava, Honda, Atlas Copco, Gölz, Cedima, Enar, Master),
- reálny kuriér,
- automatizované WhatsApp správy,
- Heureka a Google feed,
- e-faktúra Peppol,
- finálna doména.

### Prijaté rozhodnutia (od foundera, 9. 10. 2026)

| Téma | Rozhodnutie |
|---|---|
| Model nákupu | Zákazník zaplatí → my kúpime od dodávateľa → tovar príde na pobočku v Senci → otestujeme, zabalíme, vypíšeme záručný list → odošleme kuriérom, rozvezieme sami, alebo si ho zákazník vyzdvihne |
| Dodávatelia | Pôvodne Makita s.r.o. a ntc.cz. **Zmena 12. 10. 2026:** žiadne aku náradie ani Makita; len prémiové stavebné stroje od 800 € s DPH od značiek, s ktorými má founder priamy kontakt: NTC (cez Unicon Ostrava), Bomag, Honda, Atlas Copco, Grindex, Gölz, Cedima, Enar, Master. Sortiment a dodávatelia: `docs/05-sortiment-stroje.md`. |
| Zákazníci | Súkromné osoby (B2C) aj firmy (B2B). Predaj len na Slovensku. |
| Ceny | Predajná cena sa zadáva ručne. Nákupná cena a marža (15–35 %) sa evidujú v admine len pre prehľad. |
| Doprava | Kuriér pre menšie položky (zmluva zatiaľ nie je), ťažké stroje vlastnou technikou, osobný odber na pobočke Royal Stroje v Senci. Doprava zdarma od 2 000 €. |
| Platby | Karta, Apple Pay, Google Pay cez Stripe. Prevod v deme nebude. Platí sa vždy vopred, na pobočke sa len vyzdvihuje (bez eKasy). |
| Vratky a reklamácie | Prichádzajú k nám, s dodávateľom ich riešime my. Dopravu pri reklamácii platíme my. |
| Faktúry | Vlastný fakturačný modul (podľa vzoru MDN TECH, s QR kódom Pay by Square). Faktúry ďalej spracuje externá účtovníčka. |
| Admin | Dvaja používatelia, ty a founder, obaja s plnými právami |
| Infraštruktúra | Samostatný Git repozitár, samostatný Supabase projekt, demo na `*.vercel.app` s blokovaným indexovaním |
| Dizajn | Nová identita, moderný e-shop |
| Prepojenie s požičovňou | V deme áno (odkaz „Požičaj si“ na royalstroje.sk), pred spustením sa môže zmeniť |

---

## 2. Technologický stack

| Vrstva | Technológia | Prečo |
|---|---|---|
| Framework | **Next.js 15+ (App Router), React 19, TypeScript** | Stránky sa generujú na serveri (dôležité pre SEO pri tisíckach produktov), API na webhooky a natívne nasadenie na Vercel. TypeScript chráni pred chybami pri práci s peniazmi a stavmi objednávok. |
| Štýlovanie | Tailwind CSS v4 + vlastné dizajnové tokeny | Rovnaký prístup ako v Royal Stroje |
| UI komponenty | shadcn/ui (Radix) pre admin aj formuláre, lucide-react | Prístupné komponenty bez balastu |
| Formuláre a validácia | react-hook-form + zod | Rovnaké schémy na klientovi aj na serveri |
| Tabuľky v admine | TanStack Table | Triedenie, filtre, stránkovanie |
| Databáza, prihlásenie, súbory | **Supabase** (Postgres, Auth, Storage, RLS), EU región | Samostatný projekt, nie databáza Royal Stroje |
| Platby | **Stripe**: Checkout (hosted), testovací režim, webhooky | Apple Pay a Google Pay bez overovania domény, SK lokalizácia |
| E-maily | Resend + React Email | Transakčné e-maily zo servera |
| PDF | @react-pdf/renderer na serveri (alebo prenesený generátor jsPDF z MDN TECH CRM) | Faktúry, potvrdenia reklamácií a odstúpení |
| QR platba | knižnica `bysquare` (Pay by Square) | Rovnaký QR kód ako na vzorovej faktúre |
| Plánované úlohy | Vercel Cron → Next.js route handlers | Lehoty 14 a 30 dní, pripomienky. Railway zatiaľ netreba. |
| Testy | Vitest (logika: ceny, DPH, stavy) + Playwright (celý nákupný proces end-to-end) | — |
| Monitoring | Sentry (free) + Vercel Analytics | — |

**Prečo jedna Next.js aplikácia a nie tri** (e-shop, portál a admin samostatne):
- spoločné typy, databázové dotazy, komponenty a jedno nasadenie,
- admin je oddelený na úrovni ciest (`/admin`), cez middleware a RLS (pravidlá prístupu priamo v databáze),
- ak bude neskôr treba, admin sa dá oddeliť na vlastnú subdoménu.

---

## 3. Architektúra

```
                   ┌───────────────────────────────────────────┐
  Zákazník ───────►│  Next.js (Vercel)                         │
                   │  ├─ (shop)     /, /kategoria, /produkt,    │
                   │  │             /kosik, /pokladna           │
                   │  ├─ (account)  /ucet/...  (klientsky portál)│
                   │  ├─ (admin)    /admin/... (iba rola admin) │
                   │  └─ api/       webhooks/stripe, cron/*     │
                   └───────┬───────────────┬──────────┬────────┘
                           │               │          │
              Server Actions / RSC         │          │
                           │               │          │
              ┌────────────▼─────────┐ ┌───▼──────┐ ┌─▼───────┐
              │ Supabase (EU)        │ │ Stripe   │ │ Resend  │
              │ Postgres + RLS       │ │ (test)   │ │ e-maily │
              │ Auth (e-mail + heslo)│ └──────────┘ └─────────┘
              │ Storage: products/,  │
              │  claims/, invoices/  │
              └──────────────────────┘
```

**Bezpečnostné pravidlá:**
- Kľúč `service_role` sa používa **len na serveri** (webhooky, cron, akcie admina). Prehliadač pracuje iba s verejným `anon` kľúčom a RLS.
- Ceny a súčty sa **vždy prepočítajú na serveri** z databázy. Hodnotám z prehliadača sa neverí.
- Stripe webhook overuje podpis a je idempotentný (tabuľka `payment_events` s unikátnym `stripe_event_id`, takže tú istú udalosť nespracuje dvakrát).
- Rola admina sa ukladá v `profiles.role`, nie v `user_metadata`, ktoré si používateľ vie upraviť sám. Toto je poučenie z Royal Stroje.

---

## 4. Proces objednávky a stavy

### 4.1 Platba: autorizácia a capture (odporúčanie)

Peniaze chceme mať istoty skôr, než tovar kúpime, a zároveň nechceme platiť poplatky za vrátenie peňazí, keď tovar nebude dostupný. Preto v Stripe použijeme **manuálny capture**:

1. Pri pokladni Stripe peniaze **zablokuje** na karte zákazníka (autorizácia). Objednávka má stav `paid_authorized`.
2. Admin overí dostupnosť u dodávateľa a klikne **„Potvrdiť a strhnúť platbu“**. Stripe peniaze naozaj strhne (capture), stav sa zmení na `confirmed` a vystaví sa faktúra. Až potom objednávame u dodávateľa.
3. Ak tovar nie je dostupný, admin autorizáciu **zruší**. Peniaze sa uvoľnia a nič nás to nestojí.

Autorizácia platí 7 dní. Ak admin do 5 dní nerozhodne, cron pošle upozornenie a na 6. deň platbu automaticky strhne alebo zruší (podľa nastavenia). Peniaze pred nákupom od dodávateľa teda máme vždy.

Či sa autorizácia a strhnutie zhodujú s momentom uzavretia zmluvy podľa obchodných podmienok, je bod pre právnika (legislatívny research, kap. 11, bod 1).

### 4.2 Stav objednávky (`orders.status`)

```
pending_payment ──(Stripe: autorizované)──► paid_authorized
      │                                          │
      └─(expirácia 24 h)─► cancelled             ├─(admin zruší)─► cancelled (autorizácia uvoľnená)
                                                 ▼
                                             confirmed           (platba strhnutá, faktúra vystavená)
                                                 ▼
                                          ordered_from_supplier  (objednané u dodávateľa)
                                                 ▼
                                          received_at_branch     (prišlo na pobočku Senec)
                                                 ▼
                                               tested            (otestované, záručný list, zabalené)
                                     ┌───────────┼──────────────┐
                                     ▼           ▼              ▼
                                  shipped   out_for_delivery  ready_for_pickup
                                  (kuriér)  (vlastný rozvoz)   (osobný odber)
                                     └───────────┼──────────────┘
                                                 ▼
                                             delivered           (delivered_at = začiatok 14-dňovej lehoty)
                                                 ▼
                                             completed           (automaticky po 14 dňoch bez odstúpenia)
```

- **Platba (`payment_status`)** sa sleduje samostatne: `unpaid`, `authorized`, `paid`, `partially_refunded`, `refunded`, `failed`, `cancelled`.
- **Každá zmena stavu** sa zapíše do `order_status_history` (kto, kedy, poznámka) a podľa šablóny odíde e-mail zákazníkovi.
- **Predpokladaný dátum doručenia** sa ráta pri objednávke: najpomalší dodávateľ v košíku + 1 deň na test + doprava (napríklad Unicon 4 + 1 + 1 = 6 pracovných dní). Zobrazuje sa pri produkte, v košíku aj v portáli.

### 4.3 Odstúpenie od zmluvy do 14 dní (`returns`)

Ako to zapracujeme (podrobnosti v legislatívnom researchi, kap. 1.1 a 10):
- V **portáli** je pri doručenej objednávke tlačidlo **„Odstúpiť od zmluvy tu“** a odpočet zostávajúcich dní (od `delivered_at`).
- V **pätičke** je odkaz „Odstúpiť od zmluvy tu“, ktorý funguje **aj bez prihlásenia**: meno, číslo objednávky a e-mail sa overia voči objednávke. Zákon pravdepodobne nedovoľuje podmieniť odstúpenie prihlásením (otvorený bod pre právnika). Prihlásenému zákazníkovi sa formulár predvyplní.
- Postup má dva kroky. Druhé tlačidlo je **„Potvrdiť odstúpenie od zmluvy“**. Hneď potom odíde e-mail s celým obsahom odstúpenia a dátumom a časom odoslania.
- **Po 14 dňoch** tlačidlo zmizne a v portáli bude „Lehota na odstúpenie uplynula dňa …“.
- **Firmy (B2B):** zákonné právo nemajú. Odstúpenie im v predvolenom nastavení nezobrazíme, dá sa to zmeniť v nastaveniach.
- **Stavy:** `requested` → `awaiting_goods` (zákazník posiela alebo prinesie tovar) → `goods_received` → `inspected` → `refunded` (refundácia cez Stripe, do 14 dní od oznámenia) alebo `refunded_partially` (znížená hodnota tovaru, musí sa písomne zdôvodniť).

**Upozornenie:** odstúpenie (aj reklamáciu) môže zákazník poslať aj iným spôsobom, napríklad e-mailom alebo listom. Portál je hlavný kanál, ale admin musí vedieť **založiť odstúpenie aj reklamáciu ručne**.

### 4.4 Reklamácie (`claims`)

- V portáli pri položke objednávky: tlačidlo „Reklamovať“, popis vady, 1–10 fotiek alebo videí (Supabase Storage, súkromný bucket) a požadovaný spôsob vybavenia (oprava alebo výmena).
- Spôsob doručenia tovaru: **zvoz kuriérom na naše náklady**, odnesenie na pobočku, alebo vyzdvihnutie našou technikou.
- Hneď po podaní odíde **e-mail s potvrdením reklamácie** (PDF s číslom, dátumom a popisom, lehota 30 dní, poučenie o práve zvoliť opravu alebo výmenu a o predĺžení zodpovednosti o 12 mesiacov po oprave).
- **Stavy:** `submitted` → `confirmed` → `pickup_arranged` → `received` → `at_supplier` → `resolved_repair` / `resolved_replacement` / `resolved_discount` / `resolved_refund` / `rejected` (vždy s odôvodnením).
- Admin vidí **odpočet 30 dní** s farebným upozornením (zostáva 10 dní, 3 dni, lehota prekročená). Cron posiela pripomienky.
- **Zodpovednosť za vady:** 24 mesiacov od doručenia pre súkromné osoby. Po oprave alebo výmene sa automaticky predĺži.

---

## 5. Databázový model (Supabase / Postgres)

Peniaze ukladáme v **centoch (integer)** a sadzbu DPH v percentách. Pri každej položke objednávky sa ukladá **kópia** názvu, ceny a DPH, aby sa história nemenila, keď sa zmení produkt.

### Katalóg
| Tabuľka | Kľúčové stĺpce |
|---|---|
| `brands` | id, name, slug, logo_path, manufacturer_name, manufacturer_address, manufacturer_email (GPSR) |
| `suppliers` | id, name (Makita s.r.o., NTC), country, lead_time_days_min/max, default_margin_pct, is_eu_import (výrobca podľa zákona o odpadoch), contact |
| `categories` | id, parent_id, name, slug, description, image_path, sort_order |
| `products` | id, slug, name, brand_id, supplier_id, category_id, sku (kód výrobcu), ean, short_description, description (rich text), **price_gross_cents** (ručne), vat_rate, **purchase_price_net_cents** (len admin), margin_pct (dopočítané), compare_at_price_cents (pôvodná cena pri zľave), price_on_request (cena na požiadanie: cena sa nezobrazí, produkt sa nedá kúpiť online a serverové oceňovanie ho vynechá), weight_kg, shipping_class (`courier` / `own_transport` / `pickup_only`), battery_platform (`LXT_18V` / `XGT_40V` / `CXT_12V` / `none`), is_kit (sada) / solo, warranty_months, manufacturer_warranty_note (napr. Makita +1 rok po registrácii), safety_info, status (`draft` / `active` / `archived`), is_featured, rental_url (odkaz na royalstroje.sk), seo_title, seo_description |
| `product_images` | id, product_id, path, alt, sort_order |
| `product_specs` | id, product_id, key, label, value, unit, is_filterable (napätie, výkon, krútiaci moment, hmotnosť…) |
| `product_documents` | id, product_id, type (návod, bezpečnostné pokyny, katalógový list), path |
| `price_history` | id, product_id, price_gross_cents, valid_from. Plní sa triggerom a slúži na **najnižšiu cenu za posledných 30 dní** pri zľave. |
| `related_products` | product_id, related_id, type (`accessory` / `battery` / `alternative`) |

**Nákupnú cenu a maržu nesmie vidieť zákazník.** Prehliadač preto číta len pohľad `products_public` alebo pravidlo RLS na úrovni stĺpcov, nie tabuľku `products` priamo.

### Zákazníci
| Tabuľka | Kľúčové stĺpce |
|---|---|
| `profiles` | id (= auth.users.id), role (`customer` / `admin`), customer_type (`person` / `company`), first_name, last_name, phone, email, marketing_consent, created_at |
| `companies` | id, profile_id, name, ico, dic, ic_dph, address. Overenie IČO cez register (neskôr). |
| `addresses` | id, profile_id, type (`billing` / `shipping`), name, street, city, zip, country (SK), is_default |

### Objednávky a platby
| Tabuľka | Kľúčové stĺpce |
|---|---|
| `orders` | id, order_number (`RS-2026-00001`), profile_id (môže byť prázdne pri nákupe bez registrácie), customer_type, kópia fakturačných a doručovacích údajov, shipping_method (`courier` / `own_transport` / `pickup_senec`), shipping_price_cents, subtotal/vat/total_cents, status, payment_status, estimated_delivery_date, delivered_at, withdrawal_deadline (dopočítané), terms_version_id, note, created_at |
| `order_items` | id, order_id, product_id, kópia názvu, SKU a EAN, quantity, unit_price_gross_cents, vat_rate, kópia purchase_price_net_cents (na reporty marží), serial_number (vyplní sa pri teste) |
| `order_status_history` | id, order_id, from_status, to_status, changed_by, note, created_at |
| `payments` | id, order_id, provider (`stripe`), stripe_checkout_session_id, stripe_payment_intent_id, amount_cents, status, captured_at, refunded_cents |
| `payment_events` | stripe_event_id (unique), type, payload, processed_at |
| `supplier_orders` | id, supplier_id, order_id, reference (číslo objednávky u dodávateľa), ordered_at, expected_at, received_at, purchase_total_net_cents, note |
| `test_reports` | id, order_item_id, tested_by, tested_at, serial_number, result, notes, photos. Protokol z testu slúži ako dôkaz pri reklamácii. |
| `shipments` | id, order_id, carrier, tracking_number, tracking_url, shipped_at, delivered_at |

### Doklady
| Tabuľka | Kľúčové stĺpce |
|---|---|
| `invoices` | id, invoice_number (vlastný číselný rad e-shopu, napr. `2026` + poradie), type (`invoice` / `credit_note`), order_id, issue_date, tax_point_date (DUZP = deň prijatia platby), due_date, kópia údajov dodávateľa a odberateľa, položky (JSONB), sumy podľa sadzieb DPH, variable_symbol, pdf_path, exported_at (pre účtovníčku) |
| `company_settings` | údaje e-shopu (s.r.o., IČO, DIČ, IČ DPH, IBAN, register, kontakty), číselné rady, sadzba dopravy, hranica dopravy zdarma (2 000 €), lehoty |

### Odstúpenia a reklamácie
| Tabuľka | Kľúčové stĺpce |
|---|---|
| `returns` | id, return_number, order_id, profile_id, name, email, items (JSONB, voliteľné), reason (voliteľné), submitted_at (presný čas), channel (`portal` / `public_form` / `manual`), status, refund_cents, refund_reason, confirmation_pdf_path |
| `claims` | id, claim_number (`RK-2026-0001`), order_item_id, profile_id, description, requested_remedy, delivery_method, status, deadline_at (= submitted + 30 dní), resolution, resolution_note, resolved_at, supplier_reference, confirmation_pdf_path, resolution_pdf_path |
| `claim_attachments` | id, claim_id, path, mime_type |
| `claim_messages` | id, claim_id, author_id, body, created_at. Komunikácia so zákazníkom v portáli. |

### Ostatné
| Tabuľka | Účel |
|---|---|
| `legal_documents` | Verzie obchodných podmienok, reklamačného poriadku a GDPR (id, type, version, content, valid_from). Objednávka si pamätá verziu, s ktorou zákazník súhlasil. |
| `notifications_log` | Odoslané e-maily a WhatsApp správy (komu, šablóna, stav) |
| `activity_log` | Audit akcií v admine (ako v Royal Stroje) |
| `cart_items` | Košík prihláseného zákazníka. Neprihlásený má košík v localStorage, ktorý sa po prihlásení zlúči. |

### Prístupové pravidlá (RLS)
- **Zákazník** číta a upravuje len svoje `profiles`, `addresses`, `companies`, `orders` (len čítanie), `returns`, `claims` a `claim_messages`. Súbory v Storage vidí len vo svojom priečinku `claims/{profile_id}/…`.
- **Verejnosť** vidí len `products_public`, aktívne kategórie, značky a obrázky.
- **Admin** má prístup ku všetkému cez funkciu `is_admin()`, ktorá číta `profiles.role`.
- Zmeny stavov, ktoré menia peniaze (capture, refund, faktúra), robí **len serverová akcia** s overením roly, nikdy priamy zápis z prehliadača.

---

## 6. Obrazovky

### 6.1 E-shop (verejná časť)
| Stránka | Obsah |
|---|---|
| **Domov** | Hero s výberom, kategórie, značky s počtom strojov a kategóriami, odporúčané produkty, akcie, výhody („Otestované pred odoslaním“, „Doprava zdarma od 2 000 €“, „Osobný odber v Senci“, „Priamo od výrobcov“) |
| **Kategória** | Filtre podľa značky, ceny, platformy, sady alebo samotného náradia, dostupnosti (dodacia doba) a parametrov (napätie, výkon, hmotnosť). Triedenie, stránkovanie, prepínač zobrazenia cien s DPH alebo bez DPH pre firmy. |
| **Produkt** | Galéria, cena s DPH aj bez DPH, najnižšia cena za 30 dní pri zľave, predpokladaný dátum doručenia, tlačidlo „Do košíka“, tabuľka parametrov, popis, dokumenty, informácie o bezpečnosti a výrobcovi (GPSR), záruka a záručný list, príslušenstvo a kompatibilné batérie, „Požičaj si v Royal Stroje“, kontakt cez WhatsApp |
| **Vyhľadávanie** | Fulltext v Postgrese (`tsvector` so slovenskou podporou bez diakritiky): názov, kód, EAN. Napovedá už počas písania. |
| **Košík** | Položky, množstvo, odhad dopravy, ukazovateľ „Do dopravy zdarma zostáva X €“, súhrn DPH |
| **Pokladňa** | 1. Kontakt a prepínač súkromná osoba / firma (IČO, DIČ, IČ DPH). 2. Doprava (kuriér, vlastný rozvoz pri ťažkých strojoch, osobný odber Senec). 3. Súhrn a súhlas s obchodnými podmienkami (nezaškrtnutý checkbox) a tlačidlo **„Objednávka s povinnosťou platby“**. 4. Presmerovanie na Stripe Checkout a návrat na „Ďakujeme“. Nákup je možný aj bez registrácie, s ponukou vytvoriť si účet. |
| **Informačné stránky** | Obchodné podmienky (B2C aj B2B), reklamačný poriadok, ochrana osobných údajov, cookies, doprava a platba, **„Odstúpiť od zmluvy tu“**, kontakt, o nás, spätný zber elektroodpadu |

### 6.2 Klientsky portál (`/ucet`)
| Stránka | Obsah |
|---|---|
| Prehľad | Aktívna objednávka s časovou osou stavov, rýchle akcie |
| Objednávky | Zoznam a detail (položky, stav, číslo zásielky, faktúra na stiahnutie, **odpočet 14 dní** a tlačidlo „Odstúpiť od zmluvy tu“, pri položke „Reklamovať“) |
| Reklamácie | Zoznam, detail so stavom, lehota, správy s adminom, PDF potvrdenia a vybavenia |
| Odstúpenia | Zoznam a stav refundácie |
| Profil | Osobné alebo firemné údaje, adresy, zmena hesla, súhlasy, zmazanie účtu (GDPR) |

### 6.3 Admin konzola (`/admin`)
| Modul | Obsah |
|---|---|
| **Dashboard** | Tržby, hrubá marža, počet objednávok podľa stavu, upozornenia (autorizácie pred expiráciou, reklamácie blízko 30-dňovej lehoty, nevybavené odstúpenia) |
| **Objednávky** | Tabuľka s filtrami podľa stavu, platby, dodávateľa a dopravy. Detail: klient, položky s nákupnou cenou a maržou, tlačidlá ďalšieho kroku (potvrdiť a strhnúť platbu, objednané u dodávateľa, prijaté, protokol z testu a sériové číslo, odoslané s číslom zásielky, doručené), história stavov, poznámky, faktúra |
| **Produkty** | Zoznam, formulár (ceny, nákupná cena a marža, parametre, obrázky, dokumenty, GPSR, odkaz na požičovňu), hromadné úpravy, import z CSV |
| **Kategórie / značky / dodávatelia** | Správa číselníkov, dodacie lehoty a predvolené marže dodávateľov |
| **Zákazníci** | Zoznam (súkromné osoby a firmy), detail s objednávkami, reklamáciami a odstúpeniami |
| **Reklamácie** | Kanban alebo tabuľka podľa stavu, odpočet 30 dní, fotky, komunikácia, vybavenie a PDF |
| **Odstúpenia** | Zoznam, kontrola prijatého tovaru, refundácia cez Stripe (celá alebo čiastočná so zdôvodnením) |
| **Faktúry** | Zoznam, PDF, dobropisy, export pre účtovníčku (ZIP s PDF + CSV) |
| **Reporty** | Tržby a marža za obdobie, podľa dodávateľa a kategórie, najpredávanejšie produkty |
| **Nastavenia** | Údaje firmy, číselné rady, doprava, verzie obchodných podmienok, administrátori |

---

## 7. Integrácie

### 7.1 Stripe (testovací režim)
- **Stripe Checkout (hosted):** karta, Apple Pay a Google Pay fungujú bez overovania domény. Jazyk SK, mena EUR.
- Pri vytvorení objednávky sa pošle `payment_intent_data.capture_method = manual` a `metadata.order_id`.
- Webhooky:
  - `checkout.session.completed` → stav `paid_authorized`
  - `payment_intent.canceled` / `checkout.session.expired` → stav `cancelled`
  - `charge.refunded` → aktualizácia refundácie
- Akcie admina „Potvrdiť a strhnúť“, „Zrušiť autorizáciu“ a „Refundovať“ volajú Stripe API zo serverovej akcie.
- V deme sa platí testovacími kartami (4242 4242 4242 4242 a pod.). Pri spustení sa len prepnú kľúče a v Stripe sa pripojí firemný účet v Slovenskej sporiteľni.

### 7.2 E-maily (Resend + React Email)

**Zákazníkovi:**
- prijatie objednávky
- potvrdenie zmluvy (PDF obchodných podmienok, poučenie o odstúpení, vzorový formulár, odkaz „Odstúpiť od zmluvy tu“)
- platba strhnutá + faktúra
- objednané u dodávateľa
- odoslané (s číslom zásielky) alebo pripravené na odber
- doručené
- potvrdenie odstúpenia (s časom odoslania)
- refundácia
- potvrdenie, zmena stavu a vybavenie reklamácie

**Adminovi:**
- nová objednávka
- nová reklamácia alebo odstúpenie
- pripomienky lehôt

### 7.3 WhatsApp
- **Demo:** tlačidlo „Napíšte nám na WhatsApp“ (odkaz `wa.me` s predvyplnenou správou, napr. číslom objednávky) a upozornenia pre admina e-mailom.
- **Neskôr:** WhatsApp Cloud API (Meta) na upozornenia o stave objednávky. Vyžaduje overenú firmu a schválené šablóny správ a platí sa za správu. Pri zákazníkoch len so súhlasom.

### 7.4 Faktúry
- Generátor podľa vzoru MDN TECH:
  - logo, dodávateľ a odberateľ, platobné údaje, dátumy
  - tabuľka položiek bez DPH, s DPH a so sumou DPH
  - rekapitulácia DPH
  - QR kód Pay by Square, ktorý pri faktúre zaplatenej kartou nebude, alebo bude s poznámkou „Uhradené kartou“
- **Moment vystavenia:** pri strhnutí platby. Dátum dodania (DUZP) je deň prijatia platby a v poznámke bude „Uhradené platobnou kartou dňa …“. Pri refundácii sa vystaví dobropis.
- **Na overenie s účtovníčkou:**
  - či stačí jedna faktúra pri platbe, alebo treba doklad k prijatej platbe a potom zúčtovaciu faktúru po doručení,
  - číselný rad e-shopu,
  - formát exportu.
- **Od 1. 1. 2027:** B2B faktúry v štruktúrovanom formáte Peppol. Dátový model to zvládne, napojenie príde neskôr.

### 7.5 Plánované úlohy (Vercel Cron)
| Úloha | Frekvencia |
|---|---|
| Autorizácie, ktorým o menej ako 48 h vyprší platnosť → upozornenie, prípadne automatický capture alebo zrušenie | každú hodinu |
| Objednávky `delivered` staršie ako 14 dní bez odstúpenia → `completed` | denne |
| Reklamácie blízko 30-dňovej lehoty → upozornenie adminovi | denne |
| Odstúpenia blízko 14-dňovej lehoty na refundáciu → upozornenie | denne |
| Neuhradené `pending_payment` staršie ako 24 h → `cancelled` | každú hodinu |

---

## 8. Doprava (logika)

| Spôsob | Kedy | Cena v deme |
|---|---|---|
| Kuriér | Všetky produkty so `shipping_class = courier` (do ~31,5 kg na balík) | Paušál (napr. 6,90 €), od 2 000 € zdarma. Kuriér bude „podľa zmluvy“. |
| Vlastný rozvoz | Ak je v košíku čo i len jeden produkt `own_transport` | Podľa zóny (napr. do 30 km od Senca, do 100 km, celé SR). **Na doplnenie od foundera.** |
| Osobný odber Senec | Vždy možný | Zadarmo. Dostupné od stavu `ready_for_pickup` s otváracími hodinami pobočky. |

Ak sú v košíku produkty s rôznou dodacou dobou, objednávka sa odošle celá, keď je pripravená posledná položka. Delené dodanie zatiaľ nepodporujeme.

---

## 9. Dizajn

- **Nová identita**, nezávislá od Royal Stroje. Názov e-shopu sa ešte zmení, preto bude logo zatiaľ textové a farby a typografia budú v dizajnových tokenoch, aby sa dali jednoducho vymeniť.
- **Smer:** moderný a prehľadný e-shop pre profesionálov:
  - veľké kvalitné produktové fotky,
  - jasná hierarchia ceny a dodacej doby,
  - technické parametre ako „špecifikačný list“,
  - výrazná, ale striedma akcentová farba,
  - tmavý režim v admine.
- **Pred implementáciou** pripravím 2–3 vizuálne smery (domovská stránka a produkt) na výber.
- **Mobil:** mobile-first, prehľadné filtre v spodnom paneli, lepiaci panel „Do košíka“.
- **Výkon:** LCP pod 2 s na 4G, obrázky cez `next/image` (AVIF/WebP), produktové stránky generované staticky a obnovované pri zmene (ISR).
- **Prístupnosť:** WCAG 2.1 AA (kontrast, ovládanie klávesnicou, popisy tlačidiel).

---

## 10. Ukážkové dáta (seed)

- **78 strojov od 800 € s DPH** (od 12. 10. 2026, predtým Makita/NTC): vibračná technika (NTC, Bomag), elektrocentrály (Honda, NTC), čerpadlá (Atlas Copco, Grindex, Honda), rezacia technika (NTC, Gölz, Cedima), vibrátory do betónu (Enar), odvlhčovače a ohrievače (Master). Reálne modely, parametre z webov výrobcov, ceny orientačne z trhu −5 % (prehľad: `docs/05-sortiment-stroje.md`).
- 19 kategórií, 9 značiek, 7 dodávateľov (v `catalog.json`), parametre, ceny (predajná, nákupná, marža), tri produkty v zľave s históriou cien.
- **Obrázky** z existujúcich podkladov Royal Stroje a verejných produktových fotiek. Licenciu treba overiť pred ostrým spustením; demo je neindexované.
- **Testovací zákazníci:** súkromná osoba a firma. **Objednávky** vo všetkých stavoch, 1–2 reklamácie a 1 odstúpenie, aby bol admin naplnený hneď po spustení.
- **Admin účty:** ty a founder.

---

## 11. Štruktúra repozitára

```
royal-shop/
├─ src/
│  ├─ app/
│  │  ├─ (shop)/            # domov, kategoria/[...slug], produkt/[slug], kosik, pokladna, info stránky
│  │  ├─ (account)/ucet/    # portál zákazníka
│  │  ├─ (admin)/admin/     # admin konzola
│  │  ├─ odstupenie/        # verejný formulár „Odstúpiť od zmluvy tu“
│  │  └─ api/
│  │     ├─ webhooks/stripe/route.ts
│  │     └─ cron/[job]/route.ts
│  ├─ components/{ui,shop,account,admin}/
│  ├─ lib/
│  │  ├─ supabase/{server,client,admin}.ts
│  │  ├─ stripe.ts
│  │  ├─ pricing.ts         # DPH, súčty, doprava, najnižšia cena za 30 dní
│  │  ├─ order-state.ts     # povolené prechody stavov
│  │  ├─ invoices/          # generovanie PDF, Pay by Square
│  │  └─ email/             # šablóny React Email
│  └─ types/database.ts     # generované zo Supabase
├─ supabase/
│  ├─ migrations/
│  └─ seed.sql
├─ e2e/                     # Playwright: nákup, odstúpenie, reklamácia
├─ docs/                    # tieto dokumenty
└─ .env.example
```

**Prostredia:**
- `main` → produkčné demo (`*.vercel.app`, `noindex`)
- Každá vetva a PR dostane vlastnú náhľadovú URL

**Premenné prostredia:**
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- E-mail: `RESEND_API_KEY`
- Cron: `CRON_SECRET`

---

## 12. Plán prác (demo)

| # | Míľnik | Výstup |
|---|---|---|
| 1 | **Základ** | Repozitár, Next.js, Supabase projekt, migrácie, seed, prihlásenie, nasadenie na Vercel |
| 2 | **Dizajn** | 2–3 vizuálne smery → výber → dizajnové tokeny a základné komponenty |
| 3 | **Katalóg** | Domov, kategórie s filtrami, detail produktu, vyhľadávanie |
| 4 | **Košík a pokladňa** | Košík, pokladňa súkromná osoba / firma, doprava, Stripe Checkout a webhook |
| 5 | **Klientsky portál** | Profil, adresy, objednávky s časovou osou, faktúry |
| 6 | **Admin – objednávky** | Dashboard, objednávky so všetkými stavmi, capture a zrušenie, dodávateľ, protokol z testu, odoslanie |
| 7 | **Admin – katalóg a zákazníci** | Produkty (CRUD, obrázky, ceny a marže), číselníky, zákazníci |
| 8 | **Odstúpenia a reklamácie** | Portál (s verejným formulárom), admin, lehoty, PDF potvrdenia |
| 9 | **Faktúry a e-maily** | PDF faktúr a dobropisov, Pay by Square, všetky e-maily, export |
| 10 | **Testovanie a doladenie** | E2E testy, výkon, prístupnosť, informačné stránky s pracovnými verziami obchodných podmienok |

Návrhy obchodných podmienok, reklamačného poriadku a GDPR pripravím paralelne ako samostatné dokumenty pre právnika (vychádzajú z legislatívneho researchu).

---

## 13. Rozhodnuté body (9. 10. 2026)

1. **Vlastný rozvoz:** pevné ceny podľa vzdialenosti (zóny od Senca, nastaviteľné v admine).
2. **Odstúpenie od zmluvy:** len pre súkromné osoby (FO). Firmám sa nezobrazuje.
3. **Faktúry:** prevezmeme generátor z `crm_core` (MDN TECH), prispôsobený na server.
4. **Číselný rad faktúr:** `YYYYXXXXX` (rok + 5-miestne poradové číslo), prvá faktúra `202600001`. Rad sa každý rok začína od 00001.
5. **TypeScript:** áno.
6. **Nákup bez registrácie:** áno, po nákupe ponúkneme vytvorenie účtu.
