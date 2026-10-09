-- Demo-only reset used by scripts/seed.ts. TRUNCATE skips row triggers, so issued invoices can be cleared.
-- Refuses to run once the company settings no longer say "(demo)" — i.e. on a real shop.

create or replace function public.seed_reset()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.company_settings where company_name not like '%(demo)%') then
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
