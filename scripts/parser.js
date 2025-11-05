const parseEyeTrackingCSV = (text) => {
  const sessions = [];
  const lines = text.split(/\r?\n/);
  let currentSession = null;
  let skipNextLineAsHeader = false;

  const finalizeCurrentSession = () => {
    if (currentSession && currentSession.points.length > 0) {
      sessions.push(currentSession);
    }
    currentSession = null;
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      continue;
    }

    const cells = rawLine.split(";").map((cell) => cell.trim());
    const nonEmptyCells = cells.filter((cell) => cell.length > 0);

    if (nonEmptyCells.length === 1) {
      finalizeCurrentSession();
      currentSession = {
        sessionKey: nonEmptyCells[0],
        points: [],
      };
      skipNextLineAsHeader = true;
      continue;
    }

    if (skipNextLineAsHeader) {
      skipNextLineAsHeader = false;
      continue;
    }

    if (!currentSession) {
      continue;
    }

    const [
      timeOffset,
      validity,
      x,
      y,
      z,
      pupilLeft,
      pupilRight,
    ] = cells;

    const point = {
      timeOffsetMs: Number.parseFloat(timeOffset),
      validity: Number.parseInt(validity, 10),
      x: Number.parseFloat(x),
      y: Number.parseFloat(y),
      z: Number.parseFloat(z),
      pupilLeftMm: Number.parseFloat(pupilLeft),
      pupilRightMm: Number.parseFloat(pupilRight),
    };

    if (Number.isNaN(point.timeOffsetMs)) {
      continue;
    }

    currentSession.points.push(point);
  }

  finalizeCurrentSession();
  return sessions;
};

window.eyeTrackerParser = {
  parseEyeTrackingCSV,
};
