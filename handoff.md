# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app with 59 listed products + 176 unlisted Honda GX engine variants, 6 brands (NTC, Bomag, Honda, Enar, Gölz, Atlas Copco; Gölz = primary brand tile). Real operator data (Royal stroje s. r. o., Boldog), delivery priced by weight. Hosted Supabase + Stripe test mode, Next 16.4.2. No emails, no admin.
- **Session count:** 6
- **Admin decision (2026-10-21):** e-shop admin will most likely live in RCC, the Royal Stroje CRM (already has invoicing + DB), not in this repo's planned `/admin`. Confirm before building any admin here.
- **Repo status:** `main` tracks origin (github.com/cryptoleonardo1/royalshop, PUBLIC, `bugiiiii11` is collaborator). Push to `main` = Vercel production deploy.
- **Vercel:** project `royalshop`, team "Bugiiiii's projects" (Hobby). Env vars set: 3 Supabase + `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. Repo MUST stay public: on 2026-10-22 it was private again and every deploy failed with "Git author bugiiiii11 must have access to the project on Vercel"; fixed by owner making it public + an empty commit (a blocked commit stays blocked on redeploy). Check with `gh api repos/cryptoleonardo1/royalshop/commits/<sha>/statuses --jq '.[0]'`. Local Vercel CLI and Supabase CLI are different accounts -- use web UIs.
- **Hosted Supabase:** project `royalshop1`, ref `vzytkquuljtoopgfcfak`, Frankfurt. Keys + DB URL in `.env.hosted.local` (gitignored). Migrations: `npx supabase db push --db-url "$SUPABASE_DB_URL"` (session pooler; `supabase link` fails). Seed: `set -a; . ./.env.hosted.local; set +a; npx tsx scripts/seed.ts` (shell env beats `.env.local`). Last migrated 2026-10-22 (through 20261022000004); the user runs `db push` / seed themselves -- the auto-mode classifier blocks them for the agent (dry-run is allowed). Push code only after the migration it needs is applied.
- **Stripe:** test mode, webhook `https://royalshop.vercel.app/api/webhooks/stripe` (completed + expired).
- **Local DB:** Supabase via Docker on ports 564xx (API :56421, Studio :56423). Visual checks run `PORT=3123 npm run dev` with the hosted env instead (no Docker needed) + Playwright from Python. `npm run build` also needs the hosted env (`.env.local` points at the local DB).
- **Seed guard:** `seed_reset()` now checks `company_settings.is_demo` (company name is real). Set `is_demo = false` before real orders.

## What Was Done (Session 5) -- Gölz back, workbook list prices, price on request, Honda engine list (2026-10-22)

- Gölz re-added: 12 machines, founder's net prices x 1.23 exact to the cent (no ...9 rounding), photos/specs from golzgroup.com (server-rendered, curl works). New categories `rozbrusovacky`, `brusky-na-beton`; `stolove-pily` renamed "Stolové a blokové píly". Supplier `golz`, purchase placeholder net x 0.78.
- Assortment = green rows of founder's `Royal Shop Cenniky.xlsx` (read fills with openpyxl; CSV export loses colours). Price = workbook column F exactly: round(CZK/24.26, 2) x 1.23 (net rounded first, else 1-cent drift). Purchase placeholder net x 0.8. Demo sale prices dropped. Dingo kits = sum of DINGO + TAX-TDX 3|5/AX58 list prices.
- Removed NT 76/76P, BP 12/35, EM30, Cedima, Husqvarna. Added NT 64P/72P (restored from git 31645c1 incl. photos), RZ 120, VD 450 damping mat + wheel kit (category `prislusenstvo`), Honda EC 3000G (+AVR, made by GENERGA, Kaunas), Enar AVMU, DINGO, 4 shafts, QZH. Bomag BPR 45/55 and 60/65 = existing D machines renamed DE (electric start is standard).
- Honda GX engines pinned to price-list variants: GX120T3-QX-4E-OH, GX160H2-QX-3-OH, GX200H2-QX-3-OH, GX270T2-QH-B1-OH, GX390T2-QH-B1-OH (no QX type for 270/390 T2).
- `products.price_on_request` (migration 20261022000001): card "Na požiadanie" + "Zistiť cenu", PDP call/e-mail buttons, excluded from price filter/bounds, last in price sort; `fetchPricedProducts` filters it out so it can never reach a quote/order/Stripe. Atlas Copco uses it; to restore a price delete the flag in `catalog.json` and reseed.
- `/kategoria/motory` shows all 181 Honda GX variants (`src/data/honda-engines.json` from `scripts/honda-engines.py`, EUR only) with "V ponuke" links / mailto enquiry and a code legend. Only the shaft letter is Honda-documented; X/H, E-version, OH/SD colours, T/H plant are inferred and worded "zvyčajne". Sources in docs/05.
- Gotcha: `.root a { color: inherit }` beats single-class button styles on `<a>`; use `a.className` selectors for link buttons.

## What Was Done (Session 6) -- Engines to cart, hovers, sticky header, real contacts, weight shipping (2026-10-22)

- Every Honda GX variant in the `/kategoria/motory` table has "Do košíka": non-stocked variants are seeded as products with `is_listed = false` (cart/checkout/PDP work; hidden from listings, counts, search). Slug/name helpers in `src/lib/honda-engines.ts` shared by seed and table. Variant weight = stocked engine of the same family.
- Design: orange "Do košíka" + header cart with lift-on-black-shadow hover (same as PDP button); engine-table buttons stay dark (181 rows); Gölz is the highlighted brand tile (`PRIMARY_BRAND` in home `page.tsx`), hover orange so it never matches a hovered regular brand (dark); logo hover; category nav orange underline.
- Sticky header (`sticky-header.tsx`): always on from 800px (146px, `--header-h` offsets filters/gallery/summary); on phones hides on scroll down, returns on scroll up (204px would be a quarter of the screen). Found the filters sidebar was never sticky (`inset: auto` after `top`).
- Operator: Royal stroje s. r. o., Boldog 182, OR Mestský súd Bratislava III, Sro, 195530/B (from orsr.sk; royalstroje.sk/kontakt lacks it), +421 948 555 551, shop@royalstroje.sk, pickup Recká cesta 182 Boldog. Copy says "Boldog pri Senci"; zones/labels say "od predajne". IBAN still a placeholder.
- Shipping by total order weight, one SR price, no free shipping (threshold made the heaviest orders free): 40 kg parcel 9,90 / 100 kg 49 / 300 kg 89 / over 149 € (placeholders) in `company_settings.shipping_rates`; null weight = heaviest band. Distance zones and own transport dropped from cart/checkout (enum kept for old orders). PDP shows the product's delivery price.
- Next.js 16.4.0 -> 16.4.2 (critical RCE GHSA-2464-fhr4-w9xw). `next dev` can stop on an upgrade notice addressed to agents; just rerun it.

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | Shipping bands are placeholders: once the founder has pallet carrier quotes, update `company_settings.shipping_rates` (SQL update on hosted, plus `DEFAULT_SHIPPING_RATES` in `src/lib/shipping.ts` and the seed). Also confirm the 40 kg parcel limit with the chosen courier. |
| 2 | High | Company IBAN (+ SWIFT) for invoices: still demo in `company_settings` and `scripts/seed.ts`. CLAUDE.md strategy line is stale ("minimum 800 EUR, 9 brands"; now 6 brands, no minimum) -- ask the user before editing. |
| 3 | High | Rabat per brand (NTC/Bomag/Honda/Enar via Unicon, Gölz direct): recompute `purchase_price_net_eur` (now net x 0.8 / x 0.78 placeholders) in `catalog.json`, reseed hosted. Atlas Copco price list: set prices, drop `price_on_request`, reseed. |
| 4 | High | Emails (Resend + React Email): order received, contract confirmation (VOP PDF, withdrawal info + form), admin new-order notice; price-on-request enquiries could become a form instead of mailto. |
| 5 | Med | Open product questions (docs/05 "Na overenie"): Enar shaft version (AVMU vs DINGO end, now chosen via order note), QZ profile missing for QZH, GX variant availability, VD 450 mat serial >= 3000, EC 3000G rated output. |
| 6 | Med | Honda engine price list valid only until 2026-12-31: new list -> update `docs/cenniky/data/honda-motory.csv`, bump `validFrom/validTo` in `scripts/honda-engines.py`, run it, then reseed hosted (variant products carry the price; table and cart must match), push. |
| 7 | Med | Admin/back-office in RCC: order capture (manual capture -> `confirmed` + invoice), product/price editing, `product_costs`. Webhook still lacks `payment_intent.canceled` / `charge.refunded`. |
| 8 | Med | Auth + `/ucet`; info pages linked from footer still 404 (VOP, reklamačný poriadok, GDPR, doprava a platba -- now weight bands, kontakt, odstúpenie). |

## Key Files

| File | Purpose |
|------|---------|
| `docs/04-technicka-dokumentacia.md` | Source of truth: architecture, order states, data model, screens |
| `docs/05-sortiment-stroje.md` | Assortment, price rules, open questions, Honda code sources |
| `supabase/seed-data/catalog.json` | Catalog source of truth (reseed hosted after edits) |
| `src/lib/catalog.ts` | Cached public catalog reads (tag `catalog`) |
| `src/lib/cart-pricing.ts` / `src/lib/orders.ts` | `buildQuote` + `fetchPricedProducts` (price-on-request guard) |
| `src/lib/shipping.ts` | Weight bands, `rateFor`, `shippingPrice`, free threshold (null = off) |
| `src/components/shop/shop.module.css` | All storefront styles (design C tokens) |
| `src/lib/honda-engines.ts` | Engine list, variant slug/name, shaft labels (used by seed + `honda-engine-pricelist.tsx`) |
| `scripts/cennik.py` / `scripts/honda-engines.py` | Supplier workbook / public engine price data (inputs in git-ignored `docs/cenniky/`) |

## Session Summary

| Session | Date | Title |
|---------|------|-------|
| 1 | 2026-10-09 | Research, spec, foundation, design directions |
| 2 | 2026-10-10 | Design C storefront, cart and checkout |
| 3 | 2026-10-12 | Hosted infra, Stripe live test, premium machine assortment |
| 4 | 2026-10-21 | Free services, Unicon assortment, supplier price workbook |
| 5 | 2026-10-22 | Gölz back, workbook list prices, price on request, Honda engine list |
| 6 | 2026-10-22 | Engines to cart, hovers, sticky header, real contacts, weight shipping |
