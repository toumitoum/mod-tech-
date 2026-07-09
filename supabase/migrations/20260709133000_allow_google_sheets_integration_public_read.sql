do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'integrations'
      and policyname = 'integrations_anon_google_sheets_select'
  ) then
    execute 'create policy integrations_anon_google_sheets_select
      on public.integrations
      for select
      to anon
      using (
        service = ''google_sheets''
        and enabled = true
        and endpoint is not null
      )';
  end if;
end $$;
