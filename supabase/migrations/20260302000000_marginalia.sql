-- Marginalia: per-page comments on a book (by work_id). Only visible after you've read that page.
create table public.marginalia (
  id uuid primary key default gen_random_uuid(),
  open_library_work_id text not null,
  user_id uuid references public.profiles (id) on delete cascade not null,
  page_number int not null,
  body text not null,
  created_at timestamptz default now() not null,
  constraint page_positive check (page_number > 0)
);

create index marginalia_work_page_idx on public.marginalia (open_library_work_id, page_number);
create index marginalia_work_created_idx on public.marginalia (open_library_work_id, created_at);

alter table public.marginalia enable row level security;

-- Only see marginalia for books you have in your library (spoiler-safe filtering is done in app by pages_read)
create policy "Users can view marginalia for own library books"
  on public.marginalia for select
  using (
    open_library_work_id in (
      select open_library_work_id from public.library_entries where user_id = auth.uid()
    )
  );

-- Only add marginalia for books you have
create policy "Users can insert own marginalia"
  on public.marginalia for insert
  with check (
    auth.uid() = user_id
    and open_library_work_id in (
      select open_library_work_id from public.library_entries where user_id = auth.uid()
    )
  );

create policy "Users can update own marginalia"
  on public.marginalia for update
  using (auth.uid() = user_id);

create policy "Users can delete own marginalia"
  on public.marginalia for delete
  using (auth.uid() = user_id);

-- Allow reading other users' library_entries for the same work (to show "friends" progress on book page)
-- Only exposes: same work_id, their pages_read and profile for avatar/name
create policy "Users can view library entries for same work"
  on public.library_entries for select
  using (
    open_library_work_id in (
      select open_library_work_id from public.library_entries where user_id = auth.uid()
    )
  );
