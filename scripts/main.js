document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("dataFile");
  const uploadButton = document.getElementById("uploadButton");
  const statusElement = document.getElementById("uploadStatus");
  const metaFileInput = document.getElementById("metaFile");
  const metaUploadButton = document.getElementById("metaUploadButton");
  const metaStatusElement = document.getElementById("metaUploadStatus");
  const stimulusImageInput = document.getElementById("stimulusImage");
  const stimulusUploadButton = document.getElementById("stimulusUploadButton");
  const stimulusUploadStatus = document.getElementById("stimulusUploadStatus");
  const experimentFilter = document.getElementById("experimentFilter");
  const stimulusFilter = document.getElementById("stimulusFilter");
  const unmatchedOnlyCheckbox = document.getElementById("unmatchedOnly");
  const sessionListElement = document.getElementById("sessionList");
  const sessionCountElement = document.getElementById("sessionCount");
  const pupilSessionList = document.getElementById("pupilSessionList");
  const pupilChartCanvas = document.getElementById("pupilChart");
  const pupilSelectAllBtn = document.getElementById("pupilSelectAll");
  const pupilClearAllBtn = document.getElementById("pupilClearAll");
  const pupilStimulusFilter = document.getElementById("pupilStimulusFilter");
  const pupilParticipantFilter = document.getElementById(
    "pupilParticipantFilter"
  );
  const pupilParticipantSuggestions = document.getElementById(
    "pupilParticipantSuggestions"
  );
  const pupilParticipantClear = document.getElementById(
    "pupilParticipantClear"
  );
  const showLeftPupilCheckbox = document.getElementById("showLeftPupil");
  const showRightPupilCheckbox = document.getElementById("showRightPupil");
  const showAvgPupilCheckbox = document.getElementById("showAvgPupil");
  const includeInvalidPupilCheckbox = document.getElementById("includeInvalidPupil");
  const gazeCanvas = document.getElementById("gazeCanvas");
  const gazeColorMode = document.getElementById("gazeColorMode");
  const gazeStimulusStatus = document.getElementById("gazeStimulusStatus");
  const resetDbButton = document.getElementById("resetDbButton");
  const resetStatusElement = document.getElementById("resetStatus");
  const sectionNavLinks = Array.from(
    document.querySelectorAll("[data-scroll-target]")
  );
  const sectionAnchors = Array.from(
    document.querySelectorAll("[data-section-anchor]")
  );
  const sectionNavOffset = 140;
  let navSyncScheduled = false;
  const parserModule = window.eyeTrackerParser;
  const rendererModule = window.eyeTrackerRenderer;
  const utilsModule = window.eyeTrackerUtils;
  const validityThresholdInput = document.getElementById("validityThreshold");
  const pupilMinInput = document.getElementById("pupilMin");
  const pupilMaxInput = document.getElementById("pupilMax");
  const recomputePointsButton = document.getElementById("recomputePointsButton");
  const recomputeStatusElement = document.getElementById("recomputeStatus");

  let cachedRecordings = [];
  let cachedSessions = [];
  let cachedStimuliImages = [];
  const selectedPupilSessions = new Set();
  const pupilChartPadding = { left: 50, right: 20, top: 20, bottom: 40 };
  let pupilView = null;
  let pupilDataBounds = null;
  let pupilBaseView = null;
  let pupilUserAdjusted = false;
  let isPanning = false;
  let panStart = null;
  const stimulusImageCache = new Map();

  const getValidityThreshold = () => {
    const value = Math.round(Number(validityThresholdInput?.value));
    if (Number.isFinite(value)) {
      return Math.min(255, Math.max(0, value));
    }
    return 50;
  };

  const getPupilMin = () => {
    const value = Number(pupilMinInput?.value);
    if (Number.isFinite(value)) {
      return Math.max(0, value);
    }
    return 2;
  };

  const getPupilMax = () => {
    const value = Number(pupilMaxInput?.value);
    if (Number.isFinite(value)) {
      return Math.max(getPupilMin(), value);
    }
    return 8;
  };

  const computePupilAvg = (left, right) =>
    utilsModule?.computePupilAvg(left, right) ?? null;

  const getValidNeighbor = (points = [], idx = 0, direction = 1) => {
    for (let index = idx + direction; index >= 0 && index < points.length; index += direction) {
      const point = points[index];
      if (!point.isInvalid) return index;
    }
    return -1;
  }

  const computePointInvalid = (raw = {}) => {
    const threshold = getValidityThreshold();
    const validity = Number(raw.validity);
    const pupilLeft = Number(raw.pupilLeftMm);
    const pupilRight = Number(raw.pupilRightMm);
    const badValidity =
      Number.isFinite(validity) && validity < threshold;
    const badPupil = [pupilLeft, pupilRight].some(
      (value) =>
        Number.isFinite(value) &&
        (value < getPupilMin() || value > getPupilMax())
    );
    return Boolean(badValidity || badPupil);
  };

  const computeMedian = (values = []) => {
    const sorted = values
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
    if (sorted.length === 0) {
      return null;
    }
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  };

  const computeDilationMedians = (points = []) => {
    const leftValues = points.map((pt) => pt?.rawDilationSpeedLeft);
    const rightValues = points.map((pt) => pt?.rawDilationSpeedRight);
    return {
      left: computeMedian(leftValues),
      right: computeMedian(rightValues),
    };
  };

  const computeDilationSpeeds = (rawPoints = []) => {
    const safeSpeed = (currVal, currTime, otherVal, otherTime) => {
      if (
        !Number.isFinite(currVal) ||
        !Number.isFinite(currTime) ||
        !Number.isFinite(otherVal) ||
        !Number.isFinite(otherTime)
      ) {
        return 0;
      }
      const dt = Math.abs(currTime - otherTime);
      if (dt <= 0) {
        return 0;
      }
      return Math.abs(currVal - otherVal) / dt;
    };

    if (!Array.isArray(rawPoints) || rawPoints.length === 0) {
      return;
    }

    const len = rawPoints.length;

    for (let i = 0; i < len; i += 1) {
      const raw = rawPoints[i] || {};
      const t = Number(raw.timeOffsetMs);
      const leftVal = Number(raw.pupilLeftMm);
      const rightVal = Number(raw.pupilRightMm);
      const prevIdx = getValidNeighbor(rawPoints, i, -1);
      const nextIdx = getValidNeighbor(rawPoints, i, 1);
      
      if (i == 102) console.log(prevIdx, nextIdx, rawPoints[prevIdx], rawPoints[nextIdx], i)

      let leftSpeed = 0;
      if (Number.isFinite(leftVal) && Number.isFinite(t)) {
        const prevSpeed =
          prevIdx >= 0 
            ? safeSpeed(leftVal, t, rawPoints[prevIdx]?.pupilLeftMm, rawPoints[prevIdx]?.timeOffsetMs)
            : 0;
        const nextSpeed =
          nextIdx >= 0
            ? safeSpeed(rawPoints[nextIdx]?.pupilLeftMm, rawPoints[nextIdx]?.timeOffsetMs, leftVal, t)
            : 0;
        leftSpeed = Math.max(prevSpeed, nextSpeed);
      }

      let rightSpeed = 0;
      if (Number.isFinite(rightVal) && Number.isFinite(t)) {
        const prevSpeed =
          prevIdx >= 0
            ? safeSpeed(rightVal, t, rawPoints[prevIdx]?.pupilRightMm, rawPoints[prevIdx]?.timeOffsetMs)
            : 0;
        const nextSpeed =
          nextIdx >= 0
            ? safeSpeed(rawPoints[nextIdx]?.pupilRightMm, rawPoints[nextIdx]?.timeOffsetMs, rightVal, t)
            : 0;
        rightSpeed = Math.max(prevSpeed, nextSpeed);
      if (i == 102) console.log(leftSpeed, rightSpeed, prevSpeed, nextSpeed)
      }


      raw.rawDilationSpeedLeft = leftSpeed;
      raw.rawDilationSpeedRight = rightSpeed;
    }

    const medians = computeDilationMedians(rawPoints);
    if (medians) {
      rawPoints.forEach((raw) => {
        const left = Number(raw.rawDilationSpeedLeft);
        const right = Number(raw.rawDilationSpeedRight);
        raw.rawDilationSpeedLeftMedianDiff =
          Number.isFinite(left) && Number.isFinite(medians.left)
            ? Math.abs(left - medians.left)
            : null;
        raw.rawDilationSpeedRightMedianDiff =
          Number.isFinite(right) && Number.isFinite(medians.right)
            ? Math.abs(right - medians.right)
            : null;
      });
    }

    const leftMad = computeMedian(
      rawPoints.map((pt) => pt?.rawDilationSpeedLeftMedianDiff)
    );
    const rightMad = computeMedian(
      rawPoints.map((pt) => pt?.rawDilationSpeedRightMedianDiff)
    );

    return {
      leftMedian: medians.left,
      rightMedian: medians.right,
      leftMad,
      rightMad,
    };
  };

  const buildRecordingKey = (dateKey, stimulusName) => {
    const datePart = String(dateKey || "").trim();
    const stimPart = String(stimulusName || "").trim();
    return [datePart, stimPart].filter(Boolean).join(" | ");
  };

  const buildSessionKey = (dateKey, sourceFile) => {
    const datePart = String(dateKey || "").trim();
    const filePart = String(sourceFile || "").trim();
    return [datePart, filePart].filter(Boolean).join(" | ");
  };

  const extractStimulusFromFileName = (fileName) => {
    if (!fileName) {
      return "";
    }
    const name = fileName.split("/").pop() || fileName;
    const withoutExt = name.replace(/\.[^.]+$/, "");
    const parts = withoutExt.split("_");
    return (parts[1] || "").trim();
  };

  const buildRecordingsMap = (records = cachedRecordings) =>
    new Map(
      (records || []).map((item) => {
        const key = buildRecordingKey(
          item.recordedAtDate || item.recordedAt,
          item.stimulusName
        );
        return [key, item];
      })
    );

  const getSessionPoints = (session) => {
    const normalizePointRaw = (pt) => {
      if (pt && typeof pt === "object" && pt.raw && typeof pt.raw === "object") {
        const raw = { ...pt.raw };
        raw.pupilAvg = computePupilAvg(raw.pupilLeftMm, raw.pupilRightMm);
        raw.isInvalid = computePointInvalid(raw);
        return raw;
      }
      if (pt && typeof pt === "object") {
        const raw = { ...pt };
        raw.pupilAvg = computePupilAvg(raw.pupilLeftMm, raw.pupilRightMm);
        raw.isInvalid = computePointInvalid(raw);
        return raw;
      }
      return { pupilAvg: computePupilAvg(undefined, undefined), isInvalid: computePointInvalid({}) };
    };

    if (Array.isArray(session?.points)) {
      const rawPoints = session.points.map(normalizePointRaw);
      const medians = computeDilationSpeeds(rawPoints);
      if (medians) {
        session.rawDilationSpeedLeftMedian = medians.leftMedian;
        session.rawDilationSpeedRightMedian = medians.rightMedian;
        session.rawDilationSpeedLeftMAD = medians.leftMad;
        session.rawDilationSpeedRightMAD = medians.rightMad;
      }
      return rawPoints;
    }
    /*if (Array.isArray(session?.points?.raw)) {
      const rawPoints = session.points.raw.map(normalizePointRaw);
      computeDilationSpeeds(rawPoints);
      return rawPoints;
    }
    if (Array.isArray(session?.raw?.points)) {
      const rawPoints = session.raw.points.map(normalizePointRaw);
      computeDilationSpeeds(rawPoints);
      return rawPoints;
    }*/
    return [];
  };

  const getSelectedSessions = (sessions = []) =>
    (sessions || []).filter((session) =>
      selectedPupilSessions.has(session.sessionKey)
    );

  const getStimulusImageRecord = (stimulusName) =>
    (cachedStimuliImages || []).find(
      (item) =>
        (item.stimulusName || "").trim() === (stimulusName || "").trim()
    );

  const loadStimulusImage = (stimulusName) => {
    const cleanName = (stimulusName || "").trim();
    if (!cleanName) {
      return Promise.resolve(null);
    }

    if (stimulusImageCache.has(cleanName)) {
      return stimulusImageCache.get(cleanName);
    }

    const record = getStimulusImageRecord(cleanName);
    if (!record || !record.imageBase64) {
      const missing = Promise.resolve(null);
      stimulusImageCache.set(cleanName, missing);
      return missing;
    }

    const loader = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = record.imageBase64;
    });

    stimulusImageCache.set(cleanName, loader);
    return loader;
  };

  const expandBounds = (bounds, factor = 0.05) => {
    if (!bounds) {
      return null;
    }
    const xRange = bounds.xMax - bounds.xMin || 1;
    const yRange = bounds.yMax - bounds.yMin || 1;
    const padX = xRange * factor;
    const padY = yRange * factor;
    return {
      xMin: bounds.xMin - padX,
      xMax: bounds.xMax + padX,
      yMin: bounds.yMin - padY,
      yMax: bounds.yMax + padY,
    };
  };

  const clampViewToBounds = (view, bounds) => {
    if (!view || !bounds) {
      return view;
    }
    const limit = pupilBaseView || expandBounds(bounds, 0.05) || bounds;
    const limitRangeX = (limit.xMax || 0) - (limit.xMin || 0) || 1;
    const limitRangeY = (limit.yMax || 0) - (limit.yMin || 0) || 1;
    let rangeX = view.xMax - view.xMin;
    let rangeY = view.yMax - view.yMin;
    if (rangeX > limitRangeX) {
      rangeX = limitRangeX;
      view.xMin = limit.xMin;
      view.xMax = limit.xMax;
    }
    if (rangeY > limitRangeY) {
      rangeY = limitRangeY;
      view.yMin = limit.yMin;
      view.yMax = limit.yMax;
    }
    let xMin = view.xMin;
    let xMax = view.xMax;
    let yMin = view.yMin;
    let yMax = view.yMax;

    if (xMin < limit.xMin) {
      xMax += limit.xMin - xMin;
      xMin = limit.xMin;
    }
    if (xMax > limit.xMax) {
      xMin -= xMax - limit.xMax;
      xMax = limit.xMax;
    }
    if (yMin < limit.yMin) {
      yMax += limit.yMin - yMin;
      yMin = limit.yMin;
    }
    if (yMax > limit.yMax) {
      yMin -= yMax - limit.yMax;
      yMax = limit.yMax;
    }

    return { xMin, xMax, yMin, yMax };
  };

  const getChartMetrics = () => {
    const width = pupilChartCanvas?.width || 0;
    const height = pupilChartCanvas?.height || 0;
    const padding = pupilChartPadding;
    const plotW = Math.max(1, width - padding.left - padding.right);
    const plotH = Math.max(1, height - padding.top - padding.bottom);
    return { width, height, padding, plotW, plotH };
  };

  const setStatus = (message, type = "muted") => {
    if (!statusElement) {
      return;
    }
    statusElement.textContent = message;
    statusElement.className = `small text-${type}`;
  };

  const setMetaStatus = (message, type = "muted") => {
    if (!metaStatusElement) {
      return;
    }
    metaStatusElement.textContent = message;
    metaStatusElement.className = `small text-${type}`;
  };

  const setResetStatus = (message, type = "muted") => {
    if (!resetStatusElement) {
      return;
    }
    resetStatusElement.textContent = message;
    resetStatusElement.className = `small text-${type} mt-2`;
  };

  const setStimulusStatus = (message, type = "muted") => {
    if (!stimulusUploadStatus) {
      return;
    }
    stimulusUploadStatus.textContent = message;
    stimulusUploadStatus.className = `small text-${type}`;
  };

  const setGazeStatus = (message, type = "muted") => {
    if (!gazeStimulusStatus) {
      return;
    }
    gazeStimulusStatus.textContent = message;
    gazeStimulusStatus.className = `small text-${type}`;
  };

  const setRecomputeStatus = (message, type = "muted") => {
    if (!recomputeStatusElement) {
      return;
    }
    recomputeStatusElement.textContent = message;
    recomputeStatusElement.className = `small text-${type} mt-2`;
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () =>
        reject(reader.error || new Error("Не удалось прочитать файл."));
      reader.readAsDataURL(file);
    });

  const populatePupilStimulusFilter = (recordings) => {
    if (!pupilStimulusFilter) {
      return;
    }
    const stimuli = new Set(
      (recordings || [])
        .map((r) => (r.stimulusName || "").trim())
        .filter(Boolean)
    );
    const currentValue = pupilStimulusFilter.value || "all";
    const options = [
      '<option value="all">Все стимулы</option>',
      ...Array.from(stimuli)
        .sort((a, b) => a.localeCompare(b))
        .map((value) => `<option value="${value}">${value}</option>`),
    ];
    pupilStimulusFilter.innerHTML = options.join("");
    if (currentValue && (currentValue === "all" || stimuli.has(currentValue))) {
      pupilStimulusFilter.value = currentValue;
    } else {
      pupilStimulusFilter.value = "all";
    }
    pupilStimulusFilter.dataset.currentValue = pupilStimulusFilter.value;
  };

  const populatePupilParticipantSuggestions = (recordings) => {
    if (!pupilParticipantSuggestions) {
      return;
    }
    const participants = new Set(
      (recordings || [])
        .map((r) => (r.participantName || "").trim())
        .filter(Boolean)
    );
    const options = Array.from(participants)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => `<option value="${value}"></option>`)
      .join("");
    pupilParticipantSuggestions.innerHTML = options;
  };

  const filterPupilSessions = (sessions, recordingsByDate) => {
    const filterValue = pupilStimulusFilter?.value || "all";
    const participantQuery = (pupilParticipantFilter?.value || "").trim().toLowerCase();
    const byStimulus = (session, meta) => {
      if (filterValue === "all") {
        return true;
      }
      const stimulus = meta?.stimulusName || session?.stimulusName || "";
      return stimulus === filterValue;
    };
    const byParticipant = (meta) => {
      if (!participantQuery) {
        return true;
      }
      const participant = (meta?.participantName || "").toLowerCase();
      return participant.includes(participantQuery);
    };

    if (filterValue === "all") {
      return (sessions || []).filter((session) => {
        const metaKey = buildRecordingKey(
          session?.recordedAt,
          session?.stimulusName
        );
        const meta = metaKey ? recordingsByDate.get(metaKey) : undefined;
        return byParticipant(meta);
      });
    }
    return (sessions || []).filter((session) => {
      const metaKey = buildRecordingKey(
        session?.recordedAt,
        session?.stimulusName
      );
      const meta = metaKey ? recordingsByDate.get(metaKey) : undefined;
      return byStimulus(session, meta) && byParticipant(meta);
    });
  };

  const renderPupilArea = (sessions, recordingsByDate) => {
    const filtered = filterPupilSessions(sessions, recordingsByDate);
    renderPupilSelector(filtered, recordingsByDate);
    renderPupilChart(filtered);
    renderGazeArea(filtered);
  };

  const setActiveSectionNav = (targetId) => {
    sectionNavLinks.forEach((link) => {
      const isActive = link.dataset.scrollTarget === targetId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const scrollToSection = (targetId) => {
    if (!targetId) {
      return;
    }
    const section = document.getElementById(targetId);
    if (!section) {
      return;
    }
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSectionNav(targetId);
  };

  const syncSectionNav = () => {
    if (navSyncScheduled || sectionAnchors.length === 0) {
      return;
    }
    navSyncScheduled = true;
    window.requestAnimationFrame(() => {
      const scrollPos = window.scrollY + sectionNavOffset + 1;
      let currentId = sectionAnchors[0]?.id || null;
      for (let i = 0; i < sectionAnchors.length; i += 1) {
        const sectionTop = sectionAnchors[i].offsetTop;
        if (sectionTop <= scrollPos) {
          currentId = sectionAnchors[i].id;
        } else {
          break;
        }
      }
      if (currentId) {
        setActiveSectionNav(currentId);
      }
      navSyncScheduled = false;
    });
  };

  const initSectionNav = () => {
    if (sectionNavLinks.length === 0) {
      return;
    }

    sectionNavLinks.forEach((link) =>
      link.addEventListener("click", (event) => {
        event.preventDefault();
        scrollToSection(event.currentTarget.dataset.scrollTarget);
      })
    );

    window.addEventListener("scroll", syncSectionNav, { passive: true });
    window.addEventListener("resize", syncSectionNav);
    syncSectionNav();
  };

  const populateFilters = (recordings) => {
    if (!experimentFilter || !stimulusFilter) {
      return;
    }

    const experiments = new Set();
    const stimuli = new Set();

    recordings.forEach((record) =>
      experiments.add((record.experimentName || "").trim())
    );
    recordings.forEach((record) =>
      stimuli.add((record.stimulusName || "").trim())
    );

    const renderOptions = (select, values, labelAll) => {
      const currentValue = select.value || "all";
      const options = [
        `<option value="all">${labelAll}</option>`,
        ...Array.from(values)
          .filter((v) => v)
          .sort((a, b) => a.localeCompare(b))
          .map((value) => `<option value="${value}">${value}</option>`),
      ];
      select.innerHTML = options.join("");

      if (currentValue && (currentValue === "all" || values.has(currentValue))) {
        select.value = currentValue;
      } else {
        select.value = "all";
      }

      select.dataset.currentValue = select.value;
    };

    renderOptions(experimentFilter, experiments, "Все эксперименты");
    renderOptions(stimulusFilter, stimuli, "Все стимулы");
  };

  const applyFilters = (sessions, recordingsByDate) => {
    const expFilter = experimentFilter?.value || "all";
    const stimFilter = stimulusFilter?.value || "all";
    const unmatchedOnly = unmatchedOnlyCheckbox?.checked || false;

    if (experimentFilter) {
      experimentFilter.dataset.currentValue = expFilter;
    }
    if (stimulusFilter) {
      stimulusFilter.dataset.currentValue = stimFilter;
    }

    return sessions.filter((session) => {
      const metaKey = buildRecordingKey(
        session?.recordedAt,
        session?.stimulusName
      );
      const meta = metaKey ? recordingsByDate.get(metaKey) : undefined;

      if (unmatchedOnly && meta) {
        return false;
      }
      if (unmatchedOnly && !meta) {
        // still allow further filtering conditions below
      }

      if (expFilter !== "all" && (!meta || meta.experimentName !== expFilter)) {
        return false;
      }
      if (stimFilter !== "all" && (!meta || meta.stimulusName !== stimFilter)) {
        return false;
      }
      return true;
    });
  };

  const renderWithFilters = () => {
    if (!sessionListElement) {
      return;
    }

    const recordingsByDate = buildRecordingsMap();
    const filteredSessions = applyFilters(cachedSessions || [], recordingsByDate);

    if (sessionCountElement) {
      sessionCountElement.textContent = `Показано: ${filteredSessions.length} из ${
        cachedSessions?.length || 0
      }`;
    }

    if (
      !rendererModule ||
      typeof rendererModule.renderSessions !== "function"
    ) {
      sessionListElement.innerHTML =
        '<span class="text-warning">Модуль отображения недоступен.</span>';
      return;
    }

    rendererModule.renderSessions(
      sessionListElement,
      filteredSessions,
      recordingsByDate
    );

    renderPupilArea(cachedSessions || [], recordingsByDate);
  };

  const renderSessionsFromDB = async () => {
    if (!sessionListElement || !window.eyeTrackerDB) {
      return;
    }

    try {
      const sessions = await window.eyeTrackerDB.getSessions();
      (sessions || []).forEach((session) => {
        const hasLeftMedian =
          session.rawDilationSpeedLeftMedian === null ||
          Number.isFinite(session.rawDilationSpeedLeftMedian);
        const hasRightMedian =
          session.rawDilationSpeedRightMedian === null ||
          Number.isFinite(session.rawDilationSpeedRightMedian);
        const hasLeftMAD =
          session.rawDilationSpeedLeftMAD === null ||
          Number.isFinite(session.rawDilationSpeedLeftMAD);
        const hasRightMAD =
          session.rawDilationSpeedRightMAD === null ||
          Number.isFinite(session.rawDilationSpeedRightMAD);
        if (!hasLeftMedian || !hasRightMedian || !hasLeftMAD || !hasRightMAD) {
          getSessionPoints(session);
        }
      });
      const recordings = (await window.eyeTrackerDB.getRecordings()) || [];
      const stimuliImages =
        typeof window.eyeTrackerDB.getStimulusImages === "function"
          ? await window.eyeTrackerDB.getStimulusImages()
          : [];
      cachedRecordings = recordings;
      cachedSessions = sessions;
      cachedStimuliImages = stimuliImages || [];
      stimulusImageCache.clear();

      populateFilters(recordings);
      renderWithFilters();
      const recordingsByDate = buildRecordingsMap(recordings);
      populatePupilStimulusFilter(recordings);
      populatePupilParticipantSuggestions(recordings);
      renderPupilArea(sessions, recordingsByDate);
    } catch (error) {
      console.error(error);
      if (
        rendererModule &&
        typeof rendererModule.renderError === "function"
      ) {
        rendererModule.renderError(
          sessionListElement,
          "Ошибка загрузки сессий."
        );
      } else {
        sessionListElement.innerHTML =
          '<span class="text-danger">Ошибка загрузки сессий.</span>';
      }
    }
  };

  const recomputeStoredPoints = async () => {
    if (!window.eyeTrackerDB) {
      setRecomputeStatus("Хранилище недоступно.", "danger");
      return;
    }
    if (!cachedSessions || cachedSessions.length === 0) {
      setRecomputeStatus("Нет сессий для пересчета.", "warning");
      return;
    }

    setRecomputeStatus("Пересчитываем точки по новым порогам...", "muted");
    recomputePointsButton?.setAttribute("disabled", "disabled");

    try {
      const updatedSessions = cachedSessions.map((session) => {
        const rawPoints = getSessionPoints(session);
        const normalizedRawPoints = rawPoints.map((pt) => {
          const raw = {
            ...pt,
            pupilAvg: computePupilAvg(pt.pupilLeftMm, pt.pupilRightMm),
            isInvalid: computePointInvalid(pt),
          };
          return raw;
        });
        const medians = computeDilationSpeeds(normalizedRawPoints);
        const points = normalizedRawPoints.map((raw) => ({ raw }));
        const rawDilationSpeedLeftMedian =
          medians?.leftMedian ?? session.rawDilationSpeedLeftMedian ?? null;
        const rawDilationSpeedRightMedian =
          medians?.rightMedian ?? session.rawDilationSpeedRightMedian ?? null;
        const rawDilationSpeedLeftMAD =
          medians?.leftMad ?? session.rawDilationSpeedLeftMAD ?? null;
        const rawDilationSpeedRightMAD =
          medians?.rightMad ?? session.rawDilationSpeedRightMAD ?? null;
        return {
          ...session,
          points,
          rawPointsCount: points.length,
          rawInvalidCount: points.filter((p) => p?.raw?.isInvalid).length,
          rawDilationSpeedLeftMAD,
          rawDilationSpeedRightMAD,
          rawDilationSpeedLeftMedian,
          rawDilationSpeedRightMedian,
        };
      });

      await Promise.all(
        updatedSessions.map((session) => window.eyeTrackerDB.addSession(session))
      );
      await renderSessionsFromDB();
      setRecomputeStatus("Точки пересчитаны и сохранены.", "success");
    } catch (error) {
      console.error(error);
      setRecomputeStatus("Не удалось пересчитать точки. Попробуйте еще раз.", "danger");
    } finally {
      recomputePointsButton?.removeAttribute("disabled");
    }
  };

  const handleFileUpload = async () => {
    if (!fileInput || fileInput.files.length === 0) {
      setStatus("Выберите один или несколько CSV-файлов для обработки.", "warning");
      return;
    }

    if (
      !parserModule ||
      typeof parserModule.parseEyeTrackingCSV !== "function"
    ) {
      setStatus("Парсер CSV недоступен.", "danger");
      return;
    }

    const files = Array.from(fileInput.files);
    const totalFiles = files.length;
    let savedSessions = 0;
    let processedFiles = 0;
    const errors = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      setStatus(`Обработка файла ${i + 1}/${totalFiles}: «${file.name}»...`);
      try {
        const text = await file.text();
        if (typeof text !== "string") {
          throw new Error("Невозможно прочитать файл как текст.");
        }

        const sessions = parserModule.parseEyeTrackingCSV(text);
        if (sessions.length === 0) {
          errors.push(`«${file.name}»: серии не найдены или файл пуст.`);
          continue;
        }

        const stimulusName = extractStimulusFromFileName(file.name);

        await Promise.all(
          sessions.map((session) => {
            const rawPoints = Array.isArray(session.points)
              ? session.points.map((pt) => {
                  const raw =
                    pt && typeof pt === "object"
                      ? { ...(pt.raw || pt) }
                      : {};
                  raw.pupilAvg = computePupilAvg(
                    raw.pupilLeftMm,
                    raw.pupilRightMm
                  );
                  raw.isInvalid = computePointInvalid(raw);
                  return raw;
                })
              : [];
            const medians = computeDilationSpeeds(rawPoints);
            const mappedPoints = rawPoints.map((raw) => ({ raw }));
            const rawInvalidCount = rawPoints.filter((p) => p?.isInvalid).length;
            const rawPointsCount = rawPoints.length;
            const rawDilationSpeedLeftMedian = medians?.leftMedian ?? null;
            const rawDilationSpeedRightMedian = medians?.rightMedian ?? null;
            const rawDilationSpeedLeftMAD = medians?.leftMad ?? null;
            const rawDilationSpeedRightMAD = medians?.rightMad ?? null;
            return window.eyeTrackerDB.addSession({
              sessionKey: buildSessionKey(session.sessionKey, file.name),
              recordedAt: session.sessionKey,
              stimulusName,
              points: mappedPoints,
              rawPointsCount,
              rawInvalidCount,
              rawDilationSpeedLeftMAD,
              rawDilationSpeedRightMAD,
              rawDilationSpeedLeftMedian,
              rawDilationSpeedRightMedian,
              createdAt: session.sessionKey,
              sourceFile: file.name,
            });
          })
        );

        savedSessions += sessions.length;
        processedFiles += 1;
      } catch (error) {
        console.error(error);
        errors.push(`«${file.name}»: ошибка обработки файла.`);
      }
    }

    if (savedSessions > 0) {
      await renderSessionsFromDB();
    }

    if (savedSessions > 0 && errors.length === 0) {
      setStatus(
        `Файлов: ${processedFiles}/${totalFiles}. Сохранено серий: ${savedSessions}.`,
        "success"
      );
    } else if (savedSessions > 0 && errors.length > 0) {
      setStatus(
        `Сохранено серий: ${savedSessions}. Ошибки: ${errors.join(" ")}`,
        "warning"
      );
    } else {
      setStatus(
        errors.join(" ") || "Серии не найдены в выбранных файлах.",
        "danger"
      );
    }
  };

  const handleMetadataUpload = () => {
    if (!metaFileInput || metaFileInput.files.length === 0) {
      setMetaStatus("Выберите Excel-файл с информацией по записям.", "warning");
      return;
    }

    const file = metaFileInput.files[0];
    setMetaStatus(`Чтение файла «${file.name}»...`);

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const buffer = event.target?.result;
        if (!(buffer instanceof ArrayBuffer)) {
          throw new Error("Невозможно прочитать файл как бинарные данные.");
        }

        if (
          !parserModule ||
          typeof parserModule.parseMetadataWorkbook !== "function"
        ) {
          throw new Error("Парсер метаданных недоступен.");
        }

        const recordings = parserModule.parseMetadataWorkbook(buffer);

        if (!recordings.length) {
          setMetaStatus("Записи не найдены или файл пуст.", "warning");
          return;
        }

        const normalized = recordings.map((record) => {
          const key = buildRecordingKey(record.recordedAt, record.stimulusName);
          return {
            ...record,
            recordedAtDate: record.recordedAt,
            recordedAt: key || record.recordedAt,
          };
        });

        await window.eyeTrackerDB.addRecordings(normalized);
        await renderSessionsFromDB();

        setMetaStatus(
          `Загружено записей: ${recordings.length}. Данные сохранены и сопоставлены по дате и стимулу.`,
          "success"
        );
      } catch (error) {
        console.error(error);
        setMetaStatus(
          "Ошибка обработки файла метаданных. Проверьте формат Excel.",
          "danger"
        );
      }
    };

    reader.onerror = () => {
      setMetaStatus("Ошибка чтения файла метаданных.", "danger");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleStimulusUpload = async () => {
    if (!stimulusImageInput || stimulusImageInput.files.length === 0) {
      setStimulusStatus("Выберите файл изображения стимула.", "warning");
      return;
    }

    if (
      !window.eyeTrackerDB ||
      typeof window.eyeTrackerDB.addStimulusImage !== "function"
    ) {
      setStimulusStatus("Хранилище недоступно или не обновлено.", "danger");
      return;
    }

    const file = stimulusImageInput.files[0];
    const stimulusName = String(file?.name || "").trim();

    if (!stimulusName) {
      setStimulusStatus(
        "Переименуйте файл: название стимула берется из имени файла с расширением.",
        "warning"
      );
      return;
    }

    setStimulusStatus(`Конвертация «${file.name}» в base64...`);
    stimulusUploadButton?.setAttribute("disabled", "disabled");

    try {
      const dataUrl = await fileToDataUrl(file);
      if (typeof dataUrl !== "string") {
        throw new Error("Не удалось получить base64 строку.");
      }

      await window.eyeTrackerDB.addStimulusImage({
        stimulusName,
        imageBase64: dataUrl,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
      });

      if (typeof window.eyeTrackerDB.getStimulusImages === "function") {
        cachedStimuliImages =
          (await window.eyeTrackerDB.getStimulusImages()) || [];
        stimulusImageCache.clear();
        renderGazeArea(
          filterPupilSessions(cachedSessions || [], buildRecordingsMap())
        );
      }

      setStimulusStatus(
        `Стимул «${stimulusName}» сохранен в базе в виде base64.`,
        "success"
      );
      stimulusImageInput.value = "";
    } catch (error) {
      console.error(error);
      setStimulusStatus("Не удалось сохранить изображение стимула.", "danger");
    } finally {
      stimulusUploadButton?.removeAttribute("disabled");
    }
  };

  const stringToColor = (value) => {
    if (!value) {
      return { bg: "#e9ecef", text: "#343a40" };
    }
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
      hash &= hash;
    }
    const hue = Math.abs(hash) % 360;
    const color = `hsl(${hue}, 70%, 50%)`;
    return color;
  };

  const timeToColor = (t) => {
    const clamp = Math.min(1, Math.max(0, t));
    // От красного (0°) до фиолетового (~300°) без возврата к красному.
    const hue = Math.round(300 * clamp);
    return `hsl(${hue}, 85%, 50%)`;
  };

  const renderGazeCanvas = async (sessions) => {
    if (!gazeCanvas) {
      return;
    }
    const ctx = gazeCanvas.getContext("2d");
    const width = gazeCanvas.width || 0;
    const height = gazeCanvas.height || 0;
    const emptyCanvas = (message) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#dee2e6";
      ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
      ctx.fillStyle = "#6c757d";
      ctx.font = "13px sans-serif";
      ctx.fillText(message, 16, 24);
    };

    if (!sessions || sessions.length === 0) {
      setGazeStatus("Выберите сессии выше, чтобы построить точки.", "muted");
      emptyCanvas("Нет данных для отображения");
      return;
    }

    const selected = getSelectedSessions(sessions);
    if (selected.length === 0) {
      setGazeStatus("Отметьте сессии в блоке выбора, чтобы увидеть точки.", "warning");
      emptyCanvas("Сессии не выбраны");
      return;
    }

    const stimuli = Array.from(
      new Set(
        selected
          .map((session) => (session.stimulusName || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    if (stimuli.length === 0) {
      setGazeStatus("У выбранных сессий нет названия стимула.", "warning");
      emptyCanvas("Стимул не указан");
      return;
    }

    const stimulusName = stimuli[0];
    const hasMultipleStimuli = stimuli.length > 1;

    const stimulusSessions = selected.filter(
      (session) => (session.stimulusName || "").trim() === stimulusName
    );

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, width, height);

    const img = await loadStimulusImage(stimulusName);
    let drawRect = { x: 0, y: 0, width, height };

    if (img) {
      const imgRatio = img.width / (img.height || 1);
      const canvasRatio = width / (height || 1);
      if (imgRatio > canvasRatio) {
        drawRect.width = width;
        drawRect.height = width / imgRatio;
      } else {
        drawRect.height = height;
        drawRect.width = height * imgRatio;
      }
      drawRect.x = (width - drawRect.width) / 2;
      drawRect.y = (height - drawRect.height) / 2;
      ctx.drawImage(img, drawRect.x, drawRect.y, drawRect.width, drawRect.height);
      setGazeStatus(
        `Стимул: ${stimulusName}. Сессий: ${stimulusSessions.length}.`,
        "muted"
      );
    } else {
      setGazeStatus(
        `Картинка стимула «${stimulusName}» не найдена. Точки показаны на фоне.`,
        "warning"
      );
      ctx.strokeStyle = "#dee2e6";
      ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
    }

    const colorMode = gazeColorMode?.value || "session";
    const points = stimulusSessions
      .flatMap((session) =>
        getSessionPoints(session).map((point) => ({
          x: Number(point.x),
          y: Number(point.y),
          time: Number(point.timeOffsetMs),
          sessionKey: session.sessionKey,
        }))
      )
      .filter(
        (pt) =>
          Number.isFinite(pt.x) &&
          Number.isFinite(pt.y) &&
          pt.x !== null &&
          pt.y !== null
      )
      .map((pt) => ({
        ...pt,
        x: Math.min(1, Math.max(0, pt.x)),
        y: Math.min(1, Math.max(0, pt.y)),
      }));

    if (points.length === 0) {
      ctx.fillStyle = "#6c757d";
      ctx.font = "13px sans-serif";
      ctx.fillText(
        "Для выбранных сессий нет точек с координатами.",
        16,
        24
      );
      return;
    }

    const validTimes = points
      .map((pt) => pt.time)
      .filter((value) => Number.isFinite(value));
    const minTime =
      validTimes.length > 0 ? Math.min(...validTimes) : Number.NaN;
    const maxTime =
      validTimes.length > 0 ? Math.max(...validTimes) : Number.NaN;

    setGazeStatus(
      `Стимул: ${stimulusName}. Сессий: ${stimulusSessions.length}. Точек: ${points.length}.${
        hasMultipleStimuli
          ? " Другие выбранные стимулы скрыты."
          : ""
      }`,
      img ? "muted" : "warning"
    );

    points.forEach((pt, index) => {
      const px = drawRect.x + pt.x * drawRect.width;
      const py = drawRect.y + pt.y * drawRect.height;
      let color = stringToColor(pt.sessionKey);
      if (colorMode === "time") {
        let tNorm = 0;
        if (Number.isFinite(minTime) && Number.isFinite(maxTime) && maxTime !== minTime && Number.isFinite(pt.time)) {
          tNorm = (pt.time - minTime) / (maxTime - minTime);
        } else if (points.length > 1) {
          tNorm = index / (points.length - 1);
        }
        color = timeToColor(tNorm);
      }
      ctx.fillStyle = color;
      ctx.strokeStyle = "#ffffffcc";
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    const legendSessions = Array.from(
      new Set(points.map((pt) => pt.sessionKey))
    );
    let legendX = 12;
    const legendY = 20;
    legendSessions.forEach((sessionKey) => {
      const color = stringToColor(sessionKey);
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = "#495057";
      ctx.font = "12px sans-serif";
      ctx.fillText(sessionKey, legendX + 16, legendY + 1);
      legendX += ctx.measureText(sessionKey).width + 52;
    });
  };

  const renderGazeArea = (sessions) => renderGazeCanvas(sessions);

  const renderPupilSelector = (sessions, recordingsByDate = new Map()) => {
    if (!pupilSessionList) {
      return;
    }

    if (!sessions || sessions.length === 0) {
      pupilSessionList.innerHTML =
        '<span class="text-muted small">Загрузите сессии, чтобы выбрать их для графика.</span>';
      return;
    }

    pupilSessionList.innerHTML = sessions
      .map((session, index) => {
        const metaKey = buildRecordingKey(
          session.recordedAt,
          session.stimulusName
        );
        const meta = metaKey ? recordingsByDate.get(metaKey) : undefined;
        const experiment = meta?.experimentName || "—";
        const stimulus = meta?.stimulusName || session.stimulusName || "—";
        const participant = meta?.participantName || "—";
        const checked = selectedPupilSessions.has(session.sessionKey);
        const color = stringToColor(session.sessionKey);
        return `
          <div class="form-check d-flex align-items-center gap-2 mb-2" style="color:${color}">
            <input class="form-check-input pupil-toggle" type="checkbox" value="${session.sessionKey}" id="pupil-${index}" ${checked ? "checked" : ""}>
            <label class="form-check-label small flex-grow-1" for="pupil-${index}">
              <strong>${stimulus}</strong><br>
              <span class="text-muted">Эксп: ${experiment} · Участник: ${participant}</span>
            </label>
          </div>
        `;
      })
      .join("");

    pupilSessionList
      .querySelectorAll(".pupil-toggle")
      .forEach((checkbox) =>
        checkbox.addEventListener("change", (event) => {
          const key = event.target.value;
          if (event.target.checked) {
            selectedPupilSessions.add(key);
          } else {
            selectedPupilSessions.delete(key);
          }
          pupilUserAdjusted = false;
          renderPupilChart(sessions);
          renderGazeArea(sessions);
        })
      );
  };

  const renderPupilChart = (sessions) => {
    if (!pupilChartCanvas) {
      return;
    }
    const ctx = pupilChartCanvas.getContext("2d");
    const { width, height, padding, plotW, plotH } = getChartMetrics();

    ctx.clearRect(0, 0, width, height);

    const selected = sessions.filter((s) => selectedPupilSessions.has(s.sessionKey));

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#6c757d";

    if (selected.length === 0) {
      ctx.fillText("Выберите хотя бы одну сессию для отображения.", 16, 24);
      return;
    }

    const series = selected
      .map((session) => ({
        session,
        points: getSessionPoints(session),
      }))
      .filter((entry) => entry.points.length > 0);

    if (series.length === 0) {
      pupilDataBounds = null;
      pupilBaseView = null;
      pupilView = null;
      ctx.fillText("Нет данных о размере зрачков для выбранных сессий.", 16, 24);
      return;
    }

    const includeInvalid = includeInvalidPupilCheckbox?.checked || false;
    const seriesConfig = [
      {
        key: "left",
        label: "Левый",
        color: "#0d6efd",
        faded: "rgba(13, 110, 253, 0.35)",
        enabled: showLeftPupilCheckbox?.checked !== false,
      },
      {
        key: "right",
        label: "Правый",
        color: "#dc3545",
        faded: "rgba(220, 53, 69, 0.35)",
        enabled: showRightPupilCheckbox?.checked !== false,
      },
      {
        key: "avg",
        label: "Среднее",
        color: "#198754",
        faded: "rgba(25, 135, 84, 0.35)",
        enabled: showAvgPupilCheckbox?.checked !== false,
      },
    ].filter((item) => item.enabled);

    if (seriesConfig.length === 0) {
      ctx.fillText("Включите хотя бы одну серию (левый/правый/среднее).", 16, 24);
      return;
    }

    const allPoints = [];
    series.forEach(({ session, points }) => {
      points.forEach((p) => {
        const time = p.timeOffsetMs;
        if (!Number.isFinite(time)) {
          return;
        }
        const isInvalid = Boolean(p.isInvalid);
        if (!includeInvalid && isInvalid) {
          return;
        }
        const left = Number.isFinite(p.pupilLeftMm) ? p.pupilLeftMm : null;
        const right = Number.isFinite(p.pupilRightMm) ? p.pupilRightMm : null;
        const avg =
          Number.isFinite(p.pupilAvg) && p.pupilAvg !== null
            ? p.pupilAvg
            : left !== null && right !== null
              ? (left + right) / 2
              : left !== null
                ? left
                : right !== null
                  ? right
                  : null;

        seriesConfig.forEach((config) => {
          let value = null;
          if (config.key === "left") {
            value = left;
          } else if (config.key === "right") {
            value = right;
          } else if (config.key === "avg") {
            value = avg;
          }
          if (!Number.isFinite(value)) {
            return;
          }
          allPoints.push({
            x: time,
            y: value,
            type: config.key,
            isInvalid,
            sessionKey: session.sessionKey,
          });
        });
      });
    });

    if (allPoints.length === 0) {
      pupilDataBounds = null;
      pupilBaseView = null;
      pupilView = null;
      ctx.fillText("Нет валидных точек для выбранных серий.", 16, 24);
      return;
    }

    const minX = Math.min(...allPoints.map((p) => p.x), 0);
    const maxX = Math.max(...allPoints.map((p) => p.x));
    const allY = allPoints.map((p) => p.y);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    pupilDataBounds = { xMin: minX, xMax: maxX, yMin: minY, yMax: maxY };
    pupilBaseView = expandBounds(pupilDataBounds);

    if (!pupilView || !pupilUserAdjusted) {
      pupilView = { ...pupilBaseView };
    }

    const safeRange = (value, fallback) =>
      Number.isFinite(value) && value !== 0 ? value : fallback;

    const rangeX = safeRange(pupilView.xMax - pupilView.xMin, 1);
    const rangeY = safeRange(pupilView.yMax - pupilView.yMin, 1);

    const scaleX = (x) => padding.left + (plotW * (x - pupilView.xMin)) / rangeX;
    const scaleY = (y) =>
      padding.top + plotH - (plotH * (y - pupilView.yMin)) / rangeY;

    const getTimeStepSeconds = () => {
      const range = (pupilView?.xMax || 0) - (pupilView?.xMin || 0);
      return range > 40 ? 1 : 0.5; // >40 c: шаг 1000 мс, иначе 500 мс
    };

    const drawTimeGrid = () => {
      const stepSeconds = getTimeStepSeconds();
      const start = Math.max(
        0,
        Math.floor(pupilView.xMin / stepSeconds) * stepSeconds
      );
      let drawn = 0;
      ctx.save();
      ctx.strokeStyle = "#d0d7de";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 4]);
      for (let t = start; t <= pupilView.xMax; t += stepSeconds) {
        if (drawn > 5000) {
          break; // защита от слишком большого числа линий
        }
        const x = scaleX(t);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + plotH);
        ctx.stroke();
        drawn += 1;
      }
      ctx.restore();
    };

    // сетка 500 мс на фоне
    drawTimeGrid();

    ctx.strokeStyle = "#dee2e6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + plotH);
    ctx.lineTo(padding.left + plotW, padding.top + plotH);
    ctx.stroke();

    ctx.fillStyle = "#6c757d";
    ctx.fillText("t, с", width - padding.right - 30, height - 10);
    ctx.save();
    ctx.translate(15, padding.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Диаметр, мм", 0, 0);
    ctx.restore();

    const drawXTicks = () => {
      const stepSeconds = getTimeStepSeconds();
      const start = Math.max(
        0,
        Math.floor(pupilView.xMin / stepSeconds) * stepSeconds
      );
      const formatTime = (value) =>
        Number.isInteger(value) ? value.toString() : value.toFixed(1);
      let drawn = 0;
      ctx.fillStyle = "#6c757d";
      ctx.strokeStyle = "#e9ecef";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let t = start; t <= pupilView.xMax; t += stepSeconds) {
        if (drawn > 5000) {
          break; // защита от слишком большого числа подписей
        }
        const x = scaleX(t);
        ctx.beginPath();
        ctx.moveTo(x, padding.top + plotH);
        ctx.lineTo(x, padding.top + plotH + 4);
        ctx.stroke();
        ctx.fillText(formatTime(t), x, padding.top + plotH + 8);
        drawn += 1;
      }
    };

    const drawYTicks = () => {
      const steps = 5;
      const step = rangeY / steps;
      ctx.fillStyle = "#6c757d";
      ctx.strokeStyle = "#e9ecef";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i = 0; i <= steps; i += 1) {
        const val = pupilView.yMin + step * i;
        const y = scaleY(val);
        ctx.beginPath();
        ctx.moveTo(padding.left - 4, y);
        ctx.lineTo(padding.left, y);
        ctx.stroke();
        ctx.fillText(val.toFixed(2), padding.left - 6, y);
      }
    };

    drawXTicks();
    drawYTicks();

    const pointsByType = seriesConfig.reduce((acc, config) => {
      acc[config.key] = [];
      return acc;
    }, {});

    allPoints.forEach((pt) => {
      if (!pointsByType[pt.type]) {
        pointsByType[pt.type] = [];
      }
      pointsByType[pt.type].push(pt);
    });

    const drawPoints = (points, color) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = "#ffffffcc";
      points.forEach((pt) => {
        const x = scaleX(pt.x);
        const y = scaleY(pt.y);
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    };

    seriesConfig.forEach((config) => {
      const points = pointsByType[config.key] || [];
      const validPoints = points.filter((p) => !p.isInvalid);
      const invalidPoints = points.filter((p) => p.isInvalid);
      if (validPoints.length > 0) {
        drawPoints(validPoints, config.color);
      }
      if (includeInvalid && invalidPoints.length > 0) {
        drawPoints(invalidPoints, config.faded);
      }
    });

    let legendX = padding.left;
    const legendY = padding.top - 6;
    seriesConfig.forEach((config) => {
      ctx.fillStyle = config.color;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = "#495057";
      ctx.fillText(config.label, legendX + 16, legendY);
      legendX += ctx.measureText(config.label).width + 60;
    });
  };

  const selectAllPupilSessions = () => {
    const recordingsByDate = buildRecordingsMap();
    filterPupilSessions(cachedSessions || [], recordingsByDate).forEach(
      (session) => selectedPupilSessions.add(session.sessionKey)
    );
    pupilUserAdjusted = false;
    pupilView = pupilBaseView ? { ...pupilBaseView } : pupilView;
    renderPupilArea(cachedSessions || [], recordingsByDate);
  };

  const clearAllPupilSessions = () => {
    selectedPupilSessions.clear();
    pupilUserAdjusted = false;
    pupilView = pupilBaseView ? { ...pupilBaseView } : pupilView;
    renderPupilArea(cachedSessions || [], buildRecordingsMap());
  };

  const handleResetDb = async () => {
    if (!window.eyeTrackerDB) {
      setResetStatus("Хранилище недоступно.", "danger");
      return;
    }
    const confirmed = window.confirm(
      "Удалить все загруженные сессии и метаданные?"
    );
    if (!confirmed) {
      return;
    }
    setResetStatus("Очистка базы данных...", "muted");
    resetDbButton?.setAttribute("disabled", "disabled");
    try {
      await window.eyeTrackerDB.clearSessions();
      if (typeof window.eyeTrackerDB.clearRecordings === "function") {
        await window.eyeTrackerDB.clearRecordings();
      }
      if (typeof window.eyeTrackerDB.clearStimulusImages === "function") {
        await window.eyeTrackerDB.clearStimulusImages();
      }
      cachedSessions = [];
      cachedRecordings = [];
      cachedStimuliImages = [];
      stimulusImageCache.clear();
      await renderSessionsFromDB();
      setResetStatus("База очищена.", "success");
      setStatus("", "muted");
      setMetaStatus("", "muted");
    } catch (error) {
      console.error(error);
      setResetStatus("Не удалось очистить базу. Повторите попытку.", "danger");
    } finally {
      resetDbButton?.removeAttribute("disabled");
    }
  };

  const screenToData = (px, py) => {
    if (!pupilView) {
      return { x: 0, y: 0 };
    }
    const { padding, plotW, plotH } = getChartMetrics();
    const rangeX = pupilView.xMax - pupilView.xMin || 1;
    const rangeY = pupilView.yMax - pupilView.yMin || 1;
    const x =
      pupilView.xMin + ((px - padding.left) / plotW) * rangeX;
    const y =
      pupilView.yMin +
      ((plotH - (py - padding.top)) / plotH) * rangeY;
    return { x, y };
  };

  const handleWheelZoom = (event) => {
    if (!pupilView || !pupilDataBounds) {
      return;
    }
    event.preventDefault();
    const zoomFactor = event.deltaY < 0 ? 0.85 : 1.15;
    const { x, y } = screenToData(event.offsetX, event.offsetY);
    const rangeX = pupilView.xMax - pupilView.xMin || 1;
    const rangeY = pupilView.yMax - pupilView.yMin || 1;

    const newRangeX = rangeX * zoomFactor;
    const newRangeY = rangeY * zoomFactor;
    const baseRangeX =
      (pupilBaseView?.xMax || 0) - (pupilBaseView?.xMin || 0) || newRangeX;
    const baseRangeY =
      (pupilBaseView?.yMax || 0) - (pupilBaseView?.yMin || 0) || newRangeY;

    const limitedRangeX = Math.min(newRangeX, baseRangeX);
    const limitedRangeY = Math.min(newRangeY, baseRangeY);

    const newView = {
      xMin: x - ((x - pupilView.xMin) * limitedRangeX) / rangeX,
      xMax: x + ((pupilView.xMax - x) * limitedRangeX) / rangeX,
      yMin: y - ((y - pupilView.yMin) * limitedRangeY) / rangeY,
      yMax: y + ((pupilView.yMax - y) * limitedRangeY) / rangeY,
    };

    pupilView = clampViewToBounds(newView, pupilDataBounds);
    pupilUserAdjusted = true;
    renderPupilChart(cachedSessions || []);
  };

  const handlePanMove = (event) => {
    if (!isPanning || !panStart || !pupilView || !pupilDataBounds) {
      return;
    }
    if (event.buttons === 0) {
      endPan();
      return;
    }
    const { plotW, plotH } = getChartMetrics();
    const rangeX = pupilView.xMax - pupilView.xMin || 1;
    const rangeY = pupilView.yMax - pupilView.yMin || 1;
    const dx = event.offsetX - panStart.x;
    const dy = event.offsetY - panStart.y;
    const shiftX = (dx * rangeX) / plotW;
    const shiftY = (dy * rangeY) / plotH;

    const newView = {
      xMin: panStart.view.xMin - shiftX,
      xMax: panStart.view.xMax - shiftX,
      yMin: panStart.view.yMin + shiftY,
      yMax: panStart.view.yMax + shiftY,
    };

    pupilView = clampViewToBounds(newView, pupilDataBounds);
    pupilUserAdjusted = true;
    renderPupilChart(cachedSessions || []);
  };

  const startPan = (event) => {
    if (!pupilView) {
      return;
    }
    isPanning = true;
    panStart = {
      x: event.offsetX,
      y: event.offsetY,
      view: { ...pupilView },
    };
  };

  const endPan = () => {
    isPanning = false;
    panStart = null;
  };

  uploadButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    await handleFileUpload();
  });

  metaUploadButton?.addEventListener("click", (event) => {
    event.preventDefault();
    handleMetadataUpload();
  });

  stimulusUploadButton?.addEventListener("click", (event) => {
    event.preventDefault();
    handleStimulusUpload();
  });

  experimentFilter?.addEventListener("change", () => renderWithFilters());
  stimulusFilter?.addEventListener("change", () => renderWithFilters());
  unmatchedOnlyCheckbox?.addEventListener("change", () => renderWithFilters());
  pupilChartCanvas?.addEventListener("wheel", handleWheelZoom, {
    passive: false,
  });
  pupilChartCanvas?.addEventListener("mousedown", startPan);
  pupilChartCanvas?.addEventListener("mouseleave", endPan);
  window.addEventListener("mousemove", handlePanMove);
  window.addEventListener("mouseup", endPan);

  pupilStimulusFilter?.addEventListener("change", () =>
    renderPupilArea(
      cachedSessions || [],
      buildRecordingsMap(cachedRecordings || [])
    )
  );
  pupilParticipantFilter?.addEventListener("input", () =>
    renderPupilArea(
      cachedSessions || [],
      buildRecordingsMap(cachedRecordings || [])
    )
  );
  pupilParticipantClear?.addEventListener("click", () => {
    if (pupilParticipantFilter) {
      pupilParticipantFilter.value = "";
      pupilParticipantFilter.focus();
    }
    renderPupilArea(
      cachedSessions || [],
      buildRecordingsMap(cachedRecordings || [])
    );
  });
  gazeColorMode?.addEventListener("change", () =>
    renderGazeArea(
      filterPupilSessions(
        cachedSessions || [],
        buildRecordingsMap(cachedRecordings || [])
      )
    )
  );
  const handleThresholdChange = () => {
    setRecomputeStatus(
      "Параметры изменены. Нажмите «Пересчитать точки», чтобы обновить сохраненные данные.",
      "warning"
    );
  };

  [validityThresholdInput, pupilMinInput, pupilMaxInput].forEach((input) =>
    input?.addEventListener("input", handleThresholdChange)
  );
  recomputePointsButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    await recomputeStoredPoints();
  });
  [
    showLeftPupilCheckbox,
    showRightPupilCheckbox,
    showAvgPupilCheckbox,
    includeInvalidPupilCheckbox,
  ].forEach((checkbox) =>
    checkbox?.addEventListener("change", () => renderPupilChart(cachedSessions || []))
  );
  pupilSelectAllBtn?.addEventListener("click", () => selectAllPupilSessions());
  pupilClearAllBtn?.addEventListener("click", () => clearAllPupilSessions());
  resetDbButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    await handleResetDb();
  });

  initSectionNav();
  renderSessionsFromDB();

  console.info("Eye tracking analytics dashboard initialized.");
});
