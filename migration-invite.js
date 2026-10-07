(function () {
    const NEW_APP_URL = "https://multesquadra.pages.dev/?configured=1&install=1&migration=sv&pwaName=Multe+SV&pwaTeam=San+Vitale+1995+Sq.+B&pwaLogo=https%3A%2F%2Fb2-content.tuttocampo.it%2FTeams%2FOriginal%2F1199590.png%3Fv%3D2&pwaColor=%232563eb&appTeam=5ec10f47-f401-4207-9c61-97bc2642e87a&invite=_BJvgyQPkH8pdiTrVPQjCUtaRpcwVjwQrFz6nzihphM";

    async function copyNewAppLink() {
        try {
            await navigator.clipboard.writeText(NEW_APP_URL);
            showToast("Link copiato. Aprilo in Safari per installare la nuova app.");
        } catch {
            window.prompt("Copia questo link e aprilo in Safari", NEW_APP_URL);
        }
    }

    function openMigrationGuide() {
        if (typeof openModal !== "function") {
            location.href = NEW_APP_URL;
            return;
        }
        openModal("La nuova Multe SV", `
            <div class="migration-guide">
                <div class="migration-guide-hero"><img src="san-vitale-logo.png" alt=""><span>SAN VITALE NEXT GEN</span><h3>Passa alla nuova app</h3><p>Troverai la squadra già configurata, con i dati condivisi e tutte le funzioni aggiornate.</p></div>
                <div class="migration-steps">
                    <div class="migration-step"><div><strong>Apri il nuovo profilo</strong><small>Il collegamento riconosce automaticamente Multe SV.</small></div></div>
                    <div class="migration-step"><div><strong>Aggiungilo alla schermata Home</strong><small>Segui la guida iPhone o Android mostrata nella nuova app.</small></div></div>
                    <div class="migration-step"><div><strong>Sostituisci la vecchia icona</strong><small>Rimuovila soltanto dopo aver verificato che la nuova app si apra correttamente.</small></div></div>
                </div>
                <div class="migration-actions"><button class="btn secondary" id="migrationCopy" type="button">Copia link</button><a class="btn" id="migrationOpen" href="${NEW_APP_URL}" target="_blank" rel="noopener noreferrer external">Apri in Safari</a></div>
                <button class="btn secondary migration-stay" id="migrationStay" type="button">Resta nella vecchia app</button>
            </div>
        `);
        document.getElementById("migrationStay")?.addEventListener("click", closeModal);
        document.getElementById("migrationCopy")?.addEventListener("click", copyNewAppLink);
        document.querySelector("#modalRoot .modal")?.classList.add("migration-guide-modal");
    }

    document.getElementById("openMigrationGuide")?.addEventListener("click", openMigrationGuide);
    document.getElementById("dismissMigrationBanner")?.addEventListener("click", () => {
        document.getElementById("migrationBanner")?.remove();
    });
    window.MULTE_SV_NEW_APP_URL = NEW_APP_URL;
})();
