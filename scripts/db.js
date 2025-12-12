const EyeTrackerDB = (() => {
  const DB_NAME = "eyeTrackerAnalytics";
  const DB_VERSION = 10;
  const STORE_NAME = "sessions";
  const RECORDINGS_STORE = "recordings";
  const STIMULI_STORE = "stimuli";
  const VALIDITY_THRESHOLD = 50;
  const PUPIL_MIN_MM = 2;
  const PUPIL_MAX_MM = 8;

  let dbInstance;

  const isPointInvalid = (raw = {}) => {
    const validity = Number(raw.validity);
    const pupilLeft = Number(raw.pupilLeftMm);
    const pupilRight = Number(raw.pupilRightMm);
    const badValidity =
      Number.isFinite(validity) && validity < VALIDITY_THRESHOLD;
    const badPupil = [pupilLeft, pupilRight].some(
      (value) =>
        Number.isFinite(value) && (value < PUPIL_MIN_MM || value > PUPIL_MAX_MM)
    );
    return Boolean(badValidity || badPupil);
  };

  const ensurePointWithRaw = (point = {}) => {
    if (point && typeof point === "object" && !Array.isArray(point)) {
      const raw =
        point.raw && typeof point.raw === "object"
          ? { ...point.raw }
          : { ...point };
      delete raw.raw;
      delete raw.interpolated;
      delete raw.smooth;
      raw.pupilAvg = window.eyeTrackerUtils?.computePupilAvg(
        raw.pupilLeftMm,
        raw.pupilRightMm
      );
      const isInvalid =
        raw.isInvalid === true || raw.isInvalid === false
          ? raw.isInvalid
          : isPointInvalid(raw);
      const normalized = { raw: { ...raw, isInvalid } };
      if (point.interpolated && typeof point.interpolated === "object") {
        const interpolated = { ...point.interpolated };
        delete interpolated.raw;
        normalized.interpolated = interpolated;
      }
      if (point.smooth && typeof point.smooth === "object") {
        const smooth = { ...point.smooth };
        delete smooth.raw;
        delete smooth.interpolated;
        normalized.smooth = smooth;
      }
      return normalized;
    }
    return { raw: { isInvalid: isPointInvalid({}) } };
  };

  const extractRawPoints = (session = {}) => {
    if (Array.isArray(session.points)) {
      return session.points;
    }
    if (Array.isArray(session.points?.raw)) {
      return session.points.raw;
    }
    if (Array.isArray(session.raw?.points)) {
      return session.raw.points;
    }
    return [];
  };

  const normalizeSessionForStorage = (session = {}) => {
    const points = extractRawPoints(session).map((pt) => ensurePointWithRaw(pt));
    const rawInvalidCount =
      Number.isFinite(session.rawInvalidCount) && session.rawInvalidCount >= 0
        ? session.rawInvalidCount
        : points.filter((pt) => pt?.raw?.isInvalid).length;
    const rawPointsCount =
      Number.isFinite(session.rawPointsCount) && session.rawPointsCount >= 0
        ? session.rawPointsCount
        : points.length;

    const payload = {
      ...session,
      points,
      rawPointsCount,
      rawInvalidCount,
    };
    delete payload.raw;
    return payload;
  };

  const normalizeSessionFromDb = (session = {}) => {
    const points = extractRawPoints(session).map((pt) => ensurePointWithRaw(pt));
    const rawInvalidCount =
      Number.isFinite(session.rawInvalidCount) && session.rawInvalidCount >= 0
        ? session.rawInvalidCount
        : points.filter((pt) => pt?.raw?.isInvalid).length;
    const rawPointsCount =
      Number.isFinite(session.rawPointsCount) && session.rawPointsCount >= 0
        ? session.rawPointsCount
        : points.length;
    const normalized = {
      ...session,
      points,
      rawPointsCount,
      rawInvalidCount,
    };
    delete normalized.raw;
    return normalized;
  };

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

        if (event.oldVersion < 10) {
          const migrateSessions = sessionStore.getAll();
          migrateSessions.onsuccess = () => {
            (migrateSessions.result || []).forEach((session) => {
              const updated = normalizeSessionForStorage(session);
              updated.id = session.id;
              sessionStore.put(updated);
            });
          };
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
      const data = normalizeSessionForStorage({
        ...session,
        createdAt: session.createdAt || new Date().toISOString(),
      });

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

      request.onsuccess = () =>
        resolve((request.result || []).map((session) => normalizeSessionFromDb(session)));
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
