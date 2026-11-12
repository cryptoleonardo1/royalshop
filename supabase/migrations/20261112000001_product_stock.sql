-- Supplier stock shown on the storefront: true = in stock at the supplier, false = not in stock (cannot be
-- ordered), null = the supplier does not report stock (goods ordered on demand, e.g. Gölz machines).
-- Filled from the supplier's export (Makita: scripts/import-makita.ts).

alter table public.products
  add column in_stock boolean;
