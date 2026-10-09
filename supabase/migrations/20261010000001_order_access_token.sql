-- Guest checkout: the order confirmation page is reached via /objednavka/<number>?t=<access_token>.
-- The token is only ever compared server-side (service role); customers never query orders by it.
alter table public.orders
  add column access_token uuid not null default gen_random_uuid();

create unique index orders_access_token_idx on public.orders (access_token);
