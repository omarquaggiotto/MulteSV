-- Conserva la classifica Tuttocampo nello stato condiviso di MulteSV.
-- La funzione aggiorna esclusivamente seasonConfig.calendarSources[].snapshot.standings.
create or replace function public.merge_calendar_standings(
  p_rows jsonb,
  p_competition text,
  p_updated_at text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_sources jsonb;
  v_index integer;
  v_row jsonb;
  v_team integer;
  v_rows jsonb := '[]'::jsonb;
  v_updated timestamptz;
begin
  if jsonb_typeof(p_rows) <> 'array'
     or jsonb_array_length(p_rows) < 2
     or jsonb_array_length(p_rows) > 40 then
    raise exception 'invalid standings';
  end if;

  v_updated := coalesce(nullif(p_updated_at, '')::timestamptz, now());
  if v_updated > now() + interval '5 minutes' then
    raise exception 'invalid timestamp';
  end if;

  for v_row in select value from jsonb_array_elements(p_rows) loop
    v_team := (v_row->>'id')::integer;
    if v_team < 1
       or coalesce(v_row->>'name', '') = ''
       or (v_row->>'position')::integer not between 1 and 40 then
      raise exception 'invalid standings row';
    end if;

    v_rows := v_rows || jsonb_build_array(jsonb_build_object(
      'position', (v_row->>'position')::integer,
      'id', v_team,
      'name', left(v_row->>'name', 100),
      'logo', case
        when coalesce(v_row->>'logo', '') ~ '^https://b2-content[.]tuttocampo[.]it/'
          then v_row->>'logo'
        else ''
      end,
      'points', greatest(0, (v_row->>'points')::integer),
      'played', greatest(0, (v_row->>'played')::integer),
      'won', greatest(0, (v_row->>'won')::integer),
      'drawn', greatest(0, (v_row->>'drawn')::integer),
      'lost', greatest(0, (v_row->>'lost')::integer),
      'goalsFor', greatest(0, (v_row->>'goalsFor')::integer),
      'goalsAgainst', greatest(0, (v_row->>'goalsAgainst')::integer),
      'goalDifference', (v_row->>'goalDifference')::integer
    ));
  end loop;

  select data
  into v_state
  from public.app_state
  where id = 'team'
  for update;

  if v_state is null then
    raise exception 'state not found';
  end if;

  v_sources := coalesce(
    v_state#>'{seasonConfig,calendarSources}',
    '[]'::jsonb
  );

  select ordinality::integer - 1
  into v_index
  from jsonb_array_elements(v_sources) with ordinality s(value, ordinality)
  where s.value->>'type' = 'league'
    and coalesce((s.value->>'enabled')::boolean, true)
  limit 1;

  if v_index is null then
    raise exception 'league source not found';
  end if;

  v_sources := jsonb_set(
    v_sources,
    array[v_index::text, 'snapshot', 'standings'],
    jsonb_build_object(
      'competition', left(coalesce(p_competition, 'Campionato'), 140),
      'updatedAt', v_updated::text,
      'rows', v_rows
    ),
    true
  );

  v_state := jsonb_set(
    v_state,
    '{seasonConfig,calendarSources}',
    v_sources,
    true
  );

  update public.app_state
  set data = v_state
  where id = 'team';

  return v_state;
end;
$$;

revoke all on function public.merge_calendar_standings(jsonb, text, text) from public;
grant execute on function public.merge_calendar_standings(jsonb, text, text) to anon, authenticated;
