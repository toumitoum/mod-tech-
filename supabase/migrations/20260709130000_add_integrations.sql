create table if not exists public.integrations (
  id bigint generated always as identity primary key,
  service text not null unique,
  endpoint text,
  enabled boolean not null default false,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

create index if not exists integrations_service_idx
  on public.integrations (service);

alter table public.integrations enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'integrations'
      and policyname = 'integrations_authenticated_select'
  ) then
    execute 'create policy integrations_authenticated_select
      on public.integrations
      for select
      to authenticated
      using (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'integrations'
      and policyname = 'integrations_authenticated_insert'
  ) then
    execute 'create policy integrations_authenticated_insert
      on public.integrations
      for insert
      to authenticated
      with check (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'integrations'
      and policyname = 'integrations_authenticated_update'
  ) then
    execute 'create policy integrations_authenticated_update
      on public.integrations
      for update
      to authenticated
      using (true)
      with check (true)';
  end if;
end $$;
