@AGENTS.md

# Royal Shop

Slovak e-shop for premium construction machines, minimum 800 € incl. VAT, no cordless tools (strategy since 2026-10-12): NTC, Bomag, Honda, Atlas Copco, Grindex, Gölz, Cedima, Enar, Master. Sister project of royalstroje.sk (rental). Demo phase: real models with indicative prices, Stripe test mode, `noindex`.

Read before larger changes:
- `docs/04-technicka-dokumentacia.md`: architecture, order flow, data model, screens (source of truth)
- `docs/03-legislativa-research.md`: legal requirements (withdrawal § 20a, claims, GPSR, Omnibus)
- `docs/05-sortiment-stroje.md`: assortment, suppliers, prices to confirm (catalog source: `supabase/seed-data/catalog.json`)

## Stack
Next.js 16 App Router (Cache Components on, `proxy.ts` instead of middleware), React 19, TypeScript, Tailwind v4, Supabase (Postgres + Auth + Storage + RLS), Stripe Checkout (manual capture), Resend. Unit tests: Vitest (`npm test`).

## Rules
- Money is integer cents. Use `src/lib/money.ts`; shop prices are gross, net/VAT derived per line.
- Order status changes only through `src/lib/order-state.ts` transitions.
- Writes that touch money, order state, invoices, returns or claims run server-side with the service role, never from the browser.
- Admin role lives in `profiles.role` (never `user_metadata`).
- Purchase prices live in `product_costs` (admin-only), never in `products`.
- Withdrawal (odstúpenie) is for consumers only (`customer_type = 'person'`), 14 days from `delivered_at`.
- Invoice numbers: `YYYYNNNNN` (e.g. 202600001), assigned only at issue by `issue_invoice()`; issued invoices are immutable.
- UI copy is Slovak with correct diacritics.

## Commands
- `npm run dev`: dev server
- `npm test`: Vitest
- `npx supabase start` / `npx supabase db reset`: local DB with migrations + seed
