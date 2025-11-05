const EyeTrackerRenderer = (() => {
  const renderSessions = (container, sessions) => {
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

        return `
          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="h6 mb-1">${session.sessionKey || "Без названия"}</h3>
              <span class="badge bg-primary bg-opacity-25 text-primary">
                Точек: ${pointsCount}
              </span>
            </div>
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
