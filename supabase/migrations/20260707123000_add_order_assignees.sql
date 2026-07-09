create table if not exists public.order_assignees (
  id bigint generated always as identity primary key,
  name text not null,
  email text,
  is_active boolean not null default true,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

alter table public.order_assignees
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamp without time zone default now(),
  add column if not exists updated_at timestamp without time zone default now();

create unique index if not exists order_assignees_email_unique_idx
  on public.order_assignees (lower(email))
  where email is not null;

create index if not exists order_assignees_active_name_idx
  on public.order_assignees (is_active, name);

insert into public.order_assignees (name, email, is_active)
select
  initcap(regexp_replace(split_part(admin_users.email, '@', 1), '[._-]+', ' ', 'g')),
  admin_users.email,
  true
from public.admin_users
where admin_users.email is not null
  and not exists (
    select 1
    from public.order_assignees
    where lower(order_assignees.email) = lower(admin_users.email)
  );

insert into public.order_assignees (name, email, is_active)
select distinct
  initcap(regexp_replace(split_part(orders.assigned_to, '@', 1), '[._-]+', ' ', 'g')),
  case when position('@' in orders.assigned_to) > 1 then orders.assigned_to else null end,
  true
from public.orders
where orders.assigned_to is not null
  and orders.assigned_to <> ''
  and not exists (
    select 1
    from public.order_assignees
    where lower(coalesce(order_assignees.email, order_assignees.name, order_assignees.id::text)) = lower(orders.assigned_to)
  );
