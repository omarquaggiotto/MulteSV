# MulteFC — correzione export iPhone, 23 settembre 2026

Base: commit c7525ffb3636c7ecb991f56a51b100a57c167f51, versione stabile indicata dall'utente. Il piano generale del 17 settembre non va riapplicato.

## Problema e modifica

L'export della tabella già generava un canvas indipendente dal viewport. L'anteprima offriva però solo un link download con data URL: nessuna condivisione nativa del file. Questa revisione prepara un Blob PNG e, quando supportato, un File condivisibile. Il pulsante **Condividi / Salva** chiama navigator.share direttamente dal tocco, con il file già pronto, così non perde l'attivazione utente durante conversioni asincrone. Mantiene Scarica PNG, Apri immagine e anteprima come alternative.

La causa esatta sul telefono dell'utente non è stata riprodotta fisicamente: non dichiarare risolto definitivamente il salvataggio iOS finché non viene confermato.

- Risoluzione adattiva fino a 4 milioni di pixel e 4096 pixel per lato, anziché scala 2 fissa indipendente dal numero di righe.
- Rilascio del canvas dopo la conversione, pulizia dei Blob URL dopo la chiusura, gestione chiusura durante la conversione e degli errori PNG.
- Annullare la condivisione lascia aperta l'anteprima; errore o funzione non supportata lascia disponibili le alternative.
- Testi limitati alla rispettiva colonna per evitare sovrapposizioni con nomi lunghi.
- Mese di fallback dell'export coerente con quello visualizzato nella tabella.
- File modificati: app.js, style.css, index.html, service-worker.js. Cache nuova: multefc-v32-export-ios; asset: export-ios-42.
- Autenticazione, permessi, Supabase, struttura dati e calcoli di pagamenti invariati. Nessuna scrittura verso Supabase durante sviluppo e test.

## Verifiche eseguite

Test su dati sintetici, con traffico verso i servizi esterni intercettato; nessun dato reale usato per operazioni di prova.

- Sintassi JavaScript verificata.
- WebKit con viewport/touch iPhone 13 e Chromium/Edge desktop: export completo, soli insoluti e stagione, PNG scaricabile e valido.
- Condivisione simulata: file PNG pronto, chiamata con attivazione utente, annullamento, errore, funzione non supportata.
- PNG identico cambiando tema, ruolo e posizione scroll; stato applicativo e localStorage invariati dall'export.
- 1, 28 e 100 giocatori; nessun insoluto; nome lungo; mese non più nella stagione.
- Chiusura durante conversione e conversione fallita; rilascio memoria canvas.
- Immagine per 28 giocatori: 1655 × 2416 pixel, meno di 4 milioni di pixel.
- Anteprima mobile verificata visivamente.
- Chromium: upgrade Service Worker v31 → v32, pulizia della vecchia cache, ricaricamento offline ed export dalla copia locale.
- Il test di reload offline nel WebKit Windows di Playwright ha restituito un errore interno del motore; il medesimo scenario è stato verificato con successo in Chromium. Non equivale a una verifica della PWA installata su iPhone.

## Verifica richiesta su iPhone reale

Aprire l'app online, chiuderla completamente e riaprirla. In Pagamenti usare Esporta tabella completa o Esporta solo da pagare. Nell'anteprima deve apparire Condividi / Salva se Safari supporta la condivisione di file. Provare Salva immagine e Salva su File nel menu nativo. Verificare anche dalla PWA installata. Non disinstallare l'app o cancellare i dati per aggiornarla.

## Backup e rollback

Backup sorgenti precedenti: MulteFC-backup-prima-export-2026-09-23.zip, conservato tra gli output della task. Per rollback ripubblicare i quattro file precedenti, usando una nuova versione cache superiore a v32 per non lasciare client sulla revisione annullata. Non ripristinare i dati della squadra: questa modifica riguarda solo il software.

Riferimenti tecnici: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share e https://bugs.webkit.org/show_bug.cgi?id=225559 (attivazione utente richiesta per la condivisione).
