/* =========================================================
   MulteFC
   APP.JS
   ========================================================= */

const STORAGE_KEY = "multefc_v1";
const THEME_STORAGE_KEY = "multefc_theme_v1";
const ADMIN_USERNAME = "admin";
const ADMIN_EMAIL = "admin@multefc.local";

const SUPABASE_URL = "https://gzeyptkjdvrwzsjeijss.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_juzsgyE5TPcFwNxXZV0t8A_w3TOKMfj";
const supabaseClient = window.supabase?.createClient
    ? window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    )
    : null;

let authUser = null;
let isAdmin = false;
let cloudReady = false;
let cloudChannel = null;
let cloudSaveTimer = null;
let modalScrollPosition = 0;



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
let deviceTheme = getDeviceTheme(state.theme);

let currentPage = "home";
let selectedMonth = "all";
let selectedPaymentMonth = "2026-08";
let selectedFinePlayer = "all";
let showAllRanking = false;


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

            // I campi storici delle multe (compreso "paid") vengono
            // conservati: Pagamenti è la fonte economica attuale, ma
            // il caricamento non deve mai cancellare dati legacy.
            loaded.fines =
                Array.isArray(loaded.fines)
                    ? loaded.fines
                        .filter(fine => fine && typeof fine === "object")
                    : [];

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

    saveLocalState();
    queueCloudSave();

}

function canMutate() {
    return isAdmin && navigator.onLine;
}

function requireOnlineAdmin() {
    if (canMutate()) return true;

    showToast(
        navigator.onLine
            ? "Devi accedere come amministratore."
            : "Offline: l'app è in sola lettura."
    );
    return false;
}

function saveLocalState() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}

function queueCloudSave() {
    if (!supabaseClient || !cloudReady || !isAdmin || !navigator.onLine) return;

    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(async () => {
        const { error } = await supabaseClient
            .from("app_state")
            .upsert(
                { id: "team", data: state },
                { onConflict: "id" }
            );

        if (error) {
            console.error("Errore salvataggio online:", error);
            showToast("Salvataggio online non riuscito.");
        }
    }, 250);
}

function applyAccessMode() {
    const canEdit = canMutate();

    const offlineIndicator = document.getElementById("offlineIndicator");
    if (offlineIndicator) {
        offlineIndicator.hidden = navigator.onLine;
    }

    document.body.classList.toggle("is-admin", isAdmin);

    const adminControls = [
        "#globalAddFine",
        "#addFine",
        "#addFineEmpty",
        "[data-edit-fine]",
        "[data-delete-fine]",
        "#addRule",
        "[data-edit-rule]",
        "[data-delete-rule]",
        "#addPlayer",
        "[data-delete-player]",
        "#saveSettings",
        "#importData",
        "#resetData",
        "#resetSeason",
        "#resetTotal"
    ];

    document.querySelectorAll(adminControls.join(",")).forEach(control => {
        control.hidden = !canEdit;
    });

    document.querySelectorAll(".payment-paid-input").forEach(input => {
        input.disabled = !canEdit;
    });
}

function updateAuthButton() {
    const button = document.getElementById("authButton");
    if (!button) return;

    if (!authUser) {
        button.textContent = "Accedi";
    } else if (isAdmin) {
        button.textContent = "Admin";
    } else {
        button.textContent = "Esci";
    }

    button.onclick = openAuthModal;
}

async function refreshAccess() {
    if (!supabaseClient) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    authUser = user || null;
    isAdmin = false;

    if (authUser) {
        await supabaseClient.rpc("claim_initial_admin");
        const { data } = await supabaseClient.rpc("is_app_admin");
        isAdmin = data === true;
    }

    updateAuthButton();
    applyAccessMode();
}

async function loadCloudState() {
    if (!supabaseClient) return false;

    const { data, error } = await supabaseClient
        .from("app_state")
        .select("data")
        .eq("id", "team")
        .maybeSingle();

    if (error) {
        console.error("Errore caricamento online:", error);
        return null;
    }

    if (data?.data && Object.keys(data.data).length) {
        state = {
            ...structuredClone(defaultState),
            ...data.data
        };
        saveLocalState();
        return true;
    }

    return false;
}

function subscribeToCloud() {
    if (!supabaseClient || cloudChannel) return;

    cloudChannel = supabaseClient
        .channel("multefc-state")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "app_state",
                filter: "id=eq.team"
            },
            payload => {
                if (!payload.new?.data) return;
                state = {
                    ...structuredClone(defaultState),
                    ...payload.new.data
                };
                saveLocalState();
                render();
                showToast("Dati aggiornati online.");
            }
        )
        .subscribe();
}

async function initializeCloud() {
    if (!supabaseClient) return;

    await refreshAccess();
    const hasCloudState = await loadCloudState();
    cloudReady = hasCloudState !== null;

    if (isAdmin && !hasCloudState) {
        queueCloudSave();
    }

    subscribeToCloud();

    window.addEventListener("online", async () => {
        const refreshed = await loadCloudState();
        cloudReady = refreshed !== null;
        await refreshAccess();
        render();
        showToast("Connessione ristabilita.");
    });

    window.addEventListener("offline", () => {
        closeModal();
        render();
        showToast("Sei offline: le modifiche sono bloccate.");
    });

    render();

    supabaseClient.auth.onAuthStateChange(() => {
        setTimeout(async () => {
            await refreshAccess();
            const hasData = await loadCloudState();
            cloudReady = hasData !== null;
            if (isAdmin && !hasData) queueCloudSave();
            render();
        }, 0);
    });
}

function openAuthModal() {
    if (!authUser && !navigator.onLine) {
        showToast("Serve una connessione Internet per accedere.");
        return;
    }

    if (authUser) {
        openModal(
            isAdmin ? "Amministratore" : "Accesso",
                            `<div class="form">
                    <p class="muted">${isAdmin ? "Hai accesso alle modifiche su questo dispositivo." : "Sei connesso in sola visualizzazione."}</p>
                    <button class="btn secondary" id="signOutButton" type="button">Esci</button>
                </div>`
        );

        document.getElementById("signOutButton").onclick = async () => {
            await supabaseClient.auth.signOut();
            closeModal();
            showToast("Accesso disconnesso.");
        };
        return;
    }

    openModal(
        "Accesso amministratore",
        `<div class="form">
                <p class="muted">Accedi per modificare. La sessione resta memorizzata su questo dispositivo.</p>
                <div class="field"><label>UTENTE</label><input id="authUsername" type="text" autocomplete="username" placeholder="Utente"></div>
                <div class="field"><label>PASSWORD</label><input id="authPassword" type="password" autocomplete="current-password" placeholder="Password"></div>
                <div class="modal-actions">
                    <button class="btn" id="signInButton" type="button">Accedi</button>
                </div>
            </div>`
    );

    const getCredentials = () => ({
        username: document.getElementById("authUsername").value.trim().toLowerCase(),
        password: document.getElementById("authPassword").value
    });

    document.getElementById("signInButton").onclick = async () => {
        const { username, password } = getCredentials();

        if (username !== ADMIN_USERNAME || !password) {
            showToast("Credenziali non valide.");
            return;
        }

        const { error } = await supabaseClient.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password
        });

        if (error) {
            showToast("Credenziali non valide.");
            return;
        }

        closeModal();
        showToast("Accesso effettuato.");
    };
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

function getDeviceTheme(fallback = "light") {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : fallback === "dark"
            ? "dark"
            : "light";
}

const PREFERRED_CATEGORY_ORDER = [
    "Allenamento",
    "Partita",
    "Comportamento",
    "Materiale",
    "Spogliatoio",
    "Squadra",
    "Altro"
];

function compareItalian(left, right) {
    return String(left ?? "").localeCompare(
        String(right ?? ""),
        "it",
        { sensitivity: "base" }
    );
}

function getSortedPlayers(players = state.players) {
    return [...players].sort(compareItalian);
}

function getSortedCategories(categories) {
    return [...new Set(categories.filter(Boolean))]
        .sort((left, right) => {
            const leftIndex = PREFERRED_CATEGORY_ORDER.indexOf(left);
            const rightIndex = PREFERRED_CATEGORY_ORDER.indexOf(right);

            if (leftIndex !== -1 || rightIndex !== -1) {
                if (leftIndex === -1) return 1;
                if (rightIndex === -1) return -1;
                return leftIndex - rightIndex;
            }

            return compareItalian(left, right);
        });
}

function getRuleCalculation(rule) {
    return ["fixed", "per_minute", "per_piece", "custom_min"].includes(
        rule?.calculation
    )
        ? rule.calculation
        : "fixed";
}

function calculateRuleAmount(rule, quantity = 0) {
    const safeQuantity = Number(quantity) || 0;

    if (getRuleCalculation(rule) === "per_minute") {
        return (Number(rule.baseAmount) || 0) +
            safeQuantity * (Number(rule.perMinute) || 0);
    }

    if (getRuleCalculation(rule) === "per_piece") {
        return safeQuantity * (Number(rule.perPiece) || 0);
    }

    return Number(rule?.amount) || 0;
}

function formatRuleAmount(rule) {
    const calculation = getRuleCalculation(rule);

    if (calculation === "per_minute") {
        return `${money(rule.baseAmount)} + ${money(rule.perMinute)}/min`;
    }

    if (calculation === "per_piece") {
        return `${money(rule.perPiece)}/pezzo`;
    }

    if (calculation === "custom_min") {
        return `da ${money(rule.minAmount)}`;
    }

    return money(rule.amount);
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
            deviceTheme === "dark"
                ? "dark"
                : "light";

    const button =
        document.getElementById(
            "themeButton"
        );

    if (button) {

        button.textContent =
            deviceTheme === "dark"
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

    if (!isAdmin && currentPage === "settings") {
        currentPage = "home";
    }

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
    applyAccessMode();

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

    // Dal giorno 15 diventa esigibile il mese precedente.
    const overdueReference = today.getDate() >= 15
        ? new Date(today.getFullYear(), today.getMonth() - 1, 1)
        : null;
    const overdueMonth = overdueReference
        ? `${overdueReference.getFullYear()}-${String(
            overdueReference.getMonth() + 1
        ).padStart(2, "0")}`
        : null;
    const overduePlayers = overdueMonth && paymentMonths.includes(overdueMonth)
        ? getSortedPlayers().map(player => ({
            player,
            summary: getPlayerMonthSummary(player, overdueMonth)
        })).filter(item => item.summary.remaining > 0)
        : [];
    const overdueMonthLabel = overdueMonth
        ? new Date(`${overdueMonth}-01T12:00:00`).toLocaleDateString(
            "it-IT",
            { month: "long", year: "numeric" }
        )
        : "";

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
                b.amount - a.amount || compareItalian(a.player, b.player)
        );


    const podium =
        ranking.slice(0, 5);


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
                                ${positions[index] || `${index + 1}°`}
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
            ? ranking.slice(5)
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
                                    ${index + 6}
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


        ${
            overdueMonth
                ? `
                    <div class="card overdue-card">
                        <div class="row">
                            <div>
                                <strong>⚠ Insoluti di ${escapeHtml(overdueMonthLabel)}</strong>
                                <div class="small muted">Dal 15 del mese successivo</div>
                            </div>
                            <strong>${overduePlayers.length}</strong>
                        </div>
                        ${
                            overduePlayers.length
                                ? `
                                    <div class="overdue-list">
                                        ${overduePlayers.map(item => `
                                            <div class="overdue-row">
                                                <span>${escapeHtml(item.player)}</span>
                                                <strong>${money(item.summary.remaining)}</strong>
                                            </div>
                                        `).join("")}
                                    </div>
                                `
                                : `<p class="small muted">Nessun insoluto per il mese di riferimento.</p>`
                        }
                    </div>
                `
                : ""
        }


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
            ranking.length > 5
                ?

            `

                <div class="section-head">

                    <h2>
                        📊 Classifica
                    </h2>

                    <button class="btn secondary" id="toggleRanking" type="button">
                        ${showAllRanking ? "Mostra meno" : "Mostra tutti"}
                    </button>

                </div>

                ${
                    showAllRanking
                        ? `<div class="card list">${rankingHtml}</div>`
                        : ""
                }

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
    const now = new Date();
    const currentFineMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}`;
    const previousFineDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
    );
    const previousFineMonth = `${previousFineDate.getFullYear()}-${String(
        previousFineDate.getMonth() + 1
    ).padStart(2, "0")}`;

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

                    ${
                        isAdmin
                            ? `
                                <button
                                    class="primary-btn"
                                    id="addFineEmpty"
                                >
                                    ＋ Aggiungi multa
                                </button>
                            `
                            : ""
                    }

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


            ${
                isAdmin
                    ? `
                        <button
                            class="primary-btn"
                            id="addFine"
                        >
                            ＋ Nuova multa
                        </button>
                    `
                    : ""
            }

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

    <div class="fine-quick-filters" aria-label="Filtri rapidi multe">
        <button
            type="button"
            data-fine-period="${currentFineMonth}"
            class="${selectedMonth === currentFineMonth ? "active" : ""}"
        >
            Questo mese
        </button>
        <button
            type="button"
            data-fine-period="${previousFineMonth}"
            class="${selectedMonth === previousFineMonth ? "active" : ""}"
        >
            Mese scorso
        </button>
        <button
            type="button"
            data-fine-period="all"
            class="${selectedMonth === "all" ? "active" : ""}"
        >
            Tutta la stagione
        </button>
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

                ${getSortedPlayers()
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
        getSortedPlayers().map(player => {
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
                <div class="payment-row" data-payment-remaining="${summary.remaining}">
                    <button
                        type="button"
                        class="payment-player payment-sticky player-history-trigger"
                        data-player-history="${escapeHtml(player)}"
                        aria-label="Apri situazione di ${escapeHtml(player)}"
                    >
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

                            <small class="payment-status ${
                                summary.remaining <= 0
                                    ? "payment-status-ok"
                                    : summary.paid > 0
                                        ? "payment-status-partial"
                                        : "payment-status-due"
                            }">
                                ${
                                    summary.remaining <= 0
                                        ? "✓ Saldato"
                                        : summary.paid > 0
                                            ? "€ Parziale"
                                            : "! Da saldare"
                                }
                            </small>
                        </div>
                    </button>

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

                    <div class="payment-value">
                        ${money(summary.base)}
                    </div>

                    <div class="payment-value">
                        ${money(summary.fines)}
                    </div>

                    <div class="payment-value payment-total">
                        ${money(summary.total)}
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
                <div class="payment-sticky">Giocatore</div>
                <div>Versato</div>
                <div>Rimanente</div>
                <div>Base</div>
                <div>Multe</div>
                <div>Totale</div>
            </div>

            <div class="payments-table-body">
                ${rows}
            </div>

        </div>

        <div class="payment-export-actions">
            <button id="exportPaymentsImage" class="primary-button" type="button">
                🖼️ Esporta tabella completa
            </button>
            <button id="exportDuePaymentsImage" class="btn secondary" type="button">
                🖼️ Esporta solo da pagare
            </button>
        </div>
    `;
}

async function exportPaymentsImage(mode = "all") {

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

    const monthLabel = new Date(
        `${selectedPaymentMonth}-01T12:00:00`
    ).toLocaleDateString("it-IT", { month: "long", year: "numeric" });
    const exportCard = table.cloneNode(true);
    exportCard.removeAttribute("id");

    if (mode === "due") {
        exportCard.querySelectorAll(".payment-row").forEach(row => {
            if (Number(row.dataset.paymentRemaining) <= 0) {
                row.remove();
            }
        });

        if (!exportCard.querySelector(".payment-row")) {
            showToast("Nessun giocatore da esportare.");
            return;
        }
    }

    const exportContainer = document.createElement("section");
    exportContainer.className = "payments-export-canvas";
    exportContainer.innerHTML = `
        <h1>${mode === "due" ? "Da pagare" : "Pagamenti"} — ${escapeHtml(monthLabel)}</h1>
        <p>${escapeHtml(state.team)} · ${escapeHtml(state.season)}</p>
    `;
    exportContainer.append(exportCard);
    document.body.append(exportContainer);

    try {

        const canvas =
            await html2canvas(
                exportContainer,
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
            `${mode === "due" ? "da-pagare" : "pagamenti"}-${selectedPaymentMonth}.png`;

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
    } finally {
        exportContainer.remove();
    }
}

function openPlayerHistoryModal(player) {
    if (!state.players.includes(player)) {
        showToast("Giocatore non trovato.");
        return;
    }

    const months = getPaymentMonths();
    const playerFines = [...state.fines]
        .filter(fine => fine.player === player)
        .sort((left, right) => String(right.date || "")
            .localeCompare(String(left.date || "")));
    const finesTotal = playerFines.reduce(
        (total, fine) => total + Number(fine.amount || 0),
        0
    );
    const baseTotal = months.reduce(
        (total, month) => total + getMonthlyBase(month),
        0
    );
    const paidTotal = months.reduce(
        (total, month) => total + getPlayerMonthPayment(player, month),
        0
    );
    const dueTotal = baseTotal + finesTotal;
    const remainingTotal = Math.max(0, dueTotal - paidTotal);

    openModal(
        `Situazione di ${escapeHtml(player)}`,
        `
            <div class="player-history-summary">
                <div><span>Dovuto stagione</span><strong>${money(dueTotal)}</strong></div>
                <div><span>Versato</span><strong>${money(paidTotal)}</strong></div>
                <div><span>Rimanente</span><strong>${money(remainingTotal)}</strong></div>
            </div>

            <div class="section-head compact-section-head"><h3>Situazione mensile</h3></div>
            <div class="player-history-list">
                ${months.map(month => {
                    const summary = getPlayerMonthSummary(player, month);
                    const label = new Date(`${month}-01T12:00:00`)
                        .toLocaleDateString("it-IT", { month: "long", year: "numeric" });
                    return `
                        <div class="player-history-row">
                            <div><strong>${escapeHtml(label)}</strong><small>Quote ${money(summary.base)} · multe ${money(summary.fines)}</small></div>
                            <div><small>Versato ${money(summary.paid)}</small><strong class="${summary.remaining > 0 ? "history-due" : "history-ok"}">${summary.remaining > 0 ? `${money(summary.remaining)} da saldare` : "✓ Saldato"}</strong></div>
                        </div>
                    `;
                }).join("")}
            </div>

            <div class="section-head compact-section-head"><h3>Ultime multe</h3></div>
            <div class="player-history-list">
                ${playerFines.length ? playerFines.map(fine => `
                    <div class="player-history-row">
                        <div><strong>${escapeHtml(fine.type)}</strong><small>${formatDate(fine.date)} · ${escapeHtml(fine.category)}</small></div>
                        <strong>${money(fine.amount)}</strong>
                    </div>
                `).join("") : `<p class="muted small">Nessuna multa registrata.</p>`}
            </div>
        `
    );
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

            getSortedCategories(Object.keys(groups))
                .map(
                    category => {
                        const rules = [...groups[category]].sort(
                            (left, right) => compareItalian(left.type, right.type)
                        );

                        return `

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
                                                    ${formatRuleAmount(rule)}
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

                    `;
                    }
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

                getSortedPlayers()
                    .map(
                        player => `

                            <span
                                class="player-chip"
                            >

                                ${escapeHtml(
                                    player
                                )}

                                <button
                                    type="button"
                                    data-delete-player="${escapeHtml(player)}"
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
                        Nuova stagione
                    </strong>

                    <div class="small muted">
                        Mantiene squadra, giocatori e Multario; azzera multe e pagamenti stagionali.
                        Scarica prima un backup automatico.
                    </div>

                </div>

                <button class="btn danger" id="resetSeason" type="button">
                    Nuova stagione
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


            <div class="divider"></div>


            <div class="row wrap">

                <div>

                    <strong>
                        Reset totale
                    </strong>

                    <div class="small muted">
                        Riporta l'app ai dati iniziali. Richiede la conferma RESET e scarica prima un backup.
                    </div>

                </div>

                <button class="btn danger" id="resetTotal" type="button">
                    Reset totale
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

    // Blocca il contenuto sottostante senza perdere la posizione di lettura.
    if (!document.body.classList.contains("modal-open")) {
        modalScrollPosition = window.scrollY;
        document.body.style.top = `-${modalScrollPosition}px`;
        document.body.classList.add("modal-open");
    }


    document
        .getElementById(
            "closeModal"
        )
        .onclick = closeModal;


    /* Su iPhone la modale si chiude solo con × o Annulla:        un tocco sui selettori non può più essere intercettato dallo sfondo. */

}


function closeModal() {

    document.getElementById(
        "modalRoot"
    ).innerHTML = "";

    if (document.body.classList.contains("modal-open")) {
        document.body.classList.remove("modal-open");
        document.body.style.top = "";
        window.scrollTo(0, modalScrollPosition);
    }

}


/* =========================================================
   MODALE MULTA
   ========================================================= */

function openFineModal(id = null) {

    if (!requireOnlineAdmin()) return;

    const fine = id
        ? state.fines.find(item => item.id === id)
        : null;

    const isEdit = Boolean(fine);


    /* =========================
       CATEGORIE
       ========================= */

    const categories = getSortedCategories(
        state.rules.map(rule => rule.category)
    );


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

            ${
                !isEdit
                    ? `
                        <div class="field">
                            <label>DESTINATARI</label>
                            <select id="fineRecipients">
                                <option value="single">Un giocatore</option>
                                <option value="multiple">Più giocatori</option>
                                <option value="team">Tutta la squadra</option>
                            </select>
                        </div>
                    `
                    : ""
            }

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

                getSortedPlayers()
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

                <div class="fine-select-control" id="fineCategoryControl">
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
                    <button class="fine-select-trigger" id="fineCategoryTrigger" type="button" aria-haspopup="listbox" aria-expanded="false">Seleziona una categoria</button>
                    <div class="fine-select-menu" id="fineCategoryMenu" role="listbox" hidden></div>
                </div>

            </div>


            <!-- TIPO -->

            <div class="field">

                <label>
                    TIPO DI MULTA
                </label>

                <div class="fine-select-control" id="fineRuleControl">
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
                                        ${formatRuleAmount(rule)}
                                    </option>

                                `
                            )
                            .join("")
                    }

                    <option
                        value="${CUSTOM_RULE_ID}"
                        ${fine?.custom ? "selected" : ""}
                    >
                        ✏️ Multa personalizzata
                    </option>

                </select>
                    <button class="fine-select-trigger" id="fineRuleTrigger" type="button" aria-haspopup="listbox" aria-expanded="false">Seleziona il tipo di multa</button>
                    <div class="fine-select-menu" id="fineRuleMenu" role="listbox" hidden></div>
                </div>

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
                        type="date"
                        value="${
                            fine?.date ||
                            new Date()
                                .toISOString()
                                .slice(0, 10)
                        }"
                    >

                    <span
                        class="date-value"
                        id="fineDateValue"
                        aria-hidden="true"
                    ></span>

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
    const recipientsSelect = document.getElementById("fineRecipients");


    /* Nuova multa: nessun valore precompilato. */
    if (!isEdit) {
        const initialPlayerSelect = document.getElementById("finePlayer");

        initialPlayerSelect.insertAdjacentHTML(
            "afterbegin",
            '<option value="">Seleziona un giocatore</option>'
        );
        initialPlayerSelect.value = "";

        categorySelect.insertAdjacentHTML(
            "afterbegin",
            '<option value="">Seleziona una categoria</option>'
        );
        categorySelect.value = "";

        ruleSelect.innerHTML =
            '<option value="">Seleziona prima una categoria</option>';

        document.getElementById("fineDate").value = "";
        amountInput.value = "";
    }


    /* Data nativa con testo allineato e tocchi dei menu isolati. */
    const fineDateInput = document.getElementById("fineDate");
    const fineDateValue = document.getElementById("fineDateValue");

    function updateFineDateValue() {
        if (!fineDateInput.value) {
            fineDateValue.textContent = "Seleziona una data";
            return;
        }

        const [year, month, day] = fineDateInput.value.split("-");
        const label = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        ).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        fineDateValue.textContent = label;
    }

    fineDateInput.addEventListener("input", updateFineDateValue);
    fineDateInput.addEventListener("change", updateFineDateValue);
    updateFineDateValue();


    let refreshRuleMenu = () => {};
    const customFineMenus = [];

    function setupFineMenu(select, trigger, menu) {
        function render() {
            const selected = select.options[select.selectedIndex];
            trigger.textContent = selected
                ? selected.textContent.trim()
                : "Seleziona";

            menu.innerHTML = Array.from(select.options)
                .map(option =>                     `<button type="button" class="fine-select-option${option.value === select.value ? " is-selected" : ""}" data-value="${escapeHtml(option.value)}" role="option" aria-selected="${option.value === select.value}">${escapeHtml(option.textContent.trim())}</button>`                )
                .join("");
        }

        function close() {
            menu.hidden = true;
            trigger.setAttribute("aria-expanded", "false");
        }

        trigger.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            const isOpening = menu.hidden;
            customFineMenus.forEach(item => item.close());
            if (isOpening) {
                menu.hidden = false;
                trigger.setAttribute("aria-expanded", "true");
            }
        });

        menu.addEventListener("click", event => {
            const optionButton = event.target.closest(".fine-select-option");
            if (!optionButton) return;
            event.preventDefault();
            event.stopPropagation();
            select.value = optionButton.dataset.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            render();
            close();
        });

        select.addEventListener("change", render);
        customFineMenus.push({ close, render });
        render();
        return { close, render };
    }

    setupFineMenu(
        categorySelect,
        document.getElementById("fineCategoryTrigger"),
        document.getElementById("fineCategoryMenu")
    );

    const ruleMenu = setupFineMenu(
        ruleSelect,
        document.getElementById("fineRuleTrigger"),
        document.getElementById("fineRuleMenu")
    );
    refreshRuleMenu = ruleMenu.render;

    [categorySelect, ruleSelect, document.getElementById("finePlayer")]
        .filter(Boolean)
        .forEach(select => {
            ["touchstart", "touchend", "click"].forEach(eventName => {
                select.addEventListener(eventName, event => {
                    event.stopPropagation();
                });
            });
        });


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

        /* =========================
           SELEZIONE DESTINATARI
           ========================= */

        const recipientMode = isEdit
            ? "single"
            : recipientsSelect?.value || "single";

        const rememberedPlayer =
            document.getElementById("finePlayer")?.value ||
            finePlayerContainer.dataset.selectedPlayer ||
            fine?.player ||
            "";

        const rememberedPlayers = Array.from(
            document.querySelectorAll("[data-fine-recipient]:checked")
        ).map(input => input.value);

        if (rememberedPlayer) {
            finePlayerContainer.dataset.selectedPlayer = rememberedPlayer;
        }

        if (rememberedPlayers.length) {
            finePlayerContainer.dataset.selectedPlayers = JSON.stringify(rememberedPlayers);
        }

        let selectedPlayers = [];
        try {
            selectedPlayers = JSON.parse(
                finePlayerContainer.dataset.selectedPlayers || "[]"
            );
        } catch (error) {
            selectedPlayers = [];
        }

        if (recipientMode === "team") {
            finePlayerContainer.innerHTML = `
                <div class="recipient-notice" id="teamFinePlayersNotice">
                    👥 La multa sarà assegnata automaticamente a tutti i giocatori della rosa.
                </div>
            `;
        } else if (recipientMode === "multiple") {
            finePlayerContainer.innerHTML = `
                <div class="recipient-actions">
                    <button type="button" data-select-all-recipients>Seleziona tutti</button>
                    <button type="button" data-clear-recipients>Deseleziona</button>
                </div>
                <div class="recipient-list" role="group" aria-label="Giocatori destinatari">
                    ${getSortedPlayers().map(player => `
                        <label class="recipient-option">
                            <input
                                type="checkbox"
                                data-fine-recipient
                                value="${escapeHtml(player)}"
                                ${selectedPlayers.includes(player) ? "checked" : ""}
                            >
                            <span>${escapeHtml(player)}</span>
                        </label>
                    `).join("")}
                </div>
                <small class="muted">Seleziona i giocatori a cui applicare la multa.</small>
            `;

            finePlayerContainer
                .querySelector("[data-select-all-recipients]")
                .addEventListener("click", () => {
                    finePlayerContainer
                        .querySelectorAll("[data-fine-recipient]")
                        .forEach(input => { input.checked = true; });
                });

            finePlayerContainer
                .querySelector("[data-clear-recipients]")
                .addEventListener("click", () => {
                    finePlayerContainer
                        .querySelectorAll("[data-fine-recipient]")
                        .forEach(input => { input.checked = false; });
                });
        } else if (!document.getElementById("finePlayer")) {
            finePlayerContainer.innerHTML = `
                <select id="finePlayer">
                    <option value="">Seleziona un giocatore</option>
                    ${getSortedPlayers().map(player => `
                        <option
                            value="${escapeHtml(player)}"
                            ${rememberedPlayer === player ? "selected" : ""}
                        >${escapeHtml(player)}</option>
                    `).join("")}
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
                "";

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

            amountInput.value = calculateRuleAmount(
                rule,
                quantityInput.value
            );

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

            amountInput.value = calculateRuleAmount(
                rule,
                Number(quantityInput.value) || 1
            );

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

        const rules = state.rules.filter(
            rule => rule.category === category
        );

        ruleSelect.innerHTML =
            '<option value="">Seleziona il tipo di multa</option>' +
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
                            ${formatRuleAmount(rule)}
                        </option>

                    `
                )
            .join("") + `
                <option value="${CUSTOM_RULE_ID}">
                    ✏️ Multa personalizzata
                </option>
            `;

        ruleSelect.value = "";

        refreshRuleMenu();
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

    recipientsSelect?.addEventListener("change", updateFineInterface);


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

                amountInput.value = calculateRuleAmount(rule, quantity);

            }


            if (
                rule.calculation ===
                "per_piece"
            ) {

                amountInput.value = calculateRuleAmount(rule, quantity);

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

        const player =
            singlePlayerSelect
                ? singlePlayerSelect.value
                : "";

        const recipientMode = isEdit
            ? "single"
            : recipientsSelect?.value || "single";

        const selectedPlayers = recipientMode === "team"
            ? getSortedPlayers()
            : recipientMode === "multiple"
                ? Array.from(
                    document.querySelectorAll("[data-fine-recipient]:checked")
                ).map(input => input.value)
                : [player].filter(Boolean);

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
                (isEdit ? !player : selectedPlayers.length === 0) ||
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

                selectedPlayers.forEach(playerName => {
                    state.fines.push({
                        id: generateId(),
                        date,
                        player: playerName,
                        category: recipientMode === "team" ? "Squadra" : "Personalizzata",
                        type: description,
                        ruleId: null,
                        custom: true,
                        team: recipientMode === "team",
                        quantity: null,
                        amount: customAmount
                    });
                });

            }


            saveState();

            closeModal();

            render();

            showToast(
                isEdit
                    ? "Multa modificata"
                    : selectedPlayers.length > 1
                        ? `${selectedPlayers.length} multe aggiunte`
                        : "Multa aggiunta"
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
            (isEdit ? !player : selectedPlayers.length === 0) ||
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

            amount = calculateRuleAmount(rule, quantity);
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


            amount = calculateRuleAmount(rule, quantity);
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

            selectedPlayers.forEach(playerName => {
                state.fines.push({
                    id: generateId(),
                    date,
                    player: playerName,
                    category: rule.category,
                    type: rule.type,
                    ruleId,
                    quantity,
                    custom: false,
                    team: recipientMode === "team",
                    amount
                });
            });

        }


        saveState();

        closeModal();

        render();

        showToast(
            isEdit
                ? "Multa modificata"
            : selectedPlayers.length > 1
                ? `${selectedPlayers.length} multe aggiunte`
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

    if (!requireOnlineAdmin()) return;

    const rule = id
        ? state.rules.find(item => item.id === id)
        : null;
    const calculation = getRuleCalculation(rule);
    const categorySuggestions = getSortedCategories([
        ...PREFERRED_CATEGORY_ORDER,
        ...state.rules.map(item => item.category)
    ]);

    openModal(
        id ? "Modifica regola" : "Nuova regola",
        `
            <div class="form">
                <div class="field">
                    <label>CATEGORIA</label>
                    <input id="ruleCategory" type="text" list="ruleCategories"
                        value="${escapeHtml(rule?.category || "")}"
                        placeholder="Es. Allenamento">
                    <datalist id="ruleCategories">
                        ${categorySuggestions.map(category =>
                            `<option value="${escapeHtml(category)}"></option>`
                        ).join("")}
                    </datalist>
                </div>

                <div class="field">
                    <label>TIPOLOGIA</label>
                    <input id="ruleType" type="text"
                        value="${escapeHtml(rule?.type || "")}"
                        placeholder="Es. Ritardo allenamento">
                </div>

                <div class="field">
                    <label>TIPO DI CALCOLO</label>
                    <select id="ruleCalculation">
                        <option value="fixed" ${calculation === "fixed" ? "selected" : ""}>Importo fisso</option>
                        <option value="per_minute" ${calculation === "per_minute" ? "selected" : ""}>Importo × minuti</option>
                        <option value="per_piece" ${calculation === "per_piece" ? "selected" : ""}>Importo × quantità</option>
                        <option value="custom_min" ${calculation === "custom_min" ? "selected" : ""}>Importo libero con minimo</option>
                    </select>
                </div>

                <div class="field" id="ruleFixedField">
                    <label>IMPORTO FISSO (€)</label>
                    <input id="ruleAmount" type="number" min="0" step="0.01"
                        value="${rule?.amount ?? 5}">
                </div>

                <div class="field" id="ruleMinuteBaseField">
                    <label>IMPORTO BASE (€)</label>
                    <input id="ruleBaseAmount" type="number" min="0" step="0.01"
                        value="${rule?.baseAmount ?? rule?.amount ?? 0}">
                </div>

                <div class="field" id="ruleMinuteRateField">
                    <label>IMPORTO PER MINUTO (€)</label>
                    <input id="rulePerMinute" type="number" min="0" step="0.01"
                        value="${rule?.perMinute ?? 1}">
                </div>

                <div class="field" id="rulePieceField">
                    <label>IMPORTO PER PEZZO (€)</label>
                    <input id="rulePerPiece" type="number" min="0" step="0.01"
                        value="${rule?.perPiece ?? rule?.amount ?? 1}">
                </div>

                <div class="field" id="ruleMinimumField">
                    <label>IMPORTO MINIMO (€)</label>
                    <input id="ruleMinimum" type="number" min="0" step="0.01"
                        value="${rule?.minAmount ?? rule?.amount ?? 0}">
                </div>

                <div class="modal-actions">
                    <button class="btn secondary" id="cancelRule" type="button">Annulla</button>
                    <button class="btn" id="saveRule" type="button">Salva</button>
                </div>
            </div>
        `
    );

    const calculationSelect = document.getElementById("ruleCalculation");
    const calculationFields = {
        fixed: ["ruleFixedField"],
        per_minute: ["ruleMinuteBaseField", "ruleMinuteRateField"],
        per_piece: ["rulePieceField"],
        custom_min: ["ruleMinimumField"]
    };

    function updateRuleCalculationFields() {
        Object.entries(calculationFields).forEach(([key, ids]) => {
            ids.forEach(fieldId => {
                document.getElementById(fieldId).hidden = key !== calculationSelect.value;
            });
        });
    }

    calculationSelect.addEventListener("change", updateRuleCalculationFields);
    updateRuleCalculationFields();
    document.getElementById("cancelRule").onclick = closeModal;

    document.getElementById("saveRule").onclick = () => {
        const category = document.getElementById("ruleCategory").value.trim();
        const type = document.getElementById("ruleType").value.trim();
        const selectedCalculation = calculationSelect.value;
        const values = {
            amount: Number(document.getElementById("ruleAmount").value),
            baseAmount: Number(document.getElementById("ruleBaseAmount").value),
            perMinute: Number(document.getElementById("rulePerMinute").value),
            perPiece: Number(document.getElementById("rulePerPiece").value),
            minAmount: Number(document.getElementById("ruleMinimum").value)
        };

        if (!category || !type) {
            showToast("Compila categoria e tipologia.");
            return;
        }

        const requiredValues = selectedCalculation === "fixed"
            ? [values.amount]
            : selectedCalculation === "per_minute"
                ? [values.baseAmount, values.perMinute]
                : selectedCalculation === "per_piece"
                    ? [values.perPiece]
                    : [values.minAmount];

        if (requiredValues.some(value => !Number.isFinite(value) || value < 0)) {
            showToast("Inserisci importi validi.");
            return;
        }

        // Mantiene eventuali campi legacy o estensioni future della regola.
        const newRule = {
            ...(rule || {}),
            id: id || generateId(),
            category,
            type,
            calculation: selectedCalculation
        };

        if (selectedCalculation === "fixed") {
            newRule.amount = values.amount;
        } else if (selectedCalculation === "per_minute") {
            newRule.baseAmount = values.baseAmount;
            newRule.perMinute = values.perMinute;
            newRule.amount = values.baseAmount;
        } else if (selectedCalculation === "per_piece") {
            newRule.perPiece = values.perPiece;
            newRule.amount = values.perPiece;
        } else {
            newRule.minAmount = values.minAmount;
            newRule.amount = values.minAmount;
        }

        if (id) {
            const index = state.rules.findIndex(item => item.id === id);
            if (index === -1) {
                showToast("Regola non trovata.");
                return;
            }
            state.rules[index] = newRule;
        } else {
            state.rules.push(newRule);
        }

        saveState();
        closeModal();
        render();
        showToast("Regola salvata");
    };

}


/* =========================================================
   MODALE GIOCATORE
   ========================================================= */

function openPlayerModal() {

    if (!requireOnlineAdmin()) return;

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

                if (button.dataset.page === "settings" && !isAdmin) {
                    showToast("Per aprire Impostazioni devi accedere come amministratore.");
                    return;
                }

                if (button.dataset.page === "settings" && !navigator.onLine) {
                    showToast("Le impostazioni si modificano solo online.");
                    return;
                }

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

document
    .querySelectorAll("[data-fine-period]")
    .forEach(button => {
        button.addEventListener("click", () => {
            selectedMonth = button.dataset.finePeriod;
            render();
        });
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
        .getElementById("globalAddFine")
        .onclick = openFineModal;


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

    document
        .getElementById("toggleRanking")
        ?.addEventListener("click", () => {
            showAllRanking = !showAllRanking;
            render();
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

                if (!requireOnlineAdmin()) return;

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

                if (!requireOnlineAdmin()) return;

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

                if (!requireOnlineAdmin()) return;

                const player = button.dataset.deletePlayer;
                const index = state.players.indexOf(player);


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

   document
    .getElementById("exportDuePaymentsImage")
    ?.addEventListener(
        "click",
        () => exportPaymentsImage("due")
    );

    document
        .querySelectorAll("[data-player-history]")
        .forEach(button => {
            button.onclick = () => openPlayerHistoryModal(
                button.dataset.playerHistory
            );
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

                if (!requireOnlineAdmin()) return;

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

    document
        .getElementById("resetSeason")
        ?.addEventListener("click", resetSeason);

    document
        .getElementById("resetTotal")
        ?.addEventListener("click", resetTotal);
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

                if (!requireOnlineAdmin()) {
                    render();
                    return;
                }

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

    downloadBackup("multefc-backup");
    showToast("Backup esportato");

}

function downloadBackup(prefix) {

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
        `${prefix}-${new Date()
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

        if (!requireOnlineAdmin()) {
            event.target.value = "";
            return;
        }

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

function resetSeason() {
    if (!requireOnlineAdmin()) return;

    const confirmed = confirm(
        "Avviare una nuova stagione?\n\n" +
        "Saranno azzerate multe e pagamenti. Giocatori e Multario resteranno invariati."
    );

    if (!confirmed) return;

    downloadBackup("multefc-backup-prima-nuova-stagione");
    state = {
        ...state,
        fines: [],
        payments: {}
    };
    saveState();
    render();
    showToast("Nuova stagione avviata. Backup scaricato.");
}

function resetTotal() {
    if (!requireOnlineAdmin()) return;

    const code = prompt(
        "Operazione irreversibile. Verrà scaricato un backup automatico.\n\nDigita RESET per continuare:"
    );

    if (code !== "RESET") {
        showToast("Reset totale annullato.");
        return;
    }

    downloadBackup("multefc-backup-prima-reset-totale");
    state = structuredClone(defaultState);
    saveState();
    render();
    showToast("Reset totale eseguito. Backup scaricato.");
}

function resetData() {

    if (!requireOnlineAdmin()) return;

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

    downloadBackup("multefc-backup-prima-ripristino-demo");


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

            deviceTheme =
                deviceTheme === "dark"
                    ? "light"
                    : "dark";

            localStorage.setItem(THEME_STORAGE_KEY, deviceTheme);

            applyTheme();

        }
    );


/* =========================================================
   AVVIO
   ========================================================= */

render();
initializeCloud();
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
