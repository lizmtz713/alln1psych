-- =============================================================================
-- Phase 2: Core RLS lockdown (P0 account isolation)
-- Tables: profiles, mood_checkins, conversations, messages,
--         relationship_events, momentum_state
--
-- Rules:
--   - Owner tables: auth.uid() must equal user_id (profiles: auth.uid() = id)
--   - Child tables: parent ownership must match auth.uid(); never trust client IDs alone
--   - Explicit SELECT / INSERT / UPDATE / DELETE (no FOR ALL)
-- =============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Ensure core tables exist (idempotent with docs/supabase-schema.sql)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  pronouns text,
  age_group text check (age_group in ('under13', '13-17', '18-25', '26-40', '41-60', '60+')),
  communication_preference text check (communication_preference in ('voice', 'text')) default 'voice',
  love_language text,
  onboarding_completed boolean default false,
  push_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  mode text check (mode in ('voice', 'text', 'mixed')),
  summary text,
  emotional_tone text,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  is_voice boolean default false,
  emotion_detected text,
  created_at timestamptz default now()
);

create table if not exists public.mood_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mood text check (mood in ('green', 'yellow', 'orange', 'red')) not null,
  mood_label text not null,
  note text,
  created_at timestamptz default now()
);

-- Relationship intelligence events (Signals / People subsystem)
create table if not exists public.relationship_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  light_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Momentum / gauge trajectory state (Cockpit reopen persistence)
create table if not exists public.momentum_state (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  gauge_key text not null,
  score numeric(5,2) not null default 50,
  season text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, gauge_key)
);

create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_user_id on public.messages(user_id);
create index if not exists idx_mood_checkins_user_id on public.mood_checkins(user_id);
create index if not exists idx_relationship_events_user_id on public.relationship_events(user_id);
create index if not exists idx_relationship_events_light_id on public.relationship_events(user_id, light_id);
create index if not exists idx_momentum_state_user_id on public.momentum_state(user_id);

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.mood_checkins enable row level security;
alter table public.relationship_events enable row level security;
alter table public.momentum_state enable row level security;

-- Force RLS even for table owners (defense in depth on managed roles)
alter table public.profiles force row level security;
alter table public.conversations force row level security;
alter table public.messages force row level security;
alter table public.mood_checkins force row level security;
alter table public.relationship_events force row level security;
alter table public.momentum_state force row level security;

-- ---------------------------------------------------------------------------
-- Drop legacy broad policies so we can replace with explicit CRUD
-- ---------------------------------------------------------------------------

do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles',
        'conversations',
        'messages',
        'mood_checkins',
        'relationship_events',
        'momentum_state'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- profiles (PK is id = auth.users.id)
-- ---------------------------------------------------------------------------

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- mood_checkins (Check-ins)
-- ---------------------------------------------------------------------------

create policy "mood_checkins_select_own"
  on public.mood_checkins for select
  using (auth.uid() = user_id);

create policy "mood_checkins_insert_own"
  on public.mood_checkins for insert
  with check (auth.uid() = user_id);

create policy "mood_checkins_update_own"
  on public.mood_checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mood_checkins_delete_own"
  on public.mood_checkins for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------

create policy "conversations_select_own"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "conversations_insert_own"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "conversations_update_own"
  on public.conversations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "conversations_delete_own"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- messages (child of conversations)
-- Must own the parent conversation AND match messages.user_id
-- ---------------------------------------------------------------------------

create policy "messages_select_own_conversation"
  on public.messages for select
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

create policy "messages_insert_own_conversation"
  on public.messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and c.user_id = auth.uid()
    )
  );

create policy "messages_update_own_conversation"
  on public.messages for update
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and c.user_id = auth.uid()
    )
  );

create policy "messages_delete_own_conversation"
  on public.messages for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- relationship_events
-- ---------------------------------------------------------------------------

create policy "relationship_events_select_own"
  on public.relationship_events for select
  using (auth.uid() = user_id);

create policy "relationship_events_insert_own"
  on public.relationship_events for insert
  with check (auth.uid() = user_id);

create policy "relationship_events_update_own"
  on public.relationship_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "relationship_events_delete_own"
  on public.relationship_events for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- momentum_state
-- ---------------------------------------------------------------------------

create policy "momentum_state_select_own"
  on public.momentum_state for select
  using (auth.uid() = user_id);

create policy "momentum_state_insert_own"
  on public.momentum_state for insert
  with check (auth.uid() = user_id);

create policy "momentum_state_update_own"
  on public.momentum_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "momentum_state_delete_own"
  on public.momentum_state for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Deny anon role by default is covered by RLS + no GRANT beyond authenticated.
-- Explicit grants for authenticated only (no public).
-- ---------------------------------------------------------------------------

revoke all on table public.profiles from anon, public;
revoke all on table public.conversations from anon, public;
revoke all on table public.messages from anon, public;
revoke all on table public.mood_checkins from anon, public;
revoke all on table public.relationship_events from anon, public;
revoke all on table public.momentum_state from anon, public;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.conversations to authenticated;
grant select, insert, update, delete on table public.messages to authenticated;
grant select, insert, update, delete on table public.mood_checkins to authenticated;
grant select, insert, update, delete on table public.relationship_events to authenticated;
grant select, insert, update, delete on table public.momentum_state to authenticated;
