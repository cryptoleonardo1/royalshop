# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app (admin console at `/admin` since session 9) with 59 listed products + 176 unlisted Honda GX engine variants, 6 brands (NTC, Bomag, Honda, Enar, Gölz, Atlas Copco; Gölz = primary brand tile). Real operator data (Royal stroje s. r. o., Boldog), weight-based shipping, delivery "zvyčajne 3-5, najneskôr 10 pracovných dní", 3 products on sale, `/kontakt` and all 6 legal pages live. Stripe charges immediately (test mode). Hosted Supabase, Next 16.4.2. No emails, no invoices, no § 20a online withdrawal form yet.
- **Session count:** 9
- **Decisions:** (2026-10-23, replaces the 10-22 "admin in RCC" decision) the admin console lives in THIS repo at `/admin`, fully separate from RCC. crm_core is not reused as an instance (rental schema, Vite SPA without server, roles in app_metadata, table collisions); only its invoice PDF/PAY by square, layout and reports get ported. Domains: shop `shop.royalstroje.sk`, admin `admin.shop.royalstroje.sk` (`ADMIN_HOST` env, proxy redirects its root to /admin), RCC stays `app.royalstroje.sk`. Plan: `docs/07-admin-konzola-plan.md`. (2026-10-22) Weight shipping bands (9,90 / 49 / 89 / 149) are accepted as-is until the founder says otherwise. 800 EUR minimum is only a guideline, not a rule (CLAUDE.md line is fine).
- **Repo status:** `main` tracks origin (github.com/cryptoleonardo1/royalshop, PUBLIC, `bugiiiii11` is collaborator). Push to `main` = Vercel production deploy.
- **Vercel:** project `royalshop`, team "Bugiiiii's projects" (Hobby; Pro needed before go-live for the DPA). Env vars set: 3 Supabase + `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. Repo MUST stay public: on 2026-10-22 it was private again and every deploy failed with "Git author bugiiiii11 must have access to the project on Vercel"; fixed by owner making it public + an empty commit (a blocked commit stays blocked on redeploy). Check with `gh api repos/cryptoleonardo1/royalshop/commits/<sha>/statuses --jq '.[0]'`. Local Vercel CLI and Supabase CLI are different accounts -- use web UIs.
- **Hosted Supabase:** project `royalshop1`, ref `vzytkquuljtoopgfcfak`, Frankfurt. Keys + DB URL in `.env.hosted.local` (gitignored). Migrations: `npx supabase db push --db-url "$SUPABASE_DB_URL"` (session pooler; `supabase link` fails). Seed: `set -a; . ./.env.hosted.local; set +a; npx tsx scripts/seed.ts` (shell env beats `.env.local`). The user runs `db push` / seed / SQL themselves -- the auto-mode classifier blocks them for the agent (dry-run and anon reads are allowed). Push code only after the migration it needs is applied. SQL-editor migrations are not recorded in the remote history: afterwards run `npx supabase migration repair --status applied <version> --db-url "$SUPABASE_DB_URL"` (done for 20261023000001 on 2026-10-23; remote is up to date).
- **Stripe:** test mode, webhook `https://royalshop.vercel.app/api/webhooks/stripe` (completed + expired + charge.refunded). Immediate charge since 2026-10-23 (no manual capture).
- **Local DB:** Supabase via Docker on ports 564xx (API :56421, Studio :56423). Visual checks run `PORT=3123 npm run dev` with the hosted env instead (no Docker needed) + Playwright from Python. `npm run build` also needs the hosted env (`.env.local` points at the local DB).
- **Delivery time (2026-10-23):** shown as "zvyčajne 3-5" (supplier lead 1-3 + handling 1 + transport 1) and **binding "najneskôr do 10 pracovných dní od zaplatenia"** (`DELIVERY_MAX_WORKDAYS` in `src/lib/legal.ts`). SOI fined a shop for missing its stated upper bound (P/0047/2025), so keep it real; slower machines need their own lead time on the product.
- **Legal (2026-10-23):** research + decisions in `docs/06-pravne-stranky.md` (newer than docs/03; appendices `docs/pravne/A-E`). Page texts live in code (`src/app/(shop)/<slug>/page.tsx`, frame `legal-page.tsx`, constants `src/lib/legal.ts`); bump `LEGAL_VERSION` on any wording change (stored on every order). Not reviewed by a lawyer yet.
- **Seed guard:** `seed_reset()` checks `company_settings.is_demo` (company name is real). Set `is_demo = false` before real orders.

## What Was Done (Session 8) -- Legal research, legal pages, immediate payment (2026-10-23)

- 5-agent legal research (Slov-Lex consolidated texts, Oct 2026) -> `docs/06-pravne-stranky.md` + `docs/pravne/`. Key findings: consumers may withdraw even with a used/damaged machine (we may only claim diminished value, separately, no set-off § 22 ods. 8 ZOS); misuse is not a defect but WE must prove it for 2 years (§ 620 OZ), so the test protocol (photos, serial, engine hours) + signed training record are the defence; return costs are chargeable only if shown before the order.
- Founder decisions: charge immediately (contract = our "Potvrdenie objednávky" e-mail, refund within 2 working days if unavailable, substitute only with consent); delivery "3-5 usual, 10 max"; pickup hours Po-Pi 8:00-15:00 (yard is 7-16); keep shipping bands. Founder is checking Honda/Bomag/Gölz warranties and SK manuals, and sees withdrawal of damaged machines as a big risk -> revisit.
- Six legal pages (VOP incl. B2B article, reklamačný poriadok A/B, odstúpenie with príloha 2/3 verified verbatim against the PDF, doprava a platba, GDPR, cookies). Footer links; "Odstúpiť od zmluvy tu" -> `/odstupenie-od-zmluvy#formular` (e-mail fallback until the § 20a form exists).
- Stripe manual capture removed; status `paid_authorized` -> `paid` (migration 20261023000001). Return-cost estimate per weight band on PDP and in checkout (`RETURN_COST_ESTIMATES`, placeholders until the carrier price list).
- No cookie banner needed today (shop sets no cookies; cart = localStorage); it is needed before GA4/Meta. Rejected: keeping manual capture (cheaper refunds, but 7-day hold expiry and founder wants to order right away).

## What Was Done (Session 9) -- Admin console phase 1a: orders, withdrawal-window tracking (2026-10-23)

- Login (`/admin/prihlasenie`, Supabase password, `profiles.role = 'admin'` checked by `requireAdmin()` in every page/action; `src/proxy.ts` only refreshes the session and bounces signed-out visitors). Admins: the user + test account `claude@royalshop.test` (creds as `ADMIN_TEST_EMAIL/PASSWORD` in `.env.hosted.local`, used for Playwright checks).
- Prehľad (unconfirmed > 1 working day, open withdrawal windows + EUR at risk, consumers before delivery, binding 10-day delivery limit, month revenue/margin), Objednávky list with search/status filter + withdrawal-window chips, detail with margin, payments, history, next-step forms, cancel + refund, internal note. Live updates via Realtime on `orders` (migration 20261023000002, applied) + 60 s poll fallback.
- Withdrawal logic in `src/lib/withdrawal.ts` + `src/lib/sk-calendar.ts`: 14 days from delivery (Bratislava day), last day shifted past weekends/holidays (§ 122 OZ; holiday list deliberately conservative), 5-day "grace" for notices posted on the last day. Consumers may withdraw before delivery too, so paid + undelivered consumer orders count as risk. "Vybavené" is blocked until grace ends. `withdrawal_deadline` is now set on "Doručené".
- Stripe: cancel refunds captured payments (idempotency key) / expires open sessions; `charge.refunded` webhook mirrors refunds (event added in the Stripe test dashboard). Legacy manual-capture orders (OBJ26-00010/11, payments `authorized`) are captured on "Potvrdená" and released on cancel.
- Gotchas: under Cache Components the Supabase auth client reads the clock -> `await connection()` in `getAdmin()`; `usePathname()` in the panel layout needs a Suspense boundary (fallback `NavList pathname=""`); CSS `composes` avoided in `admin.module.css`.
- NOT verified: write actions (status change, cancel/refund, note) -- agent writes to hosted are blocked; the user tests them on the deploy.

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | User tests admin on https://royalshop.vercel.app/admin with Stripe test card 4242 4242 4242 4242: new paid order appears live with sound; walk it to "Doručené" with a back-dated delivery date and watch the window chips; cancel another (refund visible in Stripe + admin). Fix what breaks (actions: `src/lib/admin/order-actions.ts`). |
| 2 | High | Admin phase 1b (docs/07 §2): invoices -- issue on "Potvrdená" via `issue_invoice()` (service role), server-side PDF ported from crm_core `src/lib/generateInvoicePdf.js` (card paid: no QR, "Uhradené platobnou kartou dňa"), `documents` bucket + signed URL, credit note on cancel (cancel currently REFUSES when an issued invoice exists). Fix first (docs/07 §3): credit-note VS collides with invoice VS, `tax_point_date` = payment date, lock cancelled invoices. Then settings page (company data, IBAN -- replaces hand SQL) and customers list. |
| 3 | High | Founder review of legal pages. Open: order valid 5 working days before confirmation (VOP art. 3), protocol notes oil/fuel (art. 8), B2B diagnosis fee "per price list" (none exists), battery take-back (doprava page), withdrawal of used/damaged machines (docs/06 §1.4). Then lawyer review. |
| 4 | High | Admin phase 2 (docs/07 §2): withdrawals module (refund within 14 days, manual entry) wired to the § 20a public form at `/odstupenie-od-zmluvy#formular`; claims with 30-day countdown; exit/inbound test protocols + pickup training record (needs `test_reports` columns); cron (unconfirmed alert, pending > 24 h cancel, delivered + grace -> completed). |
| 5 | High | Company IBAN (+ SWIFT) from the founder -> `company_settings` (user runs SQL until the settings page exists) + `scripts/seed.ts`. |
| 6 | Blocked | Emails (Resend) once shop@royalstroje.sk exists: "Prijali sme objednávku a platbu" (NOT acceptance), "Potvrdenie objednávky" (= contract, PDFs of VOP/RP/poučenie/form), unavailability, withdrawal + claim confirmations, admin notice. Without the poučenie on a durable medium the withdrawal window can extend by 12 months -- required before real sales. |
| 7 | High | Pre-launch compliance (docs/06 §4): EPR + OZV, SK manuals, živnostenský úrad notice, Vercel Pro (DPA), EU legal-guarantee notice, GPSR fields. Domains: point `shop.` and `admin.shop.royalstroje.sk` at Vercel, set `ADMIN_HOST`. |
| 8 | Med | Rabat per brand + Atlas Copco prices (reseed); Unicon questions (docs/05); Honda price list to 2026-12-31; carrier price list -> shipping bands + `RETURN_COST_ESTIMATES`; replace `/kontakt` photos when sent. |

## Key Files

| File | Purpose |
|------|---------|
| `docs/07-admin-konzola-plan.md` | Admin console plan: phases, DB fixes needed, open questions |
| `docs/04-technicka-dokumentacia.md` | Source of truth: architecture, order states, data model, screens |
| `docs/06-pravne-stranky.md` | Legal decisions, page skeletons, founder/lawyer questions (details in `docs/pravne/`) |
| `src/lib/admin/order-actions.ts` | Admin writes: next step, cancel + Stripe refund/capture, note |
| `src/lib/admin/orders-data.ts` | Admin reads (RLS as admin): list rows, dashboard stats, detail |
| `src/lib/withdrawal.ts` / `src/lib/sk-calendar.ts` | Withdrawal window + deadline, SK working days/holidays |
| `src/lib/order-state.ts` / `src/lib/orders.ts` | Order transitions; `markOrderPaid`, `recordRefund` |
| `src/components/admin/admin.module.css` | All admin styles |
| `supabase/seed-data/catalog.json` | Catalog source of truth (reseed hosted after edits) |
| `src/lib/legal.ts` | LEGAL_VERSION, delivery max, refund days, return-cost estimates |

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
