-- Invoices go live (docs/07 §3): fixes in issue_invoice / invoice_guard before the first real document.
--   * cash in the shop is a payment method of its own (eKasa receipt references the invoice)
--   * a cancelled invoice is as frozen as an issued one (only PDF/export bookkeeping may change)
--   * DUZP = the day the payment was received (§ 19 ods. 4 zák. 222/2004: payment before delivery)
--   * a credit note carries the VS of the invoice it corrects, so "D202600001" no longer shares its VS
--     with invoice 202600001 of another customer
--   * issue refuses an invoice without lines or with totals that do not match its lines
--   * one live invoice per order: a double click cannot issue two

alter table public.invoices drop constraint if exists invoices_payment_method_check;
alter table public.invoices
  add constraint invoices_payment_method_check check (payment_method in ('karta', 'prevod', 'hotovost'));

create unique index if not exists invoices_one_per_order
  on public.invoices (order_id)
  where type = 'invoice' and status <> 'cancelled';

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

  if old.status in ('issued', 'cancelled') then
    if (to_jsonb(new) - array['pdf_path', 'pdf_sha256', 'exported_at', 'status'])
       is distinct from (to_jsonb(old) - array['pdf_path', 'pdf_sha256', 'exported_at', 'status']) then
      raise exception 'Issued invoice % is immutable', old.invoice_number;
    end if;
    -- issued -> cancelled is the only way out; cancelled stays cancelled
    if new.status is distinct from old.status and not (old.status = 'issued' and new.status = 'cancelled') then
      raise exception 'Invoice % cannot go from % to %', old.invoice_number, old.status, new.status;
    end if;
  end if;
  return new;
end $$;

create or replace function public.issue_invoice(p_invoice_id uuid, p_issue_date date default current_date)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.invoices%rowtype;
  v_number text;
  v_vs text;
  v_due_days int;
  v_lines int;
  v_net bigint;
  v_vat bigint;
  v_gross bigint;
begin
  select * into v_inv from public.invoices where id = p_invoice_id for update;
  if not found then raise exception 'Invoice not found'; end if;
  if v_inv.status <> 'draft' then raise exception 'Invoice already issued'; end if;

  select count(*), coalesce(sum(line_net_cents), 0), coalesce(sum(line_vat_cents), 0), coalesce(sum(line_gross_cents), 0)
    into v_lines, v_net, v_vat, v_gross
  from public.invoice_lines where invoice_id = p_invoice_id;
  if v_lines = 0 then raise exception 'Invoice has no lines'; end if;
  if v_net <> v_inv.total_net_cents or v_vat <> v_inv.total_vat_cents or v_gross <> v_inv.total_gross_cents
     or v_net + v_vat <> v_gross then
    raise exception 'Invoice totals do not match its lines';
  end if;

  if v_inv.type = 'credit_note' then
    if v_inv.corrects_invoice_id is null then raise exception 'Credit note must correct an invoice'; end if;
    select variable_symbol into v_vs from public.invoices
    where id = v_inv.corrects_invoice_id and status = 'issued';
    if v_vs is null then raise exception 'Corrected invoice is not issued'; end if;
  end if;

  select invoice_due_days into v_due_days from public.company_settings where id = 1;
  v_number := public.next_document_number(v_inv.type, p_issue_date);

  update public.invoices set
    invoice_number = v_number,
    variable_symbol = coalesce(v_vs, regexp_replace(v_number, '\D', '', 'g')),
    issue_date = p_issue_date,
    -- DUZP: the payment day when the invoice was paid before issue, else the issue day
    tax_point_date = coalesce(tax_point_date, (paid_at at time zone 'Europe/Bratislava')::date, p_issue_date),
    due_date = coalesce(due_date, p_issue_date + coalesce(v_due_days, 14)),
    issued_at = now(),
    status = 'issued'
  where id = p_invoice_id;

  return v_number;
end $$;

revoke execute on function public.issue_invoice(uuid, date) from public, anon, authenticated;
grant execute on function public.issue_invoice(uuid, date) to service_role;
