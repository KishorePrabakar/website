-- Public can read, only owners can write
alter table public.impossible_items enable row level security;

-- Drop old policies if they exist
drop policy if exists "Public can read impossible_items" on public.impossible_items;
drop policy if exists "Users can view their own impossible_items." on public.impossible_items;
drop policy if exists "Users can insert their own impossible_items." on public.impossible_items;
drop policy if exists "Users can update their own impossible_items." on public.impossible_items;
drop policy if exists "Users can delete their own impossible_items." on public.impossible_items;

-- Public read access (anyone can view the list)
create policy "Public can read impossible_items" on public.impossible_items for select using (true);

-- Owner-only write access
create policy "Users can insert their own impossible_items." on public.impossible_items for insert with check (auth.uid() = user_id);
create policy "Users can update their own impossible_items." on public.impossible_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own impossible_items." on public.impossible_items for delete using (auth.uid() = user_id);

create index if not exists impossible_items_user_id_idx on public.impossible_items(user_id);
create index if not exists impossible_items_parent_id_idx on public.impossible_items(parent_id);
create index if not exists impossible_items_sort_order_idx on public.impossible_items(sort_order);
