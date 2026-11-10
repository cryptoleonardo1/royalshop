# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app, admin at `/admin`, customer portal at `/ucet`. Since session 13 **only Gölz** is shown (`SHOP_BRANDS` in `src/lib/shop-brands.ts`; Honda off until Honda confirms): 12 machines + 9 diamond blades. Goal now: launch ASAP; since session 14 the first supplier may be one with Slovak EPR registration (Unicon / Honda SK) instead of Gölz, see EPR below. Since session 12: **consumers send a non-binding reservation (no payment), companies pay at checkout**; no discounts, catalogue list prices only. Stripe test mode. No emails yet. Invoices + credit notes live since session 15.
- **Session count:** 15
- **Decisions:** (2026-10-23) admin console lives in THIS repo at `/admin`, separate from RCC; only crm_core's invoice PDF/PAY by square, layout and reports get ported. Domains: shop `shop.royalstroje.sk`, admin `admin.shop.royalstroje.sk` (`ADMIN_HOST`). Plan: `docs/07-admin-konzola-plan.md`. Weight shipping bands (9,90 / 49 / 89 / 149) accepted until the founder says otherwise. 800 EUR minimum is a guideline only. (2026-11-03) No discounts at launch: prices exactly as the Gölz catalogue (ferrotech.sk sells the same Gölz saws at list -5 %; matching is the founder's call, depends on our real purchase price).
- **Repo status:** `main` tracks origin (github.com/cryptoleonardo1/royalshop, PUBLIC, `bugiiiii11` is collaborator). Push to `main` = Vercel production deploy. Benji (Mind Palace vault) also commits here (e.g. d9c4c72) -- fetch before work.
- **Vercel:** project `royalshop`, team "Bugiiiii's projects" (Hobby; Pro needed before go-live for the DPA). Repo MUST stay public (private = every deploy fails "Git author must have access"). Check with `gh api repos/cryptoleonardo1/royalshop/commits/<sha>/statuses --jq '.[0]'`. Local Vercel CLI and Supabase CLI are different accounts -- use web UIs.
- **Hosted Supabase:** project `royalshop1`, ref `vzytkquuljtoopgfcfak`, Frankfurt. Keys + DB URL in `.env.hosted.local` (gitignored). Migrations: `set -a; . ./.env.hosted.local; set +a; npx supabase db push --db-url "$SUPABASE_DB_URL"` (the agent may only `--dry-run`; the user runs the real push, SQL and seeds). Push code only after the migration it needs is applied. Remote is up to date through 20261110000001 (invoices, applied 2026-11-10 by the user). Data-only SQL lives in `supabase/snippets/` (blades snippet run by the user 2026-11-07).
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
- **Seed guard:** `seed_reset()` checks `company_settings.is_demo`. Set `is_demo = false` before real orders.

## What Was Done (Session 14) -- Peter tasklist, OZV research, supplier strategy, printed shop documents (2026-11-09/10)

- Vault notes reviewed (Gölz launch e-mail 11-07 still unsent, legal task list 10-26); detailed tasklist for the user + Peter (read docs/08, VOP pages; decide sales mode, B2B returns, lawyer). Suggested additions to the Gölz e-mail: repair time vs our 30 days, pickup from customer, machine dimensions, crossed-bin marking.
- OZV/ISOH research (subagent) -> Current State "EPR"; Gölz likely second wave. Unicon e-mail drafted (only ask the SK registration; batteries known by Peter; prices later).
- ChatGPT dropship plan checked (2 subagents) -> Current State "Strategy check". Questions for ChatGPT given to the user.
- Built, then dropped deposits/balance (user: full payment only). Kept: printable purchase contract `/admin/tlac/<nr>/zmluva` (only reservations or `on_premises`; states the on-premises clause) and handover protocol + training record `/admin/tlac/<nr>/protokol`; optional handover date on the "Zaplatená" step -> `estimated_delivery_date`, used as the admin delivery limit for `on_premises`. No migration needed.
- Verified with Playwright on the local DB: shop sale (contract filled, no withdrawal) and payment link (withdrawal offered, no contract link). 61 unit tests, tsc + eslint clean. Not deployed.
- Gotchas: `npx next typegen` after adding routes (PageProps types); Docker Desktop start then wait ~30 s before `supabase db reset`; checkout radios in Playwright need a JS click.

## What Was Done (Session 15) -- Invoices + credit notes, reservation expiry prepared (2026-11-10)

- Printed contract/protocol reviewed by the user, pushed (ca728dc). Invoices module (dev task 12) built, migration applied by the user, deployed 0d45129; user tested it on prod: works.
- Migration 20261110000001: cancelled invoices locked, issue checks lines/totals, DUZP from paid_at, credit-note VS = invoice VS, `hotovost` method, one live invoice per order.
- Admin: "Faktúry a dobropisy" panel on order detail (PDF link, manual "Vystaviť faktúru", "Vytvoriť PDF" retry), `/admin/faktury` month list with totals. Customer: PDF links on order page/portal via `/objednavka/<nr>/doklad/<id>?t=<token>`.
- Dev task 13: reservation expiry (10 working days, sk-calendar keeps 1. 9. / 17. 11. as holidays = conservative) built and tested, then user decided manual cancel for now -> cron left unscheduled (0bc20d5).
- 74 unit tests, tsc + eslint clean. Gotchas: after `npm run build` the local dev server looped on reload -> delete `.next` and restart dev; Docker Desktop had stopped (restart it); "⚠ ./" dev warnings are the Big Shoulders font, harmless; Playwright on Windows needs PYTHONIOENCODING=utf-8 for Slovak output.

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | Peter meeting (user): sales mode (shop-only payment at start?), Unicon e-mail (SK ISOH registration), Gölz e-mail (vault note 11-07, add repair-time question), bank account IBAN+SWIFT (then fill `company_settings.iban/swift` on hosted -- invoices print it once valid), shop@royalstroje.sk, lawyer for VOP + purchase contract, accountant: invoice/credit-note numbering. |
| 2 | High | User tests session 15 on prod (0bc20d5): reservation detail shows the VOP lapse date + manual cancel; invoices already confirmed working. |
| 3 | High | Dev task 14: cart reminder when a machine is in the cart without a blade (reuse `AccessoryPicker` / `src/lib/accessories.ts`). Then task 15: switch brands per supplier answers (`SHOP_BRANDS`, refresh Oct prices). Optional: serial number input at "Otestované" for the protocol. |
| 4 | High | Resend once shop@ exists: order/reservation e-mails (poučenie on a durable medium before any distance sale), invoice PDF attached, withdrawal confirmation, Supabase Auth SMTP. |
| 5 | High | Supplier answers: Unicon/Honda SK registration -> brands to enable; Gölz: blade prices (6 estimates), TS40GX/HS400F, 60 mm bore, RX1S/MS400, TS250A-330 photo, weights for OZV, DoC + SK manuals, warranty. OZV inquiry (SEWA, NATUR-PACK) only when importing (Gölz). |
| 6 | Medium | Full user test on the deploy: reservation -> "Zaplatená" in shop (+ contract print) vs payment link + card 4242; company checkout; cancel (credit note); withdrawal + refund (credit note); portal invoice download. |
| 7 | High | Pre-launch: reset `document_counters` + demo data (`is_demo = false`), SK manuals, GPSR data per product, accountant (Boldog prevádzkareň, eKasa), Vercel Pro (DPA), domain `shop.royalstroje.sk` + `ADMIN_HOST` last. B2B: verify IČO in ORSR/ŽRSR. Later: enable reservation cron when volume needs it. |

## Key Files

| File | Purpose |
|------|---------|
| `docs/04-technicka-dokumentacia.md` | Source of truth: order states (§4.2 incl. reservations), data model, portal screens |
| `docs/08-rizika-vratenia-reklamacie.md` / `docs/09-skript-rezervacia-telefonat.md` | Return/claim risks ranked + reservation rules; phone script for the shop |
| `docs/06-pravne-stranky.md` | Legal decisions, founder/lawyer questions (details in `docs/pravne/`) |
| `src/lib/order-state.ts` / `src/lib/withdrawal.ts` | Transitions (incl. `reserved`), `ContractPlace`; withdrawal windows incl. `on_premises` |
| `src/lib/checkout-actions.ts` / `src/lib/orders.ts` | Reservation vs payment at checkout, `payOrder`; `markOrderPaid`, `markPaymentAbandoned` |
| `src/lib/admin/order-actions.ts` / `refunds.ts` | Admin steps incl. manual/on-premises payment + handover date; refunds (Stripe or recorded manual) |
| `src/app/admin/tlac/` / `src/lib/admin/print-data.ts` | Printed purchase contract + handover protocol (not reviewed by a lawyer) |
| `src/components/shop/accessory-picker.tsx` / `src/lib/accessories.ts` | Blade picker on machine pages; accessory categories (task 14) |
| `src/lib/invoices/` | Invoice/credit-note build (pure, tested), PDF render, issue + storage |
| `supabase/seed-data/catalog.json` | Catalog source of truth (keep in sync with hosted edits) |

## Session Summary

| Session | Date | Title |
|---------|------|-------|
| 6 | 2026-10-22 | Engines to cart, hovers, sticky header, real contacts, weight shipping |
| 7 | 2026-10-23 | Delivery 3-5 days, home polish, sale, contact page, new motto |
| 8 | 2026-10-23 | Legal research, legal pages, immediate payment |
| 9 | 2026-10-23 | Admin console phase 1a: orders, withdrawal-window tracking |
| 10 | 2026-11-03 | Gölz + Honda only, trademark guideline, customer portal |
| 11 | 2026-11-03 | Withdrawal (§ 20a): online form, portal panel, admin module |
| 12 | 2026-11-07 | No discounts, ferrotech comparison, return risks, consumer reservations |
| 13 | 2026-11-07 | Gölz only, new photos, diamond blades + picker, launch questions |
| 14 | 2026-11-10 | Peter tasklist, OZV research, supplier strategy, printed shop documents |
| 15 | 2026-11-10 | Invoices + credit notes (PDF), reservation expiry prepared (manual cancel) |
