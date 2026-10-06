(function () {
    const isGS = /Multe GS/i.test(document.title);
    const categoryPalette = ["#16a34a", "#2563eb", "#db2777", "#d97706", "#0891b2", "#7c3aed", "#64748b", "#dc2626", "#0d9488", "#9333ea"];
    const defaults = {
        shortName: isGS ? "Multe GS" : "Multe SV",
        fullName: isGS ? "GS Montecchio San Pietro" : "San Vitale Next Gen",
        motto: "Stessi amici. Più responsabilità.",
        linkType: "tuttocampo",
        publicUrl: isGS
            ? "https://www.tuttocampo.it/Veneto/TerzaCategoria/GironeAVicenza/Squadra/MontecchioSPietroSqB/1238518/Scheda"
            : "https://www.tuttocampo.it/Veneto/TerzaCategoria/GironeAVicenza/Squadra/SanVitale1995SqB/1199590/Scheda",
        primary: isGS ? "#159447" : "#2563eb",
        secondary: isGS ? "#0b6b31" : "#1d4ed8",
        accent: isGS ? "#31c567" : "#60a5fa",
        colorsCustomized: false,
        currency: "EUR",
        feesEnabled: true,
        feeMode: "monthly",
        entryFee: 0,
        satispayUrl: "https://web.satispay.com/download/qrcode/S6Y-SVN--C16B2EFB-E6F6-4EB8-943C-B494FDF0DCD8?locale=it_IT",
        paypalMeUrl: "https://paypal.me/omarquaggiotto",
        finesEnabled: true,
        exportBirthdays: false,
        exportPhotos: true
    };

    function ensureCustomization() {
        state.teamCustomization = { ...defaults, ...(state.teamCustomization || {}) };
        if (!isGS && !state.teamCustomization.paypalMeUrl) {
            state.teamCustomization.paypalMeUrl = defaults.paypalMeUrl;
        }
        if (isGS && [["#8b1e2d", "#e8b44f"], ["#2563eb", "#1d4ed8"]].some(([primary, secondary]) => state.teamCustomization.primary === primary && state.teamCustomization.secondary === secondary)) {
            state.teamCustomization.primary = defaults.primary;
            state.teamCustomization.secondary = defaults.secondary;
            state.teamCustomization.accent = defaults.accent;
            state.teamCustomization.colorsCustomized = false;
        }
        if (state.teamCustomization.linkType === "tuttocampo" && !state.teamCustomization.publicUrl) {
            state.teamCustomization.publicUrl = defaults.publicUrl;
        }
        state.memberProfiles = state.memberProfiles && typeof state.memberProfiles === "object" ? state.memberProfiles : {};
        state.categorySettings = state.categorySettings && typeof state.categorySettings === "object" ? state.categorySettings : {};
        state.manualMatches = Array.isArray(state.manualMatches) ? state.manualMatches : [];
        getSortedCategories(state.rules.map(rule => rule.category)).forEach((name, index) => {
            const current = state.categorySettings[name] || {};
            state.categorySettings[name] = {
                color: /^#[0-9a-f]{6}$/i.test(current.color || "") ? current.color : categoryPalette[index % categoryPalette.length],
                order: Number.isFinite(Number(current.order)) ? Number(current.order) : index
            };
        });
        state.rules.forEach((rule, index) => {
            if (!rule.audience) rule.audience = "players";
            if (!Number.isFinite(Number(rule.sortOrder))) rule.sortOrder = index;
        });
        state.players.forEach(name => {
            const memberDefaults = {
                type: "player", role: "", jersey: "", joinedAt: "", active: true,
                paysFees: true, paysFines: true, customMonthlyFee: "", discount: 0
            };
            const current = state.memberProfiles[name] && typeof state.memberProfiles[name] === "object" ? state.memberProfiles[name] : {};
            Object.entries(memberDefaults).forEach(([key, value]) => { if (current[key] === undefined) current[key] = value; });
            state.memberProfiles[name] = current;
        });
    }

    function profile(name) {
        ensureCustomization();
        return state.memberProfiles[name];
    }

    function applyTeamStyle() {
        ensureCustomization();
        const config = state.teamCustomization;
        if (config.colorsCustomized) {
            document.documentElement.style.setProperty("--primary", config.primary);
            document.documentElement.style.setProperty("--primary-dark", config.secondary);
            document.documentElement.style.setProperty("--preview-accent", config.accent);
        } else {
            document.documentElement.style.removeProperty("--primary");
            document.documentElement.style.removeProperty("--primary-dark");
            document.documentElement.style.removeProperty("--preview-accent");
        }
        const title = document.querySelector(".brand-title, .topbar h1");
        if (title && config.shortName) title.textContent = config.shortName;
        const teamLink = document.querySelector(".team-link");
        if (teamLink) {
            if (!teamLink.dataset.defaultHref) teamLink.dataset.defaultHref = teamLink.href;
            const selectedUrl = config.publicUrl && /^https:\/\//i.test(config.publicUrl) ? config.publicUrl : teamLink.dataset.defaultHref;
            teamLink.href = selectedUrl;
            const destination = config.linkType === "website" ? "sito ufficiale" : "Tuttocampo";
            teamLink.title = `${config.fullName} · ${destination}`;
            teamLink.setAttribute("aria-label", `${config.fullName} · apri ${destination}`);
        }
    }

    function memberRows() {
        return getSortedPlayers().map(name => {
            const item = profile(name);
            return `<article class="custom-member-row" data-member-row="${escapeHtml(name)}">
                <div class="custom-member-head">${playerPortrait(name)}<div><strong>${escapeHtml(name)}</strong><small>${item.active ? "In rosa" : "Archiviato"} · ${item.type === "staff" ? "Staff" : "Giocatore"}</small></div></div>
                <div class="custom-member-grid">
                    <label>Gruppo<select data-member-field="type"><option value="player" ${item.type === "player" ? "selected" : ""}>Giocatore</option><option value="staff" ${item.type === "staff" ? "selected" : ""}>Staff</option></select></label>
                    <label>Ruolo<input data-member-field="role" value="${escapeHtml(item.role)}" placeholder="Es. Portiere"></label>
                    <label>Numero<input data-member-field="jersey" value="${escapeHtml(item.jersey)}" inputmode="numeric" placeholder="—"></label>
                    <label>Entrato il<input data-member-field="joinedAt" type="date" value="${escapeHtml(item.joinedAt)}"></label>
                    <label>Quota personale<input data-member-field="customMonthlyFee" type="number" min="0" step="0.5" value="${escapeHtml(item.customMonthlyFee)}" placeholder="Standard"></label>
                    <label>Sconto %<input data-member-field="discount" type="number" min="0" max="100" value="${Number(item.discount) || 0}"></label>
                </div>
                <div class="custom-member-toggles"><label><input data-member-field="active" type="checkbox" ${item.active ? "checked" : ""}> In rosa</label><label><input data-member-field="paysFees" type="checkbox" ${item.paysFees ? "checked" : ""}> Paga quote</label><label><input data-member-field="paysFines" type="checkbox" ${item.paysFines ? "checked" : ""}> Riceve multe</label></div>
            </article>`;
        }).join("");
    }

    function ruleRows() {
        return [...state.rules].sort((a,b) => Number(a.sortOrder)-Number(b.sortOrder)).map(rule => `
            <article class="custom-rule-row" data-rule-custom="${rule.id}"><div><strong>${escapeHtml(rule.type)}</strong><small>${escapeHtml(rule.category)} · ${formatRuleAmount(rule)}</small></div>
            <select data-rule-audience><option value="players" ${rule.audience === "players" ? "selected" : ""}>Giocatori</option><option value="staff" ${rule.audience === "staff" ? "selected" : ""}>Staff</option><option value="all" ${rule.audience === "all" ? "selected" : ""}>Tutti</option></select>
            <button class="btn secondary" type="button" data-duplicate-rule>Duplica</button></article>`).join("");
    }

    function categoryRows() {
        return getSortedCategories(state.rules.map(rule => rule.category)).map((name, index) => {
            const setting = state.categorySettings[name];
            const historical = state.fines.filter(fine => fine.category === name).length;
            return `<article class="custom-category-row" data-category-original="${escapeHtml(name)}" data-category-order="${index}">
                <span class="custom-category-swatch" style="--swatch:${escapeHtml(setting.color)}"></span>
                <div><input data-category-name value="${escapeHtml(name)}" aria-label="Nome categoria ${escapeHtml(name)}"><small>${state.rules.filter(rule => rule.category === name).length} regole · ${historical} multe storiche</small></div>
                <input data-category-color type="color" value="${escapeHtml(setting.color)}" aria-label="Colore categoria ${escapeHtml(name)}">
                <div class="custom-category-order"><button type="button" data-category-up aria-label="Sposta ${escapeHtml(name)} in alto">↑</button><button type="button" data-category-down aria-label="Sposta ${escapeHtml(name)} in basso">↓</button></div>
            </article>`;
        }).join("");
    }

    function manualMatchRows() {
        return state.manualMatches.map(match => `<article class="custom-match-row" data-manual-match="${match.id}"><div><strong>${escapeHtml(match.home)} – ${escapeHtml(match.away)}</strong><small>${escapeHtml(match.date)} · ${escapeHtml(match.time)} · ${escapeHtml(match.competition)}</small></div><button class="icon-mini" data-remove-manual-match type="button" aria-label="Rimuovi partita">×</button></article>`).join("") || `<p class="small muted">Nessuna partita manuale inserita.</p>`;
    }

    function openTeamCustomization() {
        if (!requireOnlineAdmin()) return;
        ensureCustomization();
        const c = state.teamCustomization;
        openModal("Identità squadra", `<div class="customization-lab focused-settings-editor">
            <section class="custom-lab-hero"><span>SQUADRA</span><h3>Identità dell’app</h3><p>Nome, motto, collegamento, stemma e colori della squadra.</p></section>
            <section class="custom-editor-section team-identity-logo"><div class="season-logo-editor"><img id="customTeamLogoPreview" src="${escapeHtml(getTeamLogo())}" alt="Anteprima stemma squadra"><div><strong>Stemma della squadra</strong><small>Viene adattato automaticamente nell’app e nei report.</small><div class="season-logo-actions"><label class="btn secondary" for="customTeamLogo">Carica stemma</label><button class="btn secondary" id="restoreTeamLogo" type="button">Ripristina</button></div><input id="customTeamLogo" type="file" accept="image/png,image/jpeg,image/webp" hidden></div></div></section>
            <section class="custom-editor-section"><div class="custom-panel-grid">
                <label>Nome app<input id="customShortName" value="${escapeHtml(c.shortName)}"></label>
                <label>Nome completo<input id="customFullName" value="${escapeHtml(c.fullName)}"></label>
                <label class="wide">Motto<input id="customMotto" value="${escapeHtml(c.motto)}"></label>
                <label>Destinazione stemma<select id="customLinkType"><option value="tuttocampo" ${c.linkType === "tuttocampo" ? "selected" : ""}>Pagina Tuttocampo</option><option value="website" ${c.linkType === "website" ? "selected" : ""}>Sito della squadra</option></select></label>
                <label>Link collegato allo stemma<input id="customPublicUrl" type="url" value="${escapeHtml(c.publicUrl)}" placeholder="https://..."></label>
                <label>Colore principale<input id="customPrimary" type="color" value="${c.primary}"></label>
                <label>Colore secondario<input id="customSecondary" type="color" value="${c.secondary}"></label>
                <label>Colore accento<input id="customAccent" type="color" value="${c.accent}"></label>
            </div></section>
            <div class="modal-actions custom-sticky-actions"><button class="btn secondary" id="cancelTeamCustomization" type="button">Annulla</button><button class="btn" id="saveTeamCustomization" type="button">Salva identità</button></div>
        </div>`);
        document.querySelector("#modalRoot .modal")?.classList.add("customization-modal");
        let customTeamLogo = getTeamLogo();
        document.getElementById("customTeamLogo").onchange = async event => { const file = event.target.files?.[0]; if (!file) return; try { customTeamLogo = await prepareTeamLogo(file); document.getElementById("customTeamLogoPreview").src = customTeamLogo; } catch (error) { event.target.value = ""; showToast(error.message || "Immagine non valida."); } };
        document.getElementById("restoreTeamLogo").onclick = () => { customTeamLogo = defaultState?.teamLogo || "assets/icon.svg"; document.getElementById("customTeamLogoPreview").src = customTeamLogo; };
        document.getElementById("cancelTeamCustomization").onclick = () => { applyTeamStyle(); closeModal(); };
        ["customPrimary","customSecondary","customAccent"].forEach(id => document.getElementById(id).oninput = () => {
            document.documentElement.style.setProperty(id === "customPrimary" ? "--primary" : id === "customSecondary" ? "--primary-dark" : "--preview-accent", document.getElementById(id).value);
        });
        document.getElementById("saveTeamCustomization").onclick = () => {
            const publicUrl = document.getElementById("customPublicUrl").value.trim();
            if (publicUrl && !/^https:\/\//i.test(publicUrl)) return showToast("Inserisci un link completo che inizi con https://");
            state.teamCustomization = { ...state.teamCustomization,
                shortName: document.getElementById("customShortName").value.trim() || defaults.shortName,
                fullName: document.getElementById("customFullName").value.trim() || defaults.fullName,
                motto: document.getElementById("customMotto").value.trim(),
                linkType: document.getElementById("customLinkType").value,
                publicUrl,
                primary: document.getElementById("customPrimary").value,
                secondary: document.getElementById("customSecondary").value,
                accent: document.getElementById("customAccent").value,
                colorsCustomized: true
            };
            state.team = state.teamCustomization.fullName;
            state.teamLogo = customTeamLogo;
            saveState(); closeModal(); render(); showToast("Identità squadra salvata.");
        };
    }

    function openReportCustomization() {
        if (!requireOnlineAdmin()) return;
        ensureCustomization();
        const c = state.teamCustomization;
        openModal("Contenuti dei report", `<div class="customization-lab focused-settings-editor">
            <section class="custom-lab-hero"><span>ESPORTAZIONI</span><h3>Schede e riepiloghi</h3><p>Scegli quali informazioni personali mostrare nei documenti esportati.</p></section>
            <section class="custom-editor-section report-choice-list">
                <label class="custom-switch"><input id="customExportPhotos" type="checkbox" ${c.exportPhotos ? "checked" : ""}><span><strong>Foto dei giocatori</strong><small>Mostra la foto nelle schede e nei riepiloghi esportati.</small></span></label>
                <label class="custom-switch"><input id="customExportBirthdays" type="checkbox" ${c.exportBirthdays ? "checked" : ""}><span><strong>Date di nascita</strong><small>Inserisce il compleanno nei report che prevedono la scheda personale.</small></span></label>
            </section>
            <div class="modal-actions custom-sticky-actions"><button class="btn secondary" id="cancelReportCustomization" type="button">Annulla</button><button class="btn" id="saveReportCustomization" type="button">Salva report</button></div>
        </div>`);
        document.querySelector("#modalRoot .modal")?.classList.add("customization-modal");
        document.getElementById("cancelReportCustomization").onclick = closeModal;
        document.getElementById("saveReportCustomization").onclick = () => {
            state.teamCustomization = { ...state.teamCustomization,
                exportPhotos: document.getElementById("customExportPhotos").checked,
                exportBirthdays: document.getElementById("customExportBirthdays").checked
            };
            saveState(); closeModal(); render(); showToast("Preferenze report salvate.");
        };
    }

    function openFinesCustomization() {
        if (!requireOnlineAdmin()) return;
        ensureCustomization();
        const c = state.teamCustomization;
        openModal("Personalizza Multario", `<div class="customization-lab focused-settings-editor fines-settings-editor">
            <section class="custom-lab-hero"><span>MULTE</span><h3>Categorie e destinatari</h3><p>Modifica il Multario senza eliminare le multe già registrate.</p></section>
            <section class="custom-editor-section"><div class="custom-editor-heading"><span>01</span><div><h4>Categorie</h4><p>Nomi, colori e ordine di visualizzazione.</p></div></div><div class="custom-category-list" id="customCategoryList">${categoryRows()}</div><label class="custom-history-choice"><input id="renameHistoricalCategories" type="checkbox"> Applica le rinomine anche alle multe già registrate</label><p class="small muted custom-panel-note">Se resta disattivato, lo storico conserva il vecchio nome. Nessuna multa viene eliminata.</p></section>
            <section class="custom-editor-section"><div class="custom-editor-heading"><span>02</span><div><h4>Destinatari delle regole</h4><p>Scegli se ogni regola vale per giocatori, staff o tutti.</p></div></div><div class="custom-rule-list">${ruleRows()}</div><div class="custom-inline-actions"><button class="btn secondary" id="exportRulesOnly" type="button">Esporta Multario</button></div></section>
            <div class="modal-actions custom-sticky-actions"><button class="btn secondary" id="cancelFinesCustomization" type="button">Annulla</button><button class="btn" id="saveFinesCustomization" type="button">Salva Multario</button></div>
        </div>`);
        document.querySelector("#modalRoot .modal")?.classList.add("customization-modal");
        document.getElementById("cancelFinesCustomization").onclick = closeModal;
        document.querySelectorAll("[data-duplicate-rule]").forEach(button => button.onclick = () => {
            const id = Number(button.closest("[data-rule-custom]").dataset.ruleCustom);
            const original = state.rules.find(rule => rule.id === id);
            if (!original) return;
            state.rules.push({ ...structuredClone(original), id: generateId(), type: `${original.type} (copia)`, sortOrder: state.rules.length });
            saveState(); closeModal(); openFinesCustomization(); showToast("Regola duplicata.");
        });
        document.getElementById("exportRulesOnly").onclick = () => {
            const blob = new Blob([JSON.stringify({ app: c.shortName, exportedAt: new Date().toISOString(), rules: state.rules }, null, 2)], {type:"application/json"});
            const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `multario-${state.season}.json`; link.click(); URL.revokeObjectURL(link.href);
        };
        const refreshCategoryOrder = () => document.querySelectorAll("[data-category-original]").forEach((row, index) => row.dataset.categoryOrder = index);
        document.querySelectorAll("[data-category-up],[data-category-down]").forEach(button => button.onclick = () => {
            const row = button.closest("[data-category-original]");
            const sibling = button.hasAttribute("data-category-up") ? row.previousElementSibling : row.nextElementSibling;
            if (!sibling) return;
            if (button.hasAttribute("data-category-up")) row.parentElement.insertBefore(row, sibling); else row.parentElement.insertBefore(sibling, row);
            refreshCategoryOrder();
        });
        document.querySelectorAll("[data-category-color]").forEach(input => input.oninput = () => input.closest("[data-category-original]").querySelector(".custom-category-swatch").style.setProperty("--swatch", input.value));
        document.getElementById("saveFinesCustomization").onclick = () => {
            const rows = [...document.querySelectorAll("[data-category-original]")];
            const names = rows.map(row => row.querySelector("[data-category-name]").value.trim());
            if (names.some(name => !name)) return showToast("Ogni categoria deve avere un nome.");
            if (new Set(names.map(name => name.toLocaleLowerCase("it"))).size !== names.length) return showToast("Due categorie non possono avere lo stesso nome.");
            const renameHistory = document.getElementById("renameHistoricalCategories").checked;
            const nextCategorySettings = {};
            rows.forEach((row, index) => {
                const original = row.dataset.categoryOriginal;
                const next = row.querySelector("[data-category-name]").value.trim();
                const color = row.querySelector("[data-category-color]").value;
                state.rules.forEach(rule => { if (rule.category === original) rule.category = next; });
                if (renameHistory) state.fines.forEach(fine => { if (fine.category === original) fine.category = next; });
                nextCategorySettings[next] = { color, order: index };
            });
            state.categorySettings = nextCategorySettings;
            document.querySelectorAll("[data-rule-custom]").forEach(row => { const rule = state.rules.find(item => item.id === Number(row.dataset.ruleCustom)); if (rule) rule.audience = row.querySelector("[data-rule-audience]").value; });
            saveState(); closeModal(); render(); showToast("Multario aggiornato.");
        };
    }

    function openPaymentLinksCustomization() {
        if (!requireOnlineAdmin()) return;
        ensureCustomization();
        const c = state.teamCustomization;
        openModal("Metodi di pagamento", `<div class="customization-lab focused-settings-editor">
            <section class="custom-lab-hero"><span>PAGAMENTI</span><h3>Satispay e PayPal</h3><p>Collega i servizi che i giocatori possono usare dalla pagina Pagamenti.</p></section>
            <section class="custom-editor-section"><div class="custom-panel-grid">
                <label class="wide">Colletta Satispay<input id="customSatispayUrl" type="url" value="${escapeHtml(c.satispayUrl || "")}" placeholder="https://web.satispay.com/download/qrcode/..."><small>Lascia vuoto per nascondere il pulsante Satispay.</small></label>
                <label class="wide">PayPal.Me<input id="customPaypalMeUrl" type="url" value="${escapeHtml(c.paypalMeUrl || "")}" placeholder="https://paypal.me/nome"><small>Lascia vuoto per nascondere il pulsante PayPal.</small></label>
            </div></section>
            <div class="modal-actions custom-sticky-actions"><button class="btn secondary" id="cancelPaymentLinks" type="button">Annulla</button><button class="btn" id="savePaymentLinks" type="button">Salva metodi</button></div>
        </div>`);
        document.querySelector("#modalRoot .modal")?.classList.add("customization-modal");
        document.getElementById("cancelPaymentLinks").onclick = closeModal;
        document.getElementById("savePaymentLinks").onclick = () => {
            const satispayUrl = document.getElementById("customSatispayUrl").value.trim();
            const paypalMeUrl = document.getElementById("customPaypalMeUrl").value.trim().replace(/\/$/, "");
            if (satispayUrl && !/^https:\/\/(?:web\.|www\.)?satispay\.com\/download\/qrcode\//i.test(satispayUrl)) return showToast("Inserisci un link colletta Satispay valido.");
            if (paypalMeUrl && !/^https:\/\/(?:www\.)?paypal\.me\/[a-z0-9]+$/i.test(paypalMeUrl)) return showToast("Inserisci un link PayPal.Me valido, senza importo finale.");
            state.teamCustomization = { ...state.teamCustomization, satispayUrl, paypalMeUrl };
            saveState(); closeModal(); render(); showToast("Metodi di pagamento salvati.");
        };
    }

    function enhanceSettings() {
        if (currentPage !== "settings" || document.getElementById("openTeamCustomization")) return;
        const page = document.querySelector(".settings-page");
        if (!page) return;
        page.querySelector(".legacy-team-settings")?.remove();
        const teamArea = page.querySelector('[data-settings-area="team"]') || page;
        const finesArea = page.querySelector('[data-settings-area="fines"]') || page;
        const dataArea = page.querySelector('[data-settings-area="exports"]') || page;
        const paymentsArea = page.querySelector('[data-settings-area="payments"]') || page;
        teamArea.insertAdjacentHTML("beforeend", `<section class="card customization-entry settings-feature-entry"><div class="settings-card-heading"><span class="settings-card-icon" aria-hidden="true">🎨</span><div><span>SQUADRA</span><h3>Identità e aspetto</h3><p>Nome, motto, colori, stemma e collegamento esterno.</p></div></div><button class="btn" id="openTeamCustomization" type="button">Personalizza</button></section>`);
        finesArea.insertAdjacentHTML("beforeend", `<section class="card customization-entry settings-feature-entry"><div class="settings-card-heading"><span class="settings-card-icon" aria-hidden="true">🏷️</span><div><span>MULTARIO</span><h3>Categorie e destinatari</h3><p>Nomi, colori, ordine e applicazione delle regole.</p></div></div><button class="btn" id="openFinesCustomization" type="button">Configura</button></section>`);
        if ("satispayUrl" in defaults || "paypalMeUrl" in defaults) paymentsArea.insertAdjacentHTML("beforeend", `<section class="card customization-entry settings-feature-entry"><div class="settings-card-heading"><span class="settings-card-icon" aria-hidden="true">💳</span><div><span>PAGAMENTI</span><h3>Satispay e PayPal</h3><p>Configura separatamente i collegamenti disponibili ai giocatori.</p></div></div><button class="btn" id="openPaymentLinksCustomization" type="button">Configura</button></section>`);
        dataArea.insertAdjacentHTML("beforeend", `<section class="card customization-entry settings-feature-entry"><div class="settings-card-heading"><span class="settings-card-icon" aria-hidden="true">📄</span><div><span>ESPORTAZIONI</span><h3>Contenuti dei report</h3><p>Foto e date di nascita nelle schede esportate.</p></div></div><button class="btn" id="openReportCustomization" type="button">Configura</button></section>`);
        document.getElementById("openTeamCustomization").onclick = openTeamCustomization;
        document.getElementById("openFinesCustomization").onclick = openFinesCustomization;
        document.getElementById("openReportCustomization").onclick = openReportCustomization;
        if (document.getElementById("openPaymentLinksCustomization")) document.getElementById("openPaymentLinksCustomization").onclick = openPaymentLinksCustomization;
        const multiplierSection = finesArea.querySelector(":scope > details");
        const rulesShortcut = finesArea.querySelector("[data-open-multario]")?.closest(".settings-shortcut");
        const categoriesEntry = document.getElementById("openFinesCustomization")?.closest(".settings-feature-entry");
        if (multiplierSection && rulesShortcut && categoriesEntry && !finesArea.querySelector(".fines-settings-menu")) {
            multiplierSection.hidden = true;
            rulesShortcut.hidden = true;
            categoriesEntry.hidden = true;
            const menu = document.createElement("div");
            menu.className = "settings-menu-list fines-settings-menu";
            menu.innerHTML = `<button type="button" data-fines-page="multipliers"><span>×2</span><span class="settings-menu-copy"><strong>Moltiplicatori</strong><small>Capitano, staff e mesi speciali</small></span><b aria-hidden="true">›</b></button><button type="button" data-fines-page="rules"><span>📋</span><span class="settings-menu-copy"><strong>Regole del Multario</strong><small>Descrizioni, importi e calcolo</small></span><b aria-hidden="true">›</b></button><button type="button" data-fines-page="categories"><span>🏷️</span><span class="settings-menu-copy"><strong>Categorie e destinatari</strong><small>Colori, ordine e applicazione</small></span><b aria-hidden="true">›</b></button>`;
            const back = document.createElement("button");
            back.type = "button";
            back.className = "settings-subarea-back fines-settings-back";
            back.innerHTML = `<span aria-hidden="true">‹</span><b>Multe</b>`;
            back.hidden = true;
            finesArea.querySelector(".settings-area-title")?.after(back, menu);
            const showMenu = () => { multiplierSection.hidden = true; back.hidden = true; menu.hidden = false; window.scrollTo({ top: 0, behavior: "smooth" }); };
            menu.querySelector('[data-fines-page="multipliers"]').onclick = () => { menu.hidden = true; back.hidden = false; multiplierSection.hidden = false; window.scrollTo({ top: 0, behavior: "smooth" }); };
            menu.querySelector('[data-fines-page="rules"]').onclick = () => rulesShortcut.querySelector("[data-open-multario]")?.click();
            menu.querySelector('[data-fines-page="categories"]').onclick = openFinesCustomization;
            back.onclick = showMenu;
        }
    }

    ensureCustomization();
    const originalPlayerMonthBase = getPlayerMonthBase;
    getPlayerMonthBase = function (player, monthId) {
        ensureCustomization();
        const config = state.teamCustomization;
        const member = profile(player);
        if (!config.feesEnabled || config.feeMode === "none" || member.active === false || member.paysFees === false || monthId < getPlayerStartMonth(player)) return 0;
        const standardMonthly = member.customMonthlyFee !== "" && member.customMonthlyFee !== null
            ? Math.max(0, Number(member.customMonthlyFee) || 0)
            : originalPlayerMonthBase(player, monthId);
        const monthly = standardMonthly * (1 - Math.min(100, Math.max(0, Number(member.discount) || 0)) / 100);
        const entry = monthId === getPlayerStartMonth(player) ? Math.max(0, Number(config.entryFee) || 0) : 0;
        if (config.feeMode === "entry") return entry;
        if (config.feeMode === "monthly_entry") return monthId === getPlayerStartMonth(player) ? entry : monthly;
        return monthly;
    };
    const originalRender = render;
    render = function () { originalRender(); applyTeamStyle(); enhanceSettings(); };
    applyTeamStyle();
    enhanceSettings();
})();
