alter table public.orders
  add column if not exists assigned_to text,
  add column if not exists assigned_at timestamp without time zone;

create index if not exists orders_assigned_to_created_at_idx
  on public.orders (assigned_to, created_at desc);
