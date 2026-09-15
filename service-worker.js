const CACHE_NAME = "multefc-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./assets/icon.svg"
];


/* =========================================================
   INSTALLAZIONE
   ========================================================= */

self.addEventListener("install", event => {

    event.waitUntil(

        caches
            .open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    self.skipWaiting();

});


/* =========================================================
   ATTIVAZIONE
   ========================================================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches
            .keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(
                            key =>
                                key !== CACHE_NAME
                        )
                        .map(
                            key =>
                                caches.delete(key)
                        )

                );

            })

    );

    self.clients.claim();

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", event => {

    if (
        event.request.method !== "GET"
    ) {
        return;
    }


    event.respondWith(

        fetch(event.request)

            .then(response => {

                const responseClone =
                    response.clone();

                caches
                    .open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            event.request,
                            responseClone
                        );

                    });

                return response;

            })

            .catch(() => {

                return caches.match(
                    event.request
                );

            })

    );

});
