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
  updateStimulusList(false);
  await drawStimulusToCanvas(key);
});

// Очистить выбор и холст
$btnClearStim?.addEventListener('click', async () => {
  if ($stimSelect) $stimSelect.value = '';
  updateStimulusList(false);
  await drawStimulusToCanvas('');
});

// Перерисовка при изменении размеров окна (для чёткости/адаптивности)
window.addEventListener('resize', () => {
  const key = $stimSelect?.value || '';
  if (key) drawStimulusToCanvas(key);
});
