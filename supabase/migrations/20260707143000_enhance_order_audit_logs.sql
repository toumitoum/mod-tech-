alter table public.audit_logs
  add column if not exists details jsonb;

create or replace function public.audit_order_status_label(p_status text)
returns text
language sql
stable
as $$
  select case p_status
    when 'new' then 'Nouveau'
    when 'confirmed' then 'Confirmé'
    when 'shipped' then 'Expédié'
    when 'delivered' then 'Livré'
    when 'cancelled' then 'Annulée'
    else coalesce(p_status, '-')
  end;
$$;

create or replace function public.audit_order_assignee_label(p_assigned_to text)
returns text
language sql
stable
as $$
  select coalesce(
    (
      select order_assignees.name
      from public.order_assignees
      where p_assigned_to is not null
        and (
          lower(order_assignees.id::text) = lower(p_assigned_to)
          or lower(order_assignees.name) = lower(p_assigned_to)
          or lower(coalesce(order_assignees.email, '')) = lower(p_assigned_to)
        )
      limit 1
    ),
    nullif(p_assigned_to, ''),
    'Non assignée'
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
  p_description text,
  p_details jsonb
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
    description,
    details
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
    p_description,
    p_details
  );
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
  operation_label text;
  description_text text;
  order_name text;
  order_id_text text;
  customer_name text;
  customer_phone text;
  previous_assignee text;
  current_assignee text;
  previous_status text;
  current_status text;
  previous_status_label text;
  current_status_label text;
  order_note text;
  details_data jsonb;
begin
  if tg_op = 'DELETE' then
    order_id_text := old.id::text;
    order_name := coalesce(old.customer_name, 'Commande #' || old.id::text);
    customer_name := old.customer_name;
    customer_phone := old.customer_phone;
    previous_assignee := public.audit_order_assignee_label(old.assigned_to);
    current_assignee := 'Non assignée';
    previous_status := old.status;
    current_status := null;
    previous_status_label := public.audit_order_status_label(old.status);
    current_status_label := '-';
    order_note := old.notes;
    action_name := 'order_delete';
    operation_name := 'delete';
    operation_label := 'Suppression commande';
    description_text := 'Commande #' || order_id_text || ' supprimée pour ' || coalesce(customer_name, '-');
    details_data := jsonb_build_object(
      'orderNumber', order_id_text,
      'customerName', customer_name,
      'customerPhone', customer_phone,
      'previousAssignee', previous_assignee,
      'currentAssignee', current_assignee,
      'previousStatus', previous_status,
      'currentStatus', current_status,
      'previousStatusLabel', previous_status_label,
      'currentStatusLabel', current_status_label,
      'performedBy', public.audit_actor_email(),
      'operationLabel', operation_label,
      'note', order_note,
      'fullDescription', description_text
    );
    perform public.write_audit_log(action_name, operation_name, 'orders', order_name, order_id_text, to_jsonb(old), null, description_text, details_data);
    return old;
  end if;

  order_id_text := new.id::text;
  order_name := coalesce(new.customer_name, 'Commande #' || new.id::text);
  customer_name := new.customer_name;
  customer_phone := new.customer_phone;
  current_assignee := public.audit_order_assignee_label(new.assigned_to);
  current_status := new.status;
  current_status_label := public.audit_order_status_label(new.status);
  order_note := new.notes;

  if tg_op = 'INSERT' then
    previous_assignee := 'Non assignée';
    previous_status := null;
    previous_status_label := '-';
    action_name := 'order_create';
    operation_name := 'create';
    operation_label := 'Création commande';
    description_text := 'Commande #' || order_id_text || ' créée pour ' || coalesce(customer_name, '-') || ' (' || coalesce(customer_phone, '-') || ')';
    details_data := jsonb_build_object(
      'orderNumber', order_id_text,
      'customerName', customer_name,
      'customerPhone', customer_phone,
      'previousAssignee', previous_assignee,
      'currentAssignee', current_assignee,
      'previousStatus', previous_status,
      'currentStatus', current_status,
      'previousStatusLabel', previous_status_label,
      'currentStatusLabel', current_status_label,
      'performedBy', public.audit_actor_email(),
      'operationLabel', operation_label,
      'note', order_note,
      'fullDescription', description_text
    );
    perform public.write_audit_log(action_name, operation_name, 'orders', order_name, order_id_text, null, to_jsonb(new), description_text, details_data);
    return new;
  end if;

  previous_assignee := public.audit_order_assignee_label(old.assigned_to);
  previous_status := old.status;
  previous_status_label := public.audit_order_status_label(old.status);

  if old.status is distinct from new.status then
    action_name := case new.status
      when 'confirmed' then 'order_confirm'
      when 'delivered' then 'order_deliver'
      when 'cancelled' then 'order_cancel'
      else 'order_status_change'
    end;
    operation_name := 'update';
    operation_label := case new.status
      when 'confirmed' then 'Confirmation commande'
      when 'delivered' then 'Livraison commande'
      when 'cancelled' then 'Annulation commande'
      else 'Changement statut'
    end;
    description_text := 'Commande #' || order_id_text || ': statut changé de ' || previous_status_label || ' à ' || current_status_label;
  elsif old.assigned_to is distinct from new.assigned_to then
    action_name := case when old.assigned_to is null and new.assigned_to is not null then 'order_assign' else 'order_assignee_change' end;
    operation_name := 'update';
    operation_label := case when old.assigned_to is null and new.assigned_to is not null then 'Assignation commande' else 'Changement responsable' end;
    description_text := case
      when old.assigned_to is null and new.assigned_to is not null
        then 'Commande #' || order_id_text || ' assignée à ' || current_assignee
      else 'Commande #' || order_id_text || ': suivi transféré de ' || previous_assignee || ' à ' || current_assignee
    end;
  else
    action_name := 'order_update';
    operation_name := 'update';
    operation_label := 'Modification commande';
    description_text := 'Commande #' || order_id_text || ' modifiée pour ' || coalesce(customer_name, '-');
  end if;

  details_data := jsonb_build_object(
    'orderNumber', order_id_text,
    'customerName', customer_name,
    'customerPhone', customer_phone,
    'previousAssignee', previous_assignee,
    'currentAssignee', current_assignee,
    'previousStatus', previous_status,
    'currentStatus', current_status,
    'previousStatusLabel', previous_status_label,
    'currentStatusLabel', current_status_label,
    'performedBy', public.audit_actor_email(),
    'operationLabel', operation_label,
    'note', order_note,
    'fullDescription', description_text
  );

  perform public.write_audit_log(action_name, operation_name, 'orders', order_name, order_id_text, to_jsonb(old), to_jsonb(new), description_text, details_data);
  return new;
end;
$$;
