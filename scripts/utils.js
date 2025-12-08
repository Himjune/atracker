const EyeTrackerUtils = (() => {
  const computePupilAvg = (left, right) => {
    const values = [Number(left), Number(right)].filter((value) =>
      Number.isFinite(value)
    );
    if (values.length === 0) {
      return null;
    }
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
  };

  return {
    computePupilAvg,
  };
})();

window.eyeTrackerUtils = EyeTrackerUtils;
