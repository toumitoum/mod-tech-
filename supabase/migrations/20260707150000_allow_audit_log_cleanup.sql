do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_logs'
      and policyname = 'audit_logs_authenticated_delete'
  ) then
    execute 'create policy audit_logs_authenticated_delete
      on public.audit_logs
      for delete
      to authenticated
      using (true)';
  end if;
end $$;
