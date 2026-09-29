const CONFIG = {
  projectUrl: "https://gzeyptkjdvrwzsjeijss.supabase.co",
  apiKey: "sb_publishable_juzsgyE5TPcFwNxXZV0t8A_w3TOKMfj",
  stateId: "team",
  teamId: 1199590,
};

const MONTHS = { gennaio:"01", febbraio:"02", marzo:"03", aprile:"04", maggio:"05", giugno:"06", luglio:"07", agosto:"08", settembre:"09", ottobre:"10", novembre:"11", dicembre:"12" };
const HEADERS = { "user-agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 Version/17.6 Mobile/15E148 Safari/604.1", "accept-language":"it-IT,it;q=0.9" };

function dateFrom(text) {
  const m = text.replace(/<[^>]+>/g," ").replace(/\s+/g," ").match(/(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(20\d{2})/i);
  return m ? `${m[3]}-${MONTHS[m[2].toLowerCase()]}-${m[1].padStart(2,"0")}` : "";
}

function parse(html, type) {
  let date = "";
  const year = html.match(/\b\d{2}\|\d{2}\|(20\d{2})\b/)?.[1] || String(new Date().getFullYear());
  const found = [];
  for (const part of html.split(/<tr\b/i).slice(1)) {
    const row = "<tr" + part.split(/<\/tr>/i)[0];
    const nextDate = dateFrom(row) || (() => { const m=row.replace(/<[^>]+>/g," ").match(/(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i); return m ? `${year}-${MONTHS[m[2].toLowerCase()]}-${m[1].padStart(2,"0")}` : ""; })();
    if (/class=["'][^"']*\bdate\b/i.test(row) && nextDate) { date = nextDate; continue; }
    if (!/class=["'][^"']*\bmatch\b/i.test(row) || !date) continue;
    const ids = [...row.matchAll(/data-team-id=["'](\d+)["']/gi)].map(m => Number(m[1]));
    const goals = [...row.matchAll(/class=["'][^"']*goal[^"']*["'][^>]*title=["'][^"']*terminata[^"']*["'][^>]*>\s*(\d+)/gi)].map(m => m[1]);
    if (ids.length < 2 || goals.length !== 2 || !ids.includes(CONFIG.teamId)) continue;
    const url = row.match(/(?:data-link|href)=["']([^"']*\/Partita\/[^"']+)["']/i)?.[1] || "";
    const round = Number(url.match(/\/Partita\/(\d+)\./i)?.[1] || 0);
    const time = row.replace(/<[^>]+>/g," ").match(/\b([01]\d|2[0-3]):[0-5]\d\b/)?.[0] || "00:00";
    found.push({ round, homeId:ids[0], awayId:ids[1], date, time, result:`${goals[0]}-${goals[1]}`, status:"played", url:new URL(url,"https://www.tuttocampo.it").href, key:`${type}|${date}|${ids[0]}|${ids[1]}`, competitionType:type });
  }
  return found;
}

async function roundResults(source, round, type) {
  const sourceUrl = new URL(source);
  const competition = sourceUrl.pathname.match(/^(\/[^/]+\/[^/]+\/[^/]+)/)?.[1];
  if (!competition) return [];
  const pageUrl = new URL(`${competition}/Giornata${round}`, sourceUrl.origin).href;
  const pageResponse = await fetch(pageUrl, { headers:HEADERS });
  const page = await pageResponse.text();
  const token = page.match(/var\s+tckk\s*=\s*["']([^"']+)/i)?.[1];
  if (!token) throw new Error(`Token non trovato per giornata ${round}`);
  const cookie = pageResponse.headers.get("set-cookie")?.split(";")[0] || "";
  const fragment = await fetch(new URL(`/Web/Views/Results/ResultsView.php?tckk=${encodeURIComponent(token)}&v=1`, sourceUrl.origin), { headers:{ ...HEADERS, "x-requested-with":"XMLHttpRequest", referer:pageUrl, ...(cookie ? {cookie} : {}) } });
  return parse(await fragment.text(), type);
}


function parseStandings(html) {
  const strip = value => value.replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
  const rows=[];
  for (const match of html.matchAll(/<tr\b[^>]*data-team-id=["'](\d+)["'][^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells=[...match[2].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)].map(item=>({className:item[1].match(/class=["']([^"']*)/)?.[1]||"",body:item[2]}));
    const teamCell=cells.find(cell=>/\bteam\b/.test(cell.className)&&!/team_logo/.test(cell.className));
    const name=strip(teamCell?.body||"");
    const logo=(match[2].match(/data-src=['"]([^'"]*\/Teams\/(?:40|80)\/[^'"]+)['"]/i)?.[1]||"").replace(/\/Teams\/(?:40|80)\//,"/Teams/Original/");
    const values=cells.filter(cell=>!/(last_match|team_logo|\bteam\b|details)/.test(cell.className)).map(cell=>Number(strip(cell.body)));
    if(name&&values.length>=8) rows.push({position:rows.length+1,id:Number(match[1]),name,logo,points:values[0],played:values[1],won:values[2],drawn:values[3],lost:values[4],goalsFor:values[5],goalsAgainst:values[6],goalDifference:values[7]});
  }
  return rows;
}

async function fetchStandings(source) {
  const sourceUrl=new URL(source); const competition=sourceUrl.pathname.match(/^(\/[^/]+\/[^/]+\/[^/]+)/)?.[1];
  if(!competition) throw new Error("Competizione classifica non riconosciuta");
  const pageUrl=new URL(`${competition}/Classifica`,sourceUrl.origin).href; const pageResponse=await fetch(pageUrl,{headers:HEADERS}); const page=await pageResponse.text();
  const token=page.match(/var\s+tckk\s*=\s*["']([^"']+)/i)?.[1]; const roundId=page.match(/var\s+roundID\s*=\s*["']([^"']+)/i)?.[1]; const matchDay=page.match(/var\s+currentMatchDay\s*=\s*["'](\d+)/i)?.[1]||"";
  if(!token||!roundId) throw new Error("Dati classifica non disponibili");
  const cookie=pageResponse.headers.get("set-cookie")?.split(";")[0]||"";
  const fragmentUrl=new URL(`/Web/Views/Rankings/RankingView.php?tckk=${encodeURIComponent(token)}&category_id=${encodeURIComponent(roundId)}&match_day_id=${encodeURIComponent(matchDay)}&total=true&is_ranking_tab=true`,sourceUrl.origin);
  const fragment=await fetch(fragmentUrl,{headers:{...HEADERS,"x-requested-with":"XMLHttpRequest",referer:pageUrl,...(cookie?{cookie}:{})}}); const html=await fragment.text();
  return {competition:stripTitle(html.match(/<span[^>]*style=["'][^"']*font-size:20px[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1]||"Campionato"),rows:parseStandings(html)};
}
function stripTitle(value){return value.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
const auth = { apikey:CONFIG.apiKey, Authorization:`Bearer ${CONFIG.apiKey}` };
const stateResponse = await fetch(`${CONFIG.projectUrl}/rest/v1/app_state?id=eq.${encodeURIComponent(CONFIG.stateId)}&select=data`, { headers:auth });
if (!stateResponse.ok) throw new Error(`Lettura stato fallita: ${stateResponse.status}`);
const state = (await stateResponse.json())[0]?.data;
const sources = state?.seasonConfig?.calendarSources || [];
const now = Date.now();
for (const source of sources.filter(item => item.enabled !== false && item.url)) {
  const eligible = (source.snapshot?.matches || []).filter(match => match.round && Date.parse(`${match.date}T${match.time || "00:00"}:00+02:00`) + 3*3600000 <= now);
  const upcomingRound = (source.snapshot?.matches || []).filter(match => match.round && Date.parse(`${match.date}T${match.time || "00:00"}:00+02:00`) > now).map(match => Number(match.round)).sort((a,b)=>a-b)[0];
  const backfill = source.type === "league" && upcomingRound ? Array.from({length:Math.max(0,upcomingRound-1)},(_,i)=>i+1) : [];
  const rounds = [...new Set([...eligible.map(match => Number(match.round)), ...backfill])];
  const matches = [];
  for (const round of rounds) matches.push(...await roundResults(source.url, round, source.type || "league"));
  if (!matches.length) continue;
  const saved = await fetch(`${CONFIG.projectUrl}/rest/v1/rpc/merge_calendar_results`, { method:"POST", headers:{...auth,"content-type":"application/json"}, body:JSON.stringify({p_source_type:source.type || "league",p_matches:matches}) });
  if (!saved.ok) throw new Error(`Salvataggio risultati fallito: ${saved.status} ${await saved.text()}`);
  console.log(`${source.name || source.type}: ${matches.length} risultati verificati`);
}

const leagueSource=sources.find(item=>item.enabled!==false&&item.type==="league"&&item.url);
if(leagueSource){
  const previous=Date.parse(leagueSource.snapshot?.standings?.updatedAt||0)||0; const localHour=Number(new Intl.DateTimeFormat("it-IT",{timeZone:"Europe/Rome",hour:"2-digit",hour12:false}).format(new Date())); const day=Number(new Intl.DateTimeFormat("en-US",{timeZone:"Europe/Rome",weekday:"short"}).format(new Date())==="Sat"?6:new Intl.DateTimeFormat("en-US",{timeZone:"Europe/Rome",weekday:"short"}).format(new Date())==="Sun"?0:-1);
  const weekendAfterMatches=(day===0||day===6)&&localHour>=18; const due=Date.now()-previous>20*3600000||(weekendAfterMatches&&Date.now()-previous>2*3600000);
  if(due){const standings=await fetchStandings(leagueSource.url);if(standings.rows.length){const saved=await fetch(`${CONFIG.projectUrl}/rest/v1/rpc/merge_calendar_standings`,{method:"POST",headers:{...auth,"content-type":"application/json"},body:JSON.stringify({p_rows:standings.rows,p_competition:standings.competition,p_updated_at:new Date().toISOString()})});if(!saved.ok)throw new Error(`Salvataggio classifica fallito: ${saved.status} ${await saved.text()}`);console.log(`Classifica: ${standings.rows.length} squadre`);}}
}