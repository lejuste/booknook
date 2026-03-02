-- Add tagline to profiles for user bio (e.g. "Avid reader & note-taker")
alter table public.profiles
  add column if not exists tagline text;

-- Add status to library_entries: 'reading' | 'completed'
-- Completed = past read books; Reading = currently reading
alter table public.library_entries
  add column if not exists status text not null default 'reading'
  check (status in ('reading', 'completed'));

-- Add updated_at for ordering recent books
alter table public.library_entries
  add column if not exists updated_at timestamptz default now() not null;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists library_entries_updated_at on public.library_entries;
create trigger library_entries_updated_at
  before update on public.library_entries
  for each row execute function public.set_updated_at();
