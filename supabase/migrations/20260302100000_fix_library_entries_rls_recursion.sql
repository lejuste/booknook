-- Fix infinite recursion: policy "Users can view library entries for same work"
-- referenced library_entries in its USING subquery, causing recursion.
-- Use a SECURITY DEFINER function so the subquery runs without RLS.

create or replace function public.current_user_library_work_ids()
returns setof text
language sql
security definer
stable
set search_path = public
as $$
  select open_library_work_id
  from public.library_entries
  where user_id = auth.uid();
$$;

drop policy if exists "Users can view library entries for same work" on public.library_entries;

create policy "Users can view library entries for same work"
  on public.library_entries for select
  using (
    open_library_work_id in (select public.current_user_library_work_ids())
  );
