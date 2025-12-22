const EyeTrackerUtils = (() => {
  const SUPER_DIFF = 1.5
  const computePupilAvg = (left, right) => {
    const values = [Number(left), Number(right)].filter((value) =>
      Number.isFinite(value)
    );
    if (values.length === 0) {
      return null;
    }
    
    const sum = values.reduce((acc, value) => acc + value, 0);
    let avg = sum / values.length;

    if (values.length > 1 && Math.abs(values[0]-values[1]) > SUPER_DIFF) avg = Math.min(values[0],values[1]);
    return avg;
  };

  return {
    computePupilAvg,
  };
})();

window.eyeTrackerUtils = EyeTrackerUtils;
