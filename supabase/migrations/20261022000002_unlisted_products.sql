-- Unlisted products: sellable (cart, checkout, product page) but left out of listings, category counts
-- and search. Used for the full Honda GX engine price list, whose variants are bought from the table
-- on /kategoria/motory instead of appearing as 176 extra product cards.
alter table public.products
  add column is_listed boolean not null default true;
