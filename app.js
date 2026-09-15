/* =========================================================
   MulteSV - APP.JS
   ========================================================= */


/* =========================================================
   STATO DEFAULT
   ========================================================= */

const defaultState = {

    teamName: "MulteSV",

    season: "2026/27",

    theme: "light",

    players: [
        "Giocatore 1",
        "Giocatore 2",
        "Giocatore 3"
    ],

    rules: [

        {
            id: "rule-1",
            category: "Allenamento",
            type: "Ritardo allenamento",
            amount: 5
        },

        {
            id: "rule-2",
            category: "Allenamento",
            type: "Ritardo oltre 15 minuti",
            amount: 10
        },

        {
            id: "rule-3",
            category: "Allenamento",
            type: "Assenza ingiustificata",
            amount: 20
        },

        {
            id: "rule-4",
            category: "Partita",
            type: "Ammonizione",
            amount: 5
        },

        {
            id: "rule-5",
            category: "Partita",
            type: "Ammonizione per proteste",
            amount: 10
        },

        {
            id: "rule-6",
            category: "Partita",
            type: "Espulsione",
            amount: 20
        },

        {
            id: "rule-7",
            category: "Materiale",
            type: "Dimenticanza materiale",
            amount: 5
        }

    ],

    fines: []

};


/* =========================================================
   CARICAMENTO STATO
   ========================================================= */

const STORAGE_KEY = "multeSV_state";

let state = loadState();

let currentPage = "home";

let selectedMonth = "all";


/* =========================================================
   UTILITÀ
   ========================================================= */

function clone(value) {

    return JSON.parse(
        JSON.stringify(value)
    );

}


function loadState() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {

            return clone(
                defaultState
            );

        }

        const parsed =
            JSON.parse(saved);

        return {

            ...clone(defaultState),

            ...parsed,

            players:
                Array.isArray(parsed.players)
                    ? parsed.players
                    : clone(defaultState.players),

            rules:
                Array.isArray(parsed.rules)
                    ? parsed.rules
                    : clone(defaultState.rules),

            fines:
                Array.isArray(parsed.fines)
                    ? parsed.fines
                    : []

        };

    }

    catch (error) {

        console.error(
            "Errore caricamento stato:",
            error
        );

        return clone(
            defaultState
        );

    }

}


function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    }

    catch (error) {

        console.error(
            "Errore salvataggio stato:",
            error
        );

        showToast(
            "Errore nel salvataggio"
        );

    }

}


function money(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "it-IT",
        {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function initials(name) {

    const parts =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {

        return "?";

    }

    if (parts.length === 1) {

        return parts[0]
            .slice(0, 2)
            .toUpperCase();

    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


function formatDate(date) {

    if (!date) {

        return "";

    }

    const d =
        new Date(
            date + (
                date.length === 10
                    ? "T00:00:00"
                    : ""
            )
        );

    if (Number.isNaN(d.getTime())) {

        return date;

    }

    return d.toLocaleDateString(
        "it-IT"
    );

}


function todayString() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;

}


function generateId(prefix) {

    return (
        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );

}


/* =========================================================
   TEMA
   ========================================================= */

function applyTheme() {

    document.documentElement.dataset.theme =
        state.theme === "dark"
            ? "dark"
            : "light";


    const button =
        document.getElementById(
            "themeButton"
        );


    if (button) {

        button.textContent =
            state.theme === "dark"
                ? "🌙"
                : "☀️";

    }

}


/* =========================================================
   NAVIGAZIONE
   ========================================================= */

function updateNavigation() {

    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(button => {

            const active =
                button.dataset.page ===
                currentPage;

            button.classList.toggle(
                "active",
                active
            );

        });

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

    const fines =
        state.fines || [];


    const total =
        fines.reduce(
            (sum, fine) =>
                sum +
                Number(
                    fine.amount || 0
                ),
            0
        );


    const paid =
        fines
            .filter(
                fine => fine.paid
            )
            .reduce(
                (sum, fine) =>
                    sum +
                    Number(
                        fine.amount || 0
                    ),
                0
            );


    const unpaid =
        total - paid;


    const playersWithFines =
        new Set(
            fines.map(
                fine =>
                    fine.player
            )
        ).size;


    const ranking = {};


    fines.forEach(
        fine => {

            const player =
                fine.player;

            if (!ranking[player]) {

                ranking[player] = {

                    player,

                    total: 0,

                    count: 0

                };

            }

            ranking[player].total +=
                Number(
                    fine.amount || 0
                );

            ranking[player].count++;

        }
    );


    const rankingList =
        Object.values(
            ranking
        )
        .sort(
            (a, b) =>
                b.total - a.total
        )
        .slice(
            0,
            5
        );


    const recent =
        [...fines]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(
                0,
                5
            );


    return `

        <section class="page-header">

            <div>

                <div class="eyebrow">
                    ${escapeHtml(
                        state.season || "STAGIONE"
                    )}
                </div>

                <h1>
                    ${escapeHtml(
                        state.teamName ||
                        "MulteSV"
                    )}
                </h1>

                <p>
                    Riepilogo della stagione
                </p>

            </div>


            <button
                class="primary-btn"
                id="homeAddFine"
                type="button"
            >
                ＋ Nuova multa
            </button>

        </section>


        <div class="stats-grid">

            <div class="stat-card">

                <span>
                    Totale multe
                </span>

                <strong>
                    ${money(total)}
                </strong>

                <small>
                    ${fines.length}
                    ${
                        fines.length === 1
                            ? "multa"
                            : "multe"
                    }
                </small>

            </div>


            <div class="stat-card">

                <span>
                    Pagate
                </span>

                <strong class="positive">
                    ${money(paid)}
                </strong>

                <small>
                    Già saldate
                </small>

            </div>


            <div class="stat-card">

                <span>
                    Da pagare
                </span>

                <strong
                    class="${
                        unpaid > 0
                            ? "negative"
                            : "positive"
                    }"
                >
                    ${money(unpaid)}
                </strong>

                <small>
                    ${
                        fines.filter(
                            fine => !fine.paid
                        ).length
                    }
                    non saldate
                </small>

            </div>


            <div class="stat-card">

                <span>
                    Giocatori multati
                </span>

                <strong>
                    ${playersWithFines}
                </strong>

                <small>
                    Giocatori coinvolti
                </small>

            </div>

        </div>


        <div class="section-heading">

            <div>

                <h2>
                    Classifica multe
                </h2>

                <span>
                    Chi ha accumulato più multe
                </span>

            </div>

        </div>


        ${
            rankingList.length

                ?

            `
                <div class="card ranking-card">

                    ${
                        rankingList
                            .map(
                                (item, index) => `

                                    <div class="ranking-row">

                                        <div class="ranking-position">

                                            ${
                                                index === 0
                                                    ? "🥇"
                                                    : index === 1
                                                        ? "🥈"
                                                        : index === 2
                                                            ? "🥉"
                                                            : index + 1
                                            }

                                        </div>


                                        <div class="avatar">

                                            ${initials(
                                                item.player
                                            )}

                                        </div>


                                        <div class="ranking-name">

                                            <strong>
                                                ${escapeHtml(
                                                    item.player
                                                )}
                                            </strong>

                                            <span class="muted small">

                                                ${item.count}
                                                ${
                                                    item.count === 1
                                                        ? "multa"
                                                        : "multe"
                                                }

                                            </span>

                                        </div>


                                        <strong>
                                            ${money(
                                                item.total
                                            )}
                                        </strong>

                                    </div>

                                `
                            )
                            .join("")
                    }

                </div>
            `

                :

            `
                <div class="card empty-state">

                    <div class="empty-icon">
                        🏆
                    </div>

                    <h3>
                        Nessuna multa
                    </h3>

                    <p>
                        La classifica comparirà
                        quando verrà registrata
                        la prima multa.
                    </p>

                </div>
            `
        }


        <div class="section-heading">

            <div>

                <h2>
                    Multe recenti
                </h2>

                <span>
                    Ultime registrazioni
                </span>

            </div>


            ${
                recent.length
                    ? `
                        <button
                            class="btn secondary"
                            id="goToFines"
                            type="button"
                        >
                            Vedi tutte
                        </button>
                    `
                    : ""
            }

        </div>


        ${
            recent.length

                ?

            `
                <div class="list">

                    ${
                        recent
                            .map(
                                renderFineRow
                            )
                            .join("")
                    }

                </div>
            `

                :

            `
                <div class="card empty-state">

                    <div class="empty-icon">
                        🧾
                    </div>

                    <h3>
                        Nessuna registrazione
                    </h3>

                    <p>
                        Aggiungi la prima multa
                        della stagione.
                    </p>

                </div>
            `
        }

    `;

}


/* =========================================================
   MULTE
   ========================================================= */

function renderFines() {

    const allFines =
        state.fines || [];


    const monthNames = [

        "Gennaio",
        "Febbraio",
        "Marzo",
        "Aprile",
        "Maggio",
        "Giugno",
        "Luglio",
        "Agosto",
        "Settembre",
        "Ottobre",
        "Novembre",
        "Dicembre"

    ];


    const seasonStartYear =
        Number(
            state.season?.slice(0, 4)
        ) ||
        new Date().getFullYear();


    const seasonMonths = [];


    /* =========================
       AGOSTO → DICEMBRE
       ========================= */

    for (
        let monthIndex = 7;
        monthIndex <= 11;
        monthIndex++
    ) {

        const year =
            seasonStartYear;

        const monthNumber =
            String(
                monthIndex + 1
            ).padStart(
                2,
                "0"
            );


        seasonMonths.push({

            id:
                `${year}-${monthNumber}`,

            label:
                `${monthNames[monthIndex]} ${year}`

        });

    }


    /* =========================
       GENNAIO → MAGGIO
       ========================= */

    for (
        let monthIndex = 0;
        monthIndex <= 4;
        monthIndex++
    ) {

        const year =
            seasonStartYear + 1;

        const monthNumber =
            String(
                monthIndex + 1
            ).padStart(
                2,
                "0"
            );


        seasonMonths.push({

            id:
                `${year}-${monthNumber}`,

            label:
                `${monthNames[monthIndex]} ${year}`

        });

    }


    /* =========================
       FILTRO
       ========================= */

    let fines =
        allFines;


    if (
        selectedMonth !== "all"
    ) {

        fines =
            allFines.filter(
                fine =>
                    fine.date &&
                    fine.date.startsWith(
                        selectedMonth
                    )
            );

    }


    /* =========================
       TOTALI
       ========================= */

    const total =
        fines.reduce(
            (sum, fine) =>
                sum +
                Number(
                    fine.amount || 0
                ),
            0
        );


    const unpaid =
        fines
            .filter(
                fine =>
                    !fine.paid
            )
            .reduce(
                (sum, fine) =>
                    sum +
                    Number(
                        fine.amount || 0
                    ),
                0
            );


    const paid =
        total - unpaid;


    /* =========================
       TITOLO
       ========================= */

    const selectedMonthData =
        seasonMonths.find(
            month =>
                month.id ===
                selectedMonth
        );


    const title =
        selectedMonth === "all"

            ? "Tutte le multe"

            : selectedMonthData
                ? selectedMonthData.label
                : "Multe";


    const subtitle =
        fines.length === 0

            ? "Nessuna multa registrata"

            : `${fines.length} ${
                fines.length === 1
                    ? "multa"
                    : "multe"
            } · ${money(total)} totali`;


    /* =========================
       ORDINAMENTO
       ========================= */

    const sortedFines =
        [...fines].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    /* =========================
       ELENCO
       ========================= */

    const finesHtml =
        sortedFines.length

            ?

        `
            <div class="list fines-list">

                ${
                    sortedFines
                        .map(
                            renderFineRow
                        )
                        .join("")
                }

            </div>
        `

            :

        `
            <div class="card empty-state">

                <div class="empty-icon">
                    🧾
                </div>

                <h3>
                    Nessuna multa
                </h3>

                <p>
                    Non ci sono multe
                    registrate per questo periodo.
                </p>

                <button
                    class="primary-btn"
                    id="addFineEmpty"
                    type="button"
                >
                    ＋ Aggiungi multa
                </button>

            </div>
        `;


    return `

        <section class="page-header">

            <div>

                <div class="eyebrow">
                    GESTIONE MULTE
                </div>

                <h1>
                    ${escapeHtml(title)}
                </h1>

                <p>
                    ${subtitle}
                </p>

            </div>


            <button
                class="primary-btn"
                id="addFine"
                type="button"
            >
                ＋ Nuova multa
            </button>

        </section>


        <div class="card month-selector">

            <div class="section-title-row">

                <div>

                    <strong>
                        Periodo
                    </strong>

                    <span class="muted">
                        Seleziona il mese da visualizzare
                    </span>

                </div>

            </div>


            <div class="month-select-wrapper">

                <select
                    id="monthSelector"
                    class="month-select"
                >

                    <option
                        value="all"
                        ${
                            selectedMonth === "all"
                                ? "selected"
                                : ""
                        }
                    >
                        Tutte le multe
                    </option>


                    ${
                        seasonMonths
                            .map(
                                month => `

                                    <option
                                        value="${month.id}"
                                        ${
                                            selectedMonth ===
                                            month.id
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${month.label}
                                    </option>

                                `
                            )
                            .join("")
                    }

                </select>


                <span
                    class="month-select-arrow"
                >
                    ⌄
                </span>

            </div>

        </div>


        <div class="stats-grid fines-summary">


            <div class="stat-card">

                <span>
                    Totale periodo
                </span>

                <strong>
                    ${money(total)}
                </strong>

                <small>
                    ${fines.length}
                    ${
                        fines.length === 1
                            ? "multa"
                            : "multe"
                    }
                </small>

            </div>


            <div class="stat-card">

                <span>
                    Pagate
                </span>

                <strong class="positive">
                    ${money(paid)}
                </strong>

                <small>
                    Già saldate
                </small>

            </div>


            <div class="stat-card">

                <span>
                    Da pagare
                </span>

                <strong
                    class="${
                        unpaid > 0
                            ? "negative"
                            : "positive"
                    }"
                >
                    ${money(unpaid)}
                </strong>

                <small>
                    ${
                        fines.filter(
                            fine =>
                                !fine.paid
                        ).length
                    }
                    non saldate
                </small>

            </div>


        </div>


        <div class="section-heading">

            <div>

                <h2>
                    Elenco multe
                </h2>

                <span>
                    ${
                        fines.length
                            ? "Più recenti in alto"
                            : "Nessun elemento"
                    }
                </span>

            </div>

        </div>


        ${finesHtml}

    `;

}


/* =========================================================
   RIGA MULTA
   ========================================================= */

function renderFineRow(fine) {

    return `

        <div class="list-item">

            <div class="row">

                <div class="row-left">

                    <div class="avatar">
                        ${initials(
                            fine.player
                        )}
                    </div>


                    <div>

                        <strong>
                            ${escapeHtml(
                                fine.player
                            )}
                        </strong>

                        <div class="small muted">

                            ${escapeHtml(
                                fine.category || ""
                            )}

                            ${
                                fine.category &&
                                fine.type
                                    ? " · "
                                    : ""
                            }

                            ${escapeHtml(
                                fine.type || ""
                            )}

                        </div>


                        <div class="small muted">

                            ${formatDate(
                                fine.date
                            )}

                        </div>

                    </div>

                </div>


                <div
                    style="
                        text-align:right;
                    "
                >

                    <div class="amount">
                        ${money(
                            fine.amount
                        )}
                    </div>


                    <span
                        class="
                            badge
                            ${
                                fine.paid
                                    ? "paid"
                                    : "unpaid"
                            }
                        "
                    >
                        ${
                            fine.paid
                                ? "Pagata"
                                : "Da pagare"
                        }
                    </span>

                </div>

            </div>


            <div
                class="row"
                style="
                    justify-content:flex-end;
                    margin-top:10px;
                    flex-wrap:wrap;
                "
            >

                <button
                    class="btn secondary"
                    data-toggle-paid="${fine.id}"
                    type="button"
                >
                    ${
                        fine.paid
                            ? "Segna da pagare"
                            : "Segna pagata"
                    }
                </button>


                <button
                    class="btn secondary"
                    data-edit-fine="${fine.id}"
                    type="button"
                >
                    Modifica
                </button>


                <button
                    class="btn danger"
                    data-delete-fine="${fine.id}"
                    type="button"
                >
                    Elimina
                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   MULTARIO
   ========================================================= */

function renderRules() {

    const categories = {};


    state.rules.forEach(
        rule => {

            if (!categories[rule.category]) {

                categories[rule.category] = [];

            }

            categories[rule.category]
                .push(rule);

        }
    );


    const categoryOrder = [

        "Allenamento",
        "Partita",
        "Materiale"

    ];


    const orderedCategories = [

        ...categoryOrder
            .filter(
                category =>
                    categories[category]
            ),

        ...Object.keys(
            categories
        )
            .filter(
                category =>
                    !categoryOrder.includes(
                        category
                    )
            )

    ];


    return `

        <section class="page-header">

            <div>

                <div class="eyebrow">
                    MULTARIO
                </div>

                <h1>
                    Regole multe
                </h1>

                <p>
                    Gestisci le regole
                    della squadra.
                </p>

            </div>


            <button
                class="primary-btn"
                id="addRule"
                type="button"
            >
                ＋ Nuova regola
            </button>

        </section>


        ${
            orderedCategories.length

                ?

            orderedCategories
                .map(
                    category => `

                        <div class="section-heading">

                            <div>

                                <h2>
                                    ${escapeHtml(
                                        category
                                    )}
                                </h2>

                            </div>

                        </div>


                        <div class="list">

                            ${
                                categories[category]
                                    .map(
                                        rule => `

                                            <div class="list-item">

                                                <div class="row">

                                                    <div>

                                                        <strong>
                                                            ${escapeHtml(
                                                                rule.type
                                                            )}
                                                        </strong>

                                                        <div class="small muted">
                                                            ${escapeHtml(
                                                                rule.category
                                                            )}
                                                        </div>

                                                    </div>


                                                    <strong class="amount">
                                                        ${money(
                                                            rule.amount
                                                        )}
                                                    </strong>

                                                </div>


                                                <div
                                                    class="row"
                                                    style="
                                                        justify-content:flex-end;
                                                        margin-top:10px;
                                                        flex-wrap:wrap;
                                                    "
                                                >

                                                    <button
                                                        class="btn secondary"
                                                        data-edit-rule="${rule.id}"
                                                        type="button"
                                                    >
                                                        Modifica
                                                    </button>


                                                    <button
                                                        class="btn danger"
                                                        data-delete-rule="${rule.id}"
                                                        type="button"
                                                    >
                                                        Elimina
                                                    </button>

                                                </div>

                                            </div>

                                        `
                                    )
                                    .join("")
                            }

                        </div>

                    `
                )
                .join("")

                :

            `
                <div class="card empty-state">

                    <div class="empty-icon">
                        📋
                    </div>

                    <h3>
                        Nessuna regola
                    </h3>

                    <p>
                        Aggiungi una regola
                        al multario.
                    </p>

                </div>
            `
        }

    `;

}


/* =========================================================
   IMPOSTAZIONI
   ========================================================= */

function renderSettings() {

    return `

        <section class="page-header">

            <div>

                <div class="eyebrow">
                    IMPOSTAZIONI
                </div>

                <h1>
                    Impostazioni
                </h1>

                <p>
                    Personalizza la gestione
                    della squadra.
                </p>

            </div>

        </section>


        <div class="card">

            <div class="section-title-row">

                <div>

                    <strong>
                        Squadra
                    </strong>

                    <span class="muted">
                        Informazioni principali
                    </span>

                </div>

            </div>


            <label class="form-label">
                Nome squadra
            </label>

            <input
                id="teamNameInput"
                class="form-input"
                type="text"
                value="${escapeHtml(
                    state.teamName
                )}"
            />


            <label class="form-label">
                Stagione
            </label>

            <input
                id="seasonInput"
                class="form-input"
                type="text"
                value="${escapeHtml(
                    state.season
                )}"
                placeholder="2026/27"
            />


            <button
                class="primary-btn"
                id="saveSettings"
                type="button"
            >
                Salva impostazioni
            </button>

        </div>


        <div class="card">

            <div class="section-title-row">

                <div>

                    <strong>
                        Giocatori
                    </strong>

                    <span class="muted">
                        ${state.players.length}
                        giocatori
                    </span>

                </div>


                <button
                    class="btn secondary"
                    id="addPlayer"
                    type="button"
                >
                    ＋ Aggiungi
                </button>

            </div>


            <div class="list">

                ${
                    state.players.length

                        ?

                    state.players
                        .map(
                            (player, index) => `

                                <div class="list-item">

                                    <div class="row">

                                        <div class="row-left">

                                            <div class="avatar">
                                                ${initials(
                                                    player
                                                )}
                                            </div>

                                            <strong>
                                                ${escapeHtml(
                                                    player
                                                )}
                                            </strong>

                                        </div>


                                        <button
                                            class="btn danger"
                                            data-delete-player="${index}"
                                            type="button"
                                        >
                                            Elimina
                                        </button>

                                    </div>

                                </div>

                            `
                        )
                        .join("")

                        :

                    `
                        <div class="empty-state">

                            <p>
                                Nessun giocatore
                                inserito.
                            </p>

                        </div>
                    `
                }

            </div>

        </div>


        <div class="card">

            <div class="section-title-row">

                <div>

                    <strong>
                        Aspetto
                    </strong>

                    <span class="muted">
                        Tema dell'applicazione
                    </span>

                </div>


                <button
                    class="btn secondary"
                    id="settingsThemeButton"
                    type="button"
                >
                    ${
                        state.theme === "dark"
                            ? "🌙 Scuro"
                            : "☀️ Chiaro"
                    }
                </button>

            </div>

        </div>


        <div class="card">

            <div class="section-title-row">

                <div>

                    <strong>
                        Backup
                    </strong>

                    <span class="muted">
                        Salva o ripristina i dati
                    </span>

                </div>

            </div>


            <div
                class="row"
                style="
                    flex-wrap:wrap;
                "
            >

                <button
                    class="btn secondary"
                    id="exportData"
                    type="button"
                >
                    Esporta backup
                </button>


                <button
                    class="btn secondary"
                    id="importData"
                    type="button"
                >
                    Importa backup
                </button>

            </div>


            <input
                type="file"
                id="importFile"
                accept=".json,application/json"
                style="display:none;"
            />

        </div>


        <div class="card">

            <div class="section-title-row">

                <div>

                    <strong>
                        Zona pericolosa
                    </strong>

                    <span class="muted">
                        Cancella tutti i dati
                    </span>

                </div>

            </div>


            <button
                class="btn danger"
                id="resetData"
                type="button"
            >
                Ripristina dati iniziali
            </button>

        </div>

    `;

}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(title, content) {

    const root =
        document.getElementById(
            "modalRoot"
        );


    if (!root) {

        return;

    }


    root.innerHTML = `

        <div
            class="modal-backdrop"
            id="modalBackdrop"
        >

            <div class="modal">

                <div class="row">

                    <h2>
                        ${title}
                    </h2>

                    <button
                        class="icon-mini"
                        id="closeModal"
                        type="button"
                    >
                        ×
                    </button>

                </div>


                ${content}

            </div>

        </div>

    `;


    document
        .getElementById(
            "closeModal"
        )
        ?.addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById(
            "modalBackdrop"
        )
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "modalBackdrop"
                ) {

                    closeModal();

                }

            }
        );

}


function closeModal() {

    const root =
        document.getElementById(
            "modalRoot"
        );


    if (root) {

        root.innerHTML = "";

    }

}


/* =========================================================
   MODAL MULTA
   ========================================================= */

function openFineModal(fineId = null) {

    const existing =
        state.fines.find(
            fine =>
                String(fine.id) ===
                String(fineId)
        );


    const isEdit =
        Boolean(existing);


    const categories = [
        ...new Set(
            state.rules.map(
                rule =>
                    rule.category
            )
        )
    ];


    let initialRule =
        existing
            ? state.rules.find(
                rule =>
                    String(rule.id) ===
                    String(existing.ruleId)
            )
            : null;


    if (!initialRule && existing) {

        initialRule =
            state.rules.find(
                rule =>
                    rule.category ===
                    existing.category &&
                    rule.type ===
                    existing.type
            );

    }


    if (!initialRule) {

        initialRule =
            state.rules[0] ||
            null;

    }


    const initialCategory =
        existing?.category ||
        initialRule?.category ||
        categories[0] ||
        "";


    const initialRules =
        state.rules.filter(
            rule =>
                rule.category ===
                initialCategory
        );


    openModal(

        isEdit
            ? "Modifica multa"
            : "Nuova multa",

        `

            <div class="form-group">

                <label class="form-label">
                    Giocatore
                </label>

                <select
                    id="finePlayer"
                    class="form-input"
                >

                    <option value="">
                        Seleziona giocatore
                    </option>

                    ${
                        state.players
                            .map(
                                player => `

                                    <option
                                        value="${escapeHtml(
                                            player
                                        )}"
                                        ${
                                            existing?.player ===
                                            player
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHtml(
                                            player
                                        )}
                                    </option>

                                `
                            )
                            .join("")
                    }

                </select>

            </div>


            <div class="form-group">

                <label class="form-label">
                    Categoria
                </label>

                <select
                    id="fineCategory"
                    class="form-input"
                >

                    ${
                        categories
                            .map(
                                category => `

                                    <option
                                        value="${escapeHtml(
                                            category
                                        )}"
                                        ${
                                            category ===
                                            initialCategory
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHtml(
                                            category
                                        )}
                                    </option>

                                `
                            )
                            .join("")
                    }

                </select>

            </div>


            <div class="form-group">

                <label class="form-label">
                    Regola
                </label>

                <select
                    id="fineRule"
                    class="form-input"
                >

                    ${
                        initialRules
                            .map(
                                rule => `

                                    <option
                                        value="${rule.id}"
                                        ${
                                            initialRule &&
                                            String(
                                                initialRule.id
                                            ) ===
                                            String(
                                                rule.id
                                            )
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHtml(
                                            rule.type
                                        )}
                                        -
                                        ${money(
                                            rule.amount
                                        )}
                                    </option>

                                `
                            )
                            .join("")
                    }

                </select>

            </div>


            <div class="form-group">

                <label class="form-label">
                    Data
                </label>

                <input
                    id="fineDate"
                    class="form-input"
                    type="date"
                    value="${
                        existing?.date ||
                        todayString()
                    }"
                />

            </div>


            <div class="form-group">

                <label class="form-label">
                    Importo
                </label>

                <input
                    id="fineAmount"
                    class="form-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value="${
                        existing?.amount ??
                        initialRule?.amount ??
                        0
                    }"
                />

            </div>


            <label
                class="checkbox-row"
            >

                <input
                    id="finePaid"
                    type="checkbox"
                    ${
                        existing?.paid
                            ? "checked"
                            : ""
                    }
                />

                <span>
                    Multa già pagata
                </span>

            </label>


            <button
                class="primary-btn"
                id="saveFine"
                type="button"
            >
                ${
                    isEdit
                        ? "Salva modifiche"
                        : "Aggiungi multa"
                }
            </button>

        `

    );


    const categorySelect =
        document.getElementById(
            "fineCategory"
        );

    const ruleSelect =
        document.getElementById(
            "fineRule"
        );

    const amountInput =
        document.getElementById(
            "fineAmount"
        );


    function updateRules() {

        const category =
            categorySelect.value;


        const rules =
            state.rules.filter(
                rule =>
                    rule.category ===
                    category
            );


        ruleSelect.innerHTML =
            rules
                .map(
                    rule => `

                        <option
                            value="${rule.id}"
                        >
                            ${escapeHtml(
                                rule.type
                            )}
                            -
                            ${money(
                                rule.amount
                            )}
                        </option>

                    `
                )
                .join("");


        if (rules.length) {

            amountInput.value =
                rules[0].amount;

        }

    }


    categorySelect
        ?.addEventListener(
            "change",
            updateRules
        );


    ruleSelect
        ?.addEventListener(
            "change",
            () => {

                const rule =
                    state.rules.find(
                        item =>
                            String(item.id) ===
                            String(
                                ruleSelect.value
                            )
                    );


                if (rule) {

                    amountInput.value =
                        rule.amount;

                }

            }
        );


    document
        .getElementById(
            "saveFine"
        )
        ?.addEventListener(
            "click",
            () => {

                const player =
                    document.getElementById(
                        "finePlayer"
                    ).value;


                const category =
                    document.getElementById(
                        "fineCategory"
                    ).value;


                const ruleId =
                    document.getElementById(
                        "fineRule"
                    ).value;


                const date =
                    document.getElementById(
                        "fineDate"
                    ).value;


                const amount =
                    Number(
                        document.getElementById(
                            "fineAmount"
                        ).value
                    );


                const paid =
                    document.getElementById(
                        "finePaid"
                    ).checked;


                if (!player) {

                    showToast(
                        "Seleziona un giocatore"
                    );

                    return;

                }


                if (!date) {

                    showToast(
                        "Inserisci la data"
                    );

                    return;

                }


                if (
                    !Number.isFinite(amount) ||
                    amount < 0
                ) {

                    showToast(
                        "Importo non valido"
                    );

                    return;

                }


                const rule =
                    state.rules.find(
                        item =>
                            String(item.id) ===
                            String(ruleId)
                    );


                if (isEdit) {

                    existing.player =
                        player;

                    existing.category =
                        category;

                    existing.type =
                        rule?.type ||
                        existing.type;

                    existing.ruleId =
                        ruleId;

                    existing.date =
                        date;

                    existing.amount =
                        amount;

                    existing.paid =
                        paid;

                }

                else {

                    state.fines.push({

                        id:
                            generateId(
                                "fine"
                            ),

                        player,

                        category,

                        type:
                            rule?.type ||
                            "Multa",

                        ruleId,

                        date,

                        amount,

                        paid

                    });

                }


                saveState();

                closeModal();

                render();

                showToast(
                    isEdit
                        ? "Multa modificata"
                        : "Multa aggiunta"
                );

            }
        );

}


/* =========================================================
   MODAL REGOLA
   ========================================================= */

function openRuleModal(ruleId = null) {

    const existing =
        state.rules.find(
            rule =>
                String(rule.id) ===
                String(ruleId)
        );


    const isEdit =
        Boolean(existing);


    openModal(

        isEdit
            ? "Modifica regola"
            : "Nuova regola",

        `

            <div class="form-group">

                <label class="form-label">
                    Categoria
                </label>

                <input
                    id="ruleCategory"
                    class="form-input"
                    type="text"
                    value="${escapeHtml(
                        existing?.category ||
                        ""
                    )}"
                    placeholder="Es. Allenamento"
                />

            </div>


            <div class="form-group">

                <label class="form-label">
                    Nome regola
                </label>

                <input
                    id="ruleType"
                    class="form-input"
                    type="text"
                    value="${escapeHtml(
                        existing?.type ||
                        ""
                    )}"
                    placeholder="Es. Ritardo allenamento"
                />

            </div>


            <div class="form-group">

                <label class="form-label">
                    Importo
                </label>

                <input
                    id="ruleAmount"
                    class="form-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value="${
                        existing?.amount ??
                        0
                    }"
                />

            </div>


            <button
                class="primary-btn"
                id="saveRule"
                type="button"
            >
                ${
                    isEdit
                        ? "Salva modifiche"
                        : "Aggiungi regola"
                }
            </button>

        `

    );


    document
        .getElementById(
            "saveRule"
        )
        ?.addEventListener(
            "click",
            () => {

                const category =
                    document.getElementById(
                        "ruleCategory"
                    ).value.trim();


                const type =
                    document.getElementById(
                        "ruleType"
                    ).value.trim();


                const amount =
                    Number(
                        document.getElementById(
                            "ruleAmount"
                        ).value
                    );


                if (!category || !type) {

                    showToast(
                        "Compila tutti i campi"
                    );

                    return;

                }


                if (
                    !Number.isFinite(amount) ||
                    amount < 0
                ) {

                    showToast(
                        "Importo non valido"
                    );

                    return;

                }


                if (isEdit) {

                    existing.category =
                        category;

                    existing.type =
                        type;

                    existing.amount =
                        amount;

                }

                else {

                    state.rules.push({

                        id:
                            generateId(
                                "rule"
                            ),

                        category,

                        type,

                        amount

                    });

                }


                saveState();

                closeModal();

                render();

                showToast(
                    isEdit
                        ? "Regola modificata"
                        : "Regola aggiunta"
                );

            }
        );

}


/* =========================================================
   MODAL GIOCATORE
   ========================================================= */

function openPlayerModal() {

    openModal(

        "Nuovo giocatore",

        `

            <div class="form-group">

                <label class="form-label">
                    Nome giocatore
                </label>

                <input
                    id="playerName"
                    class="form-input"
                    type="text"
                    placeholder="Nome e cognome"
                    autocomplete="off"
                />

            </div>


            <button
                class="primary-btn"
                id="savePlayer"
                type="button"
            >
                Aggiungi giocatore
            </button>

        `

    );


    document
        .getElementById(
            "savePlayer"
        )
        ?.addEventListener(
            "click",
            () => {

                const input =
                    document.getElementById(
                        "playerName"
                    );


                const name =
                    input.value.trim();


                if (!name) {

                    showToast(
                        "Inserisci il nome"
                    );

                    return;

                }


                const exists =
                    state.players.some(
                        player =>
                            player.toLowerCase() ===
                            name.toLowerCase()
                    );


                if (exists) {

                    showToast(
                        "Giocatore già presente"
                    );

                    return;

                }


                state.players.push(
                    name
                );


                saveState();

                closeModal();

                render();

                showToast(
                    "Giocatore aggiunto"
                );

            }
        );

}


/* =========================================================
   BACKUP
   ========================================================= */

function exportData() {

    const data =
        JSON.stringify(
            state,
            null,
            2
        );


    const blob =
        new Blob(
            [data],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;

    link.download =
        `MulteSV-backup-${todayString()}.json`;


    document.body.appendChild(
        link
    );

    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Backup esportato"
    );

}


function importData() {

    document
        .getElementById(
            "importFile"
        )
        ?.click();

}


function handleImportFile(event) {

    const file =
        event.target.files?.[0];


    if (!file) {

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        () => {

            try {

                const imported =
                    JSON.parse(
                        reader.result
                    );


                if (
                    !imported ||
                    typeof imported !==
                    "object"
                ) {

                    throw new Error(
                        "Formato non valido"
                    );

                }


                state = {

                    ...clone(
                        defaultState
                    ),

                    ...imported,

                    players:
                        Array.isArray(
                            imported.players
                        )
                            ? imported.players
                            : [],

                    rules:
                        Array.isArray(
                            imported.rules
                        )
                            ? imported.rules
                            : [],

                    fines:
                        Array.isArray(
                            imported.fines
                        )
                            ? imported.fines
                            : []

                };


                saveState();

                selectedMonth =
                    "all";

                render();

                showToast(
                    "Backup importato"
                );

            }

            catch (error) {

                console.error(
                    error
                );

                showToast(
                    "Backup non valido"
                );

            }

            event.target.value = "";

        };


    reader.readAsText(
        file
    );

}


/* =========================================================
   RESET
   ========================================================= */

function resetData() {

    const confirmed =
        confirm(
            "Sei sicuro di voler cancellare tutti i dati e ripristinare le impostazioni iniziali?"
        );


    if (!confirmed) {

        return;

    }


    state =
        clone(
            defaultState
        );


    selectedMonth =
        "all";


    saveState();

    render();

    showToast(
        "Dati ripristinati"
    );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2200
    );

}


/* =========================================================
   EVENTI PAGINA
   ========================================================= */

function bindPageEvents() {


    /* =========================
       NAVIGAZIONE
       ========================= */

    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        currentPage =
                            button.dataset.page;

                        render();

                    };

            }
        );


    /* =========================
       HOME
       ========================= */

    document
        .getElementById(
            "homeAddFine"
        )
        ?.addEventListener(
            "click",
            () => {

                openFineModal();

            }
        );


    document
        .getElementById(
            "goToFines"
        )
        ?.addEventListener(
            "click",
            () => {

                currentPage =
                    "fines";

                render();

            }
        );


    /* =========================
       MULTE
       ========================= */

    document
        .getElementById(
            "addFine"
        )
        ?.addEventListener(
            "click",
            () => {

                openFineModal();

            }
        );


    document
        .getElementById(
            "addFineEmpty"
        )
        ?.addEventListener(
            "click",
            () => {

                openFineModal();

            }
        );


    document
        .getElementById(
            "monthSelector"
        )
        ?.addEventListener(
            "change",
            event => {

                selectedMonth =
                    event.target.value;

                render();

            }
        );


    document
        .querySelectorAll(
            "[data-toggle-paid]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .togglePaid;


                        const fine =
                            state.fines.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(id)
                            );


                        if (!fine) {

                            return;

                        }


                        fine.paid =
                            !fine.paid;


                        saveState();

                        render();

                        showToast(
                            fine.paid
                                ? "Multa segnata come pagata"
                                : "Multa segnata da pagare"
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-edit-fine]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openFineModal(
                            button.dataset
                                .editFine
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-delete-fine]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .deleteFine;


                        const confirmed =
                            confirm(
                                "Vuoi eliminare questa multa?"
                            );


                        if (!confirmed) {

                            return;

                        }


                        state.fines =
                            state.fines.filter(
                                fine =>
                                    String(
                                        fine.id
                                    ) !==
                                    String(id)
                            );


                        saveState();

                        render();

                        showToast(
                            "Multa eliminata"
                        );

                    }
                );

            }
        );


    /* =========================
       MULTARIO
       ========================= */

    document
        .getElementById(
            "addRule"
        )
        ?.addEventListener(
            "click",
            () => {

                openRuleModal();

            }
        );


    document
        .querySelectorAll(
            "[data-edit-rule]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openRuleModal(
                            button.dataset
                                .editRule
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-delete-rule]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .deleteRule;


                        const confirmed =
                            confirm(
                                "Vuoi eliminare questa regola?"
                            );


                        if (!confirmed) {

                            return;

                        }


                        state.rules =
                            state.rules.filter(
                                rule =>
                                    String(
                                        rule.id
                                    ) !==
                                    String(id)
                            );


                        saveState();

                        render();

                        showToast(
                            "Regola eliminata"
                        );

                    }
                );

            }
        );


    /* =========================
       IMPOSTAZIONI
       ========================= */

    document
        .getElementById(
            "saveSettings"
        )
        ?.addEventListener(
            "click",
            () => {

                const teamName =
                    document.getElementById(
                        "teamNameInput"
                    ).value.trim();


                const season =
                    document.getElementById(
                        "seasonInput"
                    ).value.trim();


                if (!teamName) {

                    showToast(
                        "Inserisci il nome della squadra"
                    );

                    return;

                }


                state.teamName =
                    teamName;


                state.season =
                    season ||
                    "2026/27";


                saveState();

                render();

                showToast(
                    "Impostazioni salvate"
                );

            }
        );


    document
        .getElementById(
            "settingsThemeButton"
        )
        ?.addEventListener(
            "click",
            () => {

                state.theme =
                    state.theme === "dark"
                        ? "light"
                        : "dark";


                saveState();

                applyTheme();

                render();

            }
        );


    document
        .getElementById(
            "addPlayer"
        )
        ?.addEventListener(
            "click",
            () => {

                openPlayerModal();

            }
        );


    document
        .querySelectorAll(
            "[data-delete-player]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset
                                    .deletePlayer
                            );


                        const player =
                            state.players[index];


                        if (!player) {

                            return;

                        }


                        const used =
                            state.fines.some(
                                fine =>
                                    fine.player ===
                                    player
                            );


                        if (used) {

                            const confirmed =
                                confirm(
                                    `${player} ha delle multe associate. Vuoi comunque eliminarlo dalla lista dei giocatori?`
                                );


                            if (!confirmed) {

                                return;

                            }

                        }


                        state.players.splice(
                            index,
                            1
                        );


                        saveState();

                        render();

                        showToast(
                            "Giocatore eliminato"
                        );

                    }
                );

            }
        );


    /* =========================
       BACKUP
       ========================= */

    document
        .getElementById(
            "exportData"
        )
        ?.addEventListener(
            "click",
            exportData
        );


    document
        .getElementById(
            "importData"
        )
        ?.addEventListener(
            "click",
            importData
        );


    document
        .getElementById(
            "importFile"
        )
        ?.addEventListener(
            "change",
            handleImportFile
        );


    document
        .getElementById(
            "resetData"
        )
        ?.addEventListener(
            "click",
            resetData
        );


    /* =========================
       TEMA HEADER
       ========================= */

    document
        .getElementById(
            "themeButton"
        )
        ?.addEventListener(
            "click",
            () => {

                state.theme =
                    state.theme === "dark"
                        ? "light"
                        : "dark";


                saveState();

                applyTheme();

                render();

            }
        );

}


/* =========================================================
   RENDER PRINCIPALE
   ========================================================= */

function render() {

    applyTheme();


    const app =
        document.getElementById(
            "app"
        );


    if (!app) {

        console.error(
            "Elemento #app non trovato"
        );

        return;

    }


    updateNavigation();


    if (
        currentPage ===
        "home"
    ) {

        app.innerHTML =
            renderHome();

    }

    else if (
        currentPage ===
        "fines"
    ) {

        app.innerHTML =
            renderFines();

    }

    else if (
        currentPage ===
        "rules"
    ) {

        app.innerHTML =
            renderRules();

    }

    else if (
        currentPage ===
        "settings"
    ) {

        app.innerHTML =
            renderSettings();

    }

    else {

        currentPage =
            "home";

        app.innerHTML =
            renderHome();

    }


    bindPageEvents();

}


/* =========================================================
   AVVIO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        render();


        if (
            "serviceWorker" in
            navigator
        ) {

            window.addEventListener(
                "load",
                () => {

                    navigator.serviceWorker
                        .register(
                            "./service-worker.js"
                        )
                        .then(
                            () => {

                                console.log(
                                    "MulteSV: Service Worker attivo"
                                );

                            }
                        )
                        .catch(
                            error => {

                                console.error(
                                    "MulteSV: errore Service Worker",
                                    error
                                );

                            }
                        );

                }
            );

        }

    }
);
