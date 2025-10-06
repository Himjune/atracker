
// ---------- 5) XLSX → recordInfos ----------
$btnImportXlsx.addEventListener('click', () => $xlsxInput.click());

$xlsxInput.addEventListener('change', async () => {
    if (!$xlsxInput.files?.[0]) return;
    const file = $xlsxInput.files[0];

    // локальные хелперы
    const pad2 = n => String(n).padStart(2, '0');
    const fmtLocal = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    const toDate = (v) => {
        if (v instanceof Date && !isNaN(v)) return v;
        if (typeof v === 'number') {
            const o = XLSX.SSF.parse_date_code(v); // Excel serial → дата/время
            return o ? new Date(o.y, o.m - 1, o.d, o.H || 0, o.M || 0, o.S || 0) : null;
        }
        if (typeof v === 'string') { const d = new Date(v); return isNaN(d) ? null : d; }
        return null;
    };

    try {
        $btnImportXlsx.disabled = true;
        const buf = await file.arrayBuffer();

        // ПАСС 1: читаем только заголовки (строка 1), чтобы не триггерить гигантский !ref
        const wbHdr = XLSX.read(buf, { type: 'array', cellDates: true, sheetRows: 1 });
        const wsHdr = wbHdr.Sheets[wbHdr.SheetNames[0]];
        if (!wsHdr) throw new Error('В книге отсутствуют листы.');

        const headerRow = (XLSX.utils.sheet_to_json(wsHdr, { header: 1, blankrows: false })[0] || []).map(String);
        const missing = [COL.exp, COL.img, COL.fio, COL.code, COL.dt].filter(h => !headerRow.includes(h));
        if (missing.length) throw new Error('Отсутствуют обязательные колонки: ' + missing.join(', '));

        // ПАСС 2: читаем данные с ограничением по числу строк (устойчиво к раздутому Used Range)
        // при необходимости поднимите лимит
        const ROW_CAP = 200000;
        const wb = XLSX.read(buf, { type: 'array', cellDates: true, dense: true, sheetRows: ROW_CAP });
        const ws = wb.Sheets[wb.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(ws, {
            defval: null,
            raw: false,
            blankrows: false // пропуск пустых строк
        });

        let inserted = 0, overwritten = 0, skipped = 0;
        for (const r of rows) {
            const dstr = (r[COL.dt]).trim();
            //const d = toDate(dstr);
            //if (!d) { skipped++; continue; }
            const key = dstr;
            const rec = {
                experiment: r[COL.exp] ?? null,
                image: r[COL.img] ?? null,
                fullName: r[COL.fio] ?? null,
                participantCode: r[COL.code] ?? null,
                dateTime: dstr
            };
            if (Object.prototype.hasOwnProperty.call(db.recordInfos, key)) overwritten++; else inserted++;
            db.recordInfos[key] = rec; // перезапись по совпадающему «Дата и время»
        }

        renderDbPreview();
        saveLocal('после импорта XLSX');
        alertBox('success', `Импорт XLSX: добавлено ${inserted}, перезаписано ${overwritten}, пропущено (без даты/времени) ${skipped}.`);
    } catch (e) {
        // диагностическое сообщение по характерной ошибке массивов
        const msg = (e && /Invalid array length|string length/i.test(String(e))) ?
            'Лист Excel имеет «раздутый» используемый диапазон (миллионы строк/столбцов). Ограничил чтение. Если данных больше лимита — увеличьте ROW_CAP или очистите Used Range в Excel.' :
            (e?.message || String(e));
        alertBox('danger', `Не удалось загрузить XLSX: ${msg}`);
        console.error(e);
    } finally {
        $btnImportXlsx.disabled = false;
        $xlsxInput.value = '';
    }
});