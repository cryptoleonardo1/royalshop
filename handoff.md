# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app, admin at `/admin`, customer portal at `/ucet` (since session 10). Only Gölz + Honda are shown (25 listed machines + Honda GX engine variants); other brands stay in the DB, hidden by `SHOP_BRANDS` in `src/lib/shop-brands.ts` (add a slug back to show it). Real operator data, weight-based shipping, delivery "zvyčajne 3-5, najneskôr 10 pracovných dní", all 6 legal pages. Stripe charges immediately (test mode). No emails, no invoices, no § 20a online withdrawal form yet.
- **Session count:** 10
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
- **Seed guard:** `seed_reset()` checks `company_settings.is_demo` (company name is real). Set `is_demo = false` before real orders.

## What Was Done (Session 9) -- Admin console phase 1a: orders, withdrawal-window tracking (2026-10-23)

- Login (`/admin/prihlasenie`, Supabase password, `profiles.role = 'admin'` checked by `requireAdmin()` in every page/action; `src/proxy.ts` only refreshes the session and bounces signed-out visitors). Admins: the user + test account `claude@royalshop.test` (creds as `ADMIN_TEST_EMAIL/PASSWORD` in `.env.hosted.local`, used for Playwright checks).
- Prehľad (unconfirmed > 1 working day, open withdrawal windows + EUR at risk, consumers before delivery, binding 10-day delivery limit, month revenue/margin), Objednávky list with search/status filter + withdrawal-window chips, detail with margin, payments, history, next-step forms, cancel + refund, internal note. Live updates via Realtime on `orders` (migration 20261023000002, applied) + 60 s poll fallback.
- Withdrawal logic in `src/lib/withdrawal.ts` + `src/lib/sk-calendar.ts`: 14 days from delivery (Bratislava day), last day shifted past weekends/holidays (§ 122 OZ; holiday list deliberately conservative), 5-day "grace" for notices posted on the last day. Consumers may withdraw before delivery too, so paid + undelivered consumer orders count as risk. "Vybavené" is blocked until grace ends. `withdrawal_deadline` is now set on "Doručené".
- Stripe: cancel refunds captured payments (idempotency key) / expires open sessions; `charge.refunded` webhook mirrors refunds (event added in the Stripe test dashboard). Legacy manual-capture orders (OBJ26-00010/11, payments `authorized`) are captured on "Potvrdená" and released on cancel.
- Gotchas: under Cache Components the Supabase auth client reads the clock -> `await connection()` in `getAdmin()`; `usePathname()` in the panel layout needs a Suspense boundary (fallback `NavList pathname=""`); CSS `composes` avoided in `admin.module.css`.
- NOT verified: write actions (status change, cancel/refund, note) -- agent writes to hosted are blocked; the user tests them on the deploy.

## What Was Done (Session 10) -- Gölz + Honda only, trademark guideline, customer portal (2026-11-02/03)

- Gölz e-mails drafted and sent (process explanation, signed guideline + meta-tag question, photo request for FS125, FS170, MS400, TS250, TS250A, TS250A-330, BS650, BS900/1000, HS350, HS400F, SM250, SM280). Rules saved to agent memory (`golz-trademark-rules`).
- Shop shows only Gölz + Honda: filter in catalog reads, search, category counts and `fetchPricedProducts` (checkout refuses hidden brands from old carts); empty categories return not-found. Descriptions of `cerpadla` + `rezacia-technika` changed in `catalog.json` and on hosted (user ran SQL).
- Customer portal step 1: `/ucet` (orders), `/ucet/objednavky/[cislo]` (dated timeline, shipment tracking, WhatsApp wa.me link on the shop phone with the order number), `/ucet/profil` (person/company, billing address, password, GDPR delete), `/ucet/prihlasenie`, `/ucet/registracia`. Order body shared with the guest page (`order-detail.tsx` + `src/lib/order-detail.ts`).
- Linking: `profile_id` set at checkout when signed in (profile prefilled) or via "Uložiť do môjho účtu" on the guest order page (secret token). Never by e-mail alone: registration uses `auth.admin.createUser({ email_confirm: true })` because Supabase's default SMTP only mails team members, so e-mails are NOT verified. Switch to `signUp` with confirmation once Resend works; only then e-mail auto-linking.
- `proxy.ts` refreshes the session on `/ucet`, `/objednavka`, `/pokladna` (Server Components cannot persist a rotated refresh token).
- Verified with Playwright against hosted: register/login/logout, profile, wrong password, checkout prefill + linked order (test account `claude-zakaznik-1793624915@royalshop.test` / `TestHeslo123`, unpaid OBJ26-00013), foreign order 404, mobile no horizontal scroll.
- Gotchas: `pkill` does not stop `next start` on Windows (kill the port owner via PowerShell `Get-NetTCPConnection -LocalPort 3123`). React 19 resets forms after an action, so actions return the submitted `values` (see `updateProfile`). New routes need `npx next typegen` before `tsc`.

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | Portal step 2 -- withdrawal (§ 20a): one form used from the footer link (`/odstupenie-od-zmluvy#formular`, works WITHOUT login: name + order number + e-mail checked against the order) and from a delivered order in `/ucet/objednavky/[cislo]` (prefilled, 14-day countdown via `src/lib/withdrawal.ts`, consumers only; plug in via `OrderDetailView` children). Two-step submit ("Potvrdiť odstúpenie od zmluvy"), record in `returns` via service role (timestamp, IP, content), on-screen + PDF confirmation until Resend; admin withdrawals module (list, refund within 14 days, manual entry). Needs a migration (check `returns` columns, drop its "own read" policy). Spec: docs/04 §4.3, docs/06, `docs/pravne/B-odstupenie.md`. |
| 2 | High | User tests on the deploy: admin flow with card 4242 (live order, walk to "Doručené", cancel + refund; `src/lib/admin/order-actions.ts`) and the portal (register, order, watch the timeline while the admin moves it, add a tracking number). |
| 3 | High | Gölz photos: when Klaus sends them, replace `public/demo-products/golz-*.webp` unchanged (webp conversion only, no crop/background removal), update `catalog.json` + hosted rows. |
| 4 | High | Admin phase 1b (docs/07 §2): invoices on "Potvrdená" via `issue_invoice()`, PDF ported from crm_core `generateInvoicePdf.js`, `documents` bucket + signed URL, credit note on cancel. Fix first (docs/07 §3): credit-note VS collision, `tax_point_date` = payment date, lock cancelled invoices. Then invoice download in the portal (step 3), settings page, customers list. |
| 5 | High | Founder review of legal pages (5-day order validity, oil/fuel in protocol, B2B diagnosis fee, battery take-back, withdrawal of used machines), then lawyer. Decide whether the shop adopts the Gölz-style flow (verify before payment, Gölz lead time per product) -- today it charges at checkout. |
| 6 | High | Company IBAN (+ SWIFT) from the founder -> `company_settings` + `scripts/seed.ts`. |
| 7 | Blocked | Resend once shop@royalstroje.sk exists: order e-mails (poučenie on a durable medium, required before real sales), withdrawal/claim confirmations, Supabase Auth custom SMTP -> e-mail confirmation + password reset. |
| 8 | High | Pre-launch compliance (docs/06 §4): EPR + OZV, SK manuals, živnostenský úrad, Vercel Pro (DPA), GPSR; domains `shop.` + `admin.shop.royalstroje.sk`, `ADMIN_HOST`. Later portal: claims (step 4), documents per bought machine (manual, test protocol, training record), warranty overview. |

## Key Files

| File | Purpose |
|------|---------|
| `docs/04-technicka-dokumentacia.md` | Source of truth: order states, data model, portal screens (§4.3 withdrawal, §6.2 portal) |
| `docs/06-pravne-stranky.md` | Legal decisions, § 20a function, founder/lawyer questions (details in `docs/pravne/`) |
| `docs/07-admin-konzola-plan.md` | Admin console plan: phases, DB fixes needed |
| `src/lib/shop-brands.ts` | Brands shown in the shop (Gölz, Honda) |
| `src/lib/account/` | Portal auth (`auth.ts`), reads (`data.ts`), actions, validation |
| `src/components/shop/order-detail.tsx` | Order body shared by guest page and portal |
| `src/lib/withdrawal.ts` / `src/lib/sk-calendar.ts` | Withdrawal window + deadline, SK working days |
| `src/lib/admin/order-actions.ts` | Admin writes: next step, cancel + Stripe refund, note |
| `src/lib/order-state.ts` / `src/lib/orders.ts` | Order transitions; `markOrderPaid`, `fetchPricedProducts` |
| `supabase/seed-data/catalog.json` | Catalog source of truth (keep in sync with hosted edits) |

## Session Summary

| Session | Date | Title |
|---------|------|-------|
| 1 | 2026-10-09 | Research, spec, foundation, design directions |
| 2 | 2026-10-10 | Design C storefront, cart and checkout |
| 3 | 2026-10-12 | Hosted infra, Stripe live test, premium machine assortment |
| 4 | 2026-10-21 | Free services, Unicon assortment, supplier price workbook |
| 5 | 2026-10-22 | Gölz back, workbook list prices, price on request, Honda engine list |
| 6 | 2026-10-22 | Engines to cart, hovers, sticky header, real contacts, weight shipping |
| 7 | 2026-10-23 | Delivery 3-5 days, home polish, sale, contact page, new motto |
| 8 | 2026-10-23 | Legal research, legal pages, immediate payment |
| 9 | 2026-10-23 | Admin console phase 1a: orders, withdrawal-window tracking |
| 10 | 2026-11-03 | Gölz + Honda only, trademark guideline, customer portal |
