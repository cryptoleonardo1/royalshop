# Royal Shop -- Handoff

<!-- HARD CAP ~120 lines. Max 2 session sections. Overflow -> handoff-archive.md -->

## Current State

- **Phase:** Demo build -- foundation done, waiting for founder to pick a design direction before building the real storefront.
- **Session count:** 1
- **Repo status:** Local-only. Remote `origin` = github.com/cryptoleonardo1/royalshop, but the local gh account (`bugiiiii11`) has NO access -- nothing pushed yet.
- **Local DB:** Supabase via Docker on ports 564xx (API http://127.0.0.1:56421, Studio :56423). Seeded. Keys in `.env.local` (gitignored, standard local keys).

## What Was Done (Session 1) -- Research, spec, foundation, design directions

- Market + legal research (docs/01, 03), founder Q&A (docs/02), technical spec (docs/04) incl. founder decisions of 2026-10-09.
- Business model changed from dropship to: customer pays -> we buy from supplier (Makita SK ~48h, NTC CZ 3-5d) -> goods arrive at Senec branch -> tested + warranty card -> courier / own transport (heavy) / pickup Senec.
- Next 16.4 + TS scaffold; Supabase migrations (schema, functions, RLS, demo-only `seed_reset`); libs `money.ts`, `order-state.ts`, `shipping.ts` + 11 Vitest tests.
- Seed (`npx tsx scripts/seed.ts`): 53 products (41 Makita/12 NTC, only 18 have images), 2 admins, 3 customers, 10 orders in every status, 8 invoices (202600001..), 1 withdrawal, 2 claims. Password `RoyalDemo2026!`.
- Three design directions built by subagents at `/navrh/a|b|c` (A Technicky list / B Dielna po zotmeni / C Stavenisko), verified via Playwright screenshots desktop + mobile.
- Gotchas: Windows excludes ports 54775-55351 (and 543xx used by another project) -> use 564xx. Postgres rejects `timestamptz + interval` in generated columns -> legal deadlines set by trigger. `raise` not allowed inside SQL CASE. Turbopack Tailwind rule in next.config.ts must exclude `*.module.css` or CSS modules silently break (classes undefined).
- Decisions: one Next.js app (shop + /ucet + /admin); Stripe Checkout hosted with manual capture (authorize, admin captures after supplier confirms); invoices issued at capture; withdrawal only for persons (B2B none); own-transport priced by distance zones; guest checkout allowed; order numbers `OBJ26-00001`, claims `RK26-0001`, returns `OD26-0001`, credit notes `D2026NNNNN` (format to confirm with accountant).

## What To Do Next

| # | Priority | Task |
|---|----------|------|
| 1 | High | Get repo access: user adds `bugiiiii11` as collaborator on cryptoleonardo1/royalshop (or `gh auth login` as cryptoleonardo1), then `git push -u origin main`. |
| 2 | High | Founder picks design A/B/C (or mix). Optional: deploy `/navrh` to Vercel for founder -- ask user first (creates a Vercel project). Run locally: `npm run build && npx next start` -> /navrh. |
| 3 | High | Build real storefront on chosen design, reading Supabase: home, category with filters (platform, brand, price, specs), product detail (GPSR box, lowest 30-day price via `lowest_price_30d()`, delivery estimate via `estimateDelivery`), search (`search_vector`). Data helpers in `src/lib/supabase/{server,client,admin}.ts`; mind Cache Components (`cookies()` needs Suspense). Then delete `/navrh`. |
| 4 | High | Auth (`proxy.ts` session refresh, login/register person/company) + cart (localStorage, merge to `cart_items`) + checkout + Stripe test (needs keys from user) + webhook `api/webhooks/stripe`. |
| 5 | Med | Client portal `/ucet` (orders timeline, invoices, withdrawal 2-step form + public `/odstupenie`, claims with photo upload to `claims` bucket). |
| 6 | Med | Admin `/admin` (orders with transitions + capture/cancel, products CRUD with costs/margins, claims/returns with deadlines, invoices). Port invoice PDF from crm_core (`src/lib/generateInvoicePdf.js`, `payBySquare.js`, `pdfFonts.js` -- replace browser APIs: fetch fonts->fs, canvas logo->PNG, blob->arraybuffer). |
| 7 | Med | Hosted Supabase project (EU/Frankfurt) + Vercel project; user must create or grant access. Stripe test keys, Resend key. |
| 8 | Low | Missing product photos (35 of 53); EANs null for 35 products; draft VOP / reklamacny poriadok / GDPR for lawyer (inputs in docs/03). |

## Key Files

| File | Purpose |
|------|---------|
| `handoff.md` | Current state + next steps (capped; history in handoff-archive.md) |
| `docs/04-technicka-dokumentacia.md` | Source of truth: architecture, order states, data model, screens, decisions |
| `docs/03-legislativa-research.md` | Legal requirements + implementation checklist (ch. 10) + lawyer open points (ch. 11) |
| `supabase/migrations/` | Schema, functions (numbering, invoice guard, price history), RLS, seed_reset |
| `scripts/seed.ts` | Demo data loader (service role, reads `.env.local`) |
| `supabase/seed-data/catalog.json` | 53 demo products incl. specs, prices, purchase prices, rental URLs |
| `src/lib/money.ts`, `order-state.ts`, `shipping.ts` | Core business logic (tested in `src/lib/lib.test.ts`) |
| `src/app/navrh/` | Three design directions (temporary) |
| `../crm_core/src/lib/` | Invoice PDF + Pay by Square source to port |

## Session Summary

| Session | Date | Title |
|---------|------|-------|
| 1 | 2026-10-09 | Research, spec, foundation, design directions |
