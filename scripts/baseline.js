const EyeTrackerBaseline = (() => {
  const DEFAULT_WINDOW_SIZE_SECONDS = 0.5;
  const DEFAULT_SEARCH_LEN_SECONDS = 3;
  const DEFAULT_SEARCH_START_OFFSET_SECONDS = 0.5;

  const toFiniteNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const collectWindowValues = (points, startIndex, windowSizeSeconds) => {
    const startTime = toFiniteNumber(points[startIndex]?.timeOffsetMs);
    if (startTime === null) {
      return { endIndex: startIndex, values: [] };
    }

    const values = [];
    let endIndex = startIndex;

    for (let idx = startIndex; idx < points.length; idx += 1) {
      const point = points[idx];
      const time = toFiniteNumber(point?.timeOffsetMs);
      if (time === null || time - startTime > windowSizeSeconds) {
        break;
      }
      endIndex = idx;

      const value = toFiniteNumber(point?.pupilAvg);
      if (value !== null) {
        values.push(value);
      }
    }

    return { endIndex, values };
  };

  const computeStats = (values = []) => {
    const count = values.length;
    if (count === 0) {
      return { mean: null, variance: null, count: 0 };
    }

    const mean = values.reduce((acc, val) => acc + val, 0) / count;
    const variance =
      values.reduce((acc, val) => {
        const diff = val - mean;
        return acc + diff * diff;
      }, 0) / count;

    return { mean, variance, count };
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

  const buildBaselineEntry = (points, startIndex, windowSizeSeconds) => {
    const { endIndex, values } = collectWindowValues(
      points,
      startIndex,
      windowSizeSeconds
    );
    const { mean, variance, count } = computeStats(values);

    return {
      startIndex,
      endIndex,
      mean,
      variance,
      count,
      values,
    };
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

  const buildSmoothedVarianceSeries = (baselines = [], points = []) => {
    const times = baselines.map((_, index) => Number(points[index]?.timeOffsetMs));
    const varianceValues = baselines.map((baseline) => {
      const value = Number(baseline?.variance);
      return Number.isFinite(value) ? value : null;
    });
    const medianStep = computeMedianStep(times);
    const baseSpan = Number.isFinite(medianStep) && medianStep > 0 ? medianStep * 9 : 9;
    const windowSamples = (() => {
      const len = varianceValues.length;
      let size = Math.round(baseSpan / (medianStep || 1));
      size = Math.max(5, size);
      if (size % 2 === 0) size += 1;
      if (size >= len) {
        size = len % 2 === 0 ? len - 1 : len;
      }
      return Math.max(3, size);
    })();
    return applyZeroPhaseLowPass(varianceValues, windowSamples);
  };

  const selectFirstLocalMinBaseline = (
    baselines = [],
    points = [],
    searchLengthSeconds,
    searchStartSeconds
  ) => {
    if (!Array.isArray(baselines) || baselines.length === 0) {
      return null;
    }

    const maxTime = Number.isFinite(searchLengthSeconds)
      ? Math.max(0, searchLengthSeconds)
      : null;
    const minTime = Number.isFinite(searchStartSeconds)
      ? Math.max(0, searchStartSeconds)
      : 0;

    const smoothValues = buildSmoothedVarianceSeries(baselines, points);

    for (let i = 1; i < baselines.length - 1; i += 1) {
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

      const prev = smoothValues[i - 1];
      const curr = smoothValues[i];
      const next = smoothValues[i + 1];
      if (!Number.isFinite(curr) || !Number.isFinite(prev) || !Number.isFinite(next)) {
        continue;
      }
      if (curr <= prev && curr <= next && (curr < prev || curr < next)) {
        return {
          ...(baselines[i] || {}),
          variance: Number(baselines[i]?.variance),
          index: i,
          timeOffsetMs: Number.isFinite(timeOffsetMs) ? timeOffsetMs : null,
        };
      }
    }

    return selectMinVarianceBaseline(
      baselines,
      points,
      searchLengthSeconds,
      searchStartSeconds
    );
  };

  const computeBaselineWindows = (
    points = [],
    windowSizeSeconds = DEFAULT_WINDOW_SIZE_SECONDS
  ) => {
    const windowSize =
      Number.isFinite(windowSizeSeconds) && windowSizeSeconds > 0
        ? windowSizeSeconds
        : DEFAULT_WINDOW_SIZE_SECONDS;

    if (!Array.isArray(points) || points.length === 0) {
      return [];
    }

    return points.map((_, index) =>
      buildBaselineEntry(points, index, windowSize)
    );
  };

  return {
    computeBaselineWindows,
    selectMinVarianceBaseline,
    selectFirstLocalMinBaseline,
    DEFAULT_WINDOW_SIZE_SECONDS,
    DEFAULT_SEARCH_LEN_SECONDS,
    DEFAULT_SEARCH_START_OFFSET_SECONDS,
  };
})();

window.eyeTrackerBaseline = EyeTrackerBaseline;
