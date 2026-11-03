# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app, admin at `/admin`, customer portal at `/ucet` (since session 10). Only Gölz + Honda are shown (25 listed machines + Honda GX engine variants); other brands stay in the DB, hidden by `SHOP_BRANDS` in `src/lib/shop-brands.ts` (add a slug back to show it). Real operator data, weight-based shipping, delivery "zvyčajne 3-5, najneskôr 10 pracovných dní", all 6 legal pages, § 20a withdrawal form + admin Odstúpenia module (since session 11). Stripe charges immediately (test mode). No emails, no invoices yet.
- **Session count:** 11
- **Decisions:** (2026-10-23, replaces the 10-22 "admin in RCC" decision) the admin console lives in THIS repo at `/admin`, fully separate from RCC. crm_core is not reused as an instance (rental schema, Vite SPA without server, roles in app_metadata, table collisions); only its invoice PDF/PAY by square, layout and reports get ported. Domains: shop `shop.royalstroje.sk`, admin `admin.shop.royalstroje.sk` (`ADMIN_HOST` env, proxy redirects its root to /admin), RCC stays `app.royalstroje.sk`. Plan: `docs/07-admin-konzola-plan.md`. (2026-10-22) Weight shipping bands (9,90 / 49 / 89 / 149) are accepted as-is until the founder says otherwise. 800 EUR minimum is only a guideline, not a rule (CLAUDE.md line is fine).
- **Repo status:** `main` tracks origin (github.com/cryptoleonardo1/royalshop, PUBLIC, `bugiiiii11` is collaborator). Push to `main` = Vercel production deploy.
- **Vercel:** project `royalshop`, team "Bugiiiii's projects" (Hobby; Pro needed before go-live for the DPA). Env vars set: 3 Supabase + `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. Repo MUST stay public: on 2026-10-22 it was private again and every deploy failed with "Git author bugiiiii11 must have access to the project on Vercel"; fixed by owner making it public + an empty commit (a blocked commit stays blocked on redeploy). Check with `gh api repos/cryptoleonardo1/royalshop/commits/<sha>/statuses --jq '.[0]'`. Local Vercel CLI and Supabase CLI are different accounts -- use web UIs.
- **Hosted Supabase:** project `royalshop1`, ref `vzytkquuljtoopgfcfak`, Frankfurt. Keys + DB URL in `.env.hosted.local` (gitignored). Migrations: `npx supabase db push --db-url "$SUPABASE_DB_URL"` (session pooler; `supabase link` fails). Seed: `set -a; . ./.env.hosted.local; set +a; npx tsx scripts/seed.ts` (shell env beats `.env.local`). The user runs `db push` / seed / SQL themselves -- the auto-mode classifier blocks them for the agent (dry-run and anon reads are allowed). Push code only after the migration it needs is applied. SQL-editor migrations are not recorded in the remote history: afterwards run `npx supabase migration repair --status applied <version> --db-url "$SUPABASE_DB_URL"` (done for 20261023000001 on 2026-10-23; remote is up to date).
- **Stripe:** test mode, webhook `https://royalshop.vercel.app/api/webhooks/stripe` (completed + expired + charge.refunded). Immediate charge since 2026-10-23 (no manual capture).
- **Local DB:** Supabase via Docker on ports 564xx (API :56421, Studio :56423). Visual checks run `PORT=3123 npm run dev` with the hosted env instead (no Docker needed) + Playwright from Python. `npm run build` also needs the hosted env (`.env.local` points at the local DB).
- **Delivery time (2026-10-23):** shown as "zvyčajne 3-5" (supplier lead 1-3 + handling 1 + transport 1) and **binding "najneskôr do 10 pracovných dní od zaplatenia"** (`DELIVERY_MAX_WORKDAYS` in `src/lib/legal.ts`). SOI fined a shop for missing its stated upper bound (P/0047/2025), so keep it real; slower machines need their own lead time on the product.
- **Legal (2026-10-23):** research + decisions in `docs/06-pravne-stranky.md` (newer than docs/03; appendices `docs/pravne/A-E`). Page texts live in code (`src/app/(shop)/<slug>/page.tsx`, frame `legal-page.tsx`, constants `src/lib/legal.ts`); bump `LEGAL_VERSION` on any wording change (stored on every order). Not reviewed by a lawyer yet.
- **Gölz partnership (2026-11-02):** Klaus Schlör (Gölz) approved the e-shop process (order -> we verify -> customer pays -> we order from Gölz -> test + training in Senec / own-van delivery around Senec). Founder signed the Gölz trademark guideline (2023, EU TM 009594599); Klaus confirmed product names in page titles/meta descriptions are fine. Hard rules: never bid on "Gölz" in Google Ads, no brand in domain/e-mail/tag line, no "Gölz-xyz" hyphen compounds, official logo only (from info@goelz.de, unchanged), photos unchanged and never used for competitor comparison. Footer carries the trademark/operator note (point 2). Official photos for the 12 machines (or the whole catalogue) requested on 2026-11-03.
- **Portal security:** customer "own read" RLS policies on orders/order_items/order_status_history were dropped (migration 20261102000001, applied + repaired) because they exposed `admin_note`, purchase prices and internal notes. Portal reads go through `src/lib/account/data.ts` (service role + explicit `profile_id` filter, safe columns). Do NOT re-add customer read policies on those tables; treat `returns`/`claims` "own read" the same way before the portal shows them.
- **Withdrawal (2026-11-03):** form gate = order number + order e-mail (name recorded, NOT checked: a typo must not block a legal right; docs/04 says all three, deliberately relaxed). Insert only via SQL `create_return()` (locks the order, rejects overlapping items, numbers OD26-NNNN in one transaction); migration 20261103000001 applied on hosted 2026-11-03 by the user via `db push` (history recorded, no repair needed). `returns` "own read" policy dropped like orders. `returns.items` null = whole order. Customer-facing deadline = `withdrawalEligibility()` (no grace); admin grace stays in `withdrawalInfo()`. `canCompleteOrder` now blocks only while a withdrawal is unsettled. Value reduction is never deducted from the refund (§ 22 ods. 8): UI says so. `LEGAL_VERSION` bumped to 2026-11-03.
- **Seed guard:** `seed_reset()` checks `company_settings.is_demo` (company name is real). Set `is_demo = false` before real orders.

## What Was Done (Session 10) -- Gölz + Honda only, trademark guideline, customer portal (2026-11-02/03)

- Gölz e-mails drafted and sent (process explanation, signed guideline + meta-tag question, photo request for FS125, FS170, MS400, TS250, TS250A, TS250A-330, BS650, BS900/1000, HS350, HS400F, SM250, SM280). Rules saved to agent memory (`golz-trademark-rules`).
- Shop shows only Gölz + Honda: filter in catalog reads, search, category counts and `fetchPricedProducts` (checkout refuses hidden brands from old carts); empty categories return not-found. Descriptions of `cerpadla` + `rezacia-technika` changed in `catalog.json` and on hosted (user ran SQL).
- Customer portal step 1: `/ucet` (orders), `/ucet/objednavky/[cislo]` (dated timeline, shipment tracking, WhatsApp wa.me link on the shop phone with the order number), `/ucet/profil` (person/company, billing address, password, GDPR delete), `/ucet/prihlasenie`, `/ucet/registracia`. Order body shared with the guest page (`order-detail.tsx` + `src/lib/order-detail.ts`).
- Linking: `profile_id` set at checkout when signed in (profile prefilled) or via "Uložiť do môjho účtu" on the guest order page (secret token). Never by e-mail alone: registration uses `auth.admin.createUser({ email_confirm: true })` because Supabase's default SMTP only mails team members, so e-mails are NOT verified. Switch to `signUp` with confirmation once Resend works; only then e-mail auto-linking.
- `proxy.ts` refreshes the session on `/ucet`, `/objednavka`, `/pokladna` (Server Components cannot persist a rotated refresh token).
- Verified with Playwright against hosted: register/login/logout, profile, wrong password, checkout prefill + linked order (test account `claude-zakaznik-1793624915@royalshop.test` / `TestHeslo123`, unpaid OBJ26-00013), foreign order 404, mobile no horizontal scroll.
- Gotchas: `pkill` does not stop `next start` on Windows (kill the port owner via PowerShell `Get-NetTCPConnection -LocalPort 3123`). React 19 resets forms after an action, so actions return the submitted `values` (see `updateProfile`). New routes need `npx next typegen` before `tsc`.

## What Was Done (Session 11) -- Withdrawal (§ 20a): online form, portal panel, admin module (2026-11-03)

- Public two-step form in section 7 of `/odstupenie-od-zmluvy` (works without login; prefilled from `?objednavka=&t=<order token>` or the signed-in profile), confirmation page `/odstupenie-od-zmluvy/potvrdenie/<OD>?t=<return token>` with the exact notice text, date/time and print/PDF. Before-delivery withdrawal allowed; partial withdrawal by item.
- Order pages (guest + portal) show a withdrawal panel: countdown or "Lehota uplynula dňa", filed withdrawals with status and confirmation link.
- Admin `/admin/odstupenia` list + detail (notice, IP/UA, steps, reject with reason, Stripe refund, note), dashboard KPI, manual entry for e-mail/letter withdrawals on the order page (dated by sending time, redirects to the new withdrawal). Whole-order refund before goods arrive also cancels the order.
- Order cancel now uses the shared `src/lib/admin/refunds.ts` (same Stripe idempotency keys) -- re-test cancel + refund on the deploy.
- Verified on the LOCAL DB (Docker, demo payments): 59 unit tests, tsc, lint, `next build`, Playwright customer 19/20 (the miss was the test matching CSS-uppercased text) and admin 12/12. Nothing tested on hosted yet.
- Gotchas: reseeding regenerates order access tokens (tests must read them from the DB); local `.env.local` has a real Stripe test key but seeded payments use fake `pi_demo_*`, so run the local dev server with `STRIPE_SECRET_KEY=` for admin refund tests; first `supabase db reset` after Docker start can fail on a container race, just rerun; `SUPABASE_DB_URL` must be loaded (`set -a; . ./.env.hosted.local; set +a`) or `db push` hits localhost.

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | Push session 11 (commit is local; migration already on hosted), then user tests on the deploy: withdrawal via footer form on a delivered test order + refund in Admin -> Odstúpenia (card 4242); order cancel + refund (refactored onto `refunds.ts`); admin walk to "Doručené"; portal (register, order, timeline, tracking number). |
| 2 | High | Withdrawal gaps: (a) § 20a ods. 5 needs the confirmation on a durable medium -- today only the on-screen page + print; send it by e-mail once Resend works (row 7) and store `confirmation_sent_at`. (b) Whole-order withdrawal after `received_at_branch`/`tested`/dispatch: refund works but order-state forbids cancel, order stays in that status -- decide a transition. (c) No credit note on withdrawal refunds yet (comes with invoices, row 4). (d) docs/04 §4.3 still says the name is verified -- update or get lawyer view. |
| 3 | High | Gölz photos: when Klaus sends them, replace `public/demo-products/golz-*.webp` unchanged (webp conversion only, no crop/background removal), update `catalog.json` + hosted rows. |
| 4 | High | Admin phase 1b (docs/07 §2): invoices on "Potvrdená" via `issue_invoice()`, PDF ported from crm_core `generateInvoicePdf.js`, `documents` bucket + signed URL, credit note on cancel. Fix first (docs/07 §3): credit-note VS collision, `tax_point_date` = payment date, lock cancelled invoices. Credit note also on withdrawal refunds (`src/lib/admin/return-actions.ts` refundReturn). Then invoice download in the portal (step 3), settings page, customers list. |
| 5 | High | Founder review of legal pages (5-day order validity, oil/fuel in protocol, B2B diagnosis fee, battery take-back, withdrawal of used machines), then lawyer. Decide whether the shop adopts the Gölz-style flow (verify before payment, Gölz lead time per product) -- today it charges at checkout. |
| 6 | High | Company IBAN (+ SWIFT) from the founder -> `company_settings` + `scripts/seed.ts`. |
| 7 | Blocked | Resend once shop@royalstroje.sk exists: order e-mails (poučenie on a durable medium, required before real sales), withdrawal confirmation (`returns.notice_text` is the ready body) + claim confirmations, Supabase Auth custom SMTP -> e-mail confirmation + password reset. |
| 8 | High | Pre-launch compliance (docs/06 §4): EPR + OZV, SK manuals, živnostenský úrad, Vercel Pro (DPA), GPSR; domains `shop.` + `admin.shop.royalstroje.sk`, `ADMIN_HOST`. Later portal: claims (step 4), documents per bought machine (manual, test protocol, training record), warranty overview. |

## Key Files

| File | Purpose |
|------|---------|
| `docs/04-technicka-dokumentacia.md` | Source of truth: order states, data model, portal screens (§4.3 withdrawal, §6.2 portal) |
| `docs/06-pravne-stranky.md` | Legal decisions, § 20a function, founder/lawyer questions (details in `docs/pravne/`) |
| `docs/07-admin-konzola-plan.md` | Admin console plan: phases, DB fixes needed |
| `src/components/shop/order-detail.tsx` | Order body shared by guest page and portal (incl. withdrawal panel) |
| `src/lib/withdrawal.ts` / `src/lib/sk-calendar.ts` | Withdrawal window + deadline, customer eligibility, SK working days |
| `src/lib/returns.ts` / `returns-server.ts` / `withdrawal-actions.ts` | Withdrawal statuses, notice text, refund suggestion; DB reads + `create_return` RPC; public form action |
| `src/lib/admin/return-actions.ts` / `refunds.ts` | Admin withdrawal steps, refund, manual entry; shared Stripe refund helper |
| `src/lib/admin/order-actions.ts` | Admin writes: next step, cancel + Stripe refund, note |
| `src/lib/order-state.ts` / `src/lib/orders.ts` | Order transitions; `markOrderPaid`, `fetchPricedProducts` |
| `supabase/seed-data/catalog.json` | Catalog source of truth (keep in sync with hosted edits) |

## Session Summary

| Session | Date | Title |
|---------|------|-------|
| 2 | 2026-10-10 | Design C storefront, cart and checkout |
| 3 | 2026-10-12 | Hosted infra, Stripe live test, premium machine assortment |
| 4 | 2026-10-21 | Free services, Unicon assortment, supplier price workbook |
| 5 | 2026-10-22 | Gölz back, workbook list prices, price on request, Honda engine list |
| 6 | 2026-10-22 | Engines to cart, hovers, sticky header, real contacts, weight shipping |
| 7 | 2026-10-23 | Delivery 3-5 days, home polish, sale, contact page, new motto |
| 8 | 2026-10-23 | Legal research, legal pages, immediate payment |
| 9 | 2026-10-23 | Admin console phase 1a: orders, withdrawal-window tracking |
| 10 | 2026-11-03 | Gölz + Honda only, trademark guideline, customer portal |
| 11 | 2026-11-03 | Withdrawal (§ 20a): online form, portal panel, admin module |
