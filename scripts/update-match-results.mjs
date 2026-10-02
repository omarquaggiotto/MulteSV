import {importSportsWidget, supportsWidget} from '../sports-widgets.mjs';
const CONFIG = {
  projectUrl: "https://gzeyptkjdvrwzsjeijss.supabase.co",
  apiKey: "sb_publishable_juzsgyE5TPcFwNxXZV0t8A_w3TOKMfj",
  stateId: "team",
  teamId: 1199590,
};
const auth={apikey:CONFIG.apiKey,Authorization:'Bearer '+CONFIG.apiKey,'content-type':'application/json'};
const dryRun=process.argv.includes('--dry-run');
const response=await fetch(CONFIG.projectUrl+'/rest/v1/app_state?id=eq.'+encodeURIComponent(CONFIG.stateId)+'&select=data',{headers:auth});
if(!response.ok)throw new Error('Lettura stato fallita: '+response.status);
const state=(await response.json())[0]?.data;if(!state)throw new Error('Stato squadra assente');
let failures=0,verified=0;
for(const source of (state.seasonConfig?.calendarSources||[]).filter(s=>s.enabled!==false&&s.url)){
 try{
  const options={type:source.type,url:source.url,teamId:CONFIG.teamId,season:state.season,previous:source.snapshot};
  if(!supportsWidget(options))throw new Error('Widget da configurare per questa stagione/competizione');
  const calendar=await importSportsWidget(options);
  const completed=calendar.matches.filter(m=>/^\d{1,2}-\d{1,2}$/.test(m.result||'')&&m.status==='played');
  if(!dryRun&&completed.length){const saved=await fetch(CONFIG.projectUrl+'/rest/v1/rpc/merge_calendar_results',{method:'POST',headers:auth,body:JSON.stringify({p_source_type:source.type,p_matches:completed})});if(!saved.ok)throw new Error('Salvataggio risultati fallito: '+saved.status);}
  if(!dryRun&&calendar.standings){const saved=await fetch(CONFIG.projectUrl+'/rest/v1/rpc/merge_calendar_standings',{method:'POST',headers:auth,body:JSON.stringify({p_rows:calendar.standings.rows,p_competition:calendar.competition,p_updated_at:calendar.standings.updatedAt})});if(!saved.ok)throw new Error('Salvataggio classifica fallito: '+saved.status);}
  verified++;console.log(JSON.stringify({team:CONFIG.teamId,type:source.type,matches:calendar.matches.length,results:completed.length,standings:calendar.standings?.rows.length||0,dryRun}));
 }catch(error){failures++;console.error(source.type+': '+error.message);}
}
if(!verified||failures)process.exitCode=1;
