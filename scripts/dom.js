// ---------- 2) DOM-хелперы ----------
const $ = (id) => document.getElementById(id);
const $alerts = $('alerts'), $dbPreview = $('dbPreview');
const $btnImport = $('btnImport'), $btnExport = $('btnExport');
const $btnSaveLoc = $('btnSaveLocal'), $btnLoadLoc = $('btnLoadLocal'), $btnClear = $('btnClearLocal');
const $jsonInput = $('jsonFileInput');
const $btnImportXlsx = $('btnImportXlsx'), $xlsxInput = $('xlsxFileInput');

// --- DOM-элементы счётчиков ---
const $cntRI = document.getElementById('cntRecordInfos');
const $cntStim = document.getElementById('cntStimulus');
const $cntRec = document.getElementById('cntRecords');
const $cntTotal = document.getElementById('cntTotal');

// --- Подсчёт собственных перечислимых свойств ---
const countOwn = (o) => (o && typeof o === 'object') ? Object.keys(o).length : 0;

// --- Обновление UI счётчиков ---
function updateCounters() {
    const nRI = countOwn(db.recordInfos);
    const nStim = countOwn(db.stimulus);
    const nRec = countOwn(db.records);
    const sum = nRI + nStim + nRec;

    if ($cntRI) $cntRI.textContent = `infos: ${nRI}`;
    if ($cntStim) $cntStim.textContent = `stimulus: ${nStim}`;
    if ($cntRec) $cntRec.textContent = `records: ${nRec}`;
    if ($cntTotal) $cntTotal.textContent = `Σ: ${sum}`;
}

const alertBox = (kind, msg) => {
    const id = 'a' + Math.random().toString(36).slice(2);
    $alerts.insertAdjacentHTML('afterbegin',
        `<div id="${id}" class="alert alert-${kind} alert-dismissible fade show" role="alert">
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`);
    setTimeout(() => { const el = document.getElementById(id); el && bootstrap.Alert.getOrCreateInstance(el).close(); }, 6000);
};

function renderDbPreview() {
    $dbPreview.textContent = JSON.stringify(db, null, 2);
    updateCounters(); // <-- так счётчик обновится при любом изменении db
}


const isValidDbObject = (o) => o && typeof o === 'object' &&
    ['recordInfos', 'stimulus', 'records'].every(k => Object.prototype.hasOwnProperty.call(o, k) &&
        o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]));

const readFileAsText = (file) => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result); fr.onerror = () => rej(fr.error || new Error('Ошибка чтения')); fr.readAsText(file, 'utf-8');
});