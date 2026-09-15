/* =========================================================
   MulteFC
   APP.JS
   ========================================================= */

const STORAGE_KEY = "multefc_v1";


/* =========================================================
   DATI INIZIALI
   ========================================================= */

const defaultState = {

    team: "Multe FC",

    season: "2026/27",

    theme: "light",

    players: [
        "Marco",
        "Luca",
        "Andrea",
        "Matteo",
        "Davide",
        "Simone"
    ],

    fines: [

        {
            id: 1,
            date: "2026-09-12",
            player: "Marco",
            category: "Allenamento",
            type: "Ritardo allenamento",
            amount: 5,
            paid: true
        },

        {
            id: 2,
            date: "2026-09-11",
            player: "Luca",
            category: "Partita",
            type: "Ammonizione per proteste",
            amount: 10,
            paid: false
        },

        {
            id: 3,
            date: "2026-09-08",
            player: "Andrea",
            category: "Allenamento",
            type: "Assenza ingiustificata",
            amount: 20,
            paid: true
        }

    ],

    rules: [

    {
        id: 1,
        category: "Allenamento",
        type: "Ritardo all'allenamento senza aver avvisato almeno un'ora prima il mister",
        amount: 2,
        calculation: "per_minute",
        baseAmount: 2,
        perMinute: 1
    },

    {
        id: 2,
        category: "Allenamento",
        type: "Assenza all'allenamento senza avvisare il mister",
        amount: 10,
        calculation: "fixed"
    },

    {
        id: 3,
        category: "Partita",
        type: "Ritardo rispetto all'orario di convocazione senza aver avvisato almeno un'ora prima il mister",
        amount: 5,
        calculation: "per_minute",
        baseAmount: 5,
        perMinute: 1
    },

    {
        id: 4,
        category: "Partita",
        type: "Assenza alla partita senza avvisare il mister",
        amount: 50,
        calculation: "fixed"
    },

    {
        id: 5,
        category: "Partita",
        type: "Assenza birra post partita",
        amount: 2,
        calculation: "fixed"
    },

    {
        id: 6,
        category: "Materiale",
        type: "Dimenticanza materiale per allenamento/partita",
        amount: 2,
        calculation: "per_piece",
        perPiece: 2
    },

    {
        id: 7,
        category: "Partita",
        type: "Dimenticanza tuta di rappresentanza alla partita",
        amount: 10,
        calculation: "fixed"
    },

    {
        id: 8,
        category: "Partita",
        type: "Dimenticanza documento alla partita",
        amount: 10,
        calculation: "fixed"
    },

    {
        id: 9,
        category: "Materiale",
        type: "Dimenticanza materiale personale per doccia",
        amount: 2,
        calculation: "per_piece",
        perPiece: 2
    },

    {
        id: 10,
        category: "Materiale",
        type: "Dimenticanza materiale in spogliatoio",
        amount: 2,
        calculation: "fixed"
    },

    {
        id: 11,
        category: "Materiale",
        type: "Mancato rispetto del turno di raccolta materiale post allenamento",
        amount: 2,
        calculation: "fixed"
    },

    {
        id: 12,
        category: "Spogliatoio",
        type: "Pisciata in doccia",
        amount: 5,
        calculation: "fixed"
    },

    {
        id: 13,
        category: "Spogliatoio",
        type: "Utilizzo/squillo cellulare durante riunioni",
        amount: 5,
        calculation: "fixed"
    },

    {
        id: 14,
        category: "Partita",
        type: "Pallone calciato fuori dal campo",
        amount: 5,
        calculation: "fixed"
    },

    {
        id: 15,
        category: "Comportamento",
        type: "Mancanza di rispetto verso compagni/mister/dirigenti",
        amount: 15,
        calculation: "fixed"
    },

    {
        id: 16,
        category: "Allenamento",
        type: "Squadra perdente la partitella del giovedì",
        amount: 1,
        calculation: "fixed"
    },

    {
        id: 17,
        category: "Allenamento",
        type: "Torello: 20 passaggi / errore al 19° passaggio",
        amount: 1,
        calculation: "fixed"
    },

    {
        id: 18,
        category: "Partita",
        type: "Ammonizione per protesta e/o reazione",
        amount: 10,
        calculation: "fixed"
    },

    {
        id: 19,
        category: "Partita",
        type: "Espulsione per protesta e/o reazione",
        amount: 20,
        calculation: "fixed"
    },

    {
        id: 20,
        category: "Allenamento",
        type: "Allenamento svolto con svogliatezza/senza impegno",
        amount: 2,
        calculation: "custom_min",
        minAmount: 2
    },

    {
        id: 21,
        category: "Partita",
        type: "Impiego di troppo tempo per farsi la doccia",
        amount: 5,
        calculation: "custom_min",
        minAmount: 5
    },

    {
        id: 22,
        category: "Squadra",
        type: "Mancanza di condivisione compleanni (cibo, birra/bevande)",
        amount: 20,
        calculation: "fixed"
    }

]

};


/* =========================================================
   STATO APP
   ========================================================= */

let state = loadState();

let currentPage = "home";

let selectedMonth = "all";


/* =========================================================
   STORAGE
   ========================================================= */

function loadState() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved) {

            return JSON.parse(saved);

        }

    } catch (error) {

        console.error(
            "Errore caricamento dati:",
            error
        );

    }

    return structuredClone(defaultState);
}


function saveState() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );

}


/* =========================================================
   UTILITY
   ========================================================= */

function money(value) {

    return new Intl.NumberFormat(
        "it-IT",
        {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


function formatDate(date) {

    return new Date(
        date + "T12:00:00"
    ).toLocaleDateString(
        "it-IT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


function generateId() {

    return Date.now() +
        Math.floor(
            Math.random() * 1000
        );

}


function initials(name) {

    return name
        .split(/\s+/)
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            character => {

                const map = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };

                return map[character];

            }
        );

}


/* =========================================================
   STAGIONE / MESI
   ========================================================= */

function getSeasonStartYear() {

    const match =
        String(state.season)
            .match(/^(\d{4})/);

    if (match) {

        return Number(match[1]);

    }

    return new Date()
        .getFullYear();

}


function getYearForMonth(month) {

    const startYear =
        getSeasonStartYear();

    /*
       Luglio → Dicembre
       = anno di inizio stagione

       Gennaio → Giugno
       = anno successivo
    */

    if (month >= 7) {

        return startYear;

    }

    return startYear + 1;

}


function getMonthName(month) {

    return new Date(
        2000,
        month - 1,
        1
    ).toLocaleDateString(
        "it-IT",
        {
            month: "long"
        }
    );

}


function getSeasonMonths() {

    const months = [];

    for (
        let month = 1;
        month <= 12;
        month++
    ) {

        const year =
            getYearForMonth(month);

        const monthNumber =
            String(month)
                .padStart(2, "0");

        months.push({

            id:
                `${year}-${monthNumber}`,

            label:
                `${getMonthName(month)} ${year}`

        });

    }

    return months;

}


/* =========================================================
   TEMA
   ========================================================= */

function applyTheme() {

    document.documentElement
        .dataset.theme =
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

            button.classList.toggle(
                "active",
                button.dataset.page ===
                    currentPage
            );

        });


    const titles = {

        home: "Home",

        fines: "Multe",

        rules: "Multario",

        settings: "Impostazioni"

    };


    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[currentPage];

}


/* =========================================================
   RENDER GENERALE
   ========================================================= */

function render() {

    applyTheme();

    updateNavigation();


    const app =
        document.getElementById(
            "app"
        );


    if (currentPage === "home") {

        app.innerHTML =
            renderHome();

    }


    if (currentPage === "fines") {

        app.innerHTML =
            renderFines();

    }


    if (currentPage === "rules") {

        app.innerHTML =
            renderRules();

    }


    if (currentPage === "settings") {

        app.innerHTML =
            renderSettings();

    }


    bindPageEvents();

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

    /* =====================================================
       CALCOLO STATISTICHE
       ===================================================== */

    const total = state.fines.reduce(
        (sum, fine) => sum + Number(fine.amount),
        0
    );

    const paid = state.fines
        .filter(fine => fine.paid)
        .reduce(
            (sum, fine) => sum + Number(fine.amount),
            0
        );

    const unpaid = total - paid;

    const fineCount = state.fines.length;

    const finedPlayers = new Set(
        state.fines.map(fine => fine.player)
    ).size;

    const paymentPercentage =
        total > 0
            ? Math.round((paid / total) * 100)
            : 0;

    const averageFine =
        fineCount > 0
            ? total / fineCount
            : 0;

    const highestFine =
        state.fines.length
            ? Math.max(
                ...state.fines.map(
                    fine => Number(fine.amount)
                )
            )
            : 0;


    /* =====================================================
       CLASSIFICA
       ===================================================== */

    const ranking = state.players
        .map(player => {

            const playerFines =
                state.fines.filter(
                    fine => fine.player === player
                );

            const amount =
                playerFines.reduce(
                    (sum, fine) =>
                        sum + Number(fine.amount),
                    0
                );

            const paidAmount =
                playerFines
                    .filter(fine => fine.paid)
                    .reduce(
                        (sum, fine) =>
                            sum + Number(fine.amount),
                        0
                    );

            return {
                player,
                fines: playerFines.length,
                amount,
                paidAmount
            };

        })
        .filter(player => player.fines > 0)
        .sort(
            (a, b) =>
                b.amount - a.amount
        );


    const podium =
        ranking.slice(0, 3);


    /* =====================================================
       ULTIME MULTE
       ===================================================== */

    const latest =
        [...state.fines]
            .sort(
                (a, b) =>
                    b.date.localeCompare(a.date)
            )
            .slice(0, 5);


    /* =====================================================
       MESE CORRENTE
       ===================================================== */

    const now = new Date();

    const currentMonth =
        `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;

    const currentMonthFines =
        state.fines.filter(
            fine =>
                fine.date.slice(0, 7) ===
                currentMonth
        );

    const currentMonthTotal =
        currentMonthFines.reduce(
            (sum, fine) =>
                sum + Number(fine.amount),
            0
        );


    /* =====================================================
       PODIO
       ===================================================== */

    const podiumHtml =
        podium.length
            ? podium
                .map((player, index) => {

                    const positions = [
                        "🥇",
                        "🥈",
                        "🥉"
                    ];

                    return `

                        <div class="rank">

                            <div class="rank-number">
                                ${positions[index]}
                            </div>

                            <div class="avatar">
                                ${initials(player.player)}
                            </div>

                            <div
                                style="
                                    flex:1;
                                    min-width:0;
                                "
                            >

                                <div class="row">

                                    <strong>
                                        ${escapeHtml(
                                            player.player
                                        )}
                                    </strong>

                                    <strong>
                                        ${money(
                                            player.amount
                                        )}
                                    </strong>

                                </div>

                                <div
                                    class="small muted"
                                    style="
                                        margin-top:4px;
                                    "
                                >
                                    ${player.fines}
                                    ${
                                        player.fines === 1
                                            ? "multa"
                                            : "multe"
                                    }
                                </div>

                            </div>

                        </div>

                    `;

                })
                .join("")
            :
            `
                <div class="empty">
                    Nessuna multa registrata.
                </div>
            `;


    /* =====================================================
       CLASSIFICA COMPLETA
       ===================================================== */

    const rankingHtml =
        ranking.length
            ? ranking
                .map(
                    (player, index) => {

                        const percentage =
                            total > 0
                                ?
                            Math.min(
                                100,
                                (
                                    player.amount /
                                    total
                                ) * 100
                            )
                                :
                            0;

                        return `

                            <div class="rank">

                                <div class="rank-number">
                                    ${index + 1}
                                </div>

                                <div class="avatar">
                                    ${initials(
                                        player.player
                                    )}
                                </div>

                                <div
                                    style="
                                        flex:1;
                                        min-width:0;
                                    "
                                >

                                    <div class="row">

                                        <strong>
                                            ${escapeHtml(
                                                player.player
                                            )}
                                        </strong>

                                        <strong>
                                            ${money(
                                                player.amount
                                            )}
                                        </strong>

                                    </div>

                                    <div
                                        class="progress"
                                    >

                                        <i
                                            style="
                                                width:
                                                ${percentage}%;
                                            "
                                        ></i>

                                    </div>

                                    <div
                                        class="small muted"
                                        style="
                                            margin-top:5px;
                                        "
                                    >

                                        ${player.fines}
                                        ${
                                            player.fines === 1
                                                ? "multa"
                                                : "multe"
                                        }

                                        ·

                                        ${money(
                                            player.paidAmount
                                        )}
                                        pagati

                                    </div>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("")
            :
            `
                <div class="empty">
                    Nessuna multa ancora.
                </div>
            `;


    /* =====================================================
       OUTPUT HOME
       ===================================================== */

    return `

        <!-- ================================================
             HERO
             ================================================ -->

        <section class="card hero">

            <div class="small">

                ${escapeHtml(state.team)}

                ·

                Stagione
                ${escapeHtml(state.season)}

            </div>

            <h2>
                Situazione multe
            </h2>

            <div class="hero-total">
                ${money(total)}
            </div>

            <div class="hero-subtitle">
                Totale multe della stagione
            </div>

        </section>


        <!-- ================================================
             STATISTICHE PRINCIPALI
             ================================================ -->

        <div
            class="grid stats"
            style="margin-top:14px"
        >

            <div class="card stat">

                <div class="stat-label">
                    PAGATO
                </div>

                <div
                    class="stat-value"
                    style="color:var(--green)"
                >
                    ${money(paid)}
                </div>

            </div>


            <div class="card stat">

                <div class="stat-label">
                    DA PAGARE
                </div>

                <div
                    class="stat-value"
                    style="color:var(--red)"
                >
                    ${money(unpaid)}
                </div>

            </div>


            <div class="card stat">

                <div class="stat-label">
                    MULTE
                </div>

                <div class="stat-value">
                    ${fineCount}
                </div>

            </div>


            <div class="card stat">

                <div class="stat-label">
                    GIOCATORI
                </div>

                <div class="stat-value">
                    ${finedPlayers}
                </div>

            </div>

        </div>


        <!-- ================================================
             STATISTICHE EXTRA
             ================================================ -->

        <div class="grid stats">

            <div class="card stat">

                <div class="stat-label">
                    INCASSATO
                </div>

                <div class="stat-value">
                    ${paymentPercentage}%
                </div>

            </div>


            <div class="card stat">

                <div class="stat-label">
                    MEDIA MULTA
                </div>

                <div class="stat-value">
                    ${money(averageFine)}
                </div>

            </div>


            <div class="card stat">

                <div class="stat-label">
                    PIÙ ALTA
                </div>

                <div
                    class="stat-value"
                    style="color:var(--red)"
                >
                    ${money(highestFine)}
                </div>

            </div>


            <div class="card stat">

                <div class="stat-label">
                    MESE
                </div>

                <div class="stat-value">
                    ${money(currentMonthTotal)}
                </div>

            </div>

        </div>


        <!-- ================================================
             BARRA INCASSI
             ================================================ -->

        <div class="card">

            <div class="row">

                <div>

                    <strong>
                        💰 Incasso multe
                    </strong>

                    <div class="small muted">
                        ${money(paid)}
                        di
                        ${money(total)}
                    </div>

                </div>

                <strong>
                    ${paymentPercentage}%
                </strong>

            </div>


            <div
                class="progress"
                style="
                    margin-top:12px;
                    height:10px;
                "
            >

                <i
                    style="
                        width:${paymentPercentage}%;
                    "
                ></i>

            </div>

        </div>


        <!-- ================================================
             CLASSIFICA
             ================================================ -->

        <div class="section-head">

            <h2>
                🏆 Classifica
            </h2>

            <button
                class="btn secondary"
                id="goToFines"
                type="button"
            >
                Vedi multe
            </button>

        </div>


        <div class="card list">

            ${podiumHtml}

        </div>


        ${
            ranking.length > 3
                ?

            `

                <div class="section-head">

                    <h2>
                        📊 Classifica completa
                    </h2>

                </div>


                <div class="card list">

                    ${rankingHtml}

                </div>

            `

                :

            ""

        }


        <!-- ================================================
             ULTIME MULTE
             ================================================ -->

        <div class="section-head">

            <h2>
                🕘 Ultime multe
            </h2>

        </div>


        <div class="card list">

            ${
                latest.length
                    ?
                latest
                    .map(renderFineRow)
                    .join("")
                    :
                `
                    <div class="empty">
                        Non ci sono multe.
                    </div>
                `
            }

        </div>

    `;

}


/* =========================================================
   MULTE
   ========================================================= */

/* =========================================================
   MULTE
   ========================================================= */

function renderFines() {

    const allFines = state.fines || [];

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


    /* =====================================================
       MESI DELLA STAGIONE
       ===================================================== */

    const seasonStartYear =
        Number(state.season?.slice(0, 4)) ||
        new Date().getFullYear();

    const seasonMonths = [];

    for (let monthIndex = 7; monthIndex <= 11; monthIndex++) {

        const year = seasonStartYear;

        const monthNumber =
            String(monthIndex + 1).padStart(2, "0");

        seasonMonths.push({
            id: `${year}-${monthNumber}`,
            label: `${monthNames[monthIndex]} ${year}`
        });

    }

    for (let monthIndex = 0; monthIndex <= 4; monthIndex++) {

        const year = seasonStartYear + 1;

        const monthNumber =
            String(monthIndex + 1).padStart(2, "0");

        seasonMonths.push({
            id: `${year}-${monthNumber}`,
            label: `${monthNames[monthIndex]} ${year}`
        });

    }


    /* =====================================================
       FILTRO
       ===================================================== */

    let fines = allFines;

    if (selectedMonth !== "all") {

        fines = allFines.filter(fine =>
            fine.date &&
            fine.date.startsWith(selectedMonth)
        );

    }


    /* =====================================================
       TOTALI
       ===================================================== */

    const total =
        fines.reduce(
            (sum, fine) =>
                sum + Number(fine.amount || 0),
            0
        );

    const unpaid =
        fines
            .filter(fine => !fine.paid)
            .reduce(
                (sum, fine) =>
                    sum + Number(fine.amount || 0),
                0
            );

    const paid = total - unpaid;


    /* =====================================================
       TITOLO
       ===================================================== */

    const selectedMonthData =
        seasonMonths.find(
            month => month.id === selectedMonth
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


    /* =====================================================
       ORDINAMENTO
       ===================================================== */

    const sortedFines =
        [...fines].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    /* =====================================================
       ELENCO MULTE
       ===================================================== */

    const finesHtml =
        sortedFines.length

            ? `

                <div class="list fines-list">

                    ${sortedFines
                        .map(renderFineRow)
                        .join("")}

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
                        Non ci sono multe registrate per questo periodo.
                    </p>

                    <button
                        class="primary-btn"
                        id="addFineEmpty"
                    >
                        ＋ Aggiungi multa
                    </button>

                </div>

            `;


    /* =====================================================
       OUTPUT
       ===================================================== */

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
            >
                ＋ Nuova multa
            </button>

        </section>


        <!-- ================================================
             MENU MESE
             ================================================ -->

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


            <div class="field">

                <select
                    id="monthSelect"
                    class="month-select"
                >

                    <option
                        value="all"
                        ${selectedMonth === "all" ? "selected" : ""}
                    >
                        Tutte le multe
                    </option>


                    ${seasonMonths
                        .map(month => `

                            <option
                                value="${month.id}"
                                ${
                                    selectedMonth === month.id
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${month.label}
                            </option>

                        `)
                        .join("")}

                </select>

            </div>

        </div>


        <!-- ================================================
             RIEPILOGO
             ================================================ -->

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
                    ${fines.length === 1 ? "multa" : "multe"}
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

                <strong class="${
                    unpaid > 0
                        ? "negative"
                        : "positive"
                }">

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

        </div>


        <!-- ================================================
             ELENCO
             ================================================ -->

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
                                fine.category
                            )}

                            ·

                            ${escapeHtml(
                                fine.type
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

    const groups = {};


    state.rules.forEach(rule => {

        if (!groups[rule.category]) {

            groups[rule.category] = [];

        }

        groups[rule.category].push(rule);

    });


    return `

        <div class="row wrap">

            <div>

                <div class="small muted">
                    Regolamento personalizzabile
                </div>

                <h2
                    style="
                        margin:
                        4px
                        0;
                    "
                >
                    Multario
                </h2>

            </div>


            <button
                class="btn"
                id="addRule"
                type="button"
            >
                + Nuova regola
            </button>

        </div>


        <p class="muted small">

            Crea liberamente categorie,
            tipologie e importi.

            Le regole saranno disponibili
            quando inserisci una multa.

        </p>


        ${
            Object.keys(groups).length

                ?

            Object.entries(groups)
                .map(
                    ([category, rules]) => `

                        <div
                            class="section-head"
                        >

                            <h2>
                                ${escapeHtml(
                                    category
                                )}
                            </h2>

                            <span
                                class="badge neutral"
                            >
                                ${rules.length}
                            </span>

                        </div>


                        <div
                            class="card table-like"
                        >

                            ${
                                rules
                                    .map(
                                        rule => `

                                            <div
                                                class="rule-row"
                                            >

                                                <div>

                                                    <strong>
                                                        ${escapeHtml(
                                                            rule.type
                                                        )}
                                                    </strong>

                                                </div>


                                                <strong>
                                                    ${money(
                                                        rule.amount
                                                    )}
                                                </strong>


                                                <div
                                                    class="row"
                                                >

                                                    <button
                                                        class="icon-mini"
                                                        data-edit-rule="${rule.id}"
                                                        type="button"
                                                    >
                                                        ✏️
                                                    </button>


                                                    <button
                                                        class="icon-mini"
                                                        data-delete-rule="${rule.id}"
                                                        type="button"
                                                    >
                                                        🗑️
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
                <div class="card empty">

                    Il multario è vuoto.

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

        <!-- SQUADRA -->

        <div class="card">

            <h2>
                ⚙️ Squadra
            </h2>


            <div class="form">

                <div class="field">

                    <label>
                        NOME SQUADRA
                    </label>

                    <input
                        id="teamName"
                        type="text"
                        value="${escapeHtml(
                            state.team
                        )}"
                    >

                </div>


                <div class="field">

                    <label>
                        STAGIONE
                    </label>

                    <input
                        id="season"
                        type="text"
                        value="${escapeHtml(
                            state.season
                        )}"
                        placeholder="2026/27"
                    >

                </div>


                <button
                    class="btn"
                    id="saveSettings"
                    type="button"
                >
                    Salva impostazioni
                </button>

            </div>

        </div>


        <!-- GIOCATORI -->

        <div class="section-head">

            <h2>
                👥 Giocatori
            </h2>

            <button
                class="btn"
                id="addPlayer"
                type="button"
            >
                + Giocatore
            </button>

        </div>


        <div class="card player-list">

            ${
                state.players.length

                    ?

                state.players
                    .map(
                        (player, index) => `

                            <span
                                class="player-chip"
                            >

                                ${escapeHtml(
                                    player
                                )}

                                <button
                                    type="button"
                                    data-delete-player="${index}"
                                    title="Rimuovi"
                                >
                                    ×
                                </button>

                            </span>

                        `
                    )
                    .join("")

                    :

                `
                    <div class="empty">
                        Nessun giocatore.
                    </div>
                `
            }

        </div>


        <!-- DATI -->

        <div class="section-head">

            <h2>
                💾 Dati
            </h2>

        </div>


        <div class="card">

            <div class="row wrap">

                <div>

                    <strong>
                        Backup squadra
                    </strong>

                    <div class="small muted">
                        Esporta tutte le impostazioni,
                        regole e multe.
                    </div>

                </div>


                <button
                    class="btn secondary"
                    id="exportData"
                    type="button"
                >
                    Esporta backup
                </button>

            </div>


            <div class="divider"></div>


            <div class="row wrap">

                <div>

                    <strong>
                        Ripristina backup
                    </strong>

                    <div class="small muted">
                        Importa un file JSON
                        precedentemente esportato.
                    </div>

                </div>


                <button
                    class="btn secondary"
                    id="importData"
                    type="button"
                >
                    Importa
                </button>

            </div>


            <div class="divider"></div>


            <div class="row wrap">

                <div>

                    <strong>
                        Ripristina demo
                    </strong>

                    <div class="small muted">
                        Cancella i dati attuali
                        e torna ai dati di esempio.
                    </div>

                </div>


                <button
                    class="btn danger"
                    id="resetData"
                    type="button"
                >
                    Reset
                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   MODALE GENERICA
   ========================================================= */

function openModal(title, content) {

    const root =
        document.getElementById(
            "modalRoot"
        );


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
        .onclick = closeModal;


    document
        .getElementById(
            "modalBackdrop"
        )
        .onclick = event => {

            if (
                event.target.id ===
                "modalBackdrop"
            ) {

                closeModal();

            }

        };

}


function closeModal() {

    document.getElementById(
        "modalRoot"
    ).innerHTML = "";

}


/* =========================================================
   MODALE MULTA
   ========================================================= */

function openFineModal(id = null) {

    const fine = id
        ? state.fines.find(item => item.id === id)
        : null;

    const isEdit = Boolean(fine);


    /* =========================
       CATEGORIE
       ========================= */

    const categories = [
        ...new Set(
            state.rules.map(
                rule => rule.category
            )
        )
    ];


    /* =========================
       REGOLA INIZIALE
       ========================= */

    const initialRule = fine
        ? state.rules.find(
            rule =>
                rule.id === fine.ruleId
        )
        : state.rules[0];


    const initialCategory =
        initialRule?.category ||
        categories[0] ||
        "";


    const initialRules =
        state.rules.filter(
            rule =>
                rule.category ===
                initialCategory
        );


    /* =========================
       MODALE
       ========================= */

    openModal(

        isEdit
            ? "Modifica multa"
            : "Nuova multa",

        `

        <div class="form">

            <!-- GIOCATORE -->

            <div class="field">

                <label>
                    GIOCATORE
                </label>

                <select id="finePlayer">

                    ${
                        state.players.length
                            ?

                        state.players
                            .map(
                                player => `

                                    <option
                                        value="${escapeHtml(player)}"
                                        ${
                                            fine?.player === player
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHtml(player)}
                                    </option>

                                `
                            )
                            .join("")

                            :

                        `
                            <option value="">
                                Nessun giocatore
                            </option>
                        `
                    }

                </select>

            </div>


            <!-- CATEGORIA -->

            <div class="field">

                <label>
                    CATEGORIA
                </label>

                <select id="fineCategory">

                    ${
                        categories
                            .map(
                                category => `

                                    <option
                                        value="${escapeHtml(category)}"
                                        ${
                                            category ===
                                            initialCategory
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHtml(category)}
                                    </option>

                                `
                            )
                            .join("")
                    }

                </select>

            </div>


            <!-- TIPO -->

            <div class="field">

                <label>
                    TIPO DI MULTA
                </label>

                <select id="fineRule">

                    ${
                        initialRules
                            .map(
                                rule => `

                                    <option
                                        value="${rule.id}"
                                        ${
                                            fine?.ruleId ===
                                            rule.id
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHtml(rule.type)}
                                        ·
                                        ${money(rule.amount)}
                                    </option>

                                `
                            )
                            .join("")
                    }

                </select>

            </div>


            <!-- DATA -->

            <div class="field">

                <label>
                    DATA
                </label>

                <input
                    id="fineDate"
                    type="date"
                    value="${
                        fine?.date ||
                        new Date()
                            .toISOString()
                            .slice(0, 10)
                    }"
                >

            </div>


            <!-- IMPORTO -->

            <div class="field">

                <label>
                    IMPORTO (€)
                </label>

                <input
                    id="fineAmount"
                    type="number"
                    min="0"
                    step="1"
                    value="${
                        fine?.amount ??
                        initialRule?.amount ??
                        0
                    }"
                >

            </div>


            <!-- PAGATA -->

            <label
                style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                    cursor:pointer;
                "
            >

                <input
                    id="finePaid"
                    type="checkbox"
                    ${
                        fine?.paid
                            ? "checked"
                            : ""
                    }
                >

                <span>
                    Multa già pagata
                </span>

            </label>


            <!-- AZIONI -->

            <div class="modal-actions">

                <button
                    class="btn secondary"
                    id="cancelFine"
                    type="button"
                >
                    Annulla
                </button>


                <button
                    class="btn"
                    id="saveFine"
                    type="button"
                >
                    ${
                        isEdit
                            ? "Salva modifiche"
                            : "Aggiungi multa"
                    }
                </button>

            </div>

        </div>

        `

    );


    /* =========================
       ELEMENTI
       ========================= */

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


    /* =========================
       AGGIORNA REGOLE
       ========================= */

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
                            ·
                            ${money(
                                rule.amount
                            )}
                        </option>

                    `
                )
                .join("");


        if (rules.length) {

            ruleSelect.value =
                String(
                    rules[0].id
                );

            amountInput.value =
                rules[0].amount;

        } else {

            amountInput.value = 0;

        }

    }


    /* =========================
       CAMBIO CATEGORIA
       ========================= */

    categorySelect.addEventListener(
        "change",
        updateRules
    );


    /* =========================
       CAMBIO TIPO
       ========================= */

    ruleSelect.addEventListener(
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


    /* =========================
       ANNULLA
       ========================= */

    document
        .getElementById(
            "cancelFine"
        )
        .onclick =
            closeModal;


    /* =========================
       SALVA
       ========================= */

    document
        .getElementById(
            "saveFine"
        )
        .onclick = () => {

            const player =
                document
                    .getElementById(
                        "finePlayer"
                    )
                    .value;


            const ruleId =
                Number(
                    document
                        .getElementById(
                            "fineRule"
                        )
                        .value
                );


            const date =
                document
                    .getElementById(
                        "fineDate"
                    )
                    .value;


            const amount =
                Number(
                    document
                        .getElementById(
                            "fineAmount"
                        )
                        .value
                );


            const paid =
                document
                    .getElementById(
                        "finePaid"
                    )
                    .checked;


            if (
                !player ||
                !ruleId ||
                !date ||
                amount < 0
            ) {

                showToast(
                    "Controlla i dati inseriti."
                );

                return;

            }


            /* =====================
               MODIFICA
               ===================== */

            if (isEdit) {

                fine.player =
                    player;

                fine.ruleId =
                    ruleId;

                fine.category =
                    state.rules.find(
                        rule =>
                            rule.id ===
                            ruleId
                    )?.category || "";

                fine.type =
                    state.rules.find(
                        rule =>
                            rule.id ===
                            ruleId
                    )?.type || "";

                fine.date =
                    date;

                fine.amount =
                    amount;

                fine.paid =
                    paid;

            }


            /* =====================
               NUOVA MULTA
               ===================== */

            else {

                const rule =
                    state.rules.find(
                        item =>
                            item.id ===
                            ruleId
                    );


                state.fines.push({

                    id:
                        generateId(),

                    date,

                    player,

                    category:
                        rule?.category ||
                        "",

                    type:
                        rule?.type ||
                        "",

                    ruleId,

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

        };

}

/* =========================================================
   MODALE REGOLA
   ========================================================= */

function openRuleModal(id = null) {

    const rule =
        id
            ? state.rules.find(
                item =>
                    item.id === id
            )
            : null;


    openModal(

        id
            ? "Modifica regola"
            : "Nuova regola",

        `

        <div class="form">

            <div class="field">

                <label>
                    CATEGORIA
                </label>

                <input
                    id="ruleCategory"
                    type="text"
                    value="${escapeHtml(
                        rule?.category || ""
                    )}"
                    placeholder="Es. Allenamento"
                >

            </div>


            <div class="field">

                <label>
                    TIPOLOGIA
                </label>

                <input
                    id="ruleType"
                    type="text"
                    value="${escapeHtml(
                        rule?.type || ""
                    )}"
                    placeholder="Es. Ritardo allenamento"
                >

            </div>


            <div class="field">

                <label>
                    IMPORTO (€)
                </label>

                <input
                    id="ruleAmount"
                    type="number"
                    min="0"
                    step="1"
                    value="${
                        rule?.amount ??
                        5
                    }"
                >

            </div>


            <div class="modal-actions">

                <button
                    class="btn secondary"
                    id="cancelRule"
                    type="button"
                >
                    Annulla
                </button>


                <button
                    class="btn"
                    id="saveRule"
                    type="button"
                >
                    Salva
                </button>

            </div>

        </div>

        `

    );


    document
        .getElementById(
            "cancelRule"
        )
        .onclick = closeModal;


    document
        .getElementById(
            "saveRule"
        )
        .onclick = () => {

            const category =
                document
                    .getElementById(
                        "ruleCategory"
                    )
                    .value
                    .trim();


            const type =
                document
                    .getElementById(
                        "ruleType"
                    )
                    .value
                    .trim();


            const amount =
                Number(
                    document
                        .getElementById(
                            "ruleAmount"
                        )
                        .value
                ) || 0;


            if (
                !category ||
                !type
            ) {

                showToast(
                    "Compila categoria e tipologia."
                );

                return;

            }


            const newRule = {

                id:
                    id ||
                    generateId(),

                category,

                type,

                amount

            };


            if (id) {

                const index =
                    state.rules.findIndex(
                        item =>
                            item.id === id
                    );


                state.rules[index] =
                    newRule;

            } else {

                state.rules.push(
                    newRule
                );

            }


            saveState();

            closeModal();

            render();

            showToast(
                "Regola salvata"
            );

        };

}


/* =========================================================
   MODALE GIOCATORE
   ========================================================= */

function openPlayerModal() {

    openModal(

        "Nuovo giocatore",

        `

        <div class="form">

            <div class="field">

                <label>
                    NOME
                </label>

                <input
                    id="playerName"
                    type="text"
                    placeholder="Nome giocatore"
                >

            </div>


            <div class="modal-actions">

                <button
                    class="btn secondary"
                    id="cancelPlayer"
                    type="button"
                >
                    Annulla
                </button>


                <button
                    class="btn"
                    id="savePlayer"
                    type="button"
                >
                    Aggiungi
                </button>

            </div>

        </div>

        `

    );


    document
        .getElementById(
            "cancelPlayer"
        )
        .onclick = closeModal;


    document
        .getElementById(
            "savePlayer"
        )
        .onclick = () => {

            const name =
                document
                    .getElementById(
                        "playerName"
                    )
                    .value
                    .trim();


            if (!name) {

                showToast(
                    "Inserisci il nome."
                );

                return;

            }


            if (
                state.players.includes(
                    name
                )
            ) {

                showToast(
                    "Giocatore già presente."
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

        };

}


/* =========================================================
   EVENTI PAGINA
   ========================================================= */

function bindPageEvents() {


    /* =========================
   MESI
   ========================= */

   document
    .getElementById("monthSelect")
    ?.addEventListener("change", event => {

        selectedMonth = event.target.value;

        render();

    });


    /* =========================
       NUOVA MULTA
       ========================= */

    document
        .getElementById(
            "addFine"
        )
        ?.addEventListener(
            "click",
            () =>
                openFineModal()
        );


    document
        .getElementById(
            "addFineEmpty"
        )
        ?.addEventListener(
            "click",
            () =>
                openFineModal()
        );


    /* =========================
       HOME → MULTE
       ========================= */

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
       PAGATA / NON PAGATA
       ========================= */

    document
        .querySelectorAll(
            "[data-toggle-paid]"
        )
        .forEach(button => {

            button.onclick = () => {

                const id =
                    Number(
                        button.dataset
                            .togglePaid
                    );


                const fine =
                    state.fines.find(
                        item =>
                            item.id === id
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
                        : "Multa segnata come non pagata"
                );

            };

        });


    /* =========================
       MODIFICA MULTA
       ========================= */

    document
        .querySelectorAll(
            "[data-edit-fine]"
        )
        .forEach(button => {

            button.onclick = () => {

                openFineModal(
                    Number(
                        button.dataset
                            .editFine
                    )
                );

            };

        });


    /* =========================
       ELIMINA MULTA
       ========================= */

    document
        .querySelectorAll(
            "[data-delete-fine]"
        )
        .forEach(button => {

            button.onclick = () => {

                const id =
                    Number(
                        button.dataset
                            .deleteFine
                    );


                if (
                    !confirm(
                        "Eliminare questa multa?"
                    )
                ) {

                    return;

                }


                state.fines =
                    state.fines.filter(
                        fine =>
                            fine.id !== id
                    );


                saveState();

                render();

                showToast(
                    "Multa eliminata"
                );

            };

        });


    /* =========================
       NUOVA REGOLA
       ========================= */

    document
        .getElementById(
            "addRule"
        )
        ?.addEventListener(
            "click",
            () =>
                openRuleModal()
        );


    /* =========================
       MODIFICA REGOLA
       ========================= */

    document
        .querySelectorAll(
            "[data-edit-rule]"
        )
        .forEach(button => {

            button.onclick = () => {

                openRuleModal(
                    Number(
                        button.dataset
                            .editRule
                    )
                );

            };

        });


    /* =========================
       ELIMINA REGOLA
       ========================= */

    document
        .querySelectorAll(
            "[data-delete-rule]"
        )
        .forEach(button => {

            button.onclick = () => {

                const id =
                    Number(
                        button.dataset
                            .deleteRule
                    );


                if (
                    !confirm(
                        "Eliminare questa regola?"
                    )
                ) {

                    return;

                }


                state.rules =
                    state.rules.filter(
                        rule =>
                            rule.id !== id
                    );


                saveState();

                render();

                showToast(
                    "Regola eliminata"
                );

            };

        });


    /* =========================
       GIOCATORE
       ========================= */

    document
        .getElementById(
            "addPlayer"
        )
        ?.addEventListener(
            "click",
            openPlayerModal
        );


    /* =========================
       ELIMINA GIOCATORE
       ========================= */

    document
        .querySelectorAll(
            "[data-delete-player]"
        )
        .forEach(button => {

            button.onclick = () => {

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


                if (
                    !confirm(
                        `Rimuovere ${player} dalla rosa?`
                    )
                ) {

                    return;

                }


                state.players.splice(
                    index,
                    1
                );


                saveState();

                render();

            };

        });


    /* =========================
       SALVA IMPOSTAZIONI
       ========================= */

    document
        .getElementById(
            "saveSettings"
        )
        ?.addEventListener(
            "click",
            () => {

                const team =
                    document
                        .getElementById(
                            "teamName"
                        )
                        .value
                        .trim();


                const season =
                    document
                        .getElementById(
                            "season"
                        )
                        .value
                        .trim();


                state.team =
                    team ||
                    "Multe FC";


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


    /* =========================
       BACKUP
       ========================= */

    document
        .getElementById(
            "exportData"
        )
        ?.addEventListener(
            "click",
            exportBackup
        );


    /* =========================
       IMPORT
       ========================= */

    document
        .getElementById(
            "importData"
        )
        ?.addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "importFile"
                    )
                    .click();

            }
        );


    /* =========================
       RESET
       ========================= */

    document
        .getElementById(
            "resetData"
        )
        ?.addEventListener(
            "click",
            resetData
        );

}


/* =========================================================
   BACKUP EXPORT
   ========================================================= */

function exportBackup() {

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


    link.href = url;


    link.download =
        `multefc-backup-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;


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


/* =========================================================
   BACKUP IMPORT
   ========================================================= */

document
    .getElementById(
        "importFile"
    )
    .addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            const reader =
                new FileReader();


            reader.onload = () => {

                try {

                    const imported =
                        JSON.parse(
                            reader.result
                        );


                    if (
                        !imported.players ||
                        !imported.fines ||
                        !imported.rules
                    ) {

                        throw new Error(
                            "Backup non valido"
                        );

                    }


                    state =
                        imported;


                    saveState();

                    render();

                    showToast(
                        "Backup importato"
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                    showToast(
                        "Backup non valido"
                    );

                }

            };


            reader.readAsText(
                file
            );


            event.target.value = "";

        }
    );


/* =========================================================
   RESET
   ========================================================= */

function resetData() {

    const confirmed =
        confirm(
            "Sei sicuro?\n\n" +
            "Tutti i dati attuali " +
            "verranno sostituiti " +
            "dai dati demo."
        );


    if (!confirmed) {

        return;

    }


    state =
        structuredClone(
            defaultState
        );


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
   NAVIGAZIONE PRINCIPALE
   ========================================================= */

document
    .querySelectorAll(
        ".nav-button"
    )
    .forEach(button => {

        button.onclick = () => {

            currentPage =
                button.dataset.page;


            render();

        };

    });


/* =========================================================
   TEMA
   ========================================================= */

document
    .getElementById(
        "themeButton"
    )
    .addEventListener(
        "click",
        () => {

            state.theme =
                state.theme === "dark"
                    ? "light"
                    : "dark";


            saveState();

            applyTheme();

        }
    );


/* =========================================================
   AVVIO
   ========================================================= */

render();
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(() => {
                console.log("MulteFC: Service Worker attivo");
            })
            .catch(error => {
                console.error("MulteFC: errore Service Worker", error);
            });
    });
}
