document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("dataFile");
  const uploadButton = document.getElementById("uploadButton");
  const statusElement = document.getElementById("uploadStatus");
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

  const renderSessionsFromDB = async () => {
    if (!sessionListElement || !window.eyeTrackerDB) {
      return;
    }

    try {
      const sessions = await window.eyeTrackerDB.getSessions();

      if (
        !rendererModule ||
        typeof rendererModule.renderSessions !== "function"
      ) {
        sessionListElement.innerHTML =
          '<span class="text-warning">Модуль отображения недоступен.</span>';
        return;
      }

      rendererModule.renderSessions(sessionListElement, sessions);
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

  uploadButton?.addEventListener("click", (event) => {
    event.preventDefault();
    handleFileUpload();
  });

  renderSessionsFromDB();

  console.info("Eye tracking analytics dashboard initialized.");
});
