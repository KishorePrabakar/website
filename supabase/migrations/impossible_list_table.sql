-- Drop old table if it exists, then create fresh
drop table if exists public.impossible_items;

create table public.impossible_items (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    parent_id uuid references public.impossible_items(id) on delete cascade,
    title text not null,
    description text default '',
    completed boolean default false not null,
    status text default 'active' check (status in ('active', 'someday', 'completed', 'abandoned')),
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.impossible_items enable row level security;

create policy "Users can view their own impossible_items." on public.impossible_items for select using (auth.uid() = user_id);
create policy "Users can insert their own impossible_items." on public.impossible_items for insert with check (auth.uid() = user_id);
create policy "Users can update their own impossible_items." on public.impossible_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own impossible_items." on public.impossible_items for delete using (auth.uid() = user_id);

create index if not exists impossible_items_user_id_idx on public.impossible_items(user_id);
create index if not exists impossible_items_parent_id_idx on public.impossible_items(parent_id);
create index if not exists impossible_items_sort_order_idx on public.impossible_items(sort_order);
