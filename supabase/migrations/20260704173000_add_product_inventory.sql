create table if not exists public.suppliers (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  email text,
  address text,
  website text,
  notes text,
  status text not null default 'active',
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

create index if not exists suppliers_status_name_idx
  on public.suppliers (status, name);

alter table public.suppliers enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'suppliers'
      and policyname = 'suppliers_authenticated_select'
  ) then
    execute 'create policy suppliers_authenticated_select
      on public.suppliers
      for select
      to authenticated
      using (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'suppliers'
      and policyname = 'suppliers_authenticated_insert'
  ) then
    execute 'create policy suppliers_authenticated_insert
      on public.suppliers
      for insert
      to authenticated
      with check (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'suppliers'
      and policyname = 'suppliers_authenticated_update'
  ) then
    execute 'create policy suppliers_authenticated_update
      on public.suppliers
      for update
      to authenticated
      using (true)
      with check (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'suppliers'
      and policyname = 'suppliers_authenticated_delete'
  ) then
    execute 'create policy suppliers_authenticated_delete
      on public.suppliers
      for delete
      to authenticated
      using (true)';
  end if;
end $$;

alter table public.products
  add column if not exists stock_quantity integer not null default 0,
  add column if not exists minimum_stock_alert integer,
  add column if not exists purchase_price numeric(12,2) not null default 0,
  add column if not exists profit_margin numeric(7,2) not null default 0,
  add column if not exists selling_price numeric(12,2) not null default 0,
  add column if not exists discounted_price numeric(12,2) not null default 0,
  add column if not exists supplier_reference text,
  add column if not exists sku text,
  add column if not exists barcode text,
  add column if not exists warranty_months integer,
  add column if not exists purchase_date date;

do $$
declare
  supplier_id_type text;
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'supplier_id'
  ) then
    select data_type
    into supplier_id_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'suppliers'
      and column_name = 'id';

    if supplier_id_type = 'uuid' then
      alter table public.products add column supplier_id uuid;
    else
      alter table public.products add column supplier_id bigint;
    end if;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'stock'
  ) then
    execute '
      update public.products
      set stock_quantity = stock
      where stock_quantity = 0
        and stock is not null
        and stock >= 0
    ';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_stock_quantity_non_negative'
  ) then
    alter table public.products
      add constraint products_stock_quantity_non_negative
      check (stock_quantity >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_minimum_stock_alert_non_negative'
  ) then
    alter table public.products
      add constraint products_minimum_stock_alert_non_negative
      check (minimum_stock_alert is null or minimum_stock_alert >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_purchase_price_non_negative'
  ) then
    alter table public.products
      add constraint products_purchase_price_non_negative
      check (purchase_price >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_profit_margin_non_negative'
  ) then
    alter table public.products
      add constraint products_profit_margin_non_negative
      check (profit_margin >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_selling_price_non_negative'
  ) then
    alter table public.products
      add constraint products_selling_price_non_negative
      check (selling_price >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_discounted_price_non_negative'
  ) then
    alter table public.products
      add constraint products_discounted_price_non_negative
      check (discounted_price >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_warranty_months_non_negative'
  ) then
    alter table public.products
      add constraint products_warranty_months_non_negative
      check (warranty_months is null or warranty_months >= 0);
  end if;
end $$;

create table if not exists public.product_stock_history (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  old_quantity integer not null,
  new_quantity integer not null,
  changed_by text,
  reason text,
  created_at timestamp without time zone default now()
);

create index if not exists product_stock_history_product_id_created_at_idx
  on public.product_stock_history (product_id, created_at desc);

alter table public.product_stock_history enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'product_stock_history'
      and policyname = 'product_stock_history_authenticated_select'
  ) then
    execute 'create policy product_stock_history_authenticated_select
      on public.product_stock_history
      for select
      to authenticated
      using (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'product_stock_history'
      and policyname = 'product_stock_history_authenticated_insert'
  ) then
    execute 'create policy product_stock_history_authenticated_insert
      on public.product_stock_history
      for insert
      to authenticated
      with check (true)';
  end if;
end $$;
