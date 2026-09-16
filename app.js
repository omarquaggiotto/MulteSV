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
            amount: 5
        },

        {
            id: 2,
            date: "2026-09-11",
            player: "Luca",
            category: "Partita",
            type: "Ammonizione per proteste",
            amount: 10
        },

         {
              id: 3,
              date: "2026-09-08",
              player: "Andrea",
              category: "Allenamento",
              type: "Assenza ingiustificata",
              amount: 20
       }

],

payments: {},

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
let selectedPaymentMonth = "2026-08";
let selectedFinePlayer = "all";


/* =========================================================
   STORAGE
   ========================================================= */

function loadState() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved) {

            const loaded =
                JSON.parse(saved);


            loaded.team =
                typeof loaded.team === "string" &&
                loaded.team.trim()
                    ? loaded.team
                    : defaultState.team;

            loaded.season =
                typeof loaded.season === "string" &&
                loaded.season.trim()
                    ? loaded.season
                    : defaultState.season;

            loaded.theme =
                loaded.theme === "dark"
                    ? "dark"
                    : "light";

            loaded.players =
                Array.isArray(loaded.players)
                    ? loaded.players.filter(
                        player =>
                            typeof player === "string" &&
                            player.trim()
                    )
                    : structuredClone(defaultState.players);

            loaded.rules =
                Array.isArray(loaded.rules) &&
                loaded.rules.length
                    ? loaded.rules
                    : structuredClone(defaultState.rules);

            loaded.payments =
                loaded.payments || {};

            // Migrazione: il pagamento è registrato solo
            // nella sezione Pagamenti, non nella singola multa.
            loaded.fines =
                Array.isArray(loaded.fines)
                    ? loaded.fines
                        .filter(fine => fine && typeof fine === "object")
                        .map(({ paid, ...fine }) => fine)
                    : [];

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(loaded)
            );


            return loaded;

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


function parseFineDate(value) {

    const raw =
        String(value ?? "")
            .trim();

    const italian =
        raw.match(
            /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/
        );

    const iso =
        raw.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );

    const parts =
        italian
            ? {
                year: Number(italian[3]),
                month: Number(italian[2]),
                day: Number(italian[1])
            }
            : iso
                ? {
                    year: Number(iso[1]),
                    month: Number(iso[2]),
                    day: Number(iso[3])
                }
                : null;

    if (!parts) {
        return "";
    }

    const date =
        new Date(
            parts.year,
            parts.month - 1,
            parts.day
        );

    if (
        date.getFullYear() !== parts.year ||
        date.getMonth() !== parts.month - 1 ||
        date.getDate() !== parts.day
    ) {
        return "";
    }

    return [
        parts.year,
        String(parts.month)
            .padStart(2, "0"),
        String(parts.day)
            .padStart(2, "0")
    ].join("-");
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

function getPaymentMonths() {
    const startYear =
        getSeasonStartYear();

    const months = [];

    // Agosto → Dicembre
    for (
        let month = 8;
        month <= 12;
        month++
    ) {
        const monthNumber =
            String(month)
                .padStart(2, "0");

        months.push(
            `${startYear}-${monthNumber}`
        );
    }

    // Gennaio → Maggio
    for (
        let month = 1;
        month <= 5;
        month++
    ) {
        const monthNumber =
            String(month)
                .padStart(2, "0");

        months.push(
            `${startYear + 1}-${monthNumber}`
        );
    }

    return months;
}


function getMonthlyBase(monthId) {
    const startYear =
        getSeasonStartYear();

    const augustId =
        `${startYear}-08`;

    // Agosto = 10 €
    if (monthId === augustId) {
        return 10;
    }

    // Tutti gli altri mesi della stagione = 5 €
    return 5;
}


function getPlayerMonthFines(
    player,
    monthId
) {
    return state.fines
        .filter(fine =>
            fine.player === player &&
            fine.date &&
            fine.date.startsWith(monthId)
        )
        .reduce(
            (total, fine) =>
                total + Number(fine.amount || 0),
            0
        );
}


function getPlayerMonthPayment(
    player,
    monthId
) {
    return Number(
        state.payments?.[monthId]?.[player] || 0
    );
}


function getPlayerArrears(
    player,
    monthId
) {
    const months =
        getPaymentMonths();

    const currentIndex =
        months.indexOf(monthId);

    if (currentIndex <= 0) {
        return 0;
    }

    let arrears = 0;

    for (
        let index = 0;
        index < currentIndex;
        index++
    ) {
        const previousMonth =
            months[index];

        const base =
            getMonthlyBase(
                previousMonth
            );

        const fines =
            getPlayerMonthFines(
                player,
                previousMonth
            );

        const due =
            base +
            fines +
            arrears;

        const paid =
            getPlayerMonthPayment(
                player,
                previousMonth
            );

        // Se paga meno del dovuto,
        // la differenza diventa arretrato.
        //
        // Se paga più del dovuto,
        // l'eccedenza NON viene trasferita.
        arrears =
            Math.max(
                0,
                due - paid
            );
    }

    return arrears;
}


function getPlayerMonthSummary(
    player,
    monthId
) {
    const base =
        getMonthlyBase(
            monthId
        );

    const fines =
        getPlayerMonthFines(
            player,
            monthId
        );

    const arrears =
        getPlayerArrears(
            player,
            monthId
        );

    const total =
        base +
        fines +
        arrears;

    const paid =
        getPlayerMonthPayment(
            player,
            monthId
        );

    const remaining =
        Math.max(
            0,
            total - paid
        );

    const overpayment =
        Math.max(
            0,
            paid - total
        );

    return {
        base,
        fines,
        arrears,
        total,
        paid,
        remaining,
        overpayment
    };
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
       payments: "Pagamenti",
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
    app.innerHTML = renderHome();
   }

   if (currentPage === "fines") {
    app.innerHTML = renderFines();
   }

   if (currentPage === "payments") {
    app.innerHTML = renderPayments();
   }

   if (currentPage === "rules") {
    app.innerHTML = renderRules();
   }

   if (currentPage === "settings") {
    app.innerHTML = renderSettings();
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

    const paymentMonths =
        getPaymentMonths();

    const today =
        new Date();

    const realCurrentMonth =
        `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}`;

    const currentMonth =
        paymentMonths.includes(realCurrentMonth)
            ? realCurrentMonth
            : realCurrentMonth < paymentMonths[0]
                ? paymentMonths[0]
                : paymentMonths[paymentMonths.length - 1];

    const currentMonthIndex =
        paymentMonths.indexOf(currentMonth);

    const dueMonths =
        paymentMonths.slice(0, currentMonthIndex + 1);

    const totalFines = state.fines
        .filter(fine =>
            fine.date &&
            fine.date.slice(0, 7) <= currentMonth
        )
        .reduce(
            (sum, fine) => sum + Number(fine.amount || 0),
            0
        );

    const totalBase = dueMonths.reduce(
        (sum, month) =>
            sum + getMonthlyBase(month) * state.players.length,
        0
    );

    const total =
        totalFines + totalBase;

    const totalPaid = dueMonths.reduce(
        (sum, month) =>
            sum + state.players.reduce(
                (monthTotal, player) =>
                    monthTotal + getPlayerMonthPayment(player, month),
                0
            ),
        0
    );

    const unpaid = Math.max(0, total - totalPaid);

    const paymentPercentage =
        total > 0
            ? Math.round((totalPaid / total) * 100)
            : 0;

    const fineCount = state.fines.length;

    const finedPlayers = new Set(
        state.fines.map(fine => fine.player)
    ).size;

    const averageFine =
        fineCount > 0
            ? totalFines / fineCount
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

            return {
                player,
                fines: playerFines.length,
                amount
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

    const currentMonthFines =
        state.fines.filter(
            fine => fine.date?.slice(0, 7) === currentMonth
        );

    const currentMonthTotal =
        currentMonthFines.reduce(
            (sum, fine) => sum + Number(fine.amount || 0),
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
                    ${money(totalPaid)}
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
                        ${money(totalPaid)}
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

    fines = fines.filter(fine =>
        fine.date &&
        fine.date.startsWith(selectedMonth)
    );

}

if (selectedFinePlayer !== "all") {

    fines = fines.filter(fine =>
        fine.player === selectedFinePlayer
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


<div class="card fines-filters-card">

    <div class="fines-filters-header">

        <div>

            <strong>
                Filtri
            </strong>

            <span class="muted">
                Personalizza la visualizzazione delle multe
            </span>

        </div>

    </div>


    <div class="fines-filters-grid">

        <div class="field">

            <label
                for="monthSelect"
                class="form-label"
            >
                📅 Mese
            </label>

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


        <div class="field">

            <label
                for="finePlayerSelect"
                class="form-label"
            >
                👤 Giocatore
            </label>

            <select
                id="finePlayerSelect"
                class="month-select"
            >

                <option
                    value="all"
                    ${
                        selectedFinePlayer === "all"
                            ? "selected"
                            : ""
                    }
                >
                    Tutti i giocatori
                </option>

                ${state.players
                    .map(player => `

                        <option
                            value="${escapeHtml(player)}"
                            ${
                                selectedFinePlayer === player
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${escapeHtml(player)}
                        </option>

                    `)
                    .join("")}

            </select>

        </div>

    </div>

</div>

        <!-- ================================================
             RIEPILOGO
             ================================================ -->

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
            Giocatori coinvolti
        </span>

        <strong>
            ${
                new Set(
                    fines.map(
                        fine => fine.player
                    )
                ).size
            }
        </strong>

        <small>
            ${
                new Set(
                    fines.map(
                        fine => fine.player
                    )
                ).size === 1
                    ? "giocatore"
                    : "giocatori"
            }
        </small>

    </div>


    <div class="stat-card">

        <span>
            Media multa
        </span>

        <strong>
            ${
                fines.length > 0
                    ? money(
                        total /
                        fines.length
                    )
                    : money(0)
            }
        </strong>

        <small>
            Importo medio
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

function renderPayments() {
    const months =
        getPaymentMonths();

    const currentMonth =
       months.includes(
        selectedPaymentMonth
    )
        ? selectedPaymentMonth
        : months[0];

    const monthLabel =
        new Date(
            currentMonth + "-01T12:00:00"
        ).toLocaleDateString(
            "it-IT",
            {
                month: "long",
                year: "numeric"
            }
        );

    let totalDue = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    const rows =
        state.players.map(player => {
            const summary =
                getPlayerMonthSummary(
                    player,
                    currentMonth
                );

            totalDue += summary.total;
            totalPaid += summary.paid;
            totalRemaining +=
                summary.remaining;

            return `
                <div class="payment-row">
                    <div class="payment-player">
                        <div class="player-avatar">
                            ${escapeHtml(
                                initials(player)
                            )}
                        </div>

                        <div>
                            <strong>
                                ${escapeHtml(player)}
                            </strong>

                            ${
                                summary.arrears > 0
                                    ? `
                                        <small class="payment-arrears">
                                            Arretrato:
                                            ${money(summary.arrears)}
                                        </small>
                                    `
                                    : ""
                            }
                        </div>
                    </div>

                    <div class="payment-value">
                        ${money(summary.base)}
                    </div>

                    <div class="payment-value">
                        ${money(summary.fines)}
                    </div>

                    <div class="payment-value payment-total">
                        ${money(summary.total)}
                    </div>

                    <div class="payment-value payment-paid-cell">

                      <input
                          type="number"
                          class="payment-paid-input"
                          data-payment-player="${escapeHtml(player)}"
                          min="0"
                          step="1"
                          value="${summary.paid}"
                      >

                     </div>

                    <div class="
                        payment-value
                        ${
                            summary.remaining > 0
                                ? "payment-remaining"
                                : "payment-ok"
                        }
                    ">
                        ${money(summary.remaining)}
                    </div>
                </div>
            `;
        })
        .join("");

    return `
        <div class="page-header">
            <div>
                <h1>Pagamenti</h1>
                <p>
                    Riepilogo quote e multe
                </p>
            </div>
        </div>

        <div class="card payment-month-card">
            <label
                for="paymentMonthSelect"
                class="form-label"
            >
                Mese
            </label>

            <select
                id="paymentMonthSelect"
                class="form-input"
            >
                ${months
                    .map(month => {
                        const label =
                            new Date(
                                month +
                                "-01T12:00:00"
                            ).toLocaleDateString(
                                "it-IT",
                                {
                                    month: "long",
                                    year: "numeric"
                                }
                            );

                        return `
                            <option
                                value="${month}"
                                ${
                                    month === currentMonth
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${
                                    label
                                        .charAt(0)
                                        .toUpperCase() +
                                    label.slice(1)
                                }
                            </option>
                        `;
                    })
                    .join("")}
            </select>
        </div>

        <div class="payment-summary-grid">

            <div class="card payment-summary-card">
                <span>
                    Totale da incassare
                </span>

                <strong>
                    ${money(totalDue)}
                </strong>
            </div>

            <div class="card payment-summary-card">
                <span>
                    Incassato
                </span>

                <strong>
                    ${money(totalPaid)}
                </strong>
            </div>

            <div class="card payment-summary-card">
                <span>
                    Da incassare
                </span>

                <strong>
                    ${money(totalRemaining)}
                </strong>
            </div>

        </div>

                <div
            id="paymentsTableExport"
            class="card payments-table-card"
        >

            <div class="payments-table-header">
                <div>Giocatore</div>
                <div>Base</div>
                <div>Multe</div>
                <div>Totale</div>
                <div>Versato</div>
                <div>Rimanente</div>
            </div>

            <div class="payments-table-body">
                ${rows}
            </div>

        </div>

        <button
            id="exportPaymentsImage"
            class="primary-button"
            type="button"
            style="width: 100%; margin-top: 14px;"
        >
            🖼️ Esporta tabella come immagine
        </button>
    `;
}

async function exportPaymentsImage() {

    const table =
        document.getElementById(
            "paymentsTableExport"
        );

    if (!table) {
        showToast(
            "Tabella non trovata"
        );
        return;
    }

    try {

        const canvas =
            await html2canvas(
                table,
                {
                    backgroundColor:
                        getComputedStyle(
                            document.body
                        ).backgroundColor,
                    scale: 2
                }
            );

        const link =
            document.createElement("a");

        link.download =
            "pagamenti.png";

        link.href =
            canvas.toDataURL(
                "image/png"
            );

        link.click();

    } catch (error) {

        console.error(
            "Errore esportazione immagine:",
            error
        );

        showToast(
            "Errore durante l'esportazione"
        );
    }
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
       MULTA PERSONALIZZATA
       ========================= */

    const CUSTOM_RULE_ID = "custom";


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

    <div id="finePlayerContainer">

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

                    <option value="${CUSTOM_RULE_ID}">
                        ✏️ Multa personalizzata
                    </option>

                </select>

            </div>


            <!-- DESCRIZIONE PERSONALIZZATA -->

            <div
                class="field"
                id="customDescriptionField"
                style="display:none;"
            >

                <label>
                    DESCRIZIONE
                </label>

                <input
                    id="customDescription"
                    type="text"
                    placeholder="Descrizione della multa"
                    value="${
                        fine?.custom
                            ? escapeHtml(
                                fine.type || ""
                            )
                            : ""
                    }"
                >

            </div>


            <!-- QUANTITÀ -->

            <div
                class="field"
                id="quantityField"
                style="display:none;"
            >

                <label id="quantityLabel">
                    QUANTITÀ
                </label>

                <input
                    id="fineQuantity"
                    type="number"
                    min="0"
                    step="1"
                    value="1"
                >

            </div>


            <!-- DATA -->

            <div class="field date-field">

                <label>
                    DATA
                </label>

                <div class="date-input-wrapper">

                    <input
                        id="fineDate"
                        type="text"
                        inputmode="numeric"
                        autocomplete="off"
                        placeholder="GG/MM/AAAA"
                        value="${
                            fine?.date
                                ? formatDate(fine.date)
                                : new Date()
                                    .toLocaleDateString("it-IT")
                        }"
                    >

                    <button
                        id="openFineDatePicker"
                        class="date-picker-button"
                        type="button"
                        aria-label="Apri calendario"
                    >
                        📅
                    </button>

                    <input
                        id="fineDatePicker"
                        class="fine-date-picker-native"
                        type="date"
                        tabindex="-1"
                        aria-hidden="true"
                        value="${
                            fine?.date ||
                            new Date()
                                .toISOString()
                                .slice(0, 10)
                        }"
                    >

                </div>

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

    const quantityField =
        document.getElementById(
            "quantityField"
        );

    const quantityLabel =
        document.getElementById(
            "quantityLabel"
        );

    const quantityInput =
        document.getElementById(
            "fineQuantity"
        );

    const customDescriptionField =
        document.getElementById(
            "customDescriptionField"
        );

    const customDescription =
        document.getElementById(
            "customDescription"
        );
   const finePlayerContainer =
    document.getElementById(
        "finePlayerContainer"
    );


    /* =========================
       AGGIORNA INTERFACCIA
       ========================= */

    function updateFineInterface() {

        const selectedValue =
            ruleSelect.value;
       const selectedRule =
    state.rules.find(
        item =>
            String(item.id) ===
            String(selectedValue)
    );

const isTeamFine =
    selectedRule?.type ===
    "Squadra perdente la partitella del giovedì";


/* =========================
   SELEZIONE GIOCATORI
   ========================= */

if (
    !isEdit &&
    isTeamFine
) {

    finePlayerContainer.innerHTML = `

        <select
            id="finePlayers"
            multiple
        >

            ${state.players
                .map(
                    player => `

                        <option
                            value="${escapeHtml(player)}"
                        >
                            ${escapeHtml(player)}
                        </option>

                    `
                )
                .join("")}

        </select>

        <small class="muted">
            Tieni premuto CTRL (PC) o usa la selezione multipla su telefono.
        </small>

    `;

} else {

    finePlayerContainer.innerHTML = `

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

    `;

}


        /* =========================
           MULTA PERSONALIZZATA
           ========================= */

        if (
            selectedValue ===
            CUSTOM_RULE_ID
        ) {

            customDescriptionField.style.display =
                "block";

            quantityField.style.display =
                "none";

            amountInput.disabled =
                false;

            amountInput.min =
                "0";

            amountInput.value =
                fine?.custom
                    ? fine.amount
                    : "";

            return;

        }


        customDescriptionField.style.display =
            "none";


        /* =========================
           REGOLA NORMALE
           ========================= */

        const rule =
            state.rules.find(
                item =>
                    String(item.id) ===
                    String(selectedValue)
            );


        if (!rule) {

            quantityField.style.display =
                "none";

            amountInput.disabled =
                false;

            amountInput.value =
                0;

            return;

        }

        /* =========================
           RITARDO AL MINUTO
           ========================= */

        if (
            rule.calculation ===
            "per_minute"
        ) {

            quantityField.style.display =
                "block";

            quantityLabel.textContent =
                "MINUTI DI RITARDO";

            quantityInput.min =
                "0";

            quantityInput.step =
                "1";

            quantityInput.value =
                fine?.quantity ??
                0;


            amountInput.disabled =
                true;

            amountInput.value =
                rule.baseAmount +
                (
                    Number(
                        quantityInput.value
                    ) || 0
                ) *
                rule.perMinute;

            return;

        }


        /* =========================
           IMPORTO PER PEZZO
           ========================= */

        if (
            rule.calculation ===
            "per_piece"
        ) {

            quantityField.style.display =
                "block";

            quantityLabel.textContent =
                "NUMERO DI PEZZI";

            quantityInput.min =
                "1";

            quantityInput.step =
                "1";

            quantityInput.value =
                fine?.quantity ??
                1;


            amountInput.disabled =
                true;

            amountInput.value =
                (
                    Number(
                        quantityInput.value
                    ) || 1
                ) *
                rule.perPiece;

            return;

        }


        /* =========================
           IMPORTO MINIMO
           ========================= */

        if (
            rule.calculation ===
            "custom_min"
        ) {

            quantityField.style.display =
                "none";

            amountInput.disabled =
                false;

            amountInput.min =
                rule.minAmount;

            amountInput.value =
                fine?.amount ??
                rule.minAmount;

            return;

        }


        /* =========================
           MULTA FISSA
           ========================= */

        quantityField.style.display =
            "none";

        amountInput.disabled =
            true;

        amountInput.min =
            "0";

        amountInput.value =
            rule.amount;

    }


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


        ruleSelect.innerHTML += `

            <option value="${CUSTOM_RULE_ID}">
                ✏️ Multa personalizzata
            </option>

        `;


        if (rules.length) {

            ruleSelect.value =
                String(
                    rules[0].id
                );

        }


        const fineDateInput =
            document.getElementById(
                "fineDate"
            );

        const fineDatePicker =
            document.getElementById(
                "fineDatePicker"
            );

        document
            .getElementById(
                "openFineDatePicker"
            )
            .addEventListener(
                "click",
                () => {
                    try {
                        if (
                            typeof fineDatePicker.showPicker ===
                            "function"
                        ) {
                            fineDatePicker.showPicker();
                            return;
                        }
                    } catch (error) {
                        // Il click nativo sotto gestisce i browser meno recenti.
                    }

                    fineDatePicker.click();
                }
            );

        fineDatePicker.addEventListener(
            "change",
            () => {
                fineDateInput.value =
                    formatDate(
                        fineDatePicker.value
                    );
            }
        );

        fineDateInput.addEventListener(
            "input",
            () => {
                const parsedDate =
                    parseFineDate(
                        fineDateInput.value
                    );

                if (parsedDate) {
                    fineDatePicker.value = parsedDate;
                }
            }
        );

        updateFineInterface();

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
        updateFineInterface
    );


    /* =========================
       CAMBIO QUANTITÀ
       ========================= */

    quantityInput.addEventListener(
        "input",
        () => {

            const selectedValue =
                ruleSelect.value;


            const rule =
                state.rules.find(
                    item =>
                        String(item.id) ===
                        String(selectedValue)
                );


            if (!rule) {
                return;
            }


            const quantity =
                Number(
                    quantityInput.value
                ) || 0;


            if (
                rule.calculation ===
                "per_minute"
            ) {

                amountInput.value =
                    rule.baseAmount +
                    quantity *
                    rule.perMinute;

            }


            if (
                rule.calculation ===
                "per_piece"
            ) {

                amountInput.value =
                    quantity *
                    rule.perPiece;

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

    /* =========================
   SALVA
   ========================= */

document
    .getElementById(
        "saveFine"
    )
    .onclick = () => {

        const singlePlayerSelect =
            document.getElementById(
                "finePlayer"
            );

        const multiPlayerSelect =
            document.getElementById(
                "finePlayers"
            );

        const player =
            singlePlayerSelect
                ? singlePlayerSelect.value
                : "";

        const date =
            parseFineDate(
                document
                    .getElementById(
                        "fineDate"
                    )
                    .value
            );

        const selectedRule =
            ruleSelect.value;

        const rule =
            state.rules.find(
                item =>
                    String(item.id) ===
                    String(selectedRule)
            );

        const isTeamFine =
            rule?.type ===
            "Squadra perdente la partitella del giovedì";


        /* =========================
           MULTA PERSONALIZZATA
           ========================= */

        if (
            selectedRule ===
            CUSTOM_RULE_ID
        ) {

            const description =
                customDescription.value.trim();

            const customAmount =
                Number(
                    amountInput.value
                );

            if (
                !player ||
                !date ||
                !description ||
                !Number.isFinite(
                    customAmount
                ) ||
                customAmount < 0
            ) {

                showToast(
                    "Controlla i dati inseriti."
                );

                return;
            }


            if (isEdit) {

                fine.player =
                    player;

                fine.category =
                    "Personalizzata";

                fine.type =
                    description;

                fine.ruleId =
                    null;

                fine.custom =
                    true;

                fine.quantity =
                    null;

                fine.date =
                    date;

                fine.amount =
                    customAmount;

            } else {

                state.fines.push({

                    id:
                        generateId(),

                    date,

                    player,

                    category:
                        "Personalizzata",

                    type:
                        description,

                    ruleId:
                        null,

                    custom:
                        true,

                    quantity:
                        null,

                    amount:
                        customAmount

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

            return;
        }


        /* =========================
           MULTA SQUADRA
           ========================= */

        if (
            !isEdit &&
            isTeamFine
        ) {

            const selectedPlayers =
                multiPlayerSelect
                    ? Array.from(
                        multiPlayerSelect
                            .selectedOptions
                    ).map(
                        option =>
                            option.value
                    )
                    : [];


            if (
                selectedPlayers.length === 0 ||
                !date
            ) {

                showToast(
                    "Seleziona almeno un giocatore."
                );

                return;
            }


            selectedPlayers.forEach(
                playerName => {

                    state.fines.push({

                        id:
                            generateId(),

                        date,

                        player:
                            playerName,

                        category:
                            rule.category,

                        type:
                            rule.type,

                        ruleId:
                            rule.id,

                        quantity:
                            null,

                        custom:
                            false,

                        amount:
                            1

                    });

                }
            );


            saveState();

            closeModal();

            render();

            showToast(
                `${selectedPlayers.length} multe aggiunte`
            );

            return;
        }


        /* =========================
           REGOLA NORMALE
           ========================= */

        const ruleId =
            Number(
                selectedRule
            );


        if (
            !player ||
            !rule ||
            !date
        ) {

            showToast(
                "Controlla i dati inseriti."
            );

            return;
        }


        let amount =
            Number(
                amountInput.value
            );

        let quantity =
            null;


        /* =========================
           CALCOLO AL MINUTO
           ========================= */

        if (
            rule.calculation ===
            "per_minute"
        ) {

            quantity =
                Number(
                    quantityInput.value
                ) || 0;

            amount =
                rule.baseAmount +
                quantity *
                rule.perMinute;
        }


        /* =========================
           CALCOLO PER PEZZO
           ========================= */

        if (
            rule.calculation ===
            "per_piece"
        ) {

            quantity =
                Number(
                    quantityInput.value
                ) || 0;


            if (
                quantity < 1
            ) {

                showToast(
                    "Inserisci almeno 1 pezzo."
                );

                return;
            }


            amount =
                quantity *
                rule.perPiece;
        }


        /* =========================
           IMPORTO MINIMO
           ========================= */

        if (
            rule.calculation ===
            "custom_min"
        ) {

            if (
                amount <
                rule.minAmount
            ) {

                showToast(
                    `L'importo minimo è ${money(
                        rule.minAmount
                    )}.`
                );

                return;
            }
        }


        if (
            !Number.isFinite(
                amount
            ) ||
            amount < 0
        ) {

            showToast(
                "Controlla l'importo."
            );

            return;
        }


        /* =========================
           MODIFICA
           ========================= */

        if (isEdit) {

            fine.player =
                player;

            fine.ruleId =
                ruleId;

            fine.category =
                rule.category;

            fine.type =
                rule.type;

            fine.date =
                date;

            fine.amount =
                amount;

            fine.quantity =
                quantity;

            fine.custom =
                false;

        }


        /* =========================
           NUOVA MULTA
           ========================= */

        else {

            state.fines.push({

                id:
                    generateId(),

                date,

                player,

                category:
                    rule.category,

                type:
                    rule.type,

                ruleId,

                quantity,

                custom:
                    false,

                amount

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


    /* =========================
       INIZIALIZZAZIONE
       ========================= */

    updateFineInterface();

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
       NAVIGAZIONE
       ========================= */

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


/* =========================
   MESI
   ========================= */

document
    .getElementById("monthSelect")
    ?.addEventListener("change", event => {

        selectedMonth =
            event.target.value;

        render();

    });


/* =========================
   GIOCATORE MULTE
   ========================= */

document
    .getElementById("finePlayerSelect")
    ?.addEventListener(
        "change",
        event => {

            selectedFinePlayer =
                event.target.value;

            render();

        }
    );


/* =========================
   MESE PAGAMENTI
   ========================= */

    document
       .getElementById("paymentMonthSelect")
       ?.addEventListener("change", event => {

           selectedPaymentMonth =
            event.target.value;

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

   document
    .getElementById("exportPaymentsImage")
    ?.addEventListener(
        "click",
        exportPaymentsImage
    );
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
/* =========================
   PAGAMENTI
   ========================= */

document
    .querySelectorAll(
        "[data-payment-player]"
    )
    .forEach(input => {

        input.addEventListener(
            "change",
            event => {

                const player =
                    event.target.dataset
                        .paymentPlayer;

                const month =
                    selectedPaymentMonth;

                const amount =
                    Math.max(
                        0,
                        Number(
                            event.target.value
                        ) || 0
                    );

                if (
                    !state.payments
                ) {
                    state.payments = {};
                }

                if (
                    !state.payments[month]
                ) {
                    state.payments[month] = {};
                }

                state.payments[month][player] =
                    amount;

                saveState();

                render();

            }
        );

    });
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
