create table if not exists public.queue_jobs (
  id bigint generated always as identity primary key,
  job_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'Pending',
  retries integer not null default 0,
  max_retries integer not null default 3,
  error_message text,
  created_by text,
  scheduled_at timestamp without time zone default now(),
  started_at timestamp without time zone,
  completed_at timestamp without time zone,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

create index if not exists queue_jobs_status_scheduled_at_idx
  on public.queue_jobs (status, scheduled_at, created_at);

create index if not exists queue_jobs_job_type_created_at_idx
  on public.queue_jobs (job_type, created_at desc);

create index if not exists queue_jobs_created_at_idx
  on public.queue_jobs (created_at desc);

alter table public.queue_jobs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'queue_jobs'
      and policyname = 'queue_jobs_authenticated_select'
  ) then
    execute 'create policy queue_jobs_authenticated_select
      on public.queue_jobs
      for select
      to authenticated
      using (true)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'queue_jobs'
      and policyname = 'queue_jobs_authenticated_insert'
  ) then
    execute 'create policy queue_jobs_authenticated_insert
      on public.queue_jobs
      for insert
      to authenticated
      with check (true)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'queue_jobs'
      and policyname = 'queue_jobs_authenticated_update'
  ) then
    execute 'create policy queue_jobs_authenticated_update
      on public.queue_jobs
      for update
      to authenticated
      using (true)
      with check (true)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'queue_jobs'
      and policyname = 'queue_jobs_authenticated_delete'
  ) then
    execute 'create policy queue_jobs_authenticated_delete
      on public.queue_jobs
      for delete
      to authenticated
      using (true)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'queue_jobs'
      and policyname = 'queue_jobs_anon_order_side_effect_insert'
  ) then
    execute 'create policy queue_jobs_anon_order_side_effect_insert
      on public.queue_jobs
      for insert
      to anon
      with check (
        job_type in (''EMAIL'', ''GOOGLE_SHEETS'', ''NOTIFICATION'')
        and status = ''Pending''
        and retries = 0
        and max_retries between 1 and 5
      )';
  end if;
end $$;
