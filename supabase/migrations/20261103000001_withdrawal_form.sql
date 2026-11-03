-- Withdrawal (odstúpenie, § 20a zák. 108/2024): online form, portal link and manual entry by the admin.
-- Spec: docs/04 §4.3, docs/pravne/B-odstupenie.md §6.

-- Evidence of what was sent and from where (§ 20 ods. 15: the consumer bears the burden of proof, we keep
-- the record), plus a secret token for the customer's confirmation page (/odstupenie-od-zmluvy/potvrdenie).
alter table public.returns
  add column access_token uuid not null default gen_random_uuid() unique,
  add column notice_text text,
  add column ip_address text,
  add column user_agent text,
  add column created_by uuid references public.profiles (id) on delete set null;

-- Same reason as 20261102000001: a customer reading whole rows straight from the API would see admin_note.
-- Customer reads go through the server (src/lib/returns-server.ts) with safe columns only.
drop policy if exists "own returns read" on public.returns;

-- One transaction: lock the order, refuse items that are already withdrawn, number and insert. Called by
-- the server only (service role), after its own eligibility checks (consumer, deadline). Raises:
--   order_not_found, bad_items, already_withdrawn
-- p_items: null = the whole order, else [{"order_item_id": uuid, "quantity": int}].
create or replace function public.create_return(
  p_order_id uuid,
  p_name text,
  p_email text,
  p_items jsonb,
  p_reason text,
  p_channel text,
  p_notice_text text,
  p_submitted_at timestamptz,
  p_ip_address text default null,
  p_user_agent text default null,
  p_created_by uuid default null
)
returns public.returns
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid;
  v_row public.returns;
begin
  select profile_id into v_profile from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'order_not_found';
  end if;

  if p_items is not null and (
    jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) = 0
    or exists (
      select 1 from jsonb_array_elements(p_items) e
      where not exists (
        select 1 from public.order_items oi
        where oi.order_id = p_order_id
          and oi.id::text = e->>'order_item_id'
          and (e->>'quantity')::int between 1 and oi.quantity
      )
    )
  ) then
    raise exception 'bad_items';
  end if;

  if exists (
    select 1 from public.returns r
    where r.order_id = p_order_id
      and r.status <> 'rejected'
      and (
        r.items is null
        or p_items is null
        or exists (
          select 1
          from jsonb_array_elements(r.items) a, jsonb_array_elements(p_items) b
          where a->>'order_item_id' = b->>'order_item_id'
        )
      )
  ) then
    raise exception 'already_withdrawn';
  end if;

  insert into public.returns (
    return_number, order_id, profile_id, name, email, items, reason, channel, submitted_at,
    notice_text, ip_address, user_agent, created_by
  ) values (
    public.next_document_number('return', (p_submitted_at at time zone 'Europe/Bratislava')::date),
    p_order_id, v_profile, p_name, lower(p_email), p_items, nullif(p_reason, ''), p_channel, p_submitted_at,
    p_notice_text, p_ip_address, p_user_agent, p_created_by
  )
  returning * into v_row;

  return v_row;
end $$;

revoke execute on function public.create_return(uuid, text, text, jsonb, text, text, text, timestamptz, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.create_return(uuid, text, text, jsonb, text, text, text, timestamptz, text, text, uuid)
  to service_role;
