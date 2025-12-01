document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("dataFile");
  const uploadButton = document.getElementById("uploadButton");
  const statusElement = document.getElementById("uploadStatus");
  const metaFileInput = document.getElementById("metaFile");
  const metaUploadButton = document.getElementById("metaUploadButton");
  const metaStatusElement = document.getElementById("metaUploadStatus");
  const experimentFilter = document.getElementById("experimentFilter");
  const stimulusFilter = document.getElementById("stimulusFilter");
  const unmatchedOnlyCheckbox = document.getElementById("unmatchedOnly");
  const sessionListElement = document.getElementById("sessionList");
  const sessionCountElement = document.getElementById("sessionCount");
  const pupilSessionList = document.getElementById("pupilSessionList");
  const pupilChartCanvas = document.getElementById("pupilChart");
  const pupilSelectAllBtn = document.getElementById("pupilSelectAll");
  const pupilClearAllBtn = document.getElementById("pupilClearAll");
  const resetDbButton = document.getElementById("resetDbButton");
  const resetStatusElement = document.getElementById("resetStatus");
  const parserModule = window.eyeTrackerParser;
  const rendererModule = window.eyeTrackerRenderer;

  let cachedRecordings = [];
  let cachedSessions = [];
  const selectedPupilSessions = new Set();
  const pupilChartPadding = { left: 50, right: 20, top: 20, bottom: 40 };
  let pupilView = null;
  let pupilDataBounds = null;
  let pupilBaseView = null;
  let pupilUserAdjusted = false;
  let isPanning = false;
  let panStart = null;

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

    renderPupilSelector(cachedSessions || [], recordingsByDate);
    renderPupilChart(cachedSessions || []);
  };

  const renderSessionsFromDB = async () => {
    if (!sessionListElement || !window.eyeTrackerDB) {
      return;
    }

    try {
      const sessions = await window.eyeTrackerDB.getSessions();
      const recordings = (await window.eyeTrackerDB.getRecordings()) || [];
      cachedRecordings = recordings;
      cachedSessions = sessions;

      populateFilters(recordings);
      renderWithFilters();
      const recordingsByDate = buildRecordingsMap(recordings);
      renderPupilSelector(sessions, recordingsByDate);
      renderPupilChart(sessions);
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

  const renderPupilSelector = (sessions, recordingsByDate = new Map()) => {
    if (!pupilSessionList) {
      return;
    }

    if (!sessions || sessions.length === 0) {
      pupilSessionList.innerHTML =
        '<span class="text-muted small">Загрузите сессии, чтобы выбрать их для графика.</span>';
      return;
    }

    const initialSelectionNeeded = selectedPupilSessions.size === 0;

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
        const shouldPreselect = initialSelectionNeeded && index < 3;
        const checked =
          shouldPreselect || selectedPupilSessions.has(session.sessionKey);
        if (checked) {
          selectedPupilSessions.add(session.sessionKey);
        }
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
      .map((session) => {
        const points = (session.points || []).flatMap((p) => {
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
            return [];
          }
          return [{ x: p.timeOffsetMs, y: avg }];
        });
        return { session, points };
      })
      .filter((entry) => entry.points.length > 0);

    if (series.length === 0) {
      pupilDataBounds = null;
      pupilBaseView = null;
      pupilView = null;
      ctx.fillText("Нет данных о размере зрачков для выбранных сессий.", 16, 24);
      return;
    }

    const minX = 0;
    const maxX = Math.max(...series.flatMap((s) => s.points.map((p) => p.x)));
    const allY = series.flatMap((s) => s.points.map((p) => p.y));
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
    ctx.fillText("t, мс", width - padding.right - 30, height - 10);
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

    series.forEach(({ session, points }) => {
      const color = stringToColor(session.sessionKey);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      points.forEach((pt, idx) => {
        const x = scaleX(pt.x);
        const y = scaleY(pt.y);
        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    });

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
    (cachedSessions || []).forEach((session) =>
      selectedPupilSessions.add(session.sessionKey)
    );
    pupilUserAdjusted = false;
    pupilView = pupilBaseView ? { ...pupilBaseView } : pupilView;
    renderPupilSelector(cachedSessions || [], buildRecordingsMap());
    renderPupilChart(cachedSessions || []);
  };

  const clearAllPupilSessions = () => {
    selectedPupilSessions.clear();
    pupilUserAdjusted = false;
    pupilView = pupilBaseView ? { ...pupilBaseView } : pupilView;
    renderPupilSelector(cachedSessions || [], buildRecordingsMap());
    renderPupilChart(cachedSessions || []);
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
      cachedSessions = [];
      cachedRecordings = [];
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

  pupilSelectAllBtn?.addEventListener("click", () => selectAllPupilSessions());
  pupilClearAllBtn?.addEventListener("click", () => clearAllPupilSessions());
  resetDbButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    await handleResetDb();
  });

  renderSessionsFromDB();

  console.info("Eye tracking analytics dashboard initialized.");
});
