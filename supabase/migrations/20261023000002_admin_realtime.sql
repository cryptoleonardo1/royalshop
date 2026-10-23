-- Admin console (docs/07-admin-konzola-plan.md): new and paid orders appear live. Realtime respects RLS,
-- so only admins (policy "admin all", is_admin()) receive order rows. Idempotent.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
     ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;
