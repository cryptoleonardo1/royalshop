-- Royal Shop is run by Royal stroje s. r. o. (the royalstroje.sk rental company): real company data
-- replaces the demo values. Same phone as the rental, own e-mail for shop customers.
--
-- The demo guard of seed_reset() used to look for "(demo)" in the company name; with the real name in
-- place it moves to an explicit flag. Set is_demo = false when the shop goes live with real orders.

alter table public.company_settings
  add column is_demo boolean not null default true;

create or replace function public.seed_reset()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.company_settings where not is_demo) then
    raise exception 'seed_reset is only allowed on a demo database';
  end if;

  truncate table
    public.claim_messages, public.claim_attachments, public.claims, public.returns,
    public.invoice_lines, public.invoices, public.test_reports, public.shipments, public.supplier_orders,
    public.payments, public.payment_events, public.order_status_history, public.order_items, public.orders,
    public.notifications_log, public.cart_items, public.related_products, public.product_specs,
    public.product_images, public.product_documents, public.product_costs, public.price_history,
    public.products, public.categories, public.brands, public.suppliers, public.shipping_zones,
    public.document_counters, public.activity_log
  restart identity cascade;
end $$;

revoke execute on function public.seed_reset() from public, anon, authenticated;
grant execute on function public.seed_reset() to service_role;

-- Company data (from royalstroje.sk/kontakt and the business register, orsr.sk, 2026-10-22).
-- IBAN is still the demo value: not published, to be supplied by the company.
update public.company_settings set
  company_name = 'Royal stroje s. r. o.',
  street = 'Boldog 182',
  city = 'Boldog',
  zip = '925 26',
  ico = '57 405 425',
  dic = '2122722063',
  ic_dph = 'SK2122722063',
  register_info = 'Zapísaná v Obchodnom registri Mestského súdu Bratislava III, oddiel: Sro, vložka č. 195530/B',
  email = 'shop@royalstroje.sk',
  phone = '+421 948 555 551',
  web = 'royalstroje.sk',
  pickup_address = 'Predajňa Royal Stroje, Recká cesta 182, 925 26 Boldog (pri Senci)',
  pickup_hours = 'Po–Pi 7:00–16:00'
where id = 1;

update public.shipping_zones set name = replace(name, 'od Senca', 'od predajne');
