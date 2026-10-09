-- Royal Shop — core schema
-- Money is stored as integer cents (EUR). VAT rate is a percentage (23 = 23 %).
-- Order / invoice rows keep snapshots of names, prices and addresses so history never changes.

create extension if not exists unaccent with schema extensions;

-- Immutable wrapper so unaccent can be used in generated columns / indexes.
create or replace function public.f_unaccent(text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ───────────────────────────── Customers ─────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  customer_type text not null default 'person' check (customer_type in ('person', 'company')),
  first_name text,
  last_name text,
  email text not null,
  phone text,
  company_name text,
  ico text,
  dic text,
  ic_dph text,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('billing', 'shipping')),
  name text not null,
  street text not null,
  city text not null,
  zip text not null,
  country text not null default 'SK' check (country = 'SK'),
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index addresses_profile_idx on public.addresses (profile_id);

-- ───────────────────────────── Catalog ─────────────────────────────

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_path text,
  -- GPSR (EU 2023/988): manufacturer identification shown on product pages
  manufacturer_name text,
  manufacturer_address text,
  manufacturer_email text,
  website text,
  created_at timestamptz not null default now()
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  country text not null default 'SK',
  -- days until goods arrive at the Senec branch
  lead_time_days_min int not null default 2,
  lead_time_days_max int not null default 2,
  default_margin_pct numeric(5, 2),
  -- true when goods are brought into SK from another EU state (EPR producer duties)
  is_eu_import boolean not null default false,
  contact_email text,
  contact_phone text,
  note text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete restrict,
  slug text not null unique,
  name text not null,
  description text,
  image_path text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index categories_parent_idx on public.categories (parent_id);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand_id uuid references public.brands (id) on delete restrict,
  supplier_id uuid references public.suppliers (id) on delete restrict,
  category_id uuid references public.categories (id) on delete restrict,
  sku text,
  ean text,
  short_description text,
  description text,
  price_gross_cents int not null check (price_gross_cents >= 0),
  compare_at_price_cents int check (compare_at_price_cents is null or compare_at_price_cents > 0),
  vat_rate numeric(5, 2) not null default 23,
  weight_kg numeric(8, 2),
  shipping_class text not null default 'courier' check (shipping_class in ('courier', 'own_transport', 'pickup_only')),
  battery_platform text not null default 'none' check (battery_platform in ('LXT_18V', 'XGT_40V', 'CXT_12V', 'none')),
  is_kit boolean not null default false,
  warranty_months int not null default 24,
  manufacturer_warranty_note text,
  safety_info text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  is_featured boolean not null default false,
  rental_url text,
  seo_title text,
  seo_description text,
  search_vector tsvector generated always as (
    to_tsvector(
      'simple',
      public.f_unaccent(coalesce(name, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(ean, '') || ' ' || coalesce(short_description, ''))
    )
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_brand_idx on public.products (brand_id);
create index products_status_idx on public.products (status);
create index products_search_idx on public.products using gin (search_vector);

-- Purchase price lives in its own admin-only table so it can never leak through public product reads.
create table public.product_costs (
  product_id uuid primary key references public.products (id) on delete cascade,
  purchase_price_net_cents int not null check (purchase_price_net_cents >= 0),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  path text not null,
  alt text,
  sort_order int not null default 0
);
create index product_images_product_idx on public.product_images (product_id);

create table public.product_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  key text not null,
  label text not null,
  value text not null,
  unit text,
  is_filterable boolean not null default false,
  sort_order int not null default 0
);
create index product_specs_product_idx on public.product_specs (product_id);
create index product_specs_key_idx on public.product_specs (key, value);

create table public.product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  type text not null check (type in ('manual', 'safety', 'datasheet', 'other')),
  title text not null,
  path text not null
);

-- Feeds the Omnibus "lowest price in the last 30 days" shown next to discounts.
create table public.price_history (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products (id) on delete cascade,
  price_gross_cents int not null,
  valid_from timestamptz not null default now()
);
create index price_history_product_idx on public.price_history (product_id, valid_from desc);

create table public.related_products (
  product_id uuid not null references public.products (id) on delete cascade,
  related_id uuid not null references public.products (id) on delete cascade,
  type text not null default 'accessory' check (type in ('accessory', 'battery', 'alternative')),
  primary key (product_id, related_id)
);

-- ───────────────────────────── Settings ─────────────────────────────

create table public.company_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null,
  street text,
  city text,
  zip text,
  country text not null default 'Slovenská republika',
  ico text,
  dic text,
  ic_dph text,
  register_info text,
  iban text,
  swift text,
  email text,
  phone text,
  web text,
  is_vat_payer boolean not null default true,
  courier_price_cents int not null default 690,
  free_shipping_threshold_cents int not null default 200000,
  pickup_address text,
  pickup_hours text,
  -- days the test + repack step adds before dispatch
  handling_days int not null default 1,
  invoice_due_days int not null default 14,
  updated_at timestamptz not null default now()
);

create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  max_km int not null,
  price_cents int not null check (price_cents >= 0),
  sort_order int not null default 0
);

create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('terms_b2c', 'terms_b2b', 'complaints', 'privacy', 'cookies')),
  version text not null,
  content text not null,
  valid_from timestamptz not null default now(),
  unique (type, version)
);

-- Gap-free yearly counters (orders, invoices, credit notes, claims, returns).
create table public.document_counters (
  kind text not null,
  year int not null,
  last_seq int not null default 0,
  primary key (kind, year)
);

-- ───────────────────────────── Cart ─────────────────────────────

create table public.cart_items (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity int not null check (quantity between 1 and 99),
  updated_at timestamptz not null default now(),
  primary key (profile_id, product_id)
);

-- ───────────────────────────── Orders ─────────────────────────────

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  profile_id uuid references public.profiles (id) on delete set null,
  customer_type text not null check (customer_type in ('person', 'company')),
  email text not null,
  phone text,
  -- snapshots of who and where
  billing jsonb not null,
  shipping_address jsonb,
  company jsonb,
  shipping_method text not null check (shipping_method in ('courier', 'own_transport', 'pickup_senec')),
  shipping_zone_id uuid references public.shipping_zones (id),
  shipping_price_cents int not null default 0,
  subtotal_gross_cents int not null,
  total_net_cents int not null,
  total_vat_cents int not null,
  total_gross_cents int not null,
  status text not null default 'pending_payment' check (status in (
    'pending_payment', 'paid_authorized', 'confirmed', 'ordered_from_supplier',
    'received_at_branch', 'tested', 'shipped', 'out_for_delivery', 'ready_for_pickup',
    'delivered', 'completed', 'cancelled'
  )),
  payment_status text not null default 'unpaid' check (payment_status in (
    'unpaid', 'authorized', 'paid', 'partially_refunded', 'refunded', 'failed', 'cancelled'
  )),
  estimated_delivery_date date,
  delivered_at timestamptz,
  -- legal 14-day withdrawal window (consumers only), set when delivered
  withdrawal_deadline timestamptz,
  terms_version text,
  terms_accepted_at timestamptz,
  customer_note text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_profile_idx on public.orders (profile_id, created_at desc);
create index orders_status_idx on public.orders (status);
create index orders_email_idx on public.orders (lower(email));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name text not null,
  sku text,
  ean text,
  supplier_id uuid references public.suppliers (id),
  quantity int not null check (quantity > 0),
  unit_price_gross_cents int not null,
  vat_rate numeric(5, 2) not null,
  line_net_cents int not null,
  line_vat_cents int not null,
  line_gross_cents int not null,
  purchase_price_net_cents int,
  serial_number text
);
create index order_items_order_idx on public.order_items (order_id);

create table public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users (id),
  note text,
  created_at timestamptz not null default now()
);
create index order_status_history_order_idx on public.order_status_history (order_id, created_at);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null default 'stripe',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  amount_cents int not null,
  status text not null default 'pending' check (status in ('pending', 'authorized', 'captured', 'cancelled', 'failed', 'partially_refunded', 'refunded')),
  authorized_at timestamptz,
  authorization_expires_at timestamptz,
  captured_at timestamptz,
  refunded_cents int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on public.payments (order_id);

-- Stripe webhook idempotency
create table public.payment_events (
  stripe_event_id text primary key,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

create table public.supplier_orders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id),
  reference text,
  ordered_at timestamptz not null default now(),
  expected_at date,
  received_at timestamptz,
  purchase_total_net_cents int,
  note text
);
create index supplier_orders_order_idx on public.supplier_orders (order_id);

create table public.test_reports (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items (id) on delete cascade,
  tested_by uuid references auth.users (id),
  tested_at timestamptz not null default now(),
  serial_number text,
  result text not null check (result in ('ok', 'defect')),
  notes text,
  photo_paths text[] not null default '{}'
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  carrier text not null,
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz not null default now(),
  delivered_at timestamptz
);
create index shipments_order_idx on public.shipments (order_id);

-- ───────────────────────────── Invoices ─────────────────────────────
-- Modelled on crm_core (MDN TECH): number assigned at issue, snapshots, per-line rounding, immutable once issued.

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique,
  type text not null default 'invoice' check (type in ('invoice', 'credit_note')),
  status text not null default 'draft' check (status in ('draft', 'issued', 'cancelled')),
  order_id uuid references public.orders (id) on delete restrict,
  corrects_invoice_id uuid references public.invoices (id),
  profile_id uuid references public.profiles (id) on delete set null,
  issue_date date,
  tax_point_date date,
  due_date date,
  variable_symbol text,
  payment_method text not null default 'karta' check (payment_method in ('karta', 'prevod')),
  paid_at timestamptz,
  header_text text,
  note text,
  supplier_snapshot jsonb,
  customer_snapshot jsonb,
  total_net_cents int not null default 0,
  total_vat_cents int not null default 0,
  total_gross_cents int not null default 0,
  vat_recap jsonb not null default '[]',
  pdf_path text,
  pdf_sha256 text,
  issued_at timestamptz,
  exported_at timestamptz,
  created_at timestamptz not null default now()
);
create index invoices_order_idx on public.invoices (order_id);

create table public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  position int not null,
  code text,
  description text not null,
  quantity numeric(12, 3) not null,
  unit text not null default 'ks',
  unit_price_net_cents int not null,
  vat_rate numeric(5, 2) not null,
  line_net_cents int not null,
  line_vat_cents int not null,
  line_gross_cents int not null
);
create index invoice_lines_invoice_idx on public.invoice_lines (invoice_id, position);

-- ───────────────────────────── Withdrawals (§ 20a zák. 108/2024) ─────────────────────────────

create table public.returns (
  id uuid primary key default gen_random_uuid(),
  return_number text not null unique,
  order_id uuid not null references public.orders (id) on delete restrict,
  profile_id uuid references public.profiles (id) on delete set null,
  name text not null,
  email text not null,
  -- optional partial withdrawal: [{order_item_id, quantity}]
  items jsonb,
  reason text,
  iban text,
  channel text not null check (channel in ('portal', 'public_form', 'manual')),
  -- exact moment the consumer sent the withdrawal (legally relevant)
  submitted_at timestamptz not null default now(),
  status text not null default 'requested' check (status in (
    'requested', 'awaiting_goods', 'goods_received', 'inspected', 'refunded', 'refunded_partially', 'rejected'
  )),
  goods_received_at timestamptz,
  refund_cents int,
  refund_reason text,
  refunded_at timestamptz,
  -- 14 days to refund from the withdrawal notice (set by trigger)
  refund_deadline timestamptz,
  confirmation_sent_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index returns_order_idx on public.returns (order_id);

-- ───────────────────────────── Claims (reklamácie) ─────────────────────────────

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  claim_number text not null unique,
  order_id uuid not null references public.orders (id) on delete restrict,
  order_item_id uuid not null references public.order_items (id) on delete restrict,
  profile_id uuid references public.profiles (id) on delete set null,
  description text not null,
  requested_remedy text not null check (requested_remedy in ('repair', 'replacement')),
  delivery_method text not null check (delivery_method in ('courier_pickup', 'branch_dropoff', 'own_transport_pickup')),
  channel text not null default 'portal' check (channel in ('portal', 'manual')),
  submitted_at timestamptz not null default now(),
  -- statutory 30-day resolution limit
  deadline_at timestamptz,
  status text not null default 'submitted' check (status in (
    'submitted', 'confirmed', 'pickup_arranged', 'received', 'at_supplier',
    'resolved_repair', 'resolved_replacement', 'resolved_discount', 'resolved_refund', 'rejected'
  )),
  resolution_note text,
  resolved_at timestamptz,
  supplier_reference text,
  confirmation_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index claims_order_idx on public.claims (order_id);
create index claims_status_idx on public.claims (status);

create table public.claim_attachments (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims (id) on delete cascade,
  path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table public.claim_messages (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims (id) on delete cascade,
  author_id uuid references auth.users (id),
  is_staff boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);
create index claim_messages_claim_idx on public.claim_messages (claim_id, created_at);

-- ───────────────────────────── Logs ─────────────────────────────

create table public.notifications_log (
  id bigint generated always as identity primary key,
  channel text not null check (channel in ('email', 'whatsapp')),
  recipient text not null,
  template text not null,
  order_id uuid references public.orders (id) on delete set null,
  status text not null default 'sent',
  error text,
  created_at timestamptz not null default now()
);

create table public.activity_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id),
  entity text not null,
  entity_id uuid,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);
create index activity_log_entity_idx on public.activity_log (entity, entity_id);

-- ───────────────────────────── updated_at triggers ─────────────────────────────

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger addresses_updated_at before update on public.addresses for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger product_costs_updated_at before update on public.product_costs for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger returns_updated_at before update on public.returns for each row execute function public.set_updated_at();
create or replace function public.set_legal_deadlines()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name = 'returns' then
    new.refund_deadline = new.submitted_at + interval '14 days';
  elsif tg_table_name = 'claims' then
    new.deadline_at = new.submitted_at + interval '30 days';
  end if;
  return new;
end $$;

create trigger returns_deadline before insert or update of submitted_at on public.returns for each row execute function public.set_legal_deadlines();
create trigger claims_deadline before insert or update of submitted_at on public.claims for each row execute function public.set_legal_deadlines();
create trigger claims_updated_at before update on public.claims for each row execute function public.set_updated_at();
create trigger company_settings_updated_at before update on public.company_settings for each row execute function public.set_updated_at();
