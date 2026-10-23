# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app with 59 listed products + 176 unlisted Honda GX engine variants, 6 brands (NTC, Bomag, Honda, Enar, Gölz, Atlas Copco; Gölz = primary brand tile). Real operator data (Royal stroje s. r. o., Boldog), weight-based shipping, delivery "zvyčajne 3-5, najneskôr 10 pracovných dní", 3 products on sale, `/kontakt` and all 6 legal pages live. Stripe charges immediately (test mode). Hosted Supabase, Next 16.4.2. No emails, no admin, no § 20a online withdrawal form yet.
- **Session count:** 8
- **Decisions (2026-10-22):** admin lives in RCC (Royal Stroje CRM, has invoicing + DB, may serve as the shop DB too) -- do not build `/admin` here. Weight shipping bands (9,90 / 49 / 89 / 149) are accepted as-is until the founder says otherwise. 800 EUR minimum is only a guideline, not a rule (CLAUDE.md line is fine).
- **Repo status:** `main` tracks origin (github.com/cryptoleonardo1/royalshop, PUBLIC, `bugiiiii11` is collaborator). Push to `main` = Vercel production deploy.
- **Vercel:** project `royalshop`, team "Bugiiiii's projects" (Hobby; Pro needed before go-live for the DPA). Env vars set: 3 Supabase + `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. Repo MUST stay public: on 2026-10-22 it was private again and every deploy failed with "Git author bugiiiii11 must have access to the project on Vercel"; fixed by owner making it public + an empty commit (a blocked commit stays blocked on redeploy). Check with `gh api repos/cryptoleonardo1/royalshop/commits/<sha>/statuses --jq '.[0]'`. Local Vercel CLI and Supabase CLI are different accounts -- use web UIs.
- **Hosted Supabase:** project `royalshop1`, ref `vzytkquuljtoopgfcfak`, Frankfurt. Keys + DB URL in `.env.hosted.local` (gitignored). Migrations: `npx supabase db push --db-url "$SUPABASE_DB_URL"` (session pooler; `supabase link` fails). Seed: `set -a; . ./.env.hosted.local; set +a; npx tsx scripts/seed.ts` (shell env beats `.env.local`). The user runs `db push` / seed / SQL themselves -- the auto-mode classifier blocks them for the agent (dry-run and anon reads are allowed). Push code only after the migration it needs is applied. 20261023000001 was applied via the SQL editor, so it is missing from the remote migration history (idempotent if `db push` reruns it).
- **Stripe:** test mode, webhook `https://royalshop.vercel.app/api/webhooks/stripe` (completed + expired). Immediate charge since 2026-10-23 (no manual capture).
- **Local DB:** Supabase via Docker on ports 564xx (API :56421, Studio :56423). Visual checks run `PORT=3123 npm run dev` with the hosted env instead (no Docker needed) + Playwright from Python. `npm run build` also needs the hosted env (`.env.local` points at the local DB).
- **Delivery time (2026-10-23):** shown as "zvyčajne 3-5" (supplier lead 1-3 + handling 1 + transport 1) and **binding "najneskôr do 10 pracovných dní od zaplatenia"** (`DELIVERY_MAX_WORKDAYS` in `src/lib/legal.ts`). SOI fined a shop for missing its stated upper bound (P/0047/2025), so keep it real; slower machines need their own lead time on the product.
- **Legal (2026-10-23):** research + decisions in `docs/06-pravne-stranky.md` (newer than docs/03; appendices `docs/pravne/A-E`). Page texts live in code (`src/app/(shop)/<slug>/page.tsx`, frame `legal-page.tsx`, constants `src/lib/legal.ts`); bump `LEGAL_VERSION` on any wording change (stored on every order). Not reviewed by a lawyer yet.
- **Seed guard:** `seed_reset()` checks `company_settings.is_demo` (company name is real). Set `is_demo = false` before real orders.

## What Was Done (Session 7) -- Delivery 3-5 days, home polish, sale, contact page, new motto (2026-10-22/23)

- Founder decisions: weight shipping bands stay as they are; 800 EUR minimum is only a guideline; Resend waits for the shop@royalstroje.sk mailbox; IBAN/SWIFT coming from the founder; admin will live in RCC (scope later).
- Hosted data changes: the auto-mode classifier blocks every agent write to hosted (even a supabase-js update), so the user runs SQL in the Supabase SQL editor of `royalshop1` (a different Supabase account than RCC's "Royal Stroje" project, eu-west-3, never run shop SQL there). Read access works with the anon key from `.env.hosted.local`; verify after each SQL. Catalog reads are `cacheLife("hours")`, so redeploy (empty commit) after a data change. Keep `catalog.json` in sync with every hosted edit.
- Home: the last category tile spans the full row only when it would sit alone (`nth-child` rules for 2 and 3 columns), so 8 categories make a clean 3x3. 6 featured (+ Gölz FS170, Enar DINGO 230 V 3 m). Footer bottom padding 28 px.
- Sale: 5 % on Bomag BPR 25/50, Gölz TS250A, Honda ECT 7000G (compare_at = old price, Omnibus 30-day price correct). To end: `update products set price_gross_cents = compare_at_price_cents, compare_at_price_cents = null where slug in (...)` + revert `catalog.json`.
- `/kontakt`: cards, pickup point, rental yard photo, Google Maps pin 48.224467,17.418349 (same as royalstroje.sk), map iframe only after a click (GDPR), gallery. Photos come from the RoyalStroje project (`public/kontakt/`) and will be replaced later; two interior shots show cordless Makita/Ryobi.
- Hero motto A "Prémiové stroje od výrobcov, za férové ceny." + service USPs. Claims rule: "od výrobcov a ich oficiálnych zastúpení", never "priamo" (only Gölz is direct, the rest via Unicon), no "najlepšie/najnižšie ceny"; claims: we are liable, "vybavíme s výrobcom" is how we handle it.

## What Was Done (Session 8) -- Legal research, legal pages, immediate payment (2026-10-23)

- 5-agent legal research (Slov-Lex consolidated texts, Oct 2026) -> `docs/06-pravne-stranky.md` + `docs/pravne/`. Key findings: consumers may withdraw even with a used/damaged machine (we may only claim diminished value, separately, no set-off § 22 ods. 8 ZOS); misuse is not a defect but WE must prove it for 2 years (§ 620 OZ), so the test protocol (photos, serial, engine hours) + signed training record are the defence; return costs are chargeable only if shown before the order.
- Founder decisions: charge immediately (contract = our "Potvrdenie objednávky" e-mail, refund within 2 working days if unavailable, substitute only with consent); delivery "3-5 usual, 10 max"; pickup hours Po-Pi 8:00-15:00 (yard is 7-16); keep shipping bands. Founder is checking Honda/Bomag/Gölz warranties and SK manuals, and sees withdrawal of damaged machines as a big risk -> revisit.
- Six legal pages (VOP incl. B2B article, reklamačný poriadok A/B, odstúpenie with príloha 2/3 verified verbatim against the PDF, doprava a platba, GDPR, cookies). Footer links; "Odstúpiť od zmluvy tu" -> `/odstupenie-od-zmluvy#formular` (e-mail fallback until the § 20a form exists).
- Stripe manual capture removed; status `paid_authorized` -> `paid` (migration 20261023000001). Return-cost estimate per weight band on PDP and in checkout (`RETURN_COST_ESTIMATES`, placeholders until the carrier price list).
- No cookie banner needed today (shop sets no cookies; cart = localStorage); it is needed before GA4/Meta. Rejected: keeping manual capture (cheaper refunds, but 7-day hold expiry and founder wants to order right away).

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | Founder review of legal pages (2026-10-24). Writer doubts to confirm: order valid 5 working days before confirmation (VOP art. 3), protocol states if oil/fuel left in the machine (art. 8), B2B diagnosis fee "per price list" (no list exists), battery take-back without purchase (doprava page). Deeper look at consumer withdrawal of used/damaged machines (docs/06 §1.4). Then lawyer review before go-live. |
| 2 | High | § 20a online withdrawal form at `/odstupenie-od-zmluvy#formular`: required only name + order no. + e-mail, 2nd step "Potvrdiť odstúpenie od zmluvy", store with timestamp, instant confirmation e-mail with content + date/time (needs Resend, #4). Consumers only, no login. |
| 3 | High | Company IBAN (+ SWIFT): founder will send them; then update `company_settings` (user runs SQL on hosted) and `scripts/seed.ts`. |
| 4 | Blocked | Emails (Resend) once shop@royalstroje.sk exists: "Prijali sme objednávku a platbu" (must say it is NOT acceptance), "Potvrdenie objednávky" (= contract, PDFs of VOP/RP/poučenie/form), unavailability offer, withdrawal + claim confirmations, admin notice. |
| 5 | High | Pre-launch compliance (docs/06 §4): EPR registration (EEE/batteries/packaging) + OZV contracts, SK manuals for Gölz/Unicon goods, živnostenský úrad notice of pickup point + e-shop, Vercel Pro (DPA), EU harmonised legal-guarantee notice graphic on PDP/checkout, GPSR manufacturer fields per product. |
| 6 | High | Rabat per brand (Unicon brands, Gölz direct): recompute `purchase_price_net_eur` in `catalog.json`, reseed hosted. Atlas Copco price list: set prices, drop `price_on_request`, reseed. |
| 7 | Med | Open product questions for Unicon (docs/05 "Na overenie"); Honda price list valid until 2026-12-31 (update `docs/cenniky/data/honda-motory.csv`, `scripts/honda-engines.py`, reseed). Carrier price list -> shipping bands + `RETURN_COST_ESTIMATES`. |
| 8 | Later | Admin in RCC: confirm paid order (-> `confirmed` + invoice), cancel + Stripe refund within 2 working days, webhook `charge.refunded`, alert for `paid` orders unconfirmed > 1 working day. Auth + `/ucet` order tracking. Replace `/kontakt` photos when the founder sends them. |

## Key Files

| File | Purpose |
|------|---------|
| `docs/04-technicka-dokumentacia.md` | Source of truth: architecture, order states, data model, screens |
| `docs/06-pravne-stranky.md` | Legal decisions, page skeletons, founder/lawyer questions (details in `docs/pravne/`) |
| `docs/05-sortiment-stroje.md` | Assortment, price rules, open questions, Honda code sources |
| `supabase/seed-data/catalog.json` | Catalog source of truth (reseed hosted after edits) |
| `src/lib/legal.ts` | LEGAL_VERSION, delivery max, refund days, return-cost estimates, SOI/ÚOOÚ |
| `src/components/shop/legal-page.tsx` | Frame for the legal pages (`src/app/(shop)/<slug>/page.tsx`) |
| `src/lib/order-state.ts` / `src/lib/orders.ts` | Order transitions; `markOrderPaid` |
| `src/lib/shipping.ts` | Weight bands, `rateFor`, `shippingPrice` |
| `src/components/shop/shop.module.css` | All storefront styles (design C tokens) |
| `src/lib/honda-engines.ts` | Engine list, variant slug/name (seed + engine table) |

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
