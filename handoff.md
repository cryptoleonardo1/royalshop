# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app, admin at `/admin`, customer portal at `/ucet`. Only Gölz + Honda are shown (`SHOP_BRANDS` in `src/lib/shop-brands.ts`). Since session 12: **consumers send a non-binding reservation (no payment), companies pay at checkout**; no discounts, catalogue list prices only. Stripe test mode. No emails, no invoices yet.
- **Session count:** 12
- **Decisions:** (2026-10-23) admin console lives in THIS repo at `/admin`, separate from RCC; only crm_core's invoice PDF/PAY by square, layout and reports get ported. Domains: shop `shop.royalstroje.sk`, admin `admin.shop.royalstroje.sk` (`ADMIN_HOST`). Plan: `docs/07-admin-konzola-plan.md`. Weight shipping bands (9,90 / 49 / 89 / 149) accepted until the founder says otherwise. 800 EUR minimum is a guideline only. (2026-11-03) No discounts at launch: prices exactly as the Gölz catalogue (ferrotech.sk sells the same Gölz saws at list -5 %; matching is the founder's call, depends on our real purchase price).
- **Repo status:** `main` tracks origin (github.com/cryptoleonardo1/royalshop, PUBLIC, `bugiiiii11` is collaborator). Push to `main` = Vercel production deploy. Benji (Mind Palace vault) also commits here (e.g. d9c4c72) -- fetch before work.
- **Vercel:** project `royalshop`, team "Bugiiiii's projects" (Hobby; Pro needed before go-live for the DPA). Repo MUST stay public (private = every deploy fails "Git author must have access"). Check with `gh api repos/cryptoleonardo1/royalshop/commits/<sha>/statuses --jq '.[0]'`. Local Vercel CLI and Supabase CLI are different accounts -- use web UIs.
- **Hosted Supabase:** project `royalshop1`, ref `vzytkquuljtoopgfcfak`, Frankfurt. Keys + DB URL in `.env.hosted.local` (gitignored). Migrations: `set -a; . ./.env.hosted.local; set +a; npx supabase db push --db-url "$SUPABASE_DB_URL"` (the agent may only `--dry-run`; the user runs the real push, SQL and seeds). Push code only after the migration it needs is applied. Remote is up to date through 20261104000001 (applied 2026-11-05/07 by the user).
- **Stripe:** test mode, webhook `https://royalshop.vercel.app/api/webhooks/stripe` (completed + expired + charge.refunded). Immediate charge (no manual capture).
- **Local DB:** Supabase via Docker on ports 564xx (API :56421, Studio :56423). Local dev for Playwright: `NEXT_PUBLIC_SITE_URL=http://localhost:3123 STRIPE_SECRET_KEY= PORT=3123 npm run dev` (`.env.local` sets the site URL to :3000, so checkout redirects break without the override; empty Stripe key = demo payments). `npm run build` needs the hosted env.
- **Delivery time:** "zvyčajne 3-5" and binding "najneskôr do 10 pracovných dní od zaplatenia" (`DELIVERY_MAX_WORKDAYS`). SOI fined a shop for missing its upper bound, keep it real.
- **Legal:** research in `docs/06-pravne-stranky.md` (+ `docs/pravne/A-E`); risks of returns/claims ranked in `docs/08-rizika-vratenia-reklamacie.md` (reviewed by Benji 2026-11-05); phone script `docs/09-skript-rezervacia-telefonat.md`. Page texts in code, `LEGAL_VERSION` = 2026-11-04 (bump on any wording change). Not reviewed by a lawyer.
- **Reservations (2026-11-03, rules settled by Benji 2026-11-05):** person checkout -> status `reserved` (`reserved_at`), no payment. Admin calls; the call must NOT close the sale (phone = distance contract). Then either (a) sale signed and paid in the shop: admin step "Zaplatená" with provider cash/card_terminal/bank_transfer + checkbox -> `contract_place = 'on_premises'`, no statutory withdrawal (Directive 2011/83 recital 20), or (b) step "Čaká na platbu" = payment link on the order page, distance contract, withdrawal applies. No online deposit from consumers, ever. Order from Gölz only after signature + deposit in the shop. Expired Stripe session does not cancel a former reservation. Non-Stripe payments are refunded by hand (system only records). VOP: an unagreed reservation lapses after 10 working days (manual cancel today).
- **Gölz partnership:** process approved by Klaus Schlör. Returns only for valid reasons after consultation; minor defects repaired by local partners "for reimbursement of costs"; Gölz pays shipping in warranty cases. Consumer withdrawal risk therefore sits with us. Trademark rules in agent memory (`golz-trademark-rules`). Photos requested 2026-11-03, not received. Follow-up e-mail (warranty costs, partner, direct pickup from customer, DoC/manuals/GPSR data, weights, written dealer discount 25/35 %, dealer confirmation) drafted in vault `Projects/RoyalShop/RoyalShop - Golz email reklamacie a dokumenty 2026-11-03.md`, reviewed by Benji -- the founder sends it.
- **Portal security:** no customer "own read" RLS on orders/order_items/order_status_history/returns (they expose admin notes, purchase prices). Reads go through server code with safe columns (`src/lib/account/data.ts`, `src/lib/order-detail.ts`, `src/lib/returns-server.ts`). Do NOT re-add them.
- **Withdrawal:** form gate = order number + e-mail (name recorded, not checked). Insert only via SQL `create_return()`. Customer deadline `withdrawalEligibility()`; admin grace in `withdrawalInfo()`; new window/block `on_premises`. Value reduction never deducted from the refund (§ 22 ods. 8).
- **Seed guard:** `seed_reset()` checks `company_settings.is_demo`. Set `is_demo = false` before real orders.

## What Was Done (Session 11) -- Withdrawal (§ 20a): online form, portal panel, admin module (2026-11-03)

- Public two-step form in section 7 of `/odstupenie-od-zmluvy` (works without login), confirmation page `/odstupenie-od-zmluvy/potvrdenie/<OD>?t=<return token>` with the notice text and print/PDF. Before-delivery and partial withdrawal supported.
- Order pages (guest + portal) show a withdrawal panel; admin `/admin/odstupenia` list + detail (reject, Stripe refund, note), dashboard KPI, manual entry for e-mail/letter withdrawals. Order cancel uses the shared `src/lib/admin/refunds.ts`.
- Gotchas: reseeding regenerates order access tokens; seeded payments are fake `pi_demo_*`, run local dev with `STRIPE_SECRET_KEY=`; first `supabase db reset` after Docker start can fail on a container race, rerun.

## What Was Done (Session 12) -- No discounts, ferrotech comparison, return risks, consumer reservations (2026-11-03..07)

- Discounts removed: TS250A, Honda ECT 7000G, Bomag BPR 25/50 back at list price (catalog.json + hosted SQL run by the user); "Akcie" nav link and home sale section render only while a discounted product exists.
- ferrotech.sk research (subagent): generic, partly outdated terms (ODR link, no § 20a function, pre-31.7.2026 OZ), Gölz prices = list -5 %. Our legal pages are ahead; two small ideas parked (row 4).
- `docs/08` risk ranking (R1 consumer withdrawal after the Gölz order = top risk). Benji confirmed the shop-sale route and added `docs/09` phone script + admin hint (commit d9c4c72).
- Reservations built (migration 20261104000001: status `reserved`, `orders.reserved_at`, `orders.contract_place`, `payments_provider_check`). Checkout, order page, admin step forms (payment method + on-premises checkbox), dashboard KPI "Rezervácie na zavolanie", customer link in admin, manual refunds, VOP art. 3/4/9, withdrawal page, delivery/payment page, docs/04 §4.2. 61 unit tests; Playwright on the local DB: shop sale (no withdrawal, form refuses), payment link (withdrawal offered), company checkout, mobile. Deployed d9c4c72 (VOP version 2026-11-04 live).
- Gotchas: do not run prettier on the repo (no config, reformats whole files); Playwright: the terms label contains links (click the input via JS), many headings are CSS-uppercased (compare lowercase), the footer has a global "Odstúpiť od zmluvy tu" link (check `id="withdraw-title"` instead of text).

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | User tests on the deploy: person reservation -> admin "Zaplatená" with on-premises checkbox (no withdrawal panel, form refuses) and -> "Čaká na platbu" + card 4242 (withdrawal panel appears); company checkout; cancel of a cash-paid order (manual refund text); session-11 tests still pending (withdrawal + refund in Admin -> Odstúpenia, order cancel + refund, portal). |
| 2 | High | Shop deposit is not modelled: docs/09 says "podpis + záloha" for machines not in stock, but admin "Zaplatená" records the full amount. Add a partial payment (deposit) step: `payments` row for the deposit, status stays before `paid` or a new `deposit_paid`, remainder at handover. Also a printable purchase contract / handover protocol (signature = proof of on-premises contract). |
| 3 | High | Admin phase 1b (docs/07 §2): invoices on "Potvrdená" via `issue_invoice()`, PDF ported from crm_core, `documents` bucket, credit notes (cancel + withdrawal refund in `src/lib/admin/return-actions.ts`). Fix first (docs/07 §3): credit-note VS collision, `tax_point_date` = payment date, lock cancelled invoices. In-shop cash/card sales need an eKasa receipt (check the rental yard's register). |
| 4 | High | Legal pass after Klaus answers (row 6): claims policy (who collects, partner, 30 days), add "withdrawal also by e-mail" + "pallet cost always known before payment" (from ferrotech), docs/04 §4.3 name check wording, founder review then lawyer. Withdrawal gaps: confirmation on a durable medium (needs Resend), whole-order withdrawal after `received_at_branch` has no state transition. |
| 5 | High | Gölz photos: replace `public/demo-products/golz-*.webp` unchanged (webp only), update `catalog.json` + hosted rows. |
| 6 | High | Founder sends the Gölz follow-up e-mail (vault note above). Decide ferrotech price matching (list -5 %) once the real purchase price is known. Company IBAN (+ SWIFT) -> `company_settings` + `scripts/seed.ts`. |
| 7 | Blocked | Resend once shop@royalstroje.sk exists: order/reservation e-mails (poučenie on a durable medium -- required before any distance sale to consumers), withdrawal confirmation (`returns.notice_text`), Supabase Auth SMTP. Optional: auto-cancel reservations after 10 working days (VOP art. 3). |
| 8 | High | Pre-launch compliance (docs/06 §4, docs/08 R5): EPR + OZV (Gölz has no SK registration), SK manuals, GPSR data per product, živnostenský úrad, Vercel Pro (DPA), domains + `ADMIN_HOST`. B2B orders: verify IČO in ORSR/ŽRSR (docs/08 R1 bod 2). |

## Key Files

| File | Purpose |
|------|---------|
| `docs/04-technicka-dokumentacia.md` | Source of truth: order states (§4.2 incl. reservations), data model, portal screens |
| `docs/08-rizika-vratenia-reklamacie.md` / `docs/09-skript-rezervacia-telefonat.md` | Return/claim risks ranked + reservation rules; phone script for the shop |
| `docs/06-pravne-stranky.md` | Legal decisions, founder/lawyer questions (details in `docs/pravne/`) |
| `docs/07-admin-konzola-plan.md` | Admin console plan: phases, DB fixes needed |
| `src/lib/order-state.ts` / `src/lib/withdrawal.ts` | Transitions (incl. `reserved`), `ContractPlace`; withdrawal windows incl. `on_premises` |
| `src/lib/checkout-actions.ts` / `src/lib/orders.ts` | Reservation vs payment at checkout, `payOrder`; `markOrderPaid`, `markPaymentAbandoned` |
| `src/lib/admin/order-actions.ts` / `refunds.ts` | Admin steps incl. manual/on-premises payment; refunds (Stripe or recorded manual) |
| `src/components/shop/order-detail.tsx` | Customer order body (reservation box, pay box, withdrawal panel) |
| `src/app/(shop)/obchodne-podmienky/page.tsx` | VOP (art. 3 reservation, art. 9 no withdrawal for shop sales) |
| `supabase/seed-data/catalog.json` | Catalog source of truth (keep in sync with hosted edits) |

## Session Summary

| Session | Date | Title |
|---------|------|-------|
| 3 | 2026-10-12 | Hosted infra, Stripe live test, premium machine assortment |
| 4 | 2026-10-21 | Free services, Unicon assortment, supplier price workbook |
| 5 | 2026-10-22 | Gölz back, workbook list prices, price on request, Honda engine list |
| 6 | 2026-10-22 | Engines to cart, hovers, sticky header, real contacts, weight shipping |
| 7 | 2026-10-23 | Delivery 3-5 days, home polish, sale, contact page, new motto |
| 8 | 2026-10-23 | Legal research, legal pages, immediate payment |
| 9 | 2026-10-23 | Admin console phase 1a: orders, withdrawal-window tracking |
| 10 | 2026-11-03 | Gölz + Honda only, trademark guideline, customer portal |
| 11 | 2026-11-03 | Withdrawal (§ 20a): online form, portal panel, admin module |
| 12 | 2026-11-07 | No discounts, ferrotech comparison, return risks, consumer reservations |
