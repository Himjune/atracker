// Подгоняет внутренние пиксели канваса под CSS-размер 16:9 и DPR
function ensureCanvasResolution16x9() {
  if (!$stimCanvas) return;
  const dpr  = window.devicePixelRatio || 1; // физ./CSS пиксели :contentReference[oaicite:2]{index=2}
  const cssW = $stimCanvas.clientWidth || ($stimCanvas.parentElement?.clientWidth ?? 600);
  const cssH = Math.round(cssW * 9 / 16);

  // На случай старых движков: явно установить CSS-высоту (aspect-ratio уже делает это, но это безопасный дубль)
  $stimCanvas.style.height = cssH + 'px';

  // Настраиваем внутреннюю bitmap-матрицу канваса под DPR
  $stimCanvas.width  = Math.max(1, Math.round(cssW * dpr));
  $stimCanvas.height = Math.max(1, Math.round(cssH * dpr));

  const ctx = $stimCanvas.getContext('2d');
  // Единичные координаты теперь в CSS-пикселях
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true; // аккуратное масштабирование
}

// ЗАМЕНА drawStimulusToCanvas (использует уже существующий stimulusToDataURL)
async function drawStimulusToCanvas(key) {
  const ctx = $stimCanvas.getContext('2d');

  // Размерим канвас под текущую ширину контейнера и DPR
  ensureCanvasResolution16x9();

  const dpr = window.devicePixelRatio || 1;
  const cw  = $stimCanvas.width  / dpr; // CSS-пиксели
  const ch  = $stimCanvas.height / dpr;

  // Если нет выбора — просто очистим
  const url = key ? stimulusToDataURL(key) : null;
  if (!url) {
    ctx.clearRect(0, 0, cw, ch);
    return;
  }

  const img = new Image();
  img.decoding = 'async';        // декодировать асинхронно :contentReference[oaicite:3]{index=3}
  img.src = url;
  await img.decode().catch(() => {}); // безопасное ожидание декодирования :contentReference[oaicite:4]{index=4}

  // Масштабирование с сохранением пропорций под 16:9-ящик (contain)
  const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
  const dw = Math.round(img.naturalWidth  * scale);
  const dh = Math.round(img.naturalHeight * scale);
  const dx = Math.floor((cw - dw) / 2);
  const dy = Math.floor((ch - dh) / 2);

  // Чистый фон и отрисовка
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh); // Canvas 2D API :contentReference[oaicite:5]{index=5}
}




// Открыть диалог выбора
$btnImportStim.addEventListener('click', () => $stimInput.click());

// Обработка выбранного изображения
$stimInput.addEventListener('change', async () => {
  if (!$stimInput.files || !$stimInput.files.length) return;
  let inserted = 0, overwritten = 0, failed = 0;

  try {
    $btnImportStim.disabled = true;

    // В текущей версии предполагаем один файл (при необходимости можно добавить multiple в <input>)
    const file = $stimInput.files[0];
    if (!file.type || !file.type.startsWith('image/')) {
      throw new Error('Выбран не графический файл.');
    }

    // 1) читаем как data:URL, 2) извлекаем MIME и base64
    const dataURL = await readAsDataURL(file);
    const { mime, base64 } = extractBase64AndMime(dataURL);

    // Гарантируем, что раздел существует
    if (!db.stimulus || typeof db.stimulus !== 'object') db.stimulus = {};

    const key = file.name; // ключ = имя файла (без путей)
    const existed = Object.prototype.hasOwnProperty.call(db.stimulus, key);

    // Минимальный формат хранения (дополните метаданными при желании)
    db.stimulus[key] = {
      mime,           // например, "image/png"
      dataBase64: base64,
      sizeBytes: file.size,
      updatedAt: new Date().toISOString()
    };

    existed ? overwritten++ : inserted++;

    // Обновляем визуализацию и (опционально) сохраняем локально
    if (typeof renderDbPreview === 'function') renderDbPreview();
    if (typeof saveLocal === 'function')       saveLocal('после импорта стимула');

    if (typeof alertBox === 'function') {
      alertBox('success', `Стимул «${key}» ${existed ? 'перезаписан' : 'добавлен'} в db.stimulus.`);
    }
  } catch (e) {
    failed++;
    if (typeof alertBox === 'function') {
      alertBox('danger', `Не удалось загрузить стимул: ${e.message || e}`);
    }
  } finally {
    $btnImportStim.disabled = false;
    $stimInput.value = '';
  }
});


// Выбор элемента в выпадающем списке → показать на canvas
$stimSelect?.addEventListener('change', async () => {
  const key = $stimSelect.value || '';
  updateStimulusList(true);
  await drawStimulusToCanvas(key);
});

// Очистить выбор и холст
$btnClearStim?.addEventListener('click', async () => {
  if ($stimSelect) $stimSelect.value = '';
  updateStimulusList(false);
  await drawStimulusToCanvas('');
});

// Перерисовываем при любом изменении размеров канваса/контейнера
/*const stimResizeObserver = new ResizeObserver(() => {
  ensureCanvasResolution16x9();
  const key = $stimSelect?.value || '';
  if (key) drawStimulusToCanvas(key);
});
stimResizeObserver.observe($stimCanvas); // можно наблюдать и родительский блок
*/

// После первоначального рендера интерфейса:
ensureCanvasResolution16x9();
updateStimulusList?.(true);     // если у вас уже есть эта функция
// если уже выбран стимул — перерисуем
if ($stimSelect?.value) drawStimulusToCanvas($stimSelect.value);


// На всякий случай — при ресайзе окна
window.addEventListener('resize', () => {
  ensureCanvasResolution16x9();
  const key = $stimSelect?.value || '';
  if (key) drawStimulusToCanvas(key);
});

