const EyeTrackerRenderer = (() => {
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

  const renderSessions = (container, sessions, recordingsByDate = new Map()) => {
    if (!container) {
      return;
    }

    if (!sessions || sessions.length === 0) {
      container.innerHTML =
        '<span class="text-muted">Сессии еще не загружены.</span>';
      return;
    }

    const listItems = sessions
      .map((session) => {
        const pointsCount = session.points?.length ?? 0;
        const previewPoints = session.points?.slice(0, 3) ?? [];
        const meta = recordingsByDate.get(session.sessionKey);
        const sampleRows = previewPoints
          .map((point) => {
            const time =
              Number.isFinite(point.timeOffsetMs) && point.timeOffsetMs !== null
                ? (point.timeOffsetMs).toFixed(3)
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

        const experiment = meta?.experimentName || "";
        const stimulus = meta?.stimulusName || "";
        const experimentColor = stringToColor(experiment);
        const stimulusColor = stringToColor(stimulus);
        const metaInfo = meta
          ? `
              <div class="d-flex flex-wrap gap-2 align-items-center small mb-2">
                <span class="tag-chip" style="--tag-bg:${experimentColor.bg}; --tag-text:${experimentColor.text};">Эксперимент: ${experiment || "—"}</span>
                <span class="tag-chip" style="--tag-bg:${stimulusColor.bg}; --tag-text:${stimulusColor.text};">Стимул: ${stimulus || "—"}</span>
                <span class="tag-chip bg-light border text-muted">Участник: ${meta.participantName || "—"}</span>
              </div>
            `
          : '<p class="small mb-2 text-danger">Информация по записи не найдена.</p>';

        const cardClasses = meta
          ? "mb-4"
          : "mb-4 border border-danger border-opacity-50";

        return `
          <div class="${cardClasses}">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="h6 mb-1">${session.sessionKey || "Без названия"}</h3>
              <span class="badge bg-primary bg-opacity-25 text-primary">
                Точек: ${pointsCount}
              </span>
            </div>
            ${metaInfo}
            <details class="session-points mt-2">
              <summary class="text-primary small">Первые точки (до 3)</summary>
              <div class="table-responsive mt-2">
                <table class="table table-sm table-hover align-middle mb-0">
                  <thead>
                    <tr class="table-light">
                      <th scope="col">t, мс</th>
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
          </div>
        `;
      })
      .join("");

    container.innerHTML = listItems;
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
