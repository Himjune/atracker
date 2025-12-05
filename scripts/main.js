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
  const pupilFilterMode = document.getElementById("pupilFilterMode");
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
  const gazeCanvas = document.getElementById("gazeCanvas");
  const gazeColorMode = document.getElementById("gazeColorMode");
  const gazeFilterMode = document.getElementById("gazeFilterMode");
  const gazeSelectAreaBtn = document.getElementById("gazeSelectArea");
  const gazeClearAreaBtn = document.getElementById("gazeClearArea");
  const gazeStimulusStatus = document.getElementById("gazeStimulusStatus");
  const gazePlaybackBtn = document.getElementById("gazePlayback");
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
  let readingAreaNorm = null;
  let isSelectingReadingArea = false;
  let readingSelectionStart = null;
  let lastStimulusDrawRect = null;
  let readingSelectionPreview = null;
  let gazePlaybackTimer = null;
  let gazePlaybackIndex = 0;
  let gazePlaybackPoints = [];
  let isGazePlaybackActive = false;

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

  const updateGazePlaybackButton = () => {
    if (!gazePlaybackBtn) {
      return;
    }
    gazePlaybackBtn.textContent = isGazePlaybackActive
      ? "Остановить проигрывание"
      : "Проиграть точки";
    gazePlaybackBtn.classList.toggle("btn-danger", isGazePlaybackActive);
    gazePlaybackBtn.classList.toggle("btn-outline-success", !isGazePlaybackActive);
  };

  const stopGazePlayback = (resetIndex = true) => {
    if (gazePlaybackTimer) {
      clearTimeout(gazePlaybackTimer);
      gazePlaybackTimer = null;
    }
    isGazePlaybackActive = false;
    if (resetIndex) {
      gazePlaybackIndex = 0;
    }
    updateGazePlaybackButton();
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
          sessions.map((session) =>
            window.eyeTrackerDB.addSession({
              sessionKey: buildSessionKey(session.sessionKey, file.name),
              recordedAt: session.sessionKey,
              stimulusName,
              points: session.points,
              createdAt: session.sessionKey,
              sourceFile: file.name,
            })
          )
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

  const applyKalman1D = (points, valueKey = "y") => {
    if (!Array.isArray(points) || points.length === 0) {
      return points || [];
    }
    const processNoise = 1e-3;
    const measurementNoise = 5e-3;
    const sorted = [...points].sort((a, b) => (a.x || 0) - (b.x || 0));
    let estimate =
      valueKey in sorted[0] && Number.isFinite(sorted[0][valueKey])
        ? sorted[0][valueKey]
        : 0;
    let error = 1;

    return sorted.map((pt) => {
      const measurement =
        valueKey in pt && Number.isFinite(pt[valueKey])
          ? pt[valueKey]
          : estimate;
      const gain = error / (error + measurementNoise);
      estimate = estimate + gain * (measurement - estimate);
      error = (1 - gain) * error + processNoise;
      return { ...pt, [valueKey]: estimate };
    });
  };

  const applyKalmanFilter = (points) => {
    if (!Array.isArray(points) || points.length === 0) {
      return points || [];
    }
    const processNoise = 1e-3;
    const measurementNoise = 5e-3;
    let estX = Number.isFinite(points[0].x) ? points[0].x : 0;
    let estY = Number.isFinite(points[0].y) ? points[0].y : 0;
    let errX = 1;
    let errY = 1;

    const sorted = [...points].sort((a, b) => (a.time || 0) - (b.time || 0));

    const filtered = sorted.map((pt) => {
      const zX = Number.isFinite(pt.x) ? pt.x : estX;
      const zY = Number.isFinite(pt.y) ? pt.y : estY;

      const gainX = errX / (errX + measurementNoise);
      const gainY = errY / (errY + measurementNoise);

      estX = estX + gainX * (zX - estX);
      estY = estY + gainY * (zY - estY);

      errX = (1 - gainX) * errX + processNoise;
      errY = (1 - gainY) * errY + processNoise;

      return { ...pt, x: estX, y: estY };
    });

    return filtered;
  };

  const screenRectToNorm = (start, end, baseRect) => {
    if (!start || !end || !baseRect) {
      return null;
    }
    const clampToRect = (value, min, max) =>
      Math.min(max, Math.max(min, value));
    const sx = clampToRect(start.x, baseRect.x, baseRect.x + baseRect.width);
    const sy = clampToRect(start.y, baseRect.y, baseRect.y + baseRect.height);
    const ex = clampToRect(end.x, baseRect.x, baseRect.x + baseRect.width);
    const ey = clampToRect(end.y, baseRect.y, baseRect.y + baseRect.height);
    const x1 = Math.min(sx, ex);
    const y1 = Math.min(sy, ey);
    const x2 = Math.max(sx, ex);
    const y2 = Math.max(sy, ey);
    const width = Math.max(4, x2 - x1);
    const height = Math.max(4, y2 - y1);
    return {
      x: (x1 - baseRect.x) / baseRect.width,
      y: (y1 - baseRect.y) / baseRect.height,
      width: width / baseRect.width,
      height: height / baseRect.height,
    };
  };

  const renderGazeCanvas = async (sessions, options = {}) => {
    const { playbackLimit = null, preservePlayback = false } = options;
    if (!preservePlayback) {
      stopGazePlayback();
    }
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
      gazePlaybackPoints = [];
      gazePlaybackIndex = 0;
      updateGazePlaybackButton();
      setGazeStatus("Выберите сессии выше, чтобы построить точки.", "muted");
      emptyCanvas("Нет данных для отображения");
      return;
    }

    const selected = getSelectedSessions(sessions);
    if (selected.length === 0) {
      gazePlaybackPoints = [];
      gazePlaybackIndex = 0;
      updateGazePlaybackButton();
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
      gazePlaybackPoints = [];
      gazePlaybackIndex = 0;
      updateGazePlaybackButton();
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
    lastStimulusDrawRect = null;
    readingSelectionPreview = null;

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
      lastStimulusDrawRect = { ...drawRect };
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
    const filterMode = gazeFilterMode?.value || "filtered";

    const rawPoints = stimulusSessions
      .flatMap((session) =>
        (session.points || []).map((point) => ({
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
    const filteredPoints = applyKalmanFilter(rawPoints);

    const firstHitBySession = new Map();
    if (readingAreaNorm && lastStimulusDrawRect) {
      filteredPoints.forEach((pt) => {
        const px = drawRect.x + pt.x * drawRect.width;
        const py = drawRect.y + pt.y * drawRect.height;
        const areaX =
          lastStimulusDrawRect.x +
          readingAreaNorm.x * lastStimulusDrawRect.width;
        const areaY =
          lastStimulusDrawRect.y +
          readingAreaNorm.y * lastStimulusDrawRect.height;
        const areaW = readingAreaNorm.width * lastStimulusDrawRect.width;
        const areaH = readingAreaNorm.height * lastStimulusDrawRect.height;
        const inside =
          px >= areaX &&
          px <= areaX + areaW &&
          py >= areaY &&
          py <= areaY + areaH;
        if (inside && !firstHitBySession.has(pt.sessionKey)) {
          firstHitBySession.set(pt.sessionKey, pt.time);
        }
      });
    }

    if (rawPoints.length === 0) {
      gazePlaybackPoints = [];
      gazePlaybackIndex = 0;
      updateGazePlaybackButton();
      ctx.fillStyle = "#6c757d";
      ctx.font = "13px sans-serif";
      ctx.fillText(
        "Для выбранных сессий нет точек с координатами.",
        16,
        24
      );
      return;
    }

    const validTimes = filteredPoints
      .map((pt) => pt.time)
      .filter((value) => Number.isFinite(value));
    const minTime =
      validTimes.length > 0 ? Math.min(...validTimes) : Number.NaN;
    const maxTime =
      validTimes.length > 0 ? Math.max(...validTimes) : Number.NaN;

    const statusDetails =
      filterMode === "both"
        ? `Точек: ${rawPoints.length} исходных / ${filteredPoints.length} после фильтра.`
        : `Точек: ${
          filterMode === "raw" ? rawPoints.length : filteredPoints.length
        }.`;
    setGazeStatus(
      `Стимул: ${stimulusName}. Сессий: ${stimulusSessions.length}. ${statusDetails}${
        hasMultipleStimuli
          ? " Другие выбранные стимулы скрыты."
          : ""
      }`,
      img ? "muted" : "warning"
    );

    const markReading = (pointsArr) =>
      pointsArr.map((pt, index) => {
        let color = stringToColor(pt.sessionKey);
        if (colorMode === "time") {
          let tNorm = 0;
          if (
            Number.isFinite(minTime) &&
            Number.isFinite(maxTime) &&
            maxTime !== minTime &&
            Number.isFinite(pt.time)
          ) {
            tNorm = (pt.time - minTime) / (maxTime - minTime);
          } else if (pointsArr.length > 1) {
            tNorm = index / (pointsArr.length - 1);
          }
          color = timeToColor(tNorm);
        }

        const firstHitTime = firstHitBySession.get(pt.sessionKey);
        const isReading =
          Number.isFinite(firstHitTime) &&
          Number.isFinite(pt.time) &&
          pt.time >= firstHitTime;

        return { ...pt, color, isReading };
      });

    const filteredWithFlags = markReading(filteredPoints);
    const rawWithFlags = markReading(rawPoints);
    const points =
      filterMode === "both"
        ? [...rawWithFlags, ...filteredWithFlags]
        : filterMode === "raw"
          ? rawWithFlags
          : filteredWithFlags;

    const playbackSource =
      filterMode === "raw" ? rawWithFlags : filteredWithFlags;
    const playbackTimeline = [...playbackSource].sort((a, b) => {
      const aTime = Number.isFinite(a.time) ? a.time : 0;
      const bTime = Number.isFinite(b.time) ? b.time : 0;
      return aTime - bTime;
    });
    gazePlaybackPoints = playbackTimeline;
    const activePlaybackLimit =
      Number.isFinite(playbackLimit) && playbackLimit >= 0
        ? Math.min(playbackLimit, playbackTimeline.length)
        : null;
    const playbackAllowed =
      activePlaybackLimit !== null
        ? new Set(playbackTimeline.slice(0, activePlaybackLimit).map((pt) => pt))
        : null;
    const applyPlaybackLimit = (arr) =>
      playbackAllowed ? arr.filter((pt) => playbackAllowed.has(pt)) : arr;

    const drawDots = (pointsArr, options = {}) => {
      const {
        alpha = 1,
        size = 4,
        outline = true,
        readingOutline = true,
        outlineColor = "#ffffffcc",
      } = options;
      pointsArr.forEach((pt) => {
        const px = drawRect.x + pt.x * drawRect.width;
        const py = drawRect.y + pt.y * drawRect.height;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.strokeStyle = outlineColor;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
        if (outline) {
          ctx.stroke();
        }
        if (readingOutline && pt.isReading) {
          ctx.strokeStyle = "#212529";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, size + 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 1;
        }
        ctx.restore();
      });
    };

    if (filterMode === "both") {
      drawDots(applyPlaybackLimit(rawWithFlags), {
        alpha: 0.25,
        size: 3,
        outline: false,
        readingOutline: false,
      });
      drawDots(applyPlaybackLimit(filteredWithFlags), {
        alpha: 1,
        size: 4,
        outline: true,
        readingOutline: true,
      });
    } else if (filterMode === "raw") {
      drawDots(applyPlaybackLimit(rawWithFlags), {
        alpha: 0.9,
        size: 4,
        outline: true,
        readingOutline: true,
      });
    } else {
      drawDots(applyPlaybackLimit(filteredWithFlags), {
        alpha: 1,
        size: 4,
        outline: true,
        readingOutline: true,
      });
    }

    if (readingAreaNorm && lastStimulusDrawRect) {
      const areaX =
        lastStimulusDrawRect.x +
        readingAreaNorm.x * lastStimulusDrawRect.width;
      const areaY =
        lastStimulusDrawRect.y +
        readingAreaNorm.y * lastStimulusDrawRect.height;
      const areaW = readingAreaNorm.width * lastStimulusDrawRect.width;
      const areaH = readingAreaNorm.height * lastStimulusDrawRect.height;
      ctx.strokeStyle = "#0d6efd";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(areaX, areaY, areaW, areaH);
      ctx.setLineDash([]);
    }

    if (readingSelectionPreview && lastStimulusDrawRect) {
      const areaX =
        lastStimulusDrawRect.x +
        readingSelectionPreview.x * lastStimulusDrawRect.width;
      const areaY =
        lastStimulusDrawRect.y +
        readingSelectionPreview.y * lastStimulusDrawRect.height;
      const areaW =
        readingSelectionPreview.width * lastStimulusDrawRect.width;
      const areaH =
        readingSelectionPreview.height * lastStimulusDrawRect.height;
      ctx.strokeStyle = "#20c997";
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(areaX, areaY, areaW, areaH);
      ctx.setLineDash([]);
    }

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

  const renderGazeArea = (sessions, options) => renderGazeCanvas(sessions, options);

  const getCurrentFilteredSessions = () =>
    filterPupilSessions(
      cachedSessions || [],
      buildRecordingsMap(cachedRecordings || [])
    );

  const gazePlaybackFrameDelayMs = 16;

  const runGazePlaybackFrame = () => {
    if (!isGazePlaybackActive) {
      return;
    }
    const visibleCount = Math.min(
      Math.max(gazePlaybackIndex, 1),
      gazePlaybackPoints.length
    );
    renderGazeArea(getCurrentFilteredSessions(), {
      playbackLimit: visibleCount,
      preservePlayback: true,
    });
    if (visibleCount >= gazePlaybackPoints.length) {
      stopGazePlayback();
      renderGazeArea(getCurrentFilteredSessions());
      return;
    }
    gazePlaybackIndex += 1;
    gazePlaybackTimer = setTimeout(runGazePlaybackFrame, gazePlaybackFrameDelayMs);
  };

  const startGazePlayback = () => {
    if (!gazePlaybackPoints.length) {
      setGazeStatus("Нет точек для проигрывания.", "warning");
      return;
    }
    stopGazePlayback();
    isGazePlaybackActive = true;
    gazePlaybackIndex = 1;
    updateGazePlaybackButton();
    runGazePlaybackFrame();
  };

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

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#6c757d";

    const filterMode = pupilFilterMode?.value || "filtered";
    const selected = sessions.filter((s) =>
      selectedPupilSessions.has(s.sessionKey)
    );

    if (selected.length === 0) {
      ctx.fillText("Выберите хотя бы одну сессию для отображения.", 16, 24);
      return;
    }

    const hasReadingArea = Boolean(readingAreaNorm);

    const series = selected
      .map((session) => {
        const rawPoints = (session.points || [])
          .map((p) => {
            const left = Number.isFinite(p.pupilLeftMm) ? p.pupilLeftMm : null;
            const right = Number.isFinite(p.pupilRightMm) ? p.pupilRightMm : null;
            const avg =
              left !== null && right !== null
                ? (left + right) / 2
                : left !== null
                  ? left
                  : right !== null
                    ? right
                    : null;
            if (avg === null || !Number.isFinite(p.timeOffsetMs)) {
              return null;
            }
            return {
              time: p.timeOffsetMs,
              value: avg,
              gazeX: Number.isFinite(p.x) ? p.x : null,
              gazeY: Number.isFinite(p.y) ? p.y : null,
            };
          })
          .filter(Boolean);

        let firstReadingTime = null;
        if (hasReadingArea) {
          for (let i = 0; i < rawPoints.length; i += 1) {
            const pt = rawPoints[i];
            if (
              pt.gazeX !== null &&
              pt.gazeY !== null &&
              pt.gazeX >= 0 &&
              pt.gazeX <= 1 &&
              pt.gazeY >= 0 &&
              pt.gazeY <= 1 &&
              pt.gazeX >= readingAreaNorm.x &&
              pt.gazeX <= readingAreaNorm.x + readingAreaNorm.width &&
              pt.gazeY >= readingAreaNorm.y &&
              pt.gazeY <= readingAreaNorm.y + readingAreaNorm.height
            ) {
              firstReadingTime = pt.time;
              break;
            }
          }
        }

        const points = rawPoints.map((pt) => ({
          x: pt.time,
          y: pt.value,
          isReading: !hasReadingArea
            ? true
            : Number.isFinite(firstReadingTime) && pt.time >= firstReadingTime,
        }));

        const filteredPoints = applyKalman1D(points, "y").map((pt) => ({
          ...pt,
          isReading:
            points.find((p) => p.x === pt.x)?.isReading ?? pt.isReading,
        }));

        return { session, rawPoints: points, filteredPoints };
      })
      .filter(
        (entry) =>
          entry.rawPoints.length > 0 || entry.filteredPoints.length > 0
      );

    if (series.length === 0) {
      pupilDataBounds = null;
      pupilBaseView = null;
      pupilView = null;
      ctx.fillText("Нет данных о размере зрачков для выбранных сессий.", 16, 24);
      return;
    }

    const pointsForBounds =
      filterMode === "raw"
        ? series.flatMap((s) => s.rawPoints)
        : filterMode === "both"
          ? series.flatMap((s) => [...s.rawPoints, ...s.filteredPoints])
          : series.flatMap((s) => s.filteredPoints);

    const minX = 0;
    const maxX = Math.max(...pointsForBounds.map((p) => p.x));
    const allY = pointsForBounds.map((p) => p.y);
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
      const steps = 6;
      const step = rangeX / steps;
      ctx.fillStyle = "#6c757d";
      ctx.strokeStyle = "#e9ecef";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let i = 0; i <= steps; i += 1) {
        const val = pupilView.xMin + step * i;
        const x = scaleX(val);
        ctx.beginPath();
        ctx.moveTo(x, padding.top + plotH);
        ctx.lineTo(x, padding.top + plotH + 4);
        ctx.stroke();
        ctx.fillText(Math.round(val), x, padding.top + plotH + 8);
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

    const drawPoints = (points, color, { alpha = 1, size = 3.5 } = {}) => {
      if (!points || points.length === 0) {
        return;
      }
      ctx.save();
      ctx.fillStyle = color;
      ctx.strokeStyle = "#ffffff";
      points.forEach((pt) => {
        const x = scaleX(pt.x);
        const y = scaleY(pt.y);
        ctx.globalAlpha = alpha * (pt.isReading ? 1 : 0.35);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    };

    const computeModeValue = (values, binSize = 0.05) => {
      const bins = new Map();
      values.forEach((val) => {
        if (!Number.isFinite(val)) {
          return;
        }
        const key = Math.round(val / binSize);
        bins.set(key, (bins.get(key) || 0) + 1);
      });
      if (bins.size === 0) {
        return null;
      }
      let bestKey = null;
      let bestCount = -Infinity;
      bins.forEach((count, key) => {
        if (
          count > bestCount ||
          (count === bestCount && (bestKey === null || key < bestKey))
        ) {
          bestCount = count;
          bestKey = key;
        }
      });
      return bestKey * binSize;
    };

    const drawModeLine = (value, color, label) => {
      if (!Number.isFinite(value)) {
        return;
      }
      if (value < pupilView.yMin || value > pupilView.yMax) {
        return;
      }
      const y = scaleY(value);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotW, y);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(label, padding.left + plotW - 6, y - 4);
      ctx.restore();
    };

    const computeMeanValue = (values) => {
      const finite = values.filter((v) => Number.isFinite(v));
      if (!finite.length) {
        return null;
      }
      const sum = finite.reduce((acc, v) => acc + v, 0);
      return sum / finite.length;
    };

    const drawVerticalGrid = (stepSec = 0.5) => {
      if (!pupilView || stepSec <= 0) {
        return;
      }
      const start = Math.ceil(pupilView.xMin / stepSec) * stepSec;
      const end = pupilView.xMax;
      ctx.save();
      ctx.strokeStyle = "#f1f3f5";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      for (let t = start; t <= end; t += stepSec) {
        const x = scaleX(t);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + plotH);
        ctx.stroke();
      }
      ctx.restore();
    };

    drawVerticalGrid(0.5);
    series.forEach(({ session, rawPoints, filteredPoints }) => {
      const color = stringToColor(session.sessionKey);
      if (filterMode === "both") {
        drawPoints(rawPoints, color, { alpha: 0.25, size: 3 });
        drawPoints(filteredPoints, color, { alpha: 1, size: 3.6 });
      } else if (filterMode === "raw") {
        drawPoints(rawPoints, color, { alpha: 0.9, size: 3.4 });
      } else {
        drawPoints(filteredPoints, color, { alpha: 1, size: 3.6 });
      }
    });
    const pointsForMode =
      filterMode === "raw"
        ? series.flatMap((entry) => entry.rawPoints)
        : series.flatMap((entry) => entry.filteredPoints);
    const modeAll = computeModeValue(pointsForMode.map((p) => p.y));
    const modeFirstTwoSeconds = computeModeValue(
      pointsForMode.filter((p) => Number.isFinite(p.x) && p.x <= 2).map((p) => p.y)
    );
    const meanAll = computeMeanValue(pointsForMode.map((p) => p.y));
    const meanFirstTwoSeconds = computeMeanValue(
      pointsForMode.filter((p) => Number.isFinite(p.x) && p.x <= 2).map((p) => p.y)
    );
    drawModeLine(modeAll, "#2f9e44", `Мода (все): ${modeAll?.toFixed(2) ?? "—"} мм`);
    drawModeLine(
      modeFirstTwoSeconds,
      "#f08c00",
      `Мода 0-2с: ${modeFirstTwoSeconds?.toFixed(2) ?? "—"} мм`
    );
    drawModeLine(meanAll, "#228be6", `Среднее (все): ${meanAll?.toFixed(2) ?? "—"} мм`);
    drawModeLine(
      meanFirstTwoSeconds,
      "#4c6ef5",
      `Среднее 0-2с: ${meanFirstTwoSeconds?.toFixed(2) ?? "—"} мм`
    );
    let legendX = padding.left;
    const legendY = padding.top - 6;
    series.forEach(({ session }) => {
      const color = stringToColor(session.sessionKey);
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = "#495057";
      ctx.fillText(session.sessionKey, legendX + 16, legendY);
      legendX += ctx.measureText(session.sessionKey).width + 60;
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

  const stopReadingSelection = () => {
    isSelectingReadingArea = false;
    readingSelectionStart = null;
    readingSelectionPreview = null;
    if (gazeCanvas) {
      gazeCanvas.style.cursor = "";
    }
  };

  const startReadingSelection = () => {
    if (!lastStimulusDrawRect) {
      setGazeStatus(
        "Нет изображения стимула для выбора области. Загрузите изображение и выберите сессии.",
        "warning"
      );
      return;
    }
    isSelectingReadingArea = true;
    readingSelectionStart = null;
    readingSelectionPreview = null;
    if (gazeCanvas) {
      gazeCanvas.style.cursor = "crosshair";
    }
    setGazeStatus(
      "Кликните и протяните на изображении, чтобы задать область начала чтения.",
      "primary"
    );
  };

  const handleGazeMouseDown = (event) => {
    if (!isSelectingReadingArea || !lastStimulusDrawRect) {
      return;
    }
    readingSelectionStart = { x: event.offsetX, y: event.offsetY };
    readingSelectionPreview = null;
  };

  const handleGazeMouseMove = (event) => {
    if (!isSelectingReadingArea || !readingSelectionStart || !lastStimulusDrawRect) {
      return;
    }
    const preview = screenRectToNorm(
      readingSelectionStart,
      { x: event.offsetX, y: event.offsetY },
      lastStimulusDrawRect
    );
    readingSelectionPreview = preview;
    renderGazeArea(getCurrentFilteredSessions());
  };

  const handleGazeMouseUp = (event) => {
    if (!isSelectingReadingArea || !readingSelectionStart || !lastStimulusDrawRect) {
      return;
    }
    const finalArea = screenRectToNorm(
      readingSelectionStart,
      { x: event.offsetX, y: event.offsetY },
      lastStimulusDrawRect
    );
    if (finalArea) {
      readingAreaNorm = finalArea;
      setGazeStatus("Область начала чтения сохранена. Точки после входа выделены рамкой.", "success");
    } else {
      setGazeStatus("Не удалось вычислить область. Попробуйте снова.", "warning");
    }
    stopReadingSelection();
    renderGazeArea(getCurrentFilteredSessions());
  };

  const handleGazeMouseLeave = () => {
    if (!isSelectingReadingArea) {
      return;
    }
    readingSelectionPreview = null;
    renderGazeArea(getCurrentFilteredSessions());
  };

  const clearReadingArea = () => {
    readingAreaNorm = null;
    readingSelectionPreview = null;
    stopReadingSelection();
    renderGazeArea(getCurrentFilteredSessions());
    setGazeStatus("Область начала чтения очищена.", "muted");
  };

  updateGazePlaybackButton();

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
      getCurrentFilteredSessions()
    )
  );
  gazeFilterMode?.addEventListener("change", () =>
    renderGazeArea(
      getCurrentFilteredSessions()
    )
  );
  gazePlaybackBtn?.addEventListener("click", () => {
    if (isGazePlaybackActive) {
      stopGazePlayback();
      renderGazeArea(getCurrentFilteredSessions());
    } else {
      startGazePlayback();
    }
  });
  pupilSelectAllBtn?.addEventListener("click", () => selectAllPupilSessions());
  pupilClearAllBtn?.addEventListener("click", () => clearAllPupilSessions());
  pupilFilterMode?.addEventListener("change", () =>
    renderPupilArea(
      cachedSessions || [],
      buildRecordingsMap(cachedRecordings || [])
    )
  );
  resetDbButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    await handleResetDb();
  });
  gazeSelectAreaBtn?.addEventListener("click", () => startReadingSelection());
  gazeClearAreaBtn?.addEventListener("click", () => clearReadingArea());
  gazeCanvas?.addEventListener("mousedown", handleGazeMouseDown);
  gazeCanvas?.addEventListener("mousemove", handleGazeMouseMove);
  gazeCanvas?.addEventListener("mouseup", handleGazeMouseUp);
  gazeCanvas?.addEventListener("mouseleave", handleGazeMouseLeave);

  initSectionNav();
  renderSessionsFromDB();

  console.info("Eye tracking analytics dashboard initialized.");
});
