-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- USERS PROFILE (extends Supabase auth.users)
create table public.profiles (
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

-- CONVERSATIONS
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  mode text check (mode in ('voice', 'text', 'mixed')),
  summary text,
  emotional_tone text,
  created_at timestamptz default now()
);

-- MESSAGES
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  is_voice boolean default false,
  emotion_detected text,
  created_at timestamptz default now()
);

-- MOOD CHECK-INS
create table public.mood_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mood text check (mood in ('green', 'yellow', 'orange', 'red')) not null,
  mood_label text not null,
  note text,
  created_at timestamptz default now()
);

-- TEMPERATURE
create table public.temperature (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  current_temp text check (current_temp in ('green', 'yellow', 'orange', 'red')) default 'green',
  temp_label text default 'Doing well',
  note text,
  updated_at timestamptz default now()
);

-- CIRCLE MEMBERS
create table public.circles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  member_user_id uuid references public.profiles(id) on delete set null,
  member_name text not null,
  relationship text check (relationship in ('parent', 'child', 'sibling', 'friend', 'partner', 'mentor', 'other')) not null,
  contact_method text,
  sharing_level text check (sharing_level in ('full', 'limited')) default 'full',
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamptz default now()
);

-- CIRCLE NUDGES
create table public.nudges (
  id uuid default uuid_generate_v4() primary key,
  circle_id uuid references public.circles(id) on delete cascade not null,
  recipient_user_id uuid references public.profiles(id) on delete cascade not null,
  member_name text not null,
  message text not null,
  read boolean default false,
  acted_on boolean default false,
  created_at timestamptz default now()
);

-- JOURNAL ENTRIES
create table public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  mood text check (mood in ('green', 'yellow', 'orange', 'red')),
  source text check (source in ('manual', 'conversation')) default 'manual',
  conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz default now()
);

-- EDUCATION PROGRESS
create table public.education_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text not null,
  completed boolean default false,
  reflection text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.mood_checkins enable row level security;
alter table public.temperature enable row level security;
alter table public.circles enable row level security;
alter table public.nudges enable row level security;
alter table public.journal_entries enable row level security;
alter table public.education_progress enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Conversations: users can CRUD their own
create policy "Users can manage own conversations" on public.conversations for all using (auth.uid() = user_id);

-- Messages: users can CRUD their own
create policy "Users can manage own messages" on public.messages for all using (auth.uid() = user_id);

-- Mood check-ins: users can CRUD their own
create policy "Users can manage own mood checkins" on public.mood_checkins for all using (auth.uid() = user_id);

-- Temperature: users can manage their own
create policy "Users can manage own temperature" on public.temperature for all using (auth.uid() = user_id);

-- Circles: users can manage circles they created
create policy "Users can manage own circles" on public.circles for all using (auth.uid() = user_id);

-- Nudges: users can read nudges sent to them
create policy "Users can read own nudges" on public.nudges for select using (auth.uid() = recipient_user_id);
create policy "Users can update own nudges" on public.nudges for update using (auth.uid() = recipient_user_id);

-- Journal: users can CRUD their own
create policy "Users can manage own journal" on public.journal_entries for all using (auth.uid() = user_id);

-- Education: users can CRUD their own
create policy "Users can manage own education progress" on public.education_progress for all using (auth.uid() = user_id);

-- AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Friend'));

  insert into public.temperature (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Optional: if profiles already exists without push_token, run:
-- alter table public.profiles add column if not exists push_token text;

-- INDEXES for performance
create index idx_conversations_user_id on public.conversations(user_id);
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_mood_checkins_user_id on public.mood_checkins(user_id);
create index idx_mood_checkins_created_at on public.mood_checkins(created_at);
create index idx_circles_user_id on public.circles(user_id);
create index idx_nudges_recipient on public.nudges(recipient_user_id);
create index idx_journal_user_id on public.journal_entries(user_id);
create index idx_education_user_id on public.education_progress(user_id);
