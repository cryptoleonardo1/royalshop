# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app with 59 products, 6 brands (NTC, Bomag, Honda, Enar, Gölz, Atlas Copco). NTC/Bomag/Honda/Enar carry real list prices from the founder's workbook, Gölz real prices from golzgroup.com, Atlas Copco "cena na požiadanie". Hosted Supabase + Stripe test mode. Still demo contact data, no emails, no admin.
- **Session count:** 5
- **Admin decision (2026-10-21):** e-shop admin will most likely live in RCC, the Royal Stroje CRM (already has invoicing + DB), not in this repo's planned `/admin`. Confirm before building any admin here.
- **Repo status:** `main` tracks origin (github.com/cryptoleonardo1/royalshop, PUBLIC, `bugiiiii11` is collaborator). Push to `main` = Vercel production deploy.
- **Vercel:** project `royalshop`, team "Bugiiiii's projects" (Hobby). Env vars set: 3 Supabase + `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. Repo MUST stay public: on 2026-10-22 it was private again and every deploy failed with "Git author bugiiiii11 must have access to the project on Vercel"; fixed by owner making it public + an empty commit (a blocked commit stays blocked on redeploy). Check with `gh api repos/cryptoleonardo1/royalshop/commits/<sha>/statuses --jq '.[0]'`. Local Vercel CLI and Supabase CLI are different accounts -- use web UIs.
- **Hosted Supabase:** project `royalshop1`, ref `vzytkquuljtoopgfcfak`, Frankfurt. Keys + DB URL in `.env.hosted.local` (gitignored). Migrations: `npx supabase db push --db-url "$SUPABASE_DB_URL"` (session pooler; `supabase link` fails). Seed: `set -a; . ./.env.hosted.local; set +a; npx tsx scripts/seed.ts` (shell env beats `.env.local`). Last migrated + seeded 2026-10-22.
- **Stripe:** test mode, webhook `https://royalshop.vercel.app/api/webhooks/stripe` (completed + expired).
- **Local DB:** Supabase via Docker on ports 564xx (API :56421, Studio :56423). Visual checks this session ran `PORT=3123 npm run dev` with the hosted env instead (no Docker needed) + Playwright from Python.

## What Was Done (Session 4) -- Free services, Unicon assortment, supplier price workbook (2026-10-14 / 2026-10-21)

- Web: "Služby v predajni zadarmo" (home section 04 + PDP box), pre-footer "Nenašli ste stroj?" CTA in `ShopShell` (phone/email from `company_settings`, still demo values +421 900 000 000 / info@royalshop.test).
- Price workbook: `python scripts/cennik.py` builds `docs/cenniky/Cennik-dodavatelov.xlsx` from `docs/cenniky/data/*.csv` + `zdroje.json` (rate ČNB 24.260, per-brand rabat cell D3). Recalc/verify with Excel COM via PowerShell (LibreOffice recalc fails on Windows).
- `docs/cenniky/` is git-ignored: repo is PUBLIC, supplier CZK/purchase prices must never be committed (only EUR retail prices that the site shows anyway).
- All supplier lists are recommended retail excl. VAT, not purchase prices; real rabat per brand still unknown (D3 = 0 %).
- Shipping discussion (not decided): free shipping >= 2000 EUR also covers heavy own transport (200-300 EUR to Košice). Proposal: courier free for light machines, flat SR price for heavy via pallet carrier (59/89 EUR placeholders), free pickup in Senec; founder to collect pallet carrier quotes.

## What Was Done (Session 5) -- Gölz back, workbook list prices, price on request, Honda engine list (2026-10-22)

- Gölz re-added: 12 machines, founder's net prices x 1.23 exact to the cent (no ...9 rounding), photos/specs from golzgroup.com (server-rendered, curl works). New categories `rozbrusovacky`, `brusky-na-beton`; `stolove-pily` renamed "Stolové a blokové píly". Supplier `golz`, purchase placeholder net x 0.78.
- Assortment = green rows of founder's `Royal Shop Cenniky.xlsx` (read fills with openpyxl; CSV export loses colours). Price = workbook column F exactly: round(CZK/24.26, 2) x 1.23 (net rounded first, else 1-cent drift). Purchase placeholder net x 0.8. Demo sale prices dropped. Dingo kits = sum of DINGO + TAX-TDX 3|5/AX58 list prices.
- Removed NT 76/76P, BP 12/35, EM30, Cedima, Husqvarna. Added NT 64P/72P (restored from git 31645c1 incl. photos), RZ 120, VD 450 damping mat + wheel kit (category `prislusenstvo`), Honda EC 3000G (+AVR, made by GENERGA, Kaunas), Enar AVMU, DINGO, 4 shafts, QZH. Bomag BPR 45/55 and 60/65 = existing D machines renamed DE (electric start is standard).
- Honda GX engines pinned to price-list variants: GX120T3-QX-4E-OH, GX160H2-QX-3-OH, GX200H2-QX-3-OH, GX270T2-QH-B1-OH, GX390T2-QH-B1-OH (no QX type for 270/390 T2).
- `products.price_on_request` (migration 20261022000001): card "Na požiadanie" + "Zistiť cenu", PDP call/e-mail buttons, excluded from price filter/bounds, last in price sort; `fetchPricedProducts` filters it out so it can never reach a quote/order/Stripe. Atlas Copco uses it; to restore a price delete the flag in `catalog.json` and reseed.
- `/kategoria/motory` shows all 181 Honda GX variants (`src/data/honda-engines.json` from `scripts/honda-engines.py`, EUR only) with "V ponuke" links / mailto enquiry and a code legend. Only the shaft letter is Honda-documented; X/H, E-version, OH/SD colours, T/H plant are inferred and worded "zvyčajne". Sources in docs/05.
- Gotcha: `.root a { color: inherit }` beats single-class button styles on `<a>`; use `a.className` selectors for link buttons.

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | Real contact data in `company_settings` (seed in `scripts/seed.ts` ~line 70) -- topbar, "Nenašli ste stroj?", PDP price-on-request buttons and Honda engine "Dopytovať" mailto all use it and currently go to info@royalshop.test. Also update CLAUDE.md strategy line (still "minimum 800 EUR, 9 brands"; now 6 brands, no minimum) -- edit was blocked by the permission classifier earlier, ask the user. |
| 2 | High | Rabat per brand (NTC/Bomag/Honda/Enar via Unicon, Gölz direct): once known, recompute `purchase_price_net_eur` (now net x 0.8 / x 0.78 placeholders) in `catalog.json`, reseed hosted. Atlas Copco price list: set prices, drop `price_on_request`, reseed. |
| 3 | High | Shipping model -- waiting for founder decision + pallet carrier quotes. Then `src/lib/shipping.ts`, `cart-pricing.ts`, checkout zone step, texts. |
| 4 | High | Emails (Resend + React Email): order received, contract confirmation (VOP PDF, withdrawal info + form), admin new-order notice; also price-on-request / engine enquiries could become a form instead of mailto. |
| 5 | Med | Open product questions (docs/05 "Na overenie"): Enar shaft version (AVMU vs DINGO end, now chosen via order note), QZ profile missing for QZH, GX variant availability, VD 450 mat serial >= 3000, EC 3000G rated output. |
| 6 | Med | Honda engine price list valid only until 2026-12-31: new list -> update `docs/cenniky/data/honda-motory.csv`, bump `validFrom/validTo` in `scripts/honda-engines.py`, run it, push. |
| 7 | Med | Admin/back-office in RCC: order capture (manual capture -> `confirmed` + invoice), product/price editing, `product_costs`. Webhook still lacks `payment_intent.canceled` / `charge.refunded`. |
| 8 | Med | Auth + `/ucet`; info pages linked from footer still 404 (VOP, reklamačný poriadok, GDPR, doprava a platba, kontakt, odstúpenie). |

## Key Files

| File | Purpose |
|------|---------|
| `docs/04-technicka-dokumentacia.md` | Source of truth: architecture, order states, data model, screens |
| `docs/05-sortiment-stroje.md` | Assortment, price rules, open questions, Honda code sources |
| `supabase/seed-data/catalog.json` | Catalog source of truth (reseed hosted after edits) |
| `src/lib/catalog.ts` | Cached public catalog reads (tag `catalog`) |
| `src/lib/cart-pricing.ts` / `src/lib/orders.ts` | `buildQuote` + `fetchPricedProducts` (price-on-request guard) |
| `src/lib/shipping.ts` | Shipping price + free threshold (to change with new shipping model) |
| `src/components/shop/shop.module.css` | All storefront styles (design C tokens) |
| `src/components/shop/honda-engine-pricelist.tsx` | Honda engine table + `honda-engine-codes.tsx` legend |
| `scripts/cennik.py` / `scripts/honda-engines.py` | Supplier workbook / public engine price data (inputs in git-ignored `docs/cenniky/`) |

## Session Summary

| Session | Date | Title |
|---------|------|-------|
| 1 | 2026-10-09 | Research, spec, foundation, design directions |
| 2 | 2026-10-10 | Design C storefront, cart and checkout |
| 3 | 2026-10-12 | Hosted infra, Stripe live test, premium machine assortment |
| 4 | 2026-10-21 | Free services, Unicon assortment, supplier price workbook |
| 5 | 2026-10-22 | Gölz back, workbook list prices, price on request, Honda engine list |
