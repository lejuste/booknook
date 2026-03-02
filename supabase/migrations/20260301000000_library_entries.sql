-- Library entries: user's books with Open Library references
-- See https://openlibrary.org/developers/api
create table public.library_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade not null,
  open_library_work_id text not null,
  open_library_edition_id text not null,
  open_library_url text not null,
  title text not null,
  author text not null,
  total_pages int not null default 0,
  cover_url text,
  pages_read int not null default 0,
  friends_reading int not null default 0,
  position int not null default 0,
  created_at timestamptz default now() not null,
  unique (user_id, open_library_work_id)
);

create index library_entries_user_id_idx on public.library_entries (user_id);

alter table public.library_entries enable row level security;

create policy "Users can view own library"
  on public.library_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own library"
  on public.library_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own library"
  on public.library_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own library"
  on public.library_entries for delete
  using (auth.uid() = user_id);
