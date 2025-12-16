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
  const unmatchedOnlyCheckbox = document.getElementById("unmatchedOnly");
  const sessionListElement = document.getElementById("sessionList");
  const sessionCountElement = document.getElementById("sessionCount");
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
  const baselineSearchStartInput = document.getElementById("baselineSearchStart");
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
  const includeInvalidPupilCheckbox = document.getElementById("includeInvalidPupil");
  const gazeCanvas = document.getElementById("gazeCanvas");
  const gazeColorMode = document.getElementById("gazeColorMode");
  const gazeStartTimeInput = document.getElementById("gazeStartTime");
  const gazeEndTimeInput = document.getElementById("gazeEndTime");
  const gazeStartIndexInput = document.getElementById("gazeStartIndex");
  const gazeEndIndexInput = document.getElementById("gazeEndIndex");
  const gazeApplyRangeBtn = document.getElementById("gazeApplyRange");
  const gazePlayButton = document.getElementById("gazePlayButton");
  const gazePauseButton = document.getElementById("gazePauseButton");
  const gazeCurrentPoint = document.getElementById("gazeCurrentPoint");
  const gazeStimulusStatus = document.getElementById("gazeStimulusStatus");
  const resetDbButton = document.getElementById("resetDbButton");
  const resetStatusElement = document.getElementById("resetStatus");
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
  const recomputePointsButton = document.getElementById("recomputePointsButton");
  const recomputeStatusElement = document.getElementById("recomputeStatus");

  let cachedRecordings = [];
  let cachedSessions = [];
  let cachedStimuliImages = [];
  const selectedPupilSessions = new Set();
  const pupilChartPadding = { left: 50, right: 20, top: 20, bottom: 40 };
  let pupilView = null;
  let pupilDataBounds = null;
  let pupilBaseView = null;
  let pupilUserAdjusted = false;
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
    const badPupil = [pupilLeft, pupilRight].some(
        (value) =>
          Number.isFinite(value) &&
          (value < getPupilMin() || value > getPupilMax())
    );
    return Boolean(badValidity || badPupil);
  };

  const normalizePointRaw = (pt) => {
    if (pt && typeof pt === "object" && pt.raw && typeof pt.raw === "object") {
      const raw = { ...pt.raw };
      raw.pupilAvg = computePupilAvg(raw.pupilLeftMm, raw.pupilRightMm);
      raw.isInvalid = computePointInvalid(raw);
      return raw;
    }
    if (pt && typeof pt === "object") {
      const raw = { ...pt };
      raw.pupilAvg = computePupilAvg(raw.pupilLeftMm, raw.pupilRightMm);
      raw.isInvalid = computePointInvalid(raw);
      return raw;
    }
    return {
      pupilAvg: computePupilAvg(undefined, undefined),
      isInvalid: computePointInvalid({}),
    };
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
      
      if (i == 102) console.log(prevIdx, nextIdx, rawPoints[prevIdx], rawPoints[nextIdx], i)

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
      if (i == 102) console.log(leftSpeed, rightSpeed, prevSpeed, nextSpeed)
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
        if (leftTooFast || rightTooFast) {
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

  const selectMinVarianceBaseline = (
    baselines = [],
    points = [],
    searchLengthSeconds,
    searchStartSeconds
  ) => {
    const maxTime = Number.isFinite(searchLengthSeconds)
      ? Math.max(0, searchLengthSeconds)
      : null;
    const minTime = Number.isFinite(searchStartSeconds)
      ? Math.max(0, searchStartSeconds)
      : 0;

    let best = null;
    for (let i = 0; i < baselines.length; i += 1) {
      const baseline = baselines[i];
      const variance = Number(baseline?.variance);
      if (!Number.isFinite(variance)) {
        continue;
      }
      const timeOffsetMs = Number(points[i]?.timeOffsetMs);
      if (!Number.isFinite(timeOffsetMs)) {
        if (Number.isFinite(maxTime)) continue;
        if (Number.isFinite(minTime)) continue;
      }
      if (Number.isFinite(timeOffsetMs) && timeOffsetMs < minTime) {
        continue;
      }
      if (Number.isFinite(maxTime) && Number.isFinite(timeOffsetMs) && timeOffsetMs > maxTime) {
        break;
      }
      if (best && variance >= best.variance) {
        continue;
      }
      best = {
        ...(baseline || {}),
        variance,
        index: i,
        timeOffsetMs: Number.isFinite(timeOffsetMs) ? timeOffsetMs : null,
      };
    }
    return best;
  };

  const preparePoints = (points = []) => {
    const rawPoints = Array.isArray(points)
      ? points.map((pt) => normalizePointRaw(pt))
      : [];
    const medians = computeDilationSpeeds(rawPoints);
    const interpolatedPoints = buildInterpolatedPoints(rawPoints);
    const smoothPoints = buildSmoothedPoints(interpolatedPoints);
    const windowSize = getBaselineWindowSize();
    const baselineSearchLength = getBaselineSearchLength();
    const baselineSearchStart = getBaselineSearchStart();
    const interpolatedBaselines =
      baselineModule?.computeBaselineWindows(interpolatedPoints, windowSize) ?? [];
    const smoothBaselines =
      baselineModule?.computeBaselineWindows(smoothPoints, windowSize) ?? [];
    const baselineWindow = selectMinVarianceBaseline(
      interpolatedBaselines,
      interpolatedPoints,
      baselineSearchLength,
      baselineSearchStart
    );

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
    return {
      rawPoints,
      interpolatedPoints,
      smoothPoints,
      combinedPoints,
      medians,
      baselineWindow,
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
      const { combinedPoints, medians, baselineWindow } = preparePoints(session.points);
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
        .map((r) => (r.participantName || "").trim())
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
      const participant = (meta?.participantName || "").toLowerCase();
      return participant.includes(participantQuery);
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

  const renderPupilArea = (sessions, recordingsByDate) => {
    const filtered = filterPupilSessions(sessions, recordingsByDate);
    renderPupilSelector(filtered, recordingsByDate);
    renderPupilChart(filtered);
    renderGazeArea(filtered);
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
      cachedStimuliImages = stimuliImages || [];
      stimulusImageCache.clear();

      populateFilters(recordings);
      renderWithFilters();
      const recordingsByDate = buildRecordingsMap(recordings);
      populatePupilStimulusFilter(recordings);
      populatePupilParticipantSuggestions(recordings);
      renderPupilArea(sessions, recordingsByDate);
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
        } = preparePoints(session.points);
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
            } = preparePoints(session.points);
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
      });
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
        const participant = meta?.participantName || "—";
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
        if (showInterpolatedVariance && p.interpolated?.baselineWindow) {
          const variance = Number(p.interpolated.baselineWindow.variance);
          if (Number.isFinite(variance)) {
            varianceInterpolatedPoints.push({
              x: time,
              y: variance,
              sessionKey: session.sessionKey,
            });
          }
        }
        if (showSmoothVariance && p.smooth?.baselineWindow) {
          const variance = Number(p.smooth.baselineWindow.variance);
          if (Number.isFinite(variance)) {
            varianceSmoothPoints.push({
              x: time,
              y: variance,
              sessionKey: session.sessionKey,
            });
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

    const minX = Math.min(...xValues, 0);
    const maxX = Math.max(...xValues);
    const minY =
      pupilYValues.length > 0 ? Math.min(...pupilYValues) : 0;
    const maxY =
      pupilYValues.length > 0 ? Math.max(...pupilYValues) : 1;

    pupilDataBounds = { xMin: minX, xMax: maxX, yMin: minY, yMax: maxY };
    pupilBaseView = expandBounds(pupilDataBounds);

    if (!pupilView) {
      pupilView = { ...pupilBaseView };
    } else if (!pupilUserAdjusted) {
      pupilView = { ...pupilBaseView };
    } else {
      pupilView = clampViewToBounds(pupilView, pupilDataBounds);
    }

    const safeRange = (value, fallback) =>
      Number.isFinite(value) && value !== 0 ? value : fallback;

    const rangeX = safeRange(pupilView.xMax - pupilView.xMin, 1);
    const rangeY = safeRange(pupilView.yMax - pupilView.yMin, 1);
    const varianceFinite = varianceYValues.filter((v) => Number.isFinite(v));
    const varianceMin =
      varianceFinite.length > 0 ? Math.min(...varianceFinite) : 0;
    const varianceMax =
      varianceFinite.length > 0 ? Math.max(...varianceFinite) : 1;
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

    const drawLine = (points, color) => {
      if (!points || points.length === 0) {
        return;
      }
      const sorted = [...points].sort((a, b) => a.x - b.x);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      sorted.forEach((pt, idx) => {
        const x = scaleX(pt.x);
        const y = scaleY(pt.y);
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
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.8;
      const color = "#ff7b00";
      series.forEach(({ session, points }) => {
        const baseline = session?.baselineWindow;
        if (!baseline) {
          return;
        }
        const startIdx = Number.isInteger(baseline.startIndex) ? baseline.startIndex : baseline.index;
        const endIdx = Number.isInteger(baseline.endIndex) ? baseline.endIndex : null;
        const startTime =
          Number(points?.[startIdx]?.timeOffsetMs) ??
          Number(baseline.timeOffsetMs);
        const endTime =
          Number(points?.[endIdx]?.timeOffsetMs) ??
          Number(points?.[startIdx]?.timeOffsetMs);
        if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
          return;
        }
        const xStart = scaleX(startTime);
        const xEnd = scaleX(endTime);
        const variance = Number(baseline.variance);
        const mean = Number(baseline.mean);
        ctx.strokeStyle = color;
        // vertical lines for interval
        ctx.beginPath();
        ctx.moveTo(xStart, padding.top);
        ctx.lineTo(xStart, padding.top + plotH);
        ctx.moveTo(xEnd, padding.top);
        ctx.lineTo(xEnd, padding.top + plotH);
        ctx.stroke();

        // variance level (on variance axis)
        if (Number.isFinite(variance)) {
          const yVar = scaleVarianceY(variance);
          ctx.beginPath();
          ctx.moveTo(Math.min(xStart, xEnd), yVar);
          ctx.lineTo(Math.max(xStart, xEnd), yVar);
          ctx.stroke();
        }

        // mean pupil size (on pupil axis)
        if (Number.isFinite(mean)) {
          const yMean = scaleY(mean);
          const chartXStart = padding.left;
          const chartXEnd = padding.left + plotW;
          ctx.setLineDash([]);
          ctx.strokeStyle = "#0d6efd";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(chartXStart, yMean);
          ctx.lineTo(chartXEnd, yMean);
          ctx.stroke();
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.8;
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
      drawVarianceBars(varianceSmoothPoints, varianceSmoothColor);
      ctx.fillStyle = varianceSmoothColor;
      ctx.fillRect(legendX, legendY - 10, 12, 12);
      ctx.fillStyle = "#495057";
      ctx.fillText("Variance (smooth)", legendX + 16, legendY);
    }

    drawSessionMeans();
    drawBaselineOverlay();

    drawAxesOverlay();
  };

  const selectAllPupilSessions = () => {
    const recordingsByDate = buildRecordingsMap();
    filterPupilSessions(cachedSessions || [], recordingsByDate).forEach(
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
  const handleThresholdChange = () => {
    setRecomputeStatus(
      "Параметры изменены. Нажмите «Пересчитать точки», чтобы обновить сохраненные данные.",
      "warning"
    );
  };

  [validityThresholdInput, pupilMinInput, pupilMaxInput, madFactorInput].forEach((input) =>
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
  baselineWindowSizeInput?.addEventListener("change", () =>
    renderPupilChart(cachedSessions || [])
  );
  baselineSearchLengthInput?.addEventListener("change", () =>
    renderPupilChart(cachedSessions || [])
  );
  baselineSearchStartInput?.addEventListener("change", () =>
    renderPupilChart(cachedSessions || [])
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
