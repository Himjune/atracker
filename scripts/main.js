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
  const parserModule = window.eyeTrackerParser;
  const rendererModule = window.eyeTrackerRenderer;

  let cachedRecordings = [];
  let cachedSessions = [];

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

    const recordingsByDate = new Map(
      (cachedRecordings || []).map((item) => {
        const key = buildRecordingKey(
          item.recordedAtDate || item.recordedAt,
          item.stimulusName
        );
        return [key, item];
      })
    );
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

  const handleFileUpload = () => {
    if (!fileInput || fileInput.files.length === 0) {
      setStatus("Выберите CSV-файл для обработки.", "warning");
      return;
    }

    const file = fileInput.files[0];
    setStatus(`Чтение файла «${file.name}»...`);

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") {
          throw new Error("Невозможно прочитать файл как текст.");
        }

        if (
          !parserModule ||
          typeof parserModule.parseEyeTrackingCSV !== "function"
        ) {
          throw new Error("Парсер CSV недоступен.");
        }

        const sessions = parserModule.parseEyeTrackingCSV(text);

        if (sessions.length === 0) {
          setStatus("Серии не найдены или файл пуст.", "warning");
          return;
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

        await renderSessionsFromDB();

        setStatus(
          `Обработано серий: ${sessions.length}. Данные сохранены.`,
          "success"
        );
      } catch (error) {
        console.error(error);
        setStatus("Ошибка обработки файла. Проверьте формат CSV.", "danger");
      }
    };

    reader.onerror = () => {
      setStatus("Ошибка чтения файла.", "danger");
    };

    reader.readAsText(file, "utf-8");
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

  uploadButton?.addEventListener("click", (event) => {
    event.preventDefault();
    handleFileUpload();
  });

  metaUploadButton?.addEventListener("click", (event) => {
    event.preventDefault();
    handleMetadataUpload();
  });

  experimentFilter?.addEventListener("change", () => renderWithFilters());
  stimulusFilter?.addEventListener("change", () => renderWithFilters());
  unmatchedOnlyCheckbox?.addEventListener("change", () => renderWithFilters());

  renderSessionsFromDB();

  console.info("Eye tracking analytics dashboard initialized.");
});
