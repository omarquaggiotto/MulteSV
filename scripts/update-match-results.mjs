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
