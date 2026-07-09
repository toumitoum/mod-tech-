create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid,
  user_email text,
  action text not null,
  operation_type text not null,
  section text not null,
  item_name text,
  item_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  description text,
  created_at timestamp without time zone default now()
);

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

create index if not exists audit_logs_section_created_at_idx
  on public.audit_logs (section, created_at desc);

create index if not exists audit_logs_action_created_at_idx
  on public.audit_logs (action, created_at desc);

create index if not exists audit_logs_user_email_created_at_idx
  on public.audit_logs (user_email, created_at desc);

alter table public.audit_logs enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_logs'
      and policyname = 'audit_logs_authenticated_select'
  ) then
    execute 'create policy audit_logs_authenticated_select
      on public.audit_logs
      for select
      to authenticated
      using (true)';
  end if;
end $$;

create or replace function public.audit_actor_email()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'email', ''),
    nullif(auth.jwt() -> 'user_metadata' ->> 'email', ''),
    case when auth.uid() is not null then auth.uid()::text else null end,
    'system'
  );
$$;

create or replace function public.write_audit_log(
  p_action text,
  p_operation_type text,
  p_section text,
  p_item_name text,
  p_item_id text,
  p_old_data jsonb,
  p_new_data jsonb,
  p_description text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.audit_logs (
    user_id,
    user_email,
    action,
    operation_type,
    section,
    item_name,
    item_id,
    old_data,
    new_data,
    ip_address,
    description
  )
  values (
    auth.uid(),
    public.audit_actor_email(),
    p_action,
    p_operation_type,
    p_section,
    p_item_name,
    p_item_id,
    p_old_data,
    p_new_data,
    null,
    p_description
  );
end;
$$;

create or replace function public.audit_products_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  action_name text;
  operation_name text;
  description_text text;
begin
  if tg_op = 'INSERT' then
    action_name := 'product_create';
    operation_name := 'create';
    description_text := 'Produit ajouté: ' || coalesce(new.name, new.id::text);
    perform public.write_audit_log(action_name, operation_name, 'products', new.name, new.id::text, null, to_jsonb(new), description_text);
    return new;
  elsif tg_op = 'DELETE' then
    action_name := 'product_delete';
    operation_name := 'delete';
    description_text := 'Produit supprimé: ' || coalesce(old.name, old.id::text);
    perform public.write_audit_log(action_name, operation_name, 'products', old.name, old.id::text, to_jsonb(old), null, description_text);
    return old;
  end if;

  if old.is_active is distinct from new.is_active then
    action_name := 'product_toggle';
    operation_name := 'update';
    description_text := case when new.is_active then 'Produit activé: ' else 'Produit désactivé: ' end || coalesce(new.name, new.id::text);
  elsif old.price is distinct from new.price
    or old.original_price is distinct from new.original_price
    or old.discount_percent is distinct from new.discount_percent
    or old.purchase_price is distinct from new.purchase_price
    or old.profit_margin is distinct from new.profit_margin
    or old.selling_price is distinct from new.selling_price
    or old.discounted_price is distinct from new.discounted_price then
    action_name := 'product_price_change';
    operation_name := 'update';
    description_text := 'Prix produit modifié: ' || coalesce(new.name, new.id::text);
  elsif old.stock_quantity is distinct from new.stock_quantity
    or old.in_stock is distinct from new.in_stock
    or old.minimum_stock_alert is distinct from new.minimum_stock_alert then
    action_name := 'product_stock_change';
    operation_name := 'update';
    description_text := 'Stock produit modifié: ' || coalesce(new.name, new.id::text);
  else
    action_name := 'product_update';
    operation_name := 'update';
    description_text := 'Produit modifié: ' || coalesce(new.name, new.id::text);
  end if;

  perform public.write_audit_log(action_name, operation_name, 'products', new.name, new.id::text, to_jsonb(old), to_jsonb(new), description_text);
  return new;
end;
$$;

create or replace function public.audit_orders_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  action_name text;
  operation_name text;
  description_text text;
  order_name text;
begin
  if tg_op = 'INSERT' then
    action_name := 'order_create';
    operation_name := 'create';
    order_name := coalesce(new.customer_name, 'Commande #' || new.id::text);
    description_text := 'Commande créée: ' || order_name;
    perform public.write_audit_log(action_name, operation_name, 'orders', order_name, new.id::text, null, to_jsonb(new), description_text);
    return new;
  elsif tg_op = 'DELETE' then
    action_name := 'order_delete';
    operation_name := 'delete';
    order_name := coalesce(old.customer_name, 'Commande #' || old.id::text);
    description_text := 'Commande supprimée: ' || order_name;
    perform public.write_audit_log(action_name, operation_name, 'orders', order_name, old.id::text, to_jsonb(old), null, description_text);
    return old;
  end if;

  order_name := coalesce(new.customer_name, 'Commande #' || new.id::text);

  if old.status is distinct from new.status then
    action_name := case new.status
      when 'confirmed' then 'order_confirm'
      when 'delivered' then 'order_deliver'
      when 'cancelled' then 'order_cancel'
      else 'order_status_change'
    end;
    operation_name := 'update';
    description_text := 'Statut commande changé: ' || coalesce(old.status, '-') || ' -> ' || coalesce(new.status, '-');
  elsif old.assigned_to is distinct from new.assigned_to then
    action_name := case when old.assigned_to is null and new.assigned_to is not null then 'order_assign' else 'order_assignee_change' end;
    operation_name := 'update';
    description_text := 'Responsable commande changé: ' || coalesce(old.assigned_to, 'Non assignée') || ' -> ' || coalesce(new.assigned_to, 'Non assignée');
  else
    action_name := 'order_update';
    operation_name := 'update';
    description_text := 'Commande modifiée: ' || order_name;
  end if;

  perform public.write_audit_log(action_name, operation_name, 'orders', order_name, new.id::text, to_jsonb(old), to_jsonb(new), description_text);
  return new;
end;
$$;

create or replace function public.audit_suppliers_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  action_name text;
  operation_name text;
  description_text text;
begin
  if tg_op = 'INSERT' then
    action_name := 'supplier_create';
    operation_name := 'create';
    description_text := 'Fournisseur ajouté: ' || coalesce(new.name, new.id::text);
    perform public.write_audit_log(action_name, operation_name, 'suppliers', new.name, new.id::text, null, to_jsonb(new), description_text);
    return new;
  elsif tg_op = 'DELETE' then
    action_name := 'supplier_delete';
    operation_name := 'delete';
    description_text := 'Fournisseur supprimé: ' || coalesce(old.name, old.id::text);
    perform public.write_audit_log(action_name, operation_name, 'suppliers', old.name, old.id::text, to_jsonb(old), null, description_text);
    return old;
  end if;

  if old.status is distinct from new.status then
    action_name := 'supplier_toggle';
    description_text := 'Statut fournisseur changé: ' || coalesce(old.status, '-') || ' -> ' || coalesce(new.status, '-');
  else
    action_name := 'supplier_update';
    description_text := 'Fournisseur modifié: ' || coalesce(new.name, new.id::text);
  end if;

  operation_name := 'update';
  perform public.write_audit_log(action_name, operation_name, 'suppliers', new.name, new.id::text, to_jsonb(old), to_jsonb(new), description_text);
  return new;
end;
$$;

create or replace function public.audit_admin_users_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  action_name text;
  operation_name text;
  description_text text;
begin
  if tg_op = 'INSERT' then
    action_name := 'admin_create';
    operation_name := 'create';
    description_text := 'Administrateur ajouté: ' || coalesce(new.email, new.id::text);
    perform public.write_audit_log(action_name, operation_name, 'users', new.email, new.id::text, null, to_jsonb(new), description_text);
    return new;
  elsif tg_op = 'DELETE' then
    action_name := 'admin_delete';
    operation_name := 'delete';
    description_text := 'Administrateur supprimé: ' || coalesce(old.email, old.id::text);
    perform public.write_audit_log(action_name, operation_name, 'users', old.email, old.id::text, to_jsonb(old), null, description_text);
    return old;
  end if;

  action_name := 'admin_update';
  operation_name := 'update';
  description_text := 'Administrateur modifié: ' || coalesce(new.email, new.id::text);
  perform public.write_audit_log(action_name, operation_name, 'users', new.email, new.id::text, to_jsonb(old), to_jsonb(new), description_text);
  return new;
end;
$$;

create or replace function public.audit_order_assignees_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  action_name text;
  operation_name text;
  description_text text;
begin
  if tg_op = 'INSERT' then
    action_name := 'assignee_create';
    operation_name := 'create';
    description_text := 'Responsable ajouté: ' || coalesce(new.name, new.id::text);
    perform public.write_audit_log(action_name, operation_name, 'users', new.name, new.id::text, null, to_jsonb(new), description_text);
    return new;
  elsif tg_op = 'DELETE' then
    action_name := 'assignee_delete';
    operation_name := 'delete';
    description_text := 'Responsable supprimé: ' || coalesce(old.name, old.id::text);
    perform public.write_audit_log(action_name, operation_name, 'users', old.name, old.id::text, to_jsonb(old), null, description_text);
    return old;
  end if;

  if old.is_active is distinct from new.is_active then
    action_name := 'assignee_toggle';
    description_text := case when new.is_active then 'Responsable activé: ' else 'Responsable désactivé: ' end || coalesce(new.name, new.id::text);
  else
    action_name := 'assignee_update';
    description_text := 'Responsable modifié: ' || coalesce(new.name, new.id::text);
  end if;

  operation_name := 'update';
  perform public.write_audit_log(action_name, operation_name, 'users', new.name, new.id::text, to_jsonb(old), to_jsonb(new), description_text);
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'products_audit_log_trigger') then
    create trigger products_audit_log_trigger
      after insert or update or delete on public.products
      for each row execute function public.audit_products_trigger();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'orders_audit_log_trigger') then
    create trigger orders_audit_log_trigger
      after insert or update or delete on public.orders
      for each row execute function public.audit_orders_trigger();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'suppliers_audit_log_trigger') then
    create trigger suppliers_audit_log_trigger
      after insert or update or delete on public.suppliers
      for each row execute function public.audit_suppliers_trigger();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'admin_users_audit_log_trigger') then
    create trigger admin_users_audit_log_trigger
      after insert or update or delete on public.admin_users
      for each row execute function public.audit_admin_users_trigger();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'order_assignees_audit_log_trigger') then
    create trigger order_assignees_audit_log_trigger
      after insert or update or delete on public.order_assignees
      for each row execute function public.audit_order_assignees_trigger();
  end if;
end $$;
