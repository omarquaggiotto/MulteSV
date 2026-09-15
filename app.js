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


    /* =========================
       MESI STAGIONE
       ========================= */

    const seasonStartYear =
        Number(
            state.season?.slice(0, 4)
        ) ||
        new Date().getFullYear();


    const seasonMonths = [];


    // Agosto → Dicembre
    for (
        let monthIndex = 7;
        monthIndex <= 11;
        monthIndex++
    ) {

        const year =
            seasonStartYear;

        const monthNumber =
            String(monthIndex + 1)
                .padStart(2, "0");


        seasonMonths.push({

            id:
                `${year}-${monthNumber}`,

            label:
                `${monthNames[monthIndex]} ${year}`

        });

    }


    // Gennaio → Maggio
    for (
        let monthIndex = 0;
        monthIndex <= 4;
        monthIndex++
    ) {

        const year =
            seasonStartYear + 1;

        const monthNumber =
            String(monthIndex + 1)
                .padStart(2, "0");


        seasonMonths.push({

            id:
                `${year}-${monthNumber}`,

            label:
                `${monthNames[monthIndex]} ${year}`

        });

    }


    /* =========================
       FILTRO MULTE
       ========================= */

    let fines = allFines;


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
                        .map(renderFineRow)
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
                >
                    ＋ Aggiungi multa
                </button>

            </div>
        `;


    /* =========================
       OUTPUT
       ========================= */

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


        <!-- =========================
             SELETTORE MESE
             ========================= -->

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


        <!-- =========================
             RIEPILOGO
             ========================= -->

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


        <!-- =========================
             ELENCO
             ========================= -->

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
    .getElementById("monthSelector")
    ?.addEventListener("change", event => {

        selectedMonth =
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
