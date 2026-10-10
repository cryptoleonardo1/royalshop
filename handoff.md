# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- storefront live on https://royalshop.vercel.app (hosted Supabase + Stripe test mode); next: emails, admin, account.
- **Session count:** 3
- **Repo status:** `main` tracks origin (github.com/cryptoleonardo1/royalshop, now PUBLIC, `bugiiiii11` is collaborator). Push to `main` = Vercel production deploy.
- **Vercel:** project `royalshop`, team "Bugiiiii's projects" (Hobby). Env vars set: 3 Supabase + `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (`NEXT_PUBLIC_SITE_URL` not needed, falls back to Vercel URL). Repo MUST stay public: Hobby blocks deploys of private-repo commits whose author (`bugiiiii11`) is not the Vercel-linked GitHub account; redeploying a blocked commit stays blocked. Local Vercel CLI is a different account (`lovejoy1-5060`) and Supabase CLI too -- use web UIs.
- **Hosted Supabase:** project `royalshop1`, ref `vzytkquuljtoopgfcfak`, Frankfurt. Keys + DB URL in `.env.hosted.local` (gitignored). `supabase link` fails (CLI account lacks access) -> use `npx supabase db push --db-url "$SUPABASE_DB_URL"` (session pooler `aws-1-eu-central-1.pooler.supabase.com:5432`, user `postgres.<ref>`; direct `db.<ref>` host is IPv6-only). Seed: `set -a; . ./.env.hosted.local; set +a; npx tsx scripts/seed.ts` (shell env beats `.env.local`). Seeded 2026-10-10.
- **Stripe:** test mode, webhook endpoint `https://royalshop.vercel.app/api/webhooks/stripe` (completed + expired). `sk_test` also in `.env.local`, so local checkout uses real Stripe (local webhook not reachable; return URL confirms).
- **Local DB:** Supabase via Docker on ports 564xx (API :56421, Studio :56423). Docker Desktop must be running. Keys in `.env.local`.

## What Was Done (Session 1) -- Research, spec, foundation, design directions

- Research (docs/01, 03), founder Q&A (docs/02), technical spec (docs/04). Model: customer pays -> we buy from supplier (Makita SK ~48h, NTC CZ 3-5d) -> Senec branch -> tested -> courier / own transport / pickup.
- Next 16.4 scaffold, Supabase migrations, seed (`npx tsx scripts/seed.ts`, password `RoyalDemo2026!`), libs money/order-state/shipping.
- Gotchas: Windows excludes ports 54775-55351 -> 564xx. Postgres rejects `timestamptz + interval` in generated columns (deadlines via trigger). Turbopack Tailwind rule must exclude `*.module.css`.
- Decisions: one Next app (shop + /ucet + /admin); Stripe Checkout hosted, manual capture; invoices at capture; withdrawal persons only; guest checkout; numbers `OBJ26-00001`, `RK26-0001`, `OD26-0001`, credit notes `D2026NNNNN` (confirm with accountant).

## What Was Done (Session 2) -- Design C storefront, cart and checkout (2026-10-10)

- Founder chose design C ("Stavenisko") with safety orange `#ff6a13` instead of lime. `/navrh` drafts deleted; styles live in `src/components/shop/shop.module.css` (one CSS module, tokens on `.root`).
- Catalog reads: `src/lib/catalog.ts` (`"use cache"`, `cacheLife("hours")`, tag `catalog` -> admin edits must call `revalidateTag("catalog")`). Filters are pure (`src/lib/listing.ts`), URL-driven, facet counts exclude own group.
- Omnibus decision: discount % and struck price use `lowest_price_30d()` (law 310/2025 § 7 "počítať od"), fallback compare_at (`src/lib/pricing.ts`).
- Checkout: browser cart in localStorage (`cart-store.ts`) is display-only; `buildQuote` (`cart-pricing.ts`) is the single pricing path for cart page, summary and the written order. `fetchPricedProducts` reads fresh DB prices + purchase price for `order_items` snapshot; `publicFields()` strips it before quotes reach the browser (tested).
- Payments: `placeOrder` -> Stripe Checkout `capture_method: manual`; webhook `/api/webhooks/stripe` (payment_events idempotency, deletes event on handler failure so Stripe retries); return URL also confirms the session (works without webhook forwarding locally). No `STRIPE_SECRET_KEY` => demo mode: "Zaplatiť (testovacia platba)" simulates authorization through the same `markPaymentAuthorized`.
- Guest order page `/objednavka/<number>?t=<access_token>` (new migration adds `orders.access_token`). Status changes only via `transitionOrder` in `src/lib/orders.ts` (optimistic lock on current status + history row).
- Gotchas: React 19 resets `<form action>` inputs after an action, so checkout dispatches the action from `onSubmit` in a transition. Zod v4 needs `z.string({ error })` or missing fields show English "Invalid input". Next 16 `Image` uses `preload`, not `priority`. Slovak weekday after "v" needs accusative (`formatDeliveryDate(d, "acc")` -> "v stredu"). Next keeps previous routes hidden in DOM (3x `h1` in Playwright).
- Verified: 36 Vitest tests, tsc, eslint, `next build`; Playwright e2e for person/courier (desktop) and company/heavy machine/zone (mobile) -> orders OBJ26-00011/00012 in local DB.

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | Verify live Stripe test payment end to end (card 4242): order -> `authorized`, PaymentIntent uncaptured, webhook delivered. |
| 2 | High | Emails (Resend + React Email): order received (with order-page link incl. token), contract confirmation (VOP PDF, withdrawal info + form), admin new-order notice. Hook into `placeOrder` / `markPaymentAuthorized`. Checkout hint already promises a confirmation email. |
| 3 | High | Admin `/admin` orders: list + detail, "Potvrdiť a strhnúť" (Stripe capture -> `confirmed` + `issue_invoice`), "Zrušiť autorizáciu", later transitions, via `transitionOrder`. Port invoice PDF from `../crm_core/src/lib/` (generateInvoicePdf.js, payBySquare.js, pdfFonts.js; replace browser APIs). Also handle `payment_intent.canceled` / `charge.refunded` in webhook. |
| 4 | Med | Auth (also set Supabase Auth Site URL + redirect URLs to royalshop.vercel.app): `proxy.ts` session refresh, login/register person/company, merge localStorage cart into `cart_items`, set `orders.profile_id`; then `/ucet` (orders timeline, invoices, withdrawal 2-step + public `/odstupenie`, claims with photo upload). |
| 5 | Med | Info pages linked from footer (all 404 now): `/obchodne-podmienky`, `/reklamacny-poriadok`, `/ochrana-osobnych-udajov`, `/doprava-a-platba`, `/kontakt`, `/odstupenie`; header "Účet" -> `/ucet` 404. Draft VOP/reklamačný poriadok/GDPR texts from docs/03. |
| 6 | Low | Search autocomplete (route handler + header dropdown), mobile sticky add-to-cart on PDP, price toggle s/bez DPH for companies, cron (expire `pending_payment` after 24h, authorization reminders). Missing photos (35/53) and EANs. |

## Key Files

| File | Purpose |
|------|---------|
| `docs/04-technicka-dokumentacia.md` | Source of truth: architecture, order states, data model, screens |
| `docs/03-legislativa-research.md` | Legal requirements (ch. 10 checklist, ch. 11 lawyer points) |
| `src/lib/catalog.ts` | Cached public catalog reads (tag `catalog`) |
| `src/lib/cart-pricing.ts` | `buildQuote` -- the one pricing path for cart, checkout, order |
| `src/lib/checkout-actions.ts` | `placeOrder`, `payOrder`, `quoteCart` server actions + Stripe session |
| `src/lib/orders.ts` | `transitionOrder`, payment authorize/abandon, fresh pricing |
| `src/app/api/webhooks/stripe/route.ts` | Stripe webhook |
| `src/components/shop/shop.module.css` | All storefront styles (design C tokens) |
| `supabase/migrations/` | Schema, functions, RLS, seed_reset, order access token |
| `../crm_core/src/lib/` | Invoice PDF + Pay by Square source to port |

## Session Summary

| Session | Date | Title |
|---------|------|-------|
| 1 | 2026-10-09 | Research, spec, foundation, design directions |
| 2 | 2026-10-10 | Design C storefront, cart and checkout |
| 3 | 2026-10-10 | Hosted Supabase, Vercel live, Stripe test mode |
