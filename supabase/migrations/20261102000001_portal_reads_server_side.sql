-- Customer portal reads go through the server (service role + explicit profile_id check, safe columns only).
-- The "own ... read" policies let a signed-in customer read whole rows straight from the API, including
-- orders.admin_note, order_items.purchase_price_net_cents and internal status-history notes. They were
-- harmless while no order had a profile_id; the portal links orders to accounts, so they go now.
-- Admin access ("admin all") is unchanged.

drop policy if exists "own orders read" on public.orders;
drop policy if exists "own order items read" on public.order_items;
drop policy if exists "own order history read" on public.order_status_history;
