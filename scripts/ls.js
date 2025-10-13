// Переопределение: теперь это снимок/восстановление через IndexedDB
async function saveLocal(reason = '') {
  await idbImportDbObject(db); // «снимок» текущего in-memory состояния в IndexedDB
  alertBox?.('success', `Сохранено в IndexedDB${reason ? ` (${reason})` : ''}.`);
}

async function loadLocal() {
  const snap = await idbExportToDbObject();
  // заменить текущее состояние db снимком из IndexedDB
  Object.keys(db).forEach(k => delete db[k]);
  db.recordInfos = snap.recordInfos || {};
  db.stimulus    = snap.stimulus    || {};
  db.records     = snap.records     || {};
  renderDbPreview?.();
  alertBox?.('info', 'Загружено из IndexedDB.');
}

async function clearLocal() {
  await idbClearAll();
  Object.keys(db).forEach(k => delete db[k]);
  db.recordInfos = {}; db.stimulus = {}; db.records = {};
  renderDbPreview?.();
  alertBox?.('warning', 'IndexedDB очищена.');
}



window.addEventListener('storage', (ev) => {
    if (ev.key !== LS_KEY || typeof ev.newValue !== 'string') return;
    try {
        const data = JSON.parse(ev.newValue); if (isValidDbObject(data)) {
            //Object.keys(db).forEach(k => delete db[k]); Object.assign(db, data);
            
            renderDbPreview(); alertBox('info', 'Обновлено из другой вкладки.');
        }
    } catch { }
});

// ---------- 4) JSON импорт/экспорт ----------
function timestampName() {
    const p = n => String(n).padStart(2, '0'); const d = new Date();
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

$btnImport.addEventListener('click', () => $jsonInput.click());
$jsonInput.addEventListener('change', async () => {
    if (!$jsonInput.files?.[0]) return; const file = $jsonInput.files[0];
    try {
        $btnImport.disabled = true; const text = await readFileAsText(file); const data = JSON.parse(text);
        if (!isValidDbObject(data)) throw new Error('Ожидается {recordInfos:{}, stimulus:{}, records:{}}.');

                // ...после проверки isValidDbObject(data)...
        await idbImportDbObject(data); // записываем в IndexedDB
        await loadLocal();             // обновляем in-memory db + превью/счётчики
        alertBox('success', `Данные импортированы в IndexedDB и загружены в приложение.`);

        renderDbPreview(); saveLocal('после импорта JSON'); alertBox('success', `Загружен <strong>${file.name}</strong>.`);
    } catch (e) { alertBox('danger', `Импорт JSON не удался: ${e.message || e}`); } finally { $btnImport.disabled = false; $jsonInput.value = ''; }
});

$btnExport.addEventListener('click', async () => {
  try {
    const snapshot = await idbExportToDbObject(); // ← берём актуальные данные из IndexedDB
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `eyetrack-db-${timestampName()}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    alertBox('info', 'Снимок IndexedDB выгружен как JSON.');
  } catch (err) {
    alertBox('danger', `Ошибка при выгрузке: ${err.message || err}`);
  }
});
