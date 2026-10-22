-- "Cena na požiadanie": the product is listed without a price and cannot be bought online.
-- price_gross_cents stays filled (not null) so the product can be switched back without data loss;
-- the storefront hides it and server-side pricing (fetchPricedProducts) skips such products.
alter table public.products
  add column price_on_request boolean not null default false;
