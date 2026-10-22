# Handoff Archive (do not read on /start)

## What Was Done (Session 4) -- Free services, Unicon assortment, supplier price workbook (2026-10-14 / 2026-10-21)

- Web: "Služby v predajni zadarmo" (home section 04 + PDP box), pre-footer "Nenašli ste stroj?" CTA in `ShopShell` (phone/email from `company_settings`, still demo values +421 900 000 000 / info@royalshop.test).
- Price workbook: `python scripts/cennik.py` builds `docs/cenniky/Cennik-dodavatelov.xlsx` from `docs/cenniky/data/*.csv` + `zdroje.json` (rate ČNB 24.260, per-brand rabat cell D3). Recalc/verify with Excel COM via PowerShell (LibreOffice recalc fails on Windows).
- `docs/cenniky/` is git-ignored: repo is PUBLIC, supplier CZK/purchase prices must never be committed (only EUR retail prices that the site shows anyway).
- All supplier lists are recommended retail excl. VAT, not purchase prices; real rabat per brand still unknown (D3 = 0 %).
- Shipping discussion (not decided): free shipping >= 2000 EUR also covers heavy own transport (200-300 EUR to Košice). Proposal: courier free for light machines, flat SR price for heavy via pallet carrier (59/89 EUR placeholders), free pickup in Senec; founder to collect pallet carrier quotes.

## What Was Done (Session 3) -- Hosted infra, Stripe live test, machine assortment (2026-10-10 / 2026-10-12)

- Hosted Supabase + Vercel + Stripe test mode live (details in Current State). Live 4242 payment verified: order `paid_authorized`, PI `requires_capture`, webhook stored.
- Founder pivot (2026-10-12): no cordless tools, no Makita; premium machines >= 800 EUR from brands with direct contact (photo of founder's list): NTC (via Unicon Ostrava), Bomag, Honda, Atlas Copco, Grindex, Gölz, Cedima, Enar, Master. Design C approved ("dobre sa na tom da stavat").
- Catalog rebuilt from 4 research agents: real models, specs from maker sites, price = market -5 % ending in 9, purchase = net x (1 - supplier margin). `docs/05-sortiment-stroje.md` is the founder price/verification sheet; raw research with price URLs in `docs/research-sortiment/`. Suppliers now live in `catalog.json`; seed throws below 800 EUR.
- Dropped on purpose: Honda ECT/ECMT 7000G 3-phase (built by Generga, GPSR unclear -> NTC TRT covers 3-phase), Grindex Master N (estimate only), Gölz SF150, Enar AVMU/Dingo (< 800 EUR). Grindex is Xylem, not Atlas Copco; Unicon also distributes Grindex.
- Images: official maker photos for 66/78 (WEDA, Grindex, Honda WH20, NTC TR 7 AVR use placeholder). Master originals: rewrite `cache/media/products/<id>/<Name>_<hash>.webp` -> `media/products/<Name>.jpg`. NTC reuses photos across models; mismatched 2nd images removed.
- Home: brand grid (`getBrands()`, class `brandTile` -- `.brand` already exists for the card brand label) replaced the battery-platform section.
- Gotcha: Vercel stopped posting GitHub commit statuses after the repo went public; check the live site / Vercel UI instead of `gh api .../status`.

## What Was Done (Session 2) -- Design C storefront, cart and checkout (2026-10-10)

- Founder chose design C ("Stavenisko") with safety orange `#ff6a13` instead of lime. `/navrh` drafts deleted; styles live in `src/components/shop/shop.module.css` (one CSS module, tokens on `.root`).
- Catalog reads: `src/lib/catalog.ts` (`"use cache"`, `cacheLife("hours")`, tag `catalog` -> admin edits must call `revalidateTag("catalog")`). Filters are pure (`src/lib/listing.ts`), URL-driven, facet counts exclude own group.
- Omnibus decision: discount % and struck price use `lowest_price_30d()` (law 310/2025 § 7 "počítať od"), fallback compare_at (`src/lib/pricing.ts`).
- Checkout: browser cart in localStorage (`cart-store.ts`) is display-only; `buildQuote` (`cart-pricing.ts`) is the single pricing path for cart page, summary and the written order. `fetchPricedProducts` reads fresh DB prices + purchase price for `order_items` snapshot; `publicFields()` strips it before quotes reach the browser (tested).
- Payments: `placeOrder` -> Stripe Checkout `capture_method: manual`; webhook `/api/webhooks/stripe` (payment_events idempotency, deletes event on handler failure so Stripe retries); return URL also confirms the session (works without webhook forwarding locally). No `STRIPE_SECRET_KEY` => demo mode: "Zaplatiť (testovacia platba)" simulates authorization through the same `markPaymentAuthorized`.
- Guest order page `/objednavka/<number>?t=<access_token>` (new migration adds `orders.access_token`). Status changes only via `transitionOrder` in `src/lib/orders.ts` (optimistic lock on current status + history row).
- Gotchas: React 19 resets `<form action>` inputs after an action, so checkout dispatches the action from `onSubmit` in a transition. Zod v4 needs `z.string({ error })` or missing fields show English "Invalid input". Next 16 `Image` uses `preload`, not `priority`. Slovak weekday after "v" needs accusative (`formatDeliveryDate(d, "acc")` -> "v stredu"). Next keeps previous routes hidden in DOM (3x `h1` in Playwright).
- Verified: 36 Vitest tests, tsc, eslint, `next build`; Playwright e2e for person/courier (desktop) and company/heavy machine/zone (mobile) -> orders OBJ26-00011/00012 in local DB.

## What Was Done (Session 1) -- Research, spec, foundation, design directions

- Research (docs/01, 03), founder Q&A (docs/02), technical spec (docs/04). Model: customer pays -> we buy from supplier (Makita SK ~48h, NTC CZ 3-5d) -> Senec branch -> tested -> courier / own transport / pickup.
- Next 16.4 scaffold, Supabase migrations, seed (`npx tsx scripts/seed.ts`, password `RoyalDemo2026!`), libs money/order-state/shipping.
- Gotchas: Windows excludes ports 54775-55351 -> 564xx. Postgres rejects `timestamptz + interval` in generated columns (deadlines via trigger). Turbopack Tailwind rule must exclude `*.module.css`.
- Decisions: one Next app (shop + /ucet + /admin); Stripe Checkout hosted, manual capture; invoices at capture; withdrawal persons only; guest checkout; numbers `OBJ26-00001`, `RK26-0001`, `OD26-0001`, credit notes `D2026NNNNN` (confirm with accountant).
