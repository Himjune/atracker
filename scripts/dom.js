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
    updateStimulusList(true);    // ← поддерживаем список стимулов в UI
}


const isValidDbObject = (o) => o && typeof o === 'object' &&
    ['recordInfos', 'stimulus', 'records'].every(k => Object.prototype.hasOwnProperty.call(o, k) &&
        o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]));

const readFileAsText = (file) => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result); fr.onerror = () => rej(fr.error || new Error('Ошибка чтения')); fr.readAsText(file, 'utf-8');
});


// IMAGE LOAD
// DOM
const $btnImportStim = document.getElementById('btnImportStim');
const $stimInput     = document.getElementById('stimFileInput');

// Чтение файла как data:URL (base64 внутри)
function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload  = () => resolve(fr.result);
    fr.onerror = () => reject(fr.error || new Error('Ошибка чтения файла изображения'));
    fr.readAsDataURL(file); // -> "data:<mime>;base64,<payload>"
  });
}

// Выделение MIME и base64 из data:URL
function extractBase64AndMime(dataURL) {
  const m = String(dataURL).match(/^data:([^;,]+);base64,(.+)$/);
  if (!m) throw new Error('Неверный формат data:URL');
  return { mime: m[1], base64: m[2] };
}


// IMAGE SHOW
// DOM-узлы области стимула
const $stimSelect  = document.getElementById('stimSelect');
const $btnClearStim= document.getElementById('btnClearStim');
const $stimCanvas  = document.getElementById('stimCanvas');
const $stimMeta    = document.getElementById('stimMeta');

// Сервис: список ключей стимулов (отсортирован)
function getStimulusKeys() {
  return (db && db.stimulus && typeof db.stimulus === 'object')
    ? Object.keys(db.stimulus).sort((a,b)=>a.localeCompare(b,'ru'))
    : [];
}

// Сервис: человекочитаемый размер
function fmtBytes(n) {
  if (!(n > 0)) return '0 B';
  const k = 1024, units = ['B','KiB','MiB','GiB','TiB'];
  const i = Math.floor(Math.log(n)/Math.log(k));
  return `${(n/Math.pow(k,i)).toFixed(1)} ${units[i]}`;
}

// Сервис: построить data:URL из хранимого объекта
function stimulusToDataURL(key) {
  const s = db.stimulus?.[key];
  if (!s || !s.dataBase64 || !s.mime) return null;
  return `data:${s.mime};base64,${s.dataBase64}`;
}

// Отрисовка изображения в canvas (режим contain + HiDPI)
async function drawStimulusToCanvas(key) {
  const url = stimulusToDataURL(key);
  const ctx = $stimCanvas.getContext('2d');
  if (!url) {
    // очистить холст
    $stimCanvas.width = 0; $stimCanvas.height = 0;
    ctx.clearRect(0,0,$stimCanvas.width,$stimCanvas.height);
    return;
  }

  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode().catch(()=>{}); // мягко игнорируем ошибки декодирования

  // размеры контейнера (CSS-пиксели)
  const maxW = $stimCanvas.clientWidth || $stimCanvas.parentElement.clientWidth || 600;
  const maxH = Math.max(200, Math.min(window.innerHeight * 0.6, 800)); // ограничим высоту области просмотра

  const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
  const dispW = Math.round(img.naturalWidth  * scale);
  const dispH = Math.round(img.naturalHeight * scale);

  const dpr = window.devicePixelRatio || 1;
  $stimCanvas.width  = Math.max(1, Math.round(dispW * dpr));
  $stimCanvas.height = Math.max(1, Math.round(dispH * dpr));
  $stimCanvas.style.width  = dispW + 'px';
  $stimCanvas.style.height = dispH + 'px';

  // рисуем с учётом DPR
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, dispW, dispH);
  ctx.drawImage(img, 0, 0, dispW, dispH);
}

// Обновление выпадающего списка + метаданных
function updateStimulusList(preserveSelection = true) {
  if (!$stimSelect) return;
  const prev = preserveSelection ? $stimSelect.value : '';
  const keys = getStimulusKeys();

  // пересобираем <select>
  $stimSelect.innerHTML = '<option value="">— выберите файл —</option>' +
    keys.map(k => `<option value="${k}">${k}</option>`).join('');

  // восстановить выбор, если возможен
  if (prev && keys.includes(prev)) $stimSelect.value = prev;

  // обновить метаданные
  const k = $stimSelect.value;
  if (k) {
    const s = db.stimulus[k];
    $stimMeta.innerHTML =
      `Выбран: <code>${k}</code> · ${s?.mime || '—'} · ${fmtBytes(s?.sizeBytes||0)}`
      + (s?.width && s?.height ? ` · ${s.width}×${s.height}px` : '')
      + (s?.updatedAt ? ` · обновлён: ${new Date(s.updatedAt).toLocaleString()}` : '');
  } else {
    $stimMeta.textContent = 'Нет выбранного стимула.';
  }
}
