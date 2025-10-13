// --- CSV → records: утилиты ---

// Нормализация даты в локальном времени (ключ db): YYYY-MM-DD HH:mm:ss
function fmtKeyLocal(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Гибкий парсер строковой даты (ISO, RU dd.mm.yyyy[, ]HH:MM[:SS], dd/mm/yyyy и пр.)
function parseDateFlex(s) {
  if (!s) return null;
  const t = String(s).trim();

  // 1) Прямая попытка ISO/локально распознаваемых форматов
  const d1 = new Date(t);
  if (!isNaN(d1)) return d1;

  // 2) dd.mm.yyyy [HH:MM[:SS]]
  let m = t.match(/^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})(?:[ T,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    const [_, dd, mm, yyyy, HH='0', MM='0', SS='0'] = m;
    const Y = (+yyyy < 100 ? +yyyy + 2000 : +yyyy);
    const D = new Date(Y, +mm-1, +dd, +HH, +MM, +SS);
    if (!isNaN(D)) return D;
  }
  return null;
}

// Определение «строки-даты» серии: дата в первой ячейке и остальные пустые
function isSeriesDateRow(row) {
  if (!row || !row.length) return false;
  const d = parseDateFlex(row[0]);
  if (!d) return false;
  // считать «датой серии», если прочие ячейки пусты/пробелы
  const restFilled = row.slice(1).some(v => String(v ?? '').trim() !== '');
  return !restFilled;
}

// Маппинг индексов по заголовкам после строки-даты
function resolveHeaderIdx(row) {
  // нормализуем ячейки
  const cols = row.map(x => String(x ?? '').trim().toLowerCase());
  const idx = {
    time: cols.indexOf('time'),
    ok:   cols.findIndex(c => c === 'корректность' || c === 'correctness' || c === 'valid' || c === 'validity'),
    x:    cols.indexOf('x'),
    y:    cols.indexOf('y'),
    z:    cols.indexOf('z'),
    lp:   cols.indexOf('lp'),
    rp:   cols.indexOf('rp'),
  };
  // Минимум необходимы TIME, X, Y
  if (idx.time < 0 || idx.x < 0 || idx.y < 0) throw new Error('Не найдены обязательные колонки TIME/X/Y.');
  return idx;
}

// Чтение чисел с мягкой обработкой (пустые → null)
const fnum = v => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(',', '.'); // на случай десятичной запятой
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
};

// Интерпретация поля «Корректность» в boolean
function parseValidity(v) {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return null;
  return ['1','true','да','ok','y','yes','истина'].includes(s) ? true
       : ['0','false','нет','n','no','ложь'].includes(s)       ? false
       : null;
}

// Получить info по ключу даты или сделать заполнитель
function getInfoForKey(dateKey) {
  const info = db.recordInfos?.[dateKey];
  if (info && typeof info === 'object') return info;
  return {
    experiment: null,
    image: null,
    fullName: null,
    participantCode: null,
    dateTime: dateKey,
    placeholder: true
  };
}



// DOM
const $btnImportCsv = document.getElementById('btnImportCsv');
const $csvInput     = document.getElementById('csvFileInput');

$btnImportCsv.addEventListener('click', () => $csvInput.click());

$csvInput.addEventListener('change', () => {
  if (!$csvInput.files || !$csvInput.files[0]) return;
  const file = $csvInput.files[0];

  // Состояние парсера
  let state = 'await_date';        // 'await_date' -> 'await_header' -> 'consume_rows'
  let currentKey = null;           // ключ текущей серии (нормализованная дата)
  let headerIdx = null;            // индексы столбцов текущей серии
  let currentPoints = [];          // массив точек текущей серии

  // Статистика
  let seriesFound = 0, seriesInserted = 0, seriesOverwritten = 0, totalPoints = 0;

  // Финализировать текущую серию (если есть)
  function flushSeries() {
    if (!currentKey) return;
    const rec = {
      info: getInfoForKey(currentKey),
      points: currentPoints
    };
    const existed = Object.prototype.hasOwnProperty.call(db.records, currentKey);
    db.records[currentKey] = rec;
    existed ? seriesOverwritten++ : seriesInserted++;
    seriesFound++;
    totalPoints += currentPoints.length;

    // сброс
    currentKey = null;
    headerIdx = null;
    currentPoints = [];
    state = 'await_date';
  }

  // Запуск Papa Parse: потоковая обработка по строкам, autodetect delimiter
  Papa.parse(file, {
    worker: true,                 // web worker для больших файлов
    encoding: 'utf-8',
    delimiter: "",                // авто-детект (`,` / `;` и т.п.) :contentReference[oaicite:3]{index=3}
    skipEmptyLines: 'greedy',
    dynamicTyping: false,         // сами приводим к числам там, где нужно
    step: (results/*, parser*/) => {
      const row = results.data;
      // нормализуем к массиву строк
      const cells = Array.isArray(row) ? row : [row];

      if (state === 'await_date') {
        if (isSeriesDateRow(cells)) {
          const d = parseDateFlex(cells[0]);
          currentKey = fmtKeyLocal(d);
          state = 'await_header';
        }
        // иначе игнорируем мусорные строки до первой даты
        return;
      }

      if (state === 'await_header') {
        // ожидаем строку заголовков
        try {
          headerIdx = resolveHeaderIdx(cells);
          state = 'consume_rows';
        } catch {
          // строка не похожа на заголовок — пропускаем (иногда встречаются пустые/служебные строки)
        }
        return;
      }

      // state === 'consume_rows'
      // если встретили новую «дату серии» — закрываем текущую и начинаем следующую
      if (isSeriesDateRow(cells)) {
        flushSeries();
        const d = parseDateFlex(cells[0]);
        currentKey = fmtKeyLocal(d);
        state = 'await_header';
        return;
      }

      // иначе это строка данных; проверим наличие TIME и X/Y
      const t = fnum(cells[headerIdx.time]);
      const x = fnum(cells[headerIdx.x]);
      const y = fnum(cells[headerIdx.y]);

      // строка бессодержательна → игнор
      if (t === null && x === null && y === null) return;

      const z  = headerIdx.z  >= 0 ? fnum(cells[headerIdx.z])  : null;
      const lp = headerIdx.lp >= 0 ? fnum(cells[headerIdx.lp]) : null;
      const rp = headerIdx.rp >= 0 ? fnum(cells[headerIdx.rp]) : null;
      const valid = headerIdx.ok >= 0 ? parseValidity(cells[headerIdx.ok]) : null;

      currentPoints.push({ t, valid, x, y, z, lp, rp });
    },
    complete: () => {
      try {
        // финализируем последнюю серию
        flushSeries();

        // Обновить UI + сохранить локально
        if (typeof renderDbPreview === 'function') renderDbPreview();
        if (typeof saveLocal === 'function')       saveLocal('после импорта CSV');

        if (typeof alertBox === 'function') {
          alertBox('success',
            `CSV импорт завершён: серий найдено ${seriesFound}, ` +
            `добавлено ${seriesInserted}, перезаписано ${seriesOverwritten}, ` +
            `всего точек ${totalPoints}.`);
        }
      } finally {
        $csvInput.value = '';
      }
    },
    error: (err) => {
      if (typeof alertBox === 'function') {
        // типовая подсказка, если файл одноколоночный → авто-детект не сработал
        const hint = /Unable to auto-detect delimiting character/i.test(String(err?.message||'')) ?
          'Не удалось определить разделитель. Попробуйте экспортировать CSV с запятыми или точкой с запятой.' : '';
        alertBox('danger', `Ошибка парсинга CSV: ${err?.message || err}. ${hint}`);
      }
      $csvInput.value = '';
    }
  });
});
