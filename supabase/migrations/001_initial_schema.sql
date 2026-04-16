-- =====================================================
-- VeritasLearn Initial Schema
-- Run this in your Supabase SQL Editor
-- =====================================================

-- -------------------------
-- 1. Users Profile Table
-- -------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------
-- 2. Quizzes Table
-- -------------------------
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic text not null,
  created_at timestamptz default now()
);

-- -------------------------
-- 3. Questions Table
-- -------------------------
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_answer int not null
);

-- -------------------------
-- 4. User Quiz Attempts
-- -------------------------
create table if not exists public.user_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  topic text not null,
  score int not null,
  total int not null,
  passed boolean not null,
  points_earned int not null default 0,
  is_retry boolean not null default false,
  created_at timestamptz default now()
);

-- -------------------------
-- 5. Chat Access (AI Unlock)
-- -------------------------
create table if not exists public.chat_access (
  user_id uuid references auth.users(id) on delete cascade,
  topic text not null,
  unlocked boolean not null default false,
  updated_at timestamptz default now(),
  primary key (user_id, topic)
);

-- -------------------------
-- 6. Rate Limits
-- -------------------------
create table if not exists public.user_rate_limits (
  user_id uuid references auth.users(id) on delete cascade,
  date date not null default current_date,
  request_count int not null default 0,
  primary key (user_id, date)
);

-- =====================================================
-- Row Level Security (CRITICAL)
-- =====================================================

alter table public.users enable row level security;
alter table public.user_quiz_attempts enable row level security;
alter table public.chat_access enable row level security;
alter table public.user_rate_limits enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;

-- users: read/update own profile only
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- user_quiz_attempts: own records only
create policy "Users can view own attempts"
  on public.user_quiz_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own attempts"
  on public.user_quiz_attempts for insert
  with check (auth.uid() = user_id);

-- chat_access: own records only
create policy "Users can view own chat access"
  on public.chat_access for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat access"
  on public.chat_access for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chat access"
  on public.chat_access for update
  using (auth.uid() = user_id);

-- rate limits: own records only
create policy "Users can view own rate limits"
  on public.user_rate_limits for select
  using (auth.uid() = user_id);

-- quizzes: public read (no sensitive data)
create policy "Anyone can view quizzes"
  on public.quizzes for select
  using (true);

create policy "Anyone can view questions"
  on public.questions for select
  using (true);
