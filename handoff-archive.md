# Handoff Archive (do not read on /start)

## Session Summary (archived rows)

| Session | Date | Title |
|---------|------|-------|
| 5 | 2026-10-22 | Gölz back, workbook list prices, price on request, Honda engine list |
| 4 | 2026-10-21 | Free services, Unicon assortment, supplier price workbook |

## What Was Done (Session 13) -- Gölz only, new photos, diamond blades with a picker (2026-11-07)

- Honda off. Single-brand layout is data-driven, not a flag: `getNavCategories()` shows subcategories when fewer than 3 top-level categories have products; the home swaps the brand grid for a "Výrobca" section and shows all machines when `getBrands()` returns one brand. Turning brands back on restores the old layout with no code change.
- 12 Gölz photos (CMYK, 47 MB) converted to webp under the old file names, so no DB change was needed. Fixed a CSS clash: the contact page's `.gallery` squeezed the product gallery (renamed to `.storePhotos`).
- 9 blades in category `diamantove-kotuce` (3 types: tiles SLF10; masonry RX1S/BS30; concrete LCA65/LB20/TS40GX). Linked via `accessory_for` in catalog.json -> `related_products` type `accessory`; `AccessoryPicker` next to the buy box; `isAccessory()` hides the test-run note and QC badge. Prices = ferrotech +5 %, but ferrotech has only 3 of our sizes; 6 are estimates from German Gölz dealers (`price_source` per product, docs/05). Cut-off saws (~83 m/s) only get 100 m/s blades.
- Decided (user): blades ordered from Gölz together with the machine at first, stock later; blade alone = standard 3-5 days (already shown). No new živnosť: ORSR lists maloobchod + veľkoobchod for Royal stroje. The s.r.o. has eKasa. Domain is the last step (Peter).
- Launch questions for Peter (bank account + why, shop@ e-mail, OZV registration) and the Klaus e-mail are in the vault note above. EPR/OZV: electric Gölz machines + packaging (pallets exceed 100 kg/yr), not FS125/FS170 or blades; quotes from SEWA + ENVIDOM; cost est. hundreds EUR/yr, registration time unverified.
- Deployed 655888b (verified live). Gotchas: start Docker Desktop before `npx supabase start`; long heredocs with quotes fail in the Bash tool -> write a script file instead.

## What Was Done (Session 12) -- No discounts, ferrotech comparison, return risks, consumer reservations (2026-11-03..07)

- Discounts removed: TS250A, Honda ECT 7000G, Bomag BPR 25/50 back at list price (catalog.json + hosted SQL run by the user); "Akcie" nav link and home sale section render only while a discounted product exists.
- ferrotech.sk research (subagent): generic, partly outdated terms (ODR link, no § 20a function, pre-31.7.2026 OZ), Gölz prices = list -5 %. Our legal pages are ahead; two small ideas parked (row 4).
- `docs/08` risk ranking (R1 consumer withdrawal after the Gölz order = top risk). Benji confirmed the shop-sale route and added `docs/09` phone script + admin hint (commit d9c4c72).
- Reservations built (migration 20261104000001: status `reserved`, `orders.reserved_at`, `orders.contract_place`, `payments_provider_check`). Checkout, order page, admin step forms (payment method + on-premises checkbox), dashboard KPI "Rezervácie na zavolanie", customer link in admin, manual refunds, VOP art. 3/4/9, withdrawal page, delivery/payment page, docs/04 §4.2. 61 unit tests; Playwright on the local DB: shop sale (no withdrawal, form refuses), payment link (withdrawal offered), company checkout, mobile. Deployed d9c4c72 (VOP version 2026-11-04 live).
- Gotchas: do not run prettier on the repo (no config, reformats whole files); Playwright: the terms label contains links (click the input via JS), many headings are CSS-uppercased (compare lowercase), the footer has a global "Odstúpiť od zmluvy tu" link (check `id="withdraw-title"` instead of text).

## What Was Done (Session 11) -- Withdrawal (§ 20a): online form, portal panel, admin module (2026-11-03)

- Public two-step form in section 7 of `/odstupenie-od-zmluvy` (works without login), confirmation page `/odstupenie-od-zmluvy/potvrdenie/<OD>?t=<return token>` with the notice text and print/PDF. Before-delivery and partial withdrawal supported.
- Order pages (guest + portal) show a withdrawal panel; admin `/admin/odstupenia` list + detail (reject, Stripe refund, note), dashboard KPI, manual entry for e-mail/letter withdrawals. Order cancel uses the shared `src/lib/admin/refunds.ts`.
- Gotchas: reseeding regenerates order access tokens; seeded payments are fake `pi_demo_*`, run local dev with `STRIPE_SECRET_KEY=`; first `supabase db reset` after Docker start can fail on a container race, rerun.

## What Was Done (Session 10) -- Gölz + Honda only, trademark guideline, customer portal (2026-11-02/03)

- Gölz e-mails drafted and sent (process explanation, signed guideline + meta-tag question, photo request for FS125, FS170, MS400, TS250, TS250A, TS250A-330, BS650, BS900/1000, HS350, HS400F, SM250, SM280). Rules saved to agent memory (`golz-trademark-rules`).
- Shop shows only Gölz + Honda: filter in catalog reads, search, category counts and `fetchPricedProducts` (checkout refuses hidden brands from old carts); empty categories return not-found. Descriptions of `cerpadla` + `rezacia-technika` changed in `catalog.json` and on hosted (user ran SQL).
- Customer portal step 1: `/ucet` (orders), `/ucet/objednavky/[cislo]` (dated timeline, shipment tracking, WhatsApp wa.me link on the shop phone with the order number), `/ucet/profil` (person/company, billing address, password, GDPR delete), `/ucet/prihlasenie`, `/ucet/registracia`. Order body shared with the guest page (`order-detail.tsx` + `src/lib/order-detail.ts`).
- Linking: `profile_id` set at checkout when signed in (profile prefilled) or via "Uložiť do môjho účtu" on the guest order page (secret token). Never by e-mail alone: registration uses `auth.admin.createUser({ email_confirm: true })` because Supabase's default SMTP only mails team members, so e-mails are NOT verified. Switch to `signUp` with confirmation once Resend works; only then e-mail auto-linking.
- `proxy.ts` refreshes the session on `/ucet`, `/objednavka`, `/pokladna` (Server Components cannot persist a rotated refresh token).
- Verified with Playwright against hosted: register/login/logout, profile, wrong password, checkout prefill + linked order (test account `claude-zakaznik-1793624915@royalshop.test` / `TestHeslo123`, unpaid OBJ26-00013), foreign order 404, mobile no horizontal scroll.
- Gotchas: `pkill` does not stop `next start` on Windows (kill the port owner via PowerShell `Get-NetTCPConnection -LocalPort 3123`). React 19 resets forms after an action, so actions return the submitted `values` (see `updateProfile`). New routes need `npx next typegen` before `tsc`.

## What Was Done (Session 9) -- Admin console phase 1a: orders, withdrawal-window tracking (2026-10-23)

- Login (`/admin/prihlasenie`, Supabase password, `profiles.role = 'admin'` checked by `requireAdmin()` in every page/action; `src/proxy.ts` only refreshes the session and bounces signed-out visitors). Admins: the user + test account `claude@royalshop.test` (creds as `ADMIN_TEST_EMAIL/PASSWORD` in `.env.hosted.local`, used for Playwright checks).
- Prehľad (unconfirmed > 1 working day, open withdrawal windows + EUR at risk, consumers before delivery, binding 10-day delivery limit, month revenue/margin), Objednávky list with search/status filter + withdrawal-window chips, detail with margin, payments, history, next-step forms, cancel + refund, internal note. Live updates via Realtime on `orders` (migration 20261023000002, applied) + 60 s poll fallback.
- Withdrawal logic in `src/lib/withdrawal.ts` + `src/lib/sk-calendar.ts`: 14 days from delivery (Bratislava day), last day shifted past weekends/holidays (§ 122 OZ; holiday list deliberately conservative), 5-day "grace" for notices posted on the last day. Consumers may withdraw before delivery too, so paid + undelivered consumer orders count as risk. "Vybavené" is blocked until grace ends. `withdrawal_deadline` is now set on "Doručené".
- Stripe: cancel refunds captured payments (idempotency key) / expires open sessions; `charge.refunded` webhook mirrors refunds (event added in the Stripe test dashboard). Legacy manual-capture orders (OBJ26-00010/11, payments `authorized`) are captured on "Potvrdená" and released on cancel.
- Gotchas: under Cache Components the Supabase auth client reads the clock -> `await connection()` in `getAdmin()`; `usePathname()` in the panel layout needs a Suspense boundary (fallback `NavList pathname=""`); CSS `composes` avoided in `admin.module.css`.
- NOT verified: write actions (status change, cancel/refund, note) -- agent writes to hosted are blocked; the user tests them on the deploy.

## What Was Done (Session 8) -- Legal research, legal pages, immediate payment (2026-10-23)

- 5-agent legal research (Slov-Lex consolidated texts, Oct 2026) -> `docs/06-pravne-stranky.md` + `docs/pravne/`. Key findings: consumers may withdraw even with a used/damaged machine (we may only claim diminished value, separately, no set-off § 22 ods. 8 ZOS); misuse is not a defect but WE must prove it for 2 years (§ 620 OZ), so the test protocol (photos, serial, engine hours) + signed training record are the defence; return costs are chargeable only if shown before the order.
- Founder decisions: charge immediately (contract = our "Potvrdenie objednávky" e-mail, refund within 2 working days if unavailable, substitute only with consent); delivery "3-5 usual, 10 max"; pickup hours Po-Pi 8:00-15:00 (yard is 7-16); keep shipping bands. Founder is checking Honda/Bomag/Gölz warranties and SK manuals, and sees withdrawal of damaged machines as a big risk -> revisit.
- Six legal pages (VOP incl. B2B article, reklamačný poriadok A/B, odstúpenie with príloha 2/3 verified verbatim against the PDF, doprava a platba, GDPR, cookies). Footer links; "Odstúpiť od zmluvy tu" -> `/odstupenie-od-zmluvy#formular` (e-mail fallback until the § 20a form exists).
- Stripe manual capture removed; status `paid_authorized` -> `paid` (migration 20261023000001). Return-cost estimate per weight band on PDP and in checkout (`RETURN_COST_ESTIMATES`, placeholders until the carrier price list).
- No cookie banner needed today (shop sets no cookies; cart = localStorage); it is needed before GA4/Meta. Rejected: keeping manual capture (cheaper refunds, but 7-day hold expiry and founder wants to order right away).

## What Was Done (Session 7) -- Delivery 3-5 days, home polish, sale, contact page, new motto (2026-10-22/23)

- Founder decisions: weight shipping bands stay as they are; 800 EUR minimum is only a guideline; Resend waits for the shop@royalstroje.sk mailbox; IBAN/SWIFT coming from the founder; admin will live in RCC (scope later).
- Hosted data changes: the auto-mode classifier blocks every agent write to hosted (even a supabase-js update), so the user runs SQL in the Supabase SQL editor of `royalshop1` (a different Supabase account than RCC's "Royal Stroje" project, eu-west-3, never run shop SQL there). Read access works with the anon key from `.env.hosted.local`; verify after each SQL. Catalog reads are `cacheLife("hours")`, so redeploy (empty commit) after a data change. Keep `catalog.json` in sync with every hosted edit.
- Home: the last category tile spans the full row only when it would sit alone (`nth-child` rules for 2 and 3 columns), so 8 categories make a clean 3x3. 6 featured (+ Gölz FS170, Enar DINGO 230 V 3 m). Footer bottom padding 28 px.
- Sale: 5 % on Bomag BPR 25/50, Gölz TS250A, Honda ECT 7000G (compare_at = old price, Omnibus 30-day price correct). To end: `update products set price_gross_cents = compare_at_price_cents, compare_at_price_cents = null where slug in (...)` + revert `catalog.json`.
- `/kontakt`: cards, pickup point, rental yard photo, Google Maps pin 48.224467,17.418349 (same as royalstroje.sk), map iframe only after a click (GDPR), gallery. Photos come from the RoyalStroje project (`public/kontakt/`) and will be replaced later; two interior shots show cordless Makita/Ryobi.
- Hero motto A "Prémiové stroje od výrobcov, za férové ceny." + service USPs. Claims rule: "od výrobcov a ich oficiálnych zastúpení", never "priamo" (only Gölz is direct, the rest via Unicon), no "najlepšie/najnižšie ceny"; claims: we are liable, "vybavíme s výrobcom" is how we handle it.

## What Was Done (Session 6) -- Engines to cart, hovers, sticky header, real contacts, weight shipping (2026-10-22)

- Every Honda GX variant in the `/kategoria/motory` table has "Do košíka": non-stocked variants are seeded as products with `is_listed = false` (cart/checkout/PDP work; hidden from listings, counts, search). Slug/name helpers in `src/lib/honda-engines.ts` shared by seed and table. Variant weight = stocked engine of the same family.
- Design: orange "Do košíka" + header cart with lift-on-black-shadow hover (same as PDP button); engine-table buttons stay dark (181 rows); Gölz is the highlighted brand tile (`PRIMARY_BRAND` in home `page.tsx`), hover orange so it never matches a hovered regular brand (dark); logo hover; category nav orange underline.
- Sticky header (`sticky-header.tsx`): always on from 800px (146px, `--header-h` offsets filters/gallery/summary); on phones hides on scroll down, returns on scroll up (204px would be a quarter of the screen). Found the filters sidebar was never sticky (`inset: auto` after `top`).
- Operator: Royal stroje s. r. o., Boldog 182, OR Mestský súd Bratislava III, Sro, 195530/B (from orsr.sk; royalstroje.sk/kontakt lacks it), +421 948 555 551, shop@royalstroje.sk, pickup Recká cesta 182 Boldog. Copy says "Boldog pri Senci"; zones/labels say "od predajne". IBAN still a placeholder.
- Shipping by total order weight, one SR price, no free shipping (threshold made the heaviest orders free): 40 kg parcel 9,90 / 100 kg 49 / 300 kg 89 / over 149 € (placeholders) in `company_settings.shipping_rates`; null weight = heaviest band. Distance zones and own transport dropped from cart/checkout (enum kept for old orders). PDP shows the product's delivery price.
- Next.js 16.4.0 -> 16.4.2 (critical RCE GHSA-2464-fhr4-w9xw). `next dev` can stop on an upgrade notice addressed to agents; just rerun it.

## What Was Done (Session 5) -- Gölz back, workbook list prices, price on request, Honda engine list (2026-10-22)

- Gölz re-added: 12 machines, founder's net prices x 1.23 exact to the cent (no ...9 rounding), photos/specs from golzgroup.com (server-rendered, curl works). New categories `rozbrusovacky`, `brusky-na-beton`; `stolove-pily` renamed "Stolové a blokové píly". Supplier `golz`, purchase placeholder net x 0.78.
- Assortment = green rows of founder's `Royal Shop Cenniky.xlsx` (read fills with openpyxl; CSV export loses colours). Price = workbook column F exactly: round(CZK/24.26, 2) x 1.23 (net rounded first, else 1-cent drift). Purchase placeholder net x 0.8. Demo sale prices dropped. Dingo kits = sum of DINGO + TAX-TDX 3|5/AX58 list prices.
- Removed NT 76/76P, BP 12/35, EM30, Cedima, Husqvarna. Added NT 64P/72P (restored from git 31645c1 incl. photos), RZ 120, VD 450 damping mat + wheel kit (category `prislusenstvo`), Honda EC 3000G (+AVR, made by GENERGA, Kaunas), Enar AVMU, DINGO, 4 shafts, QZH. Bomag BPR 45/55 and 60/65 = existing D machines renamed DE (electric start is standard).
- Honda GX engines pinned to price-list variants: GX120T3-QX-4E-OH, GX160H2-QX-3-OH, GX200H2-QX-3-OH, GX270T2-QH-B1-OH, GX390T2-QH-B1-OH (no QX type for 270/390 T2).
- `products.price_on_request` (migration 20261022000001): card "Na požiadanie" + "Zistiť cenu", PDP call/e-mail buttons, excluded from price filter/bounds, last in price sort; `fetchPricedProducts` filters it out so it can never reach a quote/order/Stripe. Atlas Copco uses it; to restore a price delete the flag in `catalog.json` and reseed.
- `/kategoria/motory` shows all 181 Honda GX variants (`src/data/honda-engines.json` from `scripts/honda-engines.py`, EUR only) with "V ponuke" links / mailto enquiry and a code legend. Only the shaft letter is Honda-documented; X/H, E-version, OH/SD colours, T/H plant are inferred and worded "zvyčajne". Sources in docs/05.
- Gotcha: `.root a { color: inherit }` beats single-class button styles on `<a>`; use `a.className` selectors for link buttons.

## What Was Done (Session 4) -- Free services, Unicon assortment, supplier price workbook (2026-10-14 / 2026-10-21)

- Web: "Služby v predajni zadarmo" (home section 04 + PDP box), pre-footer "Nenašli ste stroj?" CTA in `ShopShell` (phone/email from `company_settings`, still demo values +421 900 000 000 / info@royalshop.test).
- Price workbook: `python scripts/cennik.py` builds `docs/cenniky/Cennik-dodavatelov.xlsx` from `docs/cenniky/data/*.csv` + `zdroje.json` (rate ČNB 24.260, per-brand rabat cell D3). Recalc/verify with Excel COM via PowerShell (LibreOffice recalc fails on Windows).
- `docs/cenniky/` is git-ignored: repo is PUBLIC, supplier CZK/purchase prices must never be committed (only EUR retail prices that the site shows anyway).
- All supplier lists are recommended retail excl. VAT, not purchase prices; real rabat per brand still unknown (D3 = 0 %).
- Shipping discussion (not decided): free shipping >= 2000 EUR also covers heavy own transport (200-300 EUR to Košice). Proposal: courier free for light machines, flat SR price for heavy via pallet carrier (59/89 EUR placeholders), free pickup in Senec; founder to collect pallet carrier quotes.

## What Was Done (Session 3) -- Hosted infra, Stripe live test, machine assortment (2026-10-10 / 2026-10-12)

- Hosted Supabase + Vercel + Stripe test mode live (details in Current State). Live 4242 payment verified: order `paid_authorized`, PI `requires_capture`, webhook stored.
- Founder pivot (2026-10-12): no cordless tools, no Makita; premium machines >= 800 EUR from brands with direct contact (photo of founder's list): NTC (via Unicon Ostrava), Bomag, Honda, Atlas Copco, Grindex, Gölz, Cedima, Enar, Master. Design C approved ("dobre sa na tom da stavat").
- Catalog rebuilt from 4 research agents: real models, specs from maker sites, price = market -5 % ending in 9, purchase = net x (1 - supplier margin). `docs/05-sortiment-stroje.md` is the founder price/verification sheet; raw research with price URLs in `docs/research-sortiment/`. Suppliers now live in `catalog.json`; seed throws below 800 EUR.
- Dropped on purpose: Honda ECT/ECMT 7000G 3-phase (built by Generga, GPSR unclear -> NTC TRT covers 3-phase), Grindex Master N (estimate only), Gölz SF150, Enar AVMU/Dingo (< 800 EUR). Grindex is Xylem, not Atlas Copco; Unicon also distributes Grindex.
- Images: official maker photos for 66/78 (WEDA, Grindex, Honda WH20, NTC TR 7 AVR use placeholder). Master originals: rewrite `cache/media/products/<id>/<Name>_<hash>.webp` -> `media/products/<Name>.jpg`. NTC reuses photos across models; mismatched 2nd images removed.
- Home: brand grid (`getBrands()`, class `brandTile` -- `.brand` already exists for the card brand label) replaced the battery-platform section.
- Gotcha: Vercel stopped posting GitHub commit statuses after the repo went public; check the live site / Vercel UI instead of `gh api .../status`.

## What Was Done (Session 2) -- Design C storefront, cart and checkout (2026-10-10)

- Founder chose design C ("Stavenisko") with safety orange `#ff6a13` instead of lime. `/navrh` drafts deleted; styles live in `src/components/shop/shop.module.css` (one CSS module, tokens on `.root`).
- Catalog reads: `src/lib/catalog.ts` (`"use cache"`, `cacheLife("hours")`, tag `catalog` -> admin edits must call `revalidateTag("catalog")`). Filters are pure (`src/lib/listing.ts`), URL-driven, facet counts exclude own group.
- Omnibus decision: discount % and struck price use `lowest_price_30d()` (law 310/2025 § 7 "počítať od"), fallback compare_at (`src/lib/pricing.ts`).
- Checkout: browser cart in localStorage (`cart-store.ts`) is display-only; `buildQuote` (`cart-pricing.ts`) is the single pricing path for cart page, summary and the written order. `fetchPricedProducts` reads fresh DB prices + purchase price for `order_items` snapshot; `publicFields()` strips it before quotes reach the browser (tested).
- Payments: `placeOrder` -> Stripe Checkout `capture_method: manual`; webhook `/api/webhooks/stripe` (payment_events idempotency, deletes event on handler failure so Stripe retries); return URL also confirms the session (works without webhook forwarding locally). No `STRIPE_SECRET_KEY` => demo mode: "Zaplatiť (testovacia platba)" simulates authorization through the same `markPaymentAuthorized`.
- Guest order page `/objednavka/<number>?t=<access_token>` (new migration adds `orders.access_token`). Status changes only via `transitionOrder` in `src/lib/orders.ts` (optimistic lock on current status + history row).
- Gotchas: React 19 resets `<form action>` inputs after an action, so checkout dispatches the action from `onSubmit` in a transition. Zod v4 needs `z.string({ error })` or missing fields show English "Invalid input". Next 16 `Image` uses `preload`, not `priority`. Slovak weekday after "v" needs accusative (`formatDeliveryDate(d, "acc")` -> "v stredu"). Next keeps previous routes hidden in DOM (3x `h1` in Playwright).
- Verified: 36 Vitest tests, tsc, eslint, `next build`; Playwright e2e for person/courier (desktop) and company/heavy machine/zone (mobile) -> orders OBJ26-00011/00012 in local DB.

## What Was Done (Session 1) -- Research, spec, foundation, design directions

- Research (docs/01, 03), founder Q&A (docs/02), technical spec (docs/04). Model: customer pays -> we buy from supplier (Makita SK ~48h, NTC CZ 3-5d) -> Senec branch -> tested -> courier / own transport / pickup.
- Next 16.4 scaffold, Supabase migrations, seed (`npx tsx scripts/seed.ts`, password `RoyalDemo2026!`), libs money/order-state/shipping.
- Gotchas: Windows excludes ports 54775-55351 -> 564xx. Postgres rejects `timestamptz + interval` in generated columns (deadlines via trigger). Turbopack Tailwind rule must exclude `*.module.css`.
- Decisions: one Next app (shop + /ucet + /admin); Stripe Checkout hosted, manual capture; invoices at capture; withdrawal persons only; guest checkout; numbers `OBJ26-00001`, `RK26-0001`, `OD26-0001`, credit notes `D2026NNNNN` (confirm with accountant).

## Session Summary (archived rows)

| Session | Date | Title |
|---------|------|-------|
| 3 | 2026-10-12 | Hosted infra, Stripe live test, premium machine assortment |
| 2 | 2026-10-10 | Design C storefront, cart and checkout |
| 1 | 2026-10-09 | Research, spec, foundation, design directions |
