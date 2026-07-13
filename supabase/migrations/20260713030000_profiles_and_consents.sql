-- Reproducible profile creation and auditable legal/AI processing consent.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), 'Friend')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill accounts created before the trigger became a migration-owned object.
insert into public.profiles (id, name)
select
  u.id,
  coalesce(nullif(btrim(u.raw_user_meta_data ->> 'name'), ''), 'Friend')
from auth.users u
on conflict (id) do nothing;

-- Birthday powers the optional Personology reflection lens and age adaptation.
-- Store a date, not a free-form value, so age gates and profile restoration are deterministic.
alter table public.profiles
  add column if not exists birthday date;

create table if not exists public.user_consents (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  terms_version text not null,
  privacy_version text not null,
  terms_accepted_at timestamptz not null,
  privacy_accepted_at timestamptz not null,
  ai_processing_consent_at timestamptz not null,
  age_confirmed_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.user_consents enable row level security;
alter table public.user_consents force row level security;

drop policy if exists "user_consents_select_own" on public.user_consents;
drop policy if exists "user_consents_insert_own" on public.user_consents;
drop policy if exists "user_consents_update_own" on public.user_consents;
drop policy if exists "user_consents_delete_own" on public.user_consents;

create policy "user_consents_select_own"
  on public.user_consents for select
  using (auth.uid() = user_id);

create policy "user_consents_insert_own"
  on public.user_consents for insert
  with check (auth.uid() = user_id);

create policy "user_consents_update_own"
  on public.user_consents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_consents_delete_own"
  on public.user_consents for delete
  using (auth.uid() = user_id);

revoke all on table public.user_consents from anon, public;
grant select, insert, update, delete on table public.user_consents to authenticated;

-- Service-only erasure helper used by the authenticated delete-account Edge Function.
-- It discovers user-owned tables so new features cannot silently fall out of deletion coverage.
create or replace function public.delete_user_application_data(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target record;
  ownership_column text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Service role required' using errcode = '42501';
  end if;

  foreach ownership_column in array array[
    'user_id',
    'owner_id',
    'owner_user_id',
    'created_by',
    'created_by_user_id',
    'recipient_user_id',
    'sender_user_id',
    'recipient_id',
    'sender_id',
    'pilot_id',
    'member_user_id',
    'respondent_user_id'
  ]
  loop
    for target in
      select distinct c.table_name
      from information_schema.columns c
      where c.table_schema = 'public'
        and c.column_name = ownership_column
        and c.data_type = 'uuid'
        and c.table_name <> 'profiles'
    loop
      execute format(
        'delete from public.%I where %I = $1',
        target.table_name,
        ownership_column
      ) using p_user_id;
    end loop;
  end loop;

  delete from public.profiles where id = p_user_id;
end;
$$;

revoke all on function public.delete_user_application_data(uuid) from public, anon, authenticated;
grant execute on function public.delete_user_application_data(uuid) to service_role;

-- Service-only export helper used by the authenticated export-account Edge Function.
-- It automatically includes rows from current and future tables that use the ownership
-- conventions above, preventing a feature from silently falling out of data exports.
create or replace function public.export_user_application_data(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target record;
  ownership record;
  predicate text;
  table_rows jsonb;
  result jsonb := '{}'::jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Service role required' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb)
    into table_rows
  from public.profiles p
  where p.id = p_user_id;
  result := jsonb_set(result, array['profiles'], table_rows, true);

  for target in
    select distinct c.table_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name <> 'profiles'
      and c.data_type = 'uuid'
      and c.column_name = any(array[
        'user_id',
        'owner_id',
        'owner_user_id',
        'created_by',
        'created_by_user_id',
        'recipient_user_id',
        'sender_user_id',
        'recipient_id',
        'sender_id',
        'pilot_id',
        'member_user_id',
        'respondent_user_id'
      ])
    order by c.table_name
  loop
    predicate := '';
    for ownership in
      select c.column_name
      from information_schema.columns c
      where c.table_schema = 'public'
        and c.table_name = target.table_name
        and c.data_type = 'uuid'
        and c.column_name = any(array[
          'user_id',
          'owner_id',
          'owner_user_id',
          'created_by',
          'created_by_user_id',
          'recipient_user_id',
          'sender_user_id',
          'recipient_id',
          'sender_id',
          'pilot_id',
          'member_user_id',
          'respondent_user_id'
        ])
      order by c.column_name
    loop
      predicate := predicate
        || case when predicate = '' then '' else ' or ' end
        || format('t.%I = $1', ownership.column_name);
    end loop;

    execute format(
      'select coalesce(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) from public.%I t where %s',
      target.table_name,
      predicate
    ) into table_rows using p_user_id;

    if jsonb_array_length(table_rows) > 0 then
      result := jsonb_set(result, array[target.table_name], table_rows, true);
    end if;
  end loop;

  return result;
end;
$$;

revoke all on function public.export_user_application_data(uuid) from public, anon, authenticated;
grant execute on function public.export_user_application_data(uuid) to service_role;
