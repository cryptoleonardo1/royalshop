-- Delivery priced by the total weight of the order, one price for all of Slovakia, instead of courier
-- flat rate + own-transport distance zones. No free shipping: with machines from 800 € up a threshold
-- made exactly the heaviest (most expensive to move) orders free. Pickup in the shop stays free.
--
-- Bands are placeholders until the pallet carrier quotes arrive; edit them here (admin settings later).
-- shipping_zones / orders.shipping_zone_id stay for old orders but are no longer used by the shop.

alter table public.company_settings
  add column shipping_rates jsonb not null default '[
    {"name": "balík do 40 kg", "maxKg": 40, "priceCents": 990},
    {"name": "paleta do 100 kg", "maxKg": 100, "priceCents": 4900},
    {"name": "paleta do 300 kg", "maxKg": 300, "priceCents": 8900},
    {"name": "paleta nad 300 kg", "maxKg": null, "priceCents": 14900}
  ]'::jsonb;

-- null = no free shipping
alter table public.company_settings
  alter column free_shipping_threshold_cents drop not null,
  alter column free_shipping_threshold_cents drop default;
update public.company_settings set free_shipping_threshold_cents = null;

-- Honda engine variants from the price list were seeded without a weight (they would fall into the
-- heaviest band). Use the weight of the same engine family; the reduction-gear types are a few kg
-- heavier but stay in the parcel band.
update public.products set weight_kg = case
    when sku like 'GX25%' then 4
    when sku like 'GX120%' then 13.2
    when sku like 'GX160%' then 15.1
    when sku like 'GX200%' then 16.1
    when sku like 'GX240%' then 25
    when sku like 'GX270%' then 25.8
    when sku like 'GX390%' then 31.7
  end
where weight_kg is null and not is_listed and sku like 'GX%';
