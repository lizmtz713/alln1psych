-- Metadata-only AI usage ledger for rate limiting, cost controls, and latency SLOs.
-- Prompts and responses are deliberately not stored here.

create table if not exists public.ai_usage_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  request_id uuid not null unique,
  feature text not null default 'chat',
  prompt_version text not null,
  input_chars integer not null check (input_chars >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  latency_ms integer not null check (latency_ms >= 0),
  status text not null check (status in ('success', 'provider_error', 'timeout')),
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_usage_events_user_created
  on public.ai_usage_events(user_id, created_at desc);

alter table public.ai_usage_events enable row level security;
alter table public.ai_usage_events force row level security;

drop policy if exists "ai_usage_events_select_own" on public.ai_usage_events;

create policy "ai_usage_events_select_own"
  on public.ai_usage_events for select
  using (auth.uid() = user_id);

revoke all on table public.ai_usage_events from anon, authenticated, public;
grant select on table public.ai_usage_events to authenticated;

comment on table public.ai_usage_events is
  'AI request metadata only. Never store prompts, responses, journal text, or gauge notes.';
