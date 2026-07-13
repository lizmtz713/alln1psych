-- Resolve PL/pgSQL ambiguity between the function's `user_id` output column
-- and table columns referenced by ON CONFLICT. This is a forward-only hotfix
-- for the already-deployed atomic check-in RPC.
create or replace function public.create_cockpit_checkin(
  p_client_event_id uuid,
  p_mood text,
  p_mood_label text,
  p_note text default null,
  p_gauges jsonb default '{}'::jsonb,
  p_context jsonb default '{}'::jsonb,
  p_system_impact text[] default '{}'::text[],
  p_drivers text[] default '{}'::text[],
  p_created_at timestamptz default now()
)
returns table (
  id uuid,
  user_id uuid,
  mood text,
  mood_label text,
  note text,
  created_at timestamptz,
  client_event_id uuid
)
language plpgsql
security invoker
set search_path = public
as $$
#variable_conflict use_column
declare
  v_user_id uuid := auth.uid();
  v_checkin public.mood_checkins%rowtype;
  v_inserted boolean := false;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_client_event_id is null then
    raise exception 'client_event_id is required' using errcode = '22023';
  end if;

  if p_mood not in ('green', 'yellow', 'orange', 'red') then
    raise exception 'Invalid mood' using errcode = '22023';
  end if;

  if nullif(btrim(p_mood_label), '') is null then
    raise exception 'mood_label is required' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_gauges, '{}'::jsonb)) <> 'object' then
    raise exception 'gauges must be a JSON object' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_context, '{}'::jsonb)) <> 'object' then
    raise exception 'context must be a JSON object' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_each_text(coalesce(p_gauges, '{}'::jsonb)) g
    where g.key not in ('body', 'state', 'emotion', 'connection', 'direction', 'alignment')
       or g.value !~ '^[0-9]+([.][0-9]+)?$'
  ) then
    raise exception 'Invalid gauge payload' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_each_text(coalesce(p_gauges, '{}'::jsonb)) g
    where g.value::numeric < 0 or g.value::numeric > 100
  ) then
    raise exception 'Gauge scores must be between 0 and 100' using errcode = '22023';
  end if;

  insert into public.mood_checkins (
    user_id,
    mood,
    mood_label,
    note,
    created_at,
    client_event_id,
    checkin_context,
    system_impact,
    drivers
  )
  values (
    v_user_id,
    p_mood,
    btrim(p_mood_label),
    nullif(btrim(p_note), ''),
    coalesce(p_created_at, now()),
    p_client_event_id,
    coalesce(p_context, '{}'::jsonb),
    coalesce(p_system_impact, '{}'::text[]),
    coalesce(p_drivers, '{}'::text[])
  )
  on conflict (user_id, client_event_id) where client_event_id is not null
  do nothing
  returning * into v_checkin;

  v_inserted := found;

  if not v_inserted then
    select c.*
      into v_checkin
      from public.mood_checkins c
     where c.user_id = v_user_id
       and c.client_event_id = p_client_event_id;

    if not found then
      raise exception 'Could not resolve idempotent check-in' using errcode = '40001';
    end if;
  else
    insert into public.checkin_gauge_values (
      checkin_id,
      user_id,
      gauge_key,
      score,
      created_at
    )
    select
      v_checkin.id,
      v_user_id,
      g.key,
      round(g.value::numeric)::smallint,
      v_checkin.created_at
    from jsonb_each_text(coalesce(p_gauges, '{}'::jsonb)) g;

    insert into public.momentum_state (
      user_id,
      gauge_key,
      score,
      metadata,
      updated_at
    )
    select
      v_user_id,
      g.key,
      round(g.value::numeric),
      jsonb_build_object('source', 'checkin', 'checkin_id', v_checkin.id),
      v_checkin.created_at
    from jsonb_each_text(coalesce(p_gauges, '{}'::jsonb)) g
    on conflict (user_id, gauge_key)
    do update set
      score = excluded.score,
      metadata = excluded.metadata,
      updated_at = excluded.updated_at;
  end if;

  return query
  select
    v_checkin.id,
    v_checkin.user_id,
    v_checkin.mood,
    v_checkin.mood_label,
    v_checkin.note,
    v_checkin.created_at,
    v_checkin.client_event_id;
end;
$$;

revoke all on function public.create_cockpit_checkin(
  uuid, text, text, text, jsonb, jsonb, text[], text[], timestamptz
) from public, anon;

grant execute on function public.create_cockpit_checkin(
  uuid, text, text, text, jsonb, jsonb, text[], text[], timestamptz
) to authenticated;
