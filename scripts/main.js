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
  const overviewParticipantFilter = document.getElementById(
    "overviewParticipantFilter"
  );
  const overviewParticipantSuggestions = document.getElementById(
    "overviewParticipantSuggestions"
  );
  const overviewParticipantClear = document.getElementById(
    "overviewParticipantClear"
  );
  const unmatchedOnlyCheckbox = document.getElementById("unmatchedOnly");
  const overviewMarkedOnlyCheckbox = document.getElementById("overviewMarkedOnly");
  const sessionListElement = document.getElementById("sessionList");
  const sessionCountElement = document.getElementById("sessionCount");
  const exportSelectedCsvButton = document.getElementById("exportSelectedCsvButton");
  const overviewSelectAllButton = document.getElementById("overviewSelectAllButton");
  const overviewClearAllButton = document.getElementById("overviewClearAllButton");
  const exportSelectedCsvStatus = document.getElementById("exportSelectedCsvStatus");
  const pupilSessionList = document.getElementById("pupilSessionList");
  const pupilChartCanvas = document.getElementById("pupilChart");
  const pupilSelectAllBtn = document.getElementById("pupilSelectAll");
  const pupilClearAllBtn = document.getElementById("pupilClearAll");
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
  const zoomXAxisInBtn = document.getElementById("zoomXAxisIn");
  const zoomXAxisOutBtn = document.getElementById("zoomXAxisOut");
  const baselineWindowSizeInput = document.getElementById("baselineWindowSize");
  const baselineSearchLengthInput = document.getElementById("baselineSearchLength");
  const baselineSearchMethodInput = document.getElementById("baselineSearchMethod");
  const baselineSearchStartInput = document.getElementById("baselineSearchStart");
  const baselineStartFromPlaybackCheckbox = document.getElementById(
    "baselineStartFromPlayback"
  );
  const baselineStartFromPlaybackOffsetCheckbox = document.getElementById(
    "baselineStartFromPlaybackOffset"
  );
  const selectBaselineBtn = document.getElementById("selectBaselineButton");
  const recomputeSelectedBaselineBtn = document.getElementById(
    "recomputeSelectedBaselineButton"
  );
  const baselineSelectStatus = document.getElementById("baselineSelectStatus");
  const zoomPupilYInBtn = document.getElementById("zoomPupilYIn");
  const zoomPupilYOutBtn = document.getElementById("zoomPupilYOut");
  const zoomVarianceYInBtn = document.getElementById("zoomVarianceYIn");
  const zoomVarianceYOutBtn = document.getElementById("zoomVarianceYOut");
  const shiftPupilYUpBtn = document.getElementById("shiftPupilYUp");
  const shiftPupilYDownBtn = document.getElementById("shiftPupilYDown");
  const shiftVarianceYUpBtn = document.getElementById("shiftVarianceYUp");
  const shiftVarianceYDownBtn = document.getElementById("shiftVarianceYDown");
  const shiftXAxisLeftBtn = document.getElementById("shiftXAxisLeft");
  const shiftXAxisRightBtn = document.getElementById("shiftXAxisRight");
  const gotoTimeInput = document.getElementById("gotoTimeValue");
  const gotoTimeBtn = document.getElementById("gotoTimeBtn");
  const showSmoothPupilCheckbox = document.getElementById("showSmoothPupil");
  const showSmoothVarianceCheckbox = document.getElementById("showSmoothVariance");
  const showInterpolatedPupilCheckbox = document.getElementById("showInterpolatedPupil");
  const showInterpolatedVarianceCheckbox = document.getElementById("showInterpolatedVariance");
  const showLeftPupilCheckbox = document.getElementById("showLeftPupil");
  const showRightPupilCheckbox = document.getElementById("showRightPupil");
  const showAvgPupilCheckbox = document.getElementById("showAvgPupil");
  const showSessionMeansCheckbox = document.getElementById("showSessionMeans");
  const showBaselineExtremaCheckbox = document.getElementById("showBaselineExtrema");
  const includeInvalidPupilCheckbox = document.getElementById("includeInvalidPupil");
  const gazeCanvas = document.getElementById("gazeCanvas");
  const gazeColorMode = document.getElementById("gazeColorMode");
  const gazeStartTimeInput = document.getElementById("gazeStartTime");
  const gazeEndTimeInput = document.getElementById("gazeEndTime");
  const gazeStartIndexInput = document.getElementById("gazeStartIndex");
  const gazeEndIndexInput = document.getElementById("gazeEndIndex");
  const gazeApplyRangeBtn = document.getElementById("gazeApplyRange");
  const gazeResetRangeBtn = document.getElementById("gazeResetRange");
  const gazeSelectStartZoneBtn = document.getElementById("gazeSelectStartZone");
  const gazeClearStartZoneBtn = document.getElementById("gazeClearStartZone");
  const gazeSelectEndZoneBtn = document.getElementById("gazeSelectEndZone");
  const gazeClearEndZoneBtn = document.getElementById("gazeClearEndZone");
  const prevSessionFloatingBtn = document.getElementById("prevSessionFloating");
  const nextSessionFloatingBtn = document.getElementById("nextSessionFloating");
  const gazePlayButton = document.getElementById("gazePlayButton");
  const gazePauseButton = document.getElementById("gazePauseButton");
  const gazeCurrentPoint = document.getElementById("gazeCurrentPoint");
  const gazeStartZoneInfo = document.getElementById("gazeStartZoneInfo");
  const gazeEndZoneInfo = document.getElementById("gazeEndZoneInfo");
  const gazeStartZoneInputs = {
    x: document.getElementById("gazeStartZoneX"),
    y: document.getElementById("gazeStartZoneY"),
    w: document.getElementById("gazeStartZoneW"),
    h: document.getElementById("gazeStartZoneH"),
  };
  const gazeEndZoneInputs = {
    x: document.getElementById("gazeEndZoneX"),
    y: document.getElementById("gazeEndZoneY"),
    w: document.getElementById("gazeEndZoneW"),
    h: document.getElementById("gazeEndZoneH"),
  };
  const gazeStimulusStatus = document.getElementById("gazeStimulusStatus");
  const insightsContent = document.getElementById("insightsContent");
  const insightsExportBtn = document.getElementById("insightsExportBtn");
  const insightsExportXlsxBtn = document.getElementById("insightsExportXlsxBtn");
  const insightsExportStatus = document.getElementById("insightsExportStatus");
  const resetDbButton = document.getElementById("resetDbButton");
  const resetStatusElement = document.getElementById("resetStatus");
  const exportDbButton = document.getElementById("exportDbButton");
  const importDbButton = document.getElementById("importDbButton");
  const importDbFileInput = document.getElementById("importDbFile");
  const dbTransferStatus = document.getElementById("dbTransferStatus");
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
  const utilsModule = window.eyeTrackerUtils;
  const baselineModule = window.eyeTrackerBaseline;
  const validityThresholdInput = document.getElementById("validityThreshold");
  const pupilMinInput = document.getElementById("pupilMin");
  const pupilMaxInput = document.getElementById("pupilMax");
  const madFactorInput = document.getElementById("madFactor");
  const diffThresholdInput = document.getElementById("diffThreshold");
  const recomputePointsButton = document.getElementById("recomputePointsButton");
  const recomputeStatusElement = document.getElementById("recomputeStatus");
  const ANALYSIS_SELECTION_STORAGE_KEY = "eyeTrackerAnalysisSelection";

  let cachedRecordings = [];
  let cachedSessions = [];
  let cachedStimuliImages = [];
  const analysisSelectedSessions = new Set();
  const selectedPupilSessions = new Set();
  const pupilChartPadding = { left: 50, right: 20, top: 20, bottom: 40 };
  let pupilView = null;
  let pupilDataBounds = null;
  let pupilBaseView = null;
  let pupilUserAdjusted = false;
  let lastPupilSelectionSignature = "";
  let varianceView = null;
  let varianceBaseView = null;
  let varianceUserAdjusted = false;
  let isPanning = false;
  let panStart = null;
  let gazePlaybackTimer = null;
  let gazePlaybackPoints = [];
  let gazePlaybackFrame = null;
  let gazePlaybackIndex = 0;
  let gazePlaybackPaused = false;
  let gazeStartZone = null; // normalized rect {x,y,w,h}
  let gazeEndZone = null; // normalized rect {x,y,w,h}
  let gazeZoneSelecting = null; // "start" | "end" | null
  let gazeZoneStartPx = null;
  let lastGazeDrawRect = null;
  const sessionPlaybackRanges = new Map();
  const stimulusImageCache = new Map();

  const getValidityThreshold = () => {
    const value = Math.round(Number(validityThresholdInput?.value));
    if (Number.isFinite(value)) {
      return Math.min(255, Math.max(0, value));
    }
    return 50;
  };

  const getPupilMin = () => {
    const value = Number(pupilMinInput?.value);
    if (Number.isFinite(value)) {
      return Math.max(0, value);
    }
    return 2;
  };

  const getPupilMax = () => {
    const value = Number(pupilMaxInput?.value);
    if (Number.isFinite(value)) {
      return Math.max(getPupilMin(), value);
    }
    return 8;
  };

  const getMadFactor = () => {
    const value = Number(madFactorInput?.value);
    if (Number.isFinite(value)) {
      return Math.max(0, value);
    }
    return 3.5;
  };

  const getDiffThreshold = () => {
    const value = Number(diffThresholdInput?.value);
    if (Number.isFinite(value)) {
      return Math.max(0, value);
    }
    return 0;
  };

  const getBaselineWindowSize = () => {
    const fallback =
      Number(baselineModule?.DEFAULT_WINDOW_SIZE_SECONDS) || 0.5;
    const value = Number(baselineWindowSizeInput?.value);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
    return fallback;
  };

  const getBaselineSearchLength = () => {
    const fallback =
      Number(baselineModule?.DEFAULT_SEARCH_LEN_SECONDS) || 3;
    const value = Number(baselineSearchLengthInput?.value);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
    return fallback;
  };

  const getBaselineSearchMethod = () => {
    const value = String(baselineSearchMethodInput?.value || "").trim();
    if (value === "firstLocalMin") {
      return "firstLocalMin";
    }
    return "minVariance";
  };

  const getBaselineSearchStart = () => {
    const fallback =
      Number(baselineModule?.DEFAULT_SEARCH_START_OFFSET_SECONDS) || 0.5;
    const value = Number(baselineSearchStartInput?.value);
    if (Number.isFinite(value) && value >= 0) {
      return value;
    }
    return fallback;
  };

  const computePupilAvg = (left, right) =>
    utilsModule?.computePupilAvg(left, right) ?? null;

  const getValidNeighbor = (points = [], idx = 0, direction = 1) => {
    for (let index = idx + direction; index >= 0 && index < points.length; index += direction) {
      const point = points[index];
      if (!point.isInvalid) return index;
    }
    return -1;
  }

  const computePointInvalid = (raw = {}) => {
    const threshold = getValidityThreshold();
    const validity = Number(raw.validity);
    const pupilLeft = Number(raw.pupilLeftMm);
    const pupilRight = Number(raw.pupilRightMm);
    const badValidity =
      Number.isFinite(validity) && validity < threshold;
    const leftBad =
      Number.isFinite(pupilLeft) &&
      (pupilLeft < getPupilMin() || pupilLeft > getPupilMax());
    const rightBad =
      Number.isFinite(pupilRight) &&
      (pupilRight < getPupilMin() || pupilRight > getPupilMax());
    const badPupil = leftBad && rightBad;
    return Boolean(badValidity || badPupil);
  };

  const normalizePointRaw = (pt) => {
    if (pt && typeof pt === "object" && pt.raw && typeof pt.raw === "object") {
      const raw = { ...pt.raw };
      const leftVal = Number(raw.pupilLeftMm);
      const rightVal = Number(raw.pupilRightMm);
      const leftBad =
        Number.isFinite(leftVal) &&
        (leftVal < getPupilMin() || leftVal > getPupilMax());
      const rightBad =
        Number.isFinite(rightVal) &&
        (rightVal < getPupilMin() || rightVal > getPupilMax());
      if (leftBad && Number.isFinite(rightVal) && !rightBad) {
        raw.pupilLeftMm = rightVal;
        raw.pupilAvg = rightVal;
      } else if (rightBad && Number.isFinite(leftVal) && !leftBad) {
        raw.pupilRightMm = leftVal;
        raw.pupilAvg = leftVal;
      } else {
        raw.pupilAvg = computePupilAvg(leftVal, rightVal);
      }
      raw.isInvalid = computePointInvalid(raw);
      return raw;
    }
    if (pt && typeof pt === "object") {
      const raw = { ...pt };
      const leftVal = Number(raw.pupilLeftMm);
      const rightVal = Number(raw.pupilRightMm);
      const leftBad =
        Number.isFinite(leftVal) &&
        (leftVal < getPupilMin() || leftVal > getPupilMax());
      const rightBad =
        Number.isFinite(rightVal) &&
        (rightVal < getPupilMin() || rightVal > getPupilMax());
      if (leftBad && Number.isFinite(rightVal) && !rightBad) {
        raw.pupilAvg = rightVal;
      } else if (rightBad && Number.isFinite(leftVal) && !leftBad) {
        raw.pupilAvg = leftVal;
      } else {
        raw.pupilAvg = computePupilAvg(leftVal, rightVal);
      }
      raw.isInvalid = computePointInvalid(raw);
      return raw;
    }
    return {
      pupilAvg: computePupilAvg(undefined, undefined),
      isInvalid: computePointInvalid({}),
    };
  };

  const applyDiffThresholdToRawPoints = (rawPoints = []) => {
    const threshold = getDiffThreshold();
    if (!Number.isFinite(threshold) || threshold <= 0) {
      return;
    }
    for (let i = 1; i < rawPoints.length; i += 1) {
      const prev = rawPoints[i - 1] || {};
      const curr = rawPoints[i] || {};
      const prevLeft = Number(prev.pupilLeftMm);
      const prevRight = Number(prev.pupilRightMm);
      const currLeft = Number(curr.pupilLeftMm);
      const currRight = Number(curr.pupilRightMm);
      const leftInvalid =
        Number.isFinite(prevLeft) &&
        Number.isFinite(currLeft) &&
        Math.abs(currLeft - prevLeft) < threshold;
      const rightInvalid =
        Number.isFinite(prevRight) &&
        Number.isFinite(currRight) &&
        Math.abs(currRight - prevRight) < threshold;
      if (leftInvalid || rightInvalid) {
        prev.isInvalid = true;
      }

      if (leftInvalid && Number.isFinite(currRight) && !rightInvalid) {
        curr.pupilLeftMm = currRight;
      } else if (rightInvalid && Number.isFinite(currLeft) && !leftInvalid) {
        curr.pupilRightMm = currLeft;
      }

      const leftVal = Number(curr.pupilLeftMm);
      const rightVal = Number(curr.pupilRightMm);
      const leftBad =
        Number.isFinite(leftVal) &&
        (leftVal < getPupilMin() || leftVal > getPupilMax());
      const rightBad =
        Number.isFinite(rightVal) &&
        (rightVal < getPupilMin() || rightVal > getPupilMax());
      if (leftBad && Number.isFinite(rightVal) && !rightBad) {
        curr.pupilAvg = rightVal;
      } else if (rightBad && Number.isFinite(leftVal) && !leftBad) {
        curr.pupilAvg = leftVal;
      } else {
        curr.pupilAvg = computePupilAvg(leftVal, rightVal);
      }
      curr.isInvalid =
        Boolean(leftInvalid && rightInvalid) || computePointInvalid(curr);
    }
  };

  const computeMedian = (values = []) => {
    const sorted = values
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
    if (sorted.length === 0) {
      return null;
    }
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  };

  const computeDilationMedians = (points = []) => {
    const leftValues = points.map((pt) => pt?.rawDilationSpeedLeft);
    const rightValues = points.map((pt) => pt?.rawDilationSpeedRight);
    return {
      left: computeMedian(leftValues),
      right: computeMedian(rightValues),
    };
  };

  const computeDilationSpeeds = (rawPoints = [], madFactor = getMadFactor()) => {
    const safeSpeed = (currVal, currTime, otherVal, otherTime) => {
      if (
        !Number.isFinite(currVal) ||
        !Number.isFinite(currTime) ||
        !Number.isFinite(otherVal) ||
        !Number.isFinite(otherTime)
      ) {
        return 0;
      }
      const dt = Math.abs(currTime - otherTime);
      if (dt <= 0) {
        return 0;
      }
      return Math.abs(currVal - otherVal) / dt;
    };

    if (!Array.isArray(rawPoints) || rawPoints.length === 0) {
      return;
    }

    const len = rawPoints.length;

    for (let i = 0; i < len; i += 1) {
      const raw = rawPoints[i] || {};
      const t = Number(raw.timeOffsetMs);
      const leftVal = Number(raw.pupilLeftMm);
      const rightVal = Number(raw.pupilRightMm);
      const prevIdx = getValidNeighbor(rawPoints, i, -1);
      const nextIdx = getValidNeighbor(rawPoints, i, 1);

      let leftSpeed = 0;
      if (Number.isFinite(leftVal) && Number.isFinite(t)) {
        const prevSpeed =
          prevIdx >= 0 
            ? safeSpeed(leftVal, t, rawPoints[prevIdx]?.pupilLeftMm, rawPoints[prevIdx]?.timeOffsetMs)
            : 0;
        const nextSpeed =
          nextIdx >= 0
            ? safeSpeed(rawPoints[nextIdx]?.pupilLeftMm, rawPoints[nextIdx]?.timeOffsetMs, leftVal, t)
            : 0;
        leftSpeed = Math.max(prevSpeed, nextSpeed);
      }

      let rightSpeed = 0;
      if (Number.isFinite(rightVal) && Number.isFinite(t)) {
        const prevSpeed =
          prevIdx >= 0
            ? safeSpeed(rightVal, t, rawPoints[prevIdx]?.pupilRightMm, rawPoints[prevIdx]?.timeOffsetMs)
            : 0;
        const nextSpeed =
          nextIdx >= 0
            ? safeSpeed(rawPoints[nextIdx]?.pupilRightMm, rawPoints[nextIdx]?.timeOffsetMs, rightVal, t)
            : 0;
        rightSpeed = Math.max(prevSpeed, nextSpeed);
      }


      raw.rawDilationSpeedLeft = leftSpeed;
      raw.rawDilationSpeedRight = rightSpeed;
    }

    const medians = computeDilationMedians(rawPoints);
    if (medians) {
      rawPoints.forEach((raw) => {
        const left = Number(raw.rawDilationSpeedLeft);
        const right = Number(raw.rawDilationSpeedRight);
        raw.rawDilationSpeedLeftMedianDiff =
          Number.isFinite(left) && Number.isFinite(medians.left)
            ? Math.abs(left - medians.left)
            : null;
        raw.rawDilationSpeedRightMedianDiff =
          Number.isFinite(right) && Number.isFinite(medians.right)
            ? Math.abs(right - medians.right)
            : null;
      });
    }

    const leftMad = computeMedian(
      rawPoints.map((pt) => pt?.rawDilationSpeedLeftMedianDiff)
    );
    const rightMad = computeMedian(
      rawPoints.map((pt) => pt?.rawDilationSpeedRightMedianDiff)
    );

    const leftMadThreshold =
      Number.isFinite(medians.left) && Number.isFinite(leftMad)
        ? medians.left + madFactor * leftMad
        : null;
    const rightMadThreshold =
      Number.isFinite(medians.right) && Number.isFinite(rightMad)
        ? medians.right + madFactor * rightMad
        : null;

    if (Number.isFinite(leftMadThreshold) || Number.isFinite(rightMadThreshold)) {
      rawPoints.forEach((raw) => {
        const leftSpeed = Number(raw.rawDilationSpeedLeft);
        const rightSpeed = Number(raw.rawDilationSpeedRight);
        const leftTooFast =
          Number.isFinite(leftMadThreshold) &&
          Number.isFinite(leftSpeed) &&
          leftSpeed > leftMadThreshold;
        const rightTooFast =
          Number.isFinite(rightMadThreshold) &&
          Number.isFinite(rightSpeed) &&
          rightSpeed > rightMadThreshold;
        if (leftTooFast && rightTooFast) {
          raw.isInvalid = true;
        }
      });
    }

    return {
      leftMedian: medians.left,
      rightMedian: medians.right,
      leftMad,
      rightMad,
      leftMadThreshold,
      rightMadThreshold,
    };
  };

  const interpolateValue = (
    prevVal,
    prevTime,
    nextVal,
    nextTime,
    currTime
  ) => {
    const hasPrev = Number.isFinite(prevVal) && Number.isFinite(prevTime);
    const hasNext = Number.isFinite(nextVal) && Number.isFinite(nextTime);
    if (
      hasPrev &&
      hasNext &&
      Number.isFinite(currTime) &&
      nextTime !== prevTime
    ) {
      const ratio = Math.min(
        1,
        Math.max(0, (currTime - prevTime) / (nextTime - prevTime))
      );
      return prevVal + (nextVal - prevVal) * ratio;
    }
    if (hasPrev) {
      return prevVal;
    }
    if (hasNext) {
      return nextVal;
    }
    return null;
  };

  const buildInterpolatedPoints = (rawPoints = []) => {
    if (!Array.isArray(rawPoints) || rawPoints.length === 0) {
      return [];
    }

    return rawPoints.map((raw, index) => {
      const base = { ...raw };
      if (!base.isInvalid) {
        return base;
      }
      const time = Number(base.timeOffsetMs);
      const prevIdx = getValidNeighbor(rawPoints, index, -1);
      const nextIdx = getValidNeighbor(rawPoints, index, 1);
      const prev = prevIdx >= 0 ? rawPoints[prevIdx] : null;
      const next = nextIdx >= 0 ? rawPoints[nextIdx] : null;
      const left = interpolateValue(
        Number(prev?.pupilLeftMm),
        Number(prev?.timeOffsetMs),
        Number(next?.pupilLeftMm),
        Number(next?.timeOffsetMs),
        time
      );
      const right = interpolateValue(
        Number(prev?.pupilRightMm),
        Number(prev?.timeOffsetMs),
        Number(next?.pupilRightMm),
        Number(next?.timeOffsetMs),
        time
      );
      return {
        ...base,
        pupilLeftMm: left,
        pupilRightMm: right,
        pupilAvg: computePupilAvg(left, right),
      };
    });
  };

  const computeMedianStep = (times = []) => {
    const validTimes = times.filter((t) => Number.isFinite(t));
    if (validTimes.length < 2) {
      return null;
    }
    const diffs = [];
    for (let i = 1; i < validTimes.length; i += 1) {
      const curr = validTimes[i];
      const prev = validTimes[i - 1];
      if (Number.isFinite(curr) && Number.isFinite(prev)) {
        const dt = Math.abs(curr - prev);
        if (dt > 0) {
          diffs.push(dt);
        }
      }
    }
    return computeMedian(diffs);
  };

  const buildGaussianWeights = (size) => {
    const half = Math.floor(size / 2);
    const sigma = Math.max(1, half / 2);
    const weights = [];
    for (let i = -half; i <= half; i += 1) {
      const exponent = -((i * i) / (2 * sigma * sigma));
      weights.push(Math.exp(exponent));
    }
    const sum = weights.reduce((acc, w) => acc + w, 0) || 1;
    return weights.map((w) => w / sum);
  };

  const applyZeroPhaseLowPass = (values = [], windowSize = 5) => {
    const sizeBase = Math.max(3, windowSize);
    const size = sizeBase % 2 === 0 ? sizeBase + 1 : sizeBase;
    if (values.length < 3 || size > values.length) {
      return values.map((v) => (Number.isFinite(v) ? v : null));
    }
    const half = Math.floor(size / 2);
    const weights = buildGaussianWeights(size);
    const smooth = values.map((value, index) => {
      let acc = 0;
      let weightAcc = 0;
      for (let offset = -half; offset <= half; offset += 1) {
        const neighborIdx = index + offset;
        if (neighborIdx < 0 || neighborIdx >= values.length) {
          continue;
        }
        const neighborVal = values[neighborIdx];
        if (!Number.isFinite(neighborVal)) {
          continue;
        }
        const weight = weights[offset + half];
        acc += neighborVal * weight;
        weightAcc += weight;
      }
      if (weightAcc <= 0) {
        return null;
      }
      return acc / weightAcc;
    });
    return smooth;
  };

  const buildSmoothedPoints = (interpolatedPoints = []) => {
    if (!Array.isArray(interpolatedPoints) || interpolatedPoints.length === 0) {
      return [];
    }

    const times = interpolatedPoints.map((pt) => Number(pt?.timeOffsetMs));
    const extractSeries = (key) =>
      interpolatedPoints.map((pt) => {
        const value = Number(pt?.[key]);
        return Number.isFinite(value) ? value : null;
      });

    const leftSeries = extractSeries("pupilLeftMm");
    const rightSeries = extractSeries("pupilRightMm");
    const avgSeries = extractSeries("pupilAvg");

    const medianStep = computeMedianStep(times);
    const baseSpan = Number.isFinite(medianStep) && medianStep > 0 ? medianStep * 9 : 9;
    const windowSamples = (() => {
      const len = interpolatedPoints.length;
      let size = Math.round(baseSpan / (medianStep || 1));
      size = Math.max(5, size);
      if (size % 2 === 0) size += 1;
      if (size >= len) {
        size = len % 2 === 0 ? len - 1 : len;
      }
      return Math.max(3, size);
    })();

    const smoothLeft = applyZeroPhaseLowPass(leftSeries, windowSamples);
    const smoothRight = applyZeroPhaseLowPass(rightSeries, windowSamples);
    const smoothAvg = applyZeroPhaseLowPass(avgSeries, windowSamples);

    return interpolatedPoints.map((base, index) => {
      const pupilLeftMm = smoothLeft[index];
      const pupilRightMm = smoothRight[index];
      const avgCandidate = smoothAvg[index];
      const pupilAvg = Number.isFinite(avgCandidate)
        ? avgCandidate
        : computePupilAvg(pupilLeftMm, pupilRightMm);
      return {
        ...(base || {}),
        pupilLeftMm: Number.isFinite(pupilLeftMm) ? pupilLeftMm : null,
        pupilRightMm: Number.isFinite(pupilRightMm) ? pupilRightMm : null,
        pupilAvg,
      };
    });
  };


  const preparePoints = (points = [], session = null) => {
    const rawPoints = Array.isArray(points)
      ? points.map((pt) => normalizePointRaw(pt))
      : [];
    applyDiffThresholdToRawPoints(rawPoints);
    const medians = computeDilationSpeeds(rawPoints);
    const interpolatedPoints = buildInterpolatedPoints(rawPoints);
    const smoothPoints = buildSmoothedPoints(interpolatedPoints);
    const windowSize = getBaselineWindowSize();
    const baselineSearchLength = getBaselineSearchLength();
    const baselineSearchStart = getBaselineSearchStart();
    const baselineSearchMethod = getBaselineSearchMethod();
    const baselineParams = {
      windowSizeSeconds: windowSize,
      searchLengthSeconds: baselineSearchLength,
      searchStartSeconds: baselineSearchStart,
      searchMethod: baselineSearchMethod,
    };
    const interpolatedBaselines =
      baselineModule?.computeBaselineWindows(interpolatedPoints, windowSize) ?? [];
    const smoothBaselines =
      baselineModule?.computeBaselineWindows(smoothPoints, windowSize) ?? [];
    const baselineSelector =
      baselineSearchMethod === "firstLocalMin"
        ? baselineModule?.selectFirstLocalMinBaseline
        : baselineModule?.selectMinVarianceBaseline;
    const fallbackSelector = baselineModule?.selectMinVarianceBaseline;
    const baselineWindow =
      typeof baselineSelector === "function"
        ? baselineSelector(
            interpolatedBaselines,
            interpolatedPoints,
            baselineSearchLength,
            baselineSearchStart
          )
        : typeof fallbackSelector === "function"
          ? fallbackSelector(
              interpolatedBaselines,
              interpolatedPoints,
              baselineSearchLength,
              baselineSearchStart
            )
          : null;
    const baselineWindowWithParams = baselineWindow
      ? { ...baselineWindow, ...baselineParams }
      : null;

    interpolatedPoints.forEach((pt, index) => {
      if (pt) {
        pt.baselineWindow = interpolatedBaselines[index];
      }
    });
    smoothPoints.forEach((pt, index) => {
      if (pt) {
        pt.baselineWindow = smoothBaselines[index];
      }
    });

    const combinedPoints = rawPoints.map((raw, index) => ({
      ...raw,
      interpolated: interpolatedPoints[index] || { ...raw },
      smooth: smoothPoints[index] || interpolatedPoints[index] || { ...raw },
    }));
    const selectedBaselineMeanDeviation = computeSelectedBaselineDeviation(
      session,
      combinedPoints
    );
    if (selectedBaselineMeanDeviation !== undefined) {
      session.selectedBaselineMeanDeviation = selectedBaselineMeanDeviation;
    }
    return {
      rawPoints,
      interpolatedPoints,
      smoothPoints,
      combinedPoints,
      medians,
      baselineWindow: baselineWindowWithParams,
    };
  };

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

  const computeSelectedBaselineDeviation = (
    session = {},
    combinedPoints = []
  ) => {
    const deviation = {
      baselineDiv: 0,
      baselineDivPerc: 0,

      baselineDivMax: -100,
      baselineDivMaxPerc: 0,
      baselineDivMaxTimeProp: 0,

      baselineDivMin: 100,
      baselineDivMinPerc: 0,
      baselineDivMinTimeProp: 0,

      baselineDivMinAfterMax: 100,
      baselineDivMinAfterMaxPerc: 0,
      baselineDivMinAfterMaxTimeProp: 0,
    };

    const baseline = session?.selectedBaselineWindow;
    if (!baseline || !Array.isArray(combinedPoints) || combinedPoints.length === 0) {
      return null;
    }
    const mean = Number(baseline.mean);
    if (!Number.isFinite(mean)) {
      return null;
    }
    const startIdxRaw = Number.isInteger(session?.playbackStartIndex)
      ? session?.playbackStartIndex
      : 0;
    const endIdxRaw = Number.isInteger(session?.playbackEndIndex)
      ? session?.playbackEndIndex
      : 0;
    const maxIndex = combinedPoints.length - 1;

    const startIdx = Number.isInteger(startIdxRaw)
      ? Math.min(Math.max(0, startIdxRaw), maxIndex)
      : 0;
    const endIdx = Number.isInteger(endIdxRaw)
      ? Math.min(Math.max(startIdx, endIdxRaw), maxIndex)
      : maxIndex;

    const lengthIdx = endIdx - startIdx;
    const lengthSafe = lengthIdx > 0 ? lengthIdx : 1;

    let sumDiv = 0;
    let count = 0;
    for (let i = startIdx; i <= endIdx; i += 1) {
      const value = Number(combinedPoints[i]?.smooth?.pupilAvg);
      const div = value - mean;
      if (!Number.isFinite(value)) {
        continue;
      }
      sumDiv += div;

      combinedPoints[i].smooth.pupilAvgDiv = div;

      if (div > deviation.baselineDivMax) {
        deviation.baselineDivMax = div;
        deviation.baselineDivMaxPerc = (div / mean) * 100;
        deviation.baselineDivMaxTimeProp = (i - startIdx) / lengthSafe * 100;

        
        deviation.baselineDivMinAfterMax = div;
        deviation.baselineDivMinAfterMaxPerc = (div / mean) * 100;
        deviation.baselineDivMinAfterMaxTimeProp = (i - startIdx) / lengthSafe * 100;
      
      }
      if (div < deviation.baselineDivMin) {
        deviation.baselineDivMin = div;
        deviation.baselineDivMinPerc = (div / mean) * 100;
        deviation.baselineDivMinTimeProp = (i - startIdx) / lengthSafe * 100;
      }

      if (div < deviation.baselineDivMinAfterMax) {
        deviation.baselineDivMinAfterMax = div;
        deviation.baselineDivMinAfterMaxPerc = (div / mean) * 100;
        deviation.baselineDivMinAfterMaxTimeProp = (i - startIdx) / lengthSafe * 100;
      }
      
      count += 1;
    }
    if (count === 0) {
      return null;
    }
    deviation.baselineDiv = sumDiv / count;
    deviation.baselineDivPerc = (sumDiv / mean / count) * 100;
    return deviation;
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

  const getSessionPoints = (session) => {
    if (Array.isArray(session?.points)) {
      const { combinedPoints, medians, baselineWindow } = preparePoints(
        session.points,
        session
      );
      if (medians) {
        session.rawDilationSpeedLeftMedian = medians.leftMedian;
        session.rawDilationSpeedRightMedian = medians.rightMedian;
        session.rawDilationSpeedLeftMAD = medians.leftMad;
        session.rawDilationSpeedRightMAD = medians.rightMad;
        session.rawDilationSpeedLeftMADThreshold = medians.leftMadThreshold;
        session.rawDilationSpeedRightMADThreshold = medians.rightMadThreshold;
      }
      session.baselineWindow = baselineWindow || null;
      return combinedPoints;
    }
    /*if (Array.isArray(session?.points?.raw)) {
      const rawPoints = session.points.raw.map(normalizePointRaw);
      computeDilationSpeeds(rawPoints);
      return rawPoints;
    }
    if (Array.isArray(session?.raw?.points)) {
      const rawPoints = session.raw.points.map(normalizePointRaw);
      computeDilationSpeeds(rawPoints);
      return rawPoints;
    }*/
    return [];
  };

  const getSelectedSessions = (sessions = []) =>
    (sessions || []).filter((session) =>
      selectedPupilSessions.has(session.sessionKey)
    );

  const syncBaselineSearchStartWithSession = (session) => {
    if (!baselineSearchStartInput || !session) {
      return;
    }
    if (
      !baselineStartFromPlaybackCheckbox?.checked &&
      !baselineStartFromPlaybackOffsetCheckbox?.checked
    ) {
      return;
    }
    const idx = Number(session.playbackStartIndex);
    if (!Number.isInteger(idx) || idx < 0) {
      return;
    }
    const points = getSessionPoints(session);
    let time = Number(points?.[idx]?.timeOffsetMs);
    if (baselineStartFromPlaybackOffsetCheckbox?.checked && Number.isFinite(time)) {
      time = Math.max(0, time - 0.3);
    }
    if (Number.isFinite(time)) {
      baselineSearchStartInput.value = time;
      if (baselineSearchLengthInput) {
        baselineSearchLengthInput.value = (time + 0.5).toFixed(3);
      }
    }
  };

  const syncBaselineSearchStartWithSelection = () => {
    if (!baselineSearchStartInput) {
      return;
    }
    if (
      !baselineStartFromPlaybackCheckbox?.checked &&
      !baselineStartFromPlaybackOffsetCheckbox?.checked
    ) {
      return;
    }
    if (selectedPupilSessions.size !== 1) {
      return;
    }
    const sessionKey = Array.from(selectedPupilSessions)[0];
    const session = (cachedSessions || []).find((s) => s.sessionKey === sessionKey);
    if (session) {
      syncBaselineSearchStartWithSession(session);
    }
  };

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

  const clampVarianceViewToBase = (view, base) => {
    if (!view || !base) {
      return view;
    }
    const targetRange = Math.min(
      view.max - view.min || 1,
      (base.max || 0) - (base.min || 0) || 1
    );
    let min = view.min;
    let max = view.max;
    if (min < base.min) {
      min = base.min;
      max = min + targetRange;
    }
    if (max > base.max) {
      max = base.max;
      min = max - targetRange;
    }
    return { min, max };
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

  const setExportSelectedCsvStatus = (message, type = "muted") => {
    if (!exportSelectedCsvStatus) {
      return;
    }
    exportSelectedCsvStatus.textContent = message;
    exportSelectedCsvStatus.className = `small text-${type}`;
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

  const setBaselineSelectStatus = (message, type = "muted") => {
    if (!baselineSelectStatus) {
      return;
    }
    baselineSelectStatus.textContent = message;
    baselineSelectStatus.className = `px-2 small text-${type}`;
  };

  const setGazeStatus = (message, type = "muted") => {
    if (!gazeStimulusStatus) {
      return;
    }
    gazeStimulusStatus.textContent = message;
    gazeStimulusStatus.className = `small text-${type}`;
  };

  const setRecomputeStatus = (message, type = "muted") => {
    if (!recomputeStatusElement) {
      return;
    }
    recomputeStatusElement.textContent = message;
    recomputeStatusElement.className = `small text-${type} mt-2`;
  };

  const setInsightsExportStatus = (message, type = "muted") => {
    if (!insightsExportStatus) {
      return;
    }
    insightsExportStatus.textContent = message;
    insightsExportStatus.className = `small text-${type}`;
  };

  const setDbTransferStatus = (message, type = "muted") => {
    if (!dbTransferStatus) {
      return;
    }
    dbTransferStatus.textContent = message;
    dbTransferStatus.className = `small text-${type}`;
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
        .flatMap((r) => [
          (r.participantFullName || "").trim(),
          (r.participantName || "").trim(),
        ])
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
      const names = [
        meta?.participantName || "",
        meta?.participantFullName || "",
      ]
        .map((v) => v.toLowerCase())
        .filter(Boolean);
      return names.some((name) => name.includes(participantQuery));
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

  const getPointTime = (points = [], idx) => {
    if (!Number.isInteger(idx) || idx < 0) return null;
    const pt = points[idx];
    const candidates = [
      pt?.timeOffsetMs,
      pt?.raw?.timeOffsetMs,
      pt?.interpolated?.timeOffsetMs,
      pt?.smooth?.timeOffsetMs,
    ];
    for (let i = 0; i < candidates.length; i += 1) {
      const num = Number(candidates[i]);
      if (Number.isFinite(num)) {
        return num;
      }
    }
    return null;
  };

  const buildInsightsEntries = (
    sessions = [],
    recordingsByDate = buildRecordingsMap(cachedRecordings || [])
  ) => {
    const selectedKeys = new Set(selectedPupilSessions || []);
    const selectedSessions = (sessions || []).filter(
      (s) => s && selectedKeys.has(s.sessionKey)
    );
    const withSelectedBaseline = selectedSessions.filter(
      (s) => s && s.selectedBaselineWindow
    );
    return withSelectedBaseline.map((session) => {
      const metaKey = buildRecordingKey(session.recordedAt, session.stimulusName);
      const meta = recordingsByDate.get(metaKey);
      const baseline = session.selectedBaselineWindow || {};
      const deviation = session.selectedBaselineMeanDeviation || {};
      const startIdx = Number.isInteger(baseline.startIndex)
        ? baseline.startIndex
        : baseline.index;
      const endIdx = Number.isInteger(baseline.endIndex)
        ? baseline.endIndex
        : startIdx;
      const startTime = getPointTime(session.points, startIdx);
      const endTime = getPointTime(session.points, endIdx);
      const playbackStartIdx = Number.isInteger(session.playbackStartIndex)
        ? session.playbackStartIndex
        : null;
      const playbackEndIdx = Number.isInteger(session.playbackEndIndex)
        ? session.playbackEndIndex
        : null;
      const playbackStartTime = getPointTime(session.points, playbackStartIdx);
      const playbackEndTime = getPointTime(session.points, playbackEndIdx);
      return {
        sessionKey: session.sessionKey || "Сессия",
        experimentName: meta?.experimentName || "—",
        stimulusName: session.stimulusName || meta?.stimulusName || "—",
        participantFullName: meta?.participantFullName || meta?.participantName || "",
        mean: Number(baseline.mean),
        variance: Number(baseline.variance),
        startIdx: Number.isInteger(startIdx) ? startIdx : null,
        endIdx: Number.isInteger(endIdx) ? endIdx : null,
        startTime,
        endTime,
        playbackStartIdx,
        playbackEndIdx,
        playbackStartTime,
        playbackEndTime,
        windowSizeSeconds: Number(baseline.windowSizeSeconds),
        searchLengthSeconds: Number(baseline.searchLengthSeconds),
        searchStartSeconds: Number(baseline.searchStartSeconds),
        baselineDiv: deviation.baselineDiv,
        baselineDivPerc: deviation.baselineDivPerc,
        baselineDivMax: deviation.baselineDivMax,
        baselineDivMaxPerc: deviation.baselineDivMaxPerc,
        baselineDivMaxTimeProp: deviation.baselineDivMaxTimeProp,
        baselineDivMin: deviation.baselineDivMin,
        baselineDivMinPerc: deviation.baselineDivMinPerc,
        baselineDivMinTimeProp: deviation.baselineDivMinTimeProp,
        baselineDivMinAfterMax: deviation.baselineDivMinAfterMax,
        baselineDivMinAfterMaxPerc: deviation.baselineDivMinAfterMaxPerc,
        baselineDivMinAfterMaxTimeProp: deviation.baselineDivMinAfterMaxTimeProp,
      };
    });
  };

  const renderInsights = (sessions = []) => {
    if (!insightsContent) {
      return;
    }
    const recordingsByDate = buildRecordingsMap(cachedRecordings || []);
    const entries = buildInsightsEntries(sessions, recordingsByDate);

    if (!entries || entries.length === 0) {
      const selectedKeys = new Set(selectedPupilSessions || []);
      if (selectedKeys.size === 0) {
        insightsContent.innerHTML =
          '<div class="text-muted small text-center py-4">Выберите сессии в секции 3, чтобы увидеть аналитику по выбранному baseline.</div>';
      } else {
        insightsContent.innerHTML =
          '<div class="text-muted small text-center py-4">Нет данных: выберите baseline у сессий, чтобы увидеть сводку.</div>';
      }
      return;
    }

    const fmt = (value, digits = 3) =>
      Number.isFinite(value) ? value.toFixed(digits) : "—";

    const rows = entries
      .map((entry) => {
        const searchParams = [
          Number.isFinite(entry.windowSizeSeconds)
            ? `Окно: ${fmt(entry.windowSizeSeconds, 2)} с`
            : null,
          Number.isFinite(entry.searchLengthSeconds)
            ? `Поиск min: ${fmt(entry.searchLengthSeconds, 2)} с`
            : null,
          Number.isFinite(entry.searchStartSeconds)
            ? `Старт: ${fmt(entry.searchStartSeconds, 2)} с`
            : null,
        ]
          .filter(Boolean)
          .join(" · ");

        return `
          <tr>
            <td class="text-nowrap">${entry.sessionKey}</td>
            <td class="text-muted">${entry.experimentName || "—"}</td>
            <td class="text-muted">${entry.stimulusName}</td>
            <td class="text-muted">${entry.participantFullName || "—"}</td>
            <td>${fmt(entry.mean)}</td>
            <td>${fmt(entry.variance)}</td>
            <td>${Number.isFinite(entry.startIdx) ? entry.startIdx : "—"} — ${
          Number.isFinite(entry.endIdx) ? entry.endIdx : "—"
        }</td>
            <td>${fmt(entry.startTime)} — ${fmt(entry.endTime)}</td>
            <td>${Number.isFinite(entry.playbackStartIdx) ? entry.playbackStartIdx : "—"}</td>
            <td>${Number.isFinite(entry.playbackEndIdx) ? entry.playbackEndIdx : "—"}</td>
            <td>${fmt(entry.playbackStartTime)}</td>
            <td>${fmt(entry.playbackEndTime)}</td>
            <td>${searchParams || "—"}</td>
            <td>${fmt(entry.baselineDiv)}</td>
            <td>${fmt(entry.baselineDivPerc)}</td>
            <td>${fmt(entry.baselineDivMax)}</td>
            <td>${fmt(entry.baselineDivMaxPerc)}</td>
            <td>${fmt(entry.baselineDivMaxTimeProp)}</td>
            <td>${fmt(entry.baselineDivMin)}</td>
            <td>${fmt(entry.baselineDivMinPerc)}</td>
            <td>${fmt(entry.baselineDivMinTimeProp)}</td>
            <td>${fmt(entry.baselineDivMinAfterMax)}</td>
            <td>${fmt(entry.baselineDivMinAfterMaxPerc)}</td>
            <td>${fmt(entry.baselineDivMinAfterMaxTimeProp)}</td>
          </tr>
        `;
      })
      .join("");

    insightsContent.innerHTML = `
      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Сессия</th>
              <th>Эксперимент</th>
              <th>Стимул</th>
              <th>Участник</th>
              <th>Mean</th>
              <th>Variance</th>
              <th>Окно (индексы)</th>
              <th>t окна, c</th>
              <th>Playback start idx</th>
              <th>Playback end idx</th>
              <th>t playback start, c</th>
              <th>t playback end, c</th>
              <th>Параметры поиска</th>
              <th>Отклонение</th>
              <th>Отклонение, %</th>
              <th>Макс откл.</th>
              <th>Макс откл., %</th>
              <th>Время макс, доля</th>
              <th>Мин откл.</th>
              <th>Мин откл., %</th>
              <th>Время мин, доля</th>
              <th>Мин после макс</th>
              <th>Мин после макс, %</th>
              <th>Время мин после макс, доля</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  };

  const renderPupilArea = (sessions, recordingsByDate) => {
    const filtered = filterPupilSessions(
      getAnalysisSelectedSessions(sessions),
      recordingsByDate
    );
    renderPupilSelector(filtered, recordingsByDate);
    renderPupilChart(filtered);
    renderGazeArea(filtered);
    renderInsights(cachedSessions || []);
  };

  const csvEscape = (value) => {
    const str = value === null || value === undefined ? "" : String(value);
    if (/[\";\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const sanitizeFileName = (value) =>
    String(value || "session")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "_")
      .replace(/\s+/g, " ")
      .trim();

  const transliterateCyrillic = (value) => {
    const map = {
      А: "A",
      Б: "B",
      В: "V",
      Г: "G",
      Д: "D",
      Е: "E",
      Ё: "E",
      Ж: "Zh",
      З: "Z",
      И: "I",
      Й: "Y",
      К: "K",
      Л: "L",
      М: "M",
      Н: "N",
      О: "O",
      П: "P",
      Р: "R",
      С: "S",
      Т: "T",
      У: "U",
      Ф: "F",
      Х: "Kh",
      Ц: "Ts",
      Ч: "Ch",
      Ш: "Sh",
      Щ: "Sch",
      Ъ: "",
      Ы: "Y",
      Ь: "",
      Э: "E",
      Ю: "Yu",
      Я: "Ya",
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "e",
      ж: "zh",
      з: "z",
      и: "i",
      й: "y",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "kh",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "sch",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
    };
    return String(value || "")
      .split("")
      .map((char) => (char in map ? map[char] : char))
      .join("");
  };

  const toFileToken = (value, { transliterate = false } = {}) => {
    const raw = transliterate ? transliterateCyrillic(value) : String(value || "");
    const cleaned = sanitizeFileName(raw);
    const underscored = cleaned
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
    return underscored || "unknown";
  };

  const toNameInitials = (value) => {
    const parts = String(value || "")
      .match(/[A-Za-zА-Яа-яЁё]+/g) || [];
    const initials = parts
      .map((part) => part.charAt(0).toUpperCase())
      .filter(Boolean);
    return initials.length > 0 ? initials.join("") : "";
  };

  const buildSessionExportFileName = (session = {}) => {
    const recordingsByDate = buildRecordingsMap(cachedRecordings || []);
    const metaKey = buildRecordingKey(session.recordedAt, session.stimulusName);
    const meta = metaKey ? recordingsByDate.get(metaKey) : null;
    const experimentRaw = meta?.experimentName || "experiment";
    const experiment = experimentRaw.replace(/\s+/g, "-");
    const stimulus = meta?.stimulusName || session.stimulusName || "stimulus";
    const sessionId = Number.isInteger(session.id) ? String(session.id) : "";
    const experimentToken = toFileToken(experiment);
    const stimulusToken = toFileToken(stimulus);
    const sessionIdToken = toFileToken(sessionId || session.sessionKey || "session", {
      transliterate: true,
    });
    return `${experimentToken}_${stimulusToken}_${sessionIdToken}.csv`;
  };

  const getSessionRawPoints = (session = {}) => {
    if (Array.isArray(session?.points)) {
      return session.points.map((pt) =>
        pt && typeof pt === "object" && pt.raw ? pt.raw : pt
      );
    }
    if (Array.isArray(session?.points?.raw)) {
      return session.points.raw;
    }
    if (Array.isArray(session?.raw?.points)) {
      return session.raw.points;
    }
    return [];
  };

  const formatSessionCsvValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : "";
    }
    if (typeof value === "string") {
      return value.trim();
    }
    return String(value);
  };

  const buildSessionCsv = (session = {}) => {
    const headerParts = [
      session.recordedAt || session.sessionKey || "Сессия",
    ];
    if (Number.isInteger(session.playbackStartIndex)) {
      headerParts.push(String(session.playbackStartIndex));
    }
    if (Number.isInteger(session.playbackEndIndex)) {
      headerParts.push(String(session.playbackEndIndex));
    }
    const headerLine = headerParts.join(";");
    const columnsLine = "TIME;Validity;X;Y;Z;LP;RP";
    const points = getSessionRawPoints(session);
    const rows = points.map((point) =>
      [
        formatSessionCsvValue(point?.timeOffsetMs),
        formatSessionCsvValue(point?.validity),
        formatSessionCsvValue(point?.x),
        formatSessionCsvValue(point?.y),
        formatSessionCsvValue(point?.z),
        formatSessionCsvValue(point?.pupilLeftMm),
        formatSessionCsvValue(point?.pupilRightMm),
      ].join(";")
    );
    return `\ufeff${[headerLine, columnsLine, ...rows].join("\n")}`;
  };

  const exportSessionCsv = (sessionKey) => {
    if (!sessionKey) {
      return;
    }
    const session = (cachedSessions || []).find((s) => s.sessionKey === sessionKey);
    if (!session) {
      return;
    }
    const csvContent = buildSessionCsv(session);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildSessionExportFileName(session);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportSelectedSessionsCsv = () => {
    const selected = getAnalysisSelectedSessions(cachedSessions || []);
    if (!selected || selected.length === 0) {
      setExportSelectedCsvStatus("Нет выбранных сессий.", "warning");
      return;
    }
    setExportSelectedCsvStatus(`Готовим выгрузку: ${selected.length} файлов...`, "muted");
    selected.forEach((session, index) => {
      window.setTimeout(() => {
        exportSessionCsv(session.sessionKey);
      }, index * 150);
    });
    setExportSelectedCsvStatus(`Запущена выгрузка: ${selected.length} файлов.`, "success");
  };

  const getInsightsExportColumns = () => [
    { key: "sessionKey", label: "session" },
    { key: "experimentName", label: "experiment" },
    { key: "stimulusName", label: "stimulus" },
    { key: "participantFullName", label: "participant_full_name" },
    { key: "mean", label: "baseline_mean" },
    { key: "variance", label: "baseline_variance" },
    { key: "startIdx", label: "window_start_idx" },
    { key: "endIdx", label: "window_end_idx" },
    { key: "startTime", label: "window_start_time_s" },
    { key: "endTime", label: "window_end_time_s" },
    { key: "playbackStartIdx", label: "playback_start_idx" },
    { key: "playbackEndIdx", label: "playback_end_idx" },
    { key: "playbackStartTime", label: "playback_start_time_s" },
    { key: "playbackEndTime", label: "playback_end_time_s" },
    { key: "windowSizeSeconds", label: "window_size_s" },
    { key: "searchLengthSeconds", label: "search_length_s" },
    { key: "searchStartSeconds", label: "search_start_s" },
    { key: "baselineDiv", label: "avg_delta" },
    { key: "baselineDivPerc", label: "avg_delta_pct" },
    { key: "baselineDivMax", label: "max_delta" },
    { key: "baselineDivMaxPerc", label: "max_delta_pct" },
    { key: "baselineDivMaxTimeProp", label: "max_delta_pos" },
    { key: "baselineDivMin", label: "min_delta" },
    { key: "baselineDivMinPerc", label: "min_delta_pct" },
    { key: "baselineDivMinTimeProp", label: "min_delta_pos" },
    { key: "baselineDivMinAfterMax", label: "min_after_max_delta" },
    { key: "baselineDivMinAfterMaxPerc", label: "min_after_max_delta_pct" },
    { key: "baselineDivMinAfterMaxTimeProp", label: "min_after_max_delta_pos" },
  ];

  const buildInsightsExportRows = (entries, columns) =>
    entries.map((entry) =>
      columns.reduce((acc, column) => {
        const value = entry[column.key];
        acc[column.label] = Number.isFinite(value) ? value : value ?? "";
        return acc;
      }, {})
    );

  const exportInsightsCsv = () => {
    const entries = buildInsightsEntries(
      getAnalysisSelectedSessions(cachedSessions || [])
    );
    if (!entries || entries.length === 0) {
      setInsightsExportStatus(
        "Нет данных для выгрузки: выберите сессии и baseline.",
        "warning"
      );
      return;
    }
    const columns = getInsightsExportColumns();
    const header = columns.map((c) => csvEscape(c.label)).join(",");
    const rows = entries.map((entry) =>
      columns
        .map((c) => {
          const value = entry[c.key];
          if (Number.isFinite(value)) {
            return csvEscape(value);
          }
          return csvEscape(value ?? "");
        })
        .join(",")
    );
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "baseline_insights.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setInsightsExportStatus(`Скачан CSV на ${entries.length} строк.`, "success");
  };

  const exportInsightsXlsx = () => {
    const entries = buildInsightsEntries(
      getAnalysisSelectedSessions(cachedSessions || [])
    );
    if (!entries || entries.length === 0) {
      setInsightsExportStatus(
        "Нет данных для выгрузки: выберите сессии и baseline.",
        "warning"
      );
      return;
    }
    if (!window.XLSX) {
      setInsightsExportStatus("XLSX модуль не загружен.", "danger");
      return;
    }
    const columns = getInsightsExportColumns();
    const rows = buildInsightsExportRows(entries, columns);
    const worksheet = window.XLSX.utils.json_to_sheet(rows, {
      header: columns.map((column) => column.label),
    });
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "baseline_insights"
    );
    window.XLSX.writeFile(workbook, "baseline_insights.xlsx");
    setInsightsExportStatus(`Скачан XLSX на ${entries.length} строк.`, "success");
  };
  const exportDatabase = async () => {
    if (!window.eyeTrackerDB) {
      setDbTransferStatus("Хранилище недоступно.", "danger");
      return;
    }
    setDbTransferStatus("Готовим выгрузку...", "muted");
    try {
      const [sessions, recordings, stimuli] = await Promise.all([
        window.eyeTrackerDB.getSessions(),
        window.eyeTrackerDB.getRecordings(),
        typeof window.eyeTrackerDB.getStimulusImages === "function"
          ? window.eyeTrackerDB.getStimulusImages()
          : [],
      ]);

      // Формируем JSON по кускам, чтобы избежать RangeError при больших массивах
      const parts = [];
      parts.push('{"sessions":[');
      (sessions || []).forEach((session, idx) => {
        if (idx > 0) parts.push(",");
        parts.push(JSON.stringify(session));
      });
      parts.push('],"recordings":[');
      (recordings || []).forEach((record, idx) => {
        if (idx > 0) parts.push(",");
        parts.push(JSON.stringify(record));
      });
      parts.push('],"stimuli":[');
      (stimuli || []).forEach((stim, idx) => {
        if (idx > 0) parts.push(",");
        parts.push(JSON.stringify(stim));
      });
      parts.push("}");

      const blob = new Blob(parts, { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "eye-tracker-db.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDbTransferStatus(
        `Выгружено: сессий ${sessions?.length || 0}, записей ${recordings?.length || 0}, стимулов ${stimuli?.length || 0}.`,
        "success"
      );
    } catch (error) {
      console.error(error);
      setDbTransferStatus("Ошибка выгрузки БД.", "danger");
    }
  };

  const importDatabase = () => {
    if (!window.eyeTrackerDB) {
      setDbTransferStatus("Хранилище недоступно.", "danger");
      return;
    }
    const file = importDbFileInput?.files?.[0];
    if (!file) {
      setDbTransferStatus("Выберите JSON-файл с базой.", "warning");
      return;
    }
    const confirmed = window.confirm(
      "Импорт перезапишет текущие данные (сессии, метаданные, стимулы). Продолжить?"
    );
    if (!confirmed) {
      return;
    }
    setDbTransferStatus("Импортируем базу...", "muted");
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        const data = JSON.parse(text);
        if (!data || typeof data !== "object") {
          throw new Error("Неверный формат файла.");
        }
        const sessions = Array.isArray(data.sessions) ? data.sessions : [];
        const recordings = Array.isArray(data.recordings) ? data.recordings : [];
        const stimuli = Array.isArray(data.stimuli) ? data.stimuli : [];

        await window.eyeTrackerDB.clearSessions();
        if (typeof window.eyeTrackerDB.clearRecordings === "function") {
          await window.eyeTrackerDB.clearRecordings();
        }
        if (typeof window.eyeTrackerDB.clearStimulusImages === "function") {
          await window.eyeTrackerDB.clearStimulusImages();
        }
        localStorage.removeItem(ANALYSIS_SELECTION_STORAGE_KEY);

        if (stimuli.length && typeof window.eyeTrackerDB.addStimulusImage === "function") {
          await Promise.all(stimuli.map((item) => window.eyeTrackerDB.addStimulusImage(item)));
        }
        if (recordings.length) {
          await window.eyeTrackerDB.addRecordings(recordings);
        }
        if (sessions.length) {
          await Promise.all(sessions.map((s) => window.eyeTrackerDB.addSession(s)));
        }

        await renderSessionsFromDB();
        setDbTransferStatus(
          `Импорт завершён: сессий ${sessions.length}, записей ${recordings.length}, стимулов ${stimuli.length}.`,
          "success"
        );
      } catch (error) {
        console.error(error);
        setDbTransferStatus("Ошибка импорта БД. Проверьте файл.", "danger");
      }
    };
    reader.onerror = () => setDbTransferStatus("Не удалось прочитать файл.", "danger");
    reader.readAsText(file);
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
    const participants = new Set();

    recordings.forEach((record) =>
      experiments.add((record.experimentName || "").trim())
    );
    recordings.forEach((record) =>
      stimuli.add((record.stimulusName || "").trim())
    );
    recordings.forEach((record) => {
      const full = (record.participantFullName || "").trim();
      const short = (record.participantName || "").trim();
      if (full) participants.add(full);
      if (short) participants.add(short);
    });

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

    if (overviewParticipantSuggestions) {
      const options = Array.from(participants)
        .sort((a, b) => a.localeCompare(b))
        .map((value) => `<option value="${value}"></option>`)
        .join("");
      overviewParticipantSuggestions.innerHTML = options;
    }
  };

  const applyFilters = (sessions, recordingsByDate) => {
    const expFilter = experimentFilter?.value || "all";
    const stimFilter = stimulusFilter?.value || "all";
    const unmatchedOnly = unmatchedOnlyCheckbox?.checked || false;
    const markedOnly = overviewMarkedOnlyCheckbox?.checked || false;
    const participantQuery = (overviewParticipantFilter?.value || "").trim().toLowerCase();

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
      if (participantQuery) {
        const names = [
          meta?.participantName || "",
          meta?.participantFullName || "",
        ]
          .map((v) => v.toLowerCase())
          .filter(Boolean);
        if (!names.some((name) => name.includes(participantQuery))) {
          return false;
        }
      }
      if (markedOnly && !analysisSelectedSessions.has(session.sessionKey)) {
        return false;
      }
      return true;
    });
  };

  const getAnalysisSelectedSessions = (sessions = []) =>
    analysisSelectedSessions && analysisSelectedSessions.size > 0
      ? (sessions || []).filter((session) =>
          analysisSelectedSessions.has(session.sessionKey)
        )
      : [];

  const persistAnalysisSelection = () => {
    try {
      const keys = Array.from(analysisSelectedSessions || []);
      localStorage.setItem(ANALYSIS_SELECTION_STORAGE_KEY, JSON.stringify(keys));
    } catch (err) {
      console.warn("Не удалось сохранить выбор для анализа", err);
    }
  };

  const loadAnalysisSelection = (sessions = []) => {
    analysisSelectedSessions.clear();
    try {
      const raw = localStorage.getItem(ANALYSIS_SELECTION_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved)) {
        return;
      }
      const sessionKeys = new Set((sessions || []).map((s) => s.sessionKey));
      saved.forEach((key) => {
        if (sessionKeys.has(key)) {
          analysisSelectedSessions.add(key);
        }
      });
    } catch (err) {
      console.warn("Не удалось загрузить сохранённый выбор анализа", err);
    }
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
      recordingsByDate,
      { selectedKeys: analysisSelectedSessions }
    );

    sessionListElement
      .querySelectorAll(".analysis-toggle")
      .forEach((checkbox) =>
        checkbox.addEventListener("change", (event) => {
          const key = event.target.dataset.sessionKey;
          if (!key) return;
          if (event.target.checked) {
            analysisSelectedSessions.add(key);
          } else {
            analysisSelectedSessions.delete(key);
            selectedPupilSessions.delete(key);
          }
          persistAnalysisSelection();
          renderPupilArea(cachedSessions || [], recordingsByDate);
        })
      );

    sessionListElement
      .querySelectorAll(".session-export-csv")
      .forEach((button) =>
        button.addEventListener("click", (event) => {
          const key = event.currentTarget.dataset.sessionKey;
          exportSessionCsv(key);
        })
      );

    renderPupilArea(cachedSessions || [], recordingsByDate);
  };

  const renderSessionsFromDB = async () => {
    if (!sessionListElement || !window.eyeTrackerDB) {
      return;
    }

    try {
      const sessions = await window.eyeTrackerDB.getSessions();
      (sessions || []).forEach((session) => {
        getSessionPoints(session);
      });
      const recordings = (await window.eyeTrackerDB.getRecordings()) || [];
      const stimuliImages =
        typeof window.eyeTrackerDB.getStimulusImages === "function"
          ? await window.eyeTrackerDB.getStimulusImages()
          : [];
      cachedRecordings = recordings;
      cachedSessions = sessions;
      sessionPlaybackRanges.clear();
      loadAnalysisSelection(sessions); // восстановить выбор анализа между перезагрузками
      cachedStimuliImages = stimuliImages || [];
      stimulusImageCache.clear();

      populateFilters(recordings);
      renderWithFilters();
      const recordingsByDate = buildRecordingsMap(recordings);
      populatePupilStimulusFilter(recordings);
      populatePupilParticipantSuggestions(recordings);
      renderPupilArea(sessions, recordingsByDate);
      renderInsights(sessions);
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

  const getSessionRange = (sessionKey) => {
    if (!sessionKey) return { start: null, end: null, startIndex: null, endIndex: null };
    const stored = sessionPlaybackRanges.get(sessionKey);
    if (stored) {
      return stored;
    }
    const session =
      (cachedSessions || []).find((s) => s.sessionKey === sessionKey) || null;
    if (!session) {
      return { start: null, end: null, startIndex: null, endIndex: null };
    }
    const startIndex = Number.isInteger(session.playbackStartIndex)
      ? session.playbackStartIndex
      : null;
    const endIndex = Number.isInteger(session.playbackEndIndex)
      ? session.playbackEndIndex
      : null;
    const points = getSessionPoints(session);
    const startTime =
      startIndex !== null ? Number(points?.[startIndex]?.timeOffsetMs) : null;
    const endTime =
      endIndex !== null ? Number(points?.[endIndex]?.timeOffsetMs) : null;
    const range = {
      start: Number.isFinite(startTime) ? startTime : null,
      end: Number.isFinite(endTime) ? endTime : null,
      startIndex,
      endIndex,
    };
    sessionPlaybackRanges.set(sessionKey, range);
    return range;
  };

  const getFirstSelectedSession = () =>
    (cachedSessions || []).find((s) => selectedPupilSessions.has(s.sessionKey)) || null;

  const updateRangeInputs = (range = {}) => {
    if (gazeStartTimeInput) {
      gazeStartTimeInput.value = Number.isFinite(range.start) ? range.start : "";
    }
    if (gazeEndTimeInput) {
      gazeEndTimeInput.value = Number.isFinite(range.end) ? range.end : "";
    }
    if (gazeStartIndexInput) {
      gazeStartIndexInput.value =
        Number.isInteger(range.startIndex) && range.startIndex >= 0
          ? range.startIndex
          : "";
    }
    if (gazeEndIndexInput) {
      gazeEndIndexInput.value =
        Number.isInteger(range.endIndex) && range.endIndex >= 0 ? range.endIndex : "";
    }
  };

  const syncIndicesFromTimes = () => {
    const session = getFirstSelectedSession();
    if (!session) return;
    const points = getSessionPoints(session);
    if (!Array.isArray(points) || points.length === 0) return;
    const startValue = Number(gazeStartTimeInput?.value);
    const endValue = Number(gazeEndTimeInput?.value);
    const start = Number.isFinite(startValue) && startValue >= 0 ? startValue : null;
    const end = Number.isFinite(endValue) && endValue >= 0 ? endValue : null;
    const startIdx =
      start === null
        ? 0
        : points.findIndex(
            (p) => Number.isFinite(p?.timeOffsetMs) && p.timeOffsetMs >= start
          );
    const endIdx = (() => {
      if (end === null) return points.length - 1;
      for (let i = points.length - 1; i >= 0; i -= 1) {
        const t = Number(points[i]?.timeOffsetMs);
        if (Number.isFinite(t) && t <= end) {
          return i;
        }
      }
      return startIdx >= 0 ? startIdx : 0;
    })();
    if (gazeStartIndexInput) {
      gazeStartIndexInput.value = startIdx >= 0 ? startIdx : "";
    }
    if (gazeEndIndexInput) {
      gazeEndIndexInput.value = endIdx >= 0 ? endIdx : "";
    }
  };

  const syncTimesFromIndices = () => {
    const session = getFirstSelectedSession();
    if (!session) return;
    const points = getSessionPoints(session);
    if (!Array.isArray(points) || points.length === 0) return;
    const startIdxVal = Number(gazeStartIndexInput?.value);
    const endIdxVal = Number(gazeEndIndexInput?.value);
    const clamp = (idx) =>
      Number.isInteger(idx) && idx >= 0 ? Math.min(points.length - 1, idx) : null;
    const startIdx = clamp(startIdxVal);
    const endIdx = clamp(endIdxVal);
    if (gazeStartTimeInput) {
      gazeStartTimeInput.value =
        startIdx !== null && Number.isFinite(points[startIdx]?.timeOffsetMs)
          ? points[startIdx].timeOffsetMs
          : "";
    }
    if (gazeEndTimeInput) {
      gazeEndTimeInput.value =
        endIdx !== null && Number.isFinite(points[endIdx]?.timeOffsetMs)
          ? points[endIdx].timeOffsetMs
          : "";
    }
  };

  const isPointInStartZone = (point = {}) => {
    if (!gazeStartZone) return false;
    const nx = Number(point.x);
    const ny = Number(point.y);
    if (!Number.isFinite(nx) || !Number.isFinite(ny)) {
      return false;
    }
    return (
      nx >= gazeStartZone.x &&
      nx <= gazeStartZone.x + gazeStartZone.w &&
      ny >= gazeStartZone.y &&
      ny <= gazeStartZone.y + gazeStartZone.h
    );
  };

  const applyZoneInputs = () => {
    const startZone = readZoneFromInputs(gazeStartZoneInputs);
    if (startZone) {
      gazeStartZone = startZone;
    }
    const endZone = readZoneFromInputs(gazeEndZoneInputs);
    if (endZone) {
      gazeEndZone = endZone;
    }
    renderGazeArea(
      filterPupilSessions(cachedSessions || [], buildRecordingsMap(cachedRecordings || []))
    );
  };

  const shiftSelectedSession = (direction) => {
    const recordingsByDate = buildRecordingsMap(cachedRecordings || []);
    const filtered = filterPupilSessions(
      getAnalysisSelectedSessions(cachedSessions || []),
      recordingsByDate
    );
    if (!filtered.length) {
      return;
    }
    const keys = filtered.map((s) => s.sessionKey);
    const currentIndex = keys.findIndex((key) => selectedPupilSessions.has(key));
    let targetIndex = 0;
    if (currentIndex >= 0) {
      targetIndex =
        direction === "next"
          ? Math.min(keys.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);
    } else {
      targetIndex = direction === "next" ? 0 : keys.length - 1;
    }
    selectedPupilSessions.clear();
    selectedPupilSessions.add(keys[targetIndex]);
    const session = filtered.find((s) => s.sessionKey === keys[targetIndex]);
    if (session) {
      syncBaselineSearchStartWithSession(session);
    }
    pupilUserAdjusted = false;
    renderPupilArea(filtered, recordingsByDate);
    renderGazeArea(filtered);
  };

  const applyRangeToSelected = async () => {
    const startValue = Number(gazeStartTimeInput?.value);
    const endValue = Number(gazeEndTimeInput?.value);
    const start = Number.isFinite(startValue) && startValue >= 0 ? startValue : null;
    const end = Number.isFinite(endValue) && endValue >= 0 ? endValue : null;
    const startIndexInputVal = Number(gazeStartIndexInput?.value);
    const endIndexInputVal = Number(gazeEndIndexInput?.value);
    const startIndexInput =
      Number.isInteger(startIndexInputVal) && startIndexInputVal >= 0
        ? startIndexInputVal
        : null;
    const endIndexInput =
      Number.isInteger(endIndexInputVal) && endIndexInputVal >= 0
        ? endIndexInputVal
        : null;
    if (end !== null && start !== null && end < start) {
      setGazeStatus("Конец не может быть меньше старта.", "warning");
      return;
    }
    const selected = Array.from(selectedPupilSessions || []);
    if (selected.length === 0) {
      setGazeStatus("Сначала выберите хотя бы одну сессию.", "warning");
      return;
    }
    const updatedSessions = [];
    selected.forEach((key) => {
      const session =
        (cachedSessions || []).find((s) => s.sessionKey === key) || null;
      if (!session) return;
      const points = getSessionPoints(session);
      const total = Array.isArray(points) ? points.length : 0;
      const clampIndex = (idx) => {
        if (!Number.isInteger(idx) || idx < 0 || total === 0) return null;
        return Math.min(total - 1, idx);
      };
      const startIdx = clampIndex(startIndexInput);
      const endIdx = clampIndex(endIndexInput);
      const calcStartIdx =
        startIdx !== null
          ? startIdx
          : (() => {
              if (!Array.isArray(points) || points.length === 0) return null;
              if (gazeStartZone) {
                const idx = points.findIndex((p) => {
                  const nx = Number(p?.x);
                  const ny = Number(p?.y);
                  if (!Number.isFinite(nx) || !Number.isFinite(ny)) return false;
                  return (
                    nx >= gazeStartZone.x &&
                    nx <= gazeStartZone.x + gazeStartZone.w &&
                    ny >= gazeStartZone.y &&
                    ny <= gazeStartZone.y + gazeStartZone.h
                  );
                });
                if (idx >= 0) return idx;
              }
              if (start === null) return 0;
              const idx = points.findIndex(
                (p) => Number.isFinite(p?.timeOffsetMs) && p.timeOffsetMs >= start
              );
              return idx >= 0 ? idx : points.length - 1;
            })();
      const calcEndIdx =
        endIdx !== null
          ? endIdx
          : (() => {
              if (!Array.isArray(points) || points.length === 0) return null;
              if (gazeEndZone && gazeStartZone) {
                let visitedEnd = false;
                for (let i = 0; i < points.length; i += 1) {
                  const pt = points[i];
                  const nx = Number(pt?.x);
                  const ny = Number(pt?.y);
                  const inEnd =
                    Number.isFinite(nx) &&
                    Number.isFinite(ny) &&
                    nx >= gazeEndZone.x &&
                    nx <= gazeEndZone.x + gazeEndZone.w &&
                    ny >= gazeEndZone.y &&
                    ny <= gazeEndZone.y + gazeEndZone.h;
                  if (inEnd) {
                    visitedEnd = true;
                  }
                  const inStart =
                    Number.isFinite(nx) &&
                    Number.isFinite(ny) &&
                    nx >= gazeStartZone.x &&
                    nx <= gazeStartZone.x + gazeStartZone.w &&
                    ny >= gazeStartZone.y &&
                    ny <= gazeStartZone.y + gazeStartZone.h;
                  if (visitedEnd && inStart) {
                    return i;
                  }
                }
              }
              if (end === null) return points.length - 1;
              for (let i = points.length - 1; i >= 0; i -= 1) {
                const t = Number(points[i]?.timeOffsetMs);
                if (Number.isFinite(t) && t <= end) {
                  return i;
                }
              }
              return calcStartIdx !== null ? calcStartIdx : null;
            })();
      const startIndex = clampIndex(calcStartIdx);
      const endIndex = clampIndex(calcEndIdx !== null ? calcEndIdx : calcStartIdx);
      const startTimeActual =
        startIndex !== null ? Number(points?.[startIndex]?.timeOffsetMs) : null;
      const endTimeActual =
        endIndex !== null ? Number(points?.[endIndex]?.timeOffsetMs) : null;
      const range = {
        start: Number.isFinite(startTimeActual) ? startTimeActual : start,
        end: Number.isFinite(endTimeActual) ? endTimeActual : end,
        startIndex,
        endIndex,
      };
      sessionPlaybackRanges.set(key, range);
      updatedSessions.push({
        ...session,
        playbackStartIndex: startIndex,
        playbackEndIndex: endIndex,
      });
    });

    if (updatedSessions.length > 0) {
      try {
        await Promise.all(
          updatedSessions.map((session) => window.eyeTrackerDB.addSession(session))
        );
        cachedSessions = (cachedSessions || []).map((session) => {
          const found = updatedSessions.find((s) => s.sessionKey === session.sessionKey);
          return found ? found : session;
        });
        setGazeStatus(
          `Интервал сохранен в БД для ${updatedSessions.length} сессий.`,
          "success"
        );
      } catch (error) {
        console.error(error);
        setGazeStatus("Не удалось сохранить интервал в БД.", "danger");
      }
    }

    renderPupilArea(cachedSessions || [], buildRecordingsMap(cachedRecordings || []));
    renderGazeArea(
      filterPupilSessions(cachedSessions || [], buildRecordingsMap(cachedRecordings || []))
    );
  };

  const selectBaselineForSelected = async () => {
    if (!window.eyeTrackerDB) {
      setBaselineSelectStatus("Хранилище недоступно.", "danger");
      return;
    }
    const selected = Array.from(selectedPupilSessions || []);
    if (selected.length === 0) {
      setBaselineSelectStatus("Сначала выберите хотя бы одну сессию.", "warning");
      return;
    }

    const updatedSessions = [];
    let missingBaseline = 0;

    selected.forEach((key) => {
      const session =
        (cachedSessions || []).find((s) => s.sessionKey === key) || null;
      if (!session) return;
      const points = getSessionPoints(session); // обновляем baseline с текущими параметрами
      const baseline = session.baselineWindow;
      if (!baseline) {
        missingBaseline += 1;
        return;
      }
      const selectedBaselineWindow = { ...baseline };
      const selectedBaselineMeanDeviation = computeSelectedBaselineDeviation(
        { ...session, selectedBaselineWindow },
        points
      );
      updatedSessions.push({
        ...session,
        selectedBaselineWindow,
        selectedBaselineMeanDeviation,
      });
    });

    if (updatedSessions.length === 0) {
      setBaselineSelectStatus(
        missingBaseline > 0
          ? "Нет вычисленного baseline для выбранных сессий."
          : "Нечего сохранять.",
        "warning"
      );
      return;
    }

    try {
      await Promise.all(
        updatedSessions.map((session) => window.eyeTrackerDB.addSession(session))
      );
      cachedSessions = (cachedSessions || []).map((session) => {
        const found = updatedSessions.find((s) => s.sessionKey === session.sessionKey);
        return found ? found : session;
      });
      const suffix =
        missingBaseline > 0
          ? ` (пропущено без baseline: ${missingBaseline})`
          : "";
      setBaselineSelectStatus(
        `Baseline сохранен для ${updatedSessions.length} сессий${suffix}.`,
        "success"
      );
      renderPupilChart(cachedSessions || []);
      renderInsights(cachedSessions || []);
    } catch (error) {
      console.error(error);
      setBaselineSelectStatus("Не удалось сохранить baseline в БД.", "danger");
    }
  };

  const recomputeSelectedBaselineForSelected = async () => {
    if (!window.eyeTrackerDB) {
      setBaselineSelectStatus("Хранилище недоступно.", "danger");
      return;
    }
    const selected = Array.from(selectedPupilSessions || []);
    if (selected.length === 0) {
      setBaselineSelectStatus("Сначала выберите хотя бы одну сессию.", "warning");
      return;
    }

    const updatedSessions = [];
    let missingBaseline = 0;

    selected.forEach((key) => {
      const session =
        (cachedSessions || []).find((s) => s.sessionKey === key) || null;
      if (!session) return;
      if (!session.selectedBaselineWindow) {
        missingBaseline += 1;
        return;
      }
      const points = getSessionPoints(session);
      const selectedBaselineWindow = { ...session.selectedBaselineWindow };
      const selectedBaselineMeanDeviation = computeSelectedBaselineDeviation(
        { ...session, selectedBaselineWindow },
        points
      );
      updatedSessions.push({
        ...session,
        selectedBaselineWindow,
        selectedBaselineMeanDeviation,
      });
    });

    if (updatedSessions.length === 0) {
      setBaselineSelectStatus(
        missingBaseline > 0
          ? "Нет выбранного baseline для пересчета."
          : "Нечего пересчитывать.",
        "warning"
      );
      return;
    }

    try {
      await Promise.all(
        updatedSessions.map((session) => window.eyeTrackerDB.addSession(session))
      );
      cachedSessions = (cachedSessions || []).map((session) => {
        const found = updatedSessions.find((s) => s.sessionKey === session.sessionKey);
        return found ? found : session;
      });
      const suffix =
        missingBaseline > 0
          ? ` (пропущено без baseline: ${missingBaseline})`
          : "";
      setBaselineSelectStatus(
        `Baseline пересчитан для ${updatedSessions.length} сессий${suffix}.`,
        "success"
      );
      renderPupilChart(cachedSessions || []);
      renderInsights(cachedSessions || []);
    } catch (error) {
      console.error(error);
      setBaselineSelectStatus("Не удалось пересчитать baseline в БД.", "danger");
    }
  };

  const resetRangeForSelected = async () => {
    const selected = Array.from(selectedPupilSessions || []);
    if (selected.length === 0) {
      setGazeStatus("Сначала выберите хотя бы одну сессию.", "warning");
      return;
    }
    const updatedSessions = [];
    selected.forEach((key) => {
      const session =
        (cachedSessions || []).find((s) => s.sessionKey === key) || null;
      if (!session) return;
      const cleaned = { ...session };
      delete cleaned.playbackStartIndex;
      delete cleaned.playbackEndIndex;
      sessionPlaybackRanges.delete(key);
      updatedSessions.push(cleaned);
    });

    if (updatedSessions.length > 0) {
      try {
        await Promise.all(
          updatedSessions.map((session) => window.eyeTrackerDB.addSession(session))
        );
        cachedSessions = (cachedSessions || []).map((session) => {
          const found = updatedSessions.find((s) => s.sessionKey === session.sessionKey);
          return found ? found : session;
        });
        setGazeStatus(
          `Старт/конец сброшены для ${updatedSessions.length} сессий.`,
          "success"
        );
      } catch (error) {
        console.error(error);
        setGazeStatus("Не удалось сбросить старт/конец в БД.", "danger");
      }
    }

    if (gazeStartTimeInput) gazeStartTimeInput.value = "";
    if (gazeEndTimeInput) gazeEndTimeInput.value = "";
    if (gazeStartIndexInput) gazeStartIndexInput.value = "";
    if (gazeEndIndexInput) gazeEndIndexInput.value = "";
    renderPupilArea(cachedSessions || [], buildRecordingsMap(cachedRecordings || []));
    renderGazeArea(
      filterPupilSessions(cachedSessions || [], buildRecordingsMap(cachedRecordings || []))
    );
  };

  const recomputeStoredPoints = async () => {
    if (!window.eyeTrackerDB) {
      setRecomputeStatus("Хранилище недоступно.", "danger");
      return;
    }
    if (!cachedSessions || cachedSessions.length === 0) {
      setRecomputeStatus("Нет сессий для пересчета.", "warning");
      return;
    }

    setRecomputeStatus("Пересчитываем точки по новым порогам...", "muted");
    recomputePointsButton?.setAttribute("disabled", "disabled");

    try {
      const updatedSessions = cachedSessions.map((session) => {
        const {
          rawPoints: normalizedRawPoints,
          interpolatedPoints,
          smoothPoints,
          medians,
          baselineWindow,
        } = preparePoints(session.points, session);
        const points = normalizedRawPoints.map((raw, index) => ({
          raw,
          interpolated: interpolatedPoints[index],
          smooth: smoothPoints[index],
        }));
        const rawDilationSpeedLeftMedian =
          medians?.leftMedian ?? session.rawDilationSpeedLeftMedian ?? null;
        const rawDilationSpeedRightMedian =
          medians?.rightMedian ?? session.rawDilationSpeedRightMedian ?? null;
        const rawDilationSpeedLeftMAD =
          medians?.leftMad ?? session.rawDilationSpeedLeftMAD ?? null;
        const rawDilationSpeedRightMAD =
          medians?.rightMad ?? session.rawDilationSpeedRightMAD ?? null;
        const rawDilationSpeedLeftMADThreshold =
          medians?.leftMadThreshold ??
          session.rawDilationSpeedLeftMADThreshold ??
          null;
        const rawDilationSpeedRightMADThreshold =
          medians?.rightMadThreshold ??
          session.rawDilationSpeedRightMADThreshold ??
          null;
        const selectedBaselineMeanDeviation = computeSelectedBaselineDeviation(
          session,
          points
        );
        return {
          ...session,
          points,
          rawPointsCount: points.length,
          rawInvalidCount: normalizedRawPoints.filter((p) => p?.isInvalid).length,
          rawDilationSpeedLeftMAD,
          rawDilationSpeedRightMAD,
          rawDilationSpeedLeftMedian,
          rawDilationSpeedRightMedian,
          rawDilationSpeedLeftMADThreshold,
          rawDilationSpeedRightMADThreshold,
          baselineWindow: baselineWindow || null,
          selectedBaselineMeanDeviation,
        };
      });

      await Promise.all(
        updatedSessions.map((session) => window.eyeTrackerDB.addSession(session))
      );
      await renderSessionsFromDB();
      setRecomputeStatus("Точки пересчитаны и сохранены.", "success");
    } catch (error) {
      console.error(error);
      setRecomputeStatus("Не удалось пересчитать точки. Попробуйте еще раз.", "danger");
    } finally {
      recomputePointsButton?.removeAttribute("disabled");
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
          sessions.map((session) => {
            const {
              rawPoints: normalizedRawPoints,
              interpolatedPoints,
              smoothPoints,
              medians,
              baselineWindow,
            } = preparePoints(session.points, session);
            const mappedPoints = normalizedRawPoints.map((raw, index) => ({
              raw,
              interpolated: interpolatedPoints[index],
              smooth: smoothPoints[index],
            }));
            const rawInvalidCount = normalizedRawPoints.filter((p) => p?.isInvalid).length;
            const rawPointsCount = normalizedRawPoints.length;
            const rawDilationSpeedLeftMedian = medians?.leftMedian ?? null;
            const rawDilationSpeedRightMedian = medians?.rightMedian ?? null;
            const rawDilationSpeedLeftMAD = medians?.leftMad ?? null;
            const rawDilationSpeedRightMAD = medians?.rightMad ?? null;
            const rawDilationSpeedLeftMADThreshold = medians?.leftMadThreshold ?? null;
            const rawDilationSpeedRightMADThreshold = medians?.rightMadThreshold ?? null;
            const playbackStartIndex = Number.isInteger(session.playbackStartIndex)
              ? session.playbackStartIndex
              : null;
            const playbackEndIndex = Number.isInteger(session.playbackEndIndex)
              ? session.playbackEndIndex
              : null;
            return window.eyeTrackerDB.addSession({
              sessionKey: buildSessionKey(session.sessionKey, file.name),
              recordedAt: session.sessionKey,
              stimulusName,
              points: mappedPoints,
              rawPointsCount,
              rawInvalidCount,
              rawDilationSpeedLeftMAD,
              rawDilationSpeedRightMAD,
              rawDilationSpeedLeftMedian,
              rawDilationSpeedRightMedian,
              rawDilationSpeedLeftMADThreshold,
              rawDilationSpeedRightMADThreshold,
              playbackStartIndex,
              playbackEndIndex,
              baselineWindow: baselineWindow || null,
              createdAt: session.sessionKey,
              sourceFile: file.name,
            });
          })
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

  const stopGazePlayback = () => {
    if (gazePlaybackTimer) {
      clearInterval(gazePlaybackTimer);
      gazePlaybackTimer = null;
    }
    gazePlaybackIndex = 0;
    gazePlaybackPaused = false;
    gazePlayButton?.removeAttribute("disabled");
    if (gazePlayButton) {
      gazePlayButton.textContent = "▶ Проиграть точки";
    }
    if (gazeCurrentPoint) {
      gazeCurrentPoint.value = "";
    }
    if (gazePauseButton) {
      gazePauseButton.textContent = "❚❚ Пауза";
    }
  };

  const resumeGazePlayback = () => {
    if (!gazeCanvas || !gazePlaybackFrame || gazePlaybackPoints.length === 0) {
      return;
    }
    gazePlaybackPaused = false;
    if (gazePlayButton) {
      gazePlayButton.textContent = "■ Стоп";
    }
    if (gazePauseButton) {
      gazePauseButton.textContent = "❚❚ Пауза";
    }
    gazePlaybackTimer = setInterval(drawGazePlaybackStep, 16);
  };

  const pauseGazePlayback = () => {
    if (gazePlaybackTimer) {
      clearInterval(gazePlaybackTimer);
      gazePlaybackTimer = null;
      gazePlaybackPaused = true;
      if (gazePlayButton) {
        gazePlayButton.textContent = "▶ Продолжить";
      }
      if (gazePauseButton) {
        gazePauseButton.textContent = "▶ Продолжить";
      }
    } else if (gazePlaybackPaused) {
      resumeGazePlayback();
    }
  };

  const setGazeStartZoneInfo = (text, type = "muted") => {
    if (!gazeStartZoneInfo) return;
    gazeStartZoneInfo.textContent = text || "";
    gazeStartZoneInfo.className = `small text-${type}`;
  };

  const setGazeEndZoneInfo = (text, type = "muted") => {
    if (!gazeEndZoneInfo) return;
    gazeEndZoneInfo.textContent = text || "";
    gazeEndZoneInfo.className = `small text-${type}`;
  };

  const fillZoneInputs = (zone, inputs) => {
    if (!inputs) return;
    inputs.x && (inputs.x.value = Number.isFinite(zone?.x) ? zone.x : "");
    inputs.y && (inputs.y.value = Number.isFinite(zone?.y) ? zone.y : "");
    inputs.w && (inputs.w.value = Number.isFinite(zone?.w) ? zone.w : "");
    inputs.h && (inputs.h.value = Number.isFinite(zone?.h) ? zone.h : "");
  };

  const readZoneFromInputs = (inputs) => {
    if (!inputs) return null;
    const x = Number(inputs.x?.value);
    const y = Number(inputs.y?.value);
    const w = Number(inputs.w?.value);
    const h = Number(inputs.h?.value);
    if (
      Number.isFinite(x) &&
      Number.isFinite(y) &&
      Number.isFinite(w) &&
      Number.isFinite(h) &&
      x >= 0 &&
      y >= 0 &&
      w > 0 &&
      h > 0 &&
      x + w <= 1 &&
      y + h <= 1
    ) {
      return { x, y, w, h };
    }
    return null;
  };

  const renderGazeCanvas = async (sessions) => {
    stopGazePlayback();

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
      setGazeStatus("Выберите сессии выше, чтобы построить точки.", "muted");
      emptyCanvas("Нет данных для отображения");
      return;
    }

    const selected = getSelectedSessions(sessions);
    if (selected.length === 0) {
      setGazeStatus("Отметьте сессии в блоке выбора, чтобы увидеть точки.", "warning");
      emptyCanvas("Сессии не выбраны");
      return;
    }
    const selectedRanges = selected.reduce((acc, session) => {
      acc[session.sessionKey] = getSessionRange(session.sessionKey);
      return acc;
    }, {});

    const stimuli = Array.from(
      new Set(
        selected
          .map((session) => (session.stimulusName || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    if (stimuli.length === 0) {
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
    lastGazeDrawRect = { ...drawRect };
    const playbackPoints = [];
    gazePlaybackFrame = ctx.getImageData(0, 0, width, height);
    const points = stimulusSessions
      .flatMap((session) =>
        getSessionPoints(session).map((point) => {
          const time = Number(point.timeOffsetMs);
          const range = selectedRanges[session.sessionKey] || {};
          if (Number.isFinite(time)) {
            if (Number.isFinite(range.start) && time < range.start) return null;
            if (Number.isFinite(range.end) && time > range.end) return null;
          }
          return {
            x: Number(point.x),
            y: Number(point.y),
            time,
            sessionKey: session.sessionKey,
          };
        })
      )
      .filter(
        (pt) =>
          pt &&
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

    if (points.length === 0) {
      ctx.fillStyle = "#6c757d";
      ctx.font = "13px sans-serif";
      ctx.fillText(
        "Для выбранных сессий нет точек с координатами.",
        16,
        24
      );
      return;
    }

    const validTimes = points
      .map((pt) => pt.time)
      .filter((value) => Number.isFinite(value));
    const minTime =
      validTimes.length > 0 ? Math.min(...validTimes) : Number.NaN;
    const maxTime =
      validTimes.length > 0 ? Math.max(...validTimes) : Number.NaN;

    setGazeStatus(
      `Стимул: ${stimulusName}. Сессий: ${stimulusSessions.length}. Точек: ${points.length}.${
        hasMultipleStimuli
          ? " Другие выбранные стимулы скрыты."
          : ""
      }`,
      img ? "muted" : "warning"
    );

    const initialRange = selectedRanges[stimulusSessions[0]?.sessionKey] || {};
    updateRangeInputs(initialRange);

    let firstZonePoint = null;
    let startAfterEndPoint = null;
    let wasInEndZone = false;
    points.forEach((pt, index) => {
      const px = drawRect.x + pt.x * drawRect.width;
      const py = drawRect.y + pt.y * drawRect.height;
      let color = stringToColor(pt.sessionKey);
      if (colorMode === "time") {
        let tNorm = 0;
        if (Number.isFinite(minTime) && Number.isFinite(maxTime) && maxTime !== minTime && Number.isFinite(pt.time)) {
          tNorm = (pt.time - minTime) / (maxTime - minTime);
        } else if (points.length > 1) {
          tNorm = index / (points.length - 1);
        }
        color = timeToColor(tNorm);
      }
      ctx.fillStyle = color;
      ctx.strokeStyle = "#ffffffcc";
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      playbackPoints.push({
        px,
        py,
        color,
        time: pt.time,
        sessionKey: pt.sessionKey,
        order: index,
        normX: pt.x,
        normY: pt.y,
      });

      if (
        gazeStartZone &&
        !firstZonePoint &&
        pt.x >= gazeStartZone.x &&
        pt.x <= gazeStartZone.x + gazeStartZone.w &&
        pt.y >= gazeStartZone.y &&
        pt.y <= gazeStartZone.y + gazeStartZone.h
      ) {
        firstZonePoint = { index, ...pt };
      }
      if (gazeEndZone) {
        const inZone =
          pt.x >= gazeEndZone.x &&
          pt.x <= gazeEndZone.x + gazeEndZone.w &&
          pt.y >= gazeEndZone.y &&
          pt.y <= gazeEndZone.y + gazeEndZone.h;
        if (inZone) {
          wasInEndZone = true;
        }
      }
      if (gazeStartZone && wasInEndZone && !startAfterEndPoint) {
        const inStart =
          pt.x >= gazeStartZone.x &&
          pt.x <= gazeStartZone.x + gazeStartZone.w &&
          pt.y >= gazeStartZone.y &&
          pt.y <= gazeStartZone.y + gazeStartZone.h;
        if (inStart) {
          startAfterEndPoint = { index, ...pt };
        }
      }
    });

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

    if (gazeStartZone) {
      ctx.save();
      ctx.strokeStyle = "#20c997";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      const zx = drawRect.x + gazeStartZone.x * drawRect.width;
      const zy = drawRect.y + gazeStartZone.y * drawRect.height;
      const zw = gazeStartZone.w * drawRect.width;
      const zh = gazeStartZone.h * drawRect.height;
      ctx.strokeRect(zx, zy, zw, zh);
      ctx.restore();
    }
    if (gazeEndZone) {
      ctx.save();
      ctx.strokeStyle = "#fd7e14";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      const zx = drawRect.x + gazeEndZone.x * drawRect.width;
      const zy = drawRect.y + gazeEndZone.y * drawRect.height;
      const zw = gazeEndZone.w * drawRect.width;
      const zh = gazeEndZone.h * drawRect.height;
      ctx.strokeRect(zx, zy, zw, zh);
      ctx.restore();
    }

    if (firstZonePoint && gazeStartIndexInput) {
      gazeStartIndexInput.value = firstZonePoint.index;
      syncTimesFromIndices();
      setGazeStartZoneInfo(
        `Первая точка в зоне: #${firstZonePoint.index} (t=${Number.isFinite(firstZonePoint.time) ? firstZonePoint.time.toFixed(2) : "—"} c, сессия ${firstZonePoint.sessionKey})`,
        "success"
      );
    } else if (gazeStartZone) {
      setGazeStartZoneInfo("Точки в зоне не найдены в выбранных данных.", "warning");
    } else {
      setGazeStartZoneInfo("");
    }
    if (gazeEndIndexInput) {
      if (startAfterEndPoint) {
        gazeEndIndexInput.value = startAfterEndPoint.index;
        syncTimesFromIndices();
        setGazeEndZoneInfo(
          `Первый вход в зону старта после зоны конца: #${startAfterEndPoint.index} (t=${Number.isFinite(startAfterEndPoint.time) ? startAfterEndPoint.time.toFixed(2) : "—"} c, сессия ${startAfterEndPoint.sessionKey})`,
          "success"
        );
      } else if (gazeEndZone) {
        setGazeEndZoneInfo("Нет точки входа в старт после посещения зоны конца.", "warning");
      } else if (gazeStartZone) {
        setGazeEndZoneInfo("Нет повторного входа в зону старта после зоны конца.", "warning");
      } else {
        setGazeEndZoneInfo("");
      }
    }

    gazePlaybackPoints = playbackPoints
      .slice()
      .sort((a, b) => {
        const aTime = Number.isFinite(a.time) ? a.time : Number.POSITIVE_INFINITY;
        const bTime = Number.isFinite(b.time) ? b.time : Number.POSITIVE_INFINITY;
        if (aTime === bTime) {
          return a.order - b.order;
        }
        return aTime - bTime;
      });
    gazePlaybackIndex = 0;
  };

  const renderGazeArea = (sessions) => renderGazeCanvas(sessions);
  const drawGazePlaybackStep = () => {
    if (!gazeCanvas || !gazePlaybackFrame || gazePlaybackPoints.length === 0) {
      stopGazePlayback();
      return;
    }
    const ctx = gazeCanvas.getContext("2d");
    ctx.putImageData(gazePlaybackFrame, 0, 0);
    const len = gazePlaybackPoints.length;
    const currentIdx = gazePlaybackIndex % len;
    const upto = currentIdx;
    for (let i = 0; i <= upto; i += 1) {
      const point = gazePlaybackPoints[i];
      if (!point) continue;
      ctx.save();
      ctx.fillStyle = point.color || "#0dcaf0";
      ctx.strokeStyle = "#ffffffaa";
      const radius = i === upto ? 6 : 4;
      ctx.beginPath();
      ctx.arc(point.px, point.py, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    gazePlaybackIndex = (currentIdx + 1) % len;
    const current = gazePlaybackPoints[currentIdx];
    if (gazeCurrentPoint && current) {
      const timeLabel = Number.isFinite(current.time) ? current.time.toFixed(2) : "—";
      gazeCurrentPoint.value = `${currentIdx}`;
      gazeCurrentPoint.setAttribute("title", `Сессия: ${current.sessionKey} · t=${timeLabel} c`);
    }
  };

  const handleGazePlay = async () => {
    if (!gazePlayButton) {
      return;
    }
    if (gazePlaybackTimer) {
      stopGazePlayback();
      return;
    }
    if (gazePlaybackPaused && gazePlaybackFrame && gazePlaybackPoints.length > 0) {
      resumeGazePlayback();
      return;
    }
    gazePlayButton.setAttribute("disabled", "disabled");
    gazePlayButton.textContent = "Загрузка...";
    const recordingsByDate = buildRecordingsMap(cachedRecordings || []);
    const filtered = filterPupilSessions(cachedSessions || [], recordingsByDate);
    await renderGazeCanvas(filtered);
    if (!gazePlaybackFrame || gazePlaybackPoints.length === 0) {
      gazePlayButton.textContent = "▶ Проиграть точки";
      gazePlayButton.removeAttribute("disabled");
      setGazeStatus("Нет точек для проигрывания.", "warning");
      return;
    }
    gazePlayButton.textContent = "■ Стоп";
    gazePlayButton.removeAttribute("disabled");
    if (gazePauseButton) {
      gazePauseButton.textContent = "❚❚ Пауза";
    }
    gazePlaybackPaused = false;
    gazePlaybackTimer = setInterval(drawGazePlaybackStep, 16);
  };

  const jumpToPlaybackIndex = (idx) => {
    if (!Number.isInteger(idx) || idx < 0 || idx >= gazePlaybackPoints.length) {
      return;
    }
    gazePlaybackIndex = idx;
    drawGazePlaybackStep();
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
        const participant =
          meta?.participantFullName || meta?.participantName || "—";
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
          syncBaselineSearchStartWithSelection();
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

    const selected = sessions.filter((s) => selectedPupilSessions.has(s.sessionKey));
    const selectionSignature = selected
      .map((s) => s.sessionKey)
      .filter(Boolean)
      .sort()
      .join("|");
    const selectionChanged = selectionSignature !== lastPupilSelectionSignature;
    lastPupilSelectionSignature = selectionSignature;

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#6c757d";

    if (selected.length === 0) {
      ctx.fillText("Выберите хотя бы одну сессию для отображения.", 16, 24);
      return;
    }

    const series = selected
      .map((session) => ({
        session,
        points: getSessionPoints(session),
      }))
      .filter((entry) => entry.points.length > 0);
    const sessionMeans = series.map(({ session, points }) => {
      const values = points
        .filter((p) => !p.isInvalid)
        .map((p) => Number(p?.interpolated?.pupilAvg))
        .filter((v) => Number.isFinite(v));
      if (values.length === 0) {
        return null;
      }
      const mean =
        values.reduce((acc, val) => acc + val, 0) / values.length;
      return { sessionKey: session.sessionKey, mean };
    });

    if (series.length === 0) {
      pupilDataBounds = null;
      pupilBaseView = null;
      pupilView = null;
      ctx.fillText("Нет данных о размере зрачков для выбранных сессий.", 16, 24);
      return;
    }

    const includeInvalid = includeInvalidPupilCheckbox?.checked || false;
    const showInterpolated = showInterpolatedPupilCheckbox?.checked || false;
    const showSmooth = showSmoothPupilCheckbox?.checked || false;
    const showInterpolatedVariance =
      showInterpolatedVarianceCheckbox?.checked || false;
    const showSmoothVariance = showSmoothVarianceCheckbox?.checked || false;
    const rangesBySession = selected.reduce((acc, session) => {
      acc[session.sessionKey] = getSessionRange(session.sessionKey);
      return acc;
    }, {});
    const inRange = (time, range) => {
      if (!range) return true;
      if (Number.isFinite(range.start) && Number.isFinite(time) && time < range.start) return false;
      if (Number.isFinite(range.end) && Number.isFinite(time) && time > range.end) return false;
      return true;
    };
    const seriesConfig = [
      {
        key: "left",
        label: "Левый",
        color: "#0d6efd",
        faded: "rgba(13, 110, 253, 0.35)",
        enabled: showLeftPupilCheckbox?.checked !== false,
      },
      {
        key: "right",
        label: "Правый",
        color: "#dc3545",
        faded: "rgba(220, 53, 69, 0.35)",
        enabled: showRightPupilCheckbox?.checked !== false,
      },
      {
        key: "avg",
        label: "Среднее",
        color: "#198754",
        faded: "rgba(25, 135, 84, 0.35)",
        enabled: showAvgPupilCheckbox?.checked !== false,
      },
    ].filter((item) => item.enabled);

    if (seriesConfig.length === 0 && !showInterpolated && !showSmooth) {
      ctx.fillText("Включите хотя бы одну серию (левый/правый/среднее).", 16, 24);
      return;
    }

    const interpolatedPoints = [];
    const smoothPointsBySession = new Map();
    let smoothCombined = [];
    const varianceInterpolatedPoints = [];
    const varianceSmoothPoints = [];
    const varianceSeriesBySession = new Map();
    const allPoints = [];
    series.forEach(({ session, points }) => {
      const range = rangesBySession[session.sessionKey] || {};
      points.forEach((p) => {
        const time = p.timeOffsetMs;
        if (!Number.isFinite(time)) {
          return;
        }
        const isInvalid = Boolean(p.isInvalid);
        if (showInterpolated && isInvalid && p.interpolated) {
          const leftInterp = Number.isFinite(p.interpolated.pupilLeftMm)
            ? p.interpolated.pupilLeftMm
            : null;
          const rightInterp = Number.isFinite(p.interpolated.pupilRightMm)
            ? p.interpolated.pupilRightMm
            : null;
          const avgInterp =
            Number.isFinite(p.interpolated.pupilAvg) && p.interpolated.pupilAvg !== null
              ? p.interpolated.pupilAvg
              : leftInterp !== null && rightInterp !== null
                ? (leftInterp + rightInterp) / 2
                : leftInterp ?? rightInterp ?? null;
          if (Number.isFinite(avgInterp)) {
            interpolatedPoints.push({
              x: time,
              y: avgInterp,
              sessionKey: session.sessionKey,
            });
          }
        }
        if (showSmooth && p.smooth) {
          const smoothLeft = Number.isFinite(p.smooth.pupilLeftMm)
            ? p.smooth.pupilLeftMm
            : null;
          const smoothRight = Number.isFinite(p.smooth.pupilRightMm)
            ? p.smooth.pupilRightMm
            : null;
          const smoothAvg =
            Number.isFinite(p.smooth.pupilAvg) && p.smooth.pupilAvg !== null
              ? p.smooth.pupilAvg
              : computePupilAvg(smoothLeft, smoothRight);
          if (Number.isFinite(smoothAvg)) {
            if (!smoothPointsBySession.has(session.sessionKey)) {
              smoothPointsBySession.set(session.sessionKey, []);
            }
            const entry = { x: time, y: smoothAvg, sessionKey: session.sessionKey };
            smoothPointsBySession.get(session.sessionKey).push(entry);
            smoothCombined.push(entry);
          }
        }
        if ((showInterpolatedVariance || showSmoothVariance) && p.interpolated?.baselineWindow) {
          const variance = Number(p.interpolated.baselineWindow.variance);
          if (Number.isFinite(variance)) {
            const point = { x: time, y: variance, sessionKey: session.sessionKey };
            if (showInterpolatedVariance) {
              varianceInterpolatedPoints.push(point);
            }
            if (showSmoothVariance) {
              if (!varianceSeriesBySession.has(session.sessionKey)) {
                varianceSeriesBySession.set(session.sessionKey, []);
              }
              varianceSeriesBySession.get(session.sessionKey).push(point);
            }
          }
        }
        if (!includeInvalid && isInvalid) {
          return;
        }
        const left = Number.isFinite(p.pupilLeftMm) ? p.pupilLeftMm : null;
        const right = Number.isFinite(p.pupilRightMm) ? p.pupilRightMm : null;
        const avg =
          Number.isFinite(p.pupilAvg) && p.pupilAvg !== null
            ? p.pupilAvg
            : left !== null && right !== null
              ? (left + right) / 2
              : left !== null
                ? left
                : right !== null
                  ? right
                  : null;

        seriesConfig.forEach((config) => {
          let value = null;
          if (config.key === "left") {
            value = left;
          } else if (config.key === "right") {
            value = right;
          } else if (config.key === "avg") {
            value = avg;
          }
          if (!Number.isFinite(value)) {
            return;
          }
          allPoints.push({
            x: time,
            y: value,
            type: config.key,
            isInvalid,
            sessionKey: session.sessionKey,
            inRange: inRange(time, range),
          });
        });
      });
    });

    if (showSmoothVariance && varianceSeriesBySession.size > 0) {
      varianceSeriesBySession.forEach((series, sessionKey) => {
        const sorted = [...series].sort((a, b) => a.x - b.x);
        const times = sorted.map((pt) => pt.x);
        const values = sorted.map((pt) => pt.y);
        const medianStep = computeMedianStep(times);
        const baseSpan =
          Number.isFinite(medianStep) && medianStep > 0 ? medianStep * 9 : 9;
        const windowSamples = (() => {
          const len = values.length;
          let size = Math.round(baseSpan / (medianStep || 1));
          size = Math.max(5, size);
          if (size % 2 === 0) size += 1;
          if (size >= len) {
            size = len % 2 === 0 ? len - 1 : len;
          }
          return Math.max(3, size);
        })();
        const smoothed = applyZeroPhaseLowPass(values, windowSamples);
        smoothed.forEach((value, index) => {
          if (!Number.isFinite(value)) {
            return;
          }
          varianceSmoothPoints.push({
            x: times[index],
            y: value,
            sessionKey,
          });
        });
      });
    }

    const totalPointsCount =
      allPoints.length +
      (showInterpolated ? interpolatedPoints.length : 0) +
      (showSmooth ? smoothCombined.length : 0) +
      (showInterpolatedVariance ? varianceInterpolatedPoints.length : 0) +
      (showSmoothVariance ? varianceSmoothPoints.length : 0);
    if (totalPointsCount === 0) {
      pupilDataBounds = null;
      pupilBaseView = null;
      pupilView = null;
      ctx.fillText("Нет точек для выбранных серий.", 16, 24);
      return;
    }

    const xValues = [...allPoints.map((p) => p.x)];
    const pupilYValues = [...allPoints.map((p) => p.y)];
    if (showInterpolated) {
      interpolatedPoints.forEach((p) => {
        xValues.push(p.x);
        pupilYValues.push(p.y);
      });
    }
    if (showSmooth) {
      smoothCombined.forEach((p) => {
        xValues.push(p.x);
        pupilYValues.push(p.y);
      });
    }
    if (showInterpolatedVariance) {
      varianceInterpolatedPoints.forEach((p) => {
        xValues.push(p.x);
      });
    }
    if (showSmoothVariance) {
      varianceSmoothPoints.forEach((p) => {
        xValues.push(p.x);
      });
    }

    const varianceYValues = [
      ...(showInterpolatedVariance ? varianceInterpolatedPoints.map((p) => p.y) : []),
      ...(showSmoothVariance ? varianceSmoothPoints.map((p) => p.y) : []),
    ];

    const getMinMax = (values = [], fallbackMin, fallbackMax) => {
      let min = fallbackMin;
      let max = fallbackMax;
      let has = false;
      for (const value of values) {
        const num = Number(value);
        if (!Number.isFinite(num)) {
          continue;
        }
        if (!has) {
          min = num;
          max = num;
          has = true;
        } else {
          if (num < min) min = num;
          if (num > max) max = num;
        }
      }
      return has ? { min, max } : { min: fallbackMin, max: fallbackMax };
    };

    const xMinMax = getMinMax(xValues, 0, 0);
    const minX = Math.min(xMinMax.min, 0);
    const maxX = xMinMax.max;
    const pupilMinMax = getMinMax(pupilYValues, 0, 1);
    const minY = pupilMinMax.min;
    const maxY = pupilMinMax.max;

    pupilDataBounds = { xMin: minX, xMax: maxX, yMin: minY, yMax: maxY };
    pupilBaseView = expandBounds(pupilDataBounds);

    const baseRangeX = (pupilBaseView?.xMax ?? 0) - (pupilBaseView?.xMin ?? 0) || 1;
    const prevRangeX =
      pupilView && Number.isFinite(pupilView.xMax) && Number.isFinite(pupilView.xMin)
        ? pupilView.xMax - pupilView.xMin
        : baseRangeX;
    const targetRangeX = Math.min(baseRangeX, Math.max(1, prevRangeX || baseRangeX));

    if (selectionChanged || !pupilUserAdjusted) {
      const nextView = {
        xMin: 0,
        xMax: targetRangeX,
        yMin: pupilBaseView.yMin,
        yMax: pupilBaseView.yMax,
      };
      pupilView = clampViewToBounds(nextView, pupilDataBounds);
      if (selectionChanged) {
        pupilUserAdjusted = false;
      }
    } else if (pupilView) {
      pupilView = clampViewToBounds(pupilView, pupilDataBounds);
    } else {
      pupilView = { ...pupilBaseView };
    }

    const safeRange = (value, fallback) =>
      Number.isFinite(value) && value !== 0 ? value : fallback;

    const rangeX = safeRange(pupilView.xMax - pupilView.xMin, 1);
    const rangeY = safeRange(pupilView.yMax - pupilView.yMin, 1);
    const varianceMinMax = getMinMax(varianceYValues, 0, 1);
    const varianceMin = varianceMinMax.min;
    const varianceMax = varianceMinMax.max;
    const varianceRange = safeRange(varianceMax - varianceMin, 1);
    const variancePadding = varianceRange * 0.1;
    const varianceBase = {
      min: varianceMin - variancePadding,
      max: varianceMax + variancePadding,
    };
    varianceBaseView = varianceBase;
    if (!varianceView) {
      varianceView = { ...varianceBase };
    } else if (!varianceUserAdjusted) {
      varianceView = { ...varianceBase };
    } else {
      varianceView = clampVarianceViewToBase(varianceView, varianceBase);
    }
    const varianceViewRange = safeRange(
      (varianceView?.max ?? varianceBase.max) - (varianceView?.min ?? varianceBase.min),
      varianceRange
    );

    const scaleX = (x) => padding.left + (plotW * (x - pupilView.xMin)) / rangeX;
    const scaleY = (y) =>
      padding.top + plotH - (plotH * (y - pupilView.yMin)) / rangeY;
    const scaleVarianceY = (y) => {
      const value = Number.isFinite(y) ? y : varianceView.min ?? 0;
      return (
        padding.top +
        plotH -
        (plotH * (value - (varianceView?.min ?? varianceBase.min))) / varianceViewRange
      );
    };

    const getTimeStepSeconds = () => {
      const range = (pupilView?.xMax || 0) - (pupilView?.xMin || 0);
      return range > 40 ? 1 : 0.5; // >40 c: шаг 1000 мс, иначе 500 мс
    };

    const drawTimeGrid = () => {
      const stepSeconds = getTimeStepSeconds();
      const start = Math.max(
        0,
        Math.floor(pupilView.xMin / stepSeconds) * stepSeconds
      );
      let drawn = 0;
      ctx.save();
      ctx.strokeStyle = "#d0d7de";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 4]);
      for (let t = start; t <= pupilView.xMax; t += stepSeconds) {
        if (drawn > 5000) {
          break; // защита от слишком большого числа линий
        }
        const x = scaleX(t);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + plotH);
        ctx.stroke();
        drawn += 1;
      }
      ctx.restore();
    };

    // сетка 500 мс на фоне
    drawTimeGrid();

    const drawRangeMask = () => {
      const starts = Object.values(rangesBySession || {})
        .map((r) => r?.start)
        .filter((v) => Number.isFinite(v));
      const ends = Object.values(rangesBySession || {})
        .map((r) => r?.end)
        .filter((v) => Number.isFinite(v));
      const minStart = starts.length ? Math.min(...starts) : null;
      const maxEnd = ends.length ? Math.max(...ends) : null;
      ctx.save();
      ctx.fillStyle = "rgba(108, 117, 125, 0.12)";
      if (Number.isFinite(minStart) && minStart > pupilView.xMin) {
        const xStart = padding.left;
        const xEnd = scaleX(minStart);
        ctx.fillRect(xStart, padding.top, Math.max(0, xEnd - xStart), plotH);
      }
      if (Number.isFinite(maxEnd) && maxEnd < pupilView.xMax) {
        const xStart = scaleX(maxEnd);
        const xEnd = padding.left + plotW;
        ctx.fillRect(xStart, padding.top, Math.max(0, xEnd - xStart), plotH);
      }
      ctx.restore();
    };

    const drawXTicks = () => {
      const stepSeconds = getTimeStepSeconds();
      const start = Math.max(
        0,
        Math.floor(pupilView.xMin / stepSeconds) * stepSeconds
      );
      const formatTime = (value) =>
        Number.isInteger(value) ? value.toString() : value.toFixed(1);
      let drawn = 0;
      ctx.fillStyle = "#6c757d";
      ctx.strokeStyle = "#e9ecef";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let t = start; t <= pupilView.xMax; t += stepSeconds) {
        if (drawn > 5000) {
          break; // защита от слишком большого числа подписей
        }
        const x = scaleX(t);
        ctx.beginPath();
        ctx.moveTo(x, padding.top + plotH);
        ctx.lineTo(x, padding.top + plotH + 4);
        ctx.stroke();
        ctx.fillText(formatTime(t), x, padding.top + plotH + 8);
        drawn += 1;
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
    drawRangeMask();
    const drawVarianceYTicks = () => {
      if (!varianceYValues.length || !varianceView) {
        return;
      }
      const steps = 5;
      const step = varianceViewRange / steps;
      ctx.fillStyle = "#6c757d";
      ctx.strokeStyle = "#e9ecef";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      for (let i = 0; i <= steps; i += 1) {
        const val = (varianceView.min ?? 0) + step * i;
        const y = scaleVarianceY(val);
        ctx.beginPath();
        ctx.moveTo(padding.left + plotW, y);
        ctx.lineTo(padding.left + plotW + 4, y);
        ctx.stroke();
        ctx.fillText(val.toFixed(3), padding.left + plotW + 6, y);
      }
    };
    const drawAxesOverlay = () => {
      ctx.strokeStyle = "#dee2e6";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, padding.top + plotH);
      ctx.lineTo(padding.left + plotW, padding.top + plotH);
      ctx.stroke();

      drawXTicks();
      drawYTicks();
      drawVarianceYTicks();

      ctx.fillStyle = "#6c757d";
      ctx.fillText("t, с", width - padding.right - 30, height - 10);
      ctx.save();
      ctx.translate(15, padding.top + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Диаметр, мм", 0, 0);
      ctx.restore();
      if (varianceYValues.length > 0) {
        ctx.save();
        ctx.translate(width - 15, padding.top + plotH / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillText("Variance", 0, 0);
        ctx.restore();
      }
    };

    const pointsByType = seriesConfig.reduce((acc, config) => {
      acc[config.key] = [];
      return acc;
    }, {});

    allPoints.forEach((pt) => {
      if (!pointsByType[pt.type]) {
        pointsByType[pt.type] = [];
      }
      pointsByType[pt.type].push(pt);
    });

    const drawLine = (points, color, yScale = scaleY) => {
      if (!points || points.length === 0) {
        return;
      }
      const sorted = [...points].sort((a, b) => a.x - b.x);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      sorted.forEach((pt, idx) => {
        const x = scaleX(pt.x);
        const y = yScale(pt.y);
        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    };

    const drawPoints = (points, color, yScale = scaleY) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = "#ffffffcc";
      points.forEach((pt) => {
        const x = scaleX(pt.x);
        const y = yScale(pt.y);
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    };

    const drawVarianceBars = (points, color) => {
      if (!points || points.length === 0) {
        return;
      }
      const medianStep =
        computeMedianStep(points.map((p) => p.x)) ||
        (pupilView.xMax - pupilView.xMin) / Math.max(10, points.length);
      const barWidthPx = Math.max(
        2,
        Math.min(
          18,
          (plotW * medianStep * 0.8) / (pupilView.xMax - pupilView.xMin || 1)
        )
      );
      const baselineY = scaleVarianceY(varianceView?.min ?? varianceBase.min ?? 0);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.45;
      points.forEach((pt) => {
        const xCenter = scaleX(pt.x);
        const yTop = scaleVarianceY(pt.y);
        const rectX = xCenter - barWidthPx / 2;
        const rectY = Math.min(yTop, baselineY);
        const rectH = Math.abs(baselineY - yTop);
        ctx.beginPath();
        ctx.rect(rectX, rectY, barWidthPx, rectH);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const drawSessionMeans = () => {
      if (showSessionMeansCheckbox?.checked === false) {
        return;
      }
      ctx.save();
      ctx.strokeStyle = "#198754";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([10, 6]);
      (sessionMeans || []).forEach((entry, idx) => {
        if (!entry || !Number.isFinite(entry.mean)) {
          return;
        }
        const y = scaleY(entry.mean);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + plotW, y);
        ctx.stroke();
        // optional small label on the right
        ctx.fillStyle = "#198754";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(entry.sessionKey, padding.left + plotW + 6, y);
      });
      ctx.restore();
    };

    const drawBaselineOverlay = () => {
      const drawBaseline = (
        baseline,
        color,
        meanColor = color,
        sourcePoints = []
      ) => {
        if (!baseline) {
          return;
        }
        const startIdx = Number.isInteger(baseline.startIndex) ? baseline.startIndex : baseline.index;
        const endIdx = Number.isInteger(baseline.endIndex) ? baseline.endIndex : null;
        const startTime =
          Number(sourcePoints?.[startIdx]?.timeOffsetMs) ??
          Number(baseline.timeOffsetMs);
        const endTime =
          Number(sourcePoints?.[endIdx]?.timeOffsetMs) ??
          Number(sourcePoints?.[startIdx]?.timeOffsetMs);
        if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
          return;
        }
        const xStart = scaleX(startTime);
        const xEnd = scaleX(endTime);
        const variance = Number(baseline.variance);
        const mean = Number(baseline.mean);

        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(xStart, padding.top);
        ctx.lineTo(xStart, padding.top + plotH);
        ctx.moveTo(xEnd, padding.top);
        ctx.lineTo(xEnd, padding.top + plotH);
        ctx.stroke();

        const chartXStart = padding.left;
        const chartXEnd = padding.left + plotW;

        if (Number.isFinite(variance)) {
          const yVar = scaleVarianceY(variance);
          ctx.beginPath();
          ctx.moveTo(chartXStart, yVar);
          ctx.lineTo(chartXEnd, yVar);
          ctx.stroke();
        }

        if (Number.isFinite(mean)) {
          const yMean = scaleY(mean);
          ctx.setLineDash([]);
          ctx.strokeStyle = meanColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(chartXStart, yMean);
          ctx.lineTo(chartXEnd, yMean);
          ctx.stroke();
        }
      };

      ctx.save();
      series.forEach(({ session, points }) => {
        drawBaseline(session?.baselineWindow, "#ff7b00", "#0d6efd", points);
        drawBaseline(session?.selectedBaselineWindow, "#d4af37", "#d4af37", points);
      });
      ctx.restore();
    };

    const drawBaselineExtremaOverlay = () => {
      if (showBaselineExtremaCheckbox?.checked === false) {
        return;
      }
      const getRangeIndices = (session, points) => {
        const maxIndex = points.length - 1;
        const startIdxRaw = Number.isInteger(session?.playbackStartIndex)
          ? session.playbackStartIndex
          : 0;
        const endIdxRaw = Number.isInteger(session?.playbackEndIndex)
          ? session.playbackEndIndex
          : 0;
        const startIdx = Number.isInteger(startIdxRaw)
          ? Math.min(Math.max(0, startIdxRaw), maxIndex)
          : 0;
        const endIdx = Number.isInteger(endIdxRaw)
          ? Math.min(Math.max(startIdx, endIdxRaw), maxIndex)
          : maxIndex;
        return { startIdx, endIdx };
      };
      const drawCrosshair = (time, value, color) => {
        if (!Number.isFinite(time) || !Number.isFinite(value)) {
          return;
        }
        const x = scaleX(time);
        const y = scaleY(value);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + plotH);
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + plotW, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      };

      ctx.save();
      series.forEach(({ session, points }) => {
        const baseline = session?.selectedBaselineWindow;
        if (!baseline || !Array.isArray(points) || points.length === 0) {
          return;
        }
        const mean = Number(baseline.mean);
        if (!Number.isFinite(mean)) {
          return;
        }
        const { startIdx, endIdx } = getRangeIndices(session, points);
        let maxPoint = null;
        let minPoint = null;
        for (let i = startIdx; i <= endIdx; i += 1) {
          const time = Number(points[i]?.timeOffsetMs);
          const value = Number(points[i]?.smooth?.pupilAvg);
          if (!Number.isFinite(time) || !Number.isFinite(value)) {
            continue;
          }
          const div = value - mean;
          if (!maxPoint || div > maxPoint.div) {
            maxPoint = { time, value, div };
          }
          if (!minPoint || div < minPoint.div) {
            minPoint = { time, value, div };
          }
        }
        if (maxPoint) {
          drawCrosshair(maxPoint.time, maxPoint.value, "#dc3545");
        }
        if (minPoint) {
          drawCrosshair(minPoint.time, minPoint.value, "#0d6efd");
        }
      });
      ctx.restore();
    };

    seriesConfig.forEach((config) => {
      const points = pointsByType[config.key] || [];
      const validInRange = points.filter((p) => !p.isInvalid && p.inRange !== false);
      const invalidPoints = points.filter((p) => p.isInvalid);
      if (validInRange.length > 0) {
        drawPoints(validInRange, config.color);
      }
      if (includeInvalid && invalidPoints.length > 0) {
        drawPoints(invalidPoints, config.faded);
      }
    });


    let legendX = padding.left;
    const legendY = padding.top - 6;
    seriesConfig.forEach((config) => {
      ctx.fillStyle = config.color;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = "#495057";
      ctx.fillText(config.label, legendX + 16, legendY);
      legendX += ctx.measureText(config.label).width + 60;
    });
    if (showInterpolated && interpolatedPoints.length > 0) {
      const interpolatedColor = "#6f42c1";
      drawPoints(interpolatedPoints, interpolatedColor);
      ctx.fillStyle = interpolatedColor;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = "#495057";
      ctx.fillText("Интерполированные", legendX + 16, legendY);
      legendX += ctx.measureText("Интерполированные").width + 80;
    }
    if (showSmooth && smoothCombined.length > 0) {
      const smoothColor = "#0dcaf0";
      smoothPointsBySession.forEach((pts) => drawLine(pts, smoothColor));
      ctx.fillStyle = smoothColor;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = "#495057";
      ctx.fillText("Сглаженные (линия)", legendX + 16, legendY);
      legendX += ctx.measureText("Сглаженные (линия)").width + 90;
    }
    if (showInterpolatedVariance && varianceInterpolatedPoints.length > 0) {
      const varianceInterpColor = "#f97316";
      drawVarianceBars(varianceInterpolatedPoints, varianceInterpColor);
      ctx.fillStyle = varianceInterpColor;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = "#495057";
      ctx.fillText("Variance (interp)", legendX + 16, legendY);
      legendX += ctx.measureText("Variance (interp)").width + 90;
    }
    if (showSmoothVariance && varianceSmoothPoints.length > 0) {
      const varianceSmoothColor = "#84cc16";
      drawLine(varianceSmoothPoints, varianceSmoothColor, scaleVarianceY);
      ctx.fillStyle = varianceSmoothColor;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = "#495057";
      ctx.fillText("Variance (smooth)", legendX + 16, legendY);
      legendX += ctx.measureText("Variance (smooth)").width + 80;
    }

    const hasBaseline = series.some(({ session }) => Boolean(session?.baselineWindow));
    const hasSelectedBaseline = series.some(
      ({ session }) => Boolean(session?.selectedBaselineWindow)
    );
    if (hasBaseline) {
      ctx.fillStyle = "#ff7b00";
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = "#495057";
      ctx.fillText("Baseline (auto)", legendX + 16, legendY);
      legendX += ctx.measureText("Baseline (auto)").width + 70;
    }
    if (hasSelectedBaseline) {
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = "#495057";
      ctx.fillText("Baseline (выбранный)", legendX + 16, legendY);
    }

    drawSessionMeans();
    drawBaselineOverlay();
    drawBaselineExtremaOverlay();

    drawAxesOverlay();
  };

  const selectAllOverviewSessions = () => {
    const recordingsByDate = buildRecordingsMap();
    const filtered = applyFilters(cachedSessions || [], recordingsByDate);
    filtered.forEach((session) => analysisSelectedSessions.add(session.sessionKey));
    persistAnalysisSelection();
    renderWithFilters();
  };

  const clearAllOverviewSessions = () => {
    analysisSelectedSessions.clear();
    selectedPupilSessions.clear();
    persistAnalysisSelection();
    renderWithFilters();
  };

  const selectAllPupilSessions = () => {
    const recordingsByDate = buildRecordingsMap();
    filterPupilSessions(
      getAnalysisSelectedSessions(cachedSessions || []),
      recordingsByDate
    ).forEach(
      (session) => selectedPupilSessions.add(session.sessionKey)
    );
    renderPupilArea(cachedSessions || [], recordingsByDate);
  };

  const clearAllPupilSessions = () => {
    selectedPupilSessions.clear();
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
      localStorage.removeItem(ANALYSIS_SELECTION_STORAGE_KEY);
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

  const handleWheelZoom = () => {
    // wheel zoom disabled; use control buttons instead
  };

  const zoomAxis = (axis, direction) => {
    const factor = direction === "in" ? 0.8 : 1.25;
    if (axis === "x") {
      if (!pupilView || !pupilDataBounds) return;
      const center = (pupilView.xMin + pupilView.xMax) / 2;
      const baseRange =
        (pupilBaseView?.xMax || 0) - (pupilBaseView?.xMin || 0) || pupilView.xMax - pupilView.xMin;
      const newRange = Math.min((pupilView.xMax - pupilView.xMin) * factor, baseRange);
      pupilView = clampViewToBounds(
        {
          xMin: center - newRange / 2,
          xMax: center + newRange / 2,
          yMin: pupilView.yMin,
          yMax: pupilView.yMax,
        },
        pupilDataBounds
      );
      pupilUserAdjusted = true;
    } else if (axis === "pupilY") {
      if (!pupilView || !pupilDataBounds) return;
      const center = (pupilView.yMin + pupilView.yMax) / 2;
      const baseRange =
        (pupilBaseView?.yMax || 0) - (pupilBaseView?.yMin || 0) || pupilView.yMax - pupilView.yMin;
      const newRange = Math.min((pupilView.yMax - pupilView.yMin) * factor, baseRange);
      pupilView = clampViewToBounds(
        {
          xMin: pupilView.xMin,
          xMax: pupilView.xMax,
          yMin: center - newRange / 2,
          yMax: center + newRange / 2,
        },
        pupilDataBounds
      );
      pupilUserAdjusted = true;
    } else if (axis === "varianceY") {
      if (!varianceView) return;
      const varianceZoomFactor = direction === "in" ? 0.5 : 2; // более сильный шаг
      const baseRange =
        (varianceBaseView?.max || 0) - (varianceBaseView?.min || 0) ||
        varianceView.max - varianceView.min;
      const center = (varianceView.min + varianceView.max) / 2;
      const newRange = Math.min(
        (varianceView.max - varianceView.min) * varianceZoomFactor,
        baseRange
      );
      varianceView = {
        min: center - newRange / 2,
        max: center + newRange / 2,
      };
      if (varianceBaseView) {
        varianceBaseView = {
          min: center - newRange / 2,
          max: center + newRange / 2,
        };
      }
      varianceUserAdjusted = true;
    }
    renderPupilChart(cachedSessions || []);
  };

  const shiftXAxis = (direction) => {
    if (!pupilView || !pupilDataBounds) return;
    const rangeX = pupilView.xMax - pupilView.xMin || 1;
    const shift = rangeX * 0.2 * (direction === "right" ? 1 : -1);
    pupilView = clampViewToBounds(
      {
        xMin: pupilView.xMin + shift,
        xMax: pupilView.xMax + shift,
        yMin: pupilView.yMin,
        yMax: pupilView.yMax,
      },
      pupilDataBounds
    );
    pupilUserAdjusted = true;
    renderPupilChart(cachedSessions || []);
  };

  const gotoTime = () => {
    if (!pupilView || !pupilDataBounds) return;
    const target = Number(gotoTimeInput?.value);
    if (!Number.isFinite(target)) return;
    const rangeX = pupilView.xMax - pupilView.xMin || 1;
    const halfRange = rangeX / 2;
    const desiredCenter = Math.max(
      pupilDataBounds.xMin,
      Math.min(pupilDataBounds.xMax, target)
    );
    pupilView = clampViewToBounds(
      {
        xMin: desiredCenter - halfRange,
        xMax: desiredCenter + halfRange,
        yMin: pupilView.yMin,
        yMax: pupilView.yMax,
      },
      pupilDataBounds
    );
    pupilUserAdjusted = true;
    renderPupilChart(cachedSessions || []);
  };

  const shiftAxis = (axis, direction) => {
    const sign = direction === "up" ? 1 : -1;
    if (axis === "pupilY") {
      if (!pupilView || !pupilDataBounds) return;
      const rangeY = pupilView.yMax - pupilView.yMin || 1;
      const shift = rangeY * 0.1 * sign;
      pupilView = clampViewToBounds(
        {
          xMin: pupilView.xMin,
          xMax: pupilView.xMax,
          yMin: pupilView.yMin + shift,
          yMax: pupilView.yMax + shift,
        },
        pupilDataBounds
      );
      pupilUserAdjusted = true;
    } else if (axis === "varianceY") {
      if (!varianceView) return;
      const viewRange = varianceView.max - varianceView.min || 1;
      const shift = viewRange * 0.2 * sign;
      varianceView = {
        min: varianceView.min + shift,
        max: varianceView.max + shift,
      };
      if (varianceBaseView) {
        varianceBaseView = {
          min: varianceBaseView.min + shift,
          max: varianceBaseView.max + shift,
        };
      }
      varianceUserAdjusted = true;
    }
    renderPupilChart(cachedSessions || []);
  };

  const handlePanMove = () => {
    // mouse panning disabled; use control buttons instead
  };

  const startPan = () => {
    // mouse panning disabled
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

  stimulusUploadButton?.addEventListener("click", (event) => {
    event.preventDefault();
    handleStimulusUpload();
  });

  experimentFilter?.addEventListener("change", () => renderWithFilters());
  stimulusFilter?.addEventListener("change", () => renderWithFilters());
  unmatchedOnlyCheckbox?.addEventListener("change", () => renderWithFilters());
  overviewMarkedOnlyCheckbox?.addEventListener("change", () => renderWithFilters());
  overviewParticipantFilter?.addEventListener("input", () => renderWithFilters());
  exportSelectedCsvButton?.addEventListener("click", () => exportSelectedSessionsCsv());
  overviewSelectAllButton?.addEventListener("click", () => selectAllOverviewSessions());
  overviewClearAllButton?.addEventListener("click", () => clearAllOverviewSessions());
  overviewParticipantClear?.addEventListener("click", () => {
    if (overviewParticipantFilter) {
      overviewParticipantFilter.value = "";
      overviewParticipantFilter.focus();
    }
    renderWithFilters();
  });
  pupilChartCanvas?.addEventListener("wheel", (e) => e.preventDefault(), {
    passive: false,
  });

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
      filterPupilSessions(
        cachedSessions || [],
        buildRecordingsMap(cachedRecordings || [])
      )
    )
  );
  gazeApplyRangeBtn?.addEventListener("click", () => applyRangeToSelected());
  [gazeStartTimeInput, gazeEndTimeInput].forEach((input) =>
    input?.addEventListener("change", () => syncIndicesFromTimes())
  );
  [gazeStartIndexInput, gazeEndIndexInput].forEach((input) =>
    input?.addEventListener("change", () => syncTimesFromIndices())
  );
  gazeCurrentPoint?.addEventListener("change", () => {
    const idx = Number(gazeCurrentPoint.value);
    if (Number.isInteger(idx) && idx >= 0) {
      jumpToPlaybackIndex(Math.min(idx, gazePlaybackPoints.length - 1));
    }
  });
  gazePauseButton?.addEventListener("click", () => pauseGazePlayback());
  gazePlayButton?.addEventListener("click", handleGazePlay);
  gazeSelectStartZoneBtn?.addEventListener("click", () => {
    gazeZoneSelecting = "start";
    gazeZoneStartPx = null;
    setGazeStatus("Выделите прямоугольник на стимуле для зоны старта.", "info");
  });
  gazeClearStartZoneBtn?.addEventListener("click", () => {
    gazeStartZone = null;
    gazeZoneSelecting = null;
    gazeZoneStartPx = null;
    fillZoneInputs(null, gazeStartZoneInputs);
    setGazeStatus("Зона старта сброшена.", "muted");
    renderGazeArea(
      filterPupilSessions(cachedSessions || [], buildRecordingsMap(cachedRecordings || []))
    );
  });
  gazeResetRangeBtn?.addEventListener("click", () => resetRangeForSelected());
  gazeSelectEndZoneBtn?.addEventListener("click", () => {
    gazeZoneSelecting = "end";
    gazeZoneStartPx = null;
    setGazeStatus("Выделите прямоугольник на стимуле для зоны конца.", "info");
  });
  gazeClearEndZoneBtn?.addEventListener("click", () => {
    gazeEndZone = null;
    gazeZoneSelecting = null;
    gazeZoneStartPx = null;
    fillZoneInputs(null, gazeEndZoneInputs);
    setGazeStatus("Зона конца сброшена.", "muted");
    renderGazeArea(
      filterPupilSessions(cachedSessions || [], buildRecordingsMap(cachedRecordings || []))
    );
  });
  ["x", "y", "w", "h"].forEach((key) => {
    gazeStartZoneInputs[key]?.addEventListener("change", applyZoneInputs);
    gazeEndZoneInputs[key]?.addEventListener("change", applyZoneInputs);
  });
  prevSessionFloatingBtn?.addEventListener("click", () => shiftSelectedSession("prev"));
  nextSessionFloatingBtn?.addEventListener("click", () => shiftSelectedSession("next"));

  gazeCanvas?.addEventListener("mousedown", (event) => {
    if (!gazeZoneSelecting || !lastGazeDrawRect) return;
    const rect = gazeCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    gazeZoneStartPx = { x, y };
  });

  gazeCanvas?.addEventListener("mouseup", (event) => {
    if (!gazeZoneSelecting || !lastGazeDrawRect || !gazeZoneStartPx) return;
    const rect = gazeCanvas.getBoundingClientRect();
    const x2 = event.clientX - rect.left;
    const y2 = event.clientY - rect.top;
    const { x: x1, y: y1 } = gazeZoneStartPx;
    const xMin = Math.min(x1, x2);
    const xMax = Math.max(x1, x2);
    const yMin = Math.min(y1, y2);
    const yMax = Math.max(y1, y2);
    const clampRect = {
      x1: Math.max(lastGazeDrawRect.x, xMin),
      y1: Math.max(lastGazeDrawRect.y, yMin),
      x2: Math.min(lastGazeDrawRect.x + lastGazeDrawRect.width, xMax),
      y2: Math.min(lastGazeDrawRect.y + lastGazeDrawRect.height, yMax),
    };
    const wPx = clampRect.x2 - clampRect.x1;
    const hPx = clampRect.y2 - clampRect.y1;
    if (wPx <= 0 || hPx <= 0) {
      setGazeStatus("Зона не задана: выделите прямоугольник внутри стимула.", "warning");
      gazeZoneStartPx = null;
      gazeZoneSelecting = null;
      return;
    }
    const nx = (clampRect.x1 - lastGazeDrawRect.x) / lastGazeDrawRect.width;
    const ny = (clampRect.y1 - lastGazeDrawRect.y) / lastGazeDrawRect.height;
    const nw = wPx / lastGazeDrawRect.width;
    const nh = hPx / lastGazeDrawRect.height;
    if (gazeZoneSelecting === "start") {
      gazeStartZone = { x: nx, y: ny, w: nw, h: nh };
      fillZoneInputs(gazeStartZone, gazeStartZoneInputs);
      setGazeStatus("Зона старта установлена. Нажмите «Применить» для пересчета.", "success");
    } else if (gazeZoneSelecting === "end") {
      gazeEndZone = { x: nx, y: ny, w: nw, h: nh };
      fillZoneInputs(gazeEndZone, gazeEndZoneInputs);
      setGazeStatus("Зона конца установлена. Нажмите «Применить» для пересчета.", "success");
    }
    gazeZoneSelecting = null;
    gazeZoneStartPx = null;
    renderGazeArea(
      filterPupilSessions(cachedSessions || [], buildRecordingsMap(cachedRecordings || []))
    );
  });
  const handleThresholdChange = () => {
    setRecomputeStatus(
      "Параметры изменены. Нажмите «Пересчитать точки», чтобы обновить сохраненные данные.",
      "warning"
    );
  };

  [
    validityThresholdInput,
    pupilMinInput,
    pupilMaxInput,
    madFactorInput,
    diffThresholdInput,
  ].forEach((input) =>
    input?.addEventListener("input", handleThresholdChange)
  );
  recomputePointsButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    await recomputeStoredPoints();
  });
  [
    showLeftPupilCheckbox,
    showRightPupilCheckbox,
    showAvgPupilCheckbox,
    showInterpolatedPupilCheckbox,
    showSmoothPupilCheckbox,
    showInterpolatedVarianceCheckbox,
    showSmoothVarianceCheckbox,
    includeInvalidPupilCheckbox,
    showSessionMeansCheckbox,
    showBaselineExtremaCheckbox,
  ].forEach((checkbox) =>
    checkbox?.addEventListener("change", () => renderPupilChart(cachedSessions || []))
  );
  zoomXAxisInBtn?.addEventListener("click", () => zoomAxis("x", "in"));
  zoomXAxisOutBtn?.addEventListener("click", () => zoomAxis("x", "out"));
  zoomPupilYInBtn?.addEventListener("click", () => zoomAxis("pupilY", "in"));
  zoomPupilYOutBtn?.addEventListener("click", () => zoomAxis("pupilY", "out"));
  zoomVarianceYInBtn?.addEventListener("click", () => zoomAxis("varianceY", "in"));
  zoomVarianceYOutBtn?.addEventListener("click", () => zoomAxis("varianceY", "out"));
  shiftPupilYUpBtn?.addEventListener("click", () => shiftAxis("pupilY", "up"));
  shiftPupilYDownBtn?.addEventListener("click", () => shiftAxis("pupilY", "down"));
  shiftVarianceYUpBtn?.addEventListener("click", () => shiftAxis("varianceY", "up"));
  shiftVarianceYDownBtn?.addEventListener("click", () => shiftAxis("varianceY", "down"));
  shiftXAxisLeftBtn?.addEventListener("click", () => shiftXAxis("left"));
  shiftXAxisRightBtn?.addEventListener("click", () => shiftXAxis("right"));
  gotoTimeBtn?.addEventListener("click", gotoTime);
  selectBaselineBtn?.addEventListener("click", selectBaselineForSelected);
  recomputeSelectedBaselineBtn?.addEventListener(
    "click",
    recomputeSelectedBaselineForSelected
  );
  insightsExportBtn?.addEventListener("click", exportInsightsCsv);
  insightsExportXlsxBtn?.addEventListener("click", exportInsightsXlsx);
  exportDbButton?.addEventListener("click", exportDatabase);
  importDbButton?.addEventListener("click", importDatabase);
  baselineWindowSizeInput?.addEventListener("change", () =>
    renderPupilChart(cachedSessions || [])
  );
  baselineSearchMethodInput?.addEventListener("change", () =>
    renderPupilChart(cachedSessions || [])
  );
  baselineSearchLengthInput?.addEventListener("change", () =>
    renderPupilChart(cachedSessions || [])
  );
  baselineSearchStartInput?.addEventListener("change", () =>
    renderPupilChart(cachedSessions || [])
  );
  baselineStartFromPlaybackCheckbox?.addEventListener("change", () =>
    syncBaselineSearchStartWithSelection()
  );
  baselineStartFromPlaybackOffsetCheckbox?.addEventListener("change", () =>
    syncBaselineSearchStartWithSelection()
  );
  pupilSelectAllBtn?.addEventListener("click", () => selectAllPupilSessions());
  pupilClearAllBtn?.addEventListener("click", () => clearAllPupilSessions());
  resetDbButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    await handleResetDb();
  });

  initSectionNav();
  renderSessionsFromDB();

  console.info("Eye tracking analytics dashboard initialized.");
});
