/** ===================== IndexedDB thin wrapper ===================== **/
const IDB_CFG = { name: 'eyetrack-idb', version: 1, stores: ['recordInfos', 'stimulus', 'records'] };

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_CFG.name, IDB_CFG.version);
    req.onupgradeneeded = () => {
      const db = req.result;
      // по ключу-строке, как и в памяти: recordInfos[dateKey], stimulus[fileName], records[dateKey]
      IDB_CFG.stores.forEach(s => {
        if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'key' });
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function idbTx(db, mode, stores) {
  return db.transaction(stores, mode);
}
function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () => reject(tx.error || new Error('IDB transaction failed'));
  });
}

async function idbClearAll() {
  const db = await idbOpen();
  const tx = idbTx(db, 'readwrite', IDB_CFG.stores);
  IDB_CFG.stores.forEach(s => tx.objectStore(s).clear());
  await txDone(tx);
}

async function idbPut(store, key, value) {
  const db = await idbOpen();
  const tx = idbTx(db, 'readwrite', [store]);
  tx.objectStore(store).put({ key, value }); // put = upsert (insert/update) :contentReference[oaicite:1]{index=1}
  await txDone(tx);
}

async function idbBulkPut(store, entries /* [ [key, value], ... ] */) {
  if (!entries.length) return;
  const db = await idbOpen();
  const tx = idbTx(db, 'readwrite', [store]);
  const os = tx.objectStore(store);
  for (const [key, value] of entries) os.put({ key, value });
  await txDone(tx);
}

async function idbGetAllAsObject(store) {
  const db = await idbOpen();
  const tx = idbTx(db, 'readonly', [store]);
  const os = tx.objectStore(store);
  const req = os.getAll(); // вернёт массив {key, value} (structured clone) :contentReference[oaicite:2]{index=2}
  const rows = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = () => reject(req.error);
  });
  const out = {};
  for (const row of rows) out[row.key] = row.value;
  await txDone(tx);
  return out;
}

async function idbCount(store) {
  const db = await idbOpen();
  const tx = idbTx(db, 'readonly', [store]);
  const req = tx.objectStore(store).count();
  const n = await new Promise((res, rej) => { req.onsuccess = () => res(req.result|0); req.onerror = () => rej(req.error); });
  await txDone(tx);
  return n;
}

async function idbExportToDbObject() {
  const [recordInfos, stimulus, records] = await Promise.all([
    idbGetAllAsObject('recordInfos'),
    idbGetAllAsObject('stimulus'),
    idbGetAllAsObject('records')
  ]);
  return { recordInfos, stimulus, records };
}

async function idbImportDbObject(obj) {
  const safe = (o) => (o && typeof o === 'object') ? o : {};
  const rInfos = Object.entries(safe(obj.recordInfos));
  const stims  = Object.entries(safe(obj.stimulus));
  const recs   = Object.entries(safe(obj.records));
  const db = await idbOpen();
  // можно писать параллельно по разным сторам в одном апгрейде, но транзакции — по сторам раздельно
  {
    const tx = idbTx(db, 'readwrite', ['recordInfos']);
    const os = tx.objectStore('recordInfos');
    for (const [k, v] of rInfos) os.put({ key: k, value: v });
    await txDone(tx);
  }
  {
    const tx = idbTx(db, 'readwrite', ['stimulus']);
    const os = tx.objectStore('stimulus');
    for (const [k, v] of stims) os.put({ key: k, value: v });
    await txDone(tx);
  }
  {
    const tx = idbTx(db, 'readwrite', ['records']);
    const os = tx.objectStore('records');
    for (const [k, v] of recs) os.put({ key: k, value: v });
    await txDone(tx);
  }
}

async function idbIsEmpty() {
  const counts = await Promise.all(IDB_CFG.stores.map(idbCount));
  return counts.every(n => n === 0);
}
/** ===================== end IndexedDB thin wrapper ===================== **/