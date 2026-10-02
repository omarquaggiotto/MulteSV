import {importWidgetCalendar} from './widget-reader.mjs';
// Explicit season/competition bindings. Never reuse last season's widget silently.
export const SOURCES={
 league:{season:'2026/27',root:'/Veneto/TerzaCategoria/GironeAVicenza/',id:'7a2e71d1-370d-4ba9-ac01-fb76b32c8d21',competition:'Terza Categoria · Vicenza · Girone Unico'},
 cup:{season:'2026/27',root:'/Veneto/TerzaCategoria/GironeCoppaGianmauroAnniVicenza/',id:'32ad2b37-cbd4-4fbb-bbb0-b7393e4c33d3',competition:'Coppa Provincia di Vicenza · Memorial Gianmauro Anni'}
};
export function supportsWidget({type,url,teamId,season}){
 const config=SOURCES[type];let link;try{link=new URL(url);}catch{return false;}
 return Boolean(config&&[1199590,1238518].includes(Number(teamId))&&season===config.season&&link.origin==='https://www.tuttocampo.it'&&link.pathname.startsWith(config.root));
}
export function mergeCalendar(previous,next){
 if(!previous||previous.season!==next.season)return next;
 const old=previous.matches||[],same=(a,b)=>Number(a.homeId)===Number(b.homeId)&&Number(a.awayId)===Number(b.awayId)&&(a.round===b.round||a.date===b.date);
 const matches=next.matches.map(match=>{const saved=old.find(m=>same(m,match));if(!saved)return match;const merged={...saved,...match,place:match.place||saved.place||'',key:saved.key||match.key};if(!match.result&&saved.result){merged.result=saved.result;merged.status=saved.status;}return merged;});
 old.filter(m=>!next.matches.some(n=>same(m,n))).forEach(m=>matches.push({...m}));
 const teams=new Map((previous.teams||[]).map(t=>[Number(t.id),{...t}]));
 next.teams.forEach(t=>teams.set(Number(t.id),{...t,...teams.get(Number(t.id))}));
 return {...previous,...next,teams:[...teams.values()],matches:matches.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)),venues:{...next.venues,...previous.venues}};
}
export async function importSportsWidget(options){
 if(!supportsWidget(options))return null;
 const cfg=SOURCES[options.type],calendar=await importWidgetCalendar({widgetUrl:`https://www.tuttocampo.it/WidgetV2/Risultati/${cfg.id}`,teamId:options.teamId,season:options.season.replace('/','-'),type:options.type,source:options.url,competition:cfg.competition});
 return mergeCalendar(options.previous,calendar);
}
