alter table public.order_assignees enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'order_assignees'
      and policyname = 'order_assignees_authenticated_select'
  ) then
    execute 'create policy order_assignees_authenticated_select
      on public.order_assignees
      for select
      to authenticated
      using (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'order_assignees'
      and policyname = 'order_assignees_authenticated_insert'
  ) then
    execute 'create policy order_assignees_authenticated_insert
      on public.order_assignees
      for insert
      to authenticated
      with check (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'order_assignees'
      and policyname = 'order_assignees_authenticated_update'
  ) then
    execute 'create policy order_assignees_authenticated_update
      on public.order_assignees
      for update
      to authenticated
      using (true)
      with check (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'order_assignees'
      and policyname = 'order_assignees_authenticated_delete'
  ) then
    execute 'create policy order_assignees_authenticated_delete
      on public.order_assignees
      for delete
      to authenticated
      using (true)';
  end if;
end $$;
