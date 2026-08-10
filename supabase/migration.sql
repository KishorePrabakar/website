-- 1. Create sections and tasks if they somehow don't exist
create table if not exists public.sections (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.tasks (
    id uuid default gen_random_uuid() primary key,
    section_id uuid references public.sections(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    completed boolean default false not null,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add New Columns to Tasks (idempotent) to support the new Goal features
alter table public.tasks 
add column if not exists is_pinned boolean default false not null,
add column if not exists deadline timestamp with time zone,
add column if not exists time_spent integer default 0 not null;

-- 3. Create New Tables: subtasks and work_logs
create table if not exists public.subtasks (
    id uuid default gen_random_uuid() primary key,
    task_id uuid references public.tasks(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    completed boolean default false not null,
    is_repeatable boolean default false not null,
    last_completed_date date,
    due_date date,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.work_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    section_id uuid references public.sections(id) on delete cascade not null,
    task_id uuid references public.tasks(id) on delete cascade,
    duration_seconds integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Set up Row Level Security (RLS)
alter table public.sections enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.work_logs enable row level security;

-- 5. Policies for sections (idempotent, handling select, insert, update, delete individually)
drop policy if exists "Users can view their own sections." on public.sections;
create policy "Users can view their own sections." on public.sections for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own sections." on public.sections;
create policy "Users can insert their own sections." on public.sections for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own sections." on public.sections;
create policy "Users can update their own sections." on public.sections for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own sections." on public.sections;
create policy "Users can delete their own sections." on public.sections for delete using (auth.uid() = user_id);

-- Policies for tasks
drop policy if exists "Users can view their own tasks." on public.tasks;
create policy "Users can view their own tasks." on public.tasks for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own tasks." on public.tasks;
create policy "Users can insert their own tasks." on public.tasks for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own tasks." on public.tasks;
create policy "Users can update their own tasks." on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own tasks." on public.tasks;
create policy "Users can delete their own tasks." on public.tasks for delete using (auth.uid() = user_id);

-- Policies for subtasks
drop policy if exists "Users can view their own subtasks." on public.subtasks;
create policy "Users can view their own subtasks." on public.subtasks for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own subtasks." on public.subtasks;
create policy "Users can insert their own subtasks." on public.subtasks for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own subtasks." on public.subtasks;
create policy "Users can update their own subtasks." on public.subtasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own subtasks." on public.subtasks;
create policy "Users can delete their own subtasks." on public.subtasks for delete using (auth.uid() = user_id);

-- Policies for work_logs
drop policy if exists "Users can view their own work_logs." on public.work_logs;
create policy "Users can view their own work_logs." on public.work_logs for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own work_logs." on public.work_logs;
create policy "Users can insert their own work_logs." on public.work_logs for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own work_logs." on public.work_logs;
create policy "Users can update their own work_logs." on public.work_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own work_logs." on public.work_logs;
create policy "Users can delete their own work_logs." on public.work_logs for delete using (auth.uid() = user_id);

-- 6. Create indexes for performance
create index if not exists sections_user_id_idx on public.sections(user_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_section_id_idx on public.tasks(section_id);
create index if not exists subtasks_user_id_idx on public.subtasks(user_id);
create index if not exists subtasks_task_id_idx on public.subtasks(task_id);
create index if not exists work_logs_user_id_idx on public.work_logs(user_id);

-- 7. Create public.neo_tasks for NEO DSA OA Sprint Tracker
create table if not exists public.neo_tasks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade default auth.uid(),
    title text not null,
    tier integer default 1 not null,
    category text not null,
    sort_order integer default 0 not null,
    completed boolean default false not null,
    sr_stage integer default 0 not null,
    sr_next_date date,
    sr_first_done date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.neo_tasks enable row level security;

drop policy if exists "Users can view their own neo_tasks." on public.neo_tasks;
create policy "Users can view their own neo_tasks." on public.neo_tasks for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own neo_tasks." on public.neo_tasks;
create policy "Users can insert their own neo_tasks." on public.neo_tasks for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own neo_tasks." on public.neo_tasks;
create policy "Users can update their own neo_tasks." on public.neo_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own neo_tasks." on public.neo_tasks;
create policy "Users can delete their own neo_tasks." on public.neo_tasks for delete using (auth.uid() = user_id);

create index if not exists neo_tasks_user_id_idx on public.neo_tasks(user_id);
create index if not exists neo_tasks_tier_cat_idx on public.neo_tasks(tier, category);

