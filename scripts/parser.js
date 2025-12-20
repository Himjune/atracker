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

    if (nonEmptyCells.length >= 1 && nonEmptyCells.length <= 3) {
      finalizeCurrentSession();
      const playbackStart = nonEmptyCells.length === 3 ? Number.parseInt(cells[1], 10) : null;
      const playbackEnd = nonEmptyCells.length === 3 ? Number.parseInt(cells[2], 10) : null;
      currentSession = {
        sessionKey: nonEmptyCells[0],
        points: [],
      };
      if (Number.isFinite(playbackStart)) {
        currentSession.playbackStartIndex = playbackStart;
      }
      if (Number.isFinite(playbackEnd)) {
        currentSession.playbackEndIndex = playbackEnd;
      }
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
      pupilAvg:
        window.eyeTrackerUtils?.computePupilAvg(pupilLeft, pupilRight) ?? null,
    };

    if (Number.isNaN(point.timeOffsetMs)) {
      continue;
    }

    currentSession.points.push(point);
  }

  finalizeCurrentSession();
  return sessions;
};

const parseMetadataWorkbook = (arrayBuffer) => {
  if (typeof XLSX === "undefined") {
    throw new Error("Библиотека XLSX не загружена.");
  }

  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const [firstSheetName] = workbook.SheetNames;
  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) {
    return [];
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  return rows
    .slice(1)
    .map((row) => {
      const experimentName = String(row[0] || "").trim();
      const stimulusName = String(row[1] || "").trim();
      const participantFullName = String(row[2] || "").trim();
      const participantName = String(row[3] || "").trim();
      const recordedAtRaw = row[4];
      const recordedAt = recordedAtRaw !== undefined ? String(recordedAtRaw).trim() : "";

      if (!recordedAt) {
        return null;
      }

      return {
        recordedAt,
        experimentName,
        stimulusName,
        participantFullName,
        participantName,
      };
    })
    .filter(Boolean);
};

window.eyeTrackerParser = {
  parseEyeTrackingCSV,
  parseMetadataWorkbook,
};
