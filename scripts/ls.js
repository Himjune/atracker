

// ---------- 3) localStorage ----------
function saveLocal(reason = '') {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(db));
        alertBox('success', `Сохранено в localStorage${reason ? ` (${reason})` : ''}.`);
    } catch (e) {
        alertBox('danger', e?.name === 'QuotaExceededError'
            ? 'Превышена квота Web Storage. Рассмотрите IndexedDB.'
            : `Ошибка сохранения: ${e.message || e}`);
    }
}
function loadLocal() {
    try {
        const raw = localStorage.getItem(LS_KEY); if (!raw) return alertBox('warning', 'В localStorage нет состояния.');
        const data = JSON.parse(raw); if (!isValidDbObject(data)) throw new Error('Повреждённый формат.');
        Object.keys(db).forEach(k => delete db[k]); Object.assign(db, data);
        renderDbPreview(); alertBox('info', 'Загружено из localStorage.');
    } catch (e) { alertBox('danger', `Не удалось загрузить: ${e.message || e}`); }
}
function clearLocal() {
    try { localStorage.removeItem(LS_KEY); alertBox('warning', 'Локальный кеш удалён.'); } catch (e) {
        alertBox('danger', `Ошибка очистки: ${e.message || e}`);
    }
}
window.addEventListener('storage', (ev) => {
    if (ev.key !== LS_KEY || typeof ev.newValue !== 'string') return;
    try {
        const data = JSON.parse(ev.newValue); if (isValidDbObject(data)) {
            Object.keys(db).forEach(k => delete db[k]); Object.assign(db, data);
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
        Object.keys(db).forEach(k => delete db[k]); Object.assign(db, data);
        renderDbPreview(); saveLocal('после импорта JSON'); alertBox('success', `Загружен <strong>${file.name}</strong>.`);
    } catch (e) { alertBox('danger', `Импорт JSON не удался: ${e.message || e}`); } finally { $btnImport.disabled = false; $jsonInput.value = ''; }
});

$btnExport.addEventListener('click', () => {
    try {
        const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url;
        a.download = `eyetrack-db-${timestampName()}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        saveLocal('после выгрузки'); alertBox('info', 'Файл JSON сформирован.');
    } catch (e) { alertBox('danger', `Выгрузка JSON не удалась: ${e.message || e}`); }
});