-- Royal Shop — row level security
-- Principle: the browser reads public catalog + its own rows. Every write that touches money,
-- order state, invoices, withdrawals or claims goes through server actions using the service role.

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.brands enable row level security;
alter table public.suppliers enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_costs enable row level security;
alter table public.product_images enable row level security;
alter table public.product_specs enable row level security;
alter table public.product_documents enable row level security;
alter table public.price_history enable row level security;
alter table public.related_products enable row level security;
alter table public.company_settings enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.legal_documents enable row level security;
alter table public.document_counters enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.supplier_orders enable row level security;
alter table public.test_reports enable row level security;
alter table public.shipments enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.returns enable row level security;
alter table public.claims enable row level security;
alter table public.claim_attachments enable row level security;
alter table public.claim_messages enable row level security;
alter table public.notifications_log enable row level security;
alter table public.activity_log enable row level security;

-- ───────────── Admin: full access everywhere ─────────────
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','addresses','brands','suppliers','categories','products','product_costs','product_images',
    'product_specs','product_documents','price_history','related_products','company_settings','shipping_zones',
    'legal_documents','document_counters','cart_items','orders','order_items','order_status_history','payments',
    'payment_events','supplier_orders','test_reports','shipments','invoices','invoice_lines','returns','claims',
    'claim_attachments','claim_messages','notifications_log','activity_log'
  ] loop
    execute format(
      'create policy "admin all" on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',
      t
    );
  end loop;
end $$;

-- ───────────── Public catalog ─────────────
create policy "public read brands" on public.brands for select to anon, authenticated using (true);
create policy "public read categories" on public.categories for select to anon, authenticated using (is_active);
create policy "public read products" on public.products for select to anon, authenticated using (status = 'active');
create policy "public read images" on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "public read specs" on public.product_specs for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "public read documents" on public.product_documents for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "public read related" on public.related_products for select to anon, authenticated using (true);
create policy "public read shipping zones" on public.shipping_zones for select to anon, authenticated using (true);
create policy "public read legal docs" on public.legal_documents for select to anon, authenticated using (true);
-- suppliers: only name + lead times are needed publicly (delivery estimate); no contact data is sensitive enough to hide
create policy "public read suppliers" on public.suppliers for select to anon, authenticated using (true);
-- company_settings: public business identity (IČO, address…) — required on the web anyway
create policy "public read settings" on public.company_settings for select to anon, authenticated using (true);
-- product_costs, price_history, document_counters: admin only (no public policy)

-- ───────────── Customer: own rows ─────────────
create policy "own profile read" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own addresses" on public.addresses for all to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

create policy "own cart" on public.cart_items for all to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

create policy "own orders read" on public.orders for select to authenticated using (profile_id = (select auth.uid()));
create policy "own order items read" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.profile_id = (select auth.uid())));
create policy "own order history read" on public.order_status_history for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.profile_id = (select auth.uid())));
create policy "own shipments read" on public.shipments for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.profile_id = (select auth.uid())));
create policy "own invoices read" on public.invoices for select to authenticated
  using (status = 'issued' and exists (select 1 from public.orders o where o.id = order_id and o.profile_id = (select auth.uid())));
create policy "own invoice lines read" on public.invoice_lines for select to authenticated
  using (exists (
    select 1 from public.invoices i join public.orders o on o.id = i.order_id
    where i.id = invoice_id and i.status = 'issued' and o.profile_id = (select auth.uid())
  ));

create policy "own returns read" on public.returns for select to authenticated using (profile_id = (select auth.uid()));
create policy "own claims read" on public.claims for select to authenticated using (profile_id = (select auth.uid()));
create policy "own claim attachments read" on public.claim_attachments for select to authenticated
  using (exists (select 1 from public.claims c where c.id = claim_id and c.profile_id = (select auth.uid())));
create policy "own claim messages read" on public.claim_messages for select to authenticated
  using (exists (select 1 from public.claims c where c.id = claim_id and c.profile_id = (select auth.uid())));
create policy "own claim messages write" on public.claim_messages for insert to authenticated
  with check (
    author_id = (select auth.uid()) and is_staff = false
    and exists (select 1 from public.claims c where c.id = claim_id and c.profile_id = (select auth.uid()))
  );

-- ───────────── Storage ─────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/webp', 'image/png', 'image/jpeg', 'image/avif']),
  ('claims', 'claims', false, 20971520, array['image/webp', 'image/png', 'image/jpeg', 'image/heic', 'video/mp4', 'application/pdf']),
  ('documents', 'documents', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "product images public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');
create policy "product images admin write" on storage.objects for all to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

-- claims/{auth.uid()}/… — customer uploads photos to their own folder
create policy "claims own upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'claims' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "claims own read" on storage.objects for select to authenticated
  using (bucket_id = 'claims' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())));
create policy "claims admin all" on storage.objects for all to authenticated
  using (bucket_id = 'claims' and (select public.is_admin()))
  with check (bucket_id = 'claims' and (select public.is_admin()));

-- documents (invoice PDFs, confirmations) are served through signed URLs created server-side.
create policy "documents admin all" on storage.objects for all to authenticated
  using (bucket_id = 'documents' and (select public.is_admin()))
  with check (bucket_id = 'documents' and (select public.is_admin()));
