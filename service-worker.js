const CACHE_NAME = "multefc-v39-fresh-assets";
const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./next-match.js",
    "./manifest.json",
    "./assets/multe-sv-icon.png",
    "./san-vitale-logo.png",
    "./san-vitale-background.png",
    "./vendor/html2canvas.min.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL.map(url => new Request(url, { cache: "reload" }))))
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key.startsWith("multefc-") && key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Cache solo dell'interfaccia locale: i dati Supabase restano sempre separati.
self.addEventListener("fetch", event => {
    const request = event.request;
    const url = new URL(request.url);

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
