const EyeTrackerBaseline = (() => {
  const DEFAULT_WINDOW_SIZE_SECONDS = 0.5;
  const DEFAULT_SEARCH_LEN_SECONDS = 3;

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
    DEFAULT_WINDOW_SIZE_SECONDS,
    DEFAULT_SEARCH_LEN_SECONDS,
  };
})();

window.eyeTrackerBaseline = EyeTrackerBaseline;
