@AGENTS.md

# Royal Shop

Slovak e-shop for construction machines and professional tools. Sister project of royalstroje.sk (rental). Demo phase: real models, Stripe test mode, `noindex`.

Strategy (changed 2026-11-12, replaces "premium machines only, minimum 800 €, no cordless tools" from 2026-10-12): a full-range shop with 1000+ items. Shown today: Gölz (machines + diamond blades, indicative prices), Makita (Royal stroje is an authorised dealer; machines imported from Makita's daily export at Makita's recommended price, incl. cordless) and, since 2026-11-20, NTC, Bomag, Honda and Enar supplied by Unicon (prices = Unicon's CZK price lists converted to EUR). Changes of 2026-11-24: Gölz is hidden until the import duties (packaging, electrical equipment) are settled; Makita shows only the machines of the current promotion (`supabase/seed-data/makita-akcia.json`); AG náradie (wholesaler for e-shops, XML feeds) is being added: products from 50 € incl. VAT, listed only while in stock (`scripts/ag-catalog.py` -> `scripts/import-ag.ts`, daily stock sync `src/lib/ag-sync.ts`). Since 2026-11-25 Nivel System measuring instruments from the Slovak importer 3gon (authorised dealer, prices = 3gonshop.sk, `scripts/nivel-catalog.py` -> `scripts/import-nivel.ts`; imported locally only until 3gon confirms its texts and photos may be used). Next: CEG wholesale catalogue (Cedima, Master and others). Hidden brands are listed in `src/lib/shop-brands.ts`.

Read before larger changes:
- `docs/04-technicka-dokumentacia.md`: architecture, order flow, data model, screens (source of truth)
- `docs/03-legislativa-research.md`: legal requirements (withdrawal § 20a, claims, GPSR, Omnibus)
- `docs/06-pravne-stranky.md`: legal pages content, payment/delivery/withdrawal decisions (newer than 03; details in `docs/pravne/`)
- `docs/05-sortiment-stroje.md`: assortment, suppliers, prices to confirm (catalog source: `supabase/seed-data/catalog.json`; Makita: `scripts/makita-catalog.py` -> `supabase/seed-data/makita.json` -> `scripts/import-makita.ts`)

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
