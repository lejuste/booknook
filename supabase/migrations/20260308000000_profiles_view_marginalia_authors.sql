-- Allow viewing profiles of users who left marginalia on books in your library,
-- so their names/avatars show on the book timeline instead of "Anonymous".

create policy "Users can view profiles with marginalia on own library books"
  on public.profiles for select
  using (
    id in (
      select m.user_id
      from public.marginalia m
      where m.open_library_work_id in (select public.current_user_library_work_ids())
    )
  );
