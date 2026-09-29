-- Consente agli utenti dell'app di aggiornare esclusivamente una foto giocatore.
-- Il resto di app_state rimane protetto dalle policy esistenti.
create table if not exists public.player_photo_changes (
  player_name text primary key,
  changed_at timestamptz not null default now()
);

alter table public.player_photo_changes enable row level security;
revoke all on public.player_photo_changes from anon, authenticated;

create or replace function public.update_player_photo(p_player_name text, p_photo_data text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_old_photo text;
begin
  if p_player_name is null or length(trim(p_player_name)) < 2 then
    raise exception 'invalid player';
  end if;
  if p_photo_data is null
     or left(p_photo_data, 23) <> 'data:image/jpeg;base64,'
     or octet_length(p_photo_data) > 45000 then
    raise exception 'invalid photo';
  end if;
  if exists (
    select 1 from public.player_photo_changes
    where player_name = p_player_name and changed_at > now() - interval '20 seconds'
  ) then
    raise exception 'photo rate limit';
  end if;

  select data into v_state from public.app_state where id = 'team' for update;
  if v_state is null or not exists (
    select 1 from jsonb_array_elements_text(coalesce(v_state->'players', '[]'::jsonb)) p(value)
    where p.value = p_player_name
  ) then
    raise exception 'player not found';
  end if;

  v_old_photo := v_state->'playerPhotos'->>p_player_name;
  if v_old_photo is not null and v_old_photo <> '' and v_old_photo <> p_photo_data then
    v_state := jsonb_set(
      v_state,
      '{playerPhotoBackups}',
      coalesce(v_state->'playerPhotoBackups', '{}'::jsonb) || jsonb_build_object(p_player_name, v_old_photo),
      true
    );
  end if;
  v_state := jsonb_set(
    v_state,
    '{playerPhotos}',
    coalesce(v_state->'playerPhotos', '{}'::jsonb) || jsonb_build_object(p_player_name, p_photo_data),
    true
  );
  update public.app_state set data = v_state where id = 'team';
  insert into public.player_photo_changes(player_name,changed_at) values (p_player_name,now())
  on conflict (player_name) do update set changed_at=excluded.changed_at;
  return v_state;
end;
$$;

create or replace function public.restore_player_photo(p_player_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_backup text;
  v_current text;
begin
  if not public.is_app_admin() then raise exception 'admin required'; end if;
  select data into v_state from public.app_state where id = 'team' for update;
  v_backup := v_state->'playerPhotoBackups'->>p_player_name;
  v_current := v_state->'playerPhotos'->>p_player_name;
  if v_backup is null or v_backup = '' then raise exception 'backup not found'; end if;
  v_state := jsonb_set(v_state, '{playerPhotos}', coalesce(v_state->'playerPhotos','{}'::jsonb) || jsonb_build_object(p_player_name,v_backup), true);
  v_state := jsonb_set(v_state, '{playerPhotoBackups}', coalesce(v_state->'playerPhotoBackups','{}'::jsonb) || jsonb_build_object(p_player_name,coalesce(v_current,'')), true);
  update public.app_state set data = v_state where id = 'team';
  return v_state;
end;
$$;

revoke all on function public.update_player_photo(text,text) from public;
grant execute on function public.update_player_photo(text,text) to anon, authenticated;
revoke all on function public.restore_player_photo(text) from public;
grant execute on function public.restore_player_photo(text) to authenticated;
