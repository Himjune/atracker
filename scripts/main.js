document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("dataFile");
  const uploadButton = document.getElementById("uploadButton");
  const statusElement = document.getElementById("uploadStatus");
  const metaFileInput = document.getElementById("metaFile");
  const metaUploadButton = document.getElementById("metaUploadButton");
  const metaStatusElement = document.getElementById("metaUploadStatus");
  const sessionListElement = document.getElementById("sessionList");
  const parserModule = window.eyeTrackerParser;
  const rendererModule = window.eyeTrackerRenderer;

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

  const renderSessionsFromDB = async () => {
    if (!sessionListElement || !window.eyeTrackerDB) {
      return;
    }

    try {
      const sessions = await window.eyeTrackerDB.getSessions();
      const recordings = (await window.eyeTrackerDB.getRecordings()) || [];
      const recordingsByDate = new Map(
        recordings.map((item) => [item.recordedAt, item])
      );

      if (
        !rendererModule ||
        typeof rendererModule.renderSessions !== "function"
      ) {
        sessionListElement.innerHTML =
          '<span class="text-warning">Модуль отображения недоступен.</span>';
        return;
      }

      rendererModule.renderSessions(sessionListElement, sessions, recordingsByDate);
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

        await Promise.all(
          sessions.map((session) =>
            window.eyeTrackerDB.addSession({
              sessionKey: session.sessionKey,
              points: session.points,
              createdAt: session.sessionKey,
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

        await window.eyeTrackerDB.addRecordings(recordings);
        await renderSessionsFromDB();

        setMetaStatus(
          `Загружено записей: ${recordings.length}. Данные сохранены и сопоставлены по дате.`,
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

  renderSessionsFromDB();

  console.info("Eye tracking analytics dashboard initialized.");
});
