-- Founder decision 2026-10-23 (docs/06-pravne-stranky.md §1.1): the card is charged immediately at checkout
-- instead of a manual-capture hold. The contract is concluded by our "Potvrdenie objednávky" e-mail once the
-- supplier confirms availability; if it cannot be accepted, the payment is refunded within 2 working days.
-- Order status paid_authorized ("card held") becomes paid ("paid, availability being confirmed").
-- payments.status 'authorized' and orders.payment_status 'authorized' stay allowed for old rows.

alter table public.orders drop constraint if exists orders_status_check;

update public.orders set status = 'paid' where status = 'paid_authorized';
update public.order_status_history set from_status = 'paid' where from_status = 'paid_authorized';
update public.order_status_history set to_status = 'paid' where to_status = 'paid_authorized';

alter table public.orders add constraint orders_status_check check (status in (
  'pending_payment', 'paid', 'confirmed', 'ordered_from_supplier',
  'received_at_branch', 'tested', 'shipped', 'out_for_delivery', 'ready_for_pickup',
  'delivered', 'completed', 'cancelled'
));

-- Royal Shop pickup hours (shorter than the rental yard's 7:00–16:00, so orders can be prepared in time).
update public.company_settings set pickup_hours = 'Po–Pi 8:00–15:00' where id = 1;
