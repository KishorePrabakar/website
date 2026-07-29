-- Create users table if not exists (Supabase auth manages auth.users)
-- We will just use auth.users

-- Create sections table
create table public.sections (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tasks table
create table public.tasks (
    id uuid default gen_random_uuid() primary key,
    section_id uuid references public.sections(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    completed boolean default false not null,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.sections enable row level security;
alter table public.tasks enable row level security;

-- Policies for sections
create policy "Users can view their own sections."
    on public.sections for select
    using (auth.uid() = user_id);

create policy "Users can insert their own sections."
    on public.sections for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own sections."
    on public.sections for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own sections."
    on public.sections for delete
    using (auth.uid() = user_id);

-- Policies for tasks
create policy "Users can view their own tasks."
    on public.tasks for select
    using (auth.uid() = user_id);

create policy "Users can insert their own tasks."
    on public.tasks for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own tasks."
    on public.tasks for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own tasks."
    on public.tasks for delete
    using (auth.uid() = user_id);

-- Create indexes for performance
create index sections_user_id_idx on public.sections(user_id);
create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_section_id_idx on public.tasks(section_id);

-- Setup auth providers in Supabase dashboard (Google, GitHub, Email)
-- No SQL needed for that, do it in Auth -> Providers.
