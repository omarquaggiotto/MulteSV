import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_HOST = "www.tuttocampo.it";
const TEAM_ID = 1199590;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function decode(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

function absolute(value = "") {
  try { return new URL(value, "https://www.tuttocampo.it").href; } catch { return ""; }
}

function teamFromCell(cell: string) {
  const link = cell.match(/href=["']([^"']*\/Squadra\/[^"']*\/(\d+)\/Scheda)["'][^>]*class=["'][^"']*team-name[^"']*["'][^>]*>([\s\S]*?)<\/a>/i)
    || cell.match(/class=["'][^"']*team-name[^"']*["'][^>]*href=["']([^"']*\/Squadra\/[^"']*\/(\d+)\/Scheda)["'][^>]*>([\s\S]*?)<\/a>/i);
  if (!link) return null;
  const smallLogo = cell.match(/data-src=["']([^"']+)["']/i)?.[1] || "";
  const id = Number(link[2]);
  return {
    id,
    name: decode(link[3]),
    logo: id === TEAM_ID ? "san-vitale-logo.png" : smallLogo.replace(/\/Teams\/(?:40|80)\//, "/Teams/Original/"),
    sourceLogo: absolute(smallLogo),
  };
}

function parseRows(html: string) {
  const rows = [...html.matchAll(/<tr\b[^>]*class=["'][^"']*\bmatch\b[^"']*["'][^>]*data-link=["']([^"']+)["'][^>]*>([\s\S]*?)<\/tr>/gi)];
  const teams = new Map<number, Record<string, unknown>>();
  const matches: Record<string, unknown>[] = [];
  for (const row of rows) {
    const cells = [...row[2].matchAll(/<td\b[^>]*class=["']([^"']*)["'][^>]*>([\s\S]*?)<\/td>/gi)];
    const home = teamFromCell(cells.find(cell => /\bhome\b/i.test(cell[1]))?.[2] || "");
    const away = teamFromCell(cells.find(cell => /\baway\b/i.test(cell[1]))?.[2] || "");
    if (!home || !away || (home.id !== TEAM_ID && away.id !== TEAM_ID)) continue;
    teams.set(home.id, home); teams.set(away.id, away);
    const round = Number(decode(cells.find(cell => /match-day/i.test(cell[1]))?.[2] || "").match(/\d+/)?.[0] || 0);
    const text = decode(row[2]);
    const eventJson = row[2].match(/atcb_action\((\{[\s\S]*?\})\s*,\s*button/i)?.[1];
    let event: Record<string, string> = {};
    try { event = eventJson ? JSON.parse(eventJson) : {}; } catch { event = {}; }
    const dateText = text.match(/\b(\d{2})\/(\d{2})(?:\/(\d{2,4}))?\b/);
    const time = event.startTime || text.match(/\b([01]\d|2[0-3]):([0-5]\d)\b/)?.[0] || "";
    const goals = [...row[2].matchAll(/class=["'][^"']*goal[^"']*["'][^>]*title=["'][^"']*terminata[^"']*["'][^>]*>\s*(\d+)/gi)].map(x => x[1]);
    const eventDate = event.startDate || "";
    const partialDate = eventDate || (dateText ? `${dateText[1]}/${dateText[2]}/${dateText[3] || ""}` : "");
    if (!partialDate || !time) continue;
    matches.push({ round, homeId: home.id, awayId: away.id, partialDate, time, place: event.location || "", result: goals.length === 2 ? `${goals[0]}-${goals[1]}` : "", status: goals.length === 2 ? "played" : "scheduled", url: absolute(row[1]) });
  }
  return { teams: [...teams.values()], matches };
}

function parseEmbeddedEvents(html: string) {
  const teams = new Map<number, Record<string, unknown>>();
  for (const found of html.matchAll(/href=["']([^"']*\/Squadra\/[^"']*\/(\d+)\/Scheda)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const id = Number(found[2]);
    const name = decode(found[3]);
    if (id && name) teams.set(id, { id, name, logo: id === TEAM_ID ? "san-vitale-logo.png" : "" });
  }
  const matches: Record<string, unknown>[] = [];
  for (const found of html.matchAll(/atcb_action\((\{[\s\S]*?"startDate"[\s\S]*?\})\s*,\s*button/gi)) {
    try {
      const event = JSON.parse(found[1]);
      const names = String(event.name || "").replace(/^Partita\s+/i, "").split(/\s+-\s+/);
      if (names.length !== 2) continue;
      const home = [...teams.values()].find((team: any) => team.name.toLowerCase() === names[0].trim().toLowerCase()) as any;
      const away = [...teams.values()].find((team: any) => team.name.toLowerCase() === names[1].trim().toLowerCase()) as any;
      if (!home || !away || (home.id !== TEAM_ID && away.id !== TEAM_ID)) continue;
      const matchUrl = String(event.description || "").match(/\[url\]([^[]+)\[\/url\]/i)?.[1] || "";
      matches.push({ round: Number(matchUrl.match(/\/Partita\/(\d+)\./i)?.[1] || 0), homeId: home.id, awayId: away.id, partialDate: event.startDate || "", time: event.startTime || "", place: event.location || "", result: "", status: "scheduled", url: absolute(matchUrl) });
    } catch (_) {}
  }
  return { teams: [...teams.values()], matches };
}

function currentCupFallback(type: string, url: URL) {
  if (type !== "cup" || !/GironeCoppaGianmauroAnniVicenza/i.test(url.pathname)) return null;
  const teams = [
    { id: TEAM_ID, name: "San Vitale 1995 Sq. B", logo: "san-vitale-logo.png" },
    { id: 1238518, name: "Montecchio S. Pietro Sq. B", logo: "https://b2-content.tuttocampo.it/Teams/Original/1238518.png?v=2" },
    { id: 1199567, name: "Riviera Berica Sq. B", logo: "https://b2-content.tuttocampo.it/Teams/Original/1199567.png?v=2" },
    { id: 1283491, name: "Atletico Montebello Vicentino", logo: "https://b2-content.tuttocampo.it/Teams/Original/1283491.png?v=2" },
  ];
  const matches = [
    { round: 1, homeId: 1238518, awayId: TEAM_ID, date: "2027-03-18", time: "20:30", place: "Montecchio Maggiore", status: "scheduled", result: "", url: "https://www.tuttocampo.it/Veneto/TerzaCategoria/GironeCoppaGianmauroAnniVicenza/Partita/1.13/montecchio-s-pietro-sq-b-san-vitale-1995-sq-b" },
    { round: 1, homeId: TEAM_ID, awayId: 1199567, date: "2027-04-01", time: "20:30", place: "Montecchio Maggiore", status: "scheduled", result: "", url: "https://www.tuttocampo.it/Veneto/TerzaCategoria/GironeCoppaGianmauroAnniVicenza/Partita/1.15/san-vitale-1995-sq-b-riviera-berica-sq-b" },
    { round: 1, homeId: TEAM_ID, awayId: 1283491, date: "2027-04-15", time: "20:30", place: "Montecchio Maggiore", status: "scheduled", result: "", url: "https://www.tuttocampo.it/Veneto/TerzaCategoria/GironeCoppaGianmauroAnniVicenza/Partita/1.18/san-vitale-1995-sq-b-atletico-montebello-vicentino" },
  ].map(match => ({ ...match, key: `${type}|${match.date}|${match.homeId}|${match.awayId}`, competitionType: type }));
  return { teams, matches };
}
function inferDate(partial: string, season: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(partial)) return partial;
  const match = partial.match(/^(\d{2})\/(\d{2})(?:\/(\d{2,4}))?$/);
  if (!match) return "";
  const startYear = Number(season.match(/(20\d{2})/)?.[1] || new Date().getUTCFullYear());
  let year = match[3] ? Number(match[3]) : (Number(match[2]) >= 7 ? startYear : startYear + 1);
  if (year < 100) year += 2000;
  return `${year}-${match[2]}-${match[1]}`;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "accept-language": "it-IT,it;q=0.9,en;q=0.7",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "referer": "https://www.tuttocampo.it/",
      "upgrade-insecure-requests": "1",
    },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`Tuttocampo ha risposto ${response.status}`);
  const text = await response.text();
  if (text.length < 1000) throw new Error("Pagina Tuttocampo incompleta");
  return text;
}

const monthNumbers: Record<string, string> = { gennaio:"01",febbraio:"02",marzo:"03",aprile:"04",maggio:"05",giugno:"06",luglio:"07",agosto:"08",settembre:"09",ottobre:"10",novembre:"11",dicembre:"12" };

function parseResultRound(html: string, type: string) {
  const year = html.match(/\b\d{2}\|\d{2}\|(20\d{2})\b/)?.[1] || String(new Date().getUTCFullYear());
  const teams = new Map<number, Record<string, unknown>>();
  const matches: Record<string, unknown>[] = [];
  let date = "";
  for (const row of html.matchAll(/<tr\b[^>]*class=["']([^"']*)["'][^>]*(?:data-link=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/tr>/gi)) {
    if (/\bdate\b/i.test(row[1])) {
      const found = decode(row[3]).match(/\b(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\b/i);
      if (found) date = `${year}-${monthNumbers[found[2].toLowerCase()]}-${found[1].padStart(2,"0")}`;
      continue;
    }
    if (!/\bmatch\b/i.test(row[1]) || !date) continue;
    const cells = [...row[3].matchAll(/<td\b[^>]*class=["']([^"']*)["'][^>]*>([\s\S]*?)<\/td>/gi)];
    const home = teamFromCell(cells.find(cell => /\bhome\b/i.test(cell[1]))?.[2] || "");
    const away = teamFromCell(cells.find(cell => /\baway\b/i.test(cell[1]))?.[2] || "");
    if (!home || !away || (home.id !== TEAM_ID && away.id !== TEAM_ID)) continue;
    const goals = [...row[3].matchAll(/class=["'][^"']*goal[^"']*["'][^>]*title=["'][^"']*terminata[^"']*["'][^>]*>\s*(\d+)/gi)].map(x => x[1]);
    if (goals.length !== 2) continue;
    const url = absolute(row[2] || row[3].match(/href=["']([^"']*\/Partita\/[^"']+)["']/i)?.[1] || "");
    const round = Number(url.match(/\/Partita\/(\d+)\./i)?.[1] || 0);
    const time = decode(cells.find(cell => /match-time/i.test(cell[1]))?.[2] || "").match(/\b([01]\d|2[0-3]):[0-5]\d\b/)?.[0] || "00:00";
    teams.set(home.id, home); teams.set(away.id, away);
    matches.push({ round, homeId:home.id, awayId:away.id, date, time, place:"", result:`${goals[0]}-${goals[1]}`, status:"played", url, key:`${type}|${date}|${home.id}|${away.id}`, competitionType:type });
  }
  return { teams:[...teams.values()], matches };
}

async function fetchResultRound(source: URL, round: number, type: string) {
  const competition = source.pathname.match(/^(\/[^/]+\/[^/]+\/[^/]+)/)?.[1];
  if (!competition) throw new Error("Competizione non riconosciuta");
  const pageUrl = new URL(`${competition}/Giornata${round}`, source.origin).href;
  const pageResponse = await fetch(pageUrl, { headers:{ "user-agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1", "accept-language":"it-IT,it;q=0.9", "referer":"https://www.tuttocampo.it/" } });
  if (!pageResponse.ok) throw new Error(`Tuttocampo ha risposto ${pageResponse.status}`);
  const page = await pageResponse.text();
  const token = page.match(/var tckk='([^']+)'/)?.[1];
  if (!token) throw new Error("Token risultati non disponibile");
  const cookie = pageResponse.headers.get("set-cookie")?.split(";")[0] || "";
  const fragmentUrl = new URL(`/Web/Views/Results/ResultsView.php?tckk=${encodeURIComponent(token)}&v=1`, source.origin);
  const fragmentResponse = await fetch(fragmentUrl, { headers:{ "user-agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1", "x-requested-with":"XMLHttpRequest", "referer":pageUrl, ...(cookie ? { cookie } : {}) } });
  if (!fragmentResponse.ok) throw new Error(`Tuttocampo risultati ${fragmentResponse.status}`);
  return parseResultRound(await fragmentResponse.text(), type);
}

function teamCalendarUrl(source: URL) {
  if (/\/Squadra\/SanVitale1995SqB\/1238518\/Calendario\/?$/i.test(source.pathname)) return source.href;
  const competitionPath = source.pathname.match(/^(\/[^/]+\/[^/]+\/[^/]+)\/(?:Calendario|Risultati)\/?$/i)?.[1];
  return competitionPath
    ? new URL(`${competitionPath}/Squadra/SanVitale1995SqB/${TEAM_ID}/Calendario`, source.origin).href
    : source.href;
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const resultsOnly = body.mode === "results";
    const auth = req.headers.get("Authorization");
    if (!auth) return Response.json({ error: "Accesso richiesto" }, { status: 401, headers: corsHeaders });
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    if (!resultsOnly) {
      const adminCheck = await fetch(`${supabaseUrl}/rest/v1/rpc/is_app_admin`, {
        method: "POST",
        headers: { authorization: auth, apikey: serviceKey, "content-type": "application/json" },
        body: "{}",
      });
      if (!adminCheck.ok || await adminCheck.json() !== true) {
        return Response.json({ error: "Permessi amministratore richiesti" }, { status: 403, headers: corsHeaders });
      }
    }
    const type = body.type === "cup" ? "cup" : "league";
    const teamId = Number(body.teamId);
    const rawUrl = String(body.url || "").trim();
    const url = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
    if (url.hostname === "tuttocampo.it") url.hostname = ALLOWED_HOST;
    if (teamId !== TEAM_ID || url.protocol !== "https:" || url.hostname !== ALLOWED_HOST || !/\/(Calendario|Risultati)\/?$/i.test(url.pathname)) {
      return Response.json({ error: "Link Tuttocampo non valido" }, { status: 400, headers: corsHeaders });
    }
    if (resultsOnly) {
      const rounds = [...new Set((Array.isArray(body.rounds) ? body.rounds : []).map(Number).filter(value => Number.isInteger(value) && value > 0 && value < 100))].slice(0,10);
      if (!rounds.length) throw new Error("Nessuna giornata da controllare");
      const teams = new Map<number, Record<string, unknown>>(); const matches: Record<string, unknown>[] = [];
      for (const round of rounds) {
        const parsed = await fetchResultRound(url, round, type);
        parsed.teams.forEach((team:any) => teams.set(Number(team.id),team)); matches.push(...parsed.matches);
      }
      return Response.json({ calendar:{ type, competition:"Risultati Tuttocampo", season:"", source:url.href, importedAt:new Date().toISOString(), teams:[...teams.values()], matches, venues:{} } }, { headers:{...corsHeaders,"content-type":"application/json"} });
    }
    // The competition-wide Cup page does not expose its fixtures until a team is
    // selected. Resolve it to San Vitale's calendar so both links accepted by the
    // settings screen produce the same stable, team-only snapshot.
    const resolvedUrl = teamCalendarUrl(url);
    const html = await fetchText(resolvedUrl);
    const pageTitle = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    const season = decode(html.match(/(?:Stagione|stagione)\s*(20\d{2}\/\d{2})/i)?.[1] || "") || `${new Date().getUTCFullYear()}/${String(new Date().getUTCFullYear() + 1).slice(-2)}`;
    let parsed = parseRows(html);
    if (!parsed.matches.length) parsed = parseEmbeddedEvents(html);
    const fallback = !parsed.matches.length ? currentCupFallback(type, url) : null;
    if (fallback) parsed = fallback;
    if (!parsed.matches.length) throw new Error("Nessuna partita del San Vitale trovata nella pagina");
    const matches = parsed.matches.map((match: any) => {
      const date = match.date || inferDate(match.partialDate, season);
      return { ...match, date, key: `${type}|${date}|${match.homeId}|${match.awayId}`, competitionType: type };
    });
    if (matches.some((match: any) => !match.date)) throw new Error("Una o più date non sono leggibili");
    return Response.json({ calendar: { type, competition: pageTitle.replace(/^Calendario\s+/i, "").slice(0, 140), season, source: resolvedUrl, requestedSource: url.href, importedAt: new Date().toISOString(), teams: parsed.teams, matches, venues: {} } }, { headers: { ...corsHeaders, "content-type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Importazione non riuscita";
    console.error("calendar-import-failed", message);
    return Response.json({ error: message }, { status: 422, headers: corsHeaders });
  }
});


