create or replace function public.merge_calendar_results(p_source_type text, p_matches jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_state jsonb; v_sources jsonb; v_source_index integer; v_matches jsonb;
  v_match jsonb; v_existing_index integer; v_item jsonb; v_now text := now()::text;
  v_team_id integer := 1199590; v_home integer; v_away integer; v_date text; v_time text; v_result text;
begin
  if p_source_type not in ('league','cup') or jsonb_typeof(p_matches) <> 'array' or jsonb_array_length(p_matches) > 100 then
    raise exception 'invalid calendar results';
  end if;
  select data into v_state from public.app_state where id='team' for update;
  if v_state is null then raise exception 'state not found'; end if;
  v_sources := coalesce(v_state #> '{seasonConfig,calendarSources}', '[]'::jsonb);
  select ordinality::integer - 1 into v_source_index
    from jsonb_array_elements(v_sources) with ordinality source(value, ordinality)
    where source.value->>'type'=p_source_type and coalesce((source.value->>'enabled')::boolean,true)
    limit 1;
  if v_source_index is null then raise exception 'calendar source not found'; end if;
  v_matches := coalesce(v_sources #> array[v_source_index::text,'snapshot','matches'], '[]'::jsonb);
  for v_match in select value from jsonb_array_elements(p_matches) loop
    v_home := (v_match->>'homeId')::integer; v_away := (v_match->>'awayId')::integer;
    v_date := v_match->>'date'; v_time := v_match->>'time'; v_result := trim(v_match->>'result');
    if v_result !~ '^[0-9]{1,2}-[0-9]{1,2}$' or v_date !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}$'
       or v_time !~ '^[0-2][0-9]:[0-5][0-9]$' or (v_home<>v_team_id and v_away<>v_team_id)
       or v_home=v_away or ((v_date||'T'||v_time)::timestamp at time zone 'Europe/Rome') > now()-interval '3 hours' then
      continue;
    end if;
    select ordinality::integer - 1 into v_existing_index
      from jsonb_array_elements(v_matches) with ordinality current(value, ordinality)
      where (current.value->>'key'=v_match->>'key') or
            (current.value->>'date'=v_date and (current.value->>'homeId')::integer=v_home and (current.value->>'awayId')::integer=v_away)
      limit 1;
    v_item := jsonb_build_object('round',coalesce((v_match->>'round')::integer,0),'homeId',v_home,'awayId',v_away,
      'date',v_date,'time',v_time,'place',left(coalesce(v_match->>'place',''),160),'result',v_result,'status','played',
      'url',case when coalesce(v_match->>'url','') ~ '^https://www[.]tuttocampo[.]it/' then v_match->>'url' else '' end,
      'key',p_source_type||'|'||v_date||'|'||v_home||'|'||v_away,'competitionType',p_source_type,'resultCheckedAt',v_now);
    if v_existing_index is null then v_matches := v_matches || jsonb_build_array(v_item);
    else v_matches := jsonb_set(v_matches,array[v_existing_index::text],(v_matches->v_existing_index)||v_item,true); end if;
  end loop;
  v_sources := jsonb_set(v_sources,array[v_source_index::text,'snapshot','matches'],v_matches,true);
  v_sources := jsonb_set(v_sources,array[v_source_index::text,'lastResultsCheckedAt'],to_jsonb(v_now),true);
  v_state := jsonb_set(v_state,'{seasonConfig,calendarSources}',v_sources,true);
  update public.app_state set data=v_state where id='team';
  return v_state;
end; $$;
revoke all on function public.merge_calendar_results(text,jsonb) from public;
grant execute on function public.merge_calendar_results(text,jsonb) to anon, authenticated;
