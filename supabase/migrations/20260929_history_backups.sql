-- Cronologia e backup online non distruttivi per MulteSV.
create table if not exists public.app_state_history (
  id bigint generated always as identity primary key,
  state_id text not null,
  kind text not null check (kind in ('change','daily','restore_safety')),
  action text not null,
  summary text not null,
  snapshot jsonb not null,
  actor uuid,
  created_at timestamptz not null default now()
);

create index if not exists app_state_history_state_created_idx
  on public.app_state_history (state_id, created_at desc);

revoke all on public.app_state_history from anon, authenticated;

create or replace function public.save_app_state_versioned(p_data jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_old jsonb; v_action text; v_summary text;
begin
  if not public.is_app_admin() then raise exception 'admin required'; end if;
  if p_data is null or jsonb_typeof(p_data)<>'object' then raise exception 'invalid state'; end if;
  select data into v_old from public.app_state where id='team' for update;
  if v_old is null then raise exception 'state not found'; end if;
  if v_old=p_data then return v_old; end if;

  if not exists(select 1 from public.app_state_history where state_id='team' and kind='daily' and (created_at at time zone 'Europe/Rome')::date=(now() at time zone 'Europe/Rome')::date) then
    insert into public.app_state_history(state_id,kind,action,summary,snapshot,actor)
    values('team','daily','backup','Backup automatico giornaliero',v_old,auth.uid());
  end if;

  v_action:=case
    when v_old->'fines' is distinct from p_data->'fines' then 'multe'
    when v_old->'payments' is distinct from p_data->'payments' then 'pagamenti'
    when v_old->'players' is distinct from p_data->'players' then 'rosa'
    when v_old->'playerBirthDates' is distinct from p_data->'playerBirthDates' then 'compleanni'
    when v_old->'rules' is distinct from p_data->'rules' then 'multario'
    when v_old->'seasonConfig' is distinct from p_data->'seasonConfig' or v_old->'season' is distinct from p_data->'season' then 'stagione'
    else 'impostazioni' end;
  v_summary:=case v_action
    when 'multe' then 'Multe aggiornate' when 'pagamenti' then 'Pagamenti aggiornati'
    when 'rosa' then 'Rosa aggiornata' when 'compleanni' then 'Compleanni aggiornati'
    when 'multario' then 'Multario aggiornato' when 'stagione' then 'Stagione aggiornata'
    else 'Impostazioni aggiornate' end;
  insert into public.app_state_history(state_id,kind,action,summary,snapshot,actor)
  values('team','change',v_action,v_summary,v_old,auth.uid());
  update public.app_state set data=p_data where id='team';

  delete from public.app_state_history where id in (
    select id from public.app_state_history where state_id='team' and kind='change' order by created_at desc offset 50
  );
  delete from public.app_state_history where id in (
    select id from public.app_state_history where state_id='team' and kind='daily' order by created_at desc offset 30
  );
  return p_data;
end;$$;

create or replace function public.list_app_state_history()
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if not public.is_app_admin() then raise exception 'admin required'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id',id,'kind',kind,'action',action,'summary',summary,'createdAt',created_at,
    'players',jsonb_array_length(coalesce(snapshot->'players','[]'::jsonb)),
    'fines',jsonb_array_length(coalesce(snapshot->'fines','[]'::jsonb)),
    'paymentMonths',jsonb_object_length(coalesce(snapshot->'payments','{}'::jsonb))
  ) order by created_at desc) from (select * from public.app_state_history where state_id='team' order by created_at desc limit 80) h),'[]'::jsonb);
end;$$;

create or replace function public.ensure_daily_app_state_backup()
returns boolean language plpgsql security definer set search_path=public as $$
declare v_state jsonb;
begin
  if not public.is_app_admin() then raise exception 'admin required'; end if;
  if exists(select 1 from public.app_state_history where state_id='team' and kind='daily' and (created_at at time zone 'Europe/Rome')::date=(now() at time zone 'Europe/Rome')::date) then return false; end if;
  select data into v_state from public.app_state where id='team';
  if v_state is null then raise exception 'state not found'; end if;
  insert into public.app_state_history(state_id,kind,action,summary,snapshot,actor)
  values('team','daily','backup','Backup automatico giornaliero',v_state,auth.uid());
  delete from public.app_state_history where id in (select id from public.app_state_history where state_id='team' and kind='daily' order by created_at desc offset 30);
  return true;
end;$$;

create or replace function public.restore_app_state_history(p_history_id bigint)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_target jsonb; v_current jsonb;
begin
  if not public.is_app_admin() then raise exception 'admin required'; end if;
  select snapshot into v_target from public.app_state_history where id=p_history_id and state_id='team';
  if v_target is null then raise exception 'backup not found'; end if;
  select data into v_current from public.app_state where id='team' for update;
  insert into public.app_state_history(state_id,kind,action,summary,snapshot,actor)
  values('team','restore_safety','ripristino','Copia di sicurezza prima del ripristino',v_current,auth.uid());
  update public.app_state set data=v_target where id='team';
  delete from public.app_state_history where id in (select id from public.app_state_history where state_id='team' and kind='restore_safety' order by created_at desc offset 20);
  return v_target;
end;$$;

revoke all on function public.save_app_state_versioned(jsonb) from public;
revoke all on function public.list_app_state_history() from public;
revoke all on function public.ensure_daily_app_state_backup() from public;
revoke all on function public.restore_app_state_history(bigint) from public;
grant execute on function public.save_app_state_versioned(jsonb) to authenticated;
grant execute on function public.list_app_state_history() to authenticated;
grant execute on function public.ensure_daily_app_state_backup() to authenticated;
grant execute on function public.restore_app_state_history(bigint) to authenticated;
