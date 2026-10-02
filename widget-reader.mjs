// Read-only adapter: never executes remote HTML or writes application state.
const text = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const attr = (html, name) => html.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] || '';
const cells = html => [...html.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)].map(m => ({className:attr(m[1],'class'),html:m[2]}));
const cell = (list, name) => list.find(c => c.className.split(/\s+/).includes(name))?.html || '';
function team(html,logoHtml=html) {
  const link = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].find(m => /\/Squadra\/\d+/.test(attr(m[1],'href')));
  if (!link) throw new Error('Squadra non riconosciuta nel widget');
  const url = new URL(attr(link[1],'href'));
  if (url.origin !== 'https://www.tuttocampo.it') throw new Error('Origine squadra non valida');
  const id = Number(url.pathname.match(/\/Squadra\/(\d+)/)[1]);
  const widgetLogo=attr(logoHtml.match(/<img\b([^>]*)>/i)?.[1]||'','src').replace(/&amp;/g,'&');
  let logo=`https://b2-content.tuttocampo.it/Teams/Original/${id}.png`;
  if(/default_team_logo/i.test(widgetLogo)){
    const logoUrl=new URL(widgetLogo,'https://www.tuttocampo.it');
    if(logoUrl.protocol==='https:'&&logoUrl.hostname==='b2-content.tuttocampo.it')logo=logoUrl.href;
  }
  return {id,name:text(link[2]),logo};
}
export function parseWidgetStandings(html, ownId) {
  const table = html.match(/<table\b[^>]*class=["'][^"']*table_ranking[^"']*["'][^>]*>([\s\S]*?)<\/table>/i)?.[1];
  if (!table) throw new Error('Classifica assente: conservare la copia precedente');
  const rows = [];
  for (const row of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const list = cells(row[1]); if (!cell(list,'team')) continue;
    const entry = {...team(cell(list,'team'),cell(list,'team_logo')),position:rows.length+1};
    for (const [key,cls] of Object.entries({points:'pt',played:'pg',won:'vt',drawn:'pa',lost:'sc',goalsFor:'gf',goalsAgainst:'gs',goalDifference:'dr'})) {
      const value=text(cell(list,cls)); if(!/^-?\d+$/.test(value)) throw new Error('Classifica incompleta'); entry[key]=Number(value);
    }
    rows.push(entry);
  }
  if (!rows.length || !rows.some(r=>r.id===Number(ownId)) || new Set(rows.map(r=>r.id)).size!==rows.length) throw new Error('Il widget non corrisponde alla squadra');
  return {updatedAt:new Date().toISOString(),rows};
}
function italianDate(value, season) {
  const months=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  const m=value.toLowerCase().match(/\b(\d{1,2})\s+([a-zà]+)\b/); if(!m)return '';
  const month=months.indexOf(m[2])+1,start=Number(season.slice(0,4)); if(!month||!start)return '';
  const year=month>=7?start:start+1,day=Number(m[1]),d=new Date(Date.UTC(year,month-1,day));
  if(d.getUTCMonth()!==month-1)return '';
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
export function parseWidgetResults(html,{teamId,season,type='league',includeAll=false}) {
  const table=html.match(/<table\b[^>]*class=["'][^"']*table-results[^"']*["'][^>]*>([\s\S]*?)<\/table>/i)?.[1];
  if(!table)throw new Error('Risultati assenti: conservare la copia precedente');
  let date=''; const teams=new Map(),matches=[];
  for(const row of table.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi)) {
    const classes=attr(row[1],'class').split(/\s+/);
    if(classes.includes('date')){date=italianDate(text(row[2]),season);continue;}
    if(!classes.includes('match'))continue;
    if(!includeAll&&!new RegExp(`/Squadra/${Number(teamId)}(?:[?/'\"])`).test(row[2]))continue;
    const list=cells(row[2]);
    let home,away;
    try { home=team(cell(list,'home'));away=team(cell(list,'away')); }
    catch(error){ if(includeAll)continue; throw error; }
    if(!includeAll&&home.id!==Number(teamId)&&away.id!==Number(teamId))continue;
    const href=[...row[2].matchAll(/href=["']([^"']*\/Partita\/[^"']+)["']/gi)][0]?.[1];
    const url=new URL(href); if(url.origin!=='https://www.tuttocampo.it'||!url.pathname.startsWith(`/${season}/`))throw new Error('Stagione o origine partita non valida');
    url.search=''; const round=Number(url.pathname.match(/\/Partita\/(\d+)\./)?.[1]||0);
    const time=text(cell(list,'match-time')).match(/\b(?:[01]\d|2[0-3]):[0-5]\d\b/)?.[0]||'';
    const goals=[...row[2].matchAll(/<span\b([^>]*)>([\s\S]*?)<\/span>/gi)].filter(m=>attr(m[1],'class').split(/\s+/).includes('goal'));
    const played=goals.length===2&&goals.every(m=>/terminata/i.test(attr(m[1],'title'))&&/^\d+$/.test(text(m[2])));
    if(!date)throw new Error('Data partita non leggibile');
    const place=[...row[2].matchAll(/title=["'](Stadio:[^"']+)["']/gi)][0]?.[1]?.replace(/^Stadio:\s*/,'')||'';
    teams.set(home.id,home);teams.set(away.id,away);
    matches.push({round,homeId:home.id,awayId:away.id,date,time,place:text(place),result:played?goals.map(m=>text(m[2])).join('-'):'',status:played?'played':/rinviata/i.test(text(row[2]))?'postponed':'scheduled',url:url.href,key:`${type}|${url.pathname}`,competitionType:type});
  }
  return {type,season:season.replace('-','/'),teams:[...teams.values()],matches,partial:true};
}
export function validateWidgetUrl(value) {
  const url=new URL(value);
  if(url.origin!=='https://www.tuttocampo.it'||!/^\/WidgetV2\/(Classifica|Risultati|Partita|ProssimaPartita)\/[0-9a-f-]{36}(?:\/\d+)?$/i.test(url.pathname)||url.username||url.password)throw new Error('Inserisci il link di un widget attivato');
  return url;
}
export async function readWidget(value,{signal}={}) {
  const url=validateWidgetUrl(value),response=await fetch(url,{credentials:'omit',signal:signal||AbortSignal.timeout(15000)});
  if(response.status!==200)throw new Error(`Widget non disponibile (${response.status})`);
  const html=await response.text();if(!html.trim()||html.length>2000000)throw new Error('Risposta widget non valida');return html;
}
export async function importWidgetCalendar({widgetUrl,teamId,season,type='league',source,competition}) {
  if(!/^20\d{2}-\d{2}$/.test(season))throw new Error('Stagione widget non valida');
  const base=validateWidgetUrl(widgetUrl);base.pathname=base.pathname.replace(/\/(Classifica|Partita|ProssimaPartita)\//,'/Risultati/').replace(/\/[0-9]+$/,'');base.search='';base.searchParams.set('y',season);
  const first=await readWidget(base.href),queue=[base.href],pages=new Map([[base.href,first]]),seen=new Set(),matches=new Map(),teams=new Map();
  while(queue.length){
    const current=queue.shift();if(seen.has(current))continue;seen.add(current);
    if(seen.size>80)throw new Error('Calendario troppo esteso: verifica il widget');
    const html=pages.get(current)||await readWidget(current),parsed=parseWidgetResults(html,{teamId,season,type,includeAll:true});
    parsed.matches.forEach(m=>matches.set(m.key,m));parsed.teams.forEach(t=>teams.set(t.id,t));
    for(const link of html.matchAll(/href=["']([^"']*\/WidgetV2\/Risultati\/[^"']+)["']/gi)){
      const url=new URL(link[1].replace(/&amp;/g,'&'),base);
      if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname+'/'))continue;
      validateWidgetUrl(url.href);url.search='';url.searchParams.set('y',season);
      if(!seen.has(url.href)&&!queue.includes(url.href))queue.push(url.href);
    }
  }
  if(!matches.size)throw new Error('Il widget non contiene partite della squadra');
  const rankingUrl=new URL(base);rankingUrl.pathname=rankingUrl.pathname.replace('/Risultati/','/Classifica/');
  // A league import is atomic: do not replace a valid snapshot with missing standings.
  const standings=type==='league'?parseWidgetStandings(await readWidget(rankingUrl.href),teamId):undefined;
  return {type,season:season.replace('-','/'),competition:competition||'Campionato',source,widgetUrl:base.href,importedAt:new Date().toISOString(),teams:[...teams.values()],matches:[...matches.values()].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)),venues:{},...(standings?{standings:{...standings,competition:competition||'Campionato'}}:{})};
}
