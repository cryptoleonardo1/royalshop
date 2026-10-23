# 07 – Admin konzola Royal Shop (plán, 23. 10. 2026)

> **Účel:** plán samostatnej admin konzoly (CRM) pre Royal Shop, oddelenej od RCC (Royal Stroje CRM). Konzola je napojená na databázu `royalshop1`. Zaplatená objednávka sa v nej zobrazí okamžite a dá sa v nej viesť celý proces až po faktúru, reklamáciu a odstúpenie.
>
> **Mení rozhodnutie z 22. 10. 2026** („admin bude v RCC“). Shop a RCC zostávajú úplne oddelené.
>
> **Schválené 23. 10. 2026:**
> - Admin je v kóde Royal Shop na `/admin`.
> - Domény: shop `shop.royalstroje.sk`, admin `admin.shop.royalstroje.sk` (premenná `ADMIN_HOST`), RCC zostáva na `app.royalstroje.sk`. Novú doménu nekupujeme.
> - Priorita: sledovať, ktorým objednávkam ešte plynie lehota na odstúpenie. Testuje sa so Stripe v testovacom režime.

## 1. Architektúra: prečo nie čistá inštancia crm_core

Pozrel som `crm_core` (master, migrácie 001–013, inštancia `instance/royalstroje`). Ako hotová inštancia sa na `royalshop1` napojiť nedá. Dôvody:

| Oblasť | crm_core | royalshop1 | Dôsledok |
|---|---|---|---|
| Doménový model | prenájom: `equipment`, `reservations`, `contracts`, dni prenájmu | e-shop: `products`, `orders`, `payments`, `returns`, `claims` | moduly Zákazky, Kalendár a Zmluvy sa pre shop nehodia |
| Schéma | vlastné tabuľky v `public`, `001` je `CREATE TABLE` bez `IF NOT EXISTS` | `invoices`, `invoice_lines`, `document_counters`, `activity_log` a `is_admin()` už existujú | migrácie crm_core by na `royalshop1` zlyhali alebo by prepísali logiku shopu |
| Roly | `auth.users.app_metadata.app_role` | `profiles.role` (pravidlo projektu) | iný model oprávnení a RLS |
| Server | žiadny: Vite SPA, iba anon kľúč | `issue_invoice()`, číslovanie, prechody stavov a Stripe refund vyžadujú service role | SPA ich nemôže bezpečne volať, chýba serverová vrstva |
| Faktúry | číslo `{PREFIX}{YYYY}{NNNN}`, PDF v prehliadači | `YYYYNNNNN`, `issue_invoice()` v DB shopu | dve rôzne implementácie tej istej veci |

V crm_core však je hodnotný kód, ktorý sa oplatí **prebrať**:
- generátor PDF faktúry (jsPDF + PAY by square QR),
- výpočty a zaokrúhľovanie DPH (`invoiceMath.js`) ako kontrola k `money.ts`,
- rozloženie aplikácie (sidebar, KPI dlaždice dashboardu, tabuľky s filtrom),
- reporty (prehľad, pohľadávky, zákazníci),
- skúsenosti z prevádzky (pg_dump zálohy, kontrola Supabase ref v bundli, Vercel production branch).

### Odporúčanie: admin v kóde Royal Shop, na vlastnej adrese

- Admin je súčasťou repozitára Royal Eshop ako route group `(admin)` a beží na vlastnej subdoméne `admin.shop.royalstroje.sk`. Do zavedenia domény beží na `/admin`. `proxy.ts` ho podľa hostiteľa oddelí od obchodu.
- **Dôvod:** admin musí používať presne tie isté pravidlá ako obchod: `order-state.ts` (stavy menia iba povolené prechody), `money.ts`, `orders.ts`, Stripe klienta a Supabase typy. Kópia v inom repozitári by sa časom rozišla, a to sú presne miesta, kde ide o peniaze a právne lehoty.
- Serverové akcie Next.js bežia so service role. Do prehliadača sa nedostane nič citlivé.
- Od RCC je admin oddelený úplne: iná databáza, iní používatelia, iná adresa.
- Dizajn admina je pracovný, nie dizajn obchodu. Vzhľadom a ovládaním môže pripomínať RCC, aby sa v ňom ľudia z Royal Stroje cítili doma.

### Alternatíva B: vetva `instance/royalshop` v crm_core

Dá sa urobiť, no rýchle to nebude:
- prepísať dátovú vrstvu všetkých modulov na tabuľky shopu,
- pridať Supabase Edge Functions pre faktúry, prechody stavov a refundy,
- preložiť roly na `profiles.role`,
- vynechať migrácie crm_core.

Z „spustenia novej inštancie“ by zostal iba vzhľad a logika by bola duplicitná. **Neodporúčam.**

## 2. Moduly

### Fáza 1 – MVP (potrebné na prvú ostrú objednávku)

1. **Prihlásenie a roly.** Supabase Auth, prístup iba pre `profiles.role = 'admin'`. Kontrola beží na serveri v každej akcii aj stránke, nie iba v `proxy.ts`. Odporúčam aj 2FA (Supabase MFA, TOTP). Na začiatku dvaja admini.
2. **Dashboard.**
   - Upozornenia:
     - zaplatené a nepotvrdené objednávky (> 1 pracovný deň = červené),
     - objednávky blízko záväznej lehoty 10 pracovných dní,
     - otvorené reklamácie a odstúpenia s odpočtom.
   - Čísla: tržby a marža za obdobie, počty objednávok podľa stavu.
3. **Objednávky.**
   - **Zoznam:** filtre podľa stavu, platby, dodávateľa, spôsobu dopravy a obdobia; vyhľadávanie podľa čísla, mena, e-mailu a IČO.
   - **Živé zobrazenie:** Supabase Realtime na `orders`. Nová zaplatená objednávka sa objaví bez obnovenia stránky, so zvukom a odznakom v záložke.
   - **Detail:**
     - zákazník a fakturačné údaje,
     - položky s nákupnou cenou a maržou,
     - platba (Stripe odkaz),
     - história stavov,
     - interná poznámka,
     - faktúry a dobropisy,
     - zostávajúca dodacia lehota.
   - **Tlačidlá ďalšieho kroku** podľa `order-state.ts`:
     - Potvrdiť (dostupnosť overená),
     - Objednané u dodávateľa (referencia, očakávaný dátum),
     - Prijaté na pobočke,
     - Otestované,
     - Odoslané (dopravca, tracking) / Na ceste vlastnou dopravou / Pripravené na odber,
     - Doručené (nastaví `delivered_at` a `withdrawal_deadline`).
   - **Zrušenie s refundom** cez Stripe (celá suma vrátane dopravy, lehota 2 pracovné dni sa zobrazuje). Vytvorí aj dobropis, ak už bola vystavená faktúra.
4. **Faktúry.**
   - Faktúra sa vystaví pri potvrdení objednávky cez `issue_invoice()`. DUZP = dátum platby a na faktúre je text „Uhradené platobnou kartou dňa …“.
   - PDF sa generuje na serveri podľa šablóny z crm_core, ukladá sa do bucketu `documents` a sťahuje cez podpísanú URL.
   - Dobropis pri refunde.
   - Zoznam faktúr, filtre, stav úhrady.
5. **Stripe synchronizácia.** Webhook `charge.refunded`: zapíše refund do `payments` a `orders.payment_status`, aj keď refund vznikol priamo v Stripe dashboarde.
6. **Zákazníci.** Dnes sú všetky objednávky bez účtu, preto sa zoznam skladá z objednávok podľa e-mailu, resp. IČO. Detail zobrazí objednávky, reklamácie a odstúpenia. Prepojenie na účty príde s `/ucet`.
7. **Nastavenia firmy.** Údaje firmy, IBAN/SWIFT, časy výdaja, dopravné pásma a texty faktúr editovateľné v admine. Potom už netreba ručné SQL v Supabase.

### Fáza 2 – zákonné procesy (pred spustením ostrého predaja)

8. **Odstúpenia od zmluvy.**
   - Zoznam s odpočtom 14 dní na vrátenie peňazí.
   - Stavy: prijaté → čaká na tovar → tovar prijatý → skontrolované → vrátené / čiastočne / zamietnuté.
   - Refund cez Stripe. Pri čiastočnom refunde je povinné písomné odôvodnenie.
   - Ručné zadanie odstúpenia, ktoré prišlo e-mailom alebo listom.
   - Napojí sa na verejný formulár § 20a (úloha #2 v handoff).
9. **Reklamácie.**
   - Tabuľka alebo kanban podľa stavu, odpočet 30 dní (upozornenie pri 10 a 3 dňoch, po termíne červené).
   - Fotky, správy so zákazníkom, referencia dodávateľa.
   - Riešenie, zamietnutie iba s odôvodnením a poučením o ARS.
   - Potvrdenie a vybavenie ako PDF.
   - Toto je zároveň evidencia reklamácií, ktorú docs/06 kladie do CRM.
10. **Protokoly** (obrana pri reklamácii a odstúpení podľa docs/06):
    - výstupný protokol pre každý stroj: fotky, video skúšobného chodu, výrobné číslo, motohodiny, stav dosky alebo kotúča, palivo a olej, CE a vyhlásenie o zhode,
    - vstupný protokol pri vrátení,
    - záznam o zaškolení s podpisom zákazníka pri osobnom odbere.

    PDF kópiu dostane zákazník. Funguje aj z mobilu na dvore: fotky sa nahrávajú priamo z telefónu.
11. **E-maily** (Resend, čaká na schránku shop@royalstroje.sk):
    - šablóny podľa docs/04 §7.2, „Potvrdenie objednávky“ s PDF obchodných podmienok,
    - odosielanie z adminu sa zapisuje do `notifications_log`,
    - upozornenie adminovi na novú objednávku, reklamáciu a odstúpenie.
12. **Automatické úlohy** (Vercel Cron):
    - každú hodinu: upozornenie na nepotvrdené objednávky a zrušenie `pending_payment` starších ako 24 h,
    - denne: `delivered` + 14 dní → `completed` a pripomienky lehôt.

### Fáza 3 – riadenie predaja

13. **Produkty.** Úprava produktov, cien, nákupných cien (`product_costs`) a marže; akcie so správnou Omnibus cenou; zobrazenie, skrytie a archivácia; obrázky a dokumenty; GPSR polia; hromadná úprava cien po zmene cenníka alebo rabatu. Potom už netreba upravovať `catalog.json` a robiť reseed.
14. **Dodávatelia a značky.** Lehoty, marže, kontakty, objednávky u dodávateľa (`supplier_orders`) a ich stav.
15. **Reporty.** Tržby a marža podľa obdobia, značky, dodávateľa a kategórie; top produkty; refundy.
16. **Export pre účtovníčku.** ZIP s PDF + CSV za mesiac. Formát potvrdí účtovníčka.
17. **Audit.** `activity_log`: kto, kedy a čo zmenil (stavy, ceny, refundy, nastavenia).

## 3. Potrebné zmeny v databáze

Každá zmena je nová migrácia v `supabase/migrations/`. Ty ju spustíš cez `db push` alebo cez SQL editor + `migration repair`.

- **`issue_invoice`:**
  - variabilný symbol dobropisu sa dnes zhoduje s faktúrou (`D202600001` → `202600001`), treba ho rozlíšiť,
  - `tax_point_date` = dátum platby,
  - kontrola, že faktúra má riadky a súčty sedia.
- **`invoice_guard`:** zrušená faktúra je dnes znova editovateľná. Treba ju zamknúť.
- **`test_reports`:** motohodiny, video, stav dosky alebo kotúča, palivo a olej, CE kontrola, typ (výstup / vstup).
- **Nová tabuľka** pre záznam o zaškolení (podpis zákazníka).
- **`returns`, `claims`:** cesty k PDF potvrdení a vybavenia.
- **`payments`:** refund údaje (`refunded_at`, Stripe refund id, dôvod).
- Pri prechode na `delivered` nastaviť `withdrawal_deadline` (dnes ho nič nenastavuje).
- Pridať `orders` (a neskôr `returns`, `claims`) do Realtime publikácie.
- Prvé dva admin účty: vytvoriť používateľov a nastaviť `profiles.role = 'admin'` (SQL spustíš ty).

## 4. Otázky pred štartom

1. ~~Doména admina~~ – vyriešené: `admin.shop.royalstroje.sk`.
2. **Admini:** kto bude mať prístup (mená, e-maily)? Všetci s plnými právami, alebo rola „sklad“ iba na protokoly?
3. **Účtovníčka:**
   - jedna faktúra po platbe, alebo zálohový doklad + faktúra,
   - formát čísla dobropisu,
   - formát exportu.
   - **Royal stroje s. r. o. bude vystavovať faktúry z dvoch systémov (RCC aj shop).** Rady sa nesmú prekrývať: RCC má `10YYYYNNNN`, shop `YYYYNNNNN`, čo je v poriadku, ak to účtovníčka potvrdí.
4. **Upozornenie na novú objednávku:** stačí admin (živý zoznam + e-mail), alebo aj SMS/WhatsApp?
5. **Potrebuje RCC vidieť objednávky zo shopu** (napr. prehľad pre majiteľa)? Ak áno, neskôr iba na čítanie cez API, nikdy spoločná databáza.

## 5. Postup

1. Odsúhlasiť architektúru (bod 1) a odpovede z bodu 4.
2. Fáza 1 v poradí:
   1. prihlásenie,
   2. zoznam a detail objednávky s Realtime,
   3. tlačidlá stavov,
   4. faktúry + PDF,
   5. refund + dobropis + `charge.refunded`,
   6. dashboard,
   7. nastavenia.
   Testy (Vitest) pre prechody, refund a faktúru.
3. Fáza 2 pred ostrým spustením. E-maily hneď, ako bude schránka.
4. Fáza 3 priebežne po spustení.
