-- Royal Shop — functions & triggers

-- ───────────────────────────── Roles ─────────────────────────────
-- Role lives in profiles.role (never user_metadata, which users can edit themselves).

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
$$;

-- Create a profile row for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, email, first_name, last_name, phone, customer_type, company_name, ico, dic, ic_dph, marketing_consent, marketing_consent_at)
  values (
    new.id,
    new.email,
    meta ->> 'first_name',
    meta ->> 'last_name',
    meta ->> 'phone',
    case when meta ->> 'customer_type' = 'company' then 'company' else 'person' end,
    meta ->> 'company_name',
    meta ->> 'ico',
    meta ->> 'dic',
    meta ->> 'ic_dph',
    coalesce((meta ->> 'marketing_consent')::boolean, false),
    case when coalesce((meta ->> 'marketing_consent')::boolean, false) then now() end
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Customers may edit their profile but never their role.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null      -- service role / SQL editor bypass
     and not public.is_admin() then
    raise exception 'Not allowed to change role';
  end if;
  return new;
end $$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ───────────────────────────── Document numbering ─────────────────────────────
-- Gap-free per-year counters. Row lock serialises concurrent issuers.
--   invoice      → YYYYNNNNN      (202600001)
--   credit_note  → DYYYYNNNNN     (D202600001)  — confirm format with the accountant
--   order        → OBJ26-00001
--   claim        → RK26-0001
--   return       → OD26-0001

create or replace function public.next_document_number(p_kind text, p_date date default current_date)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year int := extract(year from p_date)::int;
  v_seq int;
begin
  if p_kind not in ('invoice', 'credit_note', 'order', 'claim', 'return') then
    raise exception 'Unknown document kind %', p_kind;
  end if;

  insert into public.document_counters (kind, year, last_seq)
  values (p_kind, v_year, 1)
  on conflict (kind, year) do update set last_seq = public.document_counters.last_seq + 1
  returning last_seq into v_seq;

  return case p_kind
    when 'invoice'     then v_year::text || lpad(v_seq::text, 5, '0')
    when 'credit_note' then 'D' || v_year::text || lpad(v_seq::text, 5, '0')
    when 'order'       then 'OBJ' || right(v_year::text, 2) || '-' || lpad(v_seq::text, 5, '0')
    when 'claim'       then 'RK' || right(v_year::text, 2) || '-' || lpad(v_seq::text, 4, '0')
    else                    'OD' || right(v_year::text, 2) || '-' || lpad(v_seq::text, 4, '0')
  end;
end $$;

revoke execute on function public.next_document_number(text, date) from public, anon, authenticated;
grant execute on function public.next_document_number(text, date) to service_role;

-- ───────────────────────────── Price history (Omnibus) ─────────────────────────────

create or replace function public.track_price_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.price_gross_cents is distinct from old.price_gross_cents then
    insert into public.price_history (product_id, price_gross_cents) values (new.id, new.price_gross_cents);
  end if;
  return new;
end $$;

create trigger products_price_history
  after insert or update of price_gross_cents on public.products
  for each row execute function public.track_price_history();

-- Lowest price that applied during the 30 days before the current price took effect.
-- Shown next to a discounted price (zákon 108/2024, § 14 / Omnibus).
create or replace function public.lowest_price_30d(p_product_id uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  with current_price as (
    select valid_from from public.price_history
    where product_id = p_product_id
    order by valid_from desc limit 1
  ),
  windowed as (
    select ph.price_gross_cents,
           ph.valid_from,
           lead(ph.valid_from) over (order by ph.valid_from) as valid_to
    from public.price_history ph
    where ph.product_id = p_product_id
  )
  select min(w.price_gross_cents)
  from windowed w, current_price c
  where w.valid_from < c.valid_from
    and coalesce(w.valid_to, c.valid_from) > c.valid_from - interval '30 days'
$$;

-- ───────────────────────────── Invoices ─────────────────────────────

-- Issued invoices are immutable (crm_core D-008); only the PDF/export bookkeeping may be filled in later.
create or replace function public.invoice_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status <> 'draft' then
      raise exception 'Issued invoice % cannot be deleted', old.invoice_number;
    end if;
    return old;
  end if;

  if old.status = 'issued' then
    if (to_jsonb(new) - array['pdf_path', 'pdf_sha256', 'exported_at', 'status'])
       is distinct from (to_jsonb(old) - array['pdf_path', 'pdf_sha256', 'exported_at', 'status'])
       or new.status not in ('issued', 'cancelled') then
      raise exception 'Issued invoice % is immutable', old.invoice_number;
    end if;
  end if;
  return new;
end $$;

create trigger invoices_guard
  before update or delete on public.invoices
  for each row execute function public.invoice_guard();

create or replace function public.invoice_lines_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_status text;
begin
  select status into v_status from public.invoices
  where id = coalesce(new.invoice_id, old.invoice_id);
  if v_status is distinct from 'draft' then
    raise exception 'Lines of an issued invoice cannot change';
  end if;
  return coalesce(new, old);
end $$;

create trigger invoice_lines_guard
  before insert or update or delete on public.invoice_lines
  for each row execute function public.invoice_lines_guard();

-- Assign number + dates and freeze the invoice. Totals are computed by the app (src/lib/money.ts)
-- with the same per-line rounding and passed in with the lines.
create or replace function public.issue_invoice(p_invoice_id uuid, p_issue_date date default current_date)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.invoices%rowtype;
  v_number text;
  v_due_days int;
begin
  select * into v_inv from public.invoices where id = p_invoice_id for update;
  if not found then raise exception 'Invoice not found'; end if;
  if v_inv.status <> 'draft' then raise exception 'Invoice already issued'; end if;

  select invoice_due_days into v_due_days from public.company_settings where id = 1;
  v_number := public.next_document_number(v_inv.type, p_issue_date);

  update public.invoices set
    invoice_number = v_number,
    variable_symbol = regexp_replace(v_number, '\D', '', 'g'),
    issue_date = p_issue_date,
    tax_point_date = coalesce(tax_point_date, p_issue_date),
    due_date = coalesce(due_date, p_issue_date + coalesce(v_due_days, 14)),
    issued_at = now(),
    status = 'issued'
  where id = p_invoice_id;

  return v_number;
end $$;

revoke execute on function public.issue_invoice(uuid, date) from public, anon, authenticated;
grant execute on function public.issue_invoice(uuid, date) to service_role;
