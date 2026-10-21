# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app with the founder's Unicon list (40 machines, fictive prices, 7 brands); hosted Supabase + Stripe test mode verified end to end. Next: founder walks through the final product list (planned 2026-10-23), real prices, shipping model, emails.
- **Session count:** 4
- **Admin decision (2026-10-21):** e-shop admin will most likely live in RCC, the Royal Stroje CRM (already has invoicing + DB), not in this repo's planned `/admin`. Confirm before building any admin here.
- **Repo status:** `main` tracks origin (github.com/cryptoleonardo1/royalshop, now PUBLIC, `bugiiiii11` is collaborator). Push to `main` = Vercel production deploy.
- **Vercel:** project `royalshop`, team "Bugiiiii's projects" (Hobby). Env vars set: 3 Supabase + `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (`NEXT_PUBLIC_SITE_URL` not needed, falls back to Vercel URL). Repo MUST stay public: Hobby blocks deploys of private-repo commits whose author (`bugiiiii11`) is not the Vercel-linked GitHub account; redeploying a blocked commit stays blocked. Local Vercel CLI is a different account (`lovejoy1-5060`) and Supabase CLI too -- use web UIs.
- **Hosted Supabase:** project `royalshop1`, ref `vzytkquuljtoopgfcfak`, Frankfurt. Keys + DB URL in `.env.hosted.local` (gitignored). `supabase link` fails (CLI account lacks access) -> use `npx supabase db push --db-url "$SUPABASE_DB_URL"` (session pooler `aws-1-eu-central-1.pooler.supabase.com:5432`, user `postgres.<ref>`; direct `db.<ref>` host is IPv6-only). Seed: `set -a; . ./.env.hosted.local; set +a; npx tsx scripts/seed.ts` (shell env beats `.env.local`). Last seeded 2026-10-14.
- **Stripe:** test mode, webhook endpoint `https://royalshop.vercel.app/api/webhooks/stripe` (completed + expired). `sk_test` also in `.env.local`, so local checkout uses real Stripe (local webhook not reachable; return URL confirms).
- **Local DB:** Supabase via Docker on ports 564xx (API :56421, Studio :56423). Docker Desktop must be running. Keys in `.env.local`.

## What Was Done (Session 3) -- Hosted infra, Stripe live test, machine assortment (2026-10-10 / 2026-10-12)

- Hosted Supabase + Vercel + Stripe test mode live (details in Current State). Live 4242 payment verified: order `paid_authorized`, PI `requires_capture`, webhook stored.
- Founder pivot (2026-10-12): no cordless tools, no Makita; premium machines >= 800 EUR from brands with direct contact (photo of founder's list): NTC (via Unicon Ostrava), Bomag, Honda, Atlas Copco, Grindex, Gölz, Cedima, Enar, Master. Design C approved ("dobre sa na tom da stavat").
- Catalog rebuilt from 4 research agents: real models, specs from maker sites, price = market -5 % ending in 9, purchase = net x (1 - supplier margin). `docs/05-sortiment-stroje.md` is the founder price/verification sheet; raw research with price URLs in `docs/research-sortiment/`. Suppliers now live in `catalog.json`; seed throws below 800 EUR.
- Dropped on purpose: Honda ECT/ECMT 7000G 3-phase (built by Generga, GPSR unclear -> NTC TRT covers 3-phase), Grindex Master N (estimate only), Gölz SF150, Enar AVMU/Dingo (< 800 EUR). Grindex is Xylem, not Atlas Copco; Unicon also distributes Grindex.
- Images: official maker photos for 66/78 (WEDA, Grindex, Honda WH20, NTC TR 7 AVR use placeholder). Master originals: rewrite `cache/media/products/<id>/<Name>_<hash>.webp` -> `media/products/<Name>.jpg`. NTC reuses photos across models; mismatched 2nd images removed.
- Home: brand grid (`getBrands()`, class `brandTile` -- `.brand` already exists for the card brand label) replaced the battery-platform section.
- Gotcha: Vercel stopped posting GitHub commit statuses after the repo went public; check the live site / Vercel UI instead of `gh api .../status`.

## What Was Done (Session 4) -- Free services, Unicon assortment, supplier price workbook (2026-10-14 / 2026-10-21)

- Supplier emails drafted in chat only (Gölz EN to info@goelz.de: direct purchase, prices for joint cutters/table saws/grinders/hand-held/accessories; NTC SK: purchase prices + lead time to Senec). Gölz is now off the site anyway.
- Web: "Služby v predajni zadarmo" (home section 04 + PDP box), pre-footer "Nenašli ste stroj?" CTA in `ShopShell` (phone/email from `company_settings`, still demo values +421 900 000 000 / info@royalshop.test).
- Assortment replaced by founder's CSV from Unicon Ostrava: 40 products (Enar Dingo split 3 m / 5 m), fictive prices, all supplier `unicon`. New categories `motory` (Honda GX), `betonarska-technika` (Enar Dingo + Husqvarna BV 20 G, new brand). Gölz, Grindex, Master removed; 800 EUR seed guard removed. Hosted DB reseeded 2026-10-14 (demo orders recreated). Doubts per product in `docs/05-sortiment-stroje.md`.
- CLAUDE.md still says "minimum 800 EUR, 9 brands" -- editing it was blocked by the permission classifier; founder/user should update it.
- Price workbook: `python scripts/cennik.py` builds `docs/cenniky/Cennik-dodavatelov.xlsx` from `docs/cenniky/data/*.csv` + `zdroje.json` (CSV extracted from the 5 supplier PDFs by agents, verified visually). Rate cell (ČNB 24.260 on 2026-10-21), per-brand "Rabat dodávateľa" cell D3 -> purchase price -> margin; re-run keeps yellow input columns and moves changed CZK price to "Predchádzajúca cena" (tested). Recalc/verify with Excel COM via PowerShell (LibreOffice recalc.py fails on Windows: AF_UNIX).
- `docs/cenniky/` is git-ignored: repo is PUBLIC, supplier prices must never be committed.
- All 5 lists (NTC, Bomag, Honda Industry, Honda engines, Enar) are recommended retail excl. VAT, not purchase prices. Royal Stroje buys from makers excl. VAT; real discount per brand still unknown (D3 = 0 %).
- Shipping discussion (not decided): free shipping >= 2000 EUR also covers heavy own transport (200-300 EUR to Košice). Proposal given: courier always free for light machines, flat SR price for heavy via pallet carrier (59/89 EUR placeholders), free pickup in Senec; founder to collect pallet carrier quotes.

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | Founder walk-through of all products for Royal Shop (planned 2026-10-23). Edit `supabase/seed-data/catalog.json` (prices EUR gross), prune `public/demo-products/` of unused images, reseed hosted (`set -a; . ./.env.hosted.local; set +a; npx tsx scripts/seed.ts`), regenerate docs/05. Use the price workbook for list prices; fill per-brand rabat once known. Open questions in docs/05: NT 76/76P and EM 30 missing from official lists, Generga-built "Honda" generators (GPSR), Dingo head/GX shaft variant. |
| 2 | High | Shipping model -- waiting for founder decision + pallet carrier quotes. Then: `src/lib/shipping.ts` (`shippingPrice`, free threshold currently applies to own_transport too), `cart-pricing.ts`, checkout zone step, texts (topbar, USP, PDP delivery). |
| 3 | High | Real contact data in `company_settings` (phone/email shown in topbar + "Nenašli ste stroj?" CTA) and seed. Update CLAUDE.md strategy line (800 EUR / 9 brands is outdated). |
| 4 | High | Emails (Resend + React Email): order received (order-page link incl. token), contract confirmation (VOP PDF, withdrawal info + form), admin new-order notice. Hook into `placeOrder` / `markPaymentAuthorized`. |
| 5 | Med | Admin/back-office: clarify RCC (Royal Stroje CRM) integration -- order capture (Stripe manual capture -> `confirmed` + invoice), product/price editing, `product_costs`. Old plan (`/admin` in this repo, port invoice PDF from `../crm_core`) on hold. Webhook still lacks `payment_intent.canceled` / `charge.refunded`. |
| 6 | Med | Auth + `/ucet` (orders, invoices, withdrawal, claims); Supabase Auth Site URL/redirects to royalshop.vercel.app. Info pages linked from footer are still 404 (VOP, reklamačný poriadok, GDPR, doprava a platba, kontakt, odstúpenie). |
| 7 | Low | Search autocomplete, mobile sticky add-to-cart, s/bez DPH toggle, cron for stale `pending_payment`. WEDA D10N has no photo. |

## Key Files

| File | Purpose |
|------|---------|
| `docs/04-technicka-dokumentacia.md` | Source of truth: architecture, order states, data model, screens |
| `docs/03-legislativa-research.md` | Legal requirements (ch. 10 checklist, ch. 11 lawyer points) |
| `src/lib/catalog.ts` | Cached public catalog reads (tag `catalog`) |
| `src/lib/cart-pricing.ts` | `buildQuote` -- the one pricing path for cart, checkout, order |
| `src/lib/checkout-actions.ts` | `placeOrder`, `payOrder`, `quoteCart` server actions + Stripe session |
| `src/lib/orders.ts` | `transitionOrder`, payment authorize/abandon, fresh pricing |
| `src/lib/shipping.ts` | Shipping price + free threshold (to change with new shipping model) |
| `src/components/shop/shop.module.css` | All storefront styles (design C tokens) |
| `docs/05-sortiment-stroje.md` | Assortment, suppliers, prices to confirm with founder |
| `supabase/migrations/` | Schema, functions, RLS, seed_reset, order access token |
| `scripts/cennik.py` | Supplier price workbook builder (inputs in git-ignored `docs/cenniky/`) |

## Session Summary

| Session | Date | Title |
|---------|------|-------|
| 1 | 2026-10-09 | Research, spec, foundation, design directions |
| 2 | 2026-10-10 | Design C storefront, cart and checkout |
| 3 | 2026-10-12 | Hosted infra, Stripe live test, premium machine assortment |
| 4 | 2026-10-21 | Free services, Unicon assortment, supplier price workbook |
