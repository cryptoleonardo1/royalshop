-- Gölz diamond blades (2026-11-07): category, 9 products, costs, images, specs, accessory links.
-- Run once in the Supabase SQL editor of the hosted project. Safe to re-run: existing rows are skipped.
-- Source of truth: supabase/seed-data/catalog.json. Images ship with the code deploy (public/demo-products).
begin;

insert into public.categories (slug, name, description, parent_id, sort_order)
select 'diamantove-kotuce', 'Diamantové kotúče', 'Diamantové kotúče k našim stolovým a blokovým pílam, rozbrusovačkám a rezačom škár: na obklady a dlažbu, na murivo a kameň a na betón a asfalt.', id, 4
from public.categories where slug = 'rezacia-technika'
on conflict (slug) do nothing;

-- Gölz SLF10 Diamantový kotúč na obklady a dlažbu, Ø 250 × 25,4 mm
insert into public.products (slug, name, brand_id, supplier_id, category_id, sku, ean, short_description, description,
  price_gross_cents, vat_rate, weight_kg, shipping_class, battery_platform, is_kit, warranty_months, safety_info, status, is_featured)
select 'golz-kotuc-slf10-250', 'Gölz SLF10 Diamantový kotúč na obklady a dlažbu, Ø 250 × 25,4 mm', (select id from public.brands where slug = 'golz'), (select id from public.suppliers where slug = 'golz'),
  (select id from public.categories where slug = 'diamantove-kotuce'), 'SLF10 250×25,4', null, 'Spekaný kotúč s uzavretým obvodom na čisté rezy bez vyštrbenia v obkladoch, dlažbe, keramike, mramore a tenkej žule.', '**Gölz SLF10 Ø 250 mm** – Spekaný kotúč s uzavretým obvodom na čisté rezy bez vyštrbenia v obkladoch, dlažbe, keramike, mramore a tenkej žule.

Spekaný (sintrovaný) diamantový kotúč s uzavretým obvodom pre stolové píly na obklady a dlažbu. Uzavretý obvod reže hladko a bez vyštrbenia hrán, preto sa hodí na glazovanú keramiku, dlaždice, mramor aj tenkú žulu.

Tento typ kotúča je v balení píly TS250. Ako náhradný alebo druhý kotúč sa hodí ku všetkým pílam rady TS250.

Vhodný pre stroje: Gölz TS250, TS250A, TS250A-330. Kotúč je určený pre stolové a blokové píly, nie pre ručné rozbrusovačky.',
  6038, 23, 0.8, 'courier', 'none', false, 24, 'Pracujte s ochranou zraku, sluchu a dýchacích ciest. Kotúč montujte len pri odpojenom stroji, v smere šípky otáčania, a nikdy neprekračujte maximálnu obvodovú rýchlosť uvedenú na kotúči. Prasknutý kotúč alebo kotúč s poškodeným segmentom ihneď vyraďte. Kotúč je určený pre stolové a blokové píly, nie pre ručné rozbrusovačky.', 'active', false
where not exists (select 1 from public.products where slug = 'golz-kotuc-slf10-250');
insert into public.product_costs (product_id, purchase_price_net_cents)
select id, 3829 from public.products where slug = 'golz-kotuc-slf10-250'
on conflict (product_id) do nothing;
insert into public.product_images (product_id, path, alt, sort_order)
select id, '/demo-products/golz-kotuc-slf10.webp', 'Gölz SLF10 Diamantový kotúč na obklady a dlažbu, Ø 250 × 25,4 mm', 0 from public.products pr where slug = 'golz-kotuc-slf10-250'
  and not exists (select 1 from public.product_images i where i.product_id = pr.id);
insert into public.product_specs (product_id, key, label, value, unit, is_filterable, sort_order)
select pr.id, s.key, s.label, s.value, s.unit, s.is_filterable, s.ord from public.products pr,
  (values
    ('material', 'Materiál', 'Obklady a dlažba', null, true, 0),
    ('diameter_mm', 'Priemer kotúča', '250', 'mm', true, 1),
    ('bore_mm', 'Upínací otvor', '25.4', 'mm', false, 2),
    ('segment_height_mm', 'Výška segmentu', '6.5', 'mm', false, 3),
    ('max_speed_ms', 'Max. obvodová rýchlosť', '80', 'm/s', false, 4),
    ('cooling', 'Rezanie', 'mokré', null, false, 5),
    ('fits', 'Vhodný pre stroje', 'Gölz TS250, TS250A, TS250A-330', null, false, 6)
  ) as s(key, label, value, unit, is_filterable, ord)
where pr.slug = 'golz-kotuc-slf10-250' and not exists (select 1 from public.product_specs x where x.product_id = pr.id);
insert into public.related_products (product_id, related_id, type)
select m.id, a.id, 'accessory' from public.products m, public.products a
where a.slug = 'golz-kotuc-slf10-250' and m.slug in ('golz-ts250', 'golz-ts250a', 'golz-ts250a-330')
on conflict (product_id, related_id) do nothing;

-- Gölz RX1S Diamantový kotúč na murivo a kameň, Ø 400 × 25,4 mm
insert into public.products (slug, name, brand_id, supplier_id, category_id, sku, ean, short_description, description,
  price_gross_cents, vat_rate, weight_kg, shipping_class, battery_platform, is_kit, warranty_months, safety_info, status, is_featured)
select 'golz-kotuc-rx1s-400', 'Gölz RX1S Diamantový kotúč na murivo a kameň, Ø 400 × 25,4 mm', (select id from public.brands where slug = 'golz'), (select id from public.suppliers where slug = 'golz'),
  (select id from public.categories where slug = 'diamantove-kotuce'), 'RX1S 400×25,4', null, 'Univerzálny laserom zváraný kotúč s tichým jadrom na tehly, tvárnice, klinker, betón a tvrdý kameň.', '**Gölz RX1S Ø 400 mm** – Univerzálny laserom zváraný kotúč s tichým jadrom na tehly, tvárnice, klinker, betón a tvrdý kameň.

Univerzálny diamantový kotúč s laserom zváranými segmentmi výšky 16 mm a tichým (Detenso) jadrom. Reže tehly, tvárnice, klinker, betónovú dlažbu, vymývaný betón aj žulu a tvrdý kameň.

Vysoké segmenty znamenajú dlhú životnosť aj pri každodennom rezaní na stavbe.

Vhodný pre stroje: Gölz MS400. Kotúč je určený pre stolové a blokové píly, nie pre ručné rozbrusovačky.',
  18795, 23, 2.5, 'courier', 'none', false, 24, 'Pracujte s ochranou zraku, sluchu a dýchacích ciest. Kotúč montujte len pri odpojenom stroji, v smere šípky otáčania, a nikdy neprekračujte maximálnu obvodovú rýchlosť uvedenú na kotúči. Prasknutý kotúč alebo kotúč s poškodeným segmentom ihneď vyraďte. Kotúč je určený pre stolové a blokové píly, nie pre ručné rozbrusovačky.', 'active', false
where not exists (select 1 from public.products where slug = 'golz-kotuc-rx1s-400');
insert into public.product_costs (product_id, purchase_price_net_cents)
select id, 11919 from public.products where slug = 'golz-kotuc-rx1s-400'
on conflict (product_id) do nothing;
insert into public.product_images (product_id, path, alt, sort_order)
select id, '/demo-products/golz-kotuc-rx1s.webp', 'Gölz RX1S Diamantový kotúč na murivo a kameň, Ø 400 × 25,4 mm', 0 from public.products pr where slug = 'golz-kotuc-rx1s-400'
  and not exists (select 1 from public.product_images i where i.product_id = pr.id);
insert into public.product_specs (product_id, key, label, value, unit, is_filterable, sort_order)
select pr.id, s.key, s.label, s.value, s.unit, s.is_filterable, s.ord from public.products pr,
  (values
    ('material', 'Materiál', 'Murivo, bloky a kameň', null, true, 0),
    ('diameter_mm', 'Priemer kotúča', '400', 'mm', true, 1),
    ('bore_mm', 'Upínací otvor', '25.4', 'mm', false, 2),
    ('segment_height_mm', 'Výška segmentu', '16', 'mm', false, 3),
    ('cooling', 'Rezanie', 'mokré', null, false, 4),
    ('fits', 'Vhodný pre stroje', 'Gölz MS400', null, false, 5)
  ) as s(key, label, value, unit, is_filterable, ord)
where pr.slug = 'golz-kotuc-rx1s-400' and not exists (select 1 from public.product_specs x where x.product_id = pr.id);
insert into public.related_products (product_id, related_id, type)
select m.id, a.id, 'accessory' from public.products m, public.products a
where a.slug = 'golz-kotuc-rx1s-400' and m.slug in ('golz-ms400')
on conflict (product_id, related_id) do nothing;

-- Gölz LB20 Diamantový kotúč na betón a železobetón, Ø 400 × 25,4 mm
insert into public.products (slug, name, brand_id, supplier_id, category_id, sku, ean, short_description, description,
  price_gross_cents, vat_rate, weight_kg, shipping_class, battery_platform, is_kit, warranty_months, safety_info, status, is_featured)
select 'golz-kotuc-lb20-400', 'Gölz LB20 Diamantový kotúč na betón a železobetón, Ø 400 × 25,4 mm', (select id from public.brands where slug = 'golz'), (select id from public.suppliers where slug = 'golz'),
  (select id from public.categories where slug = 'diamantove-kotuce'), 'LB20 400×25,4', null, 'Laserom zváraný kotúč s dobrým pomerom ceny a výkonu na betón, železobetón, betónovú dlažbu a obrubníky.', '**Gölz LB20 Ø 400 mm** – Laserom zváraný kotúč s dobrým pomerom ceny a výkonu na betón, železobetón, betónovú dlažbu a obrubníky.

Laserom zváraný diamantový kotúč na betón a železobetón s dobrým pomerom ceny a výkonu. Na stolovej píle MS400 sa hodí na betónovú dlažbu, obrubníky, betónové tvárnice a prefabrikáty.

Vhodný pre stroje: Gölz MS400.',
  11533, 23, 2.2, 'courier', 'none', false, 24, 'Pracujte s ochranou zraku, sluchu a dýchacích ciest. Kotúč montujte len pri odpojenom stroji, v smere šípky otáčania, a nikdy neprekračujte maximálnu obvodovú rýchlosť uvedenú na kotúči. Prasknutý kotúč alebo kotúč s poškodeným segmentom ihneď vyraďte.', 'active', false
where not exists (select 1 from public.products where slug = 'golz-kotuc-lb20-400');
insert into public.product_costs (product_id, purchase_price_net_cents)
select id, 7314 from public.products where slug = 'golz-kotuc-lb20-400'
on conflict (product_id) do nothing;
insert into public.product_images (product_id, path, alt, sort_order)
select id, '/demo-products/golz-kotuc-lb20.webp', 'Gölz LB20 Diamantový kotúč na betón a železobetón, Ø 400 × 25,4 mm', 0 from public.products pr where slug = 'golz-kotuc-lb20-400'
  and not exists (select 1 from public.product_images i where i.product_id = pr.id);
insert into public.product_specs (product_id, key, label, value, unit, is_filterable, sort_order)
select pr.id, s.key, s.label, s.value, s.unit, s.is_filterable, s.ord from public.products pr,
  (values
    ('material', 'Materiál', 'Betón a železobetón', null, true, 0),
    ('diameter_mm', 'Priemer kotúča', '400', 'mm', true, 1),
    ('bore_mm', 'Upínací otvor', '25.4', 'mm', false, 2),
    ('segment_height_mm', 'Výška segmentu', '10', 'mm', false, 3),
    ('max_speed_ms', 'Max. obvodová rýchlosť', '100', 'm/s', false, 4),
    ('cooling', 'Rezanie', 'mokré aj suché', null, false, 5),
    ('fits', 'Vhodný pre stroje', 'Gölz MS400', null, false, 6)
  ) as s(key, label, value, unit, is_filterable, ord)
where pr.slug = 'golz-kotuc-lb20-400' and not exists (select 1 from public.product_specs x where x.product_id = pr.id);
insert into public.related_products (product_id, related_id, type)
select m.id, a.id, 'accessory' from public.products m, public.products a
where a.slug = 'golz-kotuc-lb20-400' and m.slug in ('golz-ms400')
on conflict (product_id, related_id) do nothing;

-- Gölz BS30 Diamantový kotúč na murivo a kameň, Ø 650 × 60 mm
insert into public.products (slug, name, brand_id, supplier_id, category_id, sku, ean, short_description, description,
  price_gross_cents, vat_rate, weight_kg, shipping_class, battery_platform, is_kit, warranty_months, safety_info, status, is_featured)
select 'golz-kotuc-bs30-650', 'Gölz BS30 Diamantový kotúč na murivo a kameň, Ø 650 × 60 mm', (select id from public.brands where slug = 'golz'), (select id from public.suppliers where slug = 'golz'),
  (select id from public.categories where slug = 'diamantove-kotuce'), 'BS30 650×60', null, 'Kotúč pre blokové píly na vápenno-pieskové tvárnice, keramické bloky, pemzobetón a tehly.', '**Gölz BS30 Ø 650 mm** – Kotúč pre blokové píly na vápenno-pieskové tvárnice, keramické bloky, pemzobetón a tehly.

Laserom zváraný diamantový kotúč pre blokové píly s upínacím otvorom 60 mm. Reže vápenno-pieskové tvárnice, keramické murovacie bloky, pemzobetón, tehly aj abrazívny betón.

Vhodný pre stroje: Gölz BS650. Kotúč je určený pre stolové a blokové píly, nie pre ručné rozbrusovačky.',
  28245, 23, 6, 'courier', 'none', false, 24, 'Pracujte s ochranou zraku, sluchu a dýchacích ciest. Kotúč montujte len pri odpojenom stroji, v smere šípky otáčania, a nikdy neprekračujte maximálnu obvodovú rýchlosť uvedenú na kotúči. Prasknutý kotúč alebo kotúč s poškodeným segmentom ihneď vyraďte. Kotúč je určený pre stolové a blokové píly, nie pre ručné rozbrusovačky.', 'active', false
where not exists (select 1 from public.products where slug = 'golz-kotuc-bs30-650');
insert into public.product_costs (product_id, purchase_price_net_cents)
select id, 17911 from public.products where slug = 'golz-kotuc-bs30-650'
on conflict (product_id) do nothing;
insert into public.product_images (product_id, path, alt, sort_order)
select id, '/demo-products/golz-kotuc-bs30.webp', 'Gölz BS30 Diamantový kotúč na murivo a kameň, Ø 650 × 60 mm', 0 from public.products pr where slug = 'golz-kotuc-bs30-650'
  and not exists (select 1 from public.product_images i where i.product_id = pr.id);
insert into public.product_specs (product_id, key, label, value, unit, is_filterable, sort_order)
select pr.id, s.key, s.label, s.value, s.unit, s.is_filterable, s.ord from public.products pr,
  (values
    ('material', 'Materiál', 'Murivo, bloky a kameň', null, true, 0),
    ('diameter_mm', 'Priemer kotúča', '650', 'mm', true, 1),
    ('bore_mm', 'Upínací otvor', '60', 'mm', false, 2),
    ('segment_height_mm', 'Výška segmentu', '10', 'mm', false, 3),
    ('cooling', 'Rezanie', 'mokré', null, false, 4),
    ('fits', 'Vhodný pre stroje', 'Gölz BS650', null, false, 5)
  ) as s(key, label, value, unit, is_filterable, ord)
where pr.slug = 'golz-kotuc-bs30-650' and not exists (select 1 from public.product_specs x where x.product_id = pr.id);
insert into public.related_products (product_id, related_id, type)
select m.id, a.id, 'accessory' from public.products m, public.products a
where a.slug = 'golz-kotuc-bs30-650' and m.slug in ('golz-bs650')
on conflict (product_id, related_id) do nothing;

-- Gölz BS30 Diamantový kotúč na murivo a kameň, Ø 900 × 60 mm
insert into public.products (slug, name, brand_id, supplier_id, category_id, sku, ean, short_description, description,
  price_gross_cents, vat_rate, weight_kg, shipping_class, battery_platform, is_kit, warranty_months, safety_info, status, is_featured)
select 'golz-kotuc-bs30-900', 'Gölz BS30 Diamantový kotúč na murivo a kameň, Ø 900 × 60 mm', (select id from public.brands where slug = 'golz'), (select id from public.suppliers where slug = 'golz'),
  (select id from public.categories where slug = 'diamantove-kotuce'), 'BS30 900×60', null, 'Kotúč Ø 900 mm pre blokovú pílu BS900/1000 na vápenno-pieskové tvárnice, keramické bloky, pemzobetón a tehly.', '**Gölz BS30 Ø 900 mm** – Kotúč Ø 900 mm pre blokovú pílu BS900/1000 na vápenno-pieskové tvárnice, keramické bloky, pemzobetón a tehly.

Laserom zváraný diamantový kotúč pre blokové píly s upínacím otvorom 60 mm. Reže vápenno-pieskové tvárnice, keramické murovacie bloky, pemzobetón, tehly aj abrazívny betón.

Priemer 900 mm stačí na bežné murovacie bloky. Na najvyššie bloky zvoľte kotúč Ø 1 000 mm.

Vhodný pre stroje: Gölz BS900/1000. Kotúč je určený pre stolové a blokové píly, nie pre ručné rozbrusovačky.',
  37695, 23, 12, 'courier', 'none', false, 24, 'Pracujte s ochranou zraku, sluchu a dýchacích ciest. Kotúč montujte len pri odpojenom stroji, v smere šípky otáčania, a nikdy neprekračujte maximálnu obvodovú rýchlosť uvedenú na kotúči. Prasknutý kotúč alebo kotúč s poškodeným segmentom ihneď vyraďte. Kotúč je určený pre stolové a blokové píly, nie pre ručné rozbrusovačky.', 'active', false
where not exists (select 1 from public.products where slug = 'golz-kotuc-bs30-900');
insert into public.product_costs (product_id, purchase_price_net_cents)
select id, 23904 from public.products where slug = 'golz-kotuc-bs30-900'
on conflict (product_id) do nothing;
insert into public.product_images (product_id, path, alt, sort_order)
select id, '/demo-products/golz-kotuc-bs30.webp', 'Gölz BS30 Diamantový kotúč na murivo a kameň, Ø 900 × 60 mm', 0 from public.products pr where slug = 'golz-kotuc-bs30-900'
  and not exists (select 1 from public.product_images i where i.product_id = pr.id);
insert into public.product_specs (product_id, key, label, value, unit, is_filterable, sort_order)
select pr.id, s.key, s.label, s.value, s.unit, s.is_filterable, s.ord from public.products pr,
  (values
    ('material', 'Materiál', 'Murivo, bloky a kameň', null, true, 0),
    ('diameter_mm', 'Priemer kotúča', '900', 'mm', true, 1),
    ('bore_mm', 'Upínací otvor', '60', 'mm', false, 2),
    ('segment_height_mm', 'Výška segmentu', '10', 'mm', false, 3),
    ('cooling', 'Rezanie', 'mokré', null, false, 4),
    ('fits', 'Vhodný pre stroje', 'Gölz BS900/1000', null, false, 5)
  ) as s(key, label, value, unit, is_filterable, ord)
where pr.slug = 'golz-kotuc-bs30-900' and not exists (select 1 from public.product_specs x where x.product_id = pr.id);
insert into public.related_products (product_id, related_id, type)
select m.id, a.id, 'accessory' from public.products m, public.products a
where a.slug = 'golz-kotuc-bs30-900' and m.slug in ('golz-bs900-1000')
on conflict (product_id, related_id) do nothing;

-- Gölz BS30 Diamantový kotúč na murivo a kameň, Ø 1 000 × 60 mm
insert into public.products (slug, name, brand_id, supplier_id, category_id, sku, ean, short_description, description,
  price_gross_cents, vat_rate, weight_kg, shipping_class, battery_platform, is_kit, warranty_months, safety_info, status, is_featured)
select 'golz-kotuc-bs30-1000', 'Gölz BS30 Diamantový kotúč na murivo a kameň, Ø 1 000 × 60 mm', (select id from public.brands where slug = 'golz'), (select id from public.suppliers where slug = 'golz'),
  (select id from public.categories where slug = 'diamantove-kotuce'), 'BS30 1000×60', null, 'Kotúč Ø 1 000 mm na plnú hĺbku rezu blokovej píly BS900/1000, na tvárnice, keramické bloky a tehly.', '**Gölz BS30 Ø 1 000 mm** – Kotúč Ø 1 000 mm na plnú hĺbku rezu blokovej píly BS900/1000, na tvárnice, keramické bloky a tehly.

Laserom zváraný diamantový kotúč pre blokové píly s upínacím otvorom 60 mm. Reže vápenno-pieskové tvárnice, keramické murovacie bloky, pemzobetón, tehly aj abrazívny betón.

Priemer 1 000 mm využije plnú hĺbku rezu píly BS900/1000 pri najvyšších blokoch.

Vhodný pre stroje: Gölz BS900/1000. Kotúč je určený pre stolové a blokové píly, nie pre ručné rozbrusovačky.',
  67095, 23, 15, 'courier', 'none', false, 24, 'Pracujte s ochranou zraku, sluchu a dýchacích ciest. Kotúč montujte len pri odpojenom stroji, v smere šípky otáčania, a nikdy neprekračujte maximálnu obvodovú rýchlosť uvedenú na kotúči. Prasknutý kotúč alebo kotúč s poškodeným segmentom ihneď vyraďte. Kotúč je určený pre stolové a blokové píly, nie pre ručné rozbrusovačky.', 'active', false
where not exists (select 1 from public.products where slug = 'golz-kotuc-bs30-1000');
insert into public.product_costs (product_id, purchase_price_net_cents)
select id, 42548 from public.products where slug = 'golz-kotuc-bs30-1000'
on conflict (product_id) do nothing;
insert into public.product_images (product_id, path, alt, sort_order)
select id, '/demo-products/golz-kotuc-bs30.webp', 'Gölz BS30 Diamantový kotúč na murivo a kameň, Ø 1 000 × 60 mm', 0 from public.products pr where slug = 'golz-kotuc-bs30-1000'
  and not exists (select 1 from public.product_images i where i.product_id = pr.id);
insert into public.product_specs (product_id, key, label, value, unit, is_filterable, sort_order)
select pr.id, s.key, s.label, s.value, s.unit, s.is_filterable, s.ord from public.products pr,
  (values
    ('material', 'Materiál', 'Murivo, bloky a kameň', null, true, 0),
    ('diameter_mm', 'Priemer kotúča', '1000', 'mm', true, 1),
    ('bore_mm', 'Upínací otvor', '60', 'mm', false, 2),
    ('segment_height_mm', 'Výška segmentu', '10', 'mm', false, 3),
    ('cooling', 'Rezanie', 'mokré', null, false, 4),
    ('fits', 'Vhodný pre stroje', 'Gölz BS900/1000', null, false, 5)
  ) as s(key, label, value, unit, is_filterable, ord)
where pr.slug = 'golz-kotuc-bs30-1000' and not exists (select 1 from public.product_specs x where x.product_id = pr.id);
insert into public.related_products (product_id, related_id, type)
select m.id, a.id, 'accessory' from public.products m, public.products a
where a.slug = 'golz-kotuc-bs30-1000' and m.slug in ('golz-bs900-1000')
on conflict (product_id, related_id) do nothing;

-- Gölz LCA65 Diamantový kotúč na betón a asfalt, Ø 350 × 25,4 mm
insert into public.products (slug, name, brand_id, supplier_id, category_id, sku, ean, short_description, description,
  price_gross_cents, vat_rate, weight_kg, shipping_class, battery_platform, is_kit, warranty_months, safety_info, status, is_featured)
select 'golz-kotuc-lca65-350', 'Gölz LCA65 Diamantový kotúč na betón a asfalt, Ø 350 × 25,4 mm', (select id from public.brands where slug = 'golz'), (select id from public.suppliers where slug = 'golz'),
  (select id from public.categories where slug = 'diamantove-kotuce'), 'LCA65 350×25,4', null, 'Univerzálny kotúč na betón a asfalt pre rezače škár a rozbrusovačky, Ø 350 mm.', '**Gölz LCA65 Ø 350 mm** – Univerzálny kotúč na betón a asfalt pre rezače škár a rozbrusovačky, Ø 350 mm.

Laserom zváraný univerzálny diamantový kotúč na betón, asfalt a bežné stavebné materiály. Je schválený na obvodovú rýchlosť 100 m/s, preto ho môžete použiť na rezači škár FS125 aj na elektrickej rozbrusovačke HS350.

Vhodný pre stroje: Gölz FS125, HS350.',
  14175, 23, 1.8, 'courier', 'none', false, 24, 'Pracujte s ochranou zraku, sluchu a dýchacích ciest. Kotúč montujte len pri odpojenom stroji, v smere šípky otáčania, a nikdy neprekračujte maximálnu obvodovú rýchlosť uvedenú na kotúči. Prasknutý kotúč alebo kotúč s poškodeným segmentom ihneď vyraďte.', 'active', false
where not exists (select 1 from public.products where slug = 'golz-kotuc-lca65-350');
insert into public.product_costs (product_id, purchase_price_net_cents)
select id, 8989 from public.products where slug = 'golz-kotuc-lca65-350'
on conflict (product_id) do nothing;
insert into public.product_images (product_id, path, alt, sort_order)
select id, '/demo-products/golz-kotuc-lca65.webp', 'Gölz LCA65 Diamantový kotúč na betón a asfalt, Ø 350 × 25,4 mm', 0 from public.products pr where slug = 'golz-kotuc-lca65-350'
  and not exists (select 1 from public.product_images i where i.product_id = pr.id);
insert into public.product_specs (product_id, key, label, value, unit, is_filterable, sort_order)
select pr.id, s.key, s.label, s.value, s.unit, s.is_filterable, s.ord from public.products pr,
  (values
    ('material', 'Materiál', 'Betón a asfalt', null, true, 0),
    ('diameter_mm', 'Priemer kotúča', '350', 'mm', true, 1),
    ('bore_mm', 'Upínací otvor', '25.4', 'mm', false, 2),
    ('segment_height_mm', 'Výška segmentu', '10', 'mm', false, 3),
    ('max_speed_ms', 'Max. obvodová rýchlosť', '100', 'm/s', false, 4),
    ('cooling', 'Rezanie', 'mokré aj suché', null, false, 5),
    ('fits', 'Vhodný pre stroje', 'Gölz FS125, HS350', null, false, 6)
  ) as s(key, label, value, unit, is_filterable, ord)
where pr.slug = 'golz-kotuc-lca65-350' and not exists (select 1 from public.product_specs x where x.product_id = pr.id);
insert into public.related_products (product_id, related_id, type)
select m.id, a.id, 'accessory' from public.products m, public.products a
where a.slug = 'golz-kotuc-lca65-350' and m.slug in ('golz-fs125', 'golz-hs350')
on conflict (product_id, related_id) do nothing;

-- Gölz LCA65 Diamantový kotúč na betón a asfalt, Ø 500 × 25,4 mm
insert into public.products (slug, name, brand_id, supplier_id, category_id, sku, ean, short_description, description,
  price_gross_cents, vat_rate, weight_kg, shipping_class, battery_platform, is_kit, warranty_months, safety_info, status, is_featured)
select 'golz-kotuc-lca65-500', 'Gölz LCA65 Diamantový kotúč na betón a asfalt, Ø 500 × 25,4 mm', (select id from public.brands where slug = 'golz'), (select id from public.suppliers where slug = 'golz'),
  (select id from public.categories where slug = 'diamantove-kotuce'), 'LCA65 500×25,4', null, 'Univerzálny kotúč na betón a asfalt pre rezač škár FS170, Ø 500 mm.', '**Gölz LCA65 Ø 500 mm** – Univerzálny kotúč na betón a asfalt pre rezač škár FS170, Ø 500 mm.

Laserom zváraný univerzálny diamantový kotúč na betón, asfalt a bežné stavebné materiály. Priemer 500 mm využije plnú hĺbku rezu rezača škár FS170 pri dilatačných škárach a opravách vozoviek.

Vhodný pre stroje: Gölz FS170.',
  24784, 23, 4, 'courier', 'none', false, 24, 'Pracujte s ochranou zraku, sluchu a dýchacích ciest. Kotúč montujte len pri odpojenom stroji, v smere šípky otáčania, a nikdy neprekračujte maximálnu obvodovú rýchlosť uvedenú na kotúči. Prasknutý kotúč alebo kotúč s poškodeným segmentom ihneď vyraďte.', 'active', false
where not exists (select 1 from public.products where slug = 'golz-kotuc-lca65-500');
insert into public.product_costs (product_id, purchase_price_net_cents)
select id, 15717 from public.products where slug = 'golz-kotuc-lca65-500'
on conflict (product_id) do nothing;
insert into public.product_images (product_id, path, alt, sort_order)
select id, '/demo-products/golz-kotuc-lca65.webp', 'Gölz LCA65 Diamantový kotúč na betón a asfalt, Ø 500 × 25,4 mm', 0 from public.products pr where slug = 'golz-kotuc-lca65-500'
  and not exists (select 1 from public.product_images i where i.product_id = pr.id);
insert into public.product_specs (product_id, key, label, value, unit, is_filterable, sort_order)
select pr.id, s.key, s.label, s.value, s.unit, s.is_filterable, s.ord from public.products pr,
  (values
    ('material', 'Materiál', 'Betón a asfalt', null, true, 0),
    ('diameter_mm', 'Priemer kotúča', '500', 'mm', true, 1),
    ('bore_mm', 'Upínací otvor', '25.4', 'mm', false, 2),
    ('segment_height_mm', 'Výška segmentu', '10', 'mm', false, 3),
    ('max_speed_ms', 'Max. obvodová rýchlosť', '100', 'm/s', false, 4),
    ('cooling', 'Rezanie', 'mokré aj suché', null, false, 5),
    ('fits', 'Vhodný pre stroje', 'Gölz FS170', null, false, 6)
  ) as s(key, label, value, unit, is_filterable, ord)
where pr.slug = 'golz-kotuc-lca65-500' and not exists (select 1 from public.product_specs x where x.product_id = pr.id);
insert into public.related_products (product_id, related_id, type)
select m.id, a.id, 'accessory' from public.products m, public.products a
where a.slug = 'golz-kotuc-lca65-500' and m.slug in ('golz-fs170')
on conflict (product_id, related_id) do nothing;

-- Gölz TS40GX Diamantový kotúč na betón a železobetón, Ø 400 × 25,4 mm
insert into public.products (slug, name, brand_id, supplier_id, category_id, sku, ean, short_description, description,
  price_gross_cents, vat_rate, weight_kg, shipping_class, battery_platform, is_kit, warranty_months, safety_info, status, is_featured)
select 'golz-kotuc-ts40gx-400', 'Gölz TS40GX Diamantový kotúč na betón a železobetón, Ø 400 × 25,4 mm', (select id from public.brands where slug = 'golz'), (select id from public.suppliers where slug = 'golz'),
  (select id from public.categories where slug = 'diamantove-kotuce'), 'TS40GX 400×25,4', null, 'Kotúč so zapusteným upínaním (6 × M6) na rezy tesne pri stene a pri podlahe, na betón a železobetón.', '**Gölz TS40GX Ø 400 mm** – Kotúč so zapusteným upínaním (6 × M6) na rezy tesne pri stene a pri podlahe, na betón a železobetón.

Diamantový kotúč s turbo segmentmi a presným rozložením diamantov (Galaxis) na betón a železobetón. Má zapustené upínanie so 6 otvormi M6, vďaka ktorému rozbrusovačka HS400F reže tesne pri stene, pri podlahe alebo pri strope.

Na rezy pri stene používajte len kotúč so zapusteným upínaním.

Vhodný pre stroje: Gölz HS400F.',
  20613, 23, 2.5, 'courier', 'none', false, 24, 'Pracujte s ochranou zraku, sluchu a dýchacích ciest. Kotúč montujte len pri odpojenom stroji, v smere šípky otáčania, a nikdy neprekračujte maximálnu obvodovú rýchlosť uvedenú na kotúči. Prasknutý kotúč alebo kotúč s poškodeným segmentom ihneď vyraďte.', 'active', false
where not exists (select 1 from public.products where slug = 'golz-kotuc-ts40gx-400');
insert into public.product_costs (product_id, purchase_price_net_cents)
select id, 13072 from public.products where slug = 'golz-kotuc-ts40gx-400'
on conflict (product_id) do nothing;
insert into public.product_images (product_id, path, alt, sort_order)
select id, '/demo-products/golz-kotuc-ts40gx.webp', 'Gölz TS40GX Diamantový kotúč na betón a železobetón, Ø 400 × 25,4 mm', 0 from public.products pr where slug = 'golz-kotuc-ts40gx-400'
  and not exists (select 1 from public.product_images i where i.product_id = pr.id);
insert into public.product_specs (product_id, key, label, value, unit, is_filterable, sort_order)
select pr.id, s.key, s.label, s.value, s.unit, s.is_filterable, s.ord from public.products pr,
  (values
    ('material', 'Materiál', 'Betón a železobetón', null, true, 0),
    ('diameter_mm', 'Priemer kotúča', '400', 'mm', true, 1),
    ('bore_mm', 'Upínací otvor', '25.4', 'mm', false, 2),
    ('segment_height_mm', 'Výška segmentu', '12', 'mm', false, 3),
    ('max_speed_ms', 'Max. obvodová rýchlosť', '100', 'm/s', false, 4),
    ('cooling', 'Rezanie', 'mokré', null, false, 5),
    ('fits', 'Vhodný pre stroje', 'Gölz HS400F', null, false, 6)
  ) as s(key, label, value, unit, is_filterable, ord)
where pr.slug = 'golz-kotuc-ts40gx-400' and not exists (select 1 from public.product_specs x where x.product_id = pr.id);
insert into public.related_products (product_id, related_id, type)
select m.id, a.id, 'accessory' from public.products m, public.products a
where a.slug = 'golz-kotuc-ts40gx-400' and m.slug in ('golz-hs400f')
on conflict (product_id, related_id) do nothing;

commit;

-- Check: 9 blades, 12 accessory links
select count(*) as blades from public.products p join public.categories c on c.id = p.category_id where c.slug = 'diamantove-kotuce';
select count(*) as accessory_links from public.related_products where type = 'accessory';
