const CACHE_NAME = "multesv-lightweight-shell-20261007-30-forced-migration";
const APP_SHELL = [
    "./widget-reader.mjs",
    "./sports-widgets.mjs",
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./birthdays.js",
    "./birthdays.css",
    "./history.js",
    "./migration-invite.js",
    "./next-match.js",
    "./standings-data.js",
    "./customization-lab.js",
    "./customization-lab.css",
    "./satispay-icon.ico",
    "./manifest.json",
    "./assets/multe-sv-icon.png",
    "./san-vitale-logo.png",
    "./san-vitale-background.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL.map(url => new Request(url, { cache: "reload" }))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("message", event => {
    if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    // Elimina anche le cache delle versioni precedenti al cambio di nome.
                    .filter(key => (key.startsWith("multesv-") || key.startsWith("multefc-")) && key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
            .then(() => self.clients.matchAll({ type: "window" }))
            .then(clients => Promise.all(clients.map(client => client.navigate(client.url))))
    );
});

// Cache solo dell'interfaccia locale: i dati Supabase restano sempre separati.
self.addEventListener("fetch", event => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method === "GET" && request.destination === "image" && url.hostname === "b2-content.tuttocampo.it") {
        event.respondWith(
            caches.match(request).then(cached => cached || fetch(request).then(response => {
                if (response.ok || response.type === "opaque") {
                    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())));
                }
                return response;
            }))
        );
        return;
    }

    if (request.method !== "GET" || url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request, { cache: "no-cache" })
                .then(response => {
                    if (!response.ok) throw new Error("Pagina non disponibile");
                    const copy = response.clone();
                    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy)));
                    return response;
                })
                .catch(() => caches.match("./index.html"))
        );
        return;
    }

    // CSS e JavaScript con ?v= devono essere aggiornati online: la cache
    // resta solo il fallback se manca la connessione, senza bloccare le novità.
    if (url.searchParams.has("v")) {
        event.respondWith(
            fetch(request, { cache: "no-cache" })
                .then(response => {
                    if (response.ok) {
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, response.clone()));
                    }
                    return response;
                })
                .catch(() => caches.match(request, { ignoreSearch: true }))
        );
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cached => cached || fetch(request))
    );
});
