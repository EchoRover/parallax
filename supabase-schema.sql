-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Analyses table: stores each analysis run
create table if not exists analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  script text not null,
  audience_description text not null,
  research jsonb,
  results jsonb,
  chunks text[],
  selected_persona_ids text[],
  created_at timestamptz default now()
);

-- Community personas: shared persona prompts
create table if not exists community_personas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  author_name text not null,
  name text not null,
  role text not null,
  icon text not null default '👤',
  category text not null default 'General',
  description text not null,
  system_prompt text not null,
  upvotes int default 0,
  created_at timestamptz default now()
);

-- Row Level Security
alter table analyses enable row level security;
alter table community_personas enable row level security;

-- Users can only see their own analyses
create policy "Users read own analyses" on analyses
  for select using (auth.uid() = user_id);
create policy "Users insert own analyses" on analyses
  for insert with check (auth.uid() = user_id);
create policy "Users delete own analyses" on analyses
  for delete using (auth.uid() = user_id);

-- Anyone can read community personas, users can create their own
create policy "Anyone can read community personas" on community_personas
  for select using (true);
create policy "Users create community personas" on community_personas
  for insert with check (auth.uid() = user_id);
create policy "Users delete own community personas" on community_personas
  for delete using (auth.uid() = user_id);
