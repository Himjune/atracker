const EyeTrackerDB = (() => {
  const DB_NAME = "eyeTrackerAnalytics";
  const DB_VERSION = 4;
  const STORE_NAME = "sessions";
  const RECORDINGS_STORE = "recordings";
  const STIMULI_STORE = "stimuli";

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
        let sessionStore;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          sessionStore = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          sessionStore.createIndex("createdAt", "createdAt", { unique: false });
          sessionStore.createIndex("sessionKey", "sessionKey", { unique: true });
        } else {
          sessionStore = request.transaction.objectStore(STORE_NAME);
          if (!sessionStore.indexNames.contains("sessionKey")) {
            sessionStore.createIndex("sessionKey", "sessionKey", { unique: true });
          }
          if (!sessionStore.indexNames.contains("createdAt")) {
            sessionStore.createIndex("createdAt", "createdAt", { unique: false });
          }
        }

        if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
          const recordingsStore = db.createObjectStore(RECORDINGS_STORE, {
            keyPath: "recordedAt",
          });
          recordingsStore.createIndex("participantName", "participantName", {
            unique: false,
          });
        }

        if (!db.objectStoreNames.contains(STIMULI_STORE)) {
          const stimuliStore = db.createObjectStore(STIMULI_STORE, {
            keyPath: "stimulusName",
          });
          stimuliStore.createIndex("uploadedAt", "uploadedAt", { unique: false });
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
      const sessionIndex = store.index("sessionKey");
      const data = {
        ...session,
        createdAt: session.createdAt || new Date().toISOString(),
      };

      const existingReq = sessionIndex.get(session.sessionKey);

      existingReq.onsuccess = () => {
        const existing = existingReq.result;
        const payload = existing ? { ...data, id: existing.id } : data;

        const request = store.put(payload);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      };

      existingReq.onerror = () => reject(existingReq.error);
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

  const addStimulusImage = async (stimulus) => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STIMULI_STORE, "readwrite");
      const store = tx.objectStore(STIMULI_STORE);
      const payload = {
        ...stimulus,
        uploadedAt: stimulus.uploadedAt || new Date().toISOString(),
      };
      const request = store.put(payload);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getStimulusImage = async (stimulusName) => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STIMULI_STORE, "readonly");
      const store = tx.objectStore(STIMULI_STORE);
      const request = store.get(stimulusName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getStimulusImages = async () => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STIMULI_STORE, "readonly");
      const store = tx.objectStore(STIMULI_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const clearStimulusImages = async () => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STIMULI_STORE, "readwrite");
      const store = tx.objectStore(STIMULI_STORE);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const clearRecordings = async () => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDINGS_STORE, "readwrite");
      const store = tx.objectStore(RECORDINGS_STORE);
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
    clearRecordings,
    addStimulusImage,
    getStimulusImage,
    getStimulusImages,
    clearStimulusImages,
  };
})();

window.eyeTrackerDB = EyeTrackerDB;
