# Handoff Archive (do not read on /start)

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
