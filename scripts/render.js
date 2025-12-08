const EyeTrackerRenderer = (() => {
  const buildRecordingKey = (dateKey, stimulusName) => {
    const datePart = String(dateKey || "").trim();
    const stimPart = String(stimulusName || "").trim();
    return [datePart, stimPart].filter(Boolean).join(" | ");
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
    const bg = `hsl(${hue}, 70%, 88%)`;
    const text = `hsl(${hue}, 55%, 30%)`;
    return { bg, text };
  };

  const getSessionPoints = (session) => {
    const normalizePointsArray = (points) =>
      points.map((pt) => {
        if (pt && typeof pt === "object" && pt.raw && typeof pt.raw === "object") {
          return { ...pt.raw };
        }
        if (pt && typeof pt === "object") {
          return { ...pt };
        }
        return {};
      });

    if (Array.isArray(session?.points)) {
      return normalizePointsArray(session.points);
    }
    if (Array.isArray(session?.points?.raw)) {
      return normalizePointsArray(session.points.raw);
    }
    if (Array.isArray(session?.raw?.points)) {
      return normalizePointsArray(session.raw.points);
    }
    return [];
  };

  const renderSessions = (container, sessions, recordingsByDate = new Map()) => {
    if (!container) {
      return;
    }

    if (!sessions || sessions.length === 0) {
      container.innerHTML =
        '<span class="text-muted">Сессии еще не загружены.</span>';
      return;
    }

    const rows = sessions
      .map((session) => {
        const points = getSessionPoints(session);
        const pointsCount =
          Number.isFinite(session.rawPointsCount) && session.rawPointsCount >= 0
            ? session.rawPointsCount
            : points.length;
        const previewPoints = points.slice(0, 3);
        const metaKey = buildRecordingKey(
          session.recordedAt,
          session.stimulusName
        );
        const meta = metaKey ? recordingsByDate.get(metaKey) : undefined;
        const experiment = meta?.experimentName || "";
        const stimulus = meta?.stimulusName || "";
        const participant = meta?.participantName || "—";
        const experimentColor = stringToColor(experiment);
        const stimulusColor = stringToColor(stimulus);
        const source = session.sourceFile || "—";
        const rowClass = meta ? "" : "table-danger";

        const sampleRows = previewPoints
          .map((point) => {
            const time =
              Number.isFinite(point.timeOffsetMs) && point.timeOffsetMs !== null
                ? point.timeOffsetMs.toFixed(3)
                : "-";
            const x =
              Number.isFinite(point.x) && point.x !== null ? point.x : "-";
            const y =
              Number.isFinite(point.y) && point.y !== null ? point.y : "-";
            const pupilLeft =
              Number.isFinite(point.pupilLeftMm) && point.pupilLeftMm !== null
                ? point.pupilLeftMm
                : "-";
            const pupilRight =
              Number.isFinite(point.pupilRightMm) && point.pupilRightMm !== null
                ? point.pupilRightMm
                : "-";

            return `
              <tr>
                <td>${time}</td>
                <td>${x}</td>
                <td>${y}</td>
                <td>${pupilLeft}</td>
                <td>${pupilRight}</td>
              </tr>
            `;
          })
          .join("");

        const metaBadges = meta
          ? `
              <span class="tag-chip" style="--tag-bg:${experimentColor.bg}; --tag-text:${experimentColor.text};">${experiment || "—"}</span>
              <span class="tag-chip" style="--tag-bg:${stimulusColor.bg}; --tag-text:${stimulusColor.text};">${stimulus || "—"}</span>
              <span class="tag-chip bg-light border text-muted">${participant}</span>
            `
          : '<span class="text-danger">Нет метаданных</span>';

        return `
          <tr class="${rowClass}">
            <td class="text-nowrap">${session.sessionKey || "Без названия"}</td>
            <td>${metaBadges}</td>
            <td class="text-nowrap">${pointsCount}</td>
            <td class="text-nowrap">${source}</td>
            <td class="text-nowrap">${meta ? "OK" : "Не найдено"}</td>
            <td>
              <details>
                <summary class="small text-primary">Первые точки</summary>
                <div class="table-responsive mt-2">
                  <table class="table table-sm table-hover align-middle mb-0">
                    <thead>
                      <tr class="table-light">
                        <th scope="col">t, с</th>
                        <th scope="col">X</th>
                        <th scope="col">Y</th>
                        <th scope="col">Зрачок L</th>
                        <th scope="col">Зрачок R</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${
                        sampleRows ||
                        `<tr><td colspan="5" class="text-muted text-center">Нет данных для отображения</td></tr>`
                      }
                    </tbody>
                  </table>
                </div>
              </details>
            </td>
          </tr>
        `;
      })
      .join("");

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr class="table-light">
              <th scope="col">Серия</th>
              <th scope="col">Эксперимент / Стимул / Участник</th>
              <th scope="col">Точек</th>
              <th scope="col">Файл</th>
              <th scope="col">Статус</th>
              <th scope="col">Детали</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  };

  const renderError = (container, message) => {
    if (!container) {
      return;
    }

    container.innerHTML = `<span class="text-danger">${message}</span>`;
  };

  return {
    renderSessions,
    renderError,
  };
})();

window.eyeTrackerRenderer = EyeTrackerRenderer;
