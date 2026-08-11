-- Create Prep Tracker tables and Row Level Security policies

create table if not exists public.prep_tasks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    type text not null,
    status text not null,
    target_date date,
    completion_date date,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.knowledge_categories (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.knowledge_topics (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    category_id uuid references public.knowledge_categories(id) on delete cascade not null,
    name text not null,
    status text not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.habits (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    is_default boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.habit_logs (
    id uuid default gen_random_uuid() primary key,
    habit_id uuid references public.habits(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    log_date date not null,
    completed boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.mock_interviews (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    company text,
    role text,
    attempt_date date,
    result text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.weekly_mock_questions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    question_title text not null,
    question_description text,
    difficulty text,
    status text,
    generated_week date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.prep_tasks enable row level security;
alter table public.knowledge_categories enable row level security;
alter table public.knowledge_topics enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.mock_interviews enable row level security;
alter table public.weekly_mock_questions enable row level security;

drop policy if exists "Users can view their own prep_tasks." on public.prep_tasks;
create policy "Users can view their own prep_tasks." on public.prep_tasks for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own prep_tasks." on public.prep_tasks;
create policy "Users can insert their own prep_tasks." on public.prep_tasks for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own prep_tasks." on public.prep_tasks;
create policy "Users can update their own prep_tasks." on public.prep_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own prep_tasks." on public.prep_tasks;
create policy "Users can delete their own prep_tasks." on public.prep_tasks for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own knowledge_categories." on public.knowledge_categories;
create policy "Users can view their own knowledge_categories." on public.knowledge_categories for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own knowledge_categories." on public.knowledge_categories;
create policy "Users can insert their own knowledge_categories." on public.knowledge_categories for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own knowledge_categories." on public.knowledge_categories;
create policy "Users can update their own knowledge_categories." on public.knowledge_categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own knowledge_categories." on public.knowledge_categories;
create policy "Users can delete their own knowledge_categories." on public.knowledge_categories for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own knowledge_topics." on public.knowledge_topics;
create policy "Users can view their own knowledge_topics." on public.knowledge_topics for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own knowledge_topics." on public.knowledge_topics;
create policy "Users can insert their own knowledge_topics." on public.knowledge_topics for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own knowledge_topics." on public.knowledge_topics;
create policy "Users can update their own knowledge_topics." on public.knowledge_topics for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own knowledge_topics." on public.knowledge_topics;
create policy "Users can delete their own knowledge_topics." on public.knowledge_topics for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own habits." on public.habits;
create policy "Users can view their own habits." on public.habits for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own habits." on public.habits;
create policy "Users can insert their own habits." on public.habits for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own habits." on public.habits;
create policy "Users can update their own habits." on public.habits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own habits." on public.habits;
create policy "Users can delete their own habits." on public.habits for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own habit_logs." on public.habit_logs;
create policy "Users can view their own habit_logs." on public.habit_logs for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own habit_logs." on public.habit_logs;
create policy "Users can insert their own habit_logs." on public.habit_logs for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own habit_logs." on public.habit_logs;
create policy "Users can update their own habit_logs." on public.habit_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own habit_logs." on public.habit_logs;
create policy "Users can delete their own habit_logs." on public.habit_logs for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own mock_interviews." on public.mock_interviews;
create policy "Users can view their own mock_interviews." on public.mock_interviews for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own mock_interviews." on public.mock_interviews;
create policy "Users can insert their own mock_interviews." on public.mock_interviews for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own mock_interviews." on public.mock_interviews;
create policy "Users can update their own mock_interviews." on public.mock_interviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own mock_interviews." on public.mock_interviews;
create policy "Users can delete their own mock_interviews." on public.mock_interviews for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own weekly_mock_questions." on public.weekly_mock_questions;
create policy "Users can view their own weekly_mock_questions." on public.weekly_mock_questions for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own weekly_mock_questions." on public.weekly_mock_questions;
create policy "Users can insert their own weekly_mock_questions." on public.weekly_mock_questions for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own weekly_mock_questions." on public.weekly_mock_questions;
create policy "Users can update their own weekly_mock_questions." on public.weekly_mock_questions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own weekly_mock_questions." on public.weekly_mock_questions;
create policy "Users can delete their own weekly_mock_questions." on public.weekly_mock_questions for delete using (auth.uid() = user_id);

create index if not exists prep_tasks_user_id_idx on public.prep_tasks(user_id);
create index if not exists knowledge_categories_user_id_idx on public.knowledge_categories(user_id);
create index if not exists knowledge_topics_user_id_idx on public.knowledge_topics(user_id);
create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists habit_logs_user_id_idx on public.habit_logs(user_id);
create index if not exists mock_interviews_user_id_idx on public.mock_interviews(user_id);
create index if not exists weekly_mock_questions_user_id_idx on public.weekly_mock_questions(user_id);
