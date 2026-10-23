# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app with 59 listed products + 176 unlisted Honda GX engine variants, 6 brands (NTC, Bomag, Honda, Enar, Gölz, Atlas Copco; Gölz = primary brand tile). Real operator data (Royal stroje s. r. o., Boldog), weight-based shipping, 3-5 day delivery, 3 products on sale, `/kontakt` live. Hosted Supabase + Stripe test mode, Next 16.4.2. No emails, no admin, other footer info pages still 404.
- **Session count:** 7
- **Decisions (2026-10-22):** admin lives in RCC (Royal Stroje CRM, has invoicing + DB, may serve as the shop DB too) -- do not build `/admin` here. Weight shipping bands (9,90 / 49 / 89 / 149) are accepted as-is until the founder says otherwise. 800 EUR minimum is only a guideline, not a rule (CLAUDE.md line is fine).
- **Repo status:** `main` tracks origin (github.com/cryptoleonardo1/royalshop, PUBLIC, `bugiiiii11` is collaborator). Push to `main` = Vercel production deploy.
- **Vercel:** project `royalshop`, team "Bugiiiii's projects" (Hobby). Env vars set: 3 Supabase + `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. Repo MUST stay public: on 2026-10-22 it was private again and every deploy failed with "Git author bugiiiii11 must have access to the project on Vercel"; fixed by owner making it public + an empty commit (a blocked commit stays blocked on redeploy). Check with `gh api repos/cryptoleonardo1/royalshop/commits/<sha>/statuses --jq '.[0]'`. Local Vercel CLI and Supabase CLI are different accounts -- use web UIs.
- **Hosted Supabase:** project `royalshop1`, ref `vzytkquuljtoopgfcfak`, Frankfurt. Keys + DB URL in `.env.hosted.local` (gitignored). Migrations: `npx supabase db push --db-url "$SUPABASE_DB_URL"` (session pooler; `supabase link` fails). Seed: `set -a; . ./.env.hosted.local; set +a; npx tsx scripts/seed.ts` (shell env beats `.env.local`). Last migrated 2026-10-22 (through 20261022000004); the user runs `db push` / seed themselves -- the auto-mode classifier blocks them for the agent (dry-run is allowed). Push code only after the migration it needs is applied.
- **Stripe:** test mode, webhook `https://royalshop.vercel.app/api/webhooks/stripe` (completed + expired).
- **Local DB:** Supabase via Docker on ports 564xx (API :56421, Studio :56423). Visual checks run `PORT=3123 npm run dev` with the hosted env instead (no Docker needed) + Playwright from Python. `npm run build` also needs the hosted env (`.env.local` points at the local DB).
- **Delivery time (2026-10-22):** 3-5 working days for all products = supplier lead 1-3 (hosted + `catalog.json`) + handling 1 + transport 1; longer cases -> we contact the customer (PDP/checkout copy). A new supplier needs lead 1-3 or the promise breaks.
- **Seed guard:** `seed_reset()` now checks `company_settings.is_demo` (company name is real). Set `is_demo = false` before real orders.

## What Was Done (Session 6) -- Engines to cart, hovers, sticky header, real contacts, weight shipping (2026-10-22)

- Every Honda GX variant in the `/kategoria/motory` table has "Do košíka": non-stocked variants are seeded as products with `is_listed = false` (cart/checkout/PDP work; hidden from listings, counts, search). Slug/name helpers in `src/lib/honda-engines.ts` shared by seed and table. Variant weight = stocked engine of the same family.
- Design: orange "Do košíka" + header cart with lift-on-black-shadow hover (same as PDP button); engine-table buttons stay dark (181 rows); Gölz is the highlighted brand tile (`PRIMARY_BRAND` in home `page.tsx`), hover orange so it never matches a hovered regular brand (dark); logo hover; category nav orange underline.
- Sticky header (`sticky-header.tsx`): always on from 800px (146px, `--header-h` offsets filters/gallery/summary); on phones hides on scroll down, returns on scroll up (204px would be a quarter of the screen). Found the filters sidebar was never sticky (`inset: auto` after `top`).
- Operator: Royal stroje s. r. o., Boldog 182, OR Mestský súd Bratislava III, Sro, 195530/B (from orsr.sk; royalstroje.sk/kontakt lacks it), +421 948 555 551, shop@royalstroje.sk, pickup Recká cesta 182 Boldog. Copy says "Boldog pri Senci"; zones/labels say "od predajne". IBAN still a placeholder.
- Shipping by total order weight, one SR price, no free shipping (threshold made the heaviest orders free): 40 kg parcel 9,90 / 100 kg 49 / 300 kg 89 / over 149 € (placeholders) in `company_settings.shipping_rates`; null weight = heaviest band. Distance zones and own transport dropped from cart/checkout (enum kept for old orders). PDP shows the product's delivery price.
- Next.js 16.4.0 -> 16.4.2 (critical RCE GHSA-2464-fhr4-w9xw). `next dev` can stop on an upgrade notice addressed to agents; just rerun it.

## What Was Done (Session 7) -- Delivery 3-5 days, home polish, sale, contact page, new motto (2026-10-22/23)

- Founder decisions: weight shipping bands stay as they are; 800 EUR minimum is only a guideline; Resend waits for the shop@royalstroje.sk mailbox; IBAN/SWIFT coming from the founder; admin will live in RCC (scope later).
- Hosted data changes: the auto-mode classifier blocks every agent write to hosted (even a supabase-js update), so the user runs SQL in the Supabase SQL editor of `royalshop1` (a different Supabase account than RCC's "Royal Stroje" project, eu-west-3, never run shop SQL there). Read access works with the anon key from `.env.hosted.local`; verify after each SQL. Catalog reads are `cacheLife("hours")`, so redeploy (empty commit) after a data change. Keep `catalog.json` in sync with every hosted edit.
- Delivery 3-5 working days everywhere = supplier lead 1-3 + handling 1 + transport 1 (a new supplier needs lead 1-3). Copy says longer = we contact the customer. The delivery-time filter disappears, since every product now has the same lead.
- Home: the last category tile spans the full row only when it would sit alone (`nth-child` rules for 2 and 3 columns), so 8 categories make a clean 3x3. 6 featured (+ Gölz FS170, Enar DINGO 230 V 3 m). Footer bottom padding 28 px.
- Sale: 5 % on Bomag BPR 25/50, Gölz TS250A, Honda ECT 7000G (compare_at = old price, Omnibus 30-day price correct). To end: `update products set price_gross_cents = compare_at_price_cents, compare_at_price_cents = null where slug in (...)` + revert `catalog.json`.
- `/kontakt`: cards, pickup point, rental yard photo, Google Maps pin 48.224467,17.418349 (same as royalstroje.sk), map iframe only after a click (GDPR), gallery. Photos come from the RoyalStroje project (`public/kontakt/`) and will be replaced later; two interior shots show cordless Makita/Ryobi.
- Hero motto A "Prémiové stroje od výrobcov, za férové ceny." + service USPs (from manufacturers, tested, training at pickup, always help). Claims rule: "od výrobcov a ich oficiálnych zastúpení", never "priamo" (only Gölz is direct, the rest via Unicon), no "najlepšie/najnižšie ceny"; claims: we are liable, "vybavíme s výrobcom" is how we handle it.

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | Company IBAN (+ SWIFT): founder will send them; then update `company_settings` (user runs SQL on hosted) and `scripts/seed.ts`. |
| 2 | High | Footer info pages still 404: VOP (obchodné podmienky), reklamačný poriadok, ochrana osobných údajov, doprava a platba (weight bands, 3-5 days, pickup Boldog), odstúpenie form. Legal basis in `docs/03-legislativa-research.md`; build like `src/app/(shop)/kontakt/page.tsx`. |
| 3 | High | Rabat per brand (NTC/Bomag/Honda/Enar via Unicon, Gölz direct): recompute `purchase_price_net_eur` (now net x 0.8 / x 0.78 placeholders) in `catalog.json`, reseed hosted. Atlas Copco price list: set prices, drop `price_on_request`, reseed. Confirm Unicon is the official importer (backs the "od výrobcov a ich oficiálnych zastúpení" claim). |
| 4 | Blocked | Emails (Resend): wait until the shop@royalstroje.sk mailbox exists. Then order received, contract confirmation (VOP PDF, withdrawal info + form), admin new-order notice. |
| 5 | Med | Open product questions for Unicon (docs/05 "Na overenie", explained to founder 2026-10-22): Enar shaft version (AVMU vs DINGO end), QZ profile missing for QZH, GX variant availability, VD 450 mat serial >= 3000, EC 3000G rated output. |
| 6 | Med | Honda engine price list valid only until 2026-12-31: new list -> update `docs/cenniky/data/honda-motory.csv`, bump `validFrom/validTo` in `scripts/honda-engines.py`, run it, reseed hosted (variant products carry the price), push. |
| 7 | Low | Replace `/kontakt` photos when the founder sends new ones (`public/kontakt/*.webp`, max 1600 px webp; sizes are in `GALLERY` in the page). |
| 8 | Later | Admin/back-office in RCC (RCC will manage the whole shop, its DB may be shared): order capture (manual capture -> `confirmed` + invoice), product/price editing, `product_costs`. Webhook still lacks `payment_intent.canceled` / `charge.refunded`. Auth + `/ucet` also open. |

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
| 7 | 2026-10-23 | Delivery 3-5 days, home polish, sale, contact page, new motto |
