-- 1. Create table public.neo_tasks
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

-- 2. Enable Row Level Security (RLS)
alter table public.neo_tasks enable row level security;

-- 3. Policies for neo_tasks (owner access)
drop policy if exists "Users can view their own neo_tasks." on public.neo_tasks;
create policy "Users can view their own neo_tasks." on public.neo_tasks for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own neo_tasks." on public.neo_tasks;
create policy "Users can insert their own neo_tasks." on public.neo_tasks for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own neo_tasks." on public.neo_tasks;
create policy "Users can update their own neo_tasks." on public.neo_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own neo_tasks." on public.neo_tasks;
create policy "Users can delete their own neo_tasks." on public.neo_tasks for delete using (auth.uid() = user_id);

-- 4. Create performance indexes
create index if not exists neo_tasks_user_id_idx on public.neo_tasks(user_id);
create index if not exists neo_tasks_tier_cat_idx on public.neo_tasks(tier, category);
