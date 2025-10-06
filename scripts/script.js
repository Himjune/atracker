// ---------- 1) Состояние и константы ----------
const LS_KEY = 'eyetrack-db-v1';
const DEFAULT_DB = () => ({ recordInfos: {}, stimulus: {}, records: {} });
const db = DEFAULT_DB(); window.db = db;

// Имена колонок XLSX (должны совпадать с заголовками 1-й строки листа)
const COL = {
    exp: 'Эксперимент',
    img: 'Картинка',
    fio: 'ФИО',
    code: 'Имя участника',
    dt: 'Дата и время'
};
const REQUIRED_COLUMNS = Object.values(COL);
