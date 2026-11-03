-- Founder decision 2026-11-03 (docs/08-rizika-vratenia-reklamacie.md): private persons (customer_type
-- 'person') no longer pay at checkout. They send a non-binding reservation; we call them before anything is
-- ordered from Gölz. Then either
--   * they come to the shop, sign and pay there: a contract concluded on our premises, not at a distance
--     (§ 14 ods. 1 zák. 108/2024), so the 14-day withdrawal does not apply, or
--   * we let them pay online (payment link on the order page): a distance contract, withdrawal applies.
-- Companies keep paying at checkout.

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in (
  'reserved', 'pending_payment', 'paid', 'confirmed', 'ordered_from_supplier',
  'received_at_branch', 'tested', 'shipped', 'out_for_delivery', 'ready_for_pickup',
  'delivered', 'completed', 'cancelled'
));

alter table public.orders
  -- set when the order started as a reservation (an expired payment link must not cancel it)
  add column reserved_at timestamptz,
  -- where the purchase contract was concluded; 'on_premises' = no statutory withdrawal
  add column contract_place text not null default 'distance' check (contract_place in ('distance', 'on_premises'));

-- payments.provider was free text; name what we accept: Stripe online, cash or card terminal in the shop,
-- bank transfer.
alter table public.payments
  add constraint payments_provider_check check (provider in ('stripe', 'cash', 'card_terminal', 'bank_transfer'));
