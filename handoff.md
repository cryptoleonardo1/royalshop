# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app, admin at `/admin`, customer portal at `/ucet`. **Strategy changed 2026-11-12: full-range shop (1000+ items) instead of "premium machines >= 800 EUR, no cordless".** Shown brands (`SHOP_BRANDS` in `src/lib/shop-brands.ts`): Gölz (12 machines + 9 blades) and Makita (888 machines, 754 in stock) = 909 products. Consumers send a non-binding reservation (no payment), companies pay at checkout; no discounts. Stripe test mode. No emails yet. Invoices + credit notes live since session 15.
- **Session count:** 16
- **Decisions:** (2026-10-23) admin console lives in THIS repo at `/admin`, separate from RCC; only crm_core's invoice PDF/PAY by square, layout and reports get ported. Domains: shop `shop.royalstroje.sk`, admin `admin.shop.royalstroje.sk` (`ADMIN_HOST`). Plan: `docs/07-admin-konzola-plan.md`. Weight shipping bands (9,90 / 49 / 89 / 149) accepted until the founder says otherwise. 800 EUR minimum is a guideline only. (2026-11-03) No discounts at launch: prices exactly as the Gölz catalogue (ferrotech.sk sells the same Gölz saws at list -5 %; matching is the founder's call, depends on our real purchase price).
- **Repo status:** `main` tracks origin (github.com/cryptoleonardo1/royalshop, PUBLIC, `bugiiiii11` is collaborator). Push to `main` = Vercel production deploy. Benji (Mind Palace vault) also commits here (e.g. d9c4c72) -- fetch before work.
- **Vercel:** project `royalshop`, team "Bugiiiii's projects" (Hobby; Pro needed before go-live for the DPA). Repo MUST stay public (private = every deploy fails "Git author must have access"). Check with `gh api repos/cryptoleonardo1/royalshop/commits/<sha>/statuses --jq '.[0]'`. Local Vercel CLI and Supabase CLI are different accounts -- use web UIs.
- **Hosted Supabase:** project `royalshop1`, ref `vzytkquuljtoopgfcfak`, Frankfurt. Keys + DB URL in `.env.hosted.local` (gitignored). Migrations: `set -a; . ./.env.hosted.local; set +a; npx supabase db push --db-url "$SUPABASE_DB_URL"` (the agent may only `--dry-run`; the user runs the real push, SQL and seeds). Push code only after the migration it needs is applied. Remote is up to date through 20261112000001 (products.in_stock). On 2026-11-12 the user let the agent run the migration + Makita import on hosted once (asked first); the default stays: ask before any hosted write. Data-only SQL lives in `supabase/snippets/` (blades snippet run by the user 2026-11-07).
- **Stripe:** test mode, webhook `https://royalshop.vercel.app/api/webhooks/stripe` (completed + expired + charge.refunded). Immediate charge (no manual capture).
- **Local DB:** Supabase via Docker on ports 564xx (API :56421, Studio :56423). Local dev for Playwright: `NEXT_PUBLIC_SITE_URL=http://localhost:3123 STRIPE_SECRET_KEY= PORT=3123 npm run dev` (`.env.local` sets the site URL to :3000, so checkout redirects break without the override; empty Stripe key = demo payments). `npm run build` needs the hosted env.
- **Delivery time:** "zvyčajne 3-5" and binding "najneskôr do 10 pracovných dní od zaplatenia" (`DELIVERY_MAX_WORKDAYS`). SOI fined a shop for missing its upper bound, keep it real.
- **Legal:** research in `docs/06-pravne-stranky.md` (+ `docs/pravne/A-E`); risks of returns/claims ranked in `docs/08-rizika-vratenia-reklamacie.md` (reviewed by Benji 2026-11-05); phone script `docs/09-skript-rezervacia-telefonat.md`. Page texts in code, `LEGAL_VERSION` = 2026-11-04 (bump on any wording change). Not reviewed by a lawyer.
- **Reservations (2026-11-03, rules settled by Benji 2026-11-05):** person checkout -> status `reserved` (`reserved_at`), no payment. Admin calls; the call must NOT close the sale (phone = distance contract). Then either (a) sale signed and paid in the shop: admin step "Zaplatená" with provider cash/card_terminal/bank_transfer + checkbox -> `contract_place = 'on_premises'`, no statutory withdrawal (Directive 2011/83 recital 20), or (b) step "Čaká na platbu" = payment link on the order page, distance contract, withdrawal applies. No online deposit from consumers, ever. Order from Gölz only after signature + deposit in the shop. Expired Stripe session does not cancel a former reservation. Non-Stripe payments are refunded by hand (system only records). VOP: an unagreed reservation lapses after 10 working days (manual cancel today).
- **Gölz partnership:** process approved by Klaus Schlör. Returns only for valid reasons after consultation; minor defects repaired by local partners "for reimbursement of costs"; Gölz pays shipping in warranty cases. Consumer withdrawal risk therefore sits with us. Trademark rules in agent memory (`golz-trademark-rules`). Photos received 2026-11-06 (originals in gitignored `originals/`, converted with `scripts/convert-product-photos.mjs`). The 11-03 e-mail was never sent; replaced by a shorter launch e-mail (SK + EN) in vault `Projects/RoyalShop/RoyalShop - Golz email pred spustenim 2026-11-07.md` -- Peter reviews the SK version and sends the EN one. Gölz has no SK producer registration (Klaus 2026-10-27), so EPR/OZV is on us.
- **Portal security:** no customer "own read" RLS on orders/order_items/order_status_history/returns (they expose admin notes, purchase prices). Reads go through server code with safe columns (`src/lib/account/data.ts`, `src/lib/order-detail.ts`, `src/lib/returns-server.ts`). Do NOT re-add them.
- **Withdrawal:** form gate = order number + e-mail (name recorded, not checked). Insert only via SQL `create_return()`. Customer deadline `withdrawalEligibility()`; admin grace in `withdrawalInfo()`; new window/block `on_premises`. Value reduction never deducted from the refund (§ 22 ods. 8).
- **EPR / OZV (session 14 research, 2026-11-09):** importing from another EU state makes us the Slovak "producer" of EEE + packaging (+ batteries): ISOH register entry (MŽP, max 10 working days after the OZV files it) + OZV contract, no selling before entry, ~2-4 weeks total, ~200-500 EUR/yr. Not about the e-shop: in-shop sales trigger it too; not repacking or "buy into assets, sell as used" do not avoid it. Buying from a supplier registered in SK makes us only a distributor (1:1 take-back, recycling fee pass-through). SEWA = one contract for EEE + packaging but 10-year term; NATUR-PACK 0 EUR entry; ENVIDOM likely EEE only. Unicon e-mail (registration question first) drafted in chat 2026-11-09, Peter sends it.
- **Strategy check (2026-11-10):** Peter's ChatGPT idea (5-20k dropship items via wholesaler XML/API feeds, WooCommerce + BaseLinker) rejected for now: the 5 suggested wholesalers do not fit (MaxiTools closed, Brandor Estonia-only, Dropcom no tools, Metal Trade fasteners, AHProfi CZ tools only), none SK-registered; EPR/GPSR/SK manuals/returns scale per product. Stay with the original plan; grow via accessories for our machines; own feed import later if needed.
- **Sales mode (2026-11-10):** no deposits. Consumers pay the full price either in the shop (signed contract, `on_premises`, no statutory withdrawal) or online via payment link (distance, 14-day withdrawal). User leans to shop-only payment at the start to cut risk; Peter decides.
- **Invoices (session 15):** issued at "Potvrdená" via `issue_invoice()` (`src/lib/invoices/`), credit note on cancel-with-refund and withdrawal refund; PDF (jsPDF, Inter fonts traced via `outputFileTracingIncludes`) in bucket `documents`. No PAY by square (always paid before issue); IBAN printed only if mod-97 valid. Credit-note VS = corrected invoice VS. A refund made directly in the Stripe dashboard creates NO credit note -- refund from the admin. Before the first real invoice: reset `document_counters` (demo data used 202600001+). Accountant to confirm: `D` credit-note format, VS rule, one invoice after full payment.
- **Reservations expiry (2026-11-10 decision):** cancelled BY HAND for now. Cron route `/api/cron/rezervacie` + `src/lib/expire-reservations.ts` are ready but unscheduled (no `vercel.json`); enabling = add the crons entry + `CRON_SECRET` in Vercel (docs/04 §7.5). Admin detail shows the VOP lapse date.
- **Makita (session 16):** Royal stroje is an authorised dealer, buys direct (Makita s. r. o., Banská Bystrica = SK entity, so we are only a distributor for EPR). Pipeline: `docs/cenniky/MakitaTovary.xlsx` (daily export, git-ignored; where Peter downloads it is unknown) -> `python scripts/makita-catalog.py` (matches codes to makita.sk, cache + photos in git-ignored `originals/makita/`) -> `supabase/seed-data/makita.json` -> `npx tsx scripts/import-makita.ts` (idempotent; uploads photos to bucket `product-images`, archives machines that left the export; hosted: source `.env.hosted.local` first). Price = Makita MOC. `scripts/seed.ts` wipes the catalog, so re-run the import after it. Not imported: 5 025 accessories, 24 225 spare parts. The Trade days sheet prices are "1 sample per store" promo prices, NOT regular purchase prices.
- **Stock:** `products.in_stock` (true / false / null = supplier does not report). false = no add-to-cart, server pricing drops it from the cart. Category tree for the full range lives in `catalog.json` (the import syncs it); `brusky-na-beton` moved under `brusky`.
- **CEG (ceg.sk):** Slovak B2B-only wholesaler (Zlaté Moravce, 5.7 M EUR, owner Narimex), has NTC, Cedima, Enar, Master, Eibenstock, Rubi, Bosch, DeWalt; B2B portal on Offeris (REST API possible, key must be issued by CEG). Meeting with the owner 2026-11-20; question list given to the user in chat (API key + sample export + price list + importer per brand BEFORE the meeting). Competitor check: Stahlmann 10.5 M / 4.9 % net, A-Z Stroj 4.2 M / 4.7 %, MadMat 2.5 M / 0.9 %; all have stores and stock.
- **Entity question (open):** shop under Royal stroje s. r. o. or a new s.r.o. (Royal stroje has a 49 % investor not involved in the shop). Agent recommended a new s.r.o. if owners differ (a separate bank account separates neither profit nor liability; SEO is not tied to the entity; Makita authorisation and VAT registration need checking). User discusses with Peter.
- **Seed guard:** `seed_reset()` checks `company_settings.is_demo`. Set `is_demo = false` before real orders.

## What Was Done (Session 15) -- Invoices + credit notes, reservation expiry prepared (2026-11-10)

- Printed contract/protocol reviewed by the user, pushed (ca728dc). Invoices module (dev task 12) built, migration applied by the user, deployed 0d45129; user tested it on prod: works.
- Migration 20261110000001: cancelled invoices locked, issue checks lines/totals, DUZP from paid_at, credit-note VS = invoice VS, `hotovost` method, one live invoice per order.
- Admin: "Faktúry a dobropisy" panel on order detail (PDF link, manual "Vystaviť faktúru", "Vytvoriť PDF" retry), `/admin/faktury` month list with totals. Customer: PDF links on order page/portal via `/objednavka/<nr>/doklad/<id>?t=<token>`.
- Dev task 13: reservation expiry (10 working days, sk-calendar keeps 1. 9. / 17. 11. as holidays = conservative) built and tested, then user decided manual cancel for now -> cron left unscheduled (0bc20d5).
- 74 unit tests, tsc + eslint clean. Gotchas: after `npm run build` the local dev server looped on reload -> delete `.next` and restart dev; Docker Desktop had stopped (restart it); "⚠ ./" dev warnings are the Big Shoulders font, harmless; Playwright on Windows needs PYTHONIOENCODING=utf-8 for Slovak output.

## What Was Done (Session 16) -- Cart blade reminder, strategy change, 888 Makita machines live (2026-11-10/12)

- Dev task 14 shipped (4420b87): blade picker under the cart lines when a saw has no fitting blade in the cart (not for machines with a blade in the box). User tested sessions 14-15 on prod end to end: no bugs.
- Research (2 subagents) on CEG and on Stahlmann / MadMat / A-Z Stroj -> Current State "CEG". Advice given: CEG yes as supplier; show by margin, do not expect big margins on commodity brands.
- Makita import built and deployed (2b7bed6): 870 of 888 machines matched on makita.sk, 1 911 photos in Storage; verified on prod with Playwright (909 products, search, out-of-stock behaviour).
- Catalog reads now page past PostgREST's 1000-row cap; list data keeps only 6 specs + filterable + `blade_included` per product (cache size). Photos: `product_images.path` without a leading slash = object in bucket `product-images` (`src/lib/product-image.ts`).
- Task 15 (switch brands per supplier answers) not done: no answers from Unicon / Honda yet.
- Gotchas: after a Docker Desktop restart Windows reserved ports 56327-56426 (local Supabase 5642x) -> `supabase start` fails with "ports are not available"; fix = admin shell `net stop winnat; net start winnat` or reboot (this session ran the stack temporarily on 5542x, reverted). Do not run `prettier --write` with defaults (repo is formatted at 120 columns, no config). File IO was very slow while Docker was starting.

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | Peter (user): before the CEG meeting 2026-11-20 ask CEG for the API key/docs, a sample export, our price list, reseller terms, importer per brand. Decide the entity (Royal stroje vs new s.r.o.) before signing with CEG. Still open: sales mode, Gölz e-mail, IBAN+SWIFT, shop@royalstroje.sk, lawyer, accountant. |
| 2 | High | Makita, ask Peter/Makita: consent to use makita.sk photos and texts (they are live on the demo now), regular dealer price list or discount from MOC (then fill `product_costs`), weights, where the daily export comes from (URL/login -> automate the stock + price sync; today it is a manual 3-step run). |
| 3 | High | Storefront copy no longer fits the full range: home hero ("Prémiové stroje", "každý stroj odskúšame"), delivery texts "vrátane testu pred odoslaním" on product page/cart, "Odskúšanie pred kúpou" box. Card QC mark and the test note are already off for Makita (`isTestedBeforeDispatch`). Rework the home page for a multi-brand tool shop. |
| 4 | High | Checkout for cheap items: consumers should pay online at once for boxed tools (reservation + phone call only makes sense for machines); add Packeta/Z-BOX. Needs a rule per product or price, and the VOP/legal texts updated (`LEGAL_VERSION`). |
| 5 | Medium | Catalog UX for 900+ products: "len skladom" filter, sort by stock, 68 machines without weight are priced in the heaviest shipping band (149 EUR), 18 machines have no photo (no makita.sk page), a few odd categories (TW0350/TW1000 impact wrenches sit in "Skrutkovače"). Then Makita accessories (5 025) with machine links, spare parts later. |
| 6 | Medium | Resend once shop@ exists: order/reservation e-mails (poučenie on a durable medium), invoice PDF, withdrawal confirmation, Supabase Auth SMTP. Dev task 15 when supplier answers arrive. |
| 7 | High | Pre-launch: Vercel Pro (DPA + image optimization quota: ~1 900 remote photos now go through next/image), reset `document_counters` + demo data (`is_demo = false`), GPSR data per product (the Makita brand row lists Makita s. r. o. SK as the manufacturer contact: verify), SK manuals, accountant, domain + `ADMIN_HOST` last. |

## Key Files

| File | Purpose |
|------|---------|
| `docs/04-technicka-dokumentacia.md` | Source of truth: order states, data model, portal screens |
| `docs/05-sortiment-stroje.md` | Assortment and suppliers; Makita import pipeline and what is missing |
| `scripts/makita-catalog.py` / `scripts/import-makita.ts` | Makita export + makita.sk -> `supabase/seed-data/makita.json` -> database + Storage |
| `src/lib/catalog.ts` / `src/lib/product-image.ts` | Public catalog reads (paged, cached), nav categories, photo URLs |
| `src/lib/shop-brands.ts` / `src/lib/accessories.ts` | Brands shown; accessory rules, blade reminder, `isTestedBeforeDispatch` |
| `src/lib/checkout-actions.ts` / `src/lib/orders.ts` | Reservation vs payment at checkout; server pricing (drops out-of-stock) |
| `docs/08-rizika-vratenia-reklamacie.md` / `docs/06-pravne-stranky.md` | Return/claim risks + reservation rules; legal decisions |
| `src/lib/order-state.ts` / `src/lib/admin/order-actions.ts` | Order transitions; admin steps incl. on-premises payment |
| `src/lib/invoices/` | Invoice/credit-note build, PDF render, issue + storage |
| `supabase/seed-data/catalog.json` | Catalog source for Gölz etc. + the category tree, Makita brand/supplier rows |

## Session Summary

| Session | Date | Title |
|---------|------|-------|
| 7 | 2026-10-23 | Delivery 3-5 days, home polish, sale, contact page, new motto |
| 8 | 2026-10-23 | Legal research, legal pages, immediate payment |
| 9 | 2026-10-23 | Admin console phase 1a: orders, withdrawal-window tracking |
| 10 | 2026-11-03 | Gölz + Honda only, trademark guideline, customer portal |
| 11 | 2026-11-03 | Withdrawal (§ 20a): online form, portal panel, admin module |
| 12 | 2026-11-07 | No discounts, ferrotech comparison, return risks, consumer reservations |
| 13 | 2026-11-07 | Gölz only, new photos, diamond blades + picker, launch questions |
| 14 | 2026-11-10 | Peter tasklist, OZV research, supplier strategy, printed shop documents |
| 15 | 2026-11-10 | Invoices + credit notes (PDF), reservation expiry prepared (manual cancel) |
| 16 | 2026-11-12 | Cart blade reminder, strategy change to full range, 888 Makita machines live |
