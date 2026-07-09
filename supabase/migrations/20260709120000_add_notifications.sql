create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  title text not null,
  message text not null,
  type text not null,
  module text not null,
  entity_id text,
  entity_type text,
  created_by text,
  is_read boolean not null default false,
  created_at timestamp without time zone default now()
);

create index if not exists notifications_created_at_idx
  on public.notifications (created_at desc);

create index if not exists notifications_is_read_created_at_idx
  on public.notifications (is_read, created_at desc);

create index if not exists notifications_type_created_at_idx
  on public.notifications (type, created_at desc);

create index if not exists notifications_module_created_at_idx
  on public.notifications (module, created_at desc);

alter table public.notifications enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_authenticated_select'
  ) then
    execute 'create policy notifications_authenticated_select
      on public.notifications
      for select
      to authenticated
      using (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_authenticated_insert'
  ) then
    execute 'create policy notifications_authenticated_insert
      on public.notifications
      for insert
      to authenticated
      with check (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_authenticated_update'
  ) then
    execute 'create policy notifications_authenticated_update
      on public.notifications
      for update
      to authenticated
      using (true)
      with check (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_authenticated_delete'
  ) then
    execute 'create policy notifications_authenticated_delete
      on public.notifications
      for delete
      to authenticated
      using (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_anon_order_insert'
  ) then
    execute 'create policy notifications_anon_order_insert
      on public.notifications
      for insert
      to anon
      with check (
        module = ''orders''
        and type = ''order_created''
        and is_read = false
      )';
  end if;
end $$;
