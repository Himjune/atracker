const EyeTrackerDB = (() => {
  const DB_NAME = "eyeTrackerAnalytics";
  const DB_VERSION = 2;
  const STORE_NAME = "sessions";
  const RECORDINGS_STORE = "recordings";

  let dbInstance;

  const openDatabase = () =>
    new Promise((resolve, reject) => {
      if (dbInstance) {
        resolve(dbInstance);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }

        if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
          const recordingsStore = db.createObjectStore(RECORDINGS_STORE, {
            keyPath: "recordedAt",
          });
          recordingsStore.createIndex("participantName", "participantName", {
            unique: false,
          });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        resolve(dbInstance);
      };

      request.onerror = () => reject(request.error);
    });

  const addSession = async (session) => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const data = {
        ...session,
        createdAt: session.createdAt || new Date().toISOString(),
      };

      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getSessions = async () => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const deleteSession = async (sessionId) => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(sessionId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const clearSessions = async () => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const addRecordings = async (recordings) => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDINGS_STORE, "readwrite");
      const store = tx.objectStore(RECORDINGS_STORE);

      recordings.forEach((record) => {
        store.put(record);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  };

  const getRecordings = async () => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDINGS_STORE, "readonly");
      const store = tx.objectStore(RECORDINGS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  return {
    openDatabase,
    addSession,
    getSessions,
    deleteSession,
    clearSessions,
    addRecordings,
    getRecordings,
  };
})();

window.eyeTrackerDB = EyeTrackerDB;
