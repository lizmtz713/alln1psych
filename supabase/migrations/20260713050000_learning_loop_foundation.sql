-- Canonical intervention -> outcome learning loop. User reports remain distinct
-- from wearable observations and AI-derived hypotheses.
create table if not exists public.intervention_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null check (char_length(tool_id) between 1 and 120),
  target_gauges text[] not null default '{}',
  gauges_before jsonb not null default '{}'::jsonb,
  context jsonb not null default '{}'::jsonb,
  source text not null default 'user_action' check (source in ('user_action', 'recommendation')),
  created_at timestamptz not null default now()
);

create table if not exists public.intervention_outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intervention_id uuid references public.intervention_events(id) on delete set null,
  tool_id text not null check (char_length(tool_id) between 1 and 120),
  outcome text not null check (outcome in ('better', 'same', 'worse', 'unsure')),
  gauges_after jsonb not null default '{}'::jsonb,
  note text,
  source text not null default 'user_report' check (source in ('user_report', 'later_checkin', 'wearable_observation')),
  created_at timestamptz not null default now()
);

create index if not exists intervention_events_user_created_idx on public.intervention_events(user_id, created_at desc);
create index if not exists intervention_outcomes_user_created_idx on public.intervention_outcomes(user_id, created_at desc);
create index if not exists intervention_outcomes_intervention_idx on public.intervention_outcomes(intervention_id);

alter table public.intervention_events enable row level security;
alter table public.intervention_outcomes enable row level security;

drop policy if exists intervention_events_owner_all on public.intervention_events;
create policy intervention_events_owner_all on public.intervention_events for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists intervention_outcomes_owner_all on public.intervention_outcomes;
create policy intervention_outcomes_owner_all on public.intervention_outcomes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on public.intervention_events from anon;
revoke all on public.intervention_outcomes from anon;
grant select, insert, update, delete on public.intervention_events to authenticated;
grant select, insert, update, delete on public.intervention_outcomes to authenticated;
